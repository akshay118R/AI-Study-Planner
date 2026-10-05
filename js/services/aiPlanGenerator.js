/**
 * AI Study & Task Planner - Local Ollama AI Plan Generation Service
 * Interfaces with local Gemma model running in Ollama (100% offline, local inference).
 * Validates plan schema, dependencies, and realistic daily workload.
 */

import { OLLAMA_CONFIG } from './ollamaConfig.js';
import { validateAndRepairPlan } from './planValidator.js';
import { formatDateStr, shiftDate, parseDate } from './dateService.js';
import { getState } from '../data/storage.js';
import { GEMMA_SYSTEM_INSTRUCTION, getGemmaSystemInstruction } from './gemmaSystemPrompt.js';
import { repairAndParseJson } from './jsonRepair.js';

export { GEMMA_SYSTEM_INSTRUCTION, getGemmaSystemInstruction };

let isGenerating = false;
let currentAbortController = null;
let cachedAiStatus = null;
let lastStatusCheck = 0;

export function isPlanGenerating() {
  return isGenerating;
}

export function cancelPlanGeneration() {
  if (currentAbortController) {
    try {
      currentAbortController.abort();
    } catch (e) {}
  }
  isGenerating = false;
}

/**
 * Checks local Ollama availability and model installation status.
 * Caches result for 8 seconds to prevent excessive polling.
 */
export async function checkAiStatus(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedAiStatus && (now - lastStatusCheck < 8000)) {
    return cachedAiStatus;
  }

  // 1. First attempt to check through backend proxy
  try {
    const res = await fetch('/api/ai/status', {
      signal: AbortSignal.timeout(OLLAMA_CONFIG.healthTimeoutMs)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status) {
        cachedAiStatus = data;
        lastStatusCheck = now;
        return cachedAiStatus;
      }
    }
  } catch (e) {
    // Relative fetch without base URL or server not running
  }

  // 2. Direct check to local Ollama instance (essential for GitHub Pages and localhost)
  try {
    const directRes = await fetch(`${OLLAMA_CONFIG.defaultBaseUrl}/api/tags`, {
      signal: AbortSignal.timeout(3000)
    });
    if (directRes.ok) {
      const data = await directRes.json();
      if (data && data.status === 'ready') {
        cachedAiStatus = {
          status: 'ready',
          baseUrl: data.baseUrl || OLLAMA_CONFIG.defaultBaseUrl,
          model: data.model || OLLAMA_CONFIG.defaultModel,
          installedModels: data.installedModels || [OLLAMA_CONFIG.defaultModel],
          installCommand: `ollama pull ${OLLAMA_CONFIG.defaultModel}`,
          message: 'Local Gemma model detected and ready.'
        };
        lastStatusCheck = now;
        return cachedAiStatus;
      }

      const rawModels = Array.isArray(data.models) ? data.models : (Array.isArray(data.installedModels) ? data.installedModels : []);
      const target = OLLAMA_CONFIG.defaultModel.toLowerCase();
      const targetPrefix = target.split(':')[0];
      const hasModel = rawModels.some(m => {
        const name = (typeof m === 'string' ? m : (m.name || m.model || '')).toLowerCase();
        return name === target || name === `${target}:latest` || name.startsWith(targetPrefix + ':') || name === targetPrefix;
      });

      cachedAiStatus = {
        status: hasModel ? 'ready' : 'model_missing',
        baseUrl: OLLAMA_CONFIG.defaultBaseUrl,
        model: OLLAMA_CONFIG.defaultModel,
        installedModels: rawModels.map(m => typeof m === 'string' ? m : (m.name || m.model)),
        installCommand: `ollama pull ${OLLAMA_CONFIG.defaultModel}`,
        message: hasModel ? 'Local Gemma model detected and ready.' : 'Gemma model not found.',
        error: hasModel ? null : `Gemma model not found. Run: ollama pull ${OLLAMA_CONFIG.defaultModel}`
      };
      lastStatusCheck = now;
      return cachedAiStatus;
    }
  } catch (directErr) {
    // Direct fetch failed. Check whether Ollama is running but connection is blocked by CORS/Origin permission
    let isRunningProbe = false;
    try {
      const probe = await fetch(`${OLLAMA_CONFIG.defaultBaseUrl}/`, {
        mode: 'no-cors',
        signal: AbortSignal.timeout(1500)
      });
      if (probe) {
        isRunningProbe = true;
      }
    } catch (probeErr) {
      // Connection refused or network error
    }

    if (isRunningProbe) {
      cachedAiStatus = {
        status: 'blocked',
        code: 'CONNECTION_BLOCKED',
        title: 'Connection Blocked',
        baseUrl: OLLAMA_CONFIG.defaultBaseUrl,
        model: OLLAMA_CONFIG.defaultModel,
        allowedOrigin: OLLAMA_CONFIG.githubPagesOrigin,
        error: `Ollama is running, but this website is not allowed to access it yet. Add ${OLLAMA_CONFIG.githubPagesOrigin} to Ollama's allowed origins and restart Ollama.`,
        message: `Ollama is running, but this website is not allowed to access it yet. Add ${OLLAMA_CONFIG.githubPagesOrigin} to Ollama's allowed origins and restart Ollama.`
      };
      lastStatusCheck = now;
      return cachedAiStatus;
    }
  }

  cachedAiStatus = {
    status: 'offline',
    code: 'OLLAMA_OFFLINE',
    title: 'Ollama Offline',
    baseUrl: OLLAMA_CONFIG.defaultBaseUrl,
    model: OLLAMA_CONFIG.defaultModel,
    error: 'Ollama is not responding. Please ensure Ollama is started.',
    message: 'Start Ollama on your computer at http://127.0.0.1:11434 (Run: ollama serve).'
  };
  lastStatusCheck = now;
  return cachedAiStatus;
}

export async function checkBackendConfig() {
  const status = await checkAiStatus();
  return status.status === 'ready';
}

export function isBackendConfigured() {
  return cachedAiStatus?.status === 'ready';
}

/**
 * Main AI Plan Generation Entrypoint using Local Gemma Model
 */
export async function generateAiPlan(userGoalData, onProgress = () => {}) {
  if (isGenerating) {
    throw new Error('A plan generation request is already in progress. Please wait.');
  }

  isGenerating = true;
  const abortController = new AbortController();
  currentAbortController = abortController;

  try {
    onProgress('Creating your plan....', 'Analyzing goal, timeline, and study parameters...');

    const goal = (userGoalData.goal || '').trim();
    if (!goal) {
      throw new Error('Please describe what you want to achieve.');
    }

    const startDate = userGoalData.startDate || formatDateStr(new Date());
    const targetDate = userGoalData.targetDate || shiftDate(startDate, 90);
    const dailyHours = Number(userGoalData.dailyHours) || 2;
    const daysPerWeek = Number(userGoalData.daysPerWeek) || 6;
    const experienceLevel = userGoalData.experienceLevel || 'Beginner';

    if (startDate > targetDate) {
      throw new Error('Start date cannot be after target date. Please select a valid date range.');
    }

    if (abortController.signal.aborted) {
      throw new Error('Plan generation was cancelled.');
    }

    let rawGeneratedPlan = null;

    // Check Ollama readiness
    const aiStatus = await checkAiStatus(true);

    if (abortController.signal.aborted) {
      throw new Error('Plan generation was cancelled.');
    }

    if (aiStatus.status === 'offline') {
      if (userGoalData.allowOfflineDemo) {
        onProgress('Creating your plan....', 'Ollama is offline. Generating plan via local deterministic engine...');
        await new Promise(r => setTimeout(r, 600));
        rawGeneratedPlan = generateLocalStructuredPlan({
          goal,
          startDate,
          targetDate,
          dailyHours,
          daysPerWeek,
          experienceLevel
        });
      } else {
        const err = new Error(`Local Ollama service is not responding at ${aiStatus.baseUrl || 'http://127.0.0.1:11434'}. Please start Ollama and try again.`);
        err.code = 'OLLAMA_OFFLINE';
        throw err;
      }
    } else if (aiStatus.status === 'blocked') {
      if (userGoalData.allowOfflineDemo) {
        onProgress('Creating your plan....', 'Connection blocked. Generating plan via local deterministic engine...');
        await new Promise(r => setTimeout(r, 600));
        rawGeneratedPlan = generateLocalStructuredPlan({
          goal,
          startDate,
          targetDate,
          dailyHours,
          daysPerWeek,
          experienceLevel
        });
      } else {
        const err = new Error(aiStatus.error || `Ollama is running, but this website is not allowed to access it yet. Add ${OLLAMA_CONFIG.githubPagesOrigin} to Ollama's allowed origins and restart Ollama.`);
        err.code = 'CONNECTION_BLOCKED';
        err.allowedOrigin = OLLAMA_CONFIG.githubPagesOrigin;
        throw err;
      }
    } else if (aiStatus.status === 'model_missing') {
      if (userGoalData.allowOfflineDemo) {
        onProgress('Creating your plan....', 'Model missing. Generating plan via local deterministic engine...');
        await new Promise(r => setTimeout(r, 600));
        rawGeneratedPlan = generateLocalStructuredPlan({
          goal,
          startDate,
          targetDate,
          dailyHours,
          daysPerWeek,
          experienceLevel
        });
      } else {
        const err = new Error(`Gemma model not found. Run: ${aiStatus.installCommand || 'ollama pull ' + OLLAMA_CONFIG.defaultModel}`);
        err.code = 'MODEL_MISSING';
        err.installCommand = aiStatus.installCommand || `ollama pull ${OLLAMA_CONFIG.defaultModel}`;
        throw err;
      }
    } else {
      // Ollama is ready -> Execute local Gemma generation
      rawGeneratedPlan = await callLocalOllamaPlanProxy({
        goal,
        startDate,
        targetDate,
        dailyHours,
        daysPerWeek,
        experienceLevel,
        signal: abortController.signal
      }, onProgress);
    }

    if (abortController.signal.aborted) {
      throw new Error('Plan generation was cancelled.');
    }

    onProgress('Creating your plan....', 'Validating plan structure, dependencies and realistic workload...');
    const validationResult = validateAndRepairPlan(rawGeneratedPlan, {
      title: userGoalData.title || goal.substring(0, 60),
      description: goal,
      startDate,
      targetDate,
      dailyHours,
      daysPerWeek,
      experienceLevel
    });

    if (!validationResult.isValid) {
      throw new Error(`Plan validation failed: ${validationResult.errors.join(' ')}`);
    }

    onProgress('Plan generated successfully!', 'Rendering interactive preview...');
    const planWithDraftStatus = {
      ...validationResult.plan,
      status: validationResult.plan.status || 'draft'
    };
    return {
      plan: planWithDraftStatus,
      warnings: validationResult.warnings
    };

  } catch (err) {
    if (err.name === 'AbortError' || abortController.signal.aborted) {
      const abortErr = new Error('Plan generation was cancelled.');
      abortErr.name = 'AbortError';
      throw abortErr;
    }
    throw err;
  } finally {
    isGenerating = false;
    if (currentAbortController === abortController) {
      currentAbortController = null;
    }
  }
}

/**
 * Builds standard structured JSON schema prompt for Gemma
 */
export function buildPromptText(params) {
  const { goal, startDate, targetDate, dailyHours, daysPerWeek, experienceLevel } = params;

  return `
You are an expert curriculum designer and productivity architect.
The user wants to achieve this goal:
"${goal}"

Key Constraints:
- Start Date: ${startDate}
- Target Date: ${targetDate}
- User Available Daily Study/Work Time: ${dailyHours} hours/day
- Available Days Per Week: ${daysPerWeek} days/week (leave ${7 - daysPerWeek} rest/buffer days each week)
- User Experience Level: ${experienceLevel}

Requirements:
1. Break down the goal logically:
   - High-level Milestones (2 to 4 milestones across the timeframe)
   - Monthly progression themes (Month 1, Month 2, etc.)
   - Weekly objectives (Week 1, Week 2, etc.)
   - Daily actionable tasks for study days (1 to 2 tasks per study day, each 30-90 minutes).
   - Keep task descriptions concise, clear, and actionable (under 20 words each). Avoid bloated text so the entire JSON output completes cleanly without truncation.
2. Workload Realism:
   - The total sum of task durations on ANY single day MUST NOT exceed ${dailyHours * 60} minutes!
   - Mark rest/recovery days with no tasks.
3. Dependencies:
   - Ensure fundamentals precede advanced topics (e.g. basics -> intermediate -> projects/practice).
   - Tasks that build upon earlier tasks should list the earlier task's id in "dependencies".
4. Categories must be chosen from:
   ["Learning", "Practice", "Project", "Revision", "Research", "Work", "Personal", "Other"]

Return ONLY a valid JSON object matching this schema:
{
  "goal": {
    "title": "Short descriptive title of the goal",
    "description": "Comprehensive explanation of what will be achieved",
    "startDate": "${startDate}",
    "targetDate": "${targetDate}",
    "estimatedHours": 0,
    "dailyHours": ${dailyHours},
    "daysPerWeek": ${daysPerWeek},
    "experienceLevel": "${experienceLevel}"
  },
  "assumptions": ["Assumption 1", "Assumption 2"],
  "milestones": [
    { "id": "m-1", "title": "Milestone title", "targetDate": "${startDate}", "description": "Milestone description" }
  ],
  "months": [
    {
      "id": "month-1",
      "monthIndex": 0,
      "monthId": "${startDate.substring(0, 7)}",
      "title": "Month 1: Theme",
      "theme": "Theme description",
      "academicTarget": "Target skills"
    }
  ],
  "weeks": [
    {
      "id": "week-1",
      "weekNumber": 1,
      "monthId": "${startDate.substring(0, 7)}",
      "startDate": "${startDate}",
      "endDate": "${shiftDate(startDate, 6)}",
      "title": "Week 1: Objective",
      "objective": "Detailed focus",
      "targetHours": ${dailyHours * daysPerWeek}
    }
  ],
  "tasks": [
    {
      "id": "task-1",
      "title": "Clear actionable task title",
      "description": "What to do and key concepts",
      "category": "Learning",
      "type": "Study",
      "date": "${startDate}",
      "durationMinutes": 60,
      "priority": "High",
      "dependencies": []
    }
  ]
}
`;
}

/**
 * Call local Ollama plan proxy endpoint (/api/generate-plan)
 */
async function callLocalOllamaPlanProxy(params, onProgress) {
  const promptText = buildPromptText(params);

  onProgress('Creating your plan....', 'Sending prompt to local Gemma model via Ollama...');

  // Progression stages for local inference
  const progressStages = [
    { delay: 1500, main: 'Creating your plan....', sub: 'Local Gemma model is analyzing your goal and timeline...' },
    { delay: 5000, main: 'Creating your plan....', sub: 'Structuring monthly milestones and progression themes...' },
    { delay: 12000, main: 'Creating your plan....', sub: 'Generating weekly objectives and daily actionable tasks...' },
    { delay: 20000, main: 'Creating your plan....', sub: 'Balancing daily workloads and scheduling rest days...' },
    { delay: 35000, main: 'Creating your plan....', sub: 'Optimizing task dependencies and curriculum ordering...' },
    { delay: 60000, main: 'Creating your plan....', sub: 'Local model is completing full curriculum synthesis...' }
  ];

  const timers = progressStages.map(stage =>
    setTimeout(() => {
      onProgress(stage.main, stage.sub);
    }, stage.delay)
  );

  try {
    let rawContent = null;

    // 1. Direct call to local Ollama (primary for GitHub Pages and localhost)
    try {
      const directChatRes = await fetch(`${OLLAMA_CONFIG.defaultBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_CONFIG.defaultModel,
          messages: [
            {
              role: 'system',
              content: GEMMA_SYSTEM_INSTRUCTION
            },
            {
              role: 'user',
              content: promptText
            }
          ],
          stream: false,
          format: 'json',
          options: {
            temperature: OLLAMA_CONFIG.temperature || 0.2,
            num_ctx: OLLAMA_CONFIG.contextWindow || 8192,
            num_predict: 8192
          }
        }),
        signal: params.signal
      });

      if (directChatRes.ok) {
        const chatData = await directChatRes.json();
        if (chatData && chatData.plan) {
          return chatData.plan;
        }
        rawContent = chatData.message?.content || null;
      }
    } catch (directErr) {
      if (directErr.name === 'AbortError') throw directErr;
      // Direct call failed or unavailable, fallback to backend proxy endpoint
    }

    if (rawContent) {
      try {
        return repairAndParseJson(rawContent);
      } catch (parseErr) {
        console.warn('[Ollama Plan] Direct parse failed, falling back to deterministic plan:', parseErr.message);
        return generateLocalStructuredPlan(params);
      }
    }

    // 2. Fallback to /api/generate-plan (when running server.js or in tests with mocked proxy)
    const res = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promptText,
        systemInstruction: GEMMA_SYSTEM_INSTRUCTION,
        params
      }),
      signal: params.signal
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const errorMsg = errorBody.error || `Local server error: HTTP ${res.status}`;
      const err = new Error(errorMsg);
      err.code = errorBody.code;
      throw err;
    }

    const data = await res.json();
    if (!data.plan) {
      throw new Error('Local Gemma model returned an empty response. Please try again.');
    }

    return data.plan;

  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Plan generation was cancelled.');
    }
    throw err;
  } finally {
    timers.forEach(t => clearTimeout(t));
  }
}

/**
 * Local Deterministic Plan Generator
 * Used for offline resilience or when testing without an active Ollama instance.
 */
export function generateLocalStructuredPlan(params) {
  const { goal, startDate, targetDate, dailyHours, daysPerWeek, experienceLevel } = params;

  const start = parseDate(startDate);
  const target = parseDate(targetDate);
  const diffDays = Math.max(7, Math.ceil((target - start) / (1000 * 60 * 60 * 24)));
  const totalWeeks = Math.max(1, Math.ceil(diffDays / 7));
  const totalMonths = Math.max(1, Math.ceil(diffDays / 30));

  const goalLower = goal.toLowerCase();
  let domain = 'Study & Skills';
  let stages = ['Foundations & Core Principles', 'Intermediate Applications & Practice', 'Project Implementation', 'Revision & Mastery'];

  if (goalLower.includes('python') || goalLower.includes('javascript') || goalLower.includes('code') || goalLower.includes('programming')) {
    domain = 'Software Development';
    stages = ['Syntax & Core Data Structures', 'Algorithms & OOP Design', 'Applied Project Development', 'Code Review, Testing & Polishing'];
  } else if (goalLower.includes('exam') || goalLower.includes('semester') || goalLower.includes('test')) {
    domain = 'Exam Preparation';
    stages = ['Syllabus Breakdown & Unit 1-2', 'In-Depth Unit 3-5 Study', 'Past Papers & Mock Testing', 'Final High-Yield Revision'];
  } else if (goalLower.includes('dsa') || goalLower.includes('leetcode')) {
    domain = 'Data Structures & Algorithms';
    stages = ['Arrays, Strings, Pointers & Recursion', 'Trees, Graphs & Heaps', 'Dynamic Programming & Greedy', 'Company-Specific Mock Contests'];
  } else if (goalLower.includes('project') || goalLower.includes('build') || goalLower.includes('app')) {
    domain = 'Project Development';
    stages = ['Architecture & Tech Stack Setup', 'Core Feature Implementation', 'Advanced Features & UI Polish', 'Deployment & Documentation'];
  }

  const milestones = [];
  const months = [];
  const weeks = [];
  const tasks = [];

  // Generate Months
  for (let m = 0; m < totalMonths; m++) {
    const mDate = shiftDate(startDate, m * 30);
    const mId = mDate.substring(0, 7);
    const stageTitle = stages[m % stages.length];
    months.push({
      id: `month-${m + 1}`,
      monthIndex: m,
      monthId: mId,
      title: `Month ${m + 1}: ${stageTitle}`,
      theme: stageTitle,
      academicTarget: `Master ${stageTitle.toLowerCase()} through structured weekly practice.`
    });
  }

  // Generate Milestones
  const milestoneCount = Math.min(4, Math.max(2, totalMonths));
  for (let i = 0; i < milestoneCount; i++) {
    const fraction = (i + 1) / milestoneCount;
    const mOffset = Math.floor(diffDays * fraction);
    const mDate = shiftDate(startDate, mOffset);
    milestones.push({
      id: `m-${i + 1}`,
      title: `Milestone ${i + 1}: ${stages[i % stages.length]} Complete`,
      targetDate: mDate,
      description: `Validate progress in ${stages[i % stages.length].toLowerCase()} with measurable outcomes.`
    });
  }

  // Generate Weeks & Daily Tasks
  let taskIdCounter = 1;
  for (let w = 0; w < totalWeeks; w++) {
    const wStart = shiftDate(startDate, w * 7);
    const wEnd = shiftDate(wStart, 6);
    const wMonthId = wStart.substring(0, 7);
    const stageIdx = Math.floor((w / totalWeeks) * stages.length);
    const currentStage = stages[Math.min(stageIdx, stages.length - 1)];

    weeks.push({
      id: `week-${w + 1}`,
      weekNumber: w + 1,
      monthId: wMonthId,
      startDate: wStart,
      endDate: wEnd,
      title: `Week ${w + 1}: ${currentStage}`,
      objective: `Focus on ${currentStage.toLowerCase()} with disciplined daily sessions.`,
      targetHours: dailyHours * daysPerWeek
    });

    // Generate tasks for active study days
    for (let dayOffset = 0; dayOffset < daysPerWeek; dayOffset++) {
      const taskDate = shiftDate(wStart, dayOffset);
      const isPractice = dayOffset % 2 === 1;
      const category = isPractice ? 'Practice' : 'Learning';
      const duration = Math.min(90, Math.max(30, Math.round((dailyHours * 60) / 2)));

      tasks.push({
        id: `task-${taskIdCounter++}`,
        title: `${isPractice ? 'Hands-on Practice' : 'Study Core Concepts'}: ${currentStage} (Day ${dayOffset + 1})`,
        description: `Complete actionable deep work on ${currentStage.toLowerCase()}.`,
        category,
        type: 'Study',
        date: taskDate,
        durationMinutes: duration,
        priority: dayOffset === 0 ? 'High' : 'Normal',
        dependencies: taskIdCounter > 2 ? [`task-${taskIdCounter - 2}`] : []
      });
    }
  }

  return {
    goal: {
      title: goal.substring(0, 60),
      description: goal,
      startDate,
      targetDate,
      estimatedHours: totalWeeks * dailyHours * daysPerWeek,
      dailyHours,
      daysPerWeek,
      experienceLevel
    },
    assumptions: [
      `User can allocate ${dailyHours} hours/day across ${daysPerWeek} days/week`,
      `Local inference completed successfully without external cloud dependency`
    ],
    milestones,
    months,
    weeks,
    tasks
  };
}

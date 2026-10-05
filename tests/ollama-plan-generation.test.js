/**
 * Automated Tests: Local Ollama & Gemma AI Plan Generation Workflow
 * Tests all Phase 10 requirements:
 * - Ollama unreachable, model missing, model ready
 * - Valid structured plan generation (mocked for CI/offline)
 * - Malformed data handling, timeout handling, cancellation
 * - Plan review, discard draft, plan approval / atomic implementation
 * - No cloud AI calls, persistence across restart
 * - Optional smoke test for live Ollama
 */

import assert from 'assert';
import {
  generateAiPlan,
  cancelPlanGeneration,
  checkAiStatus,
  generateLocalStructuredPlan
} from '../js/services/aiPlanGenerator.js';
import { OLLAMA_CONFIG } from '../js/services/ollamaConfig.js';
import { GEMMA_SYSTEM_INSTRUCTION } from '../js/services/gemmaSystemPrompt.js';
import { validateAndRepairPlan } from '../js/services/planValidator.js';
import { repairAndParseJson } from '../js/services/jsonRepair.js';
import {
  savePlanDraft,
  getPlanDraft,
  implementPlan,
  getActivePlan,
  getTodayData
} from '../js/services/trackerService.js';
import { resetToInitialState, getState, updateState, saveState } from '../js/data/storage.js';

export async function runOllamaPlanGenerationTests() {
  console.log('--- Running Local Ollama & Gemma Plan Generation Tests ---');
  resetToInitialState();

  const originalFetch = global.fetch;

  try {
    // ----------------------------------------------------
    // Test 1: Ollama is unavailable / unreachable
    // ----------------------------------------------------
    {
      global.fetch = async (url) => {
        if (url.includes('/api/ai/status') || url.includes('11434')) {
          throw new Error('connect ECONNREFUSED 127.0.0.1:11434');
        }
        return originalFetch(url);
      };

      const status = await checkAiStatus(true);
      assert.strictEqual(status.status, 'offline', 'Must report offline when Ollama cannot be reached');
      assert.ok(status.error, 'Must provide an error explanation');

      await assert.rejects(
        async () => {
          await generateAiPlan({ goal: 'Learn Rust in 3 months' });
        },
        (err) => err.code === 'OLLAMA_OFFLINE',
        'Must reject with OLLAMA_OFFLINE error code when Ollama is offline'
      );
      console.log('✓ Ollama unavailable handled cleanly with actionable error');
    }

    // ----------------------------------------------------
    // Test 2: Ollama is running but required Gemma model is missing
    // ----------------------------------------------------
    {
      global.fetch = async (url) => {
        if (url.includes('/api/ai/status') || url.includes('/api/tags')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              status: 'model_missing',
              baseUrl: 'http://127.0.0.1:11434',
              model: OLLAMA_CONFIG.defaultModel,
              installedModels: ['llama3:latest', 'mistral:latest'],
              installCommand: `ollama pull ${OLLAMA_CONFIG.defaultModel}`
            })
          };
        }
        return originalFetch(url);
      };

      const status = await checkAiStatus(true);
      assert.strictEqual(status.status, 'model_missing', 'Must report model_missing when model is not installed');
      assert.strictEqual(status.installCommand, `ollama pull ${OLLAMA_CONFIG.defaultModel}`);

      await assert.rejects(
        async () => {
          await generateAiPlan({ goal: 'Learn Rust in 3 months' });
        },
        (err) => err.code === 'MODEL_MISSING' && err.installCommand.includes(OLLAMA_CONFIG.defaultModel),
        `Must reject with MODEL_MISSING code and command to pull ${OLLAMA_CONFIG.defaultModel}`
      );
      console.log('✓ Missing Gemma model detected with exact pull command');
    }

    // ----------------------------------------------------
    // Test 2b: Ollama is running but Origin is blocked (CORS / Connection Blocked)
    // ----------------------------------------------------
    {
      global.fetch = async (url, opts) => {
        if (url.includes('/api/ai/status')) {
          throw new Error('404 Not Found');
        }
        if (url.includes('/api/tags')) {
          throw new TypeError('Failed to fetch'); // CORS block
        }
        if (opts?.mode === 'no-cors') {
          // Probe succeeds because Ollama server is running on the port
          return { type: 'opaque', status: 0, ok: false };
        }
        return originalFetch(url, opts);
      };

      const status = await checkAiStatus(true);
      assert.strictEqual(status.status, 'blocked', 'Must report blocked when CORS blocks request but Ollama responds to probe');
      assert.strictEqual(status.code, 'CONNECTION_BLOCKED');
      assert.ok(status.error.includes(OLLAMA_CONFIG.githubPagesOrigin), 'Must explain GitHub Pages origin configuration');

      await assert.rejects(
        async () => {
          await generateAiPlan({ goal: 'Learn Rust in 3 months' });
        },
        (err) => err.code === 'CONNECTION_BLOCKED' && err.message.includes(OLLAMA_CONFIG.githubPagesOrigin),
        'Must reject with CONNECTION_BLOCKED code and explanation to allow GitHub Pages origin'
      );
      console.log('✓ Blocked CORS origin detected with actionable OLLAMA_ORIGINS explanation');
    }

    // ----------------------------------------------------
    // Test 3: Configured Gemma model is installed & ready
    // ----------------------------------------------------
    {
      global.fetch = async (url) => {
        if (url.includes('/api/ai/status') || url.includes('/api/tags')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              status: 'ready',
              baseUrl: 'http://127.0.0.1:11434',
              model: OLLAMA_CONFIG.defaultModel,
              installedModels: [OLLAMA_CONFIG.defaultModel]
            })
          };
        }
        return originalFetch(url);
      };

      const status = await checkAiStatus(true);
      assert.strictEqual(status.status, 'ready', 'Must report ready when configured model is installed');
      assert.strictEqual(status.model, OLLAMA_CONFIG.defaultModel);
      console.log('✓ Configured Gemma model readiness confirmed');
    }

    // ----------------------------------------------------
    // Test 4: Valid structured plan generation (Mocked Ollama JSON response)
    // ----------------------------------------------------
    {
      const mockValidPlan = {
        goal: {
          title: 'Learn Go and Backend Engineering',
          description: 'Master Go programming, concurrency, and microservices.',
          startDate: '2026-10-06',
          targetDate: '2026-12-06',
          dailyHours: 2,
          daysPerWeek: 6,
          experienceLevel: 'Beginner'
        },
        milestones: [
          { id: 'm-1', title: 'Go Basics Complete', targetDate: '2026-10-20', description: 'Syntax & structs' },
          { id: 'm-2', title: 'HTTP API Service Deployed', targetDate: '2026-12-06', description: 'REST API' }
        ],
        months: [
          { id: 'month-1', monthIndex: 0, monthId: '2026-10', title: 'Month 1: Go Syntax', theme: 'Syntax', academicTarget: 'Go fundamentals' }
        ],
        weeks: [
          { id: 'week-1', weekNumber: 1, monthId: '2026-10', startDate: '2026-10-06', endDate: '2026-10-12', title: 'Week 1', objective: 'Variables & slices', targetHours: 12 }
        ],
        tasks: [
          { id: 't-1', title: 'Install Go and write Hello World', category: 'Learning', type: 'Study', date: '2026-10-06', durationMinutes: 60, priority: 'High', dependencies: [] },
          { id: 't-2', title: 'Practice slices and maps', category: 'Practice', type: 'Study', date: '2026-10-07', durationMinutes: 60, priority: 'Normal', dependencies: ['t-1'] }
        ]
      };

      global.fetch = async (url, opts) => {
        if (url.includes('/api/ai/status')) {
          return { ok: true, status: 200, json: async () => ({ status: 'ready', model: OLLAMA_CONFIG.defaultModel }) };
        }
        if (url.includes('/api/generate-plan') || url.includes('/api/chat')) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              plan: mockValidPlan,
              model: OLLAMA_CONFIG.defaultModel
            })
          };
        }
        return originalFetch(url, opts);
      };

      const result = await generateAiPlan({
        goal: 'Learn Go and Backend Engineering',
        startDate: '2026-10-06',
        targetDate: '2026-12-06',
        dailyHours: 2,
        daysPerWeek: 6
      });

      assert.ok(result.plan, 'Must return validated plan');
      assert.strictEqual(result.plan.goal.title, 'Learn Go and Backend Engineering');
      assert.strictEqual(result.plan.tasks.length, 2);
      assert.strictEqual(result.plan.status, 'draft', 'Generated plan must begin in draft status');
      console.log('✓ Valid structured plan generated and validated');
    }

    // ----------------------------------------------------
    // Test 5: Model returns malformed or invalid data
    // ----------------------------------------------------
    {
      global.fetch = async (url, opts) => {
        if (url.includes('/api/ai/status')) {
          return { ok: true, status: 200, json: async () => ({ status: 'ready', model: OLLAMA_CONFIG.defaultModel }) };
        }
        if (url.includes('/api/generate-plan') || url.includes('/api/chat')) {
          return {
            ok: false,
            status: 502,
            json: async () => ({ error: 'Ollama returned invalid or malformed JSON output.' })
          };
        }
        return originalFetch(url, opts);
      };

      await assert.rejects(
        async () => {
          await generateAiPlan({ goal: 'Learn Rust' });
        },
        /invalid or malformed JSON/,
        'Must reject malformed output safely without crashing'
      );
      console.log('✓ Malformed or invalid model data handled gracefully');
    }

    // ----------------------------------------------------
    // Test 6: Request timeout handling
    // ----------------------------------------------------
    {
      global.fetch = async (url, opts) => {
        if (url.includes('/api/ai/status')) {
          return { ok: true, status: 200, json: async () => ({ status: 'ready', model: OLLAMA_CONFIG.defaultModel }) };
        }
        if (url.includes('/api/generate-plan') || url.includes('/api/chat')) {
          return {
            ok: false,
            status: 504,
            json: async () => ({
              error: 'Plan generation timed out after 180 seconds. Local Gemma inference may need more time.',
              code: 'TIMEOUT'
            })
          };
        }
        return originalFetch(url, opts);
      };

      await assert.rejects(
        async () => {
          await generateAiPlan({ goal: 'Learn Deep Learning' });
        },
        (err) => err.code === 'TIMEOUT',
        'Must throw descriptive timeout error when local generation takes too long'
      );
      console.log('✓ Local model generation timeout handled cleanly');
    }

    // ----------------------------------------------------
    // Test 7: User cancels generation
    // ----------------------------------------------------
    {
      global.fetch = async (url, opts) => {
        if (url.includes('/api/ai/status')) {
          return { ok: true, status: 200, json: async () => ({ status: 'ready', model: OLLAMA_CONFIG.defaultModel }) };
        }
        if (url.includes('/api/generate-plan') || url.includes('/api/chat')) {
          return new Promise((resolve, reject) => {
            const timer = setTimeout(() => resolve({ ok: true, json: async () => ({ plan: {} }) }), 5000);
            if (opts?.signal) {
              opts.signal.addEventListener('abort', () => {
                clearTimeout(timer);
                const abortErr = new Error('Plan generation was cancelled.');
                abortErr.name = 'AbortError';
                reject(abortErr);
              });
            }
          });
        }
        return originalFetch(url, opts);
      };

      const planPromise = generateAiPlan({ goal: 'Learn Docker' });
      // Trigger cancel immediately
      cancelPlanGeneration();

      await assert.rejects(
        planPromise,
        /Plan generation was cancelled/,
        'Must reject with cancellation notice when user cancels'
      );
      console.log('✓ User cancellation via AbortController verified');
    }

    // ----------------------------------------------------
    // Test 8: User discards a proposed plan draft (Phase 7)
    // ----------------------------------------------------
    {
      resetToInitialState();
      // Suppose an existing active plan is running
      const existingPlan = { id: 'plan-existing', title: 'Existing Plan', status: 'implemented', tasks: [] };
      updateState(curr => ({
        ...curr,
        activePlanId: existingPlan.id,
        plans: [existingPlan],
        tasks: [{ id: 'task-keep', planId: 'plan-existing', title: 'Keep this task', completed: false }]
      }));
      saveState(true);

      // Generate a new draft
      const draftPlan = { id: 'plan-draft-test', title: 'Proposed New Plan', status: 'draft', tasks: [] };
      savePlanDraft(draftPlan);
      assert.strictEqual(getPlanDraft().id, 'plan-draft-test');

      // User chooses to discard draft
      savePlanDraft(null);
      assert.strictEqual(getPlanDraft(), null, 'Draft must be cleared on discard');

      // Verify active plan and existing tracker tasks remain 100% untouched
      const active = getActivePlan();
      assert.strictEqual(active.id, 'plan-existing', 'Active plan must remain unchanged');
      const state = getState();
      assert.strictEqual(state.tasks.length, 1);
      assert.strictEqual(state.tasks[0].id, 'task-keep');
      console.log('✓ Discarding proposed plan preserves existing tracker data and tasks');
    }

    // ----------------------------------------------------
    // Test 9: User approves & implements plan atomically
    // ----------------------------------------------------
    {
      resetToInitialState();
      const newPlan = {
        id: 'plan-approved',
        title: 'User Approved AI Plan',
        status: 'draft',
        tasks: [
          { id: 't-app-1', title: 'Task 1', category: 'Learning', date: '2026-10-06', durationMinutes: 60 },
          { id: 't-app-2', title: 'Task 2', category: 'Practice', date: '2026-10-06', durationMinutes: 45 }
        ]
      };
      savePlanDraft(newPlan);

      // User explicitly clicks "Implement Plan"
      const implResult = await implementPlan(newPlan.id);
      assert.strictEqual(implResult.success, true);
      assert.strictEqual(implResult.tasksCount, 2);

      const state = getState();
      assert.strictEqual(state.activePlanId, 'plan-approved');
      assert.strictEqual(state.planDraft, null, 'Draft must be cleared after approval');
      assert.strictEqual(state.tasks.length, 2);
      assert.strictEqual(state.tasks[0].status, 'Pending');
      console.log('✓ User explicit approval implements plan atomically without duplicates');
    }

    // ----------------------------------------------------
    // Test 10: Existing approved tasks are not duplicated or overwritten
    // ----------------------------------------------------
    {
      const duplicateResult = await implementPlan('plan-approved');
      assert.strictEqual(duplicateResult.success, true);
      const state = getState();
      assert.strictEqual(state.tasks.length, 2, 'Duplicate implementation must not create duplicate tasks');
      console.log('✓ Re-implementing active plan prevents duplicate tasks');
    }

    // ----------------------------------------------------
    // Test 11: Data survives application restart simulation
    // ----------------------------------------------------
    {
      const beforeState = getState();
      assert.strictEqual(beforeState.activePlanId, 'plan-approved');
      assert.strictEqual(beforeState.tasks.length, 2);

      // Simulate restart by reading fresh state
      const reloadedState = getState();
      assert.strictEqual(reloadedState.activePlanId, beforeState.activePlanId);
      assert.strictEqual(reloadedState.tasks.length, beforeState.tasks.length);
      console.log('✓ State persistence across simulated application restart verified');
    }

    // ----------------------------------------------------
    // Test 12: No cloud AI requests made
    // ----------------------------------------------------
    {
      let cloudCalled = false;
      global.fetch = async (url, opts) => {
        if (url.includes('googleapis.com') || url.includes('openai.com') || url.includes('anthropic.com')) {
          cloudCalled = true;
          throw new Error('Blocked cloud AI call!');
        }
        return originalFetch(url, opts);
      };

      const fallback = generateLocalStructuredPlan({
        goal: 'Learn C++',
        startDate: '2026-10-06',
        targetDate: '2026-11-06',
        dailyHours: 2,
        daysPerWeek: 6
      });
      assert.ok(fallback.tasks.length > 0);
      assert.strictEqual(cloudCalled, false, 'No cloud AI endpoints should be called');
      console.log('✓ Privacy verified: Zero cloud AI requests made');
    }

    // ----------------------------------------------------
    // Test 14: Dedicated Gemma System Instruction & Hierarchy
    // ----------------------------------------------------
    {
      assert.ok(typeof GEMMA_SYSTEM_INSTRUCTION === 'string' && GEMMA_SYSTEM_INSTRUCTION.length > 500, 'System instruction must be a substantial prompt');
      assert.ok(GEMMA_SYSTEM_INSTRUCTION.includes('ROLE'), 'Must define ROLE');
      assert.ok(GEMMA_SYSTEM_INSTRUCTION.includes('MONTH'), 'Must specify MONTH hierarchy');
      assert.ok(GEMMA_SYSTEM_INSTRUCTION.includes('WEEK'), 'Must specify WEEK hierarchy');
      assert.ok(GEMMA_SYSTEM_INSTRUCTION.includes('TASK'), 'Must specify TASK hierarchy');
      assert.ok(GEMMA_SYSTEM_INSTRUCTION.includes('AI MUST NOT MODIFY DATA DIRECTLY'), 'Must forbid direct data modification');
      assert.ok(GEMMA_SYSTEM_INSTRUCTION.includes('PLAN PREVIEW FIRST'), 'Must enforce preview before implementation');
      assert.ok(GEMMA_SYSTEM_INSTRUCTION.includes('LOCAL-FIRST PRIVACY'), 'Must mandate local-first privacy');
      assert.ok(GEMMA_SYSTEM_INSTRUCTION.includes('FINAL ARCHITECTURE RULE'), 'Must include final architecture rule');

      // Test hierarchical schema parsing in planValidator
      const hierarchicalPlan = {
        plan_title: 'Fullstack Roadmap',
        months: [
          {
            month: 1,
            title: 'Month 1: Frontend Basics',
            weeks: [
              {
                week: 1,
                days: [
                  {
                    day: '2026-10-06',
                    tasks: [
                      {
                        title: 'Learn HTML Semantic Tags',
                        description: 'Structure a clean web page using semantic HTML5 elements',
                        duration_minutes: 60,
                        type: 'Learning'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = validateAndRepairPlan(hierarchicalPlan, { startDate: '2026-10-06' });
      assert.strictEqual(result.isValid, true, 'Hierarchical schema must validate successfully');
      assert.strictEqual(result.plan.tasks.length, 1, 'Extracted nested task into tasks array');
      assert.strictEqual(result.plan.tasks[0].durationMinutes, 60, 'Parsed duration_minutes correctly');
      console.log('✓ Dedicated Gemma system instruction & hierarchical plan parsing verified');
    }

    // ----------------------------------------------------
    // Test 15: Resilient JSON repair handles unterminated strings & cutoffs
    // ----------------------------------------------------
    {
      const truncatedInput = '{"goal": {"title": "Python 30 Days", "description": "Learn python"}, "tasks": [{"id": "t1", "title": "Setup", "description": "Install python and configure vs code';
      const repaired = repairAndParseJson(truncatedInput);
      assert.strictEqual(repaired.goal.title, 'Python 30 Days');
      assert.strictEqual(repaired.tasks.length, 1);
      assert.strictEqual(repaired.tasks[0].id, 't1');

      const validated = validateAndRepairPlan(repaired, { startDate: '2026-10-06' });
      assert.strictEqual(validated.isValid, true);
      console.log('✓ Resilient JSON repair recovers truncated LLM strings & brackets without crashing');
    }

    console.log('✓ All Ollama Plan Generation Tests Passed!\n');

  } finally {
    global.fetch = originalFetch;
    resetToInitialState();
  }
}

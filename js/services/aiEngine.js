/**
 * Akshay's 12-Month AI/ML Career OS - AI Career Intelligence + Personal Mentor (Phase 8)
 * 
 * Strict Phase 8 Rules:
 * - Real application data only (NEVER fabricate progress, hours, or outcomes)
 * - No outcome probability, company ranking, or selection predictions (Section 50)
 * - Neutral terminology ("Needs Attention", never "Bad", "Failure", etc.) (Section 5)
 * - Recommendations only (no automatic modification of goals, roadmap, or priorities) (Section 3, 34)
 * - Action Approval System: all mutations require explicit user confirmation (Section 34, 35)
 * - Data Privacy Controls: respect user's data category permissions (Section 43)
 * - Response Format: SHORT ANSWER -> WHY -> NEXT ACTIONS (Section 31)
 * - Auditable insights identifying data source, date range, and relevant records (Section 32)
 * - If insufficient data, explicitly state "Not enough data yet." or "No data available." (Section 33, 49)
 */

import { getState, updateState } from '../data/storage.js';
import { calculateDsaAnalytics } from './dsaEngine.js';
import { calculateProjectMetrics, getProjects } from './projectEngine.js';
import {
  getCareerProfile,
  getResumeVersions,
  getResumeChecklist,
  getGitHubProfile,
  getLinkedInProfile,
  getApplications,
  getApplicationStats,
  getUpcomingActions,
  getAptitudeStats,
  getTechnicalTopics,
  getInterviewQuestions,
  getMockInterviews
} from './careerEngine.js';
import { calculateMonthlyMetrics } from './monthlyEngine.js';
import { calculateStreaks } from './streakService.js';
import {
  getDsaDetailedAnalytics,
  getProjectDetailedAnalytics,
  getCareerDetailedAnalytics,
  generateMonthlyProgressReport,
  generateWeeklyProgressReport
} from './progressEngine.js';

let seqCounter = 0;
function uid(prefix = 'ai') {
  seqCounter += 1;
  return `${prefix}-${Date.now()}-${seqCounter}-${Math.random().toString(36).substring(2, 7)}`;
}

// In-memory cache for cost control & debouncing (Section 40)
let insightsCache = {
  timestamp: 0,
  dataHash: '',
  insights: null
};

export function invalidateAiCache() {
  insightsCache = { timestamp: 0, dataHash: '', insights: null };
}

// ==========================================
// 1. DATA PERMISSIONS & PRIVACY CONTEXT (Section 43)
// ==========================================

export function getAiDataPermissions() {
  const state = getState();
  return state.ai_data_permissions || {
    roadmap: true,
    study: true,
    dsa: true,
    projects: true,
    career: true,
    applications: true,
    habits: true
  };
}

export function updateAiDataPermissions(updates) {
  let updated = null;
  updateState(curr => {
    updated = { ...(curr.ai_data_permissions || {}), ...updates };
    return { ...curr, ai_data_permissions: updated };
  });
  invalidateAiCache();
  return updated;
}

export function getAiSettings() {
  const state = getState();
  return state.ai_settings || {
    enable_insights: true,
    daily_briefing: true,
    weekly_review: true,
    monthly_review: true,
    ai_mentor: true,
    priority_recommendations: true,
    study_planning: true,
    provider: 'heuristic_local',
    model: 'mentor-v1',
    temperature: 0.2
  };
}

export function updateAiSettings(updates) {
  let updated = null;
  updateState(curr => {
    updated = { ...(curr.ai_settings || {}), ...updates };
    return { ...curr, ai_settings: updated };
  });
  return updated;
}

// ==========================================
// 2. AUDIT LOGGING (Section 44)
// ==========================================

export function logAiAction(feature, dataCategories, actionProposed, actionApproved = false) {
  const id = uid('ailog');
  const now = new Date().toISOString();
  const dateStr = getState().user?.activeDate || now.split('T')[0];

  const entry = {
    id,
    feature,
    date: dateStr,
    data_categories_used: dataCategories,
    action_proposed: actionProposed,
    action_approved: actionApproved,
    timestamp: now
  };

  updateState(curr => ({
    ...curr,
    ai_action_logs: [entry, ...(curr.ai_action_logs || [])]
  }));

  return entry;
}

export function getAiAuditLogs() {
  return getState().ai_action_logs || [];
}

// ==========================================
// 3. TODAY'S AI BRIEF (Section 2)
// ==========================================

export function getTodayAiBrief() {
  const state = getState();
  const perms = getAiDataPermissions();
  const activeDate = state.user?.activeDate || '2026-10-01';

  // Check if study data is permitted
  const allDailyTasks = (state.daily_tasks || state.dailyTasks || []);
  const todayTasks = perms.study ? allDailyTasks.filter(t => t.date === activeDate) : [];
  const incompleteToday = todayTasks.filter(t => !t.completed);

  // 1. Primary Learning Task
  let primaryTask = null;
  if (perms.roadmap && incompleteToday.length > 0) {
    primaryTask = incompleteToday.find(t => t.priority === 'Critical' || t.category === 'Prime 3.0') ||
      incompleteToday.find(t => t.category === 'Roadmap' || t.priority === 'High') ||
      incompleteToday[0];
  }

  // 2. DSA Target
  let dsaTargetInfo = null;
  if (perms.dsa) {
    const dsaAnalytics = calculateDsaAnalytics(state);
    const dsaProblemsToday = (state.dsa_problems || []).filter(p => p.date === activeDate && (p.status === 'Solved' || p.solved));
    const target = state.dsa_daily_targets?.[activeDate] || 2;
    dsaTargetInfo = {
      target,
      solvedToday: dsaProblemsToday.length,
      remaining: Math.max(0, target - dsaProblemsToday.length),
      totalSolvedOverall: dsaAnalytics.solved ?? dsaAnalytics.totalSolved ?? 0
    };
  }

  // 3. Project Task
  let projectTask = null;
  if (perms.projects) {
    projectTask = incompleteToday.find(t => t.category === 'Project' || t.related_project_id);
    if (!projectTask) {
      const activeProjects = (state.projects || []).filter(p => ['Building', 'Planned', 'Testing'].includes(p.status));
      if (activeProjects.length > 0) {
        const topProject = activeProjects[0];
        const pTasks = (state.project_tasks || []).filter(pt => pt.project_id === topProject.id && !pt.completed);
        if (pTasks.length > 0) {
          projectTask = {
            id: pTasks[0].id,
            title: `${topProject.name}: ${pTasks[0].title}`,
            source: 'Project Task Registry'
          };
        }
      }
    }
  }

  // 4. Career Task
  let careerTask = null;
  if (perms.career) {
    careerTask = incompleteToday.find(t => t.category === 'Career');
    if (!careerTask) {
      const upcoming = getUpcomingActions();
      const nextAction = upcoming[0];
      if (nextAction) {
        careerTask = {
          id: nextAction.id,
          title: nextAction.title,
          source: nextAction.source,
          date: nextAction.date
        };
      }
    }
  }

  // 5. Revision Item
  let revisionItem = null;
  if (perms.dsa) {
    const revisions = state.dsa_revisions || [];
    const pendingRevs = revisions.filter(r => !r.completed);
    if (pendingRevs.length > 0) {
      revisionItem = {
        id: pendingRevs[0].id,
        problem_title: pendingRevs[0].problem_title,
        pattern: pendingRevs[0].pattern || 'DSA Pattern',
        interval: pendingRevs[0].interval || '1-day'
      };
    }
  }
  if (!revisionItem && state.revisionItems && state.revisionItems.length > 0) {
    const genRev = state.revisionItems.find(r => !r.completed);
    if (genRev) {
      revisionItem = {
        id: genRev.id,
        problem_title: genRev.title,
        pattern: genRev.category || 'Topic',
        interval: 'Scheduled'
      };
    }
  }

  // "Why This Matters" Contextual Synthesis
  const reasons = [];
  if (primaryTask) {
    reasons.push(`Progress on ${primaryTask.title} keeps your October core foundations on track.`);
  }
  if (dsaTargetInfo && dsaTargetInfo.remaining > 0) {
    reasons.push(`${dsaTargetInfo.remaining} DSA problem(s) remaining for today to maintain consistency.`);
  }
  if (revisionItem) {
    reasons.push(`Revising ${revisionItem.problem_title} prevents memory decay on key problem patterns.`);
  }
  if (projectTask) {
    reasons.push(`Completing project work advances portfolio milestone deadlines.`);
  }
  if (careerTask) {
    reasons.push(`Career action ensures internship and application deadlines are met.`);
  }

  const whyThisMatters = reasons.length > 0
    ? reasons.join(' ')
    : 'No critical items pending. You are currently up to date on planned tasks.';

  return {
    activeDate,
    primaryTask,
    dsaTargetInfo,
    projectTask,
    careerTask,
    revisionItem,
    whyThisMatters,
    dataSources: ['Daily Tasks', 'Roadmap', 'DSA Revisions', 'Projects', 'Career Engine']
  };
}

// ==========================================
// 4. DAILY PRIORITY ENGINE (Section 3)
// ==========================================

export function getDailyPriorityRecommendations() {
  const state = getState();
  const perms = getAiDataPermissions();
  if (!perms.study) {
    return { high: [], medium: [], low: [], message: 'Study data category is currently disabled in AI Settings.' };
  }

  const activeDate = state.user?.activeDate || '2026-10-01';
  const allTasks = state.daily_tasks || state.dailyTasks || [];
  const todayTasks = allTasks.filter(t => t.date === activeDate && !t.completed);

  const high = [];
  const medium = [];
  const low = [];

  todayTasks.forEach(task => {
    const isCritical = task.priority === 'Critical' || task.priority === 'High';
    const isOverdue = task.date < activeDate;
    const isCoreTopic = task.category === 'Prime 3.0' || task.category === 'DSA' || (task.source && task.source.includes('Core'));

    if (isCritical || isOverdue || (task.category === 'DSA' && task.durationMinutes >= 45)) {
      high.push({
        ...task,
        suggestedPriority: 'High',
        reason: isOverdue ? 'Task is overdue' : isCritical ? 'Marked critical in study schedule' : 'Core foundation component'
      });
    } else if (task.category === 'Project' || task.category === 'Career' || isCoreTopic) {
      medium.push({
        ...task,
        suggestedPriority: 'Medium',
        reason: 'Milestone advancement and continuous skill buildup'
      });
    } else {
      low.push({
        ...task,
        suggestedPriority: 'Low',
        reason: 'Supplemental or flexible review task'
      });
    }
  });

  return {
    activeDate,
    totalPending: todayTasks.length,
    high,
    medium,
    low,
    disclaimer: 'Recommendations only. Your existing task priorities are not automatically altered.'
  };
}

// ==========================================
// 5. WHAT SHOULD I DO NEXT? (Section 4)
// ==========================================

export function getWhatShouldIDoNext() {
  const state = getState();
  const perms = getAiDataPermissions();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const actions = [];

  // 1. Incomplete daily tasks
  if (perms.study) {
    const allTasks = state.daily_tasks || state.dailyTasks || [];
    const incompleteTasks = allTasks.filter(t => t.date === activeDate && !t.completed);
    const criticalTask = incompleteTasks.find(t => t.priority === 'Critical') || incompleteTasks[0];
    if (criticalTask) {
      actions.push({
        step: 1,
        title: criticalTask.title,
        category: criticalTask.category,
        reason: `Pending in today's execution plan (${criticalTask.durationMinutes || 30} mins estimated)`,
        sourceType: 'Daily Task',
        recordId: criticalTask.id
      });
    }
  }

  // 2. DSA Target / Revision
  if (perms.dsa) {
    const dsaTarget = state.dsa_daily_targets?.[activeDate] || 2;
    const dsaSolvedToday = (state.dsa_problems || []).filter(p => p.date === activeDate && (p.status === 'Solved' || p.solved)).length;
    if (dsaSolvedToday < dsaTarget) {
      actions.push({
        step: actions.length + 1,
        title: `Solve ${dsaTarget - dsaSolvedToday} more DSA problem(s)`,
        category: 'DSA Practice',
        reason: `Reach today's target of ${dsaTarget} problem(s)`,
        sourceType: 'DSA Target',
        recordId: 'dsa-target'
      });
    }

    const pendingRevs = (state.dsa_revisions || []).filter(r => !r.completed);
    if (pendingRevs.length > 0) {
      actions.push({
        step: actions.length + 1,
        title: `Review DSA problem: ${pendingRevs[0].problem_title}`,
        category: 'DSA Revision',
        reason: `Scheduled pattern recall (${pendingRevs[0].pattern || 'Pattern'})`,
        sourceType: 'DSA Revision',
        recordId: pendingRevs[0].id
      });
    }
  }

  // 3. Project Task
  if (perms.projects) {
    const activeProjects = (state.projects || []).filter(p => ['Building', 'Planned', 'Testing'].includes(p.status));
    if (activeProjects.length > 0) {
      const topProj = activeProjects[0];
      const pTasks = (state.project_tasks || []).filter(pt => pt.project_id === topProj.id && !pt.completed);
      if (pTasks.length > 0) {
        actions.push({
          step: actions.length + 1,
          title: `${topProj.name}: ${pTasks[0].title}`,
          category: 'Project Work',
          reason: 'Incomplete project task on critical path',
          sourceType: 'Project Task',
          recordId: pTasks[0].id
        });
      }
    }
  }

  // 4. Career Action
  if (perms.career) {
    const upcoming = getUpcomingActions();
    if (upcoming.length > 0) {
      actions.push({
        step: actions.length + 1,
        title: upcoming[0].title,
        category: 'Career & Placement',
        reason: `Upcoming deadline: ${upcoming[0].date}`,
        sourceType: 'Career Followup',
        recordId: upcoming[0].id
      });
    }
  }

  return {
    actions: actions.slice(0, 5),
    note: 'The user decides what to actually do. These are prioritized suggestions from your active database.'
  };
}

// ==========================================
// 6. LEARNING GAP DETECTION (Section 5)
// ==========================================

export function getLearningGaps() {
  const state = getState();
  const perms = getAiDataPermissions();
  const gaps = [];

  // Check Roadmap
  if (perms.roadmap) {
    const roadmapTopics = state.roadmap_topics || [];
    const needsRev = roadmapTopics.filter(t => t.status === 'Needs Revision');
    if (needsRev.length > 0) {
      gaps.push({
        area: 'Individual Roadmap',
        status: 'Needs Attention',
        description: `${needsRev.length} topic(s) marked for revision: ${needsRev.map(t => t.name).slice(0, 3).join(', ')}`,
        suggestion: 'Schedule a revision block this week.'
      });
    }
  }

  // Check DSA
  if (perms.dsa) {
    const pendingRevs = (state.dsa_revisions || []).filter(r => !r.completed);
    if (pendingRevs.length >= 2) {
      gaps.push({
        area: 'DSA Revision Queue',
        status: 'Needs Attention',
        description: `${pendingRevs.length} problems waiting in revision queue`,
        suggestion: 'Allocate 30 minutes to review spaced-repetition problems.'
      });
    }
  }

  // Check Projects
  if (perms.projects) {
    const projects = state.projects || [];
    const buildingWithNoTasks = projects.filter(p => p.status === 'Building' && !(state.project_tasks || []).some(pt => pt.project_id === p.id && !pt.completed));
    if (buildingWithNoTasks.length > 0) {
      gaps.push({
        area: 'Project Planning',
        status: 'Needs Attention',
        description: `${buildingWithNoTasks[0].name} is marked Building but has no pending tasks in pipeline`,
        suggestion: 'Add next actionable tasks to maintain development momentum.'
      });
    }
  }

  // Check Study Consistency
  if (perms.study) {
    const activeDate = state.user?.activeDate || '2026-10-01';
    const missedDaily = (state.daily_tasks || state.dailyTasks || []).filter(t => t.date < activeDate && !t.completed && t.status !== 'Skipped');
    if (missedDaily.length > 0) {
      gaps.push({
        area: 'Incomplete Daily Tasks',
        status: 'Needs Attention',
        description: `${missedDaily.length} past task(s) were not completed or rescheduled`,
        suggestion: 'Review catch-up view to reschedule or close past items.'
      });
    }
  }

  return {
    gaps,
    hasGaps: gaps.length > 0
  };
}

// ==========================================
// 7. DSA INTELLIGENCE & PATTERNS & MISTAKES (Sections 6, 7, 8, 9)
// ==========================================

export function getDsaIntelligence() {
  const state = getState();
  const perms = getAiDataPermissions();
  if (!perms.dsa) {
    return { available: false, message: 'DSA data category disabled in AI Settings.' };
  }

  const problems = state.dsa_problems || [];
  const mistakes = state.dsa_mistakes || [];
  const revisions = state.dsa_revisions || [];
  const activeDate = state.user?.activeDate || '2026-10-01';

  // 1. Data Sufficiency Check (Section 33)
  if (problems.length === 0) {
    return {
      available: false,
      message: 'Not enough data yet. Log problems in Phase 5 DSA Tracker to generate insights.',
      problemsCount: 0
    };
  }

  // Solves breakdown
  const solved = problems.filter(p => p.status === 'Solved' || p.solved);
  const independentSolves = problems.filter(p => p.solved_independently).length;
  const hintsUsed = problems.filter(p => p.needed_hint).length;
  const solutionViewed = problems.filter(p => p.viewed_solution).length;

  // Patterns Analysis (Section 8)
  const patternCounts = {};
  problems.forEach(p => {
    const pat = p.pattern || 'General';
    patternCounts[pat] = (patternCounts[pat] || 0) + 1;
  });

  const patternsList = Object.keys(patternCounts).map(name => ({
    name,
    count: patternCounts[name],
    status: patternCounts[name] >= 5 ? 'Frequently practiced' : 'Needs more practice'
  })).sort((a, b) => b.count - a.count);

  // Mistakes Analysis (Section 9)
  const mistakeCategories = {
    'Logic': 0,
    'Complexity': 0,
    'Edge cases': 0,
    'Syntax': 0,
    'Implementation': 0,
    'Concept': 0,
    'Problem interpretation': 0
  };

  mistakes.forEach(m => {
    const cat = m.category || 'Logic';
    if (mistakeCategories[cat] !== undefined) {
      mistakeCategories[cat] += 1;
    } else {
      mistakeCategories['Logic'] += 1;
    }
  });

  const recurringMistakes = Object.keys(mistakeCategories)
    .filter(k => mistakeCategories[k] > 0)
    .map(k => ({ category: k, count: mistakeCategories[k] }))
    .sort((a, b) => b.count - a.count);

  let mistakeSuggestion = 'No recurring error patterns detected yet.';
  if (recurringMistakes.length > 0) {
    const topError = recurringMistakes[0];
    if (topError.category === 'Edge cases') {
      mistakeSuggestion = 'Review empty arrays, single elements, and boundary values before writing core loops.';
    } else if (topError.category === 'Complexity') {
      mistakeSuggestion = 'Analyze time/space complexity before coding; verify worst-case recursion depths.';
    } else {
      mistakeSuggestion = `Focus on ${topError.category.toLowerCase()} verification during dry-runs.`;
    }
  }

  // Revisions (Section 7)
  const todayRevisions = revisions.filter(r => !r.completed && r.scheduled_date === activeDate);
  const upcomingRevisions = revisions.filter(r => !r.completed && r.scheduled_date > activeDate);
  const overdueRevisions = revisions.filter(r => !r.completed && r.scheduled_date < activeDate);

  return {
    available: true,
    totalAttempted: problems.length,
    totalSolved: solved.length,
    independentSolves,
    hintsUsed,
    solutionViewed,
    patternsList,
    recurringMistakes,
    mistakeSuggestion,
    revisions: {
      today: todayRevisions,
      upcoming: upcomingRevisions,
      overdue: overdueRevisions
    },
    insightsText: `${solved.length} problem(s) solved (${independentSolves} independently). ${revisions.filter(r => !r.completed).length} items awaiting revision.`
  };
}

// ==========================================
// 8. PROJECT INTELLIGENCE & NEXT ACTIONS (Sections 10, 11)
// ==========================================

export function getProjectIntelligence() {
  const state = getState();
  const perms = getAiDataPermissions();
  if (!perms.projects) {
    return { available: false, message: 'Projects data category disabled in AI Settings.' };
  }

  const projects = state.projects || [];
  if (projects.length === 0) {
    return { available: false, message: 'Not enough data yet. Create a project in Phase 6 Projects Hub.' };
  }

  const activeProjects = projects.filter(p => ['Building', 'Planned', 'Testing'].includes(p.status));
  const metrics = calculateProjectMetrics();

  const projectRecommendations = activeProjects.map(proj => {
    const tasks = (state.project_tasks || []).filter(pt => pt.project_id === proj.id);
    const incompleteTasks = tasks.filter(pt => !pt.completed);
    const milestones = (state.project_milestones || []).filter(pm => pm.project_id === proj.id);
    const incompleteMilestones = milestones.filter(pm => !pm.completed);
    const gh = state.project_github?.[proj.id] || {};

    let nextAction = 'Plan initial features and setup repository';
    let reason = 'Project has no pending tasks created.';

    if (incompleteTasks.length > 0) {
      nextAction = incompleteTasks[0].title;
      reason = `Incomplete task in ${proj.name} (${incompleteTasks.length} pending total)`;
    } else if (incompleteMilestones.length > 0) {
      nextAction = `Work towards milestone: ${incompleteMilestones[0].title}`;
      reason = 'All current tasks complete; next milestone requires execution';
    } else if (!gh.repo_url) {
      nextAction = 'Link GitHub repository and complete README checklist';
      reason = 'Repository URL not yet configured';
    } else if (!proj.live_url && proj.status === 'Testing') {
      nextAction = 'Deploy to Vercel/Render and configure production URL';
      reason = 'Project is in testing phase but has no live deployment';
    }

    return {
      projectId: proj.id,
      name: proj.name,
      status: proj.status,
      progress: proj.progress || 0,
      nextAction,
      reason,
      portfolioReady: proj.portfolio_ready || false
    };
  });

  return {
    available: true,
    totalProjects: projects.length,
    activeProjectsCount: activeProjects.length,
    deployedCount: metrics.deployed,
    portfolioReadyCount: metrics.portfolioReady,
    projectRecommendations
  };
}

// ==========================================
// 9. CAREER INTELLIGENCE & PROFILE COMPLETENESS (Sections 12, 13, 14)
// ==========================================

export function getCareerIntelligence() {
  const state = getState();
  const perms = getAiDataPermissions();
  if (!perms.career) {
    return { available: false, message: 'Career data category disabled in AI Settings.' };
  }

  const resumeVersions = getResumeVersions();
  const currentResume = resumeVersions[0];
  const ghProfile = getGitHubProfile();
  const liProfile = getLinkedInProfile();
  const appStats = getApplicationStats();
  const upcomingActions = getUpcomingActions();

  // Profile Completeness (Section 14)
  const resumeChecklist = getResumeChecklist();
  const resumeRemaining = Object.values(resumeChecklist).filter(v => !v).length;

  const ghChecklist = ghProfile.checklist || {};
  const ghRemaining = Object.values(ghChecklist).filter(v => !v).length;

  const liChecklist = liProfile.checklist || {};
  const liRemaining = Object.values(liChecklist).filter(v => !v).length;

  const insights = [];
  if (currentResume) {
    insights.push({
      category: 'Resume',
      message: `Resume status is ${currentResume.status} (${resumeVersions.length} versions tracked).`,
      needsUpdate: currentResume.status === 'Needs Update' || currentResume.status === 'Draft'
    });
  } else {
    insights.push({
      category: 'Resume',
      message: 'No resume versions logged yet.',
      needsUpdate: true
    });
  }

  if (appStats.total > 0) {
    insights.push({
      category: 'Applications',
      message: `${appStats.total} total application(s) logged: ${appStats.assessments} assessments, ${appStats.interviews} interviews, ${appStats.offers} offer(s).`
    });
  }

  return {
    available: true,
    insights,
    upcomingCareerActions: upcomingActions.slice(0, 5),
    profileSetup: {
      resumeRemaining,
      githubRemaining: ghRemaining,
      linkedinRemaining: liRemaining
    }
  };
}

// ==========================================
// 10. CONSISTENCY & TIME ALLOCATION (Sections 20, 21, 22)
// ==========================================

export function getConsistencyInsights() {
  const state = getState();
  const perms = getAiDataPermissions();
  if (!perms.study && !perms.habits) {
    return { available: false, message: 'Study/Habits data category disabled in AI Settings.' };
  }

  const streaks = calculateStreaks(state);
  const sessions = state.studySessions || [];

  // Time allocation (Section 22)
  let dsaMinutes = 0;
  let aimlMinutes = 0;
  let projectMinutes = 0;
  let careerMinutes = 0;
  let otherMinutes = 0;

  sessions.forEach(s => {
    const mins = s.durationMinutes || 0;
    if (s.category === 'DSA') dsaMinutes += mins;
    else if (s.category === 'Prime 3.0' || s.category === 'AI/ML' || s.category === 'Roadmap') aimlMinutes += mins;
    else if (s.category === 'Project') projectMinutes += mins;
    else if (s.category === 'Career') careerMinutes += mins;
    else otherMinutes += mins;
  });

  const totalMinutes = dsaMinutes + aimlMinutes + projectMinutes + careerMinutes + otherMinutes;
  const timeAllocation = {
    dsaHours: Math.round((dsaMinutes / 60) * 10) / 10,
    aimlHours: Math.round((aimlMinutes / 60) * 10) / 10,
    projectHours: Math.round((projectMinutes / 60) * 10) / 10,
    careerHours: Math.round((careerMinutes / 60) * 10) / 10,
    otherHours: Math.round((otherMinutes / 60) * 10) / 10,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10
  };

  const trackedDays = new Set(sessions.map(s => s.date)).size;
  const consistencySummary = trackedDays > 0
    ? `You have active study records across ${trackedDays} tracked day(s). Current streak: ${streaks.currentStreak} day(s).`
    : 'No study sessions logged yet.';

  return {
    available: true,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    trackedDays,
    timeAllocation,
    consistencySummary
  };
}

// ==========================================
// 11. GOAL RISK & DEADLINE RADAR (Sections 18, 19)
// ==========================================

export function getDeadlineRadar() {
  const state = getState();
  const deadlines = [];
  const activeDate = state.user?.activeDate || '2026-10-01';

  // 1. Project Milestones & Target Dates
  (state.projects || []).forEach(p => {
    if (p.target_date && p.status !== 'Completed' && p.status !== 'Archived') {
      deadlines.push({
        id: `dl-proj-${p.id}`,
        title: `Project Target: ${p.name}`,
        date: p.target_date,
        type: 'Project Target Date',
        source: p.name,
        isOverdue: p.target_date < activeDate
      });
    }
  });

  (state.project_milestones || []).forEach(m => {
    if (m.target_date && !m.completed) {
      deadlines.push({
        id: `dl-pms-${m.id}`,
        title: `Project Milestone: ${m.title}`,
        date: m.target_date,
        type: 'Project Milestone',
        source: 'Projects Hub',
        isOverdue: m.target_date < activeDate
      });
    }
  });

  // 2. Career Application Deadlines
  (state.applications || []).forEach(a => {
    if (a.deadline && a.status !== 'Closed' && a.status !== 'Rejected') {
      deadlines.push({
        id: `dl-app-${a.id}`,
        title: `Application Deadline: ${a.company} (${a.role})`,
        date: a.deadline,
        type: 'Application Deadline',
        source: a.company,
        isOverdue: a.deadline < activeDate
      });
    }
  });

  // 3. Application Follow-ups
  (state.application_followups || []).forEach(f => {
    if (f.status === 'Pending' && f.due_date) {
      deadlines.push({
        id: `dl-apf-${f.id}`,
        title: `Follow-up: ${f.action}`,
        date: f.due_date,
        type: 'Application Follow-up',
        source: 'Career Outreach',
        isOverdue: f.due_date < activeDate
      });
    }
  });

  // 4. Monthly Goals
  const monthKey = activeDate.substring(0, 7);
  const mGoals = state.monthly_goals?.[monthKey] || [];
  mGoals.forEach(mg => {
    if (mg.targetDate && mg.status !== 'Completed') {
      deadlines.push({
        id: `dl-mg-${mg.id}`,
        title: `Monthly Goal: ${mg.title}`,
        date: mg.targetDate,
        type: 'Monthly Goal Deadline',
        source: 'Monthly Roadmap',
        isOverdue: mg.targetDate < activeDate
      });
    }
  });

  deadlines.sort((a, b) => new Date(a.date) - new Date(b.date));
  return deadlines;
}

export function getGoalRiskDetection() {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const risks = [];

  // Inspect monthly goals
  const monthKey = activeDate.substring(0, 7);
  const mGoals = state.monthly_goals?.[monthKey] || [];
  const incompleteGoals = mGoals.filter(g => g.status !== 'Completed');

  const daysRemainingInMonth = 31 - parseInt(activeDate.split('-')[2], 10);
  if (incompleteGoals.length > 5 && daysRemainingInMonth <= 10) {
    risks.push({
      title: `${monthKey} Monthly Roadmap`,
      condition: `${incompleteGoals.length} incomplete goals with ${daysRemainingInMonth} days remaining in month.`,
      recommendation: 'Prioritize critical foundation topics and consider carrying forward optional items.'
    });
  }

  // Inspect overdue tasks
  const allDaily = state.daily_tasks || state.dailyTasks || [];
  const overdueTasks = allDaily.filter(t => t.date < activeDate && !t.completed && t.status !== 'Skipped');
  if (overdueTasks.length >= 3) {
    risks.push({
      title: 'Daily Execution Backlog',
      condition: `${overdueTasks.length} uncompleted tasks from previous days.`,
      recommendation: 'Use Catch-Up View to reschedule or mark completed.'
    });
  }

  return {
    risks,
    hasRisks: risks.length > 0
  };
}

// ==========================================
// 12. PLAN VS ACTUAL (Section 24)
// ==========================================

export function getPlanVsActual() {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';

  // Daily
  const allDaily = state.daily_tasks || state.dailyTasks || [];
  const todayTasks = allDaily.filter(t => t.date === activeDate);
  const todayCompleted = todayTasks.filter(t => t.completed).length;

  let todayPlannedMinutes = 0;
  todayTasks.forEach(t => todayPlannedMinutes += (t.durationMinutes || 30));
  let todayActualMinutes = 0;
  (state.studySessions || []).filter(s => s.date === activeDate).forEach(s => todayActualMinutes += (s.durationMinutes || 0));

  const dsaTargetToday = state.dsa_daily_targets?.[activeDate] || 2;
  const dsaSolvedToday = (state.dsa_problems || []).filter(p => p.date === activeDate && (p.status === 'Solved' || p.solved)).length;

  // Monthly
  const monthKey = activeDate.substring(0, 7);
  const mTargets = state.monthly_targets?.[monthKey] || { studyHours: 128, dsaProblems: 40 };
  const mMetrics = calculateMonthlyMetrics(monthKey, state);

  return {
    daily: {
      tasksPlanned: todayTasks.length,
      tasksCompleted: todayCompleted,
      studyHoursPlanned: Math.round((todayPlannedMinutes / 60) * 10) / 10,
      studyHoursActual: Math.round((todayActualMinutes / 60) * 10) / 10,
      dsaTarget: dsaTargetToday,
      dsaActual: dsaSolvedToday
    },
    monthly: {
      studyHoursTarget: mTargets.studyHours,
      studyHoursActual: mMetrics.studyHoursLogged,
      dsaTarget: mTargets.dsaProblems,
      dsaActual: mMetrics.dsaSolved,
      topicsCompleted: mMetrics.topicsCompleted,
      topicsRemaining: mMetrics.topicsRemaining
    }
  };
}

// ==========================================
// 13. CATCH-UP ENGINE (Section 25)
// ==========================================

export function getCatchUpItems() {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const allTasks = state.daily_tasks || state.dailyTasks || [];

  // Week boundaries
  const d = new Date(activeDate);
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const monStr = mon.toISOString().split('T')[0];
  const sunStr = sun.toISOString().split('T')[0];
  const monthKey = activeDate.substring(0, 7);

  const todayItems = allTasks.filter(t => t.date === activeDate && !t.completed);
  const thisWeekItems = allTasks.filter(t => t.date >= monStr && t.date <= sunStr && t.date !== activeDate && !t.completed);
  const thisMonthItems = allTasks.filter(t => t.date.startsWith(monthKey) && t.date > activeDate && !t.completed);
  const overdueItems = allTasks.filter(t => t.date < activeDate && !t.completed && t.status !== 'Skipped');

  return {
    today: todayItems,
    thisWeek: thisWeekItems,
    thisMonth: thisMonthItems,
    overdue: overdueItems,
    totalUnfinished: todayItems.length + thisWeekItems.length + thisMonthItems.length + overdueItems.length
  };
}

// ==========================================
// 14. AI STUDY PLANNER (Sections 26, 27, 28)
// ==========================================

export function generateDailyStudyPlan(availableHours = 4) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const brief = getTodayAiBrief();
  const totalMinutes = availableHours * 60;
  const schedule = [];
  let currentStartMinutes = 360; // 06:00 AM

  function formatTime(mins) {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  // 1. DSA Block (60-90 mins)
  const dsaMins = Math.min(90, Math.floor(totalMinutes * 0.3));
  if (dsaMins > 0) {
    const end = currentStartMinutes + dsaMins;
    schedule.push({
      slot: `${formatTime(currentStartMinutes)} – ${formatTime(end)}`,
      activity: brief.dsaTargetInfo ? `DSA Practice (${brief.dsaTargetInfo.remaining || 2} target)` : 'DSA Problem Solving',
      category: 'DSA',
      durationMinutes: dsaMins
    });
    currentStartMinutes = end + 15; // 15m break
  }

  // 2. Core Learning Block (60-120 mins)
  const learningMins = Math.min(120, Math.floor(totalMinutes * 0.35));
  if (learningMins > 0) {
    const end = currentStartMinutes + learningMins;
    schedule.push({
      slot: `${formatTime(currentStartMinutes)} – ${formatTime(end)}`,
      activity: brief.primaryTask ? brief.primaryTask.title : 'Prime 3.0 / Roadmap Foundations',
      category: 'AI/ML',
      durationMinutes: learningMins
    });
    currentStartMinutes = end + 15;
  }

  // 3. Project / Implementation Block (45-60 mins)
  const projectMins = Math.min(60, Math.floor(totalMinutes * 0.2));
  if (projectMins > 0) {
    const end = currentStartMinutes + projectMins;
    schedule.push({
      slot: `${formatTime(currentStartMinutes)} – ${formatTime(end)}`,
      activity: brief.projectTask ? brief.projectTask.title : 'Project Feature Development',
      category: 'Project',
      durationMinutes: projectMins
    });
    currentStartMinutes = end + 15;
  }

  // 4. Revision & Career Block (Remaining time)
  const revMins = Math.max(30, totalMinutes - (dsaMins + learningMins + projectMins));
  if (revMins > 0) {
    const end = currentStartMinutes + revMins;
    schedule.push({
      slot: `${formatTime(currentStartMinutes)} – ${formatTime(end)}`,
      activity: brief.revisionItem ? `Revision: ${brief.revisionItem.problem_title}` : 'Spaced Repetition & Daily Journal',
      category: 'Revision',
      durationMinutes: revMins
    });
  }

  const proposal = {
    id: uid('plan-day'),
    type: 'Day',
    targetDate: activeDate,
    availableHours,
    schedule,
    status: 'Proposed',
    created_at: new Date().toISOString()
  };

  return proposal;
}

// ==========================================
// 15. ACTION PROPOSAL & APPROVAL ENGINE (Sections 34, 35)
// ==========================================

export function createActionProposal(actionType, description, currentStateVal, proposedStateVal, executeFnKey, payload = {}) {
  const id = uid('prop');
  const proposal = {
    id,
    action_type: actionType,
    description,
    current_state: currentStateVal,
    proposed_state: proposedStateVal,
    execute_key: executeFnKey,
    payload,
    status: 'Pending',
    created_at: new Date().toISOString()
  };

  updateState(curr => ({
    ...curr,
    ai_action_proposals: [proposal, ...(curr.ai_action_proposals || [])]
  }));

  return proposal;
}

export function getActionProposals() {
  return getState().ai_action_proposals || [];
}

export function applyActionProposal(proposalId) {
  const state = getState();
  const proposal = (state.ai_action_proposals || []).find(p => p.id === proposalId);
  if (!proposal) return { success: false, error: 'Proposal not found' };

  // Execute the approved action safely
  let actionResult = null;
  if (proposal.execute_key === 'reschedule_task') {
    const { taskId, newDate } = proposal.payload;
    updateState(curr => {
      const list = (curr.daily_tasks || curr.dailyTasks || []).map(t => t.id === taskId ? { ...t, date: newDate } : t);
      return { ...curr, daily_tasks: list, dailyTasks: list };
    });
    actionResult = `Task rescheduled to ${newDate}`;
  } else if (proposal.execute_key === 'apply_study_plan') {
    // Save plan into ai_plans
    const plan = proposal.payload.plan;
    updateState(curr => ({
      ...curr,
      ai_plans: [plan, ...(curr.ai_plans || [])]
    }));
    actionResult = 'Study plan approved and saved';
  }

  // Update proposal status & log audit
  updateState(curr => {
    const proposals = (curr.ai_action_proposals || []).map(p =>
      p.id === proposalId ? { ...p, status: 'Applied', applied_at: new Date().toISOString() } : p
    );
    return { ...curr, ai_action_proposals: proposals };
  });

  logAiAction('ActionApproval', ['UserApproved'], proposal.description, true);

  return { success: true, result: actionResult };
}

export function cancelActionProposal(proposalId) {
  updateState(curr => {
    const proposals = (curr.ai_action_proposals || []).map(p =>
      p.id === proposalId ? { ...p, status: 'Cancelled' } : p
    );
    return { ...curr, ai_action_proposals: proposals };
  });
  return { success: true };
}

// ==========================================
// 16. AI MENTOR CONVERSATION ENGINE (Sections 29, 30, 31, 32, 33)
// ==========================================

export function getAiMentorConversations() {
  return getState().ai_conversations || [];
}

export function getAiMentorMessages(conversationId = 'conv-main') {
  const list = getState().ai_messages || [];
  return list.filter(m => m.conversation_id === conversationId).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

export function sendAiMentorMessage(userQuestion, conversationId = 'conv-main') {
  const state = getState();
  const perms = getAiDataPermissions();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const now = new Date().toISOString();

  // Record user message
  const userMsg = {
    id: uid('msg-u'),
    conversation_id: conversationId,
    sender: 'user',
    text: userQuestion,
    timestamp: now
  };

  updateState(curr => ({
    ...curr,
    ai_messages: [...(curr.ai_messages || []), userMsg]
  }));

  // Analyze question intent & retrieve factual context
  const q = userQuestion.toLowerCase();
  let shortAnswer = '';
  let why = '';
  let nextActions = [];
  const sources = [];

  if (q.includes('focus') || q.includes('do today') || q.includes('what should i do')) {
    sources.push('Daily Tasks', 'Roadmap', 'DSA');
    const brief = getTodayAiBrief();
    shortAnswer = brief.primaryTask
      ? `Focus primarily on: ${brief.primaryTask.title}, alongside your DSA practice target.`
      : 'You have cleared your main scheduled tasks for today.';
    why = brief.whyThisMatters;
    const nextList = getWhatShouldIDoNext();
    nextActions = nextList.actions.map(a => a.title);
  } else if (q.includes('dsa activity') || (q.includes('dsa') && q.includes('month'))) {
    sources.push('Phase 9 Advanced Analytics', 'Phase 5 DSA Tracker');
    const dsaAdv = getDsaDetailedAnalytics();
    shortAnswer = `This month you have ${dsaAdv.totalSolved} solved problem(s) out of ${dsaAdv.totalAttempted} attempted.`;
    why = `DSA consistency reflects ${dsaAdv.consistency.daysPracticed} active day(s) practiced with a current streak of ${dsaAdv.consistency.streak} day(s).`;
    nextActions = [
      'Maintain your daily DSA target',
      'Review pending revisions in queue'
    ];
  } else if (q.includes('october progress') || q.includes('progress this month') || q.includes('summarize my progress')) {
    sources.push('Phase 9 Progress Center', 'Monthly Engine');
    const monthRep = generateMonthlyProgressReport();
    shortAnswer = `In ${monthRep.month}, you completed ${monthRep.accomplished.topicsCompleted} topic(s) and logged ${monthRep.accomplished.studyHoursLogged} study hours.`;
    why = `Accomplished: ${monthRep.accomplished.dsaSolved} DSA solves, ${monthRep.accomplished.completedProjects} finished projects, and ${monthRep.accomplished.achievementsUnlocked} achievements unlocked.`;
    nextActions = [
      `Complete remaining ${monthRep.remains.topicsRemaining} topic(s) for the month`,
      'Continue active milestone development'
    ];
  } else if (q.includes('accomplish this week') || q.includes('this week progress') || (q.includes('what did i accomplish') && q.includes('week'))) {
    sources.push('Phase 9 Weekly Progress Report');
    const weekRep = generateWeeklyProgressReport();
    shortAnswer = `This week you logged ${weekRep.sections.study.hours} study hours across ${weekRep.sections.study.sessions} session(s).`;
    why = `You solved ${weekRep.sections.dsa.totalSolved} DSA problem(s) and maintained a ${weekRep.sections.habits.currentStreak}-day study streak.`;
    nextActions = [
      'Review remaining weekly goals in Sunday Review',
      'Prepare schedule for upcoming days'
    ];
  } else if (q.includes('project activity')) {
    sources.push('Phase 9 Project Analytics', 'Phase 6 Projects Hub');
    const pAdv = getProjectDetailedAnalytics();
    const topProj = pAdv.timelines[0];
    shortAnswer = `You have ${pAdv.totalProjects} project(s) tracked${topProj ? ` (including ${topProj.name})` : ''} with ${pAdv.totalHours} total project development hours logged.`;
    why = `Lifecycle status: ${pAdv.completedProjects} completed, ${pAdv.deployedProjects} deployed, and ${pAdv.portfolioReadyProjects} marked portfolio-ready.`;
    nextActions = pAdv.timelines.slice(0, 2).map(t => `Continue work on ${t.name} (${t.tasksCompleted}/${t.tasksCount} tasks done)`);
  } else if (q.includes('career preparation') || q.includes('career prep')) {
    sources.push('Phase 9 Career Analytics', 'Phase 7 Career Engine');
    const cAdv = getCareerDetailedAnalytics();
    shortAnswer = `Your career prep includes ${cAdv.totalApplications} application(s), ${cAdv.resumeCount} resume version(s), and ${cAdv.mockInterviewCount} mock interview(s).`;
    why = `Application pipeline: ${cAdv.pipeline.Applied} applied, ${cAdv.pipeline.Assessment} assessments, and ${cAdv.pipeline.Interview} interviews in progress.`;
    nextActions = [
      'Follow up on active applications',
      'Practice technical interview question bank'
    ];
  } else if (q.includes('dsa') || q.includes('problems')) {
    sources.push('Phase 5 DSA Tracker');
    const dsaInt = getDsaIntelligence();
    if (!dsaInt.available) {
      shortAnswer = dsaInt.message;
      why = 'No problem submissions recorded yet.';
      nextActions = ['Solve Two Sum on LeetCode', 'Log problem in DSA tracker'];
    } else {
      shortAnswer = `You have solved ${dsaInt.totalSolved} problems total (${dsaInt.independentSolves} independently).`;
      why = `Current revision queue has ${dsaInt.revisions.today.length} problem(s) due today and ${dsaInt.revisions.overdue.length} overdue.`;
      nextActions = [
        'Complete today\'s DSA daily target',
        ...dsaInt.revisions.today.map(r => `Revise ${r.problem_title}`),
        dsaInt.mistakeSuggestion
      ];
    }
  } else if (q.includes('project') || q.includes('building')) {
    sources.push('Phase 6 Projects Hub');
    const pInt = getProjectIntelligence();
    if (!pInt.available) {
      shortAnswer = pInt.message;
      why = 'Project registry has no active projects.';
      nextActions = ['Create a new project in Projects Hub'];
    } else {
      const topRec = pInt.projectRecommendations[0];
      shortAnswer = `You have ${pInt.activeProjectsCount} active project(s) and ${pInt.portfolioReadyCount} portfolio-ready project(s).`;
      why = topRec ? `${topRec.name} is currently ${topRec.status} (${topRec.progress}% completed).` : 'Projects are on schedule.';
      nextActions = pInt.projectRecommendations.map(r => `${r.name}: ${r.nextAction}`);
    }
  } else if (q.includes('career') || q.includes('internship') || q.includes('application')) {
    sources.push('Phase 7 Career Engine');
    const cInt = getCareerIntelligence();
    const appStats = getApplicationStats();
    shortAnswer = `You have logged ${appStats.total} application(s) and tracked ${cInt.upcomingCareerActions.length} upcoming career action(s).`;
    why = `Profile setup: ${cInt.profileSetup.resumeRemaining} resume items and ${cInt.profileSetup.linkedinRemaining} LinkedIn items remaining.`;
    nextActions = cInt.upcomingCareerActions.map(a => a.title);
    if (nextActions.length === 0) nextActions = ['Update Resume Version', 'Review Application Kanban'];
  } else if (q.includes('overdue') || q.includes('behind')) {
    sources.push('Daily Tasks', 'Deadline Radar');
    const catchup = getCatchUpItems();
    shortAnswer = catchup.overdue.length > 0
      ? `You have ${catchup.overdue.length} overdue task(s) from previous days.`
      : 'You have zero overdue tasks.';
    why = catchup.overdue.length > 0
      ? 'Tasks were carried forward without explicit completion or rescheduling.'
      : 'All historical daily tasks have been completed or rescheduled.';
    nextActions = catchup.overdue.slice(0, 3).map(t => `Reschedule or complete: ${t.title}`);
  } else if (q.includes('revise') || q.includes('revision')) {
    sources.push('Phase 5 DSA Revisions', 'Revision Queue');
    const dsaInt = getDsaIntelligence();
    const revs = dsaInt.revisions ? [...dsaInt.revisions.overdue, ...dsaInt.revisions.today] : [];
    shortAnswer = revs.length > 0
      ? `You have ${revs.length} item(s) awaiting revision.`
      : 'Your revision queue is currently clear.';
    why = 'Spaced repetition schedule preserves algorithmic recall on completed patterns.';
    nextActions = revs.slice(0, 3).map(r => `Practice ${r.problem_title} (${r.pattern})`);
  } else {
    // Default contextual answer
    sources.push('System State');
    shortAnswer = `I inspected your current records for ${activeDate}.`;
    why = 'Everything is synchronized with your active database.';
    const nextList = getWhatShouldIDoNext();
    nextActions = nextList.actions.map(a => a.title);
  }

  // Mentor response structure (Section 31, 32)
  const mentorMsg = {
    id: uid('msg-m'),
    conversation_id: conversationId,
    sender: 'mentor',
    text: `${shortAnswer}\n\nWhy: ${why}\n\nNext Actions:\n${nextActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`,
    format: {
      short_answer: shortAnswer,
      why,
      next_actions: nextActions
    },
    data_sources: sources,
    date_range: activeDate,
    timestamp: new Date().toISOString()
  };

  updateState(curr => ({
    ...curr,
    ai_messages: [...(curr.ai_messages || []), mentorMsg]
  }));

  logAiAction('MentorChat', sources, userQuestion, true);

  return mentorMsg;
}

// ==========================================
// 17. WEEKLY & MONTHLY REVIEWS (Sections 15, 17)
// ==========================================

export function generateWeeklyAiReview() {
  const state = getState();
  const perms = getAiDataPermissions();
  const activeDate = state.user?.activeDate || '2026-10-01';

  // Determine week range
  const d = new Date(activeDate);
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const monStr = mon.toISOString().split('T')[0];
  const sunStr = sun.toISOString().split('T')[0];

  const weekTasks = (state.daily_tasks || state.dailyTasks || []).filter(t => t.date >= monStr && t.date <= sunStr);
  const completedTasks = weekTasks.filter(t => t.completed);
  const missedTasks = weekTasks.filter(t => !t.completed && t.date < activeDate);

  const weekDsa = (state.dsa_problems || []).filter(p => p.date >= monStr && p.date <= sunStr);
  const weekDsaSolved = weekDsa.filter(p => p.status === 'Solved' || p.solved).length;

  const weekSessions = (state.studySessions || []).filter(s => s.date >= monStr && s.date <= sunStr);
  const totalMins = weekSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalHours = Math.round((totalMins / 60) * 10) / 10;

  const weekApps = (state.applications || []).filter(a => a.date_applied >= monStr && a.date_applied <= sunStr).length;

  return {
    weekRange: `${monStr} → ${sunStr}`,
    completed: {
      tasksCount: completedTasks.length,
      studyHours: totalHours,
      dsaSolved: weekDsaSolved,
      applications: weekApps
    },
    missed: {
      tasksCount: missedTasks.length,
      tasks: missedTasks.slice(0, 5).map(t => t.title)
    },
    reflectionPrompts: {
      what_went_well: '',
      what_was_difficult: '',
      what_should_change: ''
    }
  };
}

export function generateMonthlyAiReview(monthKey = '2026-10') {
  const state = getState();
  const mMetrics = calculateMonthlyMetrics(monthKey, state);

  return {
    monthKey,
    completed: {
      studyHours: mMetrics.studyHoursLogged,
      targetHours: mMetrics.studyHoursTarget,
      dsaSolved: mMetrics.dsaSolved,
      dsaTarget: mMetrics.dsaTarget,
      topicsCompleted: mMetrics.topicsCompleted
    },
    incomplete: {
      topicsRemaining: mMetrics.topicsRemaining,
      needsAttentionCount: mMetrics.needsAttentionTopics.length
    },
    needsAttention: mMetrics.needsAttentionTopics,
    nextMonthFocus: state.monthly_priorities?.[monthKey] || { primary: 'DSA Foundations & Algorithms' }
  };
}

// ==========================================
// 18. DISMISS & RESTORE INSIGHTS (Sections 36, 37)
// ==========================================

export function dismissInsight(insightId) {
  updateState(curr => {
    const list = (curr.ai_insights || []).map(i => i.id === insightId ? { ...i, dismissed: true } : i);
    return { ...curr, ai_insights: list };
  });
  return true;
}

export function restoreInsight(insightId) {
  updateState(curr => {
    const list = (curr.ai_insights || []).map(i => i.id === insightId ? { ...i, dismissed: false } : i);
    return { ...curr, ai_insights: list };
  });
  return true;
}

export function getAiInsightsHistory() {
  return getState().ai_insights || [];
}

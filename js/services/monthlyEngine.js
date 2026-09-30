/**
 * Akshay's 12-Month AI/ML Career OS - Monthly Planning & Review Engine (Phase 4)
 * 
 * Functional Responsibilities:
 * - Aggregates Daily Execution + Weekly Performance into Monthly Performance
 * - Derives all metrics from actual stored data (zero fake scores)
 * - Independent tracking of Track A (Prime 3.0) and Track B (Individual Roadmap)
 * - Up-to-date topic status: Not Started, Learning, Practicing, Completed, Needs Revision, Carried Forward
 * - Monthly targets management (Default vs Custom)
 * - Monthly week breakdown (Weeks 1-5)
 * - Monthly Calendar Grid (Completed, Partial, Missed, No Data) & Activity Heatmap (No, Low, Med, High)
 * - Monthly Study, DSA, Prime 3.0, Individual Roadmap, and Project Analytics
 * - Upcoming Deadlines & Neutral "Needs Attention" At-Risk System
 * - Month-End Review (10 Reflection Questions + Auto Summary + Free-text Reflection)
 * - Next Month Planning with strictly enforced priority caps (1 Primary, 2 Secondary, 3 Optional)
 * - Progress Flow: Roadmap Topic -> Monthly Goal -> Weekly Goal -> Daily Task -> Daily Completion -> Weekly Progress -> Monthly Progress
 */

import { getState, updateState } from '../data/storage.js';
import { calculateStreaks } from './streakService.js';
import { updateRoadmapTopic } from './roadmapEngine.js';

/**
 * Computes all real concrete metrics for a specific month
 */
export function calculateMonthlyMetrics(monthKey, state = getState()) {
  if (!monthKey) {
    const activeDate = state.user?.activeDate || '2026-10-01';
    monthKey = activeDate.substring(0, 7);
  }

  const activeDate = state.user?.activeDate || '2026-10-01';
  const [yearStr, monthNumStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const monthIndex = parseInt(monthNumStr, 10) - 1;

  // Month date range
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startDateStr = `${monthKey}-01`;
  const endDateStr = `${monthKey}-${String(daysInMonth).padStart(2, '0')}`;

  // Find roadmap month record
  const allMonths = state.roadmap_months || state.roadmapMonths || [];
  const roadmapMonth = allMonths.find(m => m.monthKey === monthKey || m.id === `month-${monthKey}`) || allMonths[0] || {
    id: `month-${monthKey}`,
    month: 'October',
    year: 2026,
    monthKey: '2026-10',
    title: 'Programming + Developer Foundations',
    status: 'Current'
  };

  // Topics in this month from Phase 2 roadmap
  const allTopics = state.roadmap_topics || [];
  const monthTopics = allTopics.filter(t => t.month_id === roadmapMonth.id);

  // Targets: default vs custom
  const savedTargets = state.monthly_targets?.[monthKey] || state.monthlyTargets?.[monthKey];
  const defaultTargets = {
    studyHours: 128,
    dsaProblems: 40,
    primeSessions: 20,
    individualSessions: 20,
    projectSessions: 8,
    revisionSessions: 8,
    isCustom: false
  };
  const targets = savedTargets ? { ...defaultTargets, ...savedTargets } : defaultTargets;

  // Study sessions in this month
  const studySessions = (state.studySessions || []).filter(s => s.date && s.date.startsWith(monthKey));
  const totalStudyMinutes = studySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

  // Track hours breakdown
  const hoursDistribution = {
    prime: 0,
    individual: 0,
    dsa: 0,
    project: 0,
    revision: 0,
    other: 0
  };
  const sessionsCount = {
    prime: 0,
    individual: 0,
    dsa: 0,
    project: 0,
    revision: 0
  };

  studySessions.forEach(s => {
    const hrs = (s.durationMinutes || 0) / 60;
    const cat = s.category || s.track || '';
    if (cat.includes('Prime')) {
      hoursDistribution.prime += hrs;
      sessionsCount.prime++;
    } else if (cat.includes('Individual') || cat.includes('Roadmap')) {
      hoursDistribution.individual += hrs;
      sessionsCount.individual++;
    } else if (cat.includes('DSA')) {
      hoursDistribution.dsa += hrs;
      sessionsCount.dsa++;
    } else if (cat.includes('Project')) {
      hoursDistribution.project += hrs;
      sessionsCount.project++;
    } else if (cat.includes('Revision')) {
      hoursDistribution.revision += hrs;
      sessionsCount.revision++;
    } else {
      hoursDistribution.other += hrs;
    }
  });

  Object.keys(hoursDistribution).forEach(k => {
    hoursDistribution[k] = Math.round(hoursDistribution[k] * 10) / 10;
  });

  // Days studied vs days missed
  const studiedDates = new Set(studySessions.filter(s => (s.durationMinutes || 0) > 0).map(s => s.date));
  const daysStudied = studiedDates.size;

  let daysElapsed = daysInMonth;
  if (monthKey === activeDate.substring(0, 7)) {
    daysElapsed = parseInt(activeDate.substring(8, 10), 10);
  }
  const daysMissed = Math.max(0, daysElapsed - daysStudied);
  const avgHoursPerDay = daysElapsed > 0 ? (totalStudyHours / daysElapsed).toFixed(1) : '0.0';
  const avgHoursPerStudyDay = daysStudied > 0 ? (totalStudyHours / daysStudied).toFixed(1) : '0.0';

  // Streaks
  const streakInfo = calculateStreaks(state);

  // Daily Tasks aggregation in this month
  const monthDailyTasks = (state.dailyTasks || state.daily_tasks || []).filter(t => t.date && t.date.startsWith(monthKey));
  const tasksCompleted = monthDailyTasks.filter(t => t.completed).length;
  const tasksSkipped = monthDailyTasks.filter(t => t.status === 'Skipped' || t.skipped).length;

  // Individual Roadmap Topic Status Breakdown (Section 4 & 13)
  let topicsCompleted = 0;
  let topicsLearning = 0;
  let topicsPracticing = 0;
  let topicsNeedsRevision = 0;
  let topicsCarriedForward = 0;
  let topicsNotStarted = 0;

  monthTopics.forEach(t => {
    const st = t.status || 'Not Started';
    if (st === 'Completed' || t.progress === 100) topicsCompleted++;
    else if (st === 'Needs Revision') topicsNeedsRevision++;
    else if (st === 'Carried Forward') topicsCarriedForward++;
    else if (st === 'Practicing') topicsPracticing++;
    else if (st === 'Learning') topicsLearning++;
    else topicsNotStarted++;
  });

  const topicsInProgress = topicsLearning + topicsPracticing;
  const topicsRemaining = topicsNotStarted + topicsNeedsRevision;
  const roadmapProgressPct = monthTopics.length > 0
    ? Math.round(monthTopics.reduce((acc, t) => acc + (t.progress ?? (t.status === 'Completed' ? 100 : 0)), 0) / monthTopics.length)
    : 0;

  // Track A: Prime 3.0 Monthly Summary (Section 12)
  const primeTopics = state.prime_topics || [];
  const primeModules = state.prime_modules || [];
  const primeLessons = state.primeLessons || {};
  let primeLessonsCompletedThisMonth = 0;
  Object.values(primeLessons).forEach(l => {
    if (l.dateUpdated && l.dateUpdated.startsWith(monthKey) && (l.status === 'Mastered' || l.status === 'Applied' || l.understood)) {
      primeLessonsCompletedThisMonth++;
    }
  });

  const primeCompletedTopics = primeTopics.filter(t => t.status === 'Completed' || t.progress === 100).length;
  const primeOverallPct = primeTopics.length > 0 ? Math.round((primeCompletedTopics / primeTopics.length) * 100) : 0;
  const currentPrimeTopic = primeTopics.find(t => t.status === 'Learning') || primeTopics.find(t => t.status === 'Not Started') || primeTopics[0];
  const nextPrimeTopic = primeTopics.find(t => t.status === 'Not Started') || primeTopics[1];

  // DSA Monthly Summary (Section 20)
  const allProbs = state.dsa_problems || state.dsaProblems || [];
  const monthDsa = allProbs.filter(p => (p.date && p.date.startsWith(monthKey)) || (p.date_solved && p.date_solved.startsWith(monthKey)));
  const dsaAttempted = monthDsa.length;
  const dsaSolved = monthDsa.filter(p => p.status === 'Solved' || p.solved).length;
  const dsaIndependent = monthDsa.filter(p => (p.status === 'Solved' || p.solved) && (p.solution_type === 'Solved independently' || !p.solution_type)).length;
  const dsaNeedingRevision = monthDsa.filter(p => p.needs_revision || p.revisionRequired || p.revision_required).length;

  const dsaDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
  const dsaTopicsMap = {};
  monthDsa.forEach(p => {
    if (p.difficulty && dsaDifficulty[p.difficulty] !== undefined) {
      dsaDifficulty[p.difficulty]++;
    }
    const top = p.topic || 'General';
    dsaTopicsMap[top] = (dsaTopicsMap[top] || 0) + 1;
  });

  // Projects Monthly Summary (Phase 6 - Section 17, 57)
  const allMilestones = state.project_milestones || [];
  const allDeployments = state.project_deployments || [];
  const activeProjects = (state.projects || []).map(p => {
    const projTasks = (state.project_tasks || []).filter(t => t.project_id === p.id);
    const legacyTasks = p.tasks || [];
    const tasksSource = projTasks.length > 0 ? projTasks : legacyTasks;
    const completedTasksCount = tasksSource.filter(t => t.completed || t.status === 'Completed').length;
    const projMilestones = allMilestones.filter(m => m.project_id === p.id);
    const completedMilestonesCount = projMilestones.filter(m => m.status === 'Completed').length;
    const projDeployments = allDeployments.filter(d => d.project_id === p.id);

    const projSessions = studySessions.filter(s => s.category === 'Project' && (s.related_project_id === p.id || s.topic?.includes(p.title) || s.topic?.includes(p.name)));
    const projHours = Math.round((projSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) / 60) * 10) / 10;
    return {
      id: p.id,
      title: p.title || p.name,
      description: p.description,
      status: p.status || 'Planned',
      progress: p.progress || Math.round((completedTasksCount / Math.max(1, tasksSource.length)) * 100),
      sessions: projSessions.length,
      hours: projHours,
      tasksCompleted: completedTasksCount,
      totalTasks: tasksSource.length,
      milestonesCompleted: completedMilestonesCount,
      totalMilestones: projMilestones.length,
      deploymentsCount: projDeployments.length
    };
  });

  // Upcoming Deadlines (Section 15)
  const deadlines = [];
  monthTopics.forEach(t => {
    if (t.target_date) {
      const targetTime = new Date(t.target_date).getTime();
      const activeTime = new Date(activeDate).getTime();
      const diffDays = Math.ceil((targetTime - activeTime) / (1000 * 60 * 60 * 24));
      const isOverdue = diffDays < 0 && t.status !== 'Completed' && t.progress !== 100;
      deadlines.push({
        id: t.id,
        name: t.name,
        targetDate: t.target_date,
        progress: t.progress || (t.status === 'Completed' ? 100 : 0),
        status: t.status || 'Not Started',
        daysRemaining: diffDays,
        isOverdue
      });
    }
  });
  // Sort by closest target date
  deadlines.sort((a, b) => a.daysRemaining - b.daysRemaining);

  // "Needs Attention" At-Risk System (Section 16)
  const needsAttentionTopics = [];
  monthTopics.forEach(t => {
    const progress = t.progress || (t.status === 'Completed' ? 100 : 0);
    const isCompleted = t.status === 'Completed' || progress === 100;
    if (isCompleted || t.status === 'Not Required') return;

    let reason = '';
    if (t.status === 'Needs Revision') {
      reason = 'Marked Needs Revision';
    } else if (t.target_date) {
      const diffDays = Math.ceil((new Date(t.target_date) - new Date(activeDate)) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        reason = `Overdue by ${Math.abs(diffDays)} day(s)`;
      } else if (diffDays <= 3 && progress < 50) {
        reason = `Approaching target date (${diffDays}d left, ${progress}% done)`;
      }
    }

    if (reason) {
      needsAttentionTopics.push({
        id: t.id,
        name: t.name,
        targetDate: t.target_date || 'N/A',
        progress,
        status: t.status,
        reason
      });
    }
  });

  // Week Breakdown (Section 7)
  const weeksBreakdown = [];
  const weekRanges = [
    { num: 1, startDay: 1, endDay: 7, label: `Week 1: ${roadmapMonth.month?.substring(0, 3) || 'Oct'} 01 → 07` },
    { num: 2, startDay: 8, endDay: 14, label: `Week 2: ${roadmapMonth.month?.substring(0, 3) || 'Oct'} 08 → 14` },
    { num: 3, startDay: 15, endDay: 21, label: `Week 3: ${roadmapMonth.month?.substring(0, 3) || 'Oct'} 15 → 21` },
    { num: 4, startDay: 22, endDay: 28, label: `Week 4: ${roadmapMonth.month?.substring(0, 3) || 'Oct'} 22 → 28` }
  ];
  if (daysInMonth > 28) {
    weekRanges.push({ num: 5, startDay: 29, endDay: daysInMonth, label: `Week 5: ${roadmapMonth.month?.substring(0, 3) || 'Oct'} 29 → ${daysInMonth}` });
  }

  weekRanges.forEach(w => {
    const wStart = `${monthKey}-${String(w.startDay).padStart(2, '0')}`;
    const wEnd = `${monthKey}-${String(w.endDay).padStart(2, '0')}`;

    const wSessions = studySessions.filter(s => s.date >= wStart && s.date <= wEnd);
    const wHours = Math.round((wSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0) / 60) * 10) / 10;
    const wTasks = monthDailyTasks.filter(t => t.date >= wStart && t.date <= wEnd);
    const wTasksDone = wTasks.filter(t => t.completed).length;
    const wTasksMissed = wTasks.filter(t => t.status === 'Skipped' || (!t.completed && t.date < activeDate)).length;
    const wDsa = monthDsa.filter(p => p.date >= wStart && p.date <= wEnd && (p.status === 'Solved' || p.solved)).length;
    const wPrimeSessions = wSessions.filter(s => s.category === 'Prime 3.0').length;
    const wIndivSessions = wSessions.filter(s => s.category === 'Individual Learning').length;
    const wProjSessions = wSessions.filter(s => s.category === 'Project').length;

    const wTargetHours = w.num === 5 ? (daysInMonth - 28) * 4 : 32;
    const wCompletionPct = Math.min(100, Math.round((wHours / Math.max(1, wTargetHours)) * 100));

    weeksBreakdown.push({
      weekNum: w.num,
      label: w.label,
      startDate: wStart,
      endDate: wEnd,
      studyHours: wHours,
      targetHours: wTargetHours,
      tasksCompleted: wTasksDone,
      tasksMissed: wTasksMissed,
      dsaSolved: wDsa,
      primeSessions: wPrimeSessions,
      indivSessions: wIndivSessions,
      projectSessions: wProjSessions,
      completionPct: wCompletionPct
    });
  });

  // Monthly Calendar & Heatmap (Section 8 & 9)
  const calendarDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${monthKey}-${String(d).padStart(2, '0')}`;
    const dSessions = studySessions.filter(s => s.date === dayStr);
    const dMinutes = dSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const dHours = Math.round((dMinutes / 60) * 10) / 10;
    const dTasks = monthDailyTasks.filter(t => t.date === dayStr);
    const dDsa = monthDsa.filter(p => p.date === dayStr);

    let status = 'no-data';
    const isPast = dayStr <= activeDate;
    const hasCompletedTasks = dTasks.some(t => t.completed);
    const hasSkippedTasks = dTasks.some(t => t.skipped || t.status === 'Skipped');

    if (dHours >= 3 || (dHours > 0 && hasCompletedTasks)) {
      status = 'completed';
    } else if (dHours > 0 || hasCompletedTasks) {
      status = 'partial';
    } else if (isPast && (hasSkippedTasks || dTasks.length > 0)) {
      status = 'missed';
    } else if (isPast && dHours === 0) {
      status = 'missed';
    }

    let activityLevel = 'no';
    if (dMinutes >= 240) activityLevel = 'high';
    else if (dMinutes >= 120) activityLevel = 'medium';
    else if (dMinutes > 0) activityLevel = 'low';

    calendarDays.push({
      day: d,
      date: dayStr,
      status,
      activityLevel,
      hours: dHours,
      minutes: dMinutes,
      tasksCount: dTasks.length,
      tasksDone: dTasks.filter(t => t.completed).length,
      dsaSolved: dDsa.filter(p => p.status === 'Solved' || p.solved).length,
      sessionsCount: dSessions.length,
      isToday: dayStr === activeDate
    });
  }

  // Monthly Status (Section 27 & 28)
  let monthlyStatus = 'Upcoming';
  const activeMonthKey = activeDate.substring(0, 7);
  if (topicsCompleted === monthTopics.length && monthTopics.length > 0) {
    monthlyStatus = 'Completed';
  } else if (monthKey === activeMonthKey) {
    if (needsAttentionTopics.length >= 2 || totalStudyHours < (daysElapsed * 2)) {
      monthlyStatus = 'Needs Attention';
    } else if (totalStudyHours >= (daysElapsed * 3) || roadmapProgressPct >= 50) {
      monthlyStatus = 'On Track';
    } else {
      monthlyStatus = 'Current';
    }
  } else if (monthKey < activeMonthKey) {
    monthlyStatus = topicsCompleted === monthTopics.length ? 'Completed' : 'Needs Attention';
  } else {
    monthlyStatus = 'Upcoming';
  }

  return {
    monthKey,
    startDateStr,
    endDateStr,
    daysInMonth,
    daysElapsed,
    activeDate,
    roadmapMonth,
    monthlyStatus,
    targets,
    // Concrete Progress Metrics (No single fake score)
    studyHoursLogged: totalStudyHours,
    studyHoursTarget: targets.studyHours,
    primeProgressPct: primeOverallPct,
    individualRoadmapPct: roadmapProgressPct,
    dsaSolved,
    dsaTarget: targets.dsaProblems,
    activeProjectsCount: activeProjects.length,
    // Detailed Breakdowns
    hoursDistribution,
    sessionsCount,
    daysStudied,
    daysMissed,
    avgHoursPerDay,
    avgHoursPerStudyDay,
    streaks: streakInfo,
    tasksCompleted,
    tasksSkipped,
    // Topic Stats
    monthTopics,
    topicsCompleted,
    topicsInProgress,
    topicsRemaining,
    topicsNeedsRevision,
    topicsCarriedForward,
    topicsNotStarted,
    // Tracks
    primeSummary: {
      lessonsCompletedThisMonth: primeLessonsCompletedThisMonth,
      completedTopics: primeCompletedTopics,
      totalTopics: primeTopics.length,
      overallPct: primeOverallPct,
      currentTopic: currentPrimeTopic?.name || 'Python Foundations',
      nextTopic: nextPrimeTopic?.name || 'Linear Algebra',
      studyHours: hoursDistribution.prime
    },
    dsaSummary: {
      attempted: dsaAttempted,
      solved: dsaSolved,
      independent: dsaIndependent,
      needingRevision: dsaNeedingRevision,
      difficulty: dsaDifficulty,
      topicsMap: dsaTopicsMap,
      target: targets.dsaProblems
    },
    projectsSummary: activeProjects,
    deadlines,
    needsAttentionTopics,
    weeksBreakdown,
    calendarDays
  };
}

/**
 * SECTION 23: Save Custom Monthly Targets
 */
export function saveMonthlyTargets(monthKey, targetUpdates) {
  return updateState(curr => {
    const existing = curr.monthly_targets?.[monthKey] || {};
    const updated = {
      ...existing,
      ...targetUpdates,
      isCustom: true
    };
    return {
      ...curr,
      monthly_targets: {
        ...(curr.monthly_targets || {}),
        [monthKey]: updated
      },
      monthlyTargets: {
        ...(curr.monthlyTargets || {}),
        [monthKey]: updated
      }
    };
  });
}

/**
 * SECTION 4 & 17: Update Topic Status & Target Date
 */
export function updateMonthlyTopicStatus(topicId, newStatus, targetDate = null, notes = '', destinationMonthId = null) {
  const updates = { status: newStatus };
  if (targetDate) updates.target_date = targetDate;
  if (notes) updates.notes = notes;

  if (newStatus === 'Completed') {
    updates.progress = 100;
    updates.completion_date = new Date().toISOString().split('T')[0];
  } else if (newStatus === 'Not Started') {
    updates.progress = 0;
    updates.completion_date = null;
  } else if (newStatus === 'Learning' || newStatus === 'Practicing') {
    updates.progress = 50;
    updates.completion_date = null;
  } else if (newStatus === 'Carried Forward') {
    updates.carried_forward_to = destinationMonthId;
  }

  // Update in roadmap_topics (Phase 2 relational table)
  updateRoadmapTopic(topicId, updates);

  // Record audit log in monthly_topic_status
  updateState(curr => {
    const logs = [...(curr.monthly_topic_status?.[topicId] || [])];
    logs.push({
      date: new Date().toISOString().split('T')[0],
      status: newStatus,
      targetDate,
      notes,
      destinationMonthId
    });

    const reschedules = [...(curr.monthly_reschedules || [])];
    if (newStatus === 'Carried Forward' && destinationMonthId) {
      reschedules.push({
        id: `resched-${Date.now()}`,
        topicId,
        destinationMonthId,
        date: new Date().toISOString().split('T')[0]
      });
    }

    return {
      ...curr,
      monthly_topic_status: {
        ...(curr.monthly_topic_status || {}),
        [topicId]: logs
      },
      monthly_reschedules: reschedules
    };
  });
}

/**
 * SECTION 17: Carry Forward Topic to Next Month
 */
export function carryForwardTopic(topicId, currentMonthId, destinationMonthId) {
  updateMonthlyTopicStatus(topicId, 'Carried Forward', null, `Carried forward to ${destinationMonthId}`, destinationMonthId);
}

/**
 * SECTION 18 & 19: Save Month-End Review & Automatic Summary
 */
export function saveMonthlyReview(reviewData) {
  return updateState(curr => {
    const prevReviews = (curr.monthly_reviews || []).filter(r => r.monthKey !== reviewData.monthKey);
    const newRecord = {
      ...reviewData,
      id: `m-rev-${reviewData.monthKey}-${Date.now()}`,
      savedAt: new Date().toISOString()
    };
    return {
      ...curr,
      monthly_reviews: [...prevReviews, newRecord],
      monthlyReviews: [...prevReviews, newRecord]
    };
  });
}

/**
 * SECTION 21 & 22: Save Next Month Priorities (Caps: 1 Primary, 2 Secondary, 3 Optional)
 */
export function saveNextMonthPriorities(monthKey, { primary, secondary = [], optional = [] }) {
  // Enforce caps strictly
  const validatedPrimary = primary || null;
  const validatedSecondary = (Array.isArray(secondary) ? secondary : [secondary]).filter(Boolean).slice(0, 2);
  const validatedOptional = (Array.isArray(optional) ? optional : [optional]).filter(Boolean).slice(0, 3);

  return updateState(curr => ({
    ...curr,
    monthly_priorities: {
      ...(curr.monthly_priorities || {}),
      [monthKey]: {
        primary: validatedPrimary,
        secondary: validatedSecondary,
        optional: validatedOptional,
        updatedAt: new Date().toISOString()
      }
    }
  }));
}

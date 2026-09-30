/**
 * Akshay's 12-Month AI/ML Career OS - Progress & Achievements Engine (Phase 9)
 * 
 * Strict Phase 9 Rules:
 * - Real application data only (NEVER fabricate progress, study hours, or outcomes)
 * - No fake "career readiness score" or arbitrary single scores (Section 3)
 * - No outcome predictions or company rankings (Section 16)
 * - Gamification rewards consistency, never unhealthy overwork (Section 26, 64)
 * - Explicit empty states ("No study sessions recorded yet.", etc.) when no data exists (Section 62)
 * - Human-in-the-loop: no automatic destructive actions; all edits require user action (Section 44)
 */

import { getState, updateState } from '../data/storage.js';
import { calculateStreaks } from './streakService.js';
import { calculateDsaAnalytics } from './dsaEngine.js';
import { calculateProjectMetrics, getProjects } from './projectEngine.js';
import {
  getApplicationStats,
  getResumeVersions,
  getUpcomingActions,
  getAptitudeStats,
  getTechnicalTopics,
  getMockInterviews,
  getInterviewQuestions
} from './careerEngine.js';
import { calculateMonthlyMetrics } from './monthlyEngine.js';
import { INDIVIDUAL_ROADMAP_MONTHS } from '../data/curriculum.js';

let seqCounter = 0;
function uid(prefix = 'p9') {
  seqCounter += 1;
  return `${prefix}-${Date.now()}-${seqCounter}-${Math.random().toString(36).substring(2, 6)}`;
}

// ==========================================
// 1. DATE RANGE UTILITIES (Section 4, 39)
// ==========================================

export function parseDateFilter(period = '30d', customStart = null, customEnd = null, activeDate = '2026-10-01') {
  const refDate = new Date(activeDate);
  let startDate = new Date(refDate);
  let endDate = new Date(refDate);

  if (period === '7d') {
    startDate.setDate(refDate.getDate() - 6);
  } else if (period === '30d') {
    startDate.setDate(refDate.getDate() - 29);
  } else if (period === '90d') {
    startDate.setDate(refDate.getDate() - 89);
  } else if (period === 'year') {
    const year = refDate.getFullYear();
    startDate = new Date(`${year}-01-01`);
    endDate = new Date(`${year}-12-31`);
  } else if (period === 'custom' && customStart && customEnd) {
    startDate = new Date(customStart);
    endDate = new Date(customEnd);
  }

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  return { startStr, endStr, period };
}

function isDateInRange(dateStr, startStr, endStr) {
  if (!dateStr) return false;
  return dateStr >= startStr && dateStr <= endStr;
}

// ==========================================
// 2. OVERALL PROGRESS & STUDY TIME (Sections 3, 4, 5, 6)
// ==========================================

export function getStudyTimeAnalytics(period = '30d', customStart = null, customEnd = null) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const { startStr, endStr } = parseDateFilter(period, customStart, customEnd, activeDate);

  const sessions = state.studySessions || [];
  const inRangeSessions = sessions.filter(s => isDateInRange(s.date, startStr, endStr));

  // Category breakdown
  let dsaMins = 0;
  let aimlMins = 0;
  let progMins = 0;
  let projMins = 0;
  let careerMins = 0;
  let otherMins = 0;

  inRangeSessions.forEach(s => {
    const mins = Number(s.durationMinutes) || 0;
    const cat = s.category || s.track || 'Other';
    if (cat === 'DSA') dsaMins += mins;
    else if (cat === 'Prime 3.0' || cat === 'AI/ML') aimlMins += mins;
    else if (cat === 'Programming' || cat === 'Roadmap' || cat === 'Individual') progMins += mins;
    else if (cat === 'Project') projMins += mins;
    else if (cat === 'Career') careerMins += mins;
    else otherMins += mins;
  });

  const totalMins = dsaMins + aimlMins + progMins + projMins + careerMins + otherMins;

  // Horizon aggregates: Today, This week, This month, This year
  const activeYear = activeDate.substring(0, 4);
  const activeMonth = activeDate.substring(0, 7);

  // Today
  const todayMins = sessions
    .filter(s => s.date === activeDate)
    .reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);

  // This Week (last 7 days from activeDate)
  const weekRange = parseDateFilter('7d', null, null, activeDate);
  const thisWeekMins = sessions
    .filter(s => isDateInRange(s.date, weekRange.startStr, weekRange.endStr))
    .reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);

  // This Month
  const thisMonthMins = sessions
    .filter(s => s.date && s.date.startsWith(activeMonth))
    .reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);

  // This Year
  const thisYearMins = sessions
    .filter(s => s.date && s.date.startsWith(activeYear))
    .reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);

  // Daily Chart series for current filter range
  const dailySeries = [];
  const curr = new Date(startStr);
  const stop = new Date(endStr);
  // Cap chart days to 31 max to avoid overcrowded SVG
  const dayStep = Math.max(1, Math.ceil((stop - curr) / (1000 * 60 * 60 * 24) / 31));

  while (curr <= stop) {
    const dStr = curr.toISOString().split('T')[0];
    const dMins = sessions
      .filter(s => s.date === dStr)
      .reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);

    dailySeries.push({
      date: dStr,
      label: dStr.substring(5),
      hours: Math.round((dMins / 60) * 10) / 10
    });
    curr.setDate(curr.getDate() + dayStep);
  }

  // Monthly Series for the year
  const monthlySeries = [];
  for (let m = 1; m <= 12; m++) {
    const mStr = `${activeYear}-${m < 10 ? '0' + m : m}`;
    const mMins = sessions
      .filter(s => s.date && s.date.startsWith(mStr))
      .reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);
    const monthObj = INDIVIDUAL_ROADMAP_MONTHS[m - 1];
    monthlySeries.push({
      monthKey: mStr,
      label: monthObj ? monthObj.name.substring(0, 3) : `M${m}`,
      hours: Math.round((mMins / 60) * 10) / 10
    });
  }

  return {
    hasData: inRangeSessions.length > 0,
    totalSessions: inRangeSessions.length,
    totalHours: Math.round((totalMins / 60) * 10) / 10,
    todayHours: Math.round((todayMins / 60) * 10) / 10,
    thisWeekHours: Math.round((thisWeekMins / 60) * 10) / 10,
    thisMonthHours: Math.round((thisMonthMins / 60) * 10) / 10,
    thisYearHours: Math.round((thisYearMins / 60) * 10) / 10,
    categories: {
      dsa: Math.round((dsaMins / 60) * 10) / 10,
      aiml: Math.round((aimlMins / 60) * 10) / 10,
      programming: Math.round((progMins / 60) * 10) / 10,
      projects: Math.round((projMins / 60) * 10) / 10,
      career: Math.round((careerMins / 60) * 10) / 10,
      other: Math.round((otherMins / 60) * 10) / 10
    },
    dailySeries,
    monthlySeries,
    dateRange: { startStr, endStr, period }
  };
}

// ==========================================
// 3. LEARNING ANALYTICS (Section 4)
// ==========================================

export function getLearningAnalytics(period = '30d', customStart = null, customEnd = null) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const { startStr, endStr } = parseDateFilter(period, customStart, customEnd, activeDate);

  const roadmapTopics = state.roadmap_topics || [];
  const dailyTasks = state.daily_tasks || state.dailyTasks || [];

  const completedTopics = roadmapTopics.filter(t => t.status === 'Completed').length;
  const inProgressTopics = roadmapTopics.filter(t => t.status === 'Learning' || t.status === 'Practicing').length;
  const notStartedTopics = roadmapTopics.filter(t => !t.status || t.status === 'Not Started').length;
  const needsRevisionTopics = roadmapTopics.filter(t => t.status === 'Needs Revision').length;

  const inRangeTasks = dailyTasks.filter(t => isDateInRange(t.date, startStr, endStr));
  const completedTasks = inRangeTasks.filter(t => t.completed).length;
  const incompleteTasks = inRangeTasks.filter(t => !t.completed).length;

  const studyStats = getStudyTimeAnalytics(period, customStart, customEnd);

  return {
    hasData: roadmapTopics.length > 0 || inRangeTasks.length > 0,
    topics: {
      total: roadmapTopics.length,
      completed: completedTopics,
      inProgress: inProgressTopics,
      notStarted: notStartedTopics,
      needsRevision: needsRevisionTopics
    },
    tasks: {
      total: inRangeTasks.length,
      completed: completedTasks,
      incomplete: incompleteTasks,
      completionRate: inRangeTasks.length > 0 ? Math.round((completedTasks / inRangeTasks.length) * 100) : 0
    },
    study: {
      totalSessions: studyStats.totalSessions,
      totalHours: studyStats.totalHours
    },
    dateRange: { startStr, endStr, period }
  };
}

// ==========================================
// 4. PLAN VS ACTUAL ANALYTICS (Section 7)
// ==========================================

export function getPlanVsActualComparison(period = 'monthly') {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const monthKey = activeDate.substring(0, 7);

  // Targets
  const mTargets = state.monthly_targets?.[monthKey] || { studyHours: 128, dsaProblems: 40, projectSessions: 8 };
  const mMetrics = calculateMonthlyMetrics(monthKey, state);

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

  const plannedProjectWork = mTargets.projectSessions || 8;
  const actualProjectWork = (state.studySessions || []).filter(s => s.category === 'Project' && s.date && s.date.startsWith(monthKey)).length;

  return {
    daily: {
      tasksPlanned: todayTasks.length,
      tasksCompleted: todayCompleted,
      tasksDiff: todayTasks.length - todayCompleted,
      studyHoursPlanned: Math.round((todayPlannedMinutes / 60) * 10) / 10,
      studyHoursActual: Math.round((todayActualMinutes / 60) * 10) / 10,
      studyHoursDiff: Math.round(((todayPlannedMinutes - todayActualMinutes) / 60) * 10) / 10,
      dsaTarget: dsaTargetToday,
      dsaActual: dsaSolvedToday,
      dsaDiff: dsaTargetToday - dsaSolvedToday
    },
    monthly: {
      studyHoursPlanned: mTargets.studyHours,
      studyHoursActual: mMetrics.studyHoursLogged,
      studyHoursDiff: Math.round((mTargets.studyHours - mMetrics.studyHoursLogged) * 10) / 10,
      dsaTarget: mTargets.dsaProblems,
      dsaActual: mMetrics.dsaSolved,
      dsaDiff: mTargets.dsaProblems - mMetrics.dsaSolved,
      projectTarget: plannedProjectWork,
      projectActual: actualProjectWork,
      projectDiff: plannedProjectWork - actualProjectWork
    }
  };
}

// ==========================================
// 5. DSA ANALYTICS & SOLVING HISTORY (Sections 8, 9, 10, 11)
// ==========================================

export function getDsaDetailedAnalytics() {
  const state = getState();
  const problems = state.dsa_problems || [];
  const revisions = state.dsa_revisions || [];
  const mistakes = state.dsa_mistakes || [];
  const activeDate = state.user?.activeDate || '2026-10-01';

  if (problems.length === 0) {
    return {
      hasData: false,
      message: 'No DSA problems recorded yet.',
      totalAttempted: 0,
      totalSolved: 0,
      topics: [],
      solvingHistory: [],
      consistency: { daysPracticed: 0, streak: 0, longestStreak: 0 }
    };
  }

  const solved = problems.filter(p => p.status === 'Solved' || p.solved);
  const independent = problems.filter(p => p.solved_independently).length;
  const hints = problems.filter(p => p.needed_hint).length;
  const solutions = problems.filter(p => p.viewed_solution).length;

  // Topic breakdown
  const topicMap = {};
  problems.forEach(p => {
    const top = p.topic || 'General';
    if (!topicMap[top]) {
      topicMap[top] = {
        name: top,
        attempted: 0,
        solved: 0,
        revisions: 0,
        lastPracticed: null,
        lastRevised: null
      };
    }
    topicMap[top].attempted += 1;
    if (p.status === 'Solved' || p.solved) topicMap[top].solved += 1;
    if (!topicMap[top].lastPracticed || (p.date && p.date > topicMap[top].lastPracticed)) {
      topicMap[top].lastPracticed = p.date;
    }
  });

  revisions.forEach(r => {
    const top = r.topic || 'General';
    if (topicMap[top]) {
      topicMap[top].revisions += (r.completed ? 1 : 0);
      if (!topicMap[top].lastRevised || (r.last_reviewed && r.last_reviewed > topicMap[top].lastRevised)) {
        topicMap[top].lastRevised = r.last_reviewed;
      }
    }
  });

  const topicsList = Object.values(topicMap).sort((a, b) => b.attempted - a.attempted);

  // Consistency (days practiced)
  const practicedDates = new Set(problems.filter(p => p.date).map(p => p.date));
  const streaks = calculateStreaks(state);

  // Solving History with rich columns (Section 9)
  const solvingHistory = problems.map(p => {
    const rev = revisions.find(r => r.problem_id === p.id);
    return {
      id: p.id,
      date: p.date || 'Unrecorded',
      problem: p.title,
      topic: p.topic || 'General',
      difficulty: p.difficulty || 'Medium',
      status: p.status || (p.solved ? 'Solved' : 'Attempted'),
      independentSolve: p.solved_independently ? 'Yes' : (p.needed_hint ? 'Hint' : (p.viewed_solution ? 'Solution' : 'No')),
      revisionStatus: rev ? (rev.completed ? 'Revised' : `Due (${rev.interval || '1-day'})`) : 'Not in queue'
    };
  }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return {
    hasData: true,
    totalAttempted: problems.length,
    totalSolved: solved.length,
    independentSolves: independent,
    hintSolves: hints,
    solutionSolves: solutions,
    revisionsCount: revisions.filter(r => r.completed).length,
    mistakesCount: mistakes.length,
    topics: topicsList,
    solvingHistory,
    consistency: {
      daysPracticed: practicedDates.size,
      streak: streaks.dailyStreak || 0,
      longestStreak: streaks.longestStreak || 0
    }
  };
}

// ==========================================
// 6. PROJECT ANALYTICS & TIMELINE & TECH USAGE (Sections 12, 13, 14)
// ==========================================

export function getProjectDetailedAnalytics() {
  const state = getState();
  const projects = state.projects || [];
  const sessions = (state.studySessions || []).filter(s => s.category === 'Project');
  const tasks = state.project_tasks || [];

  if (projects.length === 0) {
    return {
      hasData: false,
      message: 'No projects recorded yet.',
      lifecycle: {},
      techUsage: [],
      timelines: []
    };
  }

  // Lifecycle breakdown (Section 12)
  const lifecycle = {
    IDEA: projects.filter(p => p.status === 'Idea' || p.status === 'Planned').length,
    PLANNING: projects.filter(p => p.status === 'Planning').length,
    BUILDING: projects.filter(p => p.status === 'Building').length,
    TESTING: projects.filter(p => p.status === 'Testing').length,
    DEPLOYMENT: projects.filter(p => p.status === 'Deployed').length,
    DOCUMENTATION: projects.filter(p => p.status === 'Documented').length,
    PORTFOLIO_READY: projects.filter(p => p.portfolio_ready === true).length,
    COMPLETED: projects.filter(p => p.status === 'Completed').length
  };

  // Technology Usage analytics (Section 14)
  const techCounts = {};
  projects.forEach(p => {
    const stack = Array.isArray(p.tech_stack) ? p.tech_stack : (p.techStack || []);
    stack.forEach(tech => {
      const t = String(tech).trim();
      if (t) techCounts[t] = (techCounts[t] || 0) + 1;
    });
  });

  const techUsage = Object.keys(techCounts).map(name => ({
    name,
    count: techCounts[name]
  })).sort((a, b) => b.count - a.count);

  // Timelines for each project (Section 13)
  const timelines = projects.map(p => {
    const pMilestones = (state.project_milestones || []).filter(pm => pm.project_id === p.id);
    const pTasks = tasks.filter(pt => pt.project_id === p.id);
    const pSessions = sessions.filter(ps => ps.related_project_id === p.id);

    let totalMins = 0;
    pSessions.forEach(ps => totalMins += (Number(ps.durationMinutes) || 0));

    return {
      id: p.id,
      name: p.name,
      status: p.status,
      created_at: p.created_at || '2026-10-01',
      portfolio_ready: p.portfolio_ready,
      totalHours: Math.round((totalMins / 60) * 10) / 10,
      tasksCount: pTasks.length,
      tasksCompleted: pTasks.filter(pt => pt.completed).length,
      milestones: pMilestones.map(m => ({
        title: m.title,
        status: m.status,
        target_date: m.target_date
      }))
    };
  });

  const totalHours = Math.round((sessions.reduce((s, x) => s + (Number(x.durationMinutes) || 0), 0) / 60) * 10) / 10;

  return {
    hasData: true,
    totalProjects: projects.length,
    completedProjects: lifecycle.COMPLETED,
    deployedProjects: projects.filter(p => p.status === 'Deployed' || p.deployed).length,
    portfolioReadyProjects: lifecycle.PORTFOLIO_READY,
    totalSessions: sessions.length,
    totalHours,
    lifecycle,
    techUsage,
    timelines
  };
}

// ==========================================
// 7. CAREER ANALYTICS & PIPELINE (Sections 15, 16, 17)
// ==========================================

export function getCareerDetailedAnalytics() {
  const state = getState();
  const applications = state.applications || [];
  const appStats = getApplicationStats();
  const resumeVersions = getResumeVersions();
  const mockInterviews = getMockInterviews();
  const aptitudeSessions = state.aptitude_sessions || [];
  const interviewQuestions = getInterviewQuestions();
  const certifications = state.certifications || [];
  const achievements = state.achievements_profile || state.career_achievements || [];

  if (applications.length === 0 && resumeVersions.length === 0 && mockInterviews.length === 0) {
    return {
      hasData: false,
      message: 'No career preparation activities recorded yet.',
      pipeline: {},
      prepHistory: []
    };
  }

  // Application Pipeline stages (Section 16)
  const pipeline = {
    Saved: applications.filter(a => a.status === 'Saved').length,
    Preparing: applications.filter(a => a.status === 'Preparing').length,
    Applied: applications.filter(a => a.status === 'Applied').length,
    Assessment: applications.filter(a => a.status === 'Assessment').length,
    Interview: applications.filter(a => a.status === 'Interview').length,
    FollowUp: applications.filter(a => a.status === 'Follow-up' || a.next_action_date).length,
    Closed: applications.filter(a => a.status === 'Rejected' || a.status === 'Offer' || a.status === 'Withdrawn').length
  };

  // Career Preparation History breakdown (Section 17)
  const prepHistory = [
    { area: 'DSA Preparation', count: (state.dsa_problems || []).length, unit: 'problems tracked' },
    { area: 'Resume Versions', count: resumeVersions.length, unit: 'versions created' },
    { area: 'Mock Interviews', count: mockInterviews.length, unit: 'sessions completed' },
    { area: 'Aptitude Practice', count: aptitudeSessions.length, unit: 'sessions logged' },
    { area: 'Technical Question Bank', count: interviewQuestions.length, unit: 'questions saved' },
    { area: 'Certifications', count: certifications.length, unit: 'credentials recorded' },
    { area: 'Profile Achievements', count: achievements.length, unit: 'awards & milestones' }
  ];

  return {
    hasData: true,
    totalApplications: applications.length,
    pipeline,
    prepHistory,
    resumeCount: resumeVersions.length,
    mockInterviewCount: mockInterviews.length,
    certificationsCount: certifications.length
  };
}

// ==========================================
// 8. HABIT ANALYTICS & CALENDAR MATRIX (Sections 18, 19, 20)
// ==========================================

export function getHabitDetailedAnalytics() {
  const state = getState();
  const habitLogs = state.habitLogs || state.habit_logs || [];
  const habits = state.habits || [];
  const activeDate = state.user?.activeDate || '2026-10-01';
  const monthKey = activeDate.substring(0, 7);
  const streaks = calculateStreaks(state);

  // Generate 31 days calendar matrix for month (Section 19)
  const calendarDays = [];
  const sessions = state.studySessions || [];
  const tasks = state.daily_tasks || state.dailyTasks || [];

  for (let d = 1; d <= 31; d++) {
    const dStr = `${monthKey}-${d < 10 ? '0' + d : d}`;
    const daySessions = sessions.filter(s => s.date === dStr);
    const dayTasks = tasks.filter(t => t.date === dStr);
    const dayLogs = Array.isArray(habitLogs) ? habitLogs.filter(h => h.date === dStr) : [];

    let status = 'no-data';
    const hasCompletedTasks = dayTasks.some(t => t.completed);
    const hasSessions = daySessions.some(s => (Number(s.durationMinutes) || 0) > 0);
    const hasHabitDone = dayLogs.some(h => h.status === 'Completed' || (h.percentage && h.percentage >= 100));
    const hasHabitPartial = dayLogs.some(h => h.status === 'Partially Completed' || (h.percentage && h.percentage > 0 && h.percentage < 100));

    if (hasHabitDone || (hasSessions && hasCompletedTasks)) {
      status = 'completed';
    } else if (hasHabitPartial || hasSessions || hasCompletedTasks) {
      status = 'partial';
    } else if (dayTasks.length > 0 || daySessions.length > 0) {
      status = 'not-completed';
    }

    calendarDays.push({
      date: dStr,
      dayNumber: d,
      status // 'completed' | 'partial' | 'not-completed' | 'no-data'
    });
  }

  // Streaks for key habits (Section 20)
  const configurableStreaks = [
    { name: 'Daily Study Streak', current: streaks.dailyStreak || 0, longest: streaks.longestStreak || 0, condition: 'Any study session logged' },
    { name: 'DSA Consistency', current: streaks.dsaStreak || 0, longest: streaks.longestDsaStreak || streaks.longestStreak || 0, condition: 'Daily DSA target met' },
    { name: 'Project Development', current: streaks.projectStreak || 0, longest: streaks.longestStreak || 0, condition: 'Project session or task done' },
    { name: 'Career Preparation', current: streaks.careerStreak || 0, longest: streaks.longestStreak || 0, condition: 'Career action completed' }
  ];

  return {
    hasData: calendarDays.some(c => c.status !== 'no-data'),
    calendarDays,
    streaks: configurableStreaks,
    currentStreak: streaks.dailyStreak || 0,
    longestStreak: streaks.longestStreak || 0
  };
}

// ==========================================
// 9. DYNAMIC ACHIEVEMENT EVALUATOR (Sections 21–27)
// ==========================================

export function evaluateAchievements() {
  const state = getState();
  const achievements = state.achievements || [];
  const customAchievements = state.custom_achievements || [];

  // Compute actual factual metrics from active state
  const studySessionsCount = (state.studySessions || []).length;
  const roadmapTopics = state.roadmap_topics || [];
  const completedTopicsCount = roadmapTopics.filter(t => t.status === 'Completed').length;
  const dsaProblems = state.dsa_problems || [];
  const dsaSolvedCount = dsaProblems.filter(p => p.status === 'Solved' || p.solved).length;
  const dsaRevisionsCount = (state.dsa_revisions || []).filter(r => r.completed).length;

  const dsaTreeCount = dsaProblems.filter(p => (p.status === 'Solved' || p.solved) && /tree/i.test(p.topic || p.pattern || '')).length;
  const dsaGraphCount = dsaProblems.filter(p => (p.status === 'Solved' || p.solved) && /graph/i.test(p.topic || p.pattern || '')).length;
  const dsaDpCount = dsaProblems.filter(p => (p.status === 'Solved' || p.solved) && (/dynamic|dp/i.test(p.topic || p.pattern || ''))).length;

  const projects = state.projects || [];
  const projectsStarted = projects.length;
  const projectsCompleted = projects.filter(p => p.status === 'Completed').length;
  const projectsDeployed = projects.filter(p => p.status === 'Deployed' || p.deployed).length;
  const portfolioReady = projects.filter(p => p.portfolio_ready === true).length;

  const resumeVersions = getResumeVersions();
  const portfolioCreated = projects.some(p => p.portfolio_ready) || Boolean(state.user?.portfolioUrl);
  const applicationsTracked = (state.applications || []).length;
  const mockInterviews = getMockInterviews().length;
  const certifications = (state.certifications || []).length;

  const streaks = calculateStreaks(state);
  const studyStreak = Math.max(streaks.dailyStreak || 0, streaks.longestStreak || 0);

  const evaluated = achievements.map(ach => {
    let current = 0;
    switch (ach.metric) {
      case 'study_sessions': current = studySessionsCount; break;
      case 'topics_completed': current = completedTopicsCount; break;
      case 'dsa_solved': current = dsaSolvedCount; break;
      case 'dsa_revisions': current = dsaRevisionsCount; break;
      case 'dsa_tree': current = dsaTreeCount; break;
      case 'dsa_graph': current = dsaGraphCount; break;
      case 'dsa_dp': current = dsaDpCount; break;
      case 'projects_started': current = projectsStarted; break;
      case 'projects_completed': current = projectsCompleted; break;
      case 'projects_deployed': current = projectsDeployed; break;
      case 'portfolio_ready': current = portfolioReady; break;
      case 'resume_versions': current = resumeVersions.length; break;
      case 'portfolio_created': current = portfolioCreated ? 1 : 0; break;
      case 'applications_tracked': current = applicationsTracked; break;
      case 'mock_interviews': current = mockInterviews; break;
      case 'certifications': current = certifications; break;
      case 'study_streak': current = studyStreak; break;
      default: current = 0;
    }

    const unlocked = current >= ach.target;
    const progress_percentage = Math.min(100, Math.round((current / Math.max(1, ach.target)) * 100));

    return {
      ...ach,
      current,
      unlocked,
      progress_percentage
    };
  });

  const unlockedCount = evaluated.filter(a => a.unlocked).length;
  const customUnlockedCount = customAchievements.filter(c => c.completed).length;

  return {
    achievements: evaluated,
    unlockedCount: unlockedCount + customUnlockedCount,
    totalCount: evaluated.length + customAchievements.length,
    systemAchievements: evaluated,
    customAchievements,
    categories: ['Learning', 'DSA', 'Projects', 'Career', 'Consistency']
  };
}

// ==========================================
// 10. CUSTOM ACHIEVEMENTS MANAGEMENT (Section 31)
// ==========================================

export function getCustomAchievements() {
  return getState().custom_achievements || [];
}

export function addCustomAchievement({ name, description, category, requirement, target, optional_date }) {
  const id = uid('cust-ach');
  const newAch = {
    id,
    name,
    description: description || '',
    category: category || 'General',
    requirement: requirement || '',
    target: Number(target) || 1,
    optional_date: optional_date || null,
    completed: false,
    completed_date: null,
    created_at: new Date().toISOString()
  };

  updateState(curr => ({
    ...curr,
    custom_achievements: [newAch, ...(curr.custom_achievements || [])]
  }));

  return newAch;
}

export function toggleCustomAchievement(id) {
  let toggledState = null;
  updateState(curr => {
    const list = (curr.custom_achievements || []).map(ach => {
      if (ach.id === id) {
        const nextDone = !ach.completed;
        toggledState = nextDone;
        return {
          ...ach,
          completed: nextDone,
          completed_date: nextDone ? (curr.user?.activeDate || new Date().toISOString().split('T')[0]) : null
        };
      }
      return ach;
    });
    return { ...curr, custom_achievements: list };
  });
  return toggledState;
}

export function deleteCustomAchievement(id) {
  updateState(curr => ({
    ...curr,
    custom_achievements: (curr.custom_achievements || []).filter(a => a.id !== id)
  }));
  return true;
}

// ==========================================
// 11. MILESTONES EVALUATOR (Sections 28, 29, 30)
// ==========================================

export function evaluateMilestones() {
  const state = getState();
  const milestones = state.milestones || [];
  const achievements = evaluateAchievements();
  const projects = state.projects || [];
  const dsaProblems = state.dsa_problems || [];
  const solvedDsa = dsaProblems.filter(p => p.status === 'Solved' || p.solved).length;

  const evaluated = milestones.map(m => {
    let current_progress = m.current_progress || 0;
    let progress_percentage = m.progress_percentage || 0;
    let status = m.status || 'Not Started';

    if (m.id === 'mile-1') {
      // Python Foundation
      const pythonTopics = (state.roadmap_topics || []).filter(t => /python|programming/i.test(t.name || t.category || ''));
      const done = pythonTopics.filter(t => t.status === 'Completed').length;
      current_progress = done;
      progress_percentage = pythonTopics.length > 0 ? Math.min(100, Math.round((done / pythonTopics.length) * 100)) : 0;
    } else if (m.id === 'mile-2') {
      // DSA Foundation (Target: 50)
      current_progress = solvedDsa;
      progress_percentage = Math.min(100, Math.round((solvedDsa / 50) * 100));
    } else if (m.id === 'mile-3') {
      // First Major Project
      const doneProj = projects.filter(p => p.status === 'Completed').length;
      current_progress = doneProj;
      progress_percentage = doneProj > 0 ? 100 : (projects.length > 0 ? 50 : 0);
    } else if (m.id === 'mile-4') {
      // Deploy First Project
      const depProj = projects.filter(p => p.status === 'Deployed' || p.deployed).length;
      current_progress = depProj;
      progress_percentage = depProj > 0 ? 100 : 0;
    } else if (m.id === 'mile-6') {
      // Build Portfolio
      const portDone = projects.some(p => p.portfolio_ready) || Boolean(state.user?.portfolioUrl);
      current_progress = portDone ? 1 : 0;
      progress_percentage = portDone ? 100 : 25;
    } else if (m.id === 'mile-7') {
      // Internship Prep
      const apps = (state.applications || []).length;
      const mocks = getMockInterviews().length;
      current_progress = apps + mocks;
      progress_percentage = Math.min(100, Math.round(((apps + mocks) / 15) * 100));
    }

    if (progress_percentage >= 100) {
      status = 'Completed';
    } else if (progress_percentage > 0) {
      status = 'In Progress';
    }

    return {
      ...m,
      current_progress,
      progress_percentage,
      status
    };
  });

  return {
    milestones: evaluated,
    completedCount: evaluated.filter(m => m.status === 'Completed').length,
    inProgressCount: evaluated.filter(m => m.status === 'In Progress').length,
    totalCount: evaluated.length
  };
}

// ==========================================
// 12. PERSONAL RECORDS (PERSONAL BESTS) (Section 42)
// ==========================================

export function calculatePersonalRecords() {
  const state = getState();
  const sessions = state.studySessions || [];
  const problems = state.dsa_problems || [];
  const streaks = calculateStreaks(state);

  // 1. Most study sessions in a month
  const sessionsByMonth = {};
  sessions.forEach(s => {
    if (s.date) {
      const m = s.date.substring(0, 7);
      sessionsByMonth[m] = (sessionsByMonth[m] || 0) + 1;
    }
  });
  const maxSessionsMonth = Math.max(0, ...Object.values(sessionsByMonth));

  // 2. Most DSA problems in a week
  const dsaByWeek = {};
  problems.forEach(p => {
    if (p.date) {
      const d = new Date(p.date);
      const weekKey = `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
      dsaByWeek[weekKey] = (dsaByWeek[weekKey] || 0) + 1;
    }
  });
  const maxDsaWeek = Math.max(0, ...Object.values(dsaByWeek));

  // 3. Longest recorded study streak
  const longestStreak = streaks.longestStreak || streaks.dailyStreak || 0;

  // 4. Most project hours in a month
  const projectMinsByMonth = {};
  sessions.filter(s => s.category === 'Project').forEach(s => {
    if (s.date) {
      const m = s.date.substring(0, 7);
      projectMinsByMonth[m] = (projectMinsByMonth[m] || 0) + (Number(s.durationMinutes) || 0);
    }
  });
  const maxProjectHoursMonth = Math.round((Math.max(0, ...Object.values(projectMinsByMonth)) / 60) * 10) / 10;

  // 5. Most achievements unlocked in a month
  const achUnlocked = evaluateAchievements().unlockedCount;

  return {
    mostSessionsMonth: maxSessionsMonth,
    mostDsaWeek: maxDsaWeek,
    longestStreak,
    mostProjectHoursMonth: maxProjectHoursMonth,
    achievementsCount: achUnlocked
  };
}

// ==========================================
// 13. DATA QUALITY AUDITOR (Section 43)
// ==========================================

export function auditDataQuality() {
  const state = getState();
  const issues = [];

  // Check study sessions
  (state.studySessions || []).forEach(s => {
    if (!s.durationMinutes || Number(s.durationMinutes) <= 0) {
      issues.push({
        id: uid('dq'),
        type: 'Missing Study Duration',
        entityId: s.id,
        entityType: 'study_session',
        description: `Session "${s.title || 'Untitled'}" on ${s.date || 'unknown date'} has 0 duration recorded.`,
        action: 'edit_study_session'
      });
    }
    if (!s.date) {
      issues.push({
        id: uid('dq'),
        type: 'Missing Date',
        entityId: s.id,
        entityType: 'study_session',
        description: `Study session "${s.title || 'Untitled'}" is missing a valid date.`,
        action: 'edit_study_session'
      });
    }
  });

  // Check tasks
  (state.daily_tasks || state.dailyTasks || []).forEach(t => {
    if (!t.date) {
      issues.push({
        id: uid('dq'),
        type: 'Task Missing Date',
        entityId: t.id,
        entityType: 'daily_task',
        description: `Task "${t.title}" has no execution date assigned.`,
        action: 'edit_daily_task'
      });
    }
  });

  return {
    issues,
    hasIssues: issues.length > 0,
    totalIssues: issues.length
  };
}

// ==========================================
// 14. DATA CORRECTION HELPERS (Section 44)
// ==========================================

export function correctEntityRecord(entityType, entityId, updatedFields) {
  let updated = false;

  updateState(curr => {
    if (entityType === 'study_session') {
      const list = (curr.studySessions || []).map(s => s.id === entityId ? { ...s, ...updatedFields } : s);
      updated = true;
      return { ...curr, studySessions: list };
    } else if (entityType === 'daily_task') {
      const list = (curr.daily_tasks || curr.dailyTasks || []).map(t => t.id === entityId ? { ...t, ...updatedFields } : t);
      updated = true;
      return { ...curr, daily_tasks: list, dailyTasks: list };
    } else if (entityType === 'dsa_problem') {
      const list = (curr.dsa_problems || []).map(p => p.id === entityId ? { ...p, ...updatedFields } : p);
      updated = true;
      return { ...curr, dsa_problems: list };
    }
    return curr;
  });

  return { success: updated };
}

// ==========================================
// 15. PROGRESS SNAPSHOT GENERATOR (Section 37)
// ==========================================

export function generateProgressSnapshot() {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';

  const study = getStudyTimeAnalytics('30d', null, null, activeDate);
  const dsa = getDsaDetailedAnalytics();
  const proj = getProjectDetailedAnalytics();
  const career = getCareerDetailedAnalytics();
  const ach = evaluateAchievements();
  const mile = evaluateMilestones();

  const snapshot = {
    generated_at: new Date().toISOString(),
    activeDate,
    summary: {
      studySessions: study.totalSessions,
      studyHours: study.totalHours,
      dsaSolved: dsa.totalSolved,
      dsaAttempted: dsa.totalAttempted,
      projectsCount: proj.totalProjects,
      projectsCompleted: proj.completedProjects,
      applications: career.totalApplications,
      achievementsUnlocked: ach.unlockedCount,
      milestonesCompleted: mile.completedCount
    }
  };

  return snapshot;
}

// ==========================================
// 16. PROGRESS REPORTS GENERATORS (Sections 52, 53, 54)
// ==========================================

export function generateWeeklyProgressReport(refDate = null) {
  const state = getState();
  const activeDate = refDate || state.user?.activeDate || '2026-10-01';
  const study = getStudyTimeAnalytics('7d', null, null, activeDate);
  const dsa = getDsaDetailedAnalytics();
  const streaks = calculateStreaks(state);
  const ach = evaluateAchievements();

  return {
    type: 'Weekly Progress Report',
    period: `7 Days leading to ${activeDate}`,
    generated_at: new Date().toISOString(),
    sections: {
      study: {
        hours: study.totalHours,
        sessions: study.totalSessions,
        categories: study.categories
      },
      dsa: {
        totalSolved: dsa.totalSolved,
        totalAttempted: dsa.totalAttempted
      },
      habits: {
        currentStreak: streaks.dailyStreak || 0
      },
      achievements: {
        unlocked: ach.unlockedCount
      }
    }
  };
}

export function generateMonthlyProgressReport(monthKey = null) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const mKey = monthKey || activeDate.substring(0, 7);

  const mMetrics = calculateMonthlyMetrics(mKey, state);
  const proj = getProjectDetailedAnalytics();
  const career = getCareerDetailedAnalytics();
  const ach = evaluateAchievements();
  const mile = evaluateMilestones();

  return {
    type: 'Monthly Progress Report',
    month: mKey,
    generated_at: new Date().toISOString(),
    accomplished: {
      topicsCompleted: mMetrics.topicsCompleted,
      studyHoursLogged: mMetrics.studyHoursLogged,
      dsaSolved: mMetrics.dsaSolved,
      completedProjects: proj.completedProjects,
      applicationsLogged: career.totalApplications,
      achievementsUnlocked: ach.unlockedCount,
      milestonesReached: mile.completedCount
    },
    remains: {
      topicsRemaining: mMetrics.topicsRemaining,
      inProgressMilestones: mile.inProgressCount
    }
  };
}

export function generateYearlyProgressReport(year = null) {
  const state = getState();
  const y = year || (state.user?.activeDate || '2026-10-01').substring(0, 4);

  const study = getStudyTimeAnalytics('year', null, null, `${y}-10-01`);
  const dsa = getDsaDetailedAnalytics();
  const proj = getProjectDetailedAnalytics();
  const career = getCareerDetailedAnalytics();
  const ach = evaluateAchievements();
  const mile = evaluateMilestones();

  return {
    type: 'Yearly Progress Report',
    year: y,
    generated_at: new Date().toISOString(),
    totals: {
      studySessions: study.totalSessions,
      studyHours: study.totalHours,
      dsaSolved: dsa.totalSolved,
      projectsCompleted: proj.completedProjects,
      careerActivities: career.totalApplications + career.mockInterviewCount,
      achievementsUnlocked: ach.unlockedCount,
      milestonesCompleted: mile.completedCount
    }
  };
}

// ==========================================
// 17. CSV EXPORT UTILITIES (Section 38)
// ==========================================

export function exportProgressToCsv(type = 'study') {
  const state = getState();
  let headers = [];
  let rows = [];

  if (type === 'study') {
    headers = ['ID', 'Date', 'Category', 'Title', 'DurationMinutes'];
    rows = (state.studySessions || []).map(s => [
      `"${s.id}"`,
      `"${s.date || ''}"`,
      `"${s.category || s.track || ''}"`,
      `"${(s.title || '').replace(/"/g, '""')}"`,
      s.durationMinutes || 0
    ]);
  } else if (type === 'dsa') {
    headers = ['ID', 'Date', 'Problem', 'Platform', 'Difficulty', 'Pattern', 'Status', 'IndependentSolve'];
    rows = (state.dsa_problems || []).map(p => [
      `"${p.id}"`,
      `"${p.date || ''}"`,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${p.platform || ''}"`,
      `"${p.difficulty || ''}"`,
      `"${p.pattern || ''}"`,
      `"${p.status || (p.solved ? 'Solved' : 'Attempted')}"`,
      p.solved_independently ? 'Yes' : 'No'
    ]);
  } else if (type === 'projects') {
    headers = ['ID', 'Name', 'Type', 'Status', 'PortfolioReady', 'CreatedAt'];
    rows = (state.projects || []).map(p => [
      `"${p.id}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.type || ''}"`,
      `"${p.status || ''}"`,
      p.portfolio_ready ? 'Yes' : 'No',
      `"${p.created_at || ''}"`
    ]);
  } else if (type === 'achievements') {
    headers = ['ID', 'Category', 'Name', 'Requirement', 'Status'];
    const ach = evaluateAchievements();
    rows = ach.achievements.map(a => [
      `"${a.id}"`,
      `"${a.category}"`,
      `"${a.name}"`,
      `"${a.requirement}"`,
      a.unlocked ? 'Unlocked' : 'Locked'
    ]);
  } else if (type === 'milestones') {
    headers = ['ID', 'Category', 'Title', 'Status', 'ProgressPct', 'TargetDate'];
    const mile = evaluateMilestones();
    rows = mile.milestones.map(m => [
      `"${m.id}"`,
      `"${m.category}"`,
      `"${m.title}"`,
      `"${m.status}"`,
      `${m.progress_percentage}%`,
      `"${m.target_date || ''}"`
    ]);
  }

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return csvContent;
}

// ==========================================
// 18. DASHBOARD WIDGETS PREFERENCES (Section 46)
// ==========================================

export function getAnalyticsPreferences() {
  const state = getState();
  return state.analytics_preferences || {
    widgets: [
      { id: 'widget-study-time', name: 'Study Time', visible: true, order: 1 },
      { id: 'widget-dsa-activity', name: 'DSA Activity', visible: true, order: 2 },
      { id: 'widget-project-activity', name: 'Project Activity', visible: true, order: 3 },
      { id: 'widget-career-activity', name: 'Career Activity', visible: true, order: 4 },
      { id: 'widget-habit-streak', name: 'Habit Streak', visible: true, order: 5 },
      { id: 'widget-achievements', name: 'Achievements', visible: true, order: 6 },
      { id: 'widget-milestones', name: 'Milestones', visible: true, order: 7 },
      { id: 'widget-monthly-progress', name: 'Monthly Progress', visible: true, order: 8 },
      { id: 'widget-year-progress', name: 'Year Progress', visible: true, order: 9 }
    ],
    defaultChartHorizon: 'month',
    activeFilterPeriod: '30d'
  };
}

export function updateAnalyticsPreferences(prefs) {
  updateState(curr => ({
    ...curr,
    analytics_preferences: {
      ...(curr.analytics_preferences || {}),
      ...prefs
    }
  }));
  return getState().analytics_preferences;
}

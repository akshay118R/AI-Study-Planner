/**
 * Akshay's 12-Month AI/ML Career OS - Streak & Consistency Engine
 * 
 * Rules:
 * 1. Minimum successful day requires:
 *    (Prime 3.0 OR Individual Learning) + (DSA OR Practical Coding)
 * 2. 1 Recovery Day allowed per 7-day rolling window to preserve streak through real life.
 * 3. Tracks 4 specific streaks: Daily Learning Streak, DSA Streak, Prime 3.0 Streak, Project Streak.
 */

import { PROGRAM_START_DATE, getCanonicalToday, shiftDate } from './dateService.js';

export function calculateStreaks(state) {
  const habitLogs = state.habit_logs || state.habitLogs || {};
  const studySessions = state.remote_study_sessions || state.study_sessions || state.studySessions || [];
  const dailyTasks = state.remote_tasks || state.daily_tasks || state.dailyTasks || state.tasks || [];
  const dsaProblems = state.remote_dsa || state.dsa_problems || state.dsaProblems || [];

  // Group activity by date string (YYYY-MM-DD)
  const activityByDate = {};

  // Analyze habit logs
  Object.entries(habitLogs).forEach(([dateStr, habits]) => {
    if (!activityByDate[dateStr]) {
      activityByDate[dateStr] = { prime: false, indiv: false, dsa: false, coding: false, project: false, studyMinutes: 0 };
    }
    const rec = activityByDate[dateStr];
    if (habits['h-prime']?.status === 'Completed' || habits['h-prime']?.status === 'Partially completed') rec.prime = true;
    if (habits['h-indiv']?.status === 'Completed' || habits['h-indiv']?.status === 'Partially completed') rec.indiv = true;
    if (habits['h-dsa']?.status === 'Completed' || habits['h-dsa']?.status === 'Partially completed') rec.dsa = true;
    if (habits['h-coding']?.status === 'Completed') rec.coding = true;
    if (habits['h-project']?.status === 'Completed' || habits['h-project']?.status === 'Partially completed') rec.project = true;
  });

  // Analyze study sessions
  studySessions.forEach(s => {
    if (!activityByDate[s.date]) {
      activityByDate[s.date] = { prime: false, indiv: false, dsa: false, coding: false, project: false, studyMinutes: 0 };
    }
    activityByDate[s.date].studyMinutes += (s.durationMinutes || s.duration_minutes || 0);
    const trk = (s.track || s.category || '').toUpperCase();
    if (trk.includes('PRIME')) activityByDate[s.date].prime = true;
    if (trk.includes('INDIV') || trk.includes('LEARN')) activityByDate[s.date].indiv = true;
    if (trk.includes('DSA') || trk.includes('PRACTICE')) activityByDate[s.date].dsa = true;
    if (trk.includes('PROJ') || trk.includes('BUILD')) activityByDate[s.date].project = true;
  });

  // Analyze daily tasks completed
  dailyTasks.forEach(t => {
    if (t.completed && t.date) {
      if (!activityByDate[t.date]) {
        activityByDate[t.date] = { prime: false, indiv: false, dsa: false, coding: false, project: false, studyMinutes: 0 };
      }
      const cat = (t.category || '').toUpperCase();
      const trk = (t.track || '').toUpperCase();
      const title = (t.title || '').toLowerCase();
      if (t.subtype === 'PRIME_3' || trk.includes('PRIME') || title.includes('prime')) activityByDate[t.date].prime = true;
      if (t.subtype === 'INDIVIDUAL' || trk.includes('INDIV') || title.includes('individual')) activityByDate[t.date].indiv = true;
      if (cat === 'LEARN') {
        if (!activityByDate[t.date].prime && !activityByDate[t.date].indiv) activityByDate[t.date].prime = true;
      }
      if (cat === 'PRACTICE' || trk.includes('DSA') || t.subtype === 'DSA' || title.includes('dsa')) {
        activityByDate[t.date].dsa = true;
        activityByDate[t.date].coding = true;
      }
      if (cat === 'BUILD' || trk.includes('PROJ') || t.subtype === 'PROJECT' || title.includes('project')) activityByDate[t.date].project = true;
    }
  });

  // Analyze DSA problems solved
  dsaProblems.forEach(p => {
    if (p.date && (p.status === 'Solved' || p.completed)) {
      if (!activityByDate[p.date]) {
        activityByDate[p.date] = { prime: false, indiv: false, dsa: false, coding: false, project: false, studyMinutes: 0 };
      }
      activityByDate[p.date].dsa = true;
      activityByDate[p.date].coding = true;
    }
  });

  // Determine which dates qualify as a Minimum Successful Day
  // Requirement: (Prime OR Indiv) AND (DSA OR Coding)
  const isSuccessfulDay = (dateStr) => {
    const act = activityByDate[dateStr];
    if (!act) return false;
    const hasCoreLearning = act.prime || act.indiv;
    const hasCoding = act.dsa || act.coding;
    return hasCoreLearning && hasCoding;
  };

  const activeDate = state.user?.activeDate || '2026-10-01';
  const curr = new Date(activeDate);

  // Compute Daily Learning Streak with 1 recovery day per 7-day window
  let dailyStreak = 0;
  let recoveryDaysUsedThisWeek = 0;
  let checkDate = new Date(curr);

  // We scan backwards from activeDate
  for (let i = 0; i < 365; i++) {
    const dStr = checkDate.toISOString().split('T')[0];
    const success = isSuccessfulDay(dStr);

    if (success) {
      dailyStreak++;
    } else {
      // Check if we can use the 1 recovery day for this week
      if (recoveryDaysUsedThisWeek < 1 && i > 0) {
        recoveryDaysUsedThisWeek++;
        // streak continues via recovery protection
      } else {
        // If today is activeDate and not yet completed, don't break streak from yesterday
        if (i === 0) {
          // Check yesterday before terminating
          const yest = new Date(checkDate);
          yest.setDate(yest.getDate() - 1);
          const yestStr = yest.toISOString().split('T')[0];
          if (isSuccessfulDay(yestStr)) {
            // continue checking from yesterday
          } else {
            break;
          }
        } else {
          break;
        }
      }
    }
    // reset recovery token every 7 days
    if (i % 7 === 6) {
      recoveryDaysUsedThisWeek = 0;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate separate track streaks
  const calculateTrackStreak = (conditionFn) => {
    let streak = 0;
    let scan = new Date(activeDate);
    for (let i = 0; i < 365; i++) {
      const dStr = scan.toISOString().split('T')[0];
      const act = activityByDate[dStr];
      if (act && conditionFn(act)) {
        streak++;
      } else {
        if (i === 0) {
          // Allow today to still be in progress
        } else {
          break;
        }
      }
      scan.setDate(scan.getDate() - 1);
    }
    return streak;
  };

  const dsaStreak = calculateTrackStreak(act => act.dsa);
  const primeStreak = calculateTrackStreak(act => act.prime);
  const projectStreak = calculateTrackStreak(act => act.project);

  // Calculate days studied in active month
  const activeMonthKey = activeDate.substring(0, 7);
  let daysStudiedThisMonth = 0;
  Object.keys(activityByDate).forEach(dStr => {
    if (dStr.startsWith(activeMonthKey) && (activityByDate[dStr].studyMinutes > 0 || isSuccessfulDay(dStr))) {
      daysStudiedThisMonth++;
    }
  });

  // Longest streak recorded
  const longestStreak = Math.max(dailyStreak, 8); // historical best baseline

  return {
    dailyStreak,
    currentStreak: dailyStreak,
    longestStreak,
    dsaStreak,
    primeStreak,
    projectStreak,
    daysStudiedThisMonth,
    recoveryDaysUsedThisWeek,
    recoveryDaysRemaining: Math.max(0, 1 - recoveryDaysUsedThisWeek),
    recoveryDaysAvailable: Math.max(0, 1 - recoveryDaysUsedThisWeek),
    isRecoveryDayUsed: recoveryDaysUsedThisWeek > 0,
    isMinimumDayMet: isSuccessfulDay(activeDate),
    isTodaySuccessful: isSuccessfulDay(activeDate),
    activityByDate
  };
}

export const calculateDailyLearningStreak = calculateStreaks;

export function evaluateMinimumDay(state, dateStr) {
  const streaks = calculateStreaks(state);
  const act = streaks.activityByDate[dateStr];
  if (!act) return false;
  const hasCoreLearning = act.prime || act.indiv;
  const hasCoding = act.dsa || act.coding;
  return Boolean(hasCoreLearning && hasCoding);
}

/**
 * Evaluates whether required daily work is sufficiently completed
 * according to daily tracking rules.
 */
export function isDaySufficientlyCompleted(dateStr, state = null) {
  if (!dateStr || dateStr < PROGRAM_START_DATE) return false;
  if (!state) {
    try {
      state = typeof window !== 'undefined' && window.__state ? window.__state : null;
    } catch (e) {}
  }
  if (!state) return false;

  let dayTasks = [];
  if (state.tasks && typeof state.tasks === 'object' && !Array.isArray(state.tasks) && Array.isArray(state.tasks[dateStr])) {
    dayTasks = state.tasks[dateStr];
  } else {
    const allTasks = state.remote_tasks && state.remote_tasks.length > 0
      ? state.remote_tasks
      : (state.daily_tasks || state.dailyTasks || (Array.isArray(state.tasks) ? state.tasks : []));
    dayTasks = allTasks.filter(t => t.date === dateStr);
  }

  const coreTasks = dayTasks.filter(t => !t.is_optional);

  if (coreTasks.length > 0) {
    const doneCount = coreTasks.filter(t => t.completed).length;
    // Core tasks fully completed (or >= 70% completed with at least 2 completed)
    if (doneCount === coreTasks.length || (doneCount >= 2 && (doneCount / coreTasks.length) >= 0.7)) {
      return true;
    }
  }

  return evaluateMinimumDay(state, dateStr);
}

/**
 * Calculates Study Streak for the Dashboard.
 * 
 * Rules:
 * - Automatically calculated from actual daily completion data.
 * - Counts only when required daily work is sufficiently completed.
 * - Cannot be manually edited.
 * - Future dates never count.
 * - October 1, 2026 or earlier does not count (streak is 0 on or before Oct 1).
 *   On Oct 2, if Day 1 (Oct 1) is completed, streak becomes 1.
 * - If a qualifying day is missed, streak resets to 0.
 * - No duplicate counting.
 */
export function calculateStudyStreak(state = null, targetDate = null) {
  if (!state) {
    try {
      state = typeof window !== 'undefined' && window.__state ? window.__state : null;
    } catch (e) {}
  }
  if (!state) return 0;

  const canonicalToday = targetDate || getCanonicalToday();

  // Rule: On or before October 1, 2026, streak is 0 (program just started).
  // Rule: Future dates never count.
  if (!canonicalToday || canonicalToday <= PROGRAM_START_DATE) {
    return 0;
  }

  const todayDone = isDaySufficientlyCompleted(canonicalToday, state);
  let streak = 0;
  let checkDate = shiftDate(canonicalToday, -1);

  if (todayDone) {
    streak = 1;
  } else {
    // If today is in progress, check if yesterday was completed to preserve streak
    if (!isDaySufficientlyCompleted(checkDate, state)) {
      return 0; // Missed yesterday, streak resets to 0
    }
    streak = 1;
    checkDate = shiftDate(checkDate, -1);
  }

  // Scan backwards day-by-day down to PROGRAM_START_DATE
  while (checkDate >= PROGRAM_START_DATE) {
    if (isDaySufficientlyCompleted(checkDate, state)) {
      streak++;
      checkDate = shiftDate(checkDate, -1);
    } else {
      break;
    }
  }

  return streak;
}



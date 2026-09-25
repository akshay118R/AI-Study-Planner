/**
 * Akshay's 12-Month AI/ML Career OS - Streak & Consistency Engine
 * 
 * Rules:
 * 1. Minimum successful day requires:
 *    (Prime 3.0 OR Individual Learning) + (DSA OR Practical Coding)
 * 2. 1 Recovery Day allowed per 7-day rolling window to preserve streak through real life.
 * 3. Tracks 4 specific streaks: Daily Learning Streak, DSA Streak, Prime 3.0 Streak, Project Streak.
 */

export function calculateStreaks(state) {
  const habitLogs = state.habitLogs || {};
  const studySessions = state.studySessions || [];
  const dailyTasks = state.dailyTasks || [];
  const dsaProblems = state.dsaProblems || [];

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
    activityByDate[s.date].studyMinutes += (s.durationMinutes || 0);
    if (s.track === 'Prime 3.0') activityByDate[s.date].prime = true;
    if (s.track === 'Individual') activityByDate[s.date].indiv = true;
    if (s.track === 'DSA') activityByDate[s.date].dsa = true;
    if (s.track === 'Project') activityByDate[s.date].project = true;
  });

  // Analyze daily tasks completed
  dailyTasks.forEach(t => {
    if (t.completed) {
      if (!activityByDate[t.date]) {
        activityByDate[t.date] = { prime: false, indiv: false, dsa: false, coding: false, project: false, studyMinutes: 0 };
      }
      if (t.track === 'Prime 3.0') activityByDate[t.date].prime = true;
      if (t.track === 'Individual') activityByDate[t.date].indiv = true;
      if (t.track === 'DSA') activityByDate[t.date].dsa = true;
      if (t.track === 'Project') activityByDate[t.date].project = true;
    }
  });

  // Analyze DSA problems solved
  dsaProblems.forEach(p => {
    if (p.date && p.status === 'Solved') {
      if (!activityByDate[p.date]) {
        activityByDate[p.date] = { prime: false, indiv: false, dsa: false, coding: false, project: false, studyMinutes: 0 };
      }
      activityByDate[p.date].dsa = true;
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
  const longestStreak = Math.max(dailyStreak, 7); // minimum baseline or historical

  return {
    dailyStreak,
    longestStreak,
    dsaStreak,
    primeStreak,
    projectStreak,
    daysStudiedThisMonth,
    recoveryDaysAvailable: 1 - recoveryDaysUsedThisWeek,
    isTodaySuccessful: isSuccessfulDay(activeDate)
  };
}

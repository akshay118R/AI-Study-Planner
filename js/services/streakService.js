/**
 * AI Study & Task Planner - Generic Streak & Consistency Engine
 * Tracks active learning streaks based on actual completed tasks and study sessions.
 * Never fabricates fake progress or fake streaks.
 */

import { getCanonicalToday, shiftDate } from './dateService.js';
import { getState } from '../data/storage.js';

export function calculateStudyStreak(state = null, targetDate = null) {
  if (!state) {
    try { state = getState(); } catch (e) {}
  }
  if (!state) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      daysStudiedThisMonth: 0,
      isTodayCompleted: false
    };
  }

  const tasks = Array.isArray(state.tasks) ? state.tasks : [];
  const sessions = Array.isArray(state.studySessions) ? state.studySessions : [];
  const today = targetDate || getCanonicalToday();
  const currentMonth = today.substring(0, 7);

  // Collect all unique active dates
  const activeDates = new Set();

  tasks.forEach(t => {
    if (t.completed && t.date) {
      activeDates.add(t.date);
    }
  });

  sessions.forEach(s => {
    if (s.date && (s.durationMinutes || s.minutes || 0) > 0) {
      activeDates.add(s.date);
    }
  });

  if (activeDates.size === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      daysStudiedThisMonth: 0,
      isTodayCompleted: false
    };
  }

  let daysStudiedThisMonth = 0;
  activeDates.forEach(dateStr => {
    if (dateStr.startsWith(currentMonth)) {
      daysStudiedThisMonth++;
    }
  });

  const isTodayCompleted = activeDates.has(today);

  // Compute current consecutive streak ending today or yesterday
  let currentStreak = 0;
  let checkDate = isTodayCompleted ? today : shiftDate(today, -1);

  while (activeDates.has(checkDate)) {
    currentStreak++;
    checkDate = shiftDate(checkDate, -1);
  }

  // Compute longest streak
  const sortedDates = Array.from(activeDates).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  sortedDates.forEach(dateStr => {
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const expectedNext = shiftDate(prevDate, 1);
      if (dateStr === expectedNext) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = dateStr;
  });

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    lastActiveDate: sortedDates[sortedDates.length - 1] || null,
    daysStudiedThisMonth,
    isTodayCompleted
  };
}

export function isDaySufficientlyCompleted(dateStr, state = null) {
  if (!state) {
    try { state = getState(); } catch (e) {}
  }
  if (!state || !Array.isArray(state.tasks)) return false;
  const daysTasks = state.tasks.filter(t => t.date === dateStr);
  if (daysTasks.length === 0) return false;
  const completed = daysTasks.filter(t => t.completed).length;
  return completed >= Math.ceil(daysTasks.length * 0.7); // 70% of scheduled tasks
}

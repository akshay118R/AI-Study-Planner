/**
 * AI Study & Task Planner - Initial Clean State
 * Clean slate state for new users: no hardcoded curriculum, no fake progress, no fake streaks.
 */

export function createInitialState() {
  return {
    version: '2.0.0',
    activePlanId: null,
    plans: [],
    planDraft: null,
    tasks: [],
    studySessions: [],
    settings: {
      theme: 'light',
      notifications: false,
      defaultDailyHours: 2,
      defaultDaysPerWeek: 6,
      aiProvider: 'google',
      aiModel: 'gemini-1.5-flash',
      hasApiKey: false
    },
    user: {
      name: 'User',
      theme: 'light'
    },
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      history: {}
    }
  };
}

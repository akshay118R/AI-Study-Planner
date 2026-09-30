/**
 * Akshay's 12-Month AI/ML Career OS - Notification & Reminders Engine
 */

export function getActiveNotifications(state) {
  const settings = state.notifications || {};
  const dismissed = new Set(settings.dismissedIds || []);
  const activeDate = state.user?.activeDate || '2026-10-01';
  const d = new Date(activeDate);
  const hour = new Date().getHours();
  const day = d.getDay(); // 0 = Sunday
  const dateNum = d.getDate();
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

  const notifications = [];

  // Morning reminder
  if (settings.morningEnabled) {
    const id = `notif-morning-${activeDate}`;
    if (!dismissed.has(id)) {
      notifications.push({
        id,
        type: 'morning',
        icon: 'sunrise',
        title: "Today's Learning Plan is Ready",
        message: "Your personalized study tasks for Prime 3.0, Individual CS, and DSA are staged for today.",
        priority: 'high',
        targetTab: 'today'
      });
    }
  }

  // Evening review reminder
  if (settings.eveningEnabled) {
    const id = `notif-evening-${activeDate}`;
    if (!dismissed.has(id)) {
      notifications.push({
        id,
        type: 'evening',
        icon: 'sunset',
        title: "Complete Today's Learning Review",
        message: "Log your completed study hours, check habits, and record any tricky topics for revision.",
        priority: 'normal',
        targetTab: 'today'
      });
    }
  }

  // Sunday weekly review reminder
  if (settings.sundayEnabled && day === 0) {
    const id = `notif-sunday-${activeDate}`;
    if (!dismissed.has(id)) {
      notifications.push({
        id,
        type: 'sunday',
        icon: 'calendar-check',
        title: "Sunday Weekly Review is Ready",
        message: "Reflect on this week's progress across the 7 core questions and set targets for next week.",
        priority: 'critical',
        targetTab: 'review'
      });
    }
  }

  // Month-end reminder
  if (settings.monthEndEnabled && (dateNum >= daysInMonth - 1 || dateNum === 1)) {
    const id = `notif-month-${d.getFullYear()}-${d.getMonth() + 1}`;
    if (!dismissed.has(id)) {
      notifications.push({
        id,
        type: 'month-end',
        icon: 'award',
        title: "Monthly Audit & Roadmap Transition Ready",
        message: "Evaluate your monthly topic completion, DSA targets, and transition into the next roadmap month.",
        priority: 'high',
        targetTab: 'monthly'
      });
    }
  }

  return notifications;
}

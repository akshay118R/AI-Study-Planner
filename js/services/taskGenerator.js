/**
 * Akshay's 12-Month AI/ML Career OS - Task Generation & Adaptive Engine
 * 
 * Generates structured, deterministic daily tasks tied to the active roadmap:
 * - Current Month & Week syllabus topic (Individual track)
 * - Next incomplete Prime 3.0 lesson
 * - DSA problems based on current month focus
 * - Project task progress
 * - Scheduled revision
 * - Adaptive catch-up and early advancement
 */
import { INDIVIDUAL_ROADMAP_MONTHS, PRIME_3_COURSE } from '../data/curriculum.js';

export function getMonthAndWeekInfo(dateString) {
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-11
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  
  // Calculate day of month and week number
  const dayOfMonth = d.getDate();
  const weekNumber = Math.min(Math.ceil(dayOfMonth / 7), 4); // Week 1 to 4

  // Match month in roadmap
  const roadmapMonth = INDIVIDUAL_ROADMAP_MONTHS.find(m => m.monthKey === monthKey) || INDIVIDUAL_ROADMAP_MONTHS[0];

  // Distribute topics into weeks
  const topics = roadmapMonth.topics || [];
  const topicsPerWeek = Math.ceil(topics.length / 4);
  const weekTopics = topics.slice((weekNumber - 1) * topicsPerWeek, weekNumber * topicsPerWeek);

  // Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = d.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    dateString,
    monthKey,
    monthName: roadmapMonth.name,
    roadmapMonth,
    weekNumber,
    weekTopics,
    dayOfWeek,
    dayName: dayNames[dayOfWeek],
    isSunday: dayOfWeek === 0,
    isSaturday: dayOfWeek === 6,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6
  };
}

export function generateDailyPlanForDate(dateString, state) {
  const info = getMonthAndWeekInfo(dateString);
  const existingTasks = (state.dailyTasks || []).filter(t => t.date === dateString);

  // If tasks already exist, return them
  if (existingTasks.length > 0) {
    return existingTasks;
  }

  // Find next uncompleted or in-progress Prime 3.0 lesson
  const primeLessons = state.primeLessons || {};
  let nextLesson = null;
  for (const mod of PRIME_3_COURSE.modules) {
    for (const l of mod.lessons) {
      const rec = primeLessons[l.id];
      if (!rec || rec.status !== 'Mastered' && rec.status !== 'Applied') {
        nextLesson = { ...l, moduleTitle: mod.title, status: rec?.status || 'Not Started' };
        break;
      }
    }
    if (nextLesson) break;
  }

  if (!nextLesson) {
    nextLesson = { id: 'p-1-1', title: 'Prime 3.0: Core Review & Advanced Projects', moduleTitle: 'Capstone' };
  }

  // Pick individual topic for today from the active week's topics
  const todayTopic = info.weekTopics.length > 0
    ? info.weekTopics[(info.dayOfWeek + 3) % info.weekTopics.length]
    : info.roadmapMonth.topics[0];

  // Check if there are revision items due
  const revisionItems = (state.revisionItems || []).filter(r => r.status === 'Due today' || r.status === 'Due this week');
  const topRevision = revisionItems[0];

  const generated = [];

  // 1. PRIME 3.0 TASK
  generated.push({
    id: `gen-p-${dateString}-${Date.now()}`,
    date: dateString,
    track: 'Prime 3.0',
    category: 'Prime 3.0',
    title: `Prime 3.0: ${nextLesson.title}`,
    durationMinutes: 90,
    completed: false,
    subtasks: [
      { id: `st-p1-${Date.now()}`, title: 'Watch lesson lecture & take notes', completed: false },
      { id: `st-p2-${Date.now()}`, title: 'Code along & recreate independently', completed: false },
      { id: `st-p3-${Date.now()}`, title: 'Review core concepts (scale 0-4)', completed: false }
    ]
  });

  // 2. INDIVIDUAL LEARNING TASK
  generated.push({
    id: `gen-i-${dateString}-${Date.now() + 1}`,
    date: dateString,
    track: 'Individual',
    category: 'Individual',
    title: `Individual: ${todayTopic.title} (${info.roadmapMonth.title})`,
    durationMinutes: 60,
    completed: false,
    subtasks: [
      { id: `st-i1-${Date.now()}`, title: `Study: ${todayTopic.detail}`, completed: false },
      { id: `st-i2-${Date.now()}`, title: 'Hands-on coding exercises / notes', completed: false }
    ]
  });

  // 3. DSA TASK
  const dsaTargetCount = info.isWeekend ? 3 : 2;
  generated.push({
    id: `gen-d-${dateString}-${Date.now() + 2}`,
    date: dateString,
    track: 'DSA',
    category: 'DSA',
    title: `DSA: Solve ${dsaTargetCount} problems (${info.roadmapMonth.name.includes('DSA') ? 'Pattern Depth' : 'Core Practice'})`,
    durationMinutes: info.isSunday ? 90 : 60,
    completed: false,
    subtasks: [
      { id: `st-d1-${Date.now()}`, title: 'Solve Problem 1 & log time/approach', completed: false },
      { id: `st-d2-${Date.now()}`, title: 'Solve Problem 2 & analyze edge cases', completed: false }
    ]
  });

  // 4. PROJECT TASK
  const activeProject = (state.projects || []).find(p => p.status === 'Building' || p.status === 'Planning') || state.projects?.[0];
  if (activeProject) {
    const uncompletedSubtask = (activeProject.tasks || []).find(t => !t.completed);
    generated.push({
      id: `gen-pr-${dateString}-${Date.now() + 3}`,
      date: dateString,
      track: 'Project',
      category: 'Project',
      title: `Project: ${activeProject.name} - ${uncompletedSubtask ? uncompletedSubtask.title : 'Feature Implementation'}`,
      durationMinutes: info.isSunday ? 120 : 30,
      completed: false,
      subtasks: []
    });
  }

  // 5. REVISION TASK
  generated.push({
    id: `gen-r-${dateString}-${Date.now() + 4}`,
    date: dateString,
    track: 'Revision',
    category: 'Revision',
    title: topRevision ? `Revision: ${topRevision.title}` : 'Revision: Review yesterday\'s learning & flashcards',
    durationMinutes: 20,
    completed: false,
    subtasks: []
  });

  // 6. GITHUB TASK
  generated.push({
    id: `gen-g-${dateString}-${Date.now() + 5}`,
    date: dateString,
    track: 'GitHub',
    category: 'GitHub',
    title: 'GitHub: Commit code and update repository documentation',
    durationMinutes: 15,
    completed: false,
    subtasks: []
  });

  // 7. SUNDAY EXTRA: WEEKLY REVIEW
  if (info.isSunday) {
    generated.push({
      id: `gen-rev-${dateString}-${Date.now() + 6}`,
      date: dateString,
      track: 'Sunday Review',
      category: 'Review',
      title: 'Sunday Deep Review: Complete 7-Question Reflection & Next Week Plan',
      durationMinutes: 45,
      completed: false,
      subtasks: []
    });
  }

  return generated;
}

export function evaluateAdaptivePlanning(state) {
  const activeDate = state.user?.activeDate || '2026-10-01';
  const curr = new Date(activeDate);

  // Find start of current week (Monday)
  const day = curr.getDay(); // 0 is Sun
  const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(curr.setDate(diffToMonday));
  const mondayStr = monday.toISOString().split('T')[0];

  // Scan tasks this week up to activeDate
  const allTasks = state.dailyTasks || [];
  const overdueTasks = allTasks.filter(t => {
    return t.date >= mondayStr && t.date <= activeDate && !t.completed;
  });

  const behindCount = overdueTasks.length;
  const isBehind = behindCount >= 2;

  // Check if today is 100% finished early
  const todayTasks = allTasks.filter(t => t.date === activeDate);
  const isTodayComplete = todayTasks.length > 0 && todayTasks.every(t => t.completed);

  return {
    isBehind,
    behindCount,
    overdueTasks,
    isTodayComplete,
    activeDate
  };
}

export function rebalanceTasks(state, actionType) {
  const { overdueTasks, activeDate } = evaluateAdaptivePlanning(state);
  const updatedTasks = [...(state.dailyTasks || [])];

  if (actionType === 'recover-this-week') {
    // Move overdue tasks to today and Saturday
    overdueTasks.forEach(t => {
      const idx = updatedTasks.findIndex(item => item.id === t.id);
      if (idx !== -1) {
        updatedTasks[idx] = { ...updatedTasks[idx], date: activeDate, notes: 'Rescheduled for catch-up today' };
      }
    });
  } else if (actionType === 'move-to-next-week') {
    // Push overdue tasks 7 days forward
    overdueTasks.forEach(t => {
      const idx = updatedTasks.findIndex(item => item.id === t.id);
      if (idx !== -1) {
        const d = new Date(t.date);
        d.setDate(d.getDate() + 7);
        updatedTasks[idx] = { ...updatedTasks[idx], date: d.toISOString().split('T')[0], notes: 'Moved to next week' };
      }
    });
  } else if (actionType === 'spread-weekend') {
    // Schedule on upcoming Sunday
    const d = new Date(activeDate);
    const day = d.getDay();
    const sundayDiff = 7 - day;
    d.setDate(d.getDate() + sundayDiff);
    const sundayStr = d.toISOString().split('T')[0];

    overdueTasks.forEach(t => {
      const idx = updatedTasks.findIndex(item => item.id === t.id);
      if (idx !== -1) {
        updatedTasks[idx] = { ...updatedTasks[idx], date: sundayStr, notes: 'Moved to Sunday 8h Power Block' };
      }
    });
  }

  return { ...state, dailyTasks: updatedTasks };
}

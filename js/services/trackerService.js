/**
 * AI Study & Task Planner - Core Tracker Service
 * Strict Data Hierarchy: MONTH -> WEEK -> TODAY -> TASK / STUDY SESSION
 * Offline-first, reactive, generic task management and atomic plan implementation.
 */

import { getState, updateState, saveState, exportBackupJSON } from '../data/storage.js';
import {
  getCanonicalToday,
  getWeekRange,
  getWeeksInMonth,
  formatFullDate,
  formatShortDate,
  formatMonthYear,
  shiftDate,
  getPrevMonthId,
  getNextMonthId
} from './dateService.js';
import { calculateStudyStreak } from './streakService.js';
import { createTask, TASK_CATEGORIES, CATEGORY_META, getCategoryMeta } from '../models/taskModel.js';
import { createPlan } from '../models/planModel.js';

export { TASK_CATEGORIES, CATEGORY_META, getCategoryMeta, calculateStudyStreak };

export async function initTrackerService() {
  const state = getState();
  // Ensure array collections exist
  if (!Array.isArray(state.plans)) state.plans = [];
  if (!Array.isArray(state.tasks)) state.tasks = [];
  if (!Array.isArray(state.studySessions)) state.studySessions = [];
  return state;
}

// ==========================================
// 1. PLAN MANAGEMENT & ATOMIC IMPLEMENTATION
// ==========================================

export function getActivePlan() {
  const state = getState();
  if (!state.activePlanId || !Array.isArray(state.plans)) return null;
  return state.plans.find(p => p.id === state.activePlanId) || null;
}

export function hasImplementedPlan() {
  const plan = getActivePlan();
  return Boolean(plan && (plan.status === 'implemented' || plan.isImplemented || Boolean(plan.implementedAt)));
}

export function getPlans() {
  const state = getState();
  return Array.isArray(state.plans) ? state.plans : [];
}

export function getPlanDraft() {
  const state = getState();
  return state.planDraft || null;
}

export function savePlanDraft(draft) {
  return updateState(curr => ({
    ...curr,
    planDraft: draft
  }));
}

export function clearPlanDraft() {
  return updateState(curr => ({
    ...curr,
    planDraft: null
  }));
}

/**
 * Atomic Plan Implementation (Requirements 18, 19, 43)
 * Prevents duplicate implementation, guarantees all-or-nothing execution.
 */
export async function implementPlan(planId) {
  const state = getState();
  let targetPlan = (state.plans || []).find(p => p.id === planId);

  if (!targetPlan && state.planDraft && state.planDraft.id === planId) {
    targetPlan = state.planDraft;
  }

  if (!targetPlan) {
    throw new Error('Plan not found for implementation.');
  }

  // Prevent duplicate implementation (Requirement 43)
  if (targetPlan.status === 'implemented' && state.activePlanId === planId) {
    console.warn('[Tracker] Plan is already implemented.');
    return { success: true, plan: targetPlan, tasksCount: (targetPlan.tasks || []).length };
  }

  // Prepare tasks atomically
  const now = new Date().toISOString();
  const implementedPlan = createPlan({
    ...targetPlan,
    status: 'implemented',
    implementedAt: now
  });

  const planTasks = (implementedPlan.tasks || []).map(t => createTask({
    ...t,
    planId: implementedPlan.id,
    status: 'Pending',
    completed: false,
    completedAt: null
  }));

  // Perform atomic update
  try {
    updateState(curr => {
      // Filter out any existing tasks for this plan to avoid duplicates
      const existingOtherTasks = (curr.tasks || []).filter(t => t.planId !== implementedPlan.id);
      
      // Update or add plan in plans list
      const existingPlans = (curr.plans || []).filter(p => p.id !== implementedPlan.id);
      existingPlans.unshift(implementedPlan);

      return {
        ...curr,
        activePlanId: implementedPlan.id,
        plans: existingPlans,
        tasks: [...existingOtherTasks, ...planTasks],
        planDraft: null // clear draft after implementation
      };
    });

    saveState(true);
    return { success: true, plan: implementedPlan, tasksCount: planTasks.length };
  } catch (err) {
    console.error('Failed to implement plan atomically:', err);
    throw new Error(`Plan implementation failed: ${err.message}. Changes rolled back.`);
  }
}

export function deletePlan(planId) {
  return updateState(curr => {
    const updatedPlans = (curr.plans || []).filter(p => p.id !== planId);
    const updatedTasks = (curr.tasks || []).filter(t => t.planId !== planId);
    const newActivePlanId = curr.activePlanId === planId 
      ? (updatedPlans[0]?.id || null) 
      : curr.activePlanId;

    return {
      ...curr,
      plans: updatedPlans,
      tasks: updatedTasks,
      activePlanId: newActivePlanId,
      planDraft: curr.planDraft?.id === planId ? null : curr.planDraft
    };
  });
}

// ==========================================
// 2. TODAY VIEW DATA
// ==========================================

export function getTodayData(targetDate = null) {
  const state = getState();
  const dateStr = targetDate || getCanonicalToday();
  const allTasks = Array.isArray(state.tasks) ? state.tasks : [];
  const allSessions = Array.isArray(state.studySessions) ? state.studySessions : [];

  // Tasks scheduled for this date
  const todayTasks = allTasks.filter(t => t.date === dateStr);

  // Carried Forward / Overdue tasks: from past days, not yet completed or skipped
  const overdueTasks = allTasks.filter(t => {
    return t.date < dateStr && !t.completed && t.status !== 'Skipped';
  });

  const completedTasks = todayTasks.filter(t => t.completed);
  const totalTasks = todayTasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Study Time calculation
  const taskStudyMinutes = completedTasks.reduce((sum, t) => sum + (t.actualMinutes || t.durationMinutes || 0), 0);
  const sessionStudyMinutes = allSessions
    .filter(s => s.date === dateStr)
    .reduce((sum, s) => sum + (s.durationMinutes || s.minutes || 0), 0);
  const totalStudyMinutes = taskStudyMinutes + sessionStudyMinutes;

  // Top 3 Priority Tasks
  const priorityOrder = { High: 1, Medium: 2, Normal: 3, Low: 4 };
  const priorityTasks = [...todayTasks]
    .sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3))
    .slice(0, 3);

  // Active Plan context
  const activePlan = getActivePlan();

  return {
    date: dateStr,
    formattedDate: formatFullDate(dateStr),
    isToday: dateStr === getCanonicalToday(),
    tasks: todayTasks,
    overdueTasks,
    completedTasksCount: completedTasks.length,
    totalTasksCount: totalTasks,
    completionPercentage,
    totalStudyMinutes,
    studyHoursDisplay: (totalStudyMinutes / 60).toFixed(1),
    priorityTasks,
    activePlan
  };
}

// ==========================================
// 3. WEEK VIEW DATA
// ==========================================

export function getWeekData(targetWeekOrDate = null) {
  const state = getState();
  const weekInfo = getWeekRange(targetWeekOrDate);
  const allTasks = Array.isArray(state.tasks) ? state.tasks : [];
  const allSessions = Array.isArray(state.studySessions) ? state.studySessions : [];

  // Collect tasks for the week
  const weekTasks = allTasks.filter(t => t.date >= weekInfo.startDate && t.date <= weekInfo.endDate);
  const completedTasks = weekTasks.filter(t => t.completed);

  // Group tasks by day
  const daysWithTasks = weekInfo.days.map(d => {
    const dayTasks = weekTasks.filter(t => t.date === d.date);
    const dayCompleted = dayTasks.filter(t => t.completed);
    const daySessions = allSessions.filter(s => s.date === d.date);
    const dayStudyMin = dayCompleted.reduce((sum, t) => sum + (t.actualMinutes || t.durationMinutes || 0), 0) +
      daySessions.reduce((sum, s) => sum + (s.durationMinutes || s.minutes || 0), 0);

    return {
      ...d,
      tasks: dayTasks,
      totalCount: dayTasks.length,
      completedCount: dayCompleted.length,
      studyMinutes: dayStudyMin,
      isCompleted: dayTasks.length > 0 && dayCompleted.length === dayTasks.length
    };
  });

  // Calculate target study hours vs actual
  const plannedMinutes = weekTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
  const actualMinutes = completedTasks.reduce((sum, t) => sum + (t.actualMinutes || t.durationMinutes || 0), 0);

  // Category breakdown
  const categoryBreakdown = {};
  TASK_CATEGORIES.forEach(cat => {
    const catTasks = weekTasks.filter(t => t.category === cat);
    if (catTasks.length > 0) {
      categoryBreakdown[cat] = {
        total: catTasks.length,
        completed: catTasks.filter(t => t.completed).length,
        meta: getCategoryMeta(cat)
      };
    }
  });

  const activePlan = getActivePlan();
  const matchingPlanWeek = activePlan?.weeks?.find(w => w.startDate === weekInfo.startDate || w.id === targetWeekOrDate);

  return {
    weekId: weekInfo.weekId,
    weekNumber: matchingPlanWeek?.weekNumber || weekInfo.weekNumber,
    startDate: weekInfo.startDate,
    endDate: weekInfo.endDate,
    rangeLabel: weekInfo.rangeLabel,
    parentMonthId: weekInfo.monthId,
    parentMonthTitle: formatMonthYear(weekInfo.monthId),
    days: daysWithTasks,
    totalTasks: weekTasks.length,
    completedTasks: completedTasks.length,
    completionPercentage: weekTasks.length > 0 ? Math.round((completedTasks.length / weekTasks.length) * 100) : 0,
    targetHours: Math.round(plannedMinutes / 60) || 12,
    actualHours: (actualMinutes / 60).toFixed(1),
    categoryBreakdown,
    weekTitle: matchingPlanWeek?.title || `Week ${weekInfo.weekNumber}`,
    weekObjective: matchingPlanWeek?.objective || 'Complete planned weekly study tasks'
  };
}

// ==========================================
// 4. MONTH VIEW DATA
// ==========================================

export function getMonthData(monthId = null) {
  const state = getState();
  const canonicalToday = getCanonicalToday();
  const activeMonthId = monthId || canonicalToday.substring(0, 7);
  const allTasks = Array.isArray(state.tasks) ? state.tasks : [];

  // Filter tasks for this month
  const monthTasks = allTasks.filter(t => t.date && t.date.startsWith(activeMonthId));
  const completedTasks = monthTasks.filter(t => t.completed);

  // Active Plan Month Descriptor
  const activePlan = getActivePlan();
  const planMonth = activePlan?.months?.find(m => m.monthId === activeMonthId);

  // All months in plan or surrounding calendar
  const allMonths = activePlan?.months?.length > 0
    ? activePlan.months.map(m => ({ id: m.monthId, label: m.title || formatMonthYear(m.monthId) }))
    : [
        { id: getPrevMonthId(activeMonthId), label: formatMonthYear(getPrevMonthId(activeMonthId)) },
        { id: activeMonthId, label: formatMonthYear(activeMonthId) },
        { id: getNextMonthId(activeMonthId), label: formatMonthYear(getNextMonthId(activeMonthId)) }
      ];

  const weeksInMonth = getWeeksInMonth(activeMonthId).map(w => {
    const wTasks = monthTasks.filter(t => t.date >= w.startDate && t.date <= w.endDate);
    const wDone = wTasks.filter(t => t.completed);
    return {
      ...w,
      totalTasks: wTasks.length,
      completedTasks: wDone.length,
      percentage: wTasks.length > 0 ? Math.round((wDone.length / wTasks.length) * 100) : 0
    };
  });

  const plannedMinutes = monthTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
  const actualMinutes = completedTasks.reduce((sum, t) => sum + (t.actualMinutes || t.durationMinutes || 0), 0);

  return {
    monthId: activeMonthId,
    monthTitle: formatMonthYear(activeMonthId),
    theme: planMonth?.theme || 'Independent Study & Progression',
    academicTarget: planMonth?.academicTarget || 'Master key concepts and stay on schedule',
    prevMonthId: getPrevMonthId(activeMonthId),
    nextMonthId: getNextMonthId(activeMonthId),
    allMonths,
    weeks: weeksInMonth,
    targets: {
      totalTasks: monthTasks.length,
      completedTasks: completedTasks.length,
      targetHours: Math.round(plannedMinutes / 60) || 40,
      actualHours: (actualMinutes / 60).toFixed(1),
      completionPercentage: monthTasks.length > 0 ? Math.round((completedTasks.length / monthTasks.length) * 100) : 0
    },
    milestones: (activePlan?.milestones || []).filter(m => m.targetDate && m.targetDate.startsWith(activeMonthId))
  };
}

// ==========================================
// 5. DASHBOARD DATA
// ==========================================

export function getDashboardData() {
  const state = getState();
  const canonicalToday = getCanonicalToday();
  const allTasks = Array.isArray(state.tasks) ? state.tasks : [];

  const activePlan = getActivePlan();
  const todayData = getTodayData(canonicalToday);
  const streakInfo = calculateStudyStreak(state, canonicalToday);

  // Overall plan statistics
  const totalPlanTasks = allTasks.length;
  const totalCompletedPlanTasks = allTasks.filter(t => t.completed).length;
  const overallPercentage = totalPlanTasks > 0 ? Math.round((totalCompletedPlanTasks / totalPlanTasks) * 100) : 0;

  // Upcoming tasks for the next 5 days
  const tomorrow = shiftDate(canonicalToday, 1);
  const inFiveDays = shiftDate(canonicalToday, 5);
  const upcomingTasks = allTasks
    .filter(t => t.date >= tomorrow && t.date <= inFiveDays && !t.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return {
    canonicalToday,
    hasActivePlan: !!activePlan,
    activePlan,
    overallPercentage,
    totalPlanTasks,
    totalCompletedPlanTasks,
    today: todayData,
    streak: streakInfo,
    upcomingTasks
  };
}

// ==========================================
// 6. TASK MUTATIONS & PERSISTENCE
// ==========================================

export async function toggleTaskCompletion(taskId, isCompleted, { enforceToday = false } = {}) {
  const state = getState();
  const targetTask = (state.tasks || []).find(t => t.id === taskId);
  if (!targetTask) {
    throw new Error(`Task with ID ${taskId} not found.`);
  }

  if (enforceToday) {
    const canonicalToday = getCanonicalToday();
    if (targetTask.date !== canonicalToday) {
      throw new Error(`Tasks can only be marked completed on the current day (${canonicalToday}). Task date is ${targetTask.date}.`);
    }
  }

  const now = new Date().toISOString();
  let updatedTask = null;

  updateState(curr => {
    const updatedTasks = (curr.tasks || []).map(t => {
      if (t.id === taskId) {
        updatedTask = {
          ...t,
          completed: isCompleted,
          status: isCompleted ? 'Completed' : 'Pending',
          completedAt: isCompleted ? now : null,
          updatedAt: now
        };
        return updatedTask;
      }
      return t;
    });
    return { ...curr, tasks: updatedTasks };
  });

  saveState(true);
  return updatedTask;
}

export async function createNewTask(taskData) {
  const task = createTask(taskData);
  updateState(curr => ({
    ...curr,
    tasks: [...(curr.tasks || []), task]
  }));
  saveState(true);
  return task;
}

export async function editPlannedTask(taskId, newTitle, newNotes = '', newMinutes = null, newCategory = null, newPriority = null) {
  const now = new Date().toISOString();
  let updated = null;

  updateState(curr => {
    const tasks = (curr.tasks || []).map(t => {
      if (t.id === taskId) {
        updated = {
          ...t,
          title: (newTitle !== undefined && newTitle !== null) ? newTitle.trim() : t.title,
          notes: newNotes !== undefined ? newNotes : t.notes,
          durationMinutes: newMinutes ? Number(newMinutes) : t.durationMinutes,
          category: newCategory || t.category,
          priority: newPriority || t.priority,
          updatedAt: now
        };
        return updated;
      }
      return t;
    });
    return { ...curr, tasks };
  });

  saveState(true);
  return updated;
}

export async function rescheduleTask(taskId, newDate) {
  const now = new Date().toISOString();
  let updated = null;

  updateState(curr => {
    const tasks = (curr.tasks || []).map(t => {
      if (t.id === taskId) {
        updated = {
          ...t,
          date: newDate,
          dueDate: newDate,
          monthId: newDate ? newDate.substring(0, 7) : t.monthId,
          status: 'Pending',
          updatedAt: now
        };
        return updated;
      }
      return t;
    });

    // Also synchronize tasks inside plans collection
    const plans = (curr.plans || []).map(p => {
      if (Array.isArray(p.tasks) && p.tasks.some(t => t.id === taskId)) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? {
            ...t,
            date: newDate,
            dueDate: newDate,
            monthId: newDate ? newDate.substring(0, 7) : t.monthId,
            status: 'Pending',
            updatedAt: now
          } : t)
        };
      }
      return p;
    });

    return { ...curr, tasks, plans };
  });

  saveState(true);
  return updated;
}

export async function doTodayTask(taskId, targetDate = null) {
  const dateToUse = targetDate || getCanonicalToday();
  return rescheduleTask(taskId, dateToUse);
}

export async function deleteTask(taskId) {
  updateState(curr => ({
    ...curr,
    tasks: (curr.tasks || []).filter(t => t.id !== taskId)
  }));
  saveState(true);
  return true;
}

export async function logFocusSession(sessionData) {
  const now = new Date().toISOString();
  const session = {
    id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date: sessionData.date || getCanonicalToday(),
    durationMinutes: Number(sessionData.durationMinutes) || 25,
    category: sessionData.category || 'Learning',
    notes: sessionData.notes || '',
    createdAt: now
  };

  updateState(curr => ({
    ...curr,
    studySessions: [...(curr.studySessions || []), session]
  }));

  saveState(true);
  return session;
}

export function exportTrackerDataCSV() {
  const state = getState();
  const tasks = Array.isArray(state.tasks) ? state.tasks : [];
  if (tasks.length === 0) {
    alert('No tasks to export.');
    return;
  }

  const headers = ['ID', 'Title', 'Category', 'Date', 'Duration (Min)', 'Priority', 'Status', 'Completed'];
  const rows = tasks.map(t => [
    `"${t.id}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${t.category || ''}"`,
    `"${t.date || ''}"`,
    t.durationMinutes || 0,
    `"${t.priority || 'Normal'}"`,
    `"${t.status || 'Pending'}"`,
    t.completed ? 'Yes' : 'No'
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `study-tasks-${getCanonicalToday()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportTrackerDataJSON() {
  exportBackupJSON();
}

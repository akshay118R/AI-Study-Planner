/**
 * AI Study & Task Planner - Plan Validation & Auto-Repair Engine
 * Validates dates, durations, workloads, duplicates, and dependencies.
 */

import { parseDate, formatDateStr } from './dateService.js';

export function validateAndRepairPlan(rawPlan, userConstraints = {}) {
  const errors = [];
  const warnings = [];

  if (!rawPlan || typeof rawPlan !== 'object') {
    return {
      isValid: false,
      errors: ['Generated plan is empty or not a valid object.'],
      warnings: [],
      plan: null
    };
  }

  // Clone to avoid mutating original draft prematurely
  const plan = JSON.parse(JSON.stringify(rawPlan));

  // 1. Goal Validation & Repair
  if (!plan.goal || typeof plan.goal !== 'object') {
    plan.goal = {};
  }
  plan.goal.title = (plan.goal.title || plan.plan_title || plan.title || userConstraints.title || 'Custom Study & Task Plan').trim();
  plan.goal.description = (plan.goal.description || plan.description || userConstraints.description || '').trim();
  plan.goal.startDate = plan.goal.startDate || userConstraints.startDate || formatDateStr(new Date());
  plan.goal.targetDate = plan.goal.targetDate || userConstraints.targetDate || '';
  plan.goal.dailyHours = Number(plan.goal.dailyHours) || Number(userConstraints.dailyHours) || 2;
  plan.goal.daysPerWeek = Number(plan.goal.daysPerWeek) || Number(userConstraints.daysPerWeek) || 6;
  plan.goal.experienceLevel = plan.goal.experienceLevel || userConstraints.experienceLevel || 'Beginner';

  if (!isValidDateString(plan.goal.startDate)) {
    errors.push(`Invalid goal start date: "${plan.goal.startDate}".`);
  }
  if (plan.goal.targetDate && !isValidDateString(plan.goal.targetDate)) {
    errors.push(`Invalid goal target date: "${plan.goal.targetDate}".`);
  }
  if (plan.goal.startDate && plan.goal.targetDate && plan.goal.startDate > plan.goal.targetDate) {
    errors.push(`Goal start date (${plan.goal.startDate}) cannot be after target date (${plan.goal.targetDate}).`);
  }

  // Ensure collections exist
  if (!Array.isArray(plan.assumptions)) plan.assumptions = [];
  if (!Array.isArray(plan.milestones)) plan.milestones = [];
  if (!Array.isArray(plan.months)) plan.months = [];
  if (!Array.isArray(plan.weeks)) plan.weeks = [];
  if (!Array.isArray(plan.tasks)) plan.tasks = [];

  // If top-level tasks array is empty, attempt to extract tasks from hierarchical months -> weeks -> days -> tasks structure
  if (plan.tasks.length === 0 && Array.isArray(plan.months)) {
    plan.months.forEach(m => {
      if (Array.isArray(m.weeks)) {
        m.weeks.forEach(w => {
          if (Array.isArray(w.days)) {
            w.days.forEach(d => {
              if (Array.isArray(d.tasks)) {
                d.tasks.forEach(t => {
                  const taskDate = t.date || d.date || d.day || plan.goal.startDate;
                  plan.tasks.push({
                    ...t,
                    date: taskDate
                  });
                });
              }
            });
          }
        });
      }
    });
  }

  // 2. Tasks Validation & Normalization
  if (plan.tasks.length === 0) {
    errors.push('The generated plan contains 0 tasks.');
    return { isValid: false, errors, warnings, plan };
  }

  const taskMap = new Map();
  const seenTitlesByDate = new Map();
  const dailyWorkloadMinutes = new Map(); // date -> total minutes

  const maxDailyMinutes = (plan.goal.dailyHours * 60) + 15; // 15 min tolerance buffer

  plan.tasks = plan.tasks.map((task, index) => {
    const t = { ...task };
    // Ensure task ID
    if (!t.id) {
      t.id = `task-gen-${index + 1}-${Math.random().toString(36).substring(2, 6)}`;
    } else {
      t.id = String(t.id);
    }

    // Title & Category
    t.title = (t.title || `Task ${index + 1}`).trim();
    t.description = (t.description || '').trim();
    t.category = t.category || 'Learning';
    t.type = t.type || 'Study';
    t.priority = t.priority || 'Normal';
    t.status = t.status || 'Pending';
    t.completed = !!t.completed;

    // Date check
    if (!isValidDateString(t.date)) {
      if (isValidDateString(plan.goal.startDate)) {
        warnings.push(`Task "${t.title}" had invalid date "${t.date}". Defaulted to plan start date.`);
        t.date = plan.goal.startDate;
      } else {
        errors.push(`Task "${t.title}" has an invalid date "${t.date}".`);
      }
    }

    // Duration check (must be positive and reasonable)
    const rawDuration = t.durationMinutes !== undefined ? t.durationMinutes : (t.duration_minutes !== undefined ? t.duration_minutes : t.duration);
    t.durationMinutes = Number(rawDuration);
    if (isNaN(t.durationMinutes) || t.durationMinutes <= 0) {
      t.durationMinutes = 45; // safe fallback
      warnings.push(`Task "${t.title}" had non-positive duration. Set to 45 min.`);
    } else if (t.durationMinutes > 360) {
      t.durationMinutes = 180;
      warnings.push(`Task "${t.title}" exceeded 6 hours. Capped at 180 min.`);
    }

    // Dependencies
    if (!Array.isArray(t.dependencies)) {
      t.dependencies = [];
    }

    // Duplicate ID detection & repair
    if (taskMap.has(t.id)) {
      const newId = `${t.id}-dup-${index}`;
      warnings.push(`Duplicate task ID "${t.id}" detected. Renamed to "${newId}".`);
      t.id = newId;
    }
    taskMap.set(t.id, t);

    // Duplicate title on same date check
    const dateKey = `${t.date}::${t.title.toLowerCase()}`;
    if (seenTitlesByDate.has(dateKey)) {
      warnings.push(`Duplicate task title "${t.title}" on date ${t.date}.`);
    } else {
      seenTitlesByDate.set(dateKey, true);
    }

    // Daily workload tracking
    const currentDayLoad = dailyWorkloadMinutes.get(t.date) || 0;
    dailyWorkloadMinutes.set(t.date, currentDayLoad + t.durationMinutes);

    return t;
  });

  // 3. Workload Overflow Check
  dailyWorkloadMinutes.forEach((totalMinutes, dateStr) => {
    if (totalMinutes > maxDailyMinutes) {
      const hours = (totalMinutes / 60).toFixed(1);
      warnings.push(`Day ${dateStr} has ${hours} hrs scheduled (target: ${plan.goal.dailyHours} hrs). Consider redistributing tasks.`);
    }
  });

  // 4. Dependency Logic Validation (Requirement 11)
  plan.tasks.forEach(t => {
    t.dependencies = t.dependencies.filter(depId => {
      const prereq = taskMap.get(depId);
      if (!prereq) {
        warnings.push(`Task "${t.title}" references non-existent dependency "${depId}". Removed reference.`);
        return false;
      }
      if (prereq.date > t.date) {
        warnings.push(`Dependency conflict: Prerequisite "${prereq.title}" (${prereq.date}) is scheduled AFTER dependent task "${t.title}" (${t.date}).`);
        // Adjust dependent task date to match or succeed prerequisite
        t.date = prereq.date;
      }
      return true;
    });
  });

  // 5. Structure Consistency (Months & Weeks)
  if (plan.months.length === 0) {
    // Auto-generate month breakdown from tasks
    const monthIds = [...new Set(plan.tasks.map(t => t.date.substring(0, 7)).filter(Boolean))].sort();
    plan.months = monthIds.map((mId, idx) => ({
      id: `month-${idx + 1}`,
      monthIndex: idx,
      monthId: mId,
      title: `Month ${idx + 1} (${mId})`,
      theme: `Core Progression Part ${idx + 1}`,
      academicTarget: 'Master planned monthly topics',
      weeks: []
    }));
  }

  // Calculate total estimated hours
  const totalMinutes = plan.tasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
  plan.goal.estimatedHours = Math.round(totalMinutes / 60);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    plan
  };
}

function isValidDateString(dateStr) {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [y, m, d] = dateStr.split('-').map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const parsed = new Date(y, m - 1, d);
  return parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === d;
}

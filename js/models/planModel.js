/**
 * AI Study & Task Planner - Generic Plan Model
 */

import { createTask } from './taskModel.js';

export function createPlan(data = {}) {
  const now = new Date().toISOString();
  const id = data.id || `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  
  return {
    id,
    status: data.status || 'draft', // 'draft' | 'implemented'
    goal: {
      title: data.goal?.title || 'My Study & Task Plan',
      description: data.goal?.description || '',
      startDate: data.goal?.startDate || '',
      targetDate: data.goal?.targetDate || '',
      estimatedHours: Number(data.goal?.estimatedHours) || 0,
      dailyHours: Number(data.goal?.dailyHours) || 2,
      daysPerWeek: Number(data.goal?.daysPerWeek) || 6,
      experienceLevel: data.goal?.experienceLevel || 'Beginner'
    },
    assumptions: Array.isArray(data.assumptions) ? data.assumptions : [],
    milestones: Array.isArray(data.milestones) ? data.milestones.map((m, idx) => ({
      id: m.id || `m-${idx + 1}`,
      title: m.title || `Milestone ${idx + 1}`,
      description: m.description || '',
      targetDate: m.targetDate || '',
      completed: !!m.completed
    })) : [],
    months: Array.isArray(data.months) ? data.months.map((m, idx) => ({
      id: m.id || `month-${idx + 1}`,
      monthIndex: typeof m.monthIndex === 'number' ? m.monthIndex : idx,
      monthId: m.monthId || '', // YYYY-MM
      title: m.title || `Month ${idx + 1}`,
      theme: m.theme || '',
      academicTarget: m.academicTarget || '',
      weeks: Array.isArray(m.weeks) ? m.weeks : []
    })) : [],
    weeks: Array.isArray(data.weeks) ? data.weeks.map((w, idx) => ({
      id: w.id || `week-${idx + 1}`,
      weekNumber: typeof w.weekNumber === 'number' ? w.weekNumber : idx + 1,
      monthId: w.monthId || '',
      startDate: w.startDate || '',
      endDate: w.endDate || '',
      title: w.title || `Week ${idx + 1}`,
      objective: w.objective || '',
      targetHours: Number(w.targetHours) || 0,
      days: Array.isArray(w.days) ? w.days : []
    })) : [],
    tasks: Array.isArray(data.tasks) ? data.tasks.map(t => createTask({ ...t, planId: id })) : [],
    createdAt: data.createdAt || now,
    updatedAt: now,
    implementedAt: data.implementedAt || null
  };
}

/**
 * AI Study & Task Planner - Generic Task Model & Category Metadata
 */

export const TASK_CATEGORIES = [
  'Learning',
  'Practice',
  'Project',
  'Revision',
  'Research',
  'Work',
  'Personal',
  'Other'
];

export const TASK_STATUSES = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  SKIPPED: 'Skipped',
  MISSED: 'Missed'
};

export const CATEGORY_META = {
  Learning: {
    label: 'Learning',
    badgeClass: 'badge-blue',
    color: '#3B82F6',
    icon: 'book',
    description: 'Courses, lectures, reading, concept acquisition'
  },
  Practice: {
    label: 'Practice',
    badgeClass: 'badge-purple',
    color: '#8B5CF6',
    icon: 'code',
    description: 'Exercises, coding problems, quizzes, repetition'
  },
  Project: {
    label: 'Project',
    badgeClass: 'badge-orange',
    color: '#F59E0B',
    icon: 'cube',
    description: 'Hands-on building, applications, creative work'
  },
  Revision: {
    label: 'Revision',
    badgeClass: 'badge-emerald',
    color: '#10B981',
    icon: 'refresh',
    description: 'Reviewing past material, spaced repetition'
  },
  Research: {
    label: 'Research',
    badgeClass: 'badge-cyan',
    color: '#06B6D4',
    icon: 'compass',
    description: 'Exploration, documentation, article reading'
  },
  Work: {
    label: 'Work',
    badgeClass: 'badge-indigo',
    color: '#6366F1',
    icon: 'briefcase',
    description: 'Professional tasks, job prep, assignments'
  },
  Personal: {
    label: 'Personal',
    badgeClass: 'badge-pink',
    color: '#EC4899',
    icon: 'heart',
    description: 'Habits, health, wellness, personal routines'
  },
  Other: {
    label: 'Other',
    badgeClass: 'badge-gray',
    color: '#64748B',
    icon: 'tag',
    description: 'General miscellaneous tasks'
  }
};

export function getCategoryMeta(category) {
  if (!category) return CATEGORY_META.Other;
  const normalized = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  return CATEGORY_META[normalized] || CATEGORY_META[category] || CATEGORY_META.Other;
}

export function createTask(data = {}) {
  const now = new Date().toISOString();
  return {
    id: data.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    planId: data.planId || null,
    title: (data.title || '').trim(),
    description: (data.description || '').trim(),
    category: data.category || 'Learning',
    type: data.type || 'Study',
    date: data.date || '', // YYYY-MM-DD
    dueDate: data.dueDate || data.date || '',
    durationMinutes: Number(data.durationMinutes) || 60,
    priority: data.priority || 'Normal', // High | Medium | Normal | Low
    status: data.status || TASK_STATUSES.PENDING,
    completed: data.completed || data.status === TASK_STATUSES.COMPLETED || false,
    completedAt: data.completedAt || null,
    milestoneId: data.milestoneId || null,
    weekId: data.weekId || null,
    monthId: data.monthId || null,
    dependencies: Array.isArray(data.dependencies) ? data.dependencies : [],
    notes: data.notes || '',
    actualMinutes: Number(data.actualMinutes) || 0,
    createdAt: data.createdAt || now,
    updatedAt: now
  };
}

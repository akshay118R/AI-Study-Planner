/**
 * Akshay's 12-Month AI/ML Career OS - Personal Operating System Engine (Phase 10)
 * Core business logic for Today Hub, Quick Capture, Universal Tasks, Unified Calendar,
 * Focus Mode, Notes, Knowledge Base, Knowledge Graph, Automation Engine, Reviews,
 * Journal, Settings, Backup/Restore, Activity Log, and AI Triage/Planning.
 */

import { getState, updateState, saveState } from '../data/storage.js';
import { getTodayAiBrief } from './aiEngine.js';

// ==========================================
// 1. TODAY HUB & TIMELINE (Sections 2, 3)
// ==========================================

export function getTodayHubData(targetDate) {
  const state = getState();
  const date = targetDate || state.user?.activeDate || '2026-10-01';

  // 1. Daily & Universal Tasks for Today
  const dailyTasks = (state.dailyTasks || []).filter(t => t.date === date || t.dueDate === date);
  const universalTasks = (state.tasks || []).filter(t => t.due_date === date);

  // Group into single unified list for Today
  const todayTasks = [
    ...dailyTasks.map(t => ({
      id: t.id,
      title: t.title,
      area: t.track || t.section || 'General',
      duration: t.durationMinutes || 30,
      priority: t.priority || 'Medium',
      completed: !!t.completed,
      source: 'dailyTask'
    })),
    ...universalTasks.map(t => ({
      id: t.id,
      title: t.title,
      area: t.area || 'General',
      duration: t.estimated_duration || 30,
      priority: t.priority || 'Medium',
      completed: t.status === 'Completed',
      is_blocked: !!t.is_blocked,
      source: 'universalTask'
    }))
  ];

  // 2. DSA Solves / Practice Today
  const dsaSolvedToday = (state.dsa_problems || []).filter(p => {
    const pDate = p.created_at ? p.created_at.split('T')[0] : '';
    return pDate === date && p.status === 'Solved';
  });

  // 3. Learning / Study Sessions Today
  const studySessionsToday = (state.study_sessions || []).filter(s => s.date === date);
  const totalStudyMinutesToday = studySessionsToday.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

  // 4. Active Projects
  const activeProjects = (state.projects || []).filter(p => !p.is_archived && p.status !== 'Completed');

  // 5. Career Tasks Today (Applications, Interviews, Aptitude)
  const applicationsToday = (state.job_applications || []).filter(a => a.applied_date === date);
  const aptitudeToday = (state.aptitude_sessions || []).filter(a => a.date === date);

  // 6. Revision Queue Due Today
  const revisionsDueToday = (state.revisionItems || []).filter(r => r.status === 'Due today' || r.nextReviewDate === date);

  // 7. Habits Status Today
  const dayHabits = (state.habitLogs && state.habitLogs[date]) ? Object.values(state.habitLogs[date]) : [];
  const habitsCompletedTodayCount = dayHabits.filter(h => h && h.status === 'Completed').length;

  // 8. Upcoming Deadlines (Next 7 Days)
  const curTime = new Date(date).getTime();
  const sevenDaysLater = curTime + 7 * 86400000;
  const upcomingDeadlines = [
    ...(state.tasks || []).filter(t => {
      if (!t.due_date || t.status === 'Completed') return false;
      const tTime = new Date(t.due_date).getTime();
      return tTime >= curTime && tTime <= sevenDaysLater;
    }).map(t => ({ title: t.title, due_date: t.due_date, type: 'Task', priority: t.priority })),
    ...(state.job_applications || []).filter(a => {
      if (!a.next_action_date) return false;
      const aTime = new Date(a.next_action_date).getTime();
      return aTime >= curTime && aTime <= sevenDaysLater;
    }).map(a => ({ title: `${a.company_name} - ${a.next_action || 'Follow up'}`, due_date: a.next_action_date, type: 'Career', priority: 'High' }))
  ];

  // 9. Chronological Timeline Blocks
  const timelineBlocks = (state.today_timeline_blocks || []).filter(b => !b.date || b.date === date);

  // 10. AI Daily Brief (Phase 8 integration)
  let aiBrief = null;
  try {
    aiBrief = getTodayAiBrief(date);
  } catch (err) {
    aiBrief = { shortAnswer: "Today's briefing ready. Focus on primary tasks and steady consistency." };
  }

  return {
    date,
    todayTasks,
    totalTasksCount: todayTasks.length,
    completedTasksCount: todayTasks.filter(t => t.completed).length,
    dsaSolvedTodayCount: dsaSolvedToday.length,
    studyMinutesToday: totalStudyMinutesToday,
    studyHoursToday: parseFloat((totalStudyMinutesToday / 60).toFixed(1)),
    activeProjectsCount: activeProjects.length,
    careerItemsTodayCount: applicationsToday.length + aptitudeToday.length,
    revisionsDueCount: revisionsDueToday.length,
    habitsCompletedCount: habitsCompletedTodayCount,
    upcomingDeadlines,
    timelineBlocks,
    aiBrief
  };
}

export function getTodayTimelineBlocks(targetDate) {
  const state = getState();
  const date = targetDate || state.user?.activeDate || '2026-10-01';
  return (state.today_timeline_blocks || []).filter(b => !b.date || b.date === date);
}

export function addTimelineBlock(blockData) {
  const state = getState();
  const newBlock = {
    id: `tb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    date: blockData.date || state.user?.activeDate || '2026-10-01',
    start_time: blockData.start_time || '09:00',
    end_time: blockData.end_time || '10:00',
    title: blockData.title || 'Focus Block',
    category: blockData.category || 'General',
    task_id: blockData.task_id || null,
    is_completed: false
  };

  updateState(curr => ({
    ...curr,
    today_timeline_blocks: [...(curr.today_timeline_blocks || []), newBlock]
  }));

  logActivity('create', 'timeline_block', newBlock.id, newBlock.title, `Scheduled at ${newBlock.start_time}`);
  return newBlock;
}

export function updateTimelineBlock(id, updates) {
  let updated = null;
  updateState(curr => {
    const blocks = (curr.today_timeline_blocks || []).map(b => {
      if (b.id === id) {
        updated = { ...b, ...updates };
        return updated;
      }
      return b;
    });
    return { ...curr, today_timeline_blocks: blocks };
  });
  return updated;
}

export function deleteTimelineBlock(id) {
  updateState(curr => ({
    ...curr,
    today_timeline_blocks: (curr.today_timeline_blocks || []).filter(b => b.id !== id)
  }));
}

export function toggleTimelineBlock(id) {
  let updated = null;
  updateState(curr => {
    const blocks = (curr.today_timeline_blocks || []).map(b => {
      if (b.id === id) {
        updated = { ...b, is_completed: !b.is_completed };
        return updated;
      }
      return b;
    });
    return { ...curr, today_timeline_blocks: blocks };
  });
  return updated;
}

// ==========================================
// 2. QUICK CAPTURE INBOX & PROCESSING (Sections 4, 5)
// ==========================================

export function addInboxItem(itemData) {
  const state = getState();
  const newItem = {
    id: `inbox-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: itemData.title?.trim() || 'Untitled Thought',
    type: itemData.type || 'Task', // 'Task' | 'Idea' | 'Note' | 'Reminder' | 'Project idea' | 'DSA problem' | 'Career action'
    description: itemData.description?.trim() || '',
    created_at: new Date().toISOString(),
    status: 'inbox', // 'inbox' | 'converted' | 'archived' | 'deleted'
    converted_to_type: null,
    converted_to_id: null
  };

  updateState(curr => ({
    ...curr,
    inbox_items: [newItem, ...(curr.inbox_items || [])]
  }));

  logActivity('capture', 'inbox_item', newItem.id, newItem.title, `Captured as ${newItem.type}`);
  return newItem;
}

export function getInboxItems(statusFilter = 'inbox') {
  const state = getState();
  const items = state.inbox_items || [];
  if (statusFilter === 'all') return items;
  return items.filter(i => i.status === statusFilter);
}

export function processInboxItem(id, action, params = {}) {
  const state = getState();
  const item = (state.inbox_items || []).find(i => i.id === id);
  if (!item) return { success: false, message: 'Item not found' };

  let convertedRecord = null;

  if (action === 'convert_to_task') {
    convertedRecord = createUniversalTask({
      title: params.title || item.title,
      description: params.description || item.description,
      due_date: params.due_date || state.user?.activeDate || '2026-10-01',
      priority: params.priority || 'Medium',
      area: params.area || (item.type === 'DSA problem' ? 'DSA' : item.type === 'Career action' ? 'Career' : 'Personal')
    });
    updateState(curr => ({
      ...curr,
      inbox_items: (curr.inbox_items || []).map(i => i.id === id ? { ...i, status: 'converted', converted_to_type: 'task', converted_to_id: convertedRecord.id } : i)
    }));
  } else if (action === 'convert_to_note') {
    convertedRecord = createNote({
      title: params.title || item.title,
      content: params.content || item.description || item.title,
      area: params.area || 'Personal',
      tags: params.tags || [item.type.toLowerCase().replace(/\s+/g, '-')]
    });
    updateState(curr => ({
      ...curr,
      inbox_items: (curr.inbox_items || []).map(i => i.id === id ? { ...i, status: 'converted', converted_to_type: 'note', converted_to_id: convertedRecord.id } : i)
    }));
  } else if (action === 'convert_to_project_idea') {
    // Add to projects hub in IDEA stage
    const newProj = {
      id: `proj-${Date.now()}`,
      title: params.title || item.title,
      description: params.description || item.description,
      category: params.category || 'AI/ML',
      difficulty: 'Intermediate',
      lifecycle_stage: 'IDEA',
      tech_stack: params.tech_stack || [],
      tasks: [],
      is_portfolio_ready: false,
      is_archived: false,
      created_at: new Date().toISOString()
    };
    updateState(curr => ({
      ...curr,
      projects: [...(curr.projects || []), newProj],
      inbox_items: (curr.inbox_items || []).map(i => i.id === id ? { ...i, status: 'converted', converted_to_type: 'project', converted_to_id: newProj.id } : i)
    }));
    convertedRecord = newProj;
  } else if (action === 'archive') {
    updateState(curr => ({
      ...curr,
      inbox_items: (curr.inbox_items || []).map(i => i.id === id ? { ...i, status: 'archived' } : i)
    }));
  } else if (action === 'delete') {
    updateState(curr => ({
      ...curr,
      inbox_items: (curr.inbox_items || []).filter(i => i.id !== id)
    }));
  }

  logActivity('process', 'inbox_item', id, item.title, `Action: ${action}`);
  return { success: true, item, convertedRecord };
}

// ==========================================
// 3. UNIVERSAL TASK MANAGEMENT (Sections 9, 10, 11, 51-54)
// ==========================================

export function createUniversalTask(taskData) {
  const state = getState();
  const date = taskData.due_date || state.user?.activeDate || '2026-10-01';
  const newTask = {
    id: `task-pos-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: taskData.title?.trim() || 'Untitled Task',
    description: taskData.description?.trim() || '',
    due_date: date,
    priority: taskData.priority || 'Medium', // 'Low' | 'Medium' | 'High' | 'Critical'
    status: taskData.status || 'Todo', // 'Inbox' | 'Todo' | 'In Progress' | 'Completed' | 'Cancelled'
    area: taskData.area || 'Personal', // 'Learning' | 'DSA' | 'Projects' | 'Career' | 'Personal' | 'Other'
    project_id: taskData.project_id || null,
    goal_id: taskData.goal_id || null,
    roadmap_item_id: taskData.roadmap_item_id || null,
    estimated_duration: parseInt(taskData.estimated_duration || 30, 10),
    actual_duration: 0,
    tags: Array.isArray(taskData.tags) ? taskData.tags : [],
    is_recurring: !!taskData.is_recurring,
    recurrence_rule: taskData.recurrence_rule || 'none', // 'daily' | 'weekly' | 'monthly' | 'custom'
    is_blocked: !!taskData.is_blocked,
    blocked_reason: taskData.blocked_reason || '',
    blocked_by: Array.isArray(taskData.blocked_by) ? taskData.blocked_by : [],
    blocks: Array.isArray(taskData.blocks) ? taskData.blocks : [],
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  updateState(curr => ({
    ...curr,
    tasks: [newTask, ...(curr.tasks || [])]
  }));

  logActivity('create', 'task', newTask.id, newTask.title, `Priority: ${newTask.priority}, Area: ${newTask.area}`, { previousState: null });
  return newTask;
}

export function updateUniversalTask(id, updates) {
  let updated = null;
  let previous = null;
  updateState(curr => {
    const tasks = (curr.tasks || []).map(t => {
      if (t.id === id) {
        previous = { ...t };
        updated = { ...t, ...updates, updated_at: new Date().toISOString() };
        return updated;
      }
      return t;
    });
    return { ...curr, tasks };
  });

  if (updated) {
    logActivity('update', 'task', id, updated.title, 'Updated task details', { previousState: previous });
  }
  return updated;
}

export function toggleUniversalTask(id) {
  let updated = null;
  const state = getState();
  const currentTask = (state.tasks || []).find(t => t.id === id);
  if (!currentTask) return null;

  const isCompletedNow = currentTask.status !== 'Completed';
  const newStatus = isCompletedNow ? 'Completed' : 'Todo';
  const completedAt = isCompletedNow ? new Date().toISOString() : null;

  updateState(curr => {
    const tasks = (curr.tasks || []).map(t => {
      if (t.id === id) {
        updated = { ...t, status: newStatus, completed_at: completedAt, updated_at: new Date().toISOString() };
        return updated;
      }
      return t;
    });
    return { ...curr, tasks };
  });

  if (isCompletedNow) {
    triggerAutomations('task_completed', { task: updated });
    // If recurring, generate next future instance without altering completed record (Section 11)
    if (updated.is_recurring) {
      expandRecurringTaskNextInstance(updated);
    }
  }

  logActivity('toggle', 'task', id, updated.title, `Status: ${newStatus}`);
  return updated;
}

export function deleteUniversalTask(id) {
  const state = getState();
  const task = (state.tasks || []).find(t => t.id === id);
  if (!task) return false;

  updateState(curr => ({
    ...curr,
    tasks: (curr.tasks || []).filter(t => t.id !== id)
  }));

  logActivity('delete', 'task', id, task.title, 'Deleted task', { deletedTask: task });
  return true;
}

export function getUniversalTasks(filter = {}) {
  const state = getState();
  let tasks = state.tasks || [];

  if (filter.status && filter.status !== 'all') {
    tasks = tasks.filter(t => t.status === filter.status);
  }
  if (filter.area && filter.area !== 'all') {
    tasks = tasks.filter(t => t.area === filter.area);
  }
  if (filter.priority && filter.priority !== 'all') {
    tasks = tasks.filter(t => t.priority === filter.priority);
  }
  if (filter.due_date) {
    tasks = tasks.filter(t => t.due_date === filter.due_date);
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
  }

  return tasks;
}

export function getTasksWorkload() {
  const state = getState();
  const date = state.user?.activeDate || '2026-10-01';
  const curTime = new Date(date).getTime();
  const sevenDaysLater = curTime + 7 * 86400000;
  const tasks = state.tasks || [];

  let dueToday = 0;
  let dueThisWeek = 0;
  let overdue = 0;
  let inProgress = 0;
  let blocked = 0;

  tasks.forEach(t => {
    if (t.status === 'Completed' || t.status === 'Cancelled') return;

    if (t.is_blocked) blocked++;
    if (t.status === 'In Progress') inProgress++;

    if (t.due_date) {
      const tTime = new Date(t.due_date).getTime();
      if (t.due_date === date) {
        dueToday++;
      } else if (tTime < curTime) {
        overdue++;
      } else if (tTime > curTime && tTime <= sevenDaysLater) {
        dueThisWeek++;
      }
    }
  });

  return { dueToday, dueThisWeek, overdue, inProgress, blocked, totalActive: tasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length };
}

export function setTaskBlocked(id, reason, blockedByIds = []) {
  return updateUniversalTask(id, {
    is_blocked: true,
    blocked_reason: reason || 'Waiting on prerequisite',
    blocked_by: blockedByIds,
    status: 'Todo'
  });
}

export function resolveTaskBlocked(id) {
  return updateUniversalTask(id, {
    is_blocked: false,
    blocked_reason: '',
    blocked_by: []
  });
}

function expandRecurringTaskNextInstance(task) {
  if (!task.due_date) return;
  const d = new Date(task.due_date);
  if (task.recurrence_rule === 'daily') {
    d.setDate(d.getDate() + 1);
  } else if (task.recurrence_rule === 'weekly') {
    d.setDate(d.getDate() + 7);
  } else if (task.recurrence_rule === 'monthly') {
    d.setMonth(d.getMonth() + 1);
  } else {
    d.setDate(d.getDate() + 1);
  }
  const nextDueDate = d.toISOString().split('T')[0];

  createUniversalTask({
    title: task.title,
    description: task.description,
    due_date: nextDueDate,
    priority: task.priority,
    area: task.area,
    project_id: task.project_id,
    goal_id: task.goal_id,
    estimated_duration: task.estimated_duration,
    tags: task.tags,
    is_recurring: true,
    recurrence_rule: task.recurrence_rule
  });
}

// ==========================================
// 4. UNIVERSAL SEARCH & COMMAND PALETTE (Sections 7, 8, 74)
// ==========================================

export function globalSearch(query, filterType = 'all') {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const state = getState();
  const results = [];

  // 1. Universal & Daily Tasks
  if (filterType === 'all' || filterType === 'tasks') {
    (state.tasks || []).forEach(t => {
      if (t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))) {
        results.push({
          type: 'Task',
          title: t.title,
          subtitle: `${t.area || 'General'} · Due ${t.due_date || 'No date'} · ${t.status}`,
          date: t.due_date,
          relatedArea: t.area || 'Personal',
          id: t.id,
          url: '#personal-os'
        });
      }
    });
  }

  // 2. DSA Problems
  if (filterType === 'all' || filterType === 'dsa') {
    (state.dsa_problems || []).forEach(p => {
      if (p.title.toLowerCase().includes(q) || (p.pattern && p.pattern.toLowerCase().includes(q)) || (p.topic && p.topic.toLowerCase().includes(q))) {
        results.push({
          type: 'DSA',
          title: p.title,
          subtitle: `${p.topic || 'DSA'} · ${p.difficulty} · ${p.status}`,
          date: p.created_at ? p.created_at.split('T')[0] : null,
          relatedArea: 'DSA',
          id: p.id,
          url: '#dsa'
        });
      }
    });
  }

  // 3. Projects
  if (filterType === 'all' || filterType === 'projects') {
    (state.projects || []).forEach(p => {
      if (p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)) || (p.tech_stack && p.tech_stack.some(ts => ts.toLowerCase().includes(q)))) {
        results.push({
          type: 'Project',
          title: p.title,
          subtitle: `${p.lifecycle_stage || p.status} · ${p.category || 'Tech'}`,
          date: p.created_at ? p.created_at.split('T')[0] : null,
          relatedArea: 'Projects',
          id: p.id,
          url: '#projects'
        });
      }
    });
  }

  // 4. Notes
  if (filterType === 'all' || filterType === 'notes') {
    (state.notes || []).forEach(n => {
      if (n.title.toLowerCase().includes(q) || (n.content && n.content.toLowerCase().includes(q)) || (n.tags && n.tags.some(t => t.toLowerCase().includes(q)))) {
        results.push({
          type: 'Note',
          title: n.title,
          subtitle: `${n.area} Note · ${n.tags ? n.tags.join(', ') : ''}`,
          date: n.updated_at ? n.updated_at.split('T')[0] : null,
          relatedArea: n.area || 'Knowledge',
          id: n.id,
          url: '#personal-os'
        });
      }
    });
  }

  // 5. Goals & Milestones
  if (filterType === 'all' || filterType === 'goals') {
    (state.milestones || []).forEach(m => {
      if (m.title.toLowerCase().includes(q) || (m.description && m.description.toLowerCase().includes(q))) {
        results.push({
          type: 'Milestone',
          title: m.title,
          subtitle: `${m.category} Milestone · Target: ${m.target_date}`,
          date: m.target_date,
          relatedArea: m.category,
          id: m.id,
          url: '#progress'
        });
      }
    });
  }

  // 6. Career Applications
  if (filterType === 'all' || filterType === 'career') {
    (state.job_applications || []).forEach(a => {
      if (a.company_name.toLowerCase().includes(q) || a.role_title.toLowerCase().includes(q)) {
        results.push({
          type: 'Career',
          title: `${a.company_name} - ${a.role_title}`,
          subtitle: `Application · Status: ${a.status}`,
          date: a.applied_date,
          relatedArea: 'Career',
          id: a.id,
          url: '#career'
        });
      }
    });
  }

  return results.slice(0, 50);
}

// ==========================================
// 5. UNIFIED MULTI-DOMAIN CALENDAR (Sections 12, 13)
// ==========================================

export function getUnifiedCalendarEvents(targetDate) {
  const state = getState();
  const baseDate = targetDate || state.user?.activeDate || '2026-10-01';
  const curTime = new Date(baseDate);
  const year = curTime.getFullYear();
  const month = curTime.getMonth() + 1;

  const events = [];

  // 1. Universal Tasks
  (state.tasks || []).forEach(t => {
    if (t.due_date) {
      events.push({
        id: `ev-task-${t.id}`,
        title: t.title,
        date: t.due_date,
        type: 'Task',
        category: t.area || 'Personal',
        completed: t.status === 'Completed',
        priority: t.priority
      });
    }
  });

  // 2. Study Sessions
  (state.study_sessions || []).forEach(s => {
    if (s.date) {
      events.push({
        id: `ev-study-${s.id}`,
        title: `Study: ${s.notes || s.category || 'Session'} (${s.duration_minutes}m)`,
        date: s.date,
        type: 'Study',
        category: s.category || 'Learning',
        completed: true
      });
    }
  });

  // 3. Project Milestones
  (state.projects || []).forEach(p => {
    if (p.milestones && Array.isArray(p.milestones)) {
      p.milestones.forEach(pm => {
        if (pm.target_date) {
          events.push({
            id: `ev-pm-${pm.id}`,
            title: `Project: ${p.title} - ${pm.title}`,
            date: pm.target_date,
            type: 'Project',
            category: 'Projects',
            completed: !!pm.completed
          });
        }
      });
    }
  });

  // 4. Career Deadlines & Interviews
  (state.job_applications || []).forEach(a => {
    if (a.next_action_date) {
      events.push({
        id: `ev-app-${a.id}`,
        title: `Career: ${a.company_name} (${a.next_action || a.status})`,
        date: a.next_action_date,
        type: 'Career',
        category: 'Career',
        completed: a.status === 'Closed' || a.status === 'Offer'
      });
    }
  });

  // 5. Timeline Schedule Blocks
  (state.today_timeline_blocks || []).forEach(b => {
    if (b.date) {
      events.push({
        id: `ev-tb-${b.id}`,
        title: `${b.start_time} - ${b.title}`,
        date: b.date,
        type: 'Focus',
        category: b.category,
        completed: !!b.is_completed
      });
    }
  });

  return events;
}

// ==========================================
// 6. FOCUS MODE & TIMER (Sections 14-17)
// ==========================================

export function startFocusSession(params) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const now = new Date();
  const timeStr = now.toISOString().split('T')[1] || '10:00:00.000Z';
  const startTimeIso = `${activeDate}T${timeStr}`;

  const newSession = {
    id: `focus-${Date.now()}`,
    task_id: params.taskId || null,
    task_title: params.taskTitle || 'Dedicated Deep Work',
    category: params.category || 'Learning', // 'DSA' | 'Learning' | 'Projects' | 'Career' | 'Other'
    start_time: startTimeIso,
    end_time: null,
    duration_minutes: 0,
    target_duration_minutes: parseInt(params.targetDurationMinutes || 25, 10),
    notes: '',
    status: 'In Progress',
    saved_to_study_sessions: false,
    created_at: new Date().toISOString()
  };

  updateState(curr => ({
    ...curr,
    focus_sessions: [newSession, ...(curr.focus_sessions || [])]
  }));

  logActivity('start', 'focus_session', newSession.id, newSession.task_title, `Target: ${newSession.target_duration_minutes}m`);
  return newSession;
}

export function finishFocusSession(id, details = {}) {
  let finished = null;
  const state = getState();
  const session = (state.focus_sessions || []).find(s => s.id === id);
  if (!session) return null;

  const now = new Date();
  const startTime = new Date(session.start_time).getTime();
  const duration = details.actualMinutes !== undefined ? details.actualMinutes : Math.max(1, Math.round((now.getTime() - startTime) / 60000));
  const saveToStudy = details.saveToStudySessions !== false;

  updateState(curr => {
    const updatedList = (curr.focus_sessions || []).map(s => {
      if (s.id === id) {
        finished = {
          ...s,
          end_time: now.toISOString(),
          duration_minutes: duration,
          notes: details.notes || s.notes || '',
          status: 'Completed',
          saved_to_study_sessions: saveToStudy
        };
        return finished;
      }
      return s;
    });

    let newStudySessions = curr.study_sessions || [];
    if (saveToStudy) {
      const todayDate = curr.user?.activeDate || now.toISOString().split('T')[0];
      const newStudy = {
        id: `sess-focus-${Date.now()}`,
        date: todayDate,
        duration_minutes: duration,
        topic_id: null,
        category: session.category || 'Learning',
        notes: `Focus session: ${session.task_title}. ${details.notes || ''}`.trim()
      };
      newStudySessions = [newStudy, ...newStudySessions];
    }

    return {
      ...curr,
      focus_sessions: updatedList,
      study_sessions: newStudySessions
    };
  });

  triggerAutomations('study_session_completed', { duration_minutes: duration, category: session.category });
  logActivity('finish', 'focus_session', id, session.task_title, `Logged ${duration} minutes`);
  return finished;
}

export function cancelFocusSession(id) {
  updateState(curr => ({
    ...curr,
    focus_sessions: (curr.focus_sessions || []).map(s => s.id === id ? { ...s, status: 'Cancelled', end_time: new Date().toISOString() } : s)
  }));
}

export function getFocusHistory(horizon = 'today') {
  const state = getState();
  const baseDate = state.user?.activeDate || '2026-10-01';
  const curTime = new Date(baseDate).getTime();
  const sessions = (state.focus_sessions || []).filter(s => s.status === 'Completed');

  const filtered = sessions.filter(s => {
    const sTime = new Date(s.start_time).getTime();
    if (horizon === 'today') {
      return s.start_time.split('T')[0] === baseDate;
    } else if (horizon === 'week') {
      return sTime >= curTime - 7 * 86400000 && sTime <= curTime + 86400000;
    } else if (horizon === 'month') {
      return sTime >= curTime - 30 * 86400000 && sTime <= curTime + 86400000;
    }
    return true;
  });

  const categoryBreakdown = {
    DSA: 0,
    Learning: 0,
    Projects: 0,
    Career: 0,
    Other: 0
  };

  let totalMinutes = 0;
  filtered.forEach(s => {
    const cat = categoryBreakdown[s.category] !== undefined ? s.category : 'Other';
    categoryBreakdown[cat] += (s.duration_minutes || 0);
    totalMinutes += (s.duration_minutes || 0);
  });

  return {
    sessions: filtered,
    totalSessions: filtered.length,
    totalMinutes,
    totalHours: parseFloat((totalMinutes / 60).toFixed(1)),
    categoryBreakdown
  };
}

// ==========================================
// 7. NOTES & KNOWLEDGE SYSTEM (Sections 18-24, 46-48)
// ==========================================

export function createNote(noteData) {
  const newNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: noteData.title?.trim() || 'Untitled Note',
    content: noteData.content || '',
    tags: Array.isArray(noteData.tags) ? noteData.tags : [],
    area: noteData.area || 'Personal', // 'Learning' | 'DSA' | 'Projects' | 'Career' | 'Personal' | 'Other'
    folder: noteData.folder || 'Default',
    is_pinned: !!noteData.is_pinned,
    is_favorite: !!noteData.is_favorite,
    is_archived: false,
    linked_project_id: noteData.linked_project_id || null,
    linked_career_id: noteData.linked_career_id || null,
    linked_roadmap_topic_id: noteData.linked_roadmap_topic_id || null,
    linked_dsa_topic_id: noteData.linked_dsa_topic_id || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  updateState(curr => ({
    ...curr,
    notes: [newNote, ...(curr.notes || [])]
  }));

  logActivity('create', 'note', newNote.id, newNote.title, `Area: ${newNote.area}`);
  return newNote;
}

export function updateNote(id, updates) {
  let updated = null;
  updateState(curr => {
    const notes = (curr.notes || []).map(n => {
      if (n.id === id) {
        updated = { ...n, ...updates, updated_at: new Date().toISOString() };
        return updated;
      }
      return n;
    });
    return { ...curr, notes };
  });
  return updated;
}

export function deleteNote(id) {
  updateState(curr => ({
    ...curr,
    notes: (curr.notes || []).filter(n => n.id !== id)
  }));
}

export function getNotes(filters = {}) {
  const state = getState();
  let notes = (state.notes || []).filter(n => !n.is_archived);

  if (filters.area && filters.area !== 'all') {
    notes = notes.filter(n => n.area === filters.area);
  }
  if (filters.folder && filters.folder !== 'all') {
    notes = notes.filter(n => n.folder === filters.folder);
  }
  if (filters.is_favorite) {
    notes = notes.filter(n => n.is_favorite);
  }
  if (filters.tag) {
    notes = notes.filter(n => n.tags && n.tags.includes(filters.tag));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    notes = notes.filter(n => n.title.toLowerCase().includes(q) || (n.content && n.content.toLowerCase().includes(q)));
  }

  // Sort pinned first
  return notes.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
}

export function createResource(resData) {
  const newRes = {
    id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: resData.title?.trim() || 'Untitled Resource',
    url: resData.url || '',
    type: resData.type || 'Article', // 'Article' | 'Video' | 'Documentation' | 'Course' | 'Book' | 'Repository' | 'Other'
    topic: resData.topic || 'General',
    notes: resData.notes || '',
    status: resData.status || 'Saved', // 'Saved' | 'Planned' | 'In Progress' | 'Completed' | 'Archived'
    linked_roadmap_topic_id: resData.linked_roadmap_topic_id || null,
    linked_dsa_topic_id: resData.linked_dsa_topic_id || null,
    linked_project_id: resData.linked_project_id || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  updateState(curr => ({
    ...curr,
    resources: [newRes, ...(curr.resources || [])]
  }));

  logActivity('create', 'resource', newRes.id, newRes.title, `Type: ${newRes.type}`);
  return newRes;
}

export function updateResource(id, updates) {
  let updated = null;
  updateState(curr => {
    const resources = (curr.resources || []).map(r => {
      if (r.id === id) {
        updated = { ...r, ...updates, updated_at: new Date().toISOString() };
        return updated;
      }
      return r;
    });
    return { ...curr, resources };
  });
  return updated;
}

export function deleteResource(id) {
  updateState(curr => ({
    ...curr,
    resources: (curr.resources || []).filter(r => r.id !== id)
  }));
}

export function getResources(filters = {}) {
  const state = getState();
  let list = state.resources || [];
  if (filters.status && filters.status !== 'all') {
    list = list.filter(r => r.status === filters.status);
  }
  if (filters.type && filters.type !== 'all') {
    list = list.filter(r => r.type === filters.type);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(r => r.title.toLowerCase().includes(q) || (r.topic && r.topic.toLowerCase().includes(q)));
  }
  return list;
}

// ==========================================
// 8. KNOWLEDGE GRAPH (Sections 56, 57)
// ==========================================

export function getKnowledgeGraphData() {
  const state = getState();
  const nodes = [];
  const edges = [];
  const nodeIds = new Set();

  function addNode(id, label, type, details) {
    if (!nodeIds.has(id)) {
      nodeIds.add(id);
      nodes.push({ id, label, type, details });
    }
  }

  // 1. Projects
  (state.projects || []).slice(0, 10).forEach(p => {
    addNode(`proj-${p.id}`, p.title, 'Project', { stage: p.lifecycle_stage });
  });

  // 2. Roadmap / Prime Topics
  (state.roadmap_topics || state.roadmapTopics || []).slice(0, 8).forEach(t => {
    addNode(`topic-${t.id}`, t.name || t.title, 'Topic', { category: t.category });
  });

  // 3. Notes
  (state.notes || []).slice(0, 10).forEach(n => {
    addNode(`note-${n.id}`, n.title, 'Note', { area: n.area });
    if (n.linked_project_id) {
      edges.push({ source: `note-${n.id}`, target: `proj-${n.linked_project_id}`, relation: 'used_in' });
    }
    if (n.linked_roadmap_topic_id) {
      edges.push({ source: `note-${n.id}`, target: `topic-${n.linked_roadmap_topic_id}`, relation: 'related_to' });
    }
  });

  // 4. Milestones
  (state.milestones || []).slice(0, 6).forEach(m => {
    addNode(`mile-${m.id}`, m.title, 'Milestone', { status: m.status });
  });

  // 5. Connect project tech tags to Topics
  (state.projects || []).slice(0, 10).forEach(p => {
    if (p.tech_stack && Array.isArray(p.tech_stack)) {
      p.tech_stack.forEach(tech => {
        const matchingTopic = (state.roadmap_topics || state.roadmapTopics || []).find(t => (t.name || t.title || '').toLowerCase().includes(tech.toLowerCase()));
        if (matchingTopic && nodeIds.has(`topic-${matchingTopic.id}`)) {
          edges.push({ source: `topic-${matchingTopic.id}`, target: `proj-${p.id}`, relation: 'supports' });
        }
      });
    }
  });

  return { nodes, edges };
}

// ==========================================
// 9. AUTOMATION ENGINE (Sections 31-37)
// ==========================================

export function getAutomations() {
  const state = getState();
  return state.automations || [];
}

export function createAutomation(autoData) {
  const newAuto = {
    id: `auto-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: autoData.title?.trim() || 'Custom Automation Rule',
    trigger: autoData.trigger || 'task_completed', // 'task_completed' | 'task_overdue' | 'goal_completed' | 'milestone_completed' | 'habit_completed' | 'study_session_completed' | 'project_milestone_reached' | 'achievement_unlocked' | 'time_reached'
    condition_type: autoData.condition_type || 'always',
    condition_value: autoData.condition_value || '',
    action_type: autoData.action_type || 'create_task', // 'create_reminder' | 'create_task' | 'create_review_item' | 'create_notification' | 'add_inbox_item'
    action_payload: autoData.action_payload || {},
    is_enabled: autoData.is_enabled !== false,
    require_approval: autoData.require_approval !== false,
    created_at: new Date().toISOString()
  };

  updateState(curr => ({
    ...curr,
    automations: [...(curr.automations || []), newAuto]
  }));

  logActivity('create', 'automation', newAuto.id, newAuto.title, `Trigger: ${newAuto.trigger} → Action: ${newAuto.action_type}`);
  return newAuto;
}

export function updateAutomation(id, updates) {
  let updated = null;
  updateState(curr => {
    const automations = (curr.automations || []).map(a => {
      if (a.id === id) {
        updated = { ...a, ...updates };
        return updated;
      }
      return a;
    });
    return { ...curr, automations };
  });
  return updated;
}

export function deleteAutomation(id) {
  updateState(curr => ({
    ...curr,
    automations: (curr.automations || []).filter(a => a.id !== id)
  }));
}

export function triggerAutomations(triggerType, eventPayload = {}) {
  const state = getState();
  const automations = (state.automations || []).filter(a => a.is_enabled && a.trigger === triggerType);
  if (automations.length === 0) return [];

  const runs = [];

  automations.forEach(auto => {
    // Condition check
    let conditionPassed = true;
    if (auto.condition_type === 'category_match' && auto.condition_value) {
      conditionPassed = eventPayload.category === auto.condition_value;
    }

    if (!conditionPassed) return;

    const runId = `run-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const autoSettings = state.personal_os_settings?.automation_preferences || {};
    const executeImmediately = !auto.require_approval && autoSettings.auto_execute_safe;

    if (executeImmediately) {
      executeAutomationAction(auto.action_type, auto.action_payload);
      runs.push({
        id: runId,
        automation_id: auto.id,
        automation_title: auto.title,
        trigger: triggerType,
        action_taken: auto.action_type,
        status: 'Executed',
        result_summary: `Executed safe action: ${auto.action_type}`,
        created_at: new Date().toISOString()
      });
    } else {
      runs.push({
        id: runId,
        automation_id: auto.id,
        automation_title: auto.title,
        trigger: triggerType,
        action_taken: auto.action_type,
        status: 'Pending Approval',
        result_summary: `Generated proposal awaiting user confirmation: ${auto.action_type}`,
        action_payload: auto.action_payload,
        created_at: new Date().toISOString()
      });
    }
  });

  if (runs.length > 0) {
    updateState(curr => ({
      ...curr,
      automation_runs: [...runs, ...(curr.automation_runs || [])]
    }));
  }

  return runs;
}

export function approveAutomationRun(runId) {
  const state = getState();
  const run = (state.automation_runs || []).find(r => r.id === runId);
  if (!run || run.status !== 'Pending Approval') return false;

  executeAutomationAction(run.action_taken, run.action_payload || {});

  updateState(curr => ({
    ...curr,
    automation_runs: (curr.automation_runs || []).map(r => r.id === runId ? { ...r, status: 'Approved', result_summary: `Approved and executed: ${r.action_taken}` } : r)
  }));

  logActivity('approve', 'automation_run', runId, run.automation_title, `Action: ${run.action_taken}`);
  return true;
}

export function rejectAutomationRun(runId) {
  updateState(curr => ({
    ...curr,
    automation_runs: (curr.automation_runs || []).map(r => r.id === runId ? { ...r, status: 'Rejected', result_summary: 'Declined by user' } : r)
  }));
  return true;
}

export function getAutomationHistory() {
  const state = getState();
  return state.automation_runs || [];
}

function executeAutomationAction(actionType, payload) {
  if (actionType === 'create_task') {
    createUniversalTask({
      title: payload.title || 'Automated Review Task',
      description: payload.description || 'Generated via automation rule',
      priority: payload.priority || 'Medium',
      area: payload.area || 'Personal',
      estimated_duration: payload.estimated_duration || 30
    });
  } else if (actionType === 'add_inbox_item') {
    addInboxItem({
      title: payload.title || 'Automated Capture',
      type: payload.type || 'Reminder',
      description: payload.description || ''
    });
  } else if (actionType === 'create_notification') {
    // Handled in UI notifications
  }
}

// ==========================================
// 10. REVIEW CENTER (Sections 38-43)
// ==========================================

export function getReviewData(reviewType, periodStr) {
  const state = getState();
  const date = periodStr || state.user?.activeDate || '2026-10-01';

  let tasksCount = 0;
  let studyHours = 0;
  let dsaCount = 0;
  let achievementsCount = 0;

  if (reviewType === 'daily') {
    const dailyT = (state.dailyTasks || []).filter(t => t.date === date);
    const uniT = (state.tasks || []).filter(t => t.due_date === date);
    tasksCount = dailyT.filter(t => t.completed).length + uniT.filter(t => t.status === 'Completed').length;

    const study = (state.study_sessions || []).filter(s => s.date === date);
    studyHours = parseFloat((study.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / 60).toFixed(1));

    dsaCount = (state.dsa_problems || []).filter(p => (p.created_at || '').startsWith(date) && p.status === 'Solved').length;
  } else if (reviewType === 'weekly' || reviewType === 'monthly') {
    tasksCount = (state.tasks || []).filter(t => t.status === 'Completed').length;
    const study = state.study_sessions || [];
    studyHours = parseFloat((study.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / 60).toFixed(1));
    dsaCount = (state.dsa_problems || []).filter(p => p.status === 'Solved').length;
    achievementsCount = (state.achievements || []).filter(a => a.unlocked).length;
  } else {
    // Quarterly or Yearly
    tasksCount = (state.tasks || []).filter(t => t.status === 'Completed').length;
    const study = state.study_sessions || [];
    studyHours = parseFloat((study.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) / 60).toFixed(1));
    dsaCount = (state.dsa_problems || []).filter(p => p.status === 'Solved').length;
    achievementsCount = (state.achievements || []).filter(a => a.unlocked).length;
  }

  return {
    reviewType,
    period: date,
    tasksCompleted: tasksCount,
    studyHours,
    dsaProblemsSolved: dsaCount,
    achievementsUnlocked: achievementsCount,
    promptAccomplished: 'What did I accomplish during this period?',
    promptRemains: 'What work remains unfinished or in progress?',
    promptCarryForward: 'What key priorities should I carry forward into the next period?'
  };
}

export function saveReviewRecord(reviewData) {
  const newReview = {
    id: `rev-${Date.now()}`,
    type: reviewData.type || 'daily',
    period: reviewData.period || '2026-10-01',
    accomplishments: reviewData.accomplishments || '',
    remaining: reviewData.remaining || '',
    next_priorities: reviewData.next_priorities || '',
    reflection_notes: reviewData.reflection_notes || '',
    lessons: reviewData.lessons || '',
    created_at: new Date().toISOString()
  };

  updateState(curr => ({
    ...curr,
    reviews: [newReview, ...(curr.reviews || [])]
  }));

  logActivity('complete', 'review', newReview.id, `${newReview.type.toUpperCase()} Review`, `Period: ${newReview.period}`);
  return newReview;
}

// ==========================================
// 11. PERSONAL JOURNAL (Sections 44, 45)
// ==========================================

export function addJournalEntry(entryData) {
  const state = getState();
  const date = entryData.date || state.user?.activeDate || '2026-10-01';

  const newEntry = {
    id: `j-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    date,
    title: entryData.title?.trim() || 'Daily Reflection',
    content: entryData.content || '',
    mood: entryData.mood || 'Focused', // Non-psychological subjective tag
    lessons: entryData.lessons || '',
    wins: entryData.wins || '',
    challenges: entryData.challenges || '',
    next_steps: entryData.next_steps || '',
    is_favorite: false,
    is_archived: false,
    created_at: new Date().toISOString()
  };

  updateState(curr => {
    const list = curr.journalEntries || curr.journal_entries || [];
    return {
      ...curr,
      journalEntries: [newEntry, ...list],
      journal_entries: [newEntry, ...list]
    };
  });

  logActivity('create', 'journal_entry', newEntry.id, newEntry.title, `Date: ${date}`);
  return newEntry;
}

export function getJournalEntries(filters = {}) {
  const state = getState();
  let list = state.journalEntries || state.journal_entries || [];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(j => (j.title && j.title.toLowerCase().includes(q)) || (j.content && j.content.toLowerCase().includes(q)) || (j.lessons && j.lessons.toLowerCase().includes(q)));
  }
  return list;
}

// ==========================================
// 12. AI PERSONAL OS INTEGRATION (Sections 25-30, 58)
// ==========================================

export function aiTriageInbox(item) {
  // Suggests type, area, project, due date without mutating data
  const text = `${item.title} ${item.description}`.toLowerCase();

  let suggestedType = 'Task';
  let suggestedArea = 'Personal';
  let suggestedProject = null;

  if (text.includes('leetcode') || text.includes('dsa') || text.includes('tree') || text.includes('graph') || text.includes('dp')) {
    suggestedType = 'DSA problem';
    suggestedArea = 'DSA';
  } else if (text.includes('resume') || text.includes('interview') || text.includes('apply') || text.includes('company')) {
    suggestedType = 'Career action';
    suggestedArea = 'Career';
  } else if (text.includes('build') || text.includes('project') || text.includes('api') || text.includes('frontend')) {
    suggestedType = 'Project idea';
    suggestedArea = 'Projects';
  } else if (text.includes('note') || text.includes('learn') || text.includes('read') || text.includes('concept')) {
    suggestedType = 'Note';
    suggestedArea = 'Learning';
  }

  const state = getState();
  const activeProj = (state.projects || []).find(p => !p.is_archived);
  if (activeProj && suggestedArea === 'Projects') {
    suggestedProject = activeProj.title;
  }

  return {
    itemId: item.id,
    suggestedType,
    suggestedArea,
    suggestedProject,
    suggestedDueDate: state.user?.activeDate || '2026-10-01',
    confidenceScore: 0.85
  };
}

export function aiBreakdownTask(taskTitle) {
  const title = (taskTitle || '').trim();
  const subtasks = [
    { title: `Clarify requirements & approach for "${title}"`, estimated_duration: 15 },
    { title: `Set up environment & foundational components`, estimated_duration: 30 },
    { title: `Execute core implementation & code solution`, estimated_duration: 45 },
    { title: `Validate, test edge cases & document outcome`, estimated_duration: 20 }
  ];

  return {
    originalTask: title,
    subtasks
  };
}

export function aiSummarizeNote(noteId) {
  const state = getState();
  const note = (state.notes || []).find(n => n.id === noteId);
  if (!note) return null;

  const summary = `Note covers key concepts on ${note.title}. Emphasizes architectural foundations, practical patterns, and systematic implementation.`;
  const keyPoints = [
    'Core conceptual principles established.',
    'Implementation nuances and considerations documented.',
    'Directly applicable to ongoing engineering workflow.'
  ];
  const nextActions = [
    'Apply concepts in the next project module.',
    'Review in spaced repetition cycle.'
  ];

  return {
    noteId,
    title: note.title,
    summary,
    keyPoints,
    nextActions
  };
}

export function aiProposeDailySchedule(availableHours = 6) {
  const schedule = [];
  const hours = parseFloat(availableHours) || 6;

  if (hours >= 4) {
    schedule.push({ start_time: '08:00', end_time: '09:30', title: 'DSA Algorithmic Practice', category: 'DSA' });
    schedule.push({ start_time: '10:00', end_time: '12:00', title: 'Prime 3.0 Curriculum Deep Dive', category: 'Learning' });
    schedule.push({ start_time: '15:00', end_time: '17:00', title: 'Core Project Development', category: 'Projects' });
    schedule.push({ start_time: '19:00', end_time: '19:45', title: 'Revision & Daily Review', category: 'Personal' });
  } else {
    schedule.push({ start_time: '08:30', end_time: '09:30', title: 'Core DSA Problem Solving', category: 'DSA' });
    schedule.push({ start_time: '17:00', end_time: '18:30', title: 'Primary Project/Learning Task', category: 'Learning' });
    schedule.push({ start_time: '20:00', end_time: '20:30', title: 'Daily Review & Wrap-up', category: 'Personal' });
  }

  return {
    availableHours: hours,
    schedule
  };
}

// ==========================================
// 13. SETTINGS & PREFERENCES (Section 59)
// ==========================================

export function getPersonalOsSettings() {
  const state = getState();
  return state.personal_os_settings || {
    default_task_duration: 30,
    calendar_start_day: 'monday',
    time_format: '24h',
    week_start: 'monday',
    notification_preferences: { reminders: true, review_alerts: true },
    ai_preferences: { auto_suggest_inbox: true, require_plan_confirmation: true },
    automation_preferences: { auto_execute_safe: false },
    dashboard_layout: {
      compact_mode: false,
      widgets: ['today', 'goals', 'projects', 'dsa', 'career', 'focus', 'ai', 'upcoming', 'achievements']
    }
  };
}

export function updatePersonalOsSettings(updates) {
  let updated = null;
  updateState(curr => {
    updated = {
      ...(curr.personal_os_settings || {}),
      ...updates
    };
    return { ...curr, personal_os_settings: updated };
  });
  return updated;
}

// ==========================================
// 14. DATA BACKUP, RESTORE & CONFLICTS (Sections 60-63)
// ==========================================

export function createSystemBackup(format = 'json') {
  const state = getState();
  const dateStr = state.user?.activeDate || new Date().toISOString().split('T')[0];

  const backupData = {
    version: '10.0',
    exportDate: new Date().toISOString(),
    user: state.user,
    recordCounts: {
      tasks: (state.tasks || []).length,
      dsa_problems: (state.dsa_problems || []).length,
      projects: (state.projects || []).length,
      job_applications: (state.job_applications || []).length,
      notes: (state.notes || []).length,
      study_sessions: (state.study_sessions || []).length,
      achievements: (state.achievements || []).length,
      milestones: (state.milestones || []).length
    },
    data: {
      tasks: state.tasks || [],
      dailyTasks: state.dailyTasks || [],
      dsa_problems: state.dsa_problems || [],
      projects: state.projects || [],
      job_applications: state.job_applications || [],
      notes: state.notes || [],
      resources: state.resources || [],
      focus_sessions: state.focus_sessions || [],
      study_sessions: state.study_sessions || [],
      reviews: state.reviews || [],
      journal_entries: state.journalEntries || state.journal_entries || [],
      automations: state.automations || []
    }
  };

  const backupMeta = {
    id: `backup-${Date.now()}`,
    filename: `career-os-backup-${dateStr}.${format}`,
    created_at: new Date().toISOString(),
    size_bytes: JSON.stringify(backupData).length,
    version: '10.0',
    record_counts: backupData.recordCounts
  };

  updateState(curr => ({
    ...curr,
    backups: [backupMeta, ...(curr.backups || [])]
  }));

  logActivity('export', 'backup', backupMeta.id, backupMeta.filename, `Exported ${backupMeta.size_bytes} bytes`);
  return { backupMeta, backupData };
}

export function previewRestoreBackup(backupJson) {
  try {
    const parsed = typeof backupJson === 'string' ? JSON.parse(backupJson) : backupJson;
    const data = parsed.data || parsed;
    const state = getState();

    const existingTaskIds = new Set((state.tasks || []).map(t => t.id));
    const existingDsaIds = new Set((state.dsa_problems || []).map(p => p.id));
    const existingProjIds = new Set((state.projects || []).map(p => p.id));

    let tasksToAdd = 0;
    let tasksToUpdate = 0;
    (data.tasks || []).forEach(t => {
      if (existingTaskIds.has(t.id)) tasksToUpdate++;
      else tasksToAdd++;
    });

    let dsaToAdd = 0;
    let dsaToUpdate = 0;
    (data.dsa_problems || []).forEach(p => {
      if (existingDsaIds.has(p.id)) dsaToUpdate++;
      else dsaToAdd++;
    });

    let projectsToAdd = 0;
    let projectsToUpdate = 0;
    (data.projects || []).forEach(p => {
      if (existingProjIds.has(p.id)) projectsToUpdate++;
      else projectsToAdd++;
    });

    const potentialConflicts = tasksToUpdate + dsaToUpdate + projectsToUpdate;

    return {
      isValid: true,
      recordsToAdd: tasksToAdd + dsaToAdd + projectsToAdd,
      recordsToUpdate: potentialConflicts,
      potentialConflicts,
      details: {
        tasks: { add: tasksToAdd, update: tasksToUpdate },
        dsa: { add: dsaToAdd, update: dsaToUpdate },
        projects: { add: projectsToAdd, update: projectsToUpdate }
      }
    };
  } catch (err) {
    return { isValid: false, error: err.message };
  }
}

export function applyRestoreBackup(backupJson, conflictStrategy = 'keep_existing') {
  const parsed = typeof backupJson === 'string' ? JSON.parse(backupJson) : backupJson;
  const data = parsed.data || parsed;

  updateState(curr => {
    function mergeEntities(existingList = [], incomingList = []) {
      const existingMap = new Map(existingList.map(item => [item.id, item]));
      incomingList.forEach(incoming => {
        if (!existingMap.has(incoming.id)) {
          existingMap.set(incoming.id, incoming);
        } else {
          if (conflictStrategy === 'use_imported') {
            existingMap.set(incoming.id, incoming);
          }
          // 'keep_existing' does nothing
        }
      });
      return Array.from(existingMap.values());
    }

    return {
      ...curr,
      tasks: mergeEntities(curr.tasks, data.tasks),
      dsa_problems: mergeEntities(curr.dsa_problems, data.dsa_problems),
      projects: mergeEntities(curr.projects, data.projects),
      job_applications: mergeEntities(curr.job_applications, data.job_applications),
      notes: mergeEntities(curr.notes, data.notes)
    };
  });

  logActivity('restore', 'backup', 'restore-op', 'Applied System Backup', `Strategy: ${conflictStrategy}`);
  return { success: true };
}

// ==========================================
// 15. ACTIVITY LOG & UNDO SUPPORT (Sections 64, 65)
// ==========================================

export function logActivity(actionType, itemType, itemId, title, details = '', undoPayload = null) {
  const activityItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    action_type: actionType,
    item_type: itemType,
    item_id: itemId,
    title: title || 'Action',
    details: details || '',
    can_undo: !!undoPayload,
    undo_payload: undoPayload,
    timestamp: new Date().toISOString()
  };

  updateState(curr => ({
    ...curr,
    activity_log: [activityItem, ...(curr.activity_log || []).slice(0, 99)]
  }));

  return activityItem;
}

export function getActivityLog(limit = 30) {
  const state = getState();
  return (state.activity_log || []).slice(0, limit);
}

export function undoActivity(activityId) {
  const state = getState();
  const activity = (state.activity_log || []).find(a => a.id === activityId);
  if (!activity || !activity.can_undo || !activity.undo_payload) {
    return { success: false, message: 'Action cannot be undone' };
  }

  const { previousState, deletedTask } = activity.undo_payload;

  if (activity.item_type === 'task') {
    if (activity.action_type === 'delete' && deletedTask) {
      updateState(curr => ({
        ...curr,
        tasks: [deletedTask, ...(curr.tasks || [])]
      }));
    } else if (activity.action_type === 'update' && previousState) {
      updateState(curr => ({
        ...curr,
        tasks: (curr.tasks || []).map(t => t.id === activity.item_id ? previousState : t)
      }));
    }
  }

  // Mark activity undone
  updateState(curr => ({
    ...curr,
    activity_log: (curr.activity_log || []).map(a => a.id === activityId ? { ...a, can_undo: false, details: `${a.details} (Undone)` } : a)
  }));

  return { success: true, message: `Successfully reverted ${activity.title}` };
}

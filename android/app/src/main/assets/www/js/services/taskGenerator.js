/**
 * Akshay's 12-Month AI/ML Career OS - Task Generation & Habit Engine (Phase 3)
 * 
 * Functional Daily & Weekly Habit Engine:
 * - Deterministic task generation from active Phase 2 roadmap entities
 * - 6 Sections: PRIME 3.0, INDIVIDUAL LEARNING, DSA, PROJECT, REVISION, OPTIONAL
 * - Explicit task sources (e.g., "October 2026 → C Arrays", "Prime 3.0 → Module 2: Data Pre-processing")
 * - Priority tiers: MUST DO (Critical/High), SHOULD DO (Normal), EXTRA (Low)
 * - Bidirectional progress sync (Roadmap Topic <-> Month <-> Track; Prime Topic <-> Module <-> Track)
 * - Overload protection & adaptive rescheduling
 */

import { getState, updateState } from '../data/storage.js';
import { getEnrichedRoadmapMonths, getRoadmapEntities, updateRoadmapTopic, updatePrimeTopic } from './roadmapEngine.js';
import { PRIME_3_COURSE } from '../data/curriculum.js';

/**
 * Returns month, week, day-of-week info and schedule targets for a given date
 */
export function getMonthAndWeekInfo(dateString, state = getState()) {
  if (!dateString) dateString = state.user?.activeDate || '2026-10-01';
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-11
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  
  const dayOfMonth = d.getDate();
  const weekNumber = Math.min(Math.ceil(dayOfMonth / 7), 4); // Week 1 to 4

  // Match month in enriched Phase 2 roadmap
  const enrichedMonths = getEnrichedRoadmapMonths(state);
  const roadmapMonth = enrichedMonths.find(m => m.monthKey === monthKey || (m.start_date <= dateString && m.end_date >= dateString)) || enrichedMonths[0];

  // Distribute topics into weeks
  const topics = roadmapMonth.topics || [];
  const topicsPerWeek = Math.ceil(topics.length / 4);
  const weekTopics = topics.slice((weekNumber - 1) * topicsPerWeek, weekNumber * topicsPerWeek);

  // Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = d.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dayOfWeek];

  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const isWeekend = isSunday || isSaturday;

  // Study schedule from state settings (do NOT hardcode in UI)
  const schedule = state.studySchedule || {
    weekdayHours: 4.0,
    saturdayHours: 4.0,
    sundayHours: 8.0,
    weeklyTargetHours: 32.0,
    dsaDailyTarget: 2
  };

  const targetHours = isSunday 
    ? (schedule.sundayHours ?? 8.0) 
    : (isSaturday ? (schedule.saturdayHours ?? 4.0) : (schedule.weekdayHours ?? 4.0));

  return {
    dateString,
    monthKey,
    monthName: roadmapMonth.month || roadmapMonth.name,
    roadmapMonth,
    weekNumber,
    weekTopics,
    dayOfWeek,
    dayName,
    isSunday,
    isSaturday,
    isWeekend,
    targetHours
  };
}

/**
 * SECTION 3 & 5: DAILY TASK GENERATION
 * Generates tasks from:
 * 1. Current monthly roadmap
 * 2. Current weekly goals
 * 3. Prime 3.0 progress
 * 4. Individual roadmap topics
 * 5. DSA targets
 * 6. Active projects
 * 7. Revision queue
 */
export function generateDailyPlanForDate(dateString, state = getState()) {
  const existingTasks = (state.dailyTasks || state.daily_tasks || []).filter(t => t.date === dateString);

  // If tasks already exist for this date, return them
  if (existingTasks.length > 0) {
    return existingTasks;
  }

  const info = getMonthAndWeekInfo(dateString, state);
  const { primeTopics, primeModules } = getRoadmapEntities(state);

  // 1. PRIME 3.0 SOURCE & TOPIC
  const activePrimeTopic = primeTopics.find(pt => pt.status === 'Learning') ||
    primeTopics.find(pt => pt.status === 'Not Started') ||
    primeTopics[0];

  const primeLessons = state.primeLessons || {};
  let nextLesson = null;
  for (const mod of PRIME_3_COURSE.modules) {
    for (const l of mod.lessons) {
      const rec = primeLessons[l.id];
      if (!rec || (rec.status !== 'Mastered' && rec.status !== 'Applied' && !rec.understood)) {
        nextLesson = { ...l, moduleTitle: mod.title, status: rec?.status || 'Not Started' };
        break;
      }
    }
    if (nextLesson) break;
  }

  const primeLessonTitle = nextLesson ? nextLesson.title : (activePrimeTopic?.name || 'Python & Core Algorithms');
  const primeModuleTitle = nextLesson ? nextLesson.moduleTitle : 'Module: Foundations';

  // 2. INDIVIDUAL LEARNING SOURCE & TOPIC
  // Current month active topic
  const monthTopics = info.roadmapMonth.topics || [];
  const activeIndividualTopic = monthTopics.find(t => t.status === 'Learning') ||
    monthTopics.find(t => t.status === 'Not Started') ||
    monthTopics[0] || { id: 'top-oct-2', name: 'C Arrays', description: '1D/2D contiguity and pointer arithmetic.' };

  // 3. DSA TARGETS
  const dsaTargetCount = state.studySchedule?.dsaDailyTarget || 2;

  // 4. ACTIVE PROJECT
  const activeProject = (state.projects || []).find(p => p.status === 'Building' || p.status === 'Planning') || state.projects?.[0];
  const incompleteProjectTask = activeProject?.tasks?.find(t => !t.completed);

  // 5. REVISION QUEUE
  const revisionItems = (state.revisionItems || []).filter(r => r.status === 'Due today' || r.status === 'Due this week' || r.status === 'Overdue');
  const topRevision = revisionItems[0];

  const generated = [];

  // ==========================================
  // SECTION 1: PRIME 3.0 (MUST DO / Critical)
  // ==========================================
  generated.push({
    id: `task-p-${dateString}-${Date.now()}`,
    date: dateString,
    dueDate: dateString,
    section: 'PRIME 3.0',
    track: 'Prime 3.0',
    title: `Complete Prime 3.0: ${primeLessonTitle}`,
    description: `Watch lecture, take structured notes, code along, and recreate core algorithms independently.`,
    source: `Prime 3.0 → ${primeModuleTitle}`,
    durationMinutes: 90,
    priority: 'Critical', // Critical
    status: 'Not Started',
    completed: false,
    related_prime_topic_id: activePrimeTopic?.id || null,
    subtasks: [
      { id: `st-p1-${Date.now()}`, title: 'Course lesson & video breakdown', completed: false },
      { id: `st-p2-${Date.now()}`, title: 'Structured handwritten/typed notes', completed: false },
      { id: `st-p3-${Date.now()}`, title: 'Coding / practice implementation in notebook', completed: false },
      { id: `st-p4-${Date.now()}`, title: 'Revision & core concept check', completed: false }
    ]
  });

  // ==========================================
  // SECTION 2: INDIVIDUAL LEARNING (MUST DO / High)
  // ==========================================
  generated.push({
    id: `task-i-${dateString}-${Date.now() + 1}`,
    date: dateString,
    dueDate: dateString,
    section: 'INDIVIDUAL LEARNING',
    track: 'Individual',
    title: `Practice ${activeIndividualTopic.name}`,
    description: activeIndividualTopic.description || `Study ${activeIndividualTopic.name} and write clean sample programs.`,
    source: `${info.roadmapMonth.month ? `${info.roadmapMonth.month} ${info.roadmapMonth.year}` : (info.roadmapMonth.name || info.roadmapMonth.title)} → ${activeIndividualTopic.name}`,
    durationMinutes: 60,
    priority: 'High', // High
    status: 'Not Started',
    completed: false,
    related_roadmap_topic_id: activeIndividualTopic.id || null,
    subtasks: [
      { id: `st-i1-${Date.now()}`, title: `Today's roadmap topic: ${activeIndividualTopic.name}`, completed: false },
      { id: `st-i2-${Date.now()}`, title: 'Hands-on coding exercises / implementation', completed: false },
      { id: `st-i3-${Date.now()}`, title: 'Structured notes & syntax edge cases', completed: false }
    ]
  });

  // ==========================================
  // SECTION 3: DSA (MUST DO / High)
  // ==========================================
  generated.push({
    id: `task-d-${dateString}-${Date.now() + 2}`,
    date: dateString,
    dueDate: dateString,
    section: 'DSA',
    track: 'DSA',
    title: `Solve ${dsaTargetCount} DSA problems`,
    description: `Solve ${dsaTargetCount} algorithmic problems on LeetCode/platforms and document approach and time complexity.`,
    source: 'DSA Weekly Goal',
    durationMinutes: info.isSunday ? 90 : 60,
    priority: 'High', // High
    status: 'Not Started',
    completed: false,
    subtasks: [
      { id: `st-d1-${Date.now()}`, title: 'Problem 1: Solve & analyze space/time complexity', completed: false },
      { id: `st-d2-${Date.now()}`, title: 'Problem 2: Solve & log mistake category', completed: false }
    ]
  });

  // ==========================================
  // SECTION 4: PROJECT (SHOULD DO / Normal)
  // ==========================================
  if (activeProject) {
    const taskName = incompleteProjectTask ? incompleteProjectTask.title : 'Core feature implementation';
    generated.push({
      id: `task-pr-${dateString}-${Date.now() + 3}`,
      date: dateString,
      dueDate: dateString,
      section: 'PROJECT',
      track: 'Project',
      title: `Project: ${activeProject.name} - ${taskName}`,
      description: `Work on ${activeProject.name}: ${taskName}. Test functionality and verify memory safety.`,
      source: `Active Project: ${activeProject.name}`,
      durationMinutes: info.isSunday ? 120 : 45,
      priority: 'Normal', // Normal
      status: 'Not Started',
      completed: false,
      related_project_id: activeProject.id,
      related_project_task_id: incompleteProjectTask?.id || null,
      subtasks: [
        { id: `st-pr1-${Date.now()}`, title: `Today's project task: ${taskName}`, completed: false }
      ]
    });
  }

  // ==========================================
  // SECTION 5: REVISION (SHOULD DO / Normal)
  // ==========================================
  generated.push({
    id: `task-r-${dateString}-${Date.now() + 4}`,
    date: dateString,
    dueDate: dateString,
    section: 'REVISION',
    track: 'Revision',
    title: topRevision ? `Revision: Review ${topRevision.title}` : 'Revision: Review yesterday\'s C & Prime notes',
    description: topRevision ? (topRevision.notes || 'Review notes, formulas and tricky corner cases.') : 'Spaced repetition review of core syntax and algorithmic patterns.',
    source: topRevision ? `Spaced Revision Queue (${topRevision.topic})` : 'Spaced Revision Queue',
    durationMinutes: 20,
    priority: 'Normal', // Normal
    status: 'Not Started',
    completed: false,
    related_revision_id: topRevision?.id || null,
    subtasks: [
      { id: `st-r1-${Date.now()}`, title: 'Review due topic notes & edge cases', completed: false }
    ]
  });

  // ==========================================
  // SECTION 6: OPTIONAL (EXTRA / Low)
  // ==========================================
  generated.push({
    id: `task-opt-${dateString}-${Date.now() + 5}`,
    date: dateString,
    dueDate: dateString,
    section: 'OPTIONAL',
    track: 'Optional',
    title: 'Optional: Extra practice & repository polish',
    description: 'Extra practice, repository commit, or reading technical documentation (not mandatory).',
    source: 'Optional Daily Cadence',
    durationMinutes: 20,
    priority: 'Low', // Low
    status: 'Not Started',
    completed: false,
    subtasks: [
      { id: `st-opt1-${Date.now()}`, title: 'Extra problem or project enhancement', completed: false },
      { id: `st-opt2-${Date.now()}`, title: 'Push git commits if applicable', completed: false }
    ]
  });

  // Persist newly generated tasks into state
  updateState(curr => {
    const prevDaily = curr.dailyTasks || curr.daily_tasks || [];
    return {
      ...curr,
      dailyTasks: [...prevDaily, ...generated],
      daily_tasks: [...prevDaily, ...generated]
    };
  });

  return generated;
}

/**
 * SECTION 32: PROGRESS CONNECTION & COMPLETION
 * When a daily task is completed:
 * Update the appropriate source:
 * - Daily task -> Roadmap Topic -> Month -> Track B
 * - Prime daily task -> Prime Topic -> Module -> Track A
 * - Project task -> Project progress
 * - Revision task -> Revision item status
 */
export function completeDailyTask(taskId, actualMinutes = null, state = getState()) {
  const allTasks = state.dailyTasks || state.daily_tasks || [];
  const targetTask = allTasks.find(t => t.id === taskId);
  if (!targetTask) return;

  const now = new Date();
  const completionDate = targetTask.date || now.toISOString().split('T')[0];
  const completionTime = now.toTimeString().split(' ')[0];
  const minutesSpent = actualMinutes !== null ? parseInt(actualMinutes, 10) : (targetTask.durationMinutes || 45);

  updateState(curr => {
    // 1. Update task record
    const updatedTasks = (curr.dailyTasks || curr.daily_tasks || []).map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: true,
          status: 'Completed',
          completion_date: completionDate,
          completion_time: completionTime,
          actual_minutes: minutesSpent,
          subtasks: (t.subtasks || []).map(st => ({ ...st, completed: true }))
        };
      }
      return t;
    });

    // 2. Log in daily_task_logs
    const taskLogs = [...(curr.daily_task_logs || curr.taskLogs || [])];
    taskLogs.push({
      id: `log-${Date.now()}`,
      taskId,
      date: completionDate,
      status: 'Completed',
      actualMinutes: minutesSpent,
      completionTime
    });

    return {
      ...curr,
      dailyTasks: updatedTasks,
      daily_tasks: updatedTasks,
      daily_task_logs: taskLogs,
      taskLogs
    };
  });

  // 3. Bidirectional Roadmap Sync
  if (targetTask.related_roadmap_topic_id) {
    updateRoadmapTopic(targetTask.related_roadmap_topic_id, {
      status: 'Completed',
      progress: 100,
      completion_date: completionDate
    });
  }

  // 4. Bidirectional Prime 3.0 Sync
  if (targetTask.related_prime_topic_id) {
    updatePrimeTopic(targetTask.related_prime_topic_id, {
      status: 'Completed',
      progress: 100,
      completion_date: completionDate
    });
  }

  // 5. Project Sync (Phase 6 Integration - Section 15, 55)
  if (targetTask.related_project_id) {
    const projId = targetTask.related_project_id;
    const projTaskId = targetTask.related_project_task_id;
    const nowIso = new Date().toISOString();

    updateState(curr => {
      // 1. Update project_tasks table
      let matchedTaskTitle = '';
      const updatedProjectTasks = (curr.project_tasks || []).map(t => {
        if (t.project_id === projId && (t.id === projTaskId || (!projTaskId && !t.completed))) {
          matchedTaskTitle = t.title;
          return { ...t, completed: true, status: 'Completed', completed_at: nowIso };
        }
        return t;
      });

      // 2. Update projects array
      const projects = (curr.projects || []).map(p => {
        if (p.id === projId) {
          let found = false;
          const legacy = (p.tasks || []).map(pt => {
            if (pt.id === projTaskId || (!projTaskId && !found && !pt.completed)) {
              found = true;
              matchedTaskTitle = matchedTaskTitle || pt.title;
              return { ...pt, completed: true };
            }
            return pt;
          });

          // Calculate real progress
          const allTasksForP = updatedProjectTasks.filter(t => t.project_id === projId);
          const tasksSource = allTasksForP.length > 0 ? allTasksForP : legacy;
          const done = tasksSource.filter(t => t.completed || t.status === 'Completed').length;
          const progress = tasksSource.length > 0 ? Math.round((done / tasksSource.length) * 100) : p.progress;

          return {
            ...p,
            tasks: legacy,
            progress,
            status: progress === 100 ? (p.status === 'Completed' ? 'Completed' : 'Testing') : (progress > 0 && p.status === 'Planned' ? 'Building' : p.status),
            updated_at: nowIso
          };
        }
        return p;
      });

      const newAct = {
        id: `act-${Date.now()}`,
        project_id: projId,
        timestamp: nowIso,
        action_type: 'task_completed',
        description: `Daily task completed: "${matchedTaskTitle || targetTask.title}"`
      };

      return {
        ...curr,
        project_tasks: updatedProjectTasks,
        projects,
        project_activity: [newAct, ...(curr.project_activity || [])]
      };
    });
  }

  // 6. Revision Sync
  if (targetTask.related_revision_id) {
    updateState(curr => {
      const items = (curr.revisionItems || []).map(r => {
        if (r.id === targetTask.related_revision_id) {
          return {
            ...r,
            status: 'Completed',
            lastReviewed: completionDate,
            reviewCount: (r.reviewCount || 0) + 1
          };
        }
        return r;
      });
      return { ...curr, revisionItems: items };
    });
  }
}

/**
 * Undo task completion
 */
export function undoDailyTask(taskId, state = getState()) {
  const allTasks = state.dailyTasks || state.daily_tasks || [];
  const targetTask = allTasks.find(t => t.id === taskId);
  if (!targetTask) return;

  updateState(curr => {
    const updatedTasks = (curr.dailyTasks || curr.daily_tasks || []).map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: false,
          status: 'Not Started',
          completion_date: null,
          completion_time: null,
          actual_minutes: null,
          subtasks: (t.subtasks || []).map(st => ({ ...st, completed: false }))
        };
      }
      return t;
    });

    const taskLogs = (curr.daily_task_logs || curr.taskLogs || []).filter(l => l.taskId !== taskId);

    return {
      ...curr,
      dailyTasks: updatedTasks,
      daily_tasks: updatedTasks,
      daily_task_logs: taskLogs,
      taskLogs
    };
  });

  // Revert topic if necessary
  if (targetTask.related_roadmap_topic_id) {
    updateRoadmapTopic(targetTask.related_roadmap_topic_id, {
      status: 'Learning',
      progress: 50,
      completion_date: null
    });
  }

  if (targetTask.related_prime_topic_id) {
    updatePrimeTopic(targetTask.related_prime_topic_id, {
      status: 'Learning',
      progress: 50,
      completion_date: null
    });
  }
}

/**
 * SECTION 7: TASK SKIP WITH REASON
 * Never silently delete skipped tasks
 */
export function skipDailyTask(taskId, reason, notes = '', state = getState()) {
  updateState(curr => {
    const updatedTasks = (curr.dailyTasks || curr.daily_tasks || []).map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: false,
          skipped: true,
          status: 'Skipped',
          skip_reason: reason,
          skipReason: reason,
          skip_notes: notes,
          skipNotes: notes
        };
      }
      return t;
    });

    const taskLogs = [...(curr.daily_task_logs || curr.taskLogs || [])];
    taskLogs.push({
      id: `log-${Date.now()}`,
      taskId,
      status: 'Skipped',
      skipReason: reason,
      notes,
      date: new Date().toISOString().split('T')[0]
    });

    return {
      ...curr,
      dailyTasks: updatedTasks,
      daily_tasks: updatedTasks,
      daily_task_logs: taskLogs,
      taskLogs
    };
  });
}

/**
 * SECTION 28 & 29: OVERLOAD PROTECTION & RESCHEDULING
 */
export function checkDayOverload(targetDate, additionalMinutes = 0, state = getState()) {
  const d = new Date(targetDate);
  const isSunday = d.getDay() === 0;
  const isSaturday = d.getDay() === 6;

  const schedule = state.studySchedule || { weekdayHours: 4.0, saturdayHours: 4.0, sundayHours: 8.0 };
  const targetHours = isSunday ? (schedule.sundayHours ?? 8.0) : (isSaturday ? (schedule.saturdayHours ?? 4.0) : (schedule.weekdayHours ?? 4.0));
  const targetMinutes = targetHours * 60;

  const existingTasks = (state.dailyTasks || state.daily_tasks || []).filter(t => t.date === targetDate && t.status !== 'Skipped');
  const plannedMinutes = existingTasks.reduce((acc, t) => acc + (t.durationMinutes || 0), 0) + additionalMinutes;
  const plannedHours = (plannedMinutes / 60).toFixed(1);

  return {
    isOverloaded: plannedMinutes > targetMinutes,
    plannedHours: parseFloat(plannedHours),
    targetHours,
    plannedMinutes,
    targetMinutes,
    differenceHours: ((plannedMinutes - targetMinutes) / 60).toFixed(1)
  };
}

export function rescheduleDailyTask(taskId, targetDate, state = getState()) {
  updateState(curr => {
    const updatedTasks = (curr.dailyTasks || curr.daily_tasks || []).map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          date: targetDate,
          dueDate: targetDate,
          status: 'Not Started',
          completed: false,
          notes: `Rescheduled to ${targetDate}`
        };
      }
      return t;
    });

    return {
      ...curr,
      dailyTasks: updatedTasks,
      daily_tasks: updatedTasks
    };
  });
}

/**
 * Adaptive planning & backlog recovery
 */
export function evaluateAdaptivePlanning(state = getState()) {
  const activeDate = state.user?.activeDate || '2026-10-01';
  const curr = new Date(activeDate);

  const day = curr.getDay(); // 0 is Sun
  const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(curr.setDate(diffToMonday));
  const mondayStr = monday.toISOString().split('T')[0];

  const allTasks = state.dailyTasks || state.daily_tasks || [];
  const overdueTasks = allTasks.filter(t => {
    return t.date >= mondayStr && t.date <= activeDate && !t.completed && t.status !== 'Skipped';
  });

  const behindCount = overdueTasks.length;
  const isBehind = behindCount >= 2;

  const todayTasks = allTasks.filter(t => t.date === activeDate);
  const isTodayComplete = todayTasks.length > 0 && todayTasks.every(t => t.completed || t.status === 'Skipped');

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
  const updatedTasks = [...(state.dailyTasks || state.daily_tasks || [])];

  if (actionType === 'recover-this-week') {
    overdueTasks.forEach(t => {
      const idx = updatedTasks.findIndex(item => item.id === t.id);
      if (idx !== -1) {
        updatedTasks[idx] = { ...updatedTasks[idx], date: activeDate, notes: 'Rescheduled for catch-up today' };
      }
    });
  } else if (actionType === 'move-to-next-week') {
    overdueTasks.forEach(t => {
      const idx = updatedTasks.findIndex(item => item.id === t.id);
      if (idx !== -1) {
        const d = new Date(t.date);
        d.setDate(d.getDate() + 7);
        updatedTasks[idx] = { ...updatedTasks[idx], date: d.toISOString().split('T')[0], notes: 'Moved to next week' };
      }
    });
  } else if (actionType === 'spread-weekend') {
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

  return { ...state, dailyTasks: updatedTasks, daily_tasks: updatedTasks };
}

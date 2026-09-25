/**
 * Akshay's 12-Month AI/ML Career OS - Today View
 * Answers clearly: "WHAT DO I NEED TO DO TODAY?"
 */
import { getState, updateState } from '../data/storage.js';
import { getMonthAndWeekInfo, generateDailyPlanForDate } from '../services/taskGenerator.js';
import { calculateStreaks } from '../services/streakService.js';
import { getIcon } from '../components/icons.js';
import { openAddTaskModal, openLogStudyModal, openHabitSkipReasonModal } from '../components/modals.js';
import { getTrackBadgeClass } from './dashboardView.js';

export function renderToday(container) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const info = getMonthAndWeekInfo(activeDate);
  const streaks = calculateStreaks(state);

  const tasks = generateDailyPlanForDate(activeDate, state);
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Study hours today
  let todayMinutes = 0;
  (state.studySessions || []).filter(s => s.date === activeDate).forEach(s => {
    todayMinutes += (s.durationMinutes || 0);
  });
  const todayStudyHours = (todayMinutes / 60).toFixed(1);
  const targetStudyHours = info.isSunday ? state.studySchedule.sundayHours : (info.isSaturday ? state.studySchedule.saturdayHours : state.studySchedule.weekdayHours);

  // Today's habits status
  const todayHabitLogs = (state.habitLogs || {})[activeDate] || {};

  container.innerHTML = `
    <!-- Screen Header -->
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('today', 'text-primary')} What Do I Need To Do Today?</h1>
        <div class="view-subtitle" style="display: flex; gap: 10px; align-items: center;">
          <span>${info.dayName}, ${activeDate}</span>
          <span>·</span>
          <span>Current Streak: <strong class="text-amber">${streaks.dailyStreak} days 🔥</strong></span>
          <span>·</span>
          <span>Active Curriculum: <strong>${info.roadmapMonth.name} (${info.roadmapMonth.title})</strong></span>
        </div>
      </div>
      <div class="view-actions">
        <button class="btn btn-secondary" id="btn-today-log-study">${getIcon('clock')} Log Study Hours</button>
        <button class="btn btn-primary" id="btn-today-add-task">${getIcon('plus')} Add Task</button>
      </div>
    </div>

    <!-- Progress Ring & Metrics Banner -->
    <div class="card" style="margin-bottom: var(--space-lg); background: linear-gradient(135deg, var(--color-bg-surface), var(--color-bg-surface-elevated));">
      <div style="display: flex; align-items: center; justify-content: space-around; flex-wrap: wrap; gap: var(--space-lg);">
        <div style="display: flex; align-items: center; gap: var(--space-lg);">
          <div class="progress-ring-container">
            <svg width="110" height="110">
              <circle cx="55" cy="55" r="45" stroke="var(--color-bg-base)" stroke-width="10" fill="transparent" />
              <circle cx="55" cy="55" r="45" stroke="var(--color-accent-emerald)" stroke-width="10" fill="transparent"
                stroke-dasharray="282.74" stroke-dashoffset="${282.74 - (282.74 * progressPercent / 100)}"
                class="progress-ring-circle" stroke-linecap="round" />
            </svg>
            <div class="progress-ring-label">
              <span style="font-size: 1.3rem;">${progressPercent}%</span>
              <span style="font-size: 0.65rem; color: var(--color-text-muted);">DONE</span>
            </div>
          </div>
          <div>
            <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">Today's Target</div>
            <div style="font-size: 0.95rem; color: var(--color-text-secondary); margin-bottom: 2px;">
              Tasks Completed: <strong class="font-mono text-emerald">${completedTasks} / ${tasks.length}</strong>
            </div>
            <div style="font-size: 0.95rem; color: var(--color-text-secondary);">
              Study Time: <strong class="font-mono text-cyan">${todayStudyHours} / ${targetStudyHours} hours</strong>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
          <div style="background: var(--color-bg-base); padding: 12px 18px; border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center;">
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">Prime 3.0 Target</div>
            <div style="font-weight: 700; font-family: var(--font-mono); color: var(--color-primary);">${state.studySchedule.defaultAllocations.primeHours}h</div>
          </div>
          <div style="background: var(--color-bg-base); padding: 12px 18px; border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center;">
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">DSA Target</div>
            <div style="font-weight: 700; font-family: var(--font-mono); color: var(--color-accent-amber);">${state.studySchedule.defaultAllocations.dsaHours}h</div>
          </div>
          <div style="background: var(--color-bg-base); padding: 12px 18px; border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center;">
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">Individual CS Target</div>
            <div style="font-weight: 700; font-family: var(--font-mono); color: var(--color-accent-emerald);">${state.studySchedule.defaultAllocations.individualHours}h</div>
          </div>
          <div style="background: var(--color-bg-base); padding: 12px 18px; border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center;">
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">Revision / Project</div>
            <div style="font-weight: 700; font-family: var(--font-mono); color: var(--color-accent-purple);">${state.studySchedule.defaultAllocations.revisionProjectHours}h</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main 2-Column Execution Grid -->
    <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: var(--space-lg);">
      <!-- Column 1: Structured Today Task Checklist -->
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <h2 style="font-size: 1.2rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <span>Today's Roadmap Tasks</span>
            <span class="badge badge-slate">${tasks.length}</span>
          </h2>
          <button class="btn btn-ghost btn-sm" id="btn-re-generate-plan">Regenerate From Roadmap</button>
        </div>

        <div class="task-list" id="today-tasks-container">
          ${tasks.map(t => `
            <div class="task-item ${t.completed ? 'completed' : ''}" style="flex-direction: column; align-items: stretch; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <input type="checkbox" class="custom-checkbox today-task-cb" data-task-id="${t.id}" ${t.completed ? 'checked' : ''} />
                <div class="task-content">
                  <span class="task-title" style="font-size: 0.95rem;">${t.title}</span>
                  <div class="task-meta">
                    <span class="badge ${getTrackBadgeClass(t.track)}">${t.track}</span>
                    <span>${t.durationMinutes} mins</span>
                    ${t.completed ? `<span class="text-emerald">✓ Completed</span>` : ''}
                  </div>
                </div>
                <button class="btn btn-ghost btn-icon btn-delete-task" data-task-id="${t.id}" title="Delete task">${ICONS.trash}</button>
              </div>

              <!-- Subtasks (Lesson, Notes, Coding, Revision) -->
              ${t.subtasks && t.subtasks.length > 0 ? `
                <div style="margin-left: 32px; padding: 6px 12px; background: var(--color-bg-surface-elevated); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 4px;">
                  ${t.subtasks.map(st => `
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; cursor: pointer;">
                      <input type="checkbox" class="custom-checkbox subtask-cb" data-task-id="${t.id}" data-subtask-id="${st.id}" ${st.completed ? 'checked' : ''} />
                      <span style="${st.completed ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">${st.title}</span>
                    </label>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Complete Today's Plan Button -->
        <div style="margin-top: var(--space-lg); text-align: center;">
          <button class="btn btn-accent" id="btn-complete-plan" style="width: 100%; max-width: 320px; padding: 12px 24px; font-size: 1rem;">
            ${getIcon('check')} Complete Today's Plan
          </button>
        </div>
      </div>

      <!-- Column 2: Daily Habit System Checklist -->
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <h2 style="font-size: 1.2rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <span>Daily Habits Checklist</span>
          </h2>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">Track completion & reasons</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${state.habits.map(h => {
            const log = todayHabitLogs[h.id] || { status: 'Not Marked' };
            return `
              <div class="habit-card">
                <div class="habit-top">
                  <div class="habit-title-wrap">
                    ${getIcon(h.icon || 'check', 'text-primary')}
                    <span>${h.name}</span>
                  </div>
                  <div class="habit-btn-group">
                    <button class="habit-status-btn ${log.status === 'Completed' ? 'active-completed' : ''}"
                      data-habit-id="${h.id}" data-status="Completed">Done</button>
                    <button class="habit-status-btn ${log.status === 'Partially completed' ? 'active-partial' : ''}"
                      data-habit-id="${h.id}" data-status="Partially completed">Partial</button>
                    <button class="habit-status-btn ${log.status === 'Skipped' ? 'active-skipped' : ''}"
                      data-habit-id="${h.id}" data-status="Skipped" data-habit-name="${h.name}">Skip</button>
                  </div>
                </div>

                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-muted);">
                  <span>${h.description}</span>
                  ${log.status === 'Skipped' && log.skipReason ? `
                    <span class="badge badge-rose" title="${log.notes || ''}">Skipped: ${log.skipReason}</span>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Attach handlers
  document.getElementById('btn-today-log-study').onclick = openLogStudyModal;
  document.getElementById('btn-today-add-task').onclick = () => openAddTaskModal(activeDate);

  // Regenerate plan
  document.getElementById('btn-re-generate-plan').onclick = () => {
    updateState(curr => {
      // Remove auto-generated tasks for today and regenerate fresh from syllabus
      const filtered = (curr.dailyTasks || []).filter(t => t.date !== activeDate || !t.id.startsWith('gen-'));
      return { ...curr, dailyTasks: filtered };
    });
  };

  // Complete Plan button
  document.getElementById('btn-complete-plan').onclick = () => {
    updateState(curr => {
      const updated = (curr.dailyTasks || []).map(t => {
        if (t.date === activeDate) {
          return {
            ...t,
            completed: true,
            subtasks: (t.subtasks || []).map(st => ({ ...st, completed: true }))
          };
        }
        return t;
      });
      return { ...curr, dailyTasks: updated };
    });
    alert("🎉 Excellent work! Today's full plan marked complete.");
  };

  // Task Checkboxes
  container.querySelectorAll('.today-task-cb').forEach(cb => {
    cb.onchange = (e) => {
      const taskId = e.target.getAttribute('data-task-id');
      const isChecked = e.target.checked;
      updateState(curr => {
        const updated = (curr.dailyTasks || []).map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              completed: isChecked,
              subtasks: (t.subtasks || []).map(st => ({ ...st, completed: isChecked }))
            };
          }
          return t;
        });
        return { ...curr, dailyTasks: updated };
      });
    };
  });

  // Subtask Checkboxes
  container.querySelectorAll('.subtask-cb').forEach(cb => {
    cb.onchange = (e) => {
      const taskId = e.target.getAttribute('data-task-id');
      const subtaskId = e.target.getAttribute('data-subtask-id');
      const isChecked = e.target.checked;

      updateState(curr => {
        const updated = (curr.dailyTasks || []).map(t => {
          if (t.id === taskId) {
            const subs = (t.subtasks || []).map(st => st.id === subtaskId ? { ...st, completed: isChecked } : st);
            const allSubsComplete = subs.every(st => st.completed);
            return { ...t, subtasks: subs, completed: allSubsComplete };
          }
          return t;
        });
        return { ...curr, dailyTasks: updated };
      });
    };
  });

  // Delete Task
  container.querySelectorAll('.btn-delete-task').forEach(btn => {
    btn.onclick = () => {
      const taskId = btn.getAttribute('data-task-id');
      if (confirm('Delete this task?')) {
        updateState(curr => ({
          ...curr,
          dailyTasks: (curr.dailyTasks || []).filter(t => t.id !== taskId)
        }));
      }
    };
  });

  // Habit Status buttons
  container.querySelectorAll('.habit-status-btn').forEach(btn => {
    btn.onclick = () => {
      const habitId = btn.getAttribute('data-habit-id');
      const targetStatus = btn.getAttribute('data-status');
      const habitName = btn.getAttribute('data-habit-name') || habitId;

      if (targetStatus === 'Skipped') {
        openHabitSkipReasonModal(habitId, habitName, activeDate, (reason, notes) => {
          setHabitRecord(habitId, 'Skipped', reason, notes);
        });
      } else {
        setHabitRecord(habitId, targetStatus, null, '');
      }
    };
  });

  function setHabitRecord(habitId, status, skipReason, notes) {
    updateState(curr => {
      const logs = { ...(curr.habitLogs || {}) };
      if (!logs[activeDate]) logs[activeDate] = {};
      logs[activeDate][habitId] = {
        status,
        skipReason: skipReason || null,
        notes: notes || '',
        updatedAt: new Date().toISOString()
      };
      return { ...curr, habitLogs: logs };
    });
  }
}

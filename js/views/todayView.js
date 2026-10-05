/**
 * AI Study & Task Planner - TODAY View
 * Primary daily execution screen.
 * Supports date navigation, task checklist, carried forward tasks, and study logging.
 */

import { getIcon } from '../components/icons.js';
import {
  getTodayData,
  toggleTaskCompletion,
  doTodayTask,
  logFocusSession,
  getCategoryMeta,
  hasImplementedPlan
} from '../services/trackerService.js';
import {
  getCanonicalToday,
  shiftDate,
  formatLiveDateTime,
  formatShortDate
} from '../services/dateService.js';
import {
  openEditPlannedTaskModal,
  openRescheduleTaskModal,
  openNewTaskModal
} from '../components/trackerModals.js';

let viewingDate = null;
let liveClockInterval = null;

export function setTodayViewingDate(d) {
  viewingDate = d;
}

export function cleanupTodayView() {
  if (liveClockInterval) {
    clearInterval(liveClockInterval);
    liveClockInterval = null;
  }
}

export function renderToday(container) {
  cleanupTodayView();

  if (!hasImplementedPlan()) {
    container.innerHTML = `
      <div class="tracker-page animate-fade-in" style="max-width: 620px; margin: 60px auto; text-align: center; padding: 0 16px;">
        <div class="card" style="padding: 44px 32px; border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-bg-surface); box-shadow: var(--shadow-sm);">
          <div style="font-size: 2.4rem; margin-bottom: 14px;">📋</div>
          <h2 style="font-size: 1.4rem; font-weight: 800; margin: 0 0 8px; color: var(--color-text-main);">No Implemented Plan</h2>
          <p style="font-size: 0.92rem; color: var(--color-text-secondary); margin: 0 auto 24px; max-width: 440px; line-height: 1.5;">
            The Daily tasks execution section becomes available after you generate and implement a plan.
          </p>
          <a href="#create-plan" class="btn btn-primary" style="display: inline-flex; font-weight: 700; padding: 10px 22px; text-decoration: none; gap: 6px;">
            ${getIcon('sparkles')} <span>Create Your Plan</span>
          </a>
        </div>
      </div>
    `;
    return;
  }

  const canonicalToday = getCanonicalToday();
  const activeDate = viewingDate || canonicalToday;
  const isToday = (activeDate === canonicalToday);
  const isPast = activeDate < canonicalToday;

  const data = getTodayData(activeDate);

  // Helper for live time
  function getLiveTime() {
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(new Date());
    } catch (e) {
      return new Date().toLocaleTimeString();
    }
  }

  container.innerHTML = `
    <div class="tracker-page animate-fade-in" style="max-width: 900px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 24px; padding-bottom: 60px;">
      
      <!-- TOP HEADER WITH DATE NAV & LIVE CLOCK -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <h1 style="font-size: 1.65rem; font-weight: 800; margin: 0; color: var(--color-text-main); display: flex; align-items: center; gap: 8px;">
              ${getIcon('today', 'style="color: var(--color-primary); width: 26px; height: 26px;"')}
              <span>TODAY</span>
            </h1>
            ${activeDate === canonicalToday ? `
              <span class="badge badge-emerald" style="font-size: 0.72rem; font-weight: 700;">CURRENT DAY</span>
            ` : `
              <span class="badge badge-gray" style="font-size: 0.72rem; font-weight: 700;">Viewing: ${formatShortDate(activeDate)}</span>
            `}
          </div>
          <div style="font-size: 0.9rem; color: var(--color-text-secondary); margin-top: 2px;">
            ${data.formattedDate}
          </div>
        </div>

        <!-- Date Controls -->
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <button id="btn-prev-day" class="btn btn-secondary btn-sm" title="Previous Day">
            ← Prev
          </button>
          <button id="btn-today-reset" class="btn btn-ghost btn-sm" style="font-weight: 700; ${activeDate === canonicalToday ? 'display: none;' : ''}">
            Today
          </button>
          <button id="btn-next-day" class="btn btn-secondary btn-sm" title="Next Day">
            Next →
          </button>
          <div id="today-live-clock" style="font-family: var(--font-mono); font-size: 0.95rem; font-weight: 700; color: var(--color-text-main); background: var(--color-bg-surface); padding: 5px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border); margin-left: 4px;">
            ${getLiveTime()}
          </div>
        </div>
      </div>

      <!-- TODAY PROGRESS METRICS CARD -->
      <div class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted);">
              Daily Completion
            </div>
            <div style="display: flex; align-items: baseline; gap: 10px; margin-top: 4px;">
              <span style="font-size: 1.8rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main);">
                ${data.completedTasksCount} / ${data.totalTasksCount}
              </span>
              <span style="font-size: 0.9rem; color: var(--color-text-muted);">tasks finished</span>
              <span class="badge ${data.completionPercentage === 100 && data.totalTasksCount > 0 ? 'badge-emerald' : 'badge-blue'}" style="margin-left: 6px;">
                ${data.completionPercentage}%
              </span>
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted);">
              Study Time Logged
            </div>
            <div style="font-size: 1.6rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-primary); margin-top: 4px;">
              ${data.studyHoursDisplay} hrs
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div style="width: 100%; height: 8px; background: var(--color-bg-base); border-radius: 999px; overflow: hidden; border: 1px solid var(--color-border-subtle); margin-top: 14px;">
          <div style="width: ${data.completionPercentage}%; height: 100%; background: linear-gradient(90deg, var(--color-primary), #60A5FA); border-radius: 999px; transition: width 0.3s ease;"></div>
        </div>
      </div>

      <!-- CARRIED FORWARD / OVERDUE SECTION (If any exist) -->
      ${data.overdueTasks.length > 0 ? `
        <div class="card" style="padding: 18px 20px; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: var(--radius-lg); background: rgba(244, 63, 94, 0.03);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--color-accent-rose); font-weight: 800; font-size: 0.85rem; text-transform: uppercase;">
                ⚠️ Carried Forward (${data.overdueTasks.length})
              </span>
              <span style="font-size: 0.75rem; color: var(--color-text-muted);">Unfinished tasks from past days</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${data.overdueTasks.map(t => {
              const meta = getCategoryMeta(t.category);
              return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); gap: 10px; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 200px;">
                    <span style="font-size: 0.75rem; font-family: var(--font-mono); font-weight: 700; color: var(--color-accent-rose);">
                      ${formatShortDate(t.date)}
                    </span>
                    <span class="badge ${meta.badgeClass}" style="font-size: 0.65rem;">${meta.label}</span>
                    <span style="font-size: 0.88rem; font-weight: 600; color: var(--color-text-main);">${t.title}</span>
                  </div>

                  <div style="display: flex; align-items: center; gap: 8px;">
                    <button class="btn btn-secondary btn-xs btn-do-today" data-task-id="${t.id}" title="Move task to today">
                      Do Today
                    </button>
                    <button class="btn btn-ghost btn-xs btn-reschedule" data-task-id="${t.id}">
                      Reschedule
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- SCHEDULED TASKS CHECKLIST -->
      <div class="card" style="padding: 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="font-size: 1.15rem; font-weight: 800; margin: 0; color: var(--color-text-main); display: flex; align-items: center; gap: 8px;">
            <span>Tasks Checklist</span>
            <span class="badge badge-blue" style="font-size: 0.72rem;">${data.tasks.length}</span>
          </h2>

          <button id="btn-add-today-task" class="btn btn-secondary btn-sm" style="font-weight: 700; gap: 6px;">
            ${getIcon('plus')} <span>+ Add Task</span>
          </button>
        </div>

        ${!isToday ? `
          <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--color-text-main);">
              <span style="font-size: 1.05rem;">🔒</span>
              <span>
                <strong>Task completion locked:</strong> You are viewing ${isPast ? 'a previous day' : 'a future day'}. Checkboxes can only be marked on <strong>Today</strong> (${formatShortDate(canonicalToday)}).
              </span>
            </div>
            <button id="btn-jump-today" class="btn btn-secondary btn-xs" style="font-weight: 700; white-space: nowrap;">
              Jump to Today →
            </button>
          </div>
        ` : ''}

        ${data.tasks.length === 0 ? `
          <div style="padding: 32px 16px; text-align: center; color: var(--color-text-muted);">
            <div style="font-size: 2rem; margin-bottom: 8px;">🗓️</div>
            <div style="font-size: 1rem; font-weight: 700; color: var(--color-text-main);">No tasks scheduled for this day</div>
            <p style="font-size: 0.85rem; margin-top: 4px;">Enjoy your rest day or click "+ Add Task" to schedule something.</p>
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${data.tasks.map(t => {
              const meta = getCategoryMeta(t.category);
              return `
                <div class="task-card-item" data-task-id="${t.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); gap: 12px; flex-wrap: wrap; transition: all 0.2s ease;">
                  
                  <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 220px;">
                    <input
                      type="checkbox"
                      class="task-item-checkbox"
                      data-task-id="${t.id}"
                      ${t.completed ? 'checked' : ''}
                      ${!isToday ? 'disabled' : ''}
                      style="width: 19px; height: 19px; accent-color: var(--color-primary); cursor: ${isToday ? 'pointer' : 'not-allowed'}; ${!isToday ? 'opacity: 0.5;' : ''}"
                      title="${!isToday ? (isPast ? 'Previous day: Task completion is locked outside of Today' : 'Future day: Task completion is locked outside of Today') : 'Mark task complete'}"
                    />
                    
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                        <span class="badge ${meta.badgeClass}" style="font-size: 0.68rem; padding: 2px 6px;">
                          ${meta.label}
                        </span>
                        ${t.priority === 'High' ? '<span class="badge badge-rose" style="font-size: 0.65rem;">HIGH</span>' : ''}
                      </div>
                      <div style="font-size: 0.92rem; font-weight: 700; color: var(--color-text-main); ${t.completed ? 'text-decoration: line-through; opacity: 0.55;' : ''}">
                        ${t.title}
                      </div>
                      ${t.notes ? `<div style="font-size: 0.78rem; color: var(--color-text-muted); margin-top: 2px;">${t.notes}</div>` : ''}
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 0.78rem; font-family: var(--font-mono); font-weight: 700; color: var(--color-text-muted); background: var(--color-bg-surface); padding: 3px 8px; border-radius: 4px; border: 1px solid var(--color-border-subtle);">
                      ${t.durationMinutes} min
                    </span>

                    <button class="btn btn-ghost btn-xs btn-icon btn-edit-task" data-task-id="${t.id}" title="Edit task">
                      ${getIcon('pencil')}
                    </button>
                    <button class="btn btn-ghost btn-xs btn-icon btn-reschedule" data-task-id="${t.id}" title="Reschedule task">
                      ${getIcon('calendar')}
                    </button>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- INLINE STUDY LOGGER CARD -->
      <div class="card" style="padding: 18px 22px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 0.82rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted);">
            Log Study Session
          </span>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">Add custom study time for this date</span>
        </div>

        <form id="form-log-study-inline" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <input
            type="number"
            id="input-inline-minutes"
            class="form-input"
            value="30"
            min="5"
            max="480"
            step="5"
            placeholder="Minutes"
            style="width: 110px; font-family: var(--font-mono); font-weight: 700; padding: 7px 10px; font-size: 0.9rem;"
          />
          <span style="font-size: 0.82rem; color: var(--color-text-secondary); font-weight: 600;">minutes</span>

          <input
            type="text"
            id="input-inline-notes"
            class="form-input"
            placeholder="Topic studied (optional)"
            style="flex: 1; min-width: 160px; padding: 7px 12px; font-size: 0.86rem;"
          />

          <button type="submit" class="btn btn-secondary btn-sm" style="font-weight: 700; padding: 7px 16px;">
            Save Log
          </button>
        </form>
      </div>

    </div>
  `;

  // Start live clock
  liveClockInterval = setInterval(() => {
    const clockEl = document.getElementById('today-live-clock');
    if (clockEl) clockEl.textContent = getLiveTime();
  }, 1000);

  // Date Navigation
  const btnPrev = container.querySelector('#btn-prev-day');
  if (btnPrev) {
    btnPrev.onclick = () => {
      setTodayViewingDate(shiftDate(activeDate, -1));
      renderToday(container);
    };
  }

  const btnNext = container.querySelector('#btn-next-day');
  if (btnNext) {
    btnNext.onclick = () => {
      setTodayViewingDate(shiftDate(activeDate, 1));
      renderToday(container);
    };
  }

  const btnTodayReset = container.querySelector('#btn-today-reset');
  if (btnTodayReset) {
    btnTodayReset.onclick = () => {
      setTodayViewingDate(null);
      renderToday(container);
    };
  }

  // Jump to today from lock banner
  const btnJumpToday = container.querySelector('#btn-jump-today');
  if (btnJumpToday) {
    btnJumpToday.onclick = () => {
      setTodayViewingDate(null);
      renderToday(container);
    };
  }

  // Checkbox completion toggle
  container.querySelectorAll('.task-item-checkbox').forEach(cb => {
    cb.onchange = async () => {
      if (!isToday) {
        cb.checked = !cb.checked;
        return;
      }
      const taskId = cb.getAttribute('data-task-id');
      try {
        await toggleTaskCompletion(taskId, cb.checked, { enforceToday: true });
      } catch (err) {
        console.warn(err.message);
        cb.checked = !cb.checked;
      }
      renderToday(container);
    };
  });

  // "Do Today" button on carried forward tasks
  container.querySelectorAll('.btn-do-today').forEach(btn => {
    btn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const taskId = btn.getAttribute('data-task-id');
      if (!taskId) return;
      btn.disabled = true;
      btn.textContent = 'Moving...';
      try {
        await doTodayTask(taskId, activeDate);
        renderToday(container);
      } catch (err) {
        console.error('Failed to move task to today:', err);
        btn.disabled = false;
        btn.textContent = 'Do Today';
      }
    };
  });

  // Edit Task Button
  container.querySelectorAll('.btn-edit-task').forEach(btn => {
    btn.onclick = () => {
      const taskId = btn.getAttribute('data-task-id');
      const allTasks = data.tasks.concat(data.overdueTasks);
      const target = allTasks.find(t => t.id === taskId);
      if (target) {
        openEditPlannedTaskModal(target, () => renderToday(container));
      }
    };
  });

  // Reschedule Task Button
  container.querySelectorAll('.btn-reschedule').forEach(btn => {
    btn.onclick = () => {
      const taskId = btn.getAttribute('data-task-id');
      const allTasks = data.tasks.concat(data.overdueTasks);
      const target = allTasks.find(t => t.id === taskId);
      if (target) {
        openRescheduleTaskModal(target, () => renderToday(container));
      }
    };
  });

  // Add Task Button
  const btnAdd = container.querySelector('#btn-add-today-task');
  if (btnAdd) {
    btnAdd.onclick = () => {
      openNewTaskModal(activeDate, () => renderToday(container));
    };
  }

  // Study log submission
  const logForm = container.querySelector('#form-log-study-inline');
  if (logForm) {
    logForm.onsubmit = async (e) => {
      e.preventDefault();
      const min = Number(container.querySelector('#input-inline-minutes').value) || 30;
      const notes = container.querySelector('#input-inline-notes').value.trim();
      await logFocusSession({
        date: activeDate,
        durationMinutes: min,
        category: 'Learning',
        notes
      });
      renderToday(container);
    };
  }
}

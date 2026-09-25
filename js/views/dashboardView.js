/**
 * Akshay's 12-Month AI/ML Career OS - Dashboard View
 */
import { getState, updateState } from '../data/storage.js';
import { calculateComprehensiveAnalytics } from '../services/analyticsService.js';
import { calculateStreaks } from '../services/streakService.js';
import { getMonthAndWeekInfo, generateDailyPlanForDate } from '../services/taskGenerator.js';
import { getIcon } from '../components/icons.js';
import { openQuickActionModal, openAddTaskModal, openLogStudyModal, openAddDsaModal, openAddProjectModal } from '../components/modals.js';

export function renderDashboard(container) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const analytics = calculateComprehensiveAnalytics(state);
  const streaks = calculateStreaks(state);
  const info = getMonthAndWeekInfo(activeDate);

  // Auto-generate or fetch today's tasks
  const todayTasks = generateDailyPlanForDate(activeDate, state);
  const completedTodayTasks = todayTasks.filter(t => t.completed).length;
  const progressPercent = todayTasks.length > 0 ? Math.round((completedTodayTasks / todayTasks.length) * 100) : 0;

  // Study hours today
  let todayMinutes = 0;
  (state.studySessions || []).filter(s => s.date === activeDate).forEach(s => {
    todayMinutes += (s.durationMinutes || 0);
  });
  const todayStudyHours = (todayMinutes / 60).toFixed(1);
  const targetStudyHours = info.isSunday ? state.studySchedule.sundayHours : (info.isSaturday ? state.studySchedule.saturdayHours : state.studySchedule.weekdayHours);

  // Greeting by hour
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : (hour < 18 ? 'Good afternoon' : 'Good evening');

  container.innerHTML = `
    <!-- Top Career Target Header -->
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${greeting}, ${state.user.name}</h1>
        <div class="view-subtitle" style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-emerald">12-Month Goal: Oct 1, 2026 → Sep 30, 2027</span>
          <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-text-muted);">
            Active Date: ${activeDate} (${info.dayName})
          </span>
        </div>
      </div>
      <div class="view-actions">
        <button class="btn btn-primary" id="btn-quick-action">${getIcon('plus')} <span>Quick Action</span></button>
      </div>
    </div>

    <!-- 4 High-Level Track Overview Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-lg);">
      <!-- Track A: Prime 3.0 -->
      <div class="stat-card" style="border-top: 3px solid var(--color-primary); cursor: pointer;" id="card-nav-prime">
        <div class="stat-header">
          <span>TRACK A: PRIME 3.0 AI/ML</span>
          ${getIcon('prime', 'text-primary')}
        </div>
        <div class="stat-value text-primary">${analytics.prime.percentage}%</div>
        <div class="progress-bar-wrap" style="margin: 6px 0;">
          <div class="progress-bar-fill" style="width: ${analytics.prime.percentage}%;"></div>
        </div>
        <div class="stat-subtext">
          <span>${analytics.prime.understood + analytics.prime.applied + analytics.prime.mastered} / ${analytics.prime.totalLessons} lessons mastered/applied</span>
        </div>
      </div>

      <!-- Track B: Individual Roadmap -->
      <div class="stat-card" style="border-top: 3px solid var(--color-accent-emerald); cursor: pointer;" id="card-nav-roadmap">
        <div class="stat-header">
          <span>TRACK B: INDIVIDUAL CS</span>
          ${getIcon('roadmap', 'text-emerald')}
        </div>
        <div class="stat-value text-emerald">${analytics.roadmap.percentage}%</div>
        <div class="progress-bar-wrap" style="margin: 6px 0;">
          <div class="progress-bar-fill emerald" style="width: ${analytics.roadmap.percentage}%;"></div>
        </div>
        <div class="stat-subtext">
          <span>${info.roadmapMonth.name}: ${info.roadmapMonth.title}</span>
        </div>
      </div>

      <!-- DSA Tracker -->
      <div class="stat-card" style="border-top: 3px solid var(--color-accent-cyan); cursor: pointer;" id="card-nav-dsa">
        <div class="stat-header">
          <span>DSA SOLVED</span>
          ${getIcon('dsa', 'text-cyan')}
        </div>
        <div class="stat-value text-cyan">${analytics.dsa.totalSolved}</div>
        <div class="stat-subtext" style="gap: 8px;">
          <span class="badge badge-emerald">${analytics.dsa.easy}E</span>
          <span class="badge badge-amber">${analytics.dsa.medium}M</span>
          <span class="badge badge-rose">${analytics.dsa.hard}H</span>
        </div>
      </div>

      <!-- Projects -->
      <div class="stat-card" style="border-top: 3px solid var(--color-accent-purple); cursor: pointer;" id="card-nav-projects">
        <div class="stat-header">
          <span>PORTFOLIO PROJECTS</span>
          ${getIcon('projects', 'text-purple')}
        </div>
        <div class="stat-value text-purple">${analytics.projects.total}</div>
        <div class="stat-subtext">
          <span>${analytics.projects.inProgress} building · ${analytics.projects.completed} deployed</span>
        </div>
      </div>
    </div>

    <!-- Bento Grid for Today's Execution -->
    <div class="dashboard-grid">
      <!-- Today's Execution Plan (8 cols) -->
      <div class="card col-8">
        <div class="card-header">
          <div class="card-title">
            ${getIcon('today', 'text-primary')}
            <span>Today's Plan (${activeDate})</span>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" id="btn-add-today-task">${getIcon('plus')} Add Task</button>
            <button class="btn btn-primary btn-sm" id="btn-jump-today">Open Focus View</button>
          </div>
        </div>

        <div class="task-list" id="dashboard-task-list">
          ${todayTasks.slice(0, 5).map(t => `
            <div class="task-item ${t.completed ? 'completed' : ''}" data-task-id="${t.id}">
              <input type="checkbox" class="custom-checkbox task-cb" data-task-id="${t.id}" ${t.completed ? 'checked' : ''} />
              <div class="task-content">
                <span class="task-title">${t.title}</span>
                <div class="task-meta">
                  <span class="badge ${getTrackBadgeClass(t.track)}">${t.track}</span>
                  <span>${t.durationMinutes} mins</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        ${todayTasks.length > 5 ? `
          <div style="text-align: center; margin-top: 12px;">
            <button class="btn btn-ghost btn-sm" id="btn-view-all-tasks">+ ${todayTasks.length - 5} more tasks in Today view</button>
          </div>
        ` : ''}
      </div>

      <!-- Streaks & Today Progress Ring (4 cols) -->
      <div class="card col-4" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="card-header">
            <div class="card-title">
              ${getIcon('flame', 'text-amber')}
              <span>Consistency & Streaks</span>
            </div>
            <span class="badge badge-emerald">${streaks.recoveryDaysAvailable} Recovery Day Left</span>
          </div>

          <!-- Progress Ring -->
          <div style="display: flex; align-items: center; justify-content: center; padding: var(--space-md) 0;">
            <div class="progress-ring-container">
              <svg width="120" height="120">
                <circle cx="60" cy="60" r="50" stroke="var(--color-bg-surface-elevated)" stroke-width="10" fill="transparent" />
                <circle cx="60" cy="60" r="50" stroke="var(--color-accent-emerald)" stroke-width="10" fill="transparent"
                  stroke-dasharray="314.159" stroke-dashoffset="${314.159 - (314.159 * progressPercent / 100)}"
                  class="progress-ring-circle" stroke-linecap="round" />
              </svg>
              <div class="progress-ring-label">
                <span style="font-size: 1.4rem;">${progressPercent}%</span>
                <span style="font-size: 0.68rem; color: var(--color-text-muted); font-weight: 500;">COMPLETED</span>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; text-align: center;">
            <div style="background: var(--color-bg-base); padding: 8px; border-radius: var(--radius-md);">
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">Tasks</div>
              <div style="font-weight: 700; font-family: var(--font-mono); font-size: 1.1rem;">${completedTodayTasks}/${todayTasks.length}</div>
            </div>
            <div style="background: var(--color-bg-base); padding: 8px; border-radius: var(--radius-md);">
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">Study Time</div>
              <div style="font-weight: 700; font-family: var(--font-mono); font-size: 1.1rem;">${todayStudyHours}/${targetStudyHours}h</div>
            </div>
          </div>
        </div>

        <div style="border-top: 1px solid var(--color-border); padding-top: 12px; margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 6px;">
            <span style="color: var(--color-text-muted);">Daily Learning Streak:</span>
            <strong style="color: var(--color-accent-amber); font-family: var(--font-mono);">${streaks.dailyStreak} days 🔥</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 6px;">
            <span style="color: var(--color-text-muted);">DSA Streak:</span>
            <strong style="font-family: var(--font-mono);">${streaks.dsaStreak} days</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
            <span style="color: var(--color-text-muted);">Days Studied in ${info.monthName}:</span>
            <strong style="font-family: var(--font-mono);">${streaks.daysStudiedThisMonth} days</strong>
          </div>
        </div>
      </div>

      <!-- Quick Study Logger (6 cols) -->
      <div class="card col-6">
        <div class="card-header">
          <div class="card-title">
            ${getIcon('clock', 'text-cyan')}
            <span>Quick Study Session Log</span>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-quick-log-study">+ Log Hours</button>
        </div>
        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 12px;">
          Default Schedule: Mon-Fri (4h), Sat (4h), Sun (8h). Current target: Prime 3.0 (1.5h), DSA (1h), Indiv CS (1h), Revision/Project (0.5h).
        </p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${(state.studySessions || []).slice(0, 3).map(s => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--color-bg-base); border-radius: var(--radius-md); font-size: 0.85rem;">
              <div>
                <span class="badge ${getTrackBadgeClass(s.track)}">${s.track}</span>
                <span style="font-weight: 500; margin-left: 6px;">${s.topic}</span>
              </div>
              <span style="font-family: var(--font-mono); font-weight: 600;">${(s.durationMinutes / 60).toFixed(1)}h</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Active Revision Queue Spotlight (6 cols) -->
      <div class="card col-6">
        <div class="card-header">
          <div class="card-title">
            ${getIcon('revision', 'text-purple')}
            <span>Spaced Revision Spotlight</span>
          </div>
          <button class="btn btn-ghost btn-sm" id="btn-nav-revision">View All (${state.revisionItems?.length || 0})</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${(state.revisionItems || []).slice(0, 3).map(r => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--color-bg-base); border-radius: var(--radius-md); font-size: 0.85rem;">
              <div>
                <span class="badge badge-purple">${r.topic}</span>
                <span style="font-weight: 500; margin-left: 6px;">${r.title}</span>
              </div>
              <span class="badge ${r.status === 'Due today' ? 'badge-rose' : 'badge-amber'}">${r.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  document.getElementById('btn-quick-action').onclick = openQuickActionModal;
  document.getElementById('card-nav-prime').onclick = () => { window.location.hash = '#prime'; };
  document.getElementById('card-nav-roadmap').onclick = () => { window.location.hash = '#roadmap'; };
  document.getElementById('card-nav-dsa').onclick = () => { window.location.hash = '#dsa'; };
  document.getElementById('card-nav-projects').onclick = () => { window.location.hash = '#projects'; };
  document.getElementById('btn-jump-today').onclick = () => { window.location.hash = '#today'; };
  document.getElementById('btn-quick-log-study').onclick = openLogStudyModal;
  document.getElementById('btn-nav-revision').onclick = () => { window.location.hash = '#revision'; };
  document.getElementById('btn-add-today-task').onclick = () => openAddTaskModal(activeDate);

  const viewAllBtn = document.getElementById('btn-view-all-tasks');
  if (viewAllBtn) viewAllBtn.onclick = () => { window.location.hash = '#today'; };

  // Task Checkboxes
  container.querySelectorAll('.task-cb').forEach(cb => {
    cb.onchange = (e) => {
      const taskId = e.target.getAttribute('data-task-id');
      const isChecked = e.target.checked;
      updateState(curr => {
        const updated = (curr.dailyTasks || []).map(t => {
          if (t.id === taskId) {
            return { ...t, completed: isChecked, timeCompleted: isChecked ? new Date().toISOString() : null };
          }
          return t;
        });
        return { ...curr, dailyTasks: updated };
      });
    };
  });
}

export function getTrackBadgeClass(track) {
  if (track === 'Prime 3.0') return 'badge-cyan';
  if (track === 'Individual') return 'badge-emerald';
  if (track === 'DSA') return 'badge-amber';
  if (track === 'Project') return 'badge-purple';
  if (track === 'Revision') return 'badge-rose';
  return 'badge-slate';
}

/**
 * AI Study & Task Planner - MAIN DASHBOARD View
 * Generic, clean, answers immediately: "How am I progressing towards my goal?"
 */

import { getIcon } from '../components/icons.js';
import {
  getDashboardData,
  logFocusSession,
  toggleTaskCompletion,
  getCategoryMeta
} from '../services/trackerService.js';
import { formatFullDate, formatShortDate, getCanonicalToday } from '../services/dateService.js';

let clockIntervalId = null;

// Focus Timer State
const focusTimer = {
  running: false,
  startTime: null,
  accumulatedMs: 0,
  category: 'Learning',
  intervalId: null
};

export function cleanupDashboardView() {
  if (clockIntervalId) {
    clearInterval(clockIntervalId);
    clockIntervalId = null;
  }
  if (focusTimer.intervalId) {
    clearInterval(focusTimer.intervalId);
    focusTimer.intervalId = null;
  }
}

export function renderDashboard(container) {
  cleanupDashboardView();

  const data = getDashboardData();
  const canonicalToday = getCanonicalToday();

  // Helper for live time
  function getFormattedLiveTime() {
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

  // If NO active plan is configured, show onboarding card (Requirement 23)
  if (!data.hasActivePlan) {
    container.innerHTML = `
      <div class="tracker-page animate-fade-in" style="max-width: 820px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 24px; padding: 20px 0;">
        
        <!-- HEADER -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h1 style="font-size: 1.65rem; font-weight: 800; margin: 0; color: var(--color-text-main); display: flex; align-items: center; gap: 8px;">
              ${getIcon('dashboard', 'style="color: var(--color-primary); width: 26px; height: 26px;"')}
              <span>DASHBOARD</span>
            </h1>
            <div style="font-size: 0.88rem; color: var(--color-text-secondary); margin-top: 2px;">
              ${formatFullDate(canonicalToday)}
            </div>
          </div>

          <div id="dashboard-live-clock" style="font-family: var(--font-mono); font-size: 1.15rem; font-weight: 700; color: var(--color-text-main); background: var(--color-bg-surface); padding: 6px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
            ${getFormattedLiveTime()}
          </div>
        </div>

        <!-- NO ACTIVE PLAN ONBOARDING HERO CARD -->
        <div class="card animate-scale-up" style="padding: 48px 32px; border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-bg-surface); text-align: center; box-shadow: var(--shadow-md); margin-top: 10px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 20px; background: rgba(59, 130, 246, 0.12); color: var(--color-primary); margin-bottom: 20px;">
            ${getIcon('sparkles', 'style="width: 36px; height: 36px;"')}
          </div>
          
          <h2 style="font-size: 1.6rem; font-weight: 800; margin: 0; color: var(--color-text-main); letter-spacing: -0.02em;">
            No Active Plan Yet
          </h2>

          <p style="font-size: 1rem; color: var(--color-text-secondary); max-width: 520px; margin: 12px auto 28px; line-height: 1.6;">
            Welcome to your AI Study & Task Planner! Tell the AI what you want to achieve — whether it's learning a new programming language, preparing for exams, or building a portfolio project.
          </p>

          <div style="display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;">
            <button id="btn-create-first-plan" class="btn btn-primary" style="padding: 12px 28px; font-size: 1.05rem; font-weight: 800; gap: 8px;">
              ${getIcon('plus')} <span>Create a Plan</span>
            </button>
            <button id="btn-open-settings-direct" class="btn btn-secondary" style="padding: 12px 20px; font-weight: 700; gap: 6px;">
              ${getIcon('settings')} <span>Settings</span>
            </button>
          </div>

          <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid var(--color-border-subtle); display: flex; justify-content: center; gap: 32px; font-size: 0.84rem; color: var(--color-text-muted);">
            <div>✓ Realistic workloads</div>
            <div>✓ Full plan preview & editing</div>
            <div>✓ 100% offline tracker</div>
          </div>
        </div>

      </div>
    `;

    // Live clock tick
    clockIntervalId = setInterval(() => {
      const clockEl = document.getElementById('dashboard-live-clock');
      if (clockEl) clockEl.textContent = getFormattedLiveTime();
    }, 1000);

    const btnCreate = container.querySelector('#btn-create-first-plan');
    if (btnCreate) {
      btnCreate.onclick = () => {
        window.location.hash = '#create-plan';
      };
    }

    const btnSettings = container.querySelector('#btn-open-settings-direct');
    if (btnSettings) {
      btnSettings.onclick = () => {
        window.location.hash = '#settings';
      };
    }

    return;
  }

  // ==========================================
  // ACTIVE PLAN DASHBOARD
  // ==========================================
  const plan = data.activePlan;
  const goal = plan.goal || {};
  const today = data.today;
  const streak = data.streak;

  container.innerHTML = `
    <div class="tracker-page animate-fade-in" style="max-width: 980px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 24px;">
      
      <!-- TOP HEADER -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h1 style="font-size: 1.65rem; font-weight: 800; margin: 0; color: var(--color-text-main); display: flex; align-items: center; gap: 8px;">
              ${getIcon('dashboard', 'style="color: var(--color-primary); width: 26px; height: 26px;"')}
              <span>DASHBOARD</span>
            </h1>
          </div>
          <div style="font-size: 0.88rem; color: var(--color-text-secondary); margin-top: 2px;">
            ${today.formattedDate}
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <!-- Study Streak Pill -->
          <div style="display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 700; color: var(--color-accent-amber);">
            <span>🔥</span>
            <span>${streak.currentStreak} Day Streak</span>
          </div>

          <!-- Live Clock -->
          <div id="dashboard-live-clock" style="font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; color: var(--color-text-main); background: var(--color-bg-surface); padding: 6px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
            ${getFormattedLiveTime()}
          </div>
        </div>
      </div>

      <!-- ACTIVE GOAL & PROGRESS HERO CARD -->
      <div class="card" style="padding: 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
          <div>
            <div style="font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--color-primary); letter-spacing: 0.06em;">
              CURRENT GOAL
            </div>
            <h2 style="font-size: 1.45rem; font-weight: 800; margin: 2px 0 0 0; color: var(--color-text-main);">
              ${goal.title}
            </h2>
            <div style="font-size: 0.82rem; color: var(--color-text-secondary); margin-top: 2px;">
              ${formatShortDate(goal.startDate)} → ${formatShortDate(goal.targetDate)} (${goal.dailyHours || 2}h/day, ${goal.daysPerWeek || 6} days/wk)
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 1.6rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-primary);">
              ${data.overallPercentage}%
            </div>
            <div style="font-size: 0.74rem; color: var(--color-text-muted);">
              ${data.totalCompletedPlanTasks} of ${data.totalPlanTasks} tasks completed
            </div>
          </div>
        </div>

        <!-- PROGRESS BAR -->
        <div style="width: 100%; height: 10px; background: var(--color-bg-base); border-radius: 999px; overflow: hidden; border: 1px solid var(--color-border-subtle); margin-top: 8px;">
          <div style="width: ${data.overallPercentage}%; height: 100%; background: linear-gradient(90deg, var(--color-primary), #60A5FA); border-radius: 999px; transition: width 0.3s ease;"></div>
        </div>
      </div>

      <!-- TODAY AT A GLANCE & METRICS -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        
        <!-- TODAY PROGRESS CARD -->
        <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted);">Today's Progress</span>
              <a href="#today" style="font-size: 0.78rem; font-weight: 700; color: var(--color-primary); text-decoration: none;">View Today →</a>
            </div>

            <div style="display: flex; align-items: baseline; gap: 10px;">
              <span style="font-size: 2rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main);">
                ${today.completedTasksCount}
              </span>
              <span style="font-size: 0.95rem; color: var(--color-text-muted);">
                / ${today.totalTasksCount} tasks done
              </span>
              <span class="badge ${today.completionPercentage === 100 && today.totalTasksCount > 0 ? 'badge-emerald' : 'badge-blue'}" style="margin-left: auto;">
                ${today.completionPercentage}%
              </span>
            </div>

            <div style="font-size: 0.82rem; color: var(--color-text-secondary); margin-top: 8px;">
              Study logged: <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${today.studyHoursDisplay} hrs</strong>
            </div>
          </div>

          ${today.overdueTasks.length > 0 ? `
            <div style="margin-top: 14px; padding: 8px 12px; background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.2); border-radius: var(--radius-md); font-size: 0.78rem; color: var(--color-accent-rose); font-weight: 600;">
              ⚠️ ${today.overdueTasks.length} carried forward / unfinished tasks
            </div>
          ` : ''}
        </div>

        <!-- QUICK FOCUS TIMER CARD -->
        <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted);">Quick Focus Timer</span>
              <span id="focus-timer-display" style="font-family: var(--font-mono); font-size: 1.15rem; font-weight: 800; color: var(--color-primary);">
                25:00
              </span>
            </div>
            <div style="font-size: 0.8rem; color: var(--color-text-secondary);">
              Deep work sprint. Logs focused minutes directly to your study consistency.
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; margin-top: 16px;">
            <button id="btn-toggle-focus" class="btn btn-primary btn-sm" style="flex: 1; font-weight: 700;">
              Start 25m Focus
            </button>
            <button id="btn-reset-focus" class="btn btn-secondary btn-sm" style="font-weight: 600;">
              Reset
            </button>
          </div>
        </div>

      </div>

      <!-- TODAY'S TOP TASKS -->
      <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <h3 style="font-size: 1rem; font-weight: 800; margin: 0; color: var(--color-text-main); display: flex; align-items: center; gap: 6px;">
            ${getIcon('today', 'style="color: var(--color-primary); width: 18px; height: 18px;"')}
            <span>Today's Priority Tasks</span>
          </h3>
          <a href="#today" style="font-size: 0.78rem; font-weight: 700; color: var(--color-primary); text-decoration: none;">Open Daily Checklist →</a>
        </div>

        ${today.tasks.length === 0 ? `
          <div style="padding: 16px; text-align: center; color: var(--color-text-muted); font-size: 0.88rem; font-style: italic;">
            No tasks scheduled for today. Rest day or add a task!
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${today.tasks.slice(0, 4).map(t => {
              const meta = getCategoryMeta(t.category);
              return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); gap: 10px; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 200px;">
                    <input
                      type="checkbox"
                      class="task-dash-checkbox"
                      data-task-id="${t.id}"
                      ${t.completed ? 'checked' : ''}
                      style="width: 17px; height: 17px; accent-color: var(--color-primary); cursor: pointer;"
                    />
                    <span class="badge ${meta.badgeClass}" style="font-size: 0.68rem; padding: 2px 6px;">${meta.label}</span>
                    <span style="font-size: 0.88rem; font-weight: 600; color: var(--color-text-main); ${t.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                      ${t.title}
                    </span>
                  </div>

                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 0.74rem; font-family: var(--font-mono); color: var(--color-text-muted);">
                      ${t.durationMinutes} min
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- UPCOMING TASKS (NEXT 3–5 DAYS) -->
      ${data.upcomingTasks?.length > 0 ? `
        <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
          <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 12px;">
            Upcoming Ahead
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${data.upcomingTasks.map(t => {
              const meta = getCategoryMeta(t.category);
              return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); gap: 10px; font-size: 0.84rem;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-muted); font-weight: 700;">
                      ${formatShortDate(t.date)}
                    </span>
                    <span class="badge ${meta.badgeClass}" style="font-size: 0.65rem;">${meta.label}</span>
                    <span style="font-weight: 600; color: var(--color-text-main);">${t.title}</span>
                  </div>
                  <span style="font-size: 0.72rem; color: var(--color-text-muted); font-family: var(--font-mono);">${t.durationMinutes}m</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

    </div>
  `;

  // Start live clock
  clockIntervalId = setInterval(() => {
    const clockEl = document.getElementById('dashboard-live-clock');
    if (clockEl) clockEl.textContent = getFormattedLiveTime();
  }, 1000);

  // Attach Dashboard Checkbox Listeners
  container.querySelectorAll('.task-dash-checkbox').forEach(cb => {
    cb.onchange = async () => {
      const taskId = cb.getAttribute('data-task-id');
      try {
        await toggleTaskCompletion(taskId, cb.checked, { enforceToday: true });
      } catch (err) {
        console.warn(err.message);
        cb.checked = !cb.checked;
      }
      renderDashboard(container);
    };
  });

  // Attach Focus Timer
  const btnToggleFocus = container.querySelector('#btn-toggle-focus');
  const btnResetFocus = container.querySelector('#btn-reset-focus');
  const timerDisplay = container.querySelector('#focus-timer-display');

  let remainingSec = 25 * 60;
  let timerActive = false;
  let timerInterval = null;

  function updateDisplay() {
    const m = Math.floor(remainingSec / 60);
    const s = remainingSec % 60;
    if (timerDisplay) {
      timerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }

  if (btnToggleFocus) {
    btnToggleFocus.onclick = () => {
      if (!timerActive) {
        timerActive = true;
        btnToggleFocus.textContent = 'Pause Focus';
        timerInterval = setInterval(() => {
          remainingSec--;
          updateDisplay();
          if (remainingSec <= 0) {
            clearInterval(timerInterval);
            timerActive = false;
            btnToggleFocus.textContent = 'Completed (25m)';
            logFocusSession({ date: canonicalToday, durationMinutes: 25, category: 'Learning' });
            alert('🎉 Great focus sprint! 25 minutes logged.');
          }
        }, 1000);
      } else {
        clearInterval(timerInterval);
        timerActive = false;
        btnToggleFocus.textContent = 'Resume Focus';
      }
    };
  }

  if (btnResetFocus) {
    btnResetFocus.onclick = () => {
      if (timerInterval) clearInterval(timerInterval);
      timerActive = false;
      remainingSec = 25 * 60;
      updateDisplay();
      if (btnToggleFocus) btnToggleFocus.textContent = 'Start 25m Focus';
    };
  }
}

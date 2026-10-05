/**
 * AI Study & Task Planner - WEEK View
 * Strict middle layer: MONTH -> WEEK -> DAY
 * Dynamic 7-day Monday -> Sunday planning and execution.
 */

import { getIcon } from '../components/icons.js';
import {
  getWeekData,
  toggleTaskCompletion,
  getCategoryMeta,
  hasImplementedPlan
} from '../services/trackerService.js';
import {
  getCanonicalToday,
  shiftDate,
  formatShortDate
} from '../services/dateService.js';
import { setTodayViewingDate } from './todayView.js';

let viewingWeekTarget = null;

export function setWeeklyViewingWeek(weekTarget) {
  viewingWeekTarget = weekTarget;
}

export function renderWeekly(container) {
  if (!hasImplementedPlan()) {
    container.innerHTML = `
      <div class="tracker-page animate-fade-in" style="max-width: 620px; margin: 60px auto; text-align: center; padding: 0 16px;">
        <div class="card" style="padding: 44px 32px; border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-bg-surface); box-shadow: var(--shadow-sm);">
          <div style="font-size: 2.4rem; margin-bottom: 14px;">📊</div>
          <h2 style="font-size: 1.4rem; font-weight: 800; margin: 0 0 8px; color: var(--color-text-main);">No Implemented Plan</h2>
          <p style="font-size: 0.92rem; color: var(--color-text-secondary); margin: 0 auto 24px; max-width: 440px; line-height: 1.5;">
            The Weekly Target breakdown becomes available after you generate and implement a plan.
          </p>
          <a href="#create-plan" class="btn btn-primary" style="display: inline-flex; font-weight: 700; padding: 10px 22px; text-decoration: none; gap: 6px;">
            ${getIcon('sparkles')} <span>Create Your Plan</span>
          </a>
        </div>
      </div>
    `;
    return;
  }

  const hash = window.location.hash || '';
  let urlDate = null;
  if (hash.includes('?')) {
    const params = new URLSearchParams(hash.split('?')[1]);
    urlDate = params.get('date') || params.get('id');
  }

  const targetDateOrWeek = urlDate || viewingWeekTarget || getCanonicalToday();
  const data = getWeekData(targetDateOrWeek);
  const canonicalToday = getCanonicalToday();

  container.innerHTML = `
    <div class="tracker-page animate-fade-in" style="max-width: 1040px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 24px; padding-bottom: 60px;">
      
      <!-- 1. WEEK HEADER -->
      <header class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <!-- Breadcrumb Navigation: Month -> Week -->
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 4px;">
              <a href="#month?id=${data.parentMonthId}" style="color: var(--color-primary); text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                ${getIcon('monthly', 'style="width: 13px; height: 13px;"')} ${data.parentMonthTitle}
              </a>
              <span>›</span>
              <span style="color: var(--color-text-main); font-weight: 600;">Week ${data.weekNumber}</span>
            </div>

            <!-- Title & Range -->
            <div style="display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;">
              <h1 style="font-size: 1.7rem; font-weight: 800; margin: 0; color: var(--color-text-main); letter-spacing: -0.02em;">
                ${data.weekTitle}
              </h1>
              <span style="font-size: 1rem; font-weight: 600; color: var(--color-text-secondary); font-family: var(--font-mono);">
                ${data.rangeLabel}
              </span>
            </div>
            <div style="font-size: 0.85rem; color: var(--color-text-muted); margin-top: 4px;">
              ${data.weekObjective}
            </div>
          </div>

          <!-- Week Prev/Next Navigation Controls -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="btn-prev-week" class="btn btn-secondary btn-sm" title="Previous Week">
              ← Prev Week
            </button>
            <button id="btn-current-week" class="btn btn-ghost btn-sm" style="font-weight: 700;">
              This Week
            </button>
            <button id="btn-next-week" class="btn btn-secondary btn-sm" title="Next Week">
              Next Week →
            </button>
          </div>
        </div>

        <!-- WEEKLY TARGET METRICS SUMMARY -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--color-border-subtle);">
          <div style="background: var(--color-bg-base); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <span style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Tasks Completed</span>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 2px;">
              ${data.completedTasks} <span style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600;">/ ${data.totalTasks}</span>
            </div>
          </div>

          <div style="background: var(--color-bg-base); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <span style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Study Time</span>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-primary); margin-top: 2px;">
              ${data.actualHours} <span style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600;">/ ${data.targetHours} hrs</span>
            </div>
          </div>

          <div style="background: var(--color-bg-base); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <span style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Weekly Completion</span>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-accent-emerald); margin-top: 2px;">
              ${data.completionPercentage}%
            </div>
          </div>
        </div>
      </header>

      <!-- 2. MONDAY TO SUNDAY 7 COMPACT CARDS -->
      <div>
        <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 12px;">
          Daily Schedule (Click day to open checklist)
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
          ${data.days.map(d => {
            const isToday = d.date === canonicalToday;
            return `
              <div
                class="day-card-clickable card"
                data-date="${d.date}"
                style="padding: 12px; border-radius: var(--radius-md); cursor: pointer; border: 1px solid ${isToday ? 'var(--color-primary)' : 'var(--color-border)'}; background: ${isToday ? 'rgba(59, 130, 246, 0.05)' : 'var(--color-bg-surface)'}; transition: transform 0.15s ease;"
              >
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                  <span style="font-weight: 800; font-size: 0.82rem; color: ${isToday ? 'var(--color-primary)' : 'var(--color-text-main)'};">${d.dayName}</span>
                  <span style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--color-text-muted);">${d.dayNumber}</span>
                </div>

                <div style="font-size: 0.95rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 8px;">
                  ${d.completedCount} / ${d.totalCount}
                </div>
                <div style="font-size: 0.7rem; color: var(--color-text-muted);">tasks done</div>

                ${d.isCompleted && d.totalCount > 0 ? `
                  <div style="font-size: 0.7rem; font-weight: 700; color: var(--color-accent-emerald); margin-top: 6px;">✓ Completed</div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 3. WEEKLY TASKS BREAKDOWN BY DAY -->
      <div class="card" style="padding: 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
          <h2 style="font-size: 1.15rem; font-weight: 800; margin: 0; color: var(--color-text-main);">
            Weekly Task Breakdown
          </h2>
          <span style="font-size: 0.74rem; color: var(--color-text-muted); display: inline-flex; align-items: center; gap: 5px; background: var(--color-bg-base); padding: 4px 10px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
            <span>🔒</span> <span>Checkboxes active for Today only</span>
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${data.days.map(d => {
            if (d.tasks.length === 0) return '';
            const isDayToday = (d.date === canonicalToday);
            const isPastDay = (d.date < canonicalToday);
            return `
              <div style="background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); padding: 14px 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 800; font-size: 0.9rem; color: var(--color-text-main);">${d.dayName}</span>
                    <span style="font-size: 0.75rem; color: var(--color-text-muted); font-family: var(--font-mono);">(${d.displayDate})</span>
                    ${isDayToday ? '<span class="badge badge-emerald" style="font-size: 0.65rem; padding: 2px 6px;">TODAY</span>' : ''}
                  </div>
                  <a href="#today?date=${d.date}" style="font-size: 0.75rem; font-weight: 700; color: var(--color-primary); text-decoration: none;">View Day →</a>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${d.tasks.map(t => {
                    const meta = getCategoryMeta(t.category);
                    return `
                      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); gap: 10px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 200px;">
                          <input
                            type="checkbox"
                            class="task-week-checkbox"
                            data-task-id="${t.id}"
                            data-task-date="${d.date}"
                            ${t.completed ? 'checked' : ''}
                            ${!isDayToday ? 'disabled' : ''}
                            style="width: 17px; height: 17px; accent-color: var(--color-primary); cursor: ${isDayToday ? 'pointer' : 'not-allowed'}; ${!isDayToday ? 'opacity: 0.5;' : ''}"
                            title="${!isDayToday ? (isPastDay ? 'Previous day: Tasks can only be completed on Today' : 'Future day: Tasks can only be completed on Today') : 'Mark task complete'}"
                          />
                          <span class="badge ${meta.badgeClass}" style="font-size: 0.65rem;">${meta.label}</span>
                          <span style="font-size: 0.86rem; font-weight: 600; color: var(--color-text-main); ${t.completed ? 'text-decoration: line-through; opacity: 0.55;' : ''}">
                            ${t.title}
                          </span>
                        </div>

                        <span style="font-size: 0.74rem; font-family: var(--font-mono); color: var(--color-text-muted);">
                          ${t.durationMinutes} min
                        </span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>
  `;

  // Attach Day Card Click
  container.querySelectorAll('.day-card-clickable').forEach(card => {
    card.onclick = () => {
      const d = card.getAttribute('data-date');
      setTodayViewingDate(d);
      window.location.hash = `#today?date=${d}`;
    };
  });

  // Attach Week Navigation Controls
  const btnPrev = container.querySelector('#btn-prev-week');
  if (btnPrev) {
    btnPrev.onclick = () => {
      viewingWeekTarget = shiftDate(data.startDate, -7);
      renderWeekly(container);
    };
  }

  const btnNext = container.querySelector('#btn-next-week');
  if (btnNext) {
    btnNext.onclick = () => {
      viewingWeekTarget = shiftDate(data.startDate, 7);
      renderWeekly(container);
    };
  }

  const btnCurrent = container.querySelector('#btn-current-week');
  if (btnCurrent) {
    btnCurrent.onclick = () => {
      viewingWeekTarget = null;
      renderWeekly(container);
    };
  }

  // Checkbox toggle (enforce today only)
  container.querySelectorAll('.task-week-checkbox').forEach(cb => {
    cb.onchange = async () => {
      const taskDate = cb.getAttribute('data-task-date');
      if (taskDate && taskDate !== canonicalToday) {
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
      renderWeekly(container);
    };
  });
}

/**
 * AI Study & Task Planner - MONTH View
 * High-level roadmap tracking and monthly targets.
 * Dynamic month navigation and week summaries.
 */

import { getIcon } from '../components/icons.js';
import {
  getMonthData,
  getActivePlan,
  hasImplementedPlan
} from '../services/trackerService.js';
import { getCanonicalToday, formatShortDate } from '../services/dateService.js';

let viewingMonthId = null;

export function setMonthlyViewingMonth(mId) {
  viewingMonthId = mId;
}

export function renderMonthly(container) {
  if (!hasImplementedPlan()) {
    container.innerHTML = `
      <div class="tracker-page animate-fade-in" style="max-width: 620px; margin: 60px auto; text-align: center; padding: 0 16px;">
        <div class="card" style="padding: 44px 32px; border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-bg-surface); box-shadow: var(--shadow-sm);">
          <div style="font-size: 2.4rem; margin-bottom: 14px;">📅</div>
          <h2 style="font-size: 1.4rem; font-weight: 800; margin: 0 0 8px; color: var(--color-text-main);">No Implemented Plan</h2>
          <p style="font-size: 0.92rem; color: var(--color-text-secondary); margin: 0 auto 24px; max-width: 440px; line-height: 1.5;">
            The Monthly Roadmap view becomes available after you generate and implement a plan.
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
  let urlMonthId = null;
  if (hash.includes('?')) {
    const params = new URLSearchParams(hash.split('?')[1]);
    urlMonthId = params.get('id') || params.get('month');
  }

  const activePlan = getActivePlan();
  const canonicalToday = getCanonicalToday();
  const defaultMonthId = activePlan?.months?.[0]?.monthId || canonicalToday.substring(0, 7);

  const monthIdToUse = urlMonthId || viewingMonthId || defaultMonthId;
  viewingMonthId = monthIdToUse;

  const data = getMonthData(monthIdToUse);

  container.innerHTML = `
    <div class="tracker-page animate-fade-in" style="max-width: 1040px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 24px; padding-bottom: 60px;">
      
      <!-- 1. MONTH HEADER -->
      <header class="card" style="padding: 22px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <h1 style="font-size: 1.65rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px; color: var(--color-text-main);">
                ${getIcon('monthly', 'style="color: var(--color-primary); width: 24px; height: 24px;"')}
                <span>${data.monthTitle}</span>
              </h1>
              <span class="badge badge-blue" style="font-size: 0.78rem; font-weight: 700; padding: 4px 10px;">
                ${data.theme}
              </span>
            </div>
            <p style="font-size: 0.86rem; color: var(--color-text-secondary); margin: 6px 0 0 0; line-height: 1.4;">
              <strong style="color: var(--color-text-muted);">Objective:</strong> ${data.academicTarget}
            </p>
          </div>

          <!-- Month Navigation Controls -->
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <button id="btn-prev-month" class="btn btn-secondary btn-sm" title="Previous Month">
              ← Prev Month
            </button>

            <select id="month-selector" class="form-select" style="padding: 6px 12px; font-weight: 700; font-size: 0.86rem;">
              ${data.allMonths.map(m => `
                <option value="${m.id}" ${m.id === data.monthId ? 'selected' : ''}>
                  ${m.label}
                </option>
              `).join('')}
            </select>

            <button id="btn-next-month" class="btn btn-secondary btn-sm" title="Next Month">
              Next Month →
            </button>
          </div>
        </div>

        <!-- MONTHLY TARGETS & PROGRESS SUMMARY -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--color-border-subtle);">
          <div style="background: var(--color-bg-base); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <span style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Tasks Completed</span>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 2px;">
              ${data.targets.completedTasks} <span style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600;">/ ${data.targets.totalTasks}</span>
            </div>
          </div>

          <div style="background: var(--color-bg-base); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <span style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Study Hours</span>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-primary); margin-top: 2px;">
              ${data.targets.actualHours} <span style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600;">/ ${data.targets.targetHours} hrs</span>
            </div>
          </div>

          <div style="background: var(--color-bg-base); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <span style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Monthly Completion</span>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-accent-emerald); margin-top: 2px;">
              ${data.targets.completionPercentage}%
            </div>
          </div>
        </div>
      </header>

      <!-- 2. MONTHLY MILESTONES (If any in this month) -->
      ${data.milestones?.length > 0 ? `
        <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
          <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 12px;">
            Milestones This Month
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${data.milestones.map(m => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--color-bg-base); border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
                <div>
                  <span style="font-weight: 700; font-size: 0.9rem; color: var(--color-text-main);">${m.title}</span>
                  ${m.description ? `<div style="font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 2px;">${m.description}</div>` : ''}
                </div>
                <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-primary); font-weight: 700;">
                  ${formatShortDate(m.targetDate)}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 3. WEEKS IN THIS MONTH -->
      <div class="card" style="padding: 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-sm);">
        <h2 style="font-size: 1.15rem; font-weight: 800; margin: 0 0 16px 0; color: var(--color-text-main);">
          Weeks in ${data.monthTitle}
        </h2>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${data.weeks.map(w => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); gap: 14px; flex-wrap: wrap;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 1rem; font-weight: 800; color: var(--color-text-main);">Week ${w.weekNumber}</span>
                  <span style="font-size: 0.78rem; color: var(--color-text-muted); font-family: var(--font-mono);">${w.rangeLabel}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 3px;">
                  ${w.completedTasks} of ${w.totalTasks} tasks completed (${w.percentage}%)
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 100px; height: 6px; background: var(--color-bg-surface); border-radius: 999px; overflow: hidden; border: 1px solid var(--color-border-subtle);">
                  <div style="width: ${w.percentage}%; height: 100%; background: var(--color-primary); border-radius: 999px;"></div>
                </div>

                <a href="#week?id=${w.startDate}" class="btn btn-secondary btn-sm" style="font-weight: 700; text-decoration: none;">
                  View Week →
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;

  // Month navigation buttons
  const btnPrev = container.querySelector('#btn-prev-month');
  if (btnPrev) {
    btnPrev.onclick = () => {
      viewingMonthId = data.prevMonthId;
      renderMonthly(container);
    };
  }

  const btnNext = container.querySelector('#btn-next-month');
  if (btnNext) {
    btnNext.onclick = () => {
      viewingMonthId = data.nextMonthId;
      renderMonthly(container);
    };
  }

  const monthSelector = container.querySelector('#month-selector');
  if (monthSelector) {
    monthSelector.onchange = () => {
      viewingMonthId = monthSelector.value;
      renderMonthly(container);
    };
  }
}

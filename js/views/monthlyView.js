/**
 * Akshay's 12-Month AI/ML Career OS - Monthly Dashboard View
 */
import { getState, updateState } from '../data/storage.js';
import { calculateComprehensiveAnalytics } from '../services/analyticsService.js';
import { getMonthAndWeekInfo } from '../services/taskGenerator.js';
import { getIcon } from '../components/icons.js';

export function renderMonthly(container) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const info = getMonthAndWeekInfo(activeDate);
  const analytics = calculateComprehensiveAnalytics(state);
  const activeMonth = info.roadmapMonth;

  // Study hours logged this month
  let monthStudyMinutes = 0;
  (state.studySessions || []).forEach(s => {
    if (s.date && s.date.startsWith(info.monthKey)) {
      monthStudyMinutes += (s.durationMinutes || 0);
    }
  });
  const monthStudyHours = (monthStudyMinutes / 60).toFixed(1);

  // Month topic completion %
  const currentMonthRecord = (state.roadmapMonths || []).find(m => m.monthKey === info.monthKey) || activeMonth;
  const totalTopics = (activeMonth.topics || []).length;
  const completedTopics = (currentMonthRecord.completedTopics || []).length;
  const monthlyCompletionPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // DSA problems solved this month
  const dsaSolvedThisMonth = (state.dsaProblems || []).filter(p => p.date && p.date.startsWith(info.monthKey) && p.status === 'Solved').length;

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('monthly', 'text-emerald')} Monthly Dashboard: ${activeMonth.name}</h1>
        <div class="view-subtitle">
          Primary Focus: ${activeMonth.title} · ${activeMonth.theme}
        </div>
      </div>
      <div class="view-actions">
        <span class="badge ${monthlyCompletionPct >= 75 ? 'badge-emerald' : (monthlyCompletionPct > 20 ? 'badge-cyan' : 'badge-slate')}">
          ${monthlyCompletionPct >= 75 ? 'On Track' : (monthlyCompletionPct > 0 ? 'In Progress' : 'Not Started')}
        </span>
      </div>
    </div>

    <!-- Monthly High-Level Stats -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-lg);">
      <div class="stat-card">
        <div class="stat-header">MONTHLY COMPLETION</div>
        <div class="stat-value text-emerald">${monthlyCompletionPct}%</div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill emerald" style="width: ${monthlyCompletionPct}%;"></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">STUDY HOURS LOGGED</div>
        <div class="stat-value text-cyan">${monthStudyHours}h</div>
        <div class="stat-subtext">Target: ${activeMonth.targetHours}h</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">PRIME 3.0 PROGRESS</div>
        <div class="stat-value text-primary">${analytics.prime.percentage}%</div>
        <div class="stat-subtext">${analytics.prime.mastered + analytics.prime.applied} lessons mastered</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">DSA PROBLEMS</div>
        <div class="stat-value text-amber">${dsaSolvedThisMonth}</div>
        <div class="stat-subtext">Target: ${activeMonth.targetProblems || '35+'} problems</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">DAYS STUDIED</div>
        <div class="stat-value text-purple">${analytics.streaks.daysStudiedThisMonth}</div>
        <div class="stat-subtext">Consistency rate: ${analytics.habitConsistencyRate}%</div>
      </div>
    </div>

    <!-- Visual Topic Breakdown Progress Bars (as requested in Section 13) -->
    <div class="card" style="margin-bottom: var(--space-lg);">
      <div class="card-header">
        <div class="card-title">Curriculum Progress Breakdown: ${activeMonth.name}</div>
        <span class="badge badge-slate">Real Item Calculations</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Core Monthly Subject Bar -->
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px;">
            <span>${activeMonth.title} (Foundations)</span>
            <span class="font-mono text-emerald">${monthlyCompletionPct}%</span>
          </div>
          <div class="progress-bar-wrap" style="height: 12px;">
            <div class="progress-bar-fill emerald" style="width: ${monthlyCompletionPct}%;"></div>
          </div>
        </div>

        <!-- DSA Bar -->
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px;">
            <span>DSA Pattern Progress</span>
            <span class="font-mono text-amber">${Math.min(100, Math.round((dsaSolvedThisMonth / (activeMonth.targetProblems || 35)) * 100))}%</span>
          </div>
          <div class="progress-bar-wrap" style="height: 12px;">
            <div class="progress-bar-fill amber" style="width: ${Math.min(100, Math.round((dsaSolvedThisMonth / (activeMonth.targetProblems || 35)) * 100))}%;"></div>
          </div>
        </div>

        <!-- Prime 3.0 Bar -->
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 600; margin-bottom: 6px;">
            <span>Prime 3.0 AI/ML Track Alignment</span>
            <span class="font-mono text-cyan">${analytics.prime.percentage}%</span>
          </div>
          <div class="progress-bar-wrap" style="height: 12px;">
            <div class="progress-bar-fill" style="width: ${analytics.prime.percentage}%;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Month Syllabus Checklist -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <span>Active Topics for ${activeMonth.name} (${completedTopics}/${totalTopics})</span>
        </div>
        <span style="font-size: 0.75rem; color: var(--color-text-muted);">
          Check off topics as you implement and master them
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 10px;">
        ${(activeMonth.topics || []).map(t => {
          const isDone = (currentMonthRecord.completedTopics || []).includes(t.id);
          return `
            <div style="padding: 10px 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; align-items: flex-start; gap: 10px;">
              <input type="checkbox" class="custom-checkbox month-topic-cb"
                data-month-key="${info.monthKey}" data-topic-id="${t.id}" ${isDone ? 'checked' : ''} style="margin-top: 3px;" />
              <div>
                <div style="font-weight: 600; font-size: 0.88rem; ${isDone ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">
                  ${t.title}
                </div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                  ${t.detail}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Handlers
  container.querySelectorAll('.month-topic-cb').forEach(cb => {
    cb.onchange = (e) => {
      const monthKey = e.target.getAttribute('data-month-key');
      const topicId = e.target.getAttribute('data-topic-id');
      const isChecked = e.target.checked;

      updateState(curr => {
        const updatedMonths = (curr.roadmapMonths || []).map(m => {
          if (m.monthKey === monthKey) {
            let completed = [...(m.completedTopics || [])];
            if (isChecked && !completed.includes(topicId)) {
              completed.push(topicId);
            } else if (!isChecked) {
              completed = completed.filter(id => id !== topicId);
            }
            const pct = Math.round((completed.length / (m.topics || []).length) * 100);
            const status = pct === 100 ? 'Completed' : (pct > 0 ? 'On Track' : m.status);
            return { ...m, completedTopics: completed, completionPercentage: pct, status };
          }
          return m;
        });
        return { ...curr, roadmapMonths: updatedMonths };
      });
    };
  });
}

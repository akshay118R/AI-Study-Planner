/**
 * Akshay's 12-Month AI/ML Career OS - 12-Month Roadmap View
 */
import { getState, updateState } from '../data/storage.js';
import { getIcon } from '../components/icons.js';

export function renderRoadmap(container) {
  const state = getState();
  const months = state.roadmapMonths || [];
  const activeDate = state.user?.activeDate || '2026-10-01';
  const currentMonthKey = activeDate.substring(0, 7);

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('roadmap', 'text-emerald')} 12-Month Individual Career Roadmap</h1>
        <div class="view-subtitle">
          October 1, 2026 → September 30, 2027 · Systems, DSA, Core CS, Math & Placement Readiness
        </div>
      </div>
      <div class="view-actions">
        <span class="badge badge-emerald">Track B: Independent from Prime 3.0</span>
      </div>
    </div>

    <!-- Timeline Grid -->
    <div class="roadmap-timeline-grid">
      ${months.map(m => {
        const isCurrent = m.monthKey === currentMonthKey;
        const totalTopics = (m.topics || []).length;
        const completedCount = (m.completedTopics || []).length;
        const pct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

        let statusClass = 'badge-slate';
        if (m.status === 'Completed') statusClass = 'badge-emerald';
        else if (m.status === 'On Track') statusClass = 'badge-cyan';
        else if (m.status === 'Needs Attention') statusClass = 'badge-amber';
        else if (isCurrent) statusClass = 'badge-primary';

        return `
          <div class="roadmap-month-card ${isCurrent ? 'current' : ''}" data-month-key="${m.monthKey}">
            <div style="display: flex; align-items: flex-start; justify-content: space-between;">
              <div>
                <span style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--color-text-muted); text-transform: uppercase;">
                  Month ${m.monthIndex + 1}
                </span>
                <h3 style="font-size: 1.15rem; margin-top: 2px;">${m.name}</h3>
              </div>
              <span class="badge ${statusClass}">${isCurrent ? 'Current Focus' : m.status}</span>
            </div>

            <div style="font-size: 0.88rem; font-weight: 600; color: var(--color-text-secondary); margin-top: 4px;">
              ${m.title}
            </div>

            <p style="font-size: 0.78rem; color: var(--color-text-muted);">
              ${m.theme}
            </p>

            <!-- Progress Bar -->
            <div style="margin: 8px 0;">
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-family: var(--font-mono); margin-bottom: 4px;">
                <span>${completedCount}/${totalTopics} topics</span>
                <span>${pct}%</span>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill emerald" style="width: ${pct}%;"></div>
              </div>
            </div>

            <!-- Topic Pills List -->
            <div class="roadmap-month-topics">
              ${(m.topics || []).map(t => {
                const isTopicDone = (m.completedTopics || []).includes(t.id);
                return `
                  <div class="topic-pill-row" style="background: ${isTopicDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--color-bg-base)'};">
                    <label style="display: flex; align-items: center; gap: 8px; width: 100%; cursor: pointer;">
                      <input type="checkbox" class="custom-checkbox roadmap-topic-cb"
                        data-month-key="${m.monthKey}" data-topic-id="${t.id}" ${isTopicDone ? 'checked' : ''} />
                      <span style="font-size: 0.78rem; ${isTopicDone ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">
                        ${t.title}
                      </span>
                    </label>
                  </div>
                `;
              }).join('')}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--color-text-muted); margin-top: 8px; border-top: 1px solid var(--color-border-subtle); padding-top: 8px;">
              <span>Target: ${m.targetHours}h study</span>
              ${m.targetProblems ? `<span>Target: ${m.targetProblems} DSA</span>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Topic Checkboxes
  container.querySelectorAll('.roadmap-topic-cb').forEach(cb => {
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
            const status = pct === 100 ? 'Completed' : (pct > 0 ? (m.status === 'Upcoming' ? 'On Track' : m.status) : m.status);
            return { ...m, completedTopics: completed, completionPercentage: pct, status };
          }
          return m;
        });
        return { ...curr, roadmapMonths: updatedMonths };
      });
    };
  });
}

/**
 * Akshay's 12-Month AI/ML Career OS - Goals View
 */
import { getState, updateState } from '../data/storage.js';
import { getIcon } from '../components/icons.js';
import { initModalContainer, closeModal } from '../components/modals.js';

let selectedGoalFilter = 'All';

export function renderGoals(container) {
  const state = getState();
  const goals = state.goals || [];

  const filtered = selectedGoalFilter === 'All'
    ? goals
    : goals.filter(g => g.type === selectedGoalFilter);

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('goals', 'text-amber')} Strategic Goals Center</h1>
        <div class="view-subtitle">
          Hierarchy: Yearly → Quarterly → Monthly → Weekly → Daily (All Connected to Curriculum)
        </div>
      </div>
      <div class="view-actions">
        <button class="btn btn-primary" id="btn-add-goal">${getIcon('plus')} New Goal</button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="tabs-nav">
      <button class="tab-btn ${selectedGoalFilter === 'All' ? 'active' : ''}" data-type="All">All (${goals.length})</button>
      <button class="tab-btn ${selectedGoalFilter === 'Yearly' ? 'active' : ''}" data-type="Yearly">Yearly</button>
      <button class="tab-btn ${selectedGoalFilter === 'Quarterly' ? 'active' : ''}" data-type="Quarterly">Quarterly</button>
      <button class="tab-btn ${selectedGoalFilter === 'Monthly' ? 'active' : ''}" data-type="Monthly">Monthly</button>
      <button class="tab-btn ${selectedGoalFilter === 'Weekly' ? 'active' : ''}" data-type="Weekly">Weekly</button>
      <button class="tab-btn ${selectedGoalFilter === 'Daily' ? 'active' : ''}" data-type="Daily">Daily</button>
    </div>

    <!-- Goals Grid -->
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      ${filtered.length === 0 ? `
        <div class="card" style="text-align: center; padding: var(--space-2xl); color: var(--color-text-muted);">
          No goals in this category. Click "New Goal" to add one!
        </div>
      ` : filtered.map(g => {
        let typeBadge = 'badge-slate';
        if (g.type === 'Yearly') typeBadge = 'badge-purple';
        else if (g.type === 'Quarterly') typeBadge = 'badge-primary';
        else if (g.type === 'Monthly') typeBadge = 'badge-cyan';
        else if (g.type === 'Weekly') typeBadge = 'badge-amber';
        else if (g.type === 'Daily') typeBadge = 'badge-emerald';

        return `
          <div class="card" style="display: flex; flex-direction: column; gap: 8px; ${g.completed ? 'opacity: 0.7; background: rgba(14, 21, 38, 0.4);' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
              <div style="display: flex; align-items: flex-start; gap: 10px;">
                <input type="checkbox" class="custom-checkbox goal-cb" data-id="${g.id}" ${g.completed ? 'checked' : ''} style="margin-top: 4px;" />
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge ${typeBadge}">${g.type}</span>
                    <h3 style="font-size: 1.05rem; ${g.completed ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">${g.title}</h3>
                  </div>
                  <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 4px; line-height: 1.5;">
                    ${g.description || ''}
                  </p>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="btn btn-ghost btn-icon btn-delete-goal" data-id="${g.id}" title="Delete goal">${ICONS.trash}</button>
              </div>
            </div>

            <!-- Roadmap Connection & Target Date -->
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--color-text-muted); border-top: 1px solid var(--color-border-subtle); padding-top: 8px; margin-top: 4px;">
              <span>Roadmap Alignment: <strong style="color: var(--color-text-main);">${g.connectedRoadmapMonth || 'General'}</strong></span>
              <span class="font-mono">Target Date: ${g.targetDate || 'TBD'}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Handlers
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      selectedGoalFilter = btn.getAttribute('data-type');
      renderGoals(container);
    };
  });

  // Goal completion checkbox
  container.querySelectorAll('.goal-cb').forEach(cb => {
    cb.onchange = (e) => {
      const id = e.target.getAttribute('data-id');
      const isChecked = e.target.checked;
      updateState(curr => {
        const updated = (curr.goals || []).map(g => g.id === id ? { ...g, completed: isChecked, progress: isChecked ? 100 : g.progress } : g);
        return { ...curr, goals: updated };
      });
      renderGoals(container);
    };
  });

  // Delete goal
  container.querySelectorAll('.btn-delete-goal').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this goal?')) {
        updateState(curr => ({
          ...curr,
          goals: (curr.goals || []).filter(g => g.id !== id)
        }));
        renderGoals(container);
      }
    };
  });

  // Add Goal Modal
  document.getElementById('btn-add-goal').onclick = () => {
    initModalContainer();
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">New Strategic Goal</h3>
            <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
          </div>
          <form id="add-goal-form">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Goal Title</label>
                <input type="text" class="form-input" id="goal-title-input" placeholder="e.g. Master C Memory Concepts & Pointers" required />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">Goal Type</label>
                  <select class="form-select" id="goal-type-input">
                    <option value="Daily">Daily</option>
                    <option value="Weekly" selected>Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Target Date</label>
                  <input type="date" class="form-input" id="goal-date-input" value="${state.user?.activeDate || '2026-10-01'}" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Connected Roadmap Month / Track</label>
                <input type="text" class="form-input" id="goal-roadmap-input" placeholder="e.g. October 2026 (Programming Foundations) or Prime 3.0" />
              </div>

              <div class="form-group">
                <label class="form-label">Description & Success Metric</label>
                <textarea class="form-textarea" id="goal-desc-input" rows="3" placeholder="What does 100% completion look like?"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Goal</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('btn-close-modal').onclick = closeModal;
    document.getElementById('btn-cancel-modal').onclick = closeModal;
    document.getElementById('modal-backdrop').onclick = (e) => {
      if (e.target.id === 'modal-backdrop') closeModal();
    };

    document.getElementById('add-goal-form').onsubmit = (e) => {
      e.preventDefault();
      const title = document.getElementById('goal-title-input').value.trim();
      const type = document.getElementById('goal-type-input').value;
      const targetDate = document.getElementById('goal-date-input').value;
      const connectedRoadmapMonth = document.getElementById('goal-roadmap-input').value.trim() || 'General';
      const description = document.getElementById('goal-desc-input').value.trim();

      updateState(curr => {
        const newGoal = {
          id: `goal-${Date.now()}`,
          title,
          type,
          targetDate,
          connectedRoadmapMonth,
          description,
          completed: false,
          progress: 0
        };
        return {
          ...curr,
          goals: [newGoal, ...(curr.goals || [])]
        };
      });

      closeModal();
      renderGoals(container);
    };
  };
}

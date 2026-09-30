/**
 * Akshay's 12-Month AI/ML Career OS - Resource Tracker View
 */
import { getState, updateState } from '../data/storage.js';
import { getIcon } from '../components/icons.js';
import { initModalContainer, closeModal } from '../components/modals.js';

const RESOURCE_CATEGORIES = [
  'Course',
  'YouTube',
  'Documentation',
  'Article',
  'Book',
  'GitHub repository',
  'Problem',
  'Dataset'
];

let selectedCategory = 'All';

export function renderResources(container) {
  const state = getState();
  const resources = state.resources || [];

  const filtered = selectedCategory === 'All'
    ? resources
    : resources.filter(r => r.category === selectedCategory);

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('resources', 'text-cyan')} Curated Resource Library</h1>
        <div class="view-subtitle">
          Textbooks, Official Docs, Problem Sets & High-Signal Engineering Repositories
        </div>
      </div>
      <div class="view-actions">
        <button class="btn btn-primary" id="btn-add-resource">${getIcon('plus')} Add Resource</button>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="tabs-nav">
      <button class="tab-btn ${selectedCategory === 'All' ? 'active' : ''}" data-cat="All">All (${resources.length})</button>
      ${RESOURCE_CATEGORIES.map(c => `
        <button class="tab-btn ${selectedCategory === c ? 'active' : ''}" data-cat="${c}">${c}</button>
      `).join('')}
    </div>

    <!-- Resource Cards Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-md);">
      ${filtered.length === 0 ? `
        <div class="card" style="grid-column: 1 / -1; text-align: center; padding: var(--space-2xl); color: var(--color-text-muted);">
          No resources found in this category. Click "Add Resource" to catalog an essential link!
        </div>
      ` : filtered.map(r => `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 10px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
              <span class="badge badge-cyan">${r.category}</span>
              <span class="badge badge-slate">${r.status || 'Active'}</span>
            </div>

            <h3 style="font-size: 1.05rem; margin-bottom: 4px;">
              ${r.url ? `
                <a href="${r.url}" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 4px;">
                  ${r.name} ${getIcon('externalLink')}
                </a>
              ` : r.name}
            </h3>

            <div style="font-size: 0.78rem; color: var(--color-primary); font-family: var(--font-mono); margin-bottom: 8px;">
              Topic: ${r.topic}
            </div>

            <p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.5;">
              ${r.notes || 'No notes.'}
            </p>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border-subtle); padding-top: 8px; margin-top: 4px;">
            <span style="font-size: 0.72rem; color: var(--color-text-muted); font-family: var(--font-mono); overflow: hidden; text-overflow: ellipsis; max-width: 220px; white-space: nowrap;">
              ${r.url || 'No URL'}
            </span>
            <button class="btn btn-ghost btn-icon btn-delete-resource" data-id="${r.id}">${ICONS.trash}</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Handlers
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      selectedCategory = btn.getAttribute('data-cat');
      renderResources(container);
    };
  });

  container.querySelectorAll('.btn-delete-resource').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this resource?')) {
        updateState(curr => ({
          ...curr,
          resources: (curr.resources || []).filter(r => r.id !== id)
        }));
        renderResources(container);
      }
    };
  });

  // Add Resource Modal
  document.getElementById('btn-add-resource').onclick = () => {
    initModalContainer();
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Add Curated Resource</h3>
            <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
          </div>
          <form id="add-resource-form">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Resource Name</label>
                <input type="text" class="form-input" id="res-name-input" placeholder="e.g. CS50 C Reference or PyTorch Documentation" required />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <select class="form-select" id="res-cat-input">
                    ${RESOURCE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select class="form-select" id="res-status-input">
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Reference">Reference</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">URL</label>
                <input type="url" class="form-input" id="res-url-input" placeholder="https://..." />
              </div>

              <div class="form-group">
                <label class="form-label">Topic / Roadmap Alignment</label>
                <input type="text" class="form-input" id="res-topic-input" placeholder="e.g. Java Fundamentals or Prime 3.0 ML" required />
              </div>

              <div class="form-group">
                <label class="form-label">Why is this resource valuable?</label>
                <textarea class="form-textarea" id="res-notes-input" rows="2" placeholder="Key chapters, syntax guides, high-signal tips..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Resource</button>
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

    document.getElementById('add-resource-form').onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('res-name-input').value.trim();
      const category = document.getElementById('res-cat-input').value;
      const status = document.getElementById('res-status-input').value;
      const url = document.getElementById('res-url-input').value.trim();
      const topic = document.getElementById('res-topic-input').value.trim();
      const notes = document.getElementById('res-notes-input').value.trim();

      updateState(curr => {
        const newRes = {
          id: `res-${Date.now()}`,
          name,
          category,
          status,
          url,
          topic,
          notes
        };
        return {
          ...curr,
          resources: [newRes, ...(curr.resources || [])]
        };
      });

      closeModal();
      renderResources(container);
    };
  };
}

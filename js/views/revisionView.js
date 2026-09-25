/**
 * Akshay's 12-Month AI/ML Career OS - Revision System View
 */
import { getState, updateState } from '../data/storage.js';
import { getIcon } from '../components/icons.js';
import { initModalContainer, closeModal } from '../components/modals.js';

let activeRevisionTab = 'Due today';

export function renderRevision(container) {
  const state = getState();
  const allItems = state.revisionItems || [];
  const activeDate = state.user?.activeDate || '2026-10-01';

  // Filter items into tabs
  const filtered = allItems.filter(item => {
    if (activeRevisionTab === 'Completed') return item.status === 'Completed';
    if (activeRevisionTab === 'Due today') return item.status === 'Due today';
    if (activeRevisionTab === 'Due this week') return item.status === 'Due this week';
    if (activeRevisionTab === 'Overdue') return item.status === 'Overdue';
    return true;
  });

  const dueTodayCount = allItems.filter(i => i.status === 'Due today').length;
  const dueWeekCount = allItems.filter(i => i.status === 'Due this week').length;
  const overdueCount = allItems.filter(i => i.status === 'Overdue').length;
  const completedCount = allItems.filter(i => i.status === 'Completed').length;

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('revision', 'text-rose')} Spaced Revision Engine</h1>
        <div class="view-subtitle">
          Automated Queue for Tricky Concepts, Algorithmic Edge Cases & Prime 3.0 Gaps
        </div>
      </div>
      <div class="view-actions">
        <button class="btn btn-primary" id="btn-add-revision-item">${getIcon('plus')} Add Revision Topic</button>
      </div>
    </div>

    <!-- Explanation Box -->
    <div class="card" style="background: rgba(139, 92, 246, 0.08); border-color: rgba(139, 92, 246, 0.3); margin-bottom: var(--space-lg); padding: var(--space-md);">
      <div style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.6;">
        💡 <strong>How the Automated Revision Queue Works:</strong> Anytime you log a DSA mistake or rate a Prime 3.0 lesson with low understanding, it is automatically routed here. Use the action buttons to mark as <strong>Revised</strong>, <strong>Still Difficult</strong> (schedules immediate re-test), or <strong>Understood</strong> (graduates to spaced retention).
      </div>
    </div>

    <!-- Tabs Nav -->
    <div class="tabs-nav">
      <button class="tab-btn ${activeRevisionTab === 'Due today' ? 'active' : ''}" data-tab="Due today">
        Due Today <span class="badge ${dueTodayCount > 0 ? 'badge-rose' : 'badge-slate'}">${dueTodayCount}</span>
      </button>
      <button class="tab-btn ${activeRevisionTab === 'Due this week' ? 'active' : ''}" data-tab="Due this week">
        Due This Week <span class="badge badge-slate">${dueWeekCount}</span>
      </button>
      <button class="tab-btn ${activeRevisionTab === 'Overdue' ? 'active' : ''}" data-tab="Overdue">
        Overdue <span class="badge ${overdueCount > 0 ? 'badge-amber' : 'badge-slate'}">${overdueCount}</span>
      </button>
      <button class="tab-btn ${activeRevisionTab === 'Completed' ? 'active' : ''}" data-tab="Completed">
        Mastered / Completed <span class="badge badge-emerald">${completedCount}</span>
      </button>
    </div>

    <!-- Revision Items List -->
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      ${filtered.length === 0 ? `
        <div class="card" style="text-align: center; padding: var(--space-2xl); color: var(--color-text-muted);">
          No revision items currently in "${activeRevisionTab}". Clean board!
        </div>
      ` : filtered.map(item => `
        <div class="card" style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 style="font-size: 1.05rem;">${item.title}</h3>
                <span class="badge badge-slate">${item.type}</span>
                <span class="badge ${item.difficultyRating === 'Hard' ? 'badge-rose' : (item.difficultyRating === 'Medium' ? 'badge-amber' : 'badge-emerald')}">
                  ${item.difficultyRating}
                </span>
              </div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted); font-family: var(--font-mono); margin-top: 2px;">
                Source: ${item.source} · Topic: ${item.topic} · Added: ${item.dateAdded}
              </div>
            </div>

            <!-- Action Buttons: Revised, Still Difficult, Understood -->
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm btn-action-revised" data-id="${item.id}">
                ${getIcon('check')} Revised
              </button>
              <button class="btn btn-danger btn-sm btn-action-difficult" data-id="${item.id}">
                Still Difficult
              </button>
              <button class="btn btn-accent btn-sm btn-action-understood" data-id="${item.id}">
                Understood & Done
              </button>
              <button class="btn btn-ghost btn-icon btn-delete-rev" data-id="${item.id}">${ICONS.trash}</button>
            </div>
          </div>

          <div style="background: var(--color-bg-base); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.5;">
            ${item.notes || 'No notes attached.'}
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--color-text-muted);">
            <span>Reviews completed: <strong class="font-mono text-cyan">${item.reviewCount || 0}</strong></span>
            <span>Last reviewed: ${item.lastReviewed || 'Never'}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Handlers
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      activeRevisionTab = btn.getAttribute('data-tab');
      renderRevision(container);
    };
  });

  // Action: Revised (Increments count, shifts due date 3 days forward)
  container.querySelectorAll('.btn-action-revised').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      updateState(curr => {
        const updated = (curr.revisionItems || []).map(item => {
          if (item.id === id) {
            const nextDue = new Date(activeDate);
            nextDue.setDate(nextDue.getDate() + 3);
            return {
              ...item,
              reviewCount: (item.reviewCount || 0) + 1,
              lastReviewed: activeDate,
              dueDate: nextDue.toISOString().split('T')[0],
              status: 'Due this week'
            };
          }
          return item;
        });
        return { ...curr, revisionItems: updated };
      });
      renderRevision(container);
    };
  });

  // Action: Still Difficult (Keeps in Due Today, flags for tomorrow)
  container.querySelectorAll('.btn-action-difficult').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      updateState(curr => {
        const updated = (curr.revisionItems || []).map(item => {
          if (item.id === id) {
            return {
              ...item,
              reviewCount: (item.reviewCount || 0) + 1,
              lastReviewed: activeDate,
              status: 'Due today',
              notes: item.notes + ' [Re-tested: still needs focus]'
            };
          }
          return item;
        });
        return { ...curr, revisionItems: updated };
      });
      alert('Flagged as Still Difficult. Kept in active Due Today queue.');
      renderRevision(container);
    };
  });

  // Action: Understood & Done
  container.querySelectorAll('.btn-action-understood').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      updateState(curr => {
        const updated = (curr.revisionItems || []).map(item => {
          if (item.id === id) {
            return {
              ...item,
              reviewCount: (item.reviewCount || 0) + 1,
              lastReviewed: activeDate,
              status: 'Completed'
            };
          }
          return item;
        });
        return { ...curr, revisionItems: updated };
      });
      renderRevision(container);
    };
  });

  // Delete
  container.querySelectorAll('.btn-delete-rev').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this revision item?')) {
        updateState(curr => ({
          ...curr,
          revisionItems: (curr.revisionItems || []).filter(i => i.id !== id)
        }));
        renderRevision(container);
      }
    };
  });

  // Add Item Modal
  document.getElementById('btn-add-revision-item').onclick = () => {
    initModalContainer();
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Add Revision Item</h3>
            <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
          </div>
          <form id="add-rev-form">
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Topic / Concept Name</label>
                <input type="text" class="form-input" id="rev-title-input" placeholder="e.g. C Pointers vs Array Decay" required />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">Category / Subject</label>
                  <input type="text" class="form-input" id="rev-topic-input" placeholder="e.g. C Fundamentals" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Difficulty</label>
                  <select class="form-select" id="rev-diff-input">
                    <option value="Easy">Easy</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Key Confusion & Study Notes</label>
                <textarea class="form-textarea" id="rev-notes-input" rows="3" placeholder="What specifically was tricky or prone to mistakes?"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
              <button type="submit" class="btn btn-primary">Save to Queue</button>
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

    document.getElementById('add-rev-form').onsubmit = (e) => {
      e.preventDefault();
      const title = document.getElementById('rev-title-input').value.trim();
      const topic = document.getElementById('rev-topic-input').value.trim();
      const difficultyRating = document.getElementById('rev-diff-input').value;
      const notes = document.getElementById('rev-notes-input').value.trim();

      updateState(curr => {
        const newItem = {
          id: `rev-${Date.now()}`,
          title,
          source: 'Manual Add',
          type: 'Manual Focus',
          topic,
          dateAdded: activeDate,
          dueDate: activeDate,
          status: 'Due today',
          difficultyRating,
          reviewCount: 0,
          lastReviewed: null,
          notes
        };
        return {
          ...curr,
          revisionItems: [newItem, ...(curr.revisionItems || [])]
        };
      });

      closeModal();
      renderRevision(container);
    };
  };
}

/**
 * Akshay's 12-Month AI/ML Career OS - Learning Journal View
 */
import { getState, updateState } from '../data/storage.js';
import { getIcon } from '../components/icons.js';
import { initModalContainer, closeModal } from '../components/modals.js';

let journalSearchQuery = '';

export function renderJournal(container) {
  const state = getState();
  const entries = state.journalEntries || [];
  const activeDate = state.user?.activeDate || '2026-10-01';

  const filtered = entries.filter(e => {
    if (!journalSearchQuery) return true;
    const q = journalSearchQuery.toLowerCase();
    return (
      (e.topic && e.topic.toLowerCase().includes(q)) ||
      (e.learned && e.learned.toLowerCase().includes(q)) ||
      (e.built && e.built.toLowerCase().includes(q)) ||
      (e.importantConcept && e.importantConcept.toLowerCase().includes(q))
    );
  });

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('journal', 'text-emerald')} Learning Journal & Engineering Log</h1>
        <div class="view-subtitle">
          Capturing Daily Breakthroughs, Confusions, Architectures & Next Actions
        </div>
      </div>
      <div class="view-actions">
        <button class="btn btn-primary" id="btn-new-journal-entry">${getIcon('plus')} New Entry</button>
      </div>
    </div>

    <!-- Search Toolbar -->
    <div style="margin-bottom: var(--space-lg); position: relative; max-width: 480px;">
      <input type="text" class="form-input" id="journal-search-input" value="${journalSearchQuery}" placeholder="Search entries, concepts, bugs..." style="padding-left: 36px;" />
      <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted);">
        ${getIcon('search')}
      </span>
    </div>

    <!-- Journal Entries List -->
    <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
      ${filtered.length === 0 ? `
        <div class="card" style="text-align: center; padding: var(--space-2xl); color: var(--color-text-muted);">
          No journal entries found. Click "New Entry" to document today's learning!
        </div>
      ` : filtered.map(e => `
        <div class="journal-entry-card" data-id="${e.id}">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-emerald font-mono">${e.date}</span>
                <h3 style="font-size: 1.15rem;">${e.topic}</h3>
              </div>
            </div>
            <button class="btn btn-ghost btn-icon btn-delete-journal" data-id="${e.id}" title="Delete entry">${ICONS.trash}</button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); margin-top: 4px;">
            <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
              <div class="entry-field-label" style="color: var(--color-primary);">🧠 What I Learned</div>
              <div class="entry-field-content">${formatMarkdownSimple(e.learned)}</div>
            </div>

            <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
              <div class="entry-field-label" style="color: var(--color-accent-purple);">🛠️ What I Built</div>
              <div class="entry-field-content">${formatMarkdownSimple(e.built)}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
            <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
              <div class="entry-field-label" style="color: var(--color-accent-amber);">❓ What Confused Me</div>
              <div class="entry-field-content">${formatMarkdownSimple(e.confused)}</div>
            </div>

            <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
              <div class="entry-field-label" style="color: var(--color-accent-emerald);">💡 Key Principle / Formula</div>
              <div class="entry-field-content">${formatMarkdownSimple(e.importantConcept)}</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; border-top: 1px solid var(--color-border-subtle); padding-top: 8px; margin-top: 4px; color: var(--color-text-muted); flex-wrap: wrap; gap: 8px;">
            <div><strong>Resources:</strong> ${e.resources || 'None cited'}</div>
            <div><strong style="color: var(--color-primary);">Next Action:</strong> ${e.nextAction || 'Continue schedule'}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Handlers
  const searchInput = document.getElementById('journal-search-input');
  searchInput.oninput = (e) => {
    journalSearchQuery = e.target.value;
    renderJournal(container);
  };

  container.querySelectorAll('.btn-delete-journal').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this journal entry?')) {
        updateState(curr => ({
          ...curr,
          journalEntries: (curr.journalEntries || []).filter(e => e.id !== id)
        }));
        renderJournal(container);
      }
    };
  });

  // New Journal Entry Modal
  document.getElementById('btn-new-journal-entry').onclick = () => {
    initModalContainer();
    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-dialog" style="max-width: 680px;">
          <div class="modal-header">
            <h3 class="modal-title">New Learning Journal Entry</h3>
            <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
          </div>
          <form id="new-journal-form">
            <div class="modal-body">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">Topic / Headline</label>
                  <input type="text" class="form-input" id="j-topic-input" placeholder="e.g. C Pointers vs Arrays & Stack Memory Layout" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Date</label>
                  <input type="date" class="form-input" id="j-date-input" value="${activeDate}" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">What I Learned (Markdown Supported)</label>
                <textarea class="form-textarea" id="j-learned-input" rows="2" placeholder="Theoretical concepts, syntax mechanics, algorithms..." required></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">What I Built / Implemented</label>
                <textarea class="form-textarea" id="j-built-input" rows="2" placeholder="Programs coded, notebooks run, bug fixes..."></textarea>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">What Confused Me</label>
                  <textarea class="form-textarea" id="j-confused-input" rows="2" placeholder="Edge cases, tricky pointers, syntax ambiguities..."></textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">Important Concept / Rule</label>
                  <textarea class="form-textarea" id="j-concept-input" rows="2" placeholder="Mental model or law to remember forever..."></textarea>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label class="form-label">Referenced Resources</label>
                  <input type="text" class="form-input" id="j-resources-input" placeholder="Documentation URL, textbook chapter..." />
                </div>
                <div class="form-group">
                  <label class="form-label">Next Action Item</label>
                  <input type="text" class="form-input" id="j-next-input" placeholder="Tomorrow's follow-up coding task..." />
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Journal Entry</button>
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

    document.getElementById('new-journal-form').onsubmit = (e) => {
      e.preventDefault();
      const topic = document.getElementById('j-topic-input').value.trim();
      const date = document.getElementById('j-date-input').value;
      const learned = document.getElementById('j-learned-input').value.trim();
      const built = document.getElementById('j-built-input').value.trim();
      const confused = document.getElementById('j-confused-input').value.trim();
      const importantConcept = document.getElementById('j-concept-input').value.trim();
      const resources = document.getElementById('j-resources-input').value.trim();
      const nextAction = document.getElementById('j-next-input').value.trim();

      updateState(curr => {
        const newEntry = {
          id: `j-${Date.now()}`,
          date,
          topic,
          learned,
          built,
          confused,
          importantConcept,
          resources,
          nextAction
        };
        return {
          ...curr,
          journalEntries: [newEntry, ...(curr.journalEntries || [])]
        };
      });

      closeModal();
      renderJournal(container);
    };
  };
}

function formatMarkdownSimple(text) {
  if (!text) return '<span style="color: var(--color-text-dim);">None logged</span>';
  return text
    .replace(/`([^`]+)`/g, '<code class="font-mono" style="background: var(--color-bg-surface-elevated); padding: 1px 4px; border-radius: 3px;">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

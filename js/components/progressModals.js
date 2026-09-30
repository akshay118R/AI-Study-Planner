/**
 * Akshay's 12-Month AI/ML Career OS - Progress & Achievements Modals (Phase 9)
 */

import { getIcon } from './icons.js';
import {
  addCustomAchievement,
  correctEntityRecord,
  exportProgressToCsv,
  generateProgressSnapshot
} from '../services/progressEngine.js';

let modalRoot = null;

function ensureModalContainer() {
  if (!modalRoot) {
    modalRoot = document.getElementById('modal-container');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-container';
      document.body.appendChild(modalRoot);
    }
  }
  return modalRoot;
}

function closeModal() {
  const container = ensureModalContainer();
  container.innerHTML = '';
}

// ==========================================
// 1. CUSTOM ACHIEVEMENT MODAL (Section 31)
// ==========================================

export function openCustomAchievementModal(onSuccess) {
  const container = ensureModalContainer();

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="modal-bg">
      <div class="modal-card card animate-scale-up" style="max-width: 500px; width: 92%;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('trophy', 'text-amber')}
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800;">Create Custom Achievement</h3>
          </div>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-cust-ach">${getIcon('x')}</button>
        </div>

        <form id="form-custom-ach" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Achievement Name *</label>
            <input type="text" id="cust-ach-name" class="form-input" placeholder="e.g., Read 3 AI Research Papers" required style="width: 100%;">
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Category</label>
            <select id="cust-ach-cat" class="form-select" style="width: 100%;">
              <option value="Learning">Learning</option>
              <option value="DSA">DSA</option>
              <option value="Projects">Projects</option>
              <option value="Career">Career</option>
              <option value="Consistency">Consistency</option>
              <option value="Personal">Personal Milestone</option>
            </select>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Requirement / Condition</label>
            <input type="text" id="cust-ach-req" class="form-input" placeholder="e.g., Read & summarize Attention Is All You Need" style="width: 100%;">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Target Value</label>
              <input type="number" id="cust-ach-target" class="form-input" value="1" min="1" style="width: 100%;">
            </div>
            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Target Date (Optional)</label>
              <input type="date" id="cust-ach-date" class="form-input" style="width: 100%;">
            </div>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Description / Notes</label>
            <textarea id="cust-ach-desc" class="form-textarea" rows="2" placeholder="Why this achievement matters to your long-term roadmap..." style="width: 100%;"></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-cust-ach">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btn-save-cust-ach">${getIcon('check')} Create Achievement</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const close = () => closeModal();
  container.querySelector('#modal-bg').onclick = (e) => { if (e.target.id === 'modal-bg') close(); };
  container.querySelector('#btn-close-cust-ach').onclick = close;
  container.querySelector('#btn-cancel-cust-ach').onclick = close;

  container.querySelector('#form-custom-ach').onsubmit = (e) => {
    e.preventDefault();
    const name = container.querySelector('#cust-ach-name').value.trim();
    if (!name) return;

    addCustomAchievement({
      name,
      category: container.querySelector('#cust-ach-cat').value,
      requirement: container.querySelector('#cust-ach-req').value.trim(),
      target: container.querySelector('#cust-ach-target').value,
      optional_date: container.querySelector('#cust-ach-date').value || null,
      description: container.querySelector('#cust-ach-desc').value.trim()
    });

    close();
    if (onSuccess) onSuccess();
  };
}

// ==========================================
// 2. DATA CORRECTION MODAL (Section 44)
// ==========================================

export function openDataCorrectionModal(issue, onSuccess) {
  const container = ensureModalContainer();

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="modal-bg">
      <div class="modal-card card animate-scale-up" style="max-width: 480px; width: 92%;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('edit', 'text-cyan')}
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800;">Correct Data Record</h3>
          </div>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-corr">${getIcon('x')}</button>
        </div>

        <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 16px; padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border-left: 3px solid var(--color-accent-amber);">
          ${issue.description}
        </div>

        <form id="form-data-correction" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Execution Date</label>
            <input type="date" id="corr-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required style="width: 100%;">
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Duration (Minutes)</label>
            <input type="number" id="corr-duration" class="form-input" value="45" min="5" max="720" required style="width: 100%;">
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-corr">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btn-save-corr">${getIcon('check')} Save Correction</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const close = () => closeModal();
  container.querySelector('#modal-bg').onclick = (e) => { if (e.target.id === 'modal-bg') close(); };
  container.querySelector('#btn-close-corr').onclick = close;
  container.querySelector('#btn-cancel-corr').onclick = close;

  container.querySelector('#form-data-correction').onsubmit = (e) => {
    e.preventDefault();
    const date = container.querySelector('#corr-date').value;
    const durationMinutes = Number(container.querySelector('#corr-duration').value) || 45;

    correctEntityRecord(issue.entityType, issue.entityId, {
      date,
      durationMinutes
    });

    close();
    if (onSuccess) onSuccess();
  };
}

// ==========================================
// 3. PROGRESS SNAPSHOT MODAL (Section 37)
// ==========================================

export function openProgressSnapshotModal(snapshot) {
  const container = ensureModalContainer();
  if (!snapshot) snapshot = generateProgressSnapshot();
  const summary = snapshot.summary;

  const summaryText = `AKSHAY CAREER OS - PROGRESS SNAPSHOT (${snapshot.activeDate})
--------------------------------------------------
Study Sessions: ${summary.studySessions} (${summary.studyHours} hrs)
DSA Problems Solved: ${summary.dsaSolved} (${summary.dsaAttempted} attempted)
Projects: ${summary.projectsCount} total (${summary.projectsCompleted} completed)
Applications Tracked: ${summary.applications}
Achievements Unlocked: ${summary.achievementsUnlocked}
Milestones Reached: ${summary.milestonesCompleted}
--------------------------------------------------
Generated: ${snapshot.generated_at}`;

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="modal-bg">
      <div class="modal-card card animate-scale-up" style="max-width: 520px; width: 92%;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('award', 'text-cyan')}
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800;">Progress Snapshot</h3>
          </div>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-snap">${getIcon('x')}</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px;">
          <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); text-align: center;">
            <div style="font-size: 0.7rem; color: var(--color-text-muted);">Study Hours</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-primary);">${summary.studyHours}h</div>
          </div>
          <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); text-align: center;">
            <div style="font-size: 0.7rem; color: var(--color-text-muted);">DSA Solved</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-accent-amber);">${summary.dsaSolved}</div>
          </div>
          <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); text-align: center;">
            <div style="font-size: 0.7rem; color: var(--color-text-muted);">Projects Done</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-accent-purple);">${summary.projectsCompleted}</div>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label class="form-label" style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); display: block; margin-bottom: 4px;">Formatted Snapshot Summary</label>
          <textarea id="snap-text" class="form-textarea" rows="6" readonly style="width: 100%; font-family: monospace; font-size: 0.8rem; background: var(--color-bg-base);">${summaryText}</textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn btn-secondary" id="btn-copy-snap">
            ${getIcon('fileText')} Copy to Clipboard
          </button>
          <button class="btn btn-primary" id="btn-download-snap">
            ${getIcon('download')} Download JSON
          </button>
        </div>
      </div>
    </div>
  `;

  const close = () => closeModal();
  container.querySelector('#modal-bg').onclick = (e) => { if (e.target.id === 'modal-bg') close(); };
  container.querySelector('#btn-close-snap').onclick = close;

  const btnCopy = container.querySelector('#btn-copy-snap');
  btnCopy.onclick = () => {
    navigator.clipboard?.writeText(summaryText);
    btnCopy.innerHTML = `${getIcon('check')} Copied!`;
    setTimeout(() => { btnCopy.innerHTML = `${getIcon('fileText')} Copy to Clipboard`; }, 2000);
  };

  container.querySelector('#btn-download-snap').onclick = () => {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-snapshot-${snapshot.activeDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
}

// ==========================================
// 4. EXPORT MODAL (Section 38)
// ==========================================

export function openExportModal() {
  const container = ensureModalContainer();

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="modal-bg">
      <div class="modal-card card animate-scale-up" style="max-width: 480px; width: 92%;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('download', 'text-cyan')}
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800;">Export Analytics & Records</h3>
          </div>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-exp">${getIcon('x')}</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Dataset to Export</label>
            <select id="export-dataset" class="form-select" style="width: 100%;">
              <option value="study">Study History (Sessions & Minutes)</option>
              <option value="dsa">DSA Practice & Problems Solved</option>
              <option value="projects">Projects & Portfolio Registry</option>
              <option value="achievements">Unlocked & Locked Achievements</option>
              <option value="milestones">Career & Curriculum Milestones</option>
            </select>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button class="btn btn-primary" id="btn-do-csv" style="flex: 1;">
              ${getIcon('download')} Export as CSV
            </button>
            <button class="btn btn-secondary" id="btn-do-print" style="flex: 1;">
              ${getIcon('printer')} Print / PDF View
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const close = () => closeModal();
  container.querySelector('#modal-bg').onclick = (e) => { if (e.target.id === 'modal-bg') close(); };
  container.querySelector('#btn-close-exp').onclick = close;

  container.querySelector('#btn-do-csv').onclick = () => {
    const dataset = container.querySelector('#export-dataset').value;
    const csvContent = exportProgressToCsv(dataset);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-os-${dataset}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    close();
  };

  container.querySelector('#btn-do-print').onclick = () => {
    close();
    window.print();
  };
}

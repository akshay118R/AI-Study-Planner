/**
 * Akshay's 12-Month AI/ML Career OS - Personal OS Modals (Phase 10)
 * Specialized modals for Tasks, Notes, Focus, Inbox Processing, Automations,
 * Backup/Restore, Activity Log, and AI Approvals.
 */

import { getIcon } from './icons.js';
import {
  createUniversalTask,
  updateUniversalTask,
  createNote,
  updateNote,
  startFocusSession,
  finishFocusSession,
  cancelFocusSession,
  processInboxItem,
  aiTriageInbox,
  createAutomation,
  updateAutomation,
  createSystemBackup,
  previewRestoreBackup,
  applyRestoreBackup,
  getActivityLog,
  undoActivity
} from '../services/personalOsEngine.js';
import { getState } from '../data/storage.js';

let modalRoot = null;

function ensureModalContainer() {
  if (!modalRoot) {
    modalRoot = document.getElementById('personal-os-modal-container');
    if (!modalRoot) {
      modalRoot = document.createElement('div');
      modalRoot.id = 'personal-os-modal-container';
      document.body.appendChild(modalRoot);
    }
  }
  return modalRoot;
}

export function closePersonalOsModal() {
  const container = ensureModalContainer();
  container.innerHTML = '';
}

// ==========================================
// 1. TASK MODAL (Sections 9, 10, 11, 52-54)
// ==========================================

export function openTaskModal(task = null, onSuccess) {
  const container = ensureModalContainer();
  const state = getState();
  const isEdit = !!task;
  const activeDate = state.user?.activeDate || '2026-10-01';

  const projects = state.projects || [];
  const otherTasks = (state.tasks || []).filter(t => !isEdit || t.id !== task.id);

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="pos-modal-bg" style="position: fixed; inset: 0; background: rgba(10, 15, 29, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;">
      <div class="modal-card card animate-scale-up" style="max-width: 580px; width: 100%; border: 1px solid var(--color-border); box-shadow: 0 20px 40px rgba(0,0,0,0.5); padding: 22px; border-radius: var(--radius-lg); max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('tasks', 'text-cyan')}
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800;">${isEdit ? 'Edit Universal Task' : 'New Universal Task'}</h3>
          </div>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-task-modal">${getIcon('x')}</button>
        </div>

        <form id="form-universal-task" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Task Title *</label>
            <input type="text" id="task-title" class="form-input" required placeholder="e.g. Implement Epoll Event Loop in C Server" value="${task ? task.title : ''}" style="width: 100%;" />
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Description / Context</label>
            <textarea id="task-desc" class="form-textarea" rows="2" placeholder="Implementation notes, specifications, or edge cases..." style="width: 100%;">${task ? task.description : ''}</textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Due Date</label>
              <input type="date" id="task-due-date" class="form-input" value="${task?.due_date || activeDate}" style="width: 100%;" />
            </div>

            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Priority</label>
              <select id="task-priority" class="form-select" style="width: 100%;">
                <option value="Low" ${task?.priority === 'Low' ? 'selected' : ''}>Low</option>
                <option value="Medium" ${!task || task?.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="High" ${task?.priority === 'High' ? 'selected' : ''}>High</option>
                <option value="Critical" ${task?.priority === 'Critical' ? 'selected' : ''}>Critical</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Area</label>
              <select id="task-area" class="form-select" style="width: 100%;">
                <option value="Learning" ${task?.area === 'Learning' ? 'selected' : ''}>Learning (Prime / Roadmap)</option>
                <option value="DSA" ${task?.area === 'DSA' ? 'selected' : ''}>DSA Practice</option>
                <option value="Projects" ${task?.area === 'Projects' ? 'selected' : ''}>Projects</option>
                <option value="Career" ${task?.area === 'Career' ? 'selected' : ''}>Career & Placement</option>
                <option value="Personal" ${!task || task?.area === 'Personal' ? 'selected' : ''}>Personal / Academic</option>
                <option value="Other" ${task?.area === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>

            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Est. Duration (Minutes)</label>
              <input type="number" id="task-est-duration" class="form-input" min="5" step="5" value="${task?.estimated_duration || 30}" style="width: 100%;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Link to Project (Optional)</label>
              <select id="task-project" class="form-select" style="width: 100%;">
                <option value="">None</option>
                ${projects.map(p => `<option value="${p.id}" ${task?.project_id === p.id ? 'selected' : ''}>${p.title}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Recurrence</label>
              <select id="task-recurrence" class="form-select" style="width: 100%;">
                <option value="none" ${!task?.is_recurring ? 'selected' : ''}>None (One-time)</option>
                <option value="daily" ${task?.recurrence_rule === 'daily' ? 'selected' : ''}>Daily</option>
                <option value="weekly" ${task?.recurrence_rule === 'weekly' ? 'selected' : ''}>Weekly</option>
                <option value="monthly" ${task?.recurrence_rule === 'monthly' ? 'selected' : ''}>Monthly</option>
              </select>
            </div>
          </div>

          <!-- Section 52: Blocked & Dependency System -->
          <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <input type="checkbox" id="task-is-blocked" ${task?.is_blocked ? 'checked' : ''} />
              <label for="task-is-blocked" style="font-size: 0.82rem; font-weight: 700; cursor: pointer;">Mark as Blocked by Prerequisite</label>
            </div>
            <div id="blocked-inputs-group" style="display: ${task?.is_blocked ? 'block' : 'none'}; margin-top: 8px;">
              <input type="text" id="task-blocked-reason" class="form-input" placeholder="Reason blocked (e.g. Waiting for PR review or API key)" value="${task?.blocked_reason || ''}" style="width: 100%; margin-bottom: 6px; font-size: 0.8rem;" />
              <select id="task-blocked-by" class="form-select" style="width: 100%; font-size: 0.8rem;">
                <option value="">Select Prerequisite Task (Optional)</option>
                ${otherTasks.map(t => `<option value="${t.id}" ${task?.blocked_by?.includes(t.id) ? 'selected' : ''}>Prerequisite: ${t.title}</option>`).join('')}
              </select>
            </div>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Tags (Comma-separated)</label>
            <input type="text" id="task-tags" class="form-input" placeholder="e.g. backend, c, sockets" value="${task?.tags ? task.tags.join(', ') : ''}" style="width: 100%;" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-task">Cancel</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Handlers
  container.querySelector('#btn-close-task-modal').onclick = closePersonalOsModal;
  container.querySelector('#btn-cancel-task').onclick = closePersonalOsModal;
  container.querySelector('#pos-modal-bg').onclick = (e) => {
    if (e.target.id === 'pos-modal-bg') closePersonalOsModal();
  };

  const blockedCheckbox = container.querySelector('#task-is-blocked');
  const blockedGroup = container.querySelector('#blocked-inputs-group');
  blockedCheckbox.onchange = () => {
    blockedGroup.style.display = blockedCheckbox.checked ? 'block' : 'none';
  };

  container.querySelector('#form-universal-task').onsubmit = (e) => {
    e.preventDefault();
    const title = container.querySelector('#task-title').value.trim();
    if (!title) return;

    const recurrence = container.querySelector('#task-recurrence').value;
    const isBlocked = blockedCheckbox.checked;
    const blockedReason = container.querySelector('#task-blocked-reason').value.trim();
    const blockedByVal = container.querySelector('#task-blocked-by').value;

    const rawTags = container.querySelector('#task-tags').value;
    const tags = rawTags.split(',').map(s => s.trim()).filter(Boolean);

    const taskPayload = {
      title,
      description: container.querySelector('#task-desc').value.trim(),
      due_date: container.querySelector('#task-due-date').value,
      priority: container.querySelector('#task-priority').value,
      area: container.querySelector('#task-area').value,
      estimated_duration: parseInt(container.querySelector('#task-est-duration').value, 10) || 30,
      project_id: container.querySelector('#task-project').value || null,
      is_recurring: recurrence !== 'none',
      recurrence_rule: recurrence,
      is_blocked: isBlocked,
      blocked_reason: isBlocked ? blockedReason : '',
      blocked_by: isBlocked && blockedByVal ? [blockedByVal] : [],
      tags
    };

    if (isEdit) {
      updateUniversalTask(task.id, taskPayload);
    } else {
      createUniversalTask(taskPayload);
    }

    closePersonalOsModal();
    if (onSuccess) onSuccess();
  };
}

// ==========================================
// 2. NOTE MODAL (Sections 18-24)
// ==========================================

export function openNoteModal(note = null, onSuccess) {
  const container = ensureModalContainer();
  const state = getState();
  const isEdit = !!note;

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="pos-modal-bg" style="position: fixed; inset: 0; background: rgba(10, 15, 29, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;">
      <div class="modal-card card animate-scale-up" style="max-width: 600px; width: 100%; border: 1px solid var(--color-border); box-shadow: 0 20px 40px rgba(0,0,0,0.5); padding: 22px; border-radius: var(--radius-lg); max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('notes', 'text-amber')}
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800;">${isEdit ? 'Edit Note / Concept' : 'New Note / Concept'}</h3>
          </div>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-note-modal">${getIcon('x')}</button>
        </div>

        <form id="form-note" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Title *</label>
            <input type="text" id="note-title" class="form-input" required placeholder="e.g. Edge-Triggered epoll vs Level-Triggered epoll" value="${note ? note.title : ''}" style="width: 100%;" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Area</label>
              <select id="note-area" class="form-select" style="width: 100%;">
                <option value="Learning" ${note?.area === 'Learning' ? 'selected' : ''}>Learning / CS Foundations</option>
                <option value="DSA" ${note?.area === 'DSA' ? 'selected' : ''}>DSA Patterns</option>
                <option value="Projects" ${note?.area === 'Projects' ? 'selected' : ''}>Projects / Architecture</option>
                <option value="Career" ${note?.area === 'Career' ? 'selected' : ''}>Career / Interview Prep</option>
                <option value="Personal" ${!note || note?.area === 'Personal' ? 'selected' : ''}>Personal</option>
                <option value="Other" ${note?.area === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>

            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Folder</label>
              <input type="text" id="note-folder" class="form-input" placeholder="e.g. Systems, Algorithms" value="${note?.folder || 'Default'}" style="width: 100%;" />
            </div>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Content (Markdown supported)</label>
            <textarea id="note-content" class="form-textarea" rows="6" placeholder="Write key concepts, code snippets, trade-offs, and lessons..." style="width: 100%; font-family: monospace; font-size: 0.85rem;">${note ? note.content : ''}</textarea>
          </div>

          <div style="display: flex; gap: 16px; align-items: center;">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem; cursor: pointer;">
              <input type="checkbox" id="note-pinned" ${note?.is_pinned ? 'checked' : ''} />
              Pin note to top
            </label>
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.82rem; cursor: pointer;">
              <input type="checkbox" id="note-favorite" ${note?.is_favorite ? 'checked' : ''} />
              Add to favorites
            </label>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Tags (Comma-separated)</label>
            <input type="text" id="note-tags" class="form-input" placeholder="e.g. linux, concurrency, c" value="${note?.tags ? note.tags.join(', ') : ''}" style="width: 100%;" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-note">Cancel</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Save Note' : 'Create Note'}</button>
          </div>
        </form>
      </div>
    </div>
  `;

  container.querySelector('#btn-close-note-modal').onclick = closePersonalOsModal;
  container.querySelector('#btn-cancel-note').onclick = closePersonalOsModal;
  container.querySelector('#pos-modal-bg').onclick = (e) => {
    if (e.target.id === 'pos-modal-bg') closePersonalOsModal();
  };

  container.querySelector('#form-note').onsubmit = (e) => {
    e.preventDefault();
    const title = container.querySelector('#note-title').value.trim();
    if (!title) return;

    const rawTags = container.querySelector('#note-tags').value;
    const tags = rawTags.split(',').map(s => s.trim()).filter(Boolean);

    const notePayload = {
      title,
      area: container.querySelector('#note-area').value,
      folder: container.querySelector('#note-folder').value.trim() || 'Default',
      content: container.querySelector('#note-content').value,
      is_pinned: container.querySelector('#note-pinned').checked,
      is_favorite: container.querySelector('#note-favorite').checked,
      tags
    };

    if (isEdit) {
      updateNote(note.id, notePayload);
    } else {
      createNote(notePayload);
    }

    closePersonalOsModal();
    if (onSuccess) onSuccess();
  };
}

// ==========================================
// 3. FOCUS SESSION LAUNCHER & SUMMARY (Sections 14-17)
// ==========================================

export function openFocusSessionModal(onSuccess) {
  const container = ensureModalContainer();
  const state = getState();
  const activeTasks = (state.tasks || []).filter(t => t.status !== 'Completed' && t.status !== 'Cancelled');

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="pos-modal-bg" style="position: fixed; inset: 0; background: rgba(10, 15, 29, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;">
      <div class="modal-card card animate-scale-up" style="max-width: 480px; width: 100%; border: 1px solid var(--color-border); box-shadow: 0 20px 40px rgba(0,0,0,0.5); padding: 22px; border-radius: var(--radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('focus', 'text-cyan')}
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800;">Start Focus Session</h3>
          </div>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-focus-modal">${getIcon('x')}</button>
        </div>

        <form id="form-start-focus" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Task / Objective</label>
            <input type="text" id="focus-task-title" class="form-input" placeholder="What are you focusing on?" required style="width: 100%;" />
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Link to Existing Task (Optional)</label>
            <select id="focus-task-link" class="form-select" style="width: 100%;">
              <option value="">None (Custom Deep Work)</option>
              ${activeTasks.map(t => `<option value="${t.id}" data-title="${t.title}" data-area="${t.area}">${t.title}</option>`).join('')}
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Category</label>
              <select id="focus-category" class="form-select" style="width: 100%;">
                <option value="DSA">DSA Practice</option>
                <option value="Learning">Learning & Core CS</option>
                <option value="Projects">Projects</option>
                <option value="Career">Career Prep</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Target Duration</label>
              <select id="focus-duration" class="form-select" style="width: 100%;">
                <option value="25">25 mins (Pomodoro)</option>
                <option value="50" selected>50 mins (Standard Block)</option>
                <option value="90">90 mins (Ultradian Rhythm)</option>
                <option value="15">15 mins (Quick Sprint)</option>
              </select>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-focus">Cancel</button>
            <button type="submit" class="btn btn-primary">${getIcon('focus')} Start Focus Mode</button>
          </div>
        </form>
      </div>
    </div>
  `;

  container.querySelector('#btn-close-focus-modal').onclick = closePersonalOsModal;
  container.querySelector('#btn-cancel-focus').onclick = closePersonalOsModal;
  container.querySelector('#pos-modal-bg').onclick = (e) => {
    if (e.target.id === 'pos-modal-bg') closePersonalOsModal();
  };

  const linkSelect = container.querySelector('#focus-task-link');
  const titleInput = container.querySelector('#focus-task-title');
  const catSelect = container.querySelector('#focus-category');

  linkSelect.onchange = () => {
    const selectedOpt = linkSelect.options[linkSelect.selectedIndex];
    if (selectedOpt && selectedOpt.value) {
      titleInput.value = selectedOpt.getAttribute('data-title');
      const area = selectedOpt.getAttribute('data-area');
      if (['DSA', 'Learning', 'Projects', 'Career'].includes(area)) {
        catSelect.value = area;
      }
    }
  };

  container.querySelector('#form-start-focus').onsubmit = (e) => {
    e.preventDefault();
    const taskTitle = titleInput.value.trim();
    if (!taskTitle) return;

    const newSession = startFocusSession({
      taskId: linkSelect.value || null,
      taskTitle,
      category: catSelect.value,
      targetDurationMinutes: parseInt(container.querySelector('#focus-duration').value, 10)
    });

    closePersonalOsModal();
    window.location.hash = '#personal-os';
    if (onSuccess) onSuccess(newSession);
  };
}

export function openFocusSummaryModal(sessionId, onSuccess) {
  const container = ensureModalContainer();
  const state = getState();
  const session = (state.focus_sessions || []).find(s => s.id === sessionId);
  if (!session) return;

  const now = new Date();
  const startTime = new Date(session.start_time).getTime();
  const elapsedMinutes = Math.max(1, Math.round((now.getTime() - startTime) / 60000));

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="pos-modal-bg" style="position: fixed; inset: 0; background: rgba(10, 15, 29, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;">
      <div class="modal-card card animate-scale-up" style="max-width: 480px; width: 100%; border: 1px solid var(--color-border); box-shadow: 0 20px 40px rgba(0,0,0,0.5); padding: 22px; border-radius: var(--radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('award', 'text-emerald')}
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800;">Focus Session Complete</h3>
          </div>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-fsummary">${getIcon('x')}</button>
        </div>

        <div style="margin-bottom: 16px; padding: 12px; background: var(--color-bg-base); border-radius: var(--radius-sm); border-left: 3px solid var(--color-accent-emerald);">
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary);">${session.task_title}</div>
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 4px;">
            Category: <strong>${session.category}</strong> · Duration: <strong>${elapsedMinutes} minutes</strong>
          </div>
        </div>

        <form id="form-focus-summary" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Actual Minutes</label>
            <input type="number" id="fsummary-minutes" class="form-input" value="${elapsedMinutes}" style="width: 100%;" />
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Session Notes / Accomplishments</label>
            <textarea id="fsummary-notes" class="form-textarea" rows="3" placeholder="What did you get done or discover during this session?" style="width: 100%;"></textarea>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="fsummary-save-study" checked />
            <label for="fsummary-save-study" style="font-size: 0.82rem; font-weight: 700; cursor: pointer;">
              Save to Study Sessions & Analytics (Phase 9 Integration)
            </label>
          </div>

          <div style="display: flex; justify-content: space-between; gap: 10px; margin-top: 10px;">
            <button type="button" class="btn btn-ghost text-rose" id="btn-discard-focus">Discard Session</button>
            <button type="submit" class="btn btn-primary">${getIcon('check')} Save Session</button>
          </div>
        </form>
      </div>
    </div>
  `;

  container.querySelector('#btn-close-fsummary').onclick = closePersonalOsModal;
  container.querySelector('#btn-discard-focus').onclick = () => {
    cancelFocusSession(sessionId);
    closePersonalOsModal();
    if (onSuccess) onSuccess();
  };

  container.querySelector('#form-focus-summary').onsubmit = (e) => {
    e.preventDefault();
    const actualMinutes = parseInt(container.querySelector('#fsummary-minutes').value, 10) || elapsedMinutes;
    const notes = container.querySelector('#fsummary-notes').value.trim();
    const saveToStudySessions = container.querySelector('#fsummary-save-study').checked;

    finishFocusSession(sessionId, {
      actualMinutes,
      notes,
      saveToStudySessions
    });

    closePersonalOsModal();
    if (onSuccess) onSuccess();
  };
}

// ==========================================
// 4. INBOX PROCESS & AI TRIAGE MODAL (Sections 4, 5, 25)
// ==========================================

export function openInboxProcessModal(inboxItemId, onSuccess) {
  const container = ensureModalContainer();
  const state = getState();
  const item = (state.inbox_items || []).find(i => i.id === inboxItemId);
  if (!item) return;

  const aiSuggestion = aiTriageInbox(item);

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="pos-modal-bg" style="position: fixed; inset: 0; background: rgba(10, 15, 29, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;">
      <div class="modal-card card animate-scale-up" style="max-width: 520px; width: 100%; border: 1px solid var(--color-border); box-shadow: 0 20px 40px rgba(0,0,0,0.5); padding: 22px; border-radius: var(--radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('inbox', 'text-cyan')}
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800;">Process Inbox Item</h3>
          </div>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-inbox-modal">${getIcon('x')}</button>
        </div>

        <!-- Raw Captured Item -->
        <div style="padding: 12px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); margin-bottom: 16px;">
          <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Captured ${item.type}</div>
          <div style="font-size: 1rem; font-weight: 700; color: var(--color-text-primary); margin: 2px 0;">${item.title}</div>
          ${item.description ? `<div style="font-size: 0.8rem; color: var(--color-text-secondary);">${item.description}</div>` : ''}
        </div>

        <!-- AI Suggestion Box (Section 25) -->
        <div style="padding: 12px; background: rgba(6, 182, 212, 0.08); border-radius: var(--radius-sm); border: 1px solid var(--color-accent-cyan); margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 800; color: var(--color-accent-cyan); margin-bottom: 6px;">
            ${getIcon('sparkles')} AI TRIAGE RECOMMENDATION
          </div>
          <div style="font-size: 0.82rem; color: var(--color-text-primary);">
            Suggested Type: <strong>${aiSuggestion.suggestedType}</strong> · Suggested Area: <strong>${aiSuggestion.suggestedArea}</strong>
            ${aiSuggestion.suggestedProject ? ` · Suggested Project: <strong>${aiSuggestion.suggestedProject}</strong>` : ''}
          </div>
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button class="btn btn-primary btn-xs" id="btn-ai-apply-triage">Apply Suggestion</button>
            <button class="btn btn-secondary btn-xs" id="btn-ai-cancel-triage">Dismiss Suggestion</button>
          </div>
        </div>

        <!-- Manual Processing Options -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Choose Conversion Action:</div>
          <button class="btn btn-secondary btn-sm" id="btn-proc-to-task" style="justify-content: flex-start;">
            ${getIcon('tasks')} Convert to Universal Task
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-proc-to-note" style="justify-content: flex-start;">
            ${getIcon('notes')} Convert to Note / Concept
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-proc-to-proj" style="justify-content: flex-start;">
            ${getIcon('projects')} Convert to Project Idea
          </button>
          <button class="btn btn-ghost btn-sm text-rose" id="btn-proc-archive" style="justify-content: flex-start;">
            ${getIcon('trash')} Archive Item
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-close-inbox-modal').onclick = closePersonalOsModal;
  container.querySelector('#pos-modal-bg').onclick = (e) => {
    if (e.target.id === 'pos-modal-bg') closePersonalOsModal();
  };

  // AI Apply
  container.querySelector('#btn-ai-apply-triage').onclick = () => {
    if (aiSuggestion.suggestedType === 'Task' || aiSuggestion.suggestedType === 'DSA problem' || aiSuggestion.suggestedType === 'Career action') {
      processInboxItem(inboxItemId, 'convert_to_task', { area: aiSuggestion.suggestedArea });
    } else if (aiSuggestion.suggestedType === 'Note') {
      processInboxItem(inboxItemId, 'convert_to_note', { area: aiSuggestion.suggestedArea });
    } else if (aiSuggestion.suggestedType === 'Project idea') {
      processInboxItem(inboxItemId, 'convert_to_project_idea', { category: aiSuggestion.suggestedArea });
    }
    closePersonalOsModal();
    if (onSuccess) onSuccess();
  };

  container.querySelector('#btn-ai-cancel-triage').onclick = () => {
    container.querySelector('#btn-ai-apply-triage').parentElement.parentElement.remove();
  };

  container.querySelector('#btn-proc-to-task').onclick = () => {
    processInboxItem(inboxItemId, 'convert_to_task');
    closePersonalOsModal();
    if (onSuccess) onSuccess();
  };

  container.querySelector('#btn-proc-to-note').onclick = () => {
    processInboxItem(inboxItemId, 'convert_to_note');
    closePersonalOsModal();
    if (onSuccess) onSuccess();
  };

  container.querySelector('#btn-proc-to-proj').onclick = () => {
    processInboxItem(inboxItemId, 'convert_to_project_idea');
    closePersonalOsModal();
    if (onSuccess) onSuccess();
  };

  container.querySelector('#btn-proc-archive').onclick = () => {
    processInboxItem(inboxItemId, 'archive');
    closePersonalOsModal();
    if (onSuccess) onSuccess();
  };
}

// ==========================================
// 5. BACKUP & RESTORE MODAL (Sections 60-63)
// ==========================================

export function openBackupRestoreModal(onSuccess) {
  const container = ensureModalContainer();

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="pos-modal-bg" style="position: fixed; inset: 0; background: rgba(10, 15, 29, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;">
      <div class="modal-card card animate-scale-up" style="max-width: 540px; width: 100%; border: 1px solid var(--color-border); box-shadow: 0 20px 40px rgba(0,0,0,0.5); padding: 22px; border-radius: var(--radius-lg); max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('shieldCheck', 'text-cyan')}
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800;">System Backup & Restore</h3>
          </div>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-backup-modal">${getIcon('x')}</button>
        </div>

        <!-- Section A: Export Backup -->
        <div style="padding: 14px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); margin-bottom: 16px;">
          <div style="font-size: 0.9rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 4px;">Export Complete System Backup</div>
          <p style="font-size: 0.78rem; color: var(--color-text-secondary); margin-bottom: 12px;">
            Creates a versioned JSON bundle of all Phase 1–10 databases: Tasks, DSA, Projects, Career, Notes, Study sessions, and Automations.
          </p>
          <button class="btn btn-primary btn-sm" id="btn-do-backup-export">
            ${getIcon('download')} Download Backup JSON
          </button>
        </div>

        <!-- Section B: Restore Backup with Conflict Preview -->
        <div style="padding: 14px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
          <div style="font-size: 0.9rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 4px;">Restore Backup with Preview</div>
          <p style="font-size: 0.78rem; color: var(--color-text-secondary); margin-bottom: 12px;">
            Select a backup file to preview incoming records and potential conflicts before committing changes.
          </p>

          <input type="file" id="backup-file-input" accept=".json" class="form-input" style="width: 100%; margin-bottom: 12px;" />

          <div id="restore-preview-container" style="display: none; padding: 10px; background: var(--color-bg-surface); border-radius: var(--radius-sm); border: 1px solid var(--color-accent-amber); margin-bottom: 12px;">
            <!-- Populated on file select -->
          </div>

          <button class="btn btn-secondary btn-sm" id="btn-commit-restore" style="display: none;">
            ${getIcon('upload')} Confirm & Apply Restore
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-close-backup-modal').onclick = closePersonalOsModal;
  container.querySelector('#pos-modal-bg').onclick = (e) => {
    if (e.target.id === 'pos-modal-bg') closePersonalOsModal();
  };

  // Export action
  container.querySelector('#btn-do-backup-export').onclick = () => {
    const { backupMeta, backupData } = createSystemBackup('json');
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = backupMeta.filename;
    a.click();
    URL.revokeObjectURL(url);
    closePersonalOsModal();
  };

  // File Select & Preview
  const fileInput = container.querySelector('#backup-file-input');
  const previewBox = container.querySelector('#restore-preview-container');
  const commitBtn = container.querySelector('#btn-commit-restore');
  let selectedBackupData = null;

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        selectedBackupData = JSON.parse(event.target.result);
        const preview = previewRestoreBackup(selectedBackupData);

        if (!preview.isValid) {
          previewBox.style.display = 'block';
          previewBox.innerHTML = `<span class="text-rose">Invalid backup file format.</span>`;
          commitBtn.style.display = 'none';
          return;
        }

        previewBox.style.display = 'block';
        commitBtn.style.display = 'inline-flex';
        previewBox.innerHTML = `
          <div style="font-size: 0.85rem; font-weight: 700; margin-bottom: 4px;">Backup Preview Analysis:</div>
          <div style="font-size: 0.8rem; color: var(--color-text-secondary);">
            • New records to add: <strong>${preview.recordsToAdd}</strong><br/>
            • Existing records to update/conflict: <strong>${preview.recordsToUpdate}</strong>
          </div>
          <div style="margin-top: 8px;">
            <label style="font-size: 0.75rem; font-weight: 700; display: block; margin-bottom: 2px;">Conflict Strategy:</label>
            <select id="conflict-strategy-select" class="form-select" style="font-size: 0.78rem; width: 100%;">
              <option value="keep_existing">Keep Existing Records (Safer)</option>
              <option value="use_imported">Overwrite with Imported Records</option>
            </select>
          </div>
        `;
      } catch (err) {
        previewBox.style.display = 'block';
        previewBox.innerHTML = `<span class="text-rose">Error reading backup file: ${err.message}</span>`;
      }
    };
    reader.readAsText(file);
  };

  commitBtn.onclick = () => {
    if (!selectedBackupData) return;
    const stratSelect = container.querySelector('#conflict-strategy-select');
    const strat = stratSelect ? stratSelect.value : 'keep_existing';

    applyRestoreBackup(selectedBackupData, strat);
    closePersonalOsModal();
    if (onSuccess) onSuccess();
  };
}

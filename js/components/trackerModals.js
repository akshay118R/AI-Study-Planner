/**
 * Akshay's Career Tracker - Specialized In-App Modals
 * Replaces window.prompt() with robust, accessible in-DOM dialogs
 * Works seamlessly in Electron desktop and Web browsers.
 */

import { getIcon } from './icons.js';
import {
  logGamingHours,
  editPlannedTask,
  rescheduleTask
} from '../services/trackerService.js';
import { PROGRAM_START_DATE } from '../services/dateService.js';

function getModalRoot() {
  let root = document.getElementById('modal-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'modal-root';
    document.body.appendChild(root);
  }
  return root;
}

/**
 * 1. Log Gaming Modal (0-6 hours / week optional recreation)
 */
export function openGamingModal(date, currentHours, limit, onSaved) {
  const root = getModalRoot();
  const modalEl = document.createElement('div');
  modalEl.className = 'modal-backdrop animate-fade-in';
  modalEl.style.cssText = 'position: fixed; inset: 0; background: rgba(7, 11, 20, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;';

  modalEl.innerHTML = `
    <div class="card animate-scale-up" style="max-width: 400px; width: 100%; border: 1px solid var(--color-border); box-shadow: var(--shadow-lg); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 8px; color: var(--color-text-main);">
          🎮 Log Gaming Recreation
        </h3>
        <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-game-modal" type="button">${getIcon('x')}</button>
      </div>

      <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 16px; line-height: 1.4;">
        Current: <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${currentHours || 0}h / ${limit || 6}h</strong> this week (Optional recreation, separate from learning progress).
      </div>

      <form id="form-log-gaming" style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
            Hours to Log for Today
          </label>
          <input type="number" id="input-gaming-hours" class="form-input" min="0.25" max="12" step="0.25" value="1.0" required autofocus style="width: 100%; font-size: 1.1rem; font-weight: 700; font-family: var(--font-mono); padding: 8px 12px;" />
        </div>

        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <span style="font-size: 0.72rem; color: var(--color-text-muted);">Quick preset:</span>
          <button type="button" class="btn btn-ghost btn-xs chip-btn" data-val="0.5" style="border: 1px solid var(--color-border);">+30m</button>
          <button type="button" class="btn btn-ghost btn-xs chip-btn" data-val="1.0" style="border: 1px solid var(--color-border);">+1h</button>
          <button type="button" class="btn btn-ghost btn-xs chip-btn" data-val="1.5" style="border: 1px solid var(--color-border);">+1.5h</button>
          <button type="button" class="btn btn-ghost btn-xs chip-btn" data-val="2.0" style="border: 1px solid var(--color-border);">+2h</button>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; padding-top: 12px; border-top: 1px solid var(--color-border-subtle);">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-game-modal">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700;">Save Gaming Log</button>
        </div>
      </form>
    </div>
  `;

  root.appendChild(modalEl);

  const close = () => {
    if (modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
  };

  modalEl.querySelector('#btn-close-game-modal').onclick = close;
  modalEl.querySelector('#btn-cancel-game-modal').onclick = close;
  modalEl.onclick = (e) => { if (e.target === modalEl) close(); };

  const inputEl = modalEl.querySelector('#input-gaming-hours');
  modalEl.querySelectorAll('.chip-btn').forEach(btn => {
    btn.onclick = () => {
      inputEl.value = btn.getAttribute('data-val');
      inputEl.focus();
    };
  });

  const form = modalEl.querySelector('#form-log-gaming');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const hrs = parseFloat(inputEl.value);
    if (!isNaN(hrs) && hrs > 0) {
      await logGamingHours(date, hrs);
      close();
      if (onSaved) onSaved();
    }
  };
}

/**
 * 2. Edit Planned Task Modal
 */
export function openEditPlannedTaskModal(task, onSaved) {
  const root = getModalRoot();
  const modalEl = document.createElement('div');
  modalEl.className = 'modal-backdrop animate-fade-in';
  modalEl.style.cssText = 'position: fixed; inset: 0; background: rgba(7, 11, 20, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;';

  modalEl.innerHTML = `
    <div class="card animate-scale-up" style="max-width: 480px; width: 100%; border: 1px solid var(--color-border); box-shadow: var(--shadow-lg); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 8px; color: var(--color-text-main);">
          ✎ Edit Planned Task
        </h3>
        <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-edit-modal" type="button">${getIcon('x')}</button>
      </div>

      <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-bottom: 14px;">
        Scheduled for <strong>${task.date || 'upcoming date'}</strong> • Read-only completion (Planned ≠ Completed)
      </div>

      <form id="form-edit-planned-task" style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
            Task Title
          </label>
          <input type="text" id="input-edit-title" class="form-input" style="width: 100%;" required value="${(task.title || '').replace(/"/g, '&quot;')}" autofocus />
        </div>

        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
            Estimated Duration (Minutes)
          </label>
          <input type="number" id="input-edit-minutes" class="form-input" min="5" max="300" step="5" value="${task.estimated_minutes || 45}" style="width: 100%; font-family: var(--font-mono);" />
        </div>

        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
            Notes / Details
          </label>
          <textarea id="input-edit-notes" class="form-input" style="width: 100%; min-height: 70px;">${task.notes || ''}</textarea>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; padding-top: 12px; border-top: 1px solid var(--color-border-subtle);">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-edit-modal">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700;">Save Plan Changes</button>
        </div>
      </form>
    </div>
  `;

  root.appendChild(modalEl);

  const close = () => {
    if (modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
  };

  modalEl.querySelector('#btn-close-edit-modal').onclick = close;
  modalEl.querySelector('#btn-cancel-edit-modal').onclick = close;
  modalEl.onclick = (e) => { if (e.target === modalEl) close(); };

  const form = modalEl.querySelector('#form-edit-planned-task');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const title = modalEl.querySelector('#input-edit-title').value.trim();
    const mins = parseInt(modalEl.querySelector('#input-edit-minutes').value) || null;
    const notes = modalEl.querySelector('#input-edit-notes').value.trim();
    if (title) {
      await editPlannedTask(task.id, title, notes, mins);
      close();
      if (onSaved) onSaved();
    }
  };
}

/**
 * 3. Reschedule Task Modal
 */
export function openRescheduleTaskModal(task, defaultDate, onSaved) {
  const root = getModalRoot();
  const effectiveDefaultDate = (!defaultDate || defaultDate < PROGRAM_START_DATE) ? PROGRAM_START_DATE : defaultDate;
  const modalEl = document.createElement('div');
  modalEl.className = 'modal-backdrop animate-fade-in';
  modalEl.style.cssText = 'position: fixed; inset: 0; background: rgba(7, 11, 20, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;';

  modalEl.innerHTML = `
    <div class="card animate-scale-up" style="max-width: 420px; width: 100%; border: 1px solid var(--color-border); box-shadow: var(--shadow-lg); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; display: flex; align-items: center; gap: 8px; color: var(--color-text-main);">
          📅 Reschedule Task
        </h3>
        <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-reschedule-modal" type="button">${getIcon('x')}</button>
      </div>

      <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main); margin-bottom: 14px;">
        ${(task.title || 'Task').replace(/"/g, '&quot;')}
      </div>

      <form id="form-reschedule-task" style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
            Target Date
          </label>
          <input type="date" id="input-reschedule-date" class="form-input" style="width: 100%;" min="${PROGRAM_START_DATE}" required value="${effectiveDefaultDate}" autofocus />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; padding-top: 12px; border-top: 1px solid var(--color-border-subtle);">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-reschedule-modal">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700;">Confirm Reschedule</button>
        </div>
      </form>
    </div>
  `;

  root.appendChild(modalEl);

  const close = () => {
    if (modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
  };

  modalEl.querySelector('#btn-close-reschedule-modal').onclick = close;
  modalEl.querySelector('#btn-cancel-reschedule-modal').onclick = close;
  modalEl.onclick = (e) => { if (e.target === modalEl) close(); };

  const form = modalEl.querySelector('#form-reschedule-task');
  form.onsubmit = async (e) => {
    e.preventDefault();
    let newDate = modalEl.querySelector('#input-reschedule-date').value;
    if (newDate) {
      if (newDate < PROGRAM_START_DATE) newDate = PROGRAM_START_DATE;
      await rescheduleTask(task.id, newDate);
      close();
      if (onSaved) onSaved();
    }
  };
}

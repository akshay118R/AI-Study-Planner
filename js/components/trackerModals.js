/**
 * AI Study & Task Planner - Specialized In-App Modals
 * Accessible dialogs for task editing, rescheduling, and manual creation.
 */

import { getIcon } from './icons.js';
import {
  editPlannedTask,
  rescheduleTask,
  createNewTask,
  deleteTask,
  TASK_CATEGORIES,
  getCategoryMeta
} from '../services/trackerService.js';
import { getCanonicalToday, shiftDate } from '../services/dateService.js';

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
 * 1. Edit Planned Task Modal
 */
export function openEditPlannedTaskModal(task, onSaved) {
  const root = getModalRoot();
  const modalEl = document.createElement('div');
  modalEl.className = 'modal-backdrop animate-fade-in';
  modalEl.style.cssText = 'position: fixed; inset: 0; background: rgba(7, 11, 20, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;';

  modalEl.innerHTML = `
    <div class="card animate-scale-up" style="max-width: 480px; width: 100%; border: 1px solid var(--color-border); box-shadow: var(--shadow-lg); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface);">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
        <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px; color: var(--color-text-main);">
          ${getIcon('pencil')} Edit Task
        </h3>
        <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-edit-modal">${getIcon('x')}</button>
      </div>

      <form id="form-edit-task" style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
            Task Title <span style="color: var(--color-accent-rose);">*</span>
          </label>
          <input
            type="text"
            id="input-edit-title"
            class="form-input"
            value="${task.title || ''}"
            required
            style="width: 100%; padding: 8px 12px; font-size: 0.92rem; font-weight: 600;"
          />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
              Category
            </label>
            <select id="select-edit-cat" class="form-select" style="width: 100%; padding: 8px 12px;">
              ${TASK_CATEGORIES.map(c => `
                <option value="${c}" ${c === task.category ? 'selected' : ''}>${c}</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
              Priority
            </label>
            <select id="select-edit-priority" class="form-select" style="width: 100%; padding: 8px 12px;">
              <option value="High" ${task.priority === 'High' ? 'selected' : ''}>High</option>
              <option value="Medium" ${task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="Normal" ${task.priority === 'Normal' ? 'selected' : ''}>Normal</option>
              <option value="Low" ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
            </select>
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
            Planned Duration (Minutes)
          </label>
          <input
            type="number"
            id="input-edit-duration"
            class="form-input"
            value="${task.durationMinutes || 60}"
            min="10"
            max="360"
            step="10"
            required
            style="width: 100%; padding: 8px 12px; font-family: var(--font-mono); font-weight: 700;"
          />
        </div>

        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
            Notes / Description
          </label>
          <textarea
            id="input-edit-notes"
            class="form-input"
            rows="3"
            placeholder="Add specific notes, links, or exercise details..."
            style="width: 100%; padding: 8px 12px; font-size: 0.88rem; line-height: 1.4; resize: vertical;"
          >${task.notes || task.description || ''}</textarea>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 12px; border-top: 1px solid var(--color-border-subtle);">
          <button type="button" class="btn btn-ghost btn-sm" id="btn-delete-task" style="color: var(--color-accent-rose); font-weight: 600;">
            ${getIcon('trash')} Delete Task
          </button>

          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-edit-modal">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700;">Save Changes</button>
          </div>
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

  modalEl.querySelector('#btn-delete-task').onclick = async () => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      await deleteTask(task.id);
      close();
      if (onSaved) onSaved();
    }
  };

  const form = modalEl.querySelector('#form-edit-task');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const title = modalEl.querySelector('#input-edit-title').value.trim();
    const category = modalEl.querySelector('#select-edit-cat').value;
    const priority = modalEl.querySelector('#select-edit-priority').value;
    const durationMinutes = Number(modalEl.querySelector('#input-edit-duration').value) || 60;
    const notes = modalEl.querySelector('#input-edit-notes').value.trim();

    await editPlannedTask(task.id, title, notes, durationMinutes, category, priority);
    close();
    if (onSaved) onSaved();
  };
}

/**
 * 2. Reschedule Task Modal
 */
export function openRescheduleTaskModal(task, onSaved) {
  const root = getModalRoot();
  const modalEl = document.createElement('div');
  modalEl.className = 'modal-backdrop animate-fade-in';
  modalEl.style.cssText = 'position: fixed; inset: 0; background: rgba(7, 11, 20, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;';

  const canonicalToday = getCanonicalToday();

  modalEl.innerHTML = `
    <div class="card animate-scale-up" style="max-width: 400px; width: 100%; border: 1px solid var(--color-border); box-shadow: var(--shadow-lg); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface);">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
        <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px; color: var(--color-text-main);">
          ${getIcon('calendar')} Reschedule Task
        </h3>
        <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-reschedule-modal">${getIcon('x')}</button>
      </div>

      <div style="font-size: 0.88rem; color: var(--color-text-secondary); margin-bottom: 16px; line-height: 1.4;">
        Task: <strong style="color: var(--color-text-main); font-weight: 700;">${task.title}</strong>
      </div>

      <form id="form-reschedule-task" style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
            Select New Date
          </label>
          <input
            type="date"
            id="input-reschedule-date"
            class="form-input"
            value="${task.date || canonicalToday}"
            required
            style="width: 100%; padding: 8px 12px; font-weight: 700;"
          />
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" class="btn btn-ghost btn-xs chip-reschedule" data-days="0" style="border: 1px solid var(--color-border);">Today</button>
          <button type="button" class="btn btn-ghost btn-xs chip-reschedule" data-days="1" style="border: 1px solid var(--color-border);">Tomorrow</button>
          <button type="button" class="btn btn-ghost btn-xs chip-reschedule" data-days="7" style="border: 1px solid var(--color-border);">Next Week</button>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; padding-top: 12px; border-top: 1px solid var(--color-border-subtle);">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-reschedule">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700;">Reschedule</button>
        </div>
      </form>

    </div>
  `;

  root.appendChild(modalEl);

  const close = () => {
    if (modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
  };

  modalEl.querySelector('#btn-close-reschedule-modal').onclick = close;
  modalEl.querySelector('#btn-cancel-reschedule').onclick = close;
  modalEl.onclick = (e) => { if (e.target === modalEl) close(); };

  const dateInput = modalEl.querySelector('#input-reschedule-date');

  modalEl.querySelectorAll('.chip-reschedule').forEach(btn => {
    btn.onclick = () => {
      const days = Number(btn.getAttribute('data-days'));
      dateInput.value = shiftDate(canonicalToday, days);
    };
  });

  const form = modalEl.querySelector('#form-reschedule-task');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const newDate = dateInput.value;
    if (newDate) {
      await rescheduleTask(task.id, newDate);
      close();
      if (onSaved) onSaved();
    }
  };
}

/**
 * 3. Add Custom Task Modal
 */
export function openNewTaskModal(defaultDate = null, onSaved) {
  const root = getModalRoot();
  const modalEl = document.createElement('div');
  modalEl.className = 'modal-backdrop animate-fade-in';
  modalEl.style.cssText = 'position: fixed; inset: 0; background: rgba(7, 11, 20, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;';

  const dateToUse = defaultDate || getCanonicalToday();

  modalEl.innerHTML = `
    <div class="card animate-scale-up" style="max-width: 480px; width: 100%; border: 1px solid var(--color-border); box-shadow: var(--shadow-lg); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface);">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
        <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px; color: var(--color-text-main);">
          ${getIcon('plus')} Add Task
        </h3>
        <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-new-task-modal">${getIcon('x')}</button>
      </div>

      <form id="form-new-task" style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
            Task Title <span style="color: var(--color-accent-rose);">*</span>
          </label>
          <input
            type="text"
            id="input-create-title"
            class="form-input"
            placeholder="e.g. Read Chapter 4 & take notes"
            required
            autofocus
            style="width: 100%; padding: 8px 12px; font-size: 0.92rem; font-weight: 600;"
          />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
              Date
            </label>
            <input
              type="date"
              id="input-create-date"
              class="form-input"
              value="${dateToUse}"
              required
              style="width: 100%; padding: 8px 12px; font-weight: 700;"
            />
          </div>

          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
              Category
            </label>
            <select id="select-create-cat" class="form-select" style="width: 100%; padding: 8px 12px;">
              ${TASK_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
              Duration (Minutes)
            </label>
            <input
              type="number"
              id="input-create-duration"
              class="form-input"
              value="60"
              min="15"
              max="360"
              step="15"
              required
              style="width: 100%; padding: 8px 12px; font-family: var(--font-mono); font-weight: 700;"
            />
          </div>

          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
              Priority
            </label>
            <select id="select-create-priority" class="form-select" style="width: 100%; padding: 8px 12px;">
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Normal" selected>Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; padding-top: 12px; border-top: 1px solid var(--color-border-subtle);">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-create-modal">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; padding: 8px 20px;">
            Create Task
          </button>
        </div>
      </form>

    </div>
  `;

  root.appendChild(modalEl);

  const close = () => {
    if (modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
  };

  modalEl.querySelector('#btn-close-new-task-modal').onclick = close;
  modalEl.querySelector('#btn-cancel-create-modal').onclick = close;
  modalEl.onclick = (e) => { if (e.target === modalEl) close(); };

  const form = modalEl.querySelector('#form-new-task');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const title = modalEl.querySelector('#input-create-title').value.trim();
    const date = modalEl.querySelector('#input-create-date').value;
    const category = modalEl.querySelector('#select-create-cat').value;
    const priority = modalEl.querySelector('#select-create-priority').value;
    const durationMinutes = Number(modalEl.querySelector('#input-create-duration').value) || 60;

    await createNewTask({
      title,
      date,
      category,
      priority,
      durationMinutes
    });

    close();
    if (onSaved) onSaved();
  };
}

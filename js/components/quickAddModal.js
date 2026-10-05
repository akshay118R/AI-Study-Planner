/**
 * AI Study & Task Planner - Quick Add Modal
 * ONE global "+ ADD" button in header containing:
 * 1. Task (Daily task)
 * 2. Study Session (Log study duration)
 */

import { getIcon } from './icons.js';
import { createNewTask, logFocusSession, TASK_CATEGORIES } from '../services/trackerService.js';
import { getCanonicalToday } from '../services/dateService.js';

let quickAddRoot = null;

function ensureContainer() {
  if (!quickAddRoot) {
    quickAddRoot = document.getElementById('quick-add-modal-container');
    if (!quickAddRoot) {
      quickAddRoot = document.createElement('div');
      quickAddRoot.id = 'quick-add-modal-container';
      document.body.appendChild(quickAddRoot);
    }
  }
  return quickAddRoot;
}

export function closeQuickAddModal() {
  const container = ensureContainer();
  container.innerHTML = '';
}

export function openQuickAddModal(onSuccess) {
  const container = ensureContainer();

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="qa-backdrop" style="position: fixed; inset: 0; background: rgba(7, 11, 20, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;">
      <div class="card animate-scale-up" style="max-width: 420px; width: 100%; border: 1px solid var(--color-border); box-shadow: var(--shadow-lg); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 12px;">
          <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px; color: var(--color-text-main);">
            ${getIcon('plus', 'style="color: var(--color-primary); width: 20px; height: 20px;"')} Quick Add
          </h3>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-qa">${getIcon('x')}</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button class="btn btn-secondary qa-type-btn" data-type="task" style="padding: 14px 16px; justify-content: flex-start; text-align: left; font-size: 0.95rem; width: 100%; gap: 12px;">
            ${getIcon('today', 'style="color: var(--color-primary); width: 20px; height: 20px;"')}
            <div>
              <strong style="color: var(--color-text-main);">1. Add Task</strong>
              <div style="font-size: 0.76rem; color: var(--color-text-muted); margin-top: 2px;">Add a new task to your planner schedule</div>
            </div>
          </button>

          <button class="btn btn-secondary qa-type-btn" data-type="study" style="padding: 14px 16px; justify-content: flex-start; text-align: left; font-size: 0.95rem; width: 100%; gap: 12px;">
            ${getIcon('clock', 'style="color: var(--color-accent-cyan); width: 20px; height: 20px;"')}
            <div>
              <strong style="color: var(--color-text-main);">2. Log Study Session</strong>
              <div style="font-size: 0.76rem; color: var(--color-text-muted); margin-top: 2px;">Record focused study minutes for consistency</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  `;

  const closeBtn = container.querySelector('#btn-close-qa');
  if (closeBtn) closeBtn.onclick = closeQuickAddModal;

  const backdrop = container.querySelector('#qa-backdrop');
  if (backdrop) {
    backdrop.onclick = (e) => {
      if (e.target.id === 'qa-backdrop') closeQuickAddModal();
    };
  }

  container.querySelectorAll('.qa-type-btn').forEach(btn => {
    btn.onclick = () => {
      const type = btn.getAttribute('data-type');
      closeQuickAddModal();
      if (type === 'task') openTaskModal(onSuccess);
      else if (type === 'study') openStudyModal(onSuccess);
    };
  });
}

function openTaskModal(onSuccess) {
  const container = ensureContainer();
  const defaultDate = getCanonicalToday();

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="qa-backdrop" style="position: fixed; inset: 0; background: rgba(7, 11, 20, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;">
      <div class="card animate-scale-up" style="max-width: 480px; width: 100%; border: 1px solid var(--color-border); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
          <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px; color: var(--color-text-main);">
            ${getIcon('plus')} Add Task
          </h3>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-task">${getIcon('x')}</button>
        </div>

        <form id="form-new-task" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
              Task Title <span style="color: var(--color-accent-rose);">*</span>
            </label>
            <input type="text" id="inp-task-title" class="form-input" required placeholder="e.g. Complete chapter exercises & notes" autofocus style="width: 100%; padding: 8px 12px; font-weight: 600;" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="form-label" style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">Category</label>
              <select id="inp-task-category" class="form-select" style="width: 100%; padding: 8px 12px;">
                ${TASK_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label" style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">Estimated Duration (min)</label>
              <input type="number" id="inp-task-time" class="form-input" value="45" min="10" max="360" step="15" style="width: 100%; padding: 8px 12px; font-family: var(--font-mono); font-weight: 700;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="form-label" style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">Date</label>
              <input type="date" id="inp-task-date" class="form-input" value="${defaultDate}" required style="width: 100%; padding: 8px 12px; font-weight: 700;" />
            </div>
            <div>
              <label class="form-label" style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">Priority</label>
              <select id="inp-task-priority" class="form-select" style="width: 100%; padding: 8px 12px;">
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Normal" selected>Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label class="form-label" style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">Notes / Description</label>
            <input type="text" id="inp-task-notes" class="form-input" placeholder="Optional details..." style="width: 100%; padding: 8px 12px;" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; padding-top: 12px; border-top: 1px solid var(--color-border-subtle);">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-task">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; padding: 7px 18px;">Add Task</button>
          </div>
        </form>
      </div>
    </div>
  `;

  container.querySelector('#btn-close-task').onclick = closeQuickAddModal;
  container.querySelector('#btn-cancel-task').onclick = closeQuickAddModal;

  const form = container.querySelector('#form-new-task');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const title = container.querySelector('#inp-task-title').value.trim();
    const category = container.querySelector('#inp-task-category').value;
    const durationMinutes = parseInt(container.querySelector('#inp-task-time').value) || 45;
    const date = container.querySelector('#inp-task-date').value || defaultDate;
    const priority = container.querySelector('#inp-task-priority').value;
    const notes = container.querySelector('#inp-task-notes').value.trim();

    if (title) {
      await createNewTask({ title, category, durationMinutes, date, priority, notes });
      closeQuickAddModal();
      if (onSuccess) onSuccess();
    }
  };
}

function openStudyModal(onSuccess) {
  const container = ensureContainer();
  const defaultDate = getCanonicalToday();

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="qa-backdrop" style="position: fixed; inset: 0; background: rgba(7, 11, 20, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;">
      <div class="card animate-scale-up" style="max-width: 440px; width: 100%; border: 1px solid var(--color-border); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
          <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px; color: var(--color-text-main);">
            ${getIcon('clock')} Log Study Session
          </h3>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-study">${getIcon('x')}</button>
        </div>

        <form id="form-new-study" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">Category</label>
            <select id="inp-study-category" class="form-select" style="width: 100%; padding: 8px 12px;">
              ${TASK_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label class="form-label" style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">Duration (Minutes)</label>
              <input type="number" id="inp-study-minutes" class="form-input" value="45" min="5" max="480" step="5" required style="width: 100%; padding: 8px 12px; font-family: var(--font-mono); font-weight: 700;" />
            </div>
            <div>
              <label class="form-label" style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">Date</label>
              <input type="date" id="inp-study-date" class="form-input" value="${defaultDate}" required style="width: 100%; padding: 8px 12px; font-weight: 700;" />
            </div>
          </div>

          <div>
            <label class="form-label" style="display: block; font-size: 0.78rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">Topic / Notes</label>
            <input type="text" id="inp-study-notes" class="form-input" placeholder="e.g. Graph algorithms revision" style="width: 100%; padding: 8px 12px;" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; padding-top: 12px; border-top: 1px solid var(--color-border-subtle);">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-study">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; padding: 7px 18px;">Log Session</button>
          </div>
        </form>
      </div>
    </div>
  `;

  container.querySelector('#btn-close-study').onclick = closeQuickAddModal;
  container.querySelector('#btn-cancel-study').onclick = closeQuickAddModal;

  const form = container.querySelector('#form-new-study');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const category = container.querySelector('#inp-study-category').value;
    const durationMinutes = parseInt(container.querySelector('#inp-study-minutes').value) || 45;
    const date = container.querySelector('#inp-study-date').value || defaultDate;
    const notes = container.querySelector('#inp-study-notes').value.trim();

    await logFocusSession({ date, durationMinutes, category, notes });
    closeQuickAddModal();
    if (onSuccess) onSuccess();
  };
}

/**
 * Akshay's Career Tracker - Simplified Quick Add Modal
 * ONE global "+ ADD" button in header containing ONLY:
 * 1. Task
 * 2. Study Session
 * 3. Goal
 */

import { getIcon } from './icons.js';
import { createNewTask, logNewStudySession, createNewGoal } from '../services/trackerService.js';
import { getCanonicalToday, PROGRAM_START_DATE } from '../services/dateService.js';

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
      <div class="card animate-scale-up" style="max-width: 440px; width: 100%; border: 1px solid var(--color-border); box-shadow: 0 20px 40px rgba(0,0,0,0.6); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 12px;">
          <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            ${getIcon('plus', 'text-primary')} Quick Add
          </h3>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-qa">${getIcon('x')}</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button class="btn btn-secondary qa-type-btn" data-type="task" style="padding: 14px 16px; justify-content: flex-start; text-align: left; font-size: 0.95rem; width: 100%;">
            ${getIcon('today', 'text-primary')}
            <div>
              <strong style="color: var(--color-text-main);">1. Task</strong>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">Add daily task to Learn, Practice, Semester, Build, or Revise</div>
            </div>
          </button>

          <button class="btn btn-secondary qa-type-btn" data-type="study" style="padding: 14px 16px; justify-content: flex-start; text-align: left; font-size: 0.95rem; width: 100%;">
            ${getIcon('clock', 'text-cyan')}
            <div>
              <strong style="color: var(--color-text-main);">2. Study Session</strong>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">Log study duration (minutes / hours)</div>
            </div>
          </button>

          <button class="btn btn-secondary qa-type-btn" data-type="goal" style="padding: 14px 16px; justify-content: flex-start; text-align: left; font-size: 0.95rem; width: 100%;">
            ${getIcon('target', 'text-emerald')}
            <div>
              <strong style="color: var(--color-text-main);">3. Goal</strong>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">Set a Monthly or Weekly goal</div>
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
      else if (type === 'goal') openGoalModal(onSuccess);
    };
  });
}

function openTaskModal(onSuccess) {
  const container = ensureContainer();
  const today = getCanonicalToday();
  const defaultDate = today < PROGRAM_START_DATE ? PROGRAM_START_DATE : today;

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="qa-backdrop" style="position: fixed; inset: 0; background: rgba(7, 11, 20, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;">
      <div class="card animate-scale-up" style="max-width: 480px; width: 100%; border: 1px solid var(--color-border); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700;">Add Task</h3>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-task">${getIcon('x')}</button>
        </div>

        <form id="form-new-task" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Task Title *</label>
            <input type="text" id="inp-task-title" class="form-input" required placeholder="e.g., Arrays Kadane Algorithm Practice" style="width: 100%;" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Category *</label>
              <select id="inp-task-category" class="form-select" style="width: 100%;">
                <option value="LEARN">LEARN (Prime / CS)</option>
                <option value="PRACTICE" selected>PRACTICE (DSA)</option>
                <option value="SEMESTER">SEMESTER (B.Tech Prep)</option>
                <option value="BUILD">BUILD (Project)</option>
                <option value="REVISE">REVISE (DSA / Semester)</option>
              </select>
            </div>
            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Estimated Time (min)</label>
              <input type="number" id="inp-task-time" class="form-input" value="45" min="5" step="5" style="width: 100%;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Date</label>
              <input type="date" id="inp-task-date" class="form-input" min="${PROGRAM_START_DATE}" value="${defaultDate}" style="width: 100%;" />
            </div>
            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Priority</label>
              <select id="inp-task-priority" class="form-select" style="width: 100%;">
                <option value="Normal">Normal</option>
                <option value="High" selected>High</option>
                <option value="Optional">Optional</option>
              </select>
            </div>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Notes (Optional)</label>
            <input type="text" id="inp-task-notes" class="form-input" placeholder="e.g., LeetCode #53" style="width: 100%;" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
            <button type="button" class="btn btn-ghost btn-sm" id="btn-cancel-task">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Add Task</button>
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
    const estimatedMinutes = parseInt(container.querySelector('#inp-task-time').value) || 45;
    let date = container.querySelector('#inp-task-date').value || defaultDate;
    if (date < PROGRAM_START_DATE) date = PROGRAM_START_DATE;
    const priority = container.querySelector('#inp-task-priority').value;
    const notes = container.querySelector('#inp-task-notes').value.trim();

    if (title) {
      await createNewTask({ title, category, estimatedMinutes, date, priority, notes });
      closeQuickAddModal();
      if (onSuccess) onSuccess();
    }
  };
}

function openStudyModal(onSuccess) {
  const container = ensureContainer();
  const today = getCanonicalToday();
  const defaultDate = today < PROGRAM_START_DATE ? PROGRAM_START_DATE : today;

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="qa-backdrop" style="position: fixed; inset: 0; background: rgba(7, 11, 20, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;">
      <div class="card animate-scale-up" style="max-width: 440px; width: 100%; border: 1px solid var(--color-border); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700;">Log Study Session</h3>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-study">${getIcon('x')}</button>
        </div>

        <form id="form-new-study" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Category *</label>
            <select id="inp-study-category" class="form-select" style="width: 100%;">
              <option value="LEARN">LEARN (Prime 3.0 / CS)</option>
              <option value="PRACTICE" selected>PRACTICE (DSA)</option>
              <option value="SEMESTER">SEMESTER (B.Tech Preparation)</option>
              <option value="BUILD">BUILD (Project Work)</option>
              <option value="REVISE">REVISE (Spaced Revision)</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Duration (minutes) *</label>
              <input type="number" id="inp-study-duration" class="form-input" value="60" min="10" step="5" required style="width: 100%;" />
            </div>
            <div>
              <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Date</label>
              <input type="date" id="inp-study-date" class="form-input" min="${PROGRAM_START_DATE}" value="${defaultDate}" style="width: 100%;" />
            </div>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Notes (Optional)</label>
            <input type="text" id="inp-study-notes" class="form-input" placeholder="e.g., Solved 3 medium recursion problems" style="width: 100%;" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
            <button type="button" class="btn btn-ghost btn-sm" id="btn-cancel-study">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Log Session</button>
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
    const durationMinutes = parseInt(container.querySelector('#inp-study-duration').value) || 60;
    let date = container.querySelector('#inp-study-date').value || defaultDate;
    if (date < PROGRAM_START_DATE) date = PROGRAM_START_DATE;
    const notes = container.querySelector('#inp-study-notes').value.trim();

    await logNewStudySession({ category, durationMinutes, date, notes });
    closeQuickAddModal();
    if (onSuccess) onSuccess();
  };
}

function openGoalModal(onSuccess) {
  const container = ensureContainer();
  const today = getCanonicalToday();
  const currentMonthId = (today < PROGRAM_START_DATE ? PROGRAM_START_DATE : today).substring(0, 7);

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="qa-backdrop" style="position: fixed; inset: 0; background: rgba(7, 11, 20, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;">
      <div class="card animate-scale-up" style="max-width: 440px; width: 100%; border: 1px solid var(--color-border); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700;">Add Goal</h3>
          <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-goal">${getIcon('x')}</button>
        </div>

        <form id="form-new-goal" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Goal Type *</label>
            <select id="inp-goal-type" class="form-select" style="width: 100%;">
              <option value="WEEKLY" selected>Weekly Goal</option>
              <option value="MONTHLY">Monthly Goal</option>
            </select>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 600;">Goal Description *</label>
            <input type="text" id="inp-goal-title" class="form-input" required placeholder="e.g., Complete DSA recursion & sorting problems" style="width: 100%;" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
            <button type="button" class="btn btn-ghost btn-sm" id="btn-cancel-goal">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Add Goal</button>
          </div>
        </form>
      </div>
    </div>
  `;

  container.querySelector('#btn-close-goal').onclick = closeQuickAddModal;
  container.querySelector('#btn-cancel-goal').onclick = closeQuickAddModal;

  const form = container.querySelector('#form-new-goal');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const type = container.querySelector('#inp-goal-type').value;
    const title = container.querySelector('#inp-goal-title').value.trim();

    if (title) {
      await createNewGoal({ type, title, monthId: currentMonthId });
      closeQuickAddModal();
      if (onSuccess) onSuccess();
    }
  };
}

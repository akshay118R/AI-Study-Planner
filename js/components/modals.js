/**
 * Akshay's 12-Month AI/ML Career OS - Modals & Form Dialogs
 */
import { getState, updateState } from '../data/storage.js';
import { DSA_TOPICS, DSA_PLATFORMS, SKIP_REASONS, PROJECT_CATEGORIES } from '../data/curriculum.js';
import { ICONS, getIcon } from './icons.js';
import { rebalanceTasks } from '../services/taskGenerator.js';
import {
  getEnrichedRoadmapMonths,
  updateRoadmapTopic,
  toggleSubtopicCompletion,
  addSubtopicToTopic,
  updatePrimeTopic,
  getRoadmapEntities
} from '../services/roadmapEngine.js';

let modalContainer = null;

export function initModalContainer() {
  modalContainer = document.getElementById('modal-root');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'modal-root';
    document.body.appendChild(modalContainer);
  }
}

export function closeModal() {
  if (modalContainer) {
    modalContainer.innerHTML = '';
  }
}

/**
 * Quick Action Launcher
 */
export function openQuickActionModal() {
  initModalContainer();
  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 440px;">
        <div class="modal-header">
          <h3 class="modal-title">Quick Actions</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn-secondary" id="qa-add-task" style="justify-content: flex-start; padding: 12px 16px;">
            ${getIcon('today')} <span>Create Custom Task</span>
          </button>
          <button class="btn btn-secondary" id="qa-log-study" style="justify-content: flex-start; padding: 12px 16px;">
            ${getIcon('clock')} <span>Log Study Session Hours</span>
          </button>
          <button class="btn btn-secondary" id="qa-add-dsa" style="justify-content: flex-start; padding: 12px 16px;">
            ${getIcon('dsa')} <span>Add DSA Problem Record</span>
          </button>
          <button class="btn btn-secondary" id="qa-add-project" style="justify-content: flex-start; padding: 12px 16px;">
            ${getIcon('projects')} <span>New Portfolio Project</span>
          </button>
          <button class="btn btn-secondary" id="qa-add-journal" style="justify-content: flex-start; padding: 12px 16px;">
            ${getIcon('journal')} <span>New Learning Journal Entry</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('qa-add-task').onclick = () => { closeModal(); openAddTaskModal(); };
  document.getElementById('qa-log-study').onclick = () => { closeModal(); openLogStudyModal(); };
  document.getElementById('qa-add-dsa').onclick = () => { closeModal(); openAddDsaModal(); };
  document.getElementById('qa-add-project').onclick = () => { closeModal(); openAddProjectModal(); };
  document.getElementById('qa-add-journal').onclick = () => { closeModal(); window.location.hash = '#journal'; };
}

/**
 * Add Task Modal
 */
export function openAddTaskModal(prefillDate = null) {
  initModalContainer();
  const state = getState();
  const activeDate = prefillDate || state.user?.activeDate || '2026-10-01';

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">Add Study Task</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <form id="add-task-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Task Title</label>
              <input type="text" class="form-input" id="task-title-input" placeholder="e.g. Implement C Dynamic Array using malloc/realloc" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Learning Track</label>
                <select class="form-select" id="task-track-select">
                  <option value="Prime 3.0">Track A: Prime 3.0 AI/ML</option>
                  <option value="Individual">Track B: Individual CS</option>
                  <option value="DSA">DSA Practice</option>
                  <option value="Project">Project Development</option>
                  <option value="Revision">Revision</option>
                  <option value="GitHub">GitHub Activity</option>
                  <option value="Custom">Custom / General</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Target Date</label>
                <input type="date" class="form-input" id="task-date-input" value="${activeDate}" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Estimated Minutes</label>
              <input type="number" class="form-input" id="task-duration-input" value="60" min="5" max="480" step="5" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Task</button>
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

  document.getElementById('add-task-form').onsubmit = (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title-input').value.trim();
    const track = document.getElementById('task-track-select').value;
    const date = document.getElementById('task-date-input').value;
    const durationMinutes = parseInt(document.getElementById('task-duration-input').value, 10) || 60;

    if (!title) return;

    updateState(curr => {
      const newTask = {
        id: `task-${Date.now()}`,
        date,
        track,
        category: track,
        title,
        durationMinutes,
        completed: false,
        subtasks: []
      };
      return {
        ...curr,
        dailyTasks: [newTask, ...(curr.dailyTasks || [])]
      };
    });

    closeModal();
  };
}

/**
 * Log Study Session Modal
 */
export function openLogStudyModal() {
  initModalContainer();
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">Log Study Hours</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <form id="log-study-form">
          <div class="modal-body">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Track</label>
                <select class="form-select" id="study-track-select">
                  <option value="Prime 3.0">Track A: Prime 3.0 AI/ML</option>
                  <option value="Individual">Track B: Individual CS</option>
                  <option value="DSA">DSA Practice</option>
                  <option value="Project">Project Development</option>
                  <option value="Revision">Revision</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-input" id="study-date-input" value="${activeDate}" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Topic / Focus Area</label>
              <input type="text" class="form-input" id="study-topic-input" placeholder="e.g. C Pointers & Memory Allocation" required />
            </div>

            <div class="form-group">
              <label class="form-label">Duration (Minutes)</label>
              <input type="number" class="form-input" id="study-minutes-input" value="60" min="10" max="600" step="5" required />
              <div class="form-hint">60 mins = 1.0 hour | 90 mins = 1.5 hours</div>
            </div>

            <div class="form-group">
              <label class="form-label">Key Notes / Breakthroughs</label>
              <textarea class="form-textarea" id="study-notes-input" rows="3" placeholder="What concepts clicked? What code was written?"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Log Session</button>
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

  document.getElementById('log-study-form').onsubmit = (e) => {
    e.preventDefault();
    const track = document.getElementById('study-track-select').value;
    const date = document.getElementById('study-date-input').value;
    const topic = document.getElementById('study-topic-input').value.trim();
    const durationMinutes = parseInt(document.getElementById('study-minutes-input').value, 10) || 60;
    const notes = document.getElementById('study-notes-input').value.trim();

    updateState(curr => {
      const session = {
        id: `sess-${Date.now()}`,
        date,
        track,
        topic,
        durationMinutes,
        notes
      };
      return {
        ...curr,
        studySessions: [session, ...(curr.studySessions || [])]
      };
    });

    closeModal();
  };
}

/**
 * Add DSA Problem Modal
 */
export function openAddDsaModal() {
  initModalContainer();
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 640px;">
        <div class="modal-header">
          <h3 class="modal-title">Record DSA Problem</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <form id="add-dsa-form">
          <div class="modal-body">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Problem Name</label>
                <input type="text" class="form-input" id="dsa-name-input" placeholder="e.g. Valid Anagram" required />
              </div>
              <div class="form-group">
                <label class="form-label">Difficulty</label>
                <select class="form-select" id="dsa-diff-select">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Topic</label>
                <select class="form-select" id="dsa-topic-select">
                  ${DSA_TOPICS.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Platform</label>
                <select class="form-select" id="dsa-platform-select">
                  ${DSA_PLATFORMS.map(p => `<option value="${p}">${p}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select" id="dsa-status-select">
                  <option value="Solved">Solved</option>
                  <option value="Attempted">Attempted</option>
                  <option value="Revision Required">Revision Required</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Problem URL</label>
                <input type="url" class="form-input" id="dsa-link-input" placeholder="https://leetcode.com/problems/..." />
              </div>
              <div class="form-group">
                <label class="form-label">Time Spent (Mins)</label>
                <input type="number" class="form-input" id="dsa-time-input" value="30" min="5" max="180" />
              </div>
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-input" id="dsa-date-input" value="${activeDate}" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Algorithmic Approach & Space/Time Complexity</label>
              <textarea class="form-textarea" id="dsa-approach-input" rows="2" placeholder="e.g. Hash map frequency counter. Time: O(N), Space: O(1) for alphabet."></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Mistake Category (If any)</label>
                <select class="form-select" id="dsa-mistake-select">
                  <option value="None">None (Smooth solve)</option>
                  <option value="Edge case handling">Edge case handling</option>
                  <option value="Time limit exceeded (TLE)">Time limit exceeded (TLE)</option>
                  <option value="Off-by-one error">Off-by-one error</option>
                  <option value="Wrong data structure">Wrong data structure</option>
                  <option value="Missed subproblem / optimal substructure">Missed subproblem</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group" style="display: flex; flex-direction: column; justify-content: center; padding-top: 15px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" class="custom-checkbox" id="dsa-rev-cb" />
                  <span style="font-size: 0.85rem; font-weight: 500;">Add to Spaced Revision Queue</span>
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Problem</button>
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

  document.getElementById('add-dsa-form').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('dsa-name-input').value.trim();
    const difficulty = document.getElementById('dsa-diff-select').value;
    const topic = document.getElementById('dsa-topic-select').value;
    const platform = document.getElementById('dsa-platform-select').value;
    const status = document.getElementById('dsa-status-select').value;
    const link = document.getElementById('dsa-link-input').value.trim();
    const timeTakenMinutes = parseInt(document.getElementById('dsa-time-input').value, 10) || 30;
    const date = document.getElementById('dsa-date-input').value;
    const approach = document.getElementById('dsa-approach-input').value.trim();
    const mistakeCategory = document.getElementById('dsa-mistake-select').value;
    const revisionRequired = document.getElementById('dsa-rev-cb').checked || status === 'Revision Required' || (mistakeCategory !== 'None');

    updateState(curr => {
      const newProb = {
        id: `dsa-${Date.now()}`,
        name,
        difficulty,
        topic,
        platform,
        status: status === 'Revision Required' ? 'Solved' : status,
        link,
        timeTakenMinutes,
        date,
        approach,
        mistakeCategory,
        revisionRequired,
        solutionUnderstood: true
      };

      const revisionItems = [...(curr.revisionItems || [])];
      if (revisionRequired) {
        revisionItems.unshift({
          id: `rev-${Date.now()}`,
          title: `DSA: ${name} (${difficulty})`,
          source: `DSA Problem`,
          type: 'DSA Mistake',
          topic,
          dateAdded: date,
          dueDate: date,
          status: 'Due today',
          difficultyRating: difficulty,
          reviewCount: 0,
          lastReviewed: null,
          notes: `Approach: ${approach}. Mistake: ${mistakeCategory}`
        });
      }

      return {
        ...curr,
        dsaProblems: [newProb, ...(curr.dsaProblems || [])],
        revisionItems
      };
    });

    closeModal();
  };
}

/**
 * Add / Edit Project Modal
 */
export function openAddProjectModal() {
  initModalContainer();

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">New Portfolio Project</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <form id="add-project-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Project Name</label>
              <input type="text" class="form-input" id="proj-name-input" placeholder="e.g. Distributed Key-Value Store or Vision Classifier" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-select" id="proj-cat-select">
                  ${PROJECT_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select" id="proj-status-select">
                  <option value="Idea">Idea</option>
                  <option value="Planning">Planning</option>
                  <option value="Building" selected>Building</option>
                  <option value="Testing">Testing</option>
                  <option value="Deployed">Deployed</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Technologies Used</label>
              <input type="text" class="form-input" id="proj-tech-input" placeholder="e.g. Python, FastAPI, PyTorch, Docker, PostgreSQL" />
            </div>

            <div class="form-group">
              <label class="form-label">Description & Architecture</label>
              <textarea class="form-textarea" id="proj-desc-input" rows="3" placeholder="What problem does it solve? What is the technical highlight?"></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">GitHub Repository URL</label>
                <input type="url" class="form-input" id="proj-github-input" placeholder="https://github.com/akshay/..." />
              </div>
              <div class="form-group">
                <label class="form-label">Live Deployment URL</label>
                <input type="url" class="form-input" id="proj-live-input" placeholder="https://..." />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Project</button>
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

  document.getElementById('add-project-form').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('proj-name-input').value.trim();
    const category = document.getElementById('proj-cat-select').value;
    const status = document.getElementById('proj-status-select').value;
    const technology = document.getElementById('proj-tech-input').value.trim();
    const description = document.getElementById('proj-desc-input').value.trim();
    const githubUrl = document.getElementById('proj-github-input').value.trim();
    const liveUrl = document.getElementById('proj-live-input').value.trim();

    updateState(curr => {
      const newProj = {
        id: `proj-${Date.now()}`,
        name,
        category,
        status,
        technology,
        description,
        githubUrl,
        liveUrl,
        readmeStatus: 'Drafted',
        deploymentStatus: liveUrl ? 'Deployed' : 'Pending',
        progress: status === 'Completed' || status === 'Deployed' ? 100 : (status === 'Building' ? 25 : 0),
        tasks: [
          { id: `pt-${Date.now()}-1`, title: 'Research & System Architecture', completed: true },
          { id: `pt-${Date.now()}-2`, title: 'Project Scaffolding & Setup', completed: true },
          { id: `pt-${Date.now()}-3`, title: 'Core Functionality Development', completed: false },
          { id: `pt-${Date.now()}-4`, title: 'Comprehensive Testing', completed: false },
          { id: `pt-${Date.now()}-5`, title: 'Documentation & Clean README', completed: false },
          { id: `pt-${Date.now()}-6`, title: 'Public Deployment & Demo Video', completed: false }
        ]
      };
      return {
        ...curr,
        projects: [newProj, ...(curr.projects || [])]
      };
    });

    closeModal();
  };
}

/**
 * Habit Skip Reason Modal
 */
export function openHabitSkipReasonModal(habitId, habitName, dateString, onSave) {
  initModalContainer();

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 440px;">
        <div class="modal-header">
          <h3 class="modal-title">Log Skip Reason</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.88rem; color: var(--color-text-secondary); margin-bottom: 12px;">
            Skipping <strong>${habitName}</strong> on ${dateString}. Tracking reasons prevents recurring blockers without guilt.
          </p>

          <div class="form-group">
            <label class="form-label">Primary Reason</label>
            <select class="form-select" id="skip-reason-select">
              ${SKIP_REASONS.map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Notes (Optional)</label>
            <input type="text" class="form-input" id="skip-notes-input" placeholder="e.g. 3 back-to-back college submissions" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
          <button type="button" class="btn btn-danger" id="btn-confirm-skip">Confirm Skip</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('btn-confirm-skip').onclick = () => {
    const reason = document.getElementById('skip-reason-select').value;
    const notes = document.getElementById('skip-notes-input').value.trim();
    onSave(reason, notes);
    closeModal();
  };
}

/**
 * Adaptive Rebalance Modal
 */
export function openAdaptiveRebalanceModal(behindCount) {
  initModalContainer();

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">Adaptive Schedule Rebalancer</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <div class="modal-body">
          <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 12px; margin-bottom: 16px;">
            <p style="font-size: 0.9rem; font-weight: 600; color: var(--color-accent-amber);">
              You are ${behindCount} tasks behind this week.
            </p>
            <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 4px;">
              No tasks are ever silently deleted. Choose how you would like your operating system to adaptively reschedule:
            </p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button class="btn btn-secondary" id="act-recover-week" style="justify-content: flex-start; padding: 12px; text-align: left;">
              <div>
                <div style="font-weight: 600;">⚡ Recover This Week</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">Re-assign overdue tasks into today and Saturday sessions.</div>
              </div>
            </button>

            <button class="btn btn-secondary" id="act-spread-sunday" style="justify-content: flex-start; padding: 12px; text-align: left;">
              <div>
                <div style="font-weight: 600;">📅 Move to Sunday 8-Hour Power Block</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">Tackle backlog during Sunday extended review and deep work session.</div>
              </div>
            </button>

            <button class="btn btn-secondary" id="act-move-next-week" style="justify-content: flex-start; padding: 12px; text-align: left;">
              <div>
                <div style="font-weight: 600;">➡️ Move to Next Week</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">Shift target dates forward by 7 days to preserve quality and depth.</div>
              </div>
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Dismiss</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('act-recover-week').onclick = () => {
    updateState(curr => rebalanceTasks(curr, 'recover-this-week'));
    closeModal();
  };
  document.getElementById('act-spread-sunday').onclick = () => {
    updateState(curr => rebalanceTasks(curr, 'spread-weekend'));
    closeModal();
  };
  document.getElementById('act-move-next-week').onclick = () => {
    updateState(curr => rebalanceTasks(curr, 'move-to-next-week'));
    closeModal();
  };
}

/**
 * ==================================================
 * PHASE 2: MONTH DETAIL MODAL
 * ==================================================
 */
export function openMonthDetailModal(monthId) {
  initModalContainer();
  const months = getEnrichedRoadmapMonths();
  const month = months.find(m => m.id === monthId) || months[0];

  let statusBadgeClass = 'badge-slate';
  if (month.status === 'Completed') statusBadgeClass = 'badge-emerald';
  else if (month.status === 'Current') statusBadgeClass = 'badge-primary';
  else if (month.status === 'Needs Attention') statusBadgeClass = 'badge-amber';
  else if (month.status === 'On Track') statusBadgeClass = 'badge-cyan';

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 680px; max-height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header" style="border-bottom: 1px solid var(--color-border); padding-bottom: 12px;">
          <div>
            <div style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--color-text-muted); text-transform: uppercase;">
              ${month.month} ${month.year} · Month ${month.order} of 12
            </div>
            <h2 class="modal-title" style="font-size: 1.25rem; margin-top: 2px;">${month.title}</h2>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <div class="modal-body" style="overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 14px;">
          <!-- Meta Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <div>
              <div style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase;">Date Range</div>
              <div style="font-size: 0.8rem; font-weight: 600; font-family: var(--font-mono);">${month.start_date} → ${month.end_date}</div>
            </div>
            <div>
              <div style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase;">Study Target</div>
              <div style="font-size: 0.8rem; font-weight: 600;">${month.target_hours || 135}h (32h/wk)</div>
            </div>
            <div>
              <div style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase;">Status</div>
              <div><span class="badge ${statusBadgeClass}">${month.status}</span></div>
            </div>
            <div>
              <div style="font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase;">Progress</div>
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent-emerald);">${month.progress}% (${month.completedTopicsCount}/${month.totalTopics} done)</div>
            </div>
          </div>

          <p style="font-size: 0.82rem; color: var(--color-text-secondary); line-height: 1.5; margin: 0;">
            ${month.description}
          </p>

          <div class="progress-bar-wrap" style="height: 6px;">
            <div class="progress-bar-fill emerald" style="width: ${month.progress}%;"></div>
          </div>

          <!-- Topics Section -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h4 style="font-size: 0.95rem; font-weight: 700;">TOPICS (${month.totalTopics})</h4>
              <span style="font-size: 0.72rem; color: var(--color-text-muted);">Click topic name to open deep details</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${month.topics.map(t => {
                const isCompleted = t.status === 'Completed' || t.progress === 100;
                let topicBadge = 'badge-slate';
                if (t.status === 'Completed') topicBadge = 'badge-emerald';
                else if (t.status === 'Learning') topicBadge = 'badge-primary';
                else if (t.status === 'Practicing') topicBadge = 'badge-cyan';

                return `
                  <div class="topic-interactive-row ${isCompleted ? 'completed' : ''}" data-topic-id="${t.id}">
                    <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                      <input type="checkbox" class="custom-checkbox month-topic-quick-cb"
                        data-topic-id="${t.id}" ${isCompleted ? 'checked' : ''} />
                      <div class="topic-open-detail" data-topic-id="${t.id}" style="cursor: pointer; flex: 1;">
                        <span style="font-size: 0.86rem; font-weight: 600; ${isCompleted ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">
                          ${t.name}
                        </span>
                        <div style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: var(--color-text-muted); margin-top: 2px;">
                          <span class="badge badge-slate" style="font-size: 0.68rem;">${t.category}</span>
                          <span>Target: ${t.target_date || 'Month-end'}</span>
                          ${t.subtopics?.length ? `<span>· ${t.subtopics.filter(s => s.status === 'Completed').length}/${t.subtopics.length} subtopics</span>` : ''}
                        </div>
                      </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 10px;" class="topic-open-detail" data-topic-id="${t.id}">
                      <div style="width: 50px; text-align: right; font-family: var(--font-mono); font-size: 0.75rem;">
                        ${t.progress}%
                      </div>
                      <span class="badge ${topicBadge}" style="min-width: 80px; text-align: center;">${t.status}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding-top: 12px;">
          <button type="button" class="btn btn-secondary" id="btn-close-month-modal">Close</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-close-month-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  // Quick checkbox toggle on topic
  modalContainer.querySelectorAll('.month-topic-quick-cb').forEach(cb => {
    cb.onchange = (e) => {
      e.stopPropagation();
      const topicId = e.target.getAttribute('data-topic-id');
      const isChecked = e.target.checked;
      updateRoadmapTopic(topicId, {
        status: isChecked ? 'Completed' : 'Not Started',
        progress: isChecked ? 100 : 0
      });
      openMonthDetailModal(monthId); // Refresh modal view
    };
  });

  // Clicking a topic row opens Topic Detail modal
  modalContainer.querySelectorAll('.topic-open-detail').forEach(el => {
    el.onclick = (e) => {
      e.stopPropagation();
      const topicId = el.getAttribute('data-topic-id');
      openTopicDetailModal(topicId, monthId);
    };
  });
}

/**
 * ==================================================
 * PHASE 2: TOPIC DETAIL MODAL
 * ==================================================
 */
export function openTopicDetailModal(topicId, parentMonthId = null) {
  initModalContainer();
  const { topics, subtopics, primeTopics } = getRoadmapEntities();
  const topic = topics.find(t => t.id === topicId);
  if (!topic) return;

  const topicSubtopics = subtopics.filter(s => s.topic_id === topic.id);
  const relatedPrime = topic.related_prime_topic_id ? primeTopics.find(p => p.id === topic.related_prime_topic_id) : null;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 600px; max-height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header" style="border-bottom: 1px solid var(--color-border); padding-bottom: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge badge-emerald">Track B: Individual Roadmap</span>
              <span class="badge badge-slate">${topic.category}</span>
            </div>
            <h2 class="modal-title" style="font-size: 1.25rem; margin-top: 4px;">${topic.name}</h2>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <div class="modal-body" style="overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 14px;">
          <!-- Description -->
          <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0; line-height: 1.5;">
            ${topic.description || 'Core roadmap learning topic.'}
          </p>

          <!-- Status & Progress Controls -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 0.75rem;">Status</label>
              <select class="form-select" id="detail-topic-status">
                <option value="Not Started" ${topic.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                <option value="Learning" ${topic.status === 'Learning' ? 'selected' : ''}>Learning</option>
                <option value="Practicing" ${topic.status === 'Practicing' ? 'selected' : ''}>Practicing</option>
                <option value="Completed" ${topic.status === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>

            <div class="form-group" style="margin: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label class="form-label" style="font-size: 0.75rem;">Progress</label>
                <span style="font-family: var(--font-mono); font-weight: 700; color: var(--color-accent-emerald);" id="progress-val-label">${topic.progress}%</span>
              </div>
              <input type="range" class="form-range" id="detail-topic-progress" min="0" max="100" value="${topic.progress}" style="width: 100%; accent-color: var(--color-accent-emerald);" />
            </div>
          </div>

          <!-- Schedule & History Meta -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size: 0.75rem;">
            <div style="background: var(--color-bg-base); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="color: var(--color-text-muted);">Start Date</div>
              <div style="font-weight: 600; font-family: var(--font-mono);">${topic.start_date || '2026-10-01'}</div>
            </div>
            <div style="background: var(--color-bg-base); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="color: var(--color-text-muted);">Target Date</div>
              <div style="font-weight: 600; font-family: var(--font-mono);">${topic.target_date || 'Target Month'}</div>
            </div>
            <div style="background: var(--color-bg-base); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="color: var(--color-text-muted);">Completion Date</div>
              <div style="font-weight: 600; font-family: var(--font-mono);">${topic.completion_date || 'Incomplete'}</div>
            </div>
          </div>

          <!-- Genuine Prime 3.0 Linkage Section -->
          ${relatedPrime ? `
            <div class="prime-linkage-callout">
              ${getIcon('prime', 'text-cyan')}
              <div>
                <div style="font-size: 0.72rem; color: var(--color-accent-cyan); font-weight: 700; text-transform: uppercase;">
                  Genuine Prime 3.0 Curriculum Connection
                </div>
                <div style="font-size: 0.85rem; font-weight: 600;">
                  Related: ${relatedPrime.name} (${relatedPrime.category}) · Status: ${relatedPrime.status} (${relatedPrime.progress}%)
                </div>
              </div>
            </div>
          ` : `
            <div style="padding: 8px 12px; background: var(--color-bg-base); border-radius: var(--radius-sm); font-size: 0.75rem; color: var(--color-text-muted); border: 1px dashed var(--color-border);">
              <span>Independent Track B Topic — completely separated from Prime 3.0 AI/ML course.</span>
            </div>
          `}

          <!-- Subtopics Section -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <h4 style="font-size: 0.85rem; font-weight: 700;">SUBTOPICS (${topicSubtopics.length})</h4>
              <span style="font-size: 0.72rem; color: var(--color-text-muted);">Completing subtopics auto-updates topic %</span>
            </div>

            <div class="subtopic-list-box">
              ${topicSubtopics.length === 0 ? `
                <div style="font-size: 0.78rem; color: var(--color-text-muted); text-align: center; padding: 10px;">
                  No subtopics yet. Add one below to track granular milestones!
                </div>
              ` : topicSubtopics.map(sub => {
                const isSubDone = sub.status === 'Completed' || sub.progress === 100;
                return `
                  <div class="subtopic-check-row">
                    <label style="display: flex; align-items: center; gap: 8px; flex: 1; cursor: pointer;">
                      <input type="checkbox" class="custom-checkbox subtopic-cb" data-subtopic-id="${sub.id}" ${isSubDone ? 'checked' : ''} />
                      <span style="font-size: 0.8rem; ${isSubDone ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">
                        ${sub.name}
                      </span>
                    </label>
                    <span class="badge ${isSubDone ? 'badge-emerald' : 'badge-slate'}" style="font-size: 0.65rem;">
                      ${isSubDone ? 'Done' : 'Pending'}
                    </span>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Add Subtopic Form -->
            <div style="display: flex; gap: 8px; margin-top: 8px;">
              <input type="text" class="form-input" id="new-subtopic-input" placeholder="Add custom subtopic milestone..." style="font-size: 0.8rem; padding: 6px 10px;" />
              <button class="btn btn-secondary btn-sm" id="btn-add-subtopic" style="white-space: nowrap;">+ Add</button>
            </div>
          </div>

          <!-- Notes Area -->
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.75rem;">Study Notes & Implementation Insights</label>
            <textarea class="form-textarea" id="detail-topic-notes" rows="3" placeholder="Key takeaways, edge cases, algorithms implemented, or reference links...">${topic.notes || ''}</textarea>
          </div>
        </div>

        <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding-top: 12px; justify-content: space-between;">
          ${parentMonthId ? `
            <button type="button" class="btn btn-ghost btn-sm" id="btn-back-to-month">← Back to Month</button>
          ` : `<span></span>`}
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-topic-modal">Close</button>
            <button type="button" class="btn btn-primary" id="btn-save-topic-modal">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach controls
  const progressInput = document.getElementById('detail-topic-progress');
  const progressLabel = document.getElementById('progress-val-label');
  const statusSelect = document.getElementById('detail-topic-status');
  const notesArea = document.getElementById('detail-topic-notes');

  progressInput.oninput = (e) => {
    progressLabel.textContent = `${e.target.value}%`;
    if (parseInt(e.target.value, 10) === 100) {
      statusSelect.value = 'Completed';
    } else if (parseInt(e.target.value, 10) > 0 && statusSelect.value === 'Not Started') {
      statusSelect.value = 'Learning';
    }
  };

  statusSelect.onchange = (e) => {
    if (e.target.value === 'Completed') {
      progressInput.value = 100;
      progressLabel.textContent = '100%';
    } else if (e.target.value === 'Not Started') {
      progressInput.value = 0;
      progressLabel.textContent = '0%';
    }
  };

  // Subtopic toggle
  modalContainer.querySelectorAll('.subtopic-cb').forEach(cb => {
    cb.onchange = () => {
      const subId = cb.getAttribute('data-subtopic-id');
      toggleSubtopicCompletion(subId);
      openTopicDetailModal(topicId, parentMonthId); // re-render to reflect new calculated topic %
    };
  });

  // Add subtopic
  const addSubBtn = document.getElementById('btn-add-subtopic');
  const newSubInput = document.getElementById('new-subtopic-input');
  const handleAddSub = () => {
    const val = newSubInput.value.trim();
    if (val) {
      addSubtopicToTopic(topic.id, val);
      openTopicDetailModal(topicId, parentMonthId);
    }
  };
  addSubBtn.onclick = handleAddSub;
  newSubInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSub();
    }
  };

  // Back to Month
  const backBtn = document.getElementById('btn-back-to-month');
  if (backBtn && parentMonthId) {
    backBtn.onclick = () => openMonthDetailModal(parentMonthId);
  }

  // Save changes
  document.getElementById('btn-save-topic-modal').onclick = () => {
    const updatedStatus = statusSelect.value;
    const updatedProgress = parseInt(progressInput.value, 10);
    const updatedNotes = notesArea.value;

    updateRoadmapTopic(topic.id, {
      status: updatedStatus,
      progress: updatedProgress,
      notes: updatedNotes,
      completion_date: updatedStatus === 'Completed' ? (topic.completion_date || new Date().toISOString().split('T')[0]) : null
    });

    if (parentMonthId) {
      openMonthDetailModal(parentMonthId);
    } else {
      closeModal();
    }
  };

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-topic-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };
}

/**
 * ==================================================
 * PHASE 2: PRIME 3.0 TOPIC DETAIL MODAL
 * ==================================================
 */
export function openPrimeTopicDetailModal(primeTopicId) {
  initModalContainer();
  const { primeTopics } = getRoadmapEntities();
  const topic = primeTopics.find(p => p.id === primeTopicId);
  if (!topic) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 540px;">
        <div class="modal-header" style="border-bottom: 1px solid var(--color-border); padding-bottom: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge badge-cyan">Track A: Prime 3.0 AI/ML</span>
              <span class="badge badge-slate">${topic.category}</span>
            </div>
            <h2 class="modal-title" style="font-size: 1.25rem; margin-top: 4px;">${topic.name}</h2>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <div class="modal-body" style="padding: 16px 20px; display: flex; flex-direction: column; gap: 14px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 0.75rem;">Status</label>
              <select class="form-select" id="prime-topic-status">
                <option value="Not Started" ${topic.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                <option value="Learning" ${topic.status === 'Learning' ? 'selected' : ''}>Learning</option>
                <option value="Practicing" ${topic.status === 'Practicing' ? 'selected' : ''}>Practicing</option>
                <option value="Completed" ${topic.status === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>

            <div class="form-group" style="margin: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label class="form-label" style="font-size: 0.75rem;">Progress</label>
                <span style="font-family: var(--font-mono); font-weight: 700; color: var(--color-accent-cyan);" id="prime-progress-label">${topic.progress}%</span>
              </div>
              <input type="range" class="form-range" id="prime-topic-progress" min="0" max="100" value="${topic.progress}" style="width: 100%; accent-color: var(--color-accent-cyan);" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.75rem;">
            <div style="background: var(--color-bg-base); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="color: var(--color-text-muted);">Start Date</div>
              <div style="font-weight: 600; font-family: var(--font-mono);">${topic.start_date || '2026-10-01'}</div>
            </div>
            <div style="background: var(--color-bg-base); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="color: var(--color-text-muted);">Target Date</div>
              <div style="font-weight: 600; font-family: var(--font-mono);">${topic.target_date || 'Target Cohort'}</div>
            </div>
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.75rem;">Notes & Cohort Code References</label>
            <textarea class="form-textarea" id="prime-topic-notes" rows="3" placeholder="Key implementations, notebook links, and test metrics...">${topic.notes || ''}</textarea>
          </div>
        </div>

        <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding-top: 12px;">
          <button type="button" class="btn btn-secondary" id="btn-cancel-prime-modal">Close</button>
          <button type="button" class="btn btn-primary" id="btn-save-prime-modal">Save Prime Topic</button>
        </div>
      </div>
    </div>
  `;

  const pInput = document.getElementById('prime-topic-progress');
  const pLabel = document.getElementById('prime-progress-label');
  const pStatus = document.getElementById('prime-topic-status');
  const pNotes = document.getElementById('prime-topic-notes');

  pInput.oninput = (e) => {
    pLabel.textContent = `${e.target.value}%`;
    if (parseInt(e.target.value, 10) === 100) pStatus.value = 'Completed';
    else if (parseInt(e.target.value, 10) > 0 && pStatus.value === 'Not Started') pStatus.value = 'Learning';
  };

  pStatus.onchange = (e) => {
    if (e.target.value === 'Completed') {
      pInput.value = 100;
      pLabel.textContent = '100%';
    } else if (e.target.value === 'Not Started') {
      pInput.value = 0;
      pLabel.textContent = '0%';
    }
  };

  document.getElementById('btn-save-prime-modal').onclick = () => {
    const updatedStatus = pStatus.value;
    const updatedProgress = parseInt(pInput.value, 10);
    const updatedNotes = pNotes.value;

    updatePrimeTopic(topic.id, {
      status: updatedStatus,
      progress: updatedProgress,
      notes: updatedNotes,
      completion_date: updatedStatus === 'Completed' ? (topic.completion_date || new Date().toISOString().split('T')[0]) : null
    });

    closeModal();
  };

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-prime-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };
}


/**
 * Akshay's 12-Month AI/ML Career OS - Modals & Form Dialogs
 */
import { getState, updateState } from '../data/storage.js';
import { DSA_TOPICS, DSA_PLATFORMS, SKIP_REASONS, PROJECT_CATEGORIES } from '../data/curriculum.js';
import { ICONS, getIcon } from './icons.js';
import {
  rebalanceTasks,
  completeDailyTask,
  undoDailyTask,
  skipDailyTask,
  checkDayOverload,
  rescheduleDailyTask,
  getMonthAndWeekInfo
} from '../services/taskGenerator.js';
import { PROGRAM_START_DATE } from '../services/dateService.js';
import {
  getEnrichedRoadmapMonths,
  updateRoadmapTopic,
  toggleSubtopicCompletion,
  addSubtopicToTopic,
  updatePrimeTopic,
  getRoadmapEntities
} from '../services/roadmapEngine.js';
import {
  calculateMonthlyMetrics,
  saveMonthlyTargets,
  updateMonthlyTopicStatus,
  carryForwardTopic,
  saveMonthlyReview,
  saveNextMonthPriorities
} from '../services/monthlyEngine.js';
import {
  DSA_TAXONOMY,
  ALL_DSA_TOPICS,
  DSA_PATTERNS,
  MISTAKE_CATEGORIES,
  SOLUTION_STATUSES,
  REVISION_INTERVALS,
  addDsaProblem,
  solveDsaProblem,
  reattemptRevisionProblem,
  toggleDsaBookmark,
  saveDsaPracticeSession,
  exportDsaToCsv,
  importDsaFromCsv,
  deleteDsaProblem,
  updateDsaProblem,
  setDsaDailyTarget
} from '../services/dsaEngine.js';
import {
  PROJECT_CATEGORIES as PHASE6_PROJECT_CATEGORIES,
  PROJECT_TYPES,
  PROJECT_DIFFICULTIES,
  PROJECT_STATUSES,
  PORTFOLIO_STATUSES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  PORTFOLIO_PRIORITIES,
  TECH_STACK_PRESETS,
  DEPLOYMENT_PLATFORMS,
  TESTING_CATEGORIES,
  QUALITY_CHECK_CATEGORIES,
  ROADMAP_PROJECT_PLACEHOLDERS,
  createProject,
  updateProject,
  getProjectById,
  addProjectTask,
  updateProjectTask,
  toggleProjectTask,
  deleteProjectTask,
  addProjectMilestone,
  updateProjectMilestone,
  addProjectFeature,
  updateProjectFeature,
  addProjectGoal,
  updateProjectGoal,
  addProjectTechnology,
  removeProjectTechnology,
  updateProjectGitHub,
  toggleGitHubChecklistItem,
  toggleReadmeChecklistItem,
  addOrUpdateDeployment,
  toggleDeploymentChecklistItem,
  updateProjectTest,
  updateProjectDocumentation,
  addProjectChallenge,
  addProjectLearningLog,
  updateProjectPortfolio,
  updateProjectQualityCheck,
  togglePortfolioReadinessChecklistItem,
  markPortfolioReady,
  updateProjectResume,
  logProjectSession,
  getProjectCompletionSummary,
  markProjectCompleted,
  addProjectIdea,
  convertIdeaToProject,
  exportPortfolioCSV
} from '../services/projectEngine.js';

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
          <button class="btn btn-secondary" id="qa-log-study" style="justify-content: flex-start; padding: 12px 16px;">
            ${getIcon('clock')} <span>Log Study Session Hours</span>
          </button>
          <button class="btn btn-secondary" id="qa-add-dsa" style="justify-content: flex-start; padding: 12px 16px;">
            ${getIcon('dsa')} <span>Add DSA Problem Record</span>
          </button>
          <button class="btn btn-secondary" id="qa-add-task" style="justify-content: flex-start; padding: 12px 16px;">
            ${getIcon('today')} <span>Create Custom Task</span>
          </button>
          <button class="btn btn-secondary" id="qa-start-project" style="justify-content: flex-start; padding: 12px 16px;">
            ${getIcon('projects')} <span>Start Project Session</span>
          </button>
          <button class="btn btn-secondary" id="qa-add-journal" style="justify-content: flex-start; padding: 12px 16px;">
            ${getIcon('journal')} <span>Add Note / Learning Journal</span>
          </button>
          <button class="btn btn-secondary" id="qa-mark-revision" style="justify-content: flex-start; padding: 12px 16px;">
            ${getIcon('revision')} <span>Mark Revision Item</span>
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('qa-log-study').onclick = () => { closeModal(); openLogStudyModal(); };
  document.getElementById('qa-add-dsa').onclick = () => { closeModal(); openAddDsaModal(); };
  document.getElementById('qa-add-task').onclick = () => { closeModal(); openAddTaskModal(); };
  document.getElementById('qa-start-project').onclick = () => { closeModal(); openLogStudyModal(); };
  document.getElementById('qa-add-journal').onclick = () => { closeModal(); window.location.hash = '#journal'; };
  document.getElementById('qa-mark-revision').onclick = () => { closeModal(); window.location.hash = '#revision'; };
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
 * Log Study Session Modal (Section 8)
 * Fields: Date, Start time, End time, Duration, Category, Topic, Notes.
 * Categories: Prime 3.0, DSA, Individual Learning, Project, Revision, Other.
 * Auto-calculates daily/weekly/monthly study time without double counting.
 */
export function openLogStudyModal(prefillDate = null) {
  initModalContainer();
  const state = getState();
  const activeDate = prefillDate || state.user?.activeDate || '2026-10-01';

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">Log Study Session</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <form id="log-study-form">
          <div class="modal-body">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-select" id="study-category-select">
                  <option value="Prime 3.0">Prime 3.0</option>
                  <option value="DSA">DSA</option>
                  <option value="Individual Learning">Individual Learning</option>
                  <option value="Project">Project</option>
                  <option value="Revision">Revision</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-input" id="study-date-input" value="${activeDate}" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Topic / Focus Area</label>
              <input type="text" class="form-input" id="study-topic-input" placeholder="e.g. C Arrays - Row Major Order & Memory Contiguity" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Start Time</label>
                <input type="time" class="form-input" id="study-start-time" value="09:00" />
              </div>
              <div class="form-group">
                <label class="form-label">End Time</label>
                <input type="time" class="form-input" id="study-end-time" value="10:30" />
              </div>
              <div class="form-group">
                <label class="form-label">Duration (Minutes)</label>
                <input type="number" class="form-input" id="study-minutes-input" value="90" min="5" max="720" step="5" required />
              </div>
            </div>
            <div class="form-hint" style="margin-top: -6px; margin-bottom: 10px;">
              Auto-calculated from Start/End time or enter manually (e.g., 60 mins = 1.0 hr).
            </div>

            <div class="form-group">
              <label class="form-label">Key Notes / Code Breakthroughs</label>
              <textarea class="form-textarea" id="study-notes-input" rows="3" placeholder="What concepts clicked? What code was written or tested?"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Session</button>
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

  const startTimeInput = document.getElementById('study-start-time');
  const endTimeInput = document.getElementById('study-end-time');
  const durationInput = document.getElementById('study-minutes-input');

  const updateCalculatedDuration = () => {
    const s = startTimeInput.value;
    const e = endTimeInput.value;
    if (s && e) {
      const [sh, sm] = s.split(':').map(Number);
      const [eh, em] = e.split(':').map(Number);
      let diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff < 0) diff += 1440;
      if (diff > 0) durationInput.value = diff;
    }
  };

  startTimeInput.onchange = updateCalculatedDuration;
  endTimeInput.onchange = updateCalculatedDuration;

  document.getElementById('log-study-form').onsubmit = (e) => {
    e.preventDefault();
    const category = document.getElementById('study-category-select').value;
    const date = document.getElementById('study-date-input').value;
    const topic = document.getElementById('study-topic-input').value.trim();
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const durationMinutes = parseInt(durationInput.value, 10) || 60;
    const notes = document.getElementById('study-notes-input').value.trim();

    const currState = getState();
    // Section 8: Prevent duplicate sessions to avoid counting the same session twice
    const isDuplicate = (currState.studySessions || []).some(s => 
      s.date === date &&
      (s.category === category || s.track === category) &&
      s.topic.toLowerCase() === topic.toLowerCase() &&
      Math.abs((s.durationMinutes || 0) - durationMinutes) < 2
    );

    if (isDuplicate) {
      alert("⚠️ A study session for this topic and duration on this date is already logged. Duplicate prevented.");
      return;
    }

    updateState(curr => {
      const session = {
        id: `sess-${Date.now()}`,
        date,
        track: category, // compatibility
        category,
        topic,
        startTime,
        endTime,
        durationMinutes,
        notes
      };
      const sessions = [session, ...(curr.studySessions || [])];
      return {
        ...curr,
        studySessions: sessions,
        study_sessions: sessions
      };
    });

    closeModal();
  };
}

/**
 * SECTION 6 & 14: Add DSA Problem Modal (Phase 5)
 * Fields: Problem Name, Platform, Problem URL (optional), Topic, Subtopic, Patterns, Difficulty, Notes.
 * Does not automatically claim problem was solved (starts Not Attempted).
 * Validates against duplicate platform + URL / Title.
 */
export function openAddDsaProblemModal(prefillTopic = null) {
  initModalContainer();
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';

  const platforms = ['LeetCode', 'Codeforces', 'GeeksforGeeks', 'CodeChef', 'HackerRank', 'Other'];
  const allTopics = ALL_DSA_TOPICS;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 650px;">
        <div class="modal-header">
          <h3 class="modal-title">${getIcon('plus', 'text-cyan')} + Add DSA Problem</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <form id="add-dsa-form">
          <div class="modal-body">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Problem Name *</label>
                <input type="text" class="form-input" id="dsa-name-input" placeholder="e.g. Container With Most Water" required />
              </div>
              <div class="form-group">
                <label class="form-label">Difficulty</label>
                <select class="form-select" id="dsa-diff-select">
                  <option value="Easy">Easy</option>
                  <option value="Medium" selected>Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Platform</label>
                <select class="form-select" id="dsa-platform-select">
                  ${platforms.map(p => `<option value="${p}">${p}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Problem URL (Optional)</label>
                <input type="url" class="form-input" id="dsa-link-input" placeholder="https://leetcode.com/problems/..." />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Topic</label>
                <select class="form-select" id="dsa-topic-select">
                  ${allTopics.map(t => `<option value="${t}" ${prefillTopic === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Subtopic (Optional)</label>
                <input type="text" class="form-input" id="dsa-subtopic-input" placeholder="e.g. Two Pointers, Monotonic Queue" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Algorithmic Patterns (Multi-Select)</label>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 6px; max-height: 120px; overflow-y: auto; padding: 6px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                ${DSA_PATTERNS.map(pat => `
                  <label style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; cursor: pointer;">
                    <input type="checkbox" class="dsa-pattern-cb" value="${pat}" />
                    <span>${pat}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Initial Notes (Optional)</label>
              <textarea class="form-textarea" id="dsa-notes-input" rows="2" placeholder="Key pattern observation, constraints to keep in mind..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btn-save-problem">+ Add Problem</button>
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
    const title = document.getElementById('dsa-name-input').value.trim();
    const difficulty = document.getElementById('dsa-diff-select').value;
    const platform = document.getElementById('dsa-platform-select').value;
    const url = document.getElementById('dsa-link-input').value.trim();
    const topic = document.getElementById('dsa-topic-select').value;
    const subtopic = document.getElementById('dsa-subtopic-input').value.trim();
    const notes = document.getElementById('dsa-notes-input').value.trim();

    const selectedPatterns = Array.from(document.querySelectorAll('.dsa-pattern-cb:checked')).map(cb => cb.value);

    const res = addDsaProblem({
      title,
      difficulty,
      platform,
      url,
      topic,
      subtopic,
      patterns: selectedPatterns,
      notes,
      status: 'Not Attempted'
    });

    if (!res.success) {
      alert(`⚠️ ${res.error}`);
      return;
    }

    closeModal();
  };
}

// Backwards-compatible alias for existing callers
export function openAddDsaModal(prefillDate = null) {
  openAddDsaProblemModal();
}

/**
 * SECTION 8, 9, 10, 11, 12, 13, 22, 23: Attempt & Solve DSA Problem Modal
 * Interactive timer (start/stop/elapsed) + manual entry
 * Solution status (Independently, With hint, Saw solution, Could not solve)
 * Solution understanding (Yes, Partially, No -> auto-marks Needs Revision)
 * Mistake categories & notes
 * Approach & Complexity (Time/Space)
 * Revision interval (1d, 3d, 7d, 14d, 30d, custom)
 * Hidden solution recall test for revision reattempts
 */
export function openSolveDsaProblemModal(problemId, options = {}) {
  initModalContainer();
  const state = getState();
  const problems = state.dsa_problems || state.dsaProblems || [];
  const prob = problems.find(p => p.id === problemId);

  if (!prob) {
    alert('Problem not found.');
    return;
  }

  const isReattempt = options.isReattempt || prob.needs_revision || prob.revisionRequired;
  let timerInterval = null;
  let timerSeconds = 0;
  let timerRunning = false;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 680px;">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">${prob.title || prob.name}</h3>
            <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px; font-size: 0.78rem;">
              <span class="badge badge-slate">${prob.platform || 'LeetCode'}</span>
              <span class="badge ${prob.difficulty === 'Hard' ? 'badge-rose' : (prob.difficulty === 'Medium' ? 'badge-amber' : 'badge-emerald')}">${prob.difficulty}</span>
              <span class="badge badge-cyan">${prob.topic}</span>
              ${prob.url ? `<a href="${prob.url}" target="_blank" rel="noopener" style="color: var(--color-primary); display: inline-flex; align-items: center; gap: 4px;">Open Problem ${getIcon('externalLink')}</a>` : ''}
            </div>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="solve-dsa-form">
          <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
            <!-- Hidden Solution Toggle for Revision Reattempts (Section 23) -->
            ${isReattempt && (prob.approach || prob.notes) ? `
              <div style="background: var(--color-bg-base); padding: 10px 14px; border-radius: var(--radius-md); border: 1px dashed var(--color-border); margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.82rem; font-weight: 600; color: var(--color-accent-amber);">
                    🧠 Active Recall Reattempt: Previous solution hidden
                  </span>
                  <button type="button" class="btn btn-ghost btn-sm" id="btn-toggle-prior-sol" style="font-size: 0.75rem;">
                    Show Previous Solution
                  </button>
                </div>
                <div id="prior-solution-box" style="display: none; margin-top: 8px; font-size: 0.8rem; color: var(--color-text-secondary); border-top: 1px solid var(--color-border); padding-top: 8px;">
                  <div><strong>Prior Approach:</strong> ${prob.approach || 'None'}</div>
                  <div><strong>Complexity:</strong> Time: ${prob.time_complexity || 'N/A'}, Space: ${prob.space_complexity || 'N/A'}</div>
                  ${prob.mistake_notes ? `<div><strong>Previous Mistake:</strong> ${prob.mistake_notes}</div>` : ''}
                </div>
              </div>
            ` : ''}

            <!-- SECTION 9: Attempt Timer & Duration -->
            <div style="background: var(--color-bg-base); padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--color-border); margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                  <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">
                    ATTEMPT DURATION
                  </div>
                  <div style="font-size: 1.6rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-primary);" id="timer-display">
                    00:00
                  </div>
                </div>

                <div style="display: flex; gap: 8px; align-items: center;">
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-start-timer">Start Timer</button>
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-stop-timer" disabled>Stop Timer</button>
                  <div style="display: flex; align-items: center; gap: 6px; margin-left: 10px;">
                    <label style="font-size: 0.78rem; color: var(--color-text-muted);">Minutes:</label>
                    <input type="number" class="form-input" id="dsa-manual-minutes" value="${prob.time_taken || prob.timeTakenMinutes || 25}" min="1" max="300" style="width: 70px; padding: 4px 8px; font-size: 0.85rem;" />
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 10: Solution Status -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
              <div class="form-group">
                <label class="form-label">Solution Outcome *</label>
                <select class="form-select" id="dsa-solution-type-select">
                  <option value="Solved independently" selected>Solved independently</option>
                  <option value="Solved with hint">Solved with hint</option>
                  <option value="Solved after seeing solution">Solved after seeing solution</option>
                  <option value="Could not solve">Could not solve</option>
                </select>
              </div>

              <!-- SECTION 11: Solution Understanding -->
              <div class="form-group">
                <label class="form-label">Do you understand the solution? *</label>
                <select class="form-select" id="dsa-understanding-select">
                  <option value="Yes" selected>Yes</option>
                  <option value="Partially">Partially (Auto-flags Revision)</option>
                  <option value="No">No (Auto-flags Revision)</option>
                </select>
              </div>
            </div>

            <!-- SECTION 13: Approach & Complexity -->
            <div class="form-group">
              <label class="form-label">Algorithmic Approach</label>
              <textarea class="form-textarea" id="dsa-approach-input" rows="2" placeholder="e.g. Inward two-pointer sweep tracking max area between left and right pillars.">${prob.approach || ''}</textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
              <div class="form-group">
                <label class="form-label">Time Complexity</label>
                <input type="text" class="form-input" id="dsa-time-complexity" value="${prob.time_complexity || 'O(n)'}" placeholder="e.g. O(n) or O(n log n)" />
              </div>
              <div class="form-group">
                <label class="form-label">Space Complexity</label>
                <input type="text" class="form-input" id="dsa-space-complexity" value="${prob.space_complexity || 'O(1)'}" placeholder="e.g. O(1) or O(n)" />
              </div>
            </div>

            <!-- SECTION 12: Mistake Tracking -->
            <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border); margin-bottom: 14px;">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-accent-amber); margin-bottom: 8px;">
                MISTAKE TRACKING: What went wrong?
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Category</label>
                  <select class="form-select" id="dsa-mistake-select">
                    <option value="None">None (Clean solve)</option>
                    ${MISTAKE_CATEGORIES.map(m => `<option value="${m}" ${prob.mistake_type === m || prob.mistakeCategory === m ? 'selected' : ''}>${m}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Mistake Notes</label>
                  <input type="text" class="form-input" id="dsa-mistake-notes" value="${prob.mistake_notes || ''}" placeholder="e.g. I used nested loops and missed the O(n) hash-map approach." />
                </div>
              </div>
            </div>

            <!-- SECTION 21 & 22: Revision Scheduling -->
            <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">
                  <input type="checkbox" id="dsa-needs-revision-cb" ${prob.needs_revision || prob.revisionRequired ? 'checked' : ''} />
                  <span>Mark for Revision Queue</span>
                </label>
                <span style="font-size: 0.72rem; color: var(--color-text-muted);">Spaced Repetition</span>
              </div>

              <div id="revision-schedule-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Interval Schedule</label>
                  <select class="form-select" id="dsa-revision-interval">
                    <option value="1">1 Day</option>
                    <option value="3" selected>3 Days (Default)</option>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">General Notes</label>
                  <input type="text" class="form-input" id="dsa-general-notes" value="${prob.notes || ''}" placeholder="Edge cases, tricky pointers..." />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btn-submit-solution">Save Attempt & Progress</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const timerDisplay = document.getElementById('timer-display');
  const btnStart = document.getElementById('btn-start-timer');
  const btnStop = document.getElementById('btn-stop-timer');
  const manualMinutes = document.getElementById('dsa-manual-minutes');
  const underSelect = document.getElementById('dsa-understanding-select');
  const solTypeSelect = document.getElementById('dsa-solution-type-select');
  const revCb = document.getElementById('dsa-needs-revision-cb');

  // Toggle prior solution in active recall
  const toggleBtn = document.getElementById('btn-toggle-prior-sol');
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      const box = document.getElementById('prior-solution-box');
      if (box.style.display === 'none') {
        box.style.display = 'block';
        toggleBtn.textContent = 'Hide Previous Solution';
      } else {
        box.style.display = 'none';
        toggleBtn.textContent = 'Show Previous Solution';
      }
    };
  }

  // Timer Handlers
  btnStart.onclick = () => {
    if (timerRunning) return;
    timerRunning = true;
    btnStart.disabled = true;
    btnStop.disabled = false;
    timerInterval = setInterval(() => {
      timerSeconds++;
      const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
      const secs = String(timerSeconds % 60).padStart(2, '0');
      timerDisplay.textContent = `${mins}:${secs}`;
      manualMinutes.value = Math.max(1, Math.round(timerSeconds / 60));
    }, 1000);
  };

  btnStop.onclick = () => {
    if (!timerRunning) return;
    timerRunning = false;
    clearInterval(timerInterval);
    btnStart.disabled = false;
    btnStop.disabled = true;
    manualMinutes.value = Math.max(1, Math.round(timerSeconds / 60));
  };

  // Section 11: Auto-mark Needs Revision if Partially or No
  const updateRevisionRequirement = () => {
    const understanding = underSelect.value;
    const solType = solTypeSelect.value;
    if (understanding === 'Partially' || understanding === 'No' || solType === 'Could not solve') {
      revCb.checked = true;
    }
  };

  underSelect.onchange = updateRevisionRequirement;
  solTypeSelect.onchange = updateRevisionRequirement;

  const cleanup = () => {
    if (timerInterval) clearInterval(timerInterval);
    closeModal();
  };

  document.getElementById('btn-close-modal').onclick = cleanup;
  document.getElementById('btn-cancel-modal').onclick = cleanup;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') cleanup();
  };

  document.getElementById('solve-dsa-form').onsubmit = (e) => {
    e.preventDefault();
    if (timerInterval) clearInterval(timerInterval);

    const solutionType = solTypeSelect.value;
    const solutionUnderstood = underSelect.value;
    const timeTakenMinutes = parseInt(manualMinutes.value, 10) || 25;
    const approach = document.getElementById('dsa-approach-input').value.trim();
    const timeComplexity = document.getElementById('dsa-time-complexity').value.trim();
    const spaceComplexity = document.getElementById('dsa-space-complexity').value.trim();
    const mistakeCategory = document.getElementById('dsa-mistake-select').value;
    const mistakeNotes = document.getElementById('dsa-mistake-notes').value.trim();
    const needsRevision = revCb.checked || solutionUnderstood === 'Partially' || solutionUnderstood === 'No' || solutionType === 'Could not solve';
    const revisionIntervalDays = parseInt(document.getElementById('dsa-revision-interval').value, 10) || 3;
    const notes = document.getElementById('dsa-general-notes').value.trim();

    solveDsaProblem(problemId, {
      solutionType,
      solutionUnderstood,
      timeTakenMinutes,
      approach,
      timeComplexity,
      spaceComplexity,
      mistakeCategory,
      mistakeNotes,
      needsRevision,
      revisionIntervalDays,
      notes
    });

    if (isReattempt) {
      reattemptRevisionProblem(problemId, solutionType);
    }

    closeModal();
  };
}

/**
 * SECTION 14: Problem Detail Modal
 */
export function openProblemDetailModal(problemId) {
  initModalContainer();
  const state = getState();
  const problems = state.dsa_problems || state.dsaProblems || [];
  const prob = problems.find(p => p.id === problemId);

  if (!prob) {
    alert('Problem not found.');
    return;
  }

  const isBookmarked = Boolean(prob.is_bookmarked);
  const diffBadge = prob.difficulty === 'Hard' ? 'badge-rose' : (prob.difficulty === 'Medium' ? 'badge-amber' : 'badge-emerald');

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 650px;">
        <div class="modal-header">
          <div>
            <h3 class="modal-title" style="display: flex; align-items: center; gap: 8px;">
              <span>${prob.title || prob.name}</span>
              <button class="btn btn-ghost btn-icon btn-sm" id="btn-toggle-bookmark-detail" title="${isBookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}">
                ${isBookmarked ? getIcon('star', 'text-amber') : getIcon('star')}
              </button>
            </h3>
            <div style="display: flex; gap: 6px; align-items: center; margin-top: 4px;">
              <span class="badge badge-slate">${prob.platform}</span>
              <span class="badge ${diffBadge}">${prob.difficulty}</span>
              <span class="badge badge-cyan">${prob.topic}</span>
              <span class="badge ${prob.status === 'Solved' ? 'badge-emerald' : 'badge-amber'}">${prob.status}</span>
            </div>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Metrics Row -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; text-align: center;">
            <div style="background: var(--color-bg-base); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
              <div style="font-size: 0.7rem; color: var(--color-text-muted);">ATTEMPTS</div>
              <div style="font-size: 1.15rem; font-weight: 700; font-family: var(--font-mono);">${prob.attempt_count || 1}</div>
            </div>
            <div style="background: var(--color-bg-base); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
              <div style="font-size: 0.7rem; color: var(--color-text-muted);">SOLVES</div>
              <div style="font-size: 1.15rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-accent-emerald);">${prob.solve_count || (prob.status === 'Solved' ? 1 : 0)}</div>
            </div>
            <div style="background: var(--color-bg-base); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
              <div style="font-size: 0.7rem; color: var(--color-text-muted);">TIME SPENT</div>
              <div style="font-size: 1.15rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-accent-cyan);">${prob.time_taken || prob.timeTakenMinutes || 0}m</div>
            </div>
            <div style="background: var(--color-bg-base); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
              <div style="font-size: 0.7rem; color: var(--color-text-muted);">REVISION</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: ${prob.needs_revision || prob.revisionRequired ? 'var(--color-accent-rose)' : 'var(--color-accent-emerald)'};">
                ${prob.needs_revision || prob.revisionRequired ? 'Queued' : 'Clear'}
              </div>
            </div>
          </div>

          <!-- Approach & Complexity -->
          <div>
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 4px;">
              Approach & Complexity
            </div>
            <div style="background: var(--color-bg-base); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); font-size: 0.85rem;">
              <p style="margin: 0 0 6px 0;">${prob.approach || 'No approach notes documented yet.'}</p>
              <div style="display: flex; gap: 16px; font-size: 0.75rem; color: var(--color-text-secondary); font-family: var(--font-mono);">
                <span>Time: <strong>${prob.time_complexity || 'N/A'}</strong></span>
                <span>Space: <strong>${prob.space_complexity || 'N/A'}</strong></span>
                <span>Type: <strong>${prob.solution_type || 'N/A'}</strong></span>
              </div>
            </div>
          </div>

          <!-- Mistake Tracking -->
          ${(prob.mistakeCategory && prob.mistakeCategory !== 'None') || (prob.mistake_type && prob.mistake_type !== 'None') || prob.mistake_notes ? `
            <div>
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-accent-amber); text-transform: uppercase; margin-bottom: 4px;">
                Logged Mistake
              </div>
              <div style="background: rgba(245, 158, 11, 0.08); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid rgba(245, 158, 11, 0.3); font-size: 0.85rem;">
                <div style="font-weight: 600; color: var(--color-accent-amber);">${prob.mistake_type || prob.mistakeCategory}</div>
                <div style="color: var(--color-text-secondary); margin-top: 2px;">${prob.mistake_notes || prob.mistake || 'No additional note'}</div>
              </div>
            </div>
          ` : ''}

          <!-- Problem Notes -->
          <div>
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 4px;">
              Notes
            </div>
            <div style="background: var(--color-bg-base); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); font-size: 0.85rem; color: var(--color-text-secondary);">
              ${prob.notes || 'No general notes.'}
            </div>
          </div>

          ${prob.url ? `
            <div>
              <a href="${prob.url}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
                ${getIcon('externalLink')} Open on ${prob.platform}
              </a>
            </div>
          ` : ''}
        </div>

        <div class="modal-footer" style="justify-content: space-between;">
          <button type="button" class="btn btn-ghost btn-sm text-danger" id="btn-delete-problem">
            ${ICONS.trash} Delete
          </button>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-close-detail">Close</button>
            <button type="button" class="btn btn-primary" id="btn-attempt-problem">
              ${prob.status === 'Solved' ? 'Attempt Again' : 'Attempt / Solve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-close-detail').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('btn-toggle-bookmark-detail').onclick = () => {
    toggleDsaBookmark(problemId);
    openProblemDetailModal(problemId);
  };

  document.getElementById('btn-delete-problem').onclick = () => {
    if (confirm(`Delete "${prob.title || prob.name}" from your DSA tracker?`)) {
      deleteDsaProblem(problemId);
      closeModal();
    }
  };

  document.getElementById('btn-attempt-problem').onclick = () => {
    closeModal();
    openSolveDsaProblemModal(problemId, { isReattempt: prob.status === 'Solved' || prob.needs_revision });
  };
}

/**
 * SECTION 26 & 27: DSA Practice Session Modal
 * Live timer, target problems counter, session notes, saves to dsa_sessions and studySessions
 */
export function openStartDsaSessionModal() {
  initModalContainer();
  const allTopics = ['Mixed Practice', ...ALL_DSA_TOPICS];

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 520px;" id="dsa-session-modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${getIcon('clock', 'text-cyan')} Start DSA Practice Session</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <form id="start-session-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Practice Focus Topic</label>
              <select class="form-select" id="sess-topic-select">
                ${allTopics.map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Target Problems</label>
                <input type="number" class="form-input" id="sess-target-problems" value="3" min="1" max="20" required />
              </div>
              <div class="form-group">
                <label class="form-label">Target Duration (Minutes)</label>
                <input type="number" class="form-input" id="sess-target-duration" value="60" min="10" max="360" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Session Intent / Note</label>
              <input type="text" class="form-input" id="sess-intent-input" placeholder="e.g. Master sliding window boundary conditions." />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btn-launch-session">🚀 Start Session</button>
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

  document.getElementById('start-session-form').onsubmit = (e) => {
    e.preventDefault();
    const topic = document.getElementById('sess-topic-select').value;
    const targetProblems = parseInt(document.getElementById('sess-target-problems').value, 10) || 3;
    const targetDuration = parseInt(document.getElementById('sess-target-duration').value, 10) || 60;
    const intent = document.getElementById('sess-intent-input').value.trim();

    launchActiveSessionRunner(topic, targetProblems, targetDuration, intent);
  };
}

function launchActiveSessionRunner(topic, targetProblems, targetDuration, intent) {
  let elapsedSeconds = 0;
  let attemptedCount = 0;
  let solvedCount = 0;
  let sessionInterval = null;

  const contentBox = document.getElementById('dsa-session-modal-content');
  if (!contentBox) return;

  contentBox.innerHTML = `
    <div class="modal-header">
      <div>
        <h3 class="modal-title" style="color: var(--color-primary);">⚡ Active DSA Session: ${topic}</h3>
        <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 2px;">
          ${intent || 'Deep focus algorithmic problem solving.'}
        </div>
      </div>
      <button class="btn btn-ghost btn-icon" id="btn-close-session">${ICONS.x}</button>
    </div>
    <div class="modal-body" style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Timer -->
      <div style="text-align: center; padding: 18px; background: var(--color-bg-base); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">
          SESSION TIME ELAPSED
        </div>
        <div style="font-size: 2.4rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-accent-cyan); margin: 6px 0;" id="sess-timer-display">
          00:00
        </div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">
          Target: ${targetDuration} mins
        </div>
      </div>

      <!-- Problem Solved Counter -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center;">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">PROBLEMS ATTEMPTED</div>
          <div style="font-size: 1.8rem; font-weight: 800; font-family: var(--font-mono); margin: 4px 0;" id="sess-attempted-val">0</div>
          <div style="display: flex; justify-content: center; gap: 6px;">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-sess-add-attempt">+1 Attempt</button>
          </div>
        </div>

        <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center;">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">PROBLEMS SOLVED</div>
          <div style="font-size: 1.8rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-accent-emerald); margin: 4px 0;" id="sess-solved-val">0</div>
          <div style="display: flex; justify-content: center; gap: 6px;">
            <button type="button" class="btn btn-secondary btn-sm text-emerald" id="btn-sess-add-solve">+1 Solved</button>
          </div>
        </div>
      </div>

      <div class="form-group" style="margin-bottom: 0;">
        <label class="form-label">Session Notes / Takeaways</label>
        <textarea class="form-textarea" id="sess-final-notes" rows="2" placeholder="Concepts solidified, patterns recognized..."></textarea>
      </div>
    </div>

    <div class="modal-footer" style="justify-content: space-between;">
      <button type="button" class="btn btn-secondary" id="btn-cancel-session">Cancel</button>
      <button type="button" class="btn btn-primary" id="btn-finish-save-session">💾 Finish & Save Session</button>
    </div>
  `;

  const timerEl = document.getElementById('sess-timer-display');
  const attemptedEl = document.getElementById('sess-attempted-val');
  const solvedEl = document.getElementById('sess-solved-val');

  sessionInterval = setInterval(() => {
    elapsedSeconds++;
    const m = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const s = String(elapsedSeconds % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  }, 1000);

  document.getElementById('btn-sess-add-attempt').onclick = () => {
    attemptedCount++;
    attemptedEl.textContent = attemptedCount;
  };

  document.getElementById('btn-sess-add-solve').onclick = () => {
    solvedCount++;
    if (attemptedCount < solvedCount) {
      attemptedCount = solvedCount;
      attemptedEl.textContent = attemptedCount;
    }
    solvedEl.textContent = solvedCount;
  };

  const endSession = () => {
    if (sessionInterval) clearInterval(sessionInterval);
    closeModal();
  };

  document.getElementById('btn-close-session').onclick = endSession;
  document.getElementById('btn-cancel-session').onclick = endSession;

  document.getElementById('btn-finish-save-session').onclick = () => {
    if (sessionInterval) clearInterval(sessionInterval);
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const notes = document.getElementById('sess-final-notes').value.trim() || intent;

    saveDsaPracticeSession({
      topic,
      durationMinutes,
      targetProblems,
      problemsAttempted: attemptedCount,
      problemsSolved: solvedCount,
      notes
    });

    closeModal();
    alert(`🎉 DSA practice session recorded! Duration: ${durationMinutes}m, Solved: ${solvedCount} problems.`);
  };
}

/**
 * SECTION 36: CSV Import / Export Modal
 */
export function openDsaCsvModal() {
  initModalContainer();

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 560px;">
        <div class="modal-header">
          <h3 class="modal-title">${getIcon('fileText', 'text-cyan')} DSA Data CSV Import & Export</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <div class="modal-body" style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Export Section -->
          <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
            <h4 style="margin: 0 0 6px 0; font-size: 0.95rem;">Export DSA Problems</h4>
            <p style="margin: 0 0 10px 0; font-size: 0.8rem; color: var(--color-text-secondary);">
              Download your complete DSA problem catalog, notes, complexity analysis, and revision flags.
            </p>
            <button class="btn btn-secondary btn-sm" id="btn-download-dsa-csv">
              ${getIcon('download')} Download dsa_problems.csv
            </button>
          </div>

          <!-- Import Section -->
          <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
            <h4 style="margin: 0 0 6px 0; font-size: 0.95rem;">Import Problems from CSV</h4>
            <p style="margin: 0 0 10px 0; font-size: 0.8rem; color: var(--color-text-secondary);">
              Import problems from CSV. Duplicates by problem URL or Platform+Title will be automatically skipped.
            </p>
            <textarea class="form-textarea" id="dsa-csv-paste-input" rows="4" placeholder="Paste CSV text with headers: Problem, Platform, Topic, Difficulty, Status, TimeMinutes..."></textarea>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
              <input type="file" id="dsa-csv-file-input" accept=".csv,text/csv" style="font-size: 0.78rem;" />
              <button class="btn btn-primary btn-sm" id="btn-run-dsa-import">Import CSV</button>
            </div>
            <div id="dsa-import-report" style="display: none; margin-top: 10px; font-size: 0.8rem;"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-close-csv-modal">Close</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-close-csv-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  // Export Download
  document.getElementById('btn-download-dsa-csv').onclick = () => {
    const csvContent = exportDsaToCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dsa_problems_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import Action
  const fileInput = document.getElementById('dsa-csv-file-input');
  const pasteInput = document.getElementById('dsa-csv-paste-input');
  const reportBox = document.getElementById('dsa-import-report');

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        pasteInput.value = evt.target.result;
      };
      reader.readAsText(file);
    }
  };

  document.getElementById('btn-run-dsa-import').onclick = () => {
    const text = pasteInput.value.trim();
    if (!text) {
      alert('Please paste CSV text or select a file first.');
      return;
    }
    const res = importDsaFromCsv(text);
    reportBox.style.display = 'block';
    if (!res.success) {
      reportBox.innerHTML = `<span class="text-rose">⚠️ ${res.error}</span>`;
    } else {
      reportBox.innerHTML = `<span class="text-emerald">✅ Import complete! Added: ${res.importedCount} new problem(s). Skipped ${res.skippedDuplicates} duplicate(s).</span>`;
    }
  };
}

/**
 * SECTION 7: Set DSA Daily Target Modal
 */
export function openSetDsaTargetModal(date = null) {
  initModalContainer();
  const state = getState();
  const activeDate = date || state.user?.activeDate || '2026-10-01';
  const currentTarget = state.dsa_daily_targets?.[activeDate] || state.studySchedule?.dsaDailyTarget || 2;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">Set Daily DSA Target</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <form id="set-dsa-target-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Daily Target (Problems / Day)</label>
              <input type="number" class="form-input" id="dsa-target-input" value="${currentTarget}" min="1" max="15" required />
              <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px;">
                Recommended: 1–2 problems/day during weekdays, higher on weekends.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Update Target</button>
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

  document.getElementById('set-dsa-target-form').onsubmit = (e) => {
    e.preventDefault();
    const val = parseInt(document.getElementById('dsa-target-input').value, 10) || 2;
    setDsaDailyTarget(val, activeDate);
    closeModal();
  };
}

/**
 * SECTION 7: Task Skip Reason Modal
 * Options: College workload, Difficult topic, Time management, Technical issue, Procrastination, Personal reason, Other.
 * Never silently delete skipped tasks.
 */
export function openTaskSkipModal(taskId, taskTitle, dateStr, onConfirm) {
  initModalContainer();

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 460px;">
        <div class="modal-header">
          <h3 class="modal-title">Skip Task: ${taskTitle}</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.88rem; color: var(--color-text-secondary); margin-bottom: 12px;">
            Skipping preserves your streak integrity and tracks systemic blockers without guilt.
          </p>

          <div class="form-group">
            <label class="form-label">Primary Reason for Skipping</label>
            <select class="form-select" id="task-skip-reason-select">
              <option value="College workload">College workload</option>
              <option value="Difficult topic">Difficult topic</option>
              <option value="Time management">Time management</option>
              <option value="Technical issue">Technical issue</option>
              <option value="Procrastination">Procrastination</option>
              <option value="Personal reason">Personal reason</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Notes (Optional)</label>
            <input type="text" class="form-input" id="task-skip-notes" placeholder="e.g. Preparing for sudden tomorrow morning lab exam" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
          <button type="button" class="btn btn-danger" id="btn-confirm-task-skip">Confirm Skip</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('btn-confirm-task-skip').onclick = () => {
    const reason = document.getElementById('task-skip-reason-select').value;
    const notes = document.getElementById('task-skip-notes').value.trim();
    skipDailyTask(taskId, reason, notes);
    if (onConfirm) onConfirm();
    closeModal();
  };
}

/**
 * SECTIONS 28 & 29: Reschedule Task Modal with Overload Protection
 * Options: Reschedule to tomorrow, another date, move to next week, keep pending, delete (requires confirmation).
 */
export function openRescheduleTaskModal(taskId, taskTitle, currentDate, durationMinutes = 45, onConfirm = null) {
  initModalContainer();
  const state = getState();

  const curr = new Date(currentDate);
  const tomorrow = new Date(curr);
  tomorrow.setDate(tomorrow.getDate() + 1);
  let tomorrowStr = tomorrow.toISOString().split('T')[0];
  if (tomorrowStr < PROGRAM_START_DATE) tomorrowStr = PROGRAM_START_DATE;

  const nextWeek = new Date(curr);
  nextWeek.setDate(nextWeek.getDate() + 7);
  let nextWeekStr = nextWeek.toISOString().split('T')[0];
  if (nextWeekStr < PROGRAM_START_DATE) nextWeekStr = PROGRAM_START_DATE;

  const tomorrowBtnLabel = tomorrowStr === PROGRAM_START_DATE ? 'Start Date' : 'Tomorrow';

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">Reschedule Task</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <div class="modal-body">
          <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 4px;">${taskTitle}</div>
          <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 16px;">Current date: ${currentDate} · Duration: ${durationMinutes} mins</div>

          <!-- Overload Protection Banner -->
          <div id="overload-warning-banner" style="display: none; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: var(--radius-md); padding: 12px; margin-bottom: 16px;">
            <div style="font-weight: 700; color: var(--color-accent-amber); font-size: 0.85rem;" id="overload-warning-title">⚠️ Overload Alert</div>
            <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 4px;" id="overload-warning-text"></div>
          </div>

          <div class="form-group">
            <label class="form-label">Choose Target Date</label>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-quick-tomorrow">${tomorrowBtnLabel} (${tomorrowStr})</button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-quick-next-week">Next Week (${nextWeekStr})</button>
            </div>
            <input type="date" class="form-input" id="reschedule-date-input" min="${PROGRAM_START_DATE}" value="${tomorrowStr}" />
          </div>

          <div style="border-top: 1px solid var(--color-border); padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <button type="button" class="btn btn-ghost btn-sm text-rose" id="btn-delete-task-action" style="color: var(--color-accent-rose);">
              ${ICONS.trash} Delete Task
            </button>
            <button type="button" class="btn btn-ghost btn-sm" id="btn-keep-pending">Keep Pending</button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-confirm-reschedule">Confirm Reschedule</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  const dateInput = document.getElementById('reschedule-date-input');
  const banner = document.getElementById('overload-warning-banner');
  const warningText = document.getElementById('overload-warning-text');

  const checkDateOverload = (dStr) => {
    const check = checkDayOverload(dStr, durationMinutes);
    if (check.isOverloaded) {
      banner.style.display = 'block';
      warningText.innerText = `Your selected day already has ${check.plannedHours} hours planned (Schedule Target: ${check.targetHours} hours). You can still keep it anyway or reduce optional tasks.`;
    } else {
      banner.style.display = 'none';
    }
  };

  checkDateOverload(tomorrowStr);

  dateInput.onchange = (e) => checkDateOverload(e.target.value);
  document.getElementById('btn-quick-tomorrow').onclick = () => {
    dateInput.value = tomorrowStr;
    checkDateOverload(tomorrowStr);
  };
  document.getElementById('btn-quick-next-week').onclick = () => {
    dateInput.value = nextWeekStr;
    checkDateOverload(nextWeekStr);
  };

  document.getElementById('btn-keep-pending').onclick = () => {
    updateState(curr => {
      const updated = (curr.dailyTasks || curr.daily_tasks || []).map(t => {
        if (t.id === taskId) {
          return { ...t, status: 'Not Started', notes: 'Kept pending' };
        }
        return t;
      });
      return { ...curr, dailyTasks: updated, daily_tasks: updated };
    });
    if (onConfirm) onConfirm();
    closeModal();
  };

  // Section 28: Deletion requires confirmation
  document.getElementById('btn-delete-task-action').onclick = () => {
    if (confirm(`Are you sure you want to permanently delete "${taskTitle}"? This cannot be undone.`)) {
      updateState(curr => {
        const filtered = (curr.dailyTasks || curr.daily_tasks || []).filter(t => t.id !== taskId);
        return { ...curr, dailyTasks: filtered, daily_tasks: filtered };
      });
      if (onConfirm) onConfirm();
      closeModal();
    }
  };

  document.getElementById('btn-confirm-reschedule').onclick = () => {
    const targetDate = dateInput.value;
    rescheduleDailyTask(taskId, targetDate);
    if (onConfirm) onConfirm();
    closeModal();
  };
}

/**
 * SECTION 20: End-of-Day Review Modal
 * Summary: Study time, tasks, DSA, Prime 3.0, Individual, Project.
 * Rating: Productive, Normal, Difficult.
 * "What should I improve tomorrow?" saved permanently.
 */
export function openDailyReviewModal(dateString = null, onSaved = null) {
  initModalContainer();
  const state = getState();
  const activeDate = dateString || state.user?.activeDate || '2026-10-01';
  const info = getMonthAndWeekInfo(activeDate, state);

  // Auto-calculated actual metrics for activeDate
  const allTasks = (state.dailyTasks || state.daily_tasks || []).filter(t => t.date === activeDate);
  const tasksCompleted = allTasks.filter(t => t.completed).length;

  let totalMinutes = 0;
  (state.studySessions || []).filter(s => s.date === activeDate).forEach(s => {
    totalMinutes += (s.durationMinutes || 0);
  });
  const studyHours = (totalMinutes / 60).toFixed(1);
  const targetHours = info.targetHours;

  const dsaSolved = (state.dsaProblems || []).filter(p => p.date === activeDate && p.status === 'Solved').length;
  const dsaTarget = state.studySchedule?.dsaDailyTarget || 2;

  const primeCompleted = allTasks.some(t => t.section === 'PRIME 3.0' && t.completed) ||
    ((state.habitLogs || {})[activeDate]?.['h-prime']?.status === 'Completed');
  const indivCompleted = allTasks.some(t => t.section === 'INDIVIDUAL LEARNING' && t.completed) ||
    ((state.habitLogs || {})[activeDate]?.['h-indiv']?.status === 'Completed');
  const projectCompleted = allTasks.some(t => t.section === 'PROJECT' && t.completed) ||
    ((state.habitLogs || {})[activeDate]?.['h-project']?.status === 'Completed');

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 560px;">
        <div class="modal-header">
          <h3 class="modal-title">End-of-Day Review · ${activeDate}</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <form id="daily-review-form">
          <div class="modal-body">
            <!-- Day Complete Summary Grid -->
            <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border); margin-bottom: 16px;">
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; margin-bottom: 8px;">
                DAY COMPLETE SUMMARY
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 0.82rem;">
                <div>Study Time: <strong class="font-mono text-cyan">${studyHours} / ${targetHours}h</strong></div>
                <div>Tasks: <strong class="font-mono text-emerald">${tasksCompleted} / ${allTasks.length}</strong></div>
                <div>DSA Solved: <strong class="font-mono text-amber">${dsaSolved} / ${dsaTarget}</strong></div>
                <div>Prime 3.0: <strong>${primeCompleted ? '✓ Completed' : 'Not completed'}</strong></div>
                <div>Individual: <strong>${indivCompleted ? '✓ Completed' : 'Not completed'}</strong></div>
                <div>Project: <strong>${projectCompleted ? '✓ Completed' : 'Not completed'}</strong></div>
              </div>
            </div>

            <!-- Rating -->
            <div class="form-group">
              <label class="form-label">How was today?</label>
              <div style="display: flex; gap: 12px;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.88rem;">
                  <input type="radio" name="day-rating" value="Productive" checked />
                  <span>🚀 Productive</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.88rem;">
                  <input type="radio" name="day-rating" value="Normal" />
                  <span>⚖️ Normal</span>
                </label>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.88rem;">
                  <input type="radio" name="day-rating" value="Difficult" />
                  <span>🌧️ Difficult</span>
                </label>
              </div>
            </div>

            <!-- Improvement Text -->
            <div class="form-group">
              <label class="form-label">What should I improve tomorrow?</label>
              <textarea class="form-textarea" id="daily-review-improvements" rows="3" placeholder="Actionable adjustment for tomorrow: sleep schedule, earlier start, cleaner pointer arithmetic..." required></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Daily Review</button>
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

  document.getElementById('daily-review-form').onsubmit = (e) => {
    e.preventDefault();
    const ratingRadio = document.querySelector('input[name="day-rating"]:checked');
    const rating = ratingRadio ? ratingRadio.value : 'Productive';
    const improvements = document.getElementById('daily-review-improvements').value.trim();

    const reviewRecord = {
      id: `drev-${activeDate}`,
      date: activeDate,
      studyHours: parseFloat(studyHours),
      targetHours,
      tasksCompleted,
      totalTasks: allTasks.length,
      dsaSolved,
      dsaTarget,
      primeCompleted,
      individualCompleted: indivCompleted,
      projectCompleted,
      rating,
      improvements,
      savedAt: new Date().toISOString()
    };

    updateState(curr => {
      const prev = (curr.daily_reviews || curr.dailyReviews || []).filter(r => r.date !== activeDate);
      return {
        ...curr,
        daily_reviews: [reviewRecord, ...prev],
        dailyReviews: [reviewRecord, ...prev]
      };
    });

    alert("🌟 Daily Review saved successfully!");
    if (onSaved) onSaved();
    closeModal();
  };
}

/**
 * SECTION 19: Revision Review Modal
 * When revised: Mark Revised, Still Difficult, Understood.
 * If still difficult, auto-schedules another revision +2 days.
 */
export function openRevisionReviewModal(revisionId, onSave = null) {
  initModalContainer();
  const state = getState();
  const item = (state.revisionItems || []).find(r => r.id === revisionId);
  if (!item) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 480px;">
        <div class="modal-header">
          <h3 class="modal-title">Revision Review</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <div class="modal-body">
          <div style="font-weight: 700; font-size: 1rem; margin-bottom: 4px;">${item.title}</div>
          <div style="font-size: 0.8rem; color: var(--color-primary); margin-bottom: 10px;">Source: ${item.source} · Topic: ${item.topic}</div>
          <div style="background: var(--color-bg-base); padding: 10px; border-radius: var(--radius-sm); font-size: 0.82rem; margin-bottom: 16px;">
            ${item.notes || 'Review core syntax, formulas, and edge cases.'}
          </div>

          <div class="form-group">
            <label class="form-label">Assessment</label>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <button type="button" class="btn btn-secondary" id="btn-rev-understood" style="justify-content: flex-start; text-align: left;">
                <div>
                  <div style="font-weight: 600;">✅ Understood</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">Concept is solid. Mark revision completed.</div>
                </div>
              </button>
              <button type="button" class="btn btn-secondary" id="btn-rev-revised" style="justify-content: flex-start; text-align: left;">
                <div>
                  <div style="font-weight: 600;">📖 Revised</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">Reviewed notes and sample code. Increments review count.</div>
                </div>
              </button>
              <button type="button" class="btn btn-secondary" id="btn-rev-difficult" style="justify-content: flex-start; text-align: left;">
                <div>
                  <div style="font-weight: 600; color: var(--color-accent-amber);">⚠️ Still Difficult</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">Still confusing. Automatically schedules next revision in 2 days.</div>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Close</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  const handleAssessment = (statusVal, isDifficult = false) => {
    updateState(curr => {
      const items = (curr.revisionItems || []).map(r => {
        if (r.id === revisionId) {
          if (isDifficult) {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + 2);
            return {
              ...r,
              status: 'Due this week',
              dueDate: nextDate.toISOString().split('T')[0],
              reviewCount: (r.reviewCount || 0) + 1,
              lastReviewed: new Date().toISOString().split('T')[0],
              notes: `${r.notes} [Still Difficult: rescheduled]`
            };
          } else {
            return {
              ...r,
              status: 'Completed',
              lastReviewed: new Date().toISOString().split('T')[0],
              reviewCount: (r.reviewCount || 0) + 1
            };
          }
        }
        return r;
      });
      return { ...curr, revisionItems: items };
    });
    if (onSave) onSave();
    closeModal();
  };

  document.getElementById('btn-rev-understood').onclick = () => handleAssessment('Completed', false);
  document.getElementById('btn-rev-revised').onclick = () => handleAssessment('Completed', false);
  document.getElementById('btn-rev-difficult').onclick = () => handleAssessment('Due this week', true);
}

/**
 * SECTION 10: Habit Detail Modal (25%, 50%, 75%, 100%, Skipped)
 */
export function openHabitDetailModal(habitId, habitName, dateString, currentLog = {}, onSave = null) {
  initModalContainer();

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 440px;">
        <div class="modal-header">
          <h3 class="modal-title">Track Habit: ${habitName}</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <div class="modal-body">
          <div style="font-size: 0.82rem; color: var(--color-text-secondary); margin-bottom: 14px;">
            Select completion status for ${dateString}:
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
            <button type="button" class="btn btn-secondary habit-choice-btn" data-status="Completed" data-pct="100">
              ✅ 100% Completed
            </button>
            <button type="button" class="btn btn-secondary habit-choice-btn" data-status="Partially completed" data-pct="75">
              📊 75% Partial
            </button>
            <button type="button" class="btn btn-secondary habit-choice-btn" data-status="Partially completed" data-pct="50">
              📊 50% Partial
            </button>
            <button type="button" class="btn btn-secondary habit-choice-btn" data-status="Partially completed" data-pct="25">
              📊 25% Partial
            </button>
          </div>

          <div class="form-group">
            <label class="form-label">Notes (Optional)</label>
            <input type="text" class="form-input" id="habit-notes-input" value="${currentLog.notes || ''}" placeholder="Session reflections, links, or details" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-ghost text-rose" id="btn-habit-skip-action">Skip Habit</button>
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  modalContainer.querySelectorAll('.habit-choice-btn').forEach(btn => {
    btn.onclick = () => {
      const status = btn.getAttribute('data-status');
      const percentage = parseInt(btn.getAttribute('data-pct'), 10);
      const notes = document.getElementById('habit-notes-input').value.trim();

      updateState(curr => {
        const logs = { ...(curr.habitLogs || curr.habit_logs || {}) };
        if (!logs[dateString]) logs[dateString] = {};
        logs[dateString][habitId] = {
          status,
          percentage,
          notes,
          updatedAt: new Date().toISOString()
        };
        return { ...curr, habitLogs: logs, habit_logs: logs };
      });

      if (onSave) onSave();
      closeModal();
    };
  });

  document.getElementById('btn-habit-skip-action').onclick = () => {
    closeModal();
    openHabitSkipReasonModal(habitId, habitName, dateString, (reason, notes) => {
      updateState(curr => {
        const logs = { ...(curr.habitLogs || curr.habit_logs || {}) };
        if (!logs[dateString]) logs[dateString] = {};
        logs[dateString][habitId] = {
          status: 'Skipped',
          percentage: 0,
          skipReason: reason,
          notes,
          updatedAt: new Date().toISOString()
        };
        return { ...curr, habitLogs: logs, habit_logs: logs };
      });
      if (onSave) onSave();
    });
  };
}

/**
 * Phase 6 - Comprehensive Project Modals
 * Supports Projects, Tasks, Milestones, Features, Goals, Quality Check, Live Sessions, Ideas & CSV Export
 */

export function openAddProjectModal() {
  openNewProjectModal();
}

export function openNewProjectModal(onCreated = null) {
  initModalContainer();
  const state = getState();
  const activeCount = (state.projects || []).filter(p => ['Planned', 'Building', 'Testing'].includes(p.status)).length;
  const maxActive = state.max_active_projects || 2;
  const defaultDate = state.activeDate || new Date().toISOString().split('T')[0];

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 680px; max-height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('projects', 'text-purple')}
            <h3 class="modal-title">New Career Project</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="new-project-form" style="display: flex; flex-direction: column; overflow-y: auto; flex: 1;">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            ${activeCount >= maxActive ? `
              <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid var(--color-accent-amber); padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.8rem; color: var(--color-accent-amber); display: flex; align-items: flex-start; gap: 8px;">
                <span>⚠️</span>
                <div>
                  <strong>Active Projects Warning:</strong> You currently have ${activeCount} active projects (Limit: ${maxActive}).
                  Focusing on 1-2 projects at a time ensures depth and prevents burnout. You can still proceed if needed!
                </div>
              </div>
            ` : ''}

            <!-- Project Name -->
            <div class="form-group">
              <label class="form-label">Project Name *</label>
              <input type="text" class="form-input" id="p-name" placeholder="e.g. Distributed Key-Value Store or Vision Classifier" required />
            </div>

            <!-- Short Description -->
            <div class="form-group">
              <label class="form-label">Short Description</label>
              <input type="text" class="form-input" id="p-short-desc" placeholder="One-line summary for cards & recruiters" />
            </div>

            <!-- Type & Category -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Project Type (Section 4)</label>
                <select class="form-select" id="p-type">
                  ${PROJECT_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Category (Section 1)</label>
                <select class="form-select" id="p-category">
                  ${PHASE6_PROJECT_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Difficulty & Priority -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Difficulty (Section 5)</label>
                <select class="form-select" id="p-difficulty">
                  ${PROJECT_DIFFICULTIES.map(d => `<option value="${d}" ${d === 'Intermediate' ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Project Priority</label>
                <select class="form-select" id="p-priority">
                  ${TASK_PRIORITIES.map(p => `<option value="${p}" ${p === 'High' ? 'selected' : ''}>${p}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Portfolio Priority</label>
                <select class="form-select" id="p-port-priority">
                  ${PORTFOLIO_PRIORITIES.map(p => `<option value="${p}" ${p === 'High' ? 'selected' : ''}>${p}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Start & Target Date & Status -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="date" class="form-input" id="p-start-date" value="${defaultDate}" />
              </div>
              <div class="form-group">
                <label class="form-label">Target Date</label>
                <input type="date" class="form-input" id="p-target-date" value="${defaultDate}" />
              </div>
              <div class="form-group">
                <label class="form-label">Status (Section 2)</label>
                <select class="form-select" id="p-status">
                  ${PROJECT_STATUSES.map(s => `<option value="${s}" ${s === 'Planned' ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Link to Roadmap Placeholder -->
            <div class="form-group">
              <label class="form-label">Link to Roadmap Placeholder (Section 45)</label>
              <select class="form-select" id="p-roadmap-topic">
                <option value="">-- None (Independent Project) --</option>
                ${ROADMAP_PROJECT_PLACEHOLDERS.map(ph => `<option value="${ph.topicId}">${ph.title} (${ph.category})</option>`).join('')}
              </select>
            </div>

            <!-- Technologies -->
            <div class="form-group">
              <label class="form-label">Technologies (comma separated)</label>
              <input type="text" class="form-input" id="p-tech" placeholder="e.g. Python, FastAPI, PyTorch, Docker, PostgreSQL" />
            </div>

            <!-- Detailed Specifications (Collapsible / Optional) -->
            <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border); display: flex; flex-direction: column; gap: 10px;">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">
                Design & Engineering Specifications (Optional)
              </div>
              <div class="form-group">
                <label class="form-label">Problem Statement</label>
                <textarea class="form-textarea" id="p-problem" rows="2" placeholder="What specific engineering challenge or bottleneck is solved?"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Goal & Target Metric</label>
                <input type="text" class="form-input" id="p-goal" placeholder="e.g. Handle 10k req/s with sub-20ms latency" />
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                  <label class="form-label">Target Users</label>
                  <input type="text" class="form-input" id="p-users" placeholder="e.g. ML Engineers, Recruiters" />
                </div>
                <div class="form-group">
                  <label class="form-label">Expected Outcome</label>
                  <input type="text" class="form-input" id="p-outcome" placeholder="e.g. Production microservice" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Notes</label>
                <textarea class="form-textarea" id="p-notes" rows="2" placeholder="Additional implementation notes..."></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">${getIcon('plus')} Create Project</button>
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

  document.getElementById('new-project-form').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('p-name').value.trim();
    if (!name) return;

    const data = {
      name,
      short_description: document.getElementById('p-short-desc').value.trim(),
      description: document.getElementById('p-short-desc').value.trim(),
      type: document.getElementById('p-type').value,
      category: document.getElementById('p-category').value,
      difficulty: document.getElementById('p-difficulty').value,
      priority: document.getElementById('p-priority').value,
      portfolio_priority: document.getElementById('p-port-priority').value,
      start_date: document.getElementById('p-start-date').value,
      target_date: document.getElementById('p-target-date').value,
      status: document.getElementById('p-status').value,
      roadmap_topic_id: document.getElementById('p-roadmap-topic').value || null,
      technology: document.getElementById('p-tech').value.trim(),
      problem_statement: document.getElementById('p-problem').value.trim(),
      goal: document.getElementById('p-goal').value.trim(),
      target_users: document.getElementById('p-users').value.trim(),
      expected_outcome: document.getElementById('p-outcome').value.trim(),
      notes: document.getElementById('p-notes').value.trim()
    };

    const result = createProject(data);
    closeModal();
    if (onCreated) onCreated(result.project);
    else {
      // Re-render if on projects page
      window.dispatchEvent(new CustomEvent('project-state-updated', { detail: { projectId: result.project.id } }));
    }
  };
}

export function openEditProjectModal(projectId, onUpdated = null) {
  initModalContainer();
  const project = getProjectById(projectId);
  if (!project) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 680px; max-height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('edit', 'text-purple')}
            <h3 class="modal-title">Edit Project: ${project.name}</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="edit-project-form" style="display: flex; flex-direction: column; overflow-y: auto; flex: 1;">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Project Name *</label>
              <input type="text" class="form-input" id="ep-name" value="${project.name || ''}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Short Description</label>
              <input type="text" class="form-input" id="ep-short-desc" value="${project.short_description || project.description || ''}" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Project Type</label>
                <select class="form-select" id="ep-type">
                  ${PROJECT_TYPES.map(t => `<option value="${t}" ${t === project.type ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-select" id="ep-category">
                  ${PHASE6_PROJECT_CATEGORIES.map(c => `<option value="${c}" ${c === project.category ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Difficulty (Section 5)</label>
                <select class="form-select" id="ep-difficulty">
                  ${PROJECT_DIFFICULTIES.map(d => `<option value="${d}" ${d === project.difficulty ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Priority</label>
                <select class="form-select" id="ep-priority">
                  ${TASK_PRIORITIES.map(p => `<option value="${p}" ${p === (project.priority || 'Normal') ? 'selected' : ''}>${p}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Portfolio Priority</label>
                <select class="form-select" id="ep-port-priority">
                  ${PORTFOLIO_PRIORITIES.map(p => `<option value="${p}" ${p === (project.portfolio_priority || 'Medium') ? 'selected' : ''}>${p}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="date" class="form-input" id="ep-start-date" value="${project.start_date || project.startDate || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Target Date</label>
                <input type="date" class="form-input" id="ep-target-date" value="${project.target_date || project.deadline || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Status (Section 2)</label>
                <select class="form-select" id="ep-status">
                  ${PROJECT_STATUSES.map(s => `<option value="${s}" ${s === project.status ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Link to Roadmap Placeholder</label>
              <select class="form-select" id="ep-roadmap-topic">
                <option value="">-- None (Independent Project) --</option>
                ${ROADMAP_PROJECT_PLACEHOLDERS.map(ph => `<option value="${ph.topicId}" ${ph.topicId === project.roadmap_topic_id ? 'selected' : ''}>${ph.title} (${ph.category})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Technologies</label>
              <input type="text" class="form-input" id="ep-tech" value="${project.technology || ''}" />
            </div>

            <div class="form-group">
              <label class="form-label">Problem Statement</label>
              <textarea class="form-textarea" id="ep-problem" rows="2">${project.problem_statement || ''}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Goal</label>
              <input type="text" class="form-input" id="ep-goal" value="${project.goal || ''}" />
            </div>

            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea class="form-textarea" id="ep-notes" rows="2">${project.notes || ''}</textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
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

  document.getElementById('edit-project-form').onsubmit = (e) => {
    e.preventDefault();
    const updates = {
      name: document.getElementById('ep-name').value.trim(),
      short_description: document.getElementById('ep-short-desc').value.trim(),
      description: document.getElementById('ep-short-desc').value.trim(),
      type: document.getElementById('ep-type').value,
      category: document.getElementById('ep-category').value,
      difficulty: document.getElementById('ep-difficulty').value,
      priority: document.getElementById('ep-priority').value,
      portfolio_priority: document.getElementById('ep-port-priority').value,
      start_date: document.getElementById('ep-start-date').value,
      target_date: document.getElementById('ep-target-date').value,
      status: document.getElementById('ep-status').value,
      roadmap_topic_id: document.getElementById('ep-roadmap-topic').value || null,
      technology: document.getElementById('ep-tech').value.trim(),
      problem_statement: document.getElementById('ep-problem').value.trim(),
      goal: document.getElementById('ep-goal').value.trim(),
      notes: document.getElementById('ep-notes').value.trim()
    };

    const updated = updateProject(projectId, updates);
    closeModal();
    if (onUpdated) onUpdated(updated);
    window.dispatchEvent(new CustomEvent('project-state-updated', { detail: { projectId } }));
  };
}

export function openProjectTaskModal(projectId, existingTask = null, onSaved = null) {
  initModalContainer();
  const project = getProjectById(projectId);
  if (!project) return;

  const isEdit = !!existingTask;
  const milestones = project.milestones || [];
  const features = project.features || [];
  const defaultDate = getState().activeDate || new Date().toISOString().split('T')[0];

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 540px;">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit Project Task' : 'Add Project Task'}</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <form id="project-task-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Task Title *</label>
              <input type="text" class="form-input" id="pt-title" value="${existingTask ? existingTask.title : ''}" placeholder="e.g. Implement O(1) block coalescence" required />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-textarea" id="pt-desc" rows="2" placeholder="Implementation steps, test conditions, etc.">${existingTask ? existingTask.description : ''}</textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Milestone (Optional)</label>
                <select class="form-select" id="pt-milestone">
                  <option value="">-- No Milestone --</option>
                  ${milestones.map(m => `<option value="${m.id}" ${existingTask?.milestone_id === m.id ? 'selected' : ''}>${m.title}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Feature (Optional)</label>
                <select class="form-select" id="pt-feature">
                  <option value="">-- No Feature --</option>
                  ${features.map(f => `<option value="${f.id}" ${existingTask?.feature_id === f.id ? 'selected' : ''}>${f.name}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select" id="pt-status">
                  ${TASK_STATUSES.map(s => `<option value="${s}" ${existingTask?.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Priority</label>
                <select class="form-select" id="pt-priority">
                  ${TASK_PRIORITIES.map(p => `<option value="${p}" ${existingTask?.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Estimated Hours</label>
                <input type="number" step="0.5" class="form-input" id="pt-est-hours" value="${existingTask ? existingTask.estimated_hours : 2}" />
              </div>
              <div class="form-group">
                <label class="form-label">Actual Hours</label>
                <input type="number" step="0.5" class="form-input" id="pt-act-hours" value="${existingTask ? existingTask.actual_hours : 0}" />
              </div>
              <div class="form-group">
                <label class="form-label">Due Date</label>
                <input type="date" class="form-input" id="pt-due-date" value="${existingTask ? (existingTask.due_date || defaultDate) : defaultDate}" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Save Task' : 'Add Task'}</button>
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

  document.getElementById('project-task-form').onsubmit = (e) => {
    e.preventDefault();
    const title = document.getElementById('pt-title').value.trim();
    if (!title) return;

    const data = {
      title,
      description: document.getElementById('pt-desc').value.trim(),
      milestone_id: document.getElementById('pt-milestone').value || null,
      feature_id: document.getElementById('pt-feature').value || null,
      status: document.getElementById('pt-status').value,
      priority: document.getElementById('pt-priority').value,
      estimated_hours: parseFloat(document.getElementById('pt-est-hours').value) || 2,
      actual_hours: parseFloat(document.getElementById('pt-act-hours').value) || 0,
      due_date: document.getElementById('pt-due-date').value
    };

    if (isEdit) {
      updateProjectTask(projectId, existingTask.id, data);
    } else {
      addProjectTask(projectId, data);
    }

    closeModal();
    if (onSaved) onSaved();
    window.dispatchEvent(new CustomEvent('project-state-updated', { detail: { projectId } }));
  };
}

export function openMilestoneModal(projectId, existingMilestone = null, onSaved = null) {
  initModalContainer();
  const isEdit = !!existingMilestone;
  const defaultDate = getState().activeDate || new Date().toISOString().split('T')[0];

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 480px;">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit Milestone' : 'Add Milestone'}</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <form id="milestone-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Milestone Title *</label>
              <input type="text" class="form-input" id="ms-title" value="${existingMilestone ? existingMilestone.title : ''}" placeholder="e.g. Milestone 2: Backend REST Service" required />
            </div>
            <div class="form-group">
              <label class="form-label">Target Date</label>
              <input type="date" class="form-input" id="ms-date" value="${existingMilestone ? existingMilestone.target_date : defaultDate}" />
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-select" id="ms-status">
                <option value="Planned" ${existingMilestone?.status === 'Planned' ? 'selected' : ''}>Planned</option>
                <option value="In Progress" ${existingMilestone?.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Completed" ${existingMilestone?.status === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Progress %</label>
              <input type="number" min="0" max="100" class="form-input" id="ms-progress" value="${existingMilestone ? (existingMilestone.progress || 0) : 0}" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Milestone</button>
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

  document.getElementById('milestone-form').onsubmit = (e) => {
    e.preventDefault();
    const title = document.getElementById('ms-title').value.trim();
    if (!title) return;

    const data = {
      title,
      target_date: document.getElementById('ms-date').value,
      status: document.getElementById('ms-status').value,
      progress: parseInt(document.getElementById('ms-progress').value, 10) || 0
    };

    if (isEdit) {
      updateProjectMilestone(projectId, existingMilestone.id, data);
    } else {
      addProjectMilestone(projectId, data);
    }

    closeModal();
    if (onSaved) onSaved();
    window.dispatchEvent(new CustomEvent('project-state-updated', { detail: { projectId } }));
  };
}

export function openFeatureModal(projectId, existingFeature = null, onSaved = null) {
  initModalContainer();
  const isEdit = !!existingFeature;
  const project = getProjectById(projectId);
  const milestones = project?.milestones || [];

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 480px;">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit Feature' : 'Add Feature'}</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <form id="feature-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Feature Name *</label>
              <input type="text" class="form-input" id="feat-name" value="${existingFeature ? existingFeature.name : ''}" placeholder="e.g. Authentication, Chat Interface" required />
            </div>
            <div class="form-group">
              <label class="form-label">Milestone</label>
              <select class="form-select" id="feat-ms">
                <option value="">-- None --</option>
                ${milestones.map(m => `<option value="${m.id}" ${existingFeature?.milestone_id === m.id ? 'selected' : ''}>${m.title}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-select" id="feat-status">
                <option value="Not Started" ${existingFeature?.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                <option value="In Progress" ${existingFeature?.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Completed" ${existingFeature?.status === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Feature</button>
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

  document.getElementById('feature-form').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('feat-name').value.trim();
    if (!name) return;

    const data = {
      name,
      milestone_id: document.getElementById('feat-ms').value || null,
      status: document.getElementById('feat-status').value
    };

    if (isEdit) {
      updateProjectFeature(projectId, existingFeature.id, data);
    } else {
      addProjectFeature(projectId, data);
    }

    closeModal();
    if (onSaved) onSaved();
    window.dispatchEvent(new CustomEvent('project-state-updated', { detail: { projectId } }));
  };
}

export function openGoalModal(projectId, existingGoal = null, onSaved = null) {
  initModalContainer();
  const isEdit = !!existingGoal;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 480px;">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit Goal' : 'Add Project Goal'}</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <form id="goal-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Goal Name *</label>
              <input type="text" class="form-input" id="g-name" value="${existingGoal ? existingGoal.name : ''}" placeholder="e.g. Build a working AI chatbot" required />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea class="form-textarea" id="g-desc" rows="2">${existingGoal ? existingGoal.description : ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-select" id="g-status">
                <option value="Not Started" ${existingGoal?.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                <option value="In Progress" ${existingGoal?.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Completed" ${existingGoal?.status === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Progress %</label>
              <input type="number" min="0" max="100" class="form-input" id="g-progress" value="${existingGoal ? (existingGoal.progress || 0) : 0}" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Goal</button>
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

  document.getElementById('goal-form').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('g-name').value.trim();
    if (!name) return;

    const data = {
      name,
      description: document.getElementById('g-desc').value.trim(),
      status: document.getElementById('g-status').value,
      progress: parseInt(document.getElementById('g-progress').value, 10) || 0
    };

    if (isEdit) {
      updateProjectGoal(projectId, existingGoal.id, data);
    } else {
      addProjectGoal(projectId, data);
    }

    closeModal();
    if (onSaved) onSaved();
    window.dispatchEvent(new CustomEvent('project-state-updated', { detail: { projectId } }));
  };
}

/**
 * Start Project Session Modal with Interactive Live Timer & Manual Entry (Section 18, 19)
 */
export function openStartProjectSessionModal(defaultProjectId = null, defaultTaskId = null, onSaved = null) {
  initModalContainer();
  const state = getState();
  const projects = (state.projects || []).filter(p => p.status !== 'Archived');

  let selectedProjId = defaultProjectId || projects[0]?.id || '';
  let selectedProj = getProjectById(selectedProjId);

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 540px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('projects', 'text-purple')}
            <h3 class="modal-title">Start Project Session</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Project Selection -->
          <div class="form-group">
            <label class="form-label">Select Project *</label>
            <select class="form-select" id="sess-proj-select">
              ${projects.map(p => `<option value="${p.id}" ${p.id === selectedProjId ? 'selected' : ''}>${p.name} (${p.status})</option>`).join('')}
            </select>
          </div>

          <!-- Milestone & Task Selection -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Milestone</label>
              <select class="form-select" id="sess-ms-select">
                <option value="">-- Entire Project --</option>
                ${(selectedProj?.milestones || []).map(m => `<option value="${m.id}">${m.title}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Task</label>
              <select class="form-select" id="sess-task-select">
                <option value="">-- General Implementation --</option>
                ${(selectedProj?.tasks || []).map(t => `<option value="${t.id}" ${t.id === defaultTaskId ? 'selected' : ''}>${t.title}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Live Interactive Stopwatch Timer -->
          <div style="background: var(--color-bg-base); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--color-border); text-align: center;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 6px;">
              Session Stopwatch
            </div>
            <div id="sess-timer-display" style="font-family: var(--font-mono); font-size: 2.2rem; font-weight: 800; color: var(--color-accent-purple); margin: 6px 0;">
              00:00:00
            </div>
            <div style="display: flex; justify-content: center; gap: 8px; margin-top: 10px;">
              <button class="btn btn-primary btn-sm" id="btn-timer-start">${getIcon('check')} Start</button>
              <button class="btn btn-secondary btn-sm" id="btn-timer-pause" style="display: none;">Pause</button>
              <button class="btn btn-accent btn-sm" id="btn-timer-resume" style="display: none;">Resume</button>
              <button class="btn btn-ghost btn-sm" id="btn-timer-reset" style="display: none;">Reset</button>
            </div>
          </div>

          <!-- Manual Time Entry Option -->
          <div class="form-group">
            <label class="form-label">Or Manual Duration (Minutes)</label>
            <input type="number" min="1" max="600" class="form-input" id="sess-manual-mins" value="45" />
          </div>

          <!-- Session Notes -->
          <div class="form-group">
            <label class="form-label">Session Notes</label>
            <textarea class="form-textarea" id="sess-notes" rows="2" placeholder="What parts did you code, debug or test?"></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-save-session">Log Project Session</button>
        </div>
      </div>
    </div>
  `;

  let timerInterval = null;
  let elapsedSeconds = 0;
  let timerRunning = false;

  const timerDisplay = document.getElementById('sess-timer-display');
  const btnStart = document.getElementById('btn-timer-start');
  const btnPause = document.getElementById('btn-timer-pause');
  const btnResume = document.getElementById('btn-timer-resume');
  const btnReset = document.getElementById('btn-timer-reset');
  const manualMinsInput = document.getElementById('sess-manual-mins');

  function updateTimerText() {
    const hrs = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(elapsedSeconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${hrs}:${mins}:${secs}`;
    manualMinsInput.value = Math.max(1, Math.round(elapsedSeconds / 60));
  }

  btnStart.onclick = () => {
    timerRunning = true;
    btnStart.style.display = 'none';
    btnPause.style.display = 'inline-flex';
    btnReset.style.display = 'inline-flex';
    timerInterval = setInterval(() => {
      elapsedSeconds++;
      updateTimerText();
    }, 1000);
  };

  btnPause.onclick = () => {
    clearInterval(timerInterval);
    timerRunning = false;
    btnPause.style.display = 'none';
    btnResume.style.display = 'inline-flex';
  };

  btnResume.onclick = () => {
    timerRunning = true;
    btnResume.style.display = 'none';
    btnPause.style.display = 'inline-flex';
    timerInterval = setInterval(() => {
      elapsedSeconds++;
      updateTimerText();
    }, 1000);
  };

  btnReset.onclick = () => {
    clearInterval(timerInterval);
    elapsedSeconds = 0;
    timerRunning = false;
    updateTimerText();
    btnStart.style.display = 'inline-flex';
    btnPause.style.display = 'none';
    btnResume.style.display = 'none';
    btnReset.style.display = 'none';
  };

  // Change project dropdown handler
  document.getElementById('sess-proj-select').onchange = (e) => {
    selectedProjId = e.target.value;
    selectedProj = getProjectById(selectedProjId);
    const msSelect = document.getElementById('sess-ms-select');
    const taskSelect = document.getElementById('sess-task-select');

    msSelect.innerHTML = `<option value="">-- Entire Project --</option>` + (selectedProj?.milestones || []).map(m => `<option value="${m.id}">${m.title}</option>`).join('');
    taskSelect.innerHTML = `<option value="">-- General Implementation --</option>` + (selectedProj?.tasks || []).map(t => `<option value="${t.id}">${t.title}</option>`).join('');
  };

  document.getElementById('btn-close-modal').onclick = () => { clearInterval(timerInterval); closeModal(); };
  document.getElementById('btn-cancel-modal').onclick = () => { clearInterval(timerInterval); closeModal(); };
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') {
      clearInterval(timerInterval);
      closeModal();
    }
  };

  document.getElementById('btn-save-session').onclick = () => {
    clearInterval(timerInterval);
    const projId = document.getElementById('sess-proj-select').value;
    const msId = document.getElementById('sess-ms-select').value || null;
    const taskId = document.getElementById('sess-task-select').value || null;
    const durationMinutes = parseInt(manualMinsInput.value, 10) || 30;
    const notes = document.getElementById('sess-notes').value.trim();

    logProjectSession(projId, {
      milestone_id: msId,
      task_id: taskId,
      durationMinutes,
      notes
    });

    closeModal();
    if (onSaved) onSaved();
    window.dispatchEvent(new CustomEvent('project-state-updated', { detail: { projectId: projId } }));
  };
}

/**
 * Quality Check Modal before marking Portfolio Ready (Section 42)
 */
export function openProjectQualityCheckModal(projectId, onSaved = null) {
  initModalContainer();
  const project = getProjectById(projectId);
  if (!project) return;

  const qc = project.portfolio?.quality_check || {};

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 580px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('award', 'text-amber')}
            <h3 class="modal-title">Project Quality Check: ${project.name}</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 12px;">
          <p style="font-size: 0.82rem; color: var(--color-text-secondary); margin-bottom: 4px;">
            Review each dimension before marking this project <strong>PORTFOLIO READY</strong>.
            (No overall numerical scores per Section 42).
          </p>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${QUALITY_CHECK_CATEGORIES.map(cat => {
              const currentVal = qc[cat.key] || 'Not Checked';
              return `
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--color-bg-base); padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
                  <strong style="font-size: 0.85rem;">${cat.label}</strong>
                  <select class="form-select qc-item-select" data-key="${cat.key}" style="width: 140px; padding: 4px 8px; font-size: 0.8rem;">
                    <option value="Not Checked" ${currentVal === 'Not Checked' ? 'selected' : ''}>Not Checked</option>
                    <option value="Needs Work" ${currentVal === 'Needs Work' ? 'selected' : ''}>Needs Work</option>
                    <option value="Ready" ${currentVal === 'Ready' ? 'selected' : ''}>Ready</option>
                  </select>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between;">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-save-qc">Save Check</button>
            <button type="button" class="btn btn-accent" id="btn-mark-port-ready">Mark Portfolio Ready ★</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  function saveQcValues() {
    modalContainer.querySelectorAll('.qc-item-select').forEach(sel => {
      const key = sel.getAttribute('data-key');
      const val = sel.value;
      updateProjectQualityCheck(projectId, key, val);
    });
  }

  document.getElementById('btn-save-qc').onclick = () => {
    saveQcValues();
    closeModal();
    if (onSaved) onSaved();
    window.dispatchEvent(new CustomEvent('project-state-updated', { detail: { projectId } }));
  };

  document.getElementById('btn-mark-port-ready').onclick = () => {
    saveQcValues();
    markPortfolioReady(projectId);
    closeModal();
    if (onSaved) onSaved();
    window.dispatchEvent(new CustomEvent('project-state-updated', { detail: { projectId } }));
  };
}

/**
 * Project Completion Summary Confirmation Modal (Section 46)
 */
export function openProjectCompletionConfirmModal(projectId, onCompleted = null) {
  initModalContainer();
  const summary = getProjectCompletionSummary(projectId);
  if (!summary) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('check', 'text-emerald')}
            <h3 class="modal-title">Complete Project Confirmation</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
          <p style="font-size: 0.85rem; color: var(--color-text-secondary);">
            Reviewing completion status for <strong>${summary.name}</strong> before marking Completed (Section 46):
          </p>

          <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border); display: flex; flex-direction: column; gap: 10px; font-size: 0.85rem;">
            <div style="display: flex; justify-content: space-between;">
              <span>Tasks Progress:</span>
              <strong>${summary.tasks.completed} / ${summary.tasks.total} completed</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Milestones Progress:</span>
              <strong>${summary.milestones.completed} / ${summary.milestones.total} completed</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>GitHub Repository:</span>
              <strong class="text-purple">${summary.githubStatus}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Deployment:</span>
              <strong class="text-cyan">${summary.deploymentStatus}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Documentation:</span>
              <strong class="text-emerald">${summary.documentationStatus}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Portfolio Readiness:</span>
              <strong class="text-amber">${summary.portfolioStatus}</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-confirm-complete">Mark Completed 🎉</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('btn-confirm-complete').onclick = () => {
    markProjectCompleted(projectId);
    closeModal();
    if (onCompleted) onCompleted();
    window.dispatchEvent(new CustomEvent('project-state-updated', { detail: { projectId } }));
  };
}

/**
 * Project Ideas Incubator Modals (Section 44)
 */
export function openProjectIdeaModal(onCreated = null) {
  initModalContainer();

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 540px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('bulb', 'text-amber')}
            <h3 class="modal-title">New Project Idea</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="project-idea-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Idea Name *</label>
              <input type="text" class="form-input" id="idea-name" placeholder="e.g. Real-Time Distributed Cache or Multi-Modal OCR" required />
            </div>

            <div class="form-group">
              <label class="form-label">Problem It Solves</label>
              <textarea class="form-textarea" id="idea-problem" rows="2" placeholder="Why does this exist? What problem is tackled?"></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-select" id="idea-category">
                  ${PHASE6_PROJECT_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Difficulty</label>
                <select class="form-select" id="idea-difficulty">
                  ${PROJECT_DIFFICULTIES.map(d => `<option value="${d}" ${d === 'Intermediate' ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Potential Technologies</label>
              <input type="text" class="form-input" id="idea-tech" placeholder="e.g. Python, FastAPI, Redis, Docker" />
            </div>

            <div class="form-group">
              <label class="form-label">Why Useful for Portfolio / Interview</label>
              <input type="text" class="form-input" id="idea-why" placeholder="e.g. Showcases concurrency and distributed consensus" />
            </div>

            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea class="form-textarea" id="idea-notes" rows="2" placeholder="References, datasets, papers..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">${getIcon('plus')} Save Idea</button>
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

  document.getElementById('project-idea-form').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('idea-name').value.trim();
    if (!name) return;

    const data = {
      name,
      problem: document.getElementById('idea-problem').value.trim(),
      category: document.getElementById('idea-category').value,
      difficulty: document.getElementById('idea-difficulty').value,
      potential_technologies: document.getElementById('idea-tech').value.trim(),
      why_useful: document.getElementById('idea-why').value.trim(),
      notes: document.getElementById('idea-notes').value.trim()
    };

    const newIdea = addProjectIdea(data);
    closeModal();
    if (onCreated) onCreated(newIdea);
    window.dispatchEvent(new CustomEvent('project-state-updated', { detail: {} }));
  };
}

export function openConvertIdeaModal(ideaId, onConverted = null) {
  initModalContainer();
  const state = getState();
  const idea = (state.project_ideas || []).find(i => i.id === ideaId);
  if (!idea) return;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 480px;">
        <div class="modal-header">
          <h3 class="modal-title">Convert Idea to Active Project</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <div class="modal-body" style="font-size: 0.85rem; line-height: 1.5; color: var(--color-text-secondary);">
          <p>
            Convert <strong>"${idea.name}"</strong> into an active project record?
          </p>
          <div style="background: var(--color-bg-base); padding: 10px; border-radius: var(--radius-md); border: 1px solid var(--color-border); margin: 10px 0; font-size: 0.8rem;">
            <div>Category: <strong>${idea.category}</strong></div>
            <div>Tech: <strong>${idea.potential_technologies || 'None specified'}</strong></div>
          </div>
          <p style="font-size: 0.78rem; color: var(--color-text-muted);">
            Per Section 44, this creates ONE project record and links this idea without duplicating records.
          </p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-confirm-convert">Convert to Project</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('btn-confirm-convert').onclick = () => {
    const proj = convertIdeaToProject(ideaId);
    closeModal();
    if (onConverted) onConverted(proj);
    window.dispatchEvent(new CustomEvent('project-state-updated', { detail: { projectId: proj?.id } }));
  };
}

export function openPortfolioCsvModal() {
  const csvContent = exportPortfolioCSV();
  initModalContainer();

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 600px;">
        <div class="modal-header">
          <h3 class="modal-title">Portfolio CSV Export (Section 58)</h3>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 0.82rem; color: var(--color-text-secondary); margin-bottom: 8px;">
            Export projects with technologies, GitHub repository, live demo, status, and portfolio readiness:
          </p>
          <textarea class="form-textarea" readonly rows="8" style="font-family: var(--font-mono); font-size: 0.75rem;">${csvContent}</textarea>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Close</button>
          <button type="button" class="btn btn-primary" id="btn-download-csv">Download CSV</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('btn-download-csv').onclick = () => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-projects-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

/**
 * ==========================================
 * PHASE 4: MONTHLY ENGINE MODALS
 * ==========================================
 */

/**
 * SECTION 23: Monthly Target Editor Modal
 */
export function openEditMonthlyTargetsModal(monthKey, onSave) {
  initModalContainer();
  const state = getState();
  const metrics = calculateMonthlyMetrics(monthKey, state);
  const targets = metrics.targets;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 480px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h3 class="modal-title">Edit Monthly Targets</h3>
            <span class="badge ${targets.isCustom ? 'badge-amber' : 'badge-cyan'}">${targets.isCustom ? 'Custom' : 'Default'}</span>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="form-monthly-targets" style="display: flex; flex-direction: column; gap: 14px; padding: 16px;">
          <div class="form-hint" style="margin-bottom: 4px;">
            Configure targets for <strong>${metrics.roadmapMonth.name || metrics.roadmapMonth.title || monthKey}</strong>. Derived from calendar and study availability.
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Study Hours Target</label>
              <input type="number" class="form-input" id="target-study-hours" value="${targets.studyHours}" min="10" max="300" required />
              <div class="form-hint">Default: 128 hrs</div>
            </div>

            <div class="form-group">
              <label class="form-label">DSA Problems Target</label>
              <input type="number" class="form-input" id="target-dsa-problems" value="${targets.dsaProblems}" min="5" max="200" required />
              <div class="form-hint">Default: 40 problems</div>
            </div>

            <div class="form-group">
              <label class="form-label">Prime 3.0 Sessions</label>
              <input type="number" class="form-input" id="target-prime-sessions" value="${targets.primeSessions}" min="1" max="60" required />
              <div class="form-hint">Default: 20 sessions</div>
            </div>

            <div class="form-group">
              <label class="form-label">Individual Sessions</label>
              <input type="number" class="form-input" id="target-indiv-sessions" value="${targets.individualSessions}" min="1" max="60" required />
              <div class="form-hint">Default: 20 sessions</div>
            </div>

            <div class="form-group">
              <label class="form-label">Project Sessions</label>
              <input type="number" class="form-input" id="target-proj-sessions" value="${targets.projectSessions}" min="1" max="30" required />
              <div class="form-hint">Default: 8 sessions</div>
            </div>

            <div class="form-group">
              <label class="form-label">Revision Sessions</label>
              <input type="number" class="form-input" id="target-rev-sessions" value="${targets.revisionSessions}" min="1" max="30" required />
              <div class="form-hint">Default: 8 sessions</div>
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 12px; margin-top: 8px;">
            <button type="button" class="btn btn-ghost btn-sm text-muted" id="btn-reset-targets">Reset to Default</button>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-targets">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Targets</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-targets').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('btn-reset-targets').onclick = () => {
    saveMonthlyTargets(monthKey, {
      studyHours: 128,
      dsaProblems: 40,
      primeSessions: 20,
      individualSessions: 20,
      projectSessions: 8,
      revisionSessions: 8,
      isCustom: false
    });
    closeModal();
    if (onSave) onSave();
  };

  document.getElementById('form-monthly-targets').onsubmit = (e) => {
    e.preventDefault();
    const studyHours = parseFloat(document.getElementById('target-study-hours').value) || 128;
    const dsaProblems = parseInt(document.getElementById('target-dsa-problems').value, 10) || 40;
    const primeSessions = parseInt(document.getElementById('target-prime-sessions').value, 10) || 20;
    const individualSessions = parseInt(document.getElementById('target-indiv-sessions').value, 10) || 20;
    const projectSessions = parseInt(document.getElementById('target-proj-sessions').value, 10) || 8;
    const revisionSessions = parseInt(document.getElementById('target-rev-sessions').value, 10) || 8;

    saveMonthlyTargets(monthKey, {
      studyHours,
      dsaProblems,
      primeSessions,
      individualSessions,
      projectSessions,
      revisionSessions,
      isCustom: true
    });

    closeModal();
    if (onSave) onSave();
  };
}

/**
 * SECTION 4 & 17: Topic Status & Rescheduling Modal
 */
export function openTopicStatusModal(topicId, onSave) {
  initModalContainer();
  const state = getState();
  const topic = (state.roadmap_topics || []).find(t => t.id === topicId);
  if (!topic) return;

  const allMonths = state.roadmap_months || [];
  const currentMonth = allMonths.find(m => m.id === topic.month_id);
  const futureMonths = allMonths.filter(m => !currentMonth || m.order > currentMonth.order);

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 480px;">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Topic Status: ${topic.name}</h3>
            <div style="font-size: 0.78rem; color: var(--color-text-muted);">${currentMonth?.name || currentMonth?.title || ''}</div>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="form-topic-status" style="display: flex; flex-direction: column; gap: 14px; padding: 16px;">
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-select" id="select-topic-status" required>
              <option value="Not Started" ${topic.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
              <option value="Learning" ${topic.status === 'Learning' ? 'selected' : ''}>Learning</option>
              <option value="Practicing" ${topic.status === 'Practicing' ? 'selected' : ''}>Practicing</option>
              <option value="Completed" ${topic.status === 'Completed' ? 'selected' : ''}>Completed (100%)</option>
              <option value="Needs Revision" ${topic.status === 'Needs Revision' ? 'selected' : ''}>Needs Revision (At Risk)</option>
              <option value="Carried Forward" ${topic.status === 'Carried Forward' ? 'selected' : ''}>Carried Forward (Move to Next Month)</option>
              <option value="Not Required" ${topic.status === 'Not Required' ? 'selected' : ''}>Not Required / Deprioritized</option>
            </select>
          </div>

          <div class="form-group" id="group-destination-month" style="display: ${topic.status === 'Carried Forward' ? 'block' : 'none'};">
            <label class="form-label" style="color: var(--color-accent-amber); font-weight: 700;">Destination Month</label>
            <select class="form-select" id="select-destination-month">
              ${futureMonths.map(m => `
                <option value="${m.id}" ${topic.carried_forward_to === m.id ? 'selected' : ''}>${m.month} ${m.year} (${m.title})</option>
              `).join('')}
            </select>
            <div class="form-hint">Topic will appear in the destination month curriculum</div>
          </div>

          <div class="form-group">
            <label class="form-label">Target Completion Date</label>
            <input type="date" class="form-input" id="topic-target-date" value="${topic.target_date || ''}" />
          </div>

          <div class="form-group">
            <label class="form-label">Progress Percentage: <span id="topic-progress-val">${topic.progress || 0}%</span></label>
            <input type="range" class="form-range" id="topic-progress-slider" min="0" max="100" step="5" value="${topic.progress || 0}" />
          </div>

          <div class="form-group">
            <label class="form-label">Notes / Rationale</label>
            <textarea class="form-textarea" id="topic-status-notes" rows="2" placeholder="Implementation notes, difficulty encountered, or rescheduling rationale...">${topic.notes || ''}</textarea>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--color-border); padding-top: 12px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-status">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-status').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  const statusSelect = document.getElementById('select-topic-status');
  const destGroup = document.getElementById('group-destination-month');
  const progSlider = document.getElementById('topic-progress-slider');
  const progVal = document.getElementById('topic-progress-val');

  statusSelect.onchange = (e) => {
    const val = e.target.value;
    destGroup.style.display = val === 'Carried Forward' ? 'block' : 'none';
    if (val === 'Completed') {
      progSlider.value = 100;
      progVal.textContent = '100%';
    } else if (val === 'Not Started') {
      progSlider.value = 0;
      progVal.textContent = '0%';
    }
  };

  progSlider.oninput = (e) => {
    progVal.textContent = `${e.target.value}%`;
    if (parseInt(e.target.value, 10) === 100) {
      statusSelect.value = 'Completed';
    }
  };

  document.getElementById('form-topic-status').onsubmit = (e) => {
    e.preventDefault();
    const newStatus = statusSelect.value;
    const targetDate = document.getElementById('topic-target-date').value || null;
    const destMonthId = newStatus === 'Carried Forward' ? document.getElementById('select-destination-month').value : null;
    const notes = document.getElementById('topic-status-notes').value;

    updateMonthlyTopicStatus(topicId, newStatus, targetDate, notes, destMonthId);

    // If progress slider modified manually
    const pVal = parseInt(progSlider.value, 10);
    if (newStatus !== 'Completed' && newStatus !== 'Not Started') {
      updateRoadmapTopic(topicId, { progress: pVal });
    }

    closeModal();
    if (onSave) onSave();
  };
}

/**
 * SECTION 18-22: Month-End Review & Next Month Planning Modal
 */
export function openMonthlyReviewModal(monthKey, onSave) {
  initModalContainer();
  const state = getState();
  const metrics = calculateMonthlyMetrics(monthKey, state);
  const existingReview = (state.monthly_reviews || []).find(r => r.monthKey === monthKey);

  // Find next roadmap month
  const allMonths = state.roadmap_months || [];
  const currentMonthIdx = allMonths.findIndex(m => m.id === metrics.roadmapMonth.id);
  const nextMonth = (currentMonthIdx >= 0 && currentMonthIdx < allMonths.length - 1) ? allMonths[currentMonthIdx + 1] : allMonths[0];
  const nextMonthTopics = (state.roadmap_topics || []).filter(t => t.month_id === nextMonth.id);
  const savedPriorities = state.monthly_priorities?.[nextMonth.monthKey] || {};

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 680px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Monthly Review & Reflection: ${metrics.roadmapMonth.month || 'October'} ${metrics.roadmapMonth.year || 2026}</h3>
            <div style="font-size: 0.78rem; color: var(--color-text-muted);">${metrics.roadmapMonth.title}</div>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="form-monthly-review" style="display: flex; flex-direction: column; gap: 16px; padding: 16px;">
          <!-- SECTION 19: Automatic Monthly Summary from Actual Data (No fake numbers) -->
          <div style="background: var(--color-bg-base); border-radius: var(--radius-md); padding: 14px; border: 1px solid var(--color-border);">
            <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--color-primary); margin-bottom: 8px;">
              📊 AUTOMATIC SUMMARY (FROM ACTUAL STORED LOGS)
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; font-size: 0.82rem;">
              <div><span class="text-muted">Study Hours:</span> <strong>${metrics.studyHoursLogged} / ${metrics.studyHoursTarget}h</strong></div>
              <div><span class="text-muted">Days Studied:</span> <strong>${metrics.daysStudied} days</strong></div>
              <div><span class="text-muted">DSA Solved:</span> <strong class="text-amber">${metrics.dsaSolved} / ${metrics.dsaTarget}</strong></div>
              <div><span class="text-muted">Prime Sessions:</span> <strong class="text-primary">${metrics.sessionsCount.prime}</strong></div>
              <div><span class="text-muted">Indiv Sessions:</span> <strong class="text-emerald">${metrics.sessionsCount.individual}</strong></div>
              <div><span class="text-muted">Project Sessions:</span> <strong class="text-purple">${metrics.sessionsCount.project}</strong></div>
              <div><span class="text-muted">Roadmap Progress:</span> <strong class="text-emerald">${metrics.individualRoadmapPct}%</strong></div>
              <div><span class="text-muted">Topics Completed:</span> <strong>${metrics.topicsCompleted} / ${metrics.monthTopics.length}</strong></div>
              <div><span class="text-muted">Needing Revision:</span> <strong class="text-rose">${metrics.topicsNeedsRevision}</strong></div>
              <div><span class="text-muted">Carried Forward:</span> <strong class="text-amber">${metrics.topicsCarriedForward}</strong></div>
            </div>
          </div>

          <!-- SECTION 18: 10 Reflection Questions -->
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-main); margin-top: 4px;">
            10 Structured Reflection Questions
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.82rem;">
            <div class="form-group">
              <label class="form-label">1. What did I accomplish this month?</label>
              <textarea class="form-textarea rev-q" data-q="q1" rows="2" required placeholder="Core milestones, projects built, topics mastered...">${existingReview?.answers?.q1 || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">2. What did I learn?</label>
              <textarea class="form-textarea rev-q" data-q="q2" rows="2" required placeholder="Key concepts, mental models, programming techniques...">${existingReview?.answers?.q2 || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">3. What did I build?</label>
              <textarea class="form-textarea rev-q" data-q="q3" rows="2" required placeholder="Programs, simulations, project features, scripts...">${existingReview?.answers?.q3 || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">4. What was my biggest improvement?</label>
              <textarea class="form-textarea rev-q" data-q="q4" rows="2" placeholder="Coding speed, problem analysis, discipline...">${existingReview?.answers?.q4 || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">5. What topic was most difficult?</label>
              <textarea class="form-textarea rev-q" data-q="q5" rows="2" placeholder="Concepts that took longer or need further review...">${existingReview?.answers?.q5 || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">6. What remains incomplete?</label>
              <textarea class="form-textarea rev-q" data-q="q6" rows="2" placeholder="Unfinished topics, skipped tasks, open projects...">${existingReview?.answers?.q6 || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">7. Why did I fall behind where applicable?</label>
              <textarea class="form-textarea rev-q" data-q="q7" rows="2" placeholder="College exams, procrastination, time management...">${existingReview?.answers?.q7 || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">8. What should I change next month?</label>
              <textarea class="form-textarea rev-q" data-q="q8" rows="2" placeholder="Adjust study schedule, start earlier, more DSA...">${existingReview?.answers?.q8 || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">9. What is my biggest priority for next month?</label>
              <textarea class="form-textarea rev-q" data-q="q9" rows="2" required placeholder="Core target subject or project milestone...">${existingReview?.answers?.q9 || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">10. What am I proud of completing?</label>
              <textarea class="form-textarea rev-q" data-q="q10" rows="2" placeholder="Wins, consistency streaks, challenges overcome...">${existingReview?.answers?.q10 || ''}</textarea>
            </div>
          </div>

          <!-- SECTION 21 & 22: Next Month Planning & Priority System -->
          <div style="border-top: 1px solid var(--color-border); padding-top: 14px; margin-top: 6px;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary); margin-bottom: 4px;">
              🚀 NEXT MONTH PLANNING: ${nextMonth.month || 'November'} ${nextMonth.year || 2026}
            </div>
            <div class="form-hint" style="margin-bottom: 12px;">
              Enforced Focus Limits: 1 Primary Priority, up to 2 Secondary Priorities, up to 3 Optional Priorities.
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label class="form-label" style="color: var(--color-primary); font-weight: 700;">1. Primary Priority (Max 1 Topic)</label>
              <select class="form-select" id="next-month-primary" required>
                <option value="">-- Select Main Focus --</option>
                ${nextMonthTopics.map(t => `
                  <option value="${t.id}" ${savedPriorities.primary === t.id ? 'selected' : ''}>${t.name} (${t.category})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 10px;">
              <label class="form-label" style="color: var(--color-accent-amber); font-weight: 700;">2. Secondary Priorities (Select up to 2 Topics)</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.82rem;">
                ${nextMonthTopics.map(t => {
                  const isChecked = (savedPriorities.secondary || []).includes(t.id);
                  return `
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                      <input type="checkbox" class="custom-checkbox next-secondary-cb" value="${t.id}" ${isChecked ? 'checked' : ''} />
                      <span>${t.name}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" style="color: var(--color-text-secondary); font-weight: 700;">3. Optional Priorities (Select up to 3 Topics)</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.82rem;">
                ${nextMonthTopics.map(t => {
                  const isChecked = (savedPriorities.optional || []).includes(t.id);
                  return `
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                      <input type="checkbox" class="custom-checkbox next-optional-cb" value="${t.id}" ${isChecked ? 'checked' : ''} />
                      <span>${t.name}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--color-border); padding-top: 12px; margin-top: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-review">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Monthly Review & Next Plan</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-review').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  // Enforce checkbox limits
  const secBoxes = modalContainer.querySelectorAll('.next-secondary-cb');
  secBoxes.forEach(cb => {
    cb.onchange = () => {
      const checked = modalContainer.querySelectorAll('.next-secondary-cb:checked');
      if (checked.length > 2) {
        cb.checked = false;
        alert('⚠️ Maximum 2 Secondary Priorities allowed to keep your focus sharp.');
      }
    };
  });

  const optBoxes = modalContainer.querySelectorAll('.next-optional-cb');
  optBoxes.forEach(cb => {
    cb.onchange = () => {
      const checked = modalContainer.querySelectorAll('.next-optional-cb:checked');
      if (checked.length > 3) {
        cb.checked = false;
        alert('⚠️ Maximum 3 Optional Priorities allowed.');
      }
    };
  });

  document.getElementById('form-monthly-review').onsubmit = (e) => {
    e.preventDefault();
    const answers = {};
    modalContainer.querySelectorAll('.rev-q').forEach(qEl => {
      answers[qEl.getAttribute('data-q')] = qEl.value;
    });

    const primaryPriority = document.getElementById('next-month-primary').value;
    const secondaryPriorities = Array.from(modalContainer.querySelectorAll('.next-secondary-cb:checked')).map(cb => cb.value);
    const optionalPriorities = Array.from(modalContainer.querySelectorAll('.next-optional-cb:checked')).map(cb => cb.value);

    // 1. Save Monthly Review
    saveMonthlyReview({
      monthKey,
      answers,
      summary: {
        studyHoursLogged: metrics.studyHoursLogged,
        studyHoursTarget: metrics.studyHoursTarget,
        daysStudied: metrics.daysStudied,
        dsaSolved: metrics.dsaSolved,
        primeSessions: metrics.sessionsCount.prime,
        indivSessions: metrics.sessionsCount.individual,
        projectSessions: metrics.sessionsCount.project,
        roadmapProgressPct: metrics.individualRoadmapPct,
        topicsCompleted: metrics.topicsCompleted,
        topicsNeedsRevision: metrics.topicsNeedsRevision,
        topicsCarriedForward: metrics.topicsCarriedForward
      },
      reflection: {
        achievements: answers.q1,
        challenges: answers.q5,
        lessonsLearned: answers.q2,
        thingsToImprove: answers.q8,
        nextMonthPriority: answers.q9
      }
    });

    // 2. Save Next Month Priorities
    saveNextMonthPriorities(nextMonth.monthKey, {
      primary: primaryPriority,
      secondary: secondaryPriorities,
      optional: optionalPriorities
    });

    alert('🎉 Monthly Review & Next Month Priorities permanently saved!');
    closeModal();
    if (onSave) onSave();
  };
}

/**
 * SECTION 8: Day Activity Inspection Modal (for Calendar Click)
 */
export function openDayActivityModal(dateStr) {
  initModalContainer();
  const state = getState();
  const studySessions = (state.studySessions || []).filter(s => s.date === dateStr);
  const tasks = (state.dailyTasks || state.daily_tasks || []).filter(t => t.date === dateStr);
  const dsa = (state.dsaProblems || []).filter(p => p.date === dateStr);
  const dailyReview = (state.dailyReviews || []).find(r => r.date === dateStr);

  const totalMinutes = studySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Activity Details: ${dateStr}</h3>
            <span class="badge ${totalHours > 0 ? 'badge-emerald' : 'badge-slate'}">${totalHours}h Logged</span>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px; padding: 16px; font-size: 0.85rem;">
          <!-- Study Sessions -->
          <div>
            <div style="font-weight: 700; color: var(--color-primary); margin-bottom: 6px;">⏱️ Study Sessions (${studySessions.length})</div>
            ${studySessions.length === 0 ? `
              <div class="text-muted" style="font-size: 0.78rem;">No study sessions logged on this date.</div>
            ` : studySessions.map(s => `
              <div style="background: var(--color-bg-base); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); margin-bottom: 4px;">
                <div style="display: flex; justify-content: space-between; font-weight: 600;">
                  <span>${s.category} - ${s.topic || 'General'}</span>
                  <span class="text-primary font-mono">${(s.durationMinutes || 0) / 60}h (${s.startTime || ''} - ${s.endTime || ''})</span>
                </div>
                ${s.notes ? `<div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">${s.notes}</div>` : ''}
              </div>
            `).join('')}
          </div>

          <!-- Tasks -->
          <div>
            <div style="font-weight: 700; color: var(--color-accent-emerald); margin-bottom: 6px;">
              📋 Curriculum Tasks (${tasks.filter(t => t.completed).length} / ${tasks.length} Completed)
            </div>
            ${tasks.length === 0 ? `
              <div class="text-muted" style="font-size: 0.78rem;">No tasks scheduled for this day.</div>
            ` : tasks.map(t => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid var(--color-border-subtle);">
                <span style="${t.completed ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">${t.title}</span>
                <span class="badge ${t.completed ? 'badge-emerald' : (t.status === 'Skipped' ? 'badge-rose' : 'badge-slate')}" style="font-size: 0.65rem;">
                  ${t.completed ? 'Done' : (t.status === 'Skipped' ? `Skipped: ${t.skipReason || ''}` : 'Pending')}
                </span>
              </div>
            `).join('')}
          </div>

          <!-- DSA Problems -->
          <div>
            <div style="font-weight: 700; color: var(--color-accent-amber); margin-bottom: 6px;">
              💡 DSA Problems (${dsa.filter(p => p.status === 'Solved' || p.solved).length} Solved)
            </div>
            ${dsa.length === 0 ? `
              <div class="text-muted" style="font-size: 0.78rem;">No DSA problems recorded for this day.</div>
            ` : dsa.map(p => `
              <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 0.8rem;">
                <span>${p.title} (${p.platform})</span>
                <span class="text-emerald" style="font-weight: 600;">${p.status || (p.solved ? 'Solved' : 'Attempted')}</span>
              </div>
            `).join('')}
          </div>

          <!-- Daily Reflection -->
          ${dailyReview ? `
            <div style="background: var(--color-bg-base); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
              <div style="font-weight: 700; color: var(--color-accent-purple); font-size: 0.78rem;">Daily Review: [${dailyReview.rating}]</div>
              <div style="font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 2px;">${dailyReview.reflection || ''}</div>
            </div>
          ` : ''}
        </div>

        <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px;">
          <button type="button" class="btn btn-secondary" id="btn-close-day-modal" style="width: 100%;">Close</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-close-day-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };
}



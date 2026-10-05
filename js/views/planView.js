/**
 * AI Study & Task Planner - Goal Creation, Plan Preview & Plan Editor View
 * Strict Mental Model:
 * User Goal -> AI Analysis -> Plan Preview -> User Review/Edit -> User Approval -> Implement Plan -> Tracker
 */

import { getIcon } from '../components/icons.js';
import {
  generateAiPlan,
  isPlanGenerating,
  cancelPlanGeneration,
  checkAiStatus
} from '../services/aiPlanGenerator.js';
import {
  savePlanDraft,
  getPlanDraft,
  implementPlan,
  getActivePlan,
  CATEGORY_META,
  TASK_CATEGORIES,
  getCategoryMeta
} from '../services/trackerService.js';
import {
  getCanonicalToday,
  shiftDate,
  formatFullDate,
  formatShortDate,
  formatMonthYear
} from '../services/dateService.js';

let isEditingMode = false;
let planHasUserEdits = false;
let expandedMonthId = null;

export function renderPlanView(container, options = {}) {
  const activePlan = getActivePlan();
  const draft = getPlanDraft();

  // If viewing active plan or draft
  if (options.mode === 'create' || (!draft && !activePlan)) {
    renderGoalInputScreen(container);
  } else if (isEditingMode && draft) {
    renderPlanEditorScreen(container, draft);
  } else if (draft) {
    renderPlanPreviewScreen(container, draft);
  } else if (activePlan) {
    renderPlanPreviewScreen(container, activePlan, true);
  } else {
    renderGoalInputScreen(container);
  }
}

// ==========================================
// 1. GOAL INPUT & ONBOARDING SCREEN
// ==========================================

function renderGoalInputScreen(container) {
  const canonicalToday = getCanonicalToday();
  const defaultTargetDate = shiftDate(canonicalToday, 90); // 3 months default

  container.innerHTML = `
    <div class="tracker-page animate-fade-in" style="max-width: 760px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 24px;">
      
      <!-- HEADER -->
      <div style="text-align: center; padding: 12px 0;">
        <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 16px; background: rgba(59, 130, 246, 0.12); color: var(--color-primary); margin-bottom: 12px;">
          ${getIcon('target', 'style="width: 30px; height: 30px;"')}
        </div>
        <h1 style="font-size: 1.85rem; font-weight: 800; letter-spacing: -0.02em; margin: 0; color: var(--color-text-main);">
          Create Your Plan
        </h1>
        <p style="font-size: 0.95rem; color: var(--color-text-secondary); margin: 6px auto 0; max-width: 520px; line-height: 1.5;">
          Tell the AI what you want to achieve. We'll analyze your goal and generate a structured Monthly, Weekly, and Daily plan for you to review and edit.
        </p>
      </div>

      <!-- 0. LOCAL OLLAMA AI READINESS CARD (Phase 4) -->
      <div id="ai-readiness-card" class="card" style="padding: 16px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div id="ai-status-indicator" style="width: 12px; height: 12px; border-radius: 50%; background: #94a3b8; flex-shrink: 0;"></div>
          <div>
            <div id="ai-status-title" style="font-size: 0.94rem; font-weight: 700; color: var(--color-text-main);">
              Detecting Local AI...
            </div>
            <div id="ai-status-desc" style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 1px;">
              Checking Ollama connection at 127.0.0.1:11434...
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="btn-retry-ai" type="button" class="btn btn-secondary btn-xs" style="font-weight: 700; gap: 4px;">
            ${getIcon('refresh')} <span>Check Ollama</span>
          </button>
        </div>
      </div>

      <!-- MAIN INPUT FORM CARD -->
      <div class="card" style="padding: 28px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-md);">
        
        <form id="form-create-plan" style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- GOAL TEXTAREA -->
          <div>
            <label for="input-goal" style="display: block; font-size: 0.88rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 8px;">
              What do you want to achieve? <span style="color: var(--color-accent-rose);">*</span>
            </label>
            <textarea
              id="input-goal"
              class="form-input"
              rows="4"
              required
              placeholder="Example: I want to learn Python and build 2 real-world projects in 3 months. I can study 2 hours per day on weekdays."
              style="width: 100%; padding: 12px 14px; font-size: 0.95rem; line-height: 1.5; border-radius: var(--radius-md); resize: vertical;"
            ></textarea>
          </div>

          <!-- EXAMPLE CHIPS -->
          <div>
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 6px;">
              Quick Inspirations:
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button type="button" class="btn btn-ghost btn-xs chip-goal" data-goal="I want to learn Python from beginner to intermediate and build 2 projects in 3 months.">
                🐍 Learn Python in 3 Months
              </button>
              <button type="button" class="btn btn-ghost btn-xs chip-goal" data-goal="I have university exams in 8 weeks. I need to cover all syllabus units, practice questions, and revise.">
                📚 Exam Preparation in 8 Weeks
              </button>
              <button type="button" class="btn btn-ghost btn-xs chip-goal" data-goal="I want to master Data Structures & Algorithms and solve 100 LeetCode problems in 6 months.">
                💻 Master DSA in 6 Months
              </button>
              <button type="button" class="btn btn-ghost btn-xs chip-goal" data-goal="I want to build and deploy a full-stack web application with portfolio documentation in 30 days.">
                🚀 Build Full-Stack App in 30 Days
              </button>
            </div>
          </div>

          <div style="height: 1px; background: var(--color-border-subtle); margin: 4px 0;"></div>

          <!-- DATES & PARAMETERS GRID -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            
            <div>
              <label for="input-start-date" style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
                Start Date
              </label>
              <input
                type="date"
                id="input-start-date"
                class="form-input"
                value="${canonicalToday}"
                required
                style="width: 100%; padding: 8px 12px; font-weight: 600;"
              />
            </div>

            <div>
              <label for="input-target-date" style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
                Target Completion Date
              </label>
              <input
                type="date"
                id="input-target-date"
                class="form-input"
                value="${defaultTargetDate}"
                required
                style="width: 100%; padding: 8px 12px; font-weight: 600;"
              />
            </div>

            <div>
              <label for="input-daily-hours" style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
                Available Time Per Day
              </label>
              <select id="input-daily-hours" class="form-select" style="width: 100%; padding: 8px 12px; font-weight: 600;">
                <option value="1">1 hour / day</option>
                <option value="2" selected>2 hours / day</option>
                <option value="3">3 hours / day</option>
                <option value="4">4 hours / day</option>
                <option value="5">5 hours / day</option>
                <option value="6">6+ hours / day</option>
              </select>
            </div>

            <div>
              <label for="input-days-week" style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
                Days Available Per Week
              </label>
              <select id="input-days-week" class="form-select" style="width: 100%; padding: 8px 12px; font-weight: 600;">
                <option value="5">5 days (Mon–Fri + 2 rest days)</option>
                <option value="6" selected>6 days (1 rest day)</option>
                <option value="7">7 days (Every day)</option>
              </select>
            </div>

            <div>
              <label for="input-experience" style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
                Experience Level
              </label>
              <select id="input-experience" class="form-select" style="width: 100%; padding: 8px 12px; font-weight: 600;">
                <option value="Beginner" selected>Beginner (Start with basics)</option>
                <option value="Intermediate">Intermediate (Has fundamentals)</option>
                <option value="Advanced">Advanced (Deep dive & mastery)</option>
              </select>
            </div>

          </div>

          <!-- GENERATE ACTION BUTTON & PROGRESS -->
          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
            <div id="generation-status-box" style="display: none; flex-direction: column; gap: 12px; padding: 14px 18px; border-radius: var(--radius-md); background: rgba(59, 130, 246, 0.06); border: 1px solid rgba(59, 130, 246, 0.25);">
              
              <!-- Disclaimer top of Creating your plan.... -->
              <div id="generation-disclaimer" style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; border-radius: var(--radius-sm); background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); color: var(--color-text-primary); font-size: 0.84rem; line-height: 1.45;">
                <span style="color: #d97706; display: inline-flex; align-items: center; margin-top: 2px; flex-shrink: 0; width: 17px; height: 17px;">${getIcon('clock')}</span>
                <div>
                  <strong>Please Note:</strong> Generating a structured multi-week roadmap and daily task schedule may take <strong>2–3 minutes</strong>. Please wait and keep this page open while AI crafts your personalized plan.
                </div>
              </div>

              <!-- Main progress row with spinner, Creating your plan.... and dynamic subtext -->
              <div style="display: flex; align-items: center; gap: 12px;">
                <span class="spinner" style="width: 20px; height: 20px; border: 2px solid var(--color-primary); border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0;"></span>
                <div style="display: flex; flex-direction: column; gap: 3px; flex: 1;">
                  <div id="generation-status-text" style="font-size: 0.95rem; font-weight: 700; color: var(--color-primary); line-height: 1.3;">Creating your plan....</div>
                  <div id="generation-status-subtext" style="font-size: 0.82rem; color: var(--color-text-secondary); font-weight: 500; line-height: 1.3;">Requesting plan via local Ollama Gemma model...</div>
                </div>
                <button type="button" id="btn-cancel-generation" class="btn btn-ghost btn-xs" style="color: var(--color-accent-rose); font-weight: 700;">
                  Cancel
                </button>
              </div>

            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px;">
              <button type="submit" id="btn-submit-generate" class="btn btn-primary" style="padding: 12px 28px; font-size: 1rem; font-weight: 800; gap: 8px;">
                ${getIcon('sparkles')} <span>Generate Plan</span>
              </button>
            </div>
          </div>

        </form>

      </div>

    </div>
  `;

  // Attach chip listeners
  container.querySelectorAll('.chip-goal').forEach(btn => {
    btn.onclick = () => {
      const g = btn.getAttribute('data-goal');
      const input = container.querySelector('#input-goal');
      if (input) {
        input.value = g;
        input.focus();
      }
    };
  });

  // Attach form submission
  const form = container.querySelector('#form-create-plan');
  const btnSubmit = container.querySelector('#btn-submit-generate');
  const statusBox = container.querySelector('#generation-status-box');
  const statusText = container.querySelector('#generation-status-text');
  const statusSubtext = container.querySelector('#generation-status-subtext');
  const btnCancel = container.querySelector('#btn-cancel-generation');

  // Asynchronous AI status check and UI update
  async function refreshAiStatusUI(force = false) {
    const indicator = container.querySelector('#ai-status-indicator');
    const title = container.querySelector('#ai-status-title');
    const desc = container.querySelector('#ai-status-desc');
    const btnRetry = container.querySelector('#btn-retry-ai');

    if (!indicator || !title || !desc) return;

    const status = await checkAiStatus(force);

    if (status.status === 'ready') {
      indicator.style.background = '#10b981';
      indicator.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.4)';
      title.textContent = `Ollama Ready (${status.model || 'gemma4:e2b'})`;
      desc.textContent = 'Local Gemma model is available. 100% private offline generation.';
      if (btnRetry) btnRetry.style.display = 'none';
    } else if (status.status === 'model_missing') {
      indicator.style.background = '#f59e0b';
      indicator.style.boxShadow = '0 0 8px rgba(245, 158, 11, 0.4)';
      title.textContent = `Model '${status.model || 'gemma4:e2b'}' Missing`;
      desc.textContent = `Run in your terminal: ${status.installCommand || 'ollama pull ' + (status.model || 'gemma4:e2b')}`;
      if (btnRetry) btnRetry.style.display = 'inline-flex';
    } else {
      indicator.style.background = '#f43f5e';
      indicator.style.boxShadow = '0 0 8px rgba(244, 63, 94, 0.4)';
      title.textContent = 'Ollama Not Responding';
      desc.textContent = 'Start Ollama on your computer at http://127.0.0.1:11434 (Run: ollama serve).';
      if (btnRetry) btnRetry.style.display = 'inline-flex';
    }
  }

  refreshAiStatusUI();

  const btnRetry = container.querySelector('#btn-retry-ai');
  if (btnRetry) {
    btnRetry.onclick = () => refreshAiStatusUI(true);
  }

  if (btnCancel) {
    btnCancel.onclick = () => {
      cancelPlanGeneration();
      statusBox.style.display = 'none';
      btnSubmit.disabled = false;
    };
  }

  form.onsubmit = async (e) => {
    e.preventDefault();

    const goal = container.querySelector('#input-goal').value.trim();
    const startDate = container.querySelector('#input-start-date').value;
    const targetDate = container.querySelector('#input-target-date').value;
    const dailyHours = container.querySelector('#input-daily-hours').value;
    const daysPerWeek = container.querySelector('#input-days-week').value;
    const experienceLevel = container.querySelector('#input-experience').value;

    if (!goal) return;

    btnSubmit.disabled = true;
    statusBox.style.display = 'flex';
    statusText.textContent = 'Creating your plan....';
    if (statusSubtext) {
      statusSubtext.textContent = 'Requesting plan via local Ollama Gemma model...';
      statusSubtext.style.display = 'block';
    }

    const onProgress = (msg, subMsg) => {
      if (statusText) statusText.textContent = msg;
      if (statusSubtext) {
        if (subMsg) {
          statusSubtext.textContent = subMsg;
          statusSubtext.style.display = 'block';
        } else {
          statusSubtext.style.display = 'none';
        }
      }
    };

    try {
      const result = await generateAiPlan({
        goal,
        startDate,
        targetDate,
        dailyHours,
        daysPerWeek,
        experienceLevel
      }, onProgress);

      savePlanDraft(result.plan);
      planHasUserEdits = false;
      isEditingMode = false;

      // Navigate to plan preview
      renderPlanPreviewScreen(container, result.plan);
    } catch (err) {
      if (err.message.includes('cancelled') || err.name === 'AbortError') {
        // Generation cancelled by user
        return;
      }
      if (err.code === 'OLLAMA_OFFLINE' || err.code === 'MODEL_MISSING') {
        openOllamaSetupModal(err, () => {
          refreshAiStatusUI(true);
          btnSubmit.click();
        }, () => {
          // User chose offline mode
          generateAiPlan({
            goal,
            startDate,
            targetDate,
            dailyHours,
            daysPerWeek,
            experienceLevel,
            allowOfflineDemo: true
          }, onProgress).then(res => {
            savePlanDraft(res.plan);
            renderPlanPreviewScreen(container, res.plan);
          }).catch(offlineErr => {
            alert(`Error: ${offlineErr.message}`);
          });
        });
      } else {
        const userWantsFallback = confirm(
          `${err.message || 'Failed to generate plan.'}\n\nWould you like to generate this structured plan using the local built-in planning engine instead?`
        );
        if (userWantsFallback) {
          generateAiPlan({
            goal,
            startDate,
            targetDate,
            dailyHours,
            daysPerWeek,
            experienceLevel,
            allowOfflineDemo: true
          }, onProgress).then(res => {
            savePlanDraft(res.plan);
            renderPlanPreviewScreen(container, res.plan);
          }).catch(offlineErr => {
            alert(`Error: ${offlineErr.message}`);
          });
        }
      }
    } finally {
      btnSubmit.disabled = false;
      statusBox.style.display = 'none';
    }
  };
}

// ==========================================
// 2. PLAN PREVIEW SCREEN (Requirement 14 & 15)
// ==========================================

function renderPlanPreviewScreen(container, plan, isAlreadyImplemented = false) {
  const goal = plan.goal || {};
  const totalTasks = (plan.tasks || []).length;
  const totalWeeks = (plan.weeks || []).length;
  const totalMonths = (plan.months || []).length;
  const totalHours = goal.estimatedHours || Math.round((plan.tasks || []).reduce((s, t) => s + (t.durationMinutes || 0), 0) / 60);

  // Default expand first month
  if (!expandedMonthId && plan.months?.length > 0) {
    expandedMonthId = plan.months[0].id;
  }

  container.innerHTML = `
    <div class="tracker-page animate-fade-in" style="max-width: 980px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 24px; padding-bottom: 60px;">
      
      <!-- TOP STATUS BANNER -->
      <div class="card" style="padding: 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-md);">
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--color-primary); letter-spacing: 0.06em; margin-bottom: 4px;">
              <span>${isAlreadyImplemented ? '✓ ACTIVE IMPLEMENTED PLAN' : '📝 PLAN DRAFT PREVIEW'}</span>
              ${planHasUserEdits ? '<span class="badge badge-purple" style="font-size: 0.7rem;">Edited</span>' : ''}
            </div>
            <h1 style="font-size: 1.7rem; font-weight: 800; margin: 0; color: var(--color-text-main); letter-spacing: -0.02em;">
              ${goal.title || 'Structured Study & Task Plan'}
            </h1>
            <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin: 6px 0 0 0; line-height: 1.4;">
              ${goal.description || ''}
            </p>
          </div>

          <!-- PRIMARY ACTION BUTTONS -->
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            ${!isAlreadyImplemented ? `
              <button id="btn-edit-plan" class="btn btn-secondary btn-sm" style="font-weight: 700; gap: 6px;">
                ${getIcon('pencil')} <span>Edit Plan</span>
              </button>
              <button id="btn-regenerate-plan" class="btn btn-ghost btn-sm" style="font-weight: 600; color: var(--color-text-secondary); gap: 6px;">
                ${getIcon('refresh')} <span>Regenerate</span>
              </button>
              <button id="btn-discard-plan" class="btn btn-ghost btn-sm" style="font-weight: 600; color: var(--color-accent-rose); gap: 6px;">
                <span>Discard Draft</span>
              </button>
              <button id="btn-implement-plan" class="btn btn-primary" style="padding: 9px 20px; font-weight: 800; gap: 8px;">
                ${getIcon('check')} <span>Implement Plan</span>
              </button>
            ` : `
              <button id="btn-view-tracker" class="btn btn-primary" style="padding: 9px 20px; font-weight: 800; gap: 8px;">
                ${getIcon('dashboard')} <span>Go to Dashboard</span>
              </button>
            `}
          </div>
        </div>

        <!-- PLAN METRICS HIGHLIGHTS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; padding-top: 16px; border-top: 1px solid var(--color-border-subtle);">
          <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">Duration</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-text-main); font-family: var(--font-mono); margin-top: 2px;">
              ${totalMonths} Months
            </div>
            <div style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 2px;">${formatShortDate(goal.startDate)} → ${formatShortDate(goal.targetDate)}</div>
          </div>

          <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">Estimated Work</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-primary); font-family: var(--font-mono); margin-top: 2px;">
              ${totalHours} Hours
            </div>
            <div style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 2px;">~${goal.dailyHours || 2}h / day</div>
          </div>

          <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">Structure</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-text-main); font-family: var(--font-mono); margin-top: 2px;">
              ${totalWeeks} Weeks
            </div>
            <div style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 2px;">${goal.daysPerWeek || 6} days/wk</div>
          </div>

          <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">Total Tasks</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-accent-emerald); font-family: var(--font-mono); margin-top: 2px;">
              ${totalTasks} Tasks
            </div>
            <div style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 2px;">Actionable milestones</div>
          </div>
        </div>

      </div>

      <!-- MILESTONES SECTION -->
      ${plan.milestones?.length > 0 ? `
        <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
          <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); margin-bottom: 12px;">
            Core Milestones
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
            ${plan.milestones.map((m, idx) => `
              <div style="padding: 10px 14px; background: var(--color-bg-base); border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle); display: flex; align-items: center; gap: 10px;">
                <span style="font-weight: 800; font-family: var(--font-mono); font-size: 0.85rem; color: var(--color-primary);">${idx + 1}.</span>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 0.86rem; font-weight: 700; color: var(--color-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.title}</div>
                  <div style="font-size: 0.72rem; color: var(--color-text-muted); font-family: var(--font-mono);">${m.targetDate ? formatShortDate(m.targetDate) : ''}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- MONTH BY MONTH BREAKDOWN -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 1.25rem; font-weight: 800; margin: 0; color: var(--color-text-main);">
            Roadmap Breakdown
          </h2>
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">
            Click months to expand / collapse
          </span>
        </div>

        ${(plan.months || []).map(m => {
          const isExpanded = expandedMonthId === m.id;
          const monthTasks = (plan.tasks || []).filter(t => t.date && t.date.startsWith(m.monthId || ''));
          const monthWeeks = (plan.weeks || []).filter(w => w.monthId === m.monthId);

          return `
            <div class="card" style="border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); overflow: hidden;">
              <!-- MONTH ACCORDION HEADER -->
              <div class="month-toggle-btn" data-month-id="${m.id}" style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: ${isExpanded ? 'rgba(59, 130, 246, 0.04)' : 'transparent'}; user-select: none;">
                <div>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.1rem; font-weight: 800; color: var(--color-text-main);">${m.title}</span>
                    <span class="badge badge-blue" style="font-size: 0.72rem;">${monthTasks.length} Tasks</span>
                  </div>
                  <div style="font-size: 0.82rem; color: var(--color-text-secondary); margin-top: 3px;">
                    ${m.theme || m.academicTarget || ''}
                  </div>
                </div>
                <div style="font-size: 1.1rem; color: var(--color-text-muted); font-weight: 700;">
                  ${isExpanded ? '▲' : '▼'}
                </div>
              </div>

              <!-- EXPANDED CONTENT -->
              ${isExpanded ? `
                <div style="padding: 0 20px 20px 20px; border-top: 1px solid var(--color-border-subtle); display: flex; flex-direction: column; gap: 16px; margin-top: 8px;">
                  
                  ${monthWeeks.map(w => {
                    const weekTasks = (plan.tasks || []).filter(t => t.date >= w.startDate && t.date <= w.endDate);

                    return `
                      <div style="background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); padding: 14px 16px;">
                        
                        <!-- WEEK HEADER -->
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                          <div>
                            <span style="font-size: 0.95rem; font-weight: 800; color: var(--color-text-main);">${w.title}</span>
                            <span style="font-size: 0.75rem; color: var(--color-text-muted); margin-left: 6px; font-family: var(--font-mono);">(${formatShortDate(w.startDate)} – ${formatShortDate(w.endDate)})</span>
                            <div style="font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 2px;">${w.objective || ''}</div>
                          </div>
                          <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-primary); font-family: var(--font-mono);">
                            ${weekTasks.length} tasks scheduled
                          </span>
                        </div>

                        <!-- TASKS IN WEEK -->
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                          ${weekTasks.length === 0 ? `
                            <div style="font-size: 0.8rem; color: var(--color-text-muted); font-style: italic;">No tasks on this week.</div>
                          ` : weekTasks.map(t => {
                            const meta = getCategoryMeta(t.category);
                            return `
                              <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); gap: 10px; flex-wrap: wrap;">
                                <div style="display: flex; align-items: center; gap: 10px; min-width: 220px; flex: 1;">
                                  <span style="font-size: 0.75rem; font-family: var(--font-mono); font-weight: 700; color: var(--color-text-muted); min-width: 50px;">
                                    ${formatShortDate(t.date)}
                                  </span>
                                  <span class="badge ${meta.badgeClass}" style="font-size: 0.68rem; padding: 2px 6px;">
                                    ${meta.label}
                                  </span>
                                  <span style="font-size: 0.86rem; font-weight: 600; color: var(--color-text-main);">
                                    ${t.title}
                                  </span>
                                </div>

                                <div style="display: flex; align-items: center; gap: 8px;">
                                  <span style="font-size: 0.74rem; font-family: var(--font-mono); color: var(--color-text-muted); background: var(--color-bg-base); padding: 2px 6px; border-radius: 4px;">
                                    ${t.durationMinutes} min
                                  </span>
                                  <span style="font-size: 0.72rem; color: var(--color-text-muted);">
                                    ${t.priority}
                                  </span>
                                </div>
                              </div>
                            `;
                          }).join('')}
                        </div>

                      </div>
                    `;
                  }).join('')}

                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;

  // Attach Month Accordion Toggles
  container.querySelectorAll('.month-toggle-btn').forEach(btn => {
    btn.onclick = () => {
      const mId = btn.getAttribute('data-month-id');
      expandedMonthId = expandedMonthId === mId ? null : mId;
      renderPlanPreviewScreen(container, plan, isAlreadyImplemented);
    };
  });

  // Attach Edit Plan Button
  const btnEdit = container.querySelector('#btn-edit-plan');
  if (btnEdit) {
    btnEdit.onclick = () => {
      isEditingMode = true;
      renderPlanEditorScreen(container, plan);
    };
  }

  // Attach Regenerate Button (Requirement 17)
  const btnRegen = container.querySelector('#btn-regenerate-plan');
  if (btnRegen) {
    btnRegen.onclick = () => {
      if (planHasUserEdits) {
        if (!confirm('Regenerating will replace your current draft and your manual edits will be lost. Do you want to proceed?')) {
          return;
        }
      }
      renderGoalInputScreen(container);
    };
  }

  // Attach Discard Draft Button (Phase 7)
  const btnDiscard = container.querySelector('#btn-discard-plan');
  if (btnDiscard) {
    btnDiscard.onclick = () => {
      if (confirm('Are you sure you want to discard this proposed plan? Your existing tracker will remain untouched.')) {
        savePlanDraft(null);
        planHasUserEdits = false;
        isEditingMode = false;
        renderGoalInputScreen(container);
      }
    };
  }

  // Attach Implement Plan Button (Requirement 18 & 19)
  const btnImplement = container.querySelector('#btn-implement-plan');
  if (btnImplement) {
    btnImplement.onclick = () => {
      openImplementationConfirmModal(plan, async () => {
        btnImplement.disabled = true;
        btnImplement.textContent = 'Implementing...';
        try {
          await implementPlan(plan.id);
          window.location.hash = '#dashboard';
        } catch (err) {
          alert(`Implementation error: ${err.message}`);
          btnImplement.disabled = false;
          btnImplement.innerHTML = `${getIcon('check')} <span>Implement Plan</span>`;
        }
      });
    };
  }

  // Attach Go to Dashboard (if already implemented)
  const btnViewTracker = container.querySelector('#btn-view-tracker');
  if (btnViewTracker) {
    btnViewTracker.onclick = () => {
      window.location.hash = '#dashboard';
    };
  }
}

// ==========================================
// 3. PLAN EDITOR SCREEN (Requirement 16)
// ==========================================

function renderPlanEditorScreen(container, plan) {
  container.innerHTML = `
    <div class="tracker-page animate-fade-in" style="max-width: 980px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 24px; padding-bottom: 60px;">
      
      <!-- HEADER -->
      <div class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div>
          <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-primary); letter-spacing: 0.06em;">
            PLAN EDITOR
          </div>
          <h1 style="font-size: 1.5rem; font-weight: 800; margin: 2px 0 0 0; color: var(--color-text-main);">
            Edit Draft Plan
          </h1>
          <p style="font-size: 0.84rem; color: var(--color-text-secondary); margin: 4px 0 0 0;">
            Modify task titles, dates, durations, categories, or add/remove tasks before implementing.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button id="btn-cancel-edit" class="btn btn-secondary btn-sm" style="font-weight: 700;">
            Done Editing & Preview
          </button>
        </div>
      </div>

      <!-- ADD TASK FORM INLINE -->
      <div class="card" style="padding: 18px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
        <div style="font-size: 0.84rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-main); margin-bottom: 12px;">
          + Add New Task to Plan
        </div>
        <form id="form-add-draft-task" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 10px; align-items: flex-end;">
          <div>
            <label style="display: block; font-size: 0.72rem; font-weight: 700; color: var(--color-text-muted); margin-bottom: 4px;">Task Title</label>
            <input type="text" id="input-new-task-title" class="form-input" placeholder="e.g. Implement API Endpoints" required style="width: 100%; padding: 7px 10px; font-size: 0.86rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.72rem; font-weight: 700; color: var(--color-text-muted); margin-bottom: 4px;">Date</label>
            <input type="date" id="input-new-task-date" class="form-input" value="${plan.goal?.startDate || getCanonicalToday()}" required style="width: 100%; padding: 7px 10px; font-size: 0.86rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.72rem; font-weight: 700; color: var(--color-text-muted); margin-bottom: 4px;">Category</label>
            <select id="input-new-task-cat" class="form-select" style="width: 100%; padding: 7px 10px; font-size: 0.86rem;">
              ${TASK_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 0.72rem; font-weight: 700; color: var(--color-text-muted); margin-bottom: 4px;">Duration (min)</label>
            <input type="number" id="input-new-task-duration" class="form-input" value="60" min="15" max="360" step="15" required style="width: 100%; padding: 7px 10px; font-size: 0.86rem;" />
          </div>

          <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; height: 35px; padding: 0 16px;">
            + Add
          </button>
        </form>
      </div>

      <!-- EDITABLE TASKS LIST -->
      <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted);">
            Tasks (${(plan.tasks || []).length})
          </div>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">Edits are automatically saved to your draft</span>
        </div>

        <div id="editable-tasks-container" style="display: flex; flex-direction: column; gap: 8px;">
          ${(plan.tasks || []).map((t, idx) => `
            <div class="task-row-edit" data-task-id="${t.id}" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); flex-wrap: wrap;">
              <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-text-muted); width: 24px;">${idx + 1}.</span>
              
              <input type="text" class="form-input edit-task-title" value="${t.title}" style="flex: 2; min-width: 180px; padding: 6px 10px; font-size: 0.85rem; font-weight: 600;" />
              
              <input type="date" class="form-input edit-task-date" value="${t.date}" style="width: 135px; padding: 6px 8px; font-size: 0.8rem;" />
              
              <select class="form-select edit-task-cat" style="width: 110px; padding: 6px 8px; font-size: 0.8rem;">
                ${TASK_CATEGORIES.map(c => `<option value="${c}" ${c === t.category ? 'selected' : ''}>${c}</option>`).join('')}
              </select>

              <input type="number" class="form-input edit-task-dur" value="${t.durationMinutes}" min="15" max="360" step="15" style="width: 70px; padding: 6px 8px; font-size: 0.8rem;" title="Duration in minutes" />

              <button class="btn btn-ghost btn-xs btn-icon btn-delete-draft-task" title="Delete task" style="color: var(--color-accent-rose);">
                ${getIcon('trash')}
              </button>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;

  // Attach Inline Add Task
  const addForm = container.querySelector('#form-add-draft-task');
  if (addForm) {
    addForm.onsubmit = (e) => {
      e.preventDefault();
      const title = container.querySelector('#input-new-task-title').value.trim();
      const date = container.querySelector('#input-new-task-date').value;
      const category = container.querySelector('#input-new-task-cat').value;
      const durationMinutes = Number(container.querySelector('#input-new-task-duration').value) || 60;

      if (!title || !date) return;

      const newTask = {
        id: `task-edit-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        title,
        date,
        dueDate: date,
        category,
        durationMinutes,
        priority: 'Normal',
        status: 'Pending',
        completed: false
      };

      plan.tasks.push(newTask);
      planHasUserEdits = true;
      savePlanDraft(plan);
      renderPlanEditorScreen(container, plan);
    };
  }

  // Attach Live Field Edits
  container.querySelectorAll('.task-row-edit').forEach(row => {
    const taskId = row.getAttribute('data-task-id');
    const task = plan.tasks.find(t => t.id === taskId);
    if (!task) return;

    const titleInput = row.querySelector('.edit-task-title');
    const dateInput = row.querySelector('.edit-task-date');
    const catSelect = row.querySelector('.edit-task-cat');
    const durInput = row.querySelector('.edit-task-dur');
    const delBtn = row.querySelector('.btn-delete-draft-task');

    titleInput.onchange = () => {
      task.title = titleInput.value.trim();
      planHasUserEdits = true;
      savePlanDraft(plan);
    };

    dateInput.onchange = () => {
      task.date = dateInput.value;
      task.dueDate = dateInput.value;
      planHasUserEdits = true;
      savePlanDraft(plan);
    };

    catSelect.onchange = () => {
      task.category = catSelect.value;
      planHasUserEdits = true;
      savePlanDraft(plan);
    };

    durInput.onchange = () => {
      task.durationMinutes = Number(durInput.value) || 45;
      planHasUserEdits = true;
      savePlanDraft(plan);
    };

    delBtn.onclick = () => {
      plan.tasks = plan.tasks.filter(t => t.id !== taskId);
      planHasUserEdits = true;
      savePlanDraft(plan);
      renderPlanEditorScreen(container, plan);
    };
  });

  // Attach Done Editing & Preview
  const btnDone = container.querySelector('#btn-cancel-edit');
  if (btnDone) {
    btnDone.onclick = () => {
      isEditingMode = false;
      renderPlanPreviewScreen(container, plan);
    };
  }
}

// ==========================================
// 4. IMPLEMENTATION CONFIRMATION MODAL (Requirement 18 & 19)
// ==========================================

function openImplementationConfirmModal(plan, onConfirm) {
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  }

  const modalEl = document.createElement('div');
  modalEl.className = 'modal-backdrop animate-fade-in';
  modalEl.style.cssText = 'position: fixed; inset: 0; background: rgba(7, 11, 20, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;';

  const totalTasks = (plan.tasks || []).length;
  const totalWeeks = (plan.weeks || []).length;
  const totalMonths = (plan.months || []).length;
  const goalTitle = plan.goal?.title || 'My Plan';

  modalEl.innerHTML = `
    <div class="card animate-scale-up" style="max-width: 440px; width: 100%; border: 1px solid var(--color-border); box-shadow: var(--shadow-lg); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface);">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 12px;">
        <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px; color: var(--color-text-main);">
          🚀 Ready to implement?
        </h3>
        <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-confirm">${getIcon('x')}</button>
      </div>

      <div style="font-size: 0.92rem; color: var(--color-text-secondary); margin-bottom: 16px; line-height: 1.5;">
        This will add <strong style="color: var(--color-text-main); font-weight: 700;">${goalTitle}</strong> to your tracker:
      </div>

      <div style="background: var(--color-bg-base); padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle); display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
        <div>
          <span style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Months</span>
          <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-text-main); font-family: var(--font-mono);">${totalMonths}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Weeks</span>
          <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-text-main); font-family: var(--font-mono);">${totalWeeks}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Tasks</span>
          <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-accent-emerald); font-family: var(--font-mono);">${totalTasks}</div>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Target Date</span>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-primary);">${formatShortDate(plan.goal?.targetDate)}</div>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-implement">Cancel</button>
        <button type="button" class="btn btn-primary btn-sm" id="btn-confirm-implement" style="font-weight: 800; padding: 8px 18px;">
          Implement Plan
        </button>
      </div>

    </div>
  `;

  modalRoot.appendChild(modalEl);

  const close = () => {
    if (modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
  };

  modalEl.querySelector('#btn-close-confirm').onclick = close;
  modalEl.querySelector('#btn-cancel-implement').onclick = close;
  modalEl.onclick = (e) => { if (e.target === modalEl) close(); };

  modalEl.querySelector('#btn-confirm-implement').onclick = async () => {
    close();
    await onConfirm();
  };
}

// ==========================================
// 5. API KEY PROMPT MODAL
// ==========================================

// ==========================================
// 5. OLLAMA SETUP & READINESS MODAL (Phase 4)
// ==========================================

function openOllamaSetupModal(err, onRetry, onContinueOffline) {
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  }

  const modalEl = document.createElement('div');
  modalEl.className = 'modal-backdrop animate-fade-in';
  modalEl.style.cssText = 'position: fixed; inset: 0; background: rgba(7, 11, 20, 0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px;';

  const isModelMissing = err.code === 'MODEL_MISSING';
  const installCmd = err.installCommand || 'ollama pull gemma4:e2b';

  modalEl.innerHTML = `
    <div class="card animate-scale-up" style="max-width: 480px; width: 100%; border: 1px solid var(--color-border); box-shadow: var(--shadow-lg); padding: 24px; border-radius: var(--radius-lg); background: var(--color-bg-surface);">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
        <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px; color: var(--color-text-main);">
          🦙 Local AI Setup Required
        </h3>
        <button class="btn btn-ghost btn-xs btn-icon" id="btn-close-ollama-modal">${getIcon('x')}</button>
      </div>

      <p style="font-size: 0.88rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 14px;">
        ${isModelMissing
          ? 'Ollama is running, but the required Gemma model (<strong>gemma4:e2b</strong>) is not installed on your system yet.'
          : 'The local Ollama service could not be reached at <code>http://127.0.0.1:11434</code>. Please ensure Ollama is started on your computer.'}
      </p>

      <div style="background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 16px;">
        <div style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 6px;">
          ${isModelMissing ? 'Download Model Command:' : 'Start Ollama Command:'}
        </div>
        <code style="font-family: var(--font-mono); font-size: 0.86rem; color: var(--color-primary); display: block; word-break: break-all;">
          ${isModelMissing ? installCmd : 'ollama serve'}
        </code>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
        <button type="button" class="btn btn-ghost btn-sm" id="btn-ollama-offline" style="font-size: 0.8rem; color: var(--color-text-secondary);">
          ⚡ Generate Offline
        </button>
        
        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-ollama-modal">
            Cancel
          </button>
          <button type="button" class="btn btn-primary btn-sm" id="btn-retry-ollama-modal" style="font-weight: 700; padding: 7px 16px;">
            Retry Connection
          </button>
        </div>
      </div>

    </div>
  `;

  modalRoot.appendChild(modalEl);

  const close = () => {
    if (modalEl.parentNode) modalEl.parentNode.removeChild(modalEl);
  };

  modalEl.querySelector('#btn-close-ollama-modal').onclick = close;
  modalEl.querySelector('#btn-cancel-ollama-modal').onclick = close;
  modalEl.onclick = (e) => { if (e.target === modalEl) close(); };

  modalEl.querySelector('#btn-ollama-offline').onclick = () => {
    close();
    onContinueOffline();
  };

  modalEl.querySelector('#btn-retry-ollama-modal').onclick = () => {
    close();
    onRetry();
  };
}

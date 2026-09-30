/**
 * Akshay's 12-Month AI/ML Career OS - AI Modals & Approval Dialogs (Phase 8)
 * 
 * Strict Phase 8 Rules:
 * - Preview proposed changes with Action, Current, Proposed, Apply, Cancel (Sections 34, 35)
 * - Never silently modify user data; explicit user confirmation required
 * - AI Data Permissions & Category Toggles (Section 43)
 */

import { getState } from '../data/storage.js';
import { getIcon, ICONS } from './icons.js';
import { closeModal, initModalContainer } from './modals.js';
import {
  applyActionProposal,
  cancelActionProposal,
  createActionProposal,
  generateDailyStudyPlan,
  getAiSettings,
  updateAiSettings,
  getAiDataPermissions,
  updateAiDataPermissions
} from '../services/aiEngine.js';

// ==========================================
// 1. ACTION PROPOSAL & APPROVAL PREVIEW MODAL (Sections 34, 35)
// ==========================================

export function openActionProposalModal(proposal, onApplied = null, onCancelled = null) {
  initModalContainer();
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 520px; animation: modalSlideUp 0.25s ease;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('sparkles', 'text-cyan')}
            <h3 class="modal-title">AI Action Proposal</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
          <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin: 0;">
            The AI Mentor has proposed a change. Review the proposed action below.
            <strong>No data is modified without your explicit approval.</strong>
          </p>

          <div class="card" style="padding: 12px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700; margin-bottom: 4px;">
              Action
            </div>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary);">
              ${proposal.description || proposal.action_type}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="card" style="padding: 12px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2);">
              <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-accent-rose); font-weight: 700; margin-bottom: 4px;">
                Current State
              </div>
              <div style="font-size: 0.85rem; color: var(--color-text-secondary); word-break: break-word;">
                ${proposal.current_state || 'None / Not Scheduled'}
              </div>
            </div>

            <div class="card" style="padding: 12px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2);">
              <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-accent-emerald); font-weight: 700; margin-bottom: 4px;">
                Proposed State
              </div>
              <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary); word-break: break-word;">
                ${proposal.proposed_state || 'Proposed Value'}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-secondary" id="btn-cancel-proposal">
            Cancel
          </button>
          <button type="button" class="btn btn-primary" id="btn-apply-proposal">
            ${getIcon('check')} Apply Changes
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = () => {
    cancelActionProposal(proposal.id);
    closeModal();
    if (onCancelled) onCancelled();
  };

  document.getElementById('btn-cancel-proposal').onclick = () => {
    cancelActionProposal(proposal.id);
    closeModal();
    if (onCancelled) onCancelled();
  };

  document.getElementById('btn-apply-proposal').onclick = () => {
    applyActionProposal(proposal.id);
    closeModal();
    if (onApplied) onApplied(proposal);
  };
}

// ==========================================
// 2. STUDY PLANNER MODAL (Section 26)
// ==========================================

export function openStudyPlannerModal(onPlanApplied = null) {
  initModalContainer();
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const container = document.getElementById('modal-root');

  let currentProposal = generateDailyStudyPlan(4);

  function renderDialog() {
    container.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-dialog" style="max-width: 600px; max-height: 90vh; display: flex; flex-direction: column;">
          <div class="modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${getIcon('clock', 'text-cyan')}
              <h3 class="modal-title">AI Study Planner — Plan My Day</h3>
            </div>
            <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
          </div>

          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px; overflow-y: auto; flex: 1;">
            <p style="font-size: 0.88rem; color: var(--color-text-secondary); margin: 0;">
              Specify your available study hours for <strong>${activeDate}</strong>.
              The AI generates an optimized time-blocked sequence based on your real daily tasks, DSA targets, and revisions.
            </p>

            <div style="display: flex; align-items: center; gap: 12px; background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
              <label style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-primary); white-space: nowrap;">
                Available Hours Today:
              </label>
              <select id="select-hours" class="form-input" style="width: 110px;">
                <option value="2" ${currentProposal.availableHours === 2 ? 'selected' : ''}>2 Hours</option>
                <option value="3" ${currentProposal.availableHours === 3 ? 'selected' : ''}>3 Hours</option>
                <option value="4" ${currentProposal.availableHours === 4 ? 'selected' : ''}>4 Hours</option>
                <option value="5" ${currentProposal.availableHours === 5 ? 'selected' : ''}>5 Hours</option>
                <option value="6" ${currentProposal.availableHours === 6 ? 'selected' : ''}>6 Hours</option>
                <option value="8" ${currentProposal.availableHours === 8 ? 'selected' : ''}>8 Hours (Weekend)</option>
              </select>
              <button class="btn btn-secondary btn-sm" id="btn-recalculate-plan" style="margin-left: auto;">
                ${getIcon('sparkles')} Recalculate
              </button>
            </div>

            <div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700; margin-bottom: 8px;">
                Proposed Schedule (${currentProposal.schedule.length} Time Blocks)
              </div>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${currentProposal.schedule.map((b, idx) => `
                  <div class="card" style="padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-left: 3px solid ${
                    b.category === 'DSA' ? 'var(--color-accent-amber)' :
                    b.category === 'AI/ML' ? 'var(--color-primary)' :
                    b.category === 'Project' ? 'var(--color-accent-purple)' :
                    'var(--color-accent-emerald)'
                  };">
                    <div>
                      <div style="font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700; color: var(--color-text-muted);">
                        ${b.slot} (${b.durationMinutes}m)
                      </div>
                      <div style="font-size: 0.92rem; font-weight: 600; color: var(--color-text-primary); margin-top: 2px;">
                        ${b.activity}
                      </div>
                    </div>
                    <span class="badge ${
                      b.category === 'DSA' ? 'badge-amber' :
                      b.category === 'AI/ML' ? 'badge-cyan' :
                      b.category === 'Project' ? 'badge-purple' :
                      'badge-emerald'
                    }" style="font-size: 0.7rem;">
                      ${b.category}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="font-size: 0.78rem; color: var(--color-text-muted); background: rgba(56, 189, 248, 0.05); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid rgba(56, 189, 248, 0.2);">
              ℹ️ Approving will save this structured plan to your AI Plans registry. Existing tasks are preserved.
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="btn btn-secondary" id="btn-close-dialog">Cancel</button>
            <button type="button" class="btn btn-primary" id="btn-approve-plan">
              ${getIcon('check')} Approve & Save Schedule
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-modal').onclick = closeModal;
    document.getElementById('btn-close-dialog').onclick = closeModal;

    document.getElementById('btn-recalculate-plan').onclick = () => {
      const h = parseInt(document.getElementById('select-hours').value, 10) || 4;
      currentProposal = generateDailyStudyPlan(h);
      renderDialog();
    };

    document.getElementById('btn-approve-plan').onclick = () => {
      // Create and apply proposal
      const prop = createActionProposal(
        'apply_study_plan',
        `Approve daily study plan for ${activeDate} (${currentProposal.availableHours}h)`,
        'Unscheduled',
        `${currentProposal.schedule.length} time-blocked slots`,
        'apply_study_plan',
        { plan: currentProposal }
      );
      applyActionProposal(prop.id);
      closeModal();
      if (onPlanApplied) onPlanApplied(currentProposal);
    };
  }

  renderDialog();
}

// ==========================================
// 3. RESCHEDULE TASK MODAL (Section 25)
// ==========================================

export function openRescheduleTaskModal(task, onRescheduled = null) {
  initModalContainer();
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 460px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('calendar', 'text-cyan')}
            <h3 class="modal-title">Reschedule Task</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="card" style="padding: 12px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Task</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin-top: 2px;">
              ${task.title}
            </div>
            <div style="font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 4px;">
              Current Date: <strong style="color: var(--color-accent-rose);">${task.date}</strong>
            </div>
          </div>

          <div>
            <label class="form-label">New Target Date *</label>
            <input type="date" id="input-new-date" class="form-input" value="${activeDate}" min="2026-10-01" max="2027-09-30" required>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-secondary" id="btn-cancel">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-confirm-reschedule">
            ${getIcon('check')} Propose & Reschedule
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel').onclick = closeModal;

  document.getElementById('btn-confirm-reschedule').onclick = () => {
    const newDate = document.getElementById('input-new-date').value;
    if (!newDate) return;

    const prop = createActionProposal(
      'reschedule_task',
      `Reschedule task: "${task.title}"`,
      task.date,
      newDate,
      'reschedule_task',
      { taskId: task.id, newDate }
    );

    applyActionProposal(prop.id);
    closeModal();
    if (onRescheduled) onRescheduled(newDate);
  };
}

// ==========================================
// 4. AI SETTINGS & DATA PRIVACY MODAL (Sections 38, 43)
// ==========================================

export function openAiSettingsModal(onSaved = null) {
  initModalContainer();
  const settings = getAiSettings();
  const permissions = getAiDataPermissions();
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 620px; max-height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('settings', 'text-cyan')}
            <h3 class="modal-title">AI Settings & Data Privacy Controls</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="ai-settings-form" style="display: flex; flex-direction: column; overflow-y: auto; flex: 1;">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 18px;">
            <!-- AI Feature Toggles -->
            <div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 8px;">
                Feature Configuration
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <label style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; cursor: pointer;">
                  <input type="checkbox" id="set-insights" ${settings.enable_insights ? 'checked' : ''}>
                  <span>Enable AI Insights Engine</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; cursor: pointer;">
                  <input type="checkbox" id="set-briefing" ${settings.daily_briefing ? 'checked' : ''}>
                  <span>Enable Daily Briefing</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; cursor: pointer;">
                  <input type="checkbox" id="set-mentor" ${settings.ai_mentor ? 'checked' : ''}>
                  <span>Enable AI Personal Mentor Chat</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; cursor: pointer;">
                  <input type="checkbox" id="set-priorities" ${settings.priority_recommendations ? 'checked' : ''}>
                  <span>Enable Priority Recommendations</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; cursor: pointer;">
                  <input type="checkbox" id="set-planner" ${settings.study_planning ? 'checked' : ''}>
                  <span>Enable Study Planner ("Plan My Day")</span>
                </label>
              </div>
            </div>

            <!-- AI Data Privacy Permissions (Section 43) -->
            <div style="border-top: 1px solid var(--color-border-subtle); pt: 14px; padding-top: 14px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-primary);">
                  Data Privacy Category Permissions (Section 43)
                </span>
                <span class="badge badge-emerald" style="font-size: 0.65rem;">Granular Control</span>
              </div>
              <p style="font-size: 0.78rem; color: var(--color-text-secondary); margin: 0 0 10px 0;">
                Disabling a category completely excludes that data from AI context synthesis.
              </p>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                  <input type="checkbox" id="perm-roadmap" ${permissions.roadmap ? 'checked' : ''}>
                  <span>Roadmap & Prime Tracks</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                  <input type="checkbox" id="perm-study" ${permissions.study ? 'checked' : ''}>
                  <span>Daily Tasks & Sessions</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                  <input type="checkbox" id="perm-dsa" ${permissions.dsa ? 'checked' : ''}>
                  <span>DSA Problems & Revisions</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                  <input type="checkbox" id="perm-projects" ${permissions.projects ? 'checked' : ''}>
                  <span>Projects & Repositories</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                  <input type="checkbox" id="perm-career" ${permissions.career ? 'checked' : ''}>
                  <span>Career Profile & Resume</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                  <input type="checkbox" id="perm-apps" ${permissions.applications ? 'checked' : ''}>
                  <span>Internship Applications</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                  <input type="checkbox" id="perm-habits" ${permissions.habits ? 'checked' : ''}>
                  <span>Habits & Streaks</span>
                </label>
              </div>
            </div>

            <!-- Provider Abstraction & Security (Sections 39, 42) -->
            <div style="border-top: 1px solid var(--color-border-subtle); padding-top: 14px;">
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 6px;">
                Provider Abstraction
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label class="form-label" style="font-size: 0.75rem;">Active Provider</label>
                  <select id="set-provider" class="form-input">
                    <option value="heuristic_local" selected>Local Deterministic Engine (Zero API Calls)</option>
                    <option value="custom_proxy">Custom Server Proxy (Private Env Var)</option>
                  </select>
                </div>
                <div>
                  <label class="form-label" style="font-size: 0.75rem;">Model Identifier</label>
                  <input type="text" id="set-model" class="form-input" value="${settings.model || 'mentor-v1'}" readonly>
                </div>
              </div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 6px;">
                🔒 Zero client-side API key exposure. All external API keys remain strictly server-side.
              </div>
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-settings">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-settings').onclick = closeModal;

  document.getElementById('ai-settings-form').onsubmit = (e) => {
    e.preventDefault();

    updateAiSettings({
      enable_insights: document.getElementById('set-insights').checked,
      daily_briefing: document.getElementById('set-briefing').checked,
      ai_mentor: document.getElementById('set-mentor').checked,
      priority_recommendations: document.getElementById('set-priorities').checked,
      study_planning: document.getElementById('set-planner').checked
    });

    updateAiDataPermissions({
      roadmap: document.getElementById('perm-roadmap').checked,
      study: document.getElementById('perm-study').checked,
      dsa: document.getElementById('perm-dsa').checked,
      projects: document.getElementById('perm-projects').checked,
      career: document.getElementById('perm-career').checked,
      applications: document.getElementById('perm-apps').checked,
      habits: document.getElementById('perm-habits').checked
    });

    closeModal();
    if (onSaved) onSaved();
  };
}

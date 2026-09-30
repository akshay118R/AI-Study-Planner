/**
 * Akshay's 12-Month AI/ML Career OS - AI Career Intelligence & Mentor View (Phase 8)
 * 
 * Strict Phase 8 Rules:
 * - Real application data only (NEVER fabricate progress, hours, or outcomes)
 * - No outcome probability, company ranking, or selection predictions (Section 50)
 * - Neutral terminology ("Needs Attention", never "Bad", "Failure", etc.) (Section 5)
 * - Recommendations only (no automatic modification of goals, roadmap, or priorities) (Section 3, 34)
 * - Action Approval System: all mutations require explicit user confirmation (Section 34, 35)
 * - Data Privacy Controls: respect user's data category permissions (Section 43)
 * - Response Format: SHORT ANSWER -> WHY -> NEXT ACTIONS (Section 31)
 */

import { getState } from '../data/storage.js';
import { getIcon, ICONS } from '../components/icons.js';
import {
  getTodayAiBrief,
  getDailyPriorityRecommendations,
  getWhatShouldIDoNext,
  getLearningGaps,
  getDsaIntelligence,
  getProjectIntelligence,
  getCareerIntelligence,
  getConsistencyInsights,
  getDeadlineRadar,
  getGoalRiskDetection,
  getPlanVsActual,
  getCatchUpItems,
  getAiMentorConversations,
  getAiMentorMessages,
  sendAiMentorMessage,
  generateWeeklyAiReview,
  generateMonthlyAiReview,
  getAiSettings,
  getAiDataPermissions,
  getAiAuditLogs,
  getAiInsightsHistory,
  dismissInsight,
  restoreInsight,
  getActionProposals
} from '../services/aiEngine.js';
import {
  openActionProposalModal,
  openStudyPlannerModal,
  openRescheduleTaskModal,
  openAiSettingsModal
} from '../components/aiModals.js';

let activeAiTab = 'overview'; // 'overview' | 'mentor' | 'intelligence' | 'planner' | 'reviews' | 'history'
let activeDomainTab = 'dsa'; // 'dsa' | 'projects' | 'career' | 'habits'

export function renderAi(container) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const settings = getAiSettings();

  // If AI insights disabled globally (Fallback mode Section 41)
  if (!settings.enable_insights) {
    container.innerHTML = `
      <div class="view-container animate-fade-in" style="padding-bottom: 80px;">
        <div class="card" style="padding: 30px; text-align: center; max-width: 600px; margin: 40px auto;">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">🔒</div>
          <h2 style="font-size: 1.3rem; margin-bottom: 8px;">AI Insights Are Currently Disabled</h2>
          <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 20px;">
            Existing tracking systems continue functioning normally. You can re-enable AI features anytime in AI Settings.
          </p>
          <button class="btn btn-primary" id="btn-re-enable-ai">
            ${getIcon('settings')} Open AI Settings
          </button>
        </div>
      </div>
    `;
    const btnReEnable = container.querySelector('#btn-re-enable-ai');
    if (btnReEnable) btnReEnable.onclick = () => openAiSettingsModal(() => renderAi(container));
    return;
  }

  // Real Data Analysis
  const brief = getTodayAiBrief();
  const nextActions = getWhatShouldIDoNext();
  const gaps = getLearningGaps();
  const pendingProposals = getActionProposals().filter(p => p.status === 'Pending');

  container.innerHTML = `
    <div class="view-container animate-fade-in" style="padding-bottom: 80px;">
      <!-- Top Title & Navigation Bar -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-md); flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h1 class="view-title" style="margin-bottom: 2px;">
              ${getIcon('brain', 'text-cyan')} AI CAREER INTELLIGENCE & PERSONAL MENTOR
            </h1>
            <span class="badge badge-cyan" style="font-size: 0.7rem; font-weight: 700;">Phase 8</span>
          </div>
          <p class="view-subtitle" style="margin: 0;">
            Fact-Grounded Personal Mentorship · Active Date: <strong>${activeDate}</strong> · Provider: <code>${settings.provider}</code>
          </p>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" id="btn-open-planner">
            ${getIcon('clock')} Plan My Day
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-open-ai-settings">
            ${getIcon('settings')} AI Settings
          </button>
        </div>
      </div>

      <!-- Action Proposals Alert Banner (Section 34, 35) -->
      ${pendingProposals.length > 0 ? `
        <div class="card" style="margin-bottom: var(--space-md); background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">💡</span>
            <div>
              <div style="font-size: 0.88rem; font-weight: 700; color: var(--color-text-primary);">
                ${pendingProposals.length} Action Proposal(s) Pending Your Approval
              </div>
              <div style="font-size: 0.78rem; color: var(--color-text-secondary);">
                ${pendingProposals[0].description}
              </div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-review-pending-proposal" data-prop-id="${pendingProposals[0].id}">
            Review & Approve
          </button>
        </div>
      ` : ''}

      <!-- Top AI Intelligence Quick Metrics (Section 1: AI Dashboard) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); gap: 10px; margin-bottom: var(--space-md);">
        <!-- Today Focus -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-primary);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Today's Focus</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: var(--color-text-primary); margin: 3px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${brief.primaryTask ? brief.primaryTask.title : 'All Done'}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">Primary Task</div>
        </div>

        <!-- DSA Intelligence -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-amber);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">DSA Target</div>
          <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-text-primary); margin: 2px 0;">
            ${brief.dsaTargetInfo ? `${brief.dsaTargetInfo.solvedToday} / ${brief.dsaTargetInfo.target}` : 'N/A'}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${brief.dsaTargetInfo ? `${brief.dsaTargetInfo.remaining} Remaining` : 'Disabled'}</div>
        </div>

        <!-- Project Next Action -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-purple);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Project Target</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: var(--color-accent-purple); margin: 3px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${brief.projectTask ? brief.projectTask.title : 'On Schedule'}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">Active Building</div>
        </div>

        <!-- Learning Gaps -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid ${gaps.hasGaps ? 'var(--color-accent-rose)' : 'var(--color-accent-emerald)'};">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Needs Attention</div>
          <div style="font-size: 1.2rem; font-weight: 800; color: ${gaps.hasGaps ? 'var(--color-accent-rose)' : 'var(--color-accent-emerald)'}; margin: 2px 0;">
            ${gaps.gaps.length}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${gaps.hasGaps ? 'Gaps Detected' : 'All Clear'}</div>
        </div>

        <!-- Next Actions -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-cyan);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Next Action</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: var(--color-accent-cyan); margin: 3px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${nextActions.actions[0] ? nextActions.actions[0].title : 'All Clear'}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${nextActions.actions.length} In Queue</div>
        </div>
      </div>

      <!-- Navigation Sub-Tabs -->
      <div class="projects-subnav-bar" style="margin-bottom: var(--space-md); overflow-x: auto;">
        <button class="filter-pill ${activeAiTab === 'overview' ? 'active' : ''}" data-aitab="overview">
          ${getIcon('dashboard')} Insights & Today's Brief
        </button>
        <button class="filter-pill ${activeAiTab === 'mentor' ? 'active' : ''}" data-aitab="mentor">
          ${getIcon('bot')} AI Mentor Chat
        </button>
        <button class="filter-pill ${activeAiTab === 'intelligence' ? 'active' : ''}" data-aitab="intelligence">
          ${getIcon('brain')} Domain Intelligence
        </button>
        <button class="filter-pill ${activeAiTab === 'planner' ? 'active' : ''}" data-aitab="planner">
          ${getIcon('clock')} Study Planner
        </button>
        <button class="filter-pill ${activeAiTab === 'reviews' ? 'active' : ''}" data-aitab="reviews">
          ${getIcon('review')} Reviews & Catch-Up
        </button>
        <button class="filter-pill ${activeAiTab === 'history' ? 'active' : ''}" data-aitab="history">
          ${getIcon('fileText')} History & Audit
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="ai-tab-content"></div>
    </div>
  `;

  // Attach Sub-tab Handlers
  container.querySelectorAll('[data-aitab]').forEach(btn => {
    btn.onclick = () => {
      activeAiTab = btn.getAttribute('data-aitab');
      renderAi(container);
    };
  });

  // Action Buttons
  const btnPlanner = container.querySelector('#btn-open-planner');
  if (btnPlanner) btnPlanner.onclick = () => openStudyPlannerModal(() => renderAi(container));

  const btnSettings = container.querySelector('#btn-open-ai-settings');
  if (btnSettings) btnSettings.onclick = () => openAiSettingsModal(() => renderAi(container));

  const btnReviewProp = container.querySelector('#btn-review-pending-proposal');
  if (btnReviewProp) {
    btnReviewProp.onclick = () => {
      const propId = btnReviewProp.getAttribute('data-prop-id');
      const prop = getActionProposals().find(p => p.id === propId);
      if (prop) openActionProposalModal(prop, () => renderAi(container), () => renderAi(container));
    };
  }

  // Render Sub-Tab Content
  const tabContent = container.querySelector('#ai-tab-content') || document.getElementById('ai-tab-content');
  if (tabContent) {
    if (activeAiTab === 'overview') {
      renderOverviewTab(tabContent, container);
    } else if (activeAiTab === 'mentor') {
      renderMentorTab(tabContent, container);
    } else if (activeAiTab === 'intelligence') {
      renderIntelligenceTab(tabContent, container);
    } else if (activeAiTab === 'planner') {
      renderPlannerTab(tabContent, container);
    } else if (activeAiTab === 'reviews') {
      renderReviewsTab(tabContent, container);
    } else if (activeAiTab === 'history') {
      renderHistoryTab(tabContent, container);
    }
  }
}

// ==========================================
// SUBVIEW 1: OVERVIEW & TODAY'S BRIEF (Sections 1, 2, 3, 4, 5, 18, 19)
// ==========================================

function renderOverviewTab(container, rootContainer) {
  const brief = getTodayAiBrief();
  const nextActions = getWhatShouldIDoNext();
  const priorities = getDailyPriorityRecommendations();
  const gaps = getLearningGaps();
  const deadlines = getDeadlineRadar();
  const risks = getGoalRiskDetection();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- SECTION 2: TODAY'S AI BRIEF -->
      <div class="card" style="padding: 16px; border-left: 4px solid var(--color-primary); background: linear-gradient(135deg, var(--color-bg-surface), var(--color-bg-surface-elevated));">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('sparkles', 'text-cyan')}
            <h3 style="font-size: 1.1rem; margin: 0; font-weight: 800;">TODAY'S AI BRIEF</h3>
          </div>
          <span class="badge badge-emerald" style="font-size: 0.72rem;">Synchronized with Database</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 14px;">
          <!-- 1. Primary Learning -->
          <div style="background: var(--color-bg-base); padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">1. Primary Learning</div>
            <div style="font-size: 0.92rem; font-weight: 700; color: var(--color-text-primary); margin-top: 2px;">
              ${brief.primaryTask ? brief.primaryTask.title : 'No pending tasks'}
            </div>
          </div>

          <!-- 2. DSA Target -->
          <div style="background: var(--color-bg-base); padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">2. DSA Target</div>
            <div style="font-size: 0.92rem; font-weight: 700; color: var(--color-text-primary); margin-top: 2px;">
              ${brief.dsaTargetInfo ? `${brief.dsaTargetInfo.remaining} problem(s) remaining` : 'Target met / N/A'}
            </div>
          </div>

          <!-- 3. Project Task -->
          <div style="background: var(--color-bg-base); padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">3. Project Task</div>
            <div style="font-size: 0.92rem; font-weight: 700; color: var(--color-text-primary); margin-top: 2px;">
              ${brief.projectTask ? brief.projectTask.title : 'No active project task'}
            </div>
          </div>

          <!-- 4. Career Task -->
          <div style="background: var(--color-bg-base); padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">4. Career Task</div>
            <div style="font-size: 0.92rem; font-weight: 700; color: var(--color-text-primary); margin-top: 2px;">
              ${brief.careerTask ? brief.careerTask.title : 'No pending career follow-up'}
            </div>
          </div>

          <!-- 5. Revision Item -->
          <div style="background: var(--color-bg-base); padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">5. Revision Item</div>
            <div style="font-size: 0.92rem; font-weight: 700; color: var(--color-text-primary); margin-top: 2px;">
              ${brief.revisionItem ? `${brief.revisionItem.problem_title} (${brief.revisionItem.pattern})` : 'Revision queue clear'}
            </div>
          </div>
        </div>

        <!-- WHY THIS MATTERS -->
        <div style="background: rgba(56, 189, 248, 0.05); padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid rgba(56, 189, 248, 0.2);">
          <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-accent-cyan); font-weight: 700; margin-bottom: 4px;">
            WHY THIS MATTERS
          </div>
          <div style="font-size: 0.88rem; color: var(--color-text-secondary); line-height: 1.5;">
            ${brief.whyThisMatters}
          </div>
        </div>
      </div>

      <!-- TWO-COLUMN GRID: WHAT SHOULD I DO NEXT & PRIORITY ENGINE -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
        <!-- SECTION 4: WHAT SHOULD I DO NEXT? -->
        <div class="card" style="padding: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${getIcon('target', 'text-cyan')}
              <h3 style="font-size: 1rem; margin: 0; font-weight: 800;">WHAT SHOULD I DO NEXT?</h3>
            </div>
            <span style="font-size: 0.72rem; color: var(--color-text-muted);">Ordered Queue</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${nextActions.actions.map(act => `
              <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; flex-shrink: 0;">
                  ${act.step}
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 0.9rem; font-weight: 700; color: var(--color-text-primary);">
                    ${act.title}
                  </div>
                  <div style="font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 2px;">
                    ${act.reason}
                  </div>
                </div>
                <span class="badge badge-cyan" style="font-size: 0.65rem;">${act.category}</span>
              </div>
            `).join('')}
          </div>

          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 10px; text-align: center;">
            ${nextActions.note}
          </div>
        </div>

        <!-- SECTION 3: DAILY PRIORITY ENGINE -->
        <div class="card" style="padding: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${getIcon('award', 'text-amber')}
              <h3 style="font-size: 1rem; margin: 0; font-weight: 800;">DAILY PRIORITY ENGINE</h3>
            </div>
            <span style="font-size: 0.72rem; color: var(--color-text-muted);">${priorities.totalPending || 0} Pending</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <!-- High Priority -->
            <div>
              <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-accent-rose); font-weight: 700; margin-bottom: 4px;">
                HIGH PRIORITY (${priorities.high?.length || 0})
              </div>
              ${priorities.high?.length > 0 ? priorities.high.slice(0, 3).map(h => `
                <div style="padding: 6px 10px; background: rgba(239, 68, 68, 0.05); border-left: 3px solid var(--color-accent-rose); border-radius: var(--radius-sm); margin-bottom: 4px; font-size: 0.85rem;">
                  <strong>${h.title}</strong> — <span style="font-size: 0.75rem; color: var(--color-text-muted);">${h.reason}</span>
                </div>
              `).join('') : '<div style="font-size: 0.8rem; color: var(--color-text-muted);">No urgent tasks</div>'}
            </div>

            <!-- Medium Priority -->
            <div>
              <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-accent-amber); font-weight: 700; margin-bottom: 4px;">
                MEDIUM PRIORITY (${priorities.medium?.length || 0})
              </div>
              ${priorities.medium?.length > 0 ? priorities.medium.slice(0, 2).map(m => `
                <div style="padding: 6px 10px; background: rgba(245, 158, 11, 0.05); border-left: 3px solid var(--color-accent-amber); border-radius: var(--radius-sm); margin-bottom: 4px; font-size: 0.85rem;">
                  <strong>${m.title}</strong> — <span style="font-size: 0.75rem; color: var(--color-text-muted);">${m.reason}</span>
                </div>
              `).join('') : '<div style="font-size: 0.8rem; color: var(--color-text-muted);">No medium tasks</div>'}
            </div>

            <!-- Low Priority -->
            <div>
              <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700; margin-bottom: 4px;">
                LOW PRIORITY (${priorities.low?.length || 0})
              </div>
              ${priorities.low?.length > 0 ? priorities.low.slice(0, 2).map(l => `
                <div style="padding: 6px 10px; background: var(--color-bg-base); border-left: 3px solid var(--color-border-subtle); border-radius: var(--radius-sm); margin-bottom: 4px; font-size: 0.85rem;">
                  <strong>${l.title}</strong>
                </div>
              `).join('') : '<div style="font-size: 0.8rem; color: var(--color-text-muted);">No low tasks</div>'}
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 5 & 18: LEARNING GAPS & GOAL RISK DETECTION -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
        <!-- Learning Gap Detection (Neutral phrasing: "NEEDS ATTENTION") -->
        <div class="card" style="padding: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${getIcon('alertCircle', 'text-amber')}
              <h3 style="font-size: 1rem; margin: 0; font-weight: 800;">LEARNING GAP DETECTION</h3>
            </div>
            <span class="badge ${gaps.hasGaps ? 'badge-amber' : 'badge-emerald'}" style="font-size: 0.7rem;">
              ${gaps.hasGaps ? 'Needs Attention' : 'Optimal'}
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${gaps.hasGaps ? gaps.gaps.map(g => `
              <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle); border-left: 3px solid var(--color-accent-amber);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-primary);">${g.area}</span>
                  <span style="font-size: 0.68rem; color: var(--color-accent-amber); font-weight: 700;">NEEDS ATTENTION</span>
                </div>
                <div style="font-size: 0.82rem; color: var(--color-text-secondary); margin-top: 3px;">
                  ${g.description}
                </div>
                <div style="font-size: 0.75rem; color: var(--color-accent-cyan); margin-top: 4px;">
                  💡 ${g.suggestion}
                </div>
              </div>
            `).join('') : `
              <div style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center; padding: 20px 0;">
                All tracked learning categories are aligned with current schedule.
              </div>
            `}
          </div>
        </div>

        <!-- SECTION 19: DEADLINE RADAR -->
        <div class="card" style="padding: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${getIcon('clock', 'text-cyan')}
              <h3 style="font-size: 1rem; margin: 0; font-weight: 800;">DEADLINE RADAR</h3>
            </div>
            <span style="font-size: 0.72rem; color: var(--color-text-muted);">Chronological Feed</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">
            ${deadlines.length > 0 ? deadlines.slice(0, 5).map(dl => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border-left: 3px solid ${dl.isOverdue ? 'var(--color-accent-rose)' : 'var(--color-accent-cyan)'};">
                <div>
                  <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-primary);">
                    ${dl.title}
                  </div>
                  <div style="font-size: 0.72rem; color: var(--color-text-muted);">
                    ${dl.type} · ${dl.source}
                  </div>
                </div>
                <span class="badge ${dl.isOverdue ? 'badge-rose' : 'badge-cyan'}" style="font-size: 0.7rem; font-family: var(--font-mono);">
                  ${dl.date} ${dl.isOverdue ? '(Overdue)' : ''}
                </span>
              </div>
            `).join('') : `
              <div style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center; padding: 20px 0;">
                No upcoming deadlines on radar.
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ========================================== 
// SUBVIEW 2: AI MENTOR CHAT (Sections 29, 30, 31, 32, 33)
// ==========================================

function renderMentorTab(container, rootContainer) {
  const messages = getAiMentorMessages();

  const QUICK_QUESTIONS = [
    'What should I focus on today?',
    'How many DSA problems did I solve this week?',
    'What projects am I currently building?',
    'What is overdue?',
    'What should I revise?',
    'What career tasks are pending?'
  ];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; height: 600px; max-height: calc(100vh - 220px); background: var(--color-bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--color-border-subtle); overflow: hidden;">
      <!-- Chat Header -->
      <div style="padding: 12px 18px; border-bottom: 1px solid var(--color-border-subtle); display: flex; align-items: center; justify-content: space-between; background: var(--color-bg-surface-elevated);">
        <div style="display: flex; align-items: center; gap: 10px;">
          ${getIcon('bot', 'text-cyan')}
          <div>
            <div style="font-size: 0.95rem; font-weight: 800; color: var(--color-text-primary);">
              Career & Placement Mentor
            </div>
            <div style="font-size: 0.72rem; color: var(--color-accent-emerald);">
              ● Connected to Active Database Context
            </div>
          </div>
        </div>
        <span class="badge badge-cyan" style="font-size: 0.68rem;">Short Answer · Why · Next Actions</span>
      </div>

      <!-- Quick Questions Bar -->
      <div style="padding: 8px 14px; background: var(--color-bg-base); border-bottom: 1px solid var(--color-border-subtle); display: flex; gap: 6px; overflow-x: auto;">
        ${QUICK_QUESTIONS.map(q => `
          <button class="btn btn-secondary btn-xs btn-quick-chat" data-q="${q}" style="white-space: nowrap; font-size: 0.75rem;">
            ${q}
          </button>
        `).join('')}
      </div>

      <!-- Messages Scroll Area -->
      <div id="ai-chat-messages" style="flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px;">
        ${messages.map(m => `
          <div style="display: flex; flex-direction: column; align-self: ${m.sender === 'user' ? 'flex-end' : 'flex-start'}; max-width: ${m.sender === 'user' ? '75%' : '88%'};">
            <div style="font-size: 0.7rem; color: var(--color-text-muted); margin-bottom: 3px; align-self: ${m.sender === 'user' ? 'flex-end' : 'flex-start'};">
              ${m.sender === 'user' ? 'You' : 'AI Mentor'} · ${m.timestamp ? m.timestamp.split('T')[1].substring(0, 5) : ''}
            </div>

            <div style="padding: 12px 14px; border-radius: var(--radius-md); font-size: 0.88rem; line-height: 1.5; ${m.sender === 'user'
      ? 'background: var(--color-primary); color: white;'
      : 'background: var(--color-bg-base); color: var(--color-text-primary); border: 1px solid var(--color-border-subtle); border-left: 3px solid var(--color-accent-cyan);'
    }">
              ${m.format ? `
                <div style="margin-bottom: 8px;">
                  <strong style="color: var(--color-text-primary); font-size: 0.92rem;">${m.format.short_answer}</strong>
                </div>
                <div style="font-size: 0.82rem; color: var(--color-text-secondary); margin-bottom: 8px;">
                  <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--color-accent-cyan);">WHY:</span> ${m.format.why}
                </div>
                ${m.format.next_actions?.length > 0 ? `
                  <div style="font-size: 0.82rem;">
                    <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--color-accent-emerald); margin-bottom: 3px;">NEXT ACTIONS:</div>
                    <ol style="margin: 0; padding-left: 18px; color: var(--color-text-primary);">
                      ${m.format.next_actions.map(act => `<li>${act}</li>`).join('')}
                    </ol>
                  </div>
                ` : ''}
              ` : `
                <div style="white-space: pre-wrap;">${m.text}</div>
              `}

              ${m.data_sources?.length > 0 ? `
                <div style="margin-top: 8px; pt: 6px; padding-top: 6px; border-top: 1px solid var(--color-border-subtle); font-size: 0.68rem; color: var(--color-text-muted);">
                  📊 Audited Sources: ${m.data_sources.join(', ')}
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Chat Input Bar -->
      <form id="ai-chat-form" style="padding: 12px 16px; border-top: 1px solid var(--color-border-subtle); display: flex; gap: 10px; background: var(--color-bg-surface-elevated);">
        <input type="text" id="ai-chat-input" class="form-input" placeholder="Ask your AI Mentor about tasks, DSA, projects, career..." required style="flex: 1;">
        <button type="submit" class="btn btn-primary">
          ${getIcon('send')} Ask Mentor
        </button>
      </form>
    </div>
  `;

  // Scroll to bottom
  const msgBox = container.querySelector('#ai-chat-messages');
  if (msgBox) msgBox.scrollTop = msgBox.scrollHeight;

  // Handle Quick Question Chips
  container.querySelectorAll('.btn-quick-chat').forEach(btn => {
    btn.onclick = () => {
      const q = btn.getAttribute('data-q');
      sendAiMentorMessage(q);
      renderMentorTab(container, rootContainer);
    };
  });

  // Handle Form Submit
  const form = container.querySelector('#ai-chat-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const input = container.querySelector('#ai-chat-input');
      const val = input.value.trim();
      if (!val) return;
      sendAiMentorMessage(val);
      renderMentorTab(container, rootContainer);
    };
  }
}

// ==========================================
// SUBVIEW 3: DOMAIN INTELLIGENCE (Sections 6, 7, 8, 9, 10, 11, 12, 13, 14, 20, 21, 22)
// ==========================================

function renderIntelligenceTab(container, rootContainer) {
  const dsa = getDsaIntelligence();
  const proj = getProjectIntelligence();
  const career = getCareerIntelligence();
  const habit = getConsistencyInsights();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <!-- Domain Filter Chips -->
      <div style="display: flex; gap: 8px;">
        <button class="btn ${activeDomainTab === 'dsa' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="dom-tab-dsa">
          DSA Intelligence
        </button>
        <button class="btn ${activeDomainTab === 'projects' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="dom-tab-proj">
          Project Intelligence
        </button>
        <button class="btn ${activeDomainTab === 'career' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="dom-tab-career">
          Career & Profile
        </button>
        <button class="btn ${activeDomainTab === 'habits' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="dom-tab-habits">
          Habits & Time
        </button>
      </div>

      <!-- Domain Content Body -->
      <div id="domain-body"></div>
    </div>
  `;

  container.querySelector('#dom-tab-dsa').onclick = () => { activeDomainTab = 'dsa'; renderIntelligenceTab(container, rootContainer); };
  container.querySelector('#dom-tab-proj').onclick = () => { activeDomainTab = 'projects'; renderIntelligenceTab(container, rootContainer); };
  container.querySelector('#dom-tab-career').onclick = () => { activeDomainTab = 'career'; renderIntelligenceTab(container, rootContainer); };
  container.querySelector('#dom-tab-habits').onclick = () => { activeDomainTab = 'habits'; renderIntelligenceTab(container, rootContainer); };

  const body = container.querySelector('#domain-body');
  if (!body) return;

  if (activeDomainTab === 'dsa') {
    if (!dsa.available) {
      body.innerHTML = `<div class="card" style="padding: 24px; text-align: center; color: var(--color-text-muted);">${dsa.message}</div>`;
      return;
    }
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px;">
          <!-- Solves & Independent -->
          <div class="card" style="padding: 14px;">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700; margin-bottom: 8px;">
              Problem Solving Integrity
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Total Solved:</span> <strong>${dsa.totalSolved}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Independent Solves:</span> <strong style="color: var(--color-accent-emerald);">${dsa.independentSolves}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Needed Hints:</span> <strong style="color: var(--color-accent-amber);">${dsa.hintsUsed}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Viewed Solution:</span> <strong style="color: var(--color-accent-rose);">${dsa.solutionViewed}</strong>
            </div>
          </div>

          <!-- Recurring Mistakes (Section 9) -->
          <div class="card" style="padding: 14px;">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700; margin-bottom: 8px;">
              Recurring Mistake Categories
            </div>
            ${dsa.recurringMistakes.length > 0 ? dsa.recurringMistakes.map(m => `
              <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid var(--color-border-subtle); font-size: 0.85rem;">
                <span>${m.category}</span>
                <span class="badge badge-amber" style="font-size: 0.68rem;">${m.count} entries</span>
              </div>
            `).join('') : '<div style="font-size: 0.82rem; color: var(--color-text-muted);">No recorded errors</div>'}
            <div style="font-size: 0.78rem; color: var(--color-accent-cyan); margin-top: 8px;">
              💡 ${dsa.mistakeSuggestion}
            </div>
          </div>
        </div>

        <!-- Pattern Activity (Section 8) -->
        <div class="card" style="padding: 14px;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700; margin-bottom: 8px;">
            Algorithmic Pattern Activity
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;">
            ${dsa.patternsList.map(pat => `
              <div style="padding: 8px 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; font-weight: 600;">${pat.name}</span>
                <span class="badge badge-cyan" style="font-size: 0.68rem;">${pat.count} solves</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  } else if (activeDomainTab === 'projects') {
    if (!proj.available) {
      body.innerHTML = `<div class="card" style="padding: 24px; text-align: center; color: var(--color-text-muted);">${proj.message}</div>`;
      return;
    }
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="font-size: 0.88rem; color: var(--color-text-secondary);">
          ${proj.activeProjectsCount} active project(s) tracked. Next recommended actions:
        </div>
        ${proj.projectRecommendations.map(r => `
          <div class="card" style="padding: 14px; border-left: 3px solid var(--color-accent-purple);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 1rem; font-weight: 700; color: var(--color-text-primary);">${r.name}</span>
              <span class="badge badge-purple" style="font-size: 0.7rem;">${r.status} (${r.progress}%)</span>
            </div>
            <div style="font-size: 0.88rem; font-weight: 600; color: var(--color-accent-cyan); margin: 4px 0;">
              Next Action: ${r.nextAction}
            </div>
            <div style="font-size: 0.78rem; color: var(--color-text-muted);">
              Why: ${r.reason}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (activeDomainTab === 'career') {
    if (!career.available) {
      body.innerHTML = `<div class="card" style="padding: 24px; text-align: center; color: var(--color-text-muted);">${career.message}</div>`;
      return;
    }
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Profile Setup Remaining (Section 14) -->
        <div class="card" style="padding: 14px;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700; margin-bottom: 8px;">
            Profile Completeness
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px;">
            <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 0.7rem; color: var(--color-text-muted);">Resume Checklist</div>
              <div style="font-size: 1.1rem; font-weight: 800; color: var(--color-accent-emerald);">${career.profileSetup.resumeRemaining} items remaining</div>
            </div>
            <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 0.7rem; color: var(--color-text-muted);">GitHub Profile</div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #a277ff;">${career.profileSetup.githubRemaining} items remaining</div>
            </div>
            <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 0.7rem; color: var(--color-text-muted);">LinkedIn Profile</div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #0077b5;">${career.profileSetup.linkedinRemaining} items remaining</div>
            </div>
          </div>
        </div>

        <!-- Career Insights Feed -->
        <div class="card" style="padding: 14px;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700; margin-bottom: 8px;">
            Career Readiness Notes
          </div>
          ${career.insights.map(i => `
            <div style="padding: 6px 0; border-bottom: 1px solid var(--color-border-subtle); font-size: 0.85rem;">
              <strong>${i.category}:</strong> ${i.message}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (activeDomainTab === 'habits') {
    if (!habit.available) {
      body.innerHTML = `<div class="card" style="padding: 24px; text-align: center; color: var(--color-text-muted);">${habit.message}</div>`;
      return;
    }
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <!-- Consistency Summary (Section 20) -->
        <div class="card" style="padding: 14px; border-left: 3px solid var(--color-accent-emerald);">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700; margin-bottom: 4px;">
            Study Consistency
          </div>
          <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary);">
            ${habit.consistencySummary}
          </div>
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 4px;">
            Longest Streak: <strong>${habit.longestStreak} days</strong> · Current Streak: <strong>${habit.currentStreak} days</strong>
          </div>
        </div>

        <!-- Time Allocation (Section 22) -->
        <div class="card" style="padding: 14px;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700; margin-bottom: 8px;">
            Factual Time Allocation (${habit.timeAllocation.totalHours} hrs logged)
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
            <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 0.7rem; color: var(--color-text-muted);">DSA</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-accent-amber);">${habit.timeAllocation.dsaHours} hrs</div>
            </div>
            <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 0.7rem; color: var(--color-text-muted);">AI / ML</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-primary);">${habit.timeAllocation.aimlHours} hrs</div>
            </div>
            <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 0.7rem; color: var(--color-text-muted);">Projects</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-accent-purple);">${habit.timeAllocation.projectHours} hrs</div>
            </div>
            <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 0.7rem; color: var(--color-text-muted);">Career</div>
              <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-accent-cyan);">${habit.timeAllocation.careerHours} hrs</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

// ==========================================
// SUBVIEW 4: STUDY PLANNER (Sections 26, 27, 28)
// ==========================================

function renderPlannerTab(container, rootContainer) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const plans = state.ai_plans || [];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div class="card" style="padding: 16px; background: linear-gradient(135deg, var(--color-bg-surface), var(--color-bg-surface-elevated)); border: 1px solid var(--color-border-active);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 1.1rem; margin: 0 0 4px 0; font-weight: 800;">
              ${getIcon('clock', 'text-cyan')} AI STUDY PLANNER
            </h3>
            <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 0;">
              Proposes time-blocked schedules using your real daily tasks, available study hours, and deadlines.
            </p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-create-daily-plan">
            ${getIcon('plus')} Plan My Day (${activeDate})
          </button>
        </div>
      </div>

      <!-- Approved Plans Feed -->
      <div class="card" style="padding: 16px;">
        <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 10px;">
          Saved & Approved Study Plans (${plans.length})
        </div>

        ${plans.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${plans.map(p => `
              <div style="padding: 12px; background: var(--color-bg-base); border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-weight: 700; font-size: 0.95rem;">Plan for ${p.targetDate || activeDate} (${p.availableHours}h)</span>
                  <span class="badge badge-emerald" style="font-size: 0.68rem;">Approved</span>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  ${(p.schedule || []).map(b => `
                    <div style="display: flex; justify-content: space-between; font-size: 0.82rem; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
                      <span><strong style="color: var(--color-text-muted);">${b.slot}</strong> · ${b.activity}</span>
                      <span class="badge badge-cyan" style="font-size: 0.65rem;">${b.category}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center; padding: 24px 0;">
            No saved study plans yet. Click "Plan My Day" to generate and approve a schedule.
          </div>
        `}
      </div>
    </div>
  `;

  container.querySelector('#btn-create-daily-plan').onclick = () => {
    openStudyPlannerModal(() => renderPlannerTab(container, rootContainer));
  };
}

// ==========================================
// SUBVIEW 5: REVIEWS & CATCH-UP (Sections 15, 17, 24, 25)
// ==========================================

function renderReviewsTab(container, rootContainer) {
  const planVsActual = getPlanVsActual();
  const catchup = getCatchUpItems();
  const weeklyReview = generateWeeklyAiReview();
  const monthlyReview = generateMonthlyAiReview();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- SECTION 24: PLAN VS ACTUAL -->
      <div class="card" style="padding: 16px;">
        <div style="font-size: 0.85rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 10px;">
          PLAN VS ACTUAL (Factual Execution Comparison)
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">
          <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.7rem; color: var(--color-text-muted);">Today Tasks Planned / Done</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-primary);">
              ${planVsActual.daily.tasksCompleted} / ${planVsActual.daily.tasksPlanned}
            </div>
          </div>
          <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.7rem; color: var(--color-text-muted);">Today Study Hours Actual / Planned</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-accent-cyan);">
              ${planVsActual.daily.studyHoursActual}h / ${planVsActual.daily.studyHoursPlanned}h
            </div>
          </div>
          <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.7rem; color: var(--color-text-muted);">Monthly DSA Solved / Target</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-accent-amber);">
              ${planVsActual.monthly.dsaActual} / ${planVsActual.monthly.dsaTarget}
            </div>
          </div>
          <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.7rem; color: var(--color-text-muted);">Monthly Study Hours / Target</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--color-accent-emerald);">
              ${planVsActual.monthly.studyHoursActual}h / ${planVsActual.monthly.studyHoursTarget}h
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 25: CATCH-UP VIEW -->
      <div class="card" style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div>
            <div style="font-size: 0.95rem; font-weight: 800; color: var(--color-text-primary);">
              CATCH-UP VIEW
            </div>
            <div style="font-size: 0.78rem; color: var(--color-text-muted);">
              ${catchup.totalUnfinished} unfinished task(s). Rescheduling requires explicit confirmation.
            </div>
          </div>
          <span class="badge ${catchup.overdue.length > 0 ? 'badge-rose' : 'badge-emerald'}" style="font-size: 0.7rem;">
            ${catchup.overdue.length} Overdue
          </span>
        </div>

        ${catchup.overdue.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${catchup.overdue.map(t => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border-left: 3px solid var(--color-accent-rose);">
                <div>
                  <div style="font-size: 0.85rem; font-weight: 700;">${t.title}</div>
                  <div style="font-size: 0.72rem; color: var(--color-accent-rose);">Scheduled date: ${t.date}</div>
                </div>
                <button class="btn btn-secondary btn-xs btn-reschedule" data-task-id="${t.id}">
                  Reschedule
                </button>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center; padding: 16px 0;">
            No overdue tasks. You are on track!
          </div>
        `}
      </div>

      <!-- SECTION 15: WEEKLY AI REVIEW -->
      <div class="card" style="padding: 16px;">
        <div style="font-size: 0.95rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 6px;">
          WEEKLY AI REVIEW (${weeklyReview.weekRange})
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
          <div style="padding: 10px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-sm);">
            <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-accent-emerald); font-weight: 700;">Completed</div>
            <div style="font-size: 0.85rem; margin-top: 4px;">
              • Tasks: <strong>${weeklyReview.completed.tasksCount}</strong><br>
              • Study Hours: <strong>${weeklyReview.completed.studyHours}h</strong><br>
              • DSA Solved: <strong>${weeklyReview.completed.dsaSolved}</strong>
            </div>
          </div>
          <div style="padding: 10px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-sm);">
            <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-accent-rose); font-weight: 700;">Missed / Incomplete</div>
            <div style="font-size: 0.85rem; margin-top: 4px;">
              • Unfinished: <strong>${weeklyReview.missed.tasksCount}</strong> task(s)
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Reschedule Handlers
  container.querySelectorAll('.btn-reschedule').forEach(btn => {
    btn.onclick = () => {
      const taskId = btn.getAttribute('data-task-id');
      const allTasks = getState().daily_tasks || getState().dailyTasks || [];
      const task = allTasks.find(t => t.id === taskId);
      if (task) {
        openRescheduleTaskModal(task, () => renderReviewsTab(container, rootContainer));
      }
    };
  });
}

// ==========================================
// SUBVIEW 6: HISTORY & AUDIT LOG (Sections 36, 37, 44)
// ==========================================

function renderHistoryTab(container, rootContainer) {
  const auditLogs = getAiAuditLogs();
  const insightsHistory = getAiInsightsHistory();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Audit Logs Table (Section 44) -->
      <div class="card" style="padding: 16px;">
        <div style="font-size: 0.95rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 4px;">
          AI ACTION AUDIT LOG (Section 44)
        </div>
        <p style="font-size: 0.78rem; color: var(--color-text-secondary); margin: 0 0 12px 0;">
          Chronological record of AI feature invocations, data categories inspected, and user approvals. Zero secret keys stored.
        </p>

        ${auditLogs.length > 0 ? `
          <div style="max-height: 250px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--color-border-subtle); color: var(--color-text-muted);">
                  <th style="padding: 6px;">Feature</th>
                  <th style="padding: 6px;">Action / Prompt</th>
                  <th style="padding: 6px;">Data Sources</th>
                  <th style="padding: 6px;">Approved</th>
                  <th style="padding: 6px;">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                ${auditLogs.slice(0, 15).map(log => `
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                    <td style="padding: 6px;"><strong>${log.feature}</strong></td>
                    <td style="padding: 6px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${log.action_proposed}</td>
                    <td style="padding: 6px;"><span class="badge badge-cyan" style="font-size: 0.65rem;">${(log.data_categories_used || []).join(', ')}</span></td>
                    <td style="padding: 6px;">${log.action_approved ? '✅ Yes' : '—'}</td>
                    <td style="padding: 6px; font-family: var(--font-mono); color: var(--color-text-muted);">${log.timestamp?.split('T')[1].substring(0, 8)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <div style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center; padding: 20px 0;">
            No audit records yet.
          </div>
        `}
      </div>

      <!-- Dismissed Insights Management (Section 37) -->
      <div class="card" style="padding: 16px;">
        <div style="font-size: 0.95rem; font-weight: 800; color: var(--color-text-primary); margin-bottom: 6px;">
          INSIGHTS HISTORY & ARCHIVE
        </div>
        <p style="font-size: 0.78rem; color: var(--color-text-secondary); margin: 0 0 10px 0;">
          Dismissed insights are never deleted; you can restore any insight below.
        </p>

        ${insightsHistory.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${insightsHistory.map(ins => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--color-bg-base); border-radius: var(--radius-sm);">
                <div>
                  <span style="font-weight: 700; font-size: 0.85rem;">${ins.title}</span>
                  <span style="font-size: 0.72rem; color: var(--color-text-muted); margin-left: 8px;">(${ins.type})</span>
                </div>
                ${ins.dismissed ? `
                  <button class="btn btn-secondary btn-xs btn-restore-ins" data-ins-id="${ins.id}">
                    Restore Insight
                  </button>
                ` : `
                  <span class="badge badge-emerald" style="font-size: 0.65rem;">Active</span>
                `}
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center; padding: 16px 0;">
            No archived insights.
          </div>
        `}
      </div>
    </div>
  `;

  // Attach Restore Handlers
  container.querySelectorAll('.btn-restore-ins').forEach(btn => {
    btn.onclick = () => {
      const insId = btn.getAttribute('data-ins-id');
      restoreInsight(insId);
      renderHistoryTab(container, rootContainer);
    };
  });
}

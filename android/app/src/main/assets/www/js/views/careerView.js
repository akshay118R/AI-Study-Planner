/**
 * Akshay's 12-Month AI/ML Career OS - Career & Internship Preparation View (Phase 7)
 * 
 * Strict Phase 7 Rules:
 * - Real metrics only (no fake probabilities or fabricated scores)
 * - Separate progress indicators (no single misleading score)
 * - Integrated with Phase 5 DSA, Phase 6 Projects, Phase 3 Daily Tasks, Phase 4 Goals & Reviews
 */

import { getState } from '../data/storage.js';
import { getIcon, ICONS } from '../components/icons.js';
import { calculateDsaAnalytics } from '../services/dsaEngine.js';
import { calculateProjectMetrics, getProjects } from '../services/projectEngine.js';
import {
  getCareerProfile,
  getResumeVersions,
  getResumeChecklist,
  toggleResumeChecklistItem,
  getResumeProjectCandidates,
  toggleProjectResumeCandidate,
  toggleProjectResumeReady,
  getCodingProfiles,
  getGitHubProfile,
  toggleGitHubProfileChecklistItem,
  getLinkedInProfile,
  toggleLinkedInChecklistItem,
  getAchievements,
  deleteAchievement,
  getCertifications,
  deleteCertification,
  getInternships,
  deleteInternship,
  convertInternshipToApplication,
  getApplications,
  updateApplicationStatus,
  deleteApplication,
  getApplicationEvents,
  getApplicationFollowups,
  getApplicationStats,
  getOutreach,
  deleteOutreach,
  getReferrals,
  deleteReferral,
  getNetworking,
  deleteNetworking,
  getAptitudeStats,
  getAptitudeSessions,
  getTechnicalTopics,
  updateTechnicalTopic,
  getInterviewQuestions,
  updateInterviewQuestion,
  deleteInterviewQuestion,
  getMockInterviews,
  deleteMockInterview,
  getProjectInterviewPrep,
  toggleProjectInterviewChecklistItem,
  getCareerMilestones,
  toggleCareerMilestone,
  getCareerDocuments,
  deleteCareerDocument,
  getCareerJournal,
  deleteCareerJournalEntry,
  getUpcomingActions,
  getCareerReadinessChecklist,
  getCareerHistoryTimeline,
  searchCareer,
  APPLICATION_STATUSES,
  INTERVIEW_QUESTION_CATEGORIES,
  APTITUDE_CATEGORIES,
  RESUME_CHECKLIST_ITEMS,
  GITHUB_PROFILE_CHECKLIST_ITEMS,
  LINKEDIN_CHECKLIST_ITEMS,
  PROJECT_INTERVIEW_CHECKLIST_ITEMS
} from '../services/careerEngine.js';

import {
  openCareerProfileModal,
  openResumeVersionModal,
  openCodingProfileModal,
  openLinkedInModal,
  openGitHubProfileModal,
  openAchievementModal,
  openCertificationModal,
  openInternshipModal,
  openApplicationModal,
  openOutreachModal,
  openReferralModal,
  openNetworkingModal,
  openAptitudeSessionModal,
  openInterviewQuestionModal,
  openMockInterviewModal
} from '../components/careerModals.js';

let activeSubTab = 'dashboard'; // 'dashboard' | 'applications' | 'interviews' | 'profile' | 'aptitude' | 'outreach' | 'journal'
let activeAppView = 'kanban'; // 'kanban' | 'list' | 'internships'
let questionFilterCat = 'All';
let questionFilterStatus = 'All';
let questionOnlyNeedsRev = false;
let searchQuery = '';

export function renderCareer(container) {
  const state = getState();
  const activeDate = state.activeDate || '2026-10-01';

  // Real Metrics from Engines
  const dsaAnalytics = calculateDsaAnalytics(state);
  const projMetrics = calculateProjectMetrics();
  const appStats = getApplicationStats();
  const aptStats = getAptitudeStats();
  const profile = getCareerProfile();
  const resumeVers = getResumeVersions();
  const currentResume = resumeVers[0];
  const techTopics = getTechnicalTopics();
  const coreCsActive = techTopics.filter(t => t.category === 'Core CS' && t.status !== 'Not Started').length;
  const mockInterviews = getMockInterviews();
  const interviewQuestions = getInterviewQuestions();
  const upcomingActions = getUpcomingActions();
  const internships = getInternships();
  const ghProfile = getGitHubProfile();
  const liProfile = getLinkedInProfile();
  const milestones = getCareerMilestones();
  const completedMilestones = milestones.filter(m => m.completed).length;

  container.innerHTML = `
    <div class="view-container animate-fade-in" style="padding-bottom: 80px;">
      <!-- Top Title & Navigation Bar -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-md); flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h1 class="view-title" style="margin-bottom: 2px;">
              ${getIcon('career', 'text-cyan')} CAREER DASHBOARD
            </h1>
            <span class="badge badge-cyan" style="font-size: 0.7rem; font-weight: 700;">Phase 7</span>
          </div>
          <p class="view-subtitle" style="margin: 0;">
            Placement & Internship Operating System · Active Date: <strong>${activeDate}</strong>
          </p>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" id="btn-quick-new-app">
            ${getIcon('plus')} New Application
          </button>
          <button class="btn btn-primary btn-sm" id="btn-quick-edit-profile">
            ${getIcon('user')} Edit Profile
          </button>
        </div>
      </div>

      <!-- Top Career Preparation Progress Indicators (Section 1: Separate indicators, NO fake single score) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: var(--space-md);">
        <!-- 1. Career Preparation -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-primary);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Career Preparation</div>
          <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-primary); margin: 2px 0;">
            ${completedMilestones} / 8
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">Milestones Ready</div>
        </div>

        <!-- 2. DSA -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-amber);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">DSA</div>
          <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-text-primary); margin: 2px 0;">
            ${dsaAnalytics.solved ?? dsaAnalytics.totalSolved ?? 0}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${dsaAnalytics.totalAttempted || 0} Attempted</div>
        </div>

        <!-- 3. Core CS -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-cyan);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Core CS</div>
          <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-accent-cyan); margin: 2px 0;">
            ${coreCsActive} / 5
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">Active Subjects</div>
        </div>

        <!-- 4. Projects -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-purple);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Projects</div>
          <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-accent-purple); margin: 2px 0;">
            ${projMetrics.completed + projMetrics.portfolioReady} / ${projMetrics.total}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${projMetrics.deployed} Deployed</div>
        </div>

        <!-- 5. GitHub -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid #6e5494;">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">GitHub</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: #a277ff; margin: 4px 0;">
            ${ghProfile?.username ? 'Active' : 'Setup'}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${(ghProfile?.pinned_projects || []).length} Pinned Proj</div>
        </div>

        <!-- 6. Resume -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-emerald);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Resume</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: var(--color-accent-emerald); margin: 4px 0;">
            ${currentResume ? currentResume.status : 'Draft'}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${resumeVers.length} Versions</div>
        </div>

        <!-- 7. LinkedIn -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid #0077b5;">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">LinkedIn</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: #0077b5; margin: 4px 0;">
            ${liProfile?.headline ? 'Ready' : 'Draft'}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">Profile Active</div>
        </div>

        <!-- 8. Portfolio -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-rose);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Portfolio</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: var(--color-accent-rose); margin: 4px 0;">
            ${projMetrics.portfolioReady > 0 ? 'Ready' : 'Building'}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${projMetrics.portfolioReady} Ready Proj</div>
        </div>

        <!-- 9. Internships -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid #3b82f6;">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Internships</div>
          <div style="font-size: 1.2rem; font-weight: 800; color: #3b82f6; margin: 2px 0;">
            ${internships.length}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${appStats.total} Applied · ${appStats.offers} Offer</div>
        </div>

        <!-- 10. Aptitude -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-amber);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Aptitude</div>
          <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-accent-amber); margin: 2px 0;">
            ${aptStats.sessionsCount}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${aptStats.overallAccuracy}% Accuracy</div>
        </div>

        <!-- 11. Interviews -->
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-cyan);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Interviews</div>
          <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-accent-cyan); margin: 2px 0;">
            ${mockInterviews.length}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${interviewQuestions.length} Questions</div>
        </div>
      </div>

      <!-- Navigation Sub-Tabs -->
      <div class="projects-subnav-bar" style="margin-bottom: var(--space-md); overflow-x: auto;">
        <button class="filter-pill ${activeSubTab === 'dashboard' ? 'active' : ''}" data-subtab="dashboard">
          ${getIcon('dashboard')} Dashboard & Roadmap
        </button>
        <button class="filter-pill ${activeSubTab === 'applications' ? 'active' : ''}" data-subtab="applications">
          ${getIcon('briefcase')} Applications (${appStats.total})
        </button>
        <button class="filter-pill ${activeSubTab === 'interviews' ? 'active' : ''}" data-subtab="interviews">
          ${getIcon('brain')} Interview Prep (${interviewQuestions.length})
        </button>
        <button class="filter-pill ${activeSubTab === 'profile' ? 'active' : ''}" data-subtab="profile">
          ${getIcon('user')} Profile & Resume
        </button>
        <button class="filter-pill ${activeSubTab === 'aptitude' ? 'active' : ''}" data-subtab="aptitude">
          ${getIcon('target')} Aptitude (${aptStats.sessionsCount})
        </button>
        <button class="filter-pill ${activeSubTab === 'outreach' ? 'active' : ''}" data-subtab="outreach">
          ${getIcon('send')} Outreach & Referrals
        </button>
        <button class="filter-pill ${activeSubTab === 'journal' ? 'active' : ''}" data-subtab="journal">
          ${getIcon('journal')} Career Journal
        </button>
      </div>

      <!-- Dynamic Sub-Tab Content -->
      <div id="career-tab-content"></div>
    </div>
  `;

  // Attach Sub-Tab switcher
  container.querySelectorAll('[data-subtab]').forEach(btn => {
    btn.onclick = () => {
      activeSubTab = btn.getAttribute('data-subtab');
      renderCareer(container);
    };
  });

  // Quick Action Buttons
  const btnNewApp = document.getElementById('btn-quick-new-app');
  if (btnNewApp) btnNewApp.onclick = () => openApplicationModal(null, () => renderCareer(container));
  const btnEditProf = document.getElementById('btn-quick-edit-profile');
  if (btnEditProf) btnEditProf.onclick = () => openCareerProfileModal(() => renderCareer(container));

  // Render Active Sub-Tab
  const tabContent = document.getElementById('career-tab-content');
  if (tabContent) {
    if (activeSubTab === 'dashboard') {
      renderDashboardTab(tabContent, container);
    } else if (activeSubTab === 'applications') {
      renderApplicationsTab(tabContent, container);
    } else if (activeSubTab === 'interviews') {
      renderInterviewsTab(tabContent, container);
    } else if (activeSubTab === 'profile') {
      renderProfileTab(tabContent, container);
    } else if (activeSubTab === 'aptitude') {
      renderAptitudeTab(tabContent, container);
    } else if (activeSubTab === 'outreach') {
      renderOutreachTab(tabContent, container);
    } else if (activeSubTab === 'journal') {
      renderJournalTab(tabContent, container);
    }
  }
}

// ==========================================
// SUB-TAB 1: DASHBOARD & ROADMAP
// ==========================================

function renderDashboardTab(container, parentContainer) {
  const state = getState();
  const checklist = getCareerReadinessChecklist();
  const upcomingActions = getUpcomingActions();
  const milestones = getCareerMilestones();
  const timeline = getCareerHistoryTimeline();

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-md); align-items: flex-start;">
      <!-- Left Column: Career Readiness Checklist & Milestones -->
      <div style="display: flex; flex-direction: column; gap: var(--space-md);">
        <!-- Career Readiness Checklist (Section 3) -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${getIcon('check', 'text-emerald')}
              <h3 style="margin: 0; font-size: 1rem; font-weight: 700;">CAREER READINESS CHECKLIST</h3>
            </div>
            <span class="badge badge-emerald" style="font-size: 0.75rem;">
              ${checklist.filter(c => c.isReady).length} / ${checklist.length} Ready
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${checklist.map(item => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 1.1rem;">${item.isReady ? '✅' : '⏳'}</span>
                  <div>
                    <div style="font-weight: 600; font-size: 0.85rem; color: var(--color-text-primary);">${item.title}</div>
                    <div style="font-size: 0.72rem; color: var(--color-text-muted);">${item.detail}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span class="badge ${item.isReady ? 'badge-emerald' : 'badge-amber'}" style="font-size: 0.72rem;">
                    ${item.statusText}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Career Milestones (Section 36) -->
        <div class="card">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            ${getIcon('award', 'text-cyan')}
            <h3 style="margin: 0; font-size: 1rem; font-weight: 700;">CAREER MILESTONES</h3>
          </div>
          <p style="font-size: 0.78rem; color: var(--color-text-secondary); margin-bottom: 12px;">
            Clear progressive checkpoints for career readiness. Toggle when completed.
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
            ${milestones.map(m => `
              <div style="padding: 10px; border-radius: var(--radius-sm); border: 1px solid ${m.completed ? 'var(--color-accent-emerald)' : 'var(--color-border)'}; background: ${m.completed ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255, 255, 255, 0.02)'}; display: flex; flex-direction: column; justify-content: space-between; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="font-weight: 700; font-size: 0.88rem; color: ${m.completed ? 'var(--color-accent-emerald)' : 'var(--color-text-primary)'};">${m.title}</span>
                  <input type="checkbox" class="cm-toggle" data-key="${m.key}" ${m.completed ? 'checked' : ''} style="cursor: pointer;" />
                </div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted);">${m.notes}</div>
                ${m.completed && m.completion_date ? `
                  <div style="font-size: 0.7rem; color: var(--color-accent-emerald);">Completed: ${m.completion_date}</div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Career History Timeline (Section 41) -->
        <div class="card">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            ${getIcon('clock', 'text-purple')}
            <h3 style="margin: 0; font-size: 1rem; font-weight: 700;">CAREER ACTIVITY TIMELINE</h3>
          </div>

          ${timeline.length === 0 ? `
            <div class="text-muted" style="font-size: 0.82rem; padding: 12px; text-align: center;">No activity records logged yet. Complete projects, mock interviews, and application steps.</div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto;">
              ${timeline.slice(0, 15).map(t => `
                <div style="display: flex; gap: 12px; padding: 6px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.04); font-size: 0.82rem;">
                  <span style="color: var(--color-accent-purple); font-weight: 700; min-width: 80px;">${t.date}</span>
                  <div>
                    <span class="badge badge-purple" style="font-size: 0.65rem; margin-right: 6px;">${t.category}</span>
                    <strong style="color: var(--color-text-primary);">${t.title}</strong>
                    ${t.detail ? `<div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">${t.detail}</div>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>

      <!-- Right Column: Upcoming Actions & Profile Summary -->
      <div style="display: flex; flex-direction: column; gap: var(--space-md);">
        <!-- Upcoming Actions (Section 40) -->
        <div class="card">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            ${getIcon('target', 'text-amber')}
            <h3 style="margin: 0; font-size: 1rem; font-weight: 700;">UPCOMING ACTIONS</h3>
          </div>

          ${upcomingActions.length === 0 ? `
            <div class="text-muted" style="font-size: 0.82rem; padding: 12px; text-align: center;">No pending deadlines or actions scheduled.</div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 360px; overflow-y: auto;">
              ${upcomingActions.map(act => `
                <div style="padding: 8px 10px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border-left: 3px solid var(--color-accent-amber); display: flex; flex-direction: column; gap: 3px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="badge badge-amber" style="font-size: 0.65rem;">${act.type}</span>
                    <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-primary);">${act.date}</span>
                  </div>
                  <div style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-primary);">${act.title}</div>
                  <div style="font-size: 0.72rem; color: var(--color-text-muted);">${act.source}</div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Career Roadmap Tracks Overview (Section 2) -->
        <div class="card">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            ${getIcon('roadmap', 'text-cyan')}
            <h3 style="margin: 0; font-size: 1rem; font-weight: 700;">CAREER ROADMAP PHASES</h3>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.8rem;">
            <div style="padding: 8px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm);">
              <div style="font-weight: 700; color: var(--color-accent-cyan);">1. FOUNDATION</div>
              <div style="color: var(--color-text-secondary); font-size: 0.75rem;">Programming, DSA, Core CS, SQL, Git/GitHub</div>
            </div>
            <div style="padding: 8px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm);">
              <div style="font-weight: 700; color: var(--color-accent-purple);">2. TECHNICAL</div>
              <div style="color: var(--color-text-secondary); font-size: 0.75rem;">ML Fundamentals, Projects, APIs, Development, Cloud</div>
            </div>
            <div style="padding: 8px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm);">
              <div style="font-weight: 700; color: var(--color-accent-emerald);">3. PROFILE</div>
              <div style="color: var(--color-text-secondary); font-size: 0.75rem;">GitHub, Resume, LinkedIn, Portfolio Website</div>
            </div>
            <div style="padding: 8px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm);">
              <div style="font-weight: 700; color: var(--color-accent-amber);">4. INTERNSHIP</div>
              <div style="color: var(--color-text-secondary); font-size: 0.75rem;">Search, Applications, Outreach, Referrals, Prep</div>
            </div>
            <div style="padding: 8px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm);">
              <div style="font-weight: 700; color: var(--color-accent-rose);">5. PLACEMENT</div>
              <div style="color: var(--color-text-secondary); font-size: 0.75rem;">DSA Mastery, Core CS, System Design, Aptitude, Mock Interviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Milestone toggles
  container.querySelectorAll('.cm-toggle').forEach(el => {
    el.onchange = () => {
      toggleCareerMilestone(el.getAttribute('data-key'), el.checked);
      renderDashboardTab(container, parentContainer);
    };
  });
}

// ==========================================
// SUB-TAB 2: APPLICATIONS & INTERNSHIPS
// ==========================================

function renderApplicationsTab(container, parentContainer) {
  const apps = getApplications({ search: searchQuery });
  const internships = getInternships({ search: searchQuery });
  const stats = getApplicationStats();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <!-- Top Action & View Switcher Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="filter-pill ${activeAppView === 'kanban' ? 'active' : ''}" id="btn-view-app-kanban">
            Kanban Pipeline
          </button>
          <button class="filter-pill ${activeAppView === 'list' ? 'active' : ''}" id="btn-view-app-list">
            Applications List (${apps.length})
          </button>
          <button class="filter-pill ${activeAppView === 'internships' ? 'active' : ''}" id="btn-view-internships">
            Internship Leads (${internships.length})
          </button>
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-sm" id="btn-new-internship-lead">
            ${getIcon('plus')} Add Internship Lead
          </button>
          <button class="btn btn-primary btn-sm" id="btn-new-application">
            ${getIcon('plus')} New Application
          </button>
        </div>
      </div>

      <!-- Application Pipeline / Views Container -->
      <div id="applications-view-root"></div>
    </div>
  `;

  document.getElementById('btn-view-app-kanban').onclick = () => { activeAppView = 'kanban'; renderApplicationsTab(container, parentContainer); };
  document.getElementById('btn-view-app-list').onclick = () => { activeAppView = 'list'; renderApplicationsTab(container, parentContainer); };
  document.getElementById('btn-view-internships').onclick = () => { activeAppView = 'internships'; renderApplicationsTab(container, parentContainer); };

  document.getElementById('btn-new-internship-lead').onclick = () => openInternshipModal(null, () => renderApplicationsTab(container, parentContainer));
  document.getElementById('btn-new-application').onclick = () => openApplicationModal(null, () => renderApplicationsTab(container, parentContainer));

  const viewRoot = document.getElementById('applications-view-root');
  if (viewRoot) {
    if (activeAppView === 'kanban') {
      renderApplicationKanban(viewRoot, apps, container, parentContainer);
    } else if (activeAppView === 'list') {
      renderApplicationList(viewRoot, apps, container, parentContainer);
    } else if (activeAppView === 'internships') {
      renderInternshipsList(viewRoot, internships, container, parentContainer);
    }
  }
}

function renderApplicationKanban(root, apps, subContainer, parentContainer) {
  const KANBAN_STAGES = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn', 'Closed'];

  root.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; overflow-x: auto; padding-bottom: 12px;">
      ${KANBAN_STAGES.map(stage => {
        const stageApps = apps.filter(a => a.status === stage);
        return `
          <div class="kanban-column" data-stage="${stage}" style="background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 10px; min-height: 380px; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid var(--color-border);">
              <span style="font-weight: 700; font-size: 0.8rem; text-transform: uppercase; color: var(--color-text-secondary);">${stage}</span>
              <span class="badge badge-purple" style="font-size: 0.65rem;">${stageApps.length}</span>
            </div>

            <div class="kanban-cards" style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
              ${stageApps.length === 0 ? `
                <div style="font-size: 0.72rem; color: var(--color-text-muted); text-align: center; padding: 16px 0;">No applications in this stage</div>
              ` : stageApps.map(a => `
                <div class="card app-card" draggable="true" data-app-id="${a.id}" style="padding: 10px; cursor: grab; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <strong style="font-size: 0.88rem; color: var(--color-text-primary);">${a.company}</strong>
                    <span class="badge badge-cyan" style="font-size: 0.62rem;">${a.work_type || 'Remote'}</span>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--color-text-secondary);">${a.role}</div>

                  ${a.next_action ? `
                    <div style="font-size: 0.72rem; color: var(--color-accent-amber); background: rgba(245, 158, 11, 0.08); padding: 3px 6px; border-radius: 3px;">
                      ⚡ Next: ${a.next_action}
                    </div>
                  ` : ''}

                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.7rem; color: var(--color-text-muted);">
                    <span>${a.date_applied || 'Saved'}</span>
                    <div style="display: flex; gap: 4px;">
                      <button class="btn btn-ghost btn-sm btn-icon btn-edit-app" data-id="${a.id}" title="Edit Application">${ICONS.edit}</button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Attach Edit Clickers
  root.querySelectorAll('.btn-edit-app').forEach(btn => {
    btn.onclick = () => openApplicationModal(btn.getAttribute('data-id'), () => renderApplicationsTab(subContainer, parentContainer));
  });

  // Drag and drop status update persistence
  root.querySelectorAll('.app-card').forEach(card => {
    card.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', card.getAttribute('data-app-id'));
    };
  });

  root.querySelectorAll('.kanban-column').forEach(col => {
    col.ondragover = (e) => e.preventDefault();
    col.ondrop = (e) => {
      e.preventDefault();
      const appId = e.dataTransfer.getData('text/plain');
      const targetStage = col.getAttribute('data-stage');
      if (appId && targetStage) {
        updateApplicationStatus(appId, targetStage);
        renderApplicationsTab(subContainer, parentContainer);
      }
    };
  });
}

function renderApplicationList(root, apps, subContainer, parentContainer) {
  root.innerHTML = `
    <div class="card" style="padding: 0; overflow: hidden;">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--color-border); background: rgba(255, 255, 255, 0.02); color: var(--color-text-muted); font-size: 0.72rem; text-transform: uppercase;">
            <th style="padding: 10px 14px;">Company</th>
            <th style="padding: 10px 14px;">Role</th>
            <th style="padding: 10px 14px;">Date Applied</th>
            <th style="padding: 10px 14px;">Deadline</th>
            <th style="padding: 10px 14px;">Status</th>
            <th style="padding: 10px 14px;">Next Action</th>
            <th style="padding: 10px 14px; text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${apps.length === 0 ? `
            <tr><td colspan="7" style="padding: 24px; text-align: center; color: var(--color-text-muted);">No applications found. Add a new application to start tracking!</td></tr>
          ` : apps.map(a => `
            <tr style="border-bottom: 1px solid var(--color-border);">
              <td style="padding: 10px 14px; font-weight: 700; color: var(--color-text-primary);">${a.company}</td>
              <td style="padding: 10px 14px; color: var(--color-text-secondary);">${a.role}</td>
              <td style="padding: 10px 14px; color: var(--color-text-muted);">${a.date_applied || '—'}</td>
              <td style="padding: 10px 14px; color: var(--color-text-muted);">${a.deadline || '—'}</td>
              <td style="padding: 10px 14px;">
                <span class="badge ${a.status === 'Offer' ? 'badge-emerald' : (a.status === 'Rejected' ? 'badge-rose' : 'badge-cyan')}" style="font-size: 0.7rem;">
                  ${a.status}
                </span>
              </td>
              <td style="padding: 10px 14px; color: var(--color-accent-amber);">${a.next_action || '—'}</td>
              <td style="padding: 10px 14px; text-align: right;">
                <button class="btn btn-ghost btn-sm btn-icon btn-edit-app" data-id="${a.id}">${ICONS.edit}</button>
                <button class="btn btn-ghost btn-sm btn-icon btn-del-app" data-id="${a.id}" style="color: var(--color-accent-rose);">${ICONS.trash}</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  root.querySelectorAll('.btn-edit-app').forEach(btn => {
    btn.onclick = () => openApplicationModal(btn.getAttribute('data-id'), () => renderApplicationsTab(subContainer, parentContainer));
  });
  root.querySelectorAll('.btn-del-app').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Delete this application record?')) {
        deleteApplication(btn.getAttribute('data-id'));
        renderApplicationsTab(subContainer, parentContainer);
      }
    };
  });
}

function renderInternshipsList(root, internships, subContainer, parentContainer) {
  root.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
      ${internships.length === 0 ? `
        <div class="card text-muted" style="grid-column: 1 / -1; text-align: center; padding: 24px;">No internship leads saved. Click "+ Add Internship Lead" above to save job opportunities.</div>
      ` : internships.map(i => `
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 8px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <strong style="font-size: 0.95rem; color: var(--color-text-primary);">${i.company}</strong>
              <span class="badge badge-purple" style="font-size: 0.65rem;">${i.work_type}</span>
            </div>
            <div style="font-size: 0.82rem; color: var(--color-text-secondary); margin-top: 2px;">${i.role}</div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 2px;">📍 ${i.location} · Source: ${i.source}</div>

            ${i.skills ? `<div style="font-size: 0.72rem; color: var(--color-accent-cyan); margin-top: 4px;">Skills: ${i.skills}</div>` : ''}
            ${i.application_deadline ? `<div style="font-size: 0.72rem; color: var(--color-accent-amber); margin-top: 4px;">Deadline: ${i.application_deadline}</div>` : ''}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--color-border);">
            <button class="btn btn-primary btn-sm btn-convert-lead" data-id="${i.id}" style="font-size: 0.72rem;">
              ⚡ Convert to Application
            </button>
            <div style="display: flex; gap: 4px;">
              <button class="btn btn-ghost btn-sm btn-icon btn-edit-lead" data-id="${i.id}">${ICONS.edit}</button>
              <button class="btn btn-ghost btn-sm btn-icon btn-del-lead" data-id="${i.id}" style="color: var(--color-accent-rose);">${ICONS.trash}</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  root.querySelectorAll('.btn-convert-lead').forEach(btn => {
    btn.onclick = () => {
      convertInternshipToApplication(btn.getAttribute('data-id'));
      activeAppView = 'kanban';
      renderApplicationsTab(subContainer, parentContainer);
    };
  });
  root.querySelectorAll('.btn-edit-lead').forEach(btn => {
    btn.onclick = () => openInternshipModal(btn.getAttribute('data-id'), () => renderApplicationsTab(subContainer, parentContainer));
  });
  root.querySelectorAll('.btn-del-lead').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Delete this internship opportunity?')) {
        deleteInternship(btn.getAttribute('data-id'));
        renderApplicationsTab(subContainer, parentContainer);
      }
    };
  });
}

// ==========================================
// SUB-TAB 3: INTERVIEW PREPARATION
// ==========================================

function renderInterviewsTab(container, parentContainer) {
  const topics = getTechnicalTopics();
  const questions = getInterviewQuestions({
    category: questionFilterCat,
    status: questionFilterStatus,
    needsRevisionOnly: questionOnlyNeedsRev
  });
  const mocks = getMockInterviews();
  const state = getState();
  const projects = state.projects || [];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <!-- 9 Technical Topic Sections (Section 26 & 27) -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('brain', 'text-amber')}
            <h3 style="margin: 0; font-size: 1rem; font-weight: 700;">TECHNICAL INTERVIEW TOPIC MASTERY</h3>
          </div>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">
            Matches placement preparation curriculum · Separate readiness indicators
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;">
          ${topics.map(t => `
            <div style="padding: 10px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border: 1px solid var(--color-border); display: flex; flex-direction: column; justify-content: space-between; gap: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: var(--color-text-primary); font-size: 0.9rem;">${t.name}</strong>
                <select class="form-select topic-status-sel" data-key="${t.topic_key}" style="font-size: 0.72rem; padding: 2px 6px; width: auto;">
                  <option value="Not Started" ${t.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                  <option value="Learning" ${t.status === 'Learning' ? 'selected' : ''}>Learning</option>
                  <option value="Practicing" ${t.status === 'Practicing' ? 'selected' : ''}>Practicing</option>
                  <option value="Interview Ready" ${t.status === 'Interview Ready' ? 'selected' : ''}>Interview Ready</option>
                  <option value="Needs Revision" ${t.status === 'Needs Revision' ? 'selected' : ''}>Needs Revision</option>
                </select>
              </div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted);">${t.notes}</div>
              <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--color-text-secondary); margin-top: 4px;">
                <span>Practiced: <strong>${t.questions_practiced || 0} questions</strong></span>
                <span>${t.confidence_note || ''}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Interview Questions Bank (Section 28) -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('fileText', 'text-cyan')}
            <h3 style="margin: 0; font-size: 1rem; font-weight: 700;">INTERVIEW QUESTIONS BANK</h3>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <select class="form-select" id="iq-filter-cat" style="font-size: 0.75rem; width: auto; padding: 4px 8px;">
              <option value="All">All Categories</option>
              ${INTERVIEW_QUESTION_CATEGORIES.map(c => `<option value="${c}" ${questionFilterCat === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>

            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; cursor: pointer; color: var(--color-accent-rose);">
              <input type="checkbox" id="iq-filter-rev" ${questionOnlyNeedsRev ? 'checked' : ''} />
              <span>Needs Revision Only</span>
            </label>

            <button class="btn btn-primary btn-sm" id="btn-add-interview-q">
              ${getIcon('plus')} Add Question
            </button>
          </div>
        </div>

        ${questions.length === 0 ? `
          <div class="text-muted" style="padding: 16px; text-align: center; font-size: 0.82rem;">No interview questions recorded for this filter. Add questions from your practice!</div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${questions.map(q => `
              <div style="padding: 10px 12px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                    <span class="badge badge-purple" style="font-size: 0.65rem;">${q.category}</span>
                    <span class="badge badge-cyan" style="font-size: 0.65rem;">${q.topic}</span>
                    <span class="badge ${q.difficulty === 'Hard' ? 'badge-rose' : (q.difficulty === 'Medium' ? 'badge-amber' : 'badge-emerald')}" style="font-size: 0.65rem;">${q.difficulty}</span>
                    ${q.revision_required || q.status === 'Needs Revision' ? `<span class="badge badge-rose" style="font-size: 0.65rem;">Needs Revision</span>` : ''}
                  </div>
                  <div style="font-weight: 600; font-size: 0.88rem; color: var(--color-text-primary);">${q.question}</div>
                  ${q.answer_notes ? `<div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-top: 4px; background: rgba(0,0,0,0.15); padding: 4px 8px; border-radius: 4px;">💡 ${q.answer_notes}</div>` : ''}
                </div>

                <div style="display: flex; align-items: center; gap: 6px;">
                  <button class="btn btn-ghost btn-sm btn-icon btn-edit-iq" data-id="${q.id}">${ICONS.edit}</button>
                  <button class="btn btn-ghost btn-sm btn-icon btn-del-iq" data-id="${q.id}" style="color: var(--color-accent-rose);">${ICONS.trash}</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Project Interview Explanation Checklist (Section 29) -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('projects', 'text-purple')}
            <h3 style="margin: 0; font-size: 1rem; font-weight: 700;">PROJECT INTERVIEW PREPARATION (Phase 6 Sync)</h3>
          </div>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">
            Mastering explanations for technical screening & hiring manager rounds
          </span>
        </div>

        ${projects.length === 0 ? `
          <div class="text-muted" style="padding: 12px;">No projects created yet. Create projects in Projects Hub to prepare interview talking points.</div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${projects.map(p => {
              const prep = getProjectInterviewPrep(p.id);
              return `
                <div style="padding: 12px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                      <strong style="color: var(--color-text-primary); font-size: 0.95rem;">${p.name || p.title}</strong>
                      <span class="badge badge-cyan" style="font-size: 0.65rem; margin-left: 6px;">${p.category}</span>
                    </div>
                  </div>

                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 6px; margin-top: 8px;">
                    ${PROJECT_INTERVIEW_CHECKLIST_ITEMS.map(chk => `
                      <label style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; cursor: pointer;">
                        <input type="checkbox" class="chk-proj-prep" data-pid="${p.id}" data-key="${chk.key}" ${prep.checklist?.[chk.key] ? 'checked' : ''} />
                        <span style="${prep.checklist?.[chk.key] ? 'color: var(--color-accent-emerald); font-weight: 600;' : 'color: var(--color-text-secondary);'}">${chk.label}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Mock Interviews Tracker (Section 30) -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('brain', 'text-cyan')}
            <h3 style="margin: 0; font-size: 1rem; font-weight: 700;">MOCK INTERVIEWS TRACKER</h3>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-add-mock">
            ${getIcon('plus')} Schedule / Log Mock
          </button>
        </div>

        ${mocks.length === 0 ? `
          <div class="text-muted" style="padding: 16px; text-align: center; font-size: 0.82rem;">No mock interviews recorded yet. Practice peer and mentor simulations!</div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${mocks.map(m => `
              <div style="padding: 10px 12px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
                    <span class="badge badge-purple" style="font-size: 0.65rem;">${m.type}</span>
                    <strong style="color: var(--color-text-primary); font-size: 0.88rem;">${m.topics}</strong>
                    <span style="font-size: 0.72rem; color: var(--color-text-muted);">(${m.duration_minutes}m)</span>
                  </div>
                  <div style="font-size: 0.72rem; color: var(--color-accent-cyan);">Date: ${m.date}</div>
                  ${m.areas_to_improve ? `<div style="font-size: 0.75rem; color: var(--color-accent-rose); margin-top: 3px;">⚠️ Areas to improve: ${m.areas_to_improve}</div>` : ''}
                  ${m.followup_revision ? `<div style="font-size: 0.75rem; color: var(--color-accent-amber); margin-top: 2px;">⚡ Revision plan: ${m.followup_revision}</div>` : ''}
                </div>

                <div style="display: flex; gap: 4px;">
                  <button class="btn btn-ghost btn-sm btn-icon btn-edit-mock" data-id="${m.id}">${ICONS.edit}</button>
                  <button class="btn btn-ghost btn-sm btn-icon btn-del-mock" data-id="${m.id}" style="color: var(--color-accent-rose);">${ICONS.trash}</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // Attach Listeners
  container.querySelectorAll('.topic-status-sel').forEach(sel => {
    sel.onchange = () => {
      updateTechnicalTopic(sel.getAttribute('data-key'), { status: sel.value });
    };
  });

  const catFilter = document.getElementById('iq-filter-cat');
  if (catFilter) {
    catFilter.onchange = () => {
      questionFilterCat = catFilter.value;
      renderInterviewsTab(container, parentContainer);
    };
  }

  const revFilter = document.getElementById('iq-filter-rev');
  if (revFilter) {
    revFilter.onchange = () => {
      questionOnlyNeedsRev = revFilter.checked;
      renderInterviewsTab(container, parentContainer);
    };
  }

  const btnAddIq = document.getElementById('btn-add-interview-q');
  if (btnAddIq) btnAddIq.onclick = () => openInterviewQuestionModal(null, () => renderInterviewsTab(container, parentContainer));

  container.querySelectorAll('.btn-edit-iq').forEach(btn => {
    btn.onclick = () => openInterviewQuestionModal(btn.getAttribute('data-id'), () => renderInterviewsTab(container, parentContainer));
  });
  container.querySelectorAll('.btn-del-iq').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Delete this question?')) {
        deleteInterviewQuestion(btn.getAttribute('data-id'));
        renderInterviewsTab(container, parentContainer);
      }
    };
  });

  container.querySelectorAll('.chk-proj-prep').forEach(chk => {
    chk.onchange = () => {
      toggleProjectInterviewChecklistItem(chk.getAttribute('data-pid'), chk.getAttribute('data-key'));
      renderInterviewsTab(container, parentContainer);
    };
  });

  const btnAddMock = document.getElementById('btn-add-mock');
  if (btnAddMock) btnAddMock.onclick = () => openMockInterviewModal(null, () => renderInterviewsTab(container, parentContainer));

  container.querySelectorAll('.btn-edit-mock').forEach(btn => {
    btn.onclick = () => openMockInterviewModal(btn.getAttribute('data-id'), () => renderInterviewsTab(container, parentContainer));
  });
  container.querySelectorAll('.btn-del-mock').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Delete this mock interview record?')) {
        deleteMockInterview(btn.getAttribute('data-id'));
        renderInterviewsTab(container, parentContainer);
      }
    };
  });
}

// ==========================================
// SUB-TAB 4: PROFILE & RESUME
// ==========================================

function renderProfileTab(container, parentContainer) {
  const profile = getCareerProfile();
  const resumeVers = getResumeVersions();
  const resumeChecklist = getResumeChecklist();
  const resumeCandidates = getResumeProjectCandidates();
  const codingProfiles = getCodingProfiles();
  const gh = getGitHubProfile();
  const li = getLinkedInProfile();
  const achievements = getAchievements();
  const certs = getCertifications();
  const docs = getCareerDocuments();

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); align-items: flex-start;">
      <!-- Left Column: Personal Profile & Resume Tracking -->
      <div style="display: flex; flex-direction: column; gap: var(--space-md);">
        <!-- Profile Card (Section 4) -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="user-avatar" style="width: 44px; height: 44px; font-size: 1.1rem;">${profile.full_name?.[0] || 'A'}</div>
              <div>
                <h3 style="margin: 0; font-size: 1.1rem; color: var(--color-text-primary);">${profile.full_name}</h3>
                <div style="font-size: 0.78rem; color: var(--color-accent-cyan); font-weight: 600;">${profile.headline}</div>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-edit-profile-card">${ICONS.edit} Edit</button>
          </div>

          <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 12px;">
            ${profile.bio || '1st Year B.Tech Computer Science student specializing in AI/ML.'}
          </p>

          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.78rem; color: var(--color-text-muted); margin-bottom: 12px;">
            <div>🎓 <strong>Education:</strong> ${profile.degree} - ${profile.education} (${profile.graduation_year})</div>
            <div>🏛️ <strong>University:</strong> ${profile.university}</div>
            <div>📍 <strong>Location:</strong> ${profile.location}</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px; border-top: 1px solid var(--color-border); padding-top: 10px;">
            <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Skills Breakdown</div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${(profile.skills?.programming || []).map(s => `<span class="badge badge-purple" style="font-size: 0.68rem;">${s}</span>`).join('')}
              ${(profile.skills?.aiml || []).map(s => `<span class="badge badge-cyan" style="font-size: 0.68rem;">${s}</span>`).join('')}
              ${(profile.skills?.backend || []).map(s => `<span class="badge badge-emerald" style="font-size: 0.68rem;">${s}</span>`).join('')}
              ${(profile.skills?.cloud || []).map(s => `<span class="badge badge-amber" style="font-size: 0.68rem;">${s}</span>`).join('')}
            </div>
          </div>
        </div>

        <!-- Resume Tracker & 12-Item Checklist (Sections 5 & 6) -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${getIcon('fileText', 'text-emerald')}
              <h3 style="margin: 0; font-size: 1rem; font-weight: 700;">RESUME VERSIONS & CHECKLIST</h3>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-add-resume-ver">${getIcon('plus')} New Version</button>
          </div>

          <!-- Versions List -->
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;">
            ${resumeVers.map(r => `
              <div style="padding: 8px 10px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: var(--color-text-primary); font-size: 0.85rem;">${r.version_name}</strong>
                  <div style="font-size: 0.72rem; color: var(--color-text-muted);">Updated: ${r.date_updated} · Status: <span class="badge ${r.status === 'Ready' ? 'badge-emerald' : 'badge-amber'}" style="font-size: 0.65rem;">${r.status}</span></div>
                </div>
                <button class="btn btn-ghost btn-sm btn-icon btn-edit-res" data-id="${r.id}">${ICONS.edit}</button>
              </div>
            `).join('')}
          </div>

          <!-- 12-Item Checklist -->
          <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700; margin-bottom: 6px;">
            Resume Readiness Checklist (Section 6)
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            ${RESUME_CHECKLIST_ITEMS.map(item => `
              <label style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; cursor: pointer;">
                <input type="checkbox" class="chk-resume" data-key="${item.key}" ${resumeChecklist[item.key] ? 'checked' : ''} />
                <span style="${resumeChecklist[item.key] ? 'text-decoration: line-through; color: var(--color-text-muted);' : 'color: var(--color-text-primary);'}">${item.label}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Project → Resume Connection (Section 7) -->
        <div class="card">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            ${getIcon('projects', 'text-purple')}
            <h3 style="margin: 0; font-size: 1rem; font-weight: 700;">RESUME PROJECT CANDIDATES (Phase 6 Sync)</h3>
          </div>
          <p style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 10px;">
            Projects selected directly from Phase 6. Toggle projects to mark as Resume Ready.
          </p>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${resumeCandidates.map(p => `
              <div style="padding: 10px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="font-size: 0.88rem; color: var(--color-text-primary);">${p.name}</strong>
                  <div style="font-size: 0.72rem; color: var(--color-text-muted);">${p.technology}</div>
                  ${p.achievement ? `<div style="font-size: 0.72rem; color: var(--color-accent-emerald);">🏆 ${p.achievement}</div>` : ''}
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                  <label style="display: flex; align-items: center; gap: 4px; font-size: 0.75rem; cursor: pointer;">
                    <input type="checkbox" class="chk-res-ready" data-pid="${p.project_id}" ${p.resume_ready ? 'checked' : ''} />
                    <span style="font-weight: 600; color: ${p.resume_ready ? 'var(--color-accent-emerald)' : 'var(--color-text-muted)'};">Resume Ready</span>
                  </label>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Right Column: Coding Profiles, GitHub, LinkedIn, Achievements -->
      <div style="display: flex; flex-direction: column; gap: var(--space-md);">
        <!-- Coding Profiles (Section 9) -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${getIcon('dsa', 'text-amber')}
              <h3 style="margin: 0; font-size: 1rem; font-weight: 700;">CODING PROFILES (Manual Entry)</h3>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${codingProfiles.map(cp => `
              <div style="padding: 8px 10px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <strong style="color: var(--color-text-primary); font-size: 0.85rem;">${cp.platform}</strong>
                    ${cp.username ? `<span class="badge badge-purple" style="font-size: 0.65rem;">@${cp.username}</span>` : ''}
                  </div>
                  <div style="font-size: 0.72rem; color: var(--color-text-muted);">${cp.problems_solved || 0} problems solved ${cp.last_activity ? `· active ${cp.last_activity}` : ''}</div>
                </div>
                <button class="btn btn-ghost btn-sm btn-icon btn-edit-cp" data-platform="${cp.platform}">${ICONS.edit}</button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- GitHub & LinkedIn Cards (Sections 8 & 10) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <!-- GitHub Card -->
          <div class="card" style="padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                ${getIcon('github', 'text-purple')}
                <strong style="font-size: 0.88rem;">GitHub Profile</strong>
              </div>
              <button class="btn btn-ghost btn-sm btn-icon" id="btn-edit-gh">${ICONS.edit}</button>
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 6px;">
              @${gh.username || 'not set'} · ${gh.pinned_projects?.length || 0} pinned
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${GITHUB_PROFILE_CHECKLIST_ITEMS.slice(0, 5).map(item => `
                <label style="display: flex; align-items: center; gap: 4px; font-size: 0.7rem; cursor: pointer;">
                  <input type="checkbox" class="chk-gh" data-key="${item.key}" ${gh.checklist?.[item.key] ? 'checked' : ''} />
                  <span>${item.label}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- LinkedIn Card -->
          <div class="card" style="padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                ${getIcon('linkedin', 'text-cyan')}
                <strong style="font-size: 0.88rem;">LinkedIn Profile</strong>
              </div>
              <button class="btn btn-ghost btn-sm btn-icon" id="btn-edit-li">${ICONS.edit}</button>
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 6px;">
              ${li.headline ? 'Profile active' : 'Not set'}
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              ${LINKEDIN_CHECKLIST_ITEMS.slice(0, 5).map(item => `
                <label style="display: flex; align-items: center; gap: 4px; font-size: 0.7rem; cursor: pointer;">
                  <input type="checkbox" class="chk-li" data-key="${item.key}" ${li.checklist?.[item.key] ? 'checked' : ''} />
                  <span>${item.label}</span>
                </label>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Achievements & Certifications (Sections 12 & 13) -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              ${getIcon('award', 'text-amber')}
              <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700;">ACHIEVEMENTS & HACKATHONS</h3>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-add-ach">${getIcon('plus')} Add</button>
          </div>

          ${achievements.length === 0 ? `
            <div class="text-muted" style="font-size: 0.78rem;">No achievements logged yet.</div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
              ${achievements.map(a => `
                <div style="padding: 6px 8px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
                  <div>
                    <strong style="color: var(--color-text-primary);">${a.title}</strong>
                    <div style="font-size: 0.7rem; color: var(--color-text-muted);">${a.category} · ${a.date}</div>
                  </div>
                  <button class="btn btn-ghost btn-sm btn-icon btn-del-ach" data-id="${a.id}" style="color: var(--color-accent-rose);">${ICONS.trash}</button>
                </div>
              `).join('')}
            </div>
          `}

          <!-- Certifications -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; margin-bottom: 8px; padding-top: 8px; border-top: 1px solid var(--color-border);">
            <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Certifications</div>
            <button class="btn btn-secondary btn-sm" id="btn-add-cert">${getIcon('plus')} Add</button>
          </div>

          ${certs.length === 0 ? `
            <div class="text-muted" style="font-size: 0.78rem;">No certifications added yet.</div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${certs.map(c => `
                <div style="padding: 6px 8px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
                  <div>
                    <strong style="color: var(--color-text-primary);">${c.certification}</strong>
                    <div style="font-size: 0.7rem; color: var(--color-text-muted);">${c.provider} · <span class="badge ${c.status === 'Completed' ? 'badge-emerald' : 'badge-amber'}" style="font-size: 0.62rem;">${c.status}</span></div>
                  </div>
                  <button class="btn btn-ghost btn-sm btn-icon btn-del-cert" data-id="${c.id}" style="color: var(--color-accent-rose);">${ICONS.trash}</button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  // Attach handlers
  document.getElementById('btn-edit-profile-card').onclick = () => openCareerProfileModal(() => renderProfileTab(container, parentContainer));
  document.getElementById('btn-add-resume-ver').onclick = () => openResumeVersionModal(null, () => renderProfileTab(container, parentContainer));
  document.getElementById('btn-edit-gh').onclick = () => openGitHubProfileModal(() => renderProfileTab(container, parentContainer));
  document.getElementById('btn-edit-li').onclick = () => openLinkedInModal(() => renderProfileTab(container, parentContainer));
  document.getElementById('btn-add-ach').onclick = () => openAchievementModal(null, () => renderProfileTab(container, parentContainer));
  document.getElementById('btn-add-cert').onclick = () => openCertificationModal(null, () => renderProfileTab(container, parentContainer));

  container.querySelectorAll('.chk-resume').forEach(chk => {
    chk.onchange = () => toggleResumeChecklistItem(chk.getAttribute('data-key'));
  });
  container.querySelectorAll('.chk-gh').forEach(chk => {
    chk.onchange = () => toggleGitHubProfileChecklistItem(chk.getAttribute('data-key'));
  });
  container.querySelectorAll('.chk-li').forEach(chk => {
    chk.onchange = () => toggleLinkedInChecklistItem(chk.getAttribute('data-key'));
  });
  container.querySelectorAll('.btn-edit-res').forEach(btn => {
    btn.onclick = () => openResumeVersionModal(btn.getAttribute('data-id'), () => renderProfileTab(container, parentContainer));
  });
  container.querySelectorAll('.btn-edit-cp').forEach(btn => {
    btn.onclick = () => openCodingProfileModal(btn.getAttribute('data-platform'), () => renderProfileTab(container, parentContainer));
  });
  container.querySelectorAll('.chk-res-ready').forEach(chk => {
    chk.onchange = () => toggleProjectResumeReady(chk.getAttribute('data-pid'), chk.checked);
  });
  container.querySelectorAll('.btn-del-ach').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Delete this achievement?')) {
        deleteAchievement(btn.getAttribute('data-id'));
        renderProfileTab(container, parentContainer);
      }
    };
  });
  container.querySelectorAll('.btn-del-cert').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Delete this certification?')) {
        deleteCertification(btn.getAttribute('data-id'));
        renderProfileTab(container, parentContainer);
      }
    };
  });
}

// ==========================================
// SUB-TAB 5: APTITUDE PREPARATION
// ==========================================

function renderAptitudeTab(container, parentContainer) {
  const stats = getAptitudeStats();
  const sessions = getAptitudeSessions();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <!-- Top Metrics & Action -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          ${getIcon('target', 'text-amber')}
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700;">APTITUDE PRACTICE & DRILLS</h3>
        </div>
        <button class="btn btn-primary btn-sm" id="btn-log-aptitude-sess">
          ${getIcon('plus')} Log Practice Session
        </button>
      </div>

      <!-- Categories Overview Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
        ${APTITUDE_CATEGORIES.map(cat => {
          const cData = stats.byCategory[cat] || { attempted: 0, solved: 0, sessions: 0 };
          const acc = cData.attempted > 0 ? Math.round((cData.solved / cData.attempted) * 100) : 0;
          return `
            <div class="card" style="padding: 12px;">
              <strong style="color: var(--color-text-primary); font-size: 0.9rem;">${cat}</strong>
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-accent-amber); margin: 4px 0;">
                ${cData.solved} / ${cData.attempted}
              </div>
              <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${acc}% accuracy · ${cData.sessions} sessions</div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Session History Table -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 12px 16px; border-bottom: 1px solid var(--color-border); font-weight: 700; font-size: 0.88rem;">
          Practice Sessions History
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--color-border); background: rgba(255, 255, 255, 0.02); color: var(--color-text-muted); font-size: 0.72rem; text-transform: uppercase;">
              <th style="padding: 10px 14px;">Date</th>
              <th style="padding: 10px 14px;">Category</th>
              <th style="padding: 10px 14px;">Topic</th>
              <th style="padding: 10px 14px;">Solved / Attempted</th>
              <th style="padding: 10px 14px;">Accuracy</th>
              <th style="padding: 10px 14px;">Duration</th>
              <th style="padding: 10px 14px;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.length === 0 ? `
              <tr><td colspan="7" style="padding: 24px; text-align: center; color: var(--color-text-muted);">No aptitude sessions recorded yet. Start practicing quantitative and reasoning modules!</td></tr>
            ` : sessions.map(s => `
              <tr style="border-bottom: 1px solid var(--color-border);">
                <td style="padding: 10px 14px; font-weight: 600;">${s.date}</td>
                <td style="padding: 10px 14px;"><span class="badge badge-purple" style="font-size: 0.65rem;">${s.category}</span></td>
                <td style="padding: 10px 14px; color: var(--color-text-primary); font-weight: 600;">${s.topic}</td>
                <td style="padding: 10px 14px;">${s.questions_solved} / ${s.questions_attempted}</td>
                <td style="padding: 10px 14px;">
                  <span class="badge ${s.accuracy >= 80 ? 'badge-emerald' : 'badge-amber'}" style="font-size: 0.68rem;">${s.accuracy}%</span>
                </td>
                <td style="padding: 10px 14px; color: var(--color-text-muted);">${s.time_spent_minutes}m</td>
                <td style="padding: 10px 14px; color: var(--color-text-secondary); font-size: 0.75rem;">${s.notes || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('btn-log-aptitude-sess').onclick = () => openAptitudeSessionModal(() => renderAptitudeTab(container, parentContainer));
}

// ==========================================
// SUB-TAB 6: OUTREACH & NETWORK
// ==========================================

function renderOutreachTab(container, parentContainer) {
  const outreach = getOutreach();
  const referrals = getReferrals();
  const network = getNetworking();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <!-- Outreach Tracker (Section 21) -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('send', 'text-cyan')}
            <h3 style="margin: 0; font-size: 1rem; font-weight: 700;">COLD EMAIL & RECRUITER OUTREACH</h3>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-add-outreach">${getIcon('plus')} Log Outreach</button>
        </div>

        ${outreach.length === 0 ? `
          <div class="text-muted" style="padding: 12px; font-size: 0.8rem;">No cold outreach entries logged. Record messages sent to recruiters and engineers.</div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;">
            ${outreach.map(o => `
              <div style="padding: 10px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border: 1px solid var(--color-border); display: flex; flex-direction: column; justify-content: space-between; gap: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <strong style="color: var(--color-text-primary); font-size: 0.88rem;">${o.contact} (${o.company})</strong>
                  <span class="badge ${o.status === 'Replied' ? 'badge-emerald' : 'badge-cyan'}" style="font-size: 0.65rem;">${o.status}</span>
                </div>
                <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${o.purpose}</div>
                <div style="font-size: 0.7rem; color: var(--color-text-muted); display: flex; justify-content: space-between;">
                  <span>Sent: ${o.date_sent}</span>
                  ${o.follow_up_date ? `<span style="color: var(--color-accent-amber);">Follow-up: ${o.follow_up_date}</span>` : ''}
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 4px; margin-top: 4px;">
                  <button class="btn btn-ghost btn-sm btn-icon btn-edit-out" data-id="${o.id}">${ICONS.edit}</button>
                  <button class="btn btn-ghost btn-sm btn-icon btn-del-out" data-id="${o.id}" style="color: var(--color-accent-rose);">${ICONS.trash}</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Referral & Networking Trackers (Sections 22 & 23) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
        <!-- Referrals -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${getIcon('users', 'text-emerald')}
              <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700;">REFERRAL TRACKER</h3>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-add-ref">${getIcon('plus')} Add</button>
          </div>

          ${referrals.length === 0 ? `
            <div class="text-muted" style="padding: 12px; font-size: 0.78rem;">No referrals logged.</div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${referrals.map(r => `
                <div style="padding: 8px 10px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="color: var(--color-text-primary); font-size: 0.85rem;">${r.person}</strong>
                    <div style="font-size: 0.72rem; color: var(--color-text-muted);">${r.company} · ${r.role} · <span class="badge badge-purple" style="font-size: 0.62rem;">${r.status}</span></div>
                  </div>
                  <button class="btn btn-ghost btn-sm btn-icon btn-del-ref" data-id="${r.id}" style="color: var(--color-accent-rose);">${ICONS.trash}</button>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Networking Connections -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${getIcon('users', 'text-purple')}
              <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700;">NETWORKING CONNECTIONS</h3>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-add-net">${getIcon('plus')} Add</button>
          </div>

          ${network.length === 0 ? `
            <div class="text-muted" style="padding: 12px; font-size: 0.78rem;">No networking connections logged.</div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${network.map(n => `
                <div style="padding: 8px 10px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="color: var(--color-text-primary); font-size: 0.85rem;">${n.person}</strong>
                    <div style="font-size: 0.72rem; color: var(--color-text-muted);">${n.organization} (${n.platform})</div>
                  </div>
                  <button class="btn btn-ghost btn-sm btn-icon btn-del-net" data-id="${n.id}" style="color: var(--color-accent-rose);">${ICONS.trash}</button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-add-outreach').onclick = () => openOutreachModal(null, () => renderOutreachTab(container, parentContainer));
  document.getElementById('btn-add-ref').onclick = () => openReferralModal(null, () => renderOutreachTab(container, parentContainer));
  document.getElementById('btn-add-net').onclick = () => openNetworkingModal(null, () => renderOutreachTab(container, parentContainer));

  container.querySelectorAll('.btn-edit-out').forEach(btn => {
    btn.onclick = () => openOutreachModal(btn.getAttribute('data-id'), () => renderOutreachTab(container, parentContainer));
  });
  container.querySelectorAll('.btn-del-out').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Delete outreach record?')) {
        deleteOutreach(btn.getAttribute('data-id'));
        renderOutreachTab(container, parentContainer);
      }
    };
  });
  container.querySelectorAll('.btn-del-ref').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Delete referral record?')) {
        deleteReferral(btn.getAttribute('data-id'));
        renderOutreachTab(container, parentContainer);
      }
    };
  });
  container.querySelectorAll('.btn-del-net').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Delete networking contact?')) {
        deleteNetworking(btn.getAttribute('data-id'));
        renderOutreachTab(container, parentContainer);
      }
    };
  });
}

// ==========================================
// SUB-TAB 7: CAREER JOURNAL
// ==========================================

function renderJournalTab(container, parentContainer) {
  const journal = getCareerJournal();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
          ${getIcon('journal', 'text-cyan')}
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700;">CAREER PREPARATION JOURNAL</h3>
        </div>
        <button class="btn btn-primary btn-sm" id="btn-add-career-journal-entry">
          ${getIcon('plus')} New Journal Entry
        </button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${journal.length === 0 ? `
          <div class="card text-muted" style="text-align: center; padding: 24px;">No career journal entries recorded yet. Document your learnings, mock interview reflections, and interview strategies.</div>
        ` : journal.map(j => `
          <div class="card" style="padding: 12px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="color: var(--color-text-primary); font-size: 0.95rem;">${j.title}</strong>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.72rem; color: var(--color-accent-cyan); font-weight: 600;">${j.date}</span>
                <button class="btn btn-ghost btn-sm btn-icon btn-del-jou" data-id="${j.id}" style="color: var(--color-accent-rose);">${ICONS.trash}</button>
              </div>
            </div>
            <div style="font-size: 0.82rem; color: var(--color-text-secondary); line-height: 1.5; white-space: pre-wrap;">${j.notes}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('btn-add-career-journal-entry').onclick = () => {
    const title = prompt('Journal Title:', 'Interview prep notes');
    if (!title) return;
    const notes = prompt('Notes / Reflections:', '');
    addCareerJournalEntry({ title, notes: notes || '' });
    renderJournalTab(container, parentContainer);
  };

  container.querySelectorAll('.btn-del-jou').forEach(btn => {
    btn.onclick = () => {
      if (confirm('Delete this entry?')) {
        deleteCareerJournalEntry(btn.getAttribute('data-id'));
        renderJournalTab(container, parentContainer);
      }
    };
  });
}

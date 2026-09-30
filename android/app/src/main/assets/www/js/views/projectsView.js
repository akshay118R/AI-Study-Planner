/**
 * Akshay's 12-Month AI/ML Career OS - Projects & Portfolio View (Phase 6)
 * 
 * Flow:
 * ROADMAP PROJECT -> PROJECT -> MILESTONE -> FEATURE -> TASK -> DAILY TASK -> WORK SESSION -> COMPLETION -> GITHUB -> DEPLOYMENT -> DOCUMENTATION -> PORTFOLIO -> RESUME
 */

import { getState, updateState } from '../data/storage.js';
import { getIcon, ICONS } from '../components/icons.js';
import {
  PROJECT_CATEGORIES,
  PROJECT_TYPES,
  PROJECT_DIFFICULTIES,
  PROJECT_STATUSES,
  PORTFOLIO_STATUSES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  TECH_STACK_PRESETS,
  GITHUB_READY_CHECKLIST_ITEMS,
  README_CHECKLIST_ITEMS,
  DEPLOYMENT_CHECKLIST_ITEMS,
  DEPLOYMENT_PLATFORMS,
  TESTING_CATEGORIES,
  PORTFOLIO_READINESS_CHECKLIST_ITEMS,
  QUALITY_CHECK_CATEGORIES,
  calculateProjectMetrics,
  getProjects,
  getProjectById,
  updateProject,
  archiveProject,
  restoreProject,
  deleteProject,
  toggleProjectTask,
  deleteProjectTask,
  toggleGitHubChecklistItem,
  toggleReadmeChecklistItem,
  toggleDeploymentChecklistItem,
  togglePortfolioReadinessChecklistItem,
  updateProjectTest,
  updateProjectDocumentation,
  addProjectChallenge,
  addProjectLearningLog,
  updateProjectResume,
  addProjectTechnology,
  removeProjectTechnology
} from '../services/projectEngine.js';

import {
  openNewProjectModal,
  openEditProjectModal,
  openProjectTaskModal,
  openMilestoneModal,
  openFeatureModal,
  openGoalModal,
  openStartProjectSessionModal,
  openProjectQualityCheckModal,
  openProjectCompletionConfirmModal,
  openProjectIdeaModal,
  openConvertIdeaModal,
  openPortfolioCsvModal
} from '../components/modals.js';

// Component local state
let activeView = 'kanban'; // 'kanban' | 'list' | 'portfolio' | 'ideas' | 'archived'
let selectedCategory = 'All';
let selectedProjectId = null;
let activeDetailTab = 'overview';
let searchQuery = '';
let filterType = 'All';
let filterDifficulty = 'All';
let filterDeployment = 'All';
let sortBy = 'Recently Updated';

export function renderProjects(container) {
  const state = getState();
  const metrics = calculateProjectMetrics();

  // Load project list
  const filteredProjects = getProjects({
    category: selectedCategory,
    type: filterType,
    difficulty: filterDifficulty,
    deploymentStatus: filterDeployment,
    search: searchQuery,
    sort: sortBy,
    includeArchived: activeView === 'archived',
    status: activeView === 'archived' ? 'Archived' : 'All'
  });

  // Ensure a selected project exists
  if (!selectedProjectId && filteredProjects.length > 0) {
    selectedProjectId = filteredProjects[0].id;
  } else if (selectedProjectId && !filteredProjects.some(p => p.id === selectedProjectId)) {
    selectedProjectId = filteredProjects[0]?.id || null;
  }

  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null;

  container.innerHTML = `
    <!-- Top Header -->
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">
          ${getIcon('projects', 'text-purple')}
          <span>MY PROJECTS</span>
        </h1>
        <div class="view-subtitle">
          End-to-End AI/ML & Systems Engineering Portfolio · 9-Stage Production Lifecycle
        </div>
      </div>
      <div class="view-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-secondary" id="btn-portfolio-csv">${getIcon('fileText')} Export CSV</button>
        <button class="btn btn-secondary" id="btn-start-project-session">${getIcon('clock')} Start Session</button>
        <button class="btn btn-primary" id="btn-create-project">${getIcon('plus')} New Project</button>
      </div>
    </div>

    <!-- Active Projects Limit Warning (Section 34) -->
    ${metrics.isOverActiveLimit ? `
      <div class="active-limit-warning" style="margin-bottom: var(--space-md);">
        <span>⚠️</span>
        <div style="flex: 1;">
          <strong>Active Projects Limit Exceeded (${metrics.active}/${metrics.maxActiveProjects}):</strong>
          Working on too many projects simultaneously fractures focus and delays portfolio deliverables. Keep active projects (Planned, Building, Testing) to ${metrics.maxActiveProjects}.
        </div>
      </div>
    ` : ''}

    <!-- High-Level Metrics (Section 1, 47) -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-lg);">
      <div class="stat-card" style="border-top: 3px solid var(--color-primary);">
        <div class="stat-header">TOTAL PROJECTS</div>
        <div class="stat-value">${metrics.total}</div>
        <div class="stat-subtext">${metrics.totalHours} total study hours logged</div>
      </div>

      <div class="stat-card" style="border-top: 3px solid var(--color-accent-purple);">
        <div class="stat-header">
          <span>ACTIVE PROJECTS</span>
          <span class="badge ${metrics.isOverActiveLimit ? 'badge-amber' : 'badge-purple'}" style="font-size: 0.65rem;">
            ${metrics.active} / ${metrics.maxActiveProjects} Limit
          </span>
        </div>
        <div class="stat-value text-purple">${metrics.active}</div>
        <div class="stat-subtext">Building & testing phase</div>
      </div>

      <div class="stat-card" style="border-top: 3px solid var(--color-accent-emerald);">
        <div class="stat-header">COMPLETED</div>
        <div class="stat-value text-emerald">${metrics.completed}</div>
        <div class="stat-subtext">${metrics.tasksCompleted} tasks completed</div>
      </div>

      <div class="stat-card" style="border-top: 3px solid var(--color-accent-cyan);">
        <div class="stat-header">DEPLOYED</div>
        <div class="stat-value text-cyan">${metrics.deployed}</div>
        <div class="stat-subtext">Live URLs & Cloud Endpoints</div>
      </div>

      <div class="stat-card" style="border-top: 3px solid var(--color-accent-amber);">
        <div class="stat-header">PORTFOLIO READY</div>
        <div class="stat-value text-amber">${metrics.portfolioReady}</div>
        <div class="stat-subtext">Verified & ATS Resume Ready</div>
      </div>
    </div>

    <!-- Category Filter Pills (Section 1) -->
    <div class="tabs-nav" style="margin-bottom: var(--space-md); overflow-x: auto;">
      <button class="tab-btn ${selectedCategory === 'All' ? 'active' : ''}" data-cat="All">All Projects (${metrics.total})</button>
      ${PROJECT_CATEGORIES.map(c => `
        <button class="tab-btn ${selectedCategory === c ? 'active' : ''}" data-cat="${c}">${c}</button>
      `).join('')}
    </div>

    <!-- Sub-View Navigation Tabs -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border); margin-bottom: var(--space-lg); flex-wrap: wrap; gap: 8px;">
      <div style="display: flex; gap: 6px; overflow-x: auto;">
        <button class="btn ${activeView === 'kanban' ? 'btn-primary' : 'btn-ghost'} btn-sm subview-nav-btn" data-view="kanban">
          📋 Kanban Board
        </button>
        <button class="btn ${activeView === 'list' ? 'btn-primary' : 'btn-ghost'} btn-sm subview-nav-btn" data-view="list">
          📑 All Projects List
        </button>
        <button class="btn ${activeView === 'portfolio' ? 'btn-primary' : 'btn-ghost'} btn-sm subview-nav-btn" data-view="portfolio">
          🌟 Portfolio Showcase
        </button>
        <button class="btn ${activeView === 'ideas' ? 'btn-primary' : 'btn-ghost'} btn-sm subview-nav-btn" data-view="ideas">
          💡 Ideas Incubator (${(state.project_ideas || []).length})
        </button>
        <button class="btn ${activeView === 'archived' ? 'btn-primary' : 'btn-ghost'} btn-sm subview-nav-btn" data-view="archived">
          📦 Archived
        </button>
      </div>

      <!-- Quick Search / Filter controls for List and Kanban -->
      <div style="display: flex; gap: 8px; align-items: center;">
        <input type="text" id="project-search-input" class="form-input" style="padding: 4px 10px; font-size: 0.78rem; width: 180px;" placeholder="Search projects..." value="${searchQuery}" />
        <select id="project-sort-select" class="form-select" style="padding: 4px 8px; font-size: 0.78rem; width: 140px;">
          <option value="Recently Updated" ${sortBy === 'Recently Updated' ? 'selected' : ''}>Recent</option>
          <option value="Newest" ${sortBy === 'Newest' ? 'selected' : ''}>Newest</option>
          <option value="Oldest" ${sortBy === 'Oldest' ? 'selected' : ''}>Oldest</option>
          <option value="Target Date" ${sortBy === 'Target Date' ? 'selected' : ''}>Target Date</option>
          <option value="Progress" ${sortBy === 'Progress' ? 'selected' : ''}>Progress</option>
          <option value="Priority" ${sortBy === 'Priority' ? 'selected' : ''}>Priority</option>
        </select>
      </div>
    </div>

    <!-- MAIN VIEW BODY -->
    <div id="projects-view-content">
      ${renderSubViewContent(activeView, filteredProjects, selectedProject, state)}
    </div>
  `;

  attachEventHandlers(container);
}

/**
 * Renders the chosen sub-view
 */
function renderSubViewContent(view, filteredProjects, selectedProject, state) {
  if (view === 'portfolio') {
    return renderPortfolioShowcase(state);
  }
  if (view === 'ideas') {
    return renderIdeasIncubator(state);
  }
  if (view === 'archived') {
    return renderArchivedProjects(filteredProjects);
  }

  // Master-Detail Split Layout for Kanban & List
  return `
    <div class="projects-layout-grid">
      <!-- Left: Kanban Board or Projects List -->
      <div class="projects-left-panel">
        ${view === 'kanban' ? renderKanbanBoard(filteredProjects) : renderProjectsList(filteredProjects)}
      </div>

      <!-- Right: Dedicated Project Detail Panel (Sections 6, 50, 51) -->
      <div class="projects-right-panel">
        ${selectedProject ? renderProjectDetailPanel(selectedProject) : `
          <div class="card" style="text-align: center; padding: var(--space-2xl); color: var(--color-text-muted);">
            Select or create a project to inspect its tasks, GitHub checklist, deployment, architecture, testing, and portfolio readiness.
          </div>
        `}
      </div>
    </div>
  `;
}

// ==========================================
// 1. KANBAN BOARD (Section 35)
// ==========================================

function renderKanbanBoard(projects) {
  const stages = [
    { key: 'Idea', label: 'Idea', badge: 'badge-slate' },
    { key: 'Planned', label: 'Planned', badge: 'badge-amber' },
    { key: 'Building', label: 'Building', badge: 'badge-purple' },
    { key: 'Testing', label: 'Testing', badge: 'badge-cyan' },
    { key: 'Deployed', label: 'Deployed', badge: 'badge-primary' },
    { key: 'Portfolio Ready', label: 'Portfolio Ready', badge: 'badge-amber' },
    { key: 'Completed', label: 'Completed', badge: 'badge-emerald' }
  ];

  return `
    <div class="kanban-board-container">
      ${stages.map(stage => {
        const stageProjects = projects.filter(p => p.status === stage.key);
        return `
          <div class="kanban-column" data-stage="${stage.key}">
            <div class="kanban-column-header">
              <span class="kanban-column-title">
                ${stage.label}
              </span>
              <span class="badge ${stage.badge}" style="font-size: 0.65rem;">${stageProjects.length}</span>
            </div>
            <div class="kanban-column-body" data-stage="${stage.key}">
              ${stageProjects.length === 0 ? `
                <div style="font-size: 0.72rem; color: var(--color-text-muted); text-align: center; padding: 20px 8px; border: 1px dashed var(--color-border-subtle); border-radius: var(--radius-sm);">
                  Drop project here
                </div>
              ` : stageProjects.map(p => `
                <div class="kanban-card ${p.id === selectedProjectId ? 'selected' : ''}" draggable="true" data-proj-id="${p.id}">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                    <span class="badge badge-purple" style="font-size: 0.62rem;">${p.category}</span>
                    <span style="font-size: 0.7rem; font-weight: 700; color: var(--color-text-muted);">${p.progress}%</span>
                  </div>
                  <h4 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 4px;">${p.name}</h4>
                  <div class="progress-bar-wrap" style="height: 4px; margin-bottom: 6px;">
                    <div class="progress-bar-fill purple" style="width: ${p.progress}%;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--color-text-muted);">
                    <span>${p.difficulty || 'Intermediate'}</span>
                    <span>${(p.tasks || []).filter(t => t.completed).length}/${(p.tasks || []).length} tasks</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ==========================================
// 2. ALL PROJECTS LIST (Section 36, 37)
// ==========================================

function renderProjectsList(projects) {
  if (projects.length === 0) {
    return `
      <div class="card" style="text-align: center; padding: var(--space-2xl); color: var(--color-text-muted);">
        No projects match your current filters. Click "New Project" to add one!
      </div>
    `;
  }

  return `
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${projects.map(p => {
        let statusBadge = 'badge-slate';
        if (p.status === 'Completed' || p.status === 'Deployed') statusBadge = 'badge-emerald';
        else if (p.status === 'Building' || p.status === 'Testing') statusBadge = 'badge-cyan';
        else if (p.status === 'Planned') statusBadge = 'badge-amber';
        else if (p.status === 'Portfolio Ready') statusBadge = 'badge-amber';

        const isSelected = p.id === selectedProjectId;

        return `
          <div class="card project-list-card ${isSelected ? 'selected' : ''}" data-proj-id="${p.id}" style="cursor: pointer; padding: 14px; border-left: 4px solid ${isSelected ? 'var(--color-accent-purple)' : 'transparent'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
              <div style="display: flex; gap: 6px;">
                <span class="badge badge-purple" style="font-size: 0.65rem;">${p.category}</span>
                <span class="badge ${statusBadge}" style="font-size: 0.65rem;">${p.status}</span>
              </div>
              <span style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--color-text-muted);">${p.progress}%</span>
            </div>

            <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 4px;">${p.name}</h3>
            <p style="font-size: 0.8rem; color: var(--color-text-secondary); line-height: 1.4; margin-bottom: 8px;">
              ${p.short_description || p.description || 'No description provided.'}
            </p>

            <div class="progress-bar-wrap" style="height: 4px; margin-bottom: 8px;">
              <div class="progress-bar-fill purple" style="width: ${p.progress}%;"></div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--color-text-muted);">
              <span>🛠️ ${p.technology || 'Core C / Python'}</span>
              <span>${(p.tasks || []).filter(t => t.completed).length}/${(p.tasks || []).length} tasks</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ==========================================
// 3. PROJECT DETAIL PANEL (Sections 6, 50, 51)
// ==========================================

function renderProjectDetailPanel(p) {
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'tasks', label: `Tasks (${p.tasks.length})` },
    { key: 'milestones', label: `Milestones (${p.milestones.length})` },
    { key: 'tech', label: 'Tech Stack' },
    { key: 'features', label: `Features (${p.features.length})` },
    { key: 'goals', label: `Goals (${p.goals.length})` },
    { key: 'timeline', label: 'Timeline' },
    { key: 'github', label: 'GitHub' },
    { key: 'deployment', label: `Deploy (${p.deployments.length})` },
    { key: 'testing', label: `Testing (${p.tests.length})` },
    { key: 'docs', label: 'Docs' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'resume', label: 'Resume' },
    { key: 'challenges', label: `Challenges (${p.challenges.length})` },
    { key: 'sessions', label: `Sessions (${p.sessions.length})` },
    { key: 'activity', label: 'Activity' }
  ];

  return `
    <div class="card" style="padding: var(--space-lg); border-top: 3px solid var(--color-accent-purple);">
      <!-- Top Action Bar -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
        <div>
          <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px;">
            <span class="badge badge-purple">${p.category}</span>
            <span class="badge badge-cyan">${p.type}</span>
            <span class="badge badge-slate">${p.difficulty}</span>
            <span class="badge badge-emerald">${p.status}</span>
          </div>
          <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0;">${p.name}</h2>
        </div>

        <div style="display: flex; gap: 6px; align-items: center;">
          <button class="btn btn-secondary btn-sm" id="btn-edit-current-project" title="Edit project">${getIcon('edit')} Edit</button>
          <button class="btn btn-secondary btn-sm" id="btn-session-current-project" title="Start session">${getIcon('clock')} Log Time</button>
          ${p.status !== 'Completed' ? `
            <button class="btn btn-primary btn-sm" id="btn-complete-current-project" title="Complete project">Mark Completed</button>
          ` : ''}
          <button class="btn btn-ghost btn-sm" id="btn-archive-current-project" title="Archive project">Archive</button>
          <button class="btn btn-ghost btn-icon btn-delete-current-project" style="color: var(--color-accent-rose);" title="Delete project">${ICONS.trash}</button>
        </div>
      </div>

      <!-- Navigation Tabs (Section 6, 51) -->
      <div class="project-detail-tabs">
        ${tabs.map(t => `
          <button class="project-detail-tab-btn ${activeDetailTab === t.key ? 'active' : ''}" data-tab="${t.key}">
            ${t.label}
          </button>
        `).join('')}
      </div>

      <!-- Tab Content Area -->
      <div style="margin-top: var(--space-md);">
        ${renderDetailTabBody(activeDetailTab, p)}
      </div>
    </div>
  `;
}

function renderDetailTabBody(tab, p) {
  switch (tab) {
    case 'overview':
      return renderOverviewTab(p);
    case 'tasks':
      return renderTasksTab(p);
    case 'milestones':
      return renderMilestonesTab(p);
    case 'tech':
      return renderTechStackTab(p);
    case 'features':
      return renderFeaturesTab(p);
    case 'goals':
      return renderGoalsTab(p);
    case 'timeline':
      return renderTimelineTab(p);
    case 'github':
      return renderGitHubTab(p);
    case 'deployment':
      return renderDeploymentTab(p);
    case 'testing':
      return renderTestingTab(p);
    case 'docs':
      return renderDocsTab(p);
    case 'portfolio':
      return renderPortfolioTab(p);
    case 'resume':
      return renderResumeTab(p);
    case 'challenges':
      return renderChallengesTab(p);
    case 'sessions':
      return renderSessionsTab(p);
    case 'activity':
      return renderActivityTab(p);
    default:
      return renderOverviewTab(p);
  }
}

// ------------------------------------------
// Sub-Tab Renderers
// ------------------------------------------

function renderOverviewTab(p) {
  const tl = p.timeline || {};
  return `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <!-- Progress Bar & Timeline Alert -->
      <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 6px;">
          <span>Mathematical Task Progress (Section 14)</span>
          <strong class="text-purple">${p.progress}%</strong>
        </div>
        <div class="progress-bar-wrap" style="height: 8px; margin-bottom: 8px;">
          <div class="progress-bar-fill purple" style="width: ${p.progress}%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-muted);">
          <span>Start: ${tl.startDate} · Target: ${tl.targetDate}</span>
          ${tl.isOverdue ? `
            <span class="badge badge-rose" style="font-size: 0.65rem;">⚠️ OVERDUE by ${Math.abs(tl.daysRemaining)} days</span>
          ` : `
            <span>${tl.daysRemaining >= 0 ? `${tl.daysRemaining} days remaining` : 'On Schedule'} (${tl.daysElapsed}d elapsed)</span>
          `}
        </div>
      </div>

      <!-- Problem Statement & Goal -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 4px;">Problem Statement</div>
          <div style="font-size: 0.85rem; line-height: 1.4;">${p.problem_statement || 'No problem statement recorded.'}</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 4px;">Target Goal / Metric</div>
          <div style="font-size: 0.85rem; line-height: 1.4;">${p.goal || 'No goal metric recorded.'}</div>
        </div>
      </div>

      <!-- Target Users & Outcome -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 4px;">Target Users</div>
          <div style="font-size: 0.85rem;">${p.target_users || 'General / Recruiters'}</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 4px;">Expected Outcome</div>
          <div style="font-size: 0.85rem;">${p.expected_outcome || 'Production microservice / library'}</div>
        </div>
      </div>

      <!-- Quick Metrics Summary -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: var(--color-bg-base); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); text-align: center;">
          <div style="font-size: 0.7rem; color: var(--color-text-muted);">TASKS</div>
          <strong style="font-size: 1.1rem;">${(p.tasks || []).filter(t => t.completed).length} / ${(p.tasks || []).length}</strong>
        </div>
        <div style="background: var(--color-bg-base); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); text-align: center;">
          <div style="font-size: 0.7rem; color: var(--color-text-muted);">MILESTONES</div>
          <strong style="font-size: 1.1rem;">${(p.milestones || []).filter(m => m.status === 'Completed').length} / ${(p.milestones || []).length}</strong>
        </div>
        <div style="background: var(--color-bg-base); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); text-align: center;">
          <div style="font-size: 0.7rem; color: var(--color-text-muted);">STUDY HOURS</div>
          <strong style="font-size: 1.1rem;">${p.hoursBreakdown?.totalHours || 0}h</strong>
        </div>
        <div style="background: var(--color-bg-base); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); text-align: center;">
          <div style="font-size: 0.7rem; color: var(--color-text-muted);">PORTFOLIO</div>
          <strong style="font-size: 0.9rem;" class="${p.portfolio_status === 'Portfolio Ready' ? 'text-amber' : ''}">${p.portfolio_status || 'Not Ready'}</strong>
        </div>
      </div>
    </div>
  `;
}

function renderTasksTab(p) {
  const tasks = p.tasks || [];
  return `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-secondary);">
          Project Task Hierarchy (Milestone → Feature → Task → Subtask)
        </span>
        <button class="btn btn-primary btn-sm" id="btn-add-project-task">${getIcon('plus')} Add Task</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${tasks.length === 0 ? `
          <div style="font-size: 0.82rem; color: var(--color-text-muted); text-align: center; padding: 20px;">
            No tasks defined. Add tasks to start tracking actual completion progress!
          </div>
        ` : tasks.map(t => {
          let pBadge = 'badge-slate';
          if (t.priority === 'Critical') pBadge = 'badge-rose';
          else if (t.priority === 'High') pBadge = 'badge-amber';
          else if (t.priority === 'Normal') pBadge = 'badge-purple';

          return `
            <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <input type="checkbox" class="custom-checkbox task-toggle-cb" data-task-id="${t.id}" ${t.completed || t.status === 'Completed' ? 'checked' : ''} />
                <div>
                  <div style="font-size: 0.88rem; font-weight: 600; ${t.completed || t.status === 'Completed' ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">
                    ${t.title}
                  </div>
                  <div style="display: flex; gap: 8px; font-size: 0.72rem; color: var(--color-text-muted); margin-top: 2px;">
                    <span class="badge ${pBadge}" style="font-size: 0.6rem; padding: 1px 4px;">${t.priority || 'Normal'}</span>
                    <span>${t.estimated_hours || 2}h est</span>
                    ${t.due_date ? `<span>Due: ${t.due_date}</span>` : ''}
                  </div>
                </div>
              </div>

              <div style="display: flex; gap: 6px;">
                <button class="btn btn-ghost btn-sm btn-edit-task" data-task-id="${t.id}">Edit</button>
                <button class="btn btn-ghost btn-icon btn-delete-task" data-task-id="${t.id}" style="color: var(--color-accent-rose);">${ICONS.trash}</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderMilestonesTab(p) {
  const milestones = p.milestones || [];
  return `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-secondary);">Project Milestones</span>
        <button class="btn btn-primary btn-sm" id="btn-add-milestone">${getIcon('plus')} Add Milestone</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${milestones.length === 0 ? `
          <div style="font-size: 0.82rem; color: var(--color-text-muted); text-align: center; padding: 20px;">
            No milestones added. Milestones organize large engineering projects into clear deliverables.
          </div>
        ` : milestones.map(m => `
          <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <strong style="font-size: 0.92rem;">${m.title}</strong>
              <span class="badge ${m.status === 'Completed' ? 'badge-emerald' : 'badge-purple'}">${m.status}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 4px;">
              <span>Target: ${m.target_date || 'No date set'}</span>
              <span>${m.progress || 0}%</span>
            </div>
            <div class="progress-bar-wrap" style="height: 5px;">
              <div class="progress-bar-fill purple" style="width: ${m.progress || 0}%;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderTechStackTab(p) {
  const techs = p.technologies || [];
  return `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-secondary);">Tech Stack (Section 9)</span>
        <div style="display: flex; gap: 6px;">
          <input type="text" id="tech-custom-input" class="form-input" style="padding: 4px 8px; font-size: 0.78rem; width: 150px;" placeholder="Add technology..." />
          <button class="btn btn-primary btn-sm" id="btn-add-tech-custom">+ Add</button>
        </div>
      </div>

      <!-- Quick Add Category Presets -->
      <div style="background: var(--color-bg-base); padding: 10px; border-radius: var(--radius-md); border: 1px solid var(--color-border); margin-bottom: 14px;">
        <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 6px;">
          Quick Select Presets
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${Object.entries(TECH_STACK_PRESETS).flatMap(([cat, list]) => list.map(item => `
            <button class="btn btn-ghost btn-sm btn-quick-tech" data-tech="${item}" data-cat="${cat}" style="padding: 2px 8px; font-size: 0.75rem; background: rgba(255, 255, 255, 0.04);">
              + ${item}
            </button>
          `)).slice(0, 18).join('')}
        </div>
      </div>

      <!-- Currently Selected Technologies -->
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${techs.length === 0 ? `
          <div style="font-size: 0.82rem; color: var(--color-text-muted);">No technologies assigned yet. Use presets or input above.</div>
        ` : techs.map(t => `
          <span class="badge badge-purple" style="font-size: 0.82rem; padding: 4px 10px; display: inline-flex; align-items: center; gap: 6px;">
            <span>${t.name}</span>
            <button class="btn-remove-tech" data-tech-id="${t.id}" style="background: none; border: none; color: inherit; cursor: pointer; padding: 0;">×</button>
          </span>
        `).join('')}
      </div>
    </div>
  `;
}

function renderFeaturesTab(p) {
  const feats = p.features || [];
  return `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-secondary);">Project Features (Section 8)</span>
        <button class="btn btn-primary btn-sm" id="btn-add-feature">${getIcon('plus')} Add Feature</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${feats.length === 0 ? `
          <div style="font-size: 0.82rem; color: var(--color-text-muted); text-align: center; padding: 20px;">
            No features created. Example: Authentication, RAG Pipeline, Analytics Dashboard.
          </div>
        ` : feats.map(f => `
          <div style="background: var(--color-bg-base); padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 0.88rem;">${f.name}</strong>
              <div style="font-size: 0.72rem; color: var(--color-text-muted);">${f.description || 'No description'}</div>
            </div>
            <span class="badge ${f.status === 'Completed' ? 'badge-emerald' : 'badge-slate'}">${f.status}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderGoalsTab(p) {
  const goals = p.goals || [];
  return `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-secondary);">Project Goals (Section 7)</span>
        <button class="btn btn-primary btn-sm" id="btn-add-goal">${getIcon('plus')} Add Goal</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${goals.length === 0 ? `
          <div style="font-size: 0.82rem; color: var(--color-text-muted); text-align: center; padding: 20px;">
            No goals added. Example: "Build AI Chatbot", "Sub-50ms inference latency".
          </div>
        ` : goals.map(g => `
          <div style="background: var(--color-bg-base); padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="font-size: 0.88rem;">${g.name}</strong>
              <span class="badge ${g.status === 'Completed' ? 'badge-emerald' : 'badge-slate'}">${g.status}</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">${g.description || ''}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderTimelineTab(p) {
  const tl = p.timeline || {};
  return `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="background: var(--color-bg-base); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 12px;">Project Lifecycle Timeline (Section 13)</h4>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase;">Start Date</div>
            <strong style="font-size: 1rem;">${tl.startDate}</strong>
          </div>
          <div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase;">Target Date</div>
            <strong style="font-size: 1rem;">${tl.targetDate}</strong>
          </div>
          <div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase;">Actual Completion</div>
            <strong style="font-size: 1rem;">${tl.actualCompletionDate || 'In Progress'}</strong>
          </div>
        </div>

        <div style="display: flex; gap: 16px; font-size: 0.85rem; padding: 10px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-sm);">
          <span>Days Elapsed: <strong>${tl.daysElapsed} days</strong></span>
          <span>Days Remaining: <strong>${tl.daysRemaining} days</strong></span>
          ${tl.isOverdue ? `
            <span class="badge badge-rose">⚠️ Overdue (Do Not Delete)</span>
          ` : `
            <span class="badge badge-emerald">On Schedule</span>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderGitHubTab(p) {
  const gh = p.github || {};
  const readyChecklist = gh.github_ready_checklist || {};
  const readmeChecklist = gh.readme_checklist || {};

  return `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- GitHub Meta Form -->
      <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="font-size: 0.95rem; font-weight: 700;">GitHub Repository (Section 20)</h4>
          <span class="badge badge-purple">${gh.status || 'Active'}</span>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div class="form-group">
            <label class="form-label">Repository URL</label>
            <input type="url" id="gh-url-input" class="form-input" value="${gh.repo_url || p.githubUrl || ''}" placeholder="https://github.com/..." />
          </div>
          <div class="form-group">
            <label class="form-label">Default Branch</label>
            <input type="text" id="gh-branch-input" class="form-input" value="${gh.branch || 'main'}" />
          </div>
        </div>

        <button class="btn btn-secondary btn-sm" id="btn-save-gh-meta">Save Repo Info</button>
      </div>

      <!-- 12-Item GITHUB READY Checklist (Section 21) -->
      <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <div style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
          GITHUB READY Checklist (12 Points)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          ${GITHUB_READY_CHECKLIST_ITEMS.map(item => `
            <label class="checklist-item-row ${readyChecklist[item.key] ? 'checked' : ''}" style="font-size: 0.8rem; cursor: pointer;">
              <input type="checkbox" class="custom-checkbox gh-ready-cb" data-key="${item.key}" ${readyChecklist[item.key] ? 'checked' : ''} />
              <span>${item.label}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- 10-Item README Readiness Checklist (Section 22) -->
      <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <div style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
          README Readiness Checklist (10 Points)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          ${README_CHECKLIST_ITEMS.map(item => `
            <label class="checklist-item-row ${readmeChecklist[item.key] ? 'checked' : ''}" style="font-size: 0.8rem; cursor: pointer;">
              <input type="checkbox" class="custom-checkbox readme-cb" data-key="${item.key}" ${readmeChecklist[item.key] ? 'checked' : ''} />
              <span>${item.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderDeploymentTab(p) {
  const deps = p.deployments || [];
  const primaryDep = deps[0] || {};
  const depChecklist = primaryDep.checklist || {};

  return `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 10px;">Deployment Settings (Section 23)</h4>

        <div style="display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div class="form-group">
            <label class="form-label">Platform</label>
            <select class="form-select" id="dep-platform-input">
              ${DEPLOYMENT_PLATFORMS.map(pl => `<option value="${pl}" ${primaryDep.platform === pl ? 'selected' : ''}>${pl}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Live Deployment URL</label>
            <input type="url" id="dep-url-input" class="form-input" value="${primaryDep.url || p.liveUrl || ''}" placeholder="https://..." />
          </div>
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-select" id="dep-status-input">
              <option value="Not Deployed" ${primaryDep.status === 'Not Deployed' ? 'selected' : ''}>Not Deployed</option>
              <option value="Deploying" ${primaryDep.status === 'Deploying' ? 'selected' : ''}>Deploying</option>
              <option value="Deployed" ${primaryDep.status === 'Deployed' ? 'selected' : ''}>Deployed</option>
              <option value="Failed" ${primaryDep.status === 'Failed' ? 'selected' : ''}>Failed</option>
            </select>
          </div>
        </div>

        <button class="btn btn-secondary btn-sm" id="btn-save-dep-meta">Save Deployment</button>
      </div>

      <!-- 9-Item Deployment Checklist (Section 24) -->
      <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <div style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
          DEPLOYMENT CHECKLIST (9 Points)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          ${DEPLOYMENT_CHECKLIST_ITEMS.map(item => `
            <label class="checklist-item-row ${depChecklist[item.key] ? 'checked' : ''}" style="font-size: 0.8rem; cursor: pointer;">
              <input type="checkbox" class="custom-checkbox dep-check-cb" data-dep-id="${primaryDep.id || 'dep-1'}" data-key="${item.key}" ${depChecklist[item.key] ? 'checked' : ''} />
              <span>${item.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderTestingTab(p) {
  const tests = p.tests || [];
  return `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-secondary);">
          8-Category Testing Checklist (Section 25)
        </span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${TESTING_CATEGORIES.map(cat => {
          const t = tests.find(item => item.category === cat) || { status: 'Not Tested', notes: '' };
          return `
            <div style="background: var(--color-bg-base); padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; gap: 12px;">
              <div style="flex: 1;">
                <strong style="font-size: 0.85rem;">${cat}</strong>
                <input type="text" class="form-input test-notes-input" data-category="${cat}" value="${t.notes || ''}" placeholder="Test notes / assertions..." style="font-size: 0.75rem; padding: 2px 6px; margin-top: 4px;" />
              </div>
              <select class="form-select test-status-select" data-category="${cat}" style="width: 120px; font-size: 0.78rem;">
                <option value="Not Tested" ${t.status === 'Not Tested' ? 'selected' : ''}>Not Tested</option>
                <option value="Pass" ${t.status === 'Pass' ? 'selected' : ''}>Pass ✅</option>
                <option value="Fail" ${t.status === 'Fail' ? 'selected' : ''}>Fail ❌</option>
              </select>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderDocsTab(p) {
  const doc = p.documentation || {};
  return `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 10px;">Project Documentation & Architecture (Sections 26, 27)</h4>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="form-group">
            <label class="form-label">Solution Architecture Overview</label>
            <textarea class="form-textarea doc-input" data-field="solution" rows="2">${doc.solution || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Architecture Components</label>
            <input type="text" class="form-input doc-input" data-field="architecture_components" value="${doc.architecture_components || ''}" placeholder="e.g. FastAPI Gateway, Redis Cache, PostgreSQL" />
          </div>
          <div class="form-group">
            <label class="form-label">Data Flow</label>
            <input type="text" class="form-input doc-input" data-field="architecture_data_flow" value="${doc.architecture_data_flow || ''}" placeholder="Client -> Gateway -> Worker -> Vector DB" />
          </div>
          <div class="form-group">
            <label class="form-label">Technology Choices & Rationale</label>
            <textarea class="form-textarea doc-input" data-field="tech_choices" rows="2">${doc.tech_choices || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Results & Benchmarks</label>
            <textarea class="form-textarea doc-input" data-field="results" rows="2">${doc.results || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Future Improvements</label>
            <textarea class="form-textarea doc-input" data-field="future_improvements" rows="2">${doc.future_improvements || ''}</textarea>
          </div>
        </div>

        <button class="btn btn-primary btn-sm" id="btn-save-doc" style="margin-top: 10px;">Save Documentation</button>
      </div>
    </div>
  `;
}

function renderPortfolioTab(p) {
  const port = p.portfolio || {};
  const checklist = port.portfolio_readiness_checklist || {};

  return `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Portfolio Status & Action Banner -->
      <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase;">Portfolio Status (Section 31)</div>
          <strong style="font-size: 1.1rem;" class="${p.portfolio_status === 'Portfolio Ready' ? 'text-amber' : ''}">
            ${p.portfolio_status || 'Not Ready'}
          </strong>
        </div>
        <button class="btn btn-accent btn-sm" id="btn-open-qc-modal">Run Quality Check (Section 42)</button>
      </div>

      <!-- 12-Item Portfolio Readiness Checklist (Section 30) -->
      <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <div style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
          Portfolio Readiness Checklist (12 Points)
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          ${PORTFOLIO_READINESS_CHECKLIST_ITEMS.map(item => `
            <label class="checklist-item-row ${checklist[item.key] ? 'checked' : ''}" style="font-size: 0.8rem; cursor: pointer;">
              <input type="checkbox" class="custom-checkbox port-ready-cb" data-key="${item.key}" ${checklist[item.key] ? 'checked' : ''} />
              <span>${item.label}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Presentation Links (Section 43) -->
      <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h4 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin-bottom: 10px;">Project Presentation (Section 43)</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label class="form-label">Demo URL</label>
            <input type="url" id="port-demo-url" class="form-input" value="${port.demo_url || p.liveUrl || ''}" placeholder="https://..." />
          </div>
          <div class="form-group">
            <label class="form-label">Video Demo URL (Loom / YouTube)</label>
            <input type="url" id="port-video-url" class="form-input" value="${port.video_url || ''}" placeholder="https://..." />
          </div>
        </div>
        <div class="form-group" style="margin-top: 8px;">
          <label class="form-label">Presentation / Interview Notes</label>
          <textarea class="form-textarea" id="port-notes" rows="2" placeholder="Key points to explain in behavioral and technical interviews...">${port.presentation_notes || ''}</textarea>
        </div>
        <button class="btn btn-secondary btn-sm" id="btn-save-port-meta" style="margin-top: 6px;">Save Presentation Data</button>
      </div>
    </div>
  `;
}

function renderResumeTab(p) {
  const res = p.resume || {};
  return `
    <div style="background: var(--color-bg-base); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h4 style="font-size: 0.95rem; font-weight: 700;">Resume Project Entry (Section 32)</h4>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
          <input type="checkbox" class="custom-checkbox" id="res-ready-toggle" ${res.resume_ready ? 'checked' : ''} />
          <strong>Resume Ready</strong>
        </label>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="form-group">
          <label class="form-label">Project Title on Resume</label>
          <input type="text" class="form-input" id="res-title" value="${res.title || p.name}" />
        </div>
        <div class="form-group">
          <label class="form-label">One-line Description</label>
          <input type="text" class="form-input" id="res-desc" value="${res.one_line_description || p.short_description || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Technologies Highlighted</label>
          <input type="text" class="form-input" id="res-tech" value="${res.technologies || p.technology || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Achievement / Key Quantifiable Result</label>
          <textarea class="form-textarea" id="res-achievement" rows="2" placeholder="e.g. Achieved 82% glibc allocation throughput with zero memory leaks across 10k random cycles">${res.achievement_result || ''}</textarea>
        </div>
      </div>

      <button class="btn btn-primary btn-sm" id="btn-save-resume-entry" style="margin-top: 12px;">Save Resume Entry</button>
    </div>
  `;
}

function renderChallengesTab(p) {
  const chals = p.challenges || [];
  const logs = p.learningLogs || [];

  return `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Add Challenge Button & Form -->
      <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 8px;">Challenges & Solutions for Technical Interviews (Section 29)</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <input type="text" class="form-input" id="chal-prob" placeholder="Problem encountered..." />
          <input type="text" class="form-input" id="chal-tried" placeholder="What I tried first..." />
          <input type="text" class="form-input" id="chal-sol" placeholder="Final working solution..." />
          <input type="text" class="form-input" id="chal-learn" placeholder="What I learned..." />
          <button class="btn btn-secondary btn-sm" id="btn-add-challenge" style="align-self: flex-start;">+ Log Challenge</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px;">
          ${chals.map(c => `
            <div style="background: rgba(255, 255, 255, 0.02); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); font-size: 0.8rem;">
              <strong class="text-rose">Problem:</strong> ${c.problem}
              <div style="margin-top: 2px;"><strong class="text-amber">Solution:</strong> ${c.final_solution}</div>
              <div style="margin-top: 2px; color: var(--color-text-muted);"><em>Learned:</em> ${c.what_i_learned}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Project Learning Log (Section 48) -->
      <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 8px;">Project Journal / Learning Log (Section 48)</h4>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
          <input type="text" class="form-input" id="llog-title" placeholder="Log title (e.g. Learned FastAPI Dependency Injection)" />
          <textarea class="form-textarea" id="llog-content" rows="2" placeholder="Details of concept mastered..."></textarea>
          <button class="btn btn-secondary btn-sm" id="btn-add-llog" style="align-self: flex-start;">+ Add Journal Entry</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${logs.map(l => `
            <div style="background: rgba(255, 255, 255, 0.02); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.82rem;">
                <span>${l.title}</span>
                <span style="font-size: 0.7rem; color: var(--color-text-muted);">${l.date}</span>
              </div>
              <div style="font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 4px;">${l.content}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderSessionsTab(p) {
  const hb = p.hoursBreakdown || {};
  const sessions = p.sessions || [];

  return `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); text-align: center;">
          <div style="font-size: 0.7rem; color: var(--color-text-muted);">TOTAL HOURS</div>
          <strong style="font-size: 1.2rem;" class="text-purple">${hb.totalHours || 0}h</strong>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); text-align: center;">
          <div style="font-size: 0.7rem; color: var(--color-text-muted);">THIS WEEK</div>
          <strong style="font-size: 1.2rem;" class="text-cyan">${hb.weekHours || 0}h</strong>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); text-align: center;">
          <div style="font-size: 0.7rem; color: var(--color-text-muted);">THIS MONTH</div>
          <strong style="font-size: 1.2rem;" class="text-emerald">${hb.monthHours || 0}h</strong>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); text-align: center;">
          <div style="font-size: 0.7rem; color: var(--color-text-muted);">TODAY</div>
          <strong style="font-size: 1.2rem;" class="text-amber">${hb.todayHours || 0}h</strong>
        </div>
      </div>

      <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
        <h4 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 8px;">Logged Sessions (Integrated with Study Sessions)</h4>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${sessions.length === 0 ? `
            <div style="font-size: 0.8rem; color: var(--color-text-muted); padding: 10px;">No sessions logged for this project yet.</div>
          ` : sessions.map(s => `
            <div style="display: flex; justify-content: space-between; padding: 6px 8px; border-radius: var(--radius-sm); background: rgba(255, 255, 255, 0.02); font-size: 0.8rem;">
              <span>${s.date} · <strong>${s.duration_minutes}m</strong></span>
              <span style="color: var(--color-text-muted);">${s.notes || 'Engineering work'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderActivityTab(p) {
  const acts = p.activity || [];
  return `
    <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
      <h4 style="font-size: 0.88rem; font-weight: 700; margin-bottom: 10px;">Chronological Project Activity (Section 39)</h4>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${acts.length === 0 ? `
          <div style="font-size: 0.8rem; color: var(--color-text-muted);">No activity logged yet.</div>
        ` : acts.map(a => `
          <div style="padding: 6px 8px; border-radius: var(--radius-sm); background: rgba(255, 255, 255, 0.02); font-size: 0.78rem; display: flex; justify-content: space-between;">
            <span>${a.description}</span>
            <span style="color: var(--color-text-muted); font-size: 0.7rem;">${a.timestamp.split('T')[0]}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ==========================================
// 4. PORTFOLIO SHOWCASE VIEW (Section 41)
// ==========================================

function renderPortfolioShowcase(state) {
  const projects = (state.projects || []).filter(p => p.status !== 'Archived');
  const portReady = projects.filter(p => p.status === 'Portfolio Ready' || p.portfolio_status === 'Portfolio Ready');
  const deployed = projects.filter(p => p.status === 'Deployed' && p.portfolio_status !== 'Portfolio Ready');
  const building = projects.filter(p => ['Building', 'Testing', 'Planned'].includes(p.status) && p.portfolio_status !== 'Portfolio Ready');

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-xl);">
      <!-- Flagship Portfolio Ready Section -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--color-accent-amber); display: flex; align-items: center; gap: 8px;">
            <span>🌟 PORTFOLIO READY (${portReady.length})</span>
          </h2>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">Recruiter & Resume Flagship Capstones</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: var(--space-lg);">
          ${portReady.length === 0 ? `
            <div class="col-12" style="background: var(--color-bg-base); padding: var(--space-xl); border-radius: var(--radius-md); border: 1px dashed var(--color-border); text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">
              No projects marked Portfolio Ready yet. Finish core tasks, check your GitHub and README readiness, and mark a project Portfolio Ready!
            </div>
          ` : portReady.map(p => {
            const full = getProjectById(p.id);
            const res = full.resume || {};
            return `
              <div class="card" style="border-top: 3px solid var(--color-accent-amber); display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                    <span class="badge badge-purple">${p.category}</span>
                    <span class="badge badge-amber">★ Portfolio Ready</span>
                  </div>
                  <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 6px;">${p.name}</h3>
                  <p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 10px;">
                    ${p.description || p.short_description || ''}
                  </p>

                  <div style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--color-accent-purple); margin-bottom: 10px;">
                    🛠️ ${p.technology || 'Full Stack'}
                  </div>

                  ${res.achievement_result ? `
                    <div style="background: var(--color-bg-base); padding: 8px 10px; border-radius: var(--radius-sm); border-left: 3px solid var(--color-accent-amber); font-size: 0.78rem; margin-bottom: 10px;">
                      <strong>Key Result:</strong> ${res.achievement_result}
                    </div>
                  ` : ''}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border-subtle); padding-top: 10px; margin-top: 10px;">
                  <div style="display: flex; gap: 8px;">
                    ${p.githubUrl ? `
                      <a href="${p.githubUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="font-size: 0.75rem;">GitHub ↗</a>
                    ` : ''}
                    ${p.liveUrl ? `
                      <a href="${p.liveUrl}" target="_blank" rel="noopener" class="btn btn-accent btn-sm" style="font-size: 0.75rem;">Live Demo ↗</a>
                    ` : ''}
                  </div>
                  <button class="btn btn-ghost btn-sm btn-inspect-project" data-proj-id="${p.id}">Inspect Details →</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Deployed Projects -->
      <div>
        <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent-cyan); margin-bottom: 10px;">
          🚀 Deployed & Containerized (${deployed.length})
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-md);">
          ${deployed.length === 0 ? `
            <div style="color: var(--color-text-muted); font-size: 0.8rem;">No standalone deployed projects yet.</div>
          ` : deployed.map(p => `
            <div class="card" style="border-top: 3px solid var(--color-accent-cyan);">
              <h4 style="font-size: 1rem; font-weight: 700;">${p.name}</h4>
              <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin: 6px 0;">${p.short_description || ''}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                <span class="badge badge-cyan">${p.deploymentStatus || 'Deployed'}</span>
                <button class="btn btn-ghost btn-sm btn-inspect-project" data-proj-id="${p.id}">View →</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Active Building Projects -->
      <div>
        <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent-purple); margin-bottom: 10px;">
          🛠️ Currently Building & Testing (${building.length})
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-md);">
          ${building.map(p => `
            <div class="card" style="border-top: 3px solid var(--color-accent-purple);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h4 style="font-size: 1rem; font-weight: 700;">${p.name}</h4>
                <span class="badge badge-purple">${p.progress}%</span>
              </div>
              <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin: 6px 0;">${p.short_description || ''}</p>
              <div class="progress-bar-wrap" style="height: 4px; margin-top: 8px;">
                <div class="progress-bar-fill purple" style="width: ${p.progress}%;"></div>
              </div>
              <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
                <button class="btn btn-ghost btn-sm btn-inspect-project" data-proj-id="${p.id}">Manage →</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 5. IDEAS INCUBATOR (Section 44)
// ==========================================

function renderIdeasIncubator(state) {
  const ideas = state.project_ideas || [];

  return `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg);">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            <span>💡 PROJECT IDEAS INCUBATOR (Section 44)</span>
          </h2>
          <div style="font-size: 0.82rem; color: var(--color-text-muted);">
            Capture architecture concepts and validate feasibility before activating. 1-click conversion into real projects.
          </div>
        </div>
        <button class="btn btn-primary" id="btn-add-idea-modal">${getIcon('plus')} New Idea</button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--space-md);">
        ${ideas.length === 0 ? `
          <div class="col-12" style="background: var(--color-bg-base); padding: var(--space-2xl); border-radius: var(--radius-md); text-align: center; color: var(--color-text-muted);">
            No ideas captured yet. Click "New Idea" to jot down your next breakthrough!
          </div>
        ` : ideas.map(idea => `
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <span class="badge badge-purple">${idea.category}</span>
                <span class="badge badge-slate">${idea.difficulty}</span>
              </div>
              <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 6px;">${idea.name}</h3>
              <p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.4; margin-bottom: 8px;">
                <strong>Problem:</strong> ${idea.problem || 'No description'}
              </p>
              <div style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--color-text-muted); margin-bottom: 8px;">
                Potential Tech: ${idea.potential_technologies || 'Open'}
              </div>
              ${idea.why_useful ? `
                <div style="font-size: 0.75rem; color: var(--color-accent-amber); background: rgba(245, 158, 11, 0.05); padding: 4px 8px; border-radius: var(--radius-sm); margin-bottom: 8px;">
                  ★ <em>${idea.why_useful}</em>
                </div>
              ` : ''}
            </div>

            <div style="border-top: 1px solid var(--color-border-subtle); padding-top: 10px; margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
              ${idea.converted_to_project_id ? `
                <span class="badge badge-emerald">✓ Converted to Project</span>
                <button class="btn btn-ghost btn-sm btn-inspect-project" data-proj-id="${idea.converted_to_project_id}">View Project →</button>
              ` : `
                <span style="font-size: 0.72rem; color: var(--color-text-muted);">Incubating</span>
                <button class="btn btn-accent btn-sm btn-convert-idea" data-idea-id="${idea.id}">Convert to Active Project</button>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ==========================================
// 6. ARCHIVED PROJECTS (Section 38)
// ==========================================

function renderArchivedProjects(projects) {
  if (projects.length === 0) {
    return `
      <div class="card" style="text-align: center; padding: var(--space-2xl); color: var(--color-text-muted);">
        No archived projects found. Projects you archive are safely preserved here and never deleted.
      </div>
    `;
  }

  return `
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 10px;">Archived Projects (${projects.length})</h3>
      ${projects.map(p => `
        <div class="card" style="display: flex; justify-content: space-between; align-items: center; padding: 14px;">
          <div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <h4 style="font-size: 1.05rem; font-weight: 700; margin: 0;">${p.name}</h4>
              <span class="badge badge-slate">Archived</span>
              <span class="badge badge-purple">${p.category}</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 4px;">${p.description || ''}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm btn-restore-project" data-proj-id="${p.id}">Restore Project</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ==========================================
// EVENT HANDLERS & LISTENERS
// ==========================================

function attachEventHandlers(container) {
  // Top Buttons
  document.getElementById('btn-create-project').onclick = () => openNewProjectModal(() => renderProjects(container));
  document.getElementById('btn-start-project-session').onclick = () => openStartProjectSessionModal(selectedProjectId, null, () => renderProjects(container));
  document.getElementById('btn-portfolio-csv').onclick = openPortfolioCsvModal;

  // Category Tabs
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      selectedCategory = btn.getAttribute('data-cat');
      renderProjects(container);
    };
  });

  // Subview Nav
  container.querySelectorAll('.subview-nav-btn').forEach(btn => {
    btn.onclick = () => {
      activeView = btn.getAttribute('data-view');
      renderProjects(container);
    };
  });

  // Search & Sort
  const searchInput = document.getElementById('project-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      renderProjects(container);
    };
  }

  const sortSelect = document.getElementById('project-sort-select');
  if (sortSelect) {
    sortSelect.onchange = (e) => {
      sortBy = e.target.value;
      renderProjects(container);
    };
  }

  // Project selection in list
  container.querySelectorAll('.project-list-card').forEach(card => {
    card.onclick = () => {
      selectedProjectId = card.getAttribute('data-proj-id');
      renderProjects(container);
    };
  });

  // Kanban Card click
  container.querySelectorAll('.kanban-card').forEach(card => {
    card.onclick = (e) => {
      selectedProjectId = card.getAttribute('data-proj-id');
      renderProjects(container);
    };
  });

  // Inspect project from portfolio or ideas
  container.querySelectorAll('.btn-inspect-project').forEach(btn => {
    btn.onclick = () => {
      selectedProjectId = btn.getAttribute('data-proj-id');
      activeView = 'list';
      renderProjects(container);
    };
  });

  // Detail Tab switching
  container.querySelectorAll('.project-detail-tab-btn').forEach(btn => {
    btn.onclick = () => {
      activeDetailTab = btn.getAttribute('data-tab');
      renderProjects(container);
    };
  });

  // Detail Action Buttons
  const btnEdit = document.getElementById('btn-edit-current-project');
  if (btnEdit && selectedProjectId) {
    btnEdit.onclick = () => openEditProjectModal(selectedProjectId, () => renderProjects(container));
  }

  const btnSession = document.getElementById('btn-session-current-project');
  if (btnSession && selectedProjectId) {
    btnSession.onclick = () => openStartProjectSessionModal(selectedProjectId, null, () => renderProjects(container));
  }

  const btnComplete = document.getElementById('btn-complete-current-project');
  if (btnComplete && selectedProjectId) {
    btnComplete.onclick = () => openProjectCompletionConfirmModal(selectedProjectId, () => renderProjects(container));
  }

  const btnArchive = document.getElementById('btn-archive-current-project');
  if (btnArchive && selectedProjectId) {
    btnArchive.onclick = () => {
      if (confirm('Archive this project? It will be safely preserved in Archived Projects.')) {
        archiveProject(selectedProjectId);
        selectedProjectId = null;
        renderProjects(container);
      }
    };
  }

  const btnDelete = container.querySelector('.btn-delete-current-project');
  if (btnDelete && selectedProjectId) {
    btnDelete.onclick = () => {
      if (confirm('Are you sure you want to permanently delete this project?')) {
        deleteProject(selectedProjectId);
        selectedProjectId = null;
        renderProjects(container);
      }
    };
  }

  // Restore Project
  container.querySelectorAll('.btn-restore-project').forEach(btn => {
    btn.onclick = () => {
      const pid = btn.getAttribute('data-proj-id');
      restoreProject(pid, 'Planned');
      renderProjects(container);
    };
  });

  // Convert Idea
  container.querySelectorAll('.btn-convert-idea').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-idea-id');
      openConvertIdeaModal(id, (p) => {
        selectedProjectId = p.id;
        activeView = 'list';
        renderProjects(container);
      });
    };
  });

  // Add Idea Modal
  const btnAddIdea = document.getElementById('btn-add-idea-modal');
  if (btnAddIdea) {
    btnAddIdea.onclick = () => openProjectIdeaModal(() => renderProjects(container));
  }

  // Tasks Tab Handlers
  const btnAddTask = document.getElementById('btn-add-project-task');
  if (btnAddTask && selectedProjectId) {
    btnAddTask.onclick = () => openProjectTaskModal(selectedProjectId, null, () => renderProjects(container));
  }

  container.querySelectorAll('.task-toggle-cb').forEach(cb => {
    cb.onchange = (e) => {
      const taskId = e.target.getAttribute('data-task-id');
      toggleProjectTask(selectedProjectId, taskId, e.target.checked);
      renderProjects(container);
    };
  });

  container.querySelectorAll('.btn-edit-task').forEach(btn => {
    btn.onclick = () => {
      const taskId = btn.getAttribute('data-task-id');
      const project = getProjectById(selectedProjectId);
      const task = project?.tasks?.find(t => t.id === taskId);
      if (task) openProjectTaskModal(selectedProjectId, task, () => renderProjects(container));
    };
  });

  container.querySelectorAll('.btn-delete-task').forEach(btn => {
    btn.onclick = () => {
      const taskId = btn.getAttribute('data-task-id');
      if (confirm('Delete this task?')) {
        deleteProjectTask(selectedProjectId, taskId);
        renderProjects(container);
      }
    };
  });

  // Milestones, Features, Goals Modal Triggers
  const btnAddMs = document.getElementById('btn-add-milestone');
  if (btnAddMs && selectedProjectId) {
    btnAddMs.onclick = () => openMilestoneModal(selectedProjectId, null, () => renderProjects(container));
  }

  const btnAddFeat = document.getElementById('btn-add-feature');
  if (btnAddFeat && selectedProjectId) {
    btnAddFeat.onclick = () => openFeatureModal(selectedProjectId, null, () => renderProjects(container));
  }

  const btnAddGoal = document.getElementById('btn-add-goal');
  if (btnAddGoal && selectedProjectId) {
    btnAddGoal.onclick = () => openGoalModal(selectedProjectId, null, () => renderProjects(container));
  }

  // Tech Stack Handlers
  const btnAddTechCustom = document.getElementById('btn-add-tech-custom');
  if (btnAddTechCustom && selectedProjectId) {
    btnAddTechCustom.onclick = () => {
      const input = document.getElementById('tech-custom-input');
      const val = input.value.trim();
      if (val) {
        addProjectTechnology(selectedProjectId, val);
        input.value = '';
        renderProjects(container);
      }
    };
  }

  container.querySelectorAll('.btn-quick-tech').forEach(btn => {
    btn.onclick = () => {
      const tech = btn.getAttribute('data-tech');
      const cat = btn.getAttribute('data-cat');
      addProjectTechnology(selectedProjectId, tech, cat);
      renderProjects(container);
    };
  });

  container.querySelectorAll('.btn-remove-tech').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-tech-id');
      removeProjectTechnology(selectedProjectId, id);
      renderProjects(container);
    };
  });

  // GitHub Checklists
  container.querySelectorAll('.gh-ready-cb').forEach(cb => {
    cb.onchange = (e) => {
      const key = e.target.getAttribute('data-key');
      toggleGitHubChecklistItem(selectedProjectId, key);
      renderProjects(container);
    };
  });

  container.querySelectorAll('.readme-cb').forEach(cb => {
    cb.onchange = (e) => {
      const key = e.target.getAttribute('data-key');
      toggleReadmeChecklistItem(selectedProjectId, key);
      renderProjects(container);
    };
  });

  const btnSaveGhMeta = document.getElementById('btn-save-gh-meta');
  if (btnSaveGhMeta && selectedProjectId) {
    btnSaveGhMeta.onclick = () => {
      const url = document.getElementById('gh-url-input').value.trim();
      const branch = document.getElementById('gh-branch-input').value.trim();
      updateProject(selectedProjectId, { githubUrl: url });
      alert('GitHub details saved!');
      renderProjects(container);
    };
  }

  // Deployment Handlers
  container.querySelectorAll('.dep-check-cb').forEach(cb => {
    cb.onchange = (e) => {
      const depId = e.target.getAttribute('data-dep-id');
      const key = e.target.getAttribute('data-key');
      toggleDeploymentChecklistItem(selectedProjectId, depId, key);
      renderProjects(container);
    };
  });

  const btnSaveDepMeta = document.getElementById('btn-save-dep-meta');
  if (btnSaveDepMeta && selectedProjectId) {
    btnSaveDepMeta.onclick = () => {
      const platform = document.getElementById('dep-platform-input').value;
      const url = document.getElementById('dep-url-input').value.trim();
      const status = document.getElementById('dep-status-input').value;
      updateProject(selectedProjectId, { liveUrl: url, deploymentStatus: status });
      alert('Deployment details saved!');
      renderProjects(container);
    };
  }

  // Testing Category Selectors
  container.querySelectorAll('.test-status-select').forEach(sel => {
    sel.onchange = (e) => {
      const category = e.target.getAttribute('data-category');
      const status = e.target.value;
      const notesInput = container.querySelector(`.test-notes-input[data-category="${category}"]`);
      updateProjectTest(selectedProjectId, { category, status, notes: notesInput?.value || '' });
    };
  });

  container.querySelectorAll('.test-notes-input').forEach(input => {
    input.onblur = (e) => {
      const category = e.target.getAttribute('data-category');
      const notes = e.target.value;
      const statusSel = container.querySelector(`.test-status-select[data-category="${category}"]`);
      updateProjectTest(selectedProjectId, { category, status: statusSel?.value || 'Not Tested', notes });
    };
  });

  // Docs Save
  const btnSaveDoc = document.getElementById('btn-save-doc');
  if (btnSaveDoc && selectedProjectId) {
    btnSaveDoc.onclick = () => {
      const docUpdates = {};
      container.querySelectorAll('.doc-input').forEach(input => {
        const field = input.getAttribute('data-field');
        docUpdates[field] = input.value.trim();
      });
      updateProjectDocumentation(selectedProjectId, docUpdates);
      alert('Documentation saved successfully!');
      renderProjects(container);
    };
  }

  // Portfolio Quality Check Modal Trigger
  const btnOpenQc = document.getElementById('btn-open-qc-modal');
  if (btnOpenQc && selectedProjectId) {
    btnOpenQc.onclick = () => openProjectQualityCheckModal(selectedProjectId, () => renderProjects(container));
  }

  container.querySelectorAll('.port-ready-cb').forEach(cb => {
    cb.onchange = (e) => {
      const key = e.target.getAttribute('data-key');
      togglePortfolioReadinessChecklistItem(selectedProjectId, key);
      renderProjects(container);
    };
  });

  const btnSavePortMeta = document.getElementById('btn-save-port-meta');
  if (btnSavePortMeta && selectedProjectId) {
    btnSavePortMeta.onclick = () => {
      const demoUrl = document.getElementById('port-demo-url').value.trim();
      const videoUrl = document.getElementById('port-video-url').value.trim();
      const notes = document.getElementById('port-notes').value.trim();
      updateProject(selectedProjectId, { liveUrl: demoUrl });
      alert('Presentation data saved!');
      renderProjects(container);
    };
  }

  // Resume Save
  const btnSaveResume = document.getElementById('btn-save-resume-entry');
  if (btnSaveResume && selectedProjectId) {
    btnSaveResume.onclick = () => {
      const title = document.getElementById('res-title').value.trim();
      const one_line_description = document.getElementById('res-desc').value.trim();
      const technologies = document.getElementById('res-tech').value.trim();
      const achievement_result = document.getElementById('res-achievement').value.trim();
      const resume_ready = document.getElementById('res-ready-toggle').checked;

      updateProjectResume(selectedProjectId, {
        title,
        one_line_description,
        technologies,
        achievement_result,
        resume_ready
      });
      alert('Resume entry saved!');
      renderProjects(container);
    };
  }

  // Challenges & Journal
  const btnAddChal = document.getElementById('btn-add-challenge');
  if (btnAddChal && selectedProjectId) {
    btnAddChal.onclick = () => {
      const prob = document.getElementById('chal-prob').value.trim();
      const tried = document.getElementById('chal-tried').value.trim();
      const sol = document.getElementById('chal-sol').value.trim();
      const learn = document.getElementById('chal-learn').value.trim();

      if (prob && sol) {
        addProjectChallenge(selectedProjectId, {
          problem: prob,
          what_i_tried: tried,
          final_solution: sol,
          what_i_learned: learn
        });
        renderProjects(container);
      }
    };
  }

  const btnAddLlog = document.getElementById('btn-add-llog');
  if (btnAddLlog && selectedProjectId) {
    btnAddLlog.onclick = () => {
      const title = document.getElementById('llog-title').value.trim();
      const content = document.getElementById('llog-content').value.trim();
      if (title && content) {
        addProjectLearningLog(selectedProjectId, { title, content });
        renderProjects(container);
      }
    };
  }

  // HTML5 Drag and Drop for Kanban (Section 35)
  setupKanbanDragAndDrop(container);
}

/**
 * Kanban Drag-and-Drop Implementation (Section 35)
 */
function setupKanbanDragAndDrop(container) {
  let draggedProjId = null;

  container.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedProjId = card.getAttribute('data-proj-id');
      e.dataTransfer.setData('text/plain', draggedProjId);
      e.dataTransfer.effectAllowed = 'move';
      card.style.opacity = '0.5';
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
    });
  });

  container.querySelectorAll('.kanban-column-body').forEach(column => {
    column.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      column.classList.add('dragover');
    });

    column.addEventListener('dragleave', () => {
      column.classList.remove('dragover');
    });

    column.addEventListener('drop', (e) => {
      e.preventDefault();
      column.classList.remove('dragover');
      const targetStage = column.getAttribute('data-stage');
      const projId = e.dataTransfer.getData('text/plain') || draggedProjId;

      if (projId && targetStage) {
        updateProject(projId, { status: targetStage });
        renderProjects(container);
      }
    });
  });
}

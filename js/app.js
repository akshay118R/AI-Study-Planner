/**
 * Akshay's 12-Month AI/ML Career OS - Application Bootstrap & Router
 */
import { initStorage, getState, updateState, subscribe } from './data/storage.js';
import { ICONS, getIcon } from './components/icons.js';
import { initModalContainer, openQuickActionModal, openAdaptiveRebalanceModal } from './components/modals.js';
import { evaluateAdaptivePlanning } from './services/taskGenerator.js';
import { getActiveNotifications } from './services/notificationService.js';

// Views
import { renderDashboard } from './views/dashboardView.js';
import { renderToday } from './views/todayView.js';
import { renderRoadmap } from './views/roadmapView.js';
import { renderPrime } from './views/primeView.js';
import { renderDsa } from './views/dsaView.js';
import { renderProjects } from './views/projectsView.js';
import { renderWeekly } from './views/weeklyView.js';
import { renderSundayReview } from './views/sundayReviewView.js';
import { renderMonthly } from './views/monthlyView.js';
import { renderRevision } from './views/revisionView.js';
import { renderAnalytics } from './views/analyticsView.js';
import { renderGoals } from './views/goalsView.js';
import { renderJournal } from './views/journalView.js';
import { renderResources } from './views/resourcesView.js';
import { renderGuide } from './views/guideView.js';
import { renderSettings } from './views/settingsView.js';

const ROUTES = {
  dashboard: renderDashboard,
  today: renderToday,
  roadmap: renderRoadmap,
  prime: renderPrime,
  dsa: renderDsa,
  projects: renderProjects,
  weekly: renderWeekly,
  review: renderSundayReview,
  monthly: renderMonthly,
  revision: renderRevision,
  analytics: renderAnalytics,
  goals: renderGoals,
  journal: renderJournal,
  resources: renderResources,
  guide: renderGuide,
  settings: renderSettings
};

let currentRoute = 'dashboard';

export function initApp() {
  initStorage();
  initModalContainer();

  const state = getState();

  // Apply Theme
  document.body.setAttribute('data-theme', state.user?.theme || 'dark');

  // Render Shell
  renderAppShell();

  // Initialize Router
  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  // Subscribe to reactive changes
  subscribe((updatedState) => {
    updateBadgesAndBanners(updatedState);
  });

  updateBadgesAndBanners(state);
}

function renderAppShell() {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';

  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="app-root">
      <!-- Desktop Sidebar -->
      <aside class="app-sidebar" id="app-sidebar">
        <div class="sidebar-header">
          <div class="brand-title">
            <span class="logo-pulse"></span>
            <span>Career OS</span>
            <span class="badge badge-emerald" style="font-size: 0.65rem; padding: 1px 5px;">2026-27</span>
          </div>
          <div class="brand-subtitle">AI/ML · SWE · Placement 2030</div>
        </div>

        <nav class="sidebar-nav">
          <!-- Daily & Planning -->
          <div>
            <div class="nav-section-label">Execution Rhythm</div>
            <ul class="nav-list">
              <li>
                <button class="nav-item-btn" data-route="dashboard">
                  ${getIcon('dashboard')} <span class="nav-text">Dashboard</span>
                </button>
              </li>
              <li>
                <button class="nav-item-btn" data-route="today">
                  ${getIcon('today')} <span class="nav-text">Today Focus</span>
                  <span class="nav-badge text-emerald" id="badge-today-count">0</span>
                </button>
              </li>
              <li>
                <button class="nav-item-btn" data-route="weekly">
                  ${getIcon('weekly')} <span class="nav-text">Weekly Planner</span>
                </button>
              </li>
              <li>
                <button class="nav-item-btn" data-route="monthly">
                  ${getIcon('monthly')} <span class="nav-text">Monthly Dashboard</span>
                </button>
              </li>
              <li>
                <button class="nav-item-btn" data-route="review">
                  ${getIcon('review')} <span class="nav-text">Sunday Review</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- The Two Main Learning Tracks & Systems -->
          <div>
            <div class="nav-section-label">Two Core Tracks</div>
            <ul class="nav-list">
              <li>
                <button class="nav-item-btn" data-route="prime">
                  ${getIcon('prime')} <span class="nav-text">Track A: Prime 3.0</span>
                  <span class="badge badge-cyan" style="font-size: 0.65rem; margin-left: auto;">AI/ML</span>
                </button>
              </li>
              <li>
                <button class="nav-item-btn" data-route="roadmap">
                  ${getIcon('roadmap')} <span class="nav-text">Track B: Roadmap</span>
                  <span class="badge badge-emerald" style="font-size: 0.65rem; margin-left: auto;">12-Mo</span>
                </button>
              </li>
              <li>
                <button class="nav-item-btn" data-route="dsa">
                  ${getIcon('dsa')} <span class="nav-text">DSA Tracker</span>
                </button>
              </li>
              <li>
                <button class="nav-item-btn" data-route="projects">
                  ${getIcon('projects')} <span class="nav-text">Projects Hub</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- System Engines -->
          <div>
            <div class="nav-section-label">System Engines</div>
            <ul class="nav-list">
              <li>
                <button class="nav-item-btn" data-route="revision">
                  ${getIcon('revision')} <span class="nav-text">Revision Queue</span>
                  <span class="nav-badge text-rose" id="badge-revision-count">0</span>
                </button>
              </li>
              <li>
                <button class="nav-item-btn" data-route="goals">
                  ${getIcon('goals')} <span class="nav-text">Goals Center</span>
                </button>
              </li>
              <li>
                <button class="nav-item-btn" data-route="analytics">
                  ${getIcon('analytics')} <span class="nav-text">Analytics</span>
                </button>
              </li>
              <li>
                <button class="nav-item-btn" data-route="journal">
                  ${getIcon('journal')} <span class="nav-text">Learning Journal</span>
                </button>
              </li>
              <li>
                <button class="nav-item-btn" data-route="resources">
                  ${getIcon('resources')} <span class="nav-text">Resources</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- Documentation & Settings -->
          <div>
            <div class="nav-section-label">System</div>
            <ul class="nav-list">
              <li>
                <button class="nav-item-btn" data-route="guide">
                  ${getIcon('guide')} <span class="nav-text">App Guide</span>
                  <span class="badge badge-emerald" style="font-size: 0.65rem; margin-left: auto;">Playbook</span>
                </button>
              </li>
              <li>
                <button class="nav-item-btn" data-route="settings">
                  ${getIcon('settings')} <span class="nav-text">Settings</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="user-mini-card">
            <div class="user-avatar">A</div>
            <div class="user-info-text">
              <span class="user-name">${state.user.name}</span>
              <span class="user-stage">B.Tech AI/ML '30</span>
            </div>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-theme-toggle" title="Toggle Theme">
            ${state.user.theme === 'light' ? ICONS.moon : ICONS.sun}
          </button>
        </div>
      </aside>

      <!-- Main Layout -->
      <main class="app-main">
        <!-- Top App Header -->
        <header class="app-header">
          <div class="header-left">
            <button class="btn btn-ghost btn-icon mobile-menu-toggle" id="btn-mobile-menu">
              ${ICONS.dashboard}
            </button>
            <div class="header-greeting-wrap">
              <div class="header-greeting">
                <span>12-Month AI/ML Career OS</span>
                <span class="badge badge-slate" style="font-size: 0.72rem;">Oct 1, 2026 → Sep 30, 2027</span>
              </div>
              <div class="header-subline">Track A: Prime 3.0 · Track B: Individual CS Foundations</div>
            </div>
          </div>

          <div class="header-right">
            <!-- Active Date Controller -->
            <div class="date-controller" title="Change active/simulation date">
              <span>📅</span>
              <input type="date" id="header-date-picker" value="${activeDate}" />
            </div>

            <!-- Quick Action Button -->
            <button class="btn btn-primary btn-sm" id="btn-header-quick-action">
              ${getIcon('plus')} <span class="btn-label">Quick Action</span>
            </button>

            <!-- Theme Toggle Mobile -->
            <button class="btn btn-ghost btn-icon" id="btn-theme-toggle-header">
              ${state.user.theme === 'light' ? ICONS.moon : ICONS.sun}
            </button>
          </div>
        </header>

        <!-- System Alerts & Dynamic Banners Container -->
        <div id="alerts-root" class="system-alerts-container" style="padding: 0 var(--space-lg); margin-top: var(--space-md);"></div>

        <!-- Dynamic Page View Container -->
        <div class="app-content" id="view-content"></div>
      </main>

      <!-- Mobile Bottom Navigation -->
      <nav class="mobile-bottom-nav">
        <button class="mobile-nav-btn" data-route="dashboard">
          ${ICONS.dashboard}
          <span>Home</span>
        </button>
        <button class="mobile-nav-btn" data-route="today">
          ${ICONS.today}
          <span>Today</span>
        </button>
        <button class="mobile-nav-btn" data-route="prime">
          ${ICONS.prime}
          <span>Prime 3.0</span>
        </button>
        <button class="mobile-nav-btn" data-route="dsa">
          ${ICONS.dsa}
          <span>DSA</span>
        </button>
        <button class="mobile-nav-btn" data-route="roadmap">
          ${ICONS.roadmap}
          <span>Roadmap</span>
        </button>
        <button class="mobile-nav-btn" data-route="guide">
          ${ICONS.guide}
          <span>Guide</span>
        </button>
      </nav>
    </div>
  `;

  // Attach Navigation Listeners
  root.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', () => {
      const r = el.getAttribute('data-route');
      window.location.hash = `#${r}`;
    });
  });

  // Quick Action
  document.getElementById('btn-header-quick-action').onclick = openQuickActionModal;

  // Header Date Picker
  const datePicker = document.getElementById('header-date-picker');
  datePicker.onchange = (e) => {
    const newDate = e.target.value;
    updateState(curr => ({
      ...curr,
      user: { ...curr.user, activeDate: newDate }
    }));
    handleRoute();
  };

  // Theme Toggles
  const toggleTheme = () => {
    const s = getState();
    const nextTheme = s.user?.theme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', nextTheme);
    updateState(curr => ({
      ...curr,
      user: { ...curr.user, theme: nextTheme }
    }));
    renderAppShell();
    handleRoute();
  };

  const btnThemeSidebar = document.getElementById('btn-theme-toggle');
  if (btnThemeSidebar) btnThemeSidebar.onclick = toggleTheme;
  const btnThemeHeader = document.getElementById('btn-theme-toggle-header');
  if (btnThemeHeader) btnThemeHeader.onclick = toggleTheme;

  // Mobile menu toggle
  const mobileToggle = document.getElementById('btn-mobile-menu');
  if (mobileToggle) {
    mobileToggle.onclick = () => {
      const sidebar = document.getElementById('app-sidebar');
      if (sidebar.style.display === 'flex') {
        sidebar.style.display = 'none';
      } else {
        sidebar.style.display = 'flex';
        sidebar.style.position = 'fixed';
        sidebar.style.left = '0';
        sidebar.style.zIndex = '300';
      }
    };
  }
}

function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  currentRoute = ROUTES[hash] ? hash : 'dashboard';

  // Highlight active nav items
  document.querySelectorAll('.nav-item-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-route') === currentRoute);
  });
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-route') === currentRoute);
  });

  // Render view
  const viewContainer = document.getElementById('view-content');
  if (viewContainer && ROUTES[currentRoute]) {
    viewContainer.innerHTML = '';
    ROUTES[currentRoute](viewContainer);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Close mobile sidebar if open
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar && window.innerWidth <= 768) {
    sidebar.style.display = 'none';
  }
}

function updateBadgesAndBanners(state) {
  const activeDate = state.user?.activeDate || '2026-10-01';

  // Update today count badge
  const todayTasks = (state.dailyTasks || []).filter(t => t.date === activeDate && !t.completed);
  const badgeToday = document.getElementById('badge-today-count');
  if (badgeToday) badgeToday.textContent = todayTasks.length;

  // Update revision queue count badge
  const dueRevision = (state.revisionItems || []).filter(i => i.status === 'Due today' || i.status === 'Overdue');
  const badgeRev = document.getElementById('badge-revision-count');
  if (badgeRev) badgeRev.textContent = dueRevision.length;

  // Alerts & Notifications Banner
  const alertsContainer = document.getElementById('alerts-root');
  if (!alertsContainer) return;

  const adaptive = evaluateAdaptivePlanning(state);
  const notifications = getActiveNotifications(state);

  const bannersHtml = [];

  // Adaptive Rescheduling Alert
  if (adaptive.isBehind) {
    bannersHtml.push(`
      <div class="system-banner system-banner-warning">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--color-accent-amber); font-weight: 700;">⚡ Adaptive Planning:</span>
          <span>You are <strong>${adaptive.behindCount} tasks behind</strong> this week. Tasks are preserved and ready for rebalancing.</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-sm" id="btn-rebalance-adaptive">Rebalance Schedule</button>
        </div>
      </div>
    `);
  }

  // Active Reminder Notifications
  if (notifications.length > 0) {
    const topNotif = notifications[0];
    bannersHtml.push(`
      <div class="system-banner system-banner-info">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>🔔 <strong>${topNotif.title}:</strong> ${topNotif.message}</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-ghost btn-sm btn-dismiss-notif" data-id="${topNotif.id}">Dismiss</button>
        </div>
      </div>
    `);
  }

  alertsContainer.innerHTML = bannersHtml.join('');

  // Attach alert buttons
  const btnRebalance = document.getElementById('btn-rebalance-adaptive');
  if (btnRebalance) {
    btnRebalance.onclick = () => openAdaptiveRebalanceModal(adaptive.behindCount);
  }

  alertsContainer.querySelectorAll('.btn-dismiss-notif').forEach(btn => {
    btn.onclick = () => {
      const notifId = btn.getAttribute('data-id');
      updateState(curr => {
        const notifs = curr.notifications || {};
        const dismissed = [...(notifs.dismissedIds || []), notifId];
        return { ...curr, notifications: { ...notifs, dismissedIds: dismissed } };
      });
    };
  });
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', initApp);

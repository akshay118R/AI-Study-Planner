/**
 * AI Study & Task Planner - Application Bootstrap & Router
 * Generic AI-powered Study & Task Planning OS
 * Flow: Goal -> AI Analysis -> Plan Review/Edit -> Implementation -> Tracker
 */

import { initStorage, getState, updateState, subscribe } from './data/storage.js';
import { ICONS, getIcon } from './components/icons.js';
import { openQuickAddModal } from './components/quickAddModal.js';
import { getCanonicalToday, formatFullDate } from './services/dateService.js';
import { initTrackerService, getActivePlan, hasImplementedPlan } from './services/trackerService.js';
import { checkBackendConfig } from './services/aiPlanGenerator.js';

// Core Views
import { renderDashboard, cleanupDashboardView } from './views/dashboardView.js';
import { renderToday, setTodayViewingDate, cleanupTodayView } from './views/todayView.js';
import { renderWeekly } from './views/weeklyView.js';
import { renderMonthly } from './views/monthlyView.js';
import { renderSettings } from './views/settingsView.js';
import { renderPlanView } from './views/planView.js';

const ROUTES = {
  dashboard: renderDashboard,
  plan: renderPlanView,
  'create-plan': (container) => renderPlanView(container, { mode: 'create' }),
  'plan-preview': renderPlanView,
  month: renderMonthly,
  monthly: renderMonthly,
  week: renderWeekly,
  weekly: renderWeekly,
  today: renderToday,
  settings: renderSettings
};

let currentRoute = 'dashboard';
let currentTheme = 'light';

export async function initApp() {
  initStorage();
  await initTrackerService();
  checkBackendConfig();

  const state = getState();
  currentTheme = localStorage.getItem('study_planner_theme') || state.settings?.theme || 'light';
  document.body.setAttribute('data-theme', currentTheme);

  // Render Shell
  renderAppShell();

  // Initialize Router
  window.addEventListener('hashchange', handleRoute);

  const hash = window.location.hash.replace('#', '');
  const baseHash = hash.split('?')[0].toLowerCase();
  if (!baseHash || !ROUTES[baseHash]) {
    // If no active plan and no hash, direct to dashboard (which shows onboarding)
    window.location.hash = '#dashboard';
  } else {
    handleRoute();
  }

  // Subscribe to state updates to update header and navigation
  subscribe(() => {
    updateHeaderDate();
    updateNavVisibility();
  });
}

function renderAppShell() {
  const canonicalToday = getCanonicalToday();
  const dateFormatted = formatFullDate(canonicalToday);

  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="app-root">
      <!-- Desktop Sidebar -->
      <aside class="app-sidebar" id="app-sidebar">
        <div class="sidebar-header" style="padding: 20px 24px; border-bottom: 1px solid var(--color-border-subtle);">
          <div class="brand-title" style="font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            <span class="logo-pulse"></span>
            <span>AI Study Planner</span>
          </div>
          <div class="brand-subtitle" style="font-size: 0.74rem; color: var(--color-text-muted); margin-top: 2px;">
            Goal → Plan → Track
          </div>
        </div>

        <nav class="sidebar-nav" style="padding: 16px 12px; flex: 1;">
          <ul class="nav-list" style="display: flex; flex-direction: column; gap: 4px; list-style: none; padding: 0; margin: 0;">
            <li>
              <button class="nav-item-btn" data-route="dashboard">
                ${getIcon('dashboard')} <span class="nav-text">DASHBOARD</span>
              </button>
            </li>
            <li>
              <button class="nav-item-btn" data-route="plan">
                ${getIcon('sparkles')} <span class="nav-text">PLANNER</span>
              </button>
            </li>
            <li>
              <button class="nav-item-btn" data-route="month">
                ${getIcon('monthly')} <span class="nav-text">MONTH</span>
              </button>
            </li>
            <li>
              <button class="nav-item-btn" data-route="week">
                ${getIcon('weekly')} <span class="nav-text">WEEK</span>
              </button>
            </li>
            <li>
              <button class="nav-item-btn" data-route="today">
                ${getIcon('today')} <span class="nav-text">TODAY</span>
              </button>
            </li>
            <li>
              <button class="nav-item-btn" data-route="settings">
                ${getIcon('settings')} <span class="nav-text">SETTINGS</span>
              </button>
            </li>
          </ul>
        </nav>

        <!-- Sidebar Footer -->
        <div style="padding: 16px 20px; border-top: 1px solid var(--color-border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-main);">Offline-First</span>
            <span style="font-size: 0.7rem; color: var(--color-text-muted);">Local Storage OS</span>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="app-main" id="app-main">
        <!-- Top Compact App Header -->
        <header class="app-header" style="padding: 0 24px; display: flex; align-items: center; justify-content: space-between; height: 56px; border-bottom: 1px solid var(--color-border); background: var(--color-bg-base); position: sticky; top: 0; z-index: 50;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div id="header-canonical-date" style="font-size: 0.88rem; font-weight: 600; color: var(--color-text-secondary); display: flex; align-items: center; gap: 6px;">
              ${getIcon('calendar', 'style="width: 14px; height: 14px;"')}
              <span>${dateFormatted}</span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <!-- Theme Mode Toggle -->
            <button class="btn btn-ghost btn-sm" id="btn-theme-toggle" title="Switch Theme (Light / Dark)" style="display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-weight: 600;">
              <span id="theme-toggle-icon">${getIcon(currentTheme === 'light' ? 'moon' : 'sun', 'style="width: 14px; height: 14px;"')}</span>
              <span id="theme-toggle-label" style="font-size: 0.78rem;">${currentTheme === 'light' ? 'Dark' : 'Light'}</span>
            </button>

            <!-- Global + ADD Button -->
            <button class="btn btn-primary btn-sm" id="btn-global-add" style="font-weight: 700; padding: 6px 14px; gap: 6px;">
              ${getIcon('plus')} <span>+ ADD</span>
            </button>

            <!-- Settings Shortcut Header -->
            <button class="btn btn-ghost btn-icon btn-sm" id="btn-header-settings" title="Settings">
              ${getIcon('settings')}
            </button>
          </div>
        </header>

        <!-- Dynamic Page View Container -->
        <div class="app-content" id="view-content"></div>
      </main>

      <!-- Mobile Bottom Navigation (Dashboard -> Planner -> Month -> Week -> Today -> Settings) -->
      <nav class="mobile-bottom-nav">
        <button class="mobile-nav-btn" data-route="dashboard">
          ${ICONS.dashboard}
          <span>Dashboard</span>
        </button>
        <button class="mobile-nav-btn" data-route="plan">
          ${ICONS.sparkles || getIcon('sparkles')}
          <span>Planner</span>
        </button>
        <button class="mobile-nav-btn" data-route="month">
          ${ICONS.monthly}
          <span>Month</span>
        </button>
        <button class="mobile-nav-btn" data-route="week">
          ${ICONS.weekly}
          <span>Week</span>
        </button>
        <button class="mobile-nav-btn" data-route="today">
          ${ICONS.today}
          <span>Today</span>
        </button>
        <button class="mobile-nav-btn" data-route="settings">
          ${ICONS.settings}
          <span>Settings</span>
        </button>
      </nav>
    </div>
  `;

  // Navigation Click Listeners
  root.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', () => {
      const r = el.getAttribute('data-route');
      if (r === 'today') {
        setTodayViewingDate(null);
      }
      const targetHash = `#${r}`;
      if (window.location.hash === targetHash) {
        handleRoute();
      } else {
        window.location.hash = targetHash;
      }
    });
  });

  // Settings shortcut in header
  const btnSettings = document.getElementById('btn-header-settings');
  if (btnSettings) {
    btnSettings.onclick = () => {
      window.location.hash = '#settings';
    };
  }

  // Theme Toggle Button (Light <-> Dark)
  const btnTheme = document.getElementById('btn-theme-toggle');
  if (btnTheme) {
    btnTheme.onclick = () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('study_planner_theme', currentTheme);
      document.body.setAttribute('data-theme', currentTheme);
      updateState(curr => ({
        ...curr,
        settings: { ...(curr.settings || {}), theme: currentTheme }
      }));
      const iconSpan = document.getElementById('theme-toggle-icon');
      const labelSpan = document.getElementById('theme-toggle-label');
      if (iconSpan) iconSpan.innerHTML = getIcon(currentTheme === 'light' ? 'moon' : 'sun', 'style="width: 14px; height: 14px;"');
      if (labelSpan) labelSpan.textContent = currentTheme === 'light' ? 'Dark' : 'Light';
    };
  }

  // Global Quick Add Button (+ ADD)
  const btnAdd = document.getElementById('btn-global-add');
  if (btnAdd) {
    btnAdd.onclick = () => openQuickAddModal(() => handleRoute());
  }

  updateNavVisibility();
}

export function updateNavVisibility() {
  const isImplemented = hasImplementedPlan();

  // Desktop Sidebar items (Month, Week, Today)
  const sidebarNavItems = document.querySelectorAll('#app-sidebar [data-route]');
  sidebarNavItems.forEach(btn => {
    const r = btn.getAttribute('data-route');
    if (r === 'month' || r === 'week' || r === 'today') {
      const parentLi = btn.closest('li');
      if (parentLi) {
        parentLi.style.display = isImplemented ? '' : 'none';
      }
    }
  });

  // Mobile Bottom Nav items (Month, Week, Today)
  const mobileNavItems = document.querySelectorAll('.mobile-bottom-nav [data-route]');
  mobileNavItems.forEach(btn => {
    const r = btn.getAttribute('data-route');
    if (r === 'month' || r === 'week' || r === 'today') {
      btn.style.display = isImplemented ? '' : 'none';
    }
  });

  // Global + ADD button in top header
  const btnAdd = document.getElementById('btn-global-add');
  if (btnAdd) {
    btnAdd.style.display = isImplemented ? '' : 'none';
  }
}

function updateHeaderDate() {
  const dateEl = document.getElementById('header-canonical-date');
  if (dateEl) {
    const canonicalToday = getCanonicalToday();
    const formatted = formatFullDate(canonicalToday);
    dateEl.innerHTML = `${getIcon('calendar', 'style="width: 14px; height: 14px;"')} <span>${formatted}</span>`;
  }
}

function handleRoute() {
  const rawHash = window.location.hash.replace('#', '');
  const routeKey = rawHash.split('?')[0].toLowerCase();

  // Guard: before a plan is implemented, do not show/navigate to month, week, or today (daily)
  if (!hasImplementedPlan() && ['month', 'monthly', 'week', 'weekly', 'today'].includes(routeKey)) {
    window.location.hash = '#dashboard';
    return;
  }

  const route = ROUTES[routeKey] ? routeKey : 'dashboard';
  currentRoute = route;

  updateNavVisibility();

  // Update active state in nav buttons
  document.querySelectorAll('[data-route]').forEach(btn => {
    const r = btn.getAttribute('data-route');
    if (r === route || (route === 'create-plan' && r === 'plan') || (route === 'plan-preview' && r === 'plan')) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Cleanup view timers
  cleanupTodayView();
  cleanupDashboardView();

  if (route === 'today' && !rawHash.includes('?date=')) {
    setTodayViewingDate(null);
  }

  // Render view
  const content = document.getElementById('view-content');
  if (content && ROUTES[route]) {
    content.innerHTML = '';
    ROUTES[route](content);
    try {
      window.scrollTo(0, 0);
    } catch (e) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }
}

// Bootstrap
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
      initApp();
    });
  } else {
    initApp();
  }
}


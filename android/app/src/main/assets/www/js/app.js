/**
 * Akshay's Career Tracker - Application Bootstrap & Simplified Router
 * 
 * CORE MENTAL MODEL:
 * DASHBOARD -> MONTH -> WEEK -> TODAY -> TASK / STUDY SESSION
 * 
 * NAVIGATION:
 * 1. DASHBOARD (Default Landing Page)
 * 2. MONTH
 * 3. WEEK
 * 4. TODAY
 * 5. SETTINGS
 */

import { initStorage, getState, updateState, subscribe } from './data/storage.js';
import { ICONS, getIcon } from './components/icons.js';
import { openQuickAddModal } from './components/quickAddModal.js';
import { getCanonicalToday, formatFullDate } from './services/dateService.js';
import { initTrackerService, syncFromSupabase } from './services/trackerService.js';
import { SupabaseClient } from './services/supabaseClient.js';

// Core Views
import { renderDashboard, cleanupDashboardView } from './views/dashboardView.js';
import { renderToday, setTodayViewingDate, cleanupTodayView } from './views/todayView.js';
import { renderWeekly } from './views/weeklyView.js';
import { renderMonthly } from './views/monthlyView.js';
import { renderSettings } from './views/settingsView.js';

const ROUTES = {
  dashboard: renderDashboard,
  progress: renderDashboard, // Alias for backward compatibility
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

  const state = getState();
  currentTheme = localStorage.getItem('career_tracker_theme') || state.user?.theme || 'light';
  document.body.setAttribute('data-theme', currentTheme);

  // Render Shell
  renderAppShell();

  // Initialize Router
  window.addEventListener('hashchange', handleRoute);

  const hash = window.location.hash.replace('#', '');
  if (!hash || !ROUTES[hash]) {
    window.location.hash = '#dashboard';
  } else {
    handleRoute();
  }

  // Subscribe to reactive changes
  subscribe(() => {
    updateHeaderDate();
  });
}

function renderAppShell() {
  const canonicalToday = getCanonicalToday();
  const dateFormatted = formatFullDate(canonicalToday);

  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="app-root">
      <!-- Desktop Sidebar (MANDATORY ORDER: Dashboard -> Month -> Week -> Today -> Settings) -->
      <aside class="app-sidebar" id="app-sidebar">
        <div class="sidebar-header" style="padding: 20px 24px; border-bottom: 1px solid var(--color-border-subtle);">
          <div class="brand-title" style="font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            <span class="logo-pulse"></span>
            <span>Career Tracker</span>
          </div>
          <div class="brand-subtitle" style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
            Dashboard → Month → Week → Today
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
            <span style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main);">Akshay</span>
            <span style="font-size: 0.72rem; color: var(--color-text-muted); font-family: var(--font-mono);">Personal Tracker</span>
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

            <!-- Supabase Online/Sync Status Indicator -->
            <button id="header-sync-status" title="Supabase Database Status (Click to test/reconnect)" style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.74rem; font-weight: 600; padding: 4px 8px; border-radius: var(--radius-md); border: 1px solid var(--color-border); background: var(--color-bg-surface); color: var(--color-text-secondary); cursor: pointer;">
              <span id="sync-status-dot" style="width: 7px; height: 7px; border-radius: 50%; background-color: var(--color-accent-emerald); box-shadow: 0 0 6px var(--color-accent-emerald);"></span>
              <span id="sync-status-text">Connected</span>
            </button>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <!-- Theme Mode Toggle Button (Requirement 5) -->
            <button class="btn btn-ghost btn-sm" id="btn-theme-toggle" title="Switch Theme (Light / Dark Mode)" style="display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-weight: 600;">
              <span id="theme-toggle-icon">${getIcon(currentTheme === 'light' ? 'moon' : 'sun', 'style="width: 14px; height: 14px;"')}</span>
              <span id="theme-toggle-label" style="font-size: 0.78rem;">${currentTheme === 'light' ? 'Dark' : 'Light'}</span>
            </button>

            <!-- ONE Global + ADD Button -->
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

      <!-- Mobile Bottom Navigation (MANDATORY ORDER: Dashboard -> Month -> Week -> Today -> Settings) -->
      <nav class="mobile-bottom-nav">
        <button class="mobile-nav-btn" data-route="dashboard">
          ${ICONS.dashboard}
          <span>Dashboard</span>
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
      window.location.hash = `#${r}`;
      handleRoute();
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
      localStorage.setItem('career_tracker_theme', currentTheme);
      document.body.setAttribute('data-theme', currentTheme);
      updateState(curr => ({
        ...curr,
        user: { ...(curr.user || {}), theme: currentTheme }
      }));
      const iconSpan = document.getElementById('theme-toggle-icon');
      const labelSpan = document.getElementById('theme-toggle-label');
      if (iconSpan) iconSpan.innerHTML = getIcon(currentTheme === 'light' ? 'moon' : 'sun', 'style="width: 14px; height: 14px;"');
      if (labelSpan) labelSpan.textContent = currentTheme === 'light' ? 'Dark' : 'Light';
    };
  }

  // ONE Global Quick Add Button (+ ADD)
  const btnAdd = document.getElementById('btn-global-add');
  if (btnAdd) {
    btnAdd.onclick = () => openQuickAddModal(() => handleRoute());
  }

  // Supabase Connection Status Watcher
  const syncBtn = document.getElementById('header-sync-status');
  const syncDot = document.getElementById('sync-status-dot');
  const syncText = document.getElementById('sync-status-text');

  function updateSyncUI(connected) {
    if (!syncDot || !syncText || !syncBtn) return;
    if (connected) {
      syncDot.style.backgroundColor = 'var(--color-accent-emerald)';
      syncDot.style.boxShadow = '0 0 6px var(--color-accent-emerald)';
      syncText.textContent = 'Connected';
      syncBtn.title = 'Supabase: Connected & Synced (Click to re-verify)';
    } else {
      syncDot.style.backgroundColor = 'var(--color-accent-rose)';
      syncDot.style.boxShadow = '0 0 6px var(--color-accent-rose)';
      syncText.textContent = 'Sync unavailable';
      syncBtn.title = 'Supabase: Connection unavailable. Click to retry sync.';
    }
  }

  SupabaseClient.onConnectionChange(updateSyncUI);

  window.__triggerAppSync = async () => {
    if (syncText) syncText.textContent = 'Syncing...';
    await syncFromSupabase();
    const ok = await SupabaseClient.testConnection();
    updateSyncUI(ok);
    handleRoute();
  };

  if (syncBtn) {
    syncBtn.onclick = async () => {
      syncText.textContent = 'Syncing...';
      await syncFromSupabase();
      const ok = await SupabaseClient.testConnection();
      updateSyncUI(ok);
      handleRoute();
    };
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
  const route = ROUTES[routeKey] ? routeKey : 'dashboard';
  currentRoute = route;

  const highlightRoute = (route === 'progress') ? 'dashboard' : route;

  // Update active state in nav buttons
  document.querySelectorAll('[data-route]').forEach(btn => {
    const r = btn.getAttribute('data-route');
    if (r === highlightRoute) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Cleanup any active timers from previous views
  cleanupTodayView();
  cleanupDashboardView();

  if (route === 'today' && !rawHash.includes('?date=')) {
    setTodayViewingDate(null);
  }

  // Render the selected view
  const content = document.getElementById('view-content');
  if (content && ROUTES[route]) {
    content.innerHTML = '';
    ROUTES[route](content);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
}

/**
 * Native Android Hardware/System Back Button Handler
 * Strictly enforces native Android navigation priority:
 * 1. If a modal/dialog/drawer/overlay is open: close it first.
 * 2. If a text input or textarea is active: allow normal keyboard dismissal / blur first.
 * 3. If user is on any main application page other than Dashboard: navigate directly to Dashboard.
 * 4. If user is already on Dashboard: return 'EXIT_APP' to allow the Android Activity to exit/close.
 */
if (typeof window !== 'undefined') {
  window.handleAndroidBack = function() {
    // Priority 1: Check for open modal, dialog, drawer, or backdrop overlay
    const openBackdrop = document.querySelector(
      '.modal-backdrop, #modal-root > *, #modal-container > *, dialog[open], .drawer-overlay'
    );
    if (openBackdrop) {
      const closeBtn = openBackdrop.querySelector(
        '#btn-close-modal, #btn-cancel-modal, #btn-close-game-modal, #btn-cancel-game-modal, #btn-close-quick-add, .btn-close, .btn-icon, [data-modal-close]'
      ) || document.querySelector(
        '#btn-close-modal, #btn-cancel-modal, #btn-close-game-modal, #btn-cancel-game-modal, #btn-close-quick-add, .modal-backdrop .btn-close, .modal-backdrop .btn-icon, [data-modal-close]'
      );
      if (closeBtn && typeof closeBtn.click === 'function') {
        closeBtn.click();
      } else {
        const allBackdrops = document.querySelectorAll('.modal-backdrop, dialog[open]');
        allBackdrops.forEach(el => el.remove());
        const modalRoot = document.getElementById('modal-root');
        if (modalRoot) modalRoot.innerHTML = '';
        const modalContainer = document.getElementById('modal-container');
        if (modalContainer) modalContainer.innerHTML = '';
      }
      return 'MODAL_CLOSED';
    }

    // Priority 2: Check if text input or textarea is currently focused
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
      document.activeElement.blur();
      return 'INPUT_BLURRED';
    }

    // Priority 3 & 4: Route check
    const rawHash = (window.location.hash || '').replace('#', '');
    const currentRouteKey = rawHash.split('?')[0].toLowerCase() || 'dashboard';

    if (currentRouteKey === 'dashboard' || currentRouteKey === 'progress' || currentRouteKey === '') {
      // Already on Dashboard -> Exit app
      if (window.AndroidBridge && typeof window.AndroidBridge.exitApp === 'function') {
        window.AndroidBridge.exitApp();
      }
      return 'EXIT_APP';
    } else {
      // Navigate directly to Dashboard without creating browser history loops
      if (window.location.hash !== '#dashboard') {
        window.location.hash = '#dashboard';
      }
      return 'NAVIGATED_TO_DASHBOARD';
    }
  };
}

// Bootstrap
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
}


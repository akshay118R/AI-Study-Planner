/**
 * Akshay's Career Tracker - PROGRESS View (Alias to Main DASHBOARD)
 * Progress has been redesigned into the Main Dashboard (Req 1).
 */
import { renderDashboard, cleanupDashboardView } from './dashboardView.js';

export function renderProgress(container) {
  renderDashboard(container);
}

export { renderDashboard, cleanupDashboardView };

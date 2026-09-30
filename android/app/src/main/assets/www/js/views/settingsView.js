/**
 * Akshay's Career Tracker - SETTINGS View
 * Dramatically simplified:
 * 1. STUDY TARGETS (Weekday 4h, Saturday 4h, Sunday 8-9h, DSA 5-8 prob/wk, Semester 2/day + optional 3rd)
 * 2. RECREATION (Gaming 0-6h/week optional)
 * 3. DATA (Export data, Backup data, Reset data)
 * 4. SUPABASE (Connected/Not Connected, Last sync, Sync Now - Zero sensitive keys exposed)
 */

import { getIcon } from '../components/icons.js';
import { SupabaseClient } from '../services/supabaseClient.js';
import { resetToInitialState } from '../data/storage.js';
import {
  syncFromSupabase,
  exportTrackerDataJSON,
  exportTrackerDataCSV
} from '../services/trackerService.js';

export async function renderSettings(container) {
  const sbConfig = SupabaseClient.getConfig();

  container.innerHTML = `
    <div class="tracker-page animate-fade-in" style="display: flex; flex-direction: column; gap: 24px; max-width: 800px; margin: 0 auto;">
      <!-- SETTINGS HEADER -->
      <div>
        <h1 style="font-size: 1.6rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px;">
          ${getIcon('settings', 'text-cyan')} SETTINGS
        </h1>
        <div style="font-size: 0.95rem; color: var(--color-text-secondary); margin-top: 4px; font-weight: 500;">
          Study schedule targets, recreation limit, data management & database sync
        </div>
      </div>

      <!-- 1. STUDY TARGETS -->
      <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
        <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-main); margin-bottom: 14px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
          STUDY TARGETS
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; font-size: 0.9rem;">
          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Weekday Target</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-text-main); margin-top: 2px;">
              4 hours / day
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">Monday to Friday</div>
          </div>

          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Saturday Target</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-text-main); margin-top: 2px;">
              4 hours
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">Consolidation & practice</div>
          </div>

          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Sunday Target</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-text-main); margin-top: 2px;">
              8–9 hours
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">Deep work & weekly review</div>
          </div>

          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">DSA Target</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-text-main); margin-top: 2px;">
              5–8 problems / week
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">Apna College playlist & LeetCode</div>
          </div>

          <div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Semester Prep</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-text-main); margin-top: 2px;">
              2 answers / day + optional 3rd
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">Integrated daily practice</div>
          </div>

          <div>
            <div style="font-size: 0.75rem; color: #EC4899; text-transform: uppercase; font-weight: 700;">DaVinci Resolve</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-text-main); margin-top: 2px;">
              2 videos / week
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">Tuesday & Saturday (1 video/day)</div>
          </div>
        </div>
      </div>

      <!-- APPEARANCE / MODE -->
      <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
        <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-main); margin-bottom: 14px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
          APPEARANCE
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: 1.05rem; font-weight: 700; color: var(--color-text-main);">
              Interface Theme
            </div>
            <div style="font-size: 0.82rem; color: var(--color-text-secondary); margin-top: 4px;">
              Switch between Light Mode and Dark Mode. Your preference is preserved across page refreshes.
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-settings-theme-toggle" style="font-weight: 700;">
            ${document.body.getAttribute('data-theme') === 'light' ? '🌙 Switch to Dark Mode' : '☀️ Switch to Light Mode'}
          </button>
        </div>
      </div>

      <!-- 2. RECREATION -->
      <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
        <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-main); margin-bottom: 14px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
          RECREATION
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: 1.05rem; font-weight: 700; color: var(--color-text-main);">
              Gaming: 0–6 hours / week
            </div>
            <div style="font-size: 0.82rem; color: var(--color-text-secondary); margin-top: 4px;">
              Optional relaxation. Not a required target; unused hours do not need to be made up.
            </div>
          </div>
          <span class="badge badge-gray" style="font-size: 0.78rem; font-weight: 600;">Optional</span>
        </div>
      </div>

      <!-- 3. EXPORT MY DATA / BACKUP (Section 8) -->
      <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
        <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-main); margin-bottom: 8px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
          EXPORT MY DATA & BACKUP
        </div>

        <div style="font-size: 0.82rem; color: var(--color-text-secondary); margin-bottom: 14px; line-height: 1.45;">
          Export your complete tracker history, tasks, plans, focus logs, and progress metrics as JSON or CSV backup. No credentials or secrets are exported.
        </div>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" id="btn-export-data-json" style="font-weight: 700;">
            ${getIcon('download')} Export My Data (JSON)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-export-data-csv" style="font-weight: 700;">
            ${getIcon('download')} Export Tasks (CSV)
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-backup-data">
            ${getIcon('sync')} Backup to Local
          </button>
          <button class="btn btn-ghost btn-sm" id="btn-reset-data" style="color: var(--color-accent-rose);">
            ${getIcon('trash')} Reset Local Cache
          </button>
        </div>
      </div>

      <!-- 4. SUPABASE -->
      <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
        <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-main); margin-bottom: 14px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
          SUPABASE DATABASE
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.88rem; font-weight: 600; color: var(--color-text-secondary);">Connection Status:</span>
              ${sbConfig.connected
                ? '<span class="badge badge-emerald">Connected</span>'
                : '<span class="badge badge-rose">Not Connected</span>'}
            </div>
            <button class="btn btn-primary btn-xs" id="btn-sync-supabase">
              ${getIcon('sync')} Sync Now
            </button>
          </div>

          <div style="font-size: 0.82rem; color: var(--color-text-secondary);">
            Last Sync: <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${sbConfig.lastSync ? new Date(sbConfig.lastSync).toLocaleTimeString() : 'Just now'}</strong>
          </div>

          <div style="font-size: 0.78rem; color: var(--color-text-muted); background: var(--color-bg-base); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
            Project: <code style="color: var(--color-text-main); font-family: var(--font-mono);">${sbConfig.projectId}</code> (PostgreSQL with Row Level Security enabled. Secrets are protected).
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Listeners
  const themeToggleBtn = container.querySelector('#btn-settings-theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.onclick = () => {
      const currentTheme = document.body.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('career_tracker_theme', newTheme);
      themeToggleBtn.textContent = newTheme === 'light' ? '🌙 Switch to Dark Mode' : '☀️ Switch to Light Mode';
      const headerBtn = document.getElementById('btn-theme-toggle');
      if (headerBtn) {
        headerBtn.textContent = newTheme === 'light' ? '🌙 Dark' : '☀️ Light';
      }
    };
  }

  const exportJsonBtn = container.querySelector('#btn-export-data-json');
  if (exportJsonBtn) exportJsonBtn.onclick = () => exportTrackerDataJSON();

  const exportCsvBtn = container.querySelector('#btn-export-data-csv');
  if (exportCsvBtn) exportCsvBtn.onclick = () => exportTrackerDataCSV();

  const backupBtn = container.querySelector('#btn-backup-data');
  if (backupBtn) {
    backupBtn.onclick = async () => {
      await syncFromSupabase();
      exportTrackerDataJSON();
      backupBtn.textContent = '✓ Backed Up!';
      setTimeout(() => { backupBtn.textContent = 'Backup to Local'; }, 1500);
    };
  }

  const resetBtn = container.querySelector('#btn-reset-data');
  if (resetBtn) {
    resetBtn.onclick = async () => {
      if (confirm('Are you sure you want to reset your local cache and re-sync from Supabase?')) {
        resetToInitialState();
        await syncFromSupabase();
        window.location.reload();
      }
    };
  }

  const syncBtn = container.querySelector('#btn-sync-supabase');
  if (syncBtn) {
    syncBtn.onclick = async () => {
      syncBtn.textContent = 'Syncing...';
      await syncFromSupabase();
      renderSettings(container);
    };
  }
}

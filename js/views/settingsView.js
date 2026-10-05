/**
 * AI Study & Task Planner - SETTINGS View
 * Generic preferences: Appearance, AI Configuration, Planner Defaults, Data Export/Import/Reset.
 * Zero secrets or hardcoded keys exposed.
 */

import { getIcon } from '../components/icons.js';
import { getState, updateState, resetToInitialState, exportBackupJSON, importBackupJSON } from '../data/storage.js';
import { checkAiStatus } from '../services/aiPlanGenerator.js';
import { OLLAMA_CONFIG } from '../services/ollamaConfig.js';
import { exportTrackerDataCSV } from '../services/trackerService.js';

export function renderSettings(container) {
  const state = getState();
  const currentTheme = document.body.getAttribute('data-theme') || state.settings?.theme || 'light';

  container.innerHTML = `
    <div class="tracker-page animate-fade-in" style="max-width: 820px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 24px; padding-bottom: 60px;">
      
      <!-- HEADER -->
      <div>
        <h1 style="font-size: 1.65rem; font-weight: 800; margin: 0; color: var(--color-text-main); display: flex; align-items: center; gap: 8px;">
          ${getIcon('settings', 'style="color: var(--color-primary); width: 24px; height: 24px;"')}
          <span>SETTINGS</span>
        </h1>
        <div style="font-size: 0.9rem; color: var(--color-text-secondary); margin-top: 4px;">
          Application preferences, AI configuration, and local data management
        </div>
      </div>

      <!-- 1. APPEARANCE (Requirement 32 & 35) -->
      <div class="card" style="padding: 22px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-sm);">
        <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 14px;">
          Appearance
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: 1.05rem; font-weight: 700; color: var(--color-text-main);">
              Interface Theme
            </div>
            <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-top: 2px;">
              Switch between Light Mode and Dark Mode. Your preference persists across restarts.
            </div>
          </div>

          <button class="btn btn-secondary btn-sm" id="btn-settings-theme" style="font-weight: 700; gap: 6px;">
            ${currentTheme === 'light' ? '🌙 Switch to Dark Mode' : '☀️ Switch to Light Mode'}
          </button>
        </div>
      </div>

      <!-- 2. LOCAL AI CONFIGURATION (Phase 2 & 8) -->
      <div class="card" style="padding: 22px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-sm);">
        <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 14px;">
          Local AI Configuration
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <div style="font-size: 1rem; font-weight: 700; color: var(--color-text-main); display: flex; align-items: center; gap: 8px;">
                <span>🦙 Ollama Local Engine</span>
                <span class="badge badge-emerald" style="font-size: 0.7rem;">100% Offline & Private</span>
              </div>
              <div style="font-size: 0.82rem; color: var(--color-text-secondary); margin-top: 3px;">
                Endpoint: <code style="font-family: var(--font-mono); color: var(--color-primary);">${OLLAMA_CONFIG.defaultBaseUrl}</code> • Model: <code style="font-family: var(--font-mono); color: var(--color-primary);">${OLLAMA_CONFIG.defaultModel}</code>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="settings-ai-badge" class="badge badge-gray" style="font-size: 0.76rem; font-weight: 700;">
                Checking...
              </span>
              <button id="btn-settings-check-ai" class="btn btn-secondary btn-xs" style="font-weight: 700;">
                ${getIcon('refresh')} Check Status
              </button>
            </div>
          </div>

          <div style="background: var(--color-bg-base); padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle); display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-text-main);">
              How to setup & run local Gemma model:
            </div>
            <div style="font-size: 0.82rem; color: var(--color-text-secondary); line-height: 1.5;">
              1. Download and install Ollama from <a href="https://ollama.com" target="_blank" style="color: var(--color-primary); font-weight: 600;">ollama.com</a>.<br/>
              2. Open your terminal and pull the configured Gemma model:<br/>
              <code style="display: inline-block; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: 4px; padding: 3px 8px; font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-primary); margin: 4px 0;">ollama pull ${OLLAMA_CONFIG.defaultModel}</code><br/>
              3. Keep Ollama running in the background. The tracker connects locally to <code style="font-family: var(--font-mono); font-size: 0.8rem;">${OLLAMA_CONFIG.defaultBaseUrl}</code> without transmitting any data over the internet.
            </div>
          </div>
        </div>
      </div>

      <!-- 3. PLANNER PREFERENCES (Requirement 32) -->
      <div class="card" style="padding: 22px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-sm);">
        <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 14px;">
          Planner Preferences
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
              Default Daily Availability
            </label>
            <select id="pref-daily-hours" class="form-select" style="width: 100%; padding: 8px 12px; font-weight: 600;">
              <option value="1" ${state.settings?.defaultDailyHours === 1 ? 'selected' : ''}>1 hour / day</option>
              <option value="2" ${state.settings?.defaultDailyHours === 2 || !state.settings?.defaultDailyHours ? 'selected' : ''}>2 hours / day</option>
              <option value="3" ${state.settings?.defaultDailyHours === 3 ? 'selected' : ''}>3 hours / day</option>
              <option value="4" ${state.settings?.defaultDailyHours === 4 ? 'selected' : ''}>4 hours / day</option>
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 6px;">
              Default Study Days Per Week
            </label>
            <select id="pref-days-week" class="form-select" style="width: 100%; padding: 8px 12px; font-weight: 600;">
              <option value="5" ${state.settings?.defaultDaysPerWeek === 5 ? 'selected' : ''}>5 days (2 rest days)</option>
              <option value="6" ${state.settings?.defaultDaysPerWeek === 6 || !state.settings?.defaultDaysPerWeek ? 'selected' : ''}>6 days (1 rest day)</option>
              <option value="7" ${state.settings?.defaultDaysPerWeek === 7 ? 'selected' : ''}>7 days (Every day)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 4. DATA MANAGEMENT (Requirements 33 & 34) -->
      <div class="card" style="padding: 22px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); box-shadow: var(--shadow-sm);">
        <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 12px;">
          Data Management
        </div>

        <p style="font-size: 0.86rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 18px;">
          Export your complete study roadmap, tasks, and consistency history as JSON backup or CSV tasks list. You can restore your data anytime. No credentials or secrets are exported.
        </p>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
          <button id="btn-export-json" class="btn btn-secondary btn-sm" style="font-weight: 700; gap: 6px;">
            ${getIcon('download')} <span>Export Data (JSON)</span>
          </button>
          
          <button id="btn-export-csv" class="btn btn-secondary btn-sm" style="font-weight: 700; gap: 6px;">
            ${getIcon('download')} <span>Export Tasks (CSV)</span>
          </button>

          <label class="btn btn-secondary btn-sm" style="font-weight: 700; gap: 6px; cursor: pointer; margin: 0;">
            ${getIcon('sync')} <span>Import Backup</span>
            <input type="file" id="input-import-file" accept=".json" style="display: none;" />
          </label>
        </div>

        <!-- RESET DATA -->
        <div style="padding-top: 18px; border-top: 1px solid var(--color-border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-accent-rose);">
              Reset Application Data
            </div>
            <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 2px;">
              Permanently removes all plans, tasks, progress and consistency history.
            </div>
          </div>

          <button id="btn-reset-app-data" class="btn btn-ghost btn-sm" style="color: var(--color-accent-rose); font-weight: 700; border: 1px solid rgba(244, 63, 94, 0.3);">
            ${getIcon('trash')} Reset Data
          </button>
        </div>
      </div>

    </div>
  `;

  // 1. Theme Toggle
  const btnTheme = container.querySelector('#btn-settings-theme');
  if (btnTheme) {
    btnTheme.onclick = () => {
      const cur = document.body.getAttribute('data-theme') || 'light';
      const next = cur === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', next);
      localStorage.setItem('study_planner_theme', next);
      updateState(c => ({
        ...c,
        settings: { ...(c.settings || {}), theme: next }
      }));
      renderSettings(container);
    };
  }

  // 2. Local AI Status Check in Settings
  const badgeAi = container.querySelector('#settings-ai-badge');
  const btnCheckAi = container.querySelector('#btn-settings-check-ai');

  async function updateAiBadge(force = false) {
    if (!badgeAi) return;
    badgeAi.className = 'badge badge-gray';
    badgeAi.textContent = 'Checking...';

    const status = await checkAiStatus(force);
    if (status.status === 'ready') {
      badgeAi.className = 'badge badge-emerald';
      badgeAi.textContent = `● Ready (${status.model || OLLAMA_CONFIG.defaultModel})`;
    } else if (status.status === 'model_missing') {
      badgeAi.className = 'badge badge-amber';
      badgeAi.textContent = '⚠️ Model Missing';
    } else {
      badgeAi.className = 'badge badge-rose';
      badgeAi.textContent = '● Ollama Offline';
    }
  }

  updateAiBadge();

  if (btnCheckAi) {
    btnCheckAi.onclick = () => updateAiBadge(true);
  }

  // 3. Planner Preferences
  const prefDaily = container.querySelector('#pref-daily-hours');
  if (prefDaily) {
    prefDaily.onchange = () => {
      updateState(c => ({
        ...c,
        settings: { ...(c.settings || {}), defaultDailyHours: Number(prefDaily.value) }
      }));
    };
  }

  const prefDays = container.querySelector('#pref-days-week');
  if (prefDays) {
    prefDays.onchange = () => {
      updateState(c => ({
        ...c,
        settings: { ...(c.settings || {}), defaultDaysPerWeek: Number(prefDays.value) }
      }));
    };
  }

  // 4. Data Export & Import
  const btnExportJson = container.querySelector('#btn-export-json');
  if (btnExportJson) btnExportJson.onclick = () => exportBackupJSON();

  const btnExportCsv = container.querySelector('#btn-export-csv');
  if (btnExportCsv) btnExportCsv.onclick = () => exportTrackerDataCSV();

  const inputImport = container.querySelector('#input-import-file');
  if (inputImport) {
    inputImport.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (content) {
          const res = importBackupJSON(content);
          if (res.success) {
            alert('✓ Backup imported successfully!');
            window.location.hash = '#dashboard';
          } else {
            alert(`Import failed: ${res.error}`);
          }
        }
      };
      reader.readAsText(file);
    };
  }

  // 5. Data Reset Confirmation (Requirement 33)
  const btnReset = container.querySelector('#btn-reset-app-data');
  if (btnReset) {
    btnReset.onclick = () => {
      if (confirm('This will permanently remove your plans, tasks, progress and settings.\n\nAre you sure you want to reset all data?')) {
        resetToInitialState();
        alert('All application data has been reset.');
        window.location.hash = '#create-plan';
        window.location.reload();
      }
    };
  }
}

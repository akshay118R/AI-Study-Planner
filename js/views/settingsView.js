/**
 * Akshay's 12-Month AI/ML Career OS - Settings & Configuration View
 */
import { getState, updateState, exportBackupJSON, importBackupJSON, resetToInitialState } from '../data/storage.js';
import { getIcon } from '../components/icons.js';

export function renderSettings(container) {
  const state = getState();
  const schedule = state.studySchedule || {};
  const alloc = schedule.defaultAllocations || {};
  const notifs = state.notifications || {};

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('settings', 'text-cyan')} System Settings & Data Safety</h1>
        <div class="view-subtitle">
          Configure Study Schedules, Daily Allocations, Reminder Alerts & Complete JSON Backup / Recovery
        </div>
      </div>
      <div class="view-actions">
        <button class="btn btn-secondary" id="btn-export-backup">${getIcon('download')} Export JSON Backup</button>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: var(--space-lg);">
      <!-- Profile & 12-Month Scope -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">User Profile & Career Goal</div>
          <span class="badge badge-emerald">Active OS</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.88rem;">
          <div>
            <span style="color: var(--color-text-muted);">Name:</span>
            <strong>${state.user.name}</strong>
          </div>
          <div>
            <span style="color: var(--color-text-muted);">Academic Stage:</span>
            <div>${state.user.role}</div>
          </div>
          <div>
            <span style="color: var(--color-text-muted);">Career Direction:</span>
            <div style="color: var(--color-primary); font-weight: 600;">${state.user.careerDirection}</div>
          </div>
          <div>
            <span style="color: var(--color-text-muted);">Long-Term Target:</span>
            <div style="color: var(--color-accent-emerald); font-weight: 600;">${state.user.mainGoal}</div>
          </div>
          <div style="border-top: 1px solid var(--color-border-subtle); padding-top: 8px;">
            <span style="color: var(--color-text-muted);">Active Intensive Period:</span>
            <div class="font-mono" style="font-weight: 600; margin-top: 2px;">
              ${state.user.targetStartDate} → ${state.user.targetEndDate}
            </div>
          </div>
          <div>
            <label class="form-label">Simulation / Active Date</label>
            <input type="date" class="form-input" id="setting-active-date" value="${state.user?.activeDate || '2026-10-01'}" />
            <div class="form-hint">Allows testing October 1, 2026 kickoff or tracking real system clock.</div>
          </div>
        </div>
      </div>

      <!-- Study Schedule Configuration -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Study Schedule & Daily Budgets</div>
        </div>

        <form id="schedule-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Mon - Fri Hours</label>
              <input type="number" class="form-input" id="sched-weekday" value="${schedule.weekdayHours || 4.0}" step="0.5" min="1" max="14" required />
            </div>
            <div class="form-group">
              <label class="form-label">Saturday Hours</label>
              <input type="number" class="form-input" id="sched-saturday" value="${schedule.saturdayHours || 4.0}" step="0.5" min="1" max="14" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Sunday Hours (Review & Deep Work Block)</label>
            <input type="number" class="form-input" id="sched-sunday" value="${schedule.sundayHours || 8.0}" step="0.5" min="2" max="16" required />
          </div>

          <div style="border-top: 1px solid var(--color-border-subtle); padding-top: 10px; margin-top: 10px;">
            <div style="font-size: 0.8rem; font-weight: 700; margin-bottom: 8px; color: var(--color-text-secondary);">
              Default Daily Allocations (Hours)
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="form-group">
                <label class="form-label">Prime 3.0</label>
                <input type="number" class="form-input" id="alloc-prime" value="${alloc.primeHours || 1.5}" step="0.25" min="0.5" max="6" />
              </div>
              <div class="form-group">
                <label class="form-label">DSA Practice</label>
                <input type="number" class="form-input" id="alloc-dsa" value="${alloc.dsaHours || 1.0}" step="0.25" min="0.5" max="6" />
              </div>
              <div class="form-group">
                <label class="form-label">Individual CS</label>
                <input type="number" class="form-input" id="alloc-indiv" value="${alloc.individualHours || 1.0}" step="0.25" min="0.5" max="6" />
              </div>
              <div class="form-group">
                <label class="form-label">Revision / Project</label>
                <input type="number" class="form-input" id="alloc-rev" value="${alloc.revisionProjectHours || 0.5}" step="0.25" min="0.25" max="4" />
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 8px;">Save Schedule Preferences</button>
        </form>
      </div>

      <!-- Notification Settings -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Automated Reminders</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <label style="display: flex; align-items: center; justify-content: space-between; font-size: 0.88rem; cursor: pointer;">
            <div>
              <strong>🌅 Morning Reminder</strong>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">"Today's learning plan is ready."</div>
            </div>
            <input type="checkbox" class="custom-checkbox notif-toggle" data-key="morningEnabled" ${notifs.morningEnabled ? 'checked' : ''} />
          </label>

          <label style="display: flex; align-items: center; justify-content: space-between; font-size: 0.88rem; cursor: pointer;">
            <div>
              <strong>🌙 Evening Review</strong>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">"Complete today's learning review."</div>
            </div>
            <input type="checkbox" class="custom-checkbox notif-toggle" data-key="eveningEnabled" ${notifs.eveningEnabled ? 'checked' : ''} />
          </label>

          <label style="display: flex; align-items: center; justify-content: space-between; font-size: 0.88rem; cursor: pointer;">
            <div>
              <strong>📅 Sunday Weekly Review</strong>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">"Weekly review is ready."</div>
            </div>
            <input type="checkbox" class="custom-checkbox notif-toggle" data-key="sundayEnabled" ${notifs.sundayEnabled ? 'checked' : ''} />
          </label>

          <label style="display: flex; align-items: center; justify-content: space-between; font-size: 0.88rem; cursor: pointer;">
            <div>
              <strong>🏆 Month-End Audit</strong>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">"Monthly review is ready."</div>
            </div>
            <input type="checkbox" class="custom-checkbox notif-toggle" data-key="monthEndEnabled" ${notifs.monthEndEnabled ? 'checked' : ''} />
          </label>
        </div>
      </div>

      <!-- Data Persistence & Backup / Recovery -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Offline-First Data Safety & Recovery</div>
          <span class="badge badge-emerald">Zero Data Loss</span>
        </div>

        <p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 16px;">
          All tasks, study sessions, DSA logs, Prime 3.0 metrics, and journal entries are stored persistently in your local environment. Create standalone JSON backups anytime to guarantee you never lose your 12-month progress.
        </p>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button class="btn btn-secondary" id="btn-export-backup-card">
            ${getIcon('download')} <span>Export Complete JSON Backup</span>
          </button>

          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="file" id="file-import-backup" accept=".json" style="display: none;" />
            <button class="btn btn-secondary" id="btn-trigger-import" style="flex: 1;">
              ${getIcon('upload')} <span>Import JSON Backup File</span>
            </button>
          </div>

          <div style="border-top: 1px solid var(--color-border-subtle); padding-top: 12px; margin-top: 8px;">
            <button class="btn btn-danger btn-sm" id="btn-reset-factory" style="width: 100%;">
              ⚠️ Reset System to Factory Seed State
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Handlers
  document.getElementById('btn-export-backup').onclick = exportBackupJSON;
  document.getElementById('btn-export-backup-card').onclick = exportBackupJSON;

  // Active Date selector
  const activeDateInput = document.getElementById('setting-active-date');
  activeDateInput.onchange = (e) => {
    const newDate = e.target.value;
    updateState(curr => ({
      ...curr,
      user: { ...curr.user, activeDate: newDate }
    }));
    // Sync header date picker
    const headerDate = document.getElementById('header-date-picker');
    if (headerDate) headerDate.value = newDate;
  };

  // Schedule Form
  document.getElementById('schedule-form').onsubmit = (e) => {
    e.preventDefault();
    const weekdayHours = parseFloat(document.getElementById('sched-weekday').value) || 4.0;
    const saturdayHours = parseFloat(document.getElementById('sched-saturday').value) || 4.0;
    const sundayHours = parseFloat(document.getElementById('sched-sunday').value) || 8.0;

    const primeHours = parseFloat(document.getElementById('alloc-prime').value) || 1.5;
    const dsaHours = parseFloat(document.getElementById('alloc-dsa').value) || 1.0;
    const individualHours = parseFloat(document.getElementById('alloc-indiv').value) || 1.0;
    const revisionProjectHours = parseFloat(document.getElementById('alloc-rev').value) || 0.5;

    updateState(curr => ({
      ...curr,
      studySchedule: {
        weekdayHours,
        saturdayHours,
        sundayHours,
        defaultAllocations: {
          primeHours,
          dsaHours,
          individualHours,
          revisionProjectHours
        }
      }
    }));
    alert('✅ Schedule preferences saved!');
  };

  // Notification toggles
  container.querySelectorAll('.notif-toggle').forEach(toggle => {
    toggle.onchange = (e) => {
      const key = e.target.getAttribute('data-key');
      const isChecked = e.target.checked;
      updateState(curr => ({
        ...curr,
        notifications: {
          ...(curr.notifications || {}),
          [key]: isChecked
        }
      }));
    };
  });

  // Import JSON
  const fileInput = document.getElementById('file-import-backup');
  document.getElementById('btn-trigger-import').onclick = () => fileInput.click();

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importBackupJSON(event.target.result);
      if (res.success) {
        alert('🎉 Backup successfully imported! All career OS records restored.');
        window.location.reload();
      } else {
        alert(`❌ Import failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  // Reset Factory
  document.getElementById('btn-reset-factory').onclick = () => {
    if (confirm('Are you sure you want to reset all data back to the clean initial seed state? This cannot be undone.')) {
      resetToInitialState();
      alert('System reset to initial state.');
      window.location.reload();
    }
  };
}

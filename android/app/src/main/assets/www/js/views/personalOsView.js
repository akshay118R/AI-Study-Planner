/**
 * Akshay's 12-Month AI/ML Career OS - Personal Operating System View (Phase 10)
 * Master View providing complete unified hub across:
 * Today, Inbox, Tasks, Calendar, Focus, Notes, Knowledge, Reviews, Automation, Settings
 */

import { getState, updateState } from '../data/storage.js';
import { getIcon } from '../components/icons.js';
import {
  getTodayHubData,
  getTodayTimelineBlocks,
  addTimelineBlock,
  deleteTimelineBlock,
  toggleTimelineBlock,
  addInboxItem,
  getInboxItems,
  getUniversalTasks,
  toggleUniversalTask,
  deleteUniversalTask,
  getTasksWorkload,
  getUnifiedCalendarEvents,
  startFocusSession,
  finishFocusSession,
  cancelFocusSession,
  getFocusHistory,
  getNotes,
  deleteNote,
  getResources,
  deleteResource,
  getKnowledgeGraphData,
  getAutomations,
  updateAutomation,
  getAutomationHistory,
  approveAutomationRun,
  rejectAutomationRun,
  getReviewData,
  saveReviewRecord,
  getPersonalOsSettings,
  updatePersonalOsSettings,
  getActivityLog,
  undoActivity
} from '../services/personalOsEngine.js';
import {
  openTaskModal,
  openNoteModal,
  openFocusSessionModal,
  openFocusSummaryModal,
  openInboxProcessModal,
  openBackupRestoreModal
} from '../components/personalOsModals.js';
import { openQuickAddModal } from '../components/quickAddModal.js';
import { openCommandPalette } from '../components/commandPaletteModal.js';

let activeOsTab = 'today';
// 'today' | 'inbox' | 'tasks' | 'calendar' | 'focus' | 'notes' | 'knowledge' | 'reviews' | 'automation' | 'settings'

let taskViewMode = 'list'; // 'list' | 'board'
let taskAreaFilter = 'all';
let taskPriorityFilter = 'all';
let taskStatusFilter = 'all';
let taskSearchQuery = '';

let notesAreaFilter = 'all';
let notesSearchQuery = '';

let reviewTabType = 'daily'; // 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export function renderPersonalOs(container) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';

  container.innerHTML = `
    <div class="view-container animate-fade-in" style="padding-bottom: 80px;">
      <!-- Top Action Bar -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-md); flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h1 class="view-title" style="margin-bottom: 2px;">
              ${getIcon('layers', 'text-cyan')} PERSONAL OPERATING SYSTEM
            </h1>
            <span class="badge badge-emerald" style="font-size: 0.7rem; font-weight: 700;">Phase 10</span>
          </div>
          <p class="view-subtitle" style="margin: 0;">
            Unified Command Center · Plan, Capture, Execute, Track, Review · Active Date: <strong>${activeDate}</strong>
          </p>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          <button class="btn btn-secondary btn-sm" id="btn-open-cmd-palette" title="Ctrl + K">
            ${getIcon('search')} <span class="hide-mobile">Command Palette</span> <kbd style="font-size: 0.7rem; margin-left: 4px; padding: 1px 4px; background: rgba(0,0,0,0.2); border-radius: 3px;">⌘K</kbd>
          </button>
          <button class="btn btn-primary btn-sm" id="btn-pos-quick-add">
            ${getIcon('plus')} Quick Add
          </button>
        </div>
      </div>

      <!-- Navigation Sub-Tabs (Section 1) -->
      <div class="projects-subnav-bar" style="margin-bottom: var(--space-md); overflow-x: auto; display: flex; gap: 6px; padding-bottom: 4px;">
        <button class="filter-pill ${activeOsTab === 'today' ? 'active' : ''}" data-ostab="today">
          ${getIcon('today')} Today Hub
        </button>
        <button class="filter-pill ${activeOsTab === 'inbox' ? 'active' : ''}" data-ostab="inbox">
          ${getIcon('inbox')} Inbox
          <span class="badge badge-slate" id="pos-badge-inbox-count" style="font-size: 0.65rem; margin-left: 4px;">0</span>
        </button>
        <button class="filter-pill ${activeOsTab === 'tasks' ? 'active' : ''}" data-ostab="tasks">
          ${getIcon('tasks')} Universal Tasks
        </button>
        <button class="filter-pill ${activeOsTab === 'calendar' ? 'active' : ''}" data-ostab="calendar">
          ${getIcon('calendar')} Unified Calendar
        </button>
        <button class="filter-pill ${activeOsTab === 'focus' ? 'active' : ''}" data-ostab="focus">
          ${getIcon('focus')} Focus Deep Work
        </button>
        <button class="filter-pill ${activeOsTab === 'notes' ? 'active' : ''}" data-ostab="notes">
          ${getIcon('notes')} Notes & Concepts
        </button>
        <button class="filter-pill ${activeOsTab === 'knowledge' ? 'active' : ''}" data-ostab="knowledge">
          ${getIcon('knowledge')} Knowledge & Graph
        </button>
        <button class="filter-pill ${activeOsTab === 'reviews' ? 'active' : ''}" data-ostab="reviews">
          ${getIcon('review')} Review Center
        </button>
        <button class="filter-pill ${activeOsTab === 'automation' ? 'active' : ''}" data-ostab="automation">
          ${getIcon('automation')} Automations
        </button>
        <button class="filter-pill ${activeOsTab === 'settings' ? 'active' : ''}" data-ostab="settings">
          ${getIcon('settings')} OS Settings
        </button>
      </div>

      <!-- Content Area -->
      <div id="personal-os-tab-content"></div>
    </div>
  `;

  // Attach Top Button Handlers
  const btnCmd = container.querySelector('#btn-open-cmd-palette');
  if (btnCmd) btnCmd.onclick = () => openCommandPalette();

  const btnQa = container.querySelector('#btn-pos-quick-add');
  if (btnQa) btnQa.onclick = () => openQuickAddModal(() => renderPersonalOs(container));

  // Update Inbox Badge Count
  const inboxItems = getInboxItems('inbox');
  const badgeInbox = container.querySelector('#pos-badge-inbox-count');
  if (badgeInbox) badgeInbox.innerText = inboxItems.length;

  // Subnav Switcher Handlers
  container.querySelectorAll('[data-ostab]').forEach(btn => {
    btn.onclick = () => {
      activeOsTab = btn.getAttribute('data-ostab');
      renderPersonalOs(container);
    };
  });

  const tabContent = container.querySelector('#personal-os-tab-content');
  if (!tabContent) return;

  if (activeOsTab === 'today') {
    renderTodayHubTab(tabContent, container);
  } else if (activeOsTab === 'inbox') {
    renderInboxTab(tabContent, container);
  } else if (activeOsTab === 'tasks') {
    renderTasksTab(tabContent, container);
  } else if (activeOsTab === 'calendar') {
    renderCalendarTab(tabContent, container);
  } else if (activeOsTab === 'focus') {
    renderFocusTab(tabContent, container);
  } else if (activeOsTab === 'notes') {
    renderNotesTab(tabContent, container);
  } else if (activeOsTab === 'knowledge') {
    renderKnowledgeTab(tabContent, container);
  } else if (activeOsTab === 'reviews') {
    renderReviewsTab(tabContent, container);
  } else if (activeOsTab === 'automation') {
    renderAutomationTab(tabContent, container);
  } else if (activeOsTab === 'settings') {
    renderSettingsTab(tabContent, container);
  }
}

// ==========================================
// SUBTAB 1: TODAY HUB (Sections 2, 3)
// ==========================================

function renderTodayHubTab(container, rootContainer) {
  const data = getTodayHubData();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- AI Daily Brief (Phase 8 integration) -->
      ${data.aiBrief ? `
        <div class="card" style="padding: 14px 18px; border-left: 4px solid var(--color-accent-cyan); background: linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(14, 21, 38, 0.4) 100%);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="color: var(--color-accent-cyan);">${getIcon('sparkles')}</span>
            <span style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-accent-cyan);">Today's AI Career Intelligence Brief</span>
          </div>
          <div style="font-size: 0.92rem; font-weight: 600; color: var(--color-text-primary);">
            ${data.aiBrief.shortAnswer || "Today's briefing ready. Maintain regular problem solving and foundational focus."}
          </div>
        </div>
      ` : ''}

      <!-- Today Metrics Strip -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-primary);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Tasks Today</div>
          <div style="font-size: 1.25rem; font-weight: 800; margin: 2px 0;">${data.completedTasksCount} / ${data.totalTasksCount}</div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${data.totalTasksCount - data.completedTasksCount} pending</div>
        </div>

        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-amber);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">DSA Practice</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-accent-amber); margin: 2px 0;">${data.dsaSolvedTodayCount} solved</div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">Today</div>
        </div>

        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-purple);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Study Hours</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-accent-purple); margin: 2px 0;">${data.studyHoursToday}h</div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${data.studyMinutesToday} mins recorded</div>
        </div>

        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-emerald);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Active Projects</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-accent-emerald); margin: 2px 0;">${data.activeProjectsCount}</div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">In Progress</div>
        </div>

        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-rose);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Revision Queue</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-rose); margin: 2px 0;">${data.revisionsDueCount}</div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">Due today</div>
        </div>
      </div>

      <!-- Main Columns: Today's Tasks & Chronological Timeline -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
        <!-- Left: Today's Tasks & Execution -->
        <div class="card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
              ${getIcon('tasks', 'text-cyan')} TODAY'S PRIORITIES & TASKS
            </div>
            <button class="btn btn-secondary btn-xs" id="btn-add-today-task">
              ${getIcon('plus')} Add Task
            </button>
          </div>

          ${data.todayTasks.length === 0 ? `
            <div style="padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">
              No tasks scheduled for today yet. Use Quick Add or generate tasks from your Roadmap.
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${data.todayTasks.map(t => `
                <div class="task-item ${t.completed ? 'completed' : ''}" style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
                  <input type="checkbox" class="task-checkbox" data-pos-toggle-task="${t.id}" ${t.completed ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px;" />
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 0.88rem; font-weight: 600; text-decoration: ${t.completed ? 'line-through' : 'none'}; color: ${t.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${t.title}
                    </div>
                    <div style="display: flex; gap: 6px; align-items: center; margin-top: 2px;">
                      <span class="badge badge-slate" style="font-size: 0.65rem;">${t.area}</span>
                      <span style="font-size: 0.72rem; color: var(--color-text-muted);">${t.duration}m</span>
                      ${t.is_blocked ? `<span class="badge badge-amber" style="font-size: 0.65rem;">Blocked</span>` : ''}
                      ${t.priority === 'Critical' ? `<span class="badge badge-rose" style="font-size: 0.65rem;">Critical</span>` : ''}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Right: Chronological Timeline (Section 3) -->
        <div class="card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
              ${getIcon('clock', 'text-cyan')} CHRONOLOGICAL DAY SCHEDULE
            </div>
            <button class="btn btn-secondary btn-xs" id="btn-add-schedule-block">
              ${getIcon('plus')} Add Block
            </button>
          </div>

          ${data.timelineBlocks.length === 0 ? `
            <div style="padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">
              No schedule blocks defined for today. Create your morning/evening time blocks.
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${data.timelineBlocks.map(b => `
                <div style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--color-bg-base); border-radius: var(--radius-sm); border-left: 3px solid var(--color-primary);">
                  <div style="font-family: monospace; font-size: 0.82rem; font-weight: 800; color: var(--color-primary); min-width: 90px;">
                    ${b.start_time} - ${b.end_time}
                  </div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 0.88rem; font-weight: 700; color: var(--color-text-primary); text-decoration: ${b.is_completed ? 'line-through' : 'none'};">
                      ${b.title}
                    </div>
                    <span class="badge badge-slate" style="font-size: 0.65rem; margin-top: 2px;">${b.category}</span>
                  </div>
                  <button class="btn btn-ghost btn-xs btn-icon text-muted" data-pos-del-block="${b.id}">
                    ${getIcon('x')}
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>

      <!-- Section: Upcoming Deadlines (Next 7 Days) -->
      ${data.upcomingDeadlines.length > 0 ? `
        <div class="card" style="padding: 14px 16px;">
          <div style="font-size: 0.85rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 8px;">
            Upcoming Deadlines & Actions (Next 7 Days)
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 8px;">
            ${data.upcomingDeadlines.map(d => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); font-size: 0.82rem;">
                <span style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;">${d.title}</span>
                <span class="badge badge-slate" style="font-size: 0.7rem;">${d.due_date}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Handlers
  container.querySelector('#btn-add-today-task').onclick = () => openTaskModal(null, () => renderPersonalOs(rootContainer));

  const btnAddBlock = container.querySelector('#btn-add-schedule-block');
  if (btnAddBlock) {
    btnAddBlock.onclick = () => {
      const title = prompt('Enter block title (e.g. DSA Practice, AI/ML Lab):');
      if (!title) return;
      const startTime = prompt('Start time (HH:MM 24h format):', '17:00') || '17:00';
      const endTime = prompt('End time (HH:MM 24h format):', '18:30') || '18:30';
      addTimelineBlock({ title, start_time: startTime, end_time: endTime, category: 'Learning' });
      renderPersonalOs(rootContainer);
    };
  }

  container.querySelectorAll('[data-pos-toggle-task]').forEach(cb => {
    cb.onchange = () => {
      const taskId = cb.getAttribute('data-pos-toggle-task');
      toggleUniversalTask(taskId);
      renderPersonalOs(rootContainer);
    };
  });

  container.querySelectorAll('[data-pos-del-block]').forEach(btn => {
    btn.onclick = () => {
      const bid = btn.getAttribute('data-pos-del-block');
      deleteTimelineBlock(bid);
      renderPersonalOs(rootContainer);
    };
  });
}

// ==========================================
// SUBTAB 2: QUICK CAPTURE INBOX (Sections 4, 5)
// ==========================================

function renderInboxTab(container, rootContainer) {
  const items = getInboxItems('inbox');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Quick Capture Header Bar -->
      <div class="card" style="padding: 16px;">
        <div style="font-size: 0.95rem; font-weight: 800; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
          ${getIcon('inbox', 'text-cyan')} QUICK CAPTURE INBOX
        </div>
        <p style="font-size: 0.82rem; color: var(--color-text-secondary); margin-bottom: 12px;">
          Capture ideas, tasks, reminders, or potential projects rapidly before triaging them into specific subsystems.
        </p>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <input type="text" id="inbox-quick-title" class="form-input" placeholder="Type a thought, task, or question..." style="flex: 2; min-width: 200px;" />
          <select id="inbox-quick-type" class="form-select" style="flex: 1; min-width: 140px;">
            <option value="Task">Task</option>
            <option value="Idea">Idea</option>
            <option value="Note">Note</option>
            <option value="Reminder">Reminder</option>
            <option value="Project idea">Project Idea</option>
            <option value="DSA problem">DSA Problem</option>
            <option value="Career action">Career Action</option>
          </select>
          <button class="btn btn-primary" id="btn-inbox-add-item">
            ${getIcon('plus')} Capture
          </button>
        </div>
      </div>

      <!-- Items List -->
      <div class="card" style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted);">
            Items Awaiting Processing (${items.length})
          </div>
        </div>

        ${items.length === 0 ? `
          <div style="padding: 32px; text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">
            No items in inbox. You are completely caught up! Use the field above to capture fresh thoughts.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${items.map(item => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); flex-wrap: wrap; gap: 8px;">
                <div style="flex: 1; min-width: 200px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge badge-slate" style="font-size: 0.7rem; text-transform: uppercase;">${item.type}</span>
                    <span style="font-size: 0.92rem; font-weight: 700; color: var(--color-text-primary);">${item.title}</span>
                  </div>
                  ${item.description ? `<div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 4px;">${item.description}</div>` : ''}
                </div>

                <div style="display: flex; gap: 6px; align-items: center;">
                  <button class="btn btn-secondary btn-xs" data-pos-process-inbox="${item.id}">
                    ${getIcon('sparkles')} Process Item
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // Handlers
  const handleAdd = () => {
    const title = container.querySelector('#inbox-quick-title').value.trim();
    if (!title) return;
    const type = container.querySelector('#inbox-quick-type').value;
    addInboxItem({ title, type });
    renderPersonalOs(rootContainer);
  };

  container.querySelector('#btn-inbox-add-item').onclick = handleAdd;
  container.querySelector('#inbox-quick-title').onkeydown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  container.querySelectorAll('[data-pos-process-inbox]').forEach(btn => {
    btn.onclick = () => {
      const itemId = btn.getAttribute('data-pos-process-inbox');
      openInboxProcessModal(itemId, () => renderPersonalOs(rootContainer));
    };
  });
}

// ==========================================
// SUBTAB 3: UNIVERSAL TASKS (Sections 9, 10, 11)
// ==========================================

function renderTasksTab(container, rootContainer) {
  const workload = getTasksWorkload();
  const tasks = getUniversalTasks({
    status: taskStatusFilter,
    area: taskAreaFilter,
    priority: taskPriorityFilter,
    search: taskSearchQuery
  });

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Section 51: Personal Workload Bar (Factual numbers, no fake scores) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-primary);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Due Today</div>
          <div style="font-size: 1.25rem; font-weight: 800; margin: 2px 0;">${workload.dueToday}</div>
        </div>

        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-cyan);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Due This Week</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-accent-cyan); margin: 2px 0;">${workload.dueThisWeek}</div>
        </div>

        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-rose);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Overdue</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-rose); margin: 2px 0;">${workload.overdue}</div>
        </div>

        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-purple);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">In Progress</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-accent-purple); margin: 2px 0;">${workload.inProgress}</div>
        </div>

        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-amber);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Blocked</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-accent-amber); margin: 2px 0;">${workload.blocked}</div>
        </div>
      </div>

      <!-- Filters & View Switcher Bar -->
      <div class="card" style="padding: 12px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <input type="text" id="task-filter-search" class="form-input" placeholder="Search tasks..." value="${taskSearchQuery}" style="font-size: 0.8rem; width: 160px;" />

            <select id="task-filter-area" class="form-select" style="font-size: 0.8rem;">
              <option value="all" ${taskAreaFilter === 'all' ? 'selected' : ''}>All Areas</option>
              <option value="Learning" ${taskAreaFilter === 'Learning' ? 'selected' : ''}>Learning</option>
              <option value="DSA" ${taskAreaFilter === 'DSA' ? 'selected' : ''}>DSA</option>
              <option value="Projects" ${taskAreaFilter === 'Projects' ? 'selected' : ''}>Projects</option>
              <option value="Career" ${taskAreaFilter === 'Career' ? 'selected' : ''}>Career</option>
              <option value="Personal" ${taskAreaFilter === 'Personal' ? 'selected' : ''}>Personal</option>
            </select>

            <select id="task-filter-status" class="form-select" style="font-size: 0.8rem;">
              <option value="all" ${taskStatusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
              <option value="Todo" ${taskStatusFilter === 'Todo' ? 'selected' : ''}>Todo</option>
              <option value="In Progress" ${taskStatusFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Completed" ${taskStatusFilter === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>

          <div style="display: flex; gap: 8px; align-items: center;">
            <div class="btn-group" style="display: flex; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); overflow: hidden;">
              <button class="btn btn-xs ${taskViewMode === 'list' ? 'btn-primary' : 'btn-ghost'}" id="btn-view-list">List</button>
              <button class="btn btn-xs ${taskViewMode === 'board' ? 'btn-primary' : 'btn-ghost'}" id="btn-view-board">Board</button>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-create-universal-task">
              ${getIcon('plus')} New Task
            </button>
          </div>
        </div>
      </div>

      <!-- Main Tasks Content -->
      ${taskViewMode === 'list' ? renderTasksListView(tasks) : renderTasksBoardView(tasks)}
    </div>
  `;

  // Attach Handlers
  container.querySelector('#btn-create-universal-task').onclick = () => openTaskModal(null, () => renderPersonalOs(rootContainer));

  container.querySelector('#btn-view-list').onclick = () => {
    taskViewMode = 'list';
    renderPersonalOs(rootContainer);
  };
  container.querySelector('#btn-view-board').onclick = () => {
    taskViewMode = 'board';
    renderPersonalOs(rootContainer);
  };

  container.querySelector('#task-filter-search').oninput = (e) => {
    taskSearchQuery = e.target.value;
    renderPersonalOs(rootContainer);
  };
  container.querySelector('#task-filter-area').onchange = (e) => {
    taskAreaFilter = e.target.value;
    renderPersonalOs(rootContainer);
  };
  container.querySelector('#task-filter-status').onchange = (e) => {
    taskStatusFilter = e.target.value;
    renderPersonalOs(rootContainer);
  };

  container.querySelectorAll('[data-task-toggle]').forEach(cb => {
    cb.onchange = () => {
      toggleUniversalTask(cb.getAttribute('data-task-toggle'));
      renderPersonalOs(rootContainer);
    };
  });

  container.querySelectorAll('[data-task-delete]').forEach(btn => {
    btn.onclick = () => {
      deleteUniversalTask(btn.getAttribute('data-task-delete'));
      renderPersonalOs(rootContainer);
    };
  });
}

function renderTasksListView(tasks) {
  if (tasks.length === 0) {
    return `
      <div class="card" style="padding: 32px; text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">
        No tasks match your filters. Create your first task using the "+ New Task" button.
      </div>
    `;
  }

  return `
    <div class="card" style="padding: 16px;">
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${tasks.map(t => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 200px;">
              <input type="checkbox" data-task-toggle="${t.id}" ${t.status === 'Completed' ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px;" />
              <div>
                <div style="font-size: 0.9rem; font-weight: 700; color: ${t.status === 'Completed' ? 'var(--color-text-muted)' : 'var(--color-text-primary)'}; text-decoration: ${t.status === 'Completed' ? 'line-through' : 'none'};">
                  ${t.title}
                </div>
                <div style="display: flex; gap: 6px; align-items: center; margin-top: 2px;">
                  <span class="badge badge-slate" style="font-size: 0.65rem;">${t.area}</span>
                  <span class="badge badge-slate" style="font-size: 0.65rem;">Due: ${t.due_date || 'No date'}</span>
                  ${t.is_blocked ? `<span class="badge badge-amber" style="font-size: 0.65rem;">Blocked: ${t.blocked_reason}</span>` : ''}
                  ${t.is_recurring ? `<span class="badge badge-cyan" style="font-size: 0.65rem;">Recurring: ${t.recurrence_rule}</span>` : ''}
                  <span style="font-size: 0.72rem; color: var(--color-text-muted);">${t.estimated_duration}m</span>
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 6px; align-items: center;">
              <button class="btn btn-ghost btn-xs btn-icon text-muted" data-task-delete="${t.id}">
                ${getIcon('trash')}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderTasksBoardView(tasks) {
  const columns = ['Todo', 'In Progress', 'Completed'];

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
      ${columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col);
        return `
          <div class="card" style="padding: 14px; background: rgba(14, 21, 38, 0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
              <span style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted);">${col}</span>
              <span class="badge badge-slate" style="font-size: 0.7rem;">${colTasks.length}</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; min-height: 150px;">
              ${colTasks.map(t => `
                <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
                  <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 4px;">${t.title}</div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--color-text-muted);">
                    <span>${t.area}</span>
                    <span>${t.due_date}</span>
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
// SUBTAB 4: UNIFIED CALENDAR (Sections 12, 13)
// ==========================================

function renderCalendarTab(container, rootContainer) {
  const events = getUnifiedCalendarEvents();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div class="card" style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
            ${getIcon('calendar', 'text-cyan')} UNIFIED MULTI-DOMAIN CALENDAR
          </div>
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">
            Aggregating Tasks, Study, Projects, Career &amp; Focus sessions
          </span>
        </div>

        ${events.length === 0 ? `
          <div style="padding: 32px; text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">
            No calendar events found. Schedule tasks or log study sessions to view them here.
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;">
            ${events.map(ev => `
              <div style="padding: 10px 14px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); border-left: 3px solid ${ev.type === 'Task' ? 'var(--color-primary)' : ev.type === 'Study' ? 'var(--color-accent-cyan)' : 'var(--color-accent-purple)'};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span class="badge badge-slate" style="font-size: 0.65rem;">${ev.type}</span>
                  <span style="font-size: 0.72rem; color: var(--color-text-muted);">${ev.date}</span>
                </div>
                <div style="font-size: 0.88rem; font-weight: 700; color: var(--color-text-primary);">${ev.title}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

// ==========================================
// SUBTAB 5: FOCUS MODE (Sections 14-17)
// ==========================================

function renderFocusTab(container, rootContainer) {
  const history = getFocusHistory('month');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Focus Launcher Hero Card -->
      <div class="card" style="padding: 24px; text-align: center; background: linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(14, 21, 38, 0.6) 100%); border: 1px solid var(--color-accent-cyan);">
        <div style="color: var(--color-accent-cyan); margin-bottom: 8px;">${getIcon('focus')}</div>
        <h2 style="font-size: 1.4rem; font-weight: 800; margin: 0 0 6px 0;">Dedicated Deep Work Session</h2>
        <p style="font-size: 0.85rem; color: var(--color-text-secondary); max-width: 500px; margin: 0 auto 20px auto;">
          Choose an objective, select an unhurried duration, and enter deep state. Focus sessions automatically integrate with Study Hours analytics upon completion.
        </p>

        <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-primary" id="btn-launch-focus-modal">
            ${getIcon('focus')} Launch Focus Session
          </button>
        </div>
      </div>

      <!-- Focus History Stats Strip -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px;">
        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-cyan);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Focus Hours</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-accent-cyan); margin: 2px 0;">${history.totalHours}h</div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${history.totalSessions} sessions logged</div>
        </div>

        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-amber);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">DSA Focus</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-accent-amber); margin: 2px 0;">${(history.categoryBreakdown.DSA / 60).toFixed(1)}h</div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">Algorithm deep work</div>
        </div>

        <div class="card" style="padding: 10px 12px; border-left: 3px solid var(--color-accent-purple);">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 700;">Projects Focus</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-accent-purple); margin: 2px 0;">${(history.categoryBreakdown.Projects / 60).toFixed(1)}h</div>
          <div style="font-size: 0.72rem; color: var(--color-text-secondary);">Engineering deep work</div>
        </div>
      </div>

      <!-- Focus History List -->
      <div class="card" style="padding: 16px;">
        <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 12px;">
          Recent Completed Sessions
        </div>

        ${history.sessions.length === 0 ? `
          <div style="padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">
            No focus sessions recorded yet. Launch your first deep work session!
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${history.sessions.slice(0, 10).map(s => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
                <div>
                  <div style="font-size: 0.9rem; font-weight: 700; color: var(--color-text-primary);">${s.task_title}</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                    ${s.category} · ${s.duration_minutes} mins · ${s.notes || 'No notes'}
                  </div>
                </div>
                <span class="badge badge-emerald" style="font-size: 0.7rem;">Completed</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  container.querySelector('#btn-launch-focus-modal').onclick = () => {
    openFocusSessionModal((session) => {
      // Prompt for completion after running
      openFocusSummaryModal(session.id, () => renderPersonalOs(rootContainer));
    });
  };
}

// ==========================================
// SUBTAB 6: NOTES & CONCEPTS (Sections 18-24)
// ==========================================

function renderNotesTab(container, rootContainer) {
  const notes = getNotes({ area: notesAreaFilter, search: notesSearchQuery });

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Notes Filter & Action Bar -->
      <div class="card" style="padding: 12px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <input type="text" id="note-search-input" class="form-input" placeholder="Search notes..." value="${notesSearchQuery}" style="font-size: 0.8rem; width: 160px;" />
            <select id="note-area-filter" class="form-select" style="font-size: 0.8rem;">
              <option value="all" ${notesAreaFilter === 'all' ? 'selected' : ''}>All Areas</option>
              <option value="Learning" ${notesAreaFilter === 'Learning' ? 'selected' : ''}>Learning</option>
              <option value="DSA" ${notesAreaFilter === 'DSA' ? 'selected' : ''}>DSA Patterns</option>
              <option value="Projects" ${notesAreaFilter === 'Projects' ? 'selected' : ''}>Projects</option>
              <option value="Career" ${notesAreaFilter === 'Career' ? 'selected' : ''}>Career</option>
              <option value="Personal" ${notesAreaFilter === 'Personal' ? 'selected' : ''}>Personal</option>
            </select>
          </div>

          <button class="btn btn-primary btn-sm" id="btn-create-note">
            ${getIcon('plus')} New Note
          </button>
        </div>
      </div>

      <!-- Notes Grid -->
      ${notes.length === 0 ? `
        <div class="card" style="padding: 32px; text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">
          No notes found. Create your first technical concept or architecture note.
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
          ${notes.map(n => `
            <div class="card" style="padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <span class="badge badge-slate" style="font-size: 0.65rem;">${n.area}</span>
                  ${n.is_pinned ? `<span style="color: var(--color-accent-amber); font-size: 0.8rem;">📌</span>` : ''}
                </div>
                <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 6px;">${n.title}</div>
                <div style="font-size: 0.82rem; color: var(--color-text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 10px;">
                  ${n.content}
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border-subtle); padding-top: 8px;">
                <span style="font-size: 0.7rem; color: var(--color-text-muted);">${n.folder || 'Default'}</span>
                <div style="display: flex; gap: 4px;">
                  <button class="btn btn-ghost btn-xs btn-icon text-muted" data-pos-del-note="${n.id}">
                    ${getIcon('trash')}
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  container.querySelector('#btn-create-note').onclick = () => openNoteModal(null, () => renderPersonalOs(rootContainer));

  container.querySelector('#note-search-input').oninput = (e) => {
    notesSearchQuery = e.target.value;
    renderPersonalOs(rootContainer);
  };
  container.querySelector('#note-area-filter').onchange = (e) => {
    notesAreaFilter = e.target.value;
    renderPersonalOs(rootContainer);
  };

  container.querySelectorAll('[data-pos-del-note]').forEach(btn => {
    btn.onclick = () => {
      deleteNote(btn.getAttribute('data-pos-del-note'));
      renderPersonalOs(rootContainer);
    };
  });
}

// ==========================================
// SUBTAB 7: KNOWLEDGE & GRAPH (Sections 46-48, 56-58)
// ==========================================

function renderKnowledgeTab(container, rootContainer) {
  const graph = getKnowledgeGraphData();
  const resources = getResources();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Interactive Knowledge Graph (Section 56, 57) -->
      <div class="card" style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
            ${getIcon('graph', 'text-cyan')} MY KNOWLEDGE GRAPH
          </div>
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">
            ${graph.nodes.length} Connected Nodes · ${graph.edges.length} Cross-Domain Edges
          </span>
        </div>
        <p style="font-size: 0.82rem; color: var(--color-text-secondary); margin-bottom: 12px;">
          Visual connections between Curriculum Topics, DSA Patterns, Active Projects, Notes, and Career Milestones.
        </p>

        <!-- SVG Node Canvas Preview -->
        <div style="background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md); padding: 20px; overflow-x: auto; text-align: center;">
          <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
            ${graph.nodes.map(n => `
              <div style="padding: 8px 14px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: 20px; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                <span class="badge ${n.type === 'Project' ? 'badge-purple' : n.type === 'Topic' ? 'badge-emerald' : 'badge-cyan'}" style="font-size: 0.65rem;">${n.type}</span>
                <span>${n.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Resource Library (Section 46, 47) -->
      <div class="card" style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
            ${getIcon('resources', 'text-amber')} RESOURCE LIBRARY
          </div>
        </div>

        ${resources.length === 0 ? `
          <div style="padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">
            No external resources saved yet. Keep articles, repositories, and documentation organized here.
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;">
            ${resources.map(r => `
              <div style="padding: 10px 14px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span class="badge badge-slate" style="font-size: 0.65rem;">${r.type}</span>
                  <span class="badge badge-emerald" style="font-size: 0.65rem;">${r.status}</span>
                </div>
                <div style="font-size: 0.88rem; font-weight: 700; color: var(--color-text-primary);">${r.title}</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">${r.topic}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

// ==========================================
// SUBTAB 8: REVIEW CENTER (Sections 38-43)
// ==========================================

function renderReviewsTab(container, rootContainer) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const review = getReviewData(reviewTabType, activeDate);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Review Subnav -->
      <div style="display: flex; gap: 6px; overflow-x: auto;">
        <button class="filter-pill ${reviewTabType === 'daily' ? 'active' : ''}" data-pos-rev="daily">Daily Review</button>
        <button class="filter-pill ${reviewTabType === 'weekly' ? 'active' : ''}" data-pos-rev="weekly">Weekly Review</button>
        <button class="filter-pill ${reviewTabType === 'monthly' ? 'active' : ''}" data-pos-rev="monthly">Monthly Review</button>
        <button class="filter-pill ${reviewTabType === 'quarterly' ? 'active' : ''}" data-pos-rev="quarterly">Quarterly Review</button>
        <button class="filter-pill ${reviewTabType === 'yearly' ? 'active' : ''}" data-pos-rev="yearly">Yearly Review</button>
      </div>

      <!-- Review Card -->
      <div class="card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
          <div>
            <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; text-transform: uppercase;">${reviewTabType} Reflection &amp; Audit</h3>
            <span style="font-size: 0.8rem; color: var(--color-text-muted);">Period: <strong>${review.period}</strong></span>
          </div>
        </div>

        <!-- Recorded Metrics Snapshot -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 18px;">
          <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.7rem; color: var(--color-text-muted);">Tasks Done</div>
            <div style="font-size: 1.2rem; font-weight: 800;">${review.tasksCompleted}</div>
          </div>
          <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.7rem; color: var(--color-text-muted);">Study Time</div>
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-primary);">${review.studyHours}h</div>
          </div>
          <div style="padding: 10px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
            <div style="font-size: 0.7rem; color: var(--color-text-muted);">DSA Solved</div>
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--color-accent-amber);">${review.dsaProblemsSolved}</div>
          </div>
        </div>

        <!-- Reflection Inputs -->
        <form id="form-save-review" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label class="form-label" style="font-size: 0.82rem; font-weight: 700; display: block; margin-bottom: 4px;">
              ${review.promptAccomplished}
            </label>
            <textarea id="rev-accomplished" class="form-textarea" rows="2" placeholder="Key wins, completed modules, solved problems..."></textarea>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.82rem; font-weight: 700; display: block; margin-bottom: 4px;">
              ${review.promptRemains}
            </label>
            <textarea id="rev-remaining" class="form-textarea" rows="2" placeholder="Pending tasks, stumbling blocks, concepts requiring revision..."></textarea>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.82rem; font-weight: 700; display: block; margin-bottom: 4px;">
              ${review.promptCarryForward}
            </label>
            <textarea id="rev-priorities" class="form-textarea" rows="2" placeholder="Top 3 priorities to execute next..."></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
            <button type="submit" class="btn btn-primary">${getIcon('check')} Save ${reviewTabType} Review</button>
          </div>
        </form>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-pos-rev]').forEach(btn => {
    btn.onclick = () => {
      reviewTabType = btn.getAttribute('data-pos-rev');
      renderPersonalOs(rootContainer);
    };
  });

  container.querySelector('#form-save-review').onsubmit = (e) => {
    e.preventDefault();
    saveReviewRecord({
      type: reviewTabType,
      period: review.period,
      accomplishments: container.querySelector('#rev-accomplished').value.trim(),
      remaining: container.querySelector('#rev-remaining').value.trim(),
      next_priorities: container.querySelector('#rev-priorities').value.trim()
    });
    alert(`${reviewTabType.toUpperCase()} Review saved successfully.`);
    renderPersonalOs(rootContainer);
  };
}

// ==========================================
// SUBTAB 9: AUTOMATIONS (Sections 31-37)
// ==========================================

function renderAutomationTab(container, rootContainer) {
  const automations = getAutomations();
  const history = getAutomationHistory();

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- Active Automations List -->
      <div class="card" style="padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <div style="font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
              ${getIcon('automation', 'text-cyan')} ACTIVE AUTOMATION RULES
            </div>
            <div style="font-size: 0.8rem; color: var(--color-text-muted);">
              Deterministic rules: TRIGGER → CONDITION → SAFE ACTION (Preview / Approve by default)
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-create-auto-rule">
            ${getIcon('plus')} New Rule
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${automations.map(a => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); flex-wrap: wrap; gap: 8px;">
              <div>
                <div style="font-size: 0.92rem; font-weight: 700; color: var(--color-text-primary);">${a.title}</div>
                <div style="font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 2px;">
                  WHEN <strong>${a.trigger}</strong> → THEN <strong>${a.action_type}</strong>
                  ${a.require_approval ? ' · <span class="text-amber">Requires Approval</span>' : ' · <span class="text-emerald">Auto Safe</span>'}
                </div>
              </div>

              <div style="display: flex; gap: 6px; align-items: center;">
                <button class="btn btn-xs ${a.is_enabled ? 'btn-primary' : 'btn-secondary'}" data-toggle-auto="${a.id}">
                  ${a.is_enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Automation History Log -->
      <div class="card" style="padding: 16px;">
        <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 12px;">
          Automation Run History &amp; Approval Queue
        </div>

        ${history.length === 0 ? `
          <div style="padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">
            No automation runs logged yet.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${history.map(r => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
                <div>
                  <div style="font-size: 0.88rem; font-weight: 700; color: var(--color-text-primary);">${r.automation_title}</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">${r.result_summary}</div>
                </div>
                <div style="display: flex; gap: 6px; align-items: center;">
                  ${r.status === 'Pending Approval' ? `
                    <button class="btn btn-primary btn-xs" data-approve-run="${r.id}">Approve</button>
                    <button class="btn btn-secondary btn-xs" data-reject-run="${r.id}">Decline</button>
                  ` : `
                    <span class="badge ${r.status === 'Executed' || r.status === 'Approved' ? 'badge-emerald' : 'badge-slate'}" style="font-size: 0.7rem;">${r.status}</span>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // Handlers
  container.querySelector('#btn-create-auto-rule').onclick = () => {
    alert('Create automation: Select Trigger, Condition, and Action in personalOsEngine.');
  };

  container.querySelectorAll('[data-toggle-auto]').forEach(btn => {
    btn.onclick = () => {
      const aid = btn.getAttribute('data-toggle-auto');
      const auto = automations.find(a => a.id === aid);
      if (auto) {
        updateAutomation(aid, { is_enabled: !auto.is_enabled });
        renderPersonalOs(rootContainer);
      }
    };
  });

  container.querySelectorAll('[data-approve-run]').forEach(btn => {
    btn.onclick = () => {
      approveAutomationRun(btn.getAttribute('data-approve-run'));
      renderPersonalOs(rootContainer);
    };
  });

  container.querySelectorAll('[data-reject-run]').forEach(btn => {
    btn.onclick = () => {
      rejectAutomationRun(btn.getAttribute('data-reject-run'));
      renderPersonalOs(rootContainer);
    };
  });
}

// ==========================================
// SUBTAB 10: OS SETTINGS & BACKUP (Sections 59-65)
// ==========================================

function renderSettingsTab(container, rootContainer) {
  const settings = getPersonalOsSettings();
  const activity = getActivityLog(15);

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- System Backup & Conflict Restore Card (Sections 60-63) -->
      <div class="card" style="padding: 18px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <div style="font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; gap: 6px;">
              ${getIcon('shieldCheck', 'text-cyan')} SYSTEM BACKUP & RESTORE
            </div>
            <div style="font-size: 0.8rem; color: var(--color-text-muted);">
              Versioned data exports and safe conflict-preview restores
            </div>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-open-backup-modal">
            ${getIcon('shieldCheck')} Backup &amp; Restore Hub
          </button>
        </div>
      </div>

      <!-- Personal OS Preferences Form -->
      <div class="card" style="padding: 18px;">
        <div style="font-size: 0.95rem; font-weight: 800; margin-bottom: 14px;">Personal OS Preferences</div>

        <form id="form-pos-settings" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Default Task Duration (Mins)</label>
            <input type="number" id="set-task-duration" class="form-input" value="${settings.default_task_duration || 30}" style="width: 100%;" />
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Time Format</label>
            <select id="set-time-format" class="form-select" style="width: 100%;">
              <option value="24h" ${settings.time_format === '24h' ? 'selected' : ''}>24-hour (17:00)</option>
              <option value="12h" ${settings.time_format === '12h' ? 'selected' : ''}>12-hour (5:00 PM)</option>
            </select>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.8rem; font-weight: 700; display: block; margin-bottom: 4px;">Week Start Day</label>
            <select id="set-week-start" class="form-select" style="width: 100%;">
              <option value="monday" ${settings.week_start === 'monday' ? 'selected' : ''}>Monday</option>
              <option value="sunday" ${settings.week_start === 'sunday' ? 'selected' : ''}>Sunday</option>
            </select>
          </div>

          <div style="grid-column: 1 / -1; display: flex; justify-content: flex-end; margin-top: 6px;">
            <button type="submit" class="btn btn-primary">${getIcon('check')} Save Preferences</button>
          </div>
        </form>
      </div>

      <!-- Global Activity Log & Undo (Sections 64, 65) -->
      <div class="card" style="padding: 18px;">
        <div style="font-size: 0.95rem; font-weight: 800; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
          ${getIcon('history', 'text-amber')} GLOBAL ACTIVITY LOG & UNDO
        </div>

        ${activity.length === 0 ? `
          <div style="padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">
            No user actions recorded in activity log yet.
          </div>
        ` : `
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${activity.map(act => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--color-bg-base); border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); flex-wrap: wrap; gap: 8px;">
                <div>
                  <div style="font-size: 0.88rem; font-weight: 700; color: var(--color-text-primary);">${act.title}</div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted);">${act.details} · <span style="font-family: monospace;">${act.timestamp ? act.timestamp.split('T')[1].slice(0, 8) : ''}</span></div>
                </div>

                ${act.can_undo ? `
                  <button class="btn btn-secondary btn-xs" data-pos-undo="${act.id}">
                    ${getIcon('undo')} Undo
                  </button>
                ` : ''}
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // Handlers
  container.querySelector('#btn-open-backup-modal').onclick = () => {
    openBackupRestoreModal(() => renderPersonalOs(rootContainer));
  };

  container.querySelector('#form-pos-settings').onsubmit = (e) => {
    e.preventDefault();
    updatePersonalOsSettings({
      default_task_duration: parseInt(container.querySelector('#set-task-duration').value, 10) || 30,
      time_format: container.querySelector('#set-time-format').value,
      week_start: container.querySelector('#set-week-start').value
    });
    alert('Preferences saved successfully.');
    renderPersonalOs(rootContainer);
  };

  container.querySelectorAll('[data-pos-undo]').forEach(btn => {
    btn.onclick = () => {
      const actId = btn.getAttribute('data-pos-undo');
      const res = undoActivity(actId);
      if (res.success) {
        alert(res.message);
      } else {
        alert(res.message);
      }
      renderPersonalOs(rootContainer);
    };
  });
}

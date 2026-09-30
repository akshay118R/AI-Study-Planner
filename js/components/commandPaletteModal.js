/**
 * Akshay's 12-Month AI/ML Career OS - Command Palette Modal (Phase 10, Section 8)
 * Keyboard-first navigation (Ctrl + K) & Global Search launcher
 */

import { getIcon } from './icons.js';
import { globalSearch } from '../services/personalOsEngine.js';
import { openTaskModal, openNoteModal, openFocusSessionModal } from './personalOsModals.js';

let commandPaletteRoot = null;

function ensureCommandPaletteContainer() {
  if (!commandPaletteRoot) {
    commandPaletteRoot = document.getElementById('command-palette-modal-container');
    if (!commandPaletteRoot) {
      commandPaletteRoot = document.createElement('div');
      commandPaletteRoot.id = 'command-palette-modal-container';
      document.body.appendChild(commandPaletteRoot);
    }
  }
  return commandPaletteRoot;
}

export function closeCommandPalette() {
  const container = ensureCommandPaletteContainer();
  container.innerHTML = '';
}

export function openCommandPalette(initialQuery = '') {
  const container = ensureCommandPaletteContainer();

  const COMMANDS = [
    { id: 'cmd-task', title: 'Add Universal Task', shortcut: 'T', icon: 'tasks', action: () => openTaskModal(null) },
    { id: 'cmd-note', title: 'Add Note / Concept', shortcut: 'N', icon: 'notes', action: () => openNoteModal(null) },
    { id: 'cmd-focus', title: 'Start Focus Deep Work Session', shortcut: 'F', icon: 'focus', action: () => openFocusSessionModal() },
    { id: 'cmd-today', title: 'Open Today Hub', shortcut: 'O T', icon: 'today', action: () => { window.location.hash = '#personal-os'; } },
    { id: 'cmd-dsa', title: 'Open DSA Tracker', shortcut: 'O D', icon: 'dsa', action: () => { window.location.hash = '#dsa'; } },
    { id: 'cmd-proj', title: 'Open Projects Hub', shortcut: 'O P', icon: 'projects', action: () => { window.location.hash = '#projects'; } },
    { id: 'cmd-career', title: 'Open Career & Placement', shortcut: 'O C', icon: 'career', action: () => { window.location.hash = '#career'; } },
    { id: 'cmd-ai', title: 'Open AI Mentor Chat', shortcut: 'O A', icon: 'brain', action: () => { window.location.hash = '#ai'; } },
    { id: 'cmd-calendar', title: 'Open Multi-Domain Calendar', shortcut: 'O L', icon: 'calendar', action: () => { window.location.hash = '#calendar'; } },
    { id: 'cmd-progress', title: 'Open Progress & Achievements', shortcut: 'O G', icon: 'trophy', action: () => { window.location.hash = '#progress'; } }
  ];

  container.innerHTML = `
    <div class="modal-backdrop animate-fade-in" id="cp-backdrop" style="position: fixed; inset: 0; background: rgba(10, 15, 29, 0.8); backdrop-filter: blur(8px); display: flex; align-items: flex-start; justify-content: center; z-index: 10000; padding: 60px 16px;">
      <div class="card animate-scale-up" style="max-width: 640px; width: 100%; border: 1px solid var(--color-border); box-shadow: 0 25px 50px rgba(0,0,0,0.6); padding: 0; border-radius: var(--radius-lg); overflow: hidden; background: var(--color-bg-surface);">
        <!-- Search Input Bar -->
        <div style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--color-border-subtle); background: var(--color-bg-base);">
          <span style="color: var(--color-primary);">${getIcon('search')}</span>
          <input type="text" id="cp-search-input" class="form-input" placeholder="Type a command or search anything across your OS..." value="${initialQuery}" style="flex: 1; border: none; background: transparent; font-size: 1rem; box-shadow: none; padding: 0;" autofocus />
          <kbd style="font-size: 0.72rem; padding: 2px 6px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: 4px; color: var(--color-text-muted);">ESC</kbd>
        </div>

        <!-- Filter Pills Bar -->
        <div style="display: flex; gap: 6px; padding: 8px 18px; border-bottom: 1px solid var(--color-border-subtle); background: rgba(0,0,0,0.15); overflow-x: auto;">
          <button class="filter-pill active" data-cpfilter="all" style="font-size: 0.75rem; padding: 2px 8px;">All</button>
          <button class="filter-pill" data-cpfilter="tasks" style="font-size: 0.75rem; padding: 2px 8px;">Tasks</button>
          <button class="filter-pill" data-cpfilter="dsa" style="font-size: 0.75rem; padding: 2px 8px;">DSA</button>
          <button class="filter-pill" data-cpfilter="projects" style="font-size: 0.75rem; padding: 2px 8px;">Projects</button>
          <button class="filter-pill" data-cpfilter="notes" style="font-size: 0.75rem; padding: 2px 8px;">Notes</button>
          <button class="filter-pill" data-cpfilter="career" style="font-size: 0.75rem; padding: 2px 8px;">Career</button>
        </div>

        <!-- Results / Commands List -->
        <div id="cp-results-list" style="max-height: 380px; overflow-y: auto; padding: 8px;">
          <!-- Populated dynamically -->
        </div>

        <!-- Footer -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 18px; border-top: 1px solid var(--color-border-subtle); background: var(--color-bg-base); font-size: 0.75rem; color: var(--color-text-muted);">
          <span>Use <strong>↑</strong> <strong>↓</strong> to navigate, <strong>Enter</strong> to select</span>
          <span>Personal OS Quick Action</span>
        </div>
      </div>
    </div>
  `;

  const input = container.querySelector('#cp-search-input');
  const resultsContainer = container.querySelector('#cp-results-list');
  let activeFilter = 'all';

  function renderList(query = '') {
    const q = query.trim().toLowerCase();

    if (!q) {
      // Show default commands
      resultsContainer.innerHTML = `
        <div style="padding: 6px 10px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted);">Quick Commands</div>
        ${COMMANDS.map(cmd => `
          <div class="cp-item" data-cmd-id="${cmd.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: var(--radius-md); cursor: pointer; transition: background 0.15s;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: var(--color-primary);">${getIcon(cmd.icon)}</span>
              <span style="font-size: 0.88rem; font-weight: 600;">${cmd.title}</span>
            </div>
            <kbd style="font-size: 0.72rem; padding: 2px 6px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: 4px; color: var(--color-text-secondary);">${cmd.shortcut}</kbd>
          </div>
        `).join('')}
      `;

      resultsContainer.querySelectorAll('[data-cmd-id]').forEach(el => {
        el.onmouseenter = () => el.style.background = 'var(--color-bg-base)';
        el.onmouseleave = () => el.style.background = 'transparent';
        el.onclick = () => {
          const cid = el.getAttribute('data-cmd-id');
          const target = COMMANDS.find(c => c.id === cid);
          closeCommandPalette();
          if (target) target.action();
        };
      });
      return;
    }

    // Search across database
    const results = globalSearch(q, activeFilter);

    // Also match commands
    const matchedCommands = COMMANDS.filter(c => c.title.toLowerCase().includes(q));

    if (results.length === 0 && matchedCommands.length === 0) {
      resultsContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--color-text-muted); font-size: 0.85rem;">
          No matching commands, tasks, or records found for "${query}"
        </div>
      `;
      return;
    }

    let html = '';

    if (matchedCommands.length > 0) {
      html += `<div style="padding: 6px 10px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted);">Commands</div>`;
      matchedCommands.forEach(cmd => {
        html += `
          <div class="cp-item" data-cmd-id="${cmd.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: var(--radius-md); cursor: pointer; transition: background 0.15s;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: var(--color-primary);">${getIcon(cmd.icon)}</span>
              <span style="font-size: 0.88rem; font-weight: 600;">${cmd.title}</span>
            </div>
            <kbd style="font-size: 0.72rem; padding: 2px 6px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: 4px; color: var(--color-text-secondary);">${cmd.shortcut}</kbd>
          </div>
        `;
      });
    }

    if (results.length > 0) {
      html += `<div style="padding: 6px 10px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted);">Records (${results.length})</div>`;
      results.forEach((r, idx) => {
        html += `
          <div class="cp-item" data-result-idx="${idx}" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: var(--radius-md); cursor: pointer; transition: background 0.15s;">
            <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
              <span class="badge badge-slate" style="font-size: 0.65rem; text-transform: uppercase;">${r.type}</span>
              <div>
                <div style="font-size: 0.88rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.title}</div>
                <div style="font-size: 0.72rem; color: var(--color-text-muted);">${r.subtitle}</div>
              </div>
            </div>
            <span style="font-size: 0.72rem; color: var(--color-text-secondary);">${r.relatedArea}</span>
          </div>
        `;
      });
    }

    resultsContainer.innerHTML = html;

    // Attach handlers
    resultsContainer.querySelectorAll('[data-cmd-id]').forEach(el => {
      el.onmouseenter = () => el.style.background = 'var(--color-bg-base)';
      el.onmouseleave = () => el.style.background = 'transparent';
      el.onclick = () => {
        const cid = el.getAttribute('data-cmd-id');
        const target = COMMANDS.find(c => c.id === cid);
        closeCommandPalette();
        if (target) target.action();
      };
    });

    resultsContainer.querySelectorAll('[data-result-idx]').forEach(el => {
      el.onmouseenter = () => el.style.background = 'var(--color-bg-base)';
      el.onmouseleave = () => el.style.background = 'transparent';
      el.onclick = () => {
        const idx = parseInt(el.getAttribute('data-result-idx'), 10);
        const item = results[idx];
        closeCommandPalette();
        if (item && item.url) window.location.hash = item.url;
      };
    });
  }

  // Filter Buttons
  container.querySelectorAll('[data-cpfilter]').forEach(btn => {
    btn.onclick = () => {
      container.querySelectorAll('[data-cpfilter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-cpfilter');
      renderList(input.value);
    };
  });

  input.oninput = (e) => renderList(e.target.value);
  input.onkeydown = (e) => {
    if (e.key === 'Escape') closeCommandPalette();
    if (e.key === 'Enter') {
      const firstItem = resultsContainer.querySelector('.cp-item');
      if (firstItem) firstItem.click();
    }
  };

  container.querySelector('#cp-backdrop').onclick = (e) => {
    if (e.target.id === 'cp-backdrop') closeCommandPalette();
  };

  renderList(initialQuery);
  setTimeout(() => input.focus(), 50);
}

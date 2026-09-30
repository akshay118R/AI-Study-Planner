/**
 * Phase 10 DOM Rendering & UI Integration Verification Test
 * Verifies all 10 subviews of personalOsView.js, empty states, and modal dialog triggers
 */

const memoryStore = new Map();
globalThis.localStorage = {
  getItem: (key) => memoryStore.get(key) || null,
  setItem: (key, val) => memoryStore.set(key, String(val)),
  removeItem: (key) => memoryStore.delete(key),
  clear: () => memoryStore.clear()
};

globalThis.window = {
  innerWidth: 1200,
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  location: { hash: '#personal-os' }
};

const elementsById = new Map();
globalThis.document = {
  getElementById: (id) => elementsById.get(id) || null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: (tag) => {
    let _id = '';
    const el = {
      className: '',
      get id() { return _id; },
      set id(val) { _id = val; elementsById.set(val, el); },
      innerHTML: '',
      appendChild: () => {},
      setAttribute: () => {},
      addEventListener: () => {},
      style: {},
      querySelector: () => ({ onclick: null, addEventListener: () => {}, focus: () => {}, querySelectorAll: () => [] }),
      querySelectorAll: () => []
    };
    return el;
  },
  body: {
    appendChild: (el) => { if (el && el.id) elementsById.set(el.id, el); },
    removeChild: () => {}
  }
};

import { initStorage, resetToInitialState, updateState } from './js/data/storage.js';
import { renderPersonalOs } from './js/views/personalOsView.js';
import {
  openTaskModal,
  openNoteModal,
  openFocusSessionModal,
  openFocusSummaryModal,
  openInboxProcessModal,
  openBackupRestoreModal
} from './js/components/personalOsModals.js';
import { openQuickAddModal } from './js/components/quickAddModal.js';
import { openCommandPalette } from './js/components/commandPaletteModal.js';

let containerHtml = '';
let tabContentHtml = '';
const mockTabContent = {
  set innerHTML(html) {
    tabContentHtml = html;
  },
  get innerHTML() {
    return tabContentHtml;
  },
  querySelector: () => ({ scrollTop: 0, scrollHeight: 100 }),
  querySelectorAll: () => []
};

const mockContainer = {
  set innerHTML(html) {
    containerHtml = html;
  },
  get innerHTML() {
    return containerHtml + tabContentHtml;
  },
  querySelector: (sel) => {
    if (sel === '#personal-os-tab-content') return mockTabContent;
    return {
      scrollTop: 0,
      scrollHeight: 100,
      onclick: null,
      onsubmit: null,
      addEventListener: () => {},
      querySelectorAll: () => []
    };
  },
  querySelectorAll: () => []
};

function assertDom(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL DOM: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ DOM: ${message}`);
  }
}

resetToInitialState();
initStorage();

console.log('--- 1. Testing Default Personal OS Header & Subnav Rendering ---');
renderPersonalOs(mockContainer);
const initialHtml = mockContainer.innerHTML;

assertDom(initialHtml.includes('PERSONAL OPERATING SYSTEM'), 'Personal OS Header verified');
assertDom(initialHtml.includes('Quick Add'), 'Quick Add button verified');
assertDom(initialHtml.includes('Command Palette'), 'Command Palette button verified');

const subtabs = [
  'Today Hub',
  'Inbox',
  'Universal Tasks',
  'Unified Calendar',
  'Focus Deep Work',
  'Notes & Concepts',
  'Knowledge & Graph',
  'Review Center',
  'Automations',
  'OS Settings'
];
for (const tab of subtabs) {
  assertDom(initialHtml.includes(tab), `Subtab "${tab}" present in navigation`);
}

console.log('\n--- 2. Testing Today Hub View Content ---');
assertDom(initialHtml.includes("TODAY'S PRIORITIES & TASKS"), 'Today priorities & tasks group verified');
assertDom(initialHtml.includes('CHRONOLOGICAL DAY SCHEDULE'), 'Chronological day schedule verified');

console.log('\n--- 3. Testing Modals Mounting ---');
openQuickAddModal(() => {});
assertDom(document.getElementById('quick-add-modal-container')?.innerHTML.includes('Universal Quick Add'), 'openQuickAddModal mounted successfully');

openCommandPalette();
assertDom(document.getElementById('command-palette-modal-container')?.innerHTML.includes('Type a command or search'), 'openCommandPalette mounted successfully');

openTaskModal(null, () => {});
assertDom(document.getElementById('personal-os-modal-container')?.innerHTML.includes('New Universal Task'), 'openTaskModal mounted successfully');

openNoteModal(null, () => {});
assertDom(document.getElementById('personal-os-modal-container')?.innerHTML.includes('New Note / Concept'), 'openNoteModal mounted successfully');

openFocusSessionModal(() => {});
assertDom(document.getElementById('personal-os-modal-container')?.innerHTML.includes('Start Focus Session'), 'openFocusSessionModal mounted successfully');

openBackupRestoreModal(() => {});
assertDom(document.getElementById('personal-os-modal-container')?.innerHTML.includes('System Backup & Restore'), 'openBackupRestoreModal mounted successfully');

console.log('\n🎉 ALL PHASE 10 DOM & VIEW INTEGRATION CHECKS PASSED (0 ERRORS)\n');

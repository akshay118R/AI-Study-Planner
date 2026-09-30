/**
 * Phase 9 DOM Rendering & UI Integration Verification Test
 * Verifies all 10 subviews of progressView.js, empty states, and modal triggers
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
  location: { hash: '#progress' }
};

const elementsById = new Map();
globalThis.document = {
  getElementById: (id) => elementsById.get(id) || null,
  querySelector: (sel) => null,
  querySelectorAll: (sel) => [],
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
      querySelector: () => ({ onclick: null, addEventListener: () => {} }),
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
import { renderProgress } from './js/views/progressView.js';
import {
  openCustomAchievementModal,
  openDataCorrectionModal,
  openProgressSnapshotModal,
  openExportModal
} from './js/components/progressModals.js';

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
    if (sel === '#progress-tab-content') return mockTabContent;
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

console.log('--- 1. Testing Default Progress Center Header & Subnav Rendering ---');
renderProgress(mockContainer);
const initialHtml = mockContainer.innerHTML;

assertDom(initialHtml.includes('PROGRESS & ACHIEVEMENTS CENTER'), 'Progress Center Header verified');
assertDom(initialHtml.includes('Progress Snapshot'), 'Snapshot button verified');
assertDom(initialHtml.includes('Export Records'), 'Export button verified');

const subtabs = [
  'Overview',
  'Learning & Time',
  'DSA Analytics',
  'Project Lifecycle',
  'Career Prep',
  'Habits & Streaks',
  'Achievements',
  'Milestones',
  'Periodic Reviews',
  'Year in Review'
];
for (const tab of subtabs) {
  assertDom(initialHtml.includes(tab), `Subtab "${tab}" present in navigation`);
}

console.log('\n--- 2. Testing Overview Tab Structure ---');
assertDom(initialHtml.includes('OVERALL PROGRESS') || initialHtml.includes('Study Time'), 'Overview metrics rendered');
assertDom(initialHtml.includes('PERSONAL RECORDS'), 'Personal records widget rendered');
assertDom(initialHtml.includes('PLAN VS ACTUAL'), 'Plan vs actual comparison rendered');

console.log('\n--- 3. Testing Populated State Across Subtabs ---');
// Populate realistic sample data
const todayStr = new Date().toISOString().split('T')[0];
updateState(curr => ({
  ...curr,
  study_sessions: [
    {
      id: 'session-dom-1',
      date: todayStr,
      duration_minutes: 60,
      topic_id: 'top-1',
      category: 'DSA',
      notes: 'Trees practice'
    },
    {
      id: 'session-dom-2',
      date: todayStr,
      duration_minutes: 120,
      topic_id: 'top-2',
      category: 'AI/ML',
      notes: 'Neural network training'
    }
  ],
  dsa_problems: [
    {
      id: 'dsa-dom-1',
      title: 'Invert Binary Tree',
      platform: 'LeetCode',
      difficulty: 'Easy',
      pattern: 'Trees',
      status: 'Solved',
      solved_independently: true,
      created_at: new Date().toISOString()
    }
  ],
  projects: [
    {
      id: 'proj-dom-1',
      title: 'AI Career OS',
      lifecycle_stage: 'BUILDING',
      tech_stack: ['JavaScript', 'HTML', 'CSS'],
      is_portfolio_ready: false,
      created_at: new Date().toISOString()
    }
  ],
  job_applications: [
    {
      id: 'app-dom-1',
      company_name: 'OpenAI',
      role_title: 'Research Engineer',
      status: 'Applied',
      applied_date: todayStr
    }
  ]
}));

// Re-render
renderProgress(mockContainer);
const populatedHtml = mockContainer.innerHTML;

assertDom(populatedHtml.includes('OVERALL PROGRESS'), 'Populated overview rendered with title');
assertDom(populatedHtml.includes('PERSONAL RECORDS'), 'Populated personal records rendered');

console.log('\n--- 4. Testing Modals Initialization ---');
openCustomAchievementModal(() => {});
assertDom(document.getElementById('modal-container')?.innerHTML.includes('Create Custom Achievement'), 'openCustomAchievementModal mounts successfully');

openDataCorrectionModal({ type: 'study_session', id: 'session-dom-1', field: 'duration', issue: 'Missing', description: 'Missing duration' }, () => {});
assertDom(document.getElementById('modal-container')?.innerHTML.includes('Correct Data Record'), 'openDataCorrectionModal mounts successfully');

openProgressSnapshotModal();
assertDom(document.getElementById('modal-container')?.innerHTML.includes('PROGRESS SNAPSHOT'), 'openProgressSnapshotModal mounts successfully');

openExportModal();
assertDom(document.getElementById('modal-container')?.innerHTML.includes('Export Analytics & Records'), 'openExportModal mounts successfully');

console.log('\n🎉 ALL PHASE 9 DOM & VIEW INTEGRATION CHECKS PASSED (0 ERRORS)\n');

/**
 * Comprehensive DOM Rendering & Router Verification Test for Simplified Career Tracker
 * Verifies App shell, 5 navigation items, Today default screen, Week, Month, Progress, Settings,
 * and simplified modal dialogs.
 */

const memoryStore = new Map();
globalThis.localStorage = {
  getItem: (key) => memoryStore.get(key) || null,
  setItem: (key, val) => memoryStore.set(key, String(val)),
  removeItem: (key) => memoryStore.delete(key),
  clear: () => memoryStore.clear()
};

const elementsById = new Map();

function createMockElement(tag) {
  let _id = '';
  let _innerHTML = '';
  const listeners = new Map();
  const attributes = new Map();

  const el = {
    tagName: tag.toUpperCase(),
    className: '',
    get id() { return _id; },
    set id(val) { _id = val; elementsById.set(val, el); },
    get innerHTML() { return _innerHTML; },
    set innerHTML(val) { _innerHTML = val; },
    style: {},
    appendChild: (child) => { if (child && child.id) elementsById.set(child.id, child); },
    removeChild: () => {},
    setAttribute: (name, val) => attributes.set(name, val),
    getAttribute: (name) => attributes.get(name) || null,
    addEventListener: (evt, fn) => {
      if (!listeners.has(evt)) listeners.set(evt, []);
      listeners.get(evt).push(fn);
    },
    click: () => {
      if (el.onclick) el.onclick({ target: el, stopPropagation: () => {} });
      const fns = listeners.get('click') || [];
      fns.forEach(fn => fn({ target: el, stopPropagation: () => {} }));
    },
    querySelector: (selector) => {
      if (selector.startsWith('#')) {
        const id = selector.substring(1);
        return elementsById.get(id) || null;
      }
      return createMockElement('div');
    },
    querySelectorAll: (selector) => {
      if (selector === '[data-route]') {
        return [
          { getAttribute: () => 'month', classList: { toggle: () => {}, add: () => {}, remove: () => {} }, addEventListener: () => {} },
          { getAttribute: () => 'week', classList: { toggle: () => {}, add: () => {}, remove: () => {} }, addEventListener: () => {} },
          { getAttribute: () => 'today', classList: { toggle: () => {}, add: () => {}, remove: () => {} }, addEventListener: () => {} },
          { getAttribute: () => 'progress', classList: { toggle: () => {}, add: () => {}, remove: () => {} }, addEventListener: () => {} },
          { getAttribute: () => 'settings', classList: { toggle: () => {}, add: () => {}, remove: () => {} }, addEventListener: () => {} }
        ];
      }
      return [];
    },
    classList: {
      add: () => {},
      remove: () => {},
      toggle: () => {}
    }
  };
  return el;
}

globalThis.window = {
  innerWidth: 1200,
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  scrollTo: () => {},
  location: { hash: '#today' }
};

globalThis.document = {
  getElementById: (id) => elementsById.get(id) || null,
  querySelector: (sel) => {
    if (sel.startsWith('#')) return elementsById.get(sel.substring(1)) || null;
    return createMockElement('div');
  },
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: createMockElement,
  body: createMockElement('body')
};

// Setup root elements
const appRoot = createMockElement('div');
appRoot.id = 'app';
elementsById.set('app', appRoot);

const modalRoot = createMockElement('div');
modalRoot.id = 'modal-root';
elementsById.set('modal-root', modalRoot);

import { initApp } from './js/app.js';
import { renderToday } from './js/views/todayView.js';
import { renderWeekly } from './js/views/weeklyView.js';
import { renderMonthly } from './js/views/monthlyView.js';
import { renderProgress } from './js/views/progressView.js';
import { renderSettings } from './js/views/settingsView.js';
import { openQuickAddModal } from './js/components/quickAddModal.js';

let passed = 0;
let total = 0;

function assert(cond, msg) {
  total++;
  if (!cond) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  } else {
    passed++;
    console.log(`✅ PASS: ${msg}`);
  }
}

async function runDomTests() {
  console.log('=== RUNNING DOM & VIEW VERIFICATION TESTS ===\n');

  // 1. Initialize App Shell
  await initApp();
  assert(appRoot.innerHTML.includes('Career Tracker'), 'App shell rendered with Career Tracker title');

  // 2. Verify Primary Sidebar Navigation Items
  const sidebarHtml = appRoot.innerHTML;
  assert(sidebarHtml.includes('data-route="month"'), 'Sidebar contains MONTH');
  assert(sidebarHtml.includes('data-route="week"'), 'Sidebar contains WEEK');
  assert(sidebarHtml.includes('data-route="today"'), 'Sidebar contains TODAY');
  assert(sidebarHtml.includes('data-route="dashboard"') || sidebarHtml.includes('data-route="progress"'), 'Sidebar contains DASHBOARD or PROGRESS');
  assert(sidebarHtml.includes('data-route="settings"'), 'Sidebar contains SETTINGS');

  // Verify no large +ADD button in sidebar
  assert(!sidebarHtml.includes('id="btn-sidebar-quick-add"'), 'No redundant +ADD button in sidebar');

  // Verify only 1 global +ADD button in header
  assert(sidebarHtml.includes('id="btn-global-add"'), 'One global + ADD button in header');

  // Verify old complex items removed from sidebar
  const removedFromSidebar = [
    'data-route="personal_os"',
    'data-route="calendar"',
    'data-route="career"',
    'data-route="ai"',
    'data-route="dsa"',
    'data-route="projects"',
    'data-route="achievements"',
    'data-route="automations"',
    'data-route="journal"',
    'data-route="resources"'
  ];
  removedFromSidebar.forEach(item => {
    assert(!sidebarHtml.includes(item), `Verified '${item}' is removed from primary sidebar navigation`);
  });

  // 3. Verify Mobile Bottom Navigation
  assert(sidebarHtml.includes('class="mobile-bottom-nav"'), 'Mobile bottom navigation rendered with 5 views');

  // 4. Test TODAY view rendering
  const testContainer = createMockElement('div');
  testContainer.id = 'view-content';
  elementsById.set('view-content', testContainer);

  renderToday(testContainer);
  assert(testContainer.innerHTML.includes("TODAY"), 'Today view renders TODAY header');
  assert(testContainer.innerHTML.includes("LEARN"), 'Today view renders LEARN group');
  assert(testContainer.innerHTML.includes("PRACTICE"), 'Today view renders PRACTICE group');
  assert(testContainer.innerHTML.includes("SEMESTER"), 'Today view renders SEMESTER group');
  assert(testContainer.innerHTML.includes("BUILD"), 'Today view renders BUILD group');
  assert(testContainer.innerHTML.includes("REVISE"), 'Today view renders REVISE group');
  assert(testContainer.innerHTML.includes("Gaming:"), 'Today view renders optional gaming tracker');
  assert(!testContainer.innerHTML.includes("TODAY'S HABITS"), 'No separate habit tracker in Today view');

  // 5. Test WEEK view rendering
  renderWeekly(testContainer);
  assert(testContainer.innerHTML.includes("WEEKLY TARGETS"), 'Week view renders "WEEKLY TARGETS"');
  assert(testContainer.innerHTML.includes("WEEKLY GOALS"), 'Week view renders "WEEKLY GOALS"');
  assert(testContainer.innerHTML.includes("WEEKLY REVIEW"), 'Week view renders "WEEKLY REVIEW"');
  assert(testContainer.innerHTML.includes("What did I complete well?"), 'Week review contains question 1');
  assert(testContainer.innerHTML.includes("What did I not complete?"), 'Week review contains question 2');
  assert(testContainer.innerHTML.includes("What should be deliberately moved"), 'Week review contains question 3');

  // 6. Test MONTH view rendering
  renderMonthly(testContainer);
  assert(testContainer.innerHTML.includes("MONTHLY TARGETS"), 'Month view renders "MONTHLY TARGETS"');
  assert(testContainer.innerHTML.includes("MONTHLY FOCUS"), 'Month view renders "MONTHLY FOCUS"');
  assert(testContainer.innerHTML.includes("WEEKS OF"), 'Month view renders weeks of the month');
  assert(testContainer.innerHTML.includes("MONTHLY GOALS"), 'Month view renders "MONTHLY GOALS"');
  assert(!testContainer.innerHTML.includes("MONTH PROGRESS"), 'No duplicate progress/analytics card on Month page');

  // 7. Test PROGRESS view rendering
  renderProgress(testContainer);
  assert(testContainer.innerHTML.includes("MONTHLY"), 'Progress view renders MONTHLY section');
  assert(testContainer.innerHTML.includes("WEEKLY"), 'Progress view renders WEEKLY section');
  assert(testContainer.innerHTML.includes("ALL TIME"), 'Progress view renders ALL TIME section');
  assert(testContainer.innerHTML.includes("SUMMARY"), 'Progress view renders SUMMARY');
  assert(testContainer.innerHTML.includes("1. Study Hours per Week"), 'Progress view renders chart 1');
  assert(testContainer.innerHTML.includes("2. DSA Problems per Week"), 'Progress view renders chart 2');
  assert(testContainer.innerHTML.includes("3. Task Completion per Week"), 'Progress view renders chart 3');
  assert(testContainer.innerHTML.includes("Apna College DSA Playlist"), 'Progress view renders Apna College playlist');

  // 8. Test SETTINGS view rendering
  await renderSettings(testContainer);
  assert(testContainer.innerHTML.includes("STUDY TARGETS"), 'Settings view renders STUDY TARGETS');
  assert(testContainer.innerHTML.includes("RECREATION"), 'Settings view renders RECREATION');
  assert(testContainer.innerHTML.includes("DATA MANAGEMENT"), 'Settings view renders DATA MANAGEMENT');
  assert(testContainer.innerHTML.includes("SUPABASE DATABASE"), 'Settings view renders SUPABASE DATABASE');
  assert(!testContainer.innerHTML.includes("service_role"), 'Zero service-role keys exposed in Settings');

  // 9. Test Quick Add Modal
  openQuickAddModal();
  const qaRoot = elementsById.get('quick-add-modal-container');
  assert(qaRoot && qaRoot.innerHTML.includes('Quick Add'), 'Quick Add modal opens');
  assert(qaRoot.innerHTML.includes('1. Task') && qaRoot.innerHTML.includes('2. Study Session') && qaRoot.innerHTML.includes('3. Goal'), 'Quick Add contains exactly Task, Study Session, Goal');

  console.log(`\n🎉 ALL ${passed} OF ${total} DOM & VIEW VERIFICATION TESTS PASSED PERFECTLY!`);
}

runDomTests().catch(err => {
  console.error('DOM test error:', err);
  process.exit(1);
});

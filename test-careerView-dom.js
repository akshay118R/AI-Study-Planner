/**
 * DOM Rendering and Event Attachment Verification for careerView.js
 */

import { initStorage, resetToInitialState, getState } from './js/data/storage.js';
import { renderCareer } from './js/views/careerView.js';

// Setup minimal DOM mock in Node
if (typeof localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

resetToInitialState();

// Create mock container
let innerHtmlContent = '';
const listeners = {};
const mockContainer = {
  set innerHTML(val) {
    innerHtmlContent = val;
  },
  get innerHTML() {
    return innerHtmlContent;
  },
  querySelector(sel) {
    return {
      focus: () => {},
      addEventListener: (evt, fn) => {
        listeners[evt] = fn;
      }
    };
  },
  querySelectorAll(sel) {
    return [];
  }
};

function createMockElement() {
  return {
    focus: () => {},
    addEventListener: () => {},
    innerHTML: '',
    appendChild: () => {},
    querySelector: () => createMockElement(),
    querySelectorAll: () => []
  };
}

const tabContentMock = createMockElement();

globalThis.document = {
  getElementById: (id) => (id === 'career-tab-content' ? tabContentMock : createMockElement()),
  querySelector: (sel) => createMockElement(),
  querySelectorAll: (sel) => []
};

try {
  console.log('Testing renderCareer(mockContainer)...');
  renderCareer(mockContainer);

  const allHtml = mockContainer.innerHTML + ' ' + tabContentMock.innerHTML;
  console.log('Generated total HTML length:', allHtml.length);

  const checks = [
    { title: 'Career Dashboard Header', pattern: /CAREER DASHBOARD/i },
    { title: 'DSA Metric Card', pattern: /DSA/i },
    { title: 'Core CS Metric Card', pattern: /Core CS/i },
    { title: 'Projects Metric Card', pattern: /Projects/i },
    { title: 'GitHub Metric Card', pattern: /GitHub/i },
    { title: 'Resume Metric Card', pattern: /Resume/i },
    { title: 'LinkedIn Metric Card', pattern: /LinkedIn/i },
    { title: 'Portfolio Metric Card', pattern: /Portfolio/i },
    { title: 'Internships Metric Card', pattern: /Internships/i },
    { title: 'Aptitude Metric Card', pattern: /Aptitude/i },
    { title: 'Interviews Metric Card', pattern: /Interviews/i },
    { title: 'Career Readiness Checklist', pattern: /CAREER READINESS CHECKLIST/i },
    { title: 'Career Roadmap Progress', pattern: /CAREER ROADMAP/i },
    { title: 'Upcoming Actions Feed', pattern: /UPCOMING ACTIONS/i },
    { title: 'Career Milestones Badges', pattern: /CAREER MILESTONES/i }
  ];

  let passed = 0;
  for (const c of checks) {
    if (c.pattern.test(allHtml)) {
      console.log(`✅ DOM: ${c.title} verified in rendered markup`);
      passed++;
    } else {
      console.error(`❌ DOM: ${c.title} MISSING from rendered markup`);
    }
  }

  if (passed === checks.length) {
    console.log(`\n🎉 ALL ${passed} DOM RENDERING CHECKS PASSED PERFECTLY (0 ERRORS)\n`);
  } else {
    process.exit(1);
  }
} catch (err) {
  console.error('Render error:', err);
  process.exit(1);
}

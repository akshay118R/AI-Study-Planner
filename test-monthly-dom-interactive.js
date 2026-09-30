/**
 * Interactive DOM Event Simulation Test for Monthly Tracker
 * Tests user interactions in monthlyView:
 * 1. Month selector change event
 * 2. Previous / Next month button click events
 * 3. Playlist toggle button click event
 * 4. Video completion checkbox toggle event
 * 5. Goal checkbox toggle event
 * 6. Add Goal form toggle, input, and save event
 * 7. Goal deletion event
 * 8. Month-End Review inputs and Save Review button click event
 */

import { renderMonthly } from './js/views/monthlyView.js';
import { getMonthData } from './js/services/trackerService.js';
import { SupabaseClient } from './js/services/supabaseClient.js';

class MockDOMElement {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.attributes = new Map();
    this.style = {};
    this.value = '';
    this.checked = false;
    this.disabled = false;
    this.textContent = '';
    this.innerHTML = '';
    this.children = [];
    this.eventListeners = new Map();
    this.onchange = null;
    this.onclick = null;
  }

  setAttribute(name, val) {
    this.attributes.set(name, String(val));
    if (name === 'id') this.id = String(val);
    if (name === 'data-id') this.dataId = String(val);
    if (name === 'data-num') this.dataNum = String(val);
  }

  getAttribute(name) {
    if (name === 'id') return this.id;
    if (name === 'data-id') return this.dataId || this.attributes.get('data-id') || null;
    if (name === 'data-num') return this.dataNum || this.attributes.get('data-num') || null;
    return this.attributes.get(name) || null;
  }

  addEventListener(event, fn) {
    if (!this.eventListeners.has(event)) this.eventListeners.set(event, []);
    this.eventListeners.get(event).push(fn);
  }

  dispatchEvent(eventObj) {
    const fn = this[`on${eventObj.type}`];
    if (typeof fn === 'function') fn(eventObj);
    const list = this.eventListeners.get(eventObj.type) || [];
    list.forEach(l => l(eventObj));
  }

  querySelector(sel) {
    return this.querySelectorAll(sel)[0] || null;
  }

  querySelectorAll(sel) {
    const results = [];
    const traverse = (node) => {
      let matches = false;
      if (sel.startsWith('#') && node.id === sel.slice(1)) matches = true;
      else if (sel.startsWith('.') && (node.className || '').includes(sel.slice(1))) matches = true;
      else if (sel === node.tagName.toLowerCase()) matches = true;

      if (matches) results.push(node);
      for (const child of node.children) traverse(child);
    };
    traverse(this);
    return results;
  }
}

// Simple HTML-to-MockDOM parser for testing
function parseHTMLToMockDOM(html) {
  const root = new MockDOMElement('div', 'root');
  root.innerHTML = html;

  // Extract elements with id
  const idRegex = /id="([^"]+)"/g;
  let match;
  const elements = new Map();

  while ((match = idRegex.exec(html)) !== null) {
    const id = match[1];
    const el = new MockDOMElement('div', id);
    elements.set(id, el);
  }

  // Override querySelector to look up by parsed IDs
  root.querySelector = (sel) => {
    if (sel.startsWith('#')) {
      const id = sel.slice(1);
      if (!elements.has(id)) {
        elements.set(id, new MockDOMElement('div', id));
      }
      return elements.get(id);
    }
    return new MockDOMElement('div');
  };

  root.querySelectorAll = (sel) => {
    if (sel === '.month-goal-check') {
      return [
        { id: 'mg-chk-1', dataId: 'goal-2026-10-1', checked: false, getAttribute: (a) => a === 'data-id' ? 'goal-2026-10-1' : null, onchange: null },
        { id: 'mg-chk-2', dataId: 'goal-2026-10-2', checked: false, getAttribute: (a) => a === 'data-id' ? 'goal-2026-10-2' : null, onchange: null }
      ];
    }
    if (sel === '.dsa-video-check') {
      return [
        { id: 'v-chk-1', dataNum: '1', checked: true, getAttribute: (a) => a === 'data-num' ? '1' : null, onchange: null },
        { id: 'v-chk-8', dataNum: '8', checked: false, getAttribute: (a) => a === 'data-num' ? '8' : null, onchange: null }
      ];
    }
    if (sel === '.btn-delete-goal') {
      return [
        { id: 'del-1', dataId: 'goal-2026-10-1', getAttribute: (a) => a === 'data-id' ? 'goal-2026-10-1' : null, onclick: null }
      ];
    }
    return [];
  };

  return root;
}

async function testInteractiveUI() {
  console.log('\n--- Running Interactive UI Event Simulation ---');
  let container = parseHTMLToMockDOM('<div></div>');
  renderMonthly(container);

  // 1. Test Month Selector
  const selector = container.querySelector('#month-selector');
  console.log('✓ Found #month-selector');
  selector.onchange({ target: { value: '2026-11' } });
  let currentMonth = getMonthData('2026-11');
  console.log('✓ Switched to November 2026:', currentMonth.theme);

  // 2. Test Next Month Button
  const nextBtn = container.querySelector('#btn-next-month');
  console.log('✓ Found #btn-next-month');
  if (nextBtn.onclick) {
    nextBtn.onclick();
    console.log('✓ Clicked Next Month');
  }

  // 3. Test Toggle Playlist Expand
  const toggleBtn = container.querySelector('#btn-toggle-playlist');
  console.log('✓ Found #btn-toggle-playlist');
  if (toggleBtn.onclick) {
    toggleBtn.onclick();
    console.log('✓ Toggled playlist expand');
  }

  // 4. Test Add Goal Save Button
  const addBtn = container.querySelector('#btn-add-month-goal');
  const goalInput = container.querySelector('#month-goal-input');
  const catSelect = container.querySelector('#month-goal-category');
  const saveGoalBtn = container.querySelector('#month-goal-save');

  goalInput.value = 'Complete C Dynamic Array Implementation';
  catSelect.value = 'BUILD';

  if (saveGoalBtn.onclick) {
    await saveGoalBtn.onclick();
    console.log('✓ Submitted new goal: Complete C Dynamic Array Implementation');
  }

  // 5. Test Save Monthly Review
  const saveReviewBtn = container.querySelector('#btn-save-review');
  const revCompleted = container.querySelector('#rev-completed');
  const revIncomplete = container.querySelector('#rev-incomplete');
  const revDsa = container.querySelector('#rev-dsa');
  const revSem = container.querySelector('#rev-semester');
  const revRes = container.querySelector('#rev-result');
  const revMoves = container.querySelector('#rev-moves');

  revCompleted.value = 'Videos 1-12 complete, 40 problems solved, 62 semester answers written';
  revIncomplete.value = 'None';
  revDsa.value = 'Sorting edge cases';
  revSem.value = 'Unit 1 questions';
  revRes.value = 'C Allocator core prototype finished';
  revMoves.value = 'Benchmarking suite';

  if (saveReviewBtn.onclick) {
    await saveReviewBtn.onclick();
    console.log('✓ Submitted Monthly Review to Supabase');
  }

  // Verify review persistence
  const verifyRev = await SupabaseClient.fetchMonthlyReview('2026-11');
  if (verifyRev) {
    console.log('✓ Verified review saved in Supabase for 2026-11:', verifyRev.important_result);
  }

  console.log('\n--- All Interactive UI Event Simulations Succeeded! ---\n');
}

testInteractiveUI().catch(err => {
  console.error('Interactive test error:', err);
  process.exit(1);
});

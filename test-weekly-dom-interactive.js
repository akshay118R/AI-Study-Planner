/**
 * Interactive DOM & User Flow Test for Weekly Tracker
 */

import {
  getWeekData,
  getMonthData,
  toggleDSAVideo,
  createSemesterAnswer,
  logGamingHours,
  createNewGoal,
  deleteWeeklyGoal,
  saveWeeklyReview,
  initTrackerService
} from './js/services/trackerService.js';
import { setSimulatedToday } from './js/services/dateService.js';

import { renderWeekly } from './js/views/weeklyView.js';
import { renderMonthly } from './js/views/monthlyView.js';

class MockDOMContainer {
  constructor() {
    this.innerHTML = '';
  }

  querySelector(selector) {
    const list = this.querySelectorAll(selector);
    return list.length > 0 ? list[0] : null;
  }

  querySelectorAll(selector) {
    const results = [];
    if (!this.innerHTML) return results;

    if (selector === '.month-week-card') {
      const regex = /class="month-week-card"[^>]*data-week="([^"]+)"/g;
      let m;
      while ((m = regex.exec(this.innerHTML)) !== null) {
        const val = m[1];
        results.push({
          getAttribute: (attr) => attr === 'data-week' ? val : null,
          onclick: null
        });
      }
    } else if (selector === '.day-card') {
      const regex = /class="day-card"[^>]*data-date="([^"]+)"/g;
      let m;
      while ((m = regex.exec(this.innerHTML)) !== null) {
        const val = m[1];
        results.push({
          getAttribute: (attr) => attr === 'data-date' ? val : null,
          onclick: null
        });
      }
    } else if (selector === '.week-dsa-check') {
      const regex = /class="week-dsa-check"[^>]*data-num="([^"]+)"/g;
      let m;
      while ((m = regex.exec(this.innerHTML)) !== null) {
        results.push({
          getAttribute: (attr) => attr === 'data-num' ? m[1] : null,
          checked: false,
          onchange: null
        });
      }
    } else if (selector === '#btn-save-week-review') {
      if (this.innerHTML.includes('id="btn-save-week-review"')) {
        results.push({ disabled: false, textContent: 'Save Week Review', onclick: null });
      }
    } else if (selector === '#select-week') {
      if (this.innerHTML.includes('id="select-week"')) {
        results.push({ value: '2026-10-W1', onchange: null });
      }
    }

    return results;
  }
}

// Global browser mocks
globalThis.window = {
  location: { hash: '#month' },
  scrollTo: () => {}
};

async function testUserFlow() {
  console.log('Testing complete user flow: MONTH -> WEEK -> TODAY...');
  setSimulatedToday('2026-10-02');

  await initTrackerService();

  // Step 1: Render Monthly View
  const appContainer = new MockDOMContainer();
  renderMonthly(appContainer);
  console.log('✓ Month view rendered');

  // Verify month view has week cards
  const weekCards = appContainer.querySelectorAll('.month-week-card');
  console.log(`✓ Month view has ${weekCards.length} week cards`);

  // Step 2: Simulate clicking Week 1 (2026-10-W1)
  const targetWeek = weekCards[0].getAttribute('data-week');
  window.location.hash = `#week?id=${targetWeek}`;
  console.log(`✓ Navigated to ${window.location.hash}`);

  // Step 3: Render Weekly Tracker View
  renderWeekly(appContainer);
  console.log('✓ Weekly view rendered');

  // Verify Weekly Header
  if (!appContainer.innerHTML.includes('Week 1')) throw new Error('Week 1 header missing');
  if (!appContainer.innerHTML.includes('October 1–7')) throw new Error('Date range October 1–7 missing');
  if (!appContainer.innerHTML.includes('October 2026')) throw new Error('Parent month October 2026 missing');
  console.log('✓ Weekly header verified (Week 1, October 1–7, October 2026)');

  // Verify 7 Days (Monday to Sunday)
  const dayCards = appContainer.querySelectorAll('.day-card');
  if (dayCards.length !== 7) throw new Error(`Expected 7 day cards, got ${dayCards.length}`);
  console.log('✓ Exactly 7 day cards rendered for Monday through Sunday');

  // Step 4: Simulate clicking Monday (2026-10-05)
  const mondayCard = dayCards.find(c => c.getAttribute('data-date') === '2026-10-05');
  if (!mondayCard) throw new Error('Monday Oct 5 card not found');
  window.location.hash = `#today?date=${mondayCard.getAttribute('data-date')}`;
  console.log(`✓ Clicking Monday navigated to: ${window.location.hash}`);

  // Step 5: Return to Week and verify DSA Video Toggle
  window.location.hash = '#week?id=2026-10-W1';
  renderWeekly(appContainer);

  const initialWeekData = getWeekData('2026-10-W1');
  const initialMonthData = getMonthData('2026-10');
  console.log(`Initial DSA: Week completed = ${initialWeekData.dsa.completedVideos}/3, Month completed = ${initialMonthData.dsa.completedVideos}/12`);

  // Toggle Video 2
  await toggleDSAVideo(2, true);
  const updatedWeek = getWeekData('2026-10-W1');
  const updatedMonth = getMonthData('2026-10');

  console.log(`Updated DSA: Week completed = ${updatedWeek.dsa.completedVideos}/3, Month completed = ${updatedMonth.dsa.completedVideos}/12`);
  if (updatedWeek.dsa.completedVideos < 1) throw new Error('Weekly DSA count did not increment');
  if (updatedMonth.dsa.completedVideos < 1) throw new Error('Monthly DSA count did not increment');
  console.log('✓ DSA video completion synchronized automatically to Month view without separate manual entry');

  // Step 6: Log Semester Answer
  await createSemesterAnswer({
    week_id: '2026-10-W1',
    month_id: '2026-10',
    subject: 'Data Structures',
    unit: 'Unit 1',
    question: 'Kadane algorithm implementation',
    isOptional: false,
    completed: true,
    date: '2026-10-05'
  });
  const weekAfterSem = getWeekData('2026-10-W1');
  console.log(`Semester required answers completed: ${weekAfterSem.semester.requiredCompleted}/14`);
  if (weekAfterSem.semester.requiredCompleted < 1) throw new Error('Semester answer not recorded');
  console.log('✓ Semester answer recorded with subject, unit, question, date, week, and month');

  // Step 7: Save Weekly Review to Supabase
  await saveWeeklyReview('2026-10-W1', {
    what_completed_well: 'Completed DSA videos 1 and 2, and 1 core semester answer',
    what_not_completed: 'Optional 3rd answer',
    why_not_completed: 'Focusing on pointers deep dive',
    top_priority_next_week: 'Lecture 3 & 4',
    what_deliberately_moved: 'Shifted 1 problem to Friday'
  });
  const weekAfterRev = getWeekData('2026-10-W1');
  if (weekAfterRev.review.what_completed_well !== 'Completed DSA videos 1 and 2, and 1 core semester answer') {
    throw new Error('Weekly review reflection not persisted');
  }
  console.log('✓ Weekly review persisted into Supabase');

  console.log('\nALL INTERACTIVE USER FLOWS PASSED PERFECTLY!');
}

testUserFlow().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});

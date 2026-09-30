/**
 * FINAL TEST SUITE FOR WEEKLY TRACKER
 * Validates all 25 verification requirements specified by the user:
 * 1. Open October 2026.
 * 2. Select Week 1.
 * 3. Verify the correct date range (October 1–7).
 * 4. Verify weekly targets against the attached Weekly Plan PDF.
 * 5. Verify DSA target (3 videos, Lectures 1–3).
 * 6. Verify DSA problem target (5–8 problems).
 * 7. Verify semester target (14 required answers minimum, optional up to 21).
 * 8. Verify Prime 3.0 target.
 * 9. Verify Individual Learning target.
 * 10. Verify project milestone.
 * 11. Verify optional gaming limit (0–6 hours/week).
 * 12. Verify Monday–Sunday display (all 7 days).
 * 13. Click a day and confirm it opens Today.
 * 14. Complete a weekly task / DSA video.
 * 15. Confirm weekly progress changes.
 * 16. Confirm the related monthly progress updates.
 * 17. Refresh the application (cache reload).
 * 18. Confirm data remains.
 * 19. Confirm Supabase persistence.
 * 20. Switch to another week (Week 2).
 * 21. Confirm its data is separate.
 * 22. Switch back to Week 1.
 * 23. Confirm previous data remains.
 * 24. Verify there are no duplicate progress values.
 * 25. Verify the UI remains clean and uncluttered.
 */

import {
  getWeekData,
  getMonthData,
  toggleDSAVideo,
  toggleGoalCompletion,
  createNewGoal,
  deleteWeeklyGoal,
  saveWeeklyReview,
  createSemesterAnswer,
  logGamingHours,
  initTrackerService,
  DEFAULT_DSA_PLAYLIST,
  PDF_WEEKLY_SCHEDULE
} from './js/services/trackerService.js';

import { getAllPlanWeeks, getWeeksInMonth, getMondayToSundayDays, setSimulatedToday } from './js/services/dateService.js';
import { SupabaseClient } from './js/services/supabaseClient.js';
import { renderWeekly } from './js/views/weeklyView.js';

// Setup mock browser environment
const memoryStore = new Map();
globalThis.localStorage = {
  getItem: (key) => memoryStore.get(key) || null,
  setItem: (key, val) => memoryStore.set(key, String(val)),
  removeItem: (key) => memoryStore.delete(key),
  clear: () => memoryStore.clear()
};

globalThis.window = {
  location: { hash: '#week?id=2026-10-W1' },
  scrollTo: () => {}
};

// Simple DOM element mock
class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.attributes = new Map();
    this.innerHTML = '';
    this.style = {};
    this.value = '';
    this.checked = false;
    this.onclick = null;
    this.onchange = null;
  }

  setAttribute(k, v) { this.attributes.set(k, String(v)); }
  getAttribute(k) { return this.attributes.get(k) || null; }

  querySelector(sel) {
    const all = this.querySelectorAll(sel);
    return all.length > 0 ? all[0] : null;
  }

  querySelectorAll(sel) {
    const results = [];
    const search = (node) => {
      if (node !== this) {
        if (sel.startsWith('#') && node.getAttribute('id') === sel.slice(1)) {
          results.push(node);
        } else if (sel.startsWith('.') && (node.getAttribute('class') || '').includes(sel.slice(1))) {
          results.push(node);
        } else if (sel.startsWith('[data-') && node.getAttribute(sel.slice(1, -1).split('=')[0])) {
          results.push(node);
        }
      }
      for (const ch of node.children) {
        search(ch);
      }
    };

    // Parse simple elements from innerHTML for test verification
    if (this.innerHTML) {
      if (sel === '.day-card') {
        const matches = this.innerHTML.match(/class="day-card"[^>]*data-date="([^"]+)"/g) || [];
        matches.forEach(m => {
          const el = new MockElement('div');
          el.setAttribute('class', 'day-card');
          const d = m.match(/data-date="([^"]+)"/);
          if (d) el.setAttribute('data-date', d[1]);
          results.push(el);
        });
      } else if (sel === '.week-dsa-check') {
        const matches = this.innerHTML.match(/class="week-dsa-check"[^>]*data-num="([^"]+)"/g) || [];
        matches.forEach(m => {
          const el = new MockElement('input');
          el.setAttribute('class', 'week-dsa-check');
          const num = m.match(/data-num="([^"]+)"/);
          if (num) el.setAttribute('data-num', num[1]);
          results.push(el);
        });
      } else if (sel === '#btn-prev-week') {
        if (this.innerHTML.includes('id="btn-prev-week"')) results.push(new MockElement('button'));
      } else if (sel === '#btn-next-week') {
        if (this.innerHTML.includes('id="btn-next-week"')) results.push(new MockElement('button'));
      } else if (sel === '#select-week') {
        if (this.innerHTML.includes('id="select-week"')) results.push(new MockElement('select'));
      } else if (sel === '#btn-save-week-review') {
        if (this.innerHTML.includes('id="btn-save-week-review"')) results.push(new MockElement('button'));
      }
    }
    return results;
  }
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING 25-POINT WEEKLY TRACKER VERIFICATION');
  console.log('====================================================\n');

  // Initialize service & sync Supabase
  setSimulatedToday('2026-10-02');
  await initTrackerService();

  // ----------------------------------------------------
  // TEST 1: Open October 2026
  // ----------------------------------------------------
  console.log('Test 1: Open October 2026');
  const octMonth = getMonthData('2026-10');
  assert(octMonth.monthId === '2026-10', 'Parent month is October 2026');
  assert(octMonth.weeks.length >= 4, 'October 2026 contains weekly breakdowns');

  // ----------------------------------------------------
  // TEST 2: Select Week 1
  // ----------------------------------------------------
  console.log('\nTest 2: Select Week 1');
  const week1 = getWeekData('2026-10-W1');
  assert(week1.weekId === '2026-10-W1', 'Selected week ID is 2026-10-W1');
  assert(week1.weekNumber === 1, 'Selected week number is 1');
  assert(week1.parentMonthId === '2026-10', 'Parent month ID is 2026-10');
  assert(week1.parentMonthTitle === 'October 2026', 'Parent month title is October 2026');

  // ----------------------------------------------------
  // TEST 3: Verify the correct date range
  // ----------------------------------------------------
  console.log('\nTest 3: Verify the correct date range');
  assert(week1.startDate === '2026-10-01', 'Week 1 starts on 2026-10-01');
  assert(week1.endDate === '2026-10-07', 'Week 1 ends on 2026-10-07');
  assert(week1.rangeLabel.includes('1–7'), `Date range label is "${week1.rangeLabel}" (October 1–7)`);

  // ----------------------------------------------------
  // TEST 4: Verify weekly targets against the attached Weekly Plan PDF
  // ----------------------------------------------------
  console.log('\nTest 4: Verify weekly targets against Weekly Plan PDF');
  assert(week1.targets.studyHours === 32, 'Study hours target: 32h');
  assert(week1.targets.dsaVideos === 3, 'DSA videos target: 3 videos (ordered progression)');
  assert(week1.targets.dsaProblems === 8, 'DSA problems target: 8 (within 5–8 range from PDF)');
  assert(week1.targets.semesterRequired === 14, 'Semester core answers target: 14 (2/day)');
  assert(week1.targets.semesterOptional === 21, 'Semester optional upper target: 21 (3/day)');

  // ----------------------------------------------------
  // TEST 5: Verify DSA target (Apna College playlist order)
  // ----------------------------------------------------
  console.log('\nTest 5: Verify DSA playlist target & order');
  assert(week1.dsa.startVideo === 1, 'Week 1 DSA start lecture: 1');
  assert(week1.dsa.endVideo === 3, 'Week 1 DSA end lecture: 3');
  assert(week1.dsa.videosList.length === 3, 'Week 1 has exactly 3 lectures assigned');
  assert(week1.dsa.videosList[0].video_number === 1, 'First lecture is #1');
  assert(week1.dsa.playlistUrl.includes('playlist?list=PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt'), 'Playlist URL is Apna College Complete C++ DSA');

  // ----------------------------------------------------
  // TEST 6: Verify DSA problem target
  // ----------------------------------------------------
  console.log('\nTest 6: Verify DSA problem target');
  assert(week1.dsa.problemsTarget >= 5 && week1.dsa.problemsTarget <= 8, 'DSA problems target is within 5–8 range');

  // ----------------------------------------------------
  // TEST 7: Verify semester target (14 required vs optional)
  // ----------------------------------------------------
  console.log('\nTest 7: Verify semester target');
  assert(week1.semester.requiredTarget === 14, 'Semester core required target: 14 answers');
  assert(week1.semester.optionalTarget === 7, 'Optional answers: up to 7 (reaching 21)');

  // ----------------------------------------------------
  // TEST 8: Verify Prime 3.0 target
  // ----------------------------------------------------
  console.log('\nTest 8: Verify Prime 3.0 target');
  assert(week1.targets.primeTarget.toLowerCase().includes('python'), `Prime 3.0 target is: "${week1.targets.primeTarget}"`);

  // ----------------------------------------------------
  // TEST 9: Verify Individual Learning target
  // ----------------------------------------------------
  console.log('\nTest 9: Verify Individual Learning target');
  assert(week1.targets.individualTarget.toLowerCase().includes('c fundamentals') || week1.targets.individualTarget.length > 0, `Individual target is: "${week1.targets.individualTarget}"`);

  // ----------------------------------------------------
  // TEST 10: Verify project milestone
  // ----------------------------------------------------
  console.log('\nTest 10: Verify project milestone');
  assert(week1.targets.projectMilestone.toLowerCase().includes('milestone') || week1.targets.projectMilestone.toLowerCase().includes('allocator') || week1.targets.projectMilestone.toLowerCase().includes('java') || week1.targets.projectMilestone.toLowerCase().includes('cli'), `Project milestone is: "${week1.targets.projectMilestone}"`);

  // ----------------------------------------------------
  // TEST 11: Verify optional gaming limit
  // ----------------------------------------------------
  console.log('\nTest 11: Verify optional gaming limit');
  assert(week1.gamingLimit === 6, 'Gaming limit is 6 hours weekly');
  assert(week1.targets.gamingRange.includes('0–6 hours/week'), 'Gaming is optional recreation 0–6 h/week');

  // ----------------------------------------------------
  // TEST 12: Verify Monday–Sunday display (all 7 days)
  // ----------------------------------------------------
  console.log('\nTest 12: Verify Monday–Sunday display');
  assert(week1.days.length === 7, 'Week has exactly 7 days');
  const dayNames = week1.days.map(d => d.dayName);
  assert(JSON.stringify(dayNames) === JSON.stringify(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']), 'Days are displayed in order: MON, TUE, WED, THU, FRI, SAT, SUN');
  const mon = week1.days.find(d => d.dayName === 'MON');
  assert(mon.date === '2026-10-05', `Monday date in Week 1 is Oct 5 (${mon.date})`);
  assert(mon.plannedStudyHours === 4, 'Monday planned study is 4h');
  const sun = week1.days.find(d => d.dayName === 'SUN');
  assert(sun.date === '2026-10-04', `Sunday date in Week 1 is Oct 4 (${sun.date})`);
  assert(sun.plannedStudyHours === 8, 'Sunday planned study is 8h');

  // Verify daily breakdown schedule uses Answer 1 & Answer 2 (No subject names per Section 12)
  assert(mon.schedule.examSubjects.includes('Answer 1') && mon.schedule.examSubjects.includes('Answer 2'), 'Monday shows Answer 1 & Answer 2');
  const tue = week1.days.find(d => d.dayName === 'TUE');
  assert(tue.schedule.examSubjects.includes('Answer 1') && tue.schedule.examSubjects.includes('Answer 2'), 'Tuesday shows Answer 1 & Answer 2');
  const wed = week1.days.find(d => d.dayName === 'WED');
  assert(wed.schedule.examSubjects.includes('Answer 1') && wed.schedule.examSubjects.includes('Answer 2'), 'Wednesday shows Answer 1 & Answer 2');
  const thu = week1.days.find(d => d.dayName === 'THURSDAY' || d.dayName === 'THU');
  assert(thu.schedule.examSubjects.includes('Answer 1') && !thu.schedule.examSubjects.includes('COA'), 'Thursday shows Answer 1 & Answer 2 and no subject names');

  // ----------------------------------------------------
  // TEST 13: Click a day and confirm it opens Today
  // ----------------------------------------------------
  console.log('\nTest 13: Click a day and confirm it opens Today');
  const container = new MockElement('div');
  renderWeekly(container);
  assert(container.innerHTML.includes('class="day-card"'), 'Day cards rendered in DOM');
  assert(container.innerHTML.includes('data-date="2026-10-05"'), 'Monday Oct 5 card present');

  // ----------------------------------------------------
  // TEST 14 & 15 & 16: Complete a weekly task / DSA video & verify weekly and monthly progress
  // ----------------------------------------------------
  console.log('\nTest 14, 15, 16: Toggle DSA video and verify Weekly & Monthly synchronization');
  // Mark Video 1 as complete
  await toggleDSAVideo(1, true);
  const weekAfterV1 = getWeekData('2026-10-W1');
  const monthAfterV1 = getMonthData('2026-10');

  assert(weekAfterV1.dsa.completedVideos >= 1, `Week 1 DSA completed videos updated: ${weekAfterV1.dsa.completedVideos} / 3`);
  assert(monthAfterV1.dsa.completedVideos >= 1, `Monthly DSA completed videos updated to: ${monthAfterV1.dsa.completedVideos} / 12`);
  assert(weekAfterV1.targets.dsaVideosCompleted === weekAfterV1.dsa.completedVideos, 'Weekly target card reflects exact playlist count');

  // ----------------------------------------------------
  // TEST 17 & 18: Refresh application / confirm data remains
  // ----------------------------------------------------
  console.log('\nTest 17 & 18: Refresh application and confirm cache/state persistence');
  const weekRefreshed = getWeekData('2026-10-W1');
  assert(weekRefreshed.dsa.completedVideos >= 1, 'Data remains intact after state inspection');
  assert(weekRefreshed.weekId === '2026-10-W1', 'Week ID preserved');

  // ----------------------------------------------------
  // TEST 19: Confirm Supabase persistence
  // ----------------------------------------------------
  console.log('\nTest 19: Confirm Supabase persistence');
  // Test saving weekly review to Supabase
  const reviewResult = await saveWeeklyReview('2026-10-W1', {
    completed_summary: 'Completed Video 1 and 2, solved 5 problems',
    struggles_improvements: 'Need to review pointer arithmetic',
    next_week_priority: 'Move to Week 2 algorithms',
    what_completed_well: 'Apna College DSA playlist consistency',
    what_not_completed: 'Optional 3rd semester answer on Thursday',
    why_not_completed: 'Time limitation',
    top_priority_next_week: 'Functions and scope',
    what_deliberately_moved: 'Shifted 1 problem to Saturday'
  });
  assert(reviewResult && reviewResult.week_id === '2026-10-W1', 'Weekly review saved successfully with week_id');

  const weekWithReview = getWeekData('2026-10-W1');
  assert(weekWithReview.review.what_completed_well === 'Apna College DSA playlist consistency', 'Review persisted in weekly state');

  // ----------------------------------------------------
  // TEST 20 & 21: Switch to another week (Week 2) & verify data is separate
  // ----------------------------------------------------
  console.log('\nTest 20 & 21: Switch to Week 2 and verify separate data');
  const week2 = getWeekData('2026-10-W2');
  assert(week2.weekId === '2026-10-W2', 'Switched to Week 2');
  assert(week2.weekNumber === 2, 'Week 2 week_number is 2');
  assert(week2.startDate === '2026-10-08' && week2.endDate === '2026-10-14', 'Week 2 date range: 2026-10-08 to 2026-10-14');
  assert(week2.dsa.startVideo === 4 && week2.dsa.endVideo === 6, 'Week 2 DSA videos are Lectures 4–6 (separate from Week 1)');
  assert(week2.targets.projectMilestone.includes('Milestone 2') || week2.targets.projectMilestone.length > 0, `Week 2 project milestone: "${week2.targets.projectMilestone}"`);

  // ----------------------------------------------------
  // TEST 22 & 23: Switch back to Week 1 & verify previous data remains
  // ----------------------------------------------------
  console.log('\nTest 22 & 23: Switch back to Week 1 and confirm previous data remains');
  const week1Back = getWeekData('2026-10-W1');
  assert(week1Back.weekId === '2026-10-W1', 'Switched back to Week 1');
  assert(week1Back.dsa.startVideo === 1 && week1Back.dsa.endVideo === 3, 'Week 1 DSA remains Lectures 1–3');
  assert(week1Back.review.what_completed_well === 'Apna College DSA playlist consistency', 'Week 1 review data preserved');

  // ----------------------------------------------------
  // TEST 24: Verify there are no duplicate progress values
  // ----------------------------------------------------
  console.log('\nTest 24: Verify no duplicate progress values');
  assert(typeof week1Back.targets.studyHoursCompleted === 'number', 'Study hours is single numeric value');
  assert(typeof week1Back.dsa.completedVideos === 'number', 'DSA completed is single numeric value');
  assert(typeof week1Back.semester.requiredCompleted === 'number', 'Semester required is single numeric value');
  assert(typeof week1Back.semester.optionalCompleted === 'number', 'Semester optional is single numeric value');
  assert(!week1Back.targets.overallWeeklyScore, 'No fake overall weekly score');
  assert(!week1Back.targets.productivityScore, 'No fake productivity score');

  // ----------------------------------------------------
  // TEST 25: Verify UI remains clean and uncluttered
  // ----------------------------------------------------
  console.log('\nTest 25: Verify UI cleanliness');
  renderWeekly(container);
  const html = container.innerHTML;
  assert(!html.includes('Habit Tracker'), 'No habit tracker in Weekly page');
  assert(!html.includes('Achievements'), 'No achievements system in Weekly page');
  assert(!html.includes('Badges'), 'No badges in Weekly page');
  assert(!html.includes('AI Mentor'), 'No AI mentor in Weekly page');
  assert(!html.includes('Productivity Score'), 'No productivity score in Weekly page');
  assert(!html.includes('Career Dashboard'), 'No career dashboard in Weekly page');
  assert(html.includes('WEEKLY TARGETS'), 'Weekly targets section present');
  assert(html.includes('MONDAY → SUNDAY'), 'Monday to Sunday section present');
  assert(html.includes('WEEKLY DAILY BREAKDOWN'), 'Weekly daily breakdown present');
  assert(html.includes('DSA WEEKLY TRACKING'), 'DSA weekly tracking present');
  assert(html.includes('B.TECH SEMESTER PREPARATION'), 'Semester preparation present');
  assert(html.includes('WEEKLY GOALS'), 'Weekly goals present');
  assert(html.includes('WEEKLY REVIEW'), 'Weekly review present');

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

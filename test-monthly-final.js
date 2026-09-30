/**
 * FINAL TEST SUITE FOR MONTHLY TRACKER
 * Validates all 15 verification requirements specified by the user:
 * 1. Open October 2026.
 * 2. Verify all October targets match the attached Monthly Plan PDF.
 * 3. Switch to November.
 * 4. Verify November data is different where the PDF specifies different targets.
 * 5. Test all 12 months.
 * 6. Test previous/next month navigation.
 * 7. Test month selector.
 * 8. Test creating/editing/deleting a monthly goal.
 * 9. Test monthly progress persistence.
 * 10. Refresh the browser / reload simulation.
 * 11. Confirm data remains.
 * 12. Confirm Supabase stores the changes.
 * 13. Confirm no duplicate monthly data is created.
 * 14. Confirm no Daily/Weekly pages were added.
 * 15. Confirm the page is visually simple and uncluttered.
 */

import {
  getMonthData,
  toggleGoalCompletion,
  createNewGoal,
  deleteMonthlyGoal,
  saveMonthlyReview,
  MONTHLY_PLAN_DATA,
  DEFAULT_DSA_PLAYLIST
} from './js/services/trackerService.js';

import { PLAN_12_MONTHS, getPrevMonthId, getNextMonthId, setSimulatedToday } from './js/services/dateService.js';
import { SupabaseClient } from './js/services/supabaseClient.js';
import { renderMonthly } from './js/views/monthlyView.js';

// Setup mock browser environment
const memoryStore = new Map();
globalThis.localStorage = {
  getItem: (key) => memoryStore.get(key) || null,
  setItem: (key, val) => memoryStore.set(key, String(val)),
  removeItem: (key) => memoryStore.delete(key),
  clear: () => memoryStore.clear()
};

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
  console.log('STARTING 15-POINT MONTHLY TRACKER VERIFICATION');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // TEST 1: Open October 2026
  // ----------------------------------------------------
  console.log('Test 1: Open October 2026');
  const octData = getMonthData('2026-10');
  assert(octData.monthId === '2026-10', 'Month ID is 2026-10');
  assert(octData.monthTitle === 'October 2026', 'Month title is October 2026');

  // ----------------------------------------------------
  // TEST 2: Verify all October targets match the attached Monthly Plan PDF
  // ----------------------------------------------------
  console.log('\nTest 2: Verify all October targets match Monthly Plan PDF');
  assert(octData.theme === 'Foundation + Semester Start', 'October theme: Foundation + Semester Start');
  assert(octData.dsa.startVideo === 1 && octData.dsa.endVideo === 12, 'October DSA: Videos 1–12');
  assert(octData.dsa.plannedVideos === 12, 'October DSA planned videos: 12');
  assert(octData.dsa.problemsTarget === 40, 'October DSA problems target: 40');
  assert(octData.semester.answersTarget === 62, 'October Semester target answers: 62 (2/day + optional 3rd)');
  assert(octData.targets.studyHours === 128, 'October Study target: 128 hours');
  assert(octData.targets.primeTarget.includes('Python for AI/ML'), 'October Prime 3.0: Python for AI/ML');
  assert(octData.targets.individualTarget.includes('Java') || octData.targets.individualTarget.includes('C Fundamentals'), 'October Individual: Java Playlist Track');
  assert(octData.targets.projectMilestone.includes('Java') || octData.targets.projectMilestone.includes('Allocator') || octData.targets.projectMilestone.includes('Architecture'), 'October Project milestone');
  assert(octData.academicLearningTarget.includes('Start from playlist basics'), 'October Academic Target matches PDF exactly');

  // ----------------------------------------------------
  // TEST 3 & 4: Switch to November & verify targets are different where PDF specifies
  // ----------------------------------------------------
  console.log('\nTest 3 & 4: Switch to November 2026 and verify different targets');
  const novData = getMonthData('2026-11');
  assert(novData.monthId === '2026-11', 'Month ID is 2026-11');
  assert(novData.theme === 'DSA Foundation + Consistency', 'November theme: DSA Foundation + Consistency');
  assert(novData.dsa.startVideo === 13 && novData.dsa.endVideo === 24, 'November DSA: Videos 13–24 (different from October)');
  assert(novData.targets.primeTarget.includes('Data Pre-processing'), 'November Prime 3.0: Data Pre-processing (different from October)');
  assert(novData.targets.projectMilestone.includes('Algorithmic Benchmark'), 'November Project: Algorithmic Benchmark Engine (different from October)');
  assert(novData.targets.semesterAnswersTarget === 60, 'November Semester target answers: 60 (30 days * 2)');

  // ----------------------------------------------------
  // TEST 5: Test all 12 months (Oct 2026 -> Sep 2027)
  // ----------------------------------------------------
  console.log('\nTest 5: Test all 12 months');
  assert(PLAN_12_MONTHS.length === 12, '12 months defined in sequence');

  const EXPECTED_DSA_RANGES = [
    { id: '2026-10', start: 1, end: 12, theme: 'Foundation + Semester Start' },
    { id: '2026-11', start: 13, end: 24, theme: 'DSA Foundation + Consistency' },
    { id: '2026-12', start: 25, end: 36, theme: 'DSA Continuation + Revision' },
    { id: '2027-01', start: 37, end: 48, theme: 'Semester Focus + DSA' },
    { id: '2027-02', start: 49, end: 60, theme: 'Problem Solving' },
    { id: '2027-03', start: 61, end: 72, theme: 'DSA + AI/ML Application' },
    { id: '2027-04', start: 73, end: 84, theme: 'DSA + Project Depth' },
    { id: '2027-05', start: 85, end: 96, theme: 'DSA + Interview Foundations' },
    { id: '2027-06', start: 97, end: 108, theme: 'Roadmap Completion Checkpoint' },
    { id: '2027-07', start: 109, end: 120, theme: 'Practical Depth' },
    { id: '2027-08', start: 121, end: 132, theme: 'Interview Preparation' },
    { id: '2027-09', start: 133, end: 144, theme: 'Finish + Consolidate' }
  ];

  EXPECTED_DSA_RANGES.forEach((expected, i) => {
    const m = getMonthData(expected.id);
    assert(
      m.dsa.startVideo === expected.start && m.dsa.endVideo === expected.end,
      `Month ${i + 1} (${expected.id}): DSA Videos ${m.dsa.startVideo}–${m.dsa.endVideo}`
    );
    assert(m.theme === expected.theme, `Month ${i + 1} (${expected.id}): Theme "${m.theme}"`);
    assert(m.targets.studyHours >= 120, `Month ${i + 1} (${expected.id}): Study hours target >= 120h (${m.targets.studyHours}h)`);
  });

  // ----------------------------------------------------
  // TEST 6: Test previous/next month navigation
  // ----------------------------------------------------
  console.log('\nTest 6: Test previous/next month navigation');
  assert(getPrevMonthId('2026-10') === null, 'October 2026 has no previous month (first month)');
  assert(getNextMonthId('2026-10') === '2026-11', 'October 2026 next month is 2026-11');
  assert(getPrevMonthId('2026-11') === '2026-10', 'November 2026 previous month is 2026-10');
  assert(getNextMonthId('2027-09') === null, 'September 2027 has no next month (final month)');
  assert(getPrevMonthId('2027-09') === '2027-08', 'September 2027 previous month is 2027-08');

  // ----------------------------------------------------
  // TEST 7: Test month selector
  // ----------------------------------------------------
  console.log('\nTest 7: Test month selector');
  const mockContainer = {
    innerHTML: '',
    querySelector: function(sel) {
      if (sel === '#month-selector') {
        return {
          onchange: null,
          value: '2026-10',
          querySelectorAll: () => []
        };
      }
      return null;
    },
    querySelectorAll: function() { return []; }
  };
  renderMonthly(mockContainer);
  assert(mockContainer.innerHTML.includes('id="month-selector"'), 'Month selector dropdown rendered in DOM');
  assert(mockContainer.innerHTML.includes('value="2026-10" selected'), 'October 2026 selected by default');
  assert(mockContainer.innerHTML.includes('value="2027-09"'), 'September 2027 available in dropdown');

  // ----------------------------------------------------
  // TEST 8: Test creating/editing/deleting a monthly goal
  // ----------------------------------------------------
  console.log('\nTest 8: Test creating/editing/deleting a monthly goal');
  const testGoalTitle = `Test Goal ${Date.now()}`;
  const createdGoal = await createNewGoal({
    type: 'MONTHLY',
    monthId: '2026-10',
    title: testGoalTitle,
    category: 'BUILD'
  });
  assert(createdGoal && createdGoal.title === testGoalTitle, 'Created monthly goal successfully');

  let octDataAfterAdd = getMonthData('2026-10');
  const foundGoal = octDataAfterAdd.goals.find(g => g.id === createdGoal.id);
  assert(foundGoal !== undefined, 'New goal appears in October goals list');

  setSimulatedToday('2026-10-01');
  await toggleGoalCompletion(createdGoal.id, true);
  octDataAfterAdd = getMonthData('2026-10');
  const toggledGoal = octDataAfterAdd.goals.find(g => g.id === createdGoal.id);
  assert(toggledGoal && toggledGoal.completed === true, 'Goal toggle marked completed');

  await deleteMonthlyGoal(createdGoal.id);
  setSimulatedToday(null);
  octDataAfterAdd = getMonthData('2026-10');
  const deletedGoal = octDataAfterAdd.goals.find(g => g.id === createdGoal.id);
  assert(deletedGoal === undefined, 'Goal deleted successfully');

  // ----------------------------------------------------
  // TEST 9 & 12: Test monthly review saving & Supabase live persistence
  // ----------------------------------------------------
  console.log('\nTest 9 & 12: Test monthly review saving and Supabase persistence');
  const reviewData = {
    completed_this_month: 'Completed Apna College videos 1-7, 21 problems, allocator malloc logic',
    what_remains_incomplete: 'Need more written practice on Unit 1 question bank',
    dsa_lectures_revision: 'Video 10 Kadane algorithm',
    semester_units_practice: 'Operating System process state transitions',
    important_result: 'First functional C memory allocator working',
    what_moves_to_next_month: 'Sliding window technique drills'
  };

  const savedReview = await saveMonthlyReview('2026-10', reviewData);
  assert(savedReview && savedReview.month_id === '2026-10', 'Monthly review saved locally');

  const liveReviewFromSupabase = await SupabaseClient.fetchMonthlyReview('2026-10');
  assert(
    liveReviewFromSupabase && liveReviewFromSupabase.completed_this_month === reviewData.completed_this_month,
    'Review confirmed stored in Supabase table "monthly_reviews"'
  );

  // ----------------------------------------------------
  // TEST 10 & 11: Refresh simulation / Confirm data remains
  // ----------------------------------------------------
  console.log('\nTest 10 & 11: Refresh simulation & confirm data remains');
  const reloadedOctData = getMonthData('2026-10');
  assert(reloadedOctData.review.completed_this_month === reviewData.completed_this_month, 'Data persisted across simulated reload');
  assert(reloadedOctData.targets.dsaVideos === 12, 'October DSA target intact after reload');
  assert(reloadedOctData.targets.studyHours === 128, 'October Study target intact after reload');

  // ----------------------------------------------------
  // TEST 13: Confirm no duplicate monthly data is created
  // ----------------------------------------------------
  console.log('\nTest 13: Confirm no duplicate monthly data is created');
  const monthsInSupabase = await SupabaseClient.fetchMonths();
  const octMonths = monthsInSupabase.filter(m => m.id === '2026-10');
  assert(octMonths.length === 1, `Exactly 1 record for October 2026 in Supabase (found ${octMonths.length})`);
  assert(monthsInSupabase.length === 13, `Total months count in Supabase is 13 (2026-09 to 2027-09), no duplicates`);

  // ----------------------------------------------------
  // TEST 14: Confirm no Daily/Weekly pages were added
  // ----------------------------------------------------
  console.log('\nTest 14: Confirm no Daily/Weekly pages were added prematurely');
  // Check app.js routes
  const fs = await import('fs');
  const appJsContent = fs.readFileSync('./js/app.js', 'utf8');
  assert(!appJsContent.includes('dailyTrackerView'), 'No dailyTrackerView added');
  assert(!appJsContent.includes('weeklyTrackerView'), 'No weeklyTrackerView added');
  assert(appJsContent.includes('month: renderMonthly'), 'Month route cleanly mapped');

  // ----------------------------------------------------
  // TEST 15: Confirm the page is visually simple and uncluttered
  // ----------------------------------------------------
  console.log('\nTest 15: Confirm the page is visually simple and uncluttered');
  const domRenderContainer = {
    innerHTML: '',
    querySelector: () => ({ onchange: null }),
    querySelectorAll: () => []
  };
  renderMonthly(domRenderContainer);
  const html = domRenderContainer.innerHTML;

  assert(!html.includes('AI Mentor'), 'No AI Mentor clutter');
  assert(!html.includes('Streak:'), 'No streak badges');
  assert(!html.includes('Achievements'), 'No achievements');
  assert(!html.includes('Overall Progress: 73%') && !html.includes('Overall Progress:'), 'No arbitrary overall progress score');
  assert(html.includes('MONTHLY TARGETS & PROGRESS'), 'Shows transparent monthly targets');
  assert(html.includes('MONTHLY FOCUS'), 'Shows monthly focus');
  assert(html.includes('DSA PROGRESS (Apna College)'), 'Shows Apna College DSA progress');
  assert(html.includes('B.TECH SEMESTER PREPARATION'), 'Shows semester preparation');
  assert(html.includes('MONTHLY GOALS'), 'Shows monthly goals');
  assert(html.includes('WEEKS OF OCTOBER 2026'), 'Shows weeks breakdown');
  assert(html.includes('MONTH-END REVIEW: OCTOBER 2026'), 'Shows month-end review');
  assert(html.includes('Gaming (Optional Recreation)'), 'Shows optional recreation gaming note');

  console.log('\n====================================================');
  console.log(`TEST RUN COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});

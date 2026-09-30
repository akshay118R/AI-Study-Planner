/**
 * test-learning-plan-prime.js
 * Verification Test Suite for Learning Plan Updates & Prime 3.0 Tracking
 */

import {
  PROGRAM_START_DATE,
  getCanonicalToday,
  setSimulatedToday,
  isProgramStarted
} from './js/services/dateService.js';

import {
  getState,
  updateState,
  saveState,
  resetToInitialState
} from './js/data/storage.js';

import {
  getTodayData,
  getWeekData,
  getMonthData,
  getDashboardData,
  getNeedsReviewTasks,
  toggleTaskCompletion,
  DSA_PLAYLIST_URL,
  isLegacyCTask
} from './js/services/trackerService.js';

import {
  isPrimeReleaseDay,
  getPrimePartForReleaseDate,
  getPrimePartsForMonth
} from './js/data/primeData.js';

import {
  JAVA_FUNDAMENTALS_TOPICS,
  getJavaTopicForDate
} from './js/data/javaData.js';

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedCount++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('LEARNING PLAN & PRIME 3.0 TRACKING VERIFICATION SUITE');
  console.log('================================================================\n');

  // Reset to initial clean state
  resetToInitialState();

  // ----------------------------------------------------------------
  // TEST 1: Prime Part Release on Friday
  // ----------------------------------------------------------------
  console.log('TEST 1: Prime Part Release on Friday (2026-10-02)');
  const oct2IsRelease = isPrimeReleaseDay('2026-10-02');
  assert(oct2IsRelease === true, '2026-10-02 (Friday) is recognized as a Prime release day');
  
  const primePartOct2 = getPrimePartForReleaseDate('2026-10-02');
  assert(primePartOct2 !== null && primePartOct2.part_number === 1, `2026-10-02 releases Part 1 (${primePartOct2?.title})`);

  const oct2Data = getTodayData('2026-10-02');
  const primeOct2Task = (oct2Data.tasks.LEARN || []).find(t => t.is_prime_part || t.subtype === 'PRIME_3');
  assert(primeOct2Task !== undefined, 'getTodayData seeds a Prime 3.0 Part task on Friday 2026-10-02');
  assert(primeOct2Task?.part_number === 1, 'Prime task on Friday is Part 1');
  assert(primeOct2Task?.id === 'task-prime-part-1', 'Prime task has expected ID task-prime-part-1');
  assert(primeOct2Task?.date === '2026-10-02', 'Task date matches Friday release date 2026-10-02');
  assert(primeOct2Task?.release_date === '2026-10-02', 'Task release_date matches Friday 2026-10-02');

  // ----------------------------------------------------------------
  // TEST 2: Prime Part Release on Saturday
  // ----------------------------------------------------------------
  console.log('\nTEST 2: Prime Part Release on Saturday (2026-10-03)');
  const oct3IsRelease = isPrimeReleaseDay('2026-10-03');
  assert(oct3IsRelease === true, '2026-10-03 (Saturday) is recognized as a Prime release day');
  
  const primePartOct3 = getPrimePartForReleaseDate('2026-10-03');
  assert(primePartOct3 !== null && primePartOct3.part_number === 2, `2026-10-03 releases Part 2 (${primePartOct3?.title})`);

  const oct3Data = getTodayData('2026-10-03');
  const primeOct3Task = (oct3Data.tasks.LEARN || []).find(t => t.is_prime_part || t.subtype === 'PRIME_3');
  assert(primeOct3Task !== undefined, 'getTodayData seeds a Prime 3.0 Part task on Saturday 2026-10-03');
  assert(primeOct3Task?.part_number === 2, 'Prime task on Saturday is Part 2');

  // ----------------------------------------------------------------
  // TEST 3: Future Prime Part Cannot Be Completed Before Release Date
  // ----------------------------------------------------------------
  console.log('\nTEST 3: Future Prime Part Guard');
  // Simulate today as Thursday Oct 1 (program start date)
  setSimulatedToday('2026-10-01');
  
  // Ensure Friday task exists in state
  getTodayData('2026-10-02');
  
  // Attempt to toggle Friday's Prime task completion on Thursday (before Oct 2)
  const earlyCompleteResult = await toggleTaskCompletion('task-prime-part-1', true);
  assert(earlyCompleteResult === false, 'Cannot complete Friday Prime Part on Thursday before release date');
  
  const stateAfterEarlyAttempt = getState();
  const earlyTask = (stateAfterEarlyAttempt.remote_tasks || []).find(t => t.id === 'task-prime-part-1');
  assert(earlyTask?.completed === false, 'Friday Prime Part remains uncompleted');

  // ----------------------------------------------------------------
  // TEST 4: Completing a Friday Part on Friday
  // ----------------------------------------------------------------
  console.log('\nTEST 4: Completing Friday Part on Friday (Release Day)');
  setSimulatedToday('2026-10-02');
  const completeOnFridayResult = await toggleTaskCompletion('task-prime-part-1', true);
  assert(completeOnFridayResult !== false, 'Completion succeeds on Friday release date');
  
  let state = getState();
  let fridayCompletedTask = (state.remote_tasks || []).find(t => t.id === 'task-prime-part-1');
  assert(fridayCompletedTask?.completed === true, 'Task completed flag is true');
  assert(fridayCompletedTask?.completion_date === '2026-10-02', 'Task completion_date records 2026-10-02');
  assert(fridayCompletedTask?.date === '2026-10-02', 'Original release date 2026-10-02 preserved');

  // Uncheck for next tests
  await toggleTaskCompletion('task-prime-part-1', false);

  // ----------------------------------------------------------------
  // TEST 5: Completing a Friday Part on Saturday
  // ----------------------------------------------------------------
  console.log('\nTEST 5: Completing Friday Part on Saturday (Next Day)');
  setSimulatedToday('2026-10-03');
  const completeOnSaturdayResult = await toggleTaskCompletion('task-prime-part-1', true);
  assert(completeOnSaturdayResult !== false, 'Completion of Friday part succeeds on Saturday');
  
  state = getState();
  let satCompletedTask = (state.remote_tasks || []).find(t => t.id === 'task-prime-part-1');
  assert(satCompletedTask?.completed === true, 'Task completed flag is true');
  assert(satCompletedTask?.completion_date === '2026-10-03', 'Task completion_date records Saturday 2026-10-03');
  assert(satCompletedTask?.date === '2026-10-02', 'Task date remains original release date 2026-10-02');

  // Uncheck for next test
  await toggleTaskCompletion('task-prime-part-1', false);

  // ----------------------------------------------------------------
  // TEST 6: Completing a Friday Part Several Days Later (e.g. Tuesday Oct 6)
  // ----------------------------------------------------------------
  console.log('\nTEST 6: Completing Friday Part Several Days Later (Tuesday Oct 6)');
  setSimulatedToday('2026-10-06');
  const completeOnTuesdayResult = await toggleTaskCompletion('task-prime-part-1', true);
  assert(completeOnTuesdayResult !== false, 'Completion of Friday part succeeds on Tuesday Oct 6');
  
  state = getState();
  let tueCompletedTask = (state.remote_tasks || []).find(t => t.id === 'task-prime-part-1');
  assert(tueCompletedTask?.completed === true, 'Task completed flag is true');
  assert(tueCompletedTask?.completion_date === '2026-10-06', 'Task completion_date records Tuesday 2026-10-06');
  assert(tueCompletedTask?.date === '2026-10-02', 'Task date remains original release date 2026-10-02');

  // ----------------------------------------------------------------
  // TEST 7: Prime Part Does NOT Become Overdue Merely Because Release Day Passed
  // ----------------------------------------------------------------
  console.log('\nTEST 7: Prime Part Exemption from Overdue / Needs Review');
  // Seed Saturday Part 2 and leave it uncompleted
  getTodayData('2026-10-03');
  setSimulatedToday('2026-10-06');
  
  const needsReview = getNeedsReviewTasks(20);
  const primeInNeedsReview = needsReview.find(t => t.is_prime_part || t.subtype === 'PRIME_3');
  assert(primeInNeedsReview === undefined, 'Uncompleted Prime Part is NOT marked overdue in Needs Review');

  // ----------------------------------------------------------------
  // TEST 8: Prime Part Content Structure
  // ----------------------------------------------------------------
  console.log('\nTEST 8: Prime Part Content Structure');
  const oct2Details = getTodayData('2026-10-02');
  const partTask = (oct2Details.tasks.LEARN || []).find(t => t.is_prime_part);
  assert(partTask?.notes?.includes('Videos') && partTask?.notes?.includes('Lecture Notes') && partTask?.notes?.includes('Assignment Problems'),
    'Prime Part task notes specify Videos, Lecture Notes, and Assignment Problems');
  assert(Array.isArray(partTask?.contents) && partTask.contents.length === 3,
    'Prime Part contents array contains 3 items (Videos, Notes, Assignments)');

  // ----------------------------------------------------------------
  // TEST 9: Prime Monthly Summary
  // ----------------------------------------------------------------
  console.log('\nTEST 9: Monthly Summary by Parts (October 2026)');
  setSimulatedToday('2026-10-06');
  const octMonthData = getMonthData('2026-10');
  const summary = octMonthData.targets.primePartsSummary;
  assert(summary !== undefined, 'Month data includes primePartsSummary');
  assert(summary.totalInMonth === 10, `October has 10 total Friday/Saturday release parts (found ${summary.totalInMonth})`);
  assert(summary.released >= 2, `Parts released by Oct 6 is >= 2 (found ${summary.released})`);
  assert(summary.completed >= 1, `Parts completed count reflects completed part (found ${summary.completed})`);
  assert(summary.label.includes('Parts Released') && summary.label.includes('Completed'), `Summary label formatted: "${summary.label}"`);

  // ----------------------------------------------------------------
  // TEST 10: C Programming Removed Completely
  // ----------------------------------------------------------------
  console.log('\nTEST 10: C Programming Removed Completely');
  const legacyCheck = isLegacyCTask({ title: 'Complete C Fundamentals Chapter 1', notes: 'c programming' });
  assert(legacyCheck === true, 'isLegacyCTask detects legacy C task');
  
  const octDailyTasks = oct2Details.allTodayTasks || [];
  const anyCTaskToday = octDailyTasks.some(t => isLegacyCTask(t));
  assert(anyCTaskToday === false, 'No C tasks present in today tasks');

  const monthTopics = octMonthData.topics || [];
  const anyCTopicMonth = monthTopics.some(t => t.name?.toLowerCase().includes('c programming') || t.name?.toLowerCase().includes('c memory allocator'));
  assert(anyCTopicMonth === false, 'No C topics present in monthly view');

  const dashData = getDashboardData();
  const cInCategories = (dashData.todayStats.categories || []).some(c => c.name === 'C' || c.name === 'C Programming');
  assert(cInCategories === false, 'C is not an active category in Dashboard');

  // ----------------------------------------------------------------
  // TEST 11: Python Associated with Prime 3.0
  // ----------------------------------------------------------------
  console.log('\nTEST 11: Python Associated with Prime 3.0');
  const primeCategory = (dashData.todayStats.categories || []).find(c => c.name === 'Prime 3.0');
  assert(primeCategory !== undefined, 'Prime 3.0 category exists in Dashboard');

  // ----------------------------------------------------------------
  // TEST 12: C++ Associated with DSA Playlist
  // ----------------------------------------------------------------
  console.log('\nTEST 12: C++ Associated with DSA Playlist');
  assert(DSA_PLAYLIST_URL.includes('&si=7qOZjYth49Nv-6NN'), 'DSA Playlist URL includes required &si=7qOZjYth49Nv-6NN token');
  const dsaCategory = (dashData.todayStats.categories || []).find(c => c.name === 'DSA (C++)');
  assert(dsaCategory !== undefined, 'DSA (C++) category exists in Dashboard');

  // ----------------------------------------------------------------
  // TEST 13: Java Playlist Track (Apna College)
  // ----------------------------------------------------------------
  console.log('\nTEST 13: Java Playlist Track (Apna College)');
  assert(JAVA_FUNDAMENTALS_TOPICS.length === 39, `Java Playlist syllabus has 39 videos (found ${JAVA_FUNDAMENTALS_TOPICS.length})`);
  const oct2JavaTask = (oct2Data.tasks.LEARN || []).find(t => t.is_java_task);
  assert(oct2JavaTask !== undefined, 'Java playlist task seeded in getTodayData');
  assert(oct2JavaTask?.title?.toLowerCase().includes('java'), 'Java task title includes Java');
  const javaCategory = (dashData.todayStats.categories || []).find(c => c.name.includes('Java'));
  assert(javaCategory !== undefined, 'Java category exists in Dashboard');

  // ----------------------------------------------------------------
  // TEST 14: Semester Answers Intact (No Subject Names)
  // ----------------------------------------------------------------
  console.log('\nTEST 14: Semester Answers Intact');
  const semTasks = oct2Data.tasks.SEMESTER || [];
  assert(semTasks.length === 3, '3 semester tasks generated (2 required + 1 optional)');
  const semTitles = semTasks.map(t => t.title);
  assert(semTitles.some(t => t.includes('Answer 1')), 'Contains Answer 1');
  assert(semTitles.some(t => t.includes('Answer 2')), 'Contains Answer 2');
  assert(semTitles.some(t => t.includes('Answer 3')), 'Contains Answer 3');

  // ----------------------------------------------------------------
  // TEST 15: DaVinci Resolve (2 days/week: Tue & Sat)
  // ----------------------------------------------------------------
  console.log('\nTEST 15: DaVinci Resolve Schedule');
  const tueData = getTodayData('2026-10-06'); // Tuesday
  const tueDavinci = (tueData.tasks.DAVINCI || []).length > 0;
  assert(tueDavinci === true, 'DaVinci task scheduled on Tuesday');

  const satData = getTodayData('2026-10-03'); // Saturday
  const satDavinci = (satData.tasks.DAVINCI || []).length > 0;
  assert(satDavinci === true, 'DaVinci task scheduled on Saturday');

  const wedData = getTodayData('2026-10-07'); // Wednesday
  const wedDavinci = (wedData.tasks.DAVINCI || []).length > 0;
  assert(wedDavinci === false, 'No DaVinci task on Wednesday');

  // ----------------------------------------------------------------
  // TEST 16: Exercise 30 Minutes Daily
  // ----------------------------------------------------------------
  console.log('\nTEST 16: Exercise 30 Minutes Daily');
  const oct2Exercise = (oct2Data.tasks.HEALTH || []).find(t => t.subtype === 'EXERCISE');
  assert(oct2Exercise !== undefined && oct2Exercise.estimated_minutes === 30, 'Daily 30-minute exercise task present');

  // ----------------------------------------------------------------
  // TEST 17: Gaming Optional 6 Hours/Week
  // ----------------------------------------------------------------
  console.log('\nTEST 17: Gaming Optional');
  const weekData = getWeekData('2026-10-W1');
  assert(weekData.gamingHours !== undefined, 'Week data tracks gaming hours');
  assert(weekData.targets !== undefined, 'Week targets intact');

  // ----------------------------------------------------------------
  // Summary
  // ----------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test execution threw an uncaught error:', err);
  process.exit(1);
});

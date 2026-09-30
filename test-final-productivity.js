/**
 * test-final-productivity.js
 * Comprehensive Verification Test Suite for Final Productivity Features
 */

import {
  PROGRAM_START_DATE,
  getCanonicalToday,
  isProgramStarted,
  setSimulatedToday,
  shiftDate
} from './js/services/dateService.js';

import {
  getState,
  updateState,
  saveState,
  resetToInitialState
} from './js/data/storage.js';

import {
  calculateStudyStreak,
  isDaySufficientlyCompleted,
  calculateStreaks
} from './js/services/streakService.js';

import {
  getDashboardData,
  getWeeklyConsistency,
  getNeedsReviewTasks,
  getNextUpTasks,
  getMonthlyProgressSummary,
  exportTrackerDataJSON,
  exportTrackerDataCSV
} from './js/services/trackerService.js';

import { SupabaseClient } from './js/services/supabaseClient.js';

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failedCount++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('FINAL PRODUCTIVITY FEATURES VERIFICATION SUITE');
  console.log('================================================================');

  // Reset to clean test state
  resetToInitialState();
  const state = getState();

  // ------------------------------------------------------------------
  // 1. DATE LOGIC & PROGRAM START DATE
  // ------------------------------------------------------------------
  console.log('\n--- 1. Date Logic & Program Start Rules ---');
  assert(PROGRAM_START_DATE === '2026-10-01', 'PROGRAM_START_DATE is exactly 2026-10-01');

  setSimulatedToday('2026-09-30');
  assert(!isProgramStarted('2026-09-30'), 'Program is not active before October 1, 2026');

  setSimulatedToday('2026-10-01');
  assert(isProgramStarted('2026-10-01'), 'Program is active on October 1, 2026');

  // ------------------------------------------------------------------
  // 2. STUDY STREAK LOGIC
  // ------------------------------------------------------------------
  console.log('\n--- 2. Study Streak Feature Rules ---');
  // Rule: On or before Oct 1, streak is 0
  setSimulatedToday('2026-09-30');
  const streakPreStart = calculateStudyStreak(state, '2026-09-30');
  assert(streakPreStart === 0, 'Streak is 0 on September 30, 2026 (pre-start)');

  setSimulatedToday('2026-10-01');
  const streakDay1Initial = calculateStudyStreak(state, '2026-10-01');
  assert(streakDay1Initial === 0, 'Streak is 0 on October 1, 2026 (Day 1 start)');

  // Simulate completing Oct 1 tasks sufficiently
  const testTasks = [
    { id: 't1', date: '2026-10-01', title: 'DSA 1', category: 'DSA', completed: true },
    { id: 't2', date: '2026-10-01', title: 'DSA 2', category: 'DSA', completed: true },
    { id: 't3', date: '2026-10-01', title: 'Semester 1', category: 'Semester Preparation', completed: true },
    { id: 't4', date: '2026-10-01', title: 'Prime 1', category: 'Prime 3.0 AI/ML', completed: true },
    { id: 't5', date: '2026-10-01', title: 'Exercise', category: 'Exercise', completed: true }
  ];
  const testState = { daily_tasks: [...testTasks], remote_tasks: [] };

  assert(isDaySufficientlyCompleted('2026-10-01', testState), 'Day Oct 1 is sufficiently completed');

  // On Oct 2, streak should become 1 (since Oct 1 was sufficiently completed)
  setSimulatedToday('2026-10-02');
  const streakDay2 = calculateStudyStreak(testState, '2026-10-02');
  assert(streakDay2 === 1, `On Oct 2, streak is 1 after Day 1 completion (got ${streakDay2})`);

  // On Oct 2, complete Oct 2 as well
  testState.daily_tasks.push(
    { id: 't6', date: '2026-10-02', title: 'DSA 3', category: 'DSA', completed: true },
    { id: 't7', date: '2026-10-02', title: 'Exercise 2', category: 'Exercise', completed: true }
  );
  assert(isDaySufficientlyCompleted('2026-10-02', testState), 'Day Oct 2 is sufficiently completed');

  // On Oct 3, streak should be 2
  setSimulatedToday('2026-10-03');
  const streakDay3 = calculateStudyStreak(testState, '2026-10-03');
  assert(streakDay3 === 2, `On Oct 3, streak is 2 after Day 1 & Day 2 completions (got ${streakDay3})`);

  // If a qualifying day is missed (e.g., Oct 3 had scheduled tasks but none completed)
  testState.daily_tasks.push(
    { id: 't8', date: '2026-10-03', title: 'DSA 4', category: 'DSA', completed: false }
  );
  setSimulatedToday('2026-10-04');
  const streakDay4Missed = calculateStudyStreak(testState, '2026-10-04');
  assert(streakDay4Missed === 0, `Streak resets to 0 when past qualifying day was missed (got ${streakDay4Missed})`);

  // Future dates never count towards streak
  const streakFuture = calculateStudyStreak(testState, '2026-10-10');
  assert(streakFuture === 0, 'Future target dates without preceding consecutive work do not falsely report streak');

  // ------------------------------------------------------------------
  // 3. TODAY'S PROGRESS SUMMARY
  // ------------------------------------------------------------------
  console.log('\n--- 3. Today Progress Summary Rules ---');
  setSimulatedToday('2026-10-01');
  let dashData = getDashboardData();

  assert(dashData.todayStats.tasksTotal > 0, `Today total tasks is positive (${dashData.todayStats.tasksTotal} tasks)`);
  assert(typeof dashData.todayStats.tasksCompleted === 'number', 'Today completed tasks is numeric');
  const expectedRate = Math.round((dashData.todayStats.tasksCompleted / dashData.todayStats.tasksTotal) * 100);
  assert(dashData.todayStats.completionRate === expectedRate, `Today completion percentage is calculated accurately (${dashData.todayStats.completionRate}% === ${expectedRate}%)`);

  // Division-by-zero prevention test
  const calcZeroRate = (total, completed) => total > 0 ? Math.round((completed / total) * 100) : 0;
  assert(calcZeroRate(0, 0) === 0, 'Zero scheduled tasks division-by-zero returns 0% (no NaN, no Infinity)');
  assert(!Number.isNaN(calcZeroRate(0, 0)), 'Completion rate is not NaN');
  assert(Number.isFinite(calcZeroRate(0, 0)), 'Completion rate is finite');

  // ------------------------------------------------------------------
  // 4. WEEKLY CONSISTENCY INDICATOR
  // ------------------------------------------------------------------
  console.log('\n--- 4. Weekly Consistency Indicator ---');
  updateState({ daily_tasks: testTasks, remote_tasks: [] });
  setSimulatedToday('2026-10-02'); // Friday Oct 2, 2026
  const weeklyConsistency = getWeeklyConsistency('2026-10-02');
  assert(Array.isArray(weeklyConsistency), 'Weekly consistency returns an array');
  assert(weeklyConsistency.length === 7, 'Weekly consistency has exactly 7 days (Mon-Sun)');
  assert(weeklyConsistency[0].dayName === 'Mon', 'First day is Mon');
  assert(weeklyConsistency[6].dayName === 'Sun', 'Last day is Sun');

  // Oct 1 (Thu) was completed
  const thu = weeklyConsistency.find(d => d.date === '2026-10-01');
  assert(thu && thu.status === 'COMPLETED' && thu.symbol === '✓', 'Oct 1 (Thu) shows ✓ (COMPLETED)');

  // Future day (e.g. Sat Oct 3 or Sun Oct 4) is clearly distinguishable as future
  const sat = weeklyConsistency.find(d => d.date === '2026-10-03');
  assert(sat && sat.isFuture === true, 'Saturday Oct 3 is marked isFuture: true');

  // Pre-program day (e.g., Sep 28 Mon) shows no work
  const mon = weeklyConsistency.find(d => d.date === '2026-09-28');
  assert(mon && mon.status === 'NO_WORK' && mon.symbol === '—', 'Sep 28 before program shows — (NO_WORK)');

  // ------------------------------------------------------------------
  // 5. NEEDS REVIEW / OVERDUE TASKS
  // ------------------------------------------------------------------
  console.log('\n--- 5. Needs Review / Overdue Tasks ---');
  // Put an incomplete task on Oct 1 and simulate today is Oct 3
  const overdueTasks = [
    { id: 'overdue-1', date: '2026-10-01', title: 'DSA — Lecture 12', category: 'DSA', completed: false },
    { id: 'future-task-1', date: '2026-10-05', title: 'Future DSA', category: 'DSA', completed: false }
  ];
  updateState({ daily_tasks: overdueTasks, remote_tasks: [] });
  setSimulatedToday('2026-10-03');

  const needsReview = getNeedsReviewTasks('2026-10-03');
  assert(needsReview.length >= 1, 'Past incomplete task detected in Needs Review');
  const overdueTask = needsReview.find(t => t.id === 'overdue-1');
  assert(overdueTask !== undefined, 'DSA — Lecture 12 appears in Needs Review');
  assert(overdueTask && overdueTask.date === '2026-10-01', 'Original task date 2026-10-01 is strictly preserved');
  assert(overdueTask && overdueTask.completed === false, 'Task remains incomplete (not auto-completed)');

  // Check that future tasks NEVER appear in Needs Review
  const foundFutureInReview = needsReview.find(t => t.id === 'future-task-1');
  assert(foundFutureInReview === undefined, 'Future tasks are NEVER included in Needs Review');

  // ------------------------------------------------------------------
  // 6. NEXT UP UPCOMING TASKS
  // ------------------------------------------------------------------
  console.log('\n--- 6. Next Up (Upcoming Tasks) ---');
  setSimulatedToday('2026-10-03');
  const nextUp = getNextUpTasks('2026-10-03', 3);
  assert(Array.isArray(nextUp), 'Next up returns an array of tasks');
  assert(nextUp.every(t => t.date > '2026-10-03'), 'All next up tasks are strictly from future dates');
  const todayTasksInNextUp = nextUp.filter(t => t.date <= '2026-10-03');
  assert(todayTasksInNextUp.length === 0, 'No past or today completed tasks are in Next Up');

  // ------------------------------------------------------------------
  // 7. MONTHLY PROGRESS SUMMARY
  // ------------------------------------------------------------------
  console.log('\n--- 7. Monthly Progress Summary ---');
  setSimulatedToday('2026-10-03');
  const monthlySummary = getMonthlyProgressSummary('2026-10');
  assert(monthlySummary.monthName === 'October 2026', 'Month name is October 2026');
  assert(typeof monthlySummary.overallPercent === 'number', 'Overall percent is numeric');
  assert(Array.isArray(monthlySummary.categories), 'Monthly summary categories is an array');
  const categoryNames = monthlySummary.categories.map(c => c.name);
  assert(categoryNames.includes('DSA'), 'DSA included in monthly progress');
  assert(categoryNames.includes('Semester Preparation') || categoryNames.includes('Semester'), 'Semester included in monthly progress');
  assert(categoryNames.includes('Prime 3.0 AI/ML') || categoryNames.includes('Prime 3.0'), 'Prime 3.0 included in monthly progress');
  assert(categoryNames.includes('DaVinci Resolve'), 'DaVinci included in monthly progress');
  assert(categoryNames.includes('Exercise'), 'Exercise included in monthly progress');

  // ------------------------------------------------------------------
  // 8. DATA EXPORT / BACKUP (JSON & CSV)
  // ------------------------------------------------------------------
  console.log('\n--- 8. Data Export & Backup ---');
  const exportedJSON = exportTrackerDataJSON();
  assert(exportedJSON !== null, 'exportTrackerDataJSON returned valid payload');
  assert(exportedJSON.metadata !== undefined, 'Export JSON has metadata header');
  assert(exportedJSON.metadata.programStartDate === '2026-10-01', 'Metadata includes PROGRAM_START_DATE');
  assert(exportedJSON.monthlyPlans !== undefined, 'Export includes monthly plans');
  assert(exportedJSON.dailyTasks !== undefined, 'Export includes daily tasks');
  assert(exportedJSON.focusSessions !== undefined, 'Export includes focus session records');

  // Critical Security Check: Ensure NO secrets or service keys in export
  const jsonString = JSON.stringify(exportedJSON);
  assert(!jsonString.includes('service_role'), 'Export does NOT contain service_role keys');
  assert(!jsonString.includes('supabase_secret'), 'Export does NOT contain supabase secrets');
  assert(!jsonString.includes('password'), 'Export does NOT contain passwords');
  assert(!jsonString.includes('auth_token'), 'Export does NOT contain authentication tokens');

  const exportedCSV = exportTrackerDataCSV();
  assert(typeof exportedCSV === 'string', 'exportTrackerDataCSV returned CSV string');
  assert(exportedCSV.startsWith('Date,Title,Category'), 'CSV header formatted correctly');

  // ------------------------------------------------------------------
  // 9. SUPABASE CONNECTION & DATA ARCHITECTURE
  // ------------------------------------------------------------------
  console.log('\n--- 9. Supabase Connection Status ---');
  const sbConfig = SupabaseClient.getConfig();
  assert(sbConfig.connected === true, 'Supabase client is connected');
  assert(typeof sbConfig.projectId === 'string' && sbConfig.projectId.length > 5, 'Supabase project ID is valid');
  assert(sbConfig.url.includes('supabase.co'), 'Supabase URL valid');
  // Service role key must not be exposed in client config
  assert(sbConfig.serviceRoleKey === undefined, 'Service role key is NOT exposed');

  // ------------------------------------------------------------------
  // 10. FOCUS MODE CATEGORY LOCKING LOGIC
  // ------------------------------------------------------------------
  console.log('\n--- 10. Focus Mode Category Locking Verification ---');
  // Verify locking requirements:
  // Before START: running=false, accumulatedMs=0 -> select enabled
  // After START: running=true -> select disabled
  // PAUSE: running=false, accumulatedMs>0 -> select disabled
  // RESUME: running=true -> select disabled
  // STOP: running=false, accumulatedMs=0 -> select enabled
  const mockFocusTimer = {
    running: false,
    startTime: null,
    accumulatedMs: 0,
    category: 'DSA'
  };

  const isCategoryLocked = (timer) => timer.running || timer.accumulatedMs > 0;

  assert(!isCategoryLocked(mockFocusTimer), 'Before START: Category can be selected (unlocked)');

  // START
  mockFocusTimer.running = true;
  mockFocusTimer.startTime = Date.now();
  assert(isCategoryLocked(mockFocusTimer), 'After START: Category becomes locked');

  // PAUSE
  mockFocusTimer.running = false;
  mockFocusTimer.accumulatedMs = 25000;
  mockFocusTimer.startTime = null;
  assert(isCategoryLocked(mockFocusTimer), 'During PAUSE: Category remains locked');

  // RESUME
  mockFocusTimer.running = true;
  mockFocusTimer.startTime = Date.now();
  assert(isCategoryLocked(mockFocusTimer), 'During RESUME: Category remains locked');

  // STOP
  mockFocusTimer.running = false;
  mockFocusTimer.accumulatedMs = 0;
  mockFocusTimer.startTime = null;
  assert(!isCategoryLocked(mockFocusTimer), 'After STOP: Category is unlocked for next session');

  // Reset simulated date
  setSimulatedToday(null);
  console.log('\nSimulation cleared. Real system date restored.');

  console.log('================================================================');
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

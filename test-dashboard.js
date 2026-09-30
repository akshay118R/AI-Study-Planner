/**
 * Comprehensive Verification Test Suite for the Redesigned Main Dashboard
 */

import { getCanonicalToday, formatFullDate, PROGRAM_START_DATE, setSimulatedToday } from './js/services/dateService.js';
import {
  initTrackerService,
  getDashboardData,
  logFocusSession,
  getTodayData,
  getWeekData,
  getMonthData,
  getProgressData,
  toggleTaskCompletion
} from './js/services/trackerService.js';
import { getState, updateState, initStorage } from './js/data/storage.js';

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failedCount++;
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
    passedCount++;
  }
}

async function runDashboardTests() {
  console.log('================================================================');
  console.log('DASHBOARD REDESIGN VERIFICATION TEST SUITE');
  console.log('================================================================');

  initStorage();
  await initTrackerService();

  // -----------------------------------------------------------
  // 1. NAVIGATION & DEFAULT ROUTING TESTS
  // -----------------------------------------------------------
  console.log('\n--- 1. Navigation Order & Hierarchy ---');
  assert(PROGRAM_START_DATE === '2026-10-01', 'Centralized PROGRAM_START_DATE is 2026-10-01');

  // Verify app.js content for navigation order
  const fs = await import('fs');
  const appJsContent = fs.readFileSync('./js/app.js', 'utf8');

  assert(appJsContent.includes('data-route="dashboard"'), 'Sidebar contains data-route="dashboard"');
  assert(!appJsContent.includes('<span class="nav-text">PROGRESS</span>'), 'No duplicate PROGRESS in sidebar nav items');

  const dashIdx = appJsContent.indexOf('data-route="dashboard"');
  const monthIdx = appJsContent.indexOf('data-route="month"');
  const weekIdx = appJsContent.indexOf('data-route="week"');
  const todayIdx = appJsContent.indexOf('data-route="today"');
  const settingsIdx = appJsContent.indexOf('data-route="settings"');

  assert(dashIdx < monthIdx, 'Dashboard precedes Month in navigation');
  assert(monthIdx < weekIdx, 'Month precedes Week in navigation');
  assert(weekIdx < todayIdx, 'Week precedes Today in navigation');
  assert(todayIdx < settingsIdx, 'Today precedes Settings in navigation');

  assert(appJsContent.includes("window.location.hash = '#dashboard'"), 'Default route is #dashboard');
  assert(appJsContent.includes('dashboard: renderDashboard'), 'ROUTES has dashboard mapped to renderDashboard');
  assert(appJsContent.includes('progress: renderDashboard'), 'ROUTES preserves progress as backward-compatible alias');

  // -----------------------------------------------------------
  // 2. CASE A: PRE-START MODE ON SEPTEMBER 29, 2026
  // -----------------------------------------------------------
  console.log('\n--- 2. Dashboard on September 29, 2026 (Pre-start Mode) ---');
  setSimulatedToday('2026-09-29');
  const dataPreStart = getDashboardData();

  assert(dataPreStart.isProgramActive === false, 'isProgramActive is false on September 29');
  assert(dataPreStart.todayStats.isPreStart === true, 'todayStats.isPreStart is true');
  assert(dataPreStart.programDayText === null, 'No program day displayed before start');
  assert(dataPreStart.greeting.length > 0, `Dynamic greeting resolved: "${dataPreStart.greeting}"`);
  
  // Real stats vs planned values
  assert(dataPreStart.todayStats.tasksCompleted === 0, 'Today tasks completed = 0 before start');
  assert(dataPreStart.todayStats.studyHoursFormatted === '0h 0m', 'Today study hours = 0h 0m before start');
  assert(dataPreStart.todayStats.focusFormatted === '0h 0m', 'Today focus time = 0h 0m before start');
  assert(dataPreStart.todayStats.completionRate === 0, 'Today completion rate = 0% before start');
  assert(dataPreStart.todayStats.tasksTotal >= 5, `October 1 preview has ${dataPreStart.todayStats.tasksTotal} planned tasks`);

  // Category progress percentages must be 0 before start
  const uncompletedCats = dataPreStart.todayStats.categories.filter(c => c.percent === 0);
  assert(uncompletedCats.length === dataPreStart.todayStats.categories.length, 'All category progress values are 0% before start');

  // Weekly stats before start
  assert(dataPreStart.thisWeekStats.tasksCompleted === 0, 'This week completed tasks = 0 before start');
  assert(dataPreStart.thisWeekStats.studyFormatted === '0h 0m', 'This week study time = 0h 0m before start');
  assert(dataPreStart.thisWeekStats.dsaVideos === 0, 'This week DSA videos = 0 before start');
  assert(dataPreStart.thisWeekStats.semesterAnswers === 0, 'This week semester answers = 0 before start');

  // Monthly stats before start
  assert(dataPreStart.thisMonthStats.tasksCompleted === 0, 'October month completed tasks = 0 before start');
  assert(dataPreStart.thisMonthStats.studyHoursActual === 0, 'October month study hours = 0 before start');
  assert(dataPreStart.thisMonthStats.overallPercent === 0, 'October month overall percent = 0% before start');
  assert(dataPreStart.thisMonthStats.tasksPlanned > 0, `October has ${dataPreStart.thisMonthStats.tasksPlanned} planned tasks`);

  // Top 3 Today Focus tasks
  assert(dataPreStart.todayFocusTasks.length === 3, 'Today Focus contains top 3 tasks for preview');
  assert(dataPreStart.todayFocusTasks[0].number === 1, 'First focus task has number 1');

  // Upcoming tasks
  assert(dataPreStart.upcomingTasks.length >= 3, `Upcoming tasks list has ${dataPreStart.upcomingTasks.length} items`);
  assert(dataPreStart.upcomingTasks[0].date >= '2026-10-01', 'Upcoming tasks begin on or after October 1');

  // -----------------------------------------------------------
  // 3. PRESERVED PROGRESS FEATURES INSIDE DASHBOARD
  // -----------------------------------------------------------
  console.log('\n--- 3. Preserved Progress Features (Trends, Charts, Playlists) ---');
  const progData = dataPreStart.progressData;
  assert(progData.summary !== undefined, 'Summary data preserved');
  assert(progData.summary.studyHours !== undefined, 'Summary has study hours');
  assert(progData.summary.dsaVideos !== undefined, 'Summary has DSA videos');
  assert(progData.summary.dsaProblems !== undefined, 'Summary has DSA problems');
  assert(progData.summary.semesterAnswers !== undefined, 'Summary has semester answers');
  assert(progData.summary.prime3Progress !== undefined, 'Summary has Prime 3.0');
  assert(progData.summary.individualProgress !== undefined, 'Summary has Individual Learning');
  assert(progData.summary.davinciProgress !== undefined, 'Summary has DaVinci Resolve');
  assert(progData.summary.projectProgress !== undefined, 'Summary has Projects');
  assert(progData.summary.exerciseProgress !== undefined, 'Summary has Exercise');

  assert(progData.charts !== undefined, 'Charts data preserved');
  assert(progData.charts.studyHoursPerWeek.length >= 4, 'Chart 1: Study hours per week present');
  assert(progData.charts.dsaProblemsPerWeek.length >= 4, 'Chart 2: DSA problems per week present');
  assert(progData.charts.taskCompletionPerWeek.length >= 4, 'Chart 3: Task completion per week present');

  assert(progData.dsaPlaylist.length === 144, 'Apna College DSA playlist tracker preserved (144 videos)');
  assert(progData.davinciPlaylist.length >= 8, `DaVinci Resolve playlist tracker preserved (${progData.davinciPlaylist.length} videos)`);

  // -----------------------------------------------------------
  // 4. FOCUS TIMER & LOGGING (SEPARATE METRIC TEST)
  // -----------------------------------------------------------
  console.log('\n--- 4. Focus Session & Timer Logic ---');
  const initialCompletedTasks = dataPreStart.todayStats.tasksCompleted;

  // Log a 45-minute focus session
  const focusSession = await logFocusSession({
    category: 'DSA',
    durationMinutes: 45,
    durationSeconds: 2700,
    notes: 'Testing trees and heaps'
  });

  assert(focusSession.duration_minutes === 45, 'Focus session logged with 45 minutes');
  assert(focusSession.category === 'DSA', 'Focus session category is DSA');

  // Verify focus session is saved in storage
  const state = getState();
  const foundSession = (state.focus_sessions || []).find(s => s.id === focusSession.id);
  assert(foundSession !== undefined, 'Focus session safely persisted in local storage');

  // Verify Requirement 8: Focus session does NOT count as task completion!
  const dataAfterFocus = getDashboardData();
  assert(dataAfterFocus.todayStats.tasksCompleted === initialCompletedTasks, 'Focus sessions do NOT increment completed tasks (separate metric)');

  // -----------------------------------------------------------
  // 5. CASE C: ACTIVE TRACKING MODE ON OCTOBER 1, 2026
  // -----------------------------------------------------------
  console.log('\n--- 5. Dashboard on October 1, 2026 (Active Tracking Mode) ---');
  setSimulatedToday('2026-10-01');
  const dataOct1 = getDashboardData();

  assert(dataOct1.isProgramActive === true, 'isProgramActive is true on October 1');
  assert(dataOct1.todayStats.isPreStart === false, 'todayStats.isPreStart is false on October 1');
  assert(dataOct1.programDayText === 'Day 1 of 273', `Program day is correctly: "${dataOct1.programDayText}"`);
  assert(dataOct1.todayStats.date === '2026-10-01', 'Active today date is 2026-10-01');

  // Log a focus session on Oct 1
  await logFocusSession({
    category: 'Prime 3.0',
    durationMinutes: 60,
    durationSeconds: 3600
  });

  const dataOct1WithFocus = getDashboardData();
  assert(dataOct1WithFocus.todayStats.focusFormatted === '1h 0m', `Today focus formatted shows actual recorded 1h 0m (was ${dataOct1WithFocus.todayStats.focusFormatted})`);

  // Complete a task on Oct 1
  const todayTasks = getTodayData('2026-10-01').allTodayTasks;
  assert(todayTasks.length > 0, 'Oct 1 has scheduled tasks');
  const taskToComplete = todayTasks[0];
  const toggleRes = await toggleTaskCompletion(taskToComplete.id, true);
  assert(toggleRes !== false, 'Task on October 1 is actionable and completed');

  const dataOct1Updated = getDashboardData();
  assert(dataOct1Updated.todayStats.tasksCompleted >= 1, `Today completed tasks incremented to ${dataOct1Updated.todayStats.tasksCompleted}`);
  assert(dataOct1Updated.todayStats.completionRate > 0, `Completion rate calculated: ${dataOct1Updated.todayStats.completionRate}%`);

  // -----------------------------------------------------------
  // 6. CASE D: ACTIVE TRACKING MODE ON OCTOBER 2, 2026
  // -----------------------------------------------------------
  console.log('\n--- 6. Dashboard on October 2, 2026 (Day 2 of Program) ---');
  setSimulatedToday('2026-10-02');
  const dataOct2 = getDashboardData();

  assert(dataOct2.isProgramActive === true, 'isProgramActive is true on October 2');
  assert(dataOct2.programDayText === 'Day 2 of 273', `Program day is correctly: "${dataOct2.programDayText}"`);
  assert(dataOct2.todayStats.date === '2026-10-02', 'Active date is 2026-10-02');

  // Reset simulation to real device time
  setSimulatedToday(null);
  console.log(`\nSimulation cleared. Back to real device date: ${getCanonicalToday()}`);

  console.log('\n================================================================');
  console.log(`FINAL RESULT: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================');
}

runDashboardTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

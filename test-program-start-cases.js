/**
 * Verification Script for PROGRAM START DATE: 2026-10-01
 * Tests the exact cases A, B, C, D, E specified in the User Request:
 * 
 * CASE A: 2026-09-29 (Pre-start, No Sept 29 tracking, No Sept 30 Tomorrow, Oct 1 is first actionable date)
 * CASE B: 2026-09-30 (Pre-start, No Sept 30 tracking, Oct 1 is first actionable date)
 * CASE C: 2026-10-01 (Today = Oct 1, Oct 1 actionable, Oct 2 future/review only)
 * CASE D: 2026-10-02 (Today = Oct 2, Oct 1 past/review, Oct 2 actionable, Oct 3 future/review only)
 * CASE E: 2026-10-05 (Today = Oct 5, Normal tracking behavior active)
 */

import {
  PROGRAM_START_DATE,
  isProgramStarted,
  getCanonicalToday,
  setSimulatedToday,
  getTrackingTomorrow,
  getWeekAndMonthForDate,
  getWeeksInMonth
} from './js/services/dateService.js';

import {
  getTodayData,
  getWeekData,
  getMonthData,
  getProgressData,
  toggleTaskCompletion,
  toggleDSAVideo,
  toggleSemesterAnswer,
  logNewStudySession,
  logGamingHours,
  createNewTask,
  rescheduleTask
} from './js/services/trackerService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${message}`);
    passed++;
  }
}

console.log('================================================================');
console.log('PROGRAM START DATE (2026-10-01) SPECIFICATION TEST SUITE');
console.log('================================================================\n');

// -------------------------------------------------------------
// CENTRALIZED CONSTANT VERIFICATION
// -------------------------------------------------------------
console.log('--- Centralized PROGRAM_START_DATE ---');
assert(PROGRAM_START_DATE === '2026-10-01', 'PROGRAM_START_DATE is exactly 2026-10-01');

// -------------------------------------------------------------
// CASE A: 2026-09-29
// Expected:
// Program not started.
// No September 29 tracking.
// No September 30 "Tomorrow".
// October 1 is the first actionable program date.
// Progress calculations all 0.
// -------------------------------------------------------------
console.log('\n--- CASE A: 2026-09-29 ---');
setSimulatedToday('2026-09-29');
assert(getCanonicalToday() === '2026-09-29', 'Current simulated date is 2026-09-29');
assert(isProgramStarted('2026-09-29') === false, 'Program is NOT started on 2026-09-29');

// Tomorrow logic
const tomorrowA = getTrackingTomorrow('2026-09-29');
assert(tomorrowA === '2026-10-01', `Tomorrow does NOT point to Sep 30. Points to first tracking date ${tomorrowA}`);

// Today data on Sep 29
const todayA = getTodayData();
assert(todayA.isPreStart === true, 'Today data indicates isPreStart: true');
assert(todayA.completedTasks === 0, 'Completed tasks = 0');
assert(parseFloat(todayA.studyHoursCompleted) === 0, 'Study hours completed = 0');
assert(todayA.studyMinutesCompleted === 0, 'Study minutes = 0');

// Previewing Oct 1 tasks on Sep 29
const oct1Preview = getTodayData('2026-10-01');
assert(oct1Preview.totalTasks > 0, `Oct 1 preview has ${oct1Preview.totalTasks} planned tasks`);
const oct1Task = oct1Preview.allTodayTasks[0];
assert(oct1Task !== undefined, 'Found October 1 planned task');

// Attempting completion of Oct 1 task on Sep 29 must fail
const completeBeforeStart = await toggleTaskCompletion(oct1Task.id, true);
assert(completeBeforeStart === false, 'Oct 1 task CANNOT be marked complete on Sep 29');

// Attempting DSA video completion on Sep 29 must fail
const dsaBeforeStart = await toggleDSAVideo(1, true);
assert(dsaBeforeStart === false, 'DSA video completion blocked before start date');

// Attempting study session on Sep 29 must fail
const studyBeforeStart = await logNewStudySession({ date: '2026-09-29', durationMinutes: 60 });
assert(studyBeforeStart === null, 'Logging study session on Sep 29 blocked');

// Progress rollup before start
const progressA = getProgressData();
assert(parseFloat(progressA.summary.studyHours) === 0, 'Overall study hours actual = 0');
assert(progressA.summary.dsaVideos.startsWith('0'), 'Overall DSA videos completed = 0');
assert(progressA.summary.dsaProblems === 0, 'Overall DSA problems solved = 0');
assert(progressA.summary.semesterAnswers === 0, 'Overall semester answers completed = 0');

// Month data before start
const monthA = getMonthData('2026-10');
assert(monthA.monthId === '2026-10', 'First available month is 2026-10');
assert(monthA.targets.studyHoursCompleted === 0, 'October study hours before start = 0');
assert(monthA.targets.dsaVideosCompleted === 0, 'October DSA videos before start = 0');
assert(monthA.targets.dsaProblemsCompleted === 0, 'October DSA problems before start = 0');
assert(monthA.targets.semesterAnswersCompleted === 0, 'October semester answers before start = 0');

// Week data before start
const weekA = getWeekData('2026-10-W1');
assert(weekA.startDate === '2026-10-01', 'First program week begins 2026-10-01');
assert(weekA.weekStatus.includes('Upcoming') || weekA.weekStatus.includes('Starts Oct 1'), `Week 1 status before start is: ${weekA.weekStatus}`);
assert(weekA.planVsActual.study.actualNum === 0, 'Week 1 actual study hours before start = 0');
assert(weekA.planVsActual.dsaVideos.actual === 0, 'Week 1 actual DSA videos before start = 0');
assert(weekA.days.every(d => d.isToday === false), 'No days in Week 1 are marked isToday before program starts');

// No September weeks or months in program
assert(getWeeksInMonth('2026-09').length === 0, 'September 2026 has 0 program weeks');

// -------------------------------------------------------------
// CASE B: 2026-09-30
// Expected:
// Program not started.
// No September 30 tracking.
// October 1 is the first actionable program date.
// -------------------------------------------------------------
console.log('\n--- CASE B: 2026-09-30 ---');
setSimulatedToday('2026-09-30');
assert(getCanonicalToday() === '2026-09-30', 'Current simulated date is 2026-09-30');
assert(isProgramStarted('2026-09-30') === false, 'Program is NOT started on 2026-09-30');

const tomorrowB = getTrackingTomorrow('2026-09-30');
assert(tomorrowB === '2026-10-01', `Tomorrow points to first actionable date: ${tomorrowB}`);

const todayB = getTodayData();
assert(todayB.isPreStart === true, 'Sep 30 is still pre-start mode');
assert(todayB.completedTasks === 0, 'Sep 30 completed tasks = 0');

const oct1TaskB = getTodayData('2026-10-01').allTodayTasks[0];
const completeOnSep30 = await toggleTaskCompletion(oct1TaskB.id, true);
assert(completeOnSep30 === false, 'Oct 1 task CANNOT be completed on Sep 30');

// -------------------------------------------------------------
// CASE C: 2026-10-01
// Expected:
// Today = October 1.
// October 1 tasks are actionable.
// October 2 tasks are future/review only.
// -------------------------------------------------------------
console.log('\n--- CASE C: 2026-10-01 ---');
setSimulatedToday('2026-10-01');
assert(getCanonicalToday() === '2026-10-01', 'Current simulated date is 2026-10-01');
assert(isProgramStarted('2026-10-01') === true, 'Program officially started on 2026-10-01');

const tomorrowC = getTrackingTomorrow('2026-10-01');
assert(tomorrowC === '2026-10-02', `Tomorrow on Oct 1 is Oct 2 (${tomorrowC})`);

const todayC = getTodayData('2026-10-01');
assert(todayC.isPreStart !== true, 'Oct 1 is active tracking day (not pre-start)');
const oct1TaskActionable = todayC.allTodayTasks[0];

// Oct 1 task must be actionable
const completeOnOct1 = await toggleTaskCompletion(oct1TaskActionable.id, true);
assert(completeOnOct1 !== false, 'Oct 1 task CAN be completed on Oct 1');
const afterCompleteOct1 = getTodayData('2026-10-01').allTodayTasks.find(t => t.id === oct1TaskActionable.id);
assert(afterCompleteOct1.completed === true, 'Oct 1 task is now completed');

// Oct 2 task on Oct 1 must be future/review only
const oct2TaskOnOct1 = getTodayData('2026-10-02').allTodayTasks[0];
const completeOct2OnOct1 = await toggleTaskCompletion(oct2TaskOnOct1.id, true);
assert(completeOct2OnOct1 === false, 'Oct 2 task is FUTURE/REVIEW ONLY on Oct 1');

// -------------------------------------------------------------
// CASE D: 2026-10-02
// Expected:
// Today = October 2.
// October 1 is past/review.
// October 2 is actionable.
// October 3 is future/review only.
// -------------------------------------------------------------
console.log('\n--- CASE D: 2026-10-02 ---');
setSimulatedToday('2026-10-02');
assert(getCanonicalToday() === '2026-10-02', 'Current simulated date is 2026-10-02');
assert(isProgramStarted('2026-10-02') === true, 'Program is active on 2026-10-02');

const tomorrowD = getTrackingTomorrow('2026-10-02');
assert(tomorrowD === '2026-10-03', `Tomorrow on Oct 2 is Oct 3 (${tomorrowD})`);

// Oct 1 task on Oct 2 is past/review only
const oct1TaskOnOct2 = getTodayData('2026-10-01').allTodayTasks[1];
const completeOct1OnOct2 = await toggleTaskCompletion(oct1TaskOnOct2.id, true);
assert(completeOct1OnOct2 === false, 'Oct 1 task is PAST/REVIEW ONLY on Oct 2');

// Oct 2 task on Oct 2 is actionable
const oct2TaskActionable = getTodayData('2026-10-02').allTodayTasks[0];
const completeOct2OnOct2 = await toggleTaskCompletion(oct2TaskActionable.id, true);
assert(completeOct2OnOct2 !== false, 'Oct 2 task is ACTIONABLE on Oct 2');
const afterCompleteOct2 = getTodayData('2026-10-02').allTodayTasks.find(t => t.id === oct2TaskActionable.id);
assert(afterCompleteOct2.completed === true, 'Oct 2 task is now completed');

// Oct 3 task on Oct 2 is future/review only
const oct3TaskOnOct2 = getTodayData('2026-10-03').allTodayTasks[0];
const completeOct3OnOct2 = await toggleTaskCompletion(oct3TaskOnOct2.id, true);
assert(completeOct3OnOct2 === false, 'Oct 3 task is FUTURE/REVIEW ONLY on Oct 2');

// -------------------------------------------------------------
// CASE E: 2026-10-05
// Expected:
// Today = October 5.
// Normal tracking behavior is active.
// -------------------------------------------------------------
console.log('\n--- CASE E: 2026-10-05 ---');
setSimulatedToday('2026-10-05');
assert(getCanonicalToday() === '2026-10-05', 'Current simulated date is 2026-10-05');
assert(isProgramStarted('2026-10-05') === true, 'Program is active on 2026-10-05');

const tomorrowE = getTrackingTomorrow('2026-10-05');
assert(tomorrowE === '2026-10-06', `Tomorrow on Oct 5 is Oct 6 (${tomorrowE})`);

const todayE = getTodayData('2026-10-05');
assert(todayE.dayName === 'Monday', `Oct 5 is Monday (was ${todayE.dayName})`);
assert(todayE.isPreStart !== true, 'Oct 5 is in normal daily tracking mode');

const oct5Task = todayE.allTodayTasks[0];
const completeOct5 = await toggleTaskCompletion(oct5Task.id, true);
assert(completeOct5 !== false, 'Oct 5 task is ACTIONABLE on Oct 5');

// Clear simulation back to real device time
setSimulatedToday(null);
console.log(`\nSimulation cleared. Back to device time: ${getCanonicalToday()}`);

console.log('\n================================================================');
console.log(`FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL 5 CASES (A, B, C, D, E) PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

/**
 * End-to-End Test Suite for Date System, Live Clock, Permissions, Midnight Rollover, and Unified Tasks
 * Validates Sections 1 to 38 of User Requirements
 */

import { initStorage, getState, updateState, resetToInitialState } from './js/data/storage.js';
import {
  getCanonicalToday,
  getDeviceTimeZone,
  setSimulatedToday,
  getSimulatedToday,
  formatLiveDateTime,
  formatFullDate,
  parseDate,
  shiftDate,
  getWeekAndMonthForDate
} from './js/services/dateService.js';
import {
  getTodayData,
  getWeekData,
  getMonthData,
  getProgressData,
  toggleTaskCompletion,
  toggleSemesterAnswer,
  editPlannedTask,
  logNewStudySession,
  doTodayTask,
  createNewTask
} from './js/services/trackerService.js';
import { getDavinciVideoForDate } from './js/data/davinciData.js';
import fs from 'fs';

let failed = 0;
let passed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${message}`);
    passed++;
  }
}

console.log('========================================================');
console.log('STARTING CAREER TRACKER DATE & WORKFLOW VERIFICATION');
console.log('========================================================\n');

// -------------------------------------------------------------
// TEST 1: REAL DATE & DAY SYSTEM + TIMEZONE (Section 2 & 3)
// -------------------------------------------------------------
console.log('--- 1. REAL DATE & DAY SYSTEM + LIVE CLOCK ---');
setSimulatedToday(null); // Clear any simulation
const realToday = getCanonicalToday();
const tz = getDeviceTimeZone();
console.log(`Detected device timezone: ${tz}`);
console.log(`Dynamic real system date: ${realToday}`);
assert(typeof tz === 'string' && tz.length > 0, `Valid device timezone resolved (${tz})`);
assert(/^\d{4}-\d{2}-\d{2}$/.test(realToday), `Dynamic canonical today matches YYYY-MM-DD format (${realToday})`);

const liveClockFormatted = formatLiveDateTime(new Date());
console.log(`Live clock formatted sample: ${liveClockFormatted}`);
assert(liveClockFormatted.includes('•'), 'Live clock includes date and time separator •');
assert(/(?:AM|PM)/.test(liveClockFormatted), 'Live clock includes AM/PM');
assert(/\d{1,2}:\d{2}:\d{2}\s+(?:AM|PM)/.test(liveClockFormatted), 'Live clock displays hours, minutes, and seconds');

// -------------------------------------------------------------
// TEST 2: SECTION 35 DATE TESTING MATRIX
// October 1, 2026; October 2, 2026; October 4, 2026; October 31, 2026; November 1, 2026
// -------------------------------------------------------------
console.log('\n--- 2. SECTION 35 DATE MATRIX TESTING ---');

// Date 1: October 1, 2026
const d1 = getTodayData('2026-10-01');
assert(d1.dayName === 'Thursday', `Oct 1, 2026 is Thursday (was ${d1.dayName})`);
assert(d1.weekNumber === 1, `Oct 1, 2026 is Week 1 (was ${d1.weekNumber})`);
assert(d1.monthTitle.includes('October 2026'), `Oct 1, 2026 is in October 2026 (was ${d1.monthTitle})`);
assert(d1.tasks.HEALTH && d1.tasks.HEALTH.length === 1, 'Oct 1 has daily Exercise task under HEALTH');
assert(d1.tasks.HEALTH[0].title === 'Exercise — 30 minutes', 'Exercise task title is exactly "Exercise — 30 minutes"');
assert(d1.tasks.SEMESTER && d1.tasks.SEMESTER.length === 3, 'Oct 1 has exactly 3 semester slots');
assert(d1.tasks.SEMESTER[0].title === 'Answer 1', 'Semester slot 1 is Answer 1');
assert(d1.tasks.SEMESTER[1].title === 'Answer 2', 'Semester slot 2 is Answer 2');
assert(d1.tasks.SEMESTER[2].title === 'Answer 3 — Optional', 'Semester slot 3 is Answer 3 — Optional');
assert(d1.davinci.isScheduledToday === false, 'Thursday Oct 1 is NOT a DaVinci scheduled day (Tue & Sat only)');

// Date 2: October 2, 2026
const d2 = getTodayData('2026-10-02');
assert(d2.dayName === 'Friday', `Oct 2, 2026 is Friday (was ${d2.dayName})`);
assert(d2.weekNumber === 1, 'Oct 2, 2026 is Week 1');
assert(d2.tasks.HEALTH[0].title === 'Exercise — 30 minutes', 'Oct 2 has Exercise — 30 minutes');

// Date 3: October 4, 2026
const d3 = getTodayData('2026-10-04');
assert(d3.dayName === 'Sunday', `Oct 4, 2026 is Sunday (was ${d3.dayName})`);
assert(d3.targetStudyHours === 8.5, `Sunday study hours target is 8.5h (was ${d3.targetStudyHours})`);

// Date 4: October 31, 2026
const d4 = getTodayData('2026-10-31');
assert(d4.dayName === 'Saturday', `Oct 31, 2026 is Saturday (was ${d4.dayName})`);
assert(d4.davinci.isScheduledToday === true, 'Oct 31 (Saturday) IS a DaVinci scheduled day');
assert(d4.tasks.DAVINCI && d4.tasks.DAVINCI.length === 1, 'Oct 31 has DaVinci Resolve task');

// Date 5: November 1, 2026
const d5 = getTodayData('2026-11-01');
assert(d5.dayName === 'Sunday', `Nov 1, 2026 is Sunday (was ${d5.dayName})`);
assert(d5.monthTitle.includes('November 2026'), `Nov 1, 2026 is in November 2026 (was ${d5.monthTitle})`);
assert(d5.weekNumber === 1, 'Nov 1, 2026 is Week 1 of November');

// -------------------------------------------------------------
// TEST 3: STRICT DATE PERMISSIONS (Section 6, 7, 8, 9, 23)
// Simulated today = October 1, 2026
// -------------------------------------------------------------
console.log('\n--- 3. DATE PERMISSIONS (TODAY ACTIONABLE, FUTURE/PAST REVIEW-ONLY) ---');
resetToInitialState();
setSimulatedToday('2026-10-01');
const simToday = getCanonicalToday();
assert(simToday === '2026-10-01', 'Simulated date set to 2026-10-01');

// 3.1 Today's Task Actionability (October 1)
const todayTasks = getTodayData('2026-10-01').allTodayTasks;
const taskToComplete = todayTasks.find(t => t.category === 'LEARN');
assert(taskToComplete !== undefined, 'Found LEARN task on Oct 1');
assert(taskToComplete.completed === false, 'Task starts uncompleted');

// Complete task on today
await toggleTaskCompletion(taskToComplete.id, true);
let updatedTodayData = getTodayData('2026-10-01');
const verifiedTask = updatedTodayData.allTodayTasks.find(t => t.id === taskToComplete.id);
assert(verifiedTask.completed === true, 'Today task successfully completed manually');

// Uncomplete task on today
await toggleTaskCompletion(taskToComplete.id, false);
updatedTodayData = getTodayData('2026-10-01');
assert(updatedTodayData.allTodayTasks.find(t => t.id === taskToComplete.id).completed === false, 'Today task can be uncompleted manually');

// 3.2 Future Task Completion Guard (October 2 task while Today is October 1)
console.log('\n--- Future Task Completion Guard ---');
const futureTasks = getTodayData('2026-10-02').allTodayTasks;
const futureTask = futureTasks[0];
assert(futureTask !== undefined, 'Found future task on Oct 2');

const futureCompletionResult = await toggleTaskCompletion(futureTask.id, true);
assert(futureCompletionResult === false, 'toggleTaskCompletion blocks completing future task on Oct 2');
const futureAfterCheck = getTodayData('2026-10-02').allTodayTasks.find(t => t.id === futureTask.id);
assert(futureAfterCheck.completed === false, 'Future task remains completed = false');

// 3.3 Future Task Plan Editing (Section 23, 24)
console.log('\n--- Future Task Plan Editing ---');
await editPlannedTask(futureTask.id, 'Edited DSA Plan for Tomorrow', 'Reinforce sliding window pattern', 50);
const futureAfterEdit = getTodayData('2026-10-02').allTodayTasks.find(t => t.id === futureTask.id);
assert(futureAfterEdit.title === 'Edited DSA Plan for Tomorrow', 'Future task title successfully updated');
assert(futureAfterEdit.notes === 'Reinforce sliding window pattern', 'Future task notes successfully updated');
assert(futureAfterEdit.estimated_minutes === 50, 'Future task duration successfully updated');
assert(futureAfterEdit.completed === false, 'Future task STILL remains uncompleted after plan editing');

// 3.4 Future Study Session Guard
console.log('\n--- Future Study Session Guard ---');
const futureStudyRes = await logNewStudySession({
  date: '2026-10-02',
  durationMinutes: 60,
  category: 'LEARN',
  notes: 'Future study session'
});
assert(futureStudyRes === null, 'logNewStudySession blocks logging time against future dates');

// 3.5 Past Task Review Guard & Do Today
console.log('\n--- Past Task Review Guard & Do Today ---');
// Create a task on Sep 30 (past relative to Oct 1)
const pastTask = await createNewTask({
  date: '2026-09-30',
  title: 'Past Unfinished Task',
  category: 'LEARN',
  completed: false
});
const pastCompleteRes = await toggleTaskCompletion(pastTask.id, true);
assert(pastCompleteRes === false, 'Past task cannot be directly marked complete');

// Now move past task to today using Do Today
await doTodayTask(pastTask.id, '2026-10-01');
const movedTask = getTodayData('2026-10-01').allTodayTasks.find(t => t.id === pastTask.id);
assert(movedTask !== undefined, 'Past task moved to today');
assert(movedTask.date === '2026-10-01', 'Task date updated to today');

// Now it is on today and actionable!
await toggleTaskCompletion(movedTask.id, true);
const movedCompleted = getTodayData('2026-10-01').allTodayTasks.find(t => t.id === pastTask.id);
assert(movedCompleted.completed === true, 'Task is now completed on today');

// -------------------------------------------------------------
// TEST 4: PROGRESS ROLLUP (Section 16, 17, 20)
// Task -> Today -> Week -> Month -> Progress
// -------------------------------------------------------------
console.log('\n--- 4. PROGRESS ROLLUP (TODAY -> WEEK -> MONTH -> PROGRESS) ---');
resetToInitialState();
setSimulatedToday('2026-10-01');

// Complete Answer 1 on Oct 1
const oct1Data = getTodayData('2026-10-01');
const ans1 = oct1Data.todaySemesterAnswers.find(a => a.title === 'Answer 1');
assert(ans1 !== undefined, 'Answer 1 found on Oct 1');
await toggleSemesterAnswer(ans1.id, 'completed', true);

// Verify Today rollup
const todayRollup = getTodayData('2026-10-01');
assert(todayRollup.semester.requiredCompleted === 1, `Today reflects 1 required semester answer (was ${todayRollup.semester.requiredCompleted})`);

// Verify Week rollup
const weekRollup = getWeekData('2026-10-W1');
assert(weekRollup.targets.semesterRequiredCompleted === 1, `Week reflects 1 semester answer (was ${weekRollup.targets.semesterRequiredCompleted})`);

// Verify Month rollup
const monthRollup = getMonthData('2026-10');
assert(monthRollup.targets.semesterAnswersCompleted === 1, `Month reflects 1 semester answer (was ${monthRollup.targets.semesterAnswersCompleted})`);

// Verify Progress rollup
const progressRollup = getProgressData('MONTHLY');
assert(progressRollup.summary.semesterAnswers === 1, `Progress reflects 1 semester answer (was ${progressRollup.summary.semesterAnswers})`);

// -------------------------------------------------------------
// TEST 5: AUTOMATIC MIDNIGHT ROLLOVER (Section 4)
// -------------------------------------------------------------
console.log('\n--- 5. AUTOMATIC MIDNIGHT ROLLOVER ---');
// Simulated midnight rollover from Oct 1 to Oct 2
setSimulatedToday('2026-10-02');
const afterMidnightToday = getCanonicalToday();
assert(afterMidnightToday === '2026-10-02', 'Today automatically changes to October 2');

const oct2DataAfterRollover = getTodayData(afterMidnightToday);
assert(oct2DataAfterRollover.date === '2026-10-02', 'Today page opens on October 2');
assert(oct2DataAfterRollover.dayName === 'Friday', 'Day name automatically changes to Friday');

// October 1 is now a past date, with its completion data preserved
const oct1PastData = getTodayData('2026-10-01');
assert(oct1PastData.semester.requiredCompleted === 1, 'October 1 completed data was safely preserved after midnight rollover');

// -------------------------------------------------------------
// TEST 6: DAVINCI RESOLVE SEQUENTIAL PLAYLIST (Section 14)
// 2 days/week (Tue & Sat) • 1 sequential video/day
// -------------------------------------------------------------
console.log('\n--- 6. DAVINCI RESOLVE PLAYLIST ORDER & SCHEDULE ---');
const tuesdayOct6 = getDavinciVideoForDate('2026-10-06');
const saturdayOct10 = getDavinciVideoForDate('2026-10-10');
const tuesdayOct13 = getDavinciVideoForDate('2026-10-13');
const saturdayOct17 = getDavinciVideoForDate('2026-10-17');

assert(tuesdayOct6 !== null, 'Tuesday Oct 6 has scheduled DaVinci video');
assert(saturdayOct10 !== null, 'Saturday Oct 10 has scheduled DaVinci video');
assert(tuesdayOct13 !== null, 'Tuesday Oct 13 has scheduled DaVinci video');
assert(saturdayOct17 !== null, 'Saturday Oct 17 has scheduled DaVinci video');

assert(tuesdayOct6.video_number === 2, `Tue Oct 6 is Video 2 (was ${tuesdayOct6.video_number})`);
assert(saturdayOct10.video_number === 3, `Sat Oct 10 is Video 3 (was ${saturdayOct10.video_number})`);
assert(tuesdayOct13.video_number === 4, `Tue Oct 13 is Video 4 (was ${tuesdayOct13.video_number})`);
assert(saturdayOct17.video_number === 5, `Sat Oct 17 is Video 5 (was ${saturdayOct17.video_number})`);

// -------------------------------------------------------------
// TEST 7: NO SUBJECT NAMES IN TRACKER (Section 12)
// -------------------------------------------------------------
console.log('\n--- 7. AUDIT FOR REMOVAL OF SUBJECT NAMES ---');
const checkDateData = getTodayData('2026-10-01');
const semTitles = checkDateData.tasks.SEMESTER.map(t => t.title);
console.log('Semester tasks on Today:', semTitles);
const forbiddenSubjects = ['DBMS', 'COA', 'C Programming', 'Software Engineering', 'Operating Systems', 'Python', 'Java'];
let foundForbidden = false;
semTitles.forEach(t => {
  forbiddenSubjects.forEach(sub => {
    if (t.toLowerCase() === sub.toLowerCase()) foundForbidden = true;
  });
});
assert(!foundForbidden, 'No forbidden subject names exist in Today semester tasks');

// -------------------------------------------------------------
// TEST 8: PROGRESS SUMMARY METRICS (Section 32)
// -------------------------------------------------------------
console.log('\n--- 8. PROGRESS SUMMARY METRICS ---');
const progressData = getProgressData('ALL TIME');
assert(progressData.summary.studyHours !== undefined, 'Summary has Study Hours');
assert(progressData.summary.dsaVideos !== undefined, 'Summary has DSA Videos');
assert(progressData.summary.dsaProblems !== undefined, 'Summary has DSA Problems');
assert(progressData.summary.semesterAnswers !== undefined, 'Summary has Semester Answers');
assert(progressData.summary.prime3Progress !== undefined, 'Summary has Prime 3.0');
assert(progressData.summary.individualProgress !== undefined, 'Summary has Individual Learning');
assert(progressData.summary.davinciProgress !== undefined, 'Summary has DaVinci Resolve');
assert(progressData.summary.projectProgress !== undefined, 'Summary has Projects');
assert(progressData.summary.exerciseProgress !== undefined, 'Summary has Exercise');

// -------------------------------------------------------------
// TEST 9: DESKTOP SIDEBAR & THEME PERSISTENCE (Section 27 & 28)
// -------------------------------------------------------------
console.log('\n--- 9. DESKTOP SIDEBAR & THEME STYLES ---');
const layoutCss = fs.readFileSync('css/layout.css', 'utf-8');
assert(layoutCss.includes('.app-sidebar'), 'Layout CSS has .app-sidebar');
assert(layoutCss.includes('overflow-y: auto') && layoutCss.includes('.app-main'), 'Layout CSS has independent scrolling on .app-main');

const varCss = fs.readFileSync('css/variables.css', 'utf-8');
assert(varCss.includes("body[data-theme='light']"), 'Variables CSS defines light theme tokens');
assert(varCss.includes("body[data-theme='dark']"), 'Variables CSS defines dark theme tokens');

console.log('\n========================================================');
console.log(`TOTAL PASSED: ${passed} / ${passed + failed}`);
console.log('========================================================');

if (failed > 0) {
  console.error(`\n❌ ${failed} tests failed!`);
  process.exit(1);
} else {
  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

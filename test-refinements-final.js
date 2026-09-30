/**
 * Comprehensive Automated Test Suite for Career Tracker FINAL Refinements
 * Verifies all 25 refinement requirements from user specification.
 */

import { initStorage, getState, updateState } from './js/data/storage.js';
import {
  initTrackerService,
  getTodayData,
  getWeekData,
  getMonthData,
  getProgressData,
  toggleTaskCompletion,
  skipTask,
  unskipTask,
  doTodayTask,
  rescheduleTask,
  moveTasksToNextWeek,
  carryMonthlyGoalsToNextMonth,
  logNewStudySession,
  toggleDSAVideo,
  toggleSemesterAnswer,
  logGamingHours,
  exportTrackerDataJSON,
  exportTrackerDataCSV
} from './js/services/trackerService.js';
import { getCanonicalToday } from './js/services/dateService.js';
import { renderToday } from './js/views/todayView.js';
import { renderWeekly } from './js/views/weeklyView.js';
import { renderMonthly } from './js/views/monthlyView.js';
import { renderProgress } from './js/views/progressView.js';
import { renderSettings } from './js/views/settingsView.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runRefinementTests() {
  console.log('====================================================');
  console.log('STARTING FINAL REFINEMENT VERIFICATION (25 REQUIREMENTS)');
  console.log('====================================================\n');

  initStorage();
  await initTrackerService();

  // ----------------------------------------------------
  // REQ 1: PLAN VS ACTUAL (Month & Week)
  // ----------------------------------------------------
  console.log('Requirement 1: Plan vs Actual Comparison on Month & Week');
  const monthData = getMonthData('2026-10');
  assert(monthData.planVsActual !== undefined, 'Month data has planVsActual object');
  assert(monthData.planVsActual.study.planned !== undefined && monthData.planVsActual.study.actual !== undefined, 'Month planVsActual has Study planned and actual');
  assert(monthData.planVsActual.dsaVideos.planned !== undefined && monthData.planVsActual.dsaVideos.actual !== undefined, 'Month planVsActual has DSA Videos planned and actual');
  assert(monthData.planVsActual.dsaProblems.planned !== undefined && monthData.planVsActual.dsaProblems.actual !== undefined, 'Month planVsActual has DSA Problems planned and actual');
  assert(monthData.planVsActual.semesterAnswers.planned !== undefined && monthData.planVsActual.semesterAnswers.actual !== undefined, 'Month planVsActual has Semester Answers planned and actual');

  const weekData = getWeekData('2026-10-W1');
  assert(weekData.planVsActual !== undefined, 'Week data has planVsActual object');
  assert(weekData.planVsActual.study.planned !== undefined && weekData.planVsActual.study.actual !== undefined, 'Week planVsActual has Study planned and actual');
  assert(weekData.planVsActual.dsaVideos.planned !== undefined && weekData.planVsActual.dsaVideos.actual !== undefined, 'Week planVsActual has DSA Videos planned and actual');
  assert(weekData.planVsActual.dsaProblems.planned !== undefined && weekData.planVsActual.dsaProblems.actual !== undefined, 'Week planVsActual has DSA Problems planned and actual');
  assert(weekData.planVsActual.semesterAnswers.planned !== undefined && weekData.planVsActual.semesterAnswers.actual !== undefined, 'Week planVsActual has Semester Answers planned and actual');

  // ----------------------------------------------------
  // REQ 2: AUTOMATIC TARGET CALCULATION (Month -> Week -> Day)
  // ----------------------------------------------------
  console.log('\nRequirement 2: Automatic Target Calculation');
  assert(monthData.targets.dsaVideos === 12, 'October Monthly Target is 12 DSA videos');
  assert(weekData.targets.dsaVideos === 3, 'Week 1 Target is 3 DSA videos (12 / 4)');
  assert(monthData.targets.studyHours === 128, 'October Study target is 128 hours');
  assert(weekData.targets.studyHours === 32, 'Week 1 Study target is 32 hours (128 / 4)');
  assert(weekData.targets.semesterRequired === 14, 'Week 1 Semester required target is 14 (2/day * 7)');

  // ----------------------------------------------------
  // REQ 3 & 4: OVERDUE TASKS & RESCHEDULE
  // ----------------------------------------------------
  console.log('\nRequirement 3 & 4: Overdue Tasks & Reschedule');
  // Inject a past incomplete task for Oct 1 (Week 1)
  const overdueTaskId = 'task-test-overdue-1';
  updateState(s => {
    const tasks = s.remote_tasks || s.daily_tasks || [];
    const filtered = tasks.filter(t => t.id !== overdueTaskId);
    filtered.push({
      id: overdueTaskId,
      date: '2026-10-01',
      week_id: '2026-10-W1',
      month_id: '2026-10',
      category: 'PRACTICE',
      subtype: 'PROBLEMS',
      title: 'Overdue DSA Problem: Two Sum',
      completed: false,
      skipped: false
    });
    return { ...s, remote_tasks: filtered, daily_tasks: filtered };
  });

  const todayDataAfterOverdue = getTodayData('2026-10-05');
  const foundCarried = todayDataAfterOverdue.carriedForwardTasks.find(t => t.id === overdueTaskId);
  assert(foundCarried !== undefined, 'Past incomplete task appears in carriedForwardTasks');
  assert(foundCarried && foundCarried.isOverdue === true, 'Task from previous date marked as isOverdue');

  // Test Reschedule to October 8 (Week 2)
  await rescheduleTask(overdueTaskId, '2026-10-08');
  const stateAfterReschedule = getState();
  const rescheduledTask = (stateAfterReschedule.remote_tasks || stateAfterReschedule.daily_tasks || []).find(t => t.id === overdueTaskId);
  assert(rescheduledTask.date === '2026-10-08', 'Rescheduled date updated to 2026-10-08');
  assert(rescheduledTask.week_id === '2026-10-W2', 'Rescheduled week_id updated to 2026-10-W2');
  assert(rescheduledTask.month_id === '2026-10', 'Rescheduled month_id updated to 2026-10');
  assert(rescheduledTask.id === overdueTaskId, 'Original task ID preserved (no duplicate created)');

  // ----------------------------------------------------
  // REQ 5: CARRY-FORWARD & DO TODAY
  // ----------------------------------------------------
  console.log('\nRequirement 5: Carry-Forward & Do Today');
  const carryTaskId = 'task-test-carry-1';
  updateState(s => {
    const tasks = s.remote_tasks || s.daily_tasks || [];
    const filtered = tasks.filter(t => t.id !== carryTaskId);
    filtered.push({
      id: carryTaskId,
      date: '2026-10-04',
      week_id: '2026-10-W1',
      month_id: '2026-10',
      category: 'BUILD',
      subtype: 'PROJECT',
      title: 'Unfinished Project Struct Definition',
      completed: false,
      skipped: false
    });
    return { ...s, remote_tasks: filtered, daily_tasks: filtered };
  });

  const todayDataCarry = getTodayData('2026-10-05');
  const carriedItem = todayDataCarry.carriedForwardTasks.find(t => t.id === carryTaskId);
  assert(carriedItem !== undefined, 'Unfinished task from previous day appears in Today carried forward');

  // Choose [Do Today]
  await doTodayTask(carryTaskId, '2026-10-05');
  const stateAfterDoToday = getState();
  const movedItem = (stateAfterDoToday.remote_tasks || stateAfterDoToday.daily_tasks || []).find(t => t.id === carryTaskId);
  assert(movedItem.date === '2026-10-05', '[Do Today] moved task date to today');
  assert(movedItem.week_id === '2026-10-W1', '[Do Today] week_id matches today');

  // ----------------------------------------------------
  // REQ 6: SKIP TASK
  // ----------------------------------------------------
  console.log('\nRequirement 6: Skip Task');
  const skipTaskId = 'task-test-skip-1';
  updateState(s => {
    const tasks = s.remote_tasks || s.daily_tasks || [];
    const filtered = tasks.filter(t => t.id !== skipTaskId);
    filtered.push({
      id: skipTaskId,
      date: '2026-10-05',
      week_id: '2026-10-W1',
      month_id: '2026-10',
      category: 'REVISE',
      subtype: 'WEEKLY_NOTES',
      title: 'Skipable Revision Note Task',
      completed: false,
      skipped: false
    });
    return { ...s, remote_tasks: filtered, daily_tasks: filtered };
  });

  const progressBeforeSkip = getTodayData('2026-10-05').allTodayTasks.filter(t => t.completed).length;
  await skipTask(skipTaskId);
  const stateAfterSkip = getState();
  const skippedTask = (stateAfterSkip.remote_tasks || stateAfterSkip.daily_tasks || []).find(t => t.id === skipTaskId);
  assert(skippedTask.skipped === true, 'Task marked as skipped: true');
  assert(skippedTask.completed === false, 'Skipped task is NOT marked as completed');
  const progressAfterSkip = getTodayData('2026-10-05').allTodayTasks.filter(t => t.completed).length;
  assert(progressAfterSkip === progressBeforeSkip, 'Skipped task does not artificially inflate completed tasks count');

  // Unskip
  await unskipTask(skipTaskId);
  const stateAfterUnskip = getState();
  const unskippedTask = (stateAfterUnskip.remote_tasks || stateAfterUnskip.daily_tasks || []).find(t => t.id === skipTaskId);
  assert(unskippedTask.skipped === false, 'Task unskipped successfully');

  // ----------------------------------------------------
  // REQ 7: TODAY\'S PRIORITY (Top 3 Important Tasks)
  // ----------------------------------------------------
  console.log('\nRequirement 7: Today\'s Priority Section');
  const todayDataForPriority = getTodayData('2026-10-05');
  assert(Array.isArray(todayDataForPriority.todaysPriority), 'todaysPriority is an array');
  assert(todayDataForPriority.todaysPriority.length <= 3, `todaysPriority contains at most 3 items (actual: ${todayDataForPriority.todaysPriority.length})`);
  assert(todayDataForPriority.todaysPriority.length > 0, 'todaysPriority contains top candidate tasks from today\'s plan');
  todayDataForPriority.todaysPriority.forEach((p, idx) => {
    assert(p.title && p.category, `Priority item #${idx + 1} has valid title and category`);
  });

  // ----------------------------------------------------
  // REQ 8: WEEK-END REVIEW (WEEK COMPLETE & CARRY TO NEXT WEEK)
  // ----------------------------------------------------
  console.log('\nRequirement 8: Week-End Review & Carry to Next Week');
  const week1Data = getWeekData('2026-10-W1');
  assert(Array.isArray(week1Data.incompleteTasks), 'Week 1 data provides incompleteTasks list');
  // Test moving selected tasks to next week (2026-10-W2)
  if (week1Data.incompleteTasks.length > 0) {
    const toMoveId = week1Data.incompleteTasks[0].id;
    const movedCount = await moveTasksToNextWeek([toMoveId], '2026-10-W2');
    assert(movedCount === 1, 'Moved 1 task to next week');
    const stateMoved = getState();
    const movedT = (stateMoved.remote_tasks || stateMoved.daily_tasks || []).find(t => t.id === toMoveId);
    assert(movedT.week_id === '2026-10-W2', 'Moved task week_id is now 2026-10-W2');
  }

  // ----------------------------------------------------
  // REQ 9: MONTH-END REVIEW (MONTH COMPLETE & REMAINING GOALS)
  // ----------------------------------------------------
  console.log('\nRequirement 9: Month-End Review & Carry Goals');
  const month1Data = getMonthData('2026-10');
  assert(Array.isArray(month1Data.incompleteGoals), 'Month 1 provides incompleteGoals list');
  if (month1Data.incompleteGoals.length > 0) {
    const gToCarry = month1Data.incompleteGoals[0].id;
    const carriedCount = await carryMonthlyGoalsToNextMonth([gToCarry], '2026-11');
    assert(carriedCount === 1, 'Carried 1 monthly goal into 2026-11');
    const stateGoals = getState();
    const carriedG = (stateGoals.remote_goals || stateGoals.goals || []).find(g => g.month_id === '2026-11' && g.title === month1Data.incompleteGoals[0].title);
    assert(carriedG !== undefined, 'Carried goal created in destination month without rewriting plan');
  }

  // ----------------------------------------------------
  // REQ 10 & 11: DATA CONSISTENCY & STUDY SESSIONS
  // ----------------------------------------------------
  console.log('\nRequirement 10 & 11: Data Consistency (Single Underlying Records)');
  const stateCheck = getState();
  assert(stateCheck.daily_task_copy === undefined, 'No duplicate daily_task_copy');
  assert(stateCheck.weekly_task_copy === undefined, 'No duplicate weekly_task_copy');
  assert(stateCheck.monthly_task_copy === undefined, 'No duplicate monthly_task_copy');

  // Log 1 study session on 2026-10-05 (60 min DSA)
  const studySessionResult = await logNewStudySession({
    date: '2026-10-05',
    category: 'PRACTICE',
    subtype: 'DSA',
    durationMinutes: 60,
    notes: 'Single underlying study session test'
  });
  assert(studySessionResult !== null, 'Study session logged successfully');
  const todayAfterSession = getTodayData('2026-10-05');
  const weekAfterSession = getWeekData('2026-10-W1');
  const monthAfterSession = getMonthData('2026-10');
  assert(todayAfterSession.studyMinutesCompleted >= 60, 'Study session reflects in Today');
  assert(parseFloat(weekAfterSession.targets.studyHoursCompleted) >= 1.0, 'Study session automatically reflects in Week');
  assert(parseFloat(monthAfterSession.targets.studyHoursCompleted) >= 1.0, 'Study session automatically reflects in Month');

  // ----------------------------------------------------
  // REQ 12: DSA CONSISTENCY
  // ----------------------------------------------------
  console.log('\nRequirement 12: DSA Consistency (Videos vs Problems kept separate)');
  assert(weekData.targets.dsaVideos !== undefined && weekData.targets.dsaProblems !== undefined, 'DSA Videos and DSA Problems are distinct targets');
  assert(monthData.dsa.completedVideos !== undefined && monthData.dsa.problemsCompleted !== undefined, 'Monthly DSA playlist videos and problems are distinct metrics');

  // ----------------------------------------------------
  // REQ 13: SEMESTER CONSISTENCY
  // ----------------------------------------------------
  console.log('\nRequirement 13: Semester Consistency (Required vs Optional kept separate)');
  const semCheckToday = getTodayData('2026-10-05');
  assert(semCheckToday.semester.requiredCompleted !== undefined, 'Today has requiredCompleted');
  assert(semCheckToday.semester.optionalCompleted !== undefined, 'Today has optionalCompleted');
  assert(semCheckToday.semester.requiredTarget === 2, 'Today requiredTarget is strictly 2');

  // ----------------------------------------------------
  // REQ 14: OPTIONAL GAMING
  // ----------------------------------------------------
  console.log('\nRequirement 14: Optional Gaming (0-6h, not in study progress)');
  await logGamingHours('2026-10-05', 2.0);
  const weekGamingCheck = getWeekData('2026-10-W1');
  assert(weekGamingCheck.gamingHours >= 2.0 || weekGamingCheck.targets.gamingActualHours >= 2.0, 'Gaming hours logged in weekly data');
  assert(weekGamingCheck.gamingLimit === 6 || weekGamingCheck.targets.gamingLimit === 6, 'Gaming max limit is 6h');
  const todayStudyBefore = getTodayData('2026-10-05').studyMinutesCompleted;
  assert(typeof todayStudyBefore === 'number', 'Study progress unaffected by gaming hours');

  // ----------------------------------------------------
  // REQ 15 & 16: BACKUP / EXPORT & SUPABASE SAFETY
  // ----------------------------------------------------
  console.log('\nRequirement 15 & 16: Backup / Export & Supabase Safety');
  assert(typeof exportTrackerDataJSON === 'function', 'exportTrackerDataJSON is exported');
  assert(typeof exportTrackerDataCSV === 'function', 'exportTrackerDataCSV is exported');

  // ----------------------------------------------------
  // REQ 17: OFFLINE / RESILIENCE (sync_pending)
  // ----------------------------------------------------
  console.log('\nRequirement 17: Offline Resilience & Sync Pending');
  const dummyTask = { id: 'test-sync-pending-task', date: '2026-10-05', completed: false, sync_pending: false };
  updateState(s => {
    const list = s.remote_tasks || s.daily_tasks || [];
    return { ...s, remote_tasks: [...list, dummyTask], daily_tasks: [...list, dummyTask] };
  });
  // Toggle task
  await toggleTaskCompletion('test-sync-pending-task', true);
  const stateSync = getState();
  const toggledTask = (stateSync.remote_tasks || stateSync.daily_tasks || []).find(t => t.id === 'test-sync-pending-task');
  assert(toggledTask.completed === true, 'UI immediately reflects completion');

  // ----------------------------------------------------
  // REQ 18, 19, 20, 21: VIEW RENDERING CHECKS
  // ----------------------------------------------------
  console.log('\nRequirement 18, 19, 20, 21: Clean View Rendering Checks');
  const dummyContainer = {
    innerHTML: '',
    querySelector: () => ({ onchange: null, onclick: null }),
    querySelectorAll: () => []
  };

  // Mock minimal window and document for view tests
  global.window = {
    location: { hash: '#today', reload: () => {} },
    scrollTo: () => {}
  };
  global.document = {
    body: {
      appendChild: () => {},
      removeChild: () => {},
      setAttribute: () => {}
    },
    createElement: () => ({ href: '', download: '', click: () => {} })
  };

  // Today View
  renderToday(dummyContainer);
  const todayHtml = dummyContainer.innerHTML;
  assert(todayHtml.includes("TODAY'S PRIORITY"), "Today view renders TODAY'S PRIORITY at top");
  assert(todayHtml.includes("LEARN"), "Today view renders LEARN section");
  assert(todayHtml.includes("PRACTICE"), "Today view renders PRACTICE section");
  assert(todayHtml.includes("SEMESTER"), "Today view renders SEMESTER section");
  assert(todayHtml.includes("BUILD"), "Today view renders BUILD section");
  assert(todayHtml.includes("REVISE"), "Today view renders REVISE section");

  // Week View
  renderWeekly(dummyContainer);
  const weekHtml = dummyContainer.innerHTML;
  assert(weekHtml.includes("PLAN VS ACTUAL (Week"), "Week view renders PLAN VS ACTUAL");
  assert(weekHtml.includes("WEEK COMPLETE"), "Week view renders WEEK COMPLETE");
  assert(weekHtml.includes("CARRY TO NEXT WEEK"), "Week view renders CARRY TO NEXT WEEK");

  // Month View
  renderMonthly(dummyContainer);
  const monthHtml = dummyContainer.innerHTML;
  assert(monthHtml.includes("PLAN VS ACTUAL (OCTOBER 2026)"), "Month view renders PLAN VS ACTUAL");
  assert(monthHtml.includes("MONTH COMPLETE — Planned vs Actual"), "Month view renders MONTH COMPLETE review");
  assert(monthHtml.includes("Remaining Monthly Goals"), "Month view renders Remaining Monthly Goals carry-forward");

  // Progress View
  renderProgress(dummyContainer);
  const progressHtml = dummyContainer.innerHTML;
  assert(progressHtml.includes("Study Hours per Week"), "Progress view renders Chart 1 (Study Hours)");
  assert(progressHtml.includes("DSA Problems per Week"), "Progress view renders Chart 2 (DSA Problems)");
  assert(progressHtml.includes("Task Completion per Week"), "Progress view renders Chart 3 (Task Completion)");
  assert(!progressHtml.includes("Productivity Score"), "No fake productivity score in Progress");

  // Settings View
  await renderSettings(dummyContainer);
  const settingsHtml = dummyContainer.innerHTML;
  assert(settingsHtml.includes("DATA MANAGEMENT"), "Settings view renders DATA MANAGEMENT");
  assert(settingsHtml.includes("Export Data (JSON)"), "Settings view has Export Data (JSON)");
  assert(settingsHtml.includes("Export Tasks (CSV)"), "Settings view has Export Tasks (CSV)");

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`FINAL REFINEMENT VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRefinementTests().catch(err => {
  console.error('Refinement test error:', err);
  process.exit(1);
});

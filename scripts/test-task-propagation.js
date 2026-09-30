import { PROGRAM_START_DATE, setSimulatedToday } from '../js/services/dateService.js';
import { initStorage, getState } from '../js/data/storage.js';
import {
  getTodayData,
  getWeekData,
  getMonthData,
  getDashboardData,
  toggleTaskCompletion,
  syncFromSupabase
} from '../js/services/trackerService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function testPropagation() {
  console.log('Testing Task Completion Propagation across Today -> Week -> Month -> Dashboard...');
  initStorage();
  await syncFromSupabase();

  setSimulatedToday('2026-10-01');

  // Verify initial state
  const initialToday = getTodayData('2026-10-01');
  const initialWeek = getWeekData('2026-10-W1');
  const initialMonth = getMonthData('2026-10');
  const initialDash = getDashboardData('MONTHLY');

  assert(initialToday.completedTasks === 0, 'Today starts at 0 completed');
  assert(initialWeek.completedTasksCount === 0, 'Week starts at 0 completed');
  assert(initialMonth.completedTasks === 0, 'Month starts at 0 completed');
  assert(initialDash.todayStats.tasksCompleted === 0, 'Dashboard starts at 0 completed');

  // Complete task-101 (Prime 3.0)
  const taskToToggle = initialToday.allTodayTasks.find(t => t.id === 'task-101');
  assert(!!taskToToggle, 'Found task-101 for Oct 1');

  console.log('\nToggling task-101 to COMPLETED...');
  const toggleResult = await toggleTaskCompletion('task-101', true);
  assert(toggleResult !== false, 'Task-101 toggle succeeded');

  const afterToday = getTodayData('2026-10-01');
  const afterWeek = getWeekData('2026-10-W1');
  const afterMonth = getMonthData('2026-10');
  const afterDash = getDashboardData('MONTHLY');

  assert(afterToday.completedTasks === 1, `Today updated to 1 completed (got: ${afterToday.completedTasks})`);
  assert(afterWeek.completedTasksCount === 1, `Week updated to 1 completed (got: ${afterWeek.completedTasksCount})`);
  assert(afterMonth.completedTasks === 1, `Month updated to 1 completed (got: ${afterMonth.completedTasks})`);
  assert(afterDash.todayStats.tasksCompleted === 1, `Dashboard updated to 1 completed (got: ${afterDash.todayStats.tasksCompleted})`);
  assert(afterDash.thisWeekStats.tasksCompleted === 1, `Dashboard week stats updated to 1 (got: ${afterDash.thisWeekStats.tasksCompleted})`);
  assert(afterDash.thisMonthStats.tasksCompleted === 1, `Dashboard month stats updated to 1 (got: ${afterDash.thisMonthStats.tasksCompleted})`);

  // Now UNCHECK task-101 back to 0
  console.log('\nUnchecking task-101 back to UNCOMPLETED (Clean state restoration)...');
  const uncheckResult = await toggleTaskCompletion('task-101', false);
  assert(uncheckResult !== false, 'Task-101 uncheck succeeded');

  const resetToday = getTodayData('2026-10-01');
  const resetWeek = getWeekData('2026-10-W1');
  const resetMonth = getMonthData('2026-10');
  const resetDash = getDashboardData('MONTHLY');

  assert(resetToday.completedTasks === 0, `Today reset to 0 (got: ${resetToday.completedTasks})`);
  assert(resetWeek.completedTasksCount === 0, `Week reset to 0 (got: ${resetWeek.completedTasksCount})`);
  assert(resetMonth.completedTasks === 0, `Month reset to 0 (got: ${resetMonth.completedTasks})`);
  assert(resetDash.todayStats.tasksCompleted === 0, `Dashboard reset to 0 (got: ${resetDash.todayStats.tasksCompleted})`);

  setSimulatedToday(null);
  console.log(`\nPropagation Test Result: ${passed} PASSED, ${failed} FAILED`);
  process.exit(failed > 0 ? 1 : 0);
}

testPropagation().catch(err => {
  console.error(err);
  process.exit(1);
});

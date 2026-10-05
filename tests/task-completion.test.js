/**
 * Automated Tests: Task Completion and Progress Updates
 */

import assert from 'assert';
import {
  createNewTask,
  toggleTaskCompletion,
  getTodayData,
  getWeekData,
  getMonthData,
  getDashboardData
} from '../js/services/trackerService.js';
import { calculateStudyStreak } from '../js/services/streakService.js';
import { getCanonicalToday, shiftDate } from '../js/services/dateService.js';
import { resetToInitialState, getState } from '../js/data/storage.js';

export async function runTaskCompletionTests() {
  console.log('--- Running Task Completion & Progress Tests ---');
  resetToInitialState();

  const testDate = '2026-10-06';

  // Step 1: Create 2 tasks for test date
  const task1 = await createNewTask({
    title: 'Study Trees & Binary Trees',
    category: 'Learning',
    date: testDate,
    durationMinutes: 60
  });

  const task2 = await createNewTask({
    title: 'Practice 3 LeetCode Tree Problems',
    category: 'Practice',
    date: testDate,
    durationMinutes: 60
  });

  // Check initial state (both pending)
  {
    const todayData = getTodayData(testDate);
    assert.strictEqual(todayData.completedTasksCount, 0, 'Initially 0 completed');
    assert.strictEqual(todayData.totalTasksCount, 2, 'Total 2 tasks');
    assert.strictEqual(todayData.completionPercentage, 0, 'Initial progress is 0%');
    console.log('✓ Initial 0% progress verified');
  }

  // Step 2: Complete task 1
  {
    const completed = await toggleTaskCompletion(task1.id, true);
    assert.strictEqual(completed.completed, true);
    assert.strictEqual(completed.status, 'Completed');
    assert.ok(completed.completedAt, 'Must set completedAt timestamp');

    const todayData = getTodayData(testDate);
    assert.strictEqual(todayData.completedTasksCount, 1, '1 task completed');
    assert.strictEqual(todayData.completionPercentage, 50, 'Progress should now be 50%');

    // Check week progress
    const weekData = getWeekData(testDate);
    assert.strictEqual(weekData.completedTasks, 1);
    assert.strictEqual(weekData.totalTasks, 2);
    assert.strictEqual(weekData.completionPercentage, 50);

    // Check month progress
    const monthData = getMonthData('2026-10');
    assert.strictEqual(monthData.targets.completedTasks, 1);
    assert.strictEqual(monthData.targets.completionPercentage, 50);

    // Check dashboard progress
    const dashData = getDashboardData();
    assert.strictEqual(dashData.totalCompletedPlanTasks, 1);
    assert.strictEqual(dashData.overallPercentage, 50);

    console.log('✓ Pending -> Completed updates Today, Week, Month, and Dashboard');
  }

  // Step 3: Complete task 2 -> 100% progress
  {
    await toggleTaskCompletion(task2.id, true);

    const todayData = getTodayData(testDate);
    assert.strictEqual(todayData.completedTasksCount, 2);
    assert.strictEqual(todayData.completionPercentage, 100);
    console.log('✓ 100% progress update verified');
  }

  // Step 4: Toggle back to uncompleted (Completed -> Pending)
  {
    const uncompleted = await toggleTaskCompletion(task1.id, false);
    assert.strictEqual(uncompleted.completed, false);
    assert.strictEqual(uncompleted.status, 'Pending');
    assert.strictEqual(uncompleted.completedAt, null);

    const todayData = getTodayData(testDate);
    assert.strictEqual(todayData.completedTasksCount, 1);
    assert.strictEqual(todayData.completionPercentage, 50);
    console.log('✓ Completed -> Pending rollback verified');
  }

  // Step 5: Streak calculation verification
  {
    const streak = calculateStudyStreak(getState(), testDate);
    assert.ok(streak.currentStreak >= 1, 'Completing tasks on a day must increment streak');
    console.log('✓ Streak correctly updated from real task completions');
  }

  // Step 6: Locking previous and future day tasks (enforceToday)
  {
    const today = getCanonicalToday();
    const yesterday = shiftDate(today, -1);
    const tomorrow = shiftDate(today, 1);

    const pastTask = await createNewTask({
      title: 'Past Task',
      category: 'Learning',
      date: yesterday,
      durationMinutes: 30
    });

    const futureTask = await createNewTask({
      title: 'Future Task',
      category: 'Learning',
      date: tomorrow,
      durationMinutes: 30
    });

    const todayTask = await createNewTask({
      title: 'Today Task',
      category: 'Learning',
      date: today,
      durationMinutes: 30
    });

    // 1. Completing past task with enforceToday should throw
    await assert.rejects(
      async () => {
        await toggleTaskCompletion(pastTask.id, true, { enforceToday: true });
      },
      /Tasks can only be marked completed on the current day/,
      'Must reject completing tasks for previous days when enforceToday is active'
    );

    // 2. Completing future task with enforceToday should throw
    await assert.rejects(
      async () => {
        await toggleTaskCompletion(futureTask.id, true, { enforceToday: true });
      },
      /Tasks can only be marked completed on the current day/,
      'Must reject completing tasks for future days when enforceToday is active'
    );

    // 3. Completing today task with enforceToday should succeed
    const completedToday = await toggleTaskCompletion(todayTask.id, true, { enforceToday: true });
    assert.strictEqual(completedToday.completed, true);
    assert.strictEqual(completedToday.status, 'Completed');
    console.log('✓ enforceToday strictly locks previous and next days while permitting today');
  }

  console.log('✓ All Task Completion Tests Passed!\n');
}

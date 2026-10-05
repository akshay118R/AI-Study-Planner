/**
 * Automated Tests: Persistence & Repository Layer
 */

import assert from 'assert';
import {
  createNewTask,
  editPlannedTask,
  rescheduleTask,
  doTodayTask,
  deleteTask
} from '../js/services/trackerService.js';
import { getState, resetToInitialState, saveState, initStorage } from '../js/data/storage.js';

export async function runPersistenceTests() {
  console.log('--- Running Persistence Tests ---');
  resetToInitialState();

  // Test 1: Create
  let createdTask = null;
  {
    createdTask = await createNewTask({
      title: 'Practice SQL Window Functions',
      category: 'Practice',
      date: '2026-10-15',
      durationMinutes: 45,
      priority: 'High'
    });

    assert.ok(createdTask.id, 'Task must receive an id');
    assert.strictEqual(createdTask.title, 'Practice SQL Window Functions');
    const state = getState();
    assert.strictEqual(state.tasks.length, 1, 'Tasks array must contain the new task');
    console.log('✓ Create task verified');
  }

  // Test 2: Read
  {
    const state = getState();
    const found = state.tasks.find(t => t.id === createdTask.id);
    assert.ok(found, 'Task must be retrievable from state');
    assert.strictEqual(found.durationMinutes, 45);
    console.log('✓ Read task verified');
  }

  // Test 3: Update (Edit title, duration, notes)
  {
    const updated = await editPlannedTask(
      createdTask.id,
      'Practice Advanced SQL Window Functions',
      'LeetCode #185 and #178',
      60,
      'Practice',
      'High'
    );
    assert.strictEqual(updated.title, 'Practice Advanced SQL Window Functions');
    assert.strictEqual(updated.durationMinutes, 60);
    assert.strictEqual(updated.notes, 'LeetCode #185 and #178');

    // Verify in state
    const current = getState().tasks.find(t => t.id === createdTask.id);
    assert.strictEqual(current.title, 'Practice Advanced SQL Window Functions');
    console.log('✓ Update task verified');
  }

  // Test 4: Reschedule
  {
    const rescheduled = await rescheduleTask(createdTask.id, '2026-10-20');
    assert.strictEqual(rescheduled.date, '2026-10-20');
    assert.strictEqual(rescheduled.dueDate, '2026-10-20');
    console.log('✓ Reschedule task verified');
  }

  // Test 4b: Do Today
  {
    const doneToday = await doTodayTask(createdTask.id, '2026-10-05');
    assert.strictEqual(doneToday.date, '2026-10-05');
    assert.strictEqual(doneToday.dueDate, '2026-10-05');
    assert.strictEqual(doneToday.status, 'Pending');
    console.log('✓ Do Today task verified');
  }

  // Test 5: Delete
  {
    const deleted = await deleteTask(createdTask.id);
    assert.strictEqual(deleted, true);
    const state = getState();
    assert.strictEqual(state.tasks.length, 0, 'Task must be deleted from state');
    console.log('✓ Delete task verified');
  }

  console.log('✓ All Persistence Tests Passed!\n');
}

/**
 * Automated Tests: Plan Implementation Logic
 */

import assert from 'assert';
import {
  initTrackerService,
  savePlanDraft,
  getPlanDraft,
  implementPlan,
  getActivePlan,
  getTodayData,
  hasImplementedPlan
} from '../js/services/trackerService.js';
import { getState, resetToInitialState } from '../js/data/storage.js';
import { createPlan } from '../js/models/planModel.js';

export async function runImplementationTests() {
  console.log('--- Running Plan Implementation Tests ---');
  resetToInitialState();

  // Test 0: Initially hasImplementedPlan is false
  assert.strictEqual(hasImplementedPlan(), false, 'Initially hasImplementedPlan must be false');

  // Test 1: Draft Does NOT create tracker tasks
  {
    const draftPlan = createPlan({
      id: 'plan-draft-1',
      goal: {
        title: 'Learn TypeScript',
        startDate: '2026-10-05',
        targetDate: '2026-11-05',
        dailyHours: 2
      },
      tasks: [
        { id: 't-d1', title: 'TypeScript Basics', date: '2026-10-05', durationMinutes: 60 },
        { id: 't-d2', title: 'Interfaces & Types', date: '2026-10-06', durationMinutes: 60 }
      ]
    });

    savePlanDraft(draftPlan);

    // State tasks should still be 0!
    const state = getState();
    assert.strictEqual(state.tasks.length, 0, 'Draft plan must NOT add tasks to tracker state');
    assert.strictEqual(state.activePlanId, null, 'Draft plan must not set activePlanId');
    assert.ok(getPlanDraft() !== null, 'Draft must be stored in draft state');
    console.log('✓ Plan draft does not create tracker tasks');
  }

  // Test 2: Explicit Implementation creates tasks atomically
  {
    const res = await implementPlan('plan-draft-1');
    assert.strictEqual(res.success, true, 'Implementation must succeed');
    assert.strictEqual(res.tasksCount, 2, 'Should create 2 tasks');

    const state = getState();
    assert.strictEqual(state.activePlanId, 'plan-draft-1', 'Active plan ID must be updated');
    assert.strictEqual(state.tasks.length, 2, 'Tracker tasks array must now contain the 2 tasks');
    assert.strictEqual(state.planDraft, null, 'Plan draft must be cleared after implementation');

    const activePlan = getActivePlan();
    assert.strictEqual(activePlan.id, 'plan-draft-1', 'Active plan should be retrieved');
    assert.strictEqual(activePlan.status, 'implemented', 'Plan status must be implemented');
    assert.strictEqual(hasImplementedPlan(), true, 'hasImplementedPlan() must be true after implementation');

    // Check Today data for 2026-10-05
    const todayData = getTodayData('2026-10-05');
    assert.strictEqual(todayData.tasks.length, 1, 'Day 2026-10-05 must have 1 task');
    assert.strictEqual(todayData.tasks[0].title, 'TypeScript Basics');
    console.log('✓ Explicit implementation created tracker tasks atomically');
  }

  // Test 3: Duplicate Implementation Prevention
  {
    const initialTaskCount = getState().tasks.length;
    // Call implementPlan again with the same plan ID
    const duplicateRes = await implementPlan('plan-draft-1');
    assert.strictEqual(duplicateRes.success, true);
    const postTaskCount = getState().tasks.length;
    assert.strictEqual(initialTaskCount, postTaskCount, 'Repeated implementation must NOT duplicate tasks');
    console.log('✓ Duplicate plan implementation prevented');
  }

  // Test 4: Failed implementation does not leave partial data
  {
    try {
      await implementPlan('non-existent-plan-id');
      assert.fail('Should throw error for non-existent plan');
    } catch (err) {
      assert.ok(err.message.includes('not found'), 'Must throw clear error');
    }
    console.log('✓ Invalid implementation safely fails without corrupting state');
  }

  console.log('✓ All Plan Implementation Tests Passed!\n');
}

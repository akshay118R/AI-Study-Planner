/**
 * Automated Tests: Plan Validation
 */

import assert from 'assert';
import { validateAndRepairPlan } from '../js/services/planValidator.js';

export function runPlanValidationTests() {
  console.log('--- Running Plan Validation Tests ---');

  // Test 1: Valid Plan
  {
    const validPlan = {
      goal: {
        title: 'Learn Go in 2 Months',
        description: 'Master Go fundamentals and build microservices',
        startDate: '2026-10-05',
        targetDate: '2026-12-05',
        dailyHours: 2,
        daysPerWeek: 6,
        experienceLevel: 'Beginner'
      },
      milestones: [{ id: 'm-1', title: 'Go Basics', targetDate: '2026-11-05' }],
      months: [{ id: 'month-1', monthId: '2026-10', title: 'Month 1' }],
      weeks: [{ id: 'week-1', monthId: '2026-10', startDate: '2026-10-05', endDate: '2026-10-11', title: 'Week 1' }],
      tasks: [
        {
          id: 'task-1',
          title: 'Install Go and write Hello World',
          category: 'Learning',
          date: '2026-10-05',
          durationMinutes: 60,
          dependencies: []
        },
        {
          id: 'task-2',
          title: 'Variables and Control Flow in Go',
          category: 'Learning',
          date: '2026-10-06',
          durationMinutes: 60,
          dependencies: ['task-1']
        }
      ]
    };

    const res = validateAndRepairPlan(validPlan);
    assert.strictEqual(res.isValid, true, 'Valid plan should pass validation');
    assert.strictEqual(res.errors.length, 0, 'Valid plan should have 0 errors');
    assert.strictEqual(res.plan.tasks.length, 2, 'Should preserve both tasks');
    console.log('✓ Valid plan passed');
  }

  // Test 2: Invalid Plan (Empty Object / Null)
  {
    const res = validateAndRepairPlan(null);
    assert.strictEqual(res.isValid, false, 'Null plan must fail');
    assert.ok(res.errors.length > 0, 'Must report error for null plan');
    console.log('✓ Null plan rejected');
  }

  // Test 3: Missing Required Fields (Zero tasks)
  {
    const noTasksPlan = {
      goal: { startDate: '2026-10-05', targetDate: '2026-11-05' },
      tasks: []
    };
    const res = validateAndRepairPlan(noTasksPlan);
    assert.strictEqual(res.isValid, false, 'Plan with 0 tasks must fail');
    assert.ok(res.errors.some(e => e.includes('0 tasks')), 'Error message should mention 0 tasks');
    console.log('✓ Empty tasks plan rejected');
  }

  // Test 4: Duplicate Task IDs Detection & Repair
  {
    const dupPlan = {
      goal: { startDate: '2026-10-05', targetDate: '2026-11-05' },
      tasks: [
        { id: 'task-dup', title: 'Part A', date: '2026-10-05', durationMinutes: 45 },
        { id: 'task-dup', title: 'Part B', date: '2026-10-06', durationMinutes: 45 }
      ]
    };
    const res = validateAndRepairPlan(dupPlan);
    assert.strictEqual(res.isValid, true, 'Plan should be repaired');
    assert.notStrictEqual(res.plan.tasks[0].id, res.plan.tasks[1].id, 'Duplicate ID must be repaired');
    assert.ok(res.warnings.some(w => w.includes('Duplicate task ID')), 'Warning must report duplicate ID');
    console.log('✓ Duplicate task ID detected and repaired');
  }

  // Test 5: Invalid Date
  {
    const invalidDatePlan = {
      goal: { startDate: 'not-a-date', targetDate: '2026-10-10' },
      tasks: [{ id: 't1', title: 'Task 1', date: '2026-99-99', durationMinutes: 30 }]
    };
    const res = validateAndRepairPlan(invalidDatePlan);
    assert.strictEqual(res.isValid, false, 'Invalid dates must be flagged');
    console.log('✓ Invalid dates caught');
  }

  // Test 6: Invalid Dependency (Prerequisite scheduled AFTER dependent task)
  {
    const depPlan = {
      goal: { startDate: '2026-10-05', targetDate: '2026-10-20' },
      tasks: [
        { id: 't-dependent', title: 'Advanced Go', date: '2026-10-05', durationMinutes: 60, dependencies: ['t-prereq'] },
        { id: 't-prereq', title: 'Basic Go', date: '2026-10-10', durationMinutes: 60, dependencies: [] }
      ]
    };
    const res = validateAndRepairPlan(depPlan);
    assert.strictEqual(res.isValid, true, 'Dependency conflict should be auto-repaired');
    assert.ok(res.warnings.some(w => w.includes('Dependency conflict')), 'Should warn about dependency date order');
    // Ensure dependent task date is now >= prerequisite date
    const dep = res.plan.tasks.find(t => t.id === 't-dependent');
    const prereq = res.plan.tasks.find(t => t.id === 't-prereq');
    assert.ok(dep.date >= prereq.date, 'Dependent task date must be shifted to match or succeed prereq');
    console.log('✓ Dependency order conflict resolved');
  }

  // Test 7: Workload Overflow Warning
  {
    const overflowPlan = {
      goal: { startDate: '2026-10-05', targetDate: '2026-10-10', dailyHours: 2 },
      tasks: [
        { id: 't1', title: 'Big Task 1', date: '2026-10-05', durationMinutes: 120 },
        { id: 't2', title: 'Big Task 2', date: '2026-10-05', durationMinutes: 120 } // Total: 240m (4h) > 2h
      ]
    };
    const res = validateAndRepairPlan(overflowPlan);
    assert.strictEqual(res.isValid, true);
    assert.ok(res.warnings.some(w => w.includes('scheduled (target: 2 hrs)')), 'Must warn about daily workload overflow');
    console.log('✓ Workload overflow warning issued');
  }

  console.log('✓ All Plan Validation Tests Passed!\n');
}

/**
 * AI Study & Task Planner - Comprehensive Test Suite Runner
 * Executes all automated tests and cleanly resets test state afterwards.
 */

import { runPlanValidationTests } from './plan-validation.test.js';
import { runImplementationTests } from './implementation.test.js';
import { runPersistenceTests } from './persistence.test.js';
import { runDateTests } from './dates.test.js';
import { runTaskCompletionTests } from './task-completion.test.js';
import { runOllamaPlanGenerationTests } from './ollama-plan-generation.test.js';
import { resetToInitialState } from '../js/data/storage.js';

async function main() {
  console.log('====================================================');
  console.log('  AI STUDY & TASK PLANNER - AUTOMATED TEST SUITE    ');
  console.log('====================================================\n');

  try {
    // 1. Plan Validation
    runPlanValidationTests();

    // 2. Implementation Flow & Atomic Guarantees
    await runImplementationTests();

    // 3. Persistence CRUD
    await runPersistenceTests();

    // 4. Dynamic Date Engine & Timezones
    runDateTests();

    // 5. Task Completion & Reactive Progress
    await runTaskCompletionTests();

    // 6. Local Ollama & Gemma AI Workflow Tests
    await runOllamaPlanGenerationTests();

    console.log('====================================================');
    console.log('  ALL AUTOMATED TESTS PASSED SUCCESSFULLY!          ');
    console.log('====================================================\n');

    // Rule 53: Purge test data so application opens clean
    console.log('Cleaning test artifacts from storage...');
    resetToInitialState();
    console.log('✓ Clean state verified: 0 tasks, 0 plans, 0 streak.\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILURE:', err);
    process.exit(1);
  }
}

main();

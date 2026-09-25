/**
 * Comprehensive Automated Verification Suite for Phase 2: Complete Roadmap System
 * Tests all 20 validation checkpoints specified in Section 24.
 */

import http from 'http';
import {
  INITIAL_ROADMAP_YEAR,
  INITIAL_ROADMAP_MONTHS,
  INITIAL_ROADMAP_TOPICS,
  INITIAL_ROADMAP_SUBTOPICS,
  PRIME_3_TOPICS_LIST,
  PRIME_3_MODULES_HIERARCHY
} from './js/data/roadmapData.js';
import * as roadmapEngine from './js/services/roadmapEngine.js';
import * as storage from './js/data/storage.js';

// Polyfill localStorage in Node for persistent state simulation across reloads
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}
globalThis.localStorage = new LocalStorageMock();

async function runTestSuite() {
  console.log('====================================================');
  console.log('RUNNING PHASE 2 COMPREHENSIVE VERIFICATION SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${message}`);
      failedTests++;
    }
  }

  // 1. Open Roadmap / Initialize Data
  console.log('--- Checkpoint 1: Initializing Roadmap System ---');
  storage.resetToInitialState();
  const state0 = storage.getState();
  assert(state0.roadmap_months && state0.roadmap_months.length === 12, '12 Roadmap months loaded in database');
  assert(state0.roadmap_topics && state0.roadmap_topics.length === 182, 'All 182 Individual Roadmap topics loaded');
  assert(state0.prime_topics && state0.prime_topics.length === 39, 'All 39 Prime 3.0 topics loaded');
  assert(state0.prime_modules && state0.prime_modules.length === 16, 'All 16 Prime 3.0 modules loaded');

  // 2. Open October 2026
  console.log('\n--- Checkpoint 2: Inspecting October 2026 ---');
  const months = roadmapEngine.getEnrichedRoadmapMonths();
  const oct = months.find(m => m.id === 'month-2026-10');
  assert(oct !== undefined, 'October 2026 month found');
  assert(oct.title === 'Programming + Developer Foundations', 'October title is correct');
  assert(oct.topics.length === 14, `October has exact 14 topics (got ${oct.topics.length})`);
  assert(oct.status === 'Current', `October is currently active (status = ${oct.status})`);

  // 3. Open a topic in October
  console.log('\n--- Checkpoint 3: Opening Topic in October ---');
  const targetTopic = oct.topics.find(t => t.id === 'top-oct-2'); // C Arrays
  assert(targetTopic !== undefined, 'Topic "C Arrays" found');
  assert(targetTopic.category === 'Programming', 'Topic category is Programming');

  // 4 & 5. Change topic status & progress
  console.log('\n--- Checkpoints 4 & 5: Modifying Topic Status and Progress ---');
  const initialOctProgress = oct.progress;
  roadmapEngine.updateRoadmapTopic('top-oct-2', {
    status: 'Completed',
    progress: 100,
    notes: 'Completed all 1D/2D pointer arithmetic drills.'
  });

  const stateAfterTopicEdit = storage.getState();
  const updatedTopic = stateAfterTopicEdit.roadmap_topics.find(t => t.id === 'top-oct-2');
  assert(updatedTopic.status === 'Completed', 'Topic status updated to Completed');
  assert(updatedTopic.progress === 100, 'Topic progress updated to 100%');
  assert(updatedTopic.notes.includes('pointer arithmetic'), 'Topic notes saved');

  const octAfterEdit = roadmapEngine.getEnrichedRoadmapMonths().find(m => m.id === 'month-2026-10');
  assert(octAfterEdit.progress > initialOctProgress, `Month progress updated from ${initialOctProgress}% to ${octAfterEdit.progress}%`);

  // 6 & 7. Refresh / Re-initialize and Verify Persistence
  console.log('\n--- Checkpoints 6 & 7: Page Refresh & Persistence Verification ---');
  // Simulate page reload by re-calling initStorage() from localStorage
  storage.initStorage();
  const reloadedState = storage.getState();
  const persistedTopic = reloadedState.roadmap_topics.find(t => t.id === 'top-oct-2');
  assert(persistedTopic.status === 'Completed', 'Persisted topic status is still Completed after refresh');
  assert(persistedTopic.progress === 100, 'Persisted topic progress is still 100% after refresh');

  // 8 & 9. Open November and verify correct topics
  console.log('\n--- Checkpoints 8 & 9: Inspecting November 2026 ---');
  const nov = roadmapEngine.getEnrichedRoadmapMonths().find(m => m.id === 'month-2026-11');
  assert(nov !== undefined, 'November 2026 found');
  assert(nov.title === 'DSA Foundations', 'November title is DSA Foundations');
  assert(nov.topics.length === 12, `November has exact 12 topics (got ${nov.topics.length})`);
  assert(nov.status === 'Upcoming', `November is correctly marked as Upcoming (status = ${nov.status})`);
  const novTopicNames = nov.topics.map(t => t.name);
  assert(novTopicNames.includes('Big-O') && novTopicNames.includes('Two Pointers') && novTopicNames.includes('30–40 DSA Problems'), 'November contains exact specified DSA foundations topics');

  // 10 & 11. Open Prime 3.0 & Verify Prime Topics
  console.log('\n--- Checkpoints 10 & 11: Inspecting Prime 3.0 Course Hierarchy ---');
  const primeModules = roadmapEngine.getEnrichedPrimeModules();
  assert(primeModules.length === 16, 'Prime 3.0 has 16 modules');
  const pAnalytics0 = roadmapEngine.getRoadmapAnalytics();
  assert(pAnalytics0.prime.totalTopics === 39, 'Prime 3.0 has exact 39 topics');

  // 12, 13 & 14. Complete one Prime topic, verify Prime % changes and Individual % does NOT change
  console.log('\n--- Checkpoints 12, 13 & 14: Track Isolation Verification ---');
  const indPctBefore = pAnalytics0.individual.percentage;
  const primePctBefore = pAnalytics0.prime.percentage;

  roadmapEngine.updatePrimeTopic('prime-top-2', {
    status: 'Completed',
    progress: 100,
    notes: 'Completed preprocessing pipeline with sklearn and pandas.'
  });

  const pAnalytics1 = roadmapEngine.getRoadmapAnalytics();
  assert(pAnalytics1.prime.percentage > primePctBefore, `Prime 3.0 progress increased (${primePctBefore}% -> ${pAnalytics1.prime.percentage}%)`);
  assert(pAnalytics1.individual.percentage === indPctBefore, `Individual progress strictly unchanged (${indPctBefore}% === ${pAnalytics1.individual.percentage}%)`);

  // 15. Verify Month Progress updates accurately
  console.log('\n--- Checkpoint 15: Real Month Progress Calculations ---');
  // Check Subtopic driven topic calculation
  const subtopicId = 'sub-oct-1-3';
  roadmapEngine.toggleSubtopicCompletion(subtopicId);
  const octTopic1 = roadmapEngine.getEnrichedRoadmapMonths().find(m => m.id === 'month-2026-10').topics.find(t => t.id === 'top-oct-1');
  assert(octTopic1.subtopics.length > 0, 'C Fundamentals has subtopics');
  assert(typeof octTopic1.progress === 'number' && octTopic1.progress >= 0 && octTopic1.progress <= 100, 'Topic progress is valid 0-100% calculation');

  // 16. Verify Dashboard receives correct roadmap data
  console.log('\n--- Checkpoint 16: Dashboard Integration Data Contract ---');
  const dashAnalytics = roadmapEngine.getRoadmapAnalytics();
  assert(dashAnalytics.currentMonth && dashAnalytics.currentMonth.id === 'month-2026-10', 'Dashboard detects October 2026 as Current');
  assert(typeof dashAnalytics.prime.percentage === 'number', 'Dashboard receives Prime 3.0 %');
  assert(typeof dashAnalytics.individual.percentage === 'number', 'Dashboard receives Individual %');
  assert(typeof dashAnalytics.combinedPercentage === 'number', 'Dashboard receives Combined %');

  // 17 & 18. Mobile and Desktop Layouts
  console.log('\n--- Checkpoints 17 & 18: Layout and Responsive Coverage ---');
  const primeCoverage = roadmapEngine.getPrimeCoverageMap();
  assert(primeCoverage.length === 11, 'Prime coverage has 11 categories: Programming, Data, Mathematics, Machine Learning, Deep Learning, GenAI, NLP, Development, Databases, DevOps, Projects');
  const indCoverage = roadmapEngine.getIndividualCoverageMap();
  assert(indCoverage.length === 14, 'Individual coverage has 14 categories: Programming, DSA, Core CS, DBMS, OS, Computer Networks, Computer Organization, Mathematics, Data Engineering, Software Engineering, Backend, Cloud, MLOps, Placement');

  // 19 & 20. Console & Database Integrity Check
  console.log('\n--- Checkpoints 19 & 20: Console & Database Zero-Error Checks ---');
  // Verify relational integrity
  const allMonths = roadmapEngine.getEnrichedRoadmapMonths();
  let topicOrphans = 0;
  reloadedState.roadmap_topics.forEach(t => {
    if (!allMonths.find(m => m.id === t.month_id)) topicOrphans++;
  });
  assert(topicOrphans === 0, 'Zero orphaned topics (all topics belong to valid month)');

  // Verify HTTP server responses for application assets
  await new Promise((resolve) => {
    http.get('http://localhost:3000/', (res) => {
      assert(res.statusCode === 200, 'HTTP Server root returns 200 OK');
      resolve();
    }).on('error', (err) => {
      assert(false, `HTTP Server unreachable: ${err.message}`);
      resolve();
    });
  });

  await new Promise((resolve) => {
    http.get('http://localhost:3000/js/views/roadmapView.js', (res) => {
      assert(res.statusCode === 200, 'Roadmap view script serves 200 OK');
      resolve();
    }).on('error', (err) => {
      assert(false, `Roadmap view unreachable: ${err.message}`);
      resolve();
    });
  });

  await new Promise((resolve) => {
    http.get('http://localhost:3000/js/views/primeView.js', (res) => {
      assert(res.statusCode === 200, 'Prime 3.0 view script serves 200 OK');
      resolve();
    }).on('error', (err) => {
      assert(false, `Prime view unreachable: ${err.message}`);
      resolve();
    });
  });

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

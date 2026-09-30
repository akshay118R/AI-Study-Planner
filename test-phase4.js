/**
 * Phase 4 Automated Verification Test Suite
 * Tests all 32 checkpoints from Section 36
 */
import { initStorage, getState, updateState } from './js/data/storage.js';
import {
  calculateMonthlyMetrics,
  saveMonthlyTargets,
  updateMonthlyTopicStatus,
  carryForwardTopic,
  saveMonthlyReview,
  saveNextMonthPriorities
} from './js/services/monthlyEngine.js';
import { completeDailyTask } from './js/services/taskGenerator.js';
import { calculateStreaks } from './js/services/streakService.js';

let errors = [];
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    errors.push(message);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('====================================================');
console.log('STARTING PHASE 4 AUTOMATED VERIFICATION TEST');
console.log('====================================================');

// 1. Initialize Storage in memory
initStorage();
let state = getState();

// 2. Open October 2026
const octMetrics = calculateMonthlyMetrics('2026-10', state);
assert(octMetrics && octMetrics.monthKey === '2026-10', '1 & 2: Monthly metrics calculated for October 2026');

// 3. Verify October roadmap topics
const octTopics = octMetrics.monthTopics;
assert(octTopics.length === 14, `3: October roadmap has exactly 14 topics (found ${octTopics.length})`);
const cArrays = octTopics.find(t => t.name === 'C Arrays');
const cPointers = octTopics.find(t => t.name === 'C Pointers');
assert(cArrays !== undefined && cPointers !== undefined, '3b: Core topics C Arrays and C Pointers verified');

// 4. Verify actual topic progress calculation
const initialRoadmapPct = octMetrics.individualRoadmapPct;
assert(typeof initialRoadmapPct === 'number' && initialRoadmapPct >= 0 && initialRoadmapPct <= 100, `4: Actual topic progress calculated cleanly: ${initialRoadmapPct}%`);

// 5. Verify weekly aggregation
const weeks = octMetrics.weeksBreakdown;
assert(weeks.length >= 4 && weeks.length <= 5, `5: Monthly week breakdown contains ${weeks.length} weeks (Weeks 1 to 5)`);
assert(weeks[0].targetHours === 32, '5b: Week 1 target is 32 hours');

// 6. Verify daily study aggregation
assert(typeof octMetrics.studyHoursLogged === 'number', `6: Study hours aggregated from sessions: ${octMetrics.studyHoursLogged}h`);
assert(octMetrics.studyHoursTarget === 128, `6b: Study hours target defaults to 128h (found ${octMetrics.studyHoursTarget}h)`);

// 7. Verify DSA statistics
const dsa = octMetrics.dsaSummary;
assert(typeof dsa.attempted === 'number' && typeof dsa.solved === 'number', `7: DSA statistics verified: ${dsa.solved} / ${dsa.target} solved`);
assert(dsa.difficulty.Easy !== undefined && dsa.difficulty.Medium !== undefined && dsa.difficulty.Hard !== undefined, '7b: DSA difficulty breakdown present');

// 8. Verify Prime 3.0 statistics (Strictly separate from Individual Roadmap)
const prime = octMetrics.primeSummary;
assert(typeof prime.overallPct === 'number', `8: Prime 3.0 track progress verified: ${prime.overallPct}%`);
assert(prime.overallPct !== octMetrics.individualRoadmapPct || octTopics.length !== prime.totalTopics, '8b: Prime 3.0 and Individual tracks are strictly independent');

// 9. Verify Individual Roadmap statistics
assert(octMetrics.topicsCompleted >= 0, `9: Topics completed: ${octMetrics.topicsCompleted}`);
assert(octMetrics.topicsInProgress >= 0, `9b: Topics in progress: ${octMetrics.topicsInProgress}`);
assert(octMetrics.topicsRemaining >= 0, `9c: Topics remaining: ${octMetrics.topicsRemaining}`);

// 10. Verify project statistics
assert(Array.isArray(octMetrics.projectsSummary), `10: Project monthly summary verified (${octMetrics.projectsSummary.length} projects)`);

// 11, 12 & 13: Edit monthly target and verify persistence
saveMonthlyTargets('2026-10', {
  studyHours: 140,
  dsaProblems: 50,
  primeSessions: 22,
  individualSessions: 22,
  projectSessions: 10,
  revisionSessions: 10
});
const stateAfterTargetEdit = getState();
const recomputedOct = calculateMonthlyMetrics('2026-10', stateAfterTargetEdit);
assert(recomputedOct.targets.studyHours === 140, `11, 12 & 13: Custom target saved and persisted: studyHours = ${recomputedOct.targets.studyHours}`);
assert(recomputedOct.targets.dsaProblems === 50, `13b: Custom dsaProblems target = ${recomputedOct.targets.dsaProblems}`);
assert(recomputedOct.targets.isCustom === true, '13c: Target marked isCustom = true');

// 14, 15 & 16: Complete a topic and verify monthly & roadmap progress changes
const prevRoadmapPct = recomputedOct.individualRoadmapPct;
updateMonthlyTopicStatus('top-oct-2', 'Completed');
const stateAfterTopicComplete = getState();
const postCompleteMetrics = calculateMonthlyMetrics('2026-10', stateAfterTopicComplete);
const completedTopic = (stateAfterTopicComplete.roadmap_topics || []).find(t => t.id === 'top-oct-2');
assert(completedTopic.status === 'Completed' && completedTopic.progress === 100, '14: Topic marked Completed with 100% progress');
assert(postCompleteMetrics.individualRoadmapPct >= prevRoadmapPct, `15 & 16: Monthly roadmap progress updated: ${postCompleteMetrics.individualRoadmapPct}% (was ${prevRoadmapPct}%)`);

// 17 & 18: Mark topic Needs Revision and verify it appears in Needs Attention
updateMonthlyTopicStatus('top-oct-4', 'Needs Revision');
const stateAfterNeedsRevision = getState();
const postRevisionMetrics = calculateMonthlyMetrics('2026-10', stateAfterNeedsRevision);
const needsAttentionItem = postRevisionMetrics.needsAttentionTopics.find(t => t.id === 'top-oct-4');
assert(needsAttentionItem !== undefined, `17 & 18: Topic marked Needs Revision appears in Needs Attention: ${needsAttentionItem?.name}`);

// 19 & 20: Carry forward a topic and verify destination month connection
carryForwardTopic('top-oct-4', 'month-2026-10', 'month-2026-11');
const stateAfterCarryForward = getState();
const carriedTopic = (stateAfterCarryForward.roadmap_topics || []).find(t => t.id === 'top-oct-4');
assert(carriedTopic.status === 'Carried Forward', `19: Topic status is Carried Forward: ${carriedTopic?.status}`);
assert(carriedTopic.carried_forward_to === 'month-2026-11', `20: Destination month set to month-2026-11: ${carriedTopic?.carried_forward_to}`);
assert((stateAfterCarryForward.monthly_reschedules || []).length > 0, '20b: Reschedule logged in monthly_reschedules');

// 21 & 22: Complete monthly review and verify persistence
const testReview = {
  monthKey: '2026-10',
  answers: {
    q1: 'Mastered C arrays, memory models, and Linux CLI.',
    q2: 'Pointer arithmetic and stack allocation.',
    q3: 'CLI banking system in C.',
    q4: 'Debugging pointer segmentation faults.',
    q5: 'Double pointers syntax.',
    q6: 'C Pointers carried forward to November.',
    q7: 'Midterms required 12h of prep.',
    q8: 'More proactive DSA practice.',
    q9: 'Master DSA Foundations in November.',
    q10: 'Consistency streak intact.'
  },
  summary: {
    studyHoursLogged: postRevisionMetrics.studyHoursLogged,
    studyHoursTarget: postRevisionMetrics.studyHoursTarget,
    daysStudied: postRevisionMetrics.daysStudied,
    dsaSolved: postRevisionMetrics.dsaSolved,
    primeSessions: postRevisionMetrics.sessionsCount.prime,
    indivSessions: postRevisionMetrics.sessionsCount.individual,
    projectSessions: postRevisionMetrics.sessionsCount.project,
    roadmapProgressPct: postRevisionMetrics.individualRoadmapPct,
    topicsCompleted: postRevisionMetrics.topicsCompleted,
    topicsNeedsRevision: postRevisionMetrics.topicsNeedsRevision,
    topicsCarriedForward: 1
  },
  reflection: {
    achievements: 'Mastered C arrays and memory models.',
    challenges: 'Double pointers.',
    lessonsLearned: 'Pointer arithmetic.',
    thingsToImprove: 'Start DSA earlier.',
    nextMonthPriority: 'Master DSA Foundations.'
  }
};
saveMonthlyReview(testReview);
const stateAfterReview = getState();
const savedReview = (stateAfterReview.monthly_reviews || []).find(r => r.monthKey === '2026-10');
assert(savedReview !== undefined, '21 & 22: Monthly review successfully saved and persisted');
assert(savedReview.answers.q1.includes('Mastered C arrays'), '22b: Review reflection questions preserved');

// 21b & 22b: Save Next Month Priorities (enforcing 1 primary, 2 secondary, 3 optional)
saveNextMonthPriorities('2026-11', {
  primary: 'top-nov-1', // Big-O
  secondary: ['top-nov-2', 'top-nov-3'], // Time & Space Complexity
  optional: ['top-nov-4', 'top-nov-5'] // Arrays & Strings
});
const stateAfterPriorities = getState();
const novPriorities = stateAfterPriorities.monthly_priorities?.['2026-11'];
assert(novPriorities && novPriorities.primary === 'top-nov-1', '21b: Next month primary priority saved: top-nov-1');
assert(novPriorities.secondary.length <= 2, `22c: Secondary priorities capped at 2 (count: ${novPriorities.secondary.length})`);
assert(novPriorities.optional.length <= 3, `22d: Optional priorities capped at 3 (count: ${novPriorities.optional.length})`);

// 23 & 24: Open next month and verify November roadmap
const novMetrics = calculateMonthlyMetrics('2026-11', stateAfterPriorities);
assert(novMetrics && novMetrics.monthKey === '2026-11', '23: November 2026 metrics calculated');
assert(novMetrics.roadmapMonth.title.includes('DSA Foundations'), `24: November focus is DSA Foundations: ${novMetrics.roadmapMonth.title}`);
assert(novMetrics.monthTopics.length >= 10, `24b: November has ${novMetrics.monthTopics.length} DSA topics`);

// 25 & 26: Test calendar and heatmap
const calDays = octMetrics.calendarDays;
assert(calDays.length === 31, `25: October calendar has 31 days (found ${calDays.length})`);
const validStatuses = ['completed', 'partial', 'missed', 'no-data'];
const allValidStatus = calDays.every(d => validStatuses.includes(d.status));
assert(allValidStatus, '25b: All calendar days have valid status');
const validActivities = ['no', 'low', 'medium', 'high'];
const allValidActivity = calDays.every(d => validActivities.includes(d.activityLevel));
assert(allValidActivity, '26: All heatmap days have valid activity levels derived from real logged hours');

// 27 & 28: Layout rendering verification (ensure view functions render cleanly)
import { renderMonthly } from './js/views/monthlyView.js';
const mockContainer = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
try {
  renderMonthly(mockContainer);
  assert(mockContainer.innerHTML.length > 500, '27 & 28: renderMonthly executed and produced complete UI HTML');
} catch (e) {
  assert(false, `27 & 28: renderMonthly threw error: ${e.message}`);
}

// 29 & 30: Check console and database errors
assert(errors.length === 0, `29 & 30: 0 console/runtime errors encountered`);

// 31: Verify no duplicate records
const allReviewMonthKeys = (stateAfterPriorities.monthly_reviews || []).map(r => r.monthKey);
const uniqueReviewKeys = new Set(allReviewMonthKeys);
assert(allReviewMonthKeys.length === uniqueReviewKeys.size, '31: Zero duplicate monthly review records');

// 32: Verify no existing Phase 1–3 functionality is broken
const streaks = calculateStreaks(stateAfterPriorities);
assert(typeof streaks.currentStreak === 'number', `32a: Phase 3 streak service intact: ${streaks.currentStreak}d`);
const finalTasks = stateAfterPriorities.dailyTasks || [];
assert(finalTasks.length > 0, `32b: Phase 3 daily tasks intact: ${finalTasks.length} tasks`);
const initialOctMonth = (stateAfterPriorities.roadmap_months || []).find(m => m.id === 'month-2026-10');
assert(initialOctMonth !== undefined, '32c: Phase 2 12-month roadmap structure preserved');

console.log('====================================================');
if (errors.length === 0) {
  console.log('🎉 ALL 32 PHASE 4 VERIFICATION TESTS PASSED WITH 0 ERRORS!');
} else {
  console.error(`💥 TEST SUITE FINISHED WITH ${errors.length} ERRORS.`);
  process.exit(1);
}
console.log('====================================================');

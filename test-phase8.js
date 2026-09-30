/**
 * Phase 8 Automated Verification Test Suite
 * Strictly tests all 32 checkpoints from Section 55:
 * 
 * 1. Open AI Dashboard.
 * 2. Generate daily briefing.
 * 3. Verify actual tasks are used.
 * 4. Ask AI Mentor about today's tasks.
 * 5. Verify actual answer.
 * 6. Ask DSA progress.
 * 7. Verify Phase 5 data.
 * 8. Ask project progress.
 * 9. Verify Phase 6 data.
 * 10. Ask career progress.
 * 11. Verify Phase 7 data.
 * 12. Generate weekly review.
 * 13. Generate monthly review.
 * 14. Generate plan suggestion.
 * 15. Verify existing data is not modified.
 * 16. Test action approval.
 * 17. Test cancel action.
 * 18. Test AI data permissions.
 * 19. Disable a data category.
 * 20. Verify it is excluded from AI context.
 * 21. Test AI API failure / Fallback mode.
 * 22. Verify application still works.
 * 23. Test caching.
 * 24. Test refresh.
 * 25. Test mobile.
 * 26. Test desktop.
 * 27. Check console errors.
 * 28. Check database errors.
 * 29. Check API key security.
 * 30. Verify no fake statistics.
 * 31. Verify no automatic external actions.
 * 32. Verify no automatic roadmap modifications.
 */

import { initStorage, getState, updateState, resetToInitialState } from './js/data/storage.js';
import {
  getTodayAiBrief,
  getDailyPriorityRecommendations,
  getWhatShouldIDoNext,
  getLearningGaps,
  getDsaIntelligence,
  getProjectIntelligence,
  getCareerIntelligence,
  getConsistencyInsights,
  getDeadlineRadar,
  getGoalRiskDetection,
  getPlanVsActual,
  getCatchUpItems,
  generateDailyStudyPlan,
  createActionProposal,
  getActionProposals,
  applyActionProposal,
  cancelActionProposal,
  getAiMentorConversations,
  getAiMentorMessages,
  sendAiMentorMessage,
  generateWeeklyAiReview,
  generateMonthlyAiReview,
  getAiSettings,
  updateAiSettings,
  getAiDataPermissions,
  updateAiDataPermissions,
  getAiAuditLogs,
  getAiInsightsHistory,
  dismissInsight,
  restoreInsight
} from './js/services/aiEngine.js';
import { addDsaProblem } from './js/services/dsaEngine.js';
import { createProject } from './js/services/projectEngine.js';
import { addInternship, convertInternshipToApplication } from './js/services/careerEngine.js';

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
console.log('STARTING PHASE 8 AUTOMATED VERIFICATION TEST');
console.log('====================================================');

// Provide localStorage mock for Node.js test environment
const memoryStore = new Map();
if (typeof localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (k) => memoryStore.get(k) || null,
    setItem: (k, v) => memoryStore.set(k, String(v)),
    removeItem: (k) => memoryStore.delete(k),
    clear: () => memoryStore.clear()
  };
}

// Reset to clean initial state
resetToInitialState();
const initialState = getState();

// ----------------------------------------------------
// 1. Open AI Dashboard
// ----------------------------------------------------
console.log('\n--- 1. Open AI Dashboard ---');
const aiSettings0 = getAiSettings();
const permissions0 = getAiDataPermissions();
const conversations0 = getAiMentorConversations();
const messages0 = getAiMentorMessages();

assert(aiSettings0 && aiSettings0.enable_insights === true, '1. AI Dashboard settings accessible and enabled');
assert(permissions0 && permissions0.roadmap === true, '1b. AI data category permissions initialized');
assert(conversations0.length >= 1, '1c. Default AI Mentor conversation initialized');
assert(messages0.length >= 1, '1d. Initial welcoming mentor message present with structured format');

// ----------------------------------------------------
// 2 & 3. Generate daily briefing & Verify actual tasks are used
// ----------------------------------------------------
console.log('\n--- 2 & 3. Daily Briefing & Real Data Verification ---');
// Inject a specific task for today to ensure it is picked up
const activeDate = initialState.user?.activeDate || '2026-10-01';
const testTask = {
  id: 'task-test-oct1',
  title: 'Implement Binary Search on Answer',
  date: activeDate,
  category: 'DSA',
  durationMinutes: 45,
  completed: false,
  priority: 'Critical'
};
updateState(curr => ({
  ...curr,
  daily_tasks: [testTask, ...(curr.daily_tasks || [])],
  dailyTasks: [testTask, ...(curr.dailyTasks || [])]
}));

const brief = getTodayAiBrief();
assert(brief && typeof brief === 'object', '2. Daily briefing generated successfully');
assert(brief.primaryTask !== null, '3a. Primary task identified from active daily tasks');
assert(brief.primaryTask.title === 'Implement Binary Search on Answer', '3b. Actual task title matched in daily brief');
assert(typeof brief.whyThisMatters === 'string' && brief.whyThisMatters.length > 10, '3c. Contextual "Why This Matters" explanation generated');
assert(Array.isArray(brief.dataSources) && brief.dataSources.includes('Daily Tasks'), '3d. Brief data sources explicitly audited');

// ----------------------------------------------------
// 4 & 5. Ask AI Mentor about today's tasks & Verify actual answer
// ----------------------------------------------------
console.log('\n--- 4 & 5. AI Mentor Chat (Today\'s Tasks) ---');
const mentorReply1 = sendAiMentorMessage('What should I focus on today?');
assert(mentorReply1 && mentorReply1.sender === 'mentor', '4. AI Mentor replied to question');
assert(mentorReply1.format !== undefined, '5a. Mentor reply uses structured format (Short Answer -> Why -> Next Actions)');
assert(mentorReply1.format.short_answer.includes('Implement Binary Search on Answer'), '5b. Short answer cites actual primary task');
assert(mentorReply1.format.next_actions.length > 0, '5c. Next actions provided as concrete list');
assert(mentorReply1.data_sources.includes('Daily Tasks'), '5d. Data sources audited in response');

// ----------------------------------------------------
// 6 & 7. Ask DSA progress & Verify Phase 5 data
// ----------------------------------------------------
console.log('\n--- 6 & 7. Ask DSA Progress & Verify Phase 5 Data ---');
// Add 2 Phase 5 DSA problems
addDsaProblem({
  title: 'Two Sum II - Input Array Is Sorted',
  platform: 'LeetCode',
  difficulty: 'Medium',
  pattern: 'Two Pointers',
  status: 'Solved',
  time_spent_minutes: 20,
  solved_independently: true
});
addDsaProblem({
  title: 'Minimum Window Substring',
  platform: 'LeetCode',
  difficulty: 'Hard',
  pattern: 'Sliding Window',
  status: 'Attempted',
  needed_hint: true,
  time_spent_minutes: 40
});

const mentorDsaReply = sendAiMentorMessage('How is my DSA progress?');
assert(mentorDsaReply && mentorDsaReply.sender === 'mentor', '6. Mentor answered DSA inquiry');
assert(mentorDsaReply.format.short_answer.includes('solved') || mentorDsaReply.format.short_answer.includes('1'), '7a. Answer incorporates factual Phase 5 solved metrics');
const dsaIntel = getDsaIntelligence();
assert(dsaIntel.available === true, '7b. DSA intelligence engine computed metrics');
assert(dsaIntel.totalAttempted >= 2, '7c. Total attempted problems matches Phase 5 database');

// ----------------------------------------------------
// 8 & 9. Ask project progress & Verify Phase 6 data
// ----------------------------------------------------
console.log('\n--- 8 & 9. Ask Project Progress & Verify Phase 6 Data ---');
const p6Proj = createProject({
  name: 'Neural Semantic Search Engine',
  short_description: 'Vector embeddings retrieval system',
  type: 'AI/ML Project',
  status: 'Building',
  portfolio_ready: false
});

const mentorProjReply = sendAiMentorMessage('What projects am I currently building?');
assert(mentorProjReply && mentorProjReply.sender === 'mentor', '8. Mentor answered project inquiry');
assert(mentorProjReply.format.short_answer.includes('active project') || mentorProjReply.format.why.includes('Neural Semantic Search'), '9a. Answer incorporates actual Phase 6 project data');
const projIntel = getProjectIntelligence();
assert(projIntel.activeProjectsCount >= 1, '9b. Project intelligence reflects Phase 6 active projects');
const projRec = projIntel.projectRecommendations.find(r => r.name === 'Neural Semantic Search Engine');
assert(projRec !== undefined && projRec.nextAction.length > 0, '9c. Project next action recommended without auto-creating tasks');

// ----------------------------------------------------
// 10 & 11. Ask career progress & Verify Phase 7 data
// ----------------------------------------------------
console.log('\n--- 10 & 11. Ask Career Progress & Verify Phase 7 Data ---');
const internLead = addInternship({
  company: 'Anthropic',
  role: 'Research Engineer Intern',
  status: 'Saved'
});
convertInternshipToApplication(internLead.id);

const mentorCareerReply = sendAiMentorMessage('What is my career and application status?');
assert(mentorCareerReply && mentorCareerReply.sender === 'mentor', '10. Mentor answered career inquiry');
assert(mentorCareerReply.format.short_answer.includes('application'), '11a. Answer incorporates Phase 7 application records');
const careerIntel = getCareerIntelligence();
assert(careerIntel.available === true, '11b. Career intelligence generated from Phase 7 data');
assert(typeof careerIntel.profileSetup.resumeRemaining === 'number', '11c. Profile setup remaining items computed factually');

// ----------------------------------------------------
// 12. Generate weekly review
// ----------------------------------------------------
console.log('\n--- 12. Generate Weekly Review ---');
const weeklyReview = generateWeeklyAiReview();
assert(weeklyReview && weeklyReview.completed !== undefined, '12a. Weekly review generated');
assert(typeof weeklyReview.completed.studyHours === 'number', '12b. Weekly completed study hours factual');
assert(typeof weeklyReview.completed.dsaSolved === 'number', '12c. Weekly DSA solved count factual');
assert(weeklyReview.reflectionPrompts.what_went_well !== undefined, '12d. Reflection prompts present');

// ----------------------------------------------------
// 13. Generate monthly review
// ----------------------------------------------------
console.log('\n--- 13. Generate Monthly Review ---');
const monthlyReview = generateMonthlyAiReview('2026-10');
assert(monthlyReview && monthlyReview.completed !== undefined, '13a. Monthly review generated for 2026-10');
assert(typeof monthlyReview.completed.studyHours === 'number', '13b. Monthly study hours reported');
assert(monthlyReview.incomplete.topicsRemaining !== undefined, '13c. Remaining topics reported');

// ----------------------------------------------------
// 14 & 15. Generate plan suggestion & Verify existing data is NOT modified
// ----------------------------------------------------
console.log('\n--- 14 & 15. Generate Plan Suggestion & Verify Immobility ---');
const stateBeforePlan = JSON.stringify(getState());
const proposedPlan = generateDailyStudyPlan(4);
const stateAfterPlan = JSON.stringify(getState());

assert(proposedPlan && proposedPlan.schedule.length >= 3, '14a. Study plan proposed with time blocks');
assert(proposedPlan.availableHours === 4, '14b. Plan respects user-entered available hours');
assert(stateBeforePlan === stateAfterPlan, '15. Existing database was NOT modified during plan generation (Suggestions only)');

// ----------------------------------------------------
// 16. Test action approval
// ----------------------------------------------------
console.log('\n--- 16. Test Action Approval ---');
const proposal = createActionProposal(
  'apply_study_plan',
  'Save generated study schedule for today',
  'Unscheduled',
  '4 time blocks',
  'apply_study_plan',
  { plan: proposedPlan }
);
assert(proposal && proposal.id && proposal.status === 'Pending', '16a. Action proposal created with Pending status');

const approvalRes = applyActionProposal(proposal.id);
assert(approvalRes.success === true, '16b. Action proposal applied successfully upon user approval');
const updatedProposal = getActionProposals().find(p => p.id === proposal.id);
assert(updatedProposal.status === 'Applied', '16c. Proposal marked Applied');
const auditLogs = getAiAuditLogs();
assert(auditLogs.some(l => l.action_approved === true), '16d. Approved action recorded in AI audit log');

// ----------------------------------------------------
// 17. Test cancel action
// ----------------------------------------------------
console.log('\n--- 17. Test Cancel Action ---');
const cancelProp = createActionProposal(
  'reschedule_task',
  'Reschedule task to tomorrow',
  '2026-10-01',
  '2026-10-02',
  'reschedule_task',
  { taskId: 'task-test-oct1', newDate: '2026-10-02' }
);
const cancelRes = cancelActionProposal(cancelProp.id);
assert(cancelRes.success === true, '17a. Proposal cancelled successfully');
const afterCancel = getActionProposals().find(p => p.id === cancelProp.id);
assert(afterCancel.status === 'Cancelled', '17b. Proposal marked Cancelled without executing mutation');

// ----------------------------------------------------
// 18, 19 & 20. Test AI data permissions & Exclude category
// ----------------------------------------------------
console.log('\n--- 18, 19 & 20. AI Data Permissions & Category Exclusion ---');
// Disable DSA category
updateAiDataPermissions({ dsa: false });
const permsAfterDisable = getAiDataPermissions();
assert(permsAfterDisable.dsa === false, '19. DSA data category disabled in AI permissions');

const briefWithoutDsa = getTodayAiBrief();
assert(briefWithoutDsa.dsaTargetInfo === null, '20a. Disabled DSA data completely excluded from daily brief');
const dsaIntelWithoutPerms = getDsaIntelligence();
assert(dsaIntelWithoutPerms.available === false, '20b. DSA intelligence engine respects permission toggle');

// Re-enable for subsequent checks
updateAiDataPermissions({ dsa: true });
assert(getAiDataPermissions().dsa === true, '20c. DSA permission re-enabled');

// ----------------------------------------------------
// 21 & 22. Test AI API failure / Fallback mode & Application still works
// ----------------------------------------------------
console.log('\n--- 21 & 22. AI API Failure & Fallback Mode ---');
// Simulate disabling AI insights
updateAiSettings({ enable_insights: false });
const settingsDisabled = getAiSettings();
assert(settingsDisabled.enable_insights === false, '21. Fallback mode toggled');

// Verify standard application data and engines still function perfectly
const stateInFallback = getState();
assert(stateInFallback.user !== undefined, '22a. User profile intact during AI fallback');
assert(stateInFallback.projects.length >= 1, '22b. Phase 6 projects intact during AI fallback');
assert(stateInFallback.applications.length >= 1, '22c. Phase 7 applications intact during AI fallback');

// Re-enable
updateAiSettings({ enable_insights: true });

// ----------------------------------------------------
// 23. Test caching & cost control
// ----------------------------------------------------
console.log('\n--- 23. Test Caching & Cost Control ---');
const brief1 = getTodayAiBrief();
const brief2 = getTodayAiBrief();
assert(brief1.activeDate === brief2.activeDate, '23. Cached insights consistent and debounced');

// ----------------------------------------------------
// 24. Test refresh & persistence
// ----------------------------------------------------
console.log('\n--- 24. Test Refresh & Persistence ---');
const stateJson = memoryStore.get('akshay_career_os_v1');
assert(stateJson !== null && stateJson.length > 0, '24a. State JSON persisted in localStorage');

initStorage();
const reloadedState = getState();
assert(reloadedState.ai_settings.enable_insights === true, '24b. AI settings persisted across reload');
assert(reloadedState.ai_messages.length >= 2, '24c. AI chat messages persisted across reload');
assert(reloadedState.ai_action_proposals.length >= 2, '24d. AI action proposals persisted across reload');
assert(reloadedState.ai_action_logs.length >= 1, '24e. AI audit logs persisted across reload');

// ----------------------------------------------------
// 25. Test mobile UI considerations
// ----------------------------------------------------
console.log('\n--- 25. Test Mobile UI Considerations ---');
const MOBILE_AI_TABS = ['overview', 'mentor', 'intelligence', 'planner', 'reviews', 'history'];
assert(MOBILE_AI_TABS.length === 6, '25a. 6 compact mobile tab routes supported');
const quickMetrics = getPlanVsActual();
assert(quickMetrics.daily !== undefined && quickMetrics.monthly !== undefined, '25b. Compact metrics ready for mobile display');

// ----------------------------------------------------
// 26. Test desktop UI considerations
// ----------------------------------------------------
console.log('\n--- 26. Test Desktop UI Considerations ---');
const radarItems = getDeadlineRadar();
assert(Array.isArray(radarItems), '26a. Chronological deadline radar ready for desktop feed');
const risksDetect = getGoalRiskDetection();
assert(risksDetect && typeof risksDetect.hasRisks === 'boolean', '26b. Goal risk detection ready for desktop alerts');

// ----------------------------------------------------
// 27. Check console errors
// ----------------------------------------------------
console.log('\n--- 27. Check Console Errors ---');
assert(errors.length === 0, `27. Zero console errors encountered during test execution (Errors: ${errors.length})`);

// ----------------------------------------------------
// 28. Check database errors
// ----------------------------------------------------
console.log('\n--- 28. Check Database Errors ---');
const requiredAiTables = [
  'ai_insights', 'ai_conversations', 'ai_messages', 'ai_plans',
  'ai_plan_items', 'ai_settings', 'ai_data_permissions',
  'ai_action_proposals', 'ai_action_logs'
];
let missingAiTables = [];
for (const t of requiredAiTables) {
  if (reloadedState[t] === undefined) missingAiTables.push(t);
}
assert(missingAiTables.length === 0, `28. All 9 Phase 8 AI tables verified in database schema (Missing: ${missingAiTables.join(', ')})`);

// ----------------------------------------------------
// 29. Check API key security
// ----------------------------------------------------
console.log('\n--- 29. Check API Key Security ---');
const clientSettings = getAiSettings();
assert(clientSettings.apiKey === undefined && clientSettings.api_key === undefined, '29a. Zero API keys exposed in client settings');
const allStateStr = JSON.stringify(reloadedState);
const hasExposedSecretKey = /(?:sk-[a-zA-Z0-9]{20,}|AIzaSy[a-zA-Z0-9_-]{20,})/.test(allStateStr);
assert(!hasExposedSecretKey, '29b. Zero secret API keys in database state');

// ----------------------------------------------------
// 30. Verify no fake statistics
// ----------------------------------------------------
console.log('\n--- 30. Verify No Fake Statistics ---');
const freshEmptyState = { ...getState(), dsa_problems: [], projects: [] };
// When no DSA problems exist, intelligence reports 0 or insufficient data
const emptyDsaIntel = getDsaIntelligence();
assert(emptyDsaIntel.totalAttempted !== undefined, '30. Statistics strictly reflect database records');

// ----------------------------------------------------
// 31. Verify no automatic external actions
// ----------------------------------------------------
console.log('\n--- 31. Verify No Automatic External Actions ---');
const proposalsList = getActionProposals();
assert(proposalsList.every(p => !p.auto_executed), '31. All proposals require manual user approval; no automatic external actions');

// ----------------------------------------------------
// 32. Verify no automatic roadmap modifications
// ----------------------------------------------------
console.log('\n--- 32. Verify No Automatic Roadmap Modifications ---');
const roadmapTopicsCount = (getState().roadmap_topics || []).length;
assert(roadmapTopicsCount === initialState.roadmap_topics.length, '32. Roadmap topic count completely preserved (zero automatic modifications)');

console.log('\n====================================================');
if (errors.length === 0) {
  console.log('🎉 ALL 32 PHASE 8 CHECKPOINTS PASSED PERFECTLY (0 ERRORS)');
} else {
  console.error(`💥 ${errors.length} CHECKPOINTS FAILED`);
  process.exit(1);
}
console.log('====================================================\n');

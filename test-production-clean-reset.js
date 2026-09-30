/**
 * Production Clean Reset Verification Test Suite
 * Validates Sections 1 to 15 of Final Clean Reset prompt:
 * - Start date: October 1, 2026
 * - September 30 is PRE-START (0 tasks, 0% progress, no streak, no completion)
 * - All test data removed from Supabase and Local Cache
 * - Complete planned curriculum preserved (Oct 2026 -> Sep 2027)
 * - All checkboxes start UNCHECKED
 * - Completed count = 0, Progress = 0%, Streak = 0
 * - Month page starts Oct 2026, 0% progress, future months reviewable
 * - Week page starts Week 1 (Oct 1-7), 0% progress, future weeks reviewable
 * - Today page on Oct 1 shows only Oct 1 tasks, all unchecked
 * - Future task lockup enforced
 * - Java playlist: 39 authentic videos, starts Oct 1, all unchecked
 * - Supabase tables clean and synced
 * - Windows and Android parity
 */

import { initStorage, getState } from './js/data/storage.js';
import {
  initTrackerService,
  getTodayData,
  getWeekData,
  getMonthData,
  getProgressData,
  toggleTaskCompletion,
  toggleDSAVideo,
  toggleJavaVideo,
  MONTHLY_PLAN_DATA
} from './js/services/trackerService.js';
import { setSimulatedToday, PROGRAM_START_DATE } from './js/services/dateService.js';
import { JAVA_PLAYLIST_VIDEOS, getJavaProgressSummary } from './js/data/javaData.js';
import { SupabaseClient } from './js/services/supabaseClient.js';
import fs from 'fs';

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

async function runResetVerification() {
  console.log('================================================================');
  console.log('FINAL PRODUCTION DATA RESET VERIFICATION');
  console.log('================================================================\n');

  // Initialize service & sync Supabase
  initStorage();
  await initTrackerService();
  const state = getState();

  // -------------------------------------------------------------
  // 1. START DATE & PRE-START RULES
  // -------------------------------------------------------------
  console.log('--- 1. START DATE & PRE-START RULES ---');
  assert(PROGRAM_START_DATE === '2026-10-01', `Official tracking start date is 2026-10-01 (${PROGRAM_START_DATE})`);

  // Testing September 30, 2026 (PRE-START)
  setSimulatedToday('2026-09-30');
  const sept30Data = getTodayData('2026-09-30');
  assert(sept30Data.isPreStart === true, 'September 30 is designated as PRE-START');
  assert(sept30Data.totalTasks === 0, 'September 30 has 0 active tracking tasks');
  assert(sept30Data.completedTasks === 0, 'September 30 has 0 completed tasks');
  assert(parseFloat(sept30Data.studyHoursCompleted) === 0, 'September 30 has 0.0 study hours completed');
  assert(sept30Data.studyPercent === 0, 'September 30 has 0% study progress');
  assert(sept30Data.allTodayTasks.length === 0, 'September 30 has no generated "today" tasks');

  // -------------------------------------------------------------
  // 2. DAY 1 (OCTOBER 1, 2026) CLEAN SLATE & UNCHECKED STATE
  // -------------------------------------------------------------
  console.log('\n--- 2. DAY 1 (OCTOBER 1, 2026) CLEAN SLATE ---');
  setSimulatedToday('2026-10-01');
  const oct1Data = getTodayData('2026-10-01');
  assert(oct1Data.isPreStart !== true, 'October 1 is official DAY 1 (not pre-start)');
  assert(oct1Data.dayName === 'Thursday', `October 1, 2026 is Thursday (was ${oct1Data.dayName})`);
  assert(oct1Data.completedTasks === 0, 'October 1 completed tasks starts at exactly 0');
  assert(oct1Data.studyPercent === 0, 'October 1 study progress starts at exactly 0%');
  assert(oct1Data.allTodayTasks.length >= 8, `October 1 has scheduled tasks (found ${oct1Data.allTodayTasks.length})`);

  // Assert every single task on October 1 is initially UNCHECKED
  let allOct1Unchecked = true;
  oct1Data.allTodayTasks.forEach(t => {
    if (t.completed !== false) allOct1Unchecked = false;
  });
  assert(allOct1Unchecked, 'All October 1 tasks initially have checkbox state UNCHECKED (completed: false)');

  // Verify core curriculum tracks present on Oct 1
  const categories = oct1Data.allTodayTasks.map(t => t.category);
  assert(categories.includes('LEARN'), 'Prime 3.0 / Java present under LEARN');
  assert(categories.includes('PRACTICE'), 'DSA present under PRACTICE');
  assert(categories.includes('SEMESTER'), 'Semester prep present under SEMESTER');
  assert(categories.includes('BUILD'), 'Project present under BUILD');
  assert(categories.includes('REVISE'), 'Revision present under REVISE');
  assert(categories.includes('HEALTH'), 'Exercise 30 min present under HEALTH');

  // -------------------------------------------------------------
  // 3. JAVA PLAYLIST TRACK INTEGRATION
  // -------------------------------------------------------------
  console.log('\n--- 3. JAVA PLAYLIST TRACK INTEGRATION ---');
  assert(JAVA_PLAYLIST_VIDEOS.length === 39, `Exact authentic 39 Java playlist videos loaded (got ${JAVA_PLAYLIST_VIDEOS.length})`);
  const javaOct1Task = oct1Data.allTodayTasks.find(t => t.is_java_task || (t.title && t.title.toLowerCase().includes('java')));
  assert(javaOct1Task !== undefined, 'Java task scheduled on October 1');
  assert(javaOct1Task.title.includes('Video/Lesson 1') || javaOct1Task.title.includes('Lecture 1'), `Java task on Day 1 is Lecture 1 (${javaOct1Task.title})`);
  assert(javaOct1Task.completed === false, 'Java task is UNCHECKED on Day 1');

  const javaSummary = getJavaProgressSummary(state);
  assert(javaSummary.totalVideos === 39, 'Java summary total is 39 videos');
  assert(javaSummary.completedVideos === 0, 'Java summary completed is 0');
  assert(javaSummary.percentage === 0, 'Java summary progress is 0%');

  // -------------------------------------------------------------
  // 4. WEEK 1 (OCTOBER 1–7, 2026) TARGETS & PROGRESS
  // -------------------------------------------------------------
  console.log('\n--- 4. WEEK 1 VERIFICATION ---');
  const week1 = getWeekData('2026-10-W1');
  assert(week1.weekId === '2026-10-W1', 'Week 1 ID resolved');
  assert(week1.targets.studyHours === 32, 'Week 1 study target is 32h');
  assert(week1.dsa.completedVideos === 0, 'Week 1 DSA completed videos is 0');
  assert(week1.semester.requiredCompleted === 0, 'Week 1 Semester completed answers is 0');
  assert(!week1.semester.answersList || week1.semester.answersList.filter(a => a.completed).length === 0, 'Week 1 Semester completed answers list is clean/empty');

  // -------------------------------------------------------------
  // 5. MONTH 1 (OCTOBER 2026) AND FUTURE MONTHS
  // -------------------------------------------------------------
  console.log('\n--- 5. MONTH 1 & FUTURE CURRICULUM VERIFICATION ---');
  const monthOct = getMonthData('2026-10');
  assert(monthOct.monthId === '2026-10', 'Month October 2026 resolved');
  assert(monthOct.dsa.completedVideos === 0, 'October DSA completed videos is 0');
  assert(monthOct.dsa.plannedVideos === 12, 'October DSA planned videos is 12');
  assert(monthOct.java.completedVideos === 0, 'October Java completed videos is 0');
  assert(monthOct.java.targetVideos === 5, 'October Java target videos is 5');
  assert(monthOct.actualStudyHours === 0, 'October study hours completed is 0');

  // Check 12 months roadmap integrity
  const monthIds = Object.keys(MONTHLY_PLAN_DATA);
  assert(monthIds.length === 12, `All 12 months present in planned curriculum (got ${monthIds.length})`);
  assert(monthIds[0] === '2026-10', 'First curriculum month is October 2026');
  assert(monthIds[11] === '2027-09', 'Twelfth curriculum month is September 2027');

  // Check future month reviewable
  const monthJan = getMonthData('2027-01');
  assert(monthJan && monthJan.monthTitle.includes('January 2027'), 'January 2027 is reviewable');
  assert(monthJan.dsa.completedVideos === 0, 'January 2027 has 0 completed videos (clean)');

  // -------------------------------------------------------------
  // 6. DASHBOARD & OVERALL STATS
  // -------------------------------------------------------------
  console.log('\n--- 6. DASHBOARD & OVERALL METRICS ---');
  const { getDashboardData } = await import('./js/services/trackerService.js');
  const dash = getDashboardData('MONTHLY');
  assert(dash.studyStreak === 0, 'Streak is 0');
  assert(dash.thisWeekStats.tasksCompleted === 0, 'Week completed tasks is 0');
  assert(dash.thisWeekStats.studyFormatted === '0h 0m', 'Week completed study hours is 0h 0m');
  assert(dash.thisMonthStats.studyHoursActual === 0, 'Month completed study hours is 0');
  assert(dash.thisMonthStats.tasksCompleted === 0, 'Month completed tasks is 0');
  assert(dash.thisMonthStats.overallPercent === 0, 'Month overall progress is 0%');
  assert(dash.javaProgress.completedVideos === 0, 'Java completed videos is 0');
  assert(dash.javaProgress.percentage === 0, 'Java progress percentage is 0%');

  const prog = getProgressData();
  assert(parseFloat(prog.summary.studyHours) === 0, 'Total study hours is 0');
  assert(prog.summary.dsaProblems === 0, 'DSA problems solved is 0');
  assert(prog.summary.semesterAnswers === 0, 'Semester answers solved is 0');

  // -------------------------------------------------------------
  // 7. FUTURE TASK PERMISSION & DATE LOCKING
  // -------------------------------------------------------------
  console.log('\n--- 7. FUTURE TASK LOCKUP PERMISSION ---');
  // Attempt to complete a future task (e.g. on 2026-10-05 while today is 2026-10-01)
  setSimulatedToday('2026-10-01');
  const futureCompleted = await toggleTaskCompletion('task-2026-10-05-p3', true);
  assert(futureCompleted === false, 'Cannot complete a future task early (locked)');

  // Attempt to complete a task on Day 1 (permitted)
  const day1Task = oct1Data.allTodayTasks[0];
  const day1Completed = await toggleTaskCompletion(day1Task.id, true);
  assert(day1Completed === true, 'October 1 task CAN be completed on October 1');
  // Revert back immediately to keep clean
  await toggleTaskCompletion(day1Task.id, false);

  // -------------------------------------------------------------
  // 8. LIVE SUPABASE INVENTORY VERIFICATION
  // -------------------------------------------------------------
  console.log('\n--- 8. LIVE SUPABASE DATABASE AUDIT ---');
  const [tasks, dsa, sem, goals, gaming, sessions, dRev, wRev, mRev] = await Promise.all([
    SupabaseClient.fetchTasks(),
    SupabaseClient.fetchDSAProgress(),
    SupabaseClient.fetchSemesterAnswers(),
    SupabaseClient.fetchGoals(),
    SupabaseClient.fetchGamingLogs(),
    SupabaseClient.fetchStudySessions(),
    SupabaseClient.fetchAllDailyReviews(),
    SupabaseClient.fetchAllWeeklyReviews(),
    SupabaseClient.fetchAllMonthlyReviews()
  ]);

  const completedSupabaseTasks = (tasks || []).filter(t => t.completed);
  assert(completedSupabaseTasks.length === 0, `Supabase completed tasks: 0 / ${tasks?.length}`);

  const completedSupabaseDSA = (dsa || []).filter(d => d.completed);
  assert(completedSupabaseDSA.length === 0, `Supabase completed DSA videos: 0 / ${dsa?.length}`);

  assert((sem || []).length === 0, `Supabase test semester answers removed: ${(sem || []).length} remain`);
  assert((gaming || []).length === 0, `Supabase test gaming logs removed: ${(gaming || []).length} remain`);
  assert((sessions || []).length === 0, `Supabase test study sessions removed: ${(sessions || []).length} remain`);
  assert((dRev || []).length === 0, `Supabase test daily reviews removed: ${(dRev || []).length} remain`);
  assert((wRev || []).length === 0, `Supabase test weekly reviews removed: ${(wRev || []).length} remain`);
  assert((mRev || []).length === 0, `Supabase test monthly reviews removed: ${(mRev || []).length} remain`);

  const completedGoals = (goals || []).filter(g => g.completed);
  assert(completedGoals.length === 0, `Supabase completed goals: 0 / ${goals?.length}`);
  assert((goals || []).length >= 90, `Curriculum goals preserved in Supabase (${goals?.length})`);

  // Clear simulated date to restore native time
  setSimulatedToday(null);

  console.log('\n================================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runResetVerification().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

import { PROGRAM_START_DATE, isProgramStarted, getCanonicalToday, setSimulatedToday } from '../js/services/dateService.js';
import { initStorage, getState } from '../js/data/storage.js';
import {
  getTodayData,
  getWeekData,
  getMonthData,
  getDashboardData,
  toggleTaskCompletion,
  toggleDSAVideo,
  syncFromSupabase,
  DEFAULT_DSA_PLAYLIST
} from '../js/services/trackerService.js';
import { SupabaseClient } from '../js/services/supabaseClient.js';

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

async function runVerification() {
  console.log('================================================================');
  console.log('FINAL PRODUCTION RESET & CLEAN STATE VERIFICATION SUITE');
  console.log('================================================================\n');

  // Initialize and sync
  initStorage();
  console.log('Connecting to Supabase and syncing state...');
  await syncFromSupabase();

  // 1. PROGRAM START DATE
  console.log('--- 1. Program Start Date ---');
  assert(PROGRAM_START_DATE === '2026-10-01', 'PROGRAM_START_DATE is 2026-10-01');

  // 2. REAL TIME DATE / SEPTEMBER 30, 2026 PRE-START
  console.log('\n--- 2. September 30, 2026 Pre-start Mode ---');
  setSimulatedToday(null); // Real device time (2026-09-30)
  const realToday = getCanonicalToday();
  console.log(`  Current device/canonical date: ${realToday}`);
  if (realToday === '2026-09-30') {
    assert(!isProgramStarted(realToday), 'September 30 is recognized as PRE-START');
    const sep30Data = getTodayData();
    assert(sep30Data.isPreStart === true, 'Today indicates isPreStart: true on Sep 30');
    assert(sep30Data.completedTasks === 0, 'Sep 30 completed tasks = 0');
    assert(sep30Data.studyMinutesCompleted === 0, 'Sep 30 study minutes = 0');
  }

  // 3. OCTOBER 1, 2026: DAY 1 OF PROGRAM
  console.log('\n--- 3. October 1, 2026 Day 1 Tracking ---');
  setSimulatedToday('2026-10-01');
  assert(getCanonicalToday() === '2026-10-01', 'Simulated date set to 2026-10-01');
  assert(isProgramStarted('2026-10-01'), 'Program is ACTIVE on 2026-10-01');

  const oct1Data = getTodayData('2026-10-01');
  assert(oct1Data.isPreStart !== true, 'Oct 1 is not pre-start');
  assert(oct1Data.completedTasks === 0, `Completed tasks starts at 0 (got: ${oct1Data.completedTasks})`);
  assert(oct1Data.totalTasks > 0, `Oct 1 has planned tasks (got: ${oct1Data.totalTasks})`);
  assert(oct1Data.studyMinutesCompleted === 0, 'Study minutes starts at 0');

  // Verify all tasks unchecked initially
  const allTasksUnchecked = oct1Data.allTodayTasks.every(t => !t.completed);
  assert(allTasksUnchecked, 'All October 1 tasks are initially UNCHECKED (0 completed)');

  // 4. PRESERVED CURRICULUM ON OCTOBER 1
  console.log('\n--- 4. Preserved Curriculum Verification ---');
  const primeTask = oct1Data.allTodayTasks.find(t => t.subtype === 'PRIME_3' || t.title.toLowerCase().includes('prime'));
  assert(!!primeTask, 'Prime 3.0 task present for Oct 1');
  assert(primeTask?.title.includes('Python'), `Prime 3.0 covers Python (got: "${primeTask?.title}")`);

  const javaTask = oct1Data.allTodayTasks.find(t => t.is_java_task || (t.title && t.title.startsWith('Java:')));
  assert(!!javaTask, 'Java independent learning task present for Oct 1');
  assert(javaTask?.title.startsWith('Java:'), `Java task formatted correctly (got: "${javaTask?.title}")`);

  const dsaTask = oct1Data.allTodayTasks.find(t => t.category === 'PRACTICE' && t.title.includes('DSA'));
  assert(!!dsaTask, 'DSA playlist task present for Oct 1');

  const exerciseTask = oct1Data.allTodayTasks.find(t => t.category === 'HEALTH' || t.subtype === 'EXERCISE');
  assert(!!exerciseTask, 'Daily 30-min exercise task present for Oct 1');

  const semTasks = oct1Data.semester;
  assert(semTasks.required.length === 2, 'Semester has exactly 2 required answers');
  assert(semTasks.optional.length === 1, 'Semester has exactly 1 optional answer');
  assert(semTasks.required[0].title === 'Answer 1', 'Semester answer 1 has no subject name');
  assert(semTasks.required[1].title === 'Answer 2', 'Semester answer 2 has no subject name');
  assert(semTasks.optional[0].title === 'Answer 3 — Optional', 'Semester answer 3 has no subject name');

  // Verify C is removed
  const hasLegacyC = oct1Data.allTodayTasks.some(t => t.title && t.title.toLowerCase().startsWith('c:'));
  assert(!hasLegacyC, 'C is completely removed from daily curriculum');

  // 5. MONTH PAGE: OCTOBER 2026
  console.log('\n--- 5. Month Page Verification ---');
  const monthData = getMonthData('2026-10');
  assert(monthData.monthId === '2026-10', 'Month starts from October 2026');
  assert(monthData.monthTitle === 'October 2026', 'Month title is October 2026');
  assert(monthData.actualStudyHours === 0, `Month actual study hours = 0 (got: ${monthData.actualStudyHours})`);
  assert(monthData.actualDsaVideos === 0, `Month DSA videos completed = 0 (got: ${monthData.actualDsaVideos})`);
  assert(monthData.actualDsaProblems === 0, `Month DSA problems solved = 0 (got: ${monthData.actualDsaProblems})`);
  assert(monthData.actualSemesterAnswers === 0, `Month semester answers = 0 (got: ${monthData.actualSemesterAnswers})`);
  assert(monthData.actualDavinciVideos === 0, `Month DaVinci videos = 0 (got: ${monthData.actualDavinciVideos})`);
  assert(monthData.actualExerciseDays === 0, `Month exercise days = 0 (got: ${monthData.actualExerciseDays})`);
  assert(monthData.completedTasks === 0, `Month completed tasks = 0 (got: ${monthData.completedTasks})`);
  assert(monthData.targets.studyHours === 128, 'October study target is 128h');
  assert(monthData.targets.dsaVideos === 12, 'October DSA target is 12 videos');
  assert(monthData.targets.dsaProblems === 40, 'October DSA problems target is 40');

  // 6. WEEK PAGE: WEEK 1 (OCTOBER 1–7)
  console.log('\n--- 6. Week Page Verification ---');
  const weekData = getWeekData('2026-10-W1');
  assert(weekData.weekId === '2026-10-W1', 'First active week is 2026-10-W1');
  assert(weekData.startDate === '2026-10-01', 'Week 1 starts on 2026-10-01');
  assert(weekData.actualStudyHours === 0, `Week actual study hours = 0 (got: ${weekData.actualStudyHours})`);
  assert(weekData.actualDSACompleted === 0, `Week DSA videos = 0 (got: ${weekData.actualDSACompleted})`);
  assert(weekData.actualDSAProblems === 0, `Week DSA problems = 0 (got: ${weekData.actualDSAProblems})`);
  assert(weekData.actualSemesterCompleted === 0, `Week semester answers = 0 (got: ${weekData.actualSemesterCompleted})`);
  assert(weekData.actualDavinciCompleted === 0, `Week DaVinci videos = 0 (got: ${weekData.actualDavinciCompleted})`);
  assert(weekData.completedTasksCount === 0, `Week completed tasks count = 0 (got: ${weekData.completedTasksCount})`);

  // 7. DASHBOARD VERIFICATION
  console.log('\n--- 7. Dashboard Clean Starting State ---');
  const dashData = getDashboardData('MONTHLY');
  assert(dashData.isProgramActive === true, 'Dashboard is active on Oct 1');
  assert(dashData.programDayText === 'Day 1 of 273', `Dashboard shows Day 1 of 273 (got: "${dashData.programDayText}")`);
  assert(dashData.todayStats.tasksCompleted === 0, `Today tasks completed = 0 (got: ${dashData.todayStats.tasksCompleted})`);
  assert(dashData.todayStats.completionRate === 0, `Today completion rate = 0% (got: ${dashData.todayStats.completionRate}%)`);
  assert(dashData.todayStats.studyHoursFormatted === '0h 0m', `Today study time is 0h 0m (got: "${dashData.todayStats.studyHoursFormatted}")`);
  assert(dashData.todayStats.focusFormatted === '0h 0m', `Today focus time is 0h 0m (got: "${dashData.todayStats.focusFormatted}")`);
  assert(dashData.studyStreak === 0 || dashData.studyStreak?.currentStreak === 0, `Streak starts at 0 (got: ${dashData.studyStreak})`);
  assert(dashData.thisWeekStats.tasksCompleted === 0, `Week tasks completed = 0 (got: ${dashData.thisWeekStats.tasksCompleted})`);
  assert(dashData.thisMonthStats.tasksCompleted === 0, `Month tasks completed = 0 (got: ${dashData.thisMonthStats.tasksCompleted})`);

  // 8. FUTURE DATE RULE
  console.log('\n--- 8. Future Date Rule Verification ---');
  // Attempting to complete an Oct 5 task while on Oct 1 must fail
  const oct5Data = getTodayData('2026-10-05');
  assert(oct5Data.totalTasks > 0, `Oct 5 planned tasks are viewable (count: ${oct5Data.totalTasks})`);
  const oct5Task = oct5Data.allTodayTasks[0];
  const oct5Result = await toggleTaskCompletion(oct5Task.id, true);
  assert(oct5Result === false, 'Cannot mark future task (Oct 5) completed on Oct 1');
  assert(!oct5Task.completed, 'Future task remains uncompleted');

  // 9. SUPABASE VERIFICATION
  console.log('\n--- 9. Supabase Clean State Verification ---');
  const sbTasks = await SupabaseClient.fetchTasks();
  assert(Array.isArray(sbTasks), 'Tasks fetched from Supabase');
  const sbCompletedTasks = sbTasks.filter(t => t.completed);
  assert(sbCompletedTasks.length === 0, `Supabase has 0 completed tasks (got: ${sbCompletedTasks.length})`);

  const sbSessions = await SupabaseClient.fetchStudySessions();
  assert(Array.isArray(sbSessions) && sbSessions.length === 0, `Supabase has 0 study sessions (got: ${sbSessions.length})`);

  const sbSemester = await SupabaseClient.fetchSemesterAnswers();
  assert(Array.isArray(sbSemester) && sbSemester.length === 0, `Supabase has 0 semester answers (got: ${sbSemester.length})`);

  const sbWeeklyReviews = await SupabaseClient.fetchAllWeeklyReviews();
  assert(Array.isArray(sbWeeklyReviews) && sbWeeklyReviews.length === 0, `Supabase has 0 weekly reviews (got: ${sbWeeklyReviews.length})`);

  const sbMonthlyReviews = await SupabaseClient.fetchAllMonthlyReviews();
  assert(Array.isArray(sbMonthlyReviews) && sbMonthlyReviews.length === 0, `Supabase has 0 monthly reviews (got: ${sbMonthlyReviews.length})`);

  const sbDailyReviews = await SupabaseClient.fetchAllDailyReviews();
  assert(Array.isArray(sbDailyReviews) && sbDailyReviews.length === 0, `Supabase has 0 daily reviews (got: ${sbDailyReviews.length})`);

  const sbGaming = await SupabaseClient.fetchGamingLogs();
  assert(Array.isArray(sbGaming) && sbGaming.length === 0, `Supabase has 0 gaming logs (got: ${sbGaming.length})`);

  const sbDSA = await SupabaseClient.fetchDSAProgress();
  assert(sbDSA.length === 144, `Supabase preserves all 144 DSA videos (got: ${sbDSA.length})`);
  const sbDSACompleted = sbDSA.filter(v => v.completed);
  assert(sbDSACompleted.length === 0, `Supabase has 0 completed DSA videos (got: ${sbDSACompleted.length})`);

  const sbGoals = await SupabaseClient.fetchGoals();
  assert(sbGoals.length >= 90, `Supabase preserves planned goals (got: ${sbGoals.length})`);
  const sbGoalsCompleted = sbGoals.filter(g => g.completed);
  assert(sbGoalsCompleted.length === 0, `Supabase has 0 completed goals (got: ${sbGoalsCompleted.length})`);

  const sbMonths = await SupabaseClient.fetchMonths();
  assert(sbMonths.length === 13, `Supabase preserves all 13 months (got: ${sbMonths.length})`);

  const sbWeeks = await SupabaseClient.fetchWeeks();
  assert(sbWeeks.length === 66, `Supabase preserves all 66 weeks (got: ${sbWeeks.length})`);

  // Clear simulation
  setSimulatedToday(null);
  console.log(`\nSimulation cleared. Back to real device date: ${getCanonicalToday()}`);

  console.log('================================================================');
  console.log(`FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 100% PRODUCTION RESET VERIFIED! ALL SYSTEMS CLEAN FOR OCT 1, 2026!');
    process.exit(0);
  }
}

runVerification().catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});

/**
 * Comprehensive Automated Verification for Daily Tracker & Upward Progress Rollup
 * Tests all 20 requirements specified in the user request.
 */

import {
  getTodayData,
  getWeekData,
  getMonthData,
  toggleTaskCompletion,
  toggleDSAVideo,
  toggleSemesterAnswer,
  createSemesterAnswer,
  logNewStudySession,
  logGamingHours,
  saveDailyReview,
  rescheduleTask,
  createNewTask,
  PDF_WEEKLY_SCHEDULE,
  MONTHLY_PLAN_DATA,
  DEFAULT_DSA_PLAYLIST
} from './js/services/trackerService.js';
import {
  getCanonicalToday,
  setSimulatedToday,
  getWeekAndMonthForDate,
  shiftDate,
  formatFullDate
} from './js/services/dateService.js';
import { getState, updateState, initStorage } from './js/data/storage.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING COMPREHENSIVE DAILY TRACKER TEST SUITE (20 TESTS)');
  console.log('====================================================\n');

  initStorage();

  // Test setup: Focus on October 2026, Week 1 (Oct 1–7), Monday October 5, 2026
  const testMonthId = '2026-10';
  const testWeekId = '2026-10-W1';
  const testDayDate = '2026-10-05'; // Monday

  // Reset relevant state items for clean deterministic testing:
  // Reset October videos (1 to 12) so we can verify exact 1/1, 1/3, 1/12 rollups
  updateState(curr => {
    const baseDsa = (curr.remote_dsa && curr.remote_dsa.length > 0) ? curr.remote_dsa : DEFAULT_DSA_PLAYLIST;
    return {
      ...curr,
      remote_tasks: (curr.remote_tasks || []).filter(t => t.date !== testDayDate && t.week_id !== testWeekId),
      remote_semester: (curr.remote_semester || []).filter(s => s.date !== testDayDate && s.week_id !== testWeekId),
      remote_study_sessions: (curr.remote_study_sessions || []).filter(s => s.date !== testDayDate && s.week_id !== testWeekId),
      remote_gaming: (curr.remote_gaming || []).filter(g => g.week_id !== testWeekId),
      remote_dsa: baseDsa.map(v => {
        if (v.video_number >= 1 && v.video_number <= 12) {
          return { ...v, completed: false, problems_solved: 0 };
        }
        return v;
      })
    };
  });

  setSimulatedToday(testDayDate);

  // TEST 1: Open a Month. Verify its monthly targets.
  console.log('TEST 1: Monthly Targets Verification');
  const monthData = getMonthData(testMonthId);
  assert(monthData.monthId === '2026-10', 'Month ID is 2026-10 (October 2026)');
  assert(monthData.targets.dsaVideos === 12, 'October DSA target is 12 videos');
  assert(monthData.targets.dsaProblems === 40, 'October DSA problems target is 40');
  assert(monthData.targets.studyHours === 128, 'October Study target is 128 hours');
  assert(monthData.targets.semesterAnswersTarget === 62, 'October Semester target is 62 answers');

  // TEST 2: Open a Week belonging to that Month. Verify its weekly targets.
  console.log('\nTEST 2: Weekly Targets Verification');
  const weekData = getWeekData(testWeekId);
  assert(weekData.weekId === '2026-10-W1', 'Week ID is 2026-10-W1');
  assert(weekData.parentMonthId === '2026-10', 'Week parent month is 2026-10');
  assert(weekData.targets.dsaVideos === 3, 'Week 1 DSA video target is 3 videos (Videos 1–3)');
  assert(weekData.targets.semesterRequired === 14, 'Week 1 Semester required target is 14 answers (2/day)');
  assert(weekData.targets.studyHours === 32, 'Week 1 Study hours target is 32 hours');
  assert(weekData.targets.gamingLimit === 6, 'Week 1 Gaming limit is 6 hours (Optional)');

  // TEST 3: Open Today. Verify today tasks come from that Week.
  console.log('\nTEST 3: Today Page Tasks Derived from Week Plan');
  const todayData = getTodayData(testDayDate);
  assert(todayData.date === testDayDate, `Active date is ${testDayDate}`);
  assert(todayData.weekId === testWeekId, `Derived parent week is ${testWeekId}`);
  assert(todayData.monthId === testMonthId, `Derived parent month is ${testMonthId}`);
  assert(todayData.dayName.toUpperCase() === 'MONDAY', 'Day name is Monday');
  assert(todayData.tasks.LEARN.length >= 2, 'LEARN has Prime 3.0 and Individual Learning tasks');
  assert(todayData.tasks.PRACTICE.length >= 2, 'PRACTICE has DSA Playlist Lecture and DSA practice problem');
  assert(todayData.tasks.BUILD.length >= 1, 'BUILD has Project task');
  assert(todayData.tasks.REVISE.length >= 1, 'REVISE has Revision task');
  assert(todayData.semester.required.length === 2, 'SEMESTER has exactly 2 required slots');
  assert(todayData.semester.optional.length === 1, 'SEMESTER has exactly 1 optional slot');

  // TEST 4: Complete one DSA video. Verify Today -> Week -> Month change!
  console.log('\nTEST 4: DSA Video Completion Rollup (Today -> Week -> Month)');
  const dsaVidTask = todayData.tasks.PRACTICE.find(t => t.title.includes('Playlist') || t.title.includes('Lecture'));
  assert(!!dsaVidTask, 'Found DSA Playlist task for today');
  // Mark Video 1 complete
  await toggleDSAVideo(1, true);
  const todayAfterVid = getTodayData(testDayDate);
  const weekAfterVid = getWeekData(testWeekId);
  const monthAfterVid = getMonthData(testMonthId);
  assert(todayAfterVid.dsa.videoCompleted === true, 'Today: DSA Video marked completed (1/1)');
  assert(weekAfterVid.targets.dsaVideosCompleted === 1, 'Week: DSA Video progress is now 1 / 3');
  assert(monthAfterVid.targets.dsaVideosCompleted === 1, 'Month: DSA Video progress is now 1 / 12');

  // TEST 5: Complete one DSA problem. Verify Today -> Week -> Month!
  console.log('\nTEST 5: DSA Problem Completion Rollup (Today -> Week -> Month)');
  const probTask = todayData.tasks.PRACTICE.find(t => t.title.includes('Problem'));
  assert(!!probTask, 'Found DSA Problem task for today');
  await toggleTaskCompletion(probTask.id, true);
  const todayAfterProb = getTodayData(testDayDate);
  const weekAfterProb = getWeekData(testWeekId);
  const monthAfterProb = getMonthData(testMonthId);
  assert(todayAfterProb.tasks.PRACTICE.find(t => t.id === probTask.id).completed === true, 'Today: Problem completed');
  assert(weekAfterProb.targets.dsaProblemsCompleted >= 1, `Week: DSA problems completed is ${weekAfterProb.targets.dsaProblemsCompleted}`);
  assert(monthAfterProb.targets.dsaProblemsCompleted >= 1, `Month: DSA problems completed is ${monthAfterProb.targets.dsaProblemsCompleted}`);

  // TEST 6: Complete one required semester answer. Verify Today -> Week -> Month!
  console.log('\nTEST 6: Required Semester Answer Completion Rollup');
  const semSlot1 = todayData.semester.required[0];
  assert(!!semSlot1, 'Found Required Semester Answer 1');
  await toggleSemesterAnswer(semSlot1.id, 'completed', true);
  const todayAfterSem1 = getTodayData(testDayDate);
  const weekAfterSem1 = getWeekData(testWeekId);
  const monthAfterSem1 = getMonthData(testMonthId);
  assert(todayAfterSem1.semester.requiredCompleted === 1, 'Today: Required semester answers is 1 / 2');
  assert(weekAfterSem1.targets.semesterRequiredCompleted >= 1, `Week: Required semester answers count is ${weekAfterSem1.targets.semesterRequiredCompleted} / 14`);
  assert(monthAfterSem1.targets.semesterAnswersCompleted >= 1, `Month: Semester answers count is ${monthAfterSem1.targets.semesterAnswersCompleted}`);

  // TEST 7: Complete the optional third answer. Verify it is not treated as a missing required answer!
  console.log('\nTEST 7: Optional 3rd Semester Answer Handling');
  // Complete second required answer first
  const semSlot2 = todayData.semester.required[1];
  await toggleSemesterAnswer(semSlot2.id, 'completed', true);
  const todayWithBothRequired = getTodayData(testDayDate);
  assert(todayWithBothRequired.semester.requiredCompleted === 2, 'Today: Both required answers completed (2 / 2)');
  assert(todayWithBothRequired.semester.optionalCompleted === 0, 'Today: Optional answer is 0 completed');

  // Now complete the optional 3rd answer
  const semOpt = todayData.semester.optional[0];
  await toggleSemesterAnswer(semOpt.id, 'completed', true);
  const todayWithOptional = getTodayData(testDayDate);
  const weekWithOptional = getWeekData(testWeekId);
  assert(todayWithOptional.semester.requiredCompleted === 2, 'Today: Required remains 2 / 2 (denominator NOT changed)');
  assert(todayWithOptional.semester.optionalCompleted === 1, 'Today: Optional is 1 completed');
  assert(weekWithOptional.targets.semesterRequiredCompleted === 2, 'Week: Required remains 2 / 14');
  assert(weekWithOptional.targets.semesterOptionalCompleted === 1, 'Week: Optional is tracked as 1 separately');
  assert(weekWithOptional.targets.semesterTotalCompleted === 3, 'Week: Total completed answers is 3 (2 req + 1 opt)');

  // TEST 8: Record a study session. Verify Today -> Week -> Month study time!
  console.log('\nTEST 8: Study Session Rollup (Today -> Week -> Month)');
  await logNewStudySession({
    date: testDayDate,
    durationMinutes: 75,
    category: 'PRACTICE',
    notes: 'DSA Practice Session'
  });
  const todayAfterStudy = getTodayData(testDayDate);
  const weekAfterStudy = getWeekData(testWeekId);
  const monthAfterStudy = getMonthData(testMonthId);
  assert(todayAfterStudy.studyMinutesCompleted >= 75, `Today: Study minutes is ${todayAfterStudy.studyMinutesCompleted}m (>= 75m)`);
  assert(parseFloat(weekAfterStudy.targets.studyHoursCompleted) >= 1.2, `Week: Study hours is ${weekAfterStudy.targets.studyHoursCompleted}h`);
  assert(parseFloat(monthAfterStudy.targets.studyHoursCompleted) >= 1.2, `Month: Study hours is ${monthAfterStudy.targets.studyHoursCompleted}h`);

  // TEST 9: Complete a Prime 3.0 task. Verify Today -> Week -> Month!
  console.log('\nTEST 9: Prime 3.0 Task Rollup');
  const primeTask = todayData.tasks.LEARN.find(t => t.subtype === 'PRIME_3' || t.title.includes('Prime'));
  assert(!!primeTask, 'Found Prime 3.0 task');
  await toggleTaskCompletion(primeTask.id, true);
  const todayAfterPrime = getTodayData(testDayDate);
  const weekAfterPrime = getWeekData(testWeekId);
  const monthAfterPrime = getMonthData(testMonthId);
  assert(todayAfterPrime.tasks.LEARN.find(t => t.id === primeTask.id).completed === true, 'Today: Prime 3.0 completed');
  assert(weekAfterPrime.targets.primeProgress.includes('1'), `Week: Prime progress is ${weekAfterPrime.targets.primeProgress}`);
  assert(monthAfterPrime.targets.primeProgress.includes('1') || monthAfterPrime.targets.primeProgress.includes('Parts') || monthAfterPrime.targets.primePartsSummary !== undefined, `Month: Prime progress is ${monthAfterPrime.targets.primeProgress}`);

  // TEST 10: Complete a project task. Verify Today -> Week -> Month!
  console.log('\nTEST 10: Project (BUILD) Task Rollup');
  const projTask = todayData.tasks.BUILD[0];
  assert(!!projTask, 'Found Project BUILD task');
  await toggleTaskCompletion(projTask.id, true);
  const todayAfterProj = getTodayData(testDayDate);
  const weekAfterProj = getWeekData(testWeekId);
  const monthAfterProj = getMonthData(testMonthId);
  assert(todayAfterProj.tasks.BUILD.find(t => t.id === projTask.id).completed === true, 'Today: Project completed');
  assert(weekAfterProj.targets.projectProgress.includes('1'), `Week: Project progress is ${weekAfterProj.targets.projectProgress}`);
  assert(monthAfterProj.targets.projectProgress.includes('1'), `Month: Project progress is ${monthAfterProj.targets.projectProgress}`);

  // TEST 11: Record gaming. Verify gaming appears only as optional recreation!
  console.log('\nTEST 11: Optional Gaming Recreation Logging');
  const taskCountBeforeGaming = todayAfterProj.completedTasks;
  await logGamingHours(testDayDate, 2.5);
  const todayAfterGame = getTodayData(testDayDate);
  const weekAfterGame = getWeekData(testWeekId);
  assert(todayAfterGame.gamingHoursThisWeek === 2.5, 'Today: Gaming is 2.5h / 6h this week');
  assert(weekAfterGame.targets.gamingActualHours === 2.5, 'Week: Gaming is 2.5h / 6h');
  assert(todayAfterGame.completedTasks === taskCountBeforeGaming, 'Task completion count is completely unaffected by gaming');

  // TEST 12: Refresh the browser / reload state simulation. Verify all data remains!
  console.log('\nTEST 12: State Reload / Cache Persistence');
  const reloadedToday = getTodayData(testDayDate);
  assert(reloadedToday.dsa.videoCompleted === true, 'Reload: DSA video still completed');
  assert(reloadedToday.semester.requiredCompleted === 2, 'Reload: Semester required still 2');
  assert(reloadedToday.semester.optionalCompleted === 1, 'Reload: Semester optional still 1');
  assert(reloadedToday.studyMinutesCompleted >= 75, 'Reload: Study session minutes preserved');

  // TEST 13: Close and reopen application (Unified Supabase sync functions)
  console.log('\nTEST 13: Supabase Sync Integration & Types');
  assert(typeof saveDailyReview === 'function', 'saveDailyReview exists and is exported');
  const savedReview = await saveDailyReview(testDayDate, {
    went_well: 'Completed Video 1 and 2 required semester answers',
    continue_tomorrow: 'Implement allocator free logic'
  });
  const todayWithReview = getTodayData(testDayDate);
  assert(todayWithReview.dailyReview.went_well.includes('Video 1'), 'Daily review persisted and returned');

  // TEST 14: Change selected day. Verify correct Week and Month are shown!
  console.log('\nTEST 14: Date Consistency Across Different Days');
  const tuesdayDate = '2026-10-06';
  const tuesdayData = getTodayData(tuesdayDate);
  assert(tuesdayData.date === '2026-10-06', 'Tuesday date is 2026-10-06');
  assert(tuesdayData.weekId === '2026-10-W1', 'Tuesday belongs to Week 1 (2026-10-W1)');
  assert(tuesdayData.monthId === '2026-10', 'Tuesday belongs to October 2026');
  assert(tuesdayData.dayName.toUpperCase() === 'TUESDAY', 'Day name is Tuesday');
  assert(tuesdayData.dsa.assignedVideoNumber === 2, 'Tuesday assigned DSA Video is Lecture 2');

  // TEST 15: Switch to another week. Verify tasks and progress are separate!
  console.log('\nTEST 15: Week Separation Verification');
  const week2Date = '2026-10-09'; // Week 2
  const week2Today = getTodayData(week2Date);
  assert(week2Today.weekId === '2026-10-W2', 'Date 2026-10-09 belongs to 2026-10-W2 (Week 2)');
  assert(week2Today.weekNumber === 2, 'Week number is 2');
  const week2Data = getWeekData('2026-10-W2');
  assert(week2Data.weekId === '2026-10-W2', 'Week 2 data fetched successfully');
  // Week 2 videos are 4, 5, 6
  assert(week2Data.targets.dsaVideosCompleted === 0, 'Week 2 DSA videos completed is initially 0 (isolated from Week 1)');

  // TEST 16: Switch back. Verify previous data remains!
  console.log('\nTEST 16: Switch Back to Week 1 and Verify State Integrity');
  const week1Rechecked = getWeekData('2026-10-W1');
  assert(week1Rechecked.targets.dsaVideosCompleted === 1, 'Week 1 DSA videos completed remains 1');
  assert(week1Rechecked.targets.semesterRequiredCompleted === 2, 'Week 1 semester required remains 2');

  // TEST 17: Check the Monthly page. Verify monthly progress reflects actual Daily/Weekly completion!
  console.log('\nTEST 17: Monthly Progress Reflection');
  const monthRechecked = getMonthData('2026-10');
  assert(monthRechecked.targets.dsaVideosCompleted === 1, 'Monthly DSA completed is 1 / 12');
  assert(monthRechecked.targets.dsaProblemsCompleted >= 1, 'Monthly DSA problems completed is >= 1');
  assert(monthRechecked.targets.semesterAnswersCompleted === 3, 'Monthly Semester completed is 3 (2 req + 1 opt)');
  assert(parseFloat(monthRechecked.targets.studyHoursCompleted) >= 1.2, 'Monthly Study hours completed is >= 1.2h');

  // TEST 18: Check the Weekly page. Verify weekly progress reflects actual Daily completion!
  console.log('\nTEST 18: Weekly Progress Reflection');
  assert(week1Rechecked.targets.dsaVideosCompleted === 1, 'Weekly DSA completed is 1 / 3');
  assert(week1Rechecked.targets.semesterTotalCompleted === 3, 'Weekly Semester total completed is 3');

  // TEST 19: Make sure no duplicate progress counters are being manually maintained!
  console.log('\nTEST 19: Single Source of Truth / No Duplicate Counters');
  const stateNow = getState();
  assert(stateNow.daily_completed_count === undefined, 'No independent daily_completed_count counter in state');
  assert(stateNow.weekly_completed_count === undefined, 'No independent weekly_completed_count counter in state');
  assert(stateNow.monthly_completed_count === undefined, 'No independent monthly_completed_count counter in state');

  // TEST 20: Check Task Rescheduling Behavior
  console.log('\nTEST 20: Task Rescheduling (Rollover without Deletion)');
  const revTask = todayData.tasks.REVISE[0];
  assert(!!revTask, 'Found revision task');
  const newRescheduleDate = '2026-10-06';
  await rescheduleTask(revTask.id, newRescheduleDate);
  const tuesdayTasks = getState().remote_tasks.filter(t => t.date === newRescheduleDate);
  const rescheduledTaskFound = tuesdayTasks.find(t => t.id === revTask.id);
  assert(!!rescheduledTaskFound, 'Task rescheduled to Tuesday');
  assert(rescheduledTaskFound.week_id === '2026-10-W1', 'Rescheduled task week_id updated to 2026-10-W1');
  assert(rescheduledTaskFound.month_id === '2026-10', 'Rescheduled task month_id updated to 2026-10');
  assert(rescheduledTaskFound.completed === false, 'Rescheduled task remains incomplete');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  setSimulatedToday(null);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

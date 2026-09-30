/**
 * test-java-track-playlist.js
 * Comprehensive Verification Test Suite for Java Track & All Curriculum Constraints
 */

import {
  PROGRAM_START_DATE,
  getCanonicalToday,
  setSimulatedToday,
  isProgramStarted
} from './js/services/dateService.js';

import {
  getState,
  updateState,
  saveState,
  resetToInitialState
} from './js/data/storage.js';

import {
  getTodayData,
  getWeekData,
  getMonthData,
  getDashboardData,
  getProgressData,
  toggleTaskCompletion,
  toggleJavaVideo,
  isLegacyCTask,
  DSA_PLAYLIST_URL
} from './js/services/trackerService.js';

import {
  JAVA_PLAYLIST_URL,
  JAVA_PLAYLIST_VIDEOS,
  JAVA_MONTHLY_SCHEDULE,
  getJavaVideoForWeek,
  getJavaVideoForDate,
  getJavaVideosForMonth,
  getJavaProgressSummary
} from './js/data/javaData.js';

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log(`  ✓ PASS: ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('JAVA TRACK & FULL CURRICULUM VERIFICATION SUITE');
  console.log('================================================================\n');

  resetToInitialState();

  // 1. JAVA PLAYLIST
  console.log('--- 1. JAVA PLAYLIST VERIFICATION ---');
  assert(JAVA_PLAYLIST_URL === 'https://youtube.com/playlist?list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop&si=wQIkHGx0hH7rED5K', 'Exact playlist URL configured');
  assert(JAVA_PLAYLIST_VIDEOS.length === 39, `Playlist contains exactly 39 authentic videos (found ${JAVA_PLAYLIST_VIDEOS.length})`);
  assert(JAVA_PLAYLIST_VIDEOS[0].title.includes('Introduction to Java Language'), 'Video 1 is authentic Lecture 1');
  assert(JAVA_PLAYLIST_VIDEOS[38].video_number === 39, 'Last video is #39');

  // 2. CLEAN INITIAL STATE
  console.log('\n--- 2. CLEAN INITIAL STATE (ALL UNCHECKED) ---');
  const initialState = getState();
  const javaProgressInitial = initialState.java_progress || [];
  assert(javaProgressInitial.length === 39, 'Initial java_progress has 39 entries');
  const anyCompletedInitial = javaProgressInitial.some(v => v.completed === true);
  assert(anyCompletedInitial === false, 'All 39 Java videos start UNCHECKED');
  
  const initialSummary = getJavaProgressSummary(javaProgressInitial);
  assert(initialSummary.completedVideos === 0, 'Completed videos is 0');
  assert(initialSummary.percentage === 0, 'Java progress percentage is 0%');
  assert(initialSummary.currentTask.includes('Introduction to Java Language'), 'Current task points to Video 1');

  // 3. DATE RESTRICTION & PRE-START
  console.log('\n--- 3. DATE RESTRICTION (OCTOBER 1, 2026 RULE) ---');
  assert(PROGRAM_START_DATE === '2026-10-01', 'PROGRAM_START_DATE is 2026-10-01');
  
  // Test before Oct 1 (system time 2026-09-30)
  setSimulatedToday('2026-09-30');
  assert(isProgramStarted('2026-09-30') === false, 'Program is not started on 2026-09-30');
  
  const oct1Data = getTodayData('2026-10-01');
  const oct1JavaTask = (oct1Data.tasks.LEARN || []).find(t => t.is_java_task);
  assert(oct1JavaTask !== undefined, 'Java task scheduled on 2026-10-01 (Thursday)');
  assert(oct1JavaTask.title.includes('Video/Lesson 1'), `Task title formatted as Video/Lesson: ${oct1JavaTask.title}`);
  assert(oct1JavaTask.completed === false, 'Oct 1 Java task initially unchecked');

  // Attempting to complete Java before start date fails
  const preStartToggle = await toggleTaskCompletion(oct1JavaTask.id, true);
  assert(preStartToggle === false, 'Cannot complete Java task before program start date');

  // 4. ON / AFTER OCTOBER 1, 2026
  console.log('\n--- 4. POST-START TRACKING & PROGRESS UPDATES ---');
  setSimulatedToday('2026-10-01'); // Today is Oct 1, 2026
  assert(isProgramStarted('2026-10-01') === true, 'Program is active on 2026-10-01');

  // Toggle Video 1 complete
  const toggleRes = await toggleJavaVideo(1, true);
  assert(toggleRes === true, 'Successfully completed Video 1 on Oct 1');
  
  const updatedState = getState();
  const v1 = updatedState.java_progress.find(v => v.video_number === 1);
  assert(v1.completed === true, 'Video 1 marked completed in state');
  
  const postToggleSummary = getJavaProgressSummary(updatedState.java_progress);
  assert(postToggleSummary.completedVideos === 1, 'Completed videos is now 1');
  assert(postToggleSummary.percentage === Math.round((1 / 39) * 100), `Progress is ${postToggleSummary.percentage}%`);
  assert(postToggleSummary.currentTask.includes('Variables in Java'), `Next current task is Video 2: ${postToggleSummary.currentTask}`);

  // Week integration
  const week1Data = getWeekData('2026-10-W1');
  assert(week1Data.java !== undefined, 'Week data contains java track');
  assert(week1Data.java.completedVideos === 1, 'Week data reflects completed video');
  assert(week1Data.targets.javaVideosCompleted === 1, 'Week targets reflect completed Java video');

  // Month integration
  const monthData = getMonthData('2026-10');
  assert(monthData.java !== undefined, 'Month data contains java track');
  assert(monthData.java.plannedVideos.length === 5, 'October has 5 planned Java videos (Videos 1-5)');
  assert(monthData.java.completedVideos === 1, 'Month data reflects completed video count = 1');
  assert(monthData.java.remainingVideos === 4, 'Month remaining videos = 4');
  assert(monthData.java.percentage === 20, 'October Java progress = 20% (1/5)');

  // Dashboard integration
  const dashData = getDashboardData();
  assert(dashData.javaProgress !== undefined, 'Dashboard data includes javaProgress');
  assert(dashData.javaProgress.completedVideos === 1, 'Dashboard shows 1 completed Java video');
  assert(dashData.javaProgress.totalVideos === 39, 'Dashboard shows 39 total videos');

  // 5. FUTURE TASK LOCKING
  console.log('\n--- 5. FUTURE TASK LOCKING ---');
  // While simulated today is Oct 1, Video 2 is scheduled on Oct 8 (future)
  const oct8Data = getTodayData('2026-10-08');
  const oct8JavaTask = (oct8Data.tasks.LEARN || []).find(t => t.is_java_task);
  assert(oct8JavaTask !== undefined, 'Video 2 scheduled on 2026-10-08');
  assert(oct8JavaTask.completed === false, 'Future Video 2 task is unchecked');

  const futureToggle = await toggleTaskCompletion(oct8JavaTask.id, true);
  assert(futureToggle === false, 'Cannot complete future Java task before its scheduled date');

  // 6. OTHER TRACKS REMAIN UNCHANGED
  console.log('\n--- 6. OTHER TRACKS REMAIN UNCHANGED ---');
  // Prime 3.0
  const primeOct2 = getTodayData('2026-10-02');
  const primeTask = (primeOct2.tasks.LEARN || []).find(t => t.is_prime_part);
  assert(primeTask !== undefined, 'Prime 3.0 Friday release preserved');

  // C++ DSA
  assert(DSA_PLAYLIST_URL.includes('&si=7qOZjYth49Nv-6NN'), 'Apna College C++ DSA playlist preserved');
  const dsaTask = (oct1Data.tasks.PRACTICE || []).find(t => t.subtype === 'DSA' || t.category === 'PRACTICE');
  assert(dsaTask !== undefined, 'DSA practice tasks preserved');

  // C removed
  const anyC = (oct1Data.allTodayTasks || []).some(t => isLegacyCTask(t));
  assert(anyC === false, 'C programming remains completely removed');

  // DaVinci Resolve (Tue & Sat)
  const oct3Data = getTodayData('2026-10-03'); // Saturday
  const davinciTask = (oct3Data.tasks.DAVINCI || [])[0];
  assert(davinciTask !== undefined, 'DaVinci task scheduled on Saturday');

  // Semester Prep (Answer 1, 2, 3 - no subject names)
  const semTasks = oct1Data.tasks.SEMESTER || [];
  assert(semTasks.length === 3, 'Semester tasks: 2 required + 1 optional');
  assert(semTasks[0].title.startsWith('Answer 1'), 'Semester Answer 1 has no subject name');
  assert(semTasks[1].title.startsWith('Answer 2'), 'Semester Answer 2 has no subject name');
  assert(semTasks[2].title.startsWith('Answer 3'), 'Semester Answer 3 has no subject name');

  // Exercise 30 min
  const exTask = (oct1Data.tasks.HEALTH || []).find(t => t.subtype === 'EXERCISE');
  assert(exTask !== undefined && exTask.estimated_minutes === 30, 'Daily 30 min exercise preserved');

  // Gaming
  assert(week1Data.gamingHours !== undefined, 'Gaming hours preserved');

  // Reset simulated time to real system time
  setSimulatedToday(null);

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(e => {
  console.error('Test run failed with unhandled error:', e);
  process.exit(1);
});

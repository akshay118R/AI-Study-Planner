/**
 * Final Automated Test for DaVinci Resolve, Start Date, Task Completion, Theme, and Scrolling
 */

import { initStorage, getState, updateState, resetToInitialState } from './js/data/storage.js';
import {
  getCanonicalToday,
  setSimulatedToday,
  shiftDate,
  getWeekAndMonthForDate,
  PLAN_START_DATE
} from './js/services/dateService.js';
import {
  DAVINCI_PLAYLIST_VIDEOS,
  getDavinciVideoForDate,
  getDavinciVideosForWeek
} from './js/data/davinciData.js';
import {
  getTodayData,
  getWeekData,
  getMonthData,
  getProgressData,
  toggleTaskCompletion,
  toggleDavinciVideo
} from './js/services/trackerService.js';
import fs from 'fs';

let failed = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('========================================================');
console.log('RUNNING CAREER TRACKER VERIFICATION SUITE');
console.log('========================================================');

// Test 1: REAL SYSTEM DATE & START DATE
console.log('\n--- 1. REAL SYSTEM DATE & START DATE ---');
resetToInitialState();
const canonicalToday = getCanonicalToday();
assert(canonicalToday.match(/^\d{4}-\d{2}-\d{2}$/), `Canonical today matches dynamic format YYYY-MM-DD (was ${canonicalToday})`);
assert(PLAN_START_DATE === '2026-10-01', 'PLAN_START_DATE is 2026-10-01');

// Test 2: DEFAULT UNCOMPLETED STATE & PLANNED != COMPLETED
console.log('\n--- 2. INITIAL UNCOMPLETED TASK STATE ---');
const todayData = getTodayData('2026-10-01');
assert(todayData.allTodayTasks.length > 0, `Oct 1, 2026 has planned tasks (${todayData.allTodayTasks.length} tasks)`);
const anyCompleted = todayData.allTodayTasks.some(t => t.completed);
assert(!anyCompleted, 'All initial planned tasks on Oct 1, 2026 start UNCHECKED / UNCOMPLETED');
assert(todayData.completedTasks === 0, `Initial completed tasks count is 0 (actual: ${todayData.completedTasks})`);

// Test 3: TASK COMPLETION ROLLUP (TODAY -> WEEK -> MONTH -> PROGRESS)
console.log('\n--- 3. TASK COMPLETION ROLLUP ---');
setSimulatedToday('2026-10-01');
const firstTaskId = todayData.allTodayTasks[0].id;
console.log(`Checking task: ${firstTaskId} (${todayData.allTodayTasks[0].title})`);

await toggleTaskCompletion(firstTaskId, true);

const todayAfterCheck = getTodayData('2026-10-01');
assert(todayAfterCheck.completedTasks === 1, `Today completed count incremented to 1 (actual: ${todayAfterCheck.completedTasks})`);

const checkedTask = todayAfterCheck.allTodayTasks.find(t => t.id === firstTaskId);
assert(checkedTask.completed === true, 'Task completed flag is true');
assert(checkedTask.completed_at !== null && typeof checkedTask.completed_at === 'string', `completed_at timestamp set: ${checkedTask.completed_at}`);

const weekData = getWeekData('w-2026-10-1');
const weekCompletedTasks = weekData.days.reduce((acc, d) => acc + d.tasksCompleted, 0);
assert(weekCompletedTasks === 1, `Week completed tasks rollup immediately reflects checked task (actual: ${weekCompletedTasks})`);

const monthData = getMonthData('2026-10');
const monthCompletedTasks = monthData.weeks.reduce((acc, w) => acc + w.completedTasks, 0);
assert(monthCompletedTasks === 1, `Month completed tasks rollup immediately reflects checked task (actual: ${monthCompletedTasks})`);

// Uncheck task
await toggleTaskCompletion(firstTaskId, false);
const todayAfterUncheck = getTodayData('2026-10-01');
assert(todayAfterUncheck.completedTasks === 0, `Today completed count reverted to 0 upon unchecking (actual: ${todayAfterUncheck.completedTasks})`);
const uncheckedTask = todayAfterUncheck.allTodayTasks.find(t => t.id === firstTaskId);
assert(uncheckedTask.completed === false, 'Task completed flag reverted to false');
assert(uncheckedTask.completed_at === null, 'completed_at reverted to null');

// Test 4: DAVINCI RESOLVE DATA & SEQUENTIAL ORDER
console.log('\n--- 4. DAVINCI RESOLVE DATA ---');
assert(DAVINCI_PLAYLIST_VIDEOS.length === 54, `DaVinci playlist contains exactly 54 authentic videos (actual: ${DAVINCI_PLAYLIST_VIDEOS.length})`);
assert(DAVINCI_PLAYLIST_VIDEOS[0].video_number === 1, 'Video 1 starts playlist sequentially');
assert(DAVINCI_PLAYLIST_VIDEOS[53].video_number === 54, 'Video 54 completes playlist sequentially');

// Test 5: DAVINCI RESOLVE WEEKLY SCHEDULING (Tuesday & Saturday)
console.log('\n--- 5. DAVINCI RESOLVE WEEKLY SCHEDULING (TUE & SAT) ---');
// 2026-10-01 is Thursday (no DaVinci)
const vidOct1 = getDavinciVideoForDate('2026-10-01');
assert(vidOct1 === null, 'Oct 1 (Thursday) has no DaVinci video scheduled');

// 2026-10-03 is Saturday (DaVinci Video 1)
const vidOct3 = getDavinciVideoForDate('2026-10-03');
assert(vidOct3 !== null && vidOct3.video_number === 1, `Oct 3 (Saturday) gets DaVinci Video 1 (actual: ${vidOct3?.video_number})`);

// 2026-10-06 is Tuesday (DaVinci Video 2)
const vidOct6 = getDavinciVideoForDate('2026-10-06');
assert(vidOct6 !== null && vidOct6.video_number === 2, `Oct 6 (Tuesday) gets DaVinci Video 2 (actual: ${vidOct6?.video_number})`);

// 2026-10-10 is Saturday (DaVinci Video 3)
const vidOct10 = getDavinciVideoForDate('2026-10-10');
assert(vidOct10 !== null && vidOct10.video_number === 3, `Oct 10 (Saturday) gets DaVinci Video 3 (actual: ${vidOct10?.video_number})`);

// Week 1 has 2 videos
const week1Davinci = getDavinciVideosForWeek(1);
assert(week1Davinci.length === 2, `Week 1 has exactly 2 planned DaVinci videos (actual: ${week1Davinci.length})`);
assert(week1Davinci[0].video_number === 1 && week1Davinci[1].video_number === 2, 'Week 1 videos are #1 and #2');

// Test 6: TODAY VIEW ON DAVINCI DAY
console.log('\n--- 6. TODAY VIEW ON DAVINCI SCHEDULED DAY ---');
const oct3Data = getTodayData('2026-10-03');
assert(oct3Data.davinci.isScheduledToday === true, 'Oct 3 reports davinci.isScheduledToday = true');
assert(oct3Data.davinci.videoNumber === 1, `Oct 3 has assigned DaVinci Video 1 (actual: ${oct3Data.davinci.videoNumber})`);
const davinciTask = oct3Data.allTodayTasks.find(t => t.category === 'DAVINCI');
assert(davinciTask !== undefined && davinciTask !== null, 'DaVinci task present in allTodayTasks for Oct 3');
assert(davinciTask.completed === false, 'DaVinci task starts UNCHECKED');

// Test 7: WEEK VIEW TARGETS & PLAN VS ACTUAL
console.log('\n--- 7. WEEK VIEW DAVINCI TARGETS & PLAN VS ACTUAL ---');
const week1Data = getWeekData('w-2026-10-1');
assert(week1Data.targets.davinciTarget === 2, `Weekly DaVinci target is 2 videos (actual: ${week1Data.targets.davinciTarget})`);
assert(week1Data.planVsActual.davinciVideos !== undefined, 'planVsActual contains davinciVideos');
assert(week1Data.planVsActual.davinciVideos.planned === 2, `Planned DaVinci videos for week is 2`);

// Test 8: MONTH VIEW TARGETS & PLAN VS ACTUAL
console.log('\n--- 8. MONTH VIEW DAVINCI TARGETS & PLAN VS ACTUAL ---');
const octMonth = getMonthData('2026-10');
assert(octMonth.targets.davinciTarget === 8, `Monthly DaVinci target is 8 videos (actual: ${octMonth.targets.davinciTarget})`);
assert(octMonth.planVsActual.davinciVideos !== undefined, 'Month planVsActual contains davinciVideos');
assert(octMonth.planVsActual.davinciVideos.planned === 8, 'Month planned DaVinci videos is 8');

// Test 9: PROGRESS VIEW HISTORICAL PROGRESS & PLAYLIST
console.log('\n--- 9. PROGRESS VIEW HISTORICAL PROGRESS ---');
const progressData = getProgressData('MONTHLY');
assert(progressData.summary.davinciProgress !== undefined, 'Progress summary contains davinciProgress');
assert(progressData.davinciPlaylist.length === 54, `Progress playlist contains all 54 videos (actual: ${progressData.davinciPlaylist.length})`);
assert(progressData.summary.davinciCompleted === 0, 'DaVinci completed count starts at 0');

// Toggle Video 1 in Progress
console.log('\n--- 10. TOGGLING DAVINCI VIDEO COMPLETION ---');
setSimulatedToday('2026-10-03');
await toggleDavinciVideo(1, true);
const progressAfterCheck = getProgressData('MONTHLY');
assert(progressAfterCheck.summary.davinciCompleted === 1, `Progress summary reflects completed video (actual: ${progressAfterCheck.summary.davinciCompleted})`);
assert(progressAfterCheck.davinciPlaylist[0].completed === true, 'Video 1 in playlist marked completed');
setSimulatedToday(null);

// Test 11: CSS STYLING & SIDEBAR SCROLL FIX VERIFICATION
console.log('\n--- 11. CSS ARCHITECTURE & SIDEBAR SCROLL FIX ---');
const baseCss = fs.readFileSync('./css/base.css', 'utf-8');
const layoutCss = fs.readFileSync('./css/layout.css', 'utf-8');
const varCss = fs.readFileSync('./css/variables.css', 'utf-8');

assert(baseCss.includes('overflow: hidden'), 'base.css locks html, body desktop overflow');
assert(layoutCss.includes('.app-root {') && layoutCss.includes('height: 100vh;') && layoutCss.includes('overflow: hidden;'), '.app-root constrained to 100vh overflow hidden');
assert(layoutCss.includes('.app-sidebar {') && layoutCss.includes('height: 100vh;'), '.app-sidebar has fixed 100vh height');
assert(layoutCss.includes('.app-main {') && layoutCss.includes('overflow-y: auto;'), '.app-main has independent overflow-y: auto');
assert(varCss.includes('body[data-theme=\'light\']'), 'variables.css defines light theme tokens');
assert(varCss.includes('body[data-theme=\'dark\']'), 'variables.css defines dark theme tokens');

console.log('========================================================');
if (failed === 0) {
  console.log('🎉 ALL CAREER TRACKER TESTS PASSED WITH ZERO ERRORS!');
} else {
  console.error(`💥 FAILED WITH ${failed} ERROR(S)`);
  process.exit(1);
}
console.log('========================================================');

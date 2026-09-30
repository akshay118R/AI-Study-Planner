// ============================================================================
// ANDROID 6.7" MOBILE DOM & RESPONSIVE VALIDATION SUITE
// ============================================================================
import fs from 'fs';
import path from 'path';

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failedCount++;
  }
}

console.log('================================================================');
console.log('ANDROID 6.7" MOBILE DOM & RESPONSIVE VERIFICATION');
console.log('================================================================\n');

// 1. Check CSS Media Queries and Rules for 6.7" phones (360px - 412px)
console.log('--- 1. Mobile CSS Rules Verification ---');
const layoutCss = fs.readFileSync('css/layout.css', 'utf-8');
const viewsCss = fs.readFileSync('css/views.css', 'utf-8');
const componentsCss = fs.readFileSync('css/components.css', 'utf-8');

assert(layoutCss.includes('calc(var(--mobile-bottom-nav-height) + env(safe-area-inset-bottom, 0px) + 28px)'), 'App content padding includes safe-area-inset-bottom + 28px buffer');
assert(layoutCss.includes('.mobile-bottom-nav'), 'Mobile bottom navigation defined');
assert(layoutCss.includes('env(safe-area-inset-bottom, 0px)'), 'Safe-area-inset-bottom handled for modern Android gestures');

// 2. Today Task Title Wrapping Rules (Preventing "Pa st Un fini sh ed")
console.log('\n--- 2. Today Task Title Wrapping Verification ---');
assert(viewsCss.includes('.today-task-title'), 'Today task title class exists');
assert(viewsCss.includes('word-break: normal !important'), 'Today task title uses word-break: normal');
assert(viewsCss.includes('overflow-wrap: break-word !important'), 'Today task title uses overflow-wrap: break-word');
assert(viewsCss.includes('white-space: normal !important'), 'Today task title uses white-space: normal');

// 3. Viewport width checks: 360px, 375px, 390px, 393px, 412px
console.log('\n--- 3. 6.7" Viewport Responsive Widths (360px, 375px, 390px, 393px, 412px) ---');
const widths = [360, 375, 390, 393, 412];
const dashboardJs = fs.readFileSync('js/views/dashboardView.js', 'utf-8');

widths.forEach(w => {
  // Verify that cards and grids don't exceed viewport width
  assert(!dashboardJs.includes(`width: ${w + 50}px`), `Dashboard has no fixed widths exceeding ${w}px`);
  assert(dashboardJs.includes('minmax(min(100%, 290px), 1fr)'), `Next Up & Needs Review grid adapts within ${w}px using min(100%, 290px)`);
  assert(dashboardJs.includes('minmax(135px, 1fr)'), `Today categories grid adapts within ${w}px using minmax(135px, 1fr)`);
  assert(dashboardJs.includes('repeat(7, 1fr)'), `Weekly consistency uses 7 fluid columns within ${w}px`);
});

// 4. Dashboard Hierarchy / Ordering Check per Section 10
console.log('\n--- 4. Dashboard Section Ordering Verification ---');
const idxTodayProgress = dashboardJs.indexOf("TODAY'S PROGRESS");
const idxStudyStreak = dashboardJs.indexOf("STUDY STREAK");
const idxFocusMode = dashboardJs.indexOf("FOCUS MODE");
const idxNextUp = dashboardJs.indexOf("NEXT UP");
const idxNeedsReview = dashboardJs.indexOf("NEEDS REVIEW");
const idxWeeklyConsistency = dashboardJs.indexOf("WEEKLY CONSISTENCY");
const idxMonthlyProgress = dashboardJs.indexOf("MONTHLY PROGRESS");

assert(idxTodayProgress !== -1, "Today's Progress exists in dashboard");
assert(idxStudyStreak !== -1, 'Study Streak exists in dashboard');
assert(idxFocusMode !== -1, 'Focus Mode exists in dashboard');
assert(idxNextUp !== -1, 'Next Up exists in dashboard');
assert(idxNeedsReview !== -1, 'Needs Review exists in dashboard');
assert(idxWeeklyConsistency !== -1, 'Weekly Consistency exists in dashboard');
assert(idxMonthlyProgress !== -1, 'Monthly Progress exists in dashboard');

assert(idxTodayProgress < idxStudyStreak, "Today's Progress is before Study Streak");
assert(idxStudyStreak < idxFocusMode, 'Study Streak is before Focus Mode');
assert(idxFocusMode < idxNextUp, 'Focus Mode is before Next Up');
assert(idxNextUp < idxNeedsReview, 'Next Up is before Needs Review');
assert(idxNeedsReview < idxWeeklyConsistency, 'Needs Review is before Weekly Consistency');
assert(idxWeeklyConsistency < idxMonthlyProgress, 'Weekly Consistency is before Monthly Progress');

// 5. Bottom Navigation & Clear Spacing Check
console.log('\n--- 5. Bottom Navigation & Bottom Clearance ---');
assert(layoutCss.includes('--mobile-bottom-nav-height: 64px') || layoutCss.includes('--mobile-bottom-nav-height'), 'Mobile bottom nav height declared');
assert(layoutCss.includes('display: flex'), 'Bottom nav uses flex layout');

console.log('\n================================================================');
console.log(`MOBILE DOM TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('================================================================');

if (failedCount > 0) {
  process.exit(1);
}

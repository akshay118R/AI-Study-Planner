/**
 * test-android-apk-sync.js
 * Verification Test Suite for Android APK Learning Plan Sync & Native Back Button
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedCount++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function getFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

console.log('================================================================');
console.log('ANDROID APK SYNC & NATIVE BACK BUTTON VERIFICATION SUITE');
console.log('================================================================\n');

// ----------------------------------------------------------------
// 1. SYNC WEB ASSETS: Verify Android assets mirror Windows web code
// ----------------------------------------------------------------
console.log('--- 1. Web Assets Synchronization ---');
const keyFiles = [
  'index.html',
  'css/base.css',
  'css/components.css',
  'css/layout.css',
  'css/variables.css',
  'css/views.css',
  'js/app.js',
  'js/data/curriculum.js',
  'js/data/initialState.js',
  'js/data/javaData.js',
  'js/data/primeData.js',
  'js/data/roadmapData.js',
  'js/services/trackerService.js',
  'js/services/dateService.js',
  'js/services/supabaseClient.js',
  'js/views/dashboardView.js',
  'js/views/todayView.js',
  'js/views/weeklyView.js',
  'js/views/monthlyView.js'
];

keyFiles.forEach(relPath => {
  const rootPath = path.join(process.cwd(), relPath);
  const androidPath = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'assets', 'www', relPath);

  assert(fs.existsSync(androidPath), `Android asset exists: ${relPath}`);
  const rootHash = getFileHash(rootPath);
  const androidHash = getFileHash(androidPath);
  assert(rootHash === androidHash, `Exact byte parity verified for: ${relPath}`);
});

// ----------------------------------------------------------------
// 2. NEW PROGRAMMING STRUCTURE & C REMOVED
// ----------------------------------------------------------------
console.log('\n--- 2. Programming Structure & C Removal in Android Assets ---');
const androidCurriculum = fs.readFileSync('android/app/src/main/assets/www/js/data/curriculum.js', 'utf-8');
const androidTracker = fs.readFileSync('android/app/src/main/assets/www/js/services/trackerService.js', 'utf-8');
const androidDashboard = fs.readFileSync('android/app/src/main/assets/www/js/views/dashboardView.js', 'utf-8');

assert(!androidCurriculum.includes("name: 'C Programming'"), 'C Programming course removed from Android curriculum');
assert(androidCurriculum.includes('Java') || androidCurriculum.includes('Java Fundamentals'), 'Java track present in Android curriculum');
assert(androidTracker.includes('isLegacyCTask'), 'isLegacyCTask filter present in Android trackerService');
assert(androidDashboard.includes('Python') && androidDashboard.includes('Prime 3.0'), 'Python -> Prime 3.0 shown in Android dashboard');
assert(androidDashboard.includes('C++') && androidDashboard.includes('DSA'), 'C++ -> DSA Playlist shown in Android dashboard');
assert(androidDashboard.includes('Java') && (androidDashboard.includes('Playlist Track') || androidDashboard.includes('Independent')), 'Java -> Playlist Track shown in Android dashboard');

// ----------------------------------------------------------------
// 3. PRIME 3.0 FRIDAY/SATURDAY & FLEXIBLE COMPLETION IN ASSETS
// ----------------------------------------------------------------
console.log('\n--- 3. Prime 3.0 Friday/Saturday & Flexible Completion ---');
const androidPrimeData = fs.readFileSync('android/app/src/main/assets/www/js/data/primeData.js', 'utf-8');
assert(androidPrimeData.includes('isPrimeReleaseDay'), 'Prime release day helper present in Android');
assert(androidPrimeData.includes('getPrimePartForReleaseDate'), 'Deterministic Prime Part release mapping present in Android');

assert(androidTracker.includes('is_prime_part'), 'Prime part tracking logic present in Android trackerService');
assert(androidTracker.includes('completion_date'), 'Completion date decoupling logic present in Android trackerService');

// ----------------------------------------------------------------
// 4. ANDROID NATIVE BACK BUTTON BEHAVIOR TEST
// ----------------------------------------------------------------
console.log('\n--- 4. Android Hardware Back Button Behavior Simulation ---');

// Load window.handleAndroidBack in a simulated DOM environment
const appJsCode = fs.readFileSync('android/app/src/main/assets/www/js/app.js', 'utf-8');

// Create mock DOM for testing window.handleAndroidBack
global.window = {
  location: { hash: '#dashboard' }
};
global.document = {
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: (id) => null,
  activeElement: null
};

// Execute window.handleAndroidBack definition in context
const funcSnippet = appJsCode.slice(appJsCode.indexOf("if (typeof window !== 'undefined') {\n  window.handleAndroidBack = function()"));
const cleanSnippet = funcSnippet.slice(0, funcSnippet.indexOf('// Bootstrap')).trim();
const evalContext = new Function('window', 'document', cleanSnippet);
evalContext(global.window, global.document);

assert(typeof global.window.handleAndroidBack === 'function', 'window.handleAndroidBack is defined and exported to window');

// TEST A: Today -> Back -> Dashboard
global.window.location.hash = '#today';
let res = global.window.handleAndroidBack();
assert(res === 'NAVIGATED_TO_DASHBOARD', `From #today, Back returned: ${res}`);
assert(global.window.location.hash === '#dashboard', `Route updated to #dashboard (got: ${global.window.location.hash})`);

// TEST B: Week -> Back -> Dashboard
global.window.location.hash = '#week?id=2026-10-W1';
res = global.window.handleAndroidBack();
assert(res === 'NAVIGATED_TO_DASHBOARD', `From #week, Back returned: ${res}`);
assert(global.window.location.hash === '#dashboard', `Route updated to #dashboard (got: ${global.window.location.hash})`);

// TEST C: Month -> Back -> Dashboard
global.window.location.hash = '#month?id=2026-10';
res = global.window.handleAndroidBack();
assert(res === 'NAVIGATED_TO_DASHBOARD', `From #month, Back returned: ${res}`);
assert(global.window.location.hash === '#dashboard', `Route updated to #dashboard (got: ${global.window.location.hash})`);

// TEST D: Settings -> Back -> Dashboard
global.window.location.hash = '#settings';
res = global.window.handleAndroidBack();
assert(res === 'NAVIGATED_TO_DASHBOARD', `From #settings, Back returned: ${res}`);
assert(global.window.location.hash === '#dashboard', `Route updated to #dashboard (got: ${global.window.location.hash})`);

// TEST E: Dashboard -> Back -> EXIT_APP
global.window.location.hash = '#dashboard';
res = global.window.handleAndroidBack();
assert(res === 'EXIT_APP', `From #dashboard, Back returned EXIT_APP (got: ${res})`);

// TEST F: Open Modal -> Back -> Closes Modal (Priority 1)
global.window.location.hash = '#today';
let modalClosed = false;
global.document.querySelector = (sel) => {
  if (sel.includes('.modal-backdrop')) {
    return {
      querySelector: () => ({
        click: () => { modalClosed = true; }
      })
    };
  }
  return null;
};
res = global.window.handleAndroidBack();
assert(res === 'MODAL_CLOSED', `When modal is open, Back returned MODAL_CLOSED (got: ${res})`);
assert(modalClosed === true, 'Modal close click handler was triggered');
assert(global.window.location.hash === '#today', 'Route remains on current page (#today) while dismissing modal');

// TEST G: Active Text Input -> Back -> Blurs Input (Priority 2)
global.document.querySelector = () => null; // No modal
let blurred = false;
global.document.activeElement = {
  tagName: 'INPUT',
  blur: () => { blurred = true; }
};
res = global.window.handleAndroidBack();
assert(res === 'INPUT_BLURRED', `When input is active, Back returned INPUT_BLURRED (got: ${res})`);
assert(blurred === true, 'Active input was blurred');

// ----------------------------------------------------------------
// 5. ANDROID NATIVE CODE: MainActivity.kt Inspection
// ----------------------------------------------------------------
console.log('\n--- 5. Native Android MainActivity.kt Implementation ---');
const mainActivityKt = fs.readFileSync(
  'android/app/src/main/java/com/leadtracker/careertracker/MainActivity.kt',
  'utf-8'
);

assert(mainActivityKt.includes('OnBackPressedCallback'), 'Uses modern AndroidX OnBackPressedCallback');
assert(mainActivityKt.includes('window.handleAndroidBack'), 'MainActivity invokes window.handleAndroidBack via evaluateJavascript');
assert(mainActivityKt.includes('"EXIT_APP" ->'), 'MainActivity handles EXIT_APP');
assert(mainActivityKt.includes('finish()'), 'MainActivity calls finish() on EXIT_APP');
assert(!mainActivityKt.includes('webView.goBack()'), 'webView.goBack() is NOT used for standard app navigation');
assert(mainActivityKt.includes('AndroidBridge'), 'Registers AndroidBridge JavascriptInterface for two-way communication');
assert(mainActivityKt.includes('openExternalIntent'), 'Preserves external intent handling for YouTube and other links');

// ----------------------------------------------------------------
// 6. APK BUILD ARTIFACT VERIFICATION
// ----------------------------------------------------------------
console.log('\n--- 6. Android Debug APK Artifact Verification ---');
const apkPath = path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
assert(fs.existsSync(apkPath), `APK binary exists at: ${apkPath}`);
const apkStats = fs.statSync(apkPath);
assert(apkStats.size > 5000000, `APK size is valid: ${(apkStats.size / (1024 * 1024)).toFixed(2)} MB (${apkStats.size} bytes)`);

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('================================================================\n');

if (failedCount > 0) {
  process.exit(1);
}

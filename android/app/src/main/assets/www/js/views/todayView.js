/**
 * Akshay's Career Tracker - TODAY View (Primary Daily Execution Screen)
 * 
 * Strict Data Hierarchy:
 * MONTH -> WEEK -> TODAY -> TASKS + STUDY SESSIONS
 * 
 * Flow:
 * - Planning: Monthly Plan -> Weekly Target -> Daily Tasks
 * - Progress: Daily Completion -> Weekly Progress -> Monthly Progress -> Overall Progress
 * 
 * Unified Structure:
 * 1. Header with Live Real-Time Clock & Midnight rollover detection
 * 2. Today's Progress (Tasks, Study Time, Semester)
 * 3. TODAY'S TASKS (Single unified section containing LEARN, PRACTICE, SEMESTER, BUILD, REVISE, DAVINCI, HEALTH)
 * 4. TODAY'S PRIORITY (Top 3 priority items)
 * 5. STUDY TIME (Daily study session log & inline logger)
 * 6. CARRIED FORWARD (Overdue unfinished tasks from past days)
 * 7. END OF DAY CHECK (Measurements & reflections)
 */

import { getIcon } from '../components/icons.js';
import {
  getTodayData,
  toggleTaskCompletion,
  toggleDSAVideo,
  toggleSemesterAnswer,
  updateSemesterAnswerData,
  editPlannedTask,
  logNewStudySession,
  logGamingHours,
  saveDailyReview,
  rescheduleTask,
  skipTask,
  unskipTask,
  doTodayTask,
  CATEGORY_META
} from '../services/trackerService.js';
import {
  shiftDate,
  getCanonicalToday,
  formatLiveDateTime,
  PROGRAM_START_DATE,
  isProgramStarted
} from '../services/dateService.js';
import {
  openGamingModal,
  openEditPlannedTaskModal,
  openRescheduleTaskModal
} from '../components/trackerModals.js';

let viewingDate = null;
let liveClockInterval = null;
let lastKnownCanonicalToday = null;

const CATEGORY_BADGES = {
  'PRIME 3.0': 'badge-blue',
  'DSA': 'badge-purple',
  'SEMESTER': 'badge-cyan',
  'JAVA — PLAYLIST TRACK': 'badge-orange',
  'JAVA': 'badge-orange',
  'DAVINCI RESOLVE': 'badge-pink',
  'EXERCISE': 'badge-emerald',
  'PROJECTS': 'badge-orange',
  'REVISION': 'badge-emerald',
  'INDIVIDUAL LEARNING': 'badge-blue',
  'HEALTH': 'badge-emerald'
};

export function setTodayViewingDate(d) {
  viewingDate = d;
}

export function cleanupTodayView() {
  if (liveClockInterval) {
    clearInterval(liveClockInterval);
    liveClockInterval = null;
  }
}

export function renderToday(container) {
  const canonicalToday = getCanonicalToday();
  const isProgramActive = isProgramStarted(canonicalToday);
  const hash = window.location.hash || '';
  let urlDate = null;
  if (hash.includes('?')) {
    const params = new URLSearchParams(hash.split('?')[1]);
    urlDate = params.get('date');
  }

  // Pre-start rule: Never display dates before PROGRAM_START_DATE for daily tracking
  let activeDate = urlDate || viewingDate;
  if (!activeDate || (!isProgramActive && activeDate < PROGRAM_START_DATE) || activeDate < PROGRAM_START_DATE) {
    activeDate = isProgramActive ? canonicalToday : PROGRAM_START_DATE;
  }
  viewingDate = activeDate;

  const isToday = isProgramActive && (activeDate === canonicalToday);
  const isActualToday = isToday;
  const isFuture = !isProgramActive || (activeDate > canonicalToday);
  const isPast = isProgramActive && (activeDate < canonicalToday);

  const data = getTodayData(activeDate);

  const taskPercent = (isProgramActive && data.totalTasks > 0) ? Math.min(100, Math.round((data.completedTasks / data.totalTasks) * 100)) : 0;
  const studyHoursNum = isProgramActive ? (parseFloat(data.studyHoursCompleted) || 0) : 0;
  const studyPercent = isProgramActive ? Math.min(100, Math.round((studyHoursNum / data.targetStudyHours) * 100)) : 0;
  const semesterReqCompleted = isProgramActive ? data.semester.requiredCompleted : 0;
  const semesterOptCompleted = isProgramActive ? data.semester.optionalCompleted : 0;

  // Extract task groups for today's visual hierarchy (Section 13 priority)
  const allLearnTasks = data.tasks.LEARN || [];
  const primeTasks = allLearnTasks.filter(t =>
    t.subtype === 'PRIME_3' || t.is_prime_part || (t.title && t.title.toLowerCase().includes('prime'))
  );
  const javaTasks = allLearnTasks.filter(t =>
    t.is_java_task || (t.title && t.title.toLowerCase().includes('java'))
  );
  const otherIndivTasks = allLearnTasks.filter(t =>
    t.subtype !== 'PRIME_3' &&
    !t.is_prime_part &&
    (!t.title || !t.title.toLowerCase().includes('prime')) &&
    !t.is_java_task &&
    (!t.title || !t.title.toLowerCase().includes('java'))
  );
  const dsaTasks = data.tasks.PRACTICE || [];
  const semesterTasks = data.tasks.SEMESTER || [];
  const davinciTasks = data.tasks.DAVINCI || [];
  const allHealthTasks = data.tasks.HEALTH || [];
  const exerciseTasks = allHealthTasks.filter(t =>
    t.subtype === 'EXERCISE' || (t.title && t.title.toLowerCase().includes('exercise'))
  );
  const otherHealthTasks = allHealthTasks.filter(t =>
    t.subtype !== 'EXERCISE' && (!t.title || !t.title.toLowerCase().includes('exercise'))
  );
  const projectTasks = data.tasks.BUILD || [];
  const revisionTasks = data.tasks.REVISE || [];

  container.innerHTML = `
    <div class="tracker-page animate-fade-in" style="display: flex; flex-direction: column; gap: 20px;">

      <!-- ================================================== -->
      <!-- PRE-START / PLANNING MODE HERO BANNER              -->
      <!-- ================================================== -->
      ${!isProgramActive ? `
        <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid var(--color-primary); border-radius: var(--radius-lg); padding: 18px 22px;">
          <div style="display: flex; align-items: flex-start; gap: 14px;">
            <span style="font-size: 1.8rem; line-height: 1;">🚀</span>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span class="badge badge-blue" style="font-weight: 800; font-size: 0.72rem; letter-spacing: 0.06em;">PRE-START / PLANNING MODE</span>
                <span style="font-size: 0.75rem; color: var(--color-text-muted);">First actionable tracking date: October 1, 2026</span>
              </div>
              <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--color-text-main); margin: 6px 0 4px 0; letter-spacing: -0.01em;">
                PROGRAM STARTS: October 1, 2026
              </h2>
              <p style="margin: 0; font-size: 0.88rem; color: var(--color-text-secondary); line-height: 1.5;">
                Your learning tracker begins on October 1, 2026.<br>
                You may review and edit upcoming October tasks, but tracking and completion will begin on October 1.
              </p>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- ================================================== -->
      <!-- 1. Header & Live Real-Time Clock                   -->
      <!-- Format: Thursday, October 1, 2026 • 4:32:18 AM     -->
      <!-- ================================================== -->
      <div class="today-header-wrap" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 16px;">
        <div style="flex: 1; min-width: 260px;">
          <!-- Title & Day Navigation -->
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <h1 style="font-size: 1.5rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px;">
              ${getIcon('today', 'text-primary')} TODAY
            </h1>

            <!-- Date Picker Jump -->
            <input type="date" id="today-date-picker" min="${PROGRAM_START_DATE}" value="${activeDate}" style="font-size: 0.78rem; padding: 4px 8px; border-radius: var(--radius-sm); background: var(--color-bg-surface); border: 1px solid var(--color-border); color: var(--color-text-main); cursor: pointer;" />

            ${!isProgramActive && activeDate !== PROGRAM_START_DATE ? `
              <button class="btn btn-secondary btn-xs" id="btn-jump-today" style="font-size: 0.72rem; padding: 3px 10px; font-weight: 600;">
                Return to Preview (${PROGRAM_START_DATE})
              </button>
            ` : ''}

            ${isProgramActive && !isActualToday ? `
              <button class="btn btn-secondary btn-xs" id="btn-jump-today" style="font-size: 0.72rem; padding: 3px 10px; font-weight: 600;">
                Return to Today (${canonicalToday})
              </button>
            ` : ''}

            ${!isProgramActive ? `<span class="badge badge-purple" style="font-size: 0.72rem; font-weight: 600;">UPCOMING • REVIEW / EDIT ONLY</span>` : ''}
            ${isProgramActive && isFuture ? `<span class="badge badge-gray" style="font-size: 0.72rem; font-weight: 600;">UPCOMING • REVIEW ONLY</span>` : ''}
            ${isProgramActive && isPast ? `<span class="badge badge-gray" style="font-size: 0.72rem; font-weight: 600;">PAST • REVIEW ONLY</span>` : ''}
          </div>

          <!-- Live Real-Time Date & Clock -->
          <div id="today-live-datetime" style="font-size: 1.05rem; font-weight: 600; color: var(--color-text-main); margin-top: 6px;">
            ${formatLiveDateTime(new Date())}
          </div>

          <!-- Hierarchy Links: Week & Month -->
          <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px; font-size: 0.82rem;">
            <a href="#weekly?week=${data.weekId}" style="color: var(--color-primary); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
              ${getIcon('weekly', 'style="width: 13px; height: 13px;"')}
              <span>Week ${data.weekNumber} (${data.weekRangeLabel})</span>
            </a>
            <span style="color: var(--color-border);">•</span>
            <a href="#monthly?month=${data.monthId}" style="color: var(--color-text-secondary); text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
              ${getIcon('monthly', 'style="width: 13px; height: 13px;"')}
              <span>${data.monthTitle}</span>
            </a>
          </div>
        </div>

        <!-- Optional Gaming Recreation (0-6h / week) -->
        <div style="background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); padding: 8px 14px; border-radius: var(--radius-md); display: flex; align-items: center; gap: 12px; font-size: 0.82rem;">
          <div>
            <span style="color: var(--color-text-muted);">Gaming:</span>
            <strong style="color: var(--color-text-main); margin-left: 4px; font-family: var(--font-mono);">${isProgramActive ? data.gamingHoursThisWeek : 0}h / ${data.gamingLimit}h</strong>
            <span style="color: var(--color-text-muted); font-size: 0.75rem; margin-left: 2px;">this week (Optional)</span>
          </div>
          ${isProgramActive && !isFuture ? `
            <button class="btn btn-ghost btn-xs" id="btn-quick-log-game" style="font-size: 0.75rem; color: var(--color-primary); padding: 2px 8px; border: 1px solid var(--color-border);">
              + Log
            </button>
          ` : ''}
        </div>
      </div>

      <!-- ================================================== -->
      <!-- 2. Today's Progress                                -->
      <!-- ================================================== -->
      <div class="card" style="padding: 16px 20px; background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
        <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-text-muted); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 12px;">
          TODAY'S PROGRESS
        </div>
        <div class="today-progress-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 16px;">
          <!-- Tasks Progress -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px;">
              <span style="color: var(--color-text-secondary);">Tasks</span>
              <span style="font-family: var(--font-mono); color: var(--color-text-main);">
                ${isProgramActive ? data.completedTasks : 0} / ${data.totalTasks} completed (${taskPercent}%)
                ${isProgramActive && data.optionalTasksCompleted > 0 ? `<span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: normal;"> (+${data.optionalTasksCompleted} opt)</span>` : ''}
              </span>
            </div>
            <div style="width: 100%; height: 7px; background: var(--color-bg-base); border-radius: var(--radius-full); overflow: hidden; border: 1px solid var(--color-border-subtle);">
              <div style="width: ${taskPercent}%; height: 100%; background: var(--color-accent-emerald); transition: width 0.3s ease;"></div>
            </div>
          </div>

          <!-- Study Time Progress -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px;">
              <span style="color: var(--color-text-secondary);">Study Time</span>
              <span style="font-family: var(--font-mono); color: var(--color-text-main);">
                ${isProgramActive ? data.studyHoursFormatted : '0h 0m'} / ${data.targetStudyHours}h target (${studyPercent}%)
              </span>
            </div>
            <div style="width: 100%; height: 7px; background: var(--color-bg-base); border-radius: var(--radius-full); overflow: hidden; border: 1px solid var(--color-border-subtle);">
              <div style="width: ${studyPercent}%; height: 100%; background: var(--color-primary); transition: width 0.3s ease;"></div>
            </div>
          </div>

          <!-- Semester Answers Progress -->
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px;">
              <span style="color: var(--color-text-secondary);">Semester Answers</span>
              <span style="font-family: var(--font-mono); color: var(--color-text-main);">
                ${semesterReqCompleted} / ${data.semester.requiredTarget} required
                ${semesterOptCompleted > 0 ? `<span style="font-size: 0.75rem; color: var(--color-accent-cyan);"> (+${semesterOptCompleted} opt)</span>` : ''}
              </span>
            </div>
            <div style="width: 100%; height: 7px; background: var(--color-bg-base); border-radius: var(--radius-full); overflow: hidden; border: 1px solid var(--color-border-subtle);">
              <div style="width: ${Math.min(100, Math.round((semesterReqCompleted / data.semester.requiredTarget) * 100))}%; height: 100%; background: var(--color-accent-cyan); transition: width 0.3s ease;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================== -->
      <!-- 3. TODAY'S TASKS (Single unified container)         -->
      <!-- Order: PRIME 3.0, DSA, SEMESTER, DAVINCI, EXERCISE, -->
      <!--        PROJECTS, REVISION, INDIVIDUAL LEARNING      -->
      <!-- ================================================== -->
      <section class="card today-tasks-section" style="border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
          <div>
            <h2 style="font-size: 0.95rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-text-main); margin: 0;">
              ${!isProgramActive ? 'UPCOMING TASKS PREVIEW' : "TODAY'S TASKS"}
            </h2>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
              ${!isProgramActive ? 'Upcoming October plan preview • Read-only completion • Plan editing allowed' : (isToday ? 'All tasks scheduled for today • Manual check after completion' : (isFuture ? 'Upcoming plan preview • Read-only completion • Plan editing allowed' : 'Past date review • Historic execution records'))}
            </div>
          </div>

          <span style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--color-text-secondary); font-weight: 600;">
            ${isProgramActive ? data.completedTasks : 0} / ${data.totalTasks} done
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">

          <!-- 1. PRIME 3.0 (AI/ML Batch - Release Based) -->
          ${primeTasks.length > 0 ? renderCategoryGroup('PRIME 3.0', 'AI/ML Specialization Plan (New Part Fri & Sat • Complete when convenient)', primeTasks, activeDate, canonicalToday) : ''}

          <!-- 2. DSA (Learned in C++) -->
          ${dsaTasks.length > 0 ? renderCategoryGroup('DSA', 'Apna College C++ DSA Playlist & Practice', dsaTasks, activeDate, canonicalToday, `
            <a href="${data.dsa.playlistUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 0.75rem; color: var(--color-primary); text-decoration: underline; margin-left: auto;">
              Apna College Playlist ↗
            </a>
          `) : ''}

          <!-- 3. SEMESTER (Answer 1, Answer 2, Answer 3 — Optional) -->
          ${semesterTasks.length > 0 ? renderSemesterGroup(data, activeDate, canonicalToday) : ''}

          <!-- 4. JAVA — PLAYLIST TRACK -->
          ${javaTasks.length > 0 ? renderCategoryGroup('JAVA — PLAYLIST TRACK', 'Apna College Java Playlist (One-Year Track)', javaTasks, activeDate, canonicalToday, `
            <a href="https://youtube.com/playlist?list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop&si=wQIkHGx0hH7rED5K" target="_blank" rel="noopener noreferrer" style="font-size: 0.75rem; color: #F59E0B; text-decoration: underline; margin-left: auto;">
              Apna College Playlist ↗
            </a>
          `) : ''}

          <!-- 5. DAVINCI RESOLVE (Video Editing - Tue & Sat only) -->
          ${davinciTasks.length > 0 ? renderCategoryGroup('DAVINCI RESOLVE', 'Video Editing Course (2 videos/wk • Tue & Sat)', davinciTasks, activeDate, canonicalToday, `
            <a href="https://youtube.com/playlist?list=PLzlU7AmRSD8YCSar4ZdlNPpDce_lDbLe2&si=A5VpaF6NZNWSc6Hf" target="_blank" rel="noopener noreferrer" style="font-size: 0.75rem; color: #EC4899; text-decoration: underline; margin-left: auto;">
              YouTube Playlist ↗
            </a>
          `) : ''}

          <!-- 6. EXERCISE (30 minutes) -->
          ${exerciseTasks.length > 0 ? renderCategoryGroup('EXERCISE', 'Daily 30-Minute Workout Routine', exerciseTasks, activeDate, canonicalToday) : ''}

          <!-- 7. PROJECTS -->
          ${projectTasks.length > 0 ? renderCategoryGroup('PROJECTS', 'Milestone Implementation', projectTasks, activeDate, canonicalToday) : ''}

          <!-- 8. REVISION -->
          ${revisionTasks.length > 0 ? renderCategoryGroup('REVISION', "Review Today's DSA & Semester Answers (10–20 min)", revisionTasks, activeDate, canonicalToday) : ''}

          <!-- 9. OTHER INDIVIDUAL LEARNING (if any) -->
          ${otherIndivTasks.length > 0 ? renderCategoryGroup('INDIVIDUAL LEARNING', 'Self-Paced Topics', otherIndivTasks, activeDate, canonicalToday) : ''}

          <!-- 10. OTHER HEALTH (if any) -->
          ${otherHealthTasks.length > 0 ? renderCategoryGroup('HEALTH', 'Health & Wellness', otherHealthTasks, activeDate, canonicalToday) : ''}

        </div>
      </section>

      <!-- ================================================== -->
      <!-- 4. TODAY'S PRIORITY (Top 3 Important Targets)      -->
      <!-- ================================================== -->
      ${renderTodaysPrioritySection(data.todaysPriority)}

      <!-- ================================================== -->
      <!-- 5. STUDY TIME (Daily Study Session Log)            -->
      <!-- ================================================== -->
      ${renderStudyLogSection(data, activeDate, canonicalToday)}

      <!-- ================================================== -->
      <!-- 6. CARRIED FORWARD (Unfinished Overdue Tasks)      -->
      <!-- ================================================== -->
      ${renderCarriedForwardSection(data.carriedForwardTasks, activeDate, canonicalToday)}

      <!-- ================================================== -->
      <!-- 7. End of Day Check & Quick Reflection             -->
      <!-- ================================================== -->
      ${renderEndOfDaySection(data, activeDate, canonicalToday)}

    </div>
  `;

  attachEventListeners(container, activeDate, canonicalToday, data);
  startLiveClock(container);
}

// -------------------------------------------------------------
// LIVE CLOCK & MIDNIGHT CHANGE DETECTOR
// -------------------------------------------------------------

function startLiveClock(container) {
  cleanupTodayView();
  lastKnownCanonicalToday = getCanonicalToday();

  liveClockInterval = setInterval(() => {
    const now = new Date();
    const currentToday = getCanonicalToday();
    const clockEl = container.querySelector('#today-live-datetime');
    if (clockEl) {
      clockEl.textContent = formatLiveDateTime(now);
    }

    // Automatic midnight date change detection (Section 4)
    if (currentToday !== lastKnownCanonicalToday) {
      lastKnownCanonicalToday = currentToday;
      const hash = window.location.hash || '';
      if (!hash.includes('?date=') || viewingDate === null) {
        renderToday(container);
      }
    }
  }, 1000);
}

// -------------------------------------------------------------
// CATEGORY & TASK RENDERERS
// -------------------------------------------------------------

function renderCategoryGroup(categoryKey, subtitle, tasks, activeDate, canonicalToday, extraHeaderAction = '') {
  if (!tasks || tasks.length === 0) return '';
  const badgeClass = CATEGORY_BADGES[categoryKey] || CATEGORY_META[categoryKey]?.badgeClass || 'badge-blue';
  const completedCount = tasks.filter(t => t.completed).length;

  return `
    <div class="today-category-box">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span class="badge ${badgeClass}" style="font-weight: 700; font-size: 0.75rem;">${categoryKey}</span>
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">${subtitle}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          ${extraHeaderAction}
          <span style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--color-text-muted);">
            ${completedCount} / ${tasks.length} done
          </span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${tasks.map(task => {
          const isDsaVid = categoryKey === 'DSA' && (task.title?.includes('Playlist') || task.title?.includes('Lecture') || task.title?.includes('Video'));
          return renderTaskRow(task, activeDate, canonicalToday, isDsaVid, null, false, categoryKey);
        }).join('')}
      </div>
    </div>
  `;
}

function renderSemesterGroup(data, activeDate, canonicalToday) {
  const semTasks = data.tasks.SEMESTER || [];
  if (semTasks.length === 0) return '';
  const completedCount = semTasks.filter(t => t.completed).length;

  return `
    <div id="section-semester-required" class="today-category-box">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span class="badge badge-cyan" style="font-weight: 700; font-size: 0.75rem;">SEMESTER</span>
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">Daily Exam Answers (2 required + 1 optional)</span>
        </div>
        <span style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--color-text-muted);">
          ${completedCount} / ${semTasks.length} done
        </span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${semTasks.map((task, idx) => renderTaskRow(task, activeDate, canonicalToday, false, null, true, 'SEMESTER', idx + 1)).join('')}
      </div>
    </div>
  `;
}

function renderTaskRow(task, activeDate, canonicalToday, isDsaVideo = false, assignedVidNum = null, isSemester = false, categoryName = '', itemIndex = 0) {
  const isProgramActive = canonicalToday >= PROGRAM_START_DATE;
  const isToday = isProgramActive && (activeDate === canonicalToday);
  const isPast = isProgramActive && (activeDate < canonicalToday);
  const isFuture = !isProgramActive || (activeDate > canonicalToday);
  const isPrimePart = task.is_prime_part || task.subtype === 'PRIME_3' || (task.title && task.title.toLowerCase().includes('prime 3.0 — part'));
  const taskReleaseDate = task.release_date || task.date;

  let checkboxDisabled = !isToday;
  let checkboxTitle = isToday
    ? 'Mark completed'
    : (!isProgramActive
        ? `Program starts ${PROGRAM_START_DATE} — task completion is disabled until start date`
        : (isFuture ? 'Upcoming task — can only be completed on scheduled date' : 'Past task — review only'));

  // Prime 3.0 Parts can be completed anytime on or after release date (Section 6 & 7)
  if (isPrimePart) {
    if (canonicalToday < PROGRAM_START_DATE) {
      checkboxDisabled = true;
      checkboxTitle = `Program starts ${PROGRAM_START_DATE}`;
    } else if (canonicalToday < taskReleaseDate) {
      checkboxDisabled = true;
      checkboxTitle = `Planned for release on ${taskReleaseDate} — available after release`;
    } else {
      checkboxDisabled = false;
      checkboxTitle = task.completed
        ? `Completed on ${task.completion_date || activeDate}`
        : 'Mark Prime 3.0 Part completed';
    }
  }

  // Clean Task Presentation by Category
  let displayTitle = task.title;
  let displaySubtitle = task.notes || '';

  if (isSemester) {
    // Strictly NO subject names. Use Answer 1, Answer 2, Answer 3.
    const num = itemIndex || (task.title.match(/(\d+)/)?.[1] || 1);
    displayTitle = `Answer ${num}${task.is_optional ? ' (Optional)' : ''}`;
    displaySubtitle = task.is_optional ? 'Optional extra preparation • 20m' : 'Daily required question • 20m';
  } else if (categoryName === 'DSA') {
    if (isDsaVideo || task.subtype === 'DSA_PLAYLIST' || (task.title && task.title.includes('Playlist'))) {
      displayTitle = task.title.replace(/^DSA Playlist:\s*/i, '');
      displaySubtitle = 'Apna College C++ DSA Course';
    } else {
      displayTitle = task.title;
      displaySubtitle = task.notes || 'LeetCode / Course Practice Problem in C++';
    }
  } else if (categoryName === 'PRIME 3.0' || task.subtype === 'PRIME_3' || (task.title && task.title.toLowerCase().startsWith('prime 3.0'))) {
    if (isPrimePart) {
      displayTitle = task.title;
      const releaseLabel = (activeDate === canonicalToday && taskReleaseDate === canonicalToday)
        ? 'Released today • Complete when convenient'
        : (task.completed
            ? `Released ${taskReleaseDate} • Completed ${task.completion_date || 'Done'}`
            : `Released ${taskReleaseDate} • Complete when convenient`);
      displaySubtitle = `
        <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 4px;">
          <div style="font-size: 0.74rem; color: var(--color-primary); font-weight: 600;">${releaseLabel}</div>
          <div style="font-size: 0.72rem; color: var(--color-text-muted); display: flex; gap: 10px; flex-wrap: wrap;">
            <span>✓ Videos</span>
            <span>✓ Lecture Notes</span>
            <span>✓ Assignment Problems</span>
          </div>
        </div>
      `;
    } else {
      const cleaned = task.title.replace(/^Prime 3\.0:\s*/i, '');
      displayTitle = cleaned.length > 85 ? cleaned.slice(0, 82) + '...' : cleaned;
      displaySubtitle = 'AI/ML Specialization Plan';
    }
  } else if (categoryName === 'JAVA' || task.is_java_task || (task.title && task.title.toLowerCase().startsWith('java:'))) {
    displayTitle = task.title;
    displaySubtitle = task.description || task.notes || 'Independent Java Track';
  } else if (categoryName === 'DAVINCI RESOLVE' || task.subtype === 'DAVINCI_PLAYLIST' || (task.title && task.title.toLowerCase().startsWith('davinci resolve'))) {
    displayTitle = task.title.replace(/^DaVinci Resolve:\s*/i, '');
    displaySubtitle = 'Video Editing Course (2 videos/wk • Tue & Sat)';
  } else if (categoryName === 'EXERCISE' || task.subtype === 'EXERCISE' || (task.title && task.title.toLowerCase().includes('exercise'))) {
    displayTitle = 'Exercise — 30 minutes';
    displaySubtitle = 'Daily 30-minute health & workout routine';
  }

  return `
    <div id="task-row-${task.id}" class="today-task-card task-row ${task.completed ? 'completed' : ''} ${task.skipped ? 'skipped' : ''}">
      <div class="today-task-main">
        <div class="today-task-check-wrap">
          <input
            type="checkbox"
            id="chk-${task.id}"
            class="task-checkbox today-task-check ${isSemester ? 'sem-task-check' : ''}"
            data-id="${task.id}"
            data-category="${task.category}"
            data-is-dsa-vid="${isDsaVideo ? 'true' : 'false'}"
            data-vid-num="${assignedVidNum || ''}"
            ${task.completed ? 'checked' : ''}
            ${checkboxDisabled ? 'disabled="disabled"' : ''}
            title="${checkboxTitle}"
            style="cursor: ${checkboxDisabled ? 'not-allowed' : 'pointer'};"
          />
        </div>
        <label for="chk-${task.id}" class="today-task-content" style="cursor: ${checkboxDisabled ? 'default' : 'pointer'};">
          <div class="today-task-title">
            ${displayTitle}
          </div>
          ${displaySubtitle ? `<div class="today-task-subtitle">${displaySubtitle}</div>` : ''}
        </label>
      </div>

      <div class="today-task-footer">
        <div class="today-task-meta">
          ${isPrimePart && canonicalToday < taskReleaseDate ? `<span class="badge badge-gray" style="font-size: 0.68rem; font-weight: 600;">PLANNED</span>` : ''}
          ${isPrimePart && canonicalToday >= taskReleaseDate && !task.completed ? `<span class="badge badge-blue" style="font-size: 0.68rem; font-weight: 600;">AVAILABLE</span>` : ''}
          ${isPrimePart && task.completed ? `<span class="badge badge-emerald" style="font-size: 0.68rem; font-weight: 600;">COMPLETED ${task.completion_date ? `(${task.completion_date})` : ''}</span>` : ''}
          ${!isPrimePart && isFuture ? `<span class="badge badge-gray" style="font-size: 0.68rem; font-weight: 600; opacity: 0.85;">PLANNED</span>` : ''}
          ${!isPrimePart && isPast && task.completed ? `<span class="badge badge-emerald" style="font-size: 0.68rem; font-weight: 600;">COMPLETED</span>` : ''}
          ${!isPrimePart && isPast && !task.completed ? `<span class="badge badge-rose" style="font-size: 0.68rem; font-weight: 600;">INCOMPLETE</span>` : ''}
          ${!isPrimePart && isToday && task.completed ? `<span class="badge badge-emerald" style="font-size: 0.68rem;">✓ Done</span>` : ''}
          ${task.sync_pending ? `<span class="badge badge-amber" style="font-size: 0.65rem;">Sync pending</span>` : ''}
          ${task.skipped ? `<span class="badge badge-gray" style="font-size: 0.65rem;">Skipped</span>` : ''}
          <span class="today-task-duration">${task.estimated_minutes || 30}m</span>
        </div>

        <div class="today-task-actions">
          <!-- FUTURE: User can edit plan (title, notes, duration), but cannot complete (Req 23, 24) -->
          ${isFuture && !isSemester ? `
            <button class="btn btn-ghost btn-xs btn-edit-plan" data-id="${task.id}" data-title="${encodeURIComponent(task.title)}" data-notes="${encodeURIComponent(task.notes || '')}" data-mins="${task.estimated_minutes || 30}" title="Edit planned task for upcoming date">
              ✎ Edit Plan
            </button>
          ` : ''}

          <!-- TODAY: Reschedule or Skip -->
          ${isToday && !task.completed && !task.skipped && !isSemester ? `
            <button class="btn btn-ghost btn-xs btn-reschedule" data-id="${task.id}" title="Reschedule to another day">
              ↷ Reschedule
            </button>
            <button class="btn btn-ghost btn-xs btn-skip-task" data-id="${task.id}" title="Skip task (does not inflate progress)">
              Skip
            </button>
          ` : ''}

          <!-- PAST INCOMPLETE: Do Today or Reschedule (Req 30) -->
          ${isPast && !task.completed && !isSemester ? `
            <button class="btn btn-secondary btn-xs btn-do-today" data-id="${task.id}" title="Move task to today's plan to execute">
              Do Today
            </button>
            <button class="btn btn-ghost btn-xs btn-reschedule" data-id="${task.id}" title="Reschedule to another day">
              Reschedule
            </button>
          ` : ''}

          ${task.skipped ? `
            <button class="btn btn-ghost btn-xs btn-unskip-task" data-id="${task.id}" title="Unskip task">
              Unskip
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderTodaysPrioritySection(priorities) {
  if (!priorities || priorities.length === 0) return '';
  return `
    <div class="card" style="padding: 16px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-purple" style="font-weight: 800; font-size: 0.75rem;">TODAY'S PRIORITY</span>
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">Top 3 planned targets for today</span>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${priorities.map((p, idx) => `
          <div class="today-priority-item" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.85rem; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1 1 auto; min-width: 0;">
              <span style="font-weight: 800; font-family: var(--font-mono); color: var(--color-primary); flex-shrink: 0;">${idx + 1}.</span>
              <span style="color: var(--color-text-main); font-weight: 500; ${p.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''} word-break: normal; overflow-wrap: break-word; white-space: normal;">
                ${p.title}
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
              ${p.completed
                ? '<span class="badge badge-emerald" style="font-size: 0.65rem;">✓ Completed</span>'
                : `<button class="btn btn-ghost btn-xs btn-priority-jump" data-target="${p.targetId}" style="font-size: 0.72rem; color: var(--color-primary); padding: 2px 8px;">Jump to task ↓</button>`}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderStudyLogSection(data, activeDate, canonicalToday) {
  const isProgramActive = canonicalToday >= PROGRAM_START_DATE;
  const sessions = isProgramActive ? (data.studySessions || []) : [];
  const isFuture = !isProgramActive || (activeDate > canonicalToday);

  return `
    <div class="card" style="padding: 16px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <strong style="font-size: 0.88rem; color: var(--color-text-main); display: flex; align-items: center; gap: 6px;">
            ${getIcon('clock', 'text-primary')} STUDY TIME
          </strong>
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">Recorded study sessions roll up to Week & Month</span>
        </div>
        <span style="font-size: 0.8rem; font-family: var(--font-mono); color: var(--color-text-main); font-weight: 600;">
          Total: ${isProgramActive ? data.studyHoursFormatted : '0h 0m'}
        </span>
      </div>

      <!-- Logged Sessions List -->
      <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
        ${sessions && sessions.length > 0 ? sessions.map(s => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.82rem;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge ${CATEGORY_META[s.category]?.badgeClass || 'badge-gray'}" style="font-size: 0.65rem;">
                ${s.category}
              </span>
              <span style="color: var(--color-text-main);">${s.notes || 'Study Session'}</span>
            </div>
            <span style="font-family: var(--font-mono); color: var(--color-text-secondary); font-weight: 600;">
              ${s.duration_minutes}m
            </span>
          </div>
        `).join('') : `
          <div style="text-align: center; padding: 10px; color: var(--color-text-muted); font-size: 0.8rem; background: var(--color-bg-base); border-radius: var(--radius-sm);">
            No study sessions logged for this day yet.
          </div>
        `}
      </div>

      <!-- Quick Inline Logger Form (Disabled for future dates per Section 26) -->
      ${!isFuture ? `
        <form id="form-log-study-session" style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; background: var(--color-bg-base); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
          <select id="study-input-category" style="padding: 5px 8px; border-radius: var(--radius-xs); background: var(--color-bg-surface); border: 1px solid var(--color-border); color: var(--color-text-main); font-size: 0.8rem;">
            <option value="LEARN">LEARN (Prime 3.0 / Indiv)</option>
            <option value="PRACTICE">PRACTICE (DSA)</option>
            <option value="SEMESTER">SEMESTER (Exam Prep)</option>
            <option value="BUILD">BUILD (Project)</option>
            <option value="REVISE">REVISE (Review)</option>
          </select>

          <input
            type="number"
            id="study-input-duration"
            placeholder="Minutes"
            value="60"
            min="5"
            max="720"
            style="width: 95px; padding: 5px 8px; border-radius: var(--radius-xs); background: var(--color-bg-surface); border: 1px solid var(--color-border); color: var(--color-text-main); font-size: 0.8rem;"
            required
          />

          <input
            type="text"
            id="study-input-notes"
            placeholder="What did you work on?"
            style="flex: 1; min-width: 140px; padding: 5px 8px; border-radius: var(--radius-xs); background: var(--color-bg-surface); border: 1px solid var(--color-border); color: var(--color-text-main); font-size: 0.8rem;"
          />

          <button type="submit" class="btn btn-primary btn-xs" style="padding: 6px 12px; font-weight: 600;">
            + Log Session
          </button>
        </form>
      ` : `
        <div style="font-size: 0.8rem; color: var(--color-text-muted); text-align: center; padding: 8px; background: var(--color-bg-base); border-radius: var(--radius-sm);">
          ${!isProgramActive ? 'Study session tracking begins on October 1, 2026.' : 'Study time cannot be logged against future dates.'}
        </div>
      `}
    </div>
  `;
}

function renderCarriedForwardSection(carriedTasks, activeDate, canonicalToday) {
  if (!carriedTasks || carriedTasks.length === 0) return '';
  return `
    <div class="card" style="padding: 16px 20px; border: 1px solid var(--color-accent-amber); border-radius: var(--radius-md); background: var(--color-bg-surface);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-amber" style="font-weight: 800; font-size: 0.75rem;">OVERDUE</span>
          <strong style="font-size: 0.88rem; color: var(--color-text-main);">CARRIED FORWARD</strong>
        </div>
        <span style="font-size: 0.78rem; color: var(--color-text-muted); font-family: var(--font-mono);">
          ${carriedTasks.length} unfinished ${carriedTasks.length === 1 ? 'task' : 'tasks'} from previous days
        </span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${carriedTasks.map(task => `
          <div id="task-row-${task.id}" class="today-task-card task-row ${task.completed ? 'completed' : ''}">
            <div class="today-task-main">
              <div class="today-task-check-wrap">
                <input
                  type="checkbox"
                  class="task-checkbox today-task-check"
                  disabled="disabled"
                  title="Move to today using 'Do Today' button to complete"
                  style="cursor: not-allowed; opacity: 0.5;"
                />
              </div>
              <div class="today-task-content">
                <div class="today-task-title">
                  ${task.title}
                </div>
                <div class="today-task-subtitle">
                  Planned: ${task.date} · ${task.category}
                </div>
              </div>
            </div>

            <div class="today-task-footer">
              <div class="today-task-meta">
                <span class="badge badge-rose" style="font-size: 0.68rem; font-weight: 700;">OVERDUE</span>
              </div>

              <div class="today-task-actions">
                <button class="btn btn-secondary btn-xs btn-do-today" data-id="${task.id}" title="Move task to today's plan">
                  Do Today
                </button>
                <button class="btn btn-ghost btn-xs btn-reschedule" data-id="${task.id}" title="Reschedule to another day">
                  Reschedule
                </button>
                <button class="btn btn-ghost btn-xs btn-skip-task" data-id="${task.id}" title="Skip this task">
                  Skip
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderEndOfDaySection(data, activeDate, canonicalToday) {
  const isProgramActive = canonicalToday >= PROGRAM_START_DATE;
  const rev = data.dailyReview || {};
  const studyHoursNum = isProgramActive ? (parseFloat(data.studyHoursCompleted) || 0) : 0;
  const isStudyTargetMet = isProgramActive && (studyHoursNum >= data.targetStudyHours);

  return `
    <div class="card" style="padding: 16px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
        <strong style="font-size: 0.88rem; color: var(--color-text-main); display: flex; align-items: center; gap: 6px;">
          ${getIcon('target', 'text-emerald')} END OF DAY CHECK
        </strong>
        <span style="font-size: 0.78rem; color: var(--color-text-muted);">
          Actual Daily Measurements (No Arbitrary Scores)
        </span>
      </div>

      <!-- Measurement Table -->
      <div style="overflow-x: auto; margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--color-border); color: var(--color-text-muted); text-align: left;">
              <th style="padding: 6px 8px;">Metric</th>
              <th style="padding: 6px 8px;">Target</th>
              <th style="padding: 6px 8px;">Actual</th>
              <th style="padding: 6px 8px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--color-border-subtle);">
              <td style="padding: 8px; font-weight: 500;">Study hours</td>
              <td style="padding: 8px; color: var(--color-text-secondary);">${data.targetStudyHours}h</td>
              <td style="padding: 8px; font-family: var(--font-mono);">${isProgramActive ? data.studyHoursFormatted : '0h 0m'}</td>
              <td style="padding: 8px; text-align: center;">
                <span class="badge ${isStudyTargetMet ? 'badge-emerald' : 'badge-gray'}" style="font-size: 0.68rem;">
                  ${!isProgramActive ? 'Starts Oct 1' : (isStudyTargetMet ? '✓ Met' : 'In Progress')}
                </span>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid var(--color-border-subtle);">
              <td style="padding: 8px; font-weight: 500;">DSA playlist</td>
              <td style="padding: 8px; color: var(--color-text-secondary);">1 session+</td>
              <td style="padding: 8px; font-family: var(--font-mono);">${(isProgramActive && data.dsa.videoCompleted) ? '1 lecture done' : '0 done'}</td>
              <td style="padding: 8px; text-align: center;">
                <span class="badge ${(isProgramActive && data.dsa.videoCompleted) ? 'badge-emerald' : 'badge-gray'}" style="font-size: 0.68rem;">
                  ${!isProgramActive ? 'Starts Oct 1' : (data.dsa.videoCompleted ? '✓ Done' : 'Pending')}
                </span>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid var(--color-border-subtle);">
              <td style="padding: 8px; font-weight: 500;">DSA practice</td>
              <td style="padding: 8px; color: var(--color-text-secondary);">1 problem+</td>
              <td style="padding: 8px; font-family: var(--font-mono);">${(isProgramActive && data.dsa.practiceDone) ? '1 problem done' : '0 done'}</td>
              <td style="padding: 8px; text-align: center;">
                <span class="badge ${(isProgramActive && data.dsa.practiceDone) ? 'badge-emerald' : 'badge-gray'}" style="font-size: 0.68rem;">
                  ${!isProgramActive ? 'Starts Oct 1' : (data.dsa.practiceDone ? '✓ Done' : 'Pending')}
                </span>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid var(--color-border-subtle);">
              <td style="padding: 8px; font-weight: 500;">Semester answers</td>
              <td style="padding: 8px; color: var(--color-text-secondary);">2 core; 3 optional</td>
              <td style="padding: 8px; font-family: var(--font-mono);">${isProgramActive ? data.semester.requiredCompleted : 0} core; ${isProgramActive ? data.semester.optionalCompleted : 0} optional</td>
              <td style="padding: 8px; text-align: center;">
                <span class="badge ${(isProgramActive && data.semester.requiredCompleted >= 2) ? 'badge-emerald' : 'badge-gray'}" style="font-size: 0.68rem;">
                  ${!isProgramActive ? 'Starts Oct 1' : (data.semester.requiredCompleted >= 2 ? '✓ Core Met' : 'Pending')}
                </span>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid var(--color-border-subtle);">
              <td style="padding: 8px; font-weight: 500;">Revision</td>
              <td style="padding: 8px; color: var(--color-text-secondary);">10–20 min</td>
              <td style="padding: 8px; font-family: var(--font-mono);">${(isProgramActive && data.tasks.REVISE.some(t => t.completed)) ? 'Completed' : 'Pending'}</td>
              <td style="padding: 8px; text-align: center;">
                <span class="badge ${(isProgramActive && data.tasks.REVISE.some(t => t.completed)) ? 'badge-emerald' : 'badge-gray'}" style="font-size: 0.68rem;">
                  ${!isProgramActive ? 'Starts Oct 1' : (data.tasks.REVISE.some(t => t.completed) ? '✓ Done' : 'Pending')}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: 500;">Gaming</td>
              <td style="padding: 8px; color: var(--color-text-secondary);">Optional; max 6h/wk</td>
              <td style="padding: 8px; font-family: var(--font-mono);">${isProgramActive ? data.gamingHoursThisWeek : 0}h / 6h</td>
              <td style="padding: 8px; text-align: center;">
                <span class="badge badge-gray" style="font-size: 0.68rem;">
                  Optional
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quick Reflection Inputs -->
      <form id="form-daily-reflection" style="display: flex; flex-direction: column; gap: 10px; border-top: 1px dashed var(--color-border-subtle); padding-top: 12px;">
        <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em;">
          QUICK REFLECTION
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
          <div>
            <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 2px;">What went well?</label>
            <input type="text" id="ref-went-well" class="form-input" style="font-size: 0.8rem; width: 100%;" value="${rev.went_well || ''}" placeholder="Main highlight today..." />
          </div>

          <div>
            <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 2px;">What should I continue tomorrow?</label>
            <input type="text" id="ref-continue-tomorrow" class="form-input" style="font-size: 0.8rem; width: 100%;" value="${rev.continue_tomorrow || ''}" placeholder="Continue momentum on..." />
          </div>

          <div>
            <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 2px;">DSA concept/lecture to revisit:</label>
            <input type="text" id="ref-dsa-revisit" class="form-input" style="font-size: 0.8rem; width: 100%;" value="${rev.dsa_revisit || ''}" placeholder="Optional topic to reinforce..." />
          </div>

          <div>
            <label style="font-size: 0.75rem; color: var(--color-text-secondary); display: block; margin-bottom: 2px;">Answer/concept to revise:</label>
            <input type="text" id="ref-exam-revise" class="form-input" style="font-size: 0.8rem; width: 100%;" value="${rev.exam_revise || ''}" placeholder="Optional answer..." />
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 6px;">
          ${isProgramActive ? `
            <button type="submit" id="btn-save-reflection" class="btn btn-primary btn-sm" style="font-size: 0.78rem; font-weight: 600;">
              Save Daily Review
            </button>
          ` : `
            <button type="button" disabled class="btn btn-secondary btn-sm" style="font-size: 0.78rem; opacity: 0.6; cursor: not-allowed;">
              Daily Review opens October 1, 2026
            </button>
          `}
        </div>
      </form>
    </div>
  `;
}

// -------------------------------------------------------------
// EVENT HANDLERS
// -------------------------------------------------------------

function attachEventListeners(container, activeDate, canonicalToday, data) {
  const currentData = () => data || getTodayData(activeDate);
  const isProgramActive = canonicalToday >= PROGRAM_START_DATE;

  // Date Picker Jump
  const datePicker = container.querySelector('#today-date-picker');
  if (datePicker) {
    datePicker.onchange = (e) => {
      let val = e.target.value;
      if (val) {
        if (val < PROGRAM_START_DATE) val = PROGRAM_START_DATE;
        window.location.hash = `#today?date=${val}`;
      }
    };
  }

  // Jump to Today / Start Date
  const jumpTodayBtn = container.querySelector('#btn-jump-today');
  if (jumpTodayBtn) {
    jumpTodayBtn.onclick = () => {
      viewingDate = null;
      window.location.hash = isProgramActive ? '#today' : `#today?date=${PROGRAM_START_DATE}`;
      renderToday(container);
    };
  }

  // Task Completion Checkboxes (Actionable only when activeDate === canonicalToday)
  container.querySelectorAll('.today-task-check').forEach(chk => {
    chk.onchange = async () => {
      const taskId = chk.getAttribute('data-id');
      const isSemester = chk.classList.contains('sem-task-check');
      const isDsaVideo = chk.getAttribute('data-is-dsa-vid') === 'true';
      const vidNumStr = chk.getAttribute('data-vid-num');
      const isChecked = chk.checked;

      if (isSemester) {
        await toggleSemesterAnswer(taskId, 'completed', isChecked);
      } else if (isDsaVideo && vidNumStr) {
        const vidNum = parseInt(vidNumStr);
        await toggleDSAVideo(vidNum, isChecked, true);
      } else {
        await toggleTaskCompletion(taskId, isChecked);
      }
      renderToday(container);
    };
  });

  // Future Task Plan Editing (Section 23, 24: Allowed to edit plan, but not complete)
  container.querySelectorAll('.btn-edit-plan').forEach(btn => {
    btn.onclick = () => {
      const taskId = btn.getAttribute('data-id');
      const tData = currentData();
      const allTasks = tData?.allTodayTasks || [];
      const task = allTasks.find(t => t.id === taskId) || {
        id: taskId,
        date: activeDate,
        title: decodeURIComponent(btn.getAttribute('data-title') || ''),
        notes: decodeURIComponent(btn.getAttribute('data-notes') || ''),
        estimated_minutes: parseInt(btn.getAttribute('data-mins') || '45')
      };
      openEditPlannedTaskModal(task, () => renderToday(container));
    };
  });

  // Reschedule Task
  container.querySelectorAll('.btn-reschedule').forEach(btn => {
    btn.onclick = () => {
      const taskId = btn.getAttribute('data-id');
      const tData = currentData();
      const allTasks = tData?.allTodayTasks || [];
      const task = allTasks.find(t => t.id === taskId) || { id: taskId, title: 'Task' };
      const tomorrow = shiftDate(activeDate, 1);
      openRescheduleTaskModal(task, tomorrow, () => renderToday(container));
    };
  });

  // Do Today Task (from Carried Forward or Past Incomplete)
  container.querySelectorAll('.btn-do-today').forEach(btn => {
    btn.onclick = async () => {
      const taskId = btn.getAttribute('data-id');
      await doTodayTask(taskId, canonicalToday);
      // Return to Today to view and complete the moved task
      viewingDate = null;
      window.location.hash = '#today';
    };
  });

  // Skip Task
  container.querySelectorAll('.btn-skip-task').forEach(btn => {
    btn.onclick = async () => {
      const taskId = btn.getAttribute('data-id');
      await skipTask(taskId);
      renderToday(container);
    };
  });

  // Unskip Task
  container.querySelectorAll('.btn-unskip-task').forEach(btn => {
    btn.onclick = async () => {
      const taskId = btn.getAttribute('data-id');
      await unskipTask(taskId);
      renderToday(container);
    };
  });

  // Jump to Task from Today's Priority
  container.querySelectorAll('.btn-priority-jump').forEach(btn => {
    btn.onclick = () => {
      const targetId = btn.getAttribute('data-target');
      const el = container.querySelector(`#${targetId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.outline = '2px solid var(--color-primary)';
        setTimeout(() => { el.style.outline = ''; }, 1500);
      }
    };
  });

  // Quick Gaming Log (In-DOM modal - works in Electron & Browser)
  const logGameBtn = container.querySelector('#btn-quick-log-game');
  if (logGameBtn) {
    logGameBtn.onclick = () => {
      const tData = currentData();
      openGamingModal(activeDate, tData?.gamingHoursThisWeek || 0, tData?.gamingLimit || 6, () => {
        renderToday(container);
      });
    };
  }

  // Quick Inline Study Session Logger
  const studyForm = container.querySelector('#form-log-study-session');
  if (studyForm) {
    studyForm.onsubmit = async (e) => {
      e.preventDefault();
      const cat = container.querySelector('#study-input-category').value;
      const duration = parseInt(container.querySelector('#study-input-duration').value || 60);
      const notes = container.querySelector('#study-input-notes').value.trim();

      await logNewStudySession({
        date: activeDate,
        durationMinutes: duration,
        category: cat,
        notes: notes || `${cat} Study Session`
      });

      renderToday(container);
    };
  }

  // End of Day Review Form
  const refForm = container.querySelector('#form-daily-reflection');
  if (refForm) {
    refForm.onsubmit = async (e) => {
      e.preventDefault();
      const saveBtn = container.querySelector('#btn-save-reflection');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
      }

      const went_well = container.querySelector('#ref-went-well').value.trim();
      const continue_tomorrow = container.querySelector('#ref-continue-tomorrow').value.trim();
      const dsa_revisit = container.querySelector('#ref-dsa-revisit').value.trim();
      const exam_revise = container.querySelector('#ref-exam-revise').value.trim();

      await saveDailyReview(activeDate, {
        went_well,
        continue_tomorrow,
        dsa_revisit,
        exam_revise
      });

      if (saveBtn) {
        saveBtn.textContent = '✓ Saved';
        setTimeout(() => {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Daily Review';
        }, 1500);
      }
    };
  }
}

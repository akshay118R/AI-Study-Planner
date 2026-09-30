/**
 * Akshay's Career Tracker - MAIN DASHBOARD View
 * 
 * Answers immediately: "How am I doing with my learning plan?"
 * 
 * Structure:
 * 1. Top Header with Dynamic Greeting & Prominent Live Clock (right-aligned)
 * 2. Today at a Glance (Tasks, Study Time, Focus, Completion %)
 * 3. Today's Progress (Overall Bar + Category Breakdown: Prime 3.0, DSA, Semester, DaVinci, Projects, Exercise)
 * 4. Focus Mode & Quick Focus Timer (Category Selector, Real-time Start/Pause/Stop, Independent Metric)
 * 5. This Week (Tasks, Study, Focus, DSA, Semester, DaVinci, Exercise, Consistency)
 * 6. This Month (October 2026, Tasks, Study, Focus, DSA, Semester, DaVinci, Exercise, Overall %)
 * 7. Today's Focus (Top 3 Priority Tasks, Clicking Navigates to Today)
 * 8. Upcoming Tasks (Next 3–5 Planned Tasks with View Navigation)
 * 9. Quick Actions (Today, Week, Month, Focus)
 * 10. Learning Breakdown & Performance Trends (Preserved from Progress: Summary, 3 Charts, DSA & DaVinci Playlists)
 */

import { getIcon } from '../components/icons.js';
import {
  getDashboardData,
  logFocusSession,
  toggleDSAVideo,
  toggleDavinciVideo,
  toggleJavaVideo
} from '../services/trackerService.js';
import { formatFullDate, getCanonicalToday, PROGRAM_START_DATE } from '../services/dateService.js';

let activeProgressFilter = 'MONTHLY'; // 'MONTHLY' | 'WEEKLY' | 'ALL TIME'
let clockIntervalId = null;
let lastKnownDayStr = null;

// Persistent in-memory timer state
const focusTimer = {
  running: false,
  startTime: null,
  accumulatedMs: 0,
  category: 'DSA',
  intervalId: null
};

export function cleanupDashboardView() {
  if (clockIntervalId) {
    clearInterval(clockIntervalId);
    clockIntervalId = null;
  }
  if (focusTimer.intervalId) {
    clearInterval(focusTimer.intervalId);
    focusTimer.intervalId = null;
  }
}

export function renderDashboard(container) {
  cleanupDashboardView();

  const data = getDashboardData(activeProgressFilter);
  const canonicalToday = getCanonicalToday();
  lastKnownDayStr = canonicalToday;

  // Resolve Timezone (Browser/Device with Fallback to Asia/Kolkata)
  let resolvedTimeZone = 'Asia/Kolkata';
  try {
    resolvedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch (e) {
    resolvedTimeZone = 'Asia/Kolkata';
  }

  // Format initial clock time (12-hour format with AM/PM and seconds)
  function getFormattedLiveTime() {
    const now = new Date();
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: resolvedTimeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(now);
    } catch (e) {
      return now.toLocaleTimeString('en-US', { hour12: true });
    }
  }

  const initialClockTime = getFormattedLiveTime();
  const dateFormatted = formatFullDate(canonicalToday);

  container.innerHTML = `
    <div class="tracker-page animate-fade-in" style="display: flex; flex-direction: column; gap: 24px; max-width: 960px; margin: 0 auto; width: 100%;">
      
      <!-- ================================================== -->
      <!-- 1. TOP HEADER & PROMINENT LIVE CLOCK (Sections 4 & 5) -->
      <!-- ================================================== -->
      <div class="dashboard-header-flex" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; padding-bottom: 4px;">
        <div style="flex: 1; min-width: 260px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <h1 style="font-size: 1.65rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px;">
              ${getIcon('dashboard', 'style="color: var(--color-primary); width: 26px; height: 26px;"')}
              <span>DASHBOARD</span>
            </h1>
            ${data.programDayText ? `
              <span class="badge badge-emerald" style="font-size: 0.72rem; font-weight: 700; padding: 4px 8px;">
                ${data.programDayText}
              </span>
            ` : ''}
          </div>

          <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-text-main); margin-top: 6px;">
            ${data.greeting}, Akshay
          </div>
          <div style="font-size: 0.88rem; color: var(--color-text-secondary); margin-top: 2px; font-weight: 500;">
            ${dateFormatted}
          </div>
        </div>

        <!-- Prominent Live Clock Card (Right Side) -->
        <div class="dashboard-clock-wrap" style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: 10px 18px; min-width: 190px;">
          <div style="font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">
            LIVE CLOCK
          </div>
          <div id="dashboard-live-clock-time" style="font-family: var(--font-mono, monospace); font-size: 1.45rem; font-weight: 800; letter-spacing: -0.01em; color: var(--color-primary); line-height: 1.2; margin-top: 2px;">
            ${initialClockTime}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600; margin-top: 2px; display: flex; align-items: center; gap: 4px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--color-accent-emerald); display: inline-block;"></span>
            <span>${resolvedTimeZone}</span>
          </div>
        </div>
      </div>

      <!-- Pre-start Notice Banner (When date < 2026-10-01) -->
      ${data.todayStats.isPreStart ? `
        <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(99, 102, 241, 0.05)); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: var(--radius-lg); padding: 16px 20px; display: flex; align-items: flex-start; gap: 14px;">
          <div style="color: var(--color-primary); margin-top: 2px;">
            ${getIcon('alertCircle', 'style="width: 22px; height: 22px;"')}
          </div>
          <div style="flex: 1;">
            <div style="font-size: 0.92rem; font-weight: 800; color: var(--color-primary); letter-spacing: 0.02em; text-transform: uppercase;">
              PROGRAM STARTS: OCTOBER 1, 2026
            </div>
            <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 3px; line-height: 1.45;">
              Your learning tracker begins on October 1, 2026. You may review and edit upcoming October tasks, but daily tracking and completion will begin on October 1.
            </div>
            <div style="margin-top: 8px;">
              <span class="badge badge-primary" style="font-size: 0.72rem; font-weight: 700;">
                PRE-START / PLANNING MODE ACTIVE
              </span>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- ================================================== -->
      <!-- 1. TODAY'S PROGRESS (Section 2 & 10) -->
      <!-- ================================================== -->
      <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">
              TODAY'S PROGRESS
            </div>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 4px;">
              ${data.todayStats.tasksCompleted} / ${data.todayStats.tasksTotal} completed
            </div>
          </div>
          <div style="font-size: 1.75rem; font-weight: 800; font-family: var(--font-mono); color: ${data.todayStats.completionRate >= 100 ? 'var(--color-accent-emerald)' : 'var(--color-primary)'};">
            ${data.todayStats.completionRate}%
          </div>
        </div>

        <!-- Master Progress Bar -->
        <div style="width: 100%; height: 8px; background: var(--color-bg-base); border-radius: 4px; overflow: hidden; border: 1px solid var(--color-border-subtle); margin-bottom: 14px;">
          <div style="width: ${data.todayStats.completionRate}%; height: 100%; background: linear-gradient(90deg, var(--color-primary), var(--color-accent-emerald)); border-radius: 4px; transition: width 0.4s ease;"></div>
        </div>

        ${data.todayStats.tasksTotal === 0 ? `
          <div style="font-size: 0.84rem; color: var(--color-text-muted); padding: 8px 0; text-align: center;">
            ${data.todayStats.isPreStart ? 'No active tasks before October 1, 2026 program start.' : 'No scheduled tasks for today.'}
          </div>
        ` : `
          <!-- Category Breakdown List -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); gap: 8px; margin-top: 8px;">
            ${data.todayStats.categories.map(cat => `
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: var(--color-bg-base); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
                <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${cat.name}
                </span>
                <span style="font-size: 0.76rem; font-weight: 700; font-family: var(--font-mono); color: ${cat.isDone ? 'var(--color-accent-emerald)' : 'var(--color-text-secondary)'}; flex-shrink: 0;">
                  ${cat.isDone ? '✓' : `${cat.percent}%`}
                </span>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- ================================================== -->
      <!-- 2. STUDY STREAK (Section 1 & 10) -->
      <!-- ================================================== -->
      <div class="card" style="padding: 16px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="font-size: 0.74rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">
            STUDY STREAK
          </div>
          <div style="font-size: 1.55rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 2px; display: flex; align-items: center; gap: 6px;">
            <span>🔥</span>
            <span>${data.studyStreak} ${data.studyStreak === 1 ? 'day' : 'days'}</span>
          </div>
        </div>
        <div style="font-size: 0.74rem; color: var(--color-text-secondary); max-width: 320px; text-align: right;">
          Calculated automatically from actual daily completions since Oct 1, 2026.
        </div>
      </div>

      <!-- ================================================== -->
      <!-- PROGRAMMING LANGUAGES SUMMARY (Section 21)         -->
      <!-- Python → Prime 3.0 • C++ → DSA • Java → Independent -->
      <!-- ================================================== -->
      <div class="card" style="padding: 16px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 6px;">
          <div style="font-size: 0.74rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">
            PROGRAMMING LANGUAGES
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-muted); font-family: var(--font-mono);">
            Learning Plan
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px;">
          <div style="background: var(--color-bg-base); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 700; font-size: 0.88rem; color: var(--color-text-main);">Python</div>
              <div style="font-size: 0.74rem; color: var(--color-text-secondary); margin-top: 2px;">→ Prime 3.0</div>
            </div>
            <span class="badge badge-blue" style="font-size: 0.65rem;">AI/ML</span>
          </div>
          <div style="background: var(--color-bg-base); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 700; font-size: 0.88rem; color: var(--color-text-main);">C++</div>
              <div style="font-size: 0.74rem; color: var(--color-text-secondary); margin-top: 2px;">→ DSA Playlist</div>
            </div>
            <span class="badge badge-purple" style="font-size: 0.65rem;">DSA</span>
          </div>
          <div style="background: var(--color-bg-base); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 700; font-size: 0.88rem; color: var(--color-text-main);">Java</div>
              <div style="font-size: 0.74rem; color: var(--color-text-secondary); margin-top: 2px;">→ Playlist Track</div>
            </div>
            <span class="badge badge-amber" style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3);">Playlist Track</span>
          </div>
        </div>
      </div>

      <!-- ================================================== -->
      <!-- 3. FOCUS MODE (Section 6 & 10) -->
      <!-- ================================================== -->
      <div id="section-focus-timer" class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); display: flex; align-items: center; gap: 6px;">
              ${getIcon('clock', 'style="width: 14px; height: 14px; color: var(--color-accent-purple);"') } FOCUS MODE
            </span>
            
            <!-- Focus Category Selector -->
            <div style="display: flex; align-items: center; gap: 6px;">
              <label for="sel-focus-cat" style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">Category:</label>
              <select id="sel-focus-cat" ${focusTimer.running || focusTimer.accumulatedMs > 0 ? 'disabled aria-disabled="true"' : ''} style="font-size: 0.76rem; font-weight: 700; padding: 4px 8px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: var(--color-bg-base); color: var(--color-text-main); cursor: ${focusTimer.running || focusTimer.accumulatedMs > 0 ? 'not-allowed' : 'pointer'}; opacity: ${focusTimer.running || focusTimer.accumulatedMs > 0 ? '0.75' : '1'};" title="${focusTimer.running || focusTimer.accumulatedMs > 0 ? 'Category is locked during active focus session' : 'Select focus category'}">
                <option value="DSA" ${focusTimer.category === 'DSA' ? 'selected' : ''}>DSA (C++)</option>
                <option value="Prime 3.0 AI/ML" ${(focusTimer.category === 'Prime 3.0 AI/ML' || focusTimer.category === 'Prime 3.0') ? 'selected' : ''}>Prime 3.0 AI/ML</option>
                <option value="Java" ${focusTimer.category === 'Java' ? 'selected' : ''}>Java (Playlist Track)</option>
                <option value="Semester Answers" ${(focusTimer.category === 'Semester Answers' || focusTimer.category === 'Semester Preparation') ? 'selected' : ''}>Semester Answers</option>
                <option value="DaVinci Resolve" ${focusTimer.category === 'DaVinci Resolve' ? 'selected' : ''}>DaVinci Resolve</option>
                <option value="Exercise" ${focusTimer.category === 'Exercise' ? 'selected' : ''}>Exercise</option>
                <option value="Projects" ${focusTimer.category === 'Projects' ? 'selected' : ''}>Projects</option>
                <option value="General Study" ${focusTimer.category === 'General Study' ? 'selected' : ''}>General Study</option>
              </select>
            </div>
          </div>

          <!-- Digital Timer Display -->
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px; text-align: center; margin-bottom: 12px;">
            <div id="dash-timer-display" style="font-family: var(--font-mono, monospace); font-size: 2.2rem; font-weight: 800; letter-spacing: 0.06em; color: var(--color-primary);">
              00:00:00
            </div>
            <div id="dash-timer-status" style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600; margin-top: 4px;">
              ${focusTimer.running ? `Focusing on ${focusTimer.category}...` : (focusTimer.accumulatedMs > 0 ? `Paused (${focusTimer.category})` : 'Ready to start deep work session')}
            </div>
          </div>

          <!-- Timer Action Buttons -->
          <div style="display: flex; gap: 8px;">
            <button id="btn-focus-start" class="btn btn-primary" style="flex: 1; font-weight: 700; padding: 8px;">
              ${focusTimer.running ? 'Running' : (focusTimer.accumulatedMs > 0 ? 'Resume' : 'Start Focus')}
            </button>
            <button id="btn-focus-pause" class="btn btn-secondary" style="font-weight: 700; padding: 8px 14px;" ${!focusTimer.running ? 'disabled' : ''}>
              Pause
            </button>
            <button id="btn-focus-stop" class="btn btn-danger" style="font-weight: 700; padding: 8px 14px;" ${(!focusTimer.running && focusTimer.accumulatedMs === 0) ? 'disabled' : ''}>
              Stop
            </button>
          </div>
        </div>

        <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 12px; border-top: 1px solid var(--color-border-subtle); padding-top: 8px;">
          Category is locked upon start and remains locked on pause until session is stopped.
        </div>
      </div>

      <!-- ================================================== -->
      <!-- 4 & 5. NEXT UP & NEEDS REVIEW (Sections 4, 5 & 10) -->
      <!-- ================================================== -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr)); gap: 14px;">
        
        <!-- NEXT UP (Section 5) -->
        <div class="card" style="padding: 18px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
              <span style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">
                NEXT UP
              </span>
              <span style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">UPCOMING TASKS</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${(data.nextUpTasks && data.nextUpTasks.length > 0) ? data.nextUpTasks.map(t => `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                  <div style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${t.title}
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
                      <span class="badge" style="font-size: 0.65rem; padding: 1px 6px;">${t.category}</span>
                      <span style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">${t.dayLabel || t.date}</span>
                    </div>
                  </div>
                  <button class="btn btn-ghost btn-xs btn-view-next-up" data-date="${t.date}" style="font-size: 0.72rem; font-weight: 700; padding: 4px 8px; flex-shrink: 0;">
                    View →
                  </button>
                </div>
              `).join('') : `
                <div style="font-size: 0.84rem; color: var(--color-text-muted); padding: 14px 10px; text-align: center;">
                  No upcoming scheduled tasks found.
                </div>
              `}
            </div>
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 12px; border-top: 1px solid var(--color-border-subtle); padding-top: 6px;">
            Preview only. Future tasks cannot be marked complete from here.
          </div>
        </div>

        <!-- NEEDS REVIEW / OVERDUE (Section 4) -->
        <div class="card" style="padding: 18px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
              <span style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">
                NEEDS REVIEW
              </span>
              <span style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">PAST INCOMPLETE</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${(data.needsReviewTasks && data.needsReviewTasks.length > 0) ? data.needsReviewTasks.map(t => `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                  <div style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
                    <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      • ${t.title}
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; margin-top: 3px;">
                      <span class="badge" style="font-size: 0.65rem; padding: 1px 6px;">${t.category}</span>
                      <span class="badge badge-amber" style="font-size: 0.65rem; padding: 1px 6px; font-family: var(--font-mono);">${t.dayLabel || t.date}</span>
                    </div>
                  </div>
                  <button class="btn btn-ghost btn-xs btn-view-needs-review" data-date="${t.date}" style="font-size: 0.72rem; font-weight: 700; padding: 4px 8px; flex-shrink: 0;">
                    Review →
                  </button>
                </div>
              `).join('') : `
                <div style="font-size: 0.84rem; color: var(--color-accent-emerald); padding: 14px 10px; text-align: center; font-weight: 600;">
                  ✓ All previous tasks are up to date.
                </div>
              `}
            </div>
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 12px; border-top: 1px solid var(--color-border-subtle); padding-top: 6px;">
            Past scheduled tasks that remain incomplete. Original dates are preserved.
          </div>
        </div>
      </div>

      <!-- ================================================== -->
      <!-- 6. WEEKLY CONSISTENCY (Section 3 & 10) -->
      <!-- ================================================== -->
      <div class="card" style="padding: 18px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
          <div style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">
            WEEKLY CONSISTENCY
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">
            ✓ Completed • ○ Incomplete • — No Work
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center;">
          ${(data.weeklyConsistency || []).map(day => `
            <div style="padding: 6px 2px; border-radius: var(--radius-sm); background: var(--color-bg-base); border: 1px solid ${day.isToday ? 'var(--color-primary)' : 'var(--color-border)'}; ${day.isFuture ? 'opacity: 0.6;' : ''}; min-width: 0; overflow: hidden;">
              <div style="font-size: 0.7rem; font-weight: 700; color: ${day.isToday ? 'var(--color-primary)' : 'var(--color-text-muted)'}; margin-bottom: 2px;">
                ${day.dayName}
              </div>
              <div style="font-size: 1.05rem; font-weight: 800; font-family: var(--font-mono); color: ${day.status === 'COMPLETED' ? 'var(--color-accent-emerald)' : (day.isFuture ? 'var(--color-text-muted)' : (day.status === 'INCOMPLETE' ? 'var(--color-accent-amber)' : 'var(--color-text-muted)'))}; line-height: 1.2;">
                ${day.symbol}
              </div>
              <div style="font-size: 0.58rem; color: var(--color-text-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${day.isToday ? 'Today' : (day.isFuture ? 'Future' : '')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ================================================== -->
      <!-- 7. MONTHLY PROGRESS (Section 7 & 10) -->
      <!-- ================================================== -->
      <div class="card" style="padding: 18px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
          <div>
            <div style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">
              MONTHLY PROGRESS
            </div>
            <div style="font-size: 0.95rem; font-weight: 700; color: var(--color-text-main); margin-top: 2px;">
              ${data.monthlyProgressSummary.monthName}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.7rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase;">Overall</div>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-primary);">
              ${data.monthlyProgressSummary.overallPercent}%
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${data.monthlyProgressSummary.categories.map(cat => `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-main); min-width: 80px; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${cat.name}">
                ${cat.name}
              </span>
              <div style="flex: 1; height: 6px; background: var(--color-bg-base); border-radius: 3px; overflow: hidden; border: 1px solid var(--color-border-subtle);">
                <div style="width: ${Math.min(100, cat.percent)}%; height: 100%; background: var(--color-primary); border-radius: 3px;"></div>
              </div>
              <span style="font-size: 0.76rem; font-weight: 700; font-family: var(--font-mono); min-width: 40px; text-align: right; color: ${cat.percent >= 100 ? 'var(--color-accent-emerald)' : 'var(--color-text-secondary)'}; flex-shrink: 0;">
                ${cat.percent}%
              </span>
            </div>
          `).join('')}
        </div>

        <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 12px; border-top: 1px solid var(--color-border-subtle); padding-top: 6px;">
          Completed work vs. monthly targets. Calculated from actual task records.
        </div>
      </div>

      <!-- ================================================== -->
      <!-- 6. QUICK ACTIONS BAR (Section 14) -->
      <!-- ================================================== -->
      <div class="card" style="padding: 16px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <span style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">
          QUICK ACTIONS
        </span>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button id="btn-quick-today" class="btn btn-secondary btn-sm" style="font-weight: 700; gap: 6px;">
            ${getIcon('today')} <span>Go to Today</span>
          </button>
          <button id="btn-quick-week" class="btn btn-secondary btn-sm" style="font-weight: 700; gap: 6px;">
            ${getIcon('weekly')} <span>View Week</span>
          </button>
          <button id="btn-quick-month" class="btn btn-secondary btn-sm" style="font-weight: 700; gap: 6px;">
            ${getIcon('monthly')} <span>View Month</span>
          </button>
          <button id="btn-quick-focus" class="btn btn-primary btn-sm" style="font-weight: 700; gap: 6px;">
            ${getIcon('clock')} <span>Start Focus</span>
          </button>
        </div>
      </div>

      <!-- ================================================== -->
      <!-- 7. PRESERVED PROGRESS: SUMMARY & CHARTS (Section 16) -->
      <!-- ================================================== -->
      <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">
              LEARNING BREAKDOWN & PERFORMANCE TRENDS
            </div>
            <div style="font-size: 0.88rem; color: var(--color-text-secondary); margin-top: 2px; font-weight: 500;">
              Measurable progress metrics across all course streams
            </div>
          </div>

          <!-- View Switcher (MONTHLY, WEEKLY, ALL TIME) -->
          <div style="display: flex; gap: 4px; background: var(--color-bg-surface); padding: 4px; border: 1px solid var(--color-border); border-radius: var(--radius-md);">
            ${['MONTHLY', 'WEEKLY', 'ALL TIME'].map(v => `
              <button class="btn btn-xs ${activeProgressFilter === v ? 'btn-primary' : 'btn-ghost'} btn-progress-filter" data-val="${v}" style="font-size: 0.78rem; font-weight: 700; padding: 6px 12px;">
                ${v}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Preserved Summary Grid -->
        <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
          <div style="font-size: 0.74rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); margin-bottom: 14px;">
            DETAILED SUMMARY (${activeProgressFilter})
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px;">
            <div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Study Hours</div>
              <div style="font-size: 1.3rem; font-weight: 800; color: var(--color-primary); font-family: var(--font-mono); margin-top: 2px;">
                ${data.progressData.summary.studyHours}h
              </div>
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">DSA Videos</div>
              <div style="font-size: 1.3rem; font-weight: 800; color: var(--color-accent-purple); font-family: var(--font-mono); margin-top: 2px;">
                ${data.progressData.summary.dsaVideos}
              </div>
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">DSA Problems</div>
              <div style="font-size: 1.3rem; font-weight: 800; color: var(--color-accent-purple); font-family: var(--font-mono); margin-top: 2px;">
                ${data.progressData.summary.dsaProblems} solved
              </div>
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Semester Answers</div>
              <div style="font-size: 1.3rem; font-weight: 800; color: var(--color-accent-cyan); font-family: var(--font-mono); margin-top: 2px;">
                ${data.progressData.summary.semesterAnswers} answers
              </div>
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Prime 3.0</div>
              <div style="font-size: 1.3rem; font-weight: 800; color: var(--color-primary); font-family: var(--font-mono); margin-top: 2px;">
                ${data.progressData.summary.prime3Progress}
              </div>
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Java Playlist Track</div>
              <div style="font-size: 1.3rem; font-weight: 800; color: #F59E0B; font-family: var(--font-mono); margin-top: 2px;">
                ${data.javaProgress ? `${data.javaProgress.completedVideos} / ${data.javaProgress.totalVideos}` : data.progressData.summary.individualProgress}
              </div>
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">DaVinci Resolve</div>
              <div style="font-size: 1.3rem; font-weight: 800; color: #EC4899; font-family: var(--font-mono); margin-top: 2px;">
                ${data.progressData.summary.davinciProgress}
              </div>
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Projects</div>
              <div style="font-size: 1.3rem; font-weight: 800; color: var(--color-accent-amber); font-family: var(--font-mono); margin-top: 2px;">
                ${data.progressData.summary.projectProgress}
              </div>
            </div>
            <div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Exercise</div>
              <div style="font-size: 1.3rem; font-weight: 800; color: var(--color-accent-emerald); font-family: var(--font-mono); margin-top: 2px;">
                ${data.progressData.summary.exerciseProgress}
              </div>
            </div>
          </div>
        </div>

        <!-- Preserved 3 Trend Charts -->
        <div>
          <div style="font-size: 0.74rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); margin-bottom: 10px;">
            WEEKLY TRENDS (MAX 3 CHARTS)
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 14px;">
            <!-- Chart 1: Study Hours per Week -->
            <div class="card" style="padding: 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 2px;">
                1. Study Hours per Week
              </div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-bottom: 12px;">
                Target: 32h / week
              </div>
              ${renderBarChart(data.progressData.charts.studyHoursPerWeek, 40, 'h', '#3B82F6')}
            </div>

            <!-- Chart 2: DSA Problems per Week -->
            <div class="card" style="padding: 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 2px;">
                2. DSA Problems per Week
              </div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-bottom: 12px;">
                Target: 10 problems / week
              </div>
              ${renderBarChart(data.progressData.charts.dsaProblemsPerWeek, 15, ' probs', '#8B5CF6')}
            </div>

            <!-- Chart 3: Task Completion per Week -->
            <div class="card" style="padding: 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 2px;">
                3. Task Completion per Week
              </div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-bottom: 12px;">
                Target: 100% completion
              </div>
              ${renderBarChart(data.progressData.charts.taskCompletionPerWeek, 100, '%', '#10B981')}
            </div>
          </div>
        </div>

        <!-- Preserved Apna College DSA Playlist Tracker -->
        <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
            <div>
              <div style="font-size: 0.86rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-main);">
                Apna College DSA Playlist Tracker
              </div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">
                Playlist: <a href="https://youtube.com/playlist?list=PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt&si=7qOZjYth49Nv-6NN" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">Apna College DSA Course (C++)</a>
              </div>
            </div>
            <span style="font-size: 0.82rem; font-family: var(--font-mono); color: var(--color-text-secondary); font-weight: 700;">
              ${data.progressData.dsaPlaylist.filter(v => v.completed).length} / ${data.progressData.dsaPlaylist.length} completed
            </span>
          </div>

          <div style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
            ${data.progressData.dsaPlaylist.map(v => `
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 12px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1;">
                  <input type="checkbox" class="dash-dsa-video-check" data-id="${v.id}" data-num="${v.video_number}" ${v.completed ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px;" />
                  <span style="font-size: 0.84rem; font-weight: 500; color: var(--color-text-main); ${v.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                    #${v.video_number}. ${v.title}
                  </span>
                </label>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: var(--color-text-muted); font-family: var(--font-mono);">
                  <span>${v.problems_solved || 0} problems</span>
                  ${v.completed ? '<span class="badge badge-emerald" style="font-size: 0.65rem;">Done</span>' : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Preserved DaVinci Resolve Playlist Tracker -->
        <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
            <div>
              <div style="font-size: 0.86rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-main); display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-pink" style="font-size: 0.68rem;">2x/Week</span> DaVinci Resolve Playlist Tracker
              </div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                Playlist: <a href="https://youtube.com/playlist?list=PLzlU7AmRSD8YCSar4ZdlNPpDce_lDbLe2&si=A5VpaF6NZNWSc6Hf" target="_blank" rel="noopener noreferrer" style="color: #EC4899; text-decoration: underline;">DaVinci Resolve Full Course</a>
              </div>
            </div>
            <span style="font-size: 0.82rem; font-family: var(--font-mono); color: var(--color-text-secondary); font-weight: 700;">
              ${data.progressData.davinciPlaylist.filter(v => v.completed).length} / ${data.progressData.davinciPlaylist.length} completed
            </span>
          </div>

          <div style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
            ${data.progressData.davinciPlaylist.map(v => `
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 12px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1;">
                  <input type="checkbox" class="dash-davinci-video-check" data-id="${v.id}" data-num="${v.video_number}" ${v.completed ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px; accent-color: #EC4899;" />
                  <span style="font-size: 0.84rem; font-weight: 500; color: var(--color-text-main); ${v.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                    #${v.video_number}. ${v.title}
                  </span>
                </label>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: var(--color-text-muted); font-family: var(--font-mono);">
                  <span>${v.duration_minutes || 45}m</span>
                  ${v.completed ? '<span class="badge badge-pink" style="font-size: 0.65rem;">Done</span>' : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Apna College Java Playlist Tracker -->
        <div class="card" style="padding: 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
            <div>
              <div style="font-size: 0.86rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-main); display: flex; align-items: center; gap: 8px;">
                <span class="badge badge-amber" style="font-size: 0.68rem; background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3);">Playlist Track</span>
                <span>Apna College Java Playlist Tracker</span>
              </div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                Playlist: <a href="${data.javaProgress?.playlistUrl || 'https://youtube.com/playlist?list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop&si=wQIkHGx0hH7rED5K'}" target="_blank" rel="noopener noreferrer" style="color: #F59E0B; text-decoration: underline;">Apna College Java Full Course</a>
              </div>
            </div>
            <span style="font-size: 0.82rem; font-family: var(--font-mono); color: var(--color-text-secondary); font-weight: 700;">
              ${data.javaProgress?.completedVideos || 0} / ${data.javaProgress?.totalVideos || 39} completed (${data.javaProgress?.percentage || 0}%)
            </span>
          </div>

          <!-- Current & Upcoming Task -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 12px;">
            <div style="background: var(--color-bg-base); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 0.68rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">Java Current Task</div>
              <div style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-main); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${data.javaProgress?.currentTask || 'Video/Lesson 1: Introduction to Java Language'}
              </div>
            </div>
            <div style="background: var(--color-bg-base); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 0.68rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">Java Upcoming Task</div>
              <div style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-main); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${data.javaProgress?.upcomingTask || 'None'}
              </div>
            </div>
          </div>

          <div style="max-height: 240px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;">
            ${(data.javaProgress?.videos || []).map(v => `
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 12px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1;">
                  <input type="checkbox" class="dash-java-video-check" data-id="${v.id}" data-num="${v.video_number}" ${v.completed ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px; accent-color: #F59E0B;" />
                  <span style="font-size: 0.84rem; font-weight: 500; color: var(--color-text-main); ${v.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                    #${v.video_number}. ${v.title}
                  </span>
                </label>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: var(--color-text-muted); font-family: var(--font-mono);">
                  <span>${v.duration_str || ''}</span>
                  ${v.completed ? '<span class="badge badge-amber" style="font-size: 0.65rem; background: rgba(245, 158, 11, 0.15); color: #F59E0B;">Done</span>' : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;

  // ==============================================================
  // ATTACH LIVE CLOCK TIMER (Section 5 & 22)
  // ==============================================================
  const clockEl = container.querySelector('#dashboard-live-clock-time');
  if (clockEl) {
    clockIntervalId = setInterval(() => {
      clockEl.textContent = getFormattedLiveTime();

      // Check for midnight rollover
      const currentDay = getCanonicalToday();
      if (lastKnownDayStr && currentDay !== lastKnownDayStr) {
        lastKnownDayStr = currentDay;
        renderDashboard(container);
      }
    }, 1000);
  }

  // ==============================================================
  // FOCUS TIMER FUNCTIONALITY (Section 8 & 9)
  // ==============================================================
  const timerDisplay = container.querySelector('#dash-timer-display');
  const timerStatus = container.querySelector('#dash-timer-status');
  const btnStart = container.querySelector('#btn-focus-start');
  const btnPause = container.querySelector('#btn-focus-pause');
  const btnStop = container.querySelector('#btn-focus-stop');
  const selCategory = container.querySelector('#sel-focus-cat');

  function formatTime(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function getTimerTotalSeconds() {
    let ms = focusTimer.accumulatedMs;
    if (focusTimer.running && focusTimer.startTime) {
      ms += (Date.now() - focusTimer.startTime);
    }
    return Math.floor(ms / 1000);
  }

  function updateTimerUI() {
    if (!timerDisplay) return;
    const totalSec = getTimerTotalSeconds();
    timerDisplay.textContent = formatTime(totalSec);
  }

  updateTimerUI();

  if (selCategory) {
    selCategory.onchange = () => {
      // Guard: Cannot change category during an active/paused session
      if (focusTimer.running || focusTimer.accumulatedMs > 0) {
        selCategory.value = focusTimer.category;
        return;
      }
      focusTimer.category = selCategory.value;
      if (timerStatus) {
        timerStatus.textContent = 'Ready to start deep work session';
      }
    };
  }

  if (btnStart) {
    btnStart.onclick = () => {
      if (!focusTimer.running) {
        focusTimer.running = true;
        focusTimer.startTime = Date.now();
        // If starting fresh session, record selected category; if resuming, preserve original category
        if (focusTimer.accumulatedMs === 0) {
          focusTimer.category = selCategory ? selCategory.value : (focusTimer.category || 'DSA');
        }
        // Lock category selector during active focus session
        if (selCategory) {
          selCategory.value = focusTimer.category;
          selCategory.disabled = true;
          selCategory.setAttribute('aria-disabled', 'true');
          selCategory.style.cursor = 'not-allowed';
          selCategory.style.opacity = '0.75';
          selCategory.title = 'Category is locked during active focus session';
        }
        btnStart.textContent = 'Running';
        btnPause.disabled = false;
        btnStop.disabled = false;
        if (timerStatus) timerStatus.textContent = `Focusing on ${focusTimer.category}...`;

        if (focusTimer.intervalId) clearInterval(focusTimer.intervalId);
        focusTimer.intervalId = setInterval(() => {
          updateTimerUI();
        }, 1000);
      }
    };
  }

  if (btnPause) {
    btnPause.onclick = () => {
      if (focusTimer.running) {
        focusTimer.running = false;
        focusTimer.accumulatedMs += (Date.now() - focusTimer.startTime);
        focusTimer.startTime = null;
        if (focusTimer.intervalId) clearInterval(focusTimer.intervalId);
        btnStart.textContent = 'Resume';
        btnPause.disabled = true;
        // Category REMAINS LOCKED during pause
        if (selCategory) {
          selCategory.value = focusTimer.category;
          selCategory.disabled = true;
          selCategory.setAttribute('aria-disabled', 'true');
          selCategory.style.cursor = 'not-allowed';
          selCategory.style.opacity = '0.75';
          selCategory.title = 'Category is locked during active focus session';
        }
        if (timerStatus) timerStatus.textContent = `Paused (${focusTimer.category})`;
      }
    };
  }

  if (btnStop) {
    btnStop.onclick = async () => {
      const totalSec = getTimerTotalSeconds();
      if (focusTimer.intervalId) clearInterval(focusTimer.intervalId);

      const category = focusTimer.category || 'DSA';
      focusTimer.running = false;
      focusTimer.startTime = null;
      focusTimer.accumulatedMs = 0;

      // Unlock category selector for next session
      if (selCategory) {
        selCategory.disabled = false;
        selCategory.removeAttribute('aria-disabled');
        selCategory.style.cursor = 'pointer';
        selCategory.style.opacity = '1';
        selCategory.title = 'Select focus category';
      }

      if (totalSec >= 5) {
        await logFocusSession({
          category,
          durationSeconds: totalSec
        });
      }

      // Re-render dashboard to immediately update Focus stats
      renderDashboard(container);
    };
  }

  // ==============================================================
  // QUICK ACTIONS & NAVIGATION HANDLERS (Section 14)
  // ==============================================================
  const btnQuickToday = container.querySelector('#btn-quick-today');
  if (btnQuickToday) {
    btnQuickToday.onclick = () => {
      window.location.hash = '#today';
    };
  }

  const btnQuickWeek = container.querySelector('#btn-quick-week');
  if (btnQuickWeek) {
    btnQuickWeek.onclick = () => {
      window.location.hash = '#week';
    };
  }

  const btnQuickMonth = container.querySelector('#btn-quick-month');
  if (btnQuickMonth) {
    btnQuickMonth.onclick = () => {
      window.location.hash = '#month';
    };
  }

  const btnQuickFocus = container.querySelector('#btn-quick-focus');
  if (btnQuickFocus) {
    btnQuickFocus.onclick = () => {
      const focusCard = container.querySelector('#section-focus-timer');
      if (focusCard) {
        focusCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (!focusTimer.running && btnStart) {
        btnStart.click();
      }
    };
  }

  const btnNavWeek = container.querySelector('.btn-nav-week');
  if (btnNavWeek) {
    btnNavWeek.onclick = () => {
      window.location.hash = '#week';
    };
  }

  const btnNavMonth = container.querySelector('.btn-nav-month');
  if (btnNavMonth) {
    btnNavMonth.onclick = () => {
      window.location.hash = '#month';
    };
  }

  // Today Focus tasks navigate to Today (Section 13)
  container.querySelectorAll('.dash-focus-task-item').forEach(item => {
    item.onclick = () => {
      window.location.hash = '#today';
    };
  });

  // Upcoming / Next Up tasks view button navigates to preview date (Section 5 & 12)
  container.querySelectorAll('.btn-view-upcoming, .btn-view-next-up').forEach(btn => {
    btn.onclick = () => {
      const d = btn.getAttribute('data-date');
      if (d) {
        window.location.hash = `#today?date=${d}`;
      } else {
        window.location.hash = '#week';
      }
    };
  });

  // Needs review view button navigates to overdue date to review task on original date (Section 4)
  container.querySelectorAll('.btn-view-needs-review').forEach(btn => {
    btn.onclick = () => {
      const d = btn.getAttribute('data-date');
      if (d) {
        window.location.hash = `#today?date=${d}`;
      } else {
        window.location.hash = '#today';
      }
    };
  });

  // ==============================================================
  // PRESERVED PROGRESS EVENT HANDLERS (Section 16)
  // ==============================================================
  container.querySelectorAll('.btn-progress-filter').forEach(btn => {
    btn.onclick = () => {
      activeProgressFilter = btn.getAttribute('data-val');
      renderDashboard(container);
    };
  });

  container.querySelectorAll('.dash-dsa-video-check').forEach(chk => {
    chk.onchange = async () => {
      const id = chk.getAttribute('data-id');
      await toggleDSAVideo(id, chk.checked);
      renderDashboard(container);
    };
  });

  container.querySelectorAll('.dash-davinci-video-check').forEach(chk => {
    chk.onchange = async () => {
      const vidNum = parseInt(chk.getAttribute('data-num'), 10);
      await toggleDavinciVideo(vidNum, chk.checked);
      renderDashboard(container);
    };
  });

  container.querySelectorAll('.dash-java-video-check').forEach(chk => {
    chk.onchange = async () => {
      const vidNum = parseInt(chk.getAttribute('data-num'), 10);
      await toggleJavaVideo(vidNum);
      renderDashboard(container);
    };
  });
}

function renderBarChart(items, maxScale, unit, barColor) {
  return `
    <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; height: 110px; padding-top: 8px; border-bottom: 1px solid var(--color-border-subtle);">
      ${items.map(item => {
        const heightPercent = Math.min(100, Math.max(10, Math.round((item.value / maxScale) * 100)));
        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 1; height: 100%; justify-content: flex-end;">
            <span style="font-size: 0.68rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-text-secondary);">
              ${item.value}${unit}
            </span>
            <div style="width: 100%; max-width: 24px; height: ${heightPercent}%; background: ${barColor}; border-radius: 4px 4px 0 0; opacity: 0.85; transition: height 0.3s ease;"></div>
            <span style="font-size: 0.65rem; color: var(--color-text-muted); margin-top: 2px;">
              ${item.week}
            </span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Akshay's Career Tracker - WEEK View
 * Strict middle layer: MONTH -> WEEK -> DAY
 * Based directly on Weekly_Plan_DSA_Semester_Gaming.pdf
 * 
 * Sections:
 * 1. WEEK HEADER (Week number, Date range, Parent Month, Prev/Selector/Next)
 * 2. WEEKLY TARGETS (Study Hours, DSA Videos, DSA Problems, Semester Answers, Prime 3.0, Individual, Project, Gaming)
 * 3. MONDAY → SUNDAY (7 compact day cards, click opens Today)
 * 4. WEEKLY DAILY BREAKDOWN (PDF schedule across LEARN, PRACTICE, SEMESTER rotation, BUILD, REVISE)
 * 5. DSA WEEKLY TRACKING (Apna College playlist checklist + Problems target/completed)
 * 6. SEMESTER PREPARATION & REVISION (14 core required vs optional up to 21 + revision)
 * 7. WEEKLY GOALS (Max 5 important goals)
 * 8. WEEKLY REVIEW (Planned vs Actual, DSA Check, Semester Check, Reflection)
 */

import { getIcon } from '../components/icons.js';
import {
  getWeekData,
  toggleGoalCompletion,
  createNewGoal,
  deleteWeeklyGoal,
  saveWeeklyReview,
  toggleDSAVideo,
  toggleSemesterAnswer,
  createSemesterAnswer,
  logGamingHours,
  moveTasksToNextWeek,
  toggleJavaVideo,
  CATEGORY_META
} from '../services/trackerService.js';
import { getCanonicalToday, PROGRAM_START_DATE } from '../services/dateService.js';
import { openGamingModal } from '../components/trackerModals.js';
import { getPrimePartForReleaseDate } from '../data/primeData.js';

let viewingWeekId = null;
let reviewSaveFeedback = '';
let activeBreakdownDay = 'MONDAY';

export function setWeeklyViewingWeek(weekId) {
  viewingWeekId = weekId;
}

export function renderWeekly(container) {
  const hash = window.location.hash || '';
  let urlWeekId = null;
  if (hash.includes('?')) {
    const params = new URLSearchParams(hash.split('?')[1]);
    urlWeekId = params.get('id') || params.get('week');
  }

  const activeWeekId = urlWeekId || viewingWeekId || '2026-10-W1';
  viewingWeekId = activeWeekId;
  const data = getWeekData(activeWeekId);
  const canonicalToday = getCanonicalToday();
  const isFutureWeek = (canonicalToday < PROGRAM_START_DATE) || (data.startDate > canonicalToday);

  // Status color/badge
  let statusBadgeClass = 'badge-blue';
  if (data.weekStatus === 'Current Week') statusBadgeClass = 'badge-emerald';
  else if (data.weekStatus === 'Past') statusBadgeClass = 'badge-gray';

  container.innerHTML = `
    <div class="tracker-page animate-fade-in" style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- ================================================== -->
      <!-- 1. WEEK HEADER                                     -->
      <!-- ================================================== -->
      <header class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <!-- Breadcrumb Navigation: Month -> Week -->
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 6px;">
              <a href="#month?id=${data.parentMonthId}" style="color: var(--color-primary); text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                ${getIcon('monthly', 'style="width: 13px; height: 13px;"')} ${data.parentMonthTitle}
              </a>
              <span>›</span>
              <span style="color: var(--color-text-main); font-weight: 600;">Week ${data.weekNumber}</span>
              <span class="badge ${statusBadgeClass}" style="margin-left: 6px; font-size: 0.7rem;">${data.weekStatus}</span>
            </div>

            <!-- Week Title & Date Range -->
            <div style="display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;">
              <h1 style="font-size: 1.75rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; color: var(--color-text-main);">
                Week ${data.weekNumber}
              </h1>
              <span style="font-size: 1.05rem; font-weight: 600; color: var(--color-text-secondary); font-family: var(--font-mono);">
                ${data.rangeLabel}, ${data.parentMonthTitle.split(' ')[1] || '2026'}
              </span>
            </div>
          </div>

          <!-- Gaming Target (0-6h / week optional recreation) -->
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); padding: 8px 14px; border-radius: var(--radius-md); display: flex; align-items: center; gap: 10px; font-size: 0.82rem;">
            <div>
              <span style="color: var(--color-text-muted);">Gaming:</span>
              <strong style="color: var(--color-text-main); margin-left: 4px; font-family: var(--font-mono);">${data.gamingHours}h / 6h</strong>
              <span style="color: var(--color-text-muted); font-size: 0.72rem; margin-left: 4px;">(Optional)</span>
            </div>
            <button class="btn btn-ghost btn-xs" id="btn-quick-log-gaming" style="padding: 2px 8px; font-size: 0.75rem; color: var(--color-primary);">
              + Log
            </button>
          </div>
        </div>

        <!-- Navigation Bar: Week Selector Dropdown, Next Week -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--color-border-subtle); flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <!-- Week Selector Dropdown -->
            <select id="select-week" class="form-select" style="padding: 6px 12px; font-size: 0.85rem; min-width: 180px; font-weight: 600;">
              ${(data.allPlanWeeks || []).map(w => `
                <option value="${w.weekId}" ${w.weekId === data.weekId ? 'selected' : ''}>
                  ${w.weekId.startsWith(data.parentMonthId) ? '● ' : ''}Week ${w.weekNumber} (${w.rangeLabel})
                </option>
              `).join('')}
            </select>

            <button class="btn btn-secondary btn-sm" id="btn-next-week" ${!data.nextWeekId ? 'disabled' : ''} style="display: flex; align-items: center; gap: 4px;">
              Next Week ${getIcon('chevronRight', 'style="width: 14px; height: 14px;"')}
            </button>
          </div>

          <a href="#month?id=${data.parentMonthId}" class="btn btn-ghost btn-sm" style="font-size: 0.82rem; color: var(--color-text-secondary);">
            View ${data.parentMonthTitle} Overview →
          </a>
        </div>
      </header>

      <!-- ================================================== -->
      <!-- 2. WEEKLY TARGETS                                  -->
      <!-- Transparent Completed / Target compact cards        -->
      <!-- ================================================== -->
      <section>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">
            WEEKLY TARGETS (From Weekly Plan PDF)
          </div>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">
            Transparent progress calculated from active records
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px;">
          <!-- Study Hours -->
          <div class="card" style="padding: 14px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Study Hours</div>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 4px;">
              ${data.targets.studyHoursCompleted}h <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted);">/ ${data.targets.studyHours}h</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 4px;">
              ${data.targets.studyHoursRemaining}h remaining this week
            </div>
          </div>

          <!-- DSA Videos -->
          <div class="card" style="padding: 14px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
            <div style="font-size: 0.72rem; color: var(--color-accent-purple); text-transform: uppercase; font-weight: 700;">DSA Playlist (C++)</div>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 4px;">
              ${data.targets.dsaVideosCompleted} <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted);">/ ${data.targets.dsaVideos} videos</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 4px;">
              Lectures ${data.dsa.startVideo}–${data.dsa.endVideo} (in order)
            </div>
          </div>

          <!-- DSA Problems -->
          <div class="card" style="padding: 14px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
            <div style="font-size: 0.72rem; color: var(--color-accent-purple); text-transform: uppercase; font-weight: 700;">DSA Problems</div>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 4px;">
              ${data.targets.dsaProblemsCompleted} <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted);">/ ${data.targets.dsaProblems} solved</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 4px;">
              Weekly target: 5–8 problems
            </div>
          </div>

          <!-- Semester Answers -->
          <div class="card" style="padding: 14px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
            <div style="font-size: 0.72rem; color: var(--color-accent-cyan); text-transform: uppercase; font-weight: 700;">Semester Answers</div>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 4px;">
              ${data.targets.semesterRequiredCompleted} <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted);">/ 14 core</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 4px;">
              Optional written: +${data.targets.semesterOptionalCompleted} (max 21)
            </div>
          </div>

          <!-- Prime 3.0 (under LEARN) -->
          <div class="card" style="padding: 14px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface); grid-column: span 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.72rem; color: var(--color-primary); text-transform: uppercase; font-weight: 700;">Prime 3.0 (LEARN)</span>
              <span class="badge badge-blue" style="font-size: 0.68rem;">${data.targets.primeProgress}</span>
            </div>
            <div style="font-size: 0.84rem; font-weight: 700; color: var(--color-text-main); margin-top: 6px; line-height: 1.35;">
              ${data.targets.primeTarget}
            </div>
          </div>

          <!-- Java Playlist Track (under LEARN) -->
          <div class="card" style="padding: 14px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface); grid-column: span 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.72rem; color: #F59E0B; text-transform: uppercase; font-weight: 700;">Java Playlist Track</span>
              <span class="badge badge-amber" style="font-size: 0.68rem; background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3);">${data.targets.javaVideosCompleted || 0} / ${data.targets.javaVideos || 1}</span>
            </div>
            <div style="font-size: 0.84rem; font-weight: 700; color: var(--color-text-main); margin-top: 6px; line-height: 1.35;">
              ${data.java?.video ? `Video ${data.java.video.video_number}: ${data.java.video.title}` : (data.targets.individualTarget || 'Java Playlist Track')}
            </div>
          </div>

          <!-- Project (under BUILD) -->
          <div class="card" style="padding: 14px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface); grid-column: span 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.72rem; color: var(--color-accent-amber); text-transform: uppercase; font-weight: 700;">Project (BUILD)</span>
              <span class="badge badge-amber" style="font-size: 0.68rem;">${data.targets.projectProgress}</span>
            </div>
            <div style="font-size: 0.84rem; font-weight: 700; color: var(--color-text-main); margin-top: 6px; line-height: 1.35;">
              ${data.targets.projectMilestone}
            </div>
          </div>

          <!-- DaVinci Resolve (Video Editing) -->
          <div class="card" style="padding: 14px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface); grid-column: span 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.72rem; color: #EC4899; text-transform: uppercase; font-weight: 700;">DaVinci Resolve</span>
              <span class="badge badge-pink" style="font-size: 0.68rem;">2 vids/wk</span>
            </div>
            <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 4px;">
              ${data.targets.davinciCompleted || 0} <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted);">/ ${data.targets.davinciTarget || 2} videos</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 4px;">
              Tue & Sat • ${data.targets.davinciRemaining || 0} remaining
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================== -->
      <!-- 2.1 PLAN VS ACTUAL (Requirement 1)                 -->
      <!-- ================================================== -->
      <section class="card" style="padding: 16px 20px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px;">
          <div style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-main);">
            PLAN VS ACTUAL (Week ${data.weekNumber})
          </div>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">From actual database records</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
          <!-- Study -->
          <div style="padding: 12px 14px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">Study</div>
            <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-top: 4px;">Planned: <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${data.planVsActual.study.planned}</strong></div>
            <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-top: 2px;">Actual: <strong style="color: var(--color-primary); font-family: var(--font-mono);">${data.planVsActual.study.actual}</strong></div>
          </div>

          <!-- DSA Videos -->
          <div style="padding: 12px 14px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent-purple); text-transform: uppercase;">DSA Videos</div>
            <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-top: 4px;">Planned: <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${data.planVsActual.dsaVideos.planned}</strong></div>
            <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-top: 2px;">Actual: <strong style="color: var(--color-accent-purple); font-family: var(--font-mono);">${data.planVsActual.dsaVideos.actual}</strong></div>
          </div>

          <!-- DSA Problems -->
          <div style="padding: 12px 14px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent-purple); text-transform: uppercase;">DSA Problems</div>
            <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-top: 4px;">Planned: <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${data.planVsActual.dsaProblems.planned}</strong></div>
            <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-top: 2px;">Actual: <strong style="color: var(--color-accent-purple); font-family: var(--font-mono);">${data.planVsActual.dsaProblems.actual}</strong></div>
          </div>

          <!-- Semester Answers -->
          <div style="padding: 12px 14px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent-cyan); text-transform: uppercase;">Semester Answers</div>
            <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-top: 4px;">Planned: <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${data.planVsActual.semesterAnswers.planned}</strong></div>
            <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-top: 2px;">Actual: <strong style="color: var(--color-accent-cyan); font-family: var(--font-mono);">${data.planVsActual.semesterAnswers.actual}</strong></div>
          </div>

          <!-- DaVinci Resolve -->
          <div style="padding: 12px 14px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">DaVinci Resolve</div>
            <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-top: 4px;">Planned: <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${data.planVsActual.davinciVideos?.planned || 2} videos</strong></div>
            <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-top: 2px;">Actual: <strong style="color: #EC4899; font-family: var(--font-mono);">${data.planVsActual.davinciVideos?.actual || 0} videos</strong></div>
          </div>

          <!-- Java Playlist Videos -->
          <div style="padding: 12px 14px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
            <div style="font-size: 0.75rem; font-weight: 700; color: #F59E0B; text-transform: uppercase;">Java Playlist</div>
            <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-top: 4px;">Planned: <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${data.planVsActual?.javaVideos?.planned || 1} video</strong></div>
            <div style="font-size: 0.84rem; color: var(--color-text-secondary); margin-top: 2px;">Actual: <strong style="color: #F59E0B; font-family: var(--font-mono);">${data.planVsActual?.javaVideos?.actual || 0} video</strong></div>
          </div>
        </div>
      </section>

      <!-- ================================================== -->
      <!-- 3. MONDAY → SUNDAY (7 Compact Day Cards)           -->
      <!-- Clicking any day opens Today for that date         -->
      <!-- ================================================== -->
      <section>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">
            MONDAY → SUNDAY (Click any day to open Today view)
          </div>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">
            Week contains exactly 7 days
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px;" class="week-days-container">
          ${data.days.map(d => {
            let statusBadge = `<span style="font-size: 0.68rem; color: var(--color-text-muted); font-weight: 600;">Pending</span>`;
            if (d.status === 'Completed') {
              statusBadge = `<span style="font-size: 0.68rem; color: #10B981; font-weight: 700;">✓ Completed</span>`;
            } else if (d.status === 'In Progress') {
              statusBadge = `<span style="font-size: 0.68rem; color: var(--color-primary); font-weight: 700;">In Progress</span>`;
            }

            return `
              <div class="day-card" data-date="${d.date}" style="padding: 14px 10px; background: ${d.isToday ? 'rgba(59, 130, 246, 0.12)' : 'var(--color-bg-surface)'}; border: 1px solid ${d.isToday ? 'var(--color-primary)' : 'var(--color-border)'}; border-radius: var(--radius-md); text-align: center; cursor: pointer; transition: all 0.15s ease; display: flex; flex-direction: column; justify-content: space-between; min-height: 115px;">
                <div>
                  <div style="font-size: 0.8rem; font-weight: 800; color: ${d.isToday ? 'var(--color-primary)' : 'var(--color-text-main)'}; margin-bottom: 2px;">
                    ${d.dayName}
                  </div>
                  <div style="font-size: 0.78rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 6px; font-family: var(--font-mono);">
                    ${d.displayDate}
                  </div>
                  ${d.dayName === 'TUE' || d.dayName === 'SAT' ? `
                    <div style="margin-bottom: 4px;">
                      <span class="badge badge-pink" style="font-size: 0.62rem; padding: 1px 5px; font-weight: 700;">DaVinci</span>
                    </div>
                  ` : ''}
                  ${d.dayName === 'THU' ? `
                    <div style="margin-bottom: 4px;">
                      <span class="badge badge-amber" style="font-size: 0.62rem; padding: 1px 5px; font-weight: 700; background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3);">Java Track</span>
                    </div>
                  ` : ''}
                  ${(d.dayName === 'FRI' || d.dayName === 'SAT') ? (() => {
                    const primePart = getPrimePartForReleaseDate(d.date);
                    return primePart ? `
                      <div style="margin-bottom: 4px;">
                        <span class="badge badge-blue" style="font-size: 0.62rem; padding: 1px 5px; font-weight: 700;" title="${primePart.title}">Prime Part ${primePart.partNumber} Released</span>
                      </div>
                    ` : '';
                  })() : ''}
                </div>

                <div style="margin: 6px 0;">
                  <div style="font-size: 0.78rem; font-weight: 700; color: var(--color-text-main); font-family: var(--font-mono);">
                    ${d.tasksCompleted} / ${d.tasksTotal} tasks
                  </div>
                  <div style="font-size: 0.72rem; color: var(--color-text-muted); font-family: var(--font-mono); margin-top: 2px;">
                    ${d.plannedStudyHours}h planned
                  </div>
                </div>

                <div>
                  ${statusBadge}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- ================================================== -->
      <!-- 4. WEEKLY DAILY BREAKDOWN                          -->
      <!-- From Weekly Plan PDF Pages 2-5                      -->
      <!-- Across: LEARN, PRACTICE, SEMESTER, BUILD, REVISE   -->
      <!-- ================================================== -->
      <section class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-main);">
              WEEKLY DAILY BREAKDOWN (From Weekly Plan PDF)
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
              Exact subject rotation and learning distribution for all 7 days.
            </div>
          </div>

          <!-- Day Selection Tabs -->
          <div style="display: flex; gap: 4px; background: var(--color-bg-base); padding: 3px; border-radius: var(--radius-sm); border: 1px solid var(--color-border-subtle); overflow-x: auto;">
            ${['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(dName => `
              <button class="btn btn-ghost btn-xs btn-tab-breakdown" data-day="${dName}" style="padding: 3px 8px; font-size: 0.75rem; font-weight: 700; ${dName === activeBreakdownDay ? 'background: var(--color-bg-surface-elevated); color: var(--color-primary); box-shadow: 0 1px 2px rgba(0,0,0,0.1);' : 'color: var(--color-text-muted);'}">
                ${dName.substring(0, 3)}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Selected Day's PDF Schedule Card -->
        ${(() => {
          const selectedDayData = data.days.find(d => d.dayName === activeBreakdownDay) || data.days[0];
          const schedule = selectedDayData.schedule;
          const isPrimeRelease = selectedDayData.dayName === 'FRI' || selectedDayData.dayName === 'SAT';
          const primePart = isPrimeRelease ? getPrimePartForReleaseDate(selectedDayData.date) : null;
          return `
            <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <strong style="font-size: 1rem; color: var(--color-text-main);">${activeBreakdownDay}</strong>
                  <span style="font-size: 0.82rem; color: var(--color-text-secondary); font-family: var(--font-mono);">${selectedDayData.displayDate}</span>
                  ${primePart ? `<span class="badge badge-blue" style="font-size: 0.72rem; font-weight: 700;">Prime 3.0 Part ${primePart.partNumber} Released</span>` : ''}
                </div>
                <div style="font-size: 0.8rem; color: var(--color-text-muted);">
                  Planned Study: <strong style="color: var(--color-text-main);">${schedule.plannedStudyHours}h</strong> | Tasks: <strong style="color: var(--color-text-main);">${selectedDayData.tasksCompleted}/${selectedDayData.tasksTotal}</strong>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
                <!-- LEARN -->
                <div style="padding: 12px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.72rem; font-weight: 800; color: var(--color-primary); text-transform: uppercase;">LEARN</div>
                    ${primePart ? `<span class="badge badge-blue" style="font-size: 0.65rem;">New Part</span>` : ''}
                  </div>
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main); margin-top: 4px;">
                    ${primePart ? `Prime 3.0 — Part ${primePart.partNumber} Released` : 'Prime 3.0 • Independent Java'}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                    ${primePart ? `<strong>${primePart.title}</strong><div style="margin-top:2px; font-size:0.72rem;">• Videos • Lecture Notes • Assignment Problems<br/><span style="color:var(--color-primary); font-weight:600;">Complete when convenient</span></div>` : 'Self-paced review & assignments • Java Fundamentals'}
                  </div>
                </div>

                <!-- PRACTICE -->
                <div style="padding: 12px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
                  <div style="font-size: 0.72rem; font-weight: 800; color: var(--color-accent-purple); text-transform: uppercase;">PRACTICE</div>
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main); margin-top: 4px;">
                    DSA Playlist (C++)
                  </div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                    Watch lecture in order + code concept in C++ (1 problem min)
                  </div>
                </div>

                <!-- SEMESTER -->
                <div style="padding: 12px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
                  <div style="font-size: 0.72rem; font-weight: 800; color: var(--color-accent-cyan); text-transform: uppercase;">SEMESTER PREPARATION</div>
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main); margin-top: 4px;">
                    Answer 1 & Answer 2
                  </div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                    2 core required answers + Answer 3 Optional
                  </div>
                </div>

                <!-- BUILD -->
                <div style="padding: 12px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
                  <div style="font-size: 0.72rem; font-weight: 800; color: var(--color-accent-amber); text-transform: uppercase;">BUILD</div>
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main); margin-top: 4px;">
                    Project Milestone
                  </div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                    ${data.targets.projectMilestone}
                  </div>
                </div>

                <!-- REVISE -->
                <div style="padding: 12px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
                  <div style="font-size: 0.72rem; font-weight: 800; color: #10B981; text-transform: uppercase;">REVISE</div>
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main); margin-top: 4px;">
                    Review Material
                  </div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                    Review DSA concepts + semester exam answers (10–20 min)
                  </div>
                </div>

                <!-- OPTIONAL GAMING -->
                <div style="padding: 12px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
                  <div style="font-size: 0.72rem; font-weight: 800; color: var(--color-text-muted); text-transform: uppercase;">RECREATION</div>
                  <div style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-main); margin-top: 4px;">
                    Optional Gaming
                  </div>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                    Max 6 h weekly (does not affect learning targets)
                  </div>
                </div>
              </div>

              <div style="margin-top: 14px; text-align: right;">
                <button class="btn btn-primary btn-xs btn-open-today-for-day" data-date="${selectedDayData.date}">
                  Open ${activeBreakdownDay} (${selectedDayData.displayDate}) Today Page →
                </button>
              </div>
            </div>
          `;
        })()}
      </section>

      <!-- ================================================== -->
      <!-- 5. DSA WEEKLY TRACKING                             -->
      <!-- Playlist order from Apna College Complete C++ DSA   -->
      <!-- Directly connected to Monthly progress              -->
      <!-- ================================================== -->
      <section class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-accent-purple);">
              DSA WEEKLY TRACKING
            </div>
            <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-top: 2px;">
              ${data.dsa.courseName} • 
              <a href="${data.dsa.playlistUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">
                Open YouTube Playlist ↗
              </a>
            </div>
          </div>

          <div style="font-size: 0.82rem; color: var(--color-text-secondary); font-family: var(--font-mono);">
            Lectures Planned: <strong>${data.dsa.plannedVideos}</strong> (${data.dsa.startVideo}–${data.dsa.endVideo})
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          <!-- Playlist Videos Checklist -->
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-secondary);">
                DSA PLAYLIST (Lectures in order)
              </span>
              <span style="font-size: 0.85rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-text-main);">
                ${data.dsa.completedVideos} / ${data.dsa.plannedVideos}
              </span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${data.dsa.videosList.map(v => `
                <label style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); font-size: 0.82rem; cursor: ${isFutureWeek ? 'not-allowed' : 'pointer'};">
                  <span style="display: flex; align-items: center; gap: 10px; flex: 1;">
                    <input type="checkbox" class="week-dsa-check" data-id="${v.id}" data-num="${v.video_number}" ${v.completed ? 'checked' : ''} ${isFutureWeek ? 'disabled="disabled" title="Future week — review only"' : ''} style="width: 16px; height: 16px; cursor: ${isFutureWeek ? 'not-allowed' : 'pointer'}; opacity: ${isFutureWeek ? '0.5' : '1'};" />
                    <span style="${v.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                      <strong style="color: var(--color-text-main); font-family: var(--font-mono);">#${v.video_number}</strong> ${v.title}
                    </span>
                  </span>
                  <span style="font-size: 0.72rem; color: var(--color-text-muted); font-family: var(--font-mono); margin-left: 8px;">
                    ${v.completed ? '✓ Watched' : 'Pending'}
                  </span>
                </label>
              `).join('')}
            </div>

            <div style="margin-top: 10px; font-size: 0.72rem; color: var(--color-text-muted);">
              Toggling a lecture here automatically syncs with the Monthly DSA progress (${data.parentMonthTitle}).
            </div>
          </div>

          <!-- Problem Solving Section -->
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-secondary);">
                  DSA PROBLEMS (Weekly target: 5–8)
                </span>
                <span style="font-size: 0.85rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-text-main);">
                  ${data.dsa.problemsCompleted} / ${data.dsa.problemsTarget}
                </span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.82rem; color: var(--color-text-secondary); margin-top: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Weekly Target:</span>
                  <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${data.dsa.problemsTarget} problems</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Solved so far:</span>
                  <strong style="color: #10B981; font-family: var(--font-mono);">${data.dsa.problemsCompleted}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Remaining:</span>
                  <strong style="color: #F97316; font-family: var(--font-mono);">${data.dsa.problemsRemaining}</strong>
                </div>
              </div>
            </div>

            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed var(--color-border-subtle); display: flex; gap: 8px;">
              <input type="text" id="input-dsa-prob-title" class="form-input" placeholder="Problem title/concept solved..." style="flex: 1; font-size: 0.8rem; padding: 4px 8px;" />
              <button class="btn btn-secondary btn-xs" id="btn-log-dsa-problem" style="font-size: 0.75rem; white-space: nowrap;">
                + Log Problem
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ================================================== -->
      <!-- 5.1 JAVA WEEKLY TRACKING                           -->
      <!-- Playlist order from Apna College Java Course       -->
      <!-- ================================================== -->
      <section class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #F59E0B;">
              JAVA — PLAYLIST TRACK
            </div>
            <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-top: 2px;">
              Apna College Java Playlist • 
              <a href="${data.java?.playlistUrl || 'https://youtube.com/playlist?list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop&si=wQIkHGx0hH7rED5K'}" target="_blank" rel="noopener noreferrer" style="color: #F59E0B; text-decoration: underline;">
                Open YouTube Playlist ↗
              </a>
            </div>
          </div>

          <div style="font-size: 0.82rem; color: var(--color-text-secondary); font-family: var(--font-mono);">
            Week ${data.weekNumber}: <strong>${data.java?.completedVideos || 0} / ${data.java?.targetVideos || 1} video completed</strong>
          </div>
        </div>

        ${data.java?.video ? `
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px;">
            <label style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); font-size: 0.85rem; cursor: ${isFutureWeek ? 'not-allowed' : 'pointer'};">
              <span style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <input type="checkbox" class="week-java-check" data-num="${data.java.video.video_number}" ${data.java.video.completed || (data.java.task && data.java.task.completed) ? 'checked' : ''} ${isFutureWeek ? 'disabled="disabled" title="Future week — review only"' : ''} style="width: 18px; height: 18px; cursor: ${isFutureWeek ? 'not-allowed' : 'pointer'}; accent-color: #F59E0B; opacity: ${isFutureWeek ? '0.5' : '1'};" />
                <span style="${data.java.video.completed || (data.java.task && data.java.task.completed) ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                  <strong style="color: #F59E0B; font-family: var(--font-mono);">Video/Lesson ${data.java.video.video_number}:</strong> ${data.java.video.title}
                </span>
              </span>
              <span style="font-size: 0.75rem; color: var(--color-text-muted); font-family: var(--font-mono); margin-left: 12px;">
                ${data.java.video.duration_str || ''} • ${data.java.video.completed || (data.java.task && data.java.task.completed) ? '✓ Watched' : 'Pending'}
              </span>
            </label>
            <div style="margin-top: 10px; font-size: 0.72rem; color: var(--color-text-muted);">
              Scheduled for Thursday • Checkbox is active on scheduled date according to date rules.
            </div>
          </div>
        ` : `
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px; color: var(--color-text-muted); font-size: 0.82rem;">
            No specific playlist video assigned for this revision/capstone week. Total playlist completed: ${data.java?.completedVideos || 0} / 39.
          </div>
        `}
      </section>

      <!-- ================================================== -->
      <!-- 6. SEMESTER PREPARATION & REVISION                 -->
      <!-- 14 Core required minimum + up to 21 optional        -->
      <!-- Revision tracked separately under REVISE           -->
      <!-- ================================================== -->
      <section class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-accent-cyan);">
              B.TECH SEMESTER PREPARATION & REVISION
            </div>
            <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-top: 2px;">
              Weekly rule: 14 core required answers minimum (2/day). Optional up to 21. Optional answers are not treated as required progress.
            </div>
          </div>

          <button class="btn btn-ghost btn-xs" id="btn-toggle-add-semester" style="color: var(--color-primary); font-size: 0.78rem;">
            + Add Semester Answer
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <!-- Required Metric -->
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 12px;">
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Required Core (2/day)</div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 2px;">
              ${data.semester.requiredCompleted} <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted);">/ 14</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 2px;">
              ${Math.max(0, 14 - data.semester.requiredCompleted)} answers needed
            </div>
          </div>

          <!-- Optional Metric -->
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 12px;">
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Optional 3rd Answers</div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 2px;">
              ${data.semester.optionalCompleted} <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted);">/ 7 optional</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 2px;">
              Total written: ${data.semester.totalCompleted}
            </div>
          </div>

          <!-- Revision Metric -->
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 12px;">
            <div style="font-size: 0.72rem; color: #10B981; text-transform: uppercase; font-weight: 700;">Semester Revision (REVISE)</div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 2px;">
              ${data.semester.revisionCompleted} <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted);">/ 5 sessions</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 2px;">
              Weekly target: 3–5 short sessions
            </div>
          </div>
        </div>

        <!-- Add Semester Answer Inline Form (Hidden by default) -->
        <div id="semester-answer-form" style="display: none; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px; margin-bottom: 14px;">
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-main); margin-bottom: 8px;">
            Record Semester Answer for Week ${data.weekNumber}
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; margin-bottom: 8px;">
            <select id="sem-slot" class="form-select" style="font-size: 0.8rem; padding: 6px;">
              <option value="1">Answer 1</option>
              <option value="2">Answer 2</option>
              <option value="3">Answer 3 — Optional</option>
            </select>
            <input type="date" id="sem-date" class="form-input" value="${data.startDate}" style="font-size: 0.8rem; padding: 6px;" />
          </div>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="sem-question" class="form-input" placeholder="Notes / topic (optional)..." style="flex: 1; font-size: 0.8rem; padding: 6px;" />
            <button class="btn btn-primary btn-xs" id="sem-btn-save">Save Answer</button>
            <button class="btn btn-ghost btn-xs" id="sem-btn-cancel">Cancel</button>
          </div>
        </div>

        <!-- Answers List for Week -->
        <div style="display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto;">
          ${(data.semester.answersList || []).length > 0 ? (data.semester.answersList || []).map(a => {
            const semCheckDisabled = isFutureWeek || (canonicalToday < PROGRAM_START_DATE) || (a.date !== canonicalToday);
            return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: var(--color-bg-base); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); font-size: 0.8rem;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" class="sem-answer-check" data-id="${a.id}" ${a.completed ? 'checked' : ''} ${semCheckDisabled ? 'disabled="disabled" title="Only actionable on its scheduled date"' : ''} style="cursor: ${semCheckDisabled ? 'not-allowed' : 'pointer'}; opacity: ${semCheckDisabled ? '0.5' : '1'};" />
                <span style="${a.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}">
                  <strong style="color: var(--color-text-main);">${a.is_optional || (a.title && a.title.includes('3')) ? 'Answer 3 — Optional' : (a.title || 'Answer')}</strong>
                  ${a.notes ? ` <span style="font-size: 0.72rem; color: var(--color-text-muted);">(${a.notes})</span>` : ''}
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                ${a.is_optional ? '<span class="badge badge-gray" style="font-size: 0.65rem;">Optional</span>' : '<span class="badge badge-cyan" style="font-size: 0.65rem;">Core</span>'}
                <span style="font-size: 0.7rem; color: var(--color-text-muted); font-family: var(--font-mono);">${a.date}</span>
              </div>
            </div>
          `;
          }).join('') : `
            <div style="text-align: center; padding: 12px; color: var(--color-text-muted); font-size: 0.8rem; background: var(--color-bg-base); border-radius: var(--radius-sm);">
              No answers logged yet this week. Use the button above to log written answers.
            </div>
          `}
        </div>
      </section>

      <!-- ================================================== -->
      <!-- 7. WEEKLY GOALS (Max 5 Important Goals)            -->
      <!-- ================================================== -->
      <section class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
          <div>
            <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-main);">
              WEEKLY GOALS <span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: normal;">(Max 5)</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
              Primary outcomes for Week ${data.weekNumber}
            </div>
          </div>

          ${data.goals.length < 5 ? `
            <button class="btn btn-ghost btn-xs" id="btn-add-week-goal" style="color: var(--color-primary); font-size: 0.78rem;">
              + Add Goal
            </button>
          ` : ''}
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${data.goals.map(g => {
            const cat = (g.category || 'LEARN').toUpperCase();
            let catBadge = 'badge-blue';
            if (cat === 'PRACTICE' || cat === 'DSA') catBadge = 'badge-purple';
            else if (cat === 'SEMESTER') catBadge = 'badge-cyan';
            else if (cat === 'BUILD' || cat === 'PROJECT') catBadge = 'badge-amber';
            else if (cat === 'REVISE') catBadge = 'badge-emerald';

            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                <label style="display: flex; align-items: center; gap: 12px; flex: 1; cursor: ${isFutureWeek ? 'not-allowed' : 'pointer'}; margin: 0;">
                  <input type="checkbox" class="week-goal-check" data-id="${g.id}" ${g.completed ? 'checked' : ''} ${isFutureWeek ? 'disabled="disabled" title="Future week — review only"' : ''} style="width: 17px; height: 17px; cursor: ${isFutureWeek ? 'not-allowed' : 'pointer'}; opacity: ${isFutureWeek ? '0.5' : '1'};" />
                  <span style="font-size: 0.88rem; color: var(--color-text-main); ${g.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                    ${g.title}
                  </span>
                </label>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="badge ${catBadge}" style="font-size: 0.68rem;">${cat}</span>
                  <button class="btn-delete-week-goal" data-id="${g.id}" title="Delete goal" style="background: none; border: none; color: var(--color-text-muted); cursor: pointer; font-size: 0.85rem; padding: 2px 4px;">
                    ✕
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Inline Quick Add Goal Form -->
        <div id="week-goal-form" style="display: none; margin-top: 12px; padding-top: 10px; border-top: 1px dashed var(--color-border-subtle);">
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <input type="text" id="week-goal-input" class="form-input" placeholder="New weekly goal..." style="flex: 2; min-width: 220px; font-size: 0.85rem;" />
            <select id="week-goal-category" class="form-select" style="flex: 1; min-width: 120px; font-size: 0.82rem;">
              <option value="PRACTICE">PRACTICE (DSA)</option>
              <option value="SEMESTER">SEMESTER (Exam Prep)</option>
              <option value="LEARN">LEARN (Prime 3.0 / Indiv)</option>
              <option value="BUILD">BUILD (Project)</option>
              <option value="REVISE">REVISE (Revision)</option>
            </select>
            <button class="btn btn-primary btn-xs" id="week-goal-save">Save</button>
            <button class="btn btn-ghost btn-xs" id="week-goal-cancel">Cancel</button>
          </div>
        </div>
      </section>

      <!-- ================================================== -->
      <!-- 8. WEEKLY REVIEW                                   -->
      <!-- Directly from Weekly Plan PDF Page 6               -->
      <!-- Planned vs Actual, DSA Check, Semester, Reflection -->
      <!-- ================================================== -->
      <section class="card" style="padding: 22px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
          <div>
            <div style="font-size: 0.88rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-main);">
              WEEKLY REVIEW (Page 6 of Weekly Plan PDF)
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
              Planned vs Actual summary, DSA & Semester checkpoints, and weekly reflections.
            </div>
          </div>
          ${reviewSaveFeedback ? `<span style="font-size: 0.75rem; color: #10B981; font-weight: 700;">${reviewSaveFeedback}</span>` : ''}
        </div>

        <!-- 8.1 WEEK COMPLETE & CARRY TO NEXT WEEK (Requirement 8) -->
        <div class="card" style="padding: 18px 20px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: 20px;">
          <div style="font-size: 0.88rem; font-weight: 800; color: var(--color-text-main); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <span class="badge badge-emerald">WEEK COMPLETE</span>
            <span>Week ${data.weekNumber} Review & Carry Forward</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 16px;">
            <div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Planned Study</div>
              <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-text-main); font-family: var(--font-mono); margin-top: 2px;">
                ${data.targets.studyHours}h
              </div>
            </div>

            <div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Actual Study</div>
              <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary); font-family: var(--font-mono); margin-top: 2px;">
                ${data.planVsActual.study.actual}
              </div>
            </div>

            <div>
              <div style="font-size: 0.72rem; color: var(--color-accent-purple); text-transform: uppercase; font-weight: 700;">DSA</div>
              <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-text-main); font-family: var(--font-mono); margin-top: 2px;">
                ${data.dsa.completedVideos} / ${data.dsa.plannedVideos} videos
              </div>
            </div>

            <div>
              <div style="font-size: 0.72rem; color: var(--color-accent-purple); text-transform: uppercase; font-weight: 700;">Problems</div>
              <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-text-main); font-family: var(--font-mono); margin-top: 2px;">
                ${data.dsa.problemsCompleted} / ${data.dsa.problemsTarget}
              </div>
            </div>

            <div>
              <div style="font-size: 0.72rem; color: var(--color-accent-cyan); text-transform: uppercase; font-weight: 700;">Semester</div>
              <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-text-main); font-family: var(--font-mono); margin-top: 2px;">
                ${data.semester.totalCompleted} / ${data.semester.requiredTarget} required
              </div>
            </div>

            <div>
              <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Remaining Tasks</div>
              <div style="font-size: 1.15rem; font-weight: 700; color: var(--color-accent-rose); font-family: var(--font-mono); margin-top: 2px;">
                ${data.incompleteTasks.length}
              </div>
            </div>
          </div>

          <!-- CARRY TO NEXT WEEK -->
          <div style="border-top: 1px solid var(--color-border-subtle); padding-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-size: 0.8rem; font-weight: 800; color: var(--color-text-main); text-transform: uppercase;">
                CARRY TO NEXT WEEK
              </div>
              <span style="font-size: 0.75rem; color: var(--color-text-muted);">
                ${data.incompleteTasks.length} incomplete tasks
              </span>
            </div>

            ${data.incompleteTasks && data.incompleteTasks.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px;">
                ${data.incompleteTasks.map(t => `
                  <label style="display: flex; align-items: center; gap: 10px; padding: 6px 10px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-xs); cursor: pointer; font-size: 0.82rem;">
                    <input type="checkbox" class="carry-week-task-check" data-id="${t.id}" style="width: 15px; height: 15px; cursor: pointer;" />
                    <span style="color: var(--color-text-main); flex: 1;">${t.title}</span>
                    <span class="badge badge-gray" style="font-size: 0.65rem;">${t.category}</span>
                    <span style="font-size: 0.72rem; color: var(--color-text-muted); font-family: var(--font-mono);">${t.date}</span>
                  </label>
                `).join('')}
              </div>

              <div style="display: flex; gap: 8px; align-items: center;">
                <button class="btn btn-primary btn-xs" id="btn-move-selected-tasks" style="font-weight: 700;">
                  Move Selected
                </button>
                <button class="btn btn-ghost btn-xs" id="btn-keep-for-review" style="border: 1px solid var(--color-border);">
                  Keep for Review
                </button>
                <span id="move-tasks-feedback" style="font-size: 0.78rem; color: var(--color-accent-emerald);"></span>
              </div>
            ` : `
              <div style="font-size: 0.8rem; color: var(--color-text-muted); padding: 6px 0;">
                ✓ All planned tasks for this week are completed.
              </div>
            `}
          </div>
        </div>

        <!-- 8.2 DSA Playlist Check & Semester Check (PDF Page 6) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 20px;">
          <!-- DSA Playlist Check -->
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px;">
            <div style="font-size: 0.8rem; font-weight: 800; color: var(--color-accent-purple); text-transform: uppercase; margin-bottom: 10px;">
              DSA PLAYLIST CHECK
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div>
                <label style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">First lecture this week:</label>
                <input type="text" id="chk-dsa-first" class="form-input" value="${data.review.dsaCheck?.firstLecture || `Lecture ${data.dsa.startVideo}`}" style="font-size: 0.8rem; padding: 4px 8px; width: 100%;" />
              </div>
              <div>
                <label style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">Last completed lecture:</label>
                <input type="text" id="chk-dsa-last" class="form-input" value="${data.review.dsaCheck?.lastCompleted || ''}" placeholder="e.g. Lecture ${data.dsa.endVideo}" style="font-size: 0.8rem; padding: 4px 8px; width: 100%;" />
              </div>
              <div>
                <label style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">Next lecture:</label>
                <input type="text" id="chk-dsa-next" class="form-input" value="${data.review.dsaCheck?.nextLecture || `Lecture ${data.dsa.endVideo + 1}`}" style="font-size: 0.8rem; padding: 4px 8px; width: 100%;" />
              </div>
              <div>
                <label style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">Difficult topic / Problems to re-solve:</label>
                <input type="text" id="chk-dsa-resolve" class="form-input" value="${data.review.dsaCheck?.problemsToResolve || ''}" placeholder="e.g. Kadane's algorithm edge cases" style="font-size: 0.8rem; padding: 4px 8px; width: 100%;" />
              </div>
            </div>
          </div>

          <!-- Semester Exam Check -->
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px;">
            <div style="font-size: 0.8rem; font-weight: 800; color: var(--color-accent-cyan); text-transform: uppercase; margin-bottom: 10px;">
              SEMESTER EXAM CHECK
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div>
                <label style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">Answers covered:</label>
                <input type="text" id="chk-sem-subjects" class="form-input" value="${data.review.semesterCheck?.subjectsCovered || ''}" placeholder="e.g. Answer 1, Answer 2" style="font-size: 0.8rem; padding: 4px 8px; width: 100%;" />
              </div>
              <div>
                <label style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">Units / topics still weak:</label>
                <input type="text" id="chk-sem-weak" class="form-input" value="${data.review.semesterCheck?.topicsWeak || ''}" placeholder="e.g. Pointer arithmetic in C" style="font-size: 0.8rem; padding: 4px 8px; width: 100%;" />
              </div>
              <div>
                <label style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 600;">Questions to revise again:</label>
                <input type="text" id="chk-sem-revise" class="form-input" value="${data.review.semesterCheck?.questionsToRevise || ''}" placeholder="e.g. Dynamic memory vs static allocation" style="font-size: 0.8rem; padding: 4px 8px; width: 100%;" />
              </div>
            </div>
          </div>
        </div>

        <!-- 8.3 Reflections (PDF Page 6 Prompts) -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 4px; display: block;">
              ■ What did I complete well?
            </label>
            <textarea id="rev-completed-well" class="form-input" style="width: 100%; min-height: 54px;" placeholder="Summary of videos, problems, and semester answers finished...">${data.review.what_completed_well || data.review.completed_summary || ''}</textarea>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 4px; display: block;">
              ■ What did I not complete? (and why?)
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <textarea id="rev-not-completed" class="form-input" style="width: 100%; min-height: 54px;" placeholder="What remained incomplete...">${data.review.what_not_completed || data.review.struggles_improvements || ''}</textarea>
              <textarea id="rev-why" class="form-input" style="width: 100%; min-height: 54px;" placeholder="Why? (time constraints, difficult concept, etc.)...">${data.review.why_not_completed || ''}</textarea>
            </div>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 4px; display: block;">
              ■ Top priority next week:
            </label>
            <textarea id="rev-top-priority" class="form-input" style="width: 100%; min-height: 54px;" placeholder="Next week's #1 learning focus...">${data.review.top_priority_next_week || data.review.next_week_priority || ''}</textarea>
          </div>

          <div>
            <label class="form-label" style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 4px; display: block;">
              ■ What should be deliberately moved instead of simply carried over?
            </label>
            <textarea id="rev-deliberately-moved" class="form-input" style="width: 100%; min-height: 50px;" placeholder="Deliberate adjustments to study allocation...">${data.review.what_deliberately_moved || ''}</textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
            <button class="btn btn-primary btn-sm" id="btn-save-week-review" style="font-weight: 700; padding: 6px 18px;">
              Save Week Review
            </button>
          </div>
        </div>
      </section>

    </div>
  `;

  // Attach Listeners
  attachWeeklyListeners(container, data);
}

function attachWeeklyListeners(container, data) {
  const weekId = data.weekId;

  // 1. Next Week Navigation
  const nextBtn = container.querySelector('#btn-next-week');
  if (nextBtn && data.nextWeekId) {
    nextBtn.onclick = () => {
      reviewSaveFeedback = '';
      window.location.hash = `#week?id=${data.nextWeekId}`;
    };
  }

  // 3. Week Selector Dropdown
  const weekSelect = container.querySelector('#select-week');
  if (weekSelect) {
    weekSelect.onchange = () => {
      const selectedId = weekSelect.value;
      if (selectedId) {
        reviewSaveFeedback = '';
        window.location.hash = `#week?id=${selectedId}`;
      }
    };
  }

  // 4. Click any Day Card to open Today for that date
  container.querySelectorAll('.day-card').forEach(card => {
    card.onclick = () => {
      const selectedDate = card.getAttribute('data-date');
      window.location.hash = `#today?date=${selectedDate}`;
    };
  });

  // 5. Open Today button in breakdown
  container.querySelectorAll('.btn-open-today-for-day').forEach(btn => {
    btn.onclick = () => {
      const selectedDate = btn.getAttribute('data-date');
      window.location.hash = `#today?date=${selectedDate}`;
    };
  });

  // 6. Day Breakdown Tabs
  container.querySelectorAll('.btn-tab-breakdown').forEach(btn => {
    btn.onclick = () => {
      activeBreakdownDay = btn.getAttribute('data-day');
      renderWeekly(container);
    };
  });

  // 7. DSA Video Checkbox Toggle
  container.querySelectorAll('.week-dsa-check').forEach(chk => {
    chk.onchange = async () => {
      const videoNum = parseInt(chk.getAttribute('data-num'));
      await toggleDSAVideo(videoNum, chk.checked);
      renderWeekly(container);
    };
  });

  // 7.1 Java Video Checkbox Toggle
  container.querySelectorAll('.week-java-check').forEach(chk => {
    chk.onchange = async () => {
      const videoNum = parseInt(chk.getAttribute('data-num'));
      await toggleJavaVideo(videoNum);
      renderWeekly(container);
    };
  });

  // 8. Log DSA Problem
  const logProbBtn = container.querySelector('#btn-log-dsa-problem');
  const probTitleInput = container.querySelector('#input-dsa-prob-title');
  if (logProbBtn && probTitleInput) {
    logProbBtn.onclick = async () => {
      const title = probTitleInput.value.trim() || `DSA Problem (Week ${data.weekNumber})`;
      // Create practice task
      await createNewGoal({
        type: 'WEEKLY',
        weekId: data.weekId,
        title: `DSA Problem: ${title}`,
        category: 'PRACTICE'
      });
      renderWeekly(container);
    };
  }

  // 9. Quick Log Gaming (In-DOM modal - works in Electron & Browser)
  const logGamingBtn = container.querySelector('#btn-quick-log-gaming');
  if (logGamingBtn) {
    logGamingBtn.onclick = () => {
      openGamingModal(data.startDate, data.gamingHours, data.gamingLimit || 6, () => {
        renderWeekly(container);
      });
    };
  }

  // 10. Semester Answer Toggle & Add
  const toggleAddSemBtn = container.querySelector('#btn-toggle-add-semester');
  const semForm = container.querySelector('#semester-answer-form');
  const semCancel = container.querySelector('#sem-btn-cancel');
  const semSave = container.querySelector('#sem-btn-save');

  if (toggleAddSemBtn && semForm) {
    toggleAddSemBtn.onclick = () => {
      semForm.style.display = semForm.style.display === 'none' ? 'block' : 'none';
    };
    if (semCancel) {
      semCancel.onclick = () => {
        semForm.style.display = 'none';
      };
    }
    if (semSave) {
      semSave.onclick = async () => {
        const slot = container.querySelector('#sem-slot').value;
        const date = container.querySelector('#sem-date').value || data.startDate;
        const notes = container.querySelector('#sem-question').value.trim();
        const isOptional = slot === '3';
        const title = isOptional ? 'Answer 3 — Optional' : `Answer ${slot}`;

        await createSemesterAnswer({
          week_id: data.weekId,
          month_id: data.parentMonthId,
          title,
          subject: title,
          notes,
          question: notes,
          isOptional,
          completed: true,
          date
        });
        renderWeekly(container);
      };
    }
  }

  container.querySelectorAll('.sem-answer-check').forEach(chk => {
    chk.onchange = async () => {
      const answerId = chk.getAttribute('data-id');
      await toggleSemesterAnswer(answerId, 'completed', chk.checked);
      renderWeekly(container);
    };
  });

  // 11. Goal Toggle & Delete
  container.querySelectorAll('.week-goal-check').forEach(chk => {
    chk.onchange = async () => {
      const id = chk.getAttribute('data-id');
      await toggleGoalCompletion(id, chk.checked);
      renderWeekly(container);
    };
  });

  container.querySelectorAll('.btn-delete-week-goal').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id');
      await deleteWeeklyGoal(id);
      renderWeekly(container);
    };
  });

  // Add Goal Form Toggle
  const addGoalBtn = container.querySelector('#btn-add-week-goal');
  const goalForm = container.querySelector('#week-goal-form');
  const goalCancel = container.querySelector('#week-goal-cancel');
  const goalSave = container.querySelector('#week-goal-save');

  if (addGoalBtn && goalForm) {
    addGoalBtn.onclick = () => {
      goalForm.style.display = goalForm.style.display === 'none' ? 'block' : 'none';
      if (goalForm.style.display === 'block') {
        const inp = container.querySelector('#week-goal-input');
        if (inp) inp.focus();
      }
    };
    if (goalCancel) {
      goalCancel.onclick = () => {
        goalForm.style.display = 'none';
      };
    }
    if (goalSave) {
      goalSave.onclick = async () => {
        const title = container.querySelector('#week-goal-input').value.trim();
        const category = container.querySelector('#week-goal-category').value || 'LEARN';
        if (title) {
          await createNewGoal({
            type: 'WEEKLY',
            weekId,
            monthId: data.parentMonthId,
            title,
            category
          });
          renderWeekly(container);
        }
      };
    }
  }

  // 12. Save Week Review
  const saveReviewBtn = container.querySelector('#btn-save-week-review');
  if (saveReviewBtn) {
    saveReviewBtn.onclick = async () => {
      const whatCompletedWell = container.querySelector('#rev-completed-well').value.trim();
      const whatNotCompleted = container.querySelector('#rev-not-completed').value.trim();
      const whyNotCompleted = container.querySelector('#rev-why').value.trim();
      const topPriorityNextWeek = container.querySelector('#rev-top-priority').value.trim();
      const whatDeliberatelyMoved = container.querySelector('#rev-deliberately-moved').value.trim();

      const dsaCheck = {
        firstLecture: container.querySelector('#chk-dsa-first').value.trim(),
        lastCompleted: container.querySelector('#chk-dsa-last').value.trim(),
        nextLecture: container.querySelector('#chk-dsa-next').value.trim(),
        problemsToResolve: container.querySelector('#chk-dsa-resolve').value.trim()
      };

      const semesterCheck = {
        subjectsCovered: container.querySelector('#chk-sem-subjects').value.trim(),
        topicsWeak: container.querySelector('#chk-sem-weak').value.trim(),
        questionsToRevise: container.querySelector('#chk-sem-revise').value.trim()
      };

      saveReviewBtn.disabled = true;
      saveReviewBtn.textContent = 'Saving...';

      await saveWeeklyReview(weekId, {
        completed_summary: whatCompletedWell,
        struggles_improvements: whatNotCompleted,
        next_week_priority: topPriorityNextWeek,
        what_completed_well: whatCompletedWell,
        what_not_completed: whatNotCompleted,
        why_not_completed: whyNotCompleted,
        top_priority_next_week: topPriorityNextWeek,
        what_deliberately_moved: whatDeliberatelyMoved,
        dsa_check: JSON.stringify(dsaCheck),
        semester_check: JSON.stringify(semesterCheck)
      });

      reviewSaveFeedback = '✓ Week review saved to Supabase';
      renderWeekly(container);
    };
  }

  // 13. Move Selected Tasks to Next Week (Requirement 8)
  const moveBtn = container.querySelector('#btn-move-selected-tasks');
  const keepBtn = container.querySelector('#btn-keep-for-review');
  const feedbackEl = container.querySelector('#move-tasks-feedback');

  if (moveBtn) {
    moveBtn.onclick = async () => {
      const checkedBoxes = container.querySelectorAll('.carry-week-task-check:checked');
      const selectedIds = Array.from(checkedBoxes).map(cb => cb.getAttribute('data-id'));
      if (selectedIds.length === 0) {
        alert('Please select at least one task to move.');
        return;
      }
      if (!data.nextWeekId) {
        alert('No next week defined in plan.');
        return;
      }
      moveBtn.disabled = true;
      moveBtn.textContent = 'Moving...';
      await moveTasksToNextWeek(selectedIds, data.nextWeekId);
      renderWeekly(container);
    };
  }

  if (keepBtn && feedbackEl) {
    keepBtn.onclick = () => {
      feedbackEl.textContent = '✓ Kept for review in current week';
      setTimeout(() => { feedbackEl.textContent = ''; }, 2000);
    };
  }
}

/**
 * Akshay's Career Tracker - MONTH View
 * Strictly follows the Monthly Plan PDF (October 2026 -> September 2027)
 * 
 * STRUCTURE:
 * 1. MONTH HEADER (Title, Previous Month, Month Selector, Next Month, Theme & Academic Target)
 * 2. MONTHLY TARGETS (Study Hours, DSA Videos, DSA Problems, Semester Answers, Prime 3.0, Individual Learning, Project, Optional Gaming)
 * 3. MONTHLY FOCUS (LEARN, PRACTICE, BUILD, REVISE)
 * 4. DSA PROGRESS (Playlist Videos 12/month with video checklist + Problems Solved)
 * 5. SEMESTER PREPARATION (Daily 2 required + 1 optional 3rd, Revision)
 * 6. MONTHLY GOALS (5-8 important goals with checkboxes, categories, status, add/delete)
 * 7. WEEKS (Weeks belonging to the selected month with date range and tasks)
 * 8. MONTHLY REVIEW (Reflective review matching PDF Page 2 questions + Supabase persistence)
 */

import { getIcon } from '../components/icons.js';
import {
  getMonthData,
  toggleGoalCompletion,
  createNewGoal,
  deleteMonthlyGoal,
  toggleDSAVideo,
  toggleJavaVideo,
  saveMonthlyReview,
  carryMonthlyGoalsToNextMonth
} from '../services/trackerService.js';
import { getCanonicalToday, PROGRAM_START_DATE } from '../services/dateService.js';

let selectedMonthId = '2026-10'; // Default start of the 12-month plan
let isPlaylistExpanded = false;
let reviewSaveFeedback = '';

export function renderMonthly(container) {
  const data = getMonthData(selectedMonthId);
  const canonicalToday = getCanonicalToday();
  const currentMonthId = canonicalToday.substring(0, 7);
  const isFutureMonth = (canonicalToday < PROGRAM_START_DATE) || (data.monthId > currentMonthId);

  container.innerHTML = `
    <div class="tracker-page animate-fade-in" style="display: flex; flex-direction: column; gap: 22px; max-width: 1200px; margin: 0 auto; padding-bottom: 40px;">
      
      <!-- 1. MONTH HEADER -->
      <header class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <h1 style="font-size: 1.65rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; display: flex; align-items: center; gap: 10px;">
                ${getIcon('monthly', 'text-primary')} ${data.monthTitle}
              </h1>
              <span class="badge ${isFutureMonth ? 'badge-gray' : 'badge-blue'}" style="font-size: 0.8rem; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-full);">
                ${isFutureMonth ? 'Upcoming Month • Review Only' : data.theme}
              </span>
            </div>
            <p style="font-size: 0.85rem; color: var(--color-text-secondary); margin: 6px 0 0 0; line-height: 1.4;">
              <strong style="color: var(--color-text-muted);">Academic Target:</strong> ${data.academicLearningTarget}
            </p>
          </div>

          <!-- Month Navigation Controls -->
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <button id="btn-prev-month" class="btn btn-secondary btn-sm" ${!data.prevMonthId ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
              ← Previous Month
            </button>

            <select id="month-selector" class="form-select" style="padding: 6px 12px; font-weight: 700; font-size: 0.86rem; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text-main); cursor: pointer;">
              ${data.allMonths.map(m => `
                <option value="${m.id}" ${m.id === data.monthId ? 'selected' : ''}>
                  ${m.label}
                </option>
              `).join('')}
            </select>

            <button id="btn-next-month" class="btn btn-secondary btn-sm" ${!data.nextMonthId ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}>
              Next Month →
            </button>
          </div>
        </div>
      </header>

      <!-- 2. MONTHLY TARGETS (Compact progress directly beside each target) -->
      <section class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted);">
            MONTHLY TARGETS & PROGRESS
          </div>
          <span style="font-size: 0.75rem; color: var(--color-text-muted); font-family: var(--font-mono);">
            Transparent metrics · No arbitrary overall score
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
          <!-- Study Hours -->
          <div style="padding: 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">Study Hours</span>
              <span style="font-size: 0.75rem; color: var(--color-text-muted);">${data.targets.studyHoursRemaining}h remaining</span>
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 4px;">
              ${data.targets.studyHoursCompleted} <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted);">/ ${data.targets.studyHours} hrs</span>
            </div>
            <div class="progress-bar-wrap" style="height: 6px; margin-top: 8px;">
              <div class="progress-bar-fill" style="width: ${Math.min(100, Math.round((data.targets.studyHoursCompleted / data.targets.studyHours) * 100))}%;"></div>
            </div>
          </div>

          <!-- DSA Videos -->
          <div style="padding: 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent-purple); text-transform: uppercase;">DSA Videos (Apna College)</span>
              <span style="font-size: 0.75rem; color: var(--color-text-muted);">${data.targets.dsaVideosRemaining} remaining</span>
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 4px;">
              ${data.targets.dsaVideosCompleted} <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted);">/ ${data.targets.dsaVideos} videos</span>
            </div>
            <div class="progress-bar-wrap" style="height: 6px; margin-top: 8px;">
              <div class="progress-bar-fill purple" style="width: ${data.targets.dsaVideosPercent}%;"></div>
            </div>
          </div>

          <!-- DSA Problems -->
          <div style="padding: 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent-purple); text-transform: uppercase;">DSA Problems Solved</span>
              <span style="font-size: 0.75rem; color: var(--color-text-muted);">${data.targets.dsaProblemsRemaining} remaining</span>
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 4px;">
              ${data.targets.dsaProblemsCompleted} <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted);">/ ${data.targets.dsaProblems} problems</span>
            </div>
            <div class="progress-bar-wrap" style="height: 6px; margin-top: 8px;">
              <div class="progress-bar-fill purple" style="width: ${Math.min(100, Math.round((data.targets.dsaProblemsCompleted / data.targets.dsaProblems) * 100))}%;"></div>
            </div>
          </div>

          <!-- Semester Answers -->
          <div style="padding: 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent-cyan); text-transform: uppercase;">Semester Answers</span>
              <span style="font-size: 0.72rem; color: var(--color-text-muted);">2/day + opt 3rd</span>
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 4px;">
              ${data.targets.semesterAnswersCompleted} <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted);">/ ${data.targets.semesterAnswersTarget} answers</span>
            </div>
            <div class="progress-bar-wrap" style="height: 6px; margin-top: 8px;">
              <div class="progress-bar-fill" style="width: ${Math.min(100, Math.round((data.targets.semesterAnswersCompleted / data.targets.semesterAnswersTarget) * 100))}%;"></div>
            </div>
          </div>

          <!-- Prime 3.0 AI/ML (Summarized by Parts per Section 12) -->
          <div style="padding: 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); grid-column: span 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase;">Prime 3.0 AI/ML</span>
              <span class="badge badge-blue" style="font-size: 0.7rem;">${data.targets.primePartsSummary ? `${data.targets.primePartsSummary.completed}/${data.targets.primePartsSummary.released} Parts` : data.targets.primeProgress}</span>
            </div>
            <div style="font-size: 0.88rem; font-weight: 700; color: var(--color-text-main); margin-top: 6px; line-height: 1.35;">
              ${data.targets.primeTarget}
            </div>
            ${data.targets.primePartsSummary ? `
              <div style="margin-top: 6px; font-size: 0.76rem; color: var(--color-text-muted); font-family: var(--font-mono);">
                ${data.targets.primePartsSummary.label}
              </div>
            ` : ''}
          </div>

          <!-- Java Playlist Track -->
          <div style="padding: 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); grid-column: span 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #F59E0B; text-transform: uppercase;">Java Playlist Track</span>
              <span class="badge badge-amber" style="font-size: 0.7rem; background: rgba(245, 158, 11, 0.15); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.3);">${data.java?.completedVideos || 0} / ${data.java?.targetVideos || 5}</span>
            </div>
            <div style="font-size: 0.88rem; font-weight: 700; color: var(--color-text-main); margin-top: 6px; line-height: 1.35;">
              ${data.targets.individualTarget}
            </div>
            <div class="progress-bar-wrap" style="height: 6px; margin-top: 8px;">
              <div class="progress-bar-fill amber" style="width: ${data.java?.percentage || 0}%; background: #F59E0B;"></div>
            </div>
          </div>

          <!-- Project Milestone -->
          <div style="padding: 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); grid-column: span 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent-amber); text-transform: uppercase;">Project Milestone</span>
              <span class="badge badge-amber" style="font-size: 0.7rem;">${data.targets.projectProgress}</span>
            </div>
            <div style="font-size: 0.88rem; font-weight: 700; color: var(--color-text-main); margin-top: 6px; line-height: 1.35;">
              ${data.targets.projectMilestone}
            </div>
          </div>

          <!-- DaVinci Resolve (Video Editing) -->
          <div style="padding: 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); grid-column: span 1;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.75rem; font-weight: 700; color: #EC4899; text-transform: uppercase;">DaVinci Resolve (Video Editing)</span>
              <span style="font-size: 0.72rem; color: var(--color-text-muted);">${data.targets.davinciRemaining || 0} remaining</span>
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main); margin-top: 4px;">
              ${data.targets.davinciCompleted || 0} <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted);">/ ${data.targets.davinciTarget || 8} videos</span>
            </div>
            <div class="progress-bar-wrap" style="height: 6px; margin-top: 8px;">
              <div class="progress-bar-fill pink" style="width: ${data.targets.davinciTarget > 0 ? Math.min(100, Math.round(((data.targets.davinciCompleted || 0) / data.targets.davinciTarget) * 100)) : 0}%;"></div>
            </div>
          </div>
        </div>

        <!-- Optional Gaming Note -->
        <div style="margin-top: 14px; padding: 10px 14px; background: rgba(148, 163, 184, 0.05); border: 1px dashed var(--color-border); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div style="font-size: 0.8rem; color: var(--color-text-muted);">
            🎮 <strong>Gaming (Optional Recreation):</strong> 0–6 hours/week (Max 6 hrs/week; unused hours do not carry over). Not a required learning goal.
          </div>
          <div style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary); font-family: var(--font-mono);">
            Logged this month: ${data.targets.gamingActualHours} hrs
          </div>
        </div>
      </section>

      <!-- 2.1 PLAN VS ACTUAL -->
      <section class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); margin-bottom: 14px;">
          PLAN VS ACTUAL (${data.monthTitle.toUpperCase()})
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
          <div style="padding: 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">Study</div>
            <div style="margin-top: 8px; font-size: 0.9rem;">
              <div>Planned: <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${data.planVsActual.study.planned}</strong></div>
              <div style="margin-top: 3px;">Actual: <strong style="color: var(--color-primary); font-family: var(--font-mono);">${data.planVsActual.study.actual}</strong></div>
            </div>
          </div>

          <div style="padding: 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent-purple); text-transform: uppercase;">DSA Videos (C++)</div>
            <div style="margin-top: 8px; font-size: 0.9rem;">
              <div>Planned: <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${data.planVsActual.dsaVideos.planned}</strong></div>
              <div style="margin-top: 3px;">Actual: <strong style="color: var(--color-accent-purple); font-family: var(--font-mono);">${data.planVsActual.dsaVideos.actual}</strong></div>
            </div>
          </div>

          <div style="padding: 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent-purple); text-transform: uppercase;">DSA Problems</div>
            <div style="margin-top: 8px; font-size: 0.9rem;">
              <div>Planned: <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${data.planVsActual.dsaProblems.planned}</strong></div>
              <div style="margin-top: 3px;">Actual: <strong style="color: var(--color-accent-purple); font-family: var(--font-mono);">${data.planVsActual.dsaProblems.actual}</strong></div>
            </div>
          </div>

          <div style="padding: 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-accent-cyan); text-transform: uppercase;">Semester Answers</div>
            <div style="margin-top: 8px; font-size: 0.9rem;">
              <div>Planned: <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${data.planVsActual.semesterAnswers.planned}</strong></div>
              <div style="margin-top: 3px;">Actual: <strong style="color: var(--color-accent-cyan); font-family: var(--font-mono);">${data.planVsActual.semesterAnswers.actual}</strong></div>
            </div>
          </div>

          <!-- DaVinci Resolve -->
          <div style="padding: 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">DaVinci Resolve</div>
            <div style="margin-top: 8px; font-size: 0.9rem;">
              <div>Planned: <strong style="color: var(--color-text-main); font-family: var(--font-mono);">${data.planVsActual.davinciVideos?.planned || 8} videos</strong></div>
              <div style="margin-top: 3px;">Actual: <strong style="color: #EC4899; font-family: var(--font-mono);">${data.planVsActual.davinciVideos?.actual || 0} videos</strong></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. MONTHLY FOCUS (LEARN, PRACTICE, BUILD, REVISE) -->
      <section class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); margin-bottom: 14px;">
          MONTHLY FOCUS
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
          <div style="padding: 14px 16px; background: var(--color-bg-base); border-left: 4px solid var(--color-primary); border-radius: 0 var(--radius-md) var(--radius-md) 0;">
            <div style="font-size: 0.8rem; font-weight: 800; color: var(--color-primary); margin-bottom: 4px; letter-spacing: 0.04em;">LEARN</div>
            <div style="font-size: 0.86rem; color: var(--color-text-main); line-height: 1.4;">${data.focus.learn}</div>
          </div>

          <div style="padding: 14px 16px; background: var(--color-bg-base); border-left: 4px solid var(--color-accent-purple); border-radius: 0 var(--radius-md) var(--radius-md) 0;">
            <div style="font-size: 0.8rem; font-weight: 800; color: var(--color-accent-purple); margin-bottom: 4px; letter-spacing: 0.04em;">PRACTICE</div>
            <div style="font-size: 0.86rem; color: var(--color-text-main); line-height: 1.4;">${data.focus.practice}</div>
          </div>

          <div style="padding: 14px 16px; background: var(--color-bg-base); border-left: 4px solid var(--color-accent-amber); border-radius: 0 var(--radius-md) var(--radius-md) 0;">
            <div style="font-size: 0.8rem; font-weight: 800; color: var(--color-accent-amber); margin-bottom: 4px; letter-spacing: 0.04em;">BUILD</div>
            <div style="font-size: 0.86rem; color: var(--color-text-main); line-height: 1.4;">${data.focus.build}</div>
          </div>

          <div style="padding: 14px 16px; background: var(--color-bg-base); border-left: 4px solid var(--color-accent-emerald); border-radius: 0 var(--radius-md) var(--radius-md) 0;">
            <div style="font-size: 0.8rem; font-weight: 800; color: var(--color-accent-emerald); margin-bottom: 4px; letter-spacing: 0.04em;">REVISE</div>
            <div style="font-size: 0.86rem; color: var(--color-text-main); line-height: 1.4;">${data.focus.revise}</div>
          </div>
        </div>
      </section>

      <!-- 4. DSA PROGRESS & 5. SEMESTER PREPARATION (Side by side on wide screens) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 16px;">
        
        <!-- DSA PROGRESS -->
        <section class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-main);">
              DSA PROGRESS (Apna College)
            </div>
            <button id="btn-toggle-playlist" class="btn btn-ghost btn-xs" style="color: var(--color-primary); font-size: 0.78rem;">
              ${isPlaylistExpanded ? 'Hide Video List ▲' : 'View 12 Videos ▼'}
            </button>
          </div>

          <!-- Video Metrics -->
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary);">
                Playlist Videos ${data.dsa.startVideo}–${data.dsa.endVideo} (12 planned)
              </span>
              <span style="font-size: 0.95rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main);">
                ${data.dsa.completedVideos} / ${data.dsa.plannedVideos} (${data.dsa.percent}%)
              </span>
            </div>
            <div class="progress-bar-wrap" style="height: 6px; margin: 8px 0 10px 0;">
              <div class="progress-bar-fill purple" style="width: ${data.dsa.percent}%;"></div>
            </div>
            <div style="display: flex; gap: 16px; font-size: 0.78rem; color: var(--color-text-muted);">
              <span>Planned: <strong style="color: var(--color-text-main);">${data.dsa.plannedVideos}</strong></span>
              <span>Completed: <strong style="color: #10B981;">${data.dsa.completedVideos}</strong></span>
              <span>Remaining: <strong style="color: #F97316;">${data.dsa.remainingVideos}</strong></span>
            </div>
          </div>

          <!-- Expandable Video Checklist -->
          <div id="dsa-video-list" style="display: ${isPlaylistExpanded ? 'flex' : 'none'}; flex-direction: column; gap: 6px; margin-bottom: 14px; max-height: 240px; overflow-y: auto; padding-right: 4px;">
            ${data.dsa.videosList.map(v => `
              <label style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: var(--color-bg-surface-elevated); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); font-size: 0.8rem; cursor: ${isFutureMonth ? 'not-allowed' : 'pointer'};">
                <span style="display: flex; align-items: center; gap: 8px; flex: 1;">
                  <input type="checkbox" class="dsa-video-check" data-id="${v.id}" data-num="${v.video_number}" ${v.completed ? 'checked' : ''} ${isFutureMonth ? 'disabled="disabled" title="Future month — review only"' : ''} style="cursor: ${isFutureMonth ? 'not-allowed' : 'pointer'}; opacity: ${isFutureMonth ? '0.5' : '1'};" />
                  <span style="${v.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                    <strong>#${v.video_number}</strong> ${v.title}
                  </span>
                </span>
                <span style="font-size: 0.72rem; color: var(--color-text-muted); font-family: var(--font-mono); margin-left: 8px;">
                  ${v.problems_solved || 0} solved
                </span>
              </label>
            `).join('')}
          </div>

          <!-- Problem Solving Metrics -->
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary);">
                DSA Practice Problems (Target: ${data.dsa.problemsTarget})
              </span>
              <span style="font-size: 0.95rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main);">
                ${data.dsa.problemsCompleted} / ${data.dsa.problemsTarget}
              </span>
            </div>
            <div class="progress-bar-wrap" style="height: 6px; margin: 8px 0 10px 0;">
              <div class="progress-bar-fill purple" style="width: ${Math.min(100, Math.round((data.dsa.problemsCompleted / data.dsa.problemsTarget) * 100))}%;"></div>
            </div>
            <div style="display: flex; gap: 16px; font-size: 0.78rem; color: var(--color-text-muted);">
              <span>Target: <strong style="color: var(--color-text-main);">${data.dsa.problemsTarget}</strong></span>
              <span>Completed: <strong style="color: #10B981;">${data.dsa.problemsCompleted}</strong></span>
              <span>Remaining: <strong style="color: #F97316;">${data.dsa.problemsRemaining}</strong></span>
            </div>
          </div>
        </section>

        <!-- SEMESTER PREPARATION -->
        <section class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); display: flex; flex-direction: column;">
          <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-main); margin-bottom: 4px;">
            B.TECH SEMESTER PREPARATION
          </div>
          <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-bottom: 14px;">
            Target formula: 2 required answers per day + 1 optional third answer
          </div>

          <!-- Answers Metrics -->
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary);">
                Semester Exam Answers Written
              </span>
              <span style="font-size: 0.95rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main);">
                ${data.semester.answersCompleted} / ${data.semester.answersTarget}
              </span>
            </div>
            <div class="progress-bar-wrap" style="height: 6px; margin: 8px 0 10px 0;">
              <div class="progress-bar-fill" style="width: ${Math.min(100, Math.round((data.semester.answersCompleted / data.semester.answersTarget) * 100))}%;"></div>
            </div>
            <div style="display: flex; gap: 16px; font-size: 0.78rem; color: var(--color-text-muted);">
              <span>Target: <strong style="color: var(--color-text-main);">${data.semester.answersTarget}</strong></span>
              <span>Completed: <strong style="color: #10B981;">${data.semester.answersCompleted}</strong></span>
              <span>Remaining: <strong style="color: #F97316;">${data.semester.answersRemaining}</strong></span>
            </div>
          </div>

          <!-- Revision Metrics -->
          <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 0.82rem; font-weight: 700; color: var(--color-text-secondary);">
                Semester Revision (Units & Completed Answers)
              </span>
              <span style="font-size: 0.95rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main);">
                ${data.semester.revisionCompleted} / ${data.semester.revisionTarget}
              </span>
            </div>
            <div class="progress-bar-wrap" style="height: 6px; margin: 8px 0 10px 0;">
              <div class="progress-bar-fill emerald" style="width: ${Math.min(100, Math.round((data.semester.revisionCompleted / data.semester.revisionTarget) * 100))}%;"></div>
            </div>
            <div style="display: flex; gap: 16px; font-size: 0.78rem; color: var(--color-text-muted);">
              <span>Target: <strong style="color: var(--color-text-main);">${data.semester.revisionTarget}</strong></span>
              <span>Revised: <strong style="color: #10B981;">${data.semester.revisionCompleted}</strong></span>
              <span>Remaining: <strong style="color: #F97316;">${data.semester.revisionRemaining}</strong></span>
            </div>
          </div>
        </section>
      </div>

      <!-- 5.1 JAVA PLAYLIST TRACK PROGRESS -->
      <section class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #F59E0B;">
              JAVA — PLAYLIST TRACK (${data.monthTitle})
            </div>
            <div style="font-size: 0.78rem; color: var(--color-text-muted); margin-top: 2px;">
              Apna College Complete Java Course • 
              <a href="${data.java?.playlistUrl || 'https://youtube.com/playlist?list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop&si=wQIkHGx0hH7rED5K'}" target="_blank" rel="noopener noreferrer" style="color: #F59E0B; text-decoration: underline;">
                YouTube Playlist ↗
              </a>
            </div>
          </div>
          <span style="font-size: 0.85rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main);">
            ${data.java?.completedVideos || 0} / ${data.java?.targetVideos || 5} videos (${data.java?.percentage || 0}%)
          </span>
        </div>

        <!-- Monthly Progress Bar -->
        <div class="progress-bar-wrap" style="height: 7px; margin-bottom: 14px;">
          <div class="progress-bar-fill amber" style="width: ${data.java?.percentage || 0}%; background: #F59E0B;"></div>
        </div>

        <!-- Planned Java Lessons/Videos for this Month -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${(data.java?.plannedVideos || []).length > 0 ? (data.java?.plannedVideos || []).map(v => `
            <label style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.82rem; cursor: ${isFutureMonth ? 'not-allowed' : 'pointer'};">
              <span style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <input type="checkbox" class="month-java-check" data-num="${v.video_number}" ${v.completed ? 'checked' : ''} ${isFutureMonth ? 'disabled="disabled" title="Future month — review only"' : ''} style="cursor: ${isFutureMonth ? 'not-allowed' : 'pointer'}; opacity: ${isFutureMonth ? '0.5' : '1'}; accent-color: #F59E0B; width: 17px; height: 17px;" />
                <span style="${v.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                  <strong style="color: #F59E0B; font-family: var(--font-mono);">Video/Lesson ${v.video_number}:</strong> ${v.title}
                </span>
              </span>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.72rem; color: var(--color-text-muted); font-family: var(--font-mono);">
                <span>${v.duration_str || ''}</span>
                <span class="badge ${v.completed ? 'badge-emerald' : 'badge-gray'}" style="font-size: 0.65rem;">
                  ${v.completed ? '✓ Watched' : 'Pending'}
                </span>
              </div>
            </label>
          `).join('') : `
            <div style="font-size: 0.82rem; color: var(--color-text-muted); padding: 10px; text-align: center; background: var(--color-bg-base); border-radius: var(--radius-sm);">
              Revision & capstone milestone month. Total Java playlist: 39 videos completed.
            </div>
          `}
        </div>
      </section>

      <!-- 6. MONTHLY GOALS (5-8 Goals) -->
      <section class="card" style="padding: 20px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
          <div>
            <div style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-main);">
              MONTHLY GOALS <span style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: normal;">(5–8 Priorities)</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
              Checkboxes update progress directly; synchronized with Supabase
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-add-month-goal" style="font-size: 0.8rem;">
            + Add Goal
          </button>
        </div>

        <!-- Goal List -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${data.goals.map(g => {
            const cat = (g.category || 'LEARN').toUpperCase();
            let catBadgeClass = 'badge-blue';
            if (cat.includes('DSA') || cat.includes('PRACTICE')) catBadgeClass = 'badge-purple';
            else if (cat.includes('SEMESTER')) catBadgeClass = 'badge-cyan';
            else if (cat.includes('BUILD') || cat.includes('PROJECT')) catBadgeClass = 'badge-amber';
            else if (cat.includes('REVISE')) catBadgeClass = 'badge-emerald';

            return `
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                <label style="display: flex; align-items: center; gap: 12px; flex: 1; cursor: ${isFutureMonth ? 'not-allowed' : 'pointer'}; margin: 0;">
                  <input type="checkbox" class="month-goal-check" data-id="${g.id}" ${g.completed ? 'checked' : ''} ${isFutureMonth ? 'disabled="disabled" title="Future month — review only"' : ''} style="width: 17px; height: 17px; cursor: ${isFutureMonth ? 'not-allowed' : 'pointer'}; opacity: ${isFutureMonth ? '0.5' : '1'};" />
                  <span style="font-size: 0.88rem; color: var(--color-text-main); ${g.completed ? 'text-decoration: line-through; opacity: 0.55;' : ''}">
                    ${g.title}
                  </span>
                </label>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span class="badge ${catBadgeClass}" style="font-size: 0.72rem; text-transform: uppercase;">
                    ${cat}
                  </span>
                  <span style="font-size: 0.75rem; font-weight: 600; color: ${g.completed ? '#10B981' : 'var(--color-text-muted)'}; min-width: 70px; text-align: right;">
                    ${g.completed ? 'Completed' : 'In Progress'}
                  </span>
                  <button class="btn-delete-goal" data-id="${g.id}" title="Delete goal" style="background: none; border: none; color: var(--color-text-muted); cursor: pointer; font-size: 0.9rem; padding: 2px 6px;">
                    ✕
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Inline Add Goal Form -->
        <div id="month-goal-form" style="display: none; margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--color-border-subtle);">
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <input type="text" id="month-goal-input" class="form-input" placeholder="Enter new monthly goal..." style="flex: 2; min-width: 240px; padding: 8px 12px; font-size: 0.88rem;" />
            <select id="month-goal-category" class="form-select" style="flex: 1; min-width: 130px; padding: 8px 12px; font-size: 0.85rem;">
              <option value="LEARN">LEARN (Prime 3.0 / Individual)</option>
              <option value="PRACTICE">PRACTICE (DSA / Problems)</option>
              <option value="SEMESTER">SEMESTER (Exam Prep)</option>
              <option value="BUILD">BUILD (Project)</option>
              <option value="REVISE">REVISE (Revision)</option>
              <option value="STUDY">STUDY (Hours)</option>
            </select>
            <button class="btn btn-primary btn-sm" id="month-goal-save">Save Goal</button>
            <button class="btn btn-ghost btn-sm" id="month-goal-cancel">Cancel</button>
          </div>
        </div>
      </section>

      <!-- 7. WEEKS OF THE MONTH -->
      <section>
        <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); margin-bottom: 12px;">
          WEEKS OF ${data.monthTitle.toUpperCase()}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px;">
          ${data.weeks.map(w => `
            <div class="month-week-card" data-week="${w.weekId}" style="padding: 16px; background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.15s ease;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                <span style="font-weight: 800; font-size: 0.95rem; color: var(--color-text-main);">Week ${w.weekNumber}</span>
                <span style="font-size: 0.75rem; color: var(--color-text-muted); font-family: var(--font-mono);">${w.rangeLabel}</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: var(--color-text-secondary); margin-top: 8px;">
                <div>Planned tasks: <strong style="color: var(--color-text-main);">${w.plannedTasks}</strong></div>
                <div>Completed tasks: <strong style="color: var(--color-text-main);">${w.completedTasks}</strong></div>
              </div>
              <div style="margin-top: 10px; font-size: 0.72rem; color: var(--color-primary); border-top: 1px solid var(--color-border-subtle); padding-top: 6px; display: flex; justify-content: space-between; align-items: center;">
                <span>Open Weekly Tracker</span>
                <span>→</span>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 8. MONTH-END REVIEW (From Monthly Plan PDF Page 2) -->
      <section class="card" style="padding: 22px 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 10px;">
          <div>
            <div style="font-size: 0.88rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-main);">
              MONTH-END REVIEW: ${data.monthTitle.toUpperCase()}
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
              Planned vs Actual summary and monthly goals carry-forward decision.
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span id="review-feedback" style="font-size: 0.78rem; font-weight: 600; color: #10B981;">
              ${reviewSaveFeedback}
            </span>
            <button class="btn btn-primary btn-sm" id="btn-save-review">
              Save Review
            </button>
          </div>
        </div>

        <!-- MONTH COMPLETE: Planned vs Actual Overview (Req 9) -->
        <div style="background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 16px; margin-bottom: 18px;">
          <div style="font-size: 0.82rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-main); margin-bottom: 12px;">
            MONTH COMPLETE — Planned vs Actual
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
            <div style="padding: 10px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase;">Study</div>
              <div style="font-size: 0.82rem; margin-top: 4px;">Planned: <strong>${data.planVsActual.study.planned}</strong></div>
              <div style="font-size: 0.82rem;">Actual: <strong>${data.planVsActual.study.actual}</strong></div>
            </div>
            <div style="padding: 10px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-accent-purple); text-transform: uppercase;">DSA Videos</div>
              <div style="font-size: 0.82rem; margin-top: 4px;">Planned: <strong>${data.planVsActual.dsaVideos.planned}</strong></div>
              <div style="font-size: 0.82rem;">Actual: <strong>${data.planVsActual.dsaVideos.actual}</strong></div>
            </div>
            <div style="padding: 10px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-accent-purple); text-transform: uppercase;">DSA Problems</div>
              <div style="font-size: 0.82rem; margin-top: 4px;">Planned: <strong>${data.planVsActual.dsaProblems.planned}</strong></div>
              <div style="font-size: 0.82rem;">Actual: <strong>${data.planVsActual.dsaProblems.actual}</strong></div>
            </div>
            <div style="padding: 10px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-accent-cyan); text-transform: uppercase;">Semester</div>
              <div style="font-size: 0.82rem; margin-top: 4px;">Planned: <strong>${data.planVsActual.semesterAnswers.planned}</strong></div>
              <div style="font-size: 0.82rem;">Actual: <strong>${data.planVsActual.semesterAnswers.actual}</strong></div>
            </div>
            <div style="padding: 10px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase;">Prime 3.0</div>
              <div style="font-size: 0.78rem; margin-top: 4px; color: var(--color-text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${data.planVsActual.prime.planned}">${data.planVsActual.prime.planned}</div>
              <div style="font-size: 0.82rem;">Actual: <strong>${data.planVsActual.prime.actual}</strong></div>
            </div>
            <div style="padding: 10px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase;">Individual Learning</div>
              <div style="font-size: 0.78rem; margin-top: 4px; color: var(--color-text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${data.planVsActual.individual.planned}">${data.planVsActual.individual.planned}</div>
              <div style="font-size: 0.82rem;">Actual: <strong>${data.planVsActual.individual.actual}</strong></div>
            </div>
            <div style="padding: 10px; background: var(--color-bg-surface); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm);">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--color-accent-amber); text-transform: uppercase;">Project</div>
              <div style="font-size: 0.78rem; margin-top: 4px; color: var(--color-text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${data.planVsActual.project.planned}">${data.planVsActual.project.planned}</div>
              <div style="font-size: 0.82rem;">Actual: <strong>${data.planVsActual.project.actual}</strong></div>
            </div>
          </div>

          <!-- REMAINING MONTHLY GOALS (Carry to Next Month decision) -->
          <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--color-border-subtle);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--color-text-secondary);">
                Remaining Monthly Goals (${data.incompleteGoals ? data.incompleteGoals.length : 0})
              </span>
              <span style="font-size: 0.75rem; color: var(--color-text-muted);">
                Select goals to carry forward into next month
              </span>
            </div>

            ${(!data.incompleteGoals || data.incompleteGoals.length === 0) ? `
              <div style="font-size: 0.82rem; color: #10B981; font-weight: 600; padding: 6px 0;">
                ✓ All monthly goals for this month are complete!
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px;">
                ${data.incompleteGoals.map(g => `
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; background: var(--color-bg-surface); padding: 8px 12px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-sm); cursor: pointer;">
                    <input type="checkbox" class="carry-goal-check" data-id="${g.id}" checked style="cursor: pointer;" />
                    <span style="flex: 1;">${g.title}</span>
                    <span class="badge badge-blue" style="font-size: 0.7rem;">${g.category || 'LEARN'}</span>
                  </label>
                `).join('')}
              </div>
              <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <button id="btn-carry-goals" class="btn btn-primary btn-sm" ${!data.nextMonthId ? 'disabled' : ''}>
                  Carry Selected to Next Month →
                </button>
                <button id="btn-keep-goals-month" class="btn btn-ghost btn-sm">
                  Keep in Current Month
                </button>
                <span id="carry-goals-status" style="font-size: 0.78rem; font-weight: 600; color: #10B981;"></span>
              </div>
            `}
          </div>
        </div>

        <form id="monthly-review-form" style="display: flex; flex-direction: column; gap: 14px;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 4px;">
              What did I complete?
            </label>
            <textarea id="rev-completed" rows="2" class="form-textarea" placeholder="Key topics, videos, and milestones finished..." style="width: 100%; padding: 8px 12px; font-size: 0.85rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-base); color: var(--color-text-main); resize: vertical;">${data.review.completed_this_month || ''}</textarea>
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 4px;">
              What remains incomplete?
            </label>
            <textarea id="rev-incomplete" rows="2" class="form-textarea" placeholder="Any remaining backlog or unfinished goals..." style="width: 100%; padding: 8px 12px; font-size: 0.85rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-base); color: var(--color-text-main); resize: vertical;">${data.review.what_remains_incomplete || data.review.what_needs_improvement || ''}</textarea>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 14px;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 4px;">
                Which DSA lectures/problems need revision?
              </label>
              <textarea id="rev-dsa" rows="2" class="form-textarea" placeholder="Specific lecture numbers or problem patterns..." style="width: 100%; padding: 8px 12px; font-size: 0.85rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-base); color: var(--color-text-main); resize: vertical;">${data.review.dsa_lectures_revision || ''}</textarea>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 4px;">
                Which semester units/questions need more written practice?
              </label>
              <textarea id="rev-semester" rows="2" class="form-textarea" placeholder="Units, subjects, or long answer questions..." style="width: 100%; padding: 8px 12px; font-size: 0.85rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-base); color: var(--color-text-main); resize: vertical;">${data.review.semester_units_practice || ''}</textarea>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 14px;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 4px;">
                Important result
              </label>
              <input type="text" id="rev-result" class="form-input" placeholder="Top win or milestone achieved..." value="${data.review.important_result || ''}" style="width: 100%; padding: 8px 12px; font-size: 0.85rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: var(--color-text-secondary); margin-bottom: 4px;">
                What moves to next month / Next month's priority?
              </label>
              <input type="text" id="rev-moves" class="form-input" placeholder="Rollover targets or upcoming priority..." value="${data.review.what_moves_to_next_month || data.review.next_month_priority || ''}" style="width: 100%; padding: 8px 12px; font-size: 0.85rem;" />
            </div>
          </div>
        </form>
      </section>

    </div>
  `;

  // Attach Event Listeners
  attachMonthlyEvents(container, data);
}

function attachMonthlyEvents(container, data) {
  // Month Selector
  const selector = container.querySelector('#month-selector');
  if (selector) {
    selector.onchange = (e) => {
      selectedMonthId = e.target.value;
      reviewSaveFeedback = '';
      renderMonthly(container);
    };
  }

  // Previous Month Button
  const prevBtn = container.querySelector('#btn-prev-month');
  if (prevBtn && data.prevMonthId) {
    prevBtn.onclick = () => {
      selectedMonthId = data.prevMonthId;
      reviewSaveFeedback = '';
      renderMonthly(container);
    };
  }

  // Next Month Button
  const nextBtn = container.querySelector('#btn-next-month');
  if (nextBtn && data.nextMonthId) {
    nextBtn.onclick = () => {
      selectedMonthId = data.nextMonthId;
      reviewSaveFeedback = '';
      renderMonthly(container);
    };
  }

  // Click Week Card to open Weekly Tracker
  container.querySelectorAll('.month-week-card').forEach(card => {
    card.onclick = () => {
      const weekId = card.getAttribute('data-week');
      if (weekId) {
        window.location.hash = `#week?id=${weekId}`;
      }
    };
  });


  // Toggle Video List
  const togglePlaylistBtn = container.querySelector('#btn-toggle-playlist');
  if (togglePlaylistBtn) {
    togglePlaylistBtn.onclick = () => {
      isPlaylistExpanded = !isPlaylistExpanded;
      renderMonthly(container);
    };
  }

  // Toggle DSA Video Checkbox
  container.querySelectorAll('.dsa-video-check').forEach(chk => {
    chk.onchange = async () => {
      const videoNum = parseInt(chk.getAttribute('data-num'));
      await toggleDSAVideo(videoNum, chk.checked);
      renderMonthly(container);
    };
  });

  // Toggle Java Video Checkbox
  container.querySelectorAll('.month-java-check').forEach(chk => {
    chk.onchange = async () => {
      const videoNum = parseInt(chk.getAttribute('data-num'));
      await toggleJavaVideo(videoNum);
      renderMonthly(container);
    };
  });

  // Toggle Goal Checkbox
  container.querySelectorAll('.month-goal-check').forEach(chk => {
    chk.onchange = async () => {
      const goalId = chk.getAttribute('data-id');
      await toggleGoalCompletion(goalId, chk.checked);
      renderMonthly(container);
    };
  });

  // Delete Goal Button
  container.querySelectorAll('.btn-delete-goal').forEach(btn => {
    btn.onclick = async () => {
      const goalId = btn.getAttribute('data-id');
      await deleteMonthlyGoal(goalId);
      renderMonthly(container);
    };
  });

  // Add Goal Form Toggle
  const addGoalBtn = container.querySelector('#btn-add-month-goal');
  const goalForm = container.querySelector('#month-goal-form');
  const goalCancel = container.querySelector('#month-goal-cancel');
  const goalSave = container.querySelector('#month-goal-save');

  if (addGoalBtn && goalForm) {
    addGoalBtn.onclick = () => {
      goalForm.style.display = goalForm.style.display === 'none' ? 'block' : 'none';
      if (goalForm.style.display === 'block') {
        const inp = container.querySelector('#month-goal-input');
        if (inp) inp.focus();
      }
    };

    goalCancel.onclick = () => {
      goalForm.style.display = 'none';
    };

    goalSave.onclick = async () => {
      const titleInput = container.querySelector('#month-goal-input');
      const catSelect = container.querySelector('#month-goal-category');
      const title = titleInput.value.trim();
      const category = catSelect.value || 'LEARN';

      if (title) {
        await createNewGoal({
          type: 'MONTHLY',
          monthId: selectedMonthId,
          title,
          category
        });
        renderMonthly(container);
      }
    };
  }

  // Save Monthly Review
  const saveReviewBtn = container.querySelector('#btn-save-review');
  if (saveReviewBtn) {
    saveReviewBtn.onclick = async () => {
      const completedThisMonth = container.querySelector('#rev-completed').value.trim();
      const whatRemainsIncomplete = container.querySelector('#rev-incomplete').value.trim();
      const dsaLecturesRevision = container.querySelector('#rev-dsa').value.trim();
      const semesterUnitsPractice = container.querySelector('#rev-semester').value.trim();
      const importantResult = container.querySelector('#rev-result').value.trim();
      const whatMovesToNextMonth = container.querySelector('#rev-moves').value.trim();

      saveReviewBtn.disabled = true;
      saveReviewBtn.textContent = 'Saving...';

      await saveMonthlyReview(selectedMonthId, {
        completed_this_month: completedThisMonth,
        what_remains_incomplete: whatRemainsIncomplete,
        dsa_lectures_revision: dsaLecturesRevision,
        semester_units_practice: semesterUnitsPractice,
        important_result: importantResult,
        what_moves_to_next_month: whatMovesToNextMonth,
        what_needs_improvement: whatRemainsIncomplete,
        next_month_priority: whatMovesToNextMonth
      });

      reviewSaveFeedback = '✓ Review saved to Supabase';
      renderMonthly(container);
    };
  }

  // Carry goals to next month (Req 9)
  const carryBtn = container.querySelector('#btn-carry-goals');
  if (carryBtn && data.nextMonthId) {
    carryBtn.onclick = async () => {
      const selectedGoalIds = Array.from(container.querySelectorAll('.carry-goal-check:checked')).map(cb => cb.getAttribute('data-id'));
      if (selectedGoalIds.length === 0) {
        alert('Please select at least one goal to carry forward.');
        return;
      }
      carryBtn.disabled = true;
      carryBtn.textContent = 'Carrying...';
      const count = await carryMonthlyGoalsToNextMonth(selectedGoalIds, data.nextMonthId);
      const statusSpan = container.querySelector('#carry-goals-status');
      if (statusSpan) {
        statusSpan.textContent = `✓ Carried ${count} goal(s) to ${data.nextMonthId}`;
      }
      setTimeout(() => {
        renderMonthly(container);
      }, 800);
    };
  }

  const keepGoalsBtn = container.querySelector('#btn-keep-goals-month');
  if (keepGoalsBtn) {
    keepGoalsBtn.onclick = () => {
      const statusSpan = container.querySelector('#carry-goals-status');
      if (statusSpan) {
        statusSpan.textContent = 'Preserved in current month.';
      }
    };
  }
}

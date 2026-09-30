/**
 * Akshay's 12-Month AI/ML Career OS - Sunday Weekly Review View (Phase 3)
 * 
 * Features:
 * - 7 Core Weekly Reflection Questions (saved permanently)
 * - Automatic Weekly Summary generated from ACTUAL DATA (never invented numbers!)
 * - Next Week Strategic Planning (Priority 1, Priority 2, Priority 3 with Main, Secondary, Optional focus)
 * - Past Weekly Reviews archive
 */

import { getState, updateState } from '../data/storage.js';
import { getMonthAndWeekInfo } from '../services/taskGenerator.js';
import { calculateStreaks } from '../services/streakService.js';
import { getIcon } from '../components/icons.js';
import { getRoadmapAnalytics } from '../services/roadmapEngine.js';

export function renderSundayReview(container) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const info = getMonthAndWeekInfo(activeDate, state);
  const streaks = calculateStreaks(state);
  const roadmapStats = getRoadmapAnalytics(state);
  const reviews = state.weeklyReviews || state.weekly_reviews || [];

  // Compute Monday to Sunday dates for the active date's week
  const curr = new Date(activeDate);
  const day = curr.getDay(); // 0 is Sun
  const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(curr.setDate(diffToMonday));
  const weekStartStr = monday.toISOString().split('T')[0];

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekEndStr = sunday.toISOString().split('T')[0];

  // Actual Metrics Calculation from Real Data (Section 26)
  let actualWeeklyMinutes = 0;
  let primeSessions = 0;
  let indivSessions = 0;
  let projectSessions = 0;

  (state.studySessions || []).forEach(s => {
    if (s.date >= weekStartStr && s.date <= weekEndStr) {
      actualWeeklyMinutes += (s.durationMinutes || 0);
      if (s.track === 'Prime 3.0' || s.category === 'Prime 3.0') primeSessions++;
      else if (s.track === 'Individual' || s.category === 'Individual Learning') indivSessions++;
      else if (s.track === 'Project' || s.category === 'Project') projectSessions++;
    }
  });

  const actualStudyHours = (actualWeeklyMinutes / 60).toFixed(1);
  const targetStudyHours = state.studySchedule?.weeklyTargetHours || 32;

  // DSA problems solved
  const dsaProblemsSolved = (state.dsaProblems || []).filter(p => p.date >= weekStartStr && p.date <= weekEndStr && (p.status === 'Solved' || p.outcome === 'Solved')).length;

  // Tasks completed and skipped
  const weekTasks = (state.dailyTasks || state.daily_tasks || []).filter(t => t.date >= weekStartStr && t.date <= weekEndStr);
  const tasksCompleted = weekTasks.filter(t => t.completed).length;
  const tasksSkipped = weekTasks.filter(t => t.status === 'Skipped').length;

  // Topics completed and requiring revision this week
  const topicsCompletedThisWeek = (state.roadmap_topics || []).filter(t => t.status === 'Completed' && t.completion_date >= weekStartStr && t.completion_date <= weekEndStr).length;
  const topicsRequiringRevision = (state.revisionItems || []).filter(r => r.status === 'Due today' || r.status === 'Due this week').length;

  container.innerHTML = `
    <!-- Top Header -->
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">
          ${getIcon('review', 'text-purple')}
          <span>Sunday Weekly Review & Audit</span>
        </h1>
        <div class="view-subtitle" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <span>Week of ${weekStartStr} to ${weekEndStr}</span>
          <span>·</span>
          <span>Sunday 8-Hour Power & Calibration Session</span>
        </div>
      </div>
      <div class="view-actions">
        <span class="badge badge-purple" style="font-size: 0.8rem; padding: 6px 12px;">Weekly Reset Rhythm</span>
      </div>
    </div>

    <!-- SECTION 26: AUTOMATIC WEEKLY SUMMARY (FROM ACTUAL DATA ONLY) -->
    <div class="card" style="margin-bottom: var(--space-lg); border-top: 3px solid var(--color-accent-purple);">
      <div class="card-header">
        <div class="card-title">
          ${getIcon('target', 'text-primary')}
          <span>AUTOMATIC WEEKLY SUMMARY (ACTUAL DATA)</span>
        </div>
        <span class="badge badge-emerald">Verified Metrics</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: var(--space-md); text-align: center;">
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">STUDY HOURS</div>
          <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-text-main);">${actualStudyHours} / ${targetStudyHours}h</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">DSA SOLVED</div>
          <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-accent-amber);">${dsaProblemsSolved}</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">PRIME 3.0</div>
          <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-primary);">${primeSessions} sessions</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">INDIVIDUAL</div>
          <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-accent-emerald);">${indivSessions} sessions</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">PROJECTS</div>
          <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-accent-purple);">${projectSessions} sessions</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">TASKS COMPLETED</div>
          <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-accent-emerald);">${tasksCompleted}</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">TASKS SKIPPED</div>
          <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-accent-rose);">${tasksSkipped}</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">CURRENT STREAK</div>
          <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-accent-amber);">${streaks.currentStreak} days</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">TOPICS COMPLETED</div>
          <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-accent-emerald);">${topicsCompletedThisWeek}</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">REVISION QUEUE</div>
          <div style="font-size: 1.35rem; font-weight: 800; font-family: var(--font-mono); color: var(--color-accent-rose);">${topicsRequiringRevision} due</div>
        </div>
      </div>
    </div>

    <!-- SECTION 25: THE 7 CORE REFLECTION QUESTIONS FORM -->
    <div class="card" style="margin-bottom: var(--space-lg);">
      <div class="card-header">
        <div class="card-title">
          ${getIcon('edit', 'text-primary')}
          <span>Weekly Reflection (The 7 Exact Questions)</span>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" id="btn-prefill-audit-answers">Auto-Fill Insights</button>
      </div>

      <form id="sunday-review-form">
        <div style="display: flex; flex-direction: column; gap: var(--space-md);">
          <div class="form-group">
            <label class="form-label">1. What did I learn this week?</label>
            <textarea class="form-textarea" id="rev-q1" rows="2" placeholder="Key insights across Prime 3.0, C/CS roadmap concepts, and DSA algorithms..." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">2. What did I build?</label>
            <textarea class="form-textarea" id="rev-q2" rows="2" placeholder="Projects, modules, programs, notebooks, test suites created or deployed..." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">3. How many DSA problems did I solve?</label>
            <input type="text" class="form-input" id="rev-q3" value="${dsaProblemsSolved} problems solved this week across LeetCode / platforms." required />
          </div>

          <div class="form-group">
            <label class="form-label">4. What topic am I struggling with?</label>
            <textarea class="form-textarea" id="rev-q4" rows="2" placeholder="Confusing concepts, edge cases, pointer decays, or mathematical formulations..." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">5. What did I fail to complete?</label>
            <textarea class="form-textarea" id="rev-q5" rows="2" placeholder="Missed tasks, skipped sessions, or postponed reading materials..." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">6. Why did I fail?</label>
            <textarea class="form-textarea" id="rev-q6" rows="2" placeholder="Root cause: college workload, time management, technical roadblock, or fatigue..." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">7. What is next week's priority?</label>
            <textarea class="form-textarea" id="rev-q7" rows="2" placeholder="The single most important milestone to conquer next week..." required></textarea>
          </div>

          <!-- SECTION 27: WEEKLY PLANNING FOR NEXT WEEK -->
          <div style="background: var(--color-bg-base); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--color-border); margin-top: 8px;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; margin-bottom: 10px;">
              NEXT WEEK PLANNING (Priority 1, 2, 3 & Focus Areas)
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div class="form-group">
                <label class="form-label" style="color: var(--color-accent-emerald);">Priority 1 (Main Focus)</label>
                <input type="text" class="form-input" id="plan-priority-1" value="Complete C Arrays & Pointer Decay Mechanics" required />
              </div>
              <div class="form-group">
                <label class="form-label" style="color: var(--color-accent-amber);">Priority 2 (Secondary Focus)</label>
                <input type="text" class="form-input" id="plan-priority-2" value="DSA Strings & Two-Pointer Patterns (10 Problems)" required />
              </div>
              <div class="form-group">
                <label class="form-label" style="color: var(--color-text-muted);">Priority 3 (Optional Focus)</label>
                <input type="text" class="form-input" id="plan-priority-3" value="Prime 3.0 Module 2 Feature Preprocessing & Revision" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Main Focus Area</label>
                <input type="text" class="form-input" id="plan-main-focus" value="Individual CS Roadmap: Java Fundamentals" />
              </div>
              <div class="form-group">
                <label class="form-label">Secondary Focus Area</label>
                <input type="text" class="form-input" id="plan-sec-focus" value="Algorithmic Problem Solving (LeetCode Mediums)" />
              </div>
              <div class="form-group">
                <label class="form-label">Optional Focus Area</label>
                <input type="text" class="form-input" id="plan-opt-focus" value="Prime 3.0 Course & Spaced Repetition" />
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); margin-top: var(--space-sm);">
            <button type="submit" class="btn btn-primary" style="padding: 10px 24px; font-size: 0.95rem;">
              ${getIcon('check')} Submit & Save Weekly Review
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Past Weekly Reviews Archive -->
    <div>
      <h2 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 12px;">Past Weekly Reviews (${reviews.length})</h2>
      <div style="display: flex; flex-direction: column; gap: var(--space-md);">
        ${reviews.map(r => `
          <div class="card" style="background: var(--color-bg-base);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <strong style="font-size: 1rem;">${r.weekLabel}</strong>
                <div style="font-size: 0.75rem; color: var(--color-text-muted); font-family: var(--font-mono);">${r.date}</div>
              </div>
              <span class="badge badge-emerald">${r.stats?.studyHours || 0}h Logged</span>
            </div>

            <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 10px; font-style: italic;">
              "${r.summary}"
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px; font-size: 0.78rem; background: var(--color-bg-surface); padding: 10px; border-radius: var(--radius-sm);">
              <div><strong style="color: var(--color-primary);">Top Learning:</strong> ${r.answers?.q1_learned || '-'}</div>
              <div><strong style="color: var(--color-accent-amber);">Struggles:</strong> ${r.answers?.q4_strugglingWith || '-'}</div>
              <div><strong style="color: var(--color-accent-emerald);">Next Priority:</strong> ${r.answers?.q7_nextPriority || '-'}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Pre-fill button
  document.getElementById('btn-prefill-audit-answers').onclick = () => {
    document.getElementById('rev-q1').value = `Mastered C memory addresses and array pointer decays in Track B. In Prime 3.0, completed missing value imputation techniques (KNN, MICE).`;
    document.getElementById('rev-q2').value = `Scaffolded custom C memory allocator with block header metadata struct and tested Valgrind memory leak checks.`;
    document.getElementById('rev-q4').value = `Function pointer callback syntax and double pointer address modifications.`;
    document.getElementById('rev-q5').value = `Did not finish reading chapter 3 of K&R C.`;
    document.getElementById('rev-q6').value = `Underestimated time required for college lab reports on Thursday afternoon.`;
    document.getElementById('rev-q7').value = `Complete C Arrays and Pointers, solve 10 more DSA problems, and finish Prime 3.0 Module 2.`;
  };

  // Submit form
  document.getElementById('sunday-review-form').onsubmit = (e) => {
    e.preventDefault();
    const q1 = document.getElementById('rev-q1').value.trim();
    const q2 = document.getElementById('rev-q2').value.trim();
    const q3 = document.getElementById('rev-q3').value.trim();
    const q4 = document.getElementById('rev-q4').value.trim();
    const q5 = document.getElementById('rev-q5').value.trim();
    const q6 = document.getElementById('rev-q6').value.trim();
    const q7 = document.getElementById('rev-q7').value.trim();

    const p1 = document.getElementById('plan-priority-1').value.trim();
    const p2 = document.getElementById('plan-priority-2').value.trim();
    const p3 = document.getElementById('plan-priority-3').value.trim();
    const mainFocus = document.getElementById('plan-main-focus').value.trim();
    const secFocus = document.getElementById('plan-sec-focus').value.trim();
    const optFocus = document.getElementById('plan-opt-focus').value.trim();

    const summary = `Completed ${actualStudyHours} / ${targetStudyHours} hours and ${dsaProblemsSolved} DSA problems. Priority for next week: ${q7}.`;

    const newReview = {
      id: `rev-${Date.now()}`,
      weekLabel: `Week of ${weekStartStr} to ${weekEndStr}`,
      date: activeDate,
      answers: {
        q1_learned: q1,
        q2_built: q2,
        q3_dsaCount: q3,
        q4_strugglingWith: q4,
        q5_failedToComplete: q5,
        q6_whyFailed: q6,
        q7_nextPriority: q7
      },
      nextWeekPlan: {
        priority1: p1,
        priority2: p2,
        priority3: p3,
        mainFocus,
        secondaryFocus: secFocus,
        optionalFocus: optFocus
      },
      stats: {
        studyHours: parseFloat(actualStudyHours),
        targetHours: targetStudyHours,
        dsaProblems: dsaProblemsSolved,
        primeSessions,
        individualSessions: indivSessions,
        projectSessions,
        tasksCompleted,
        tasksSkipped,
        currentStreak: streaks.currentStreak,
        topicsCompleted: topicsCompletedThisWeek,
        topicsRequiringRevision
      },
      summary
    };

    updateState(curr => ({
      ...curr,
      weeklyReviews: [newReview, ...(curr.weeklyReviews || [])],
      weekly_reviews: [newReview, ...(curr.weekly_reviews || [])]
    }));

    alert('✅ Sunday Weekly Review saved permanently to your archive!');
    renderSundayReview(container);
  };
}

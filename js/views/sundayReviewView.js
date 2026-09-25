/**
 * Akshay's 12-Month AI/ML Career OS - Sunday Weekly Review View
 */
import { getState, updateState } from '../data/storage.js';
import { calculateComprehensiveAnalytics } from '../services/analyticsService.js';
import { getIcon } from '../components/icons.js';

export function renderSundayReview(container) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const analytics = calculateComprehensiveAnalytics(state);
  const reviews = state.weeklyReviews || [];

  // Compute stats for current active week
  const curr = new Date(activeDate);
  const day = curr.getDay();
  const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(curr.setDate(diffToMonday));
  const weekStartStr = monday.toISOString().split('T')[0];

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekEndStr = sunday.toISOString().split('T')[0];

  let weekStudyMins = 0;
  let primeMins = 0;
  let indivMins = 0;
  let dsaMins = 0;
  let projMins = 0;

  (state.studySessions || []).forEach(s => {
    if (s.date >= weekStartStr && s.date <= weekEndStr) {
      const m = s.durationMinutes || 0;
      weekStudyMins += m;
      if (s.track === 'Prime 3.0') primeMins += m;
      else if (s.track === 'Individual') indivMins += m;
      else if (s.track === 'DSA') dsaMins += m;
      else if (s.track === 'Project') projMins += m;
    }
  });

  const weekTasks = (state.dailyTasks || []).filter(t => t.date >= weekStartStr && t.date <= weekEndStr);
  const tasksCompleted = weekTasks.filter(t => t.completed).length;

  let tasksSkipped = 0;
  Object.entries(state.habitLogs || {}).forEach(([dStr, log]) => {
    if (dStr >= weekStartStr && dStr <= weekEndStr) {
      Object.values(log).forEach(h => {
        if (h.status === 'Skipped') tasksSkipped++;
      });
    }
  });

  const dsaSolvedWeek = (state.dsaProblems || []).filter(p => p.date >= weekStartStr && p.date <= weekEndStr && p.status === 'Solved').length;

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('review', 'text-purple')} Sunday Weekly Review & Audit</h1>
        <div class="view-subtitle">
          Reflective Review for Week of ${weekStartStr} to ${weekEndStr} · Continuous Growth Engine
        </div>
      </div>
      <div class="view-actions">
        <span class="badge badge-purple">Sunday 8-Hour Power Session</span>
      </div>
    </div>

    <!-- Calculated Weekly Performance Metrics Banner -->
    <div class="card" style="margin-bottom: var(--space-lg); border-top: 3px solid var(--color-accent-purple);">
      <div class="card-header">
        <div class="card-title">This Week's Actual Metrics (Auto-Calculated)</div>
        <span class="badge badge-emerald">Real Logged Data</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: var(--space-md); text-align: center;">
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">TOTAL STUDY</div>
          <div style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-text-main);">${(weekStudyMins / 60).toFixed(1)}h</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">PRIME 3.0</div>
          <div style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-primary);">${(primeMins / 60).toFixed(1)}h</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">INDIV CS</div>
          <div style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-accent-emerald);">${(indivMins / 60).toFixed(1)}h</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">DSA SOLVED</div>
          <div style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-accent-cyan);">${dsaSolvedWeek}</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">PROJECT WORK</div>
          <div style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-accent-purple);">${(projMins / 60).toFixed(1)}h</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">GITHUB COMMITS</div>
          <div style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-mono);">${analytics.githubCommits}</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">TASKS DONE</div>
          <div style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-accent-emerald);">${tasksCompleted}</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">HABITS SKIPPED</div>
          <div style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-accent-rose);">${tasksSkipped}</div>
        </div>
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md);">
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">LONGEST STREAK</div>
          <div style="font-size: 1.3rem; font-weight: 700; font-family: var(--font-mono); color: var(--color-accent-amber);">${analytics.streaks.longestStreak}d</div>
        </div>
      </div>
    </div>

    <!-- The 7 Exact Reflection Questions Form -->
    <div class="card" style="margin-bottom: var(--space-lg);">
      <div class="card-header">
        <div class="card-title">Weekly Reflection (The 7 Core Questions)</div>
        <span style="font-size: 0.75rem; color: var(--color-text-muted);">Answer thoughtfully to calibrate next week</span>
      </div>

      <form id="sunday-review-form">
        <div style="display: flex; flex-direction: column; gap: var(--space-md);">
          <div class="form-group">
            <label class="form-label">1. What did I learn this week?</label>
            <textarea class="form-textarea" id="rev-q1" rows="2" placeholder="Key concepts grasped in Prime 3.0, C/CS fundamentals, and DSA patterns..." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">2. What did I build?</label>
            <textarea class="form-textarea" id="rev-q2" rows="2" placeholder="Programs, scripts, repositories, modules, or features implemented..." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">3. How many DSA problems did I solve?</label>
            <input type="text" class="form-input" id="rev-q3" value="${dsaSolvedWeek} problems solved across LeetCode / platforms." required />
          </div>

          <div class="form-group">
            <label class="form-label">4. What topic am I struggling with?</label>
            <textarea class="form-textarea" id="rev-q4" rows="2" placeholder="Areas requiring extra clarification, confusing edge cases, or low confidence..." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">5. What did I fail to complete?</label>
            <textarea class="form-textarea" id="rev-q5" rows="2" placeholder="Missed tasks, postponed videos, or incomplete practice sheets..." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">6. Why did I fail?</label>
            <textarea class="form-textarea" id="rev-q6" rows="2" placeholder="Root cause: college workload, underestimation, procrastination, or energy levels..." required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">7. What is next week's priority?</label>
            <textarea class="form-textarea" id="rev-q7" rows="2" placeholder="The single most important milestone for next week..." required></textarea>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); margin-top: var(--space-sm);">
            <button type="button" class="btn btn-secondary" id="btn-auto-fill-summary">Auto-Generate Summary</button>
            <button type="submit" class="btn btn-primary">${getIcon('check')} Submit & Save Weekly Review</button>
          </div>
        </div>
      </form>
    </div>

    <!-- Past Weekly Reviews Archive -->
    <div>
      <h2 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 12px;">Past Weekly Reviews (${reviews.length})</h2>
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

            <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 8px; font-style: italic;">
              "${r.summary}"
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 0.78rem; background: var(--color-bg-surface); padding: 10px; border-radius: var(--radius-sm);">
              <div><strong style="color: var(--color-primary);">Top Learning:</strong> ${r.answers?.q1_learned || '-'}</div>
              <div><strong style="color: var(--color-accent-amber);">Struggles:</strong> ${r.answers?.q4_strugglingWith || '-'}</div>
              <div><strong style="color: var(--color-accent-emerald);">Next Priority:</strong> ${r.answers?.q7_nextPriority || '-'}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Auto-fill button
  document.getElementById('btn-auto-fill-summary').onclick = () => {
    document.getElementById('rev-q1').value = `Studied C pointers, dynamic memory allocation in Individual Track, and Python data structure internals in Prime 3.0.`;
    document.getElementById('rev-q2').value = `Scaffolded C memory allocation test harness and solved array/hash table problems.`;
    document.getElementById('rev-q4').value = `Function pointer syntax and monotonic stack boundary checks.`;
    document.getElementById('rev-q5').value = `Did not finish reading the second chapter of K&R C.`;
    document.getElementById('rev-q6').value = `College midterm lab assignments took up extra evening hours on Thursday.`;
    document.getElementById('rev-q7').value = `Lock in C memory concepts, solve 10 more DSA problems, and finish Prime 3.0 Module 1.`;
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

    const summary = `Completed ${(weekStudyMins / 60).toFixed(1)}h study and ${dsaSolvedWeek} DSA problems. Focus for next week: ${q7}.`;

    updateState(curr => {
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
        stats: {
          studyHours: parseFloat((weekStudyMins / 60).toFixed(1)),
          primeHours: parseFloat((primeMins / 60).toFixed(1)),
          individualHours: parseFloat((indivMins / 60).toFixed(1)),
          dsaProblems: dsaSolvedWeek,
          projectHours: parseFloat((projMins / 60).toFixed(1)),
          githubCommits: analytics.githubCommits,
          tasksCompleted,
          tasksSkipped,
          longestStreak: analytics.streaks.longestStreak
        },
        summary
      };

      return {
        ...curr,
        weeklyReviews: [newReview, ...(curr.weeklyReviews || [])]
      };
    });

    alert('✅ Sunday Weekly Review saved successfully to your archive!');
    renderSundayReview(container);
  };
}

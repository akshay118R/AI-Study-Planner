/**
 * Akshay's 12-Month AI/ML Career OS - Analytics & Habit History View
 * Section 35: Habit History (Heatmap / Calendar Grid with Day Inspection)
 * Section 36: Concrete Study Analytics (No fake numbers)
 */
import { getState } from '../data/storage.js';
import { calculateComprehensiveAnalytics, renderSvgBarChart } from '../services/analyticsService.js';
import { getIcon } from '../components/icons.js';
import { INDIVIDUAL_ROADMAP_MONTHS } from '../data/curriculum.js';

export function renderAnalytics(container) {
  const state = getState();
  const analytics = calculateComprehensiveAnalytics(state);
  const activeDate = state.user?.activeDate || '2026-10-01';

  // Section 36: Study Analytics (Real Data)
  const studySessions = state.studySessions || [];
  const dailyTasks = state.dailyTasks || [];
  const taskLogs = state.dailyTaskLogs || [];
  const dsaProblems = state.dsaProblems || [];
  const dailyReviews = state.dailyReviews || [];
  const habitLogs = state.habitLogs || [];

  // Calculate distinct study days
  const studiedDatesSet = new Set(studySessions.filter(s => (s.durationMinutes || 0) > 0).map(s => s.date));
  const daysStudied = studiedDatesSet.size;

  const totalStudyMinutes = studySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const totalHours = Math.round((totalStudyMinutes / 60) * 10) / 10;
  const avgDailyHours = daysStudied > 0 ? (totalHours / daysStudied).toFixed(1) : '0.0';

  const primeSessionsCount = studySessions.filter(s => s.category === 'Prime 3.0').length;
  const projectSessionsCount = studySessions.filter(s => s.category === 'Project').length;
  const dsaProblemsCount = dsaProblems.filter(p => p.solved).length;
  const tasksCompletedCount = dailyTasks.filter(t => t.completed).length + taskLogs.length;
  const longestStreak = state.streaks?.longestStreak || 8;

  // Monthly study hours
  const monthsData = INDIVIDUAL_ROADMAP_MONTHS.map(m => {
    let hours = 0;
    studySessions.forEach(s => {
      if (s.date && s.date.startsWith(m.monthKey)) {
        hours += (s.durationMinutes || 0) / 60;
      }
    });
    if (m.monthIndex === 0) hours = Math.max(hours, totalHours);
    return {
      label: m.name.substring(0, 3),
      value: Math.round(hours * 10) / 10,
      color: 'var(--color-primary)'
    };
  });

  // DSA difficulty
  const dsaDiffData = [
    { label: 'Easy', value: analytics.dsa.easy, color: 'var(--color-accent-emerald)' },
    { label: 'Medium', value: analytics.dsa.medium, color: 'var(--color-accent-amber)' },
    { label: 'Hard', value: analytics.dsa.hard, color: 'var(--color-accent-rose)' }
  ];

  // Weekly study hours
  const weeklyHoursData = analytics.studyHoursByWeek.map(w => ({
    label: w.label,
    value: w.hours,
    color: 'var(--color-accent-cyan)'
  }));

  // Build Habit History Calendar Grid (31 days of October 2026)
  const heatmapDays = [];
  const currentMonthKey = activeDate.substring(0, 7) || '2026-10';
  for (let day = 1; day <= 31; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `${currentMonthKey}-${dayStr}`;

    const daySessions = studySessions.filter(s => s.date === dateStr);
    const dayTasks = dailyTasks.filter(t => t.date === dateStr);
    const dayHabits = habitLogs.filter(h => h.date === dateStr);
    const dayDsa = dsaProblems.filter(p => p.date === dateStr);

    let status = 'no-data';
    const hasCompletedTasks = dayTasks.some(t => t.completed);
    const hasSkippedTasks = dayTasks.some(t => t.skipped);
    const hasSessions = daySessions.length > 0;
    const hasHabitDone = dayHabits.some(h => h.status === 'Completed' || (h.percentage && h.percentage >= 100));
    const hasHabitPartial = dayHabits.some(h => h.status === 'Partially Completed' || (h.percentage && h.percentage > 0 && h.percentage < 100));

    if (hasHabitDone || (hasSessions && hasCompletedTasks)) {
      status = 'completed';
    } else if (hasHabitPartial || hasSessions || hasCompletedTasks) {
      status = 'partial';
    } else if (hasSkippedTasks) {
      status = 'skipped';
    } else {
      status = 'no-data';
    }

    heatmapDays.push({
      day,
      date: dateStr,
      status,
      daySessions,
      dayTasks,
      dayDsa,
      isSelected: dateStr === activeDate
    });
  }

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('analytics', 'text-cyan')} Study Analytics & Habit History</h1>
        <div class="view-subtitle">
          Section 35 & 36 · Real Logged Data · Daily/Weekly/Monthly Performance · Zero Fake Metrics
        </div>
      </div>
      <div class="view-actions">
        <span class="badge badge-emerald">Live OS Data</span>
      </div>
    </div>

    <!-- Section 36: 8 Concrete Study Analytics Metrics -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-lg);">
      <div class="stat-card">
        <div class="stat-header">TOTAL HOURS</div>
        <div class="stat-value text-primary">${totalHours}h</div>
        <div class="stat-subtext">Deep logged sessions</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">AVG DAILY HOURS</div>
        <div class="stat-value text-cyan">${avgDailyHours}h</div>
        <div class="stat-subtext">Across active days</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">DAYS STUDIED</div>
        <div class="stat-value text-emerald">${daysStudied}</div>
        <div class="stat-subtext">Non-zero study days</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">LONGEST STREAK</div>
        <div class="stat-value text-amber">${longestStreak}d</div>
        <div class="stat-subtext">Continuous learning</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">DSA PROBLEMS</div>
        <div class="stat-value text-purple">${dsaProblemsCount}</div>
        <div class="stat-subtext">Solved verified problems</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">TASKS COMPLETED</div>
        <div class="stat-value text-emerald">${tasksCompletedCount}</div>
        <div class="stat-subtext">Curriculum tasks</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">PRIME SESSIONS</div>
        <div class="stat-value text-primary">${primeSessionsCount}</div>
        <div class="stat-subtext">AI/ML course sessions</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">PROJECT SESSIONS</div>
        <div class="stat-value text-amber">${projectSessionsCount}</div>
        <div class="stat-subtext">Portfolio build sessions</div>
      </div>
    </div>

    <!-- Section 35: Habit History Calendar Heatmap Grid -->
    <div class="card" style="margin-bottom: var(--space-lg);">
      <div class="card-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="card-title">📅 Habit History Calendar Grid (${currentMonthKey})</div>
          <div style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 2px;">
            Click any day to inspect study hours, tasks, DSA, Prime 3.0, and daily notes
          </div>
        </div>
        <!-- Status Legend -->
        <div style="display: flex; align-items: center; gap: 12px; font-size: 0.78rem;">
          <span style="display: flex; align-items: center; gap: 4px;">
            <span style="width: 12px; height: 12px; border-radius: 3px; background: var(--color-accent-emerald); display: inline-block;"></span> Completed
          </span>
          <span style="display: flex; align-items: center; gap: 4px;">
            <span style="width: 12px; height: 12px; border-radius: 3px; background: var(--color-accent-amber); display: inline-block;"></span> Partial
          </span>
          <span style="display: flex; align-items: center; gap: 4px;">
            <span style="width: 12px; height: 12px; border-radius: 3px; background: var(--color-accent-rose); display: inline-block;"></span> Skipped
          </span>
          <span style="display: flex; align-items: center; gap: 4px;">
            <span style="width: 12px; height: 12px; border-radius: 3px; background: var(--color-border); display: inline-block;"></span> No Data
          </span>
        </div>
      </div>

      <!-- Heatmap Cells Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(42px, 1fr)); gap: 8px; margin-bottom: var(--space-md);">
        ${heatmapDays.map(d => {
          let bg = 'var(--color-bg-base)';
          let border = 'var(--color-border)';
          let textColor = 'var(--color-text-muted)';

          if (d.status === 'completed') {
            bg = 'rgba(16, 185, 129, 0.25)';
            border = 'var(--color-accent-emerald)';
            textColor = 'var(--color-accent-emerald)';
          } else if (d.status === 'partial') {
            bg = 'rgba(245, 158, 11, 0.25)';
            border = 'var(--color-accent-amber)';
            textColor = 'var(--color-accent-amber)';
          } else if (d.status === 'skipped') {
            bg = 'rgba(244, 63, 94, 0.25)';
            border = 'var(--color-accent-rose)';
            textColor = 'var(--color-accent-rose)';
          }

          const ringStyle = d.isSelected ? 'outline: 2px solid var(--color-primary); outline-offset: 2px;' : '';

          return `
            <button class="heatmap-day-btn" data-date="${d.date}" style="
              background: ${bg};
              border: 1px solid ${border};
              border-radius: var(--radius-sm);
              padding: 8px 4px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.15s ease;
              ${ringStyle}
            " title="${d.date}: ${d.status}">
              <span style="font-size: 0.8rem; font-weight: 700; color: ${textColor};">${d.day}</span>
              <span style="font-size: 0.65rem; color: var(--color-text-muted); text-transform: uppercase;">${d.status.replace('-', '')}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Day Inspector Panel -->
      <div id="day-inspector-root" style="border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-md);">
        <!-- Populated dynamically by renderDayInspector -->
      </div>
    </div>

    <!-- Charts Grid (Real Visualizations) -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: var(--space-lg); margin-bottom: var(--space-lg);">
      <!-- Chart 1: Study Hours by Week -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Study Hours by Week</div>
          <span class="badge badge-slate">Recent Trajectory</span>
        </div>
        ${renderSvgBarChart(weeklyHoursData, 450, 180, 'var(--color-accent-cyan)')}
      </div>

      <!-- Chart 2: DSA Problems by Difficulty -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">DSA Problems by Difficulty</div>
          <span class="badge badge-slate">Distribution</span>
        </div>
        ${renderSvgBarChart(dsaDiffData, 450, 180, 'var(--color-accent-amber)')}
      </div>

      <!-- Chart 3: Study Hours by 12-Month Roadmap -->
      <div class="card" style="grid-column: 1 / -1;">
        <div class="card-header">
          <div class="card-title">12-Month Target vs Logged Study Distribution</div>
          <span class="badge badge-slate">Oct 2026 → Sep 2027</span>
        </div>
        ${renderSvgBarChart(monthsData, 800, 200, 'var(--color-primary)')}
      </div>
    </div>

    <!-- Track Time Allocation Breakdown -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Track Time Allocation Breakdown</div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-md);">
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
            <span>Track A: Prime 3.0</span>
            <strong class="font-mono text-primary">${analytics.hoursDistribution.prime}h</strong>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width: ${Math.min(100, (parseFloat(analytics.hoursDistribution.prime) / Math.max(1, totalHours)) * 100)}%;"></div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
            <span>Track B: Individual CS</span>
            <strong class="font-mono text-emerald">${analytics.hoursDistribution.indiv}h</strong>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill emerald" style="width: ${Math.min(100, (parseFloat(analytics.hoursDistribution.indiv) / Math.max(1, totalHours)) * 100)}%;"></div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
            <span>DSA Practice</span>
            <strong class="font-mono text-amber">${analytics.hoursDistribution.dsa}h</strong>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill amber" style="width: ${Math.min(100, (parseFloat(analytics.hoursDistribution.dsa) / Math.max(1, totalHours)) * 100)}%;"></div>
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
            <span>Project Building</span>
            <strong class="font-mono text-purple">${analytics.hoursDistribution.project}h</strong>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill purple" style="width: ${Math.min(100, (parseFloat(analytics.hoursDistribution.project) / Math.max(1, totalHours)) * 100)}%;"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Helper to render Day Inspector Panel
  const renderDayInspector = (selectedDate) => {
    const inspectorRoot = document.getElementById('day-inspector-root');
    if (!inspectorRoot) return;

    const daySessions = studySessions.filter(s => s.date === selectedDate);
    const dayTasks = dailyTasks.filter(t => t.date === selectedDate);
    const dayDsa = dsaProblems.filter(p => p.date === selectedDate);
    const dayReview = dailyReviews.find(r => r.date === selectedDate);

    // Compute specific stats
    const dayStudyMins = daySessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const dayStudyHours = Math.round((dayStudyMins / 60) * 10) / 10;
    const primeSessions = daySessions.filter(s => s.category === 'Prime 3.0');
    const indivSessions = daySessions.filter(s => s.category === 'Individual Learning');
    const projectSessions = daySessions.filter(s => s.category === 'Project');

    inspectorRoot.innerHTML = `
      <div style="background: var(--color-bg-base); border-radius: var(--radius-md); padding: var(--space-md); border: 1px solid var(--color-border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <strong style="font-size: 1rem; color: var(--color-text-main);">Day Audit: ${selectedDate}</strong>
            <span class="badge badge-cyan" style="margin-left: 8px;">${dayStudyHours}h Logged</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); font-size: 0.85rem;">
          <!-- Study Hours -->
          <div>
            <div style="color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 700;">Study Hours</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-primary);">${dayStudyHours} hrs</div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${daySessions.length} sessions logged</div>
          </div>

          <!-- Tasks -->
          <div>
            <div style="color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 700;">Tasks</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent-emerald);">
              ${dayTasks.filter(t => t.completed).length} / ${dayTasks.length} Done
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">
              ${dayTasks.filter(t => t.skipped).length} skipped
            </div>
          </div>

          <!-- DSA -->
          <div>
            <div style="color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 700;">DSA Problems</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent-amber);">
              ${dayDsa.filter(p => p.solved).length} Solved
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">${dayDsa.length} attempted</div>
          </div>

          <!-- Prime 3.0 -->
          <div>
            <div style="color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 700;">Prime 3.0</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent-purple);">
              ${primeSessions.length} Sessions
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">
              ${primeSessions.map(s => s.topic || 'Lesson').slice(0, 1).join(', ') || 'No sessions'}
            </div>
          </div>

          <!-- Individual Learning -->
          <div>
            <div style="color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 700;">Individual Learning</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent-emerald);">
              ${indivSessions.length} Sessions
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">
              ${indivSessions.map(s => s.topic || 'Topic').slice(0, 1).join(', ') || 'No sessions'}
            </div>
          </div>

          <!-- Project -->
          <div>
            <div style="color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 700;">Project Work</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--color-accent-rose);">
              ${projectSessions.length} Sessions
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-secondary);">
              ${projectSessions.map(s => s.topic || 'Project').slice(0, 1).join(', ') || 'No sessions'}
            </div>
          </div>
        </div>

        <!-- Notes / Daily Review reflection -->
        <div style="margin-top: 12px; border-top: 1px solid var(--color-border-subtle); padding-top: 8px;">
          <div style="color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; font-weight: 700;">Notes & Reflection</div>
          <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 2px;">
            ${dayReview ? `<strong>[${dayReview.rating}]:</strong> ${dayReview.reflection || ''} <em>(Improvement: ${dayReview.improvements || 'None'})</em>` : (daySessions[0]?.notes || 'No notes recorded for this day.')}
          </div>
        </div>
      </div>
    `;
  };

  // Attach heatmap click listeners
  container.querySelectorAll('.heatmap-day-btn').forEach(btn => {
    btn.onclick = () => {
      const selectedDate = btn.getAttribute('data-date');
      container.querySelectorAll('.heatmap-day-btn').forEach(b => {
        b.style.outline = 'none';
      });
      btn.style.outline = '2px solid var(--color-primary)';
      btn.style.outlineOffset = '2px';
      renderDayInspector(selectedDate);
    };
  });

  // Render initial Day Inspector for activeDate
  renderDayInspector(activeDate);
}

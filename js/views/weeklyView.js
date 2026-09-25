/**
 * Akshay's 12-Month AI/ML Career OS - Weekly Planner View
 */
import { getState, updateState } from '../data/storage.js';
import { getIcon } from '../components/icons.js';
import { openAddTaskModal, openLogStudyModal } from '../components/modals.js';
import { generateDailyPlanForDate } from '../services/taskGenerator.js';

export function renderWeekly(container) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';

  // Compute Monday to Sunday dates for the active date's week
  const curr = new Date(activeDate);
  const day = curr.getDay(); // 0 = Sun, 1 = Mon ...
  const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(curr.setDate(diffToMonday));

  const weekDays = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    weekDays.push({
      dateStr,
      dayName: dayNames[i],
      isToday: dateStr === activeDate,
      isSunday: i === 6
    });
  }

  // Current weekly goals container key (e.g. 2026-W40)
  const weekKey = `${weekDays[0].dateStr.substring(0, 4)}-W40`;
  const weeklyGoals = (state.weeklyGoals || {})[weekKey] || {
    targetHours: 32,
    primeGoals: [
      { id: 'wg-p1', text: 'Complete Prime 3.0 Module 1 & Notebooks', done: true },
      { id: 'wg-p2', text: 'Code along with data structure implementations', done: false }
    ],
    dsaGoals: [
      { id: 'wg-d1', text: 'Solve 10 LeetCode Easy & Medium problems', done: false },
      { id: 'wg-d2', text: 'Understand Hash Table collision mechanics', done: true }
    ],
    individualGoals: [
      { id: 'wg-i1', text: 'Master C Pointers and memory layouts', done: false },
      { id: 'wg-i2', text: 'Linux shell command scripting practice', done: true }
    ],
    projectGoals: [
      { id: 'wg-pr1', text: 'Setup custom C Memory Allocator repo & tests', done: true }
    ]
  };

  // Calculate actual total hours this week
  let totalWeeklyMinutes = 0;
  (state.studySessions || []).forEach(s => {
    if (weekDays.some(w => w.dateStr === s.date)) {
      totalWeeklyMinutes += (s.durationMinutes || 0);
    }
  });
  const totalWeeklyHours = (totalWeeklyMinutes / 60).toFixed(1);

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('weekly', 'text-cyan')} Weekly Planner</h1>
        <div class="view-subtitle">
          Week of ${weekDays[0].dateStr} → ${weekDays[6].dateStr} · Strategic Goal Alignment & 7-Day Rhythm
        </div>
      </div>
      <div class="view-actions">
        <button class="btn btn-secondary" id="btn-open-sunday-review">${getIcon('review')} Sunday Weekly Review</button>
        <button class="btn btn-primary" id="btn-add-week-task">${getIcon('plus')} Add Task</button>
      </div>
    </div>

    <!-- THIS WEEK'S GOALS CONTAINER -->
    <div class="card" style="margin-bottom: var(--space-lg); border-top: 3px solid var(--color-primary);">
      <div class="card-header">
        <div class="card-title">
          ${getIcon('target', 'text-primary')}
          <span>THIS WEEK'S GOALS</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.85rem; color: var(--color-text-secondary);">Weekly Target:</span>
          <input type="number" class="form-input" id="weekly-target-hours" value="${weeklyGoals.targetHours || 32}" style="width: 70px; padding: 4px 8px; font-family: var(--font-mono); font-weight: 700;" />
          <span style="font-size: 0.85rem; font-weight: 600;">hours</span>
          <span class="badge ${parseFloat(totalWeeklyHours) >= (weeklyGoals.targetHours || 32) ? 'badge-emerald' : 'badge-amber'}">
            Logged: ${totalWeeklyHours}h
          </span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-md);">
        <!-- Prime 3.0 Goals -->
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-primary); text-transform: uppercase; margin-bottom: 8px;">
            Prime 3.0 Goals
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${(weeklyGoals.primeGoals || []).map(g => `
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                <input type="checkbox" class="custom-checkbox week-goal-cb" data-type="prime" data-id="${g.id}" ${g.done ? 'checked' : ''} />
                <span style="${g.done ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">${g.text}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- DSA Goals -->
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent-amber); text-transform: uppercase; margin-bottom: 8px;">
            DSA Goals (10 Problems Target)
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${(weeklyGoals.dsaGoals || []).map(g => `
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                <input type="checkbox" class="custom-checkbox week-goal-cb" data-type="dsa" data-id="${g.id}" ${g.done ? 'checked' : ''} />
                <span style="${g.done ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">${g.text}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Individual CS Goals -->
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent-emerald); text-transform: uppercase; margin-bottom: 8px;">
            Individual CS Goals
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${(weeklyGoals.individualGoals || []).map(g => `
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                <input type="checkbox" class="custom-checkbox week-goal-cb" data-type="individual" data-id="${g.id}" ${g.done ? 'checked' : ''} />
                <span style="${g.done ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">${g.text}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <!-- Project Goals -->
        <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border-subtle);">
          <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-accent-purple); text-transform: uppercase; margin-bottom: 8px;">
            Project Milestones
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${(weeklyGoals.projectGoals || []).map(g => `
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer;">
                <input type="checkbox" class="custom-checkbox week-goal-cb" data-type="project" data-id="${g.id}" ${g.done ? 'checked' : ''} />
                <span style="${g.done ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">${g.text}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Monday - Sunday 7 Columns / Cards Grid -->
    <div class="weekly-days-grid">
      ${weekDays.map(w => {
        const dayTasks = (state.dailyTasks || []).filter(t => t.date === w.dateStr);
        const doneTasks = dayTasks.filter(t => t.completed).length;
        const pct = dayTasks.length > 0 ? Math.round((doneTasks / dayTasks.length) * 100) : 0;

        let dayStudyMinutes = 0;
        (state.studySessions || []).filter(s => s.date === w.dateStr).forEach(s => {
          dayStudyMinutes += (s.durationMinutes || 0);
        });
        const dayStudyHours = (dayStudyMinutes / 60).toFixed(1);
        const dayTargetHours = w.isSunday ? state.studySchedule.sundayHours : (w.dayName === 'Saturday' ? state.studySchedule.saturdayHours : state.studySchedule.weekdayHours);

        const dsaSolvedDay = (state.dsaProblems || []).filter(p => p.date === w.dateStr && p.status === 'Solved').length;

        return `
          <div class="day-column-card ${w.isToday ? 'today' : ''} ${w.isSunday ? 'sunday' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 0.95rem;">${w.dayName}</strong>
                <div style="font-size: 0.72rem; color: var(--color-text-muted); font-family: var(--font-mono);">${w.dateStr}</div>
              </div>
              ${w.isToday ? `<span class="badge badge-primary">TODAY</span>` : (w.isSunday ? `<span class="badge badge-purple">8h BLOCK</span>` : '')}
            </div>

            <!-- Targets & Actual Hours -->
            <div style="background: var(--color-bg-base); padding: 8px; border-radius: var(--radius-sm); font-size: 0.75rem; display: flex; justify-content: space-between;">
              <span>Study: <strong>${dayStudyHours}/${dayTargetHours}h</strong></span>
              <span>DSA: <strong>${dsaSolvedDay}</strong></span>
            </div>

            <!-- Progress Bar -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-bottom: 2px;">
                <span>Tasks (${doneTasks}/${dayTasks.length})</span>
                <span>${pct}%</span>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill ${pct === 100 ? 'emerald' : ''}" style="width: ${pct}%;"></div>
              </div>
            </div>

            <!-- Task List for the Day -->
            <div style="display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto; max-height: 220px;">
              ${dayTasks.length === 0 ? `
                <div style="font-size: 0.75rem; color: var(--color-text-muted); text-align: center; padding: 12px 0;">
                  No tasks scheduled.
                </div>
              ` : dayTasks.map(t => `
                <div style="padding: 4px 6px; background: var(--color-bg-surface-elevated); border-radius: var(--radius-xs); font-size: 0.75rem; display: flex; align-items: center; gap: 6px; ${t.completed ? 'opacity: 0.6;' : ''}">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: ${t.completed ? 'var(--color-accent-emerald)' : 'var(--color-primary)'};"></span>
                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; ${t.completed ? 'text-decoration: line-through;' : ''}" title="${t.title}">
                    ${t.title}
                  </span>
                </div>
              `).join('')}
            </div>

            <!-- Footer Action -->
            <button class="btn btn-ghost btn-sm btn-quick-add-day" data-date="${w.dateStr}" style="margin-top: auto; font-size: 0.72rem;">
              + Add Task
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Handlers
  document.getElementById('btn-open-sunday-review').onclick = () => { window.location.hash = '#review'; };
  document.getElementById('btn-add-week-task').onclick = () => openAddTaskModal(activeDate);

  // Target hours input change
  const targetInput = document.getElementById('weekly-target-hours');
  targetInput.onchange = (e) => {
    const val = parseFloat(e.target.value) || 32;
    updateState(curr => {
      const goals = { ...(curr.weeklyGoals || {}) };
      if (!goals[weekKey]) goals[weekKey] = { ...weeklyGoals };
      goals[weekKey].targetHours = val;
      return { ...curr, weeklyGoals: goals };
    });
  };

  // Week goal checkboxes
  container.querySelectorAll('.week-goal-cb').forEach(cb => {
    cb.onchange = (e) => {
      const type = e.target.getAttribute('data-type');
      const goalId = e.target.getAttribute('data-id');
      const isChecked = e.target.checked;

      updateState(curr => {
        const goals = { ...(curr.weeklyGoals || {}) };
        if (!goals[weekKey]) goals[weekKey] = { ...weeklyGoals };
        const keyMap = { prime: 'primeGoals', dsa: 'dsaGoals', individual: 'individualGoals', project: 'projectGoals' };
        const listKey = keyMap[type];
        if (listKey && goals[weekKey][listKey]) {
          goals[weekKey][listKey] = goals[weekKey][listKey].map(g => g.id === goalId ? { ...g, done: isChecked } : g);
        }
        return { ...curr, weeklyGoals: goals };
      });
    };
  });

  // Quick add per day
  container.querySelectorAll('.btn-quick-add-day').forEach(btn => {
    btn.onclick = () => {
      const d = btn.getAttribute('data-date');
      openAddTaskModal(d);
    };
  });
}

/**
 * Akshay's 12-Month AI/ML Career OS - Task Calendar View (Section 30)
 * Views: Day, Week, Month
 * Drag & Move / Reschedule / Overload Detection
 */
import { getState, updateState } from '../data/storage.js';
import { getIcon } from '../components/icons.js';
import { openRescheduleTaskModal } from '../components/modals.js';
import { checkDayOverload } from '../services/taskGenerator.js';

let activeCalendarView = 'week'; // 'day' | 'week' | 'month'

export function renderCalendar(container) {
  const state = getState();
  const activeDate = state.user?.activeDate || '2026-10-01';
  const tasks = state.dailyTasks || [];

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('calendar', 'text-cyan')} Daily & Weekly Task Calendar</h1>
        <div class="view-subtitle">
          Section 30 · Day / Week / Month Views · Drag & Drop Task Scheduling · Overload Protection
        </div>
      </div>
      <div class="view-actions" style="display: flex; gap: 8px;">
        <div class="btn-group">
          <button class="btn btn-sm ${activeCalendarView === 'day' ? 'btn-primary' : 'btn-secondary'} cal-view-btn" data-view="day">Day</button>
          <button class="btn btn-sm ${activeCalendarView === 'week' ? 'btn-primary' : 'btn-secondary'} cal-view-btn" data-view="week">Week</button>
          <button class="btn btn-sm ${activeCalendarView === 'month' ? 'btn-primary' : 'btn-secondary'} cal-view-btn" data-view="month">Month</button>
        </div>
      </div>
    </div>

    <!-- Calendar View Container -->
    <div id="calendar-content-root"></div>
  `;

  // Attach view switcher
  container.querySelectorAll('.cal-view-btn').forEach(btn => {
    btn.onclick = () => {
      activeCalendarView = btn.getAttribute('data-view');
      renderCalendar(container);
    };
  });

  const contentRoot = container.querySelector('#calendar-content-root');
  if (!contentRoot) return;

  if (activeCalendarView === 'day') {
    renderDayView(contentRoot, activeDate, tasks);
  } else if (activeCalendarView === 'week') {
    renderWeekView(contentRoot, activeDate, tasks);
  } else {
    renderMonthView(contentRoot, activeDate, tasks);
  }
}

// 1. Day View
function renderDayView(container, activeDate, tasks) {
  const dayTasks = tasks.filter(t => t.date === activeDate);
  const totalHours = dayTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Agenda for ${activeDate}</div>
          <div style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 2px;">
            ${dayTasks.length} tasks planned · ${totalHours}h estimated study
          </div>
        </div>
        <span class="badge ${totalHours > 4 ? 'badge-amber' : 'badge-emerald'}">${totalHours}h Planned</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${dayTasks.length === 0 ? `
          <div style="text-align: center; padding: var(--space-xl); color: var(--color-text-muted);">
            Your plan is clear for this day.
          </div>
        ` : dayTasks.map(t => renderTaskCard(t)).join('')}
      </div>
    </div>
  `;
  attachTaskCardEvents(container);
}

// 2. Week View (7 Days)
function renderWeekView(container, activeDate, tasks) {
  // Generate 7 days around activeDate (Monday -> Sunday)
  const d = new Date(activeDate);
  const dayNum = d.getDay();
  const diffToMon = dayNum === 0 ? -6 : 1 - dayNum;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMon);

  const days = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const dateStr = cur.toISOString().split('T')[0];
    const dayTasks = tasks.filter(t => t.date === dateStr);
    const hours = dayTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    days.push({
      dateStr,
      name: dayNames[i],
      tasks: dayTasks,
      hours,
      isToday: dateStr === activeDate
    });
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; align-items: start;">
      ${days.map(day => `
        <div class="card cal-day-drop-zone ${day.isToday ? 'border-primary' : ''}" data-date="${day.dateStr}" style="padding: 10px; min-height: 380px; background: ${day.isToday ? 'rgba(56, 189, 248, 0.04)' : 'var(--color-bg-surface)'};">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 8px; margin-bottom: 8px;">
            <div>
              <strong style="font-size: 0.9rem; color: ${day.isToday ? 'var(--color-primary)' : 'var(--color-text-main)'};">${day.name}</strong>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">${day.dateStr.slice(5)}</div>
            </div>
            <span class="badge ${day.hours > 4 ? 'badge-amber' : 'badge-slate'}" style="font-size: 0.7rem;">${day.hours}h</span>
          </div>

          <div class="tasks-drop-target" style="display: flex; flex-direction: column; gap: 8px; min-height: 300px;">
            ${day.tasks.length === 0 ? `
              <div style="font-size: 0.75rem; color: var(--color-text-muted); text-align: center; padding: 20px 0;">
                No tasks
              </div>
            ` : day.tasks.map(t => renderTaskCard(t, true)).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
  attachTaskCardEvents(container);
  attachDragAndDrop(container);
}

// 3. Month View (31 days grid)
function renderMonthView(container, activeDate, tasks) {
  const monthKey = activeDate.slice(0, 7) || '2026-10';
  const daysInMonth = 31;
  const monthDays = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const dayStr = i < 10 ? `0${i}` : `${i}`;
    const dateStr = `${monthKey}-${dayStr}`;
    const dayTasks = tasks.filter(t => t.date === dateStr);
    monthDays.push({
      day: i,
      dateStr,
      tasks: dayTasks,
      isToday: dateStr === activeDate
    });
  }

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Month View: ${monthKey}</div>
        <span class="badge badge-cyan">31 Days Planned</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
        ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(h => `
          <div style="text-align: center; font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); padding: 4px;">${h}</div>
        `).join('')}

        <!-- Offset dummy cells for Oct 2026 (Oct 1 2026 is Thursday -> 3 dummy cells) -->
        <div></div><div></div><div></div>

        ${monthDays.map(d => `
          <div class="cal-month-cell cal-day-drop-zone ${d.isToday ? 'border-primary' : ''}" data-date="${d.dateStr}" style="
            border: 1px solid var(--color-border);
            border-radius: var(--radius-sm);
            padding: 6px;
            min-height: 75px;
            background: ${d.isToday ? 'rgba(56, 189, 248, 0.08)' : 'var(--color-bg-base)'};
            cursor: pointer;
          ">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700;">
              <span style="color: ${d.isToday ? 'var(--color-primary)' : 'var(--color-text-main)'};">${d.day}</span>
              ${d.tasks.length > 0 ? `<span class="badge badge-emerald" style="font-size: 0.65rem; padding: 0 4px;">${d.tasks.length}</span>` : ''}
            </div>
            <div style="font-size: 0.68rem; color: var(--color-text-secondary); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${d.tasks.slice(0, 1).map(t => t.title).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  attachDragAndDrop(container);
}

// Render individual task card
function renderTaskCard(task, compact = false) {
  let badgeColor = 'badge-slate';
  if (task.priority === 'Critical') badgeColor = 'badge-rose';
  else if (task.priority === 'High') badgeColor = 'badge-amber';
  else if (task.priority === 'Normal') badgeColor = 'badge-cyan';

  let statusBadge = '';
  if (task.completed) statusBadge = '<span class="badge badge-emerald" style="font-size: 0.65rem;">Done</span>';
  else if (task.skipped) statusBadge = '<span class="badge badge-rose" style="font-size: 0.65rem;">Skipped</span>';

  return `
    <div class="cal-task-card" draggable="true" data-id="${task.id}" style="
      background: var(--color-bg-base);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      padding: 8px;
      cursor: grab;
      border-left: 3px solid ${task.completed ? 'var(--color-accent-emerald)' : 'var(--color-primary)'};
    ">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 4px; margin-bottom: 4px;">
        <span style="font-size: 0.78rem; font-weight: 700; color: ${task.completed ? 'var(--color-text-muted)' : 'var(--color-text-main)'}; ${task.completed ? 'text-decoration: line-through;' : ''}">
          ${task.title}
        </span>
        ${statusBadge}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; color: var(--color-text-muted);">
        <span class="badge ${badgeColor}" style="font-size: 0.65rem; padding: 1px 4px;">${task.section || 'General'}</span>
        <div style="display: flex; gap: 4px; align-items: center;">
          <span>${task.estimatedHours || 1}h</span>
          <button class="btn btn-ghost btn-sm btn-reschedule-task" data-id="${task.id}" style="padding: 2px 4px; font-size: 0.65rem;" title="Reschedule">📅</button>
        </div>
      </div>
    </div>
  `;
}

function attachTaskCardEvents(container) {
  container.querySelectorAll('.btn-reschedule-task').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const taskId = btn.getAttribute('data-id');
      openRescheduleTaskModal(taskId);
    };
  });
}

function attachDragAndDrop(container) {
  let draggedTaskId = null;

  container.querySelectorAll('.cal-task-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedTaskId = card.getAttribute('data-id');
      e.dataTransfer.setData('text/plain', draggedTaskId);
      card.style.opacity = '0.5';
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
    });
  });

  container.querySelectorAll('.cal-day-drop-zone').forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.style.background = 'rgba(56, 189, 248, 0.15)';
    });

    zone.addEventListener('dragleave', () => {
      zone.style.background = '';
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.style.background = '';
      const targetDate = zone.getAttribute('data-date');
      const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;

      if (!taskId || !targetDate) return;

      const state = getState();
      const task = (state.dailyTasks || []).find(t => t.id === taskId);
      if (!task) return;

      // Overload check
      const overload = checkDayOverload(targetDate, (task.durationMinutes || (task.estimatedHours || 1.0) * 60));
      if (overload.isOverloaded) {
        const proceed = confirm(`⚠️ Overload Alert: ${targetDate} already has ${overload.plannedHours}h planned.\nTarget for this day is ${overload.targetHours}h.\n\nDo you want to reschedule anyway?`);
        if (!proceed) return;
      }

      // Move task to target date
      updateState(curr => ({
        ...curr,
        dailyTasks: (curr.dailyTasks || []).map(t => t.id === taskId ? { ...t, date: targetDate, rescheduledFrom: t.date } : t)
      }));

      renderCalendar(container);
    });
  });
}

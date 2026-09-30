/**
 * Akshay's 12-Month AI/ML Career OS - Complete Phase 2 Roadmap View
 * 
 * Features:
 * - 12-Month Career Roadmap Header (Oct 1, 2026 → Sep 30, 2027)
 * - Distinct Track Separation: Track A (Prime 3.0) vs Track B (Individual CS)
 * - Navigation Tabs: [INDIVIDUAL ROADMAP] [PRIME 3.0] [CALENDAR / TIMELINE] [WHAT PRIME 3.0 COVERS] [WHAT I NEED TO LEARN INDIVIDUALLY]
 * - 12 Month Cards with real progress %, status (Current/Upcoming/Completed/Needs Attention), and [Open Month]
 * - Deep Month Detail modal and Topic Detail modal integrations
 * - Coverage maps for both tracks
 */

import { getState, updateState } from '../data/storage.js';
import { getIcon } from '../components/icons.js';
import {
  getEnrichedRoadmapMonths,
  getRoadmapAnalytics,
  getPrimeCoverageMap,
  getIndividualCoverageMap,
  getEnrichedPrimeModules,
  updateRoadmapTopic
} from '../services/roadmapEngine.js';
import {
  openMonthDetailModal,
  openTopicDetailModal,
  openPrimeTopicDetailModal
} from '../components/modals.js';
import { ROADMAP_PROJECT_PLACEHOLDERS } from '../services/projectEngine.js';

let activeRoadmapTab = 'individual'; // 'individual' | 'prime' | 'calendar' | 'prime-coverage' | 'ind-coverage'

export function renderRoadmap(container) {
  const state = getState();
  const months = getEnrichedRoadmapMonths(state);
  const analytics = getRoadmapAnalytics(state);
  const primeModules = getEnrichedPrimeModules(state);
  const primeCoverage = getPrimeCoverageMap(state);
  const indCoverage = getIndividualCoverageMap(state);

  container.innerHTML = `
    <!-- Top Career Roadmap Header Banner -->
    <div class="roadmap-top-banner">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--color-accent-emerald); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">
            PERSONAL AI/ML + SOFTWARE ENGINEERING + PLACEMENT OPERATING SYSTEM
          </div>
          <h1 style="font-size: 1.85rem; font-weight: 800; margin: 4px 0 2px; color: #FFFFFF;">
            12-MONTH CAREER ROADMAP
          </h1>
          <div style="font-size: 0.92rem; color: var(--color-text-secondary); display: flex; align-items: center; gap: 10px;">
            <span>October 1, 2026 → September 30, 2027</span>
            <span class="badge badge-primary">${months.length} Months</span>
            <span class="badge badge-slate">32h Study / Week</span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
          <span style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-family: var(--font-mono);">Current Active Date</span>
          <span class="badge badge-emerald" style="font-size: 0.85rem; font-family: var(--font-mono);">
            ${analytics.activeDate} (${analytics.currentMonth.month} ${analytics.currentMonth.year})
          </span>
        </div>
      </div>

      <!-- 3 Key Metric Cards -->
      <div class="roadmap-stats-row">
        <!-- Track B: Individual Roadmap -->
        <div class="stat-card" style="border-top: 3px solid var(--color-accent-emerald); background: var(--color-bg-base);">
          <div class="stat-header">
            <span>TRACK B: INDIVIDUAL ROADMAP</span>
            ${getIcon('roadmap', 'text-emerald')}
          </div>
          <div class="stat-value text-emerald">${analytics.individual.percentage}%</div>
          <div class="progress-bar-wrap" style="margin: 6px 0;">
            <div class="progress-bar-fill emerald" style="width: ${analytics.individual.percentage}%;"></div>
          </div>
          <div class="stat-subtext" style="display: flex; justify-content: space-between;">
            <span>${analytics.individual.completedTopics} / ${analytics.individual.totalTopics} topics completed</span>
            <span>${analytics.individual.remainingTopics} remaining</span>
          </div>
        </div>

        <!-- Track A: Prime 3.0 AI/ML Course -->
        <div class="stat-card" style="border-top: 3px solid var(--color-primary); background: var(--color-bg-base);">
          <div class="stat-header">
            <span>TRACK A: PRIME 3.0 AI/ML COURSE</span>
            ${getIcon('prime', 'text-primary')}
          </div>
          <div class="stat-value text-primary">${analytics.prime.percentage}%</div>
          <div class="progress-bar-wrap" style="margin: 6px 0;">
            <div class="progress-bar-fill" style="width: ${analytics.prime.percentage}%;"></div>
          </div>
          <div class="stat-subtext" style="display: flex; justify-content: space-between;">
            <span>${analytics.prime.completedTopics} / ${analytics.prime.totalTopics} topics completed</span>
            <span>${analytics.prime.learningTopics} learning</span>
          </div>
        </div>

        <!-- Combined Learning Progress -->
        <div class="stat-card" style="border-top: 3px solid var(--color-accent-cyan); background: var(--color-bg-base);">
          <div class="stat-header">
            <span>COMBINED PROGRESS</span>
            ${getIcon('analytics', 'text-cyan')}
          </div>
          <div class="stat-value text-cyan">${analytics.combinedPercentage}%</div>
          <div class="progress-bar-wrap" style="margin: 6px 0;">
            <div class="progress-bar-fill cyan" style="width: ${analytics.combinedPercentage}%;"></div>
          </div>
          <div class="stat-subtext">
            <span>Tracks tracked independently (No duplicate overlap)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="roadmap-tabs">
      <button class="roadmap-tab-btn ${activeRoadmapTab === 'individual' ? 'active' : ''}" data-tab="individual">
        ${getIcon('roadmap')} <span>INDIVIDUAL ROADMAP (12 MONTHS)</span>
      </button>
      <button class="roadmap-tab-btn ${activeRoadmapTab === 'prime' ? 'active' : ''}" data-tab="prime">
        ${getIcon('prime')} <span>PRIME 3.0 AI/ML (${analytics.prime.percentage}%)</span>
      </button>
      <button class="roadmap-tab-btn ${activeRoadmapTab === 'calendar' ? 'active' : ''}" data-tab="calendar">
        ${getIcon('calendar')} <span>CALENDAR / TIMELINE</span>
      </button>
      <button class="roadmap-tab-btn ${activeRoadmapTab === 'prime-coverage' ? 'active' : ''}" data-tab="prime-coverage">
        ${getIcon('checkCircle')} <span>WHAT PRIME 3.0 COVERS</span>
      </button>
      <button class="roadmap-tab-btn ${activeRoadmapTab === 'ind-coverage' ? 'active' : ''}" data-tab="ind-coverage">
        ${getIcon('goals')} <span>WHAT I NEED TO LEARN INDIVIDUALLY</span>
      </button>
    </div>

    <!-- TAB CONTENT AREA -->
    <div id="roadmap-tab-content">
      ${renderTabContent(activeRoadmapTab, { months, analytics, primeModules, primeCoverage, indCoverage })}
    </div>
  `;

  // Attach tab switcher listeners
  container.querySelectorAll('.roadmap-tab-btn').forEach(btn => {
    btn.onclick = () => {
      activeRoadmapTab = btn.getAttribute('data-tab');
      renderRoadmap(container);
    };
  });

  // Attach Month card events
  container.querySelectorAll('.btn-open-month').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const monthId = btn.getAttribute('data-month-id');
      openMonthDetailModal(monthId);
    };
  });

  container.querySelectorAll('.roadmap-month-card').forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('.roadmap-topic-cb') || e.target.closest('button')) return;
      const monthId = card.getAttribute('data-month-id');
      openMonthDetailModal(monthId);
    };
  });

  // Topic checkbox quick toggles inside month card
  container.querySelectorAll('.roadmap-topic-cb').forEach(cb => {
    cb.onchange = (e) => {
      e.stopPropagation();
      const topicId = e.target.getAttribute('data-topic-id');
      const isChecked = e.target.checked;
      updateRoadmapTopic(topicId, {
        status: isChecked ? 'Completed' : 'Not Started',
        progress: isChecked ? 100 : 0
      });
      renderRoadmap(container);
    };
  });

  // Calendar month buttons
  container.querySelectorAll('.calendar-month-item').forEach(el => {
    el.onclick = () => {
      const monthId = el.getAttribute('data-month-id');
      openMonthDetailModal(monthId);
    };
  });

  // Coverage map topic clicks
  container.querySelectorAll('.prime-coverage-topic-btn').forEach(btn => {
    btn.onclick = () => {
      const tid = btn.getAttribute('data-prime-topic-id');
      openPrimeTopicDetailModal(tid);
    };
  });

  container.querySelectorAll('.ind-coverage-topic-btn').forEach(btn => {
    btn.onclick = () => {
      const tid = btn.getAttribute('data-ind-topic-id');
      openTopicDetailModal(tid);
    };
  });
}

/**
 * Renders the active tab body
 */
function renderTabContent(tab, data) {
  const { months, primeModules, primeCoverage, indCoverage } = data;

  if (tab === 'individual') {
    return `
      <!-- 12-Month Cards Grid -->
      <div class="roadmap-timeline-grid">
        ${months.map(m => {
          let statusClass = 'badge-slate';
          if (m.status === 'Completed') statusClass = 'badge-emerald';
          else if (m.status === 'Current') statusClass = 'badge-primary';
          else if (m.status === 'Needs Attention') statusClass = 'badge-amber';
          else if (m.status === 'On Track') statusClass = 'badge-cyan';

          return `
            <div class="roadmap-month-card ${m.status === 'Current' ? 'current' : ''}" data-month-id="${m.id}" style="cursor: pointer;">
              <!-- Header -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <span style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--color-text-muted); text-transform: uppercase;">
                    MONTH ${m.order} OF 12
                  </span>
                  <h3 style="font-size: 1.18rem; font-weight: 700; margin-top: 2px;">
                    ${m.month.toUpperCase()} ${m.year}
                  </h3>
                </div>
                <span class="badge ${statusClass}">${m.status}</span>
              </div>

              <!-- Title & Date -->
              <div style="font-size: 0.9rem; font-weight: 600; color: var(--color-text-secondary); margin-top: 2px;">
                ${m.title}
              </div>
              <div style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--color-text-muted);">
                ${m.start_date} → ${m.end_date}
              </div>

              <!-- Progress Bar -->
              <div style="margin: 8px 0 4px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>${m.completedTopicsCount} / ${m.totalTopics} topics</span>
                  <span style="font-weight: 700; color: var(--color-accent-emerald);">${m.progress}%</span>
                </div>
                <div class="progress-bar-wrap">
                  <div class="progress-bar-fill emerald" style="width: ${m.progress}%;"></div>
                </div>
              </div>

              <!-- Topics List Preview -->
              <div class="roadmap-month-topics">
                ${m.topics.map(t => {
                  const isDone = t.status === 'Completed' || t.progress === 100;
                  const state = getState();
                  const projects = state.projects || [];
                  const isProjPlaceholder = t.category === 'Projects' || ROADMAP_PROJECT_PLACEHOLDERS.some(ph => ph.topicId === t.id);
                  const linkedProj = isProjPlaceholder ? projects.find(p => p.roadmap_topic_id === t.id || (p.name && t.name && p.name.toLowerCase().includes(t.name.toLowerCase()))) : null;

                  return `
                    <div class="topic-pill-row" style="background: ${isDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--color-bg-base)'};">
                      <label style="display: flex; align-items: center; gap: 8px; width: 100%; cursor: pointer;">
                        <input type="checkbox" class="custom-checkbox roadmap-topic-cb"
                          data-topic-id="${t.id}" ${isDone ? 'checked' : ''} />
                        <span style="font-size: 0.78rem; ${isDone ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">
                          ${t.name}
                        </span>
                        ${isProjPlaceholder ? (
                          linkedProj
                            ? `<span class="badge badge-purple" style="font-size: 0.65rem; margin-left: auto;">${linkedProj.status}</span>`
                            : `<span class="badge badge-slate" style="font-size: 0.65rem; margin-left: auto; color: var(--color-text-muted);">No Project Yet</span>`
                        ) : ''}
                      </label>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Footer with Target Hours & Open Button -->
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; pt: 8px; border-top: 1px solid var(--color-border-subtle);">
                <span style="font-size: 0.72rem; color: var(--color-text-muted);">
                  Target: ${m.target_hours || 135}h
                </span>
                <button class="btn btn-secondary btn-sm btn-open-month" data-month-id="${m.id}">
                  Open Month →
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  if (tab === 'prime') {
    return `
      <!-- Prime 3.0 Track Overview -->
      <div style="background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-lg); margin-bottom: var(--space-lg);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 700;">Track A: Prime 3.0 AI/ML Cohort Hierarchy</h2>
            <div style="font-size: 0.82rem; color: var(--color-text-muted);">
              Primary AI/ML Specialization · 16 Modules · 39 Topics
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.location.hash = '#prime';">
            Open Full Prime 3.0 View →
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${primeModules.map(mod => `
            <div class="module-accordion" style="margin: 0;">
              <div class="module-header" style="padding: 12px 16px;">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                  <span class="badge ${mod.progress === 100 ? 'badge-emerald' : (mod.progress > 0 ? 'badge-primary' : 'badge-slate')}">
                    ${mod.progress}%
                  </span>
                  <div>
                    <h4 style="font-size: 0.95rem; font-weight: 600;">${mod.name}</h4>
                    <span style="font-size: 0.75rem; color: var(--color-text-muted);">${mod.completedCount}/${mod.totalTopics} topics completed</span>
                  </div>
                </div>
                <span class="badge badge-slate">${mod.status}</span>
              </div>
              <div style="padding: 10px 16px; background: var(--color-bg-base); display: flex; flex-wrap: wrap; gap: 6px;">
                ${mod.topics.map(t => `
                  <button class="btn btn-ghost btn-sm prime-coverage-topic-btn" data-prime-topic-id="${t.id}" style="font-size: 0.78rem; background: var(--color-bg-surface); border: 1px solid var(--color-border);">
                    ${t.status === 'Completed' ? '✓ ' : ''}${t.name} (${t.progress}%)
                  </button>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (tab === 'calendar') {
    return `
      <!-- Calendar Bar -->
      <div style="margin-bottom: 12px;">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">12-Month Progression Timeline</h3>
        <p style="font-size: 0.8rem; color: var(--color-text-muted);">
          Click any month to inspect curriculum, scheduled milestones, and progress details.
        </p>
      </div>

      <div class="roadmap-calendar-bar">
        ${months.map(m => `
          <div class="calendar-month-item ${m.status.toLowerCase().replace(' ', '-')} ${m.status === 'Current' ? 'current' : ''}" data-month-id="${m.id}">
            <span style="font-size: 0.65rem; font-family: var(--font-mono); color: var(--color-text-muted);">
              M${m.order}
            </span>
            <strong style="font-size: 0.78rem; color: var(--color-text-main);">${m.month.substring(0, 3)}</strong>
            <span style="font-size: 0.65rem; font-family: var(--font-mono); color: var(--color-text-muted);">'${String(m.year).substring(2)}</span>
            <div style="width: 100%; height: 4px; background: var(--color-bg-surface-elevated); border-radius: 2px; margin-top: 4px; overflow: hidden;">
              <div style="width: ${m.progress}%; height: 100%; background: var(--color-accent-emerald);"></div>
            </div>
            <span style="font-size: 0.62rem; color: var(--color-text-muted); font-family: var(--font-mono);">${m.progress}%</span>
          </div>
        `).join('')}
      </div>

      <!-- Chronological Milestones Timeline -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${months.map(m => `
          <div style="display: flex; gap: 16px; background: var(--color-bg-surface); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--color-border); border-left: 4px solid ${m.status === 'Current' ? 'var(--color-primary)' : 'var(--color-border)'};">
            <div style="min-width: 120px;">
              <div style="font-weight: 700; font-size: 0.95rem;">${m.month} ${m.year}</div>
              <span class="badge ${m.status === 'Current' ? 'badge-primary' : (m.status === 'Completed' ? 'badge-emerald' : 'badge-slate')}" style="margin-top: 4px;">
                ${m.status}
              </span>
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 0.92rem; color: var(--color-text-main);">${m.title}</div>
              <p style="font-size: 0.8rem; color: var(--color-text-muted); margin: 4px 0 8px;">${m.description}</p>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${m.topics.slice(0, 6).map(t => `
                  <span class="badge badge-slate" style="font-size: 0.7rem;">${t.name}</span>
                `).join('')}
                ${m.topics.length > 6 ? `<span class="badge badge-slate" style="font-size: 0.7rem;">+${m.topics.length - 6} more</span>` : ''}
              </div>
            </div>
            <div style="display: flex; flex-direction: column; justify-content: center; align-items: flex-end; min-width: 100px;">
              <span style="font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; color: var(--color-accent-emerald);">${m.progress}%</span>
              <button class="btn btn-ghost btn-sm btn-open-month" data-month-id="${m.id}" style="margin-top: 4px;">Open →</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (tab === 'prime-coverage') {
    return `
      <!-- "WHAT PRIME 3.0 COVERS" (11 Categories) -->
      <div style="margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-cyan">Course Coverage Map</span>
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">Track A Specialization</span>
        </div>
        <h2 style="font-size: 1.35rem; font-weight: 800; margin: 4px 0;">WHAT PRIME 3.0 COVERS</h2>
        <p style="font-size: 0.82rem; color: var(--color-text-muted);">
          All 39 course topics mapped across 11 technical categories. Click any topic to review or update notes and status.
        </p>
      </div>

      <div class="coverage-grid">
        ${primeCoverage.map(cat => `
          <div class="coverage-card">
            <div class="coverage-header">
              <div>
                <h4 style="font-size: 1rem; font-weight: 700; color: var(--color-accent-cyan);">${cat.category}</h4>
                <span style="font-size: 0.75rem; color: var(--color-text-muted); font-family: var(--font-mono);">${cat.completed} / ${cat.total} topics</span>
              </div>
              <span class="badge ${cat.progress === 100 ? 'badge-emerald' : (cat.progress > 0 ? 'badge-primary' : 'badge-slate')}">
                ${cat.progress}%
              </span>
            </div>

            <div class="progress-bar-wrap" style="height: 4px;">
              <div class="progress-bar-fill cyan" style="width: ${cat.progress}%;"></div>
            </div>

            <div class="coverage-items-list">
              ${cat.topics.map(t => {
                const isDone = t.status === 'Completed' || t.progress === 100;
                return `
                  <div class="coverage-topic-item prime-coverage-topic-btn" data-prime-topic-id="${t.id}" style="cursor: pointer;">
                    <span style="font-weight: 500; ${isDone ? 'color: var(--color-accent-emerald);' : ''}">
                      ${isDone ? '✓ ' : ''}${t.name}
                    </span>
                    <span class="badge ${isDone ? 'badge-emerald' : (t.status === 'Learning' ? 'badge-primary' : 'badge-slate')}" style="font-size: 0.65rem;">
                      ${t.status}
                    </span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (tab === 'ind-coverage') {
    return `
      <!-- "WHAT I NEED TO LEARN INDIVIDUALLY" (14 Categories) -->
      <div style="margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-emerald">Independent Curriculum</span>
          <span style="font-size: 0.8rem; color: var(--color-text-muted);">Track B Preparation</span>
        </div>
        <h2 style="font-size: 1.35rem; font-weight: 800; margin: 4px 0;">WHAT I NEED TO LEARN INDIVIDUALLY</h2>
        <p style="font-size: 0.82rem; color: var(--color-text-muted);">
          All 14 technical domains covered independently across the 12-month timeline outside Prime 3.0.
        </p>
      </div>

      <div class="coverage-grid">
        ${indCoverage.map(cat => `
          <div class="coverage-card">
            <div class="coverage-header">
              <div>
                <h4 style="font-size: 1rem; font-weight: 700; color: var(--color-accent-emerald);">${cat.category}</h4>
                <span style="font-size: 0.75rem; color: var(--color-text-muted); font-family: var(--font-mono);">${cat.completed} / ${cat.total} topics</span>
              </div>
              <span class="badge ${cat.progress === 100 ? 'badge-emerald' : (cat.progress > 0 ? 'badge-primary' : 'badge-slate')}">
                ${cat.progress}%
              </span>
            </div>

            <div class="progress-bar-wrap" style="height: 4px;">
              <div class="progress-bar-fill emerald" style="width: ${cat.progress}%;"></div>
            </div>

            <div class="coverage-items-list">
              ${cat.topics.map(t => {
                const isDone = t.status === 'Completed' || t.progress === 100;
                return `
                  <div class="coverage-topic-item ind-coverage-topic-btn" data-ind-topic-id="${t.id}" style="cursor: pointer;">
                    <div>
                      <span style="font-weight: 500; ${isDone ? 'color: var(--color-accent-emerald);' : ''}">
                        ${isDone ? '✓ ' : ''}${t.name}
                      </span>
                      <div style="font-size: 0.68rem; color: var(--color-text-muted);">${t.monthName}</div>
                    </div>
                    <span class="badge ${isDone ? 'badge-emerald' : (t.status === 'Learning' ? 'badge-primary' : 'badge-slate')}" style="font-size: 0.65rem;">
                      ${t.status}
                    </span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  return '';
}

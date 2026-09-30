/**
 * Akshay's 12-Month AI/ML Career OS - Prime 3.0 View (Track A)
 * 
 * Hierarchy:
 * Prime 3.0 -> Module -> Topic -> Lesson/Task + Progress -> Module Progress -> Overall Course Progress
 * 
 * Shows:
 * - Overall course progress %
 * - Modules completed
 * - Topics completed
 * - Topics currently learning
 * - Upcoming topics
 * - Expandable/collapsible modules
 */

import { getState } from '../data/storage.js';
import { getIcon } from '../components/icons.js';
import {
  getEnrichedPrimeModules,
  getRoadmapAnalytics,
  updatePrimeTopic
} from '../services/roadmapEngine.js';
import { openPrimeTopicDetailModal } from '../components/modals.js';

let expandedModules = new Set(['pmod-1', 'pmod-2']);

export function renderPrime(container) {
  const state = getState();
  const analytics = getRoadmapAnalytics(state);
  const primeModules = getEnrichedPrimeModules(state);

  const modulesCompleted = primeModules.filter(m => m.status === 'Completed' || m.progress === 100).length;

  container.innerHTML = `
    <!-- Top Header -->
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('prime', 'text-primary')} Track A: Prime 3.0 AI/ML</h1>
        <div class="view-subtitle">
          Dedicated Course Hierarchy: 16 Modules · 39 Topics · Complete ML/DL/GenAI Specialization
        </div>
      </div>
      <div class="view-actions">
        <button class="btn btn-secondary btn-sm" id="btn-expand-all">Expand All</button>
        <button class="btn btn-secondary btn-sm" id="btn-collapse-all">Collapse All</button>
        <button class="btn btn-primary btn-sm" onclick="window.location.hash = '#roadmap';">
          ${getIcon('roadmap')} <span>View Full Roadmap</span>
        </button>
      </div>
    </div>

    <!-- Prime 3.0 Course Hierarchy Stats -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl);">
      <div class="stat-card" style="border-top: 3px solid var(--color-primary);">
        <div class="stat-header">OVERALL COURSE PROGRESS</div>
        <div class="stat-value text-primary">${analytics.prime.percentage}%</div>
        <div class="progress-bar-wrap" style="margin-top: 6px;">
          <div class="progress-bar-fill" style="width: ${analytics.prime.percentage}%;"></div>
        </div>
      </div>

      <div class="stat-card" style="border-top: 3px solid var(--color-accent-cyan);">
        <div class="stat-header">MODULES COMPLETED</div>
        <div class="stat-value text-cyan">${modulesCompleted} / ${primeModules.length}</div>
        <div class="stat-subtext">All topics in module 100%</div>
      </div>

      <div class="stat-card" style="border-top: 3px solid var(--color-accent-emerald);">
        <div class="stat-header">TOPICS COMPLETED</div>
        <div class="stat-value text-emerald">${analytics.prime.completedTopics} / ${analytics.prime.totalTopics}</div>
        <div class="stat-subtext">Mastered topics</div>
      </div>

      <div class="stat-card" style="border-top: 3px solid var(--color-accent-amber);">
        <div class="stat-header">TOPICS LEARNING</div>
        <div class="stat-value text-amber">${analytics.prime.learningTopics}</div>
        <div class="stat-subtext">Currently in active study</div>
      </div>

      <div class="stat-card" style="border-top: 3px solid var(--color-text-muted);">
        <div class="stat-header">UPCOMING TOPICS</div>
        <div class="stat-value" style="color: var(--color-text-secondary);">${analytics.prime.upcomingTopics}</div>
        <div class="stat-subtext">Scheduled cohorts</div>
      </div>
    </div>

    <!-- Modules Accordion List -->
    <div style="display: flex; flex-direction: column; gap: 12px;" id="prime-modules-list">
      ${primeModules.map(mod => {
        const isExpanded = expandedModules.has(mod.id);
        const modDone = mod.status === 'Completed' || mod.progress === 100;

        return `
          <div class="module-accordion" data-module-id="${mod.id}" style="border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-bg-surface); overflow: hidden;">
            <div class="module-header" data-mod-id="${mod.id}" style="padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; background: var(--color-bg-surface);">
              <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <span class="badge ${modDone ? 'badge-emerald' : (mod.progress > 0 ? 'badge-primary' : 'badge-slate')}" style="min-width: 50px; text-align: center;">
                  ${mod.progress}%
                </span>
                <div>
                  <h3 style="font-size: 1rem; font-weight: 700; margin: 0; color: var(--color-text-main);">
                    ${mod.name}
                  </h3>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                    ${mod.completedCount} of ${mod.totalTopics} topics completed · Status: ${mod.status}
                  </div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="badge ${modDone ? 'badge-emerald' : (mod.progress > 0 ? 'badge-cyan' : 'badge-slate')}">
                  ${mod.status}
                </span>
                <span style="font-size: 1.1rem; color: var(--color-text-muted); transition: transform 0.2s; transform: ${isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};">
                  ▼
                </span>
              </div>
            </div>

            <!-- Module Progress Bar -->
            <div class="progress-bar-wrap" style="height: 3px; border-radius: 0;">
              <div class="progress-bar-fill ${modDone ? 'emerald' : ''}" style="width: ${mod.progress}%;"></div>
            </div>

            <!-- Collapsible Topics Content -->
            <div class="module-topics-panel" id="panel-${mod.id}" style="display: ${isExpanded ? 'block' : 'none'}; padding: 12px 18px; background: var(--color-bg-base); border-top: 1px solid var(--color-border-subtle);">
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${mod.topics.map(t => {
                  const isDone = t.status === 'Completed' || t.progress === 100;
                  let tBadge = 'badge-slate';
                  if (t.status === 'Completed') tBadge = 'badge-emerald';
                  else if (t.status === 'Learning') tBadge = 'badge-primary';
                  else if (t.status === 'Practicing') tBadge = 'badge-cyan';

                  return `
                    <div class="topic-interactive-row ${isDone ? 'completed' : ''}" data-prime-topic-id="${t.id}" style="padding: 10px 14px; background: var(--color-bg-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                      <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                        <input type="checkbox" class="custom-checkbox prime-topic-cb" data-topic-id="${t.id}" ${isDone ? 'checked' : ''} />
                        <div style="flex: 1;">
                          <div style="font-size: 0.88rem; font-weight: 600; ${isDone ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">
                            ${t.name}
                          </div>
                          <div style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: var(--color-text-muted); margin-top: 2px;">
                            <span class="badge badge-slate" style="font-size: 0.65rem;">${t.category}</span>
                            <span>Target: ${t.target_date || 'Target Cohort'}</span>
                            ${t.notes ? `<span>· Notes available</span>` : ''}
                          </div>
                        </div>
                      </div>

                      <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 50px; text-align: right; font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--color-primary);">
                          ${t.progress}%
                        </div>
                        <span class="badge ${tBadge}" style="min-width: 80px; text-align: center;">${t.status}</span>
                        <button class="btn btn-ghost btn-sm btn-edit-prime-topic" data-prime-topic-id="${t.id}">Edit</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Expand / collapse header toggle
  container.querySelectorAll('.module-header').forEach(hdr => {
    hdr.onclick = () => {
      const modId = hdr.getAttribute('data-mod-id');
      if (expandedModules.has(modId)) {
        expandedModules.delete(modId);
      } else {
        expandedModules.add(modId);
      }
      renderPrime(container);
    };
  });

  // Expand all / Collapse all
  document.getElementById('btn-expand-all').onclick = () => {
    primeModules.forEach(m => expandedModules.add(m.id));
    renderPrime(container);
  };

  document.getElementById('btn-collapse-all').onclick = () => {
    expandedModules.clear();
    renderPrime(container);
  };

  // Quick checkbox on prime topic
  container.querySelectorAll('.prime-topic-cb').forEach(cb => {
    cb.onchange = (e) => {
      e.stopPropagation();
      const topicId = cb.getAttribute('data-topic-id');
      const isChecked = cb.checked;
      updatePrimeTopic(topicId, {
        status: isChecked ? 'Completed' : 'Not Started',
        progress: isChecked ? 100 : 0
      });
      renderPrime(container);
    };
  });

  // Edit / open topic modal
  container.querySelectorAll('.btn-edit-prime-topic').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const topicId = btn.getAttribute('data-prime-topic-id');
      openPrimeTopicDetailModal(topicId);
    };
  });

  container.querySelectorAll('.topic-interactive-row').forEach(row => {
    row.onclick = (e) => {
      if (e.target.closest('.prime-topic-cb') || e.target.closest('button')) return;
      const topicId = row.getAttribute('data-prime-topic-id');
      openPrimeTopicDetailModal(topicId);
    };
  });
}

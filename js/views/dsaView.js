/**
 * Akshay's 12-Month AI/ML Career OS - DSA Tracker
 */
import { getState, updateState } from '../data/storage.js';
import { DSA_TOPICS, DSA_PLATFORMS } from '../data/curriculum.js';
import { calculateComprehensiveAnalytics } from '../services/analyticsService.js';
import { getIcon } from '../components/icons.js';
import { openAddDsaModal } from '../components/modals.js';

let selectedTopicFilter = 'All';
let selectedDiffFilter = 'All';
let searchQuery = '';

export function renderDsa(container) {
  const state = getState();
  const analytics = calculateComprehensiveAnalytics(state);
  const allProblems = state.dsaProblems || [];

  // Filter problems
  const filteredProblems = allProblems.filter(p => {
    const matchTopic = selectedTopicFilter === 'All' || p.topic === selectedTopicFilter;
    const matchDiff = selectedDiffFilter === 'All' || p.difficulty === selectedDiffFilter;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.approach && p.approach.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchTopic && matchDiff && matchSearch;
  });

  // Calculate solved in active month
  const activeDate = state.user?.activeDate || '2026-10-01';
  const activeMonthKey = activeDate.substring(0, 7);
  const solvedThisMonth = allProblems.filter(p => p.status === 'Solved' && p.date && p.date.startsWith(activeMonthKey)).length;

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('dsa', 'text-cyan')} Dedicated DSA Tracker</h1>
        <div class="view-subtitle">
          Algorithmic Pattern Mastery: LeetCode, Codeforces, GFG & Technical Interview Preparation
        </div>
      </div>
      <div class="view-actions">
        <button class="btn btn-primary" id="btn-add-dsa-record">${getIcon('plus')} Record Problem</button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-lg);">
      <div class="stat-card">
        <div class="stat-header">TOTAL SOLVED</div>
        <div class="stat-value text-cyan">${analytics.dsa.totalSolved}</div>
        <div class="stat-subtext">All platforms combined</div>
      </div>
      <div class="stat-card">
        <div class="stat-header">THIS MONTH (${activeMonthKey})</div>
        <div class="stat-value text-emerald">${solvedThisMonth}</div>
        <div class="stat-subtext">Target: 35-50 problems</div>
      </div>
      <div class="stat-card">
        <div class="stat-header">DSA STREAK</div>
        <div class="stat-value text-amber">${analytics.streaks.dsaStreak} days</div>
        <div class="stat-subtext">Consecutive daily solving</div>
      </div>
      <div class="stat-card">
        <div class="stat-header">DIFFICULTY SPLIT</div>
        <div style="display: flex; gap: 6px; margin-top: 6px;">
          <span class="badge badge-emerald">${analytics.dsa.easy} Easy</span>
          <span class="badge badge-amber">${analytics.dsa.medium} Med</span>
          <span class="badge badge-rose">${analytics.dsa.hard} Hard</span>
        </div>
      </div>
    </div>

    <!-- Topic Progress Summary -->
    <div class="card" style="margin-bottom: var(--space-lg);">
      <div class="card-header">
        <div class="card-title">Topic-Wise Mastery</div>
        <span style="font-size: 0.75rem; color: var(--color-text-muted);">Problems solved per core data structure</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px;">
        ${DSA_TOPICS.slice(0, 12).map(t => {
          const count = analytics.dsa.byTopic[t] || 0;
          return `
            <div style="background: var(--color-bg-base); padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.8rem; font-weight: 500;">${t}</span>
              <span class="badge ${count > 0 ? 'badge-cyan' : 'badge-slate'}">${count}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="dsa-filter-bar">
      <div style="flex: 1; min-width: 220px; position: relative;">
        <input type="text" class="form-input" id="dsa-search-input" value="${searchQuery}" placeholder="Search problems, patterns, mistakes..." style="padding-left: 36px;" />
        <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted);">
          ${getIcon('search')}
        </span>
      </div>

      <select class="form-select" id="dsa-topic-filter" style="width: auto;">
        <option value="All" ${selectedTopicFilter === 'All' ? 'selected' : ''}>All Topics</option>
        ${DSA_TOPICS.map(t => `<option value="${t}" ${selectedTopicFilter === t ? 'selected' : ''}>${t}</option>`).join('')}
      </select>

      <select class="form-select" id="dsa-diff-filter" style="width: auto;">
        <option value="All" ${selectedDiffFilter === 'All' ? 'selected' : ''}>All Difficulties</option>
        <option value="Easy" ${selectedDiffFilter === 'Easy' ? 'selected' : ''}>Easy</option>
        <option value="Medium" ${selectedDiffFilter === 'Medium' ? 'selected' : ''}>Medium</option>
        <option value="Hard" ${selectedDiffFilter === 'Hard' ? 'selected' : ''}>Hard</option>
      </select>
    </div>

    <!-- Problem Table -->
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Problem Name</th>
            <th>Topic</th>
            <th>Difficulty</th>
            <th>Platform</th>
            <th>Time</th>
            <th>Approach & Notes</th>
            <th>Mistake Category</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filteredProblems.length === 0 ? `
            <tr>
              <td colspan="9" style="text-align: center; padding: var(--space-xl); color: var(--color-text-muted);">
                No DSA problems match your filters. Click "Record Problem" to add one!
              </td>
            </tr>
          ` : filteredProblems.map(p => {
            let diffBadge = 'badge-emerald';
            if (p.difficulty === 'Medium') diffBadge = 'badge-amber';
            if (p.difficulty === 'Hard') diffBadge = 'badge-rose';

            return `
              <tr>
                <td>
                  <div style="font-weight: 600;">
                    ${p.link ? `
                      <a href="${p.link}" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 4px;">
                        ${p.name} ${getIcon('externalLink')}
                      </a>
                    ` : p.name}
                  </div>
                  ${p.revisionRequired ? `<span class="badge badge-rose" style="margin-top: 4px; font-size: 0.65rem;">Needs Revision</span>` : ''}
                </td>
                <td><span class="badge badge-slate">${p.topic}</span></td>
                <td><span class="badge ${diffBadge}">${p.difficulty}</span></td>
                <td><span style="font-family: var(--font-mono); font-size: 0.8rem;">${p.platform}</span></td>
                <td><span style="font-family: var(--font-mono); font-size: 0.8rem;">${p.timeTakenMinutes || 0}m</span></td>
                <td style="max-width: 250px;">
                  <div style="font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${p.approach || ''}">
                    ${p.approach || 'No approach notes'}
                  </div>
                </td>
                <td>
                  <span class="badge ${p.mistakeCategory && p.mistakeCategory !== 'None' ? 'badge-amber' : 'badge-slate'}">
                    ${p.mistakeCategory || 'None'}
                  </span>
                </td>
                <td><span style="font-family: var(--font-mono); font-size: 0.78rem;">${p.date || '-'}</span></td>
                <td>
                  <button class="btn btn-ghost btn-icon btn-delete-dsa" data-prob-id="${p.id}" title="Delete record">${ICONS.trash}</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Handlers
  document.getElementById('btn-add-dsa-record').onclick = openAddDsaModal;

  const searchInput = document.getElementById('dsa-search-input');
  searchInput.oninput = (e) => {
    searchQuery = e.target.value;
    renderDsa(container);
  };

  const topicFilter = document.getElementById('dsa-topic-filter');
  topicFilter.onchange = (e) => {
    selectedTopicFilter = e.target.value;
    renderDsa(container);
  };

  const diffFilter = document.getElementById('dsa-diff-filter');
  diffFilter.onchange = (e) => {
    selectedDiffFilter = e.target.value;
    renderDsa(container);
  };

  container.querySelectorAll('.btn-delete-dsa').forEach(btn => {
    btn.onclick = () => {
      const probId = btn.getAttribute('data-prob-id');
      if (confirm('Delete this DSA record?')) {
        updateState(curr => ({
          ...curr,
          dsaProblems: (curr.dsaProblems || []).filter(p => p.id !== probId)
        }));
      }
    };
  });
}

/**
 * Akshay's 12-Month AI/ML Career OS - Dedicated DSA & Problem-Solving Engine (Phase 5)
 * 
 * Complete implementation connecting:
 * ROADMAP -> MONTHLY PLAN -> WEEKLY GOALS -> DAILY TASKS -> DSA PRACTICE -> PROGRESS -> REVISION
 */

import { getState } from '../data/storage.js';
import { getIcon, ICONS } from '../components/icons.js';
import {
  DSA_TAXONOMY,
  ALL_DSA_TOPICS,
  DSA_PATTERNS,
  MISTAKE_CATEGORIES,
  calculateDsaAnalytics,
  getTodayDsaProgress,
  getDsaCalendarActivity,
  toggleDsaBookmark,
  deleteDsaProblem
} from '../services/dsaEngine.js';
import {
  openAddDsaProblemModal,
  openSolveDsaProblemModal,
  openProblemDetailModal,
  openStartDsaSessionModal,
  openDsaCsvModal,
  openSetDsaTargetModal
} from '../components/modals.js';

let activeTab = 'problems'; // 'problems' | 'roadmap' | 'patterns' | 'revision' | 'mistakes' | 'sessions'
let searchQuery = '';
let statusFilter = 'All'; // 'All' | 'Not Attempted' | 'Attempted' | 'Solved' | 'Needs Revision'
let difficultyFilter = 'All'; // 'All' | 'Easy' | 'Medium' | 'Hard'
let topicFilter = 'All';
let bookmarkOnlyFilter = false;
let sortBy = 'newest'; // 'newest' | 'oldest' | 'difficulty' | 'topic' | 'time' | 'revision' | 'attempts'
let currentPage = 1;
const PAGE_SIZE = 12;

export function renderDsa(container) {
  const state = getState();
  const analytics = calculateDsaAnalytics(state);
  const todayProgress = getTodayDsaProgress(state);
  const calendarActivity = getDsaCalendarActivity(state);
  const allProblems = analytics.problems;

  // Filter & Search
  let filtered = allProblems.filter(p => {
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (p.title || p.name || '').toLowerCase().includes(q);
      const platMatch = (p.platform || '').toLowerCase().includes(q);
      const topicMatch = (p.topic || '').toLowerCase().includes(q);
      const subMatch = (p.subtopic || '').toLowerCase().includes(q);
      const appMatch = (p.approach || '').toLowerCase().includes(q);
      const patMatch = (p.patterns || []).some(pat => pat.toLowerCase().includes(q));
      if (!titleMatch && !platMatch && !topicMatch && !subMatch && !appMatch && !patMatch) return false;
    }

    // Status Filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Solved' && p.status !== 'Solved' && !p.solved) return false;
      if (statusFilter === 'Attempted' && p.status !== 'Attempted') return false;
      if (statusFilter === 'Not Attempted' && p.status !== 'Not Attempted' && (p.attempt_count || 0) > 0) return false;
      if (statusFilter === 'Needs Revision' && !p.needs_revision && !p.revisionRequired && p.status !== 'Needs Revision') return false;
    }

    // Difficulty Filter
    if (difficultyFilter !== 'All' && p.difficulty !== difficultyFilter) return false;

    // Topic Filter
    if (topicFilter !== 'All' && p.topic !== topicFilter) return false;

    // Bookmark Filter
    if (bookmarkOnlyFilter && !p.is_bookmarked) return false;

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0);
    }
    if (sortBy === 'oldest') {
      return new Date(a.created_at || a.date || 0) - new Date(b.created_at || b.date || 0);
    }
    if (sortBy === 'difficulty') {
      const rank = { Easy: 1, Medium: 2, Hard: 3 };
      return (rank[b.difficulty] || 2) - (rank[a.difficulty] || 2);
    }
    if (sortBy === 'topic') {
      return (a.topic || '').localeCompare(b.topic || '');
    }
    if (sortBy === 'time') {
      return (b.time_taken || b.timeTakenMinutes || 0) - (a.time_taken || a.timeTakenMinutes || 0);
    }
    if (sortBy === 'attempts') {
      return (b.attempt_count || 0) - (a.attempt_count || 0);
    }
    if (sortBy === 'revision') {
      if (!a.next_revision_date) return 1;
      if (!b.next_revision_date) return -1;
      return new Date(a.next_revision_date) - new Date(b.next_revision_date);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const pagedProblems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  container.innerHTML = `
    <!-- SECTION 1: DSA HEADER & PROGRESS STATS -->
    <div class="view-header" style="margin-bottom: var(--space-md);">
      <div class="view-title-wrap">
        <h1 class="view-title" style="display: flex; align-items: center; gap: 10px;">
          ${getIcon('dsa', 'text-cyan')} <span>DSA & Problem-Solving Engine</span>
        </h1>
        <div class="view-subtitle">
          Structured algorithmic mastery, pattern retention, mistake tracking and revision intervals
        </div>
      </div>

      <!-- SECTION 44: QUICK ACTIONS -->
      <div class="view-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-primary" id="btn-top-add-problem">
          ${getIcon('plus')} + Add Problem
        </button>
        <button class="btn btn-secondary" id="btn-top-start-session">
          ${getIcon('clock')} Start Session
        </button>
        <button class="btn btn-secondary" id="btn-top-csv">
          ${getIcon('fileText')} CSV Tools
        </button>
      </div>
    </div>

    <!-- SECTION 1: TOP PROGRESS CARDS -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: var(--space-sm); margin-bottom: var(--space-lg);">
      <div class="stat-card" style="border-top: 3px solid var(--color-accent-emerald);">
        <div class="stat-header">PROBLEMS SOLVED</div>
        <div class="stat-value text-emerald">${analytics.solved}</div>
        <div class="stat-subtext">Independent Rate: <strong>${analytics.independentSolveRate}%</strong></div>
      </div>

      <div class="stat-card" style="border-top: 3px solid var(--color-accent-cyan);">
        <div class="stat-header">PROBLEMS ATTEMPTED</div>
        <div class="stat-value text-cyan">${analytics.attempted}</div>
        <div class="stat-subtext">Catalog Total: ${analytics.total}</div>
      </div>

      <div class="stat-card" style="border-top: 3px solid var(--color-primary);">
        <div class="stat-header">THIS WEEK</div>
        <div class="stat-value text-primary font-mono">${analytics.thisWeek.solved} / ${analytics.thisWeek.target}</div>
        <div class="stat-subtext">Phase 4 Weekly Target</div>
      </div>

      <div class="stat-card" style="border-top: 3px solid var(--color-accent-purple);">
        <div class="stat-header">THIS MONTH</div>
        <div class="stat-value text-purple font-mono">${analytics.thisMonth.solved} / ${analytics.thisMonth.target}</div>
        <div class="stat-subtext">Phase 4 Monthly Target</div>
      </div>

      <div class="stat-card" style="border-top: 3px solid var(--color-accent-amber);">
        <div class="stat-header">CURRENT STREAK</div>
        <div class="stat-value text-amber">${analytics.streak.current} days 🔥</div>
        <div class="stat-subtext">Longest: <strong>${analytics.streak.longest} days</strong></div>
      </div>

      <div class="stat-card" style="border-top: 3px solid var(--color-accent-rose);">
        <div class="stat-header">REVISION QUEUE</div>
        <div class="stat-value text-rose">${analytics.needsRevision}</div>
        <div class="stat-subtext">${analytics.revisionQueue.filter(r => r.isDue).length} due today</div>
      </div>
    </div>

    <!-- DESKTOP 2-COLUMN & MOBILE LAYOUT (SECTION 42 & 43) -->
    <div style="display: grid; grid-template-columns: 1fr; gap: var(--space-lg);" class="dsa-layout-grid">
      <div style="display: flex; flex-direction: column; gap: var(--space-md);">
        
        <!-- SECTION 8 & TABS NAVIGATION -->
        <div class="nav-tabs" style="display: flex; gap: 6px; overflow-x: auto; border-bottom: 1px solid var(--color-border); padding-bottom: 6px;">
          <button class="nav-tab ${activeTab === 'problems' ? 'active' : ''}" data-tab="problems" style="display: flex; align-items: center; gap: 6px;">
            ${getIcon('dsa')} Problems Catalog (${allProblems.length})
          </button>
          <button class="nav-tab ${activeTab === 'roadmap' ? 'active' : ''}" data-tab="roadmap" style="display: flex; align-items: center; gap: 6px;">
            ${getIcon('roadmap')} DSA Roadmap & Topics
          </button>
          <button class="nav-tab ${activeTab === 'patterns' ? 'active' : ''}" data-tab="patterns" style="display: flex; align-items: center; gap: 6px;">
            ${getIcon('code')} Pattern Mastery
          </button>
          <button class="nav-tab ${activeTab === 'revision' ? 'active' : ''}" data-tab="revision" style="display: flex; align-items: center; gap: 6px;">
            ${getIcon('revision')} Revision Queue (${analytics.needsRevision})
          </button>
          <button class="nav-tab ${activeTab === 'mistakes' ? 'active' : ''}" data-tab="mistakes" style="display: flex; align-items: center; gap: 6px;">
            ${getIcon('alert')} Mistake Log (${analytics.mistakeLog.length})
          </button>
          <button class="nav-tab ${activeTab === 'sessions' ? 'active' : ''}" data-tab="sessions" style="display: flex; align-items: center; gap: 6px;">
            ${getIcon('clock')} Sessions & Calendar
          </button>
        </div>

        <!-- TAB CONTENT AREA -->
        <div id="dsa-tab-content">
          ${renderActiveTabContent({
            activeTab,
            analytics,
            filtered,
            pagedProblems,
            totalPages,
            calendarActivity,
            todayProgress,
            state
          })}
        </div>
      </div>

      <!-- RIGHT PANEL (DESKTOP) / BOTTOM STACK (MOBILE) (SECTION 43 & 42) -->
      <div class="dsa-right-panel" style="display: flex; flex-direction: column; gap: var(--space-md);">
        
        <!-- TODAY'S DSA TARGET CARD (SECTION 7 & 32) -->
        <div class="card" style="border-top: 3px solid var(--color-accent-cyan);">
          <div class="card-header" style="padding-bottom: 6px;">
            <div class="card-title" style="font-size: 0.95rem;">
              ${getIcon('today', 'text-cyan')} <span>DSA TARGET TODAY</span>
            </div>
            <button class="btn btn-ghost btn-sm" id="btn-change-dsa-target" style="font-size: 0.75rem;">
              Change Target
            </button>
          </div>

          <div style="background: var(--color-bg-base); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); text-align: center; margin-bottom: 8px;">
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase;">
              TODAY'S TARGET SOLVED
            </div>
            <div style="font-size: 2rem; font-weight: 800; font-family: var(--font-mono); color: ${todayProgress.remaining === 0 ? 'var(--color-accent-emerald)' : 'var(--color-primary)'};">
              ${todayProgress.solved} / ${todayProgress.target}
            </div>
            <div style="font-size: 0.78rem; color: var(--color-text-secondary); margin-top: 2px;">
              ${todayProgress.remaining === 0 ? '🎉 Daily DSA goal achieved!' : `${todayProgress.remaining} problem${todayProgress.remaining > 1 ? 's' : ''} left for today`}
            </div>
          </div>

          <button class="btn btn-primary btn-sm" id="btn-quick-solve-today" style="width: 100%;">
            + Add / Solve DSA Today
          </button>
        </div>

        <!-- WEAK TOPICS ("NEEDS MORE PRACTICE") (SECTION 25) -->
        <div class="card" style="border-top: 3px solid var(--color-accent-amber);">
          <div class="card-header" style="padding-bottom: 6px;">
            <div class="card-title" style="font-size: 0.92rem; color: var(--color-accent-amber);">
              ${getIcon('alert', 'text-amber')} <span>NEEDS MORE PRACTICE</span>
            </div>
          </div>
          <div>
            ${analytics.weakTopics.length === 0 ? `
              <div style="font-size: 0.8rem; color: var(--color-text-muted); padding: 6px 0; text-align: center;">
                No weak topics flagged. Maintain consistent practice!
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${analytics.weakTopics.map(w => `
                  <div style="background: var(--color-bg-base); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); font-size: 0.8rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong>${w.name}</strong>
                      <span class="badge badge-amber" style="font-size: 0.65rem;">Practice Alert</span>
                    </div>
                    <div style="color: var(--color-text-secondary); font-size: 0.74rem; margin-top: 2px;">
                      ${w.reason} (${w.solved}/${w.attempted} solved)
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- DUE REVISION QUEUE SNIPPET (SECTION 21) -->
        <div class="card" style="border-top: 3px solid var(--color-accent-rose);">
          <div class="card-header" style="padding-bottom: 6px;">
            <div class="card-title" style="font-size: 0.92rem; color: var(--color-accent-rose);">
              ${getIcon('revision', 'text-rose')} <span>DUE FOR REVISION</span>
            </div>
            <button class="btn btn-ghost btn-sm" id="btn-view-all-revision" style="font-size: 0.75rem;">
              View Queue (${analytics.needsRevision})
            </button>
          </div>

          <div>
            ${analytics.revisionQueue.length === 0 ? `
              <div style="font-size: 0.8rem; color: var(--color-text-muted); text-align: center; padding: 12px 0;">
                No problems in revision queue. Everything clear!
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${analytics.revisionQueue.slice(0, 3).map(r => `
                  <div style="background: var(--color-bg-base); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-weight: 600;">${r.title}</div>
                      <div style="font-size: 0.72rem; color: var(--color-text-muted);">${r.topic} · Due: ${r.nextRevisionDate}</div>
                    </div>
                    <button class="btn btn-secondary btn-sm btn-reattempt-quick" data-prob-id="${r.id}" style="font-size: 0.72rem; padding: 4px 8px;">
                      Reattempt
                    </button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

      </div>
    </div>
  `;

  // Attach Layout Styles if needed
  attachResponsiveStyles();

  // Tab switcher
  container.querySelectorAll('.nav-tab').forEach(tabBtn => {
    tabBtn.onclick = () => {
      activeTab = tabBtn.getAttribute('data-tab');
      renderDsa(container);
    };
  });

  // Top action buttons
  document.getElementById('btn-top-add-problem').onclick = () => openAddDsaProblemModal();
  document.getElementById('btn-top-start-session').onclick = () => openStartDsaSessionModal();
  document.getElementById('btn-top-csv').onclick = () => openDsaCsvModal();
  document.getElementById('btn-change-dsa-target').onclick = () => openSetDsaTargetModal();
  document.getElementById('btn-quick-solve-today').onclick = () => openAddDsaProblemModal();
  document.getElementById('btn-view-all-revision').onclick = () => {
    activeTab = 'revision';
    renderDsa(container);
  };

  container.querySelectorAll('.btn-reattempt-quick').forEach(btn => {
    btn.onclick = () => {
      const probId = btn.getAttribute('data-prob-id');
      openSolveDsaProblemModal(probId, { isReattempt: true });
    };
  });

  // Attach Tab specific handlers
  attachTabHandlers(container);
}

/**
 * Render Content for Active Tab
 */
function renderActiveTabContent({ activeTab, analytics, filtered, pagedProblems, totalPages, calendarActivity, todayProgress, state }) {
  if (activeTab === 'problems') {
    return renderProblemsTab(filtered, pagedProblems, totalPages, analytics);
  }
  if (activeTab === 'roadmap') {
    return renderRoadmapTab(analytics);
  }
  if (activeTab === 'patterns') {
    return renderPatternsTab(analytics);
  }
  if (activeTab === 'revision') {
    return renderRevisionTab(analytics);
  }
  if (activeTab === 'mistakes') {
    return renderMistakesTab(analytics);
  }
  if (activeTab === 'sessions') {
    return renderSessionsAndCalendarTab(analytics, calendarActivity);
  }
  return '';
}

/**
 * TAB 1: Problems Catalog (Search, Multi-Filter, Sorting, Pagination, Empty State)
 */
function renderProblemsTab(filtered, pagedProblems, totalPages, analytics) {
  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <!-- SECTION 33, 34, 35: FILTER & SEARCH TOOLBAR -->
      <div class="card" style="padding: 12px;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          <!-- Search -->
          <div style="flex: 2; min-width: 220px; position: relative;">
            <input type="text" class="form-input" id="dsa-search-input" value="${searchQuery}" placeholder="Search title, platform, topic, pattern..." style="padding-left: 34px;" />
            <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted);">
              ${getIcon('search')}
            </span>
          </div>

          <!-- Status Filter -->
          <select class="form-select" id="dsa-status-filter" style="flex: 1; min-width: 140px;">
            <option value="All" ${statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
            <option value="Not Attempted" ${statusFilter === 'Not Attempted' ? 'selected' : ''}>Not Attempted</option>
            <option value="Attempted" ${statusFilter === 'Attempted' ? 'selected' : ''}>Attempted</option>
            <option value="Solved" ${statusFilter === 'Solved' ? 'selected' : ''}>Solved</option>
            <option value="Needs Revision" ${statusFilter === 'Needs Revision' ? 'selected' : ''}>Needs Revision</option>
          </select>

          <!-- Difficulty Filter -->
          <select class="form-select" id="dsa-diff-filter" style="width: auto;">
            <option value="All" ${difficultyFilter === 'All' ? 'selected' : ''}>All Difficulties</option>
            <option value="Easy" ${difficultyFilter === 'Easy' ? 'selected' : ''}>Easy</option>
            <option value="Medium" ${difficultyFilter === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="Hard" ${difficultyFilter === 'Hard' ? 'selected' : ''}>Hard</option>
          </select>

          <!-- Topic Filter -->
          <select class="form-select" id="dsa-topic-filter" style="flex: 1; min-width: 150px;">
            <option value="All" ${topicFilter === 'All' ? 'selected' : ''}>All Topics</option>
            ${ALL_DSA_TOPICS.map(t => `<option value="${t}" ${topicFilter === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>

          <!-- Sort By -->
          <select class="form-select" id="dsa-sort-select" style="width: auto;">
            <option value="newest" ${sortBy === 'newest' ? 'selected' : ''}>Sort: Newest</option>
            <option value="oldest" ${sortBy === 'oldest' ? 'selected' : ''}>Sort: Oldest</option>
            <option value="difficulty" ${sortBy === 'difficulty' ? 'selected' : ''}>Sort: Difficulty</option>
            <option value="topic" ${sortBy === 'topic' ? 'selected' : ''}>Sort: Topic</option>
            <option value="time" ${sortBy === 'time' ? 'selected' : ''}>Sort: Time Spent</option>
            <option value="attempts" ${sortBy === 'attempts' ? 'selected' : ''}>Sort: Most Attempts</option>
            <option value="revision" ${sortBy === 'revision' ? 'selected' : ''}>Sort: Revision Date</option>
          </select>

          <!-- Bookmark Toggle -->
          <button class="btn ${bookmarkOnlyFilter ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-toggle-bookmark-filter" title="Filter Bookmarked">
            ${bookmarkOnlyFilter ? getIcon('star', 'text-amber') : getIcon('star')} <span>Bookmarks</span>
          </button>
        </div>
      </div>

      <!-- SECTION 39: NO FAKE DATA & PROBLEM TABLE / CARDS -->
      ${analytics.total === 0 ? `
        <div class="card" style="text-align: center; padding: var(--space-xl) var(--space-lg); border: 2px dashed var(--color-border);">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">🧩</div>
          <h3 style="margin: 0 0 6px 0;">No DSA problems logged yet.</h3>
          <p style="color: var(--color-text-secondary); max-width: 460px; margin: 0 auto 16px auto; font-size: 0.88rem;">
            Your DSA problem database starts from your real practice. Record problems you encounter on LeetCode, Codeforces, or GeeksforGeeks.
          </p>
          <button class="btn btn-primary" id="btn-empty-add-prob">
            ${getIcon('plus')} + Add Problem
          </button>
        </div>
      ` : filtered.length === 0 ? `
        <div class="card" style="text-align: center; padding: var(--space-xl); color: var(--color-text-muted);">
          No problems match your current search and filters.
        </div>
      ` : `
        <!-- Table on Desktop, Cards on Mobile -->
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 36px;">★</th>
                <th>Problem</th>
                <th>Topic & Patterns</th>
                <th>Difficulty</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Duration</th>
                <th>Revision</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${pagedProblems.map(p => {
                const isBookmarked = Boolean(p.is_bookmarked);
                const isSolved = p.status === 'Solved' || p.solved;
                const diffBadge = p.difficulty === 'Hard' ? 'badge-rose' : (p.difficulty === 'Medium' ? 'badge-amber' : 'badge-emerald');
                const patternsList = Array.isArray(p.patterns) ? p.patterns : (p.pattern ? [p.pattern] : []);

                return `
                  <tr>
                    <td>
                      <button class="btn btn-ghost btn-icon btn-sm btn-bookmark-row" data-prob-id="${p.id}" title="Toggle Bookmark">
                        ${isBookmarked ? getIcon('star', 'text-amber') : getIcon('star', 'text-muted')}
                      </button>
                    </td>
                    <td>
                      <div style="font-weight: 600; cursor: pointer;" class="btn-open-detail" data-prob-id="${p.id}">
                        ${p.title || p.name}
                      </div>
                      ${p.subtopic ? `<div style="font-size: 0.72rem; color: var(--color-text-muted);">${p.subtopic}</div>` : ''}
                    </td>
                    <td>
                      <span class="badge badge-cyan" style="font-size: 0.72rem;">${p.topic}</span>
                      ${patternsList.slice(0, 2).map(pat => `<span class="badge badge-slate" style="font-size: 0.65rem; margin-left: 2px;">${pat}</span>`).join('')}
                    </td>
                    <td><span class="badge ${diffBadge}">${p.difficulty}</span></td>
                    <td><span style="font-family: var(--font-mono); font-size: 0.8rem;">${p.platform}</span></td>
                    <td>
                      <span class="badge ${isSolved ? 'badge-emerald' : (p.status === 'Attempted' ? 'badge-amber' : 'badge-slate')}">
                        ${p.status || 'Not Attempted'}
                      </span>
                    </td>
                    <td><span class="font-mono" style="font-size: 0.8rem;">${p.attempt_count || (isSolved ? 1 : 0)} att</span></td>
                    <td><span class="font-mono" style="font-size: 0.8rem;">${p.time_taken || p.timeTakenMinutes || 0}m</span></td>
                    <td>
                      ${p.needs_revision || p.revisionRequired ? `
                        <span class="badge badge-rose" style="font-size: 0.68rem;" title="Due: ${p.next_revision_date || 'Soon'}">Queued</span>
                      ` : `<span style="font-size: 0.75rem; color: var(--color-text-muted);">-</span>`}
                    </td>
                    <td style="text-align: right;">
                      <div style="display: flex; gap: 4px; justify-content: flex-end;">
                        <button class="btn btn-secondary btn-sm btn-solve-row" data-prob-id="${p.id}" title="Record Attempt / Solve">
                          ${isSolved ? 'Reattempt' : 'Attempt'}
                        </button>
                        <button class="btn btn-ghost btn-icon btn-sm btn-open-detail" data-prob-id="${p.id}" title="Details">
                          ${getIcon('chevronRight')}
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 0.85rem; color: var(--color-text-muted);">
          <div>Showing ${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(filtered.length, currentPage * PAGE_SIZE)} of ${filtered.length} problems</div>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-sm" id="btn-page-prev" ${currentPage <= 1 ? 'disabled' : ''}>Previous</button>
            <span style="display: flex; align-items: center; padding: 0 8px; font-family: var(--font-mono);">${currentPage} / ${totalPages}</span>
            <button class="btn btn-secondary btn-sm" id="btn-page-next" ${currentPage >= totalPages ? 'disabled' : ''}>Next</button>
          </div>
        </div>
      `}
    </div>
  `;
}

/**
 * TAB 2: DSA Roadmap & Topic Progress (Section 2 & 3 & 30)
 */
function renderRoadmapTab(analytics) {
  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
      <div class="card" style="padding: 14px; background: linear-gradient(135deg, var(--color-bg-surface), var(--color-bg-surface-elevated));">
        <h3 style="margin: 0 0 6px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
          ${getIcon('roadmap', 'text-primary')} <span>Master DSA Learning Path</span>
        </h3>
        <p style="margin: 0; font-size: 0.84rem; color: var(--color-text-secondary);">
          Structured progression following the foundational checklist. Practicing problems updates roadmap progress automatically.
        </p>
      </div>

      <!-- 9 Core Taxonomy Groups -->
      <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
        ${DSA_TAXONOMY.map(group => {
          return `
            <div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-accent-cyan); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                ${group.group}
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--space-sm);">
                ${group.topics.map(topicName => {
                  const tData = analytics.topicProgressMap[topicName] || {
                    name: topicName,
                    progress: 0,
                    attempted: 0,
                    solved: 0,
                    needsRevision: 0,
                    easy: 0,
                    medium: 0,
                    hard: 0
                  };

                  return `
                    <div class="card" style="padding: 12px; border-left: 3px solid var(--color-primary);">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                        <strong style="font-size: 0.95rem;">${topicName}</strong>
                        <span class="badge ${tData.progress > 50 ? 'badge-emerald' : 'badge-slate'} font-mono">${tData.progress}%</span>
                      </div>

                      <div class="progress-bar-container" style="height: 6px; margin-bottom: 8px;">
                        <div class="progress-bar-fill" style="width: ${tData.progress}%; background: var(--color-accent-emerald);"></div>
                      </div>

                      <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--color-text-secondary); margin-bottom: 8px;">
                        <span>Solved: <strong>${tData.solved}</strong></span>
                        <span>Attempted: <strong>${tData.attempted}</strong></span>
                        <span>Revision: <strong class="${tData.needsRevision > 0 ? 'text-rose' : ''}">${tData.needsRevision}</strong></span>
                      </div>

                      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 6px; font-size: 0.72rem;">
                        <div style="display: flex; gap: 4px;">
                          <span class="badge badge-emerald">${tData.easy} E</span>
                          <span class="badge badge-amber">${tData.medium} M</span>
                          <span class="badge badge-rose">${tData.hard} H</span>
                        </div>
                        <button class="btn btn-ghost btn-sm btn-filter-topic-shortcut" data-topic="${topicName}" style="font-size: 0.72rem; padding: 2px 6px;">
                          View Probs →
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * TAB 3: Pattern Mastery (Section 15 & 16)
 */
function renderPatternsTab(analytics) {
  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <div class="card" style="padding: 14px;">
        <h3 style="margin: 0 0 6px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
          ${getIcon('code', 'text-cyan')} <span>14 Core Algorithmic Patterns</span>
        </h3>
        <p style="margin: 0; font-size: 0.84rem; color: var(--color-text-secondary);">
          Mastery is measured by your independent solve rate, not just memorized solutions.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-sm);">
        ${DSA_PATTERNS.map(pat => {
          const m = analytics.patternMasteryMap[pat] || {
            pattern: pat,
            problemsCount: 0,
            solved: 0,
            independent: 0,
            withHelp: 0,
            needsRevision: 0,
            masteryRate: 0
          };

          return `
            <div class="card" style="padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="font-size: 0.95rem;">${pat}</strong>
                <span class="badge ${m.masteryRate >= 70 ? 'badge-emerald' : 'badge-cyan'} font-mono">${m.masteryRate}% Independent</span>
              </div>

              <div class="progress-bar-container" style="height: 6px; margin-bottom: 10px;">
                <div class="progress-bar-fill" style="width: ${m.masteryRate}%; background: var(--color-accent-cyan);"></div>
              </div>

              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; text-align: center; font-size: 0.75rem;">
                <div style="background: var(--color-bg-base); padding: 4px; border-radius: var(--radius-sm);">
                  <div style="color: var(--color-text-muted); font-size: 0.68rem;">PROBS</div>
                  <div style="font-weight: 700; font-family: var(--font-mono);">${m.problemsCount}</div>
                </div>
                <div style="background: var(--color-bg-base); padding: 4px; border-radius: var(--radius-sm);">
                  <div style="color: var(--color-text-muted); font-size: 0.68rem;">SOLVED</div>
                  <div style="font-weight: 700; font-family: var(--font-mono); color: var(--color-accent-emerald);">${m.solved}</div>
                </div>
                <div style="background: var(--color-bg-base); padding: 4px; border-radius: var(--radius-sm);">
                  <div style="color: var(--color-text-muted); font-size: 0.68rem;">SOLO</div>
                  <div style="font-weight: 700; font-family: var(--font-mono); color: var(--color-primary);">${m.independent}</div>
                </div>
                <div style="background: var(--color-bg-base); padding: 4px; border-radius: var(--radius-sm);">
                  <div style="color: var(--color-text-muted); font-size: 0.68rem;">HELP</div>
                  <div style="font-weight: 700; font-family: var(--font-mono); color: var(--color-accent-amber);">${m.withHelp}</div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * TAB 4: Revision Queue (Section 21, 22, 23)
 */
function renderRevisionTab(analytics) {
  const queue = analytics.revisionQueue;

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <div class="card" style="padding: 14px; border-left: 4px solid var(--color-accent-rose);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <h3 style="margin: 0 0 4px 0; font-size: 1.1rem; color: var(--color-accent-rose); display: flex; align-items: center; gap: 8px;">
              ${getIcon('revision', 'text-rose')} <span>DSA Revision Queue</span>
            </h3>
            <p style="margin: 0; font-size: 0.84rem; color: var(--color-text-secondary);">
              Spaced repetition intervals (1d, 3d, 7d, 14d, 30d). Previous solutions remain hidden during recall reattempts.
            </p>
          </div>
          <span class="badge badge-rose" style="font-size: 0.8rem; padding: 4px 10px;">${queue.length} Queued Problems</span>
        </div>
      </div>

      ${queue.length === 0 ? `
        <div class="card" style="text-align: center; padding: var(--space-xl); color: var(--color-text-muted);">
          🎉 Revision queue is clear! Problems you mark as "Needs Revision" or have partial understanding with will queue here.
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-sm);">
          ${queue.map(r => `
            <div class="card" style="padding: 14px; border-top: 3px solid ${r.isDue ? 'var(--color-accent-rose)' : 'var(--color-border)'};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <div>
                  <strong style="font-size: 0.95rem;">${r.title}</strong>
                  <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                    ${r.platform} · <span class="badge badge-slate" style="font-size: 0.65rem;">${r.topic}</span>
                  </div>
                </div>
                <span class="badge ${r.difficulty === 'Hard' ? 'badge-rose' : (r.difficulty === 'Medium' ? 'badge-amber' : 'badge-emerald')}">
                  ${r.difficulty}
                </span>
              </div>

              <div style="background: var(--color-bg-base); padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); font-size: 0.78rem; margin-bottom: 10px;">
                <div style="color: var(--color-accent-amber); font-weight: 600;">Reason: ${r.reason}</div>
                <div style="color: var(--color-text-muted); margin-top: 2px;">Next Due: <strong class="${r.isDue ? 'text-rose' : ''}">${r.nextRevisionDate}</strong> (Interval: ${r.intervalDays}d)</div>
              </div>

              <button class="btn btn-primary btn-sm btn-solve-row" data-prob-id="${r.id}" style="width: 100%;">
                🧠 Reattempt with Hidden Solution
              </button>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

/**
 * TAB 5: Mistake Log & Weak Topics (Section 24 & 25)
 */
function renderMistakesTab(analytics) {
  const mistakes = analytics.mistakeLog;

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-md);">
      <div class="card" style="padding: 14px;">
        <h3 style="margin: 0 0 6px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
          ${getIcon('alert', 'text-amber')} <span>DSA Mistake Log & Weakness Analysis</span>
        </h3>
        <p style="margin: 0; font-size: 0.84rem; color: var(--color-text-secondary);">
          Record and diagnose errors across logic, syntax, time complexity, and edge cases to isolate recurring gaps.
        </p>
      </div>

      ${mistakes.length === 0 ? `
        <div class="card" style="text-align: center; padding: var(--space-xl); color: var(--color-text-muted);">
          No mistakes logged yet. When solving problems, record what went wrong to build your weakness diagnostic.
        </div>
      ` : `
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Topic</th>
                <th>Mistake Category</th>
                <th>Notes / Retrospective</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${mistakes.map(m => `
                <tr>
                  <td><strong>${m.problemTitle}</strong></td>
                  <td><span class="badge badge-slate">${m.topic}</span></td>
                  <td><span class="badge badge-amber">${m.mistakeCategory}</span></td>
                  <td style="max-width: 320px; font-size: 0.82rem; color: var(--color-text-secondary);">${m.notes || 'No note'}</td>
                  <td><span class="font-mono" style="font-size: 0.78rem;">${m.date}</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm btn-open-detail" data-prob-id="${m.id}">Review</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;
}

/**
 * TAB 6: Sessions History & Activity Calendar (Section 26, 27, 28)
 */
function renderSessionsAndCalendarTab(analytics, calendarActivity) {
  const sessions = analytics.sessions;
  const dates = Object.keys(calendarActivity).sort((a, b) => new Date(b) - new Date(a));

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
      <!-- Calendar Activity Section (Section 28) -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">${getIcon('calendar', 'text-cyan')} <span>DSA Activity Calendar</span></div>
          <span style="font-size: 0.75rem; color: var(--color-text-muted);">Problems solved & study time per day</span>
        </div>

        ${dates.length === 0 ? `
          <div style="text-align: center; padding: var(--space-lg); color: var(--color-text-muted); font-size: 0.85rem;">
            No daily DSA practice activity recorded yet.
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px;">
            ${dates.map(dateStr => {
              const act = calendarActivity[dateStr];
              return `
                <div style="background: var(--color-bg-base); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); text-align: center;">
                  <div style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--color-text-muted);">${dateStr}</div>
                  <div style="font-size: 1.25rem; font-weight: 700; color: var(--color-accent-emerald); margin: 2px 0;">${act.problemsSolved} Solved</div>
                  <div style="font-size: 0.72rem; color: var(--color-text-secondary);">${act.studyMinutes} mins study</div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Practice Sessions History (Section 27) -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">${getIcon('clock', 'text-primary')} <span>Practice Sessions History</span></div>
          <button class="btn btn-primary btn-sm" id="btn-launch-session-from-tab">+ Start DSA Session</button>
        </div>

        ${sessions.length === 0 ? `
          <div style="text-align: center; padding: var(--space-lg); color: var(--color-text-muted); font-size: 0.85rem;">
            No DSA practice sessions logged yet. Launch a session to track problem-solving blocks with live timers.
          </div>
        ` : `
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Topic</th>
                  <th>Duration</th>
                  <th>Target Probs</th>
                  <th>Attempted</th>
                  <th>Solved</th>
                  <th>Takeaways</th>
                </tr>
              </thead>
              <tbody>
                ${sessions.map(s => `
                  <tr>
                    <td><span class="font-mono" style="font-size: 0.8rem;">${s.date}</span></td>
                    <td><strong>${s.topic}</strong></td>
                    <td><span class="badge badge-cyan font-mono">${s.durationMinutes}m</span></td>
                    <td>${s.targetProblems}</td>
                    <td>${s.problemsAttempted}</td>
                    <td><span class="badge badge-emerald font-mono">${s.problemsSolved}</span></td>
                    <td style="max-width: 250px; font-size: 0.8rem; color: var(--color-text-secondary);">${s.notes || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

/**
 * Tab and Toolbar Event Handlers
 */
function attachTabHandlers(container) {
  // Search input
  const searchInput = document.getElementById('dsa-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      renderDsa(container);
    };
  }

  // Status Filter
  const statusEl = document.getElementById('dsa-status-filter');
  if (statusEl) {
    statusEl.onchange = (e) => {
      statusFilter = e.target.value;
      currentPage = 1;
      renderDsa(container);
    };
  }

  // Difficulty Filter
  const diffEl = document.getElementById('dsa-diff-filter');
  if (diffEl) {
    diffEl.onchange = (e) => {
      difficultyFilter = e.target.value;
      currentPage = 1;
      renderDsa(container);
    };
  }

  // Topic Filter
  const topicEl = document.getElementById('dsa-topic-filter');
  if (topicEl) {
    topicEl.onchange = (e) => {
      topicFilter = e.target.value;
      currentPage = 1;
      renderDsa(container);
    };
  }

  // Sort Select
  const sortEl = document.getElementById('dsa-sort-select');
  if (sortEl) {
    sortEl.onchange = (e) => {
      sortBy = e.target.value;
      renderDsa(container);
    };
  }

  // Bookmark Filter Button
  const bookmarkBtn = document.getElementById('btn-toggle-bookmark-filter');
  if (bookmarkBtn) {
    bookmarkBtn.onclick = () => {
      bookmarkOnlyFilter = !bookmarkOnlyFilter;
      currentPage = 1;
      renderDsa(container);
    };
  }

  // Pagination buttons
  const prevBtn = document.getElementById('btn-page-prev');
  if (prevBtn) {
    prevBtn.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        renderDsa(container);
      }
    };
  }

  const nextBtn = document.getElementById('btn-page-next');
  if (nextBtn) {
    nextBtn.onclick = () => {
      currentPage++;
      renderDsa(container);
    };
  }

  // Empty state button
  const emptyBtn = document.getElementById('btn-empty-add-prob');
  if (emptyBtn) {
    emptyBtn.onclick = () => openAddDsaProblemModal();
  }

  // Table row actions: Bookmark toggle
  container.querySelectorAll('.btn-bookmark-row').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const probId = btn.getAttribute('data-prob-id');
      toggleDsaBookmark(probId);
      renderDsa(container);
    };
  });

  // Table row actions: Open solve/attempt modal
  container.querySelectorAll('.btn-solve-row').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const probId = btn.getAttribute('data-prob-id');
      openSolveDsaProblemModal(probId);
    };
  });

  // Table row actions: Open detail modal
  container.querySelectorAll('.btn-open-detail').forEach(el => {
    el.onclick = () => {
      const probId = el.getAttribute('data-prob-id');
      openProblemDetailModal(probId);
    };
  });

  // Topic shortcut in Roadmap tab
  container.querySelectorAll('.btn-filter-topic-shortcut').forEach(btn => {
    btn.onclick = () => {
      const t = btn.getAttribute('data-topic');
      topicFilter = t;
      activeTab = 'problems';
      renderDsa(container);
    };
  });

  // Launch session button from sessions tab
  const launchSessBtn = document.getElementById('btn-launch-session-from-tab');
  if (launchSessBtn) {
    launchSessBtn.onclick = () => openStartDsaSessionModal();
  }
}

/**
 * Responsive Desktop & Mobile Styles
 */
function attachResponsiveStyles() {
  if (document.getElementById('dsa-responsive-styles')) return;
  const style = document.createElement('style');
  style.id = 'dsa-responsive-styles';
  style.textContent = `
    @media (min-width: 992px) {
      .dsa-layout-grid {
        grid-template-columns: 1fr 310px !important;
      }
    }
    @media (max-width: 991px) {
      .dsa-layout-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(style);
}

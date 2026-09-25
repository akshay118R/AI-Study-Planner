/**
 * Akshay's 12-Month AI/ML Career OS - Prime 3.0 Tracker (Track A)
 */
import { getState, updateState } from '../data/storage.js';
import { PRIME_3_COURSE } from '../data/curriculum.js';
import { calculateComprehensiveAnalytics } from '../services/analyticsService.js';
import { getIcon } from '../components/icons.js';

export function renderPrime(container) {
  const state = getState();
  const analytics = calculateComprehensiveAnalytics(state);
  const lessonsState = state.primeLessons || {};

  // Find current & next lesson
  let currentLesson = null;
  let nextLesson = null;
  for (const mod of PRIME_3_COURSE.modules) {
    for (const l of mod.lessons) {
      const rec = lessonsState[l.id];
      if (rec?.status === 'Learning' || rec?.status === 'Practicing') {
        currentLesson = { ...l, module: mod.title, ...rec };
      } else if (!currentLesson && (!rec || rec.status === 'Not Started')) {
        currentLesson = { ...l, module: mod.title, ...rec };
      } else if (currentLesson && !nextLesson && (!rec || rec.status === 'Not Started')) {
        nextLesson = { ...l, module: mod.title, ...rec };
      }
    }
  }

  // Count modules completed (where all lessons are Mastered or Applied)
  let modulesCompleted = 0;
  PRIME_3_COURSE.modules.forEach(mod => {
    const allDone = mod.lessons.every(l => {
      const s = lessonsState[l.id]?.status;
      return s === 'Mastered' || s === 'Applied';
    });
    if (allDone) modulesCompleted++;
  });

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('prime', 'text-primary')} Track A: Prime 3.0 AI/ML</h1>
        <div class="view-subtitle">
          End-to-End Specialization: Python, Machine Learning, Deep Learning, Transformers, GenAI & Deployment
        </div>
      </div>
      <div class="view-actions">
        <span class="badge badge-cyan">Specialized Cohort Track</span>
      </div>
    </div>

    <!-- Prime 3.0 Overview Stats -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-lg);">
      <div class="stat-card">
        <div class="stat-header">COURSE PROGRESS</div>
        <div class="stat-value text-primary">${analytics.prime.percentage}%</div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width: ${analytics.prime.percentage}%;"></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-header">MODULES COMPLETED</div>
        <div class="stat-value text-cyan">${modulesCompleted} / ${PRIME_3_COURSE.modules.length}</div>
        <div class="stat-subtext">All lessons mastered/applied</div>
      </div>
      <div class="stat-card">
        <div class="stat-header">HOURS LOGGED</div>
        <div class="stat-value text-emerald">${analytics.hoursDistribution.prime}h</div>
        <div class="stat-subtext">Estimated: ~${PRIME_3_COURSE.totalHoursEst}h total</div>
      </div>
      <div class="stat-card">
        <div class="stat-header">CURRENT TOPIC</div>
        <div style="font-size: 0.95rem; font-weight: 700; margin-top: 4px; color: var(--color-text-main);">
          ${currentLesson ? currentLesson.title : 'Prime 3.0 Complete'}
        </div>
        <div class="stat-subtext">
          Next: ${nextLesson ? nextLesson.title : 'Major Capstone'}
        </div>
      </div>
    </div>

    <!-- Module Accordion List -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2 style="font-size: 1.15rem; font-weight: 700;">Prime 3.0 Modules (${PRIME_3_COURSE.modules.length})</h2>
        <span style="font-size: 0.8rem; color: var(--color-text-muted);">
          Understanding Scale: 0 (Don't understand) → 4 (Can apply in production)
        </span>
      </div>

      <div id="prime-modules-container">
        ${PRIME_3_COURSE.modules.map((mod, modIdx) => {
          let modDoneCount = 0;
          mod.lessons.forEach(l => {
            const s = lessonsState[l.id]?.status;
            if (s === 'Mastered' || s === 'Applied' || s === 'Understood') modDoneCount++;
          });
          const modPct = Math.round((modDoneCount / mod.lessons.length) * 100);

          return `
            <div class="module-accordion" id="mod-wrap-${mod.id}">
              <div class="module-header" data-mod-id="${mod.id}">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span class="badge badge-slate">M${modIdx + 1}</span>
                  <div>
                    <strong style="font-size: 0.95rem;">${mod.title}</strong>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                      ${mod.topics.join(' · ')}
                    </div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="text-align: right;">
                    <span style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 600;">${modDoneCount}/${mod.lessons.length}</span>
                  </div>
                  <span class="badge ${modPct === 100 ? 'badge-emerald' : (modPct > 0 ? 'badge-cyan' : 'badge-slate')}">${modPct}%</span>
                  ${getIcon('chevronDown')}
                </div>
              </div>

              <div class="lesson-list" id="lesson-list-${mod.id}">
                ${mod.lessons.map(l => {
                  const rec = lessonsState[l.id] || {
                    watched: false, notesTaken: false, codedAlong: false,
                    recreatedIndependently: false, practiced: false, understood: false, applied: false,
                    understandingScore: 0, status: 'Not Started', notes: '', hoursLogged: 0
                  };

                  let statusBadge = 'badge-slate';
                  if (rec.status === 'Mastered') statusBadge = 'badge-emerald';
                  else if (rec.status === 'Applied') statusBadge = 'badge-purple';
                  else if (rec.status === 'Understood') statusBadge = 'badge-cyan';
                  else if (rec.status === 'Learning' || rec.status === 'Practicing') statusBadge = 'badge-amber';

                  return `
                    <div class="lesson-card" data-lesson-id="${l.id}">
                      <div class="lesson-top-row">
                        <div>
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <strong style="font-size: 0.9rem;">${l.title}</strong>
                            <span class="badge ${statusBadge}">${rec.status}</span>
                          </div>
                          <div style="font-size: 0.72rem; color: var(--color-text-muted); font-family: var(--font-mono); margin-top: 2px;">
                            Est: ~${l.estHours}h · Logged: ${rec.hoursLogged || 0}h
                          </div>
                        </div>

                        <!-- Status Selector -->
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <select class="form-select lesson-status-select" data-lesson-id="${l.id}" style="padding: 4px 8px; font-size: 0.78rem;">
                            <option value="Not Started" ${rec.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                            <option value="Learning" ${rec.status === 'Learning' ? 'selected' : ''}>Learning</option>
                            <option value="Practicing" ${rec.status === 'Practicing' ? 'selected' : ''}>Practicing</option>
                            <option value="Understood" ${rec.status === 'Understood' ? 'selected' : ''}>Understood</option>
                            <option value="Applied" ${rec.status === 'Applied' ? 'selected' : ''}>Applied</option>
                            <option value="Mastered" ${rec.status === 'Mastered' ? 'selected' : ''}>Mastered</option>
                          </select>
                        </div>
                      </div>

                      <!-- 7 Rigorous Progress Checkboxes -->
                      <div class="lesson-checkboxes-row">
                        <label class="lesson-cb-label">
                          <input type="checkbox" class="custom-checkbox lesson-crit-cb" data-lesson-id="${l.id}" data-crit="watched" ${rec.watched ? 'checked' : ''} />
                          <span>Watched</span>
                        </label>
                        <label class="lesson-cb-label">
                          <input type="checkbox" class="custom-checkbox lesson-crit-cb" data-lesson-id="${l.id}" data-crit="notesTaken" ${rec.notesTaken ? 'checked' : ''} />
                          <span>Notes Taken</span>
                        </label>
                        <label class="lesson-cb-label">
                          <input type="checkbox" class="custom-checkbox lesson-crit-cb" data-lesson-id="${l.id}" data-crit="codedAlong" ${rec.codedAlong ? 'checked' : ''} />
                          <span>Coded Along</span>
                        </label>
                        <label class="lesson-cb-label">
                          <input type="checkbox" class="custom-checkbox lesson-crit-cb" data-lesson-id="${l.id}" data-crit="recreatedIndependently" ${rec.recreatedIndependently ? 'checked' : ''} />
                          <span>Recreated Independently</span>
                        </label>
                        <label class="lesson-cb-label">
                          <input type="checkbox" class="custom-checkbox lesson-crit-cb" data-lesson-id="${l.id}" data-crit="practiced" ${rec.practiced ? 'checked' : ''} />
                          <span>Practiced</span>
                        </label>
                        <label class="lesson-cb-label">
                          <input type="checkbox" class="custom-checkbox lesson-crit-cb" data-lesson-id="${l.id}" data-crit="understood" ${rec.understood ? 'checked' : ''} />
                          <span>Understood</span>
                        </label>
                        <label class="lesson-cb-label">
                          <input type="checkbox" class="custom-checkbox lesson-crit-cb" data-lesson-id="${l.id}" data-crit="applied" ${rec.applied ? 'checked' : ''} />
                          <span>Applied</span>
                        </label>
                      </div>

                      <!-- Understanding Scale (0 to 4) -->
                      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px dashed var(--color-border-subtle); padding-top: 6px;">
                        <div class="understanding-scale-bar">
                          <span style="color: var(--color-text-muted);">Understanding:</span>
                          ${[0, 1, 2, 3, 4].map(score => `
                            <button class="understanding-btn ${rec.understandingScore === score ? 'active' : ''}"
                              data-lesson-id="${l.id}" data-score="${score}"
                              title="${getScoreMeaning(score)}">${score}</button>
                          `).join('')}
                          <span style="font-size: 0.7rem; color: var(--color-text-muted); margin-left: 6px;">
                            (${getScoreMeaning(rec.understandingScore)})
                          </span>
                        </div>

                        ${rec.notes ? `
                          <div style="font-size: 0.75rem; color: var(--color-text-secondary); max-width: 50%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            📝 ${rec.notes}
                          </div>
                        ` : ''}
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

  // Module Accordion Toggle
  container.querySelectorAll('.module-header').forEach(header => {
    header.onclick = () => {
      const modId = header.getAttribute('data-mod-id');
      const list = document.getElementById(`lesson-list-${modId}`);
      if (list) {
        list.style.display = list.style.display === 'none' ? 'flex' : 'none';
      }
    };
  });

  // Checkbox handlers
  container.querySelectorAll('.lesson-crit-cb').forEach(cb => {
    cb.onchange = (e) => {
      const lessonId = e.target.getAttribute('data-lesson-id');
      const crit = e.target.getAttribute('data-crit');
      const isChecked = e.target.checked;

      updateLessonState(lessonId, { [crit]: isChecked });
    };
  });

  // Understanding Scale Buttons
  container.querySelectorAll('.understanding-btn').forEach(btn => {
    btn.onclick = () => {
      const lessonId = btn.getAttribute('data-lesson-id');
      const score = parseInt(btn.getAttribute('data-score'), 10);
      updateLessonState(lessonId, { understandingScore: score });

      // If marked 0 (Don't understand), automatically add to Revision Queue
      if (score === 0) {
        const state = getState();
        const lesson = findLessonById(lessonId);
        if (lesson) {
          updateState(curr => {
            const revisionItems = [...(curr.revisionItems || [])];
            revisionItems.unshift({
              id: `rev-prime-${Date.now()}`,
              title: `Prime 3.0: ${lesson.title}`,
              source: `Prime 3.0 Course`,
              type: 'Didn\'t Understand',
              topic: lesson.moduleTitle || 'AI/ML',
              dateAdded: curr.user?.activeDate || '2026-10-01',
              dueDate: curr.user?.activeDate || '2026-10-01',
              status: 'Due today',
              difficultyRating: 'Hard',
              reviewCount: 0,
              lastReviewed: null,
              notes: 'Flagged with Understanding Score 0. Needs deep revision and practice.'
            });
            return { ...curr, revisionItems };
          });
        }
      }
    };
  });

  // Status Select
  container.querySelectorAll('.lesson-status-select').forEach(sel => {
    sel.onchange = (e) => {
      const lessonId = e.target.getAttribute('data-lesson-id');
      const status = e.target.value;
      updateLessonState(lessonId, { status });
    };
  });

  function updateLessonState(lessonId, updates) {
    updateState(curr => {
      const lessons = { ...(curr.primeLessons || {}) };
      const current = lessons[lessonId] || {};
      const updatedLesson = { ...current, ...updates, dateUpdated: curr.user?.activeDate || '2026-10-01' };

      // Recompute status intelligently if not manually overridden
      if (!updates.status) {
        if (updatedLesson.understandingScore >= 4 && updatedLesson.applied && updatedLesson.recreatedIndependently) {
          updatedLesson.status = 'Mastered';
        } else if (updatedLesson.understandingScore >= 3 && updatedLesson.understood) {
          updatedLesson.status = 'Understood';
        } else if (updatedLesson.codedAlong || updatedLesson.practiced) {
          updatedLesson.status = 'Practicing';
        } else if (updatedLesson.watched) {
          updatedLesson.status = 'Learning';
        }
      }

      lessons[lessonId] = updatedLesson;
      return { ...curr, primeLessons: lessons };
    });
  }

  function findLessonById(lessonId) {
    for (const mod of PRIME_3_COURSE.modules) {
      for (const l of mod.lessons) {
        if (l.id === lessonId) return { ...l, moduleTitle: mod.title };
      }
    }
    return null;
  }

  function getScoreMeaning(score) {
    switch (score) {
      case 0: return "Don't understand";
      case 1: return "Recognize";
      case 2: return "Can explain";
      case 3: return "Can implement";
      case 4: return "Can apply";
      default: return "";
    }
  }
}

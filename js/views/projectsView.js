/**
 * Akshay's 12-Month AI/ML Career OS - Projects View
 */
import { getState, updateState } from '../data/storage.js';
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from '../data/curriculum.js';
import { getIcon } from '../components/icons.js';
import { openAddProjectModal } from '../components/modals.js';

let selectedCategory = 'All';

export function renderProjects(container) {
  const state = getState();
  const projects = state.projects || [];

  const filtered = selectedCategory === 'All'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('projects', 'text-purple')} Portfolio Projects Hub</h1>
        <div class="view-subtitle">
          Building 5+ flagship projects across C Systems, ML Pipelines, Deep Learning, GenAI RAG, and Web Deployment
        </div>
      </div>
      <div class="view-actions">
        <button class="btn btn-primary" id="btn-create-project">${getIcon('plus')} New Project</button>
      </div>
    </div>

    <!-- Category Filter Tabs -->
    <div class="tabs-nav">
      <button class="tab-btn ${selectedCategory === 'All' ? 'active' : ''}" data-cat="All">All Projects (${projects.length})</button>
      ${PROJECT_CATEGORIES.map(c => `
        <button class="tab-btn ${selectedCategory === c ? 'active' : ''}" data-cat="${c}">${c}</button>
      `).join('')}
    </div>

    <!-- Project Cards Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: var(--space-lg);">
      ${filtered.length === 0 ? `
        <div class="col-12" style="text-align: center; padding: var(--space-2xl); color: var(--color-text-muted);">
          No projects found in this category. Click "New Project" to add your next portfolio capstone!
        </div>
      ` : filtered.map(p => {
        let statusBadge = 'badge-slate';
        if (p.status === 'Completed' || p.status === 'Deployed') statusBadge = 'badge-emerald';
        else if (p.status === 'Building' || p.status === 'Testing') statusBadge = 'badge-cyan';
        else if (p.status === 'Planning') statusBadge = 'badge-amber';

        const totalTasks = (p.tasks || []).length;
        const completedTasks = (p.tasks || []).filter(t => t.completed).length;
        const calcProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (p.progress || 0);

        return `
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-top: 3px solid var(--color-accent-purple);" data-proj-id="${p.id}">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <span class="badge badge-purple">${p.category}</span>
                <span class="badge ${statusBadge}">${p.status}</span>
              </div>

              <h3 style="font-size: 1.15rem; margin-bottom: 6px;">${p.name}</h3>
              <p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 12px;">
                ${p.description || 'No description provided.'}
              </p>

              <div style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--color-text-muted); margin-bottom: 12px;">
                🛠️ ${p.technology || 'C / Python / PyTorch'}
              </div>

              <!-- Progress Bar -->
              <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-family: var(--font-mono); margin-bottom: 4px;">
                  <span>Task Milestones: ${completedTasks}/${totalTasks}</span>
                  <strong>${calcProgress}%</strong>
                </div>
                <div class="progress-bar-wrap">
                  <div class="progress-bar-fill purple" style="width: ${calcProgress}%;"></div>
                </div>
              </div>

              <!-- 9-Stage Task System Checklist -->
              <div style="background: var(--color-bg-base); border-radius: var(--radius-md); padding: 10px; border: 1px solid var(--color-border-subtle); margin-bottom: 12px;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; margin-bottom: 6px; font-family: var(--font-mono);">
                  Project Development Checklist
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; max-height: 150px; overflow-y: auto;">
                  ${(p.tasks || []).map(t => `
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; cursor: pointer;">
                      <input type="checkbox" class="custom-checkbox project-task-cb"
                        data-proj-id="${p.id}" data-task-id="${t.id}" ${t.completed ? 'checked' : ''} />
                      <span style="${t.completed ? 'text-decoration: line-through; color: var(--color-text-muted);' : ''}">${t.title}</span>
                    </label>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Card Footer Links -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--color-border-subtle); padding-top: 12px; margin-top: 6px;">
              <div style="display: flex; gap: 8px;">
                ${p.githubUrl ? `
                  <a href="${p.githubUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="padding: 3px 8px; font-size: 0.75rem;">
                    GitHub ${getIcon('externalLink')}
                  </a>
                ` : `<span style="font-size: 0.72rem; color: var(--color-text-muted);">No repo link</span>`}

                ${p.liveUrl ? `
                  <a href="${p.liveUrl}" target="_blank" rel="noopener" class="btn btn-accent btn-sm" style="padding: 3px 8px; font-size: 0.75rem;">
                    Live Demo ${getIcon('externalLink')}
                  </a>
                ` : ''}
              </div>

              <div style="display: flex; gap: 4px;">
                <button class="btn btn-ghost btn-icon btn-delete-project" data-proj-id="${p.id}" title="Delete project">${ICONS.trash}</button>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Handlers
  document.getElementById('btn-create-project').onclick = openAddProjectModal;

  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      selectedCategory = btn.getAttribute('data-cat');
      renderProjects(container);
    };
  });

  // Project Task Checkbox
  container.querySelectorAll('.project-task-cb').forEach(cb => {
    cb.onchange = (e) => {
      const projId = e.target.getAttribute('data-proj-id');
      const taskId = e.target.getAttribute('data-task-id');
      const isChecked = e.target.checked;

      updateState(curr => {
        const updated = (curr.projects || []).map(p => {
          if (p.id === projId) {
            const tasks = (p.tasks || []).map(t => t.id === taskId ? { ...t, completed: isChecked } : t);
            const done = tasks.filter(t => t.completed).length;
            const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
            const status = progress === 100 ? 'Completed' : (progress > 50 ? 'Testing' : (progress > 0 ? 'Building' : p.status));
            return { ...p, tasks, progress, status };
          }
          return p;
        });
        return { ...curr, projects: updated };
      });
    };
  });

  // Delete Project
  container.querySelectorAll('.btn-delete-project').forEach(btn => {
    btn.onclick = () => {
      const projId = btn.getAttribute('data-proj-id');
      if (confirm('Delete this project?')) {
        updateState(curr => ({
          ...curr,
          projects: (curr.projects || []).filter(p => p.id !== projId)
        }));
      }
    };
  });
}

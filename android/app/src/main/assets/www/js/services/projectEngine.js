/**
 * Akshay's 12-Month AI/ML Career OS - Projects & Portfolio Engine (Phase 6)
 * 
 * Hierarchy & Flow:
 * ROADMAP PROJECT -> PROJECT -> MILESTONE -> FEATURE -> TASK -> DAILY TASK -> WORK SESSION -> COMPLETION -> GITHUB -> DEPLOYMENT -> DOCUMENTATION -> PORTFOLIO -> RESUME
 * 
 * Capabilities:
 * - 9-stage Project Lifecycle: Idea -> Planned -> Building -> Testing -> Deployed -> Portfolio Ready -> Completed (+ Paused, Archived)
 * - Hierarchical Project Structure: Milestone -> Feature -> Task -> Subtask
 * - Real Mathematical Progress calculation from lowest relevant task/milestone level (Section 14)
 * - Active Projects Limit enforcement (default: 2) with friendly overload warning (Section 34)
 * - Two-way sync with Phase 3 Daily Tasks, Phase 4 Weekly/Monthly Goals, and Phase 2 Roadmap
 * - Time & Study Session logging integrated with existing studySessions (Section 18, 19)
 * - GitHub 12-item Ready Checklist & 10-item README Checklist (Sections 20, 21, 22)
 * - Deployment tracking with 9-item Deployment Checklist (Sections 23, 24)
 * - 8-Category Testing Checklist (Section 25)
 * - Comprehensive Project Documentation & Architecture (Sections 26, 27)
 * - Learning Log & Interview Challenges/Solutions (Sections 28, 29, 48)
 * - Portfolio Readiness 12-item checklist, 7-point Quality Check & explicit marking (Sections 30, 31, 41, 42)
 * - Resume Bullet Points and Achievements (Section 32)
 * - Project Ideas Incubator with 1-click conversion without duplication (Section 44)
 * - Roadmap Project Placeholders linkage (Section 45)
 * - Completion Summary confirmation (Section 46)
 * - Portfolio CSV Export (Section 58)
 */

import { getState, updateState } from '../data/storage.js';

let seqCounter = 0;
function uid(prefix = 'id') {
  seqCounter += 1;
  return `${prefix}-${Date.now()}-${seqCounter}-${Math.random().toString(36).substring(2, 7)}`;
}

// ==========================================
// CONSTANTS & TAXONOMY
// ==========================================

export const PROJECT_CATEGORIES = [
  'Learning Projects',
  'Minor Projects',
  'Major Projects',
  'AI/ML Projects',
  'Software Projects',
  'GenAI Projects',
  'Backend Projects',
  'Deployment Projects'
];

export const PROJECT_TYPES = [
  'Small Project',
  'Minor Project',
  'Major Project',
  'AI/ML Project',
  'Deep Learning Project',
  'GenAI/LLM Project',
  'Software Engineering Project',
  'Backend Project',
  'Full Stack Project',
  'Data Science Project',
  'Data Engineering Project',
  'MLOps Project'
];

export const PROJECT_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export const PROJECT_STATUSES = [
  'Idea',
  'Planned',
  'Building',
  'Testing',
  'Deployed',
  'Portfolio Ready',
  'Completed',
  'Paused',
  'Archived'
];

export const PORTFOLIO_STATUSES = ['Not Ready', 'In Progress', 'Portfolio Ready'];

export const TASK_STATUSES = ['Not Started', 'In Progress', 'Completed', 'Blocked', 'Skipped'];

export const TASK_PRIORITIES = ['Critical', 'High', 'Normal', 'Low'];

export const PORTFOLIO_PRIORITIES = ['High', 'Medium', 'Low'];

export const TECH_STACK_PRESETS = {
  Languages: ['Python', 'C', 'C++', 'Java', 'JavaScript', 'TypeScript', 'SQL'],
  Frontend: ['React', 'Next.js', 'HTML', 'CSS', 'Tailwind', 'Vue'],
  Backend: ['Node.js', 'Express', 'FastAPI', 'Flask', 'Django'],
  'AI/ML': ['NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Transformers', 'Hugging Face', 'LangChain', 'ChromaDB'],
  Database: ['PostgreSQL', 'MySQL', 'MongoDB', 'Supabase', 'Redis', 'SQLite'],
  DevOps: ['Docker', 'Kubernetes', 'GitHub Actions', 'Linux', 'Make', 'GDB'],
  Cloud: ['AWS', 'Azure', 'GCP', 'Vercel', 'Render', 'Railway', 'Other']
};

export const GITHUB_READY_CHECKLIST_ITEMS = [
  { key: 'repo_created', label: 'Repository created' },
  { key: 'meaningful_name', label: 'Meaningful repository name' },
  { key: 'readme_added', label: 'README added' },
  { key: 'gitignore_added', label: '.gitignore added' },
  { key: 'clean_structure', label: 'Clean project structure' },
  { key: 'dependencies_documented', label: 'Requirements/dependencies documented' },
  { key: 'env_documented', label: 'Environment variables documented' },
  { key: 'screenshots_added', label: 'Screenshots added' },
  { key: 'installation_instructions', label: 'Installation instructions' },
  { key: 'usage_instructions', label: 'Usage instructions' },
  { key: 'license_added', label: 'License where appropriate' },
  { key: 'final_code_pushed', label: 'Final code pushed' }
];

export const README_CHECKLIST_ITEMS = [
  { key: 'title', label: 'Project title' },
  { key: 'problem_statement', label: 'Problem statement' },
  { key: 'features', label: 'Features' },
  { key: 'tech_stack', label: 'Tech stack' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'installation', label: 'Installation' },
  { key: 'usage', label: 'Usage' },
  { key: 'screenshots', label: 'Screenshots' },
  { key: 'demo', label: 'Demo' },
  { key: 'future_improvements', label: 'Future improvements' }
];

export const DEPLOYMENT_PLATFORMS = [
  'Vercel',
  'Render',
  'Railway',
  'AWS',
  'Azure',
  'Docker',
  'Other'
];

export const DEPLOYMENT_CHECKLIST_ITEMS = [
  { key: 'prod_build', label: 'Production build works' },
  { key: 'env_vars', label: 'Environment variables configured' },
  { key: 'db_connected', label: 'Database connected' },
  { key: 'api_working', label: 'API working' },
  { key: 'frontend_working', label: 'Frontend working' },
  { key: 'error_handling', label: 'Error handling tested' },
  { key: 'mobile_tested', label: 'Mobile tested' },
  { key: 'desktop_tested', label: 'Desktop tested' },
  { key: 'prod_url_working', label: 'Production URL working' }
];

export const TESTING_CATEGORIES = [
  'Functionality',
  'UI',
  'API',
  'Database',
  'Performance',
  'Security Basics',
  'Mobile',
  'Desktop'
];

export const PORTFOLIO_READINESS_CHECKLIST_ITEMS = [
  { key: 'working_project', label: 'Working project' },
  { key: 'github_repo', label: 'GitHub repository' },
  { key: 'clean_code', label: 'Clean code' },
  { key: 'readme', label: 'README' },
  { key: 'screenshots', label: 'Screenshots' },
  { key: 'demo_video', label: 'Demo/video' },
  { key: 'deployment', label: 'Deployment' },
  { key: 'architecture_doc', label: 'Architecture documentation' },
  { key: 'challenges_doc', label: 'Challenges documented' },
  { key: 'results_doc', label: 'Results documented' },
  { key: 'portfolio_desc', label: 'Portfolio description' },
  { key: 'resume_bullets', label: 'Resume bullet points' }
];

export const QUALITY_CHECK_CATEGORIES = [
  { key: 'code_quality', label: 'Code Quality' },
  { key: 'functionality', label: 'Functionality' },
  { key: 'documentation', label: 'Documentation' },
  { key: 'github', label: 'GitHub' },
  { key: 'deployment', label: 'Deployment' },
  { key: 'testing', label: 'Testing' },
  { key: 'presentation', label: 'Presentation' }
];

export const ROADMAP_PROJECT_PLACEHOLDERS = [
  { topicId: 'top-oct-14', title: 'Small C Project', category: 'C / Systems' },
  { topicId: 'top-jul-11', title: 'Backend Project', category: 'Web / Backend' },
  { topicId: 'top-sep-7', title: 'Strong Python Project', category: 'Software' },
  { topicId: 'top-sep-8', title: 'Strong ML Project', category: 'Machine Learning' },
  { topicId: 'top-sep-9', title: 'Deep Learning Project', category: 'Deep Learning' },
  { topicId: 'top-sep-10', title: 'GenAI/LLM Project', category: 'GenAI' },
  { topicId: 'top-sep-11', title: 'Deployed Project', category: 'Deployment' }
];

// ==========================================
// METRICS & PROGRESS HELPERS
// ==========================================

/**
 * Calculates project progress dynamically from lowest relevant task level (Section 14)
 * No fake percentages.
 */
export function calculateProjectProgress(projectId) {
  const state = getState();
  const project = (state.projects || []).find(p => p.id === projectId);
  if (!project) return 0;

  // 1. Check tasks table or project.tasks
  const tasks = (state.project_tasks || []).filter(t => t.project_id === projectId);
  const legacyTasks = project.tasks || [];
  const allTasks = tasks.length > 0 ? tasks : legacyTasks;

  if (allTasks.length > 0) {
    const completedTasks = allTasks.filter(t => t.completed || t.status === 'Completed').length;
    return Math.round((completedTasks / allTasks.length) * 100);
  }

  // 2. Check features
  const features = (state.project_features || []).filter(f => f.project_id === projectId);
  if (features.length > 0) {
    const completedFeatures = features.filter(f => f.status === 'Completed').length;
    return Math.round((completedFeatures / features.length) * 100);
  }

  // 3. Check milestones
  const milestones = (state.project_milestones || []).filter(m => m.project_id === projectId);
  if (milestones.length > 0) {
    const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
    return Math.round((completedMilestones / milestones.length) * 100);
  }

  // If status is Completed, return 100, otherwise return project.progress or 0
  if (project.status === 'Completed') return 100;
  return project.progress || 0;
}

/**
 * Calculates high-level project analytics (Section 47)
 */
export function calculateProjectMetrics() {
  const state = getState();
  const projects = state.projects || [];
  const nonArchived = projects.filter(p => p.status !== 'Archived');

  const total = nonArchived.length;
  const active = nonArchived.filter(p => ['Planned', 'Building', 'Testing'].includes(p.status)).length;
  const completed = nonArchived.filter(p => p.status === 'Completed').length;
  const deployed = nonArchived.filter(p => p.status === 'Deployed' || (p.deployments && p.deployments.some(d => d.status === 'Deployed'))).length;
  const portfolioReady = nonArchived.filter(p => p.status === 'Portfolio Ready' || p.portfolio_status === 'Portfolio Ready').length;

  // Study hours
  const projectSessions = (state.studySessions || []).filter(s => s.category === 'Project');
  const totalMinutes = projectSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Average duration of completed projects (in days)
  const completedWithDates = nonArchived.filter(p => p.status === 'Completed' && p.start_date && (p.actual_completion_date || p.deadline || p.target_date));
  let avgDurationDays = 0;
  if (completedWithDates.length > 0) {
    const totalDays = completedWithDates.reduce((acc, p) => {
      const s = new Date(p.start_date).getTime();
      const e = new Date(p.actual_completion_date || p.deadline || p.target_date).getTime();
      const diff = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
      return acc + diff;
    }, 0);
    avgDurationDays = Math.round(totalDays / completedWithDates.length);
  }

  // Tasks & milestones completed
  const allTasks = state.project_tasks || [];
  let tasksCompleted = allTasks.filter(t => t.completed || t.status === 'Completed').length;
  // Also add legacy tasks if not populated
  if (tasksCompleted === 0) {
    projects.forEach(p => {
      tasksCompleted += (p.tasks || []).filter(t => t.completed).length;
    });
  }

  const allMilestones = state.project_milestones || [];
  const milestonesCompleted = allMilestones.filter(m => m.status === 'Completed').length;

  return {
    total,
    active,
    completed,
    deployed,
    portfolioReady,
    totalHours,
    avgDurationDays,
    tasksCompleted,
    milestonesCompleted,
    maxActiveProjects: state.max_active_projects || 2,
    isOverActiveLimit: active > (state.max_active_projects || 2)
  };
}

/**
 * Returns project hours breakdown: total, this week, this month, today (Section 18)
 */
export function getProjectHoursBreakdown(projectId = null) {
  const state = getState();
  const activeDate = state.activeDate || new Date().toISOString().split('T')[0];
  const activeMonth = activeDate.substring(0, 7); // 'YYYY-MM'

  // Determine current Monday-Sunday window
  const d = new Date(activeDate);
  const day = d.getDay(); // 0 Sun, 1 Mon...
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  const monStr = mon.toISOString().split('T')[0];
  const sunStr = sun.toISOString().split('T')[0];

  const sessions = (state.studySessions || []).filter(s => {
    if (s.category !== 'Project') return false;
    if (projectId) {
      return s.related_project_id === projectId || s.project_id === projectId || (s.topic && s.topic.includes(projectId));
    }
    return true;
  });

  let totalMins = 0;
  let weekMins = 0;
  let monthMins = 0;
  let todayMins = 0;

  sessions.forEach(s => {
    const mins = s.durationMinutes || 0;
    totalMins += mins;
    if (s.date === activeDate) todayMins += mins;
    if (s.date && s.date.startsWith(activeMonth)) monthMins += mins;
    if (s.date && s.date >= monStr && s.date <= sunStr) weekMins += mins;
  });

  return {
    totalHours: Math.round((totalMins / 60) * 10) / 10,
    weekHours: Math.round((weekMins / 60) * 10) / 10,
    monthHours: Math.round((monthMins / 60) * 10) / 10,
    todayHours: Math.round((todayMins / 60) * 10) / 10,
    sessionCount: sessions.length
  };
}

/**
 * Returns timeline statistics for a project: days elapsed, days remaining, isOverdue (Section 13)
 */
export function getProjectTimeline(project) {
  const state = getState();
  const activeDate = state.activeDate || new Date().toISOString().split('T')[0];
  const activeTime = new Date(activeDate).getTime();

  const startDate = project.start_date || project.startDate || activeDate;
  const targetDate = project.target_date || project.deadline || activeDate;
  const actualCompletionDate = project.actual_completion_date || null;

  const startTime = new Date(startDate).getTime();
  const targetTime = new Date(targetDate).getTime();

  const daysElapsed = Math.max(0, Math.floor((activeTime - startTime) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.ceil((targetTime - activeTime) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0 && project.status !== 'Completed';

  return {
    startDate,
    targetDate,
    actualCompletionDate,
    daysElapsed,
    daysRemaining,
    isOverdue
  };
}

// ==========================================
// CORE PROJECT CRUD
// ==========================================

export function getProjects({
  category = 'All',
  status = 'All',
  type = 'All',
  difficulty = 'All',
  technology = '',
  portfolioReadiness = 'All',
  deploymentStatus = 'All',
  search = '',
  includeArchived = false,
  sort = 'Recently Updated'
} = {}) {
  const state = getState();
  let list = [...(state.projects || [])];

  // 1. Archive filter
  if (!includeArchived) {
    list = list.filter(p => p.status !== 'Archived');
  } else if (status === 'Archived') {
    list = list.filter(p => p.status === 'Archived');
  }

  // 2. Status filter
  if (status !== 'All' && status !== 'Archived') {
    list = list.filter(p => p.status === status);
  }

  // 3. Category filter
  if (category !== 'All') {
    list = list.filter(p => p.category === category);
  }

  // 4. Type filter
  if (type !== 'All') {
    list = list.filter(p => p.type === type);
  }

  // 5. Difficulty filter
  if (difficulty !== 'All') {
    list = list.filter(p => (p.difficulty || 'Intermediate') === difficulty);
  }

  // 6. Technology filter
  if (technology) {
    const techLower = technology.toLowerCase();
    list = list.filter(p => {
      const pTech = (p.technology || '') + ' ' + ((p.technologies || []).map(t => t.name).join(' '));
      return pTech.toLowerCase().includes(techLower);
    });
  }

  // 7. Portfolio Readiness filter
  if (portfolioReadiness !== 'All') {
    list = list.filter(p => (p.portfolio_status || 'Not Ready') === portfolioReadiness);
  }

  // 8. Deployment status filter
  if (deploymentStatus !== 'All') {
    list = list.filter(p => (p.deploymentStatus || p.deployment_status || 'Not Deployed') === deploymentStatus);
  }

  // 9. Search filter
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(p => {
      const name = (p.name || p.title || '').toLowerCase();
      const desc = (p.description || p.short_description || '').toLowerCase();
      const tech = (p.technology || '').toLowerCase();
      const notes = (p.notes || '').toLowerCase();
      const taskMatches = (p.tasks || []).some(t => (t.title || '').toLowerCase().includes(q));
      return name.includes(q) || desc.includes(q) || tech.includes(q) || notes.includes(q) || taskMatches;
    });
  }

  // 10. Sorting
  list.sort((a, b) => {
    if (sort === 'Newest') {
      return (new Date(b.created_at || b.startDate || 0)) - (new Date(a.created_at || a.startDate || 0));
    }
    if (sort === 'Oldest') {
      return (new Date(a.created_at || a.startDate || 0)) - (new Date(b.created_at || b.startDate || 0));
    }
    if (sort === 'Target Date') {
      return (new Date(a.target_date || a.deadline || '2099-12-31')) - (new Date(b.target_date || b.deadline || '2099-12-31'));
    }
    if (sort === 'Progress') {
      return (b.progress || 0) - (a.progress || 0);
    }
    if (sort === 'Priority') {
      const priorityOrder = { Critical: 4, High: 3, Normal: 2, Low: 1 };
      return (priorityOrder[b.priority || 'Normal'] || 2) - (priorityOrder[a.priority || 'Normal'] || 2);
    }
    // Default: Recently Updated
    return (new Date(b.updated_at || b.created_at || 0)) - (new Date(a.updated_at || a.created_at || 0));
  });

  return list;
}

export function getProjectById(projectId) {
  const state = getState();
  const project = (state.projects || []).find(p => p.id === projectId);
  if (!project) return null;

  // Attach relational sub-entities
  const goals = (state.project_goals || []).filter(g => g.project_id === projectId);
  const features = (state.project_features || []).filter(f => f.project_id === projectId);
  const milestones = (state.project_milestones || []).filter(m => m.project_id === projectId);
  const tasks = (state.project_tasks || []).filter(t => t.project_id === projectId);
  const technologies = (state.project_technologies || []).filter(t => t.project_id === projectId);
  const github = (state.project_github && state.project_github[projectId]) || {
    repo_url: project.githubUrl || '',
    repo_name: '',
    visibility: 'Public',
    branch: 'main',
    last_updated: '',
    status: project.githubUrl ? 'Active' : 'Not Created',
    github_ready_checklist: {},
    readme_checklist: {}
  };
  const deployments = (state.project_deployments || []).filter(d => d.project_id === projectId);
  const tests = (state.project_tests || []).filter(t => t.project_id === projectId);
  const documentation = (state.project_documentation && state.project_documentation[projectId]) || {
    problem: project.problem_statement || '',
    solution: '',
    architecture: '',
    tech_choices: '',
    implementation: '',
    challenges: '',
    solutions: '',
    results: '',
    future_improvements: '',
    architecture_components: '',
    architecture_data_flow: '',
    architecture_image_ref: ''
  };
  const challenges = (state.project_challenges || []).filter(c => c.project_id === projectId);
  const learningLogs = (state.project_learning_logs || []).filter(l => l.project_id === projectId);
  const portfolio = (state.project_portfolio && state.project_portfolio[projectId]) || {
    demo_url: project.liveUrl || '',
    video_url: '',
    screenshots: '',
    presentation_file_ref: '',
    presentation_notes: '',
    quality_check: {
      code_quality: 'Not Checked',
      functionality: 'Not Checked',
      documentation: 'Not Checked',
      github: 'Not Checked',
      deployment: 'Not Checked',
      testing: 'Not Checked',
      presentation: 'Not Checked'
    },
    portfolio_readiness_checklist: {}
  };
  const resume = (state.project_resume && state.project_resume[projectId]) || {
    title: project.name || '',
    one_line_description: project.short_description || project.description || '',
    technologies: project.technology || '',
    achievement_result: '',
    project_url: project.liveUrl || '',
    github_url: project.githubUrl || '',
    resume_ready: false
  };
  const activity = (state.project_activity || []).filter(a => a.project_id === projectId);
  const sessions = (state.project_sessions || []).filter(s => s.project_id === projectId);

  return {
    ...project,
    goals,
    features,
    milestones,
    tasks: tasks.length > 0 ? tasks : (project.tasks || []),
    technologies,
    github,
    deployments,
    tests,
    documentation,
    challenges,
    learningLogs,
    portfolio,
    resume,
    activity,
    sessions,
    hoursBreakdown: getProjectHoursBreakdown(projectId),
    timeline: getProjectTimeline(project)
  };
}

/**
 * Creates a new project with all initial sub-records (Section 3)
 */
export function createProject(data) {
  const state = getState();
  const id = data.id || uid('proj');
  const now = new Date().toISOString();
  const dateStr = state.activeDate || now.split('T')[0];

  // Active projects count check
  const activeCount = (state.projects || []).filter(p => ['Planned', 'Building', 'Testing'].includes(p.status)).length;
  const maxActive = state.max_active_projects || 2;
  const willExceedLimit = ['Planned', 'Building', 'Testing'].includes(data.status || 'Planned') && activeCount >= maxActive;

  const newProject = {
    id,
    name: data.name || 'Untitled Project',
    title: data.name || 'Untitled Project',
    short_description: data.short_description || data.description || '',
    description: data.description || data.short_description || '',
    type: data.type || 'AI/ML Project',
    category: data.category || 'AI/ML Projects',
    difficulty: data.difficulty || 'Intermediate',
    priority: data.priority || 'Normal',
    portfolio_priority: data.portfolio_priority || 'Medium',
    status: data.status || 'Planned',
    portfolio_status: 'Not Ready',
    start_date: data.start_date || dateStr,
    startDate: data.start_date || dateStr,
    target_date: data.target_date || data.deadline || dateStr,
    deadline: data.target_date || data.deadline || dateStr,
    actual_completion_date: null,
    problem_statement: data.problem_statement || '',
    goal: data.goal || '',
    target_users: data.target_users || '',
    expected_outcome: data.expected_outcome || '',
    notes: data.notes || '',
    roadmap_topic_id: data.roadmap_topic_id || null,
    technology: data.technology || (Array.isArray(data.tech_stack) ? data.tech_stack.join(', ') : ''),
    tech_stack: Array.isArray(data.tech_stack) ? data.tech_stack : (data.technology ? data.technology.split(',').map(s => s.trim()) : (Array.isArray(data.technologies) ? data.technologies : [])),
    githubUrl: data.githubUrl || '',
    liveUrl: data.liveUrl || '',
    progress: 0,
    tasks: [],
    created_at: now,
    updated_at: now
  };

  // Log activity
  const newActivity = {
    id: uid('act'),
    project_id: id,
    timestamp: now,
    action_type: 'status_changed',
    description: `Created project "${newProject.name}" with status ${newProject.status}`
  };

  updateState(curr => ({
    ...curr,
    projects: [newProject, ...(curr.projects || [])],
    project_activity: [newActivity, ...(curr.project_activity || [])]
  }));

  return { project: newProject, warning: willExceedLimit ? `Active projects (${activeCount + 1}) exceeds recommended limit (${maxActive}). Stay focused!` : null };
}

/**
 * Updates project details & recalculates progress (Section 3, 5, 14)
 */
export function updateProject(projectId, updates) {
  const now = new Date().toISOString();
  let updatedProject = null;

  updateState(curr => {
    const projects = (curr.projects || []).map(p => {
      if (p.id === projectId) {
        updatedProject = {
          ...p,
          ...updates,
          updated_at: now
        };
        // Keep title and name in sync
        if (updates.name) updatedProject.title = updates.name;
        if (updates.start_date) updatedProject.startDate = updates.start_date;
        if (updates.target_date) updatedProject.deadline = updates.target_date;

        // Recalculate progress
        updatedProject.progress = calculateProjectProgress(projectId);

        // Actual completion date
        if (updates.status === 'Completed' && !updatedProject.actual_completion_date) {
          updatedProject.actual_completion_date = now.split('T')[0];
        }
        return updatedProject;
      }
      return p;
    });

    return { ...curr, projects };
  });

  return updatedProject;
}

/**
 * Archive project (Section 38)
 */
export function archiveProject(projectId) {
  return updateProject(projectId, { status: 'Archived' });
}

/**
 * Restore archived project (Section 38)
 */
export function restoreProject(projectId, targetStatus = 'Planned') {
  return updateProject(projectId, { status: targetStatus });
}

/**
 * Delete project
 */
export function deleteProject(projectId) {
  updateState(curr => ({
    ...curr,
    projects: (curr.projects || []).filter(p => p.id !== projectId),
    project_tasks: (curr.project_tasks || []).filter(t => t.project_id !== projectId),
    project_milestones: (curr.project_milestones || []).filter(m => m.project_id !== projectId),
    project_features: (curr.project_features || []).filter(f => f.project_id !== projectId),
    project_goals: (curr.project_goals || []).filter(g => g.project_id !== projectId),
    project_challenges: (curr.project_challenges || []).filter(c => c.project_id !== projectId),
    project_learning_logs: (curr.project_learning_logs || []).filter(l => l.project_id !== projectId)
  }));
  return true;
}

// ==========================================
// TASKS & HIERARCHY (Sections 10, 11, 14)
// ==========================================

export function addProjectTask(projectId, taskData) {
  const state = getState();
  const id = taskData.id || uid('pt');
  const now = new Date().toISOString();
  const dateStr = state.activeDate || now.split('T')[0];

  const newTask = {
    id,
    project_id: projectId,
    milestone_id: taskData.milestone_id || null,
    feature_id: taskData.feature_id || null,
    title: taskData.title || 'New Task',
    description: taskData.description || '',
    status: taskData.status || 'Not Started',
    priority: taskData.priority || 'Normal',
    estimated_hours: parseFloat(taskData.estimated_hours) || 2,
    actual_hours: parseFloat(taskData.actual_hours) || 0,
    start_date: taskData.start_date || dateStr,
    due_date: taskData.due_date || dateStr,
    completed: taskData.status === 'Completed' || taskData.completed === true,
    completed_at: (taskData.status === 'Completed' || taskData.completed) ? now : null,
    subtasks: taskData.subtasks || []
  };

  updateState(curr => {
    const existing = curr.project_tasks || [];
    const updatedTasks = [...existing, newTask];

    // Also update legacy project.tasks array for backwards-compatibility
    const projects = (curr.projects || []).map(p => {
      if (p.id === projectId) {
        const legacy = [...(p.tasks || []), { id: newTask.id, title: newTask.title, completed: newTask.completed }];
        const completedCount = legacy.filter(t => t.completed).length;
        const progress = Math.round((completedCount / legacy.length) * 100);
        return { ...p, tasks: legacy, progress, updated_at: now };
      }
      return p;
    });

    const newActivity = {
      id: uid('act'),
      project_id: projectId,
      timestamp: now,
      action_type: 'task_completed',
      description: `Added task: "${newTask.title}"`
    };

    return {
      ...curr,
      project_tasks: updatedTasks,
      projects,
      project_activity: [newActivity, ...(curr.project_activity || [])]
    };
  });

  return newTask;
}

export function updateProjectTask(projectId, taskId, updates) {
  const now = new Date().toISOString();
  let updatedTask = null;

  updateState(curr => {
    const tasks = (curr.project_tasks || []).map(t => {
      if (t.id === taskId) {
        const isCompleted = updates.status === 'Completed' || updates.completed === true;
        updatedTask = {
          ...t,
          ...updates,
          completed: isCompleted,
          completed_at: isCompleted ? (t.completed_at || now) : null
        };
        return updatedTask;
      }
      return t;
    });

    // Sync legacy project.tasks
    const projects = (curr.projects || []).map(p => {
      if (p.id === projectId) {
        const legacy = (p.tasks || []).map(lt => {
          if (lt.id === taskId) {
            return {
              ...lt,
              title: updates.title || lt.title,
              completed: updates.status === 'Completed' || updates.completed === true
            };
          }
          return lt;
        });
        const completedCount = legacy.filter(lt => lt.completed).length;
        const progress = legacy.length > 0 ? Math.round((completedCount / legacy.length) * 100) : p.progress;
        return { ...p, tasks: legacy, progress, updated_at: now };
      }
      return p;
    });

    return { ...curr, project_tasks: tasks, projects };
  });

  return updatedTask;
}

/**
 * Toggles a project task completed status and triggers bi-directional sync (Section 14, 15, 55)
 */
export function toggleProjectTask(projectId, taskId, isCompleted) {
  const now = new Date().toISOString();
  const state = getState();
  const dateStr = state.activeDate || now.split('T')[0];

  updateState(curr => {
    // 1. Update project_tasks table
    const tasks = (curr.project_tasks || []).map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: isCompleted ? 'Completed' : 'In Progress',
          completed: isCompleted,
          completed_at: isCompleted ? now : null
        };
      }
      return t;
    });

    // 2. Update project and legacy tasks
    let taskTitle = '';
    const projects = (curr.projects || []).map(p => {
      if (p.id === projectId) {
        const legacy = (p.tasks || []).map(lt => {
          if (lt.id === taskId) {
            taskTitle = lt.title;
            return { ...lt, completed: isCompleted };
          }
          return lt;
        });

        // Calculate progress from lowest level
        const allT = tasks.filter(t => t.project_id === projectId);
        const sourceTasks = allT.length > 0 ? allT : legacy;
        const completedCount = sourceTasks.filter(t => t.completed || t.status === 'Completed').length;
        const progress = sourceTasks.length > 0 ? Math.round((completedCount / sourceTasks.length) * 100) : p.progress;

        return {
          ...p,
          tasks: legacy,
          progress,
          status: progress === 100 ? (p.status === 'Completed' ? 'Completed' : 'Testing') : (progress > 0 && p.status === 'Planned' ? 'Building' : p.status),
          updated_at: now
        };
      }
      return p;
    });

    // 3. Sync Daily Tasks (Section 15, 55)
    // If today's task is connected to this project task, update it
    const dailyTasks = (curr.dailyTasks || curr.daily_tasks || []).map(dt => {
      if ((dt.related_project_id === projectId && dt.related_project_task_id === taskId) ||
          (dt.related_project_id === projectId && taskTitle && dt.title.includes(taskTitle))) {
        return {
          ...dt,
          completed: isCompleted,
          status: isCompleted ? 'Completed' : 'In Progress',
          completion_date: isCompleted ? dateStr : null
        };
      }
      return dt;
    });

    // 4. Log activity
    const newActivity = {
      id: uid('act'),
      project_id: projectId,
      timestamp: now,
      action_type: 'task_completed',
      description: isCompleted ? `Completed task "${taskTitle || taskId}"` : `Marked task "${taskTitle || taskId}" in progress`
    };

    return {
      ...curr,
      project_tasks: tasks,
      projects,
      dailyTasks,
      daily_tasks: dailyTasks,
      project_activity: [newActivity, ...(curr.project_activity || [])]
    };
  });

  return true;
}

export function deleteProjectTask(projectId, taskId) {
  updateState(curr => {
    const tasks = (curr.project_tasks || []).filter(t => t.id !== taskId);
    const projects = (curr.projects || []).map(p => {
      if (p.id === projectId) {
        const legacy = (p.tasks || []).filter(lt => lt.id !== taskId);
        const completedCount = legacy.filter(lt => lt.completed).length;
        const progress = legacy.length > 0 ? Math.round((completedCount / legacy.length) * 100) : 0;
        return { ...p, tasks: legacy, progress };
      }
      return p;
    });
    return { ...curr, project_tasks: tasks, projects };
  });
  return true;
}

// ==========================================
// MILESTONES (Section 12)
// ==========================================

export function addProjectMilestone(projectId, data) {
  const id = data.id || uid('ms');
  const now = new Date().toISOString();

  const newMilestone = {
    id,
    project_id: projectId,
    title: data.title || 'New Milestone',
    description: data.description || '',
    target_date: data.target_date || now.split('T')[0],
    status: data.status || 'Planned',
    progress: data.progress || 0
  };

  updateState(curr => ({
    ...curr,
    project_milestones: [...(curr.project_milestones || []), newMilestone]
  }));

  return newMilestone;
}

export function updateProjectMilestone(projectId, milestoneId, updates) {
  let updated = null;
  const now = new Date().toISOString();

  updateState(curr => {
    const milestones = (curr.project_milestones || []).map(m => {
      if (m.id === milestoneId) {
        updated = { ...m, ...updates };
        return updated;
      }
      return m;
    });

    let newActivity = null;
    if (updates.status === 'Completed') {
      newActivity = {
        id: uid('act'),
        project_id: projectId,
        timestamp: now,
        action_type: 'milestone_completed',
        description: `Completed milestone: "${updated.title}"`
      };
    }

    return {
      ...curr,
      project_milestones: milestones,
      project_activity: newActivity ? [newActivity, ...(curr.project_activity || [])] : (curr.project_activity || [])
    };
  });

  return updated;
}

// ==========================================
// GOALS & FEATURES (Sections 7, 8)
// ==========================================

export function addProjectGoal(projectId, data) {
  const id = data.id || uid('goal');
  const newGoal = {
    id,
    project_id: projectId,
    name: data.name || 'New Goal',
    description: data.description || '',
    status: data.status || 'Not Started',
    progress: data.progress || 0
  };

  updateState(curr => ({
    ...curr,
    project_goals: [...(curr.project_goals || []), newGoal]
  }));

  return newGoal;
}

export function updateProjectGoal(projectId, goalId, updates) {
  updateState(curr => ({
    ...curr,
    project_goals: (curr.project_goals || []).map(g => g.id === goalId ? { ...g, ...updates } : g)
  }));
  return true;
}

export function addProjectFeature(projectId, data) {
  const id = data.id || uid('feat');
  const newFeature = {
    id,
    project_id: projectId,
    milestone_id: data.milestone_id || null,
    name: data.name || 'New Feature',
    description: data.description || '',
    status: data.status || 'Not Started'
  };

  updateState(curr => ({
    ...curr,
    project_features: [...(curr.project_features || []), newFeature]
  }));

  return newFeature;
}

export function updateProjectFeature(projectId, featureId, updates) {
  updateState(curr => ({
    ...curr,
    project_features: (curr.project_features || []).map(f => f.id === featureId ? { ...f, ...updates } : f)
  }));
  return true;
}

// ==========================================
// TECHNOLOGIES (Section 9)
// ==========================================

export function addProjectTechnology(projectId, techName, category = 'Other') {
  const id = uid('tech');
  updateState(curr => {
    const list = curr.project_technologies || [];
    if (list.some(t => t.project_id === projectId && t.name.toLowerCase() === techName.toLowerCase())) {
      return curr;
    }
    const updated = [...list, { id, project_id: projectId, name: techName, category }];

    // Also update project.technology string
    const projects = (curr.projects || []).map(p => {
      if (p.id === projectId) {
        const existingTechs = (p.technology || '').split(',').map(s => s.trim()).filter(Boolean);
        if (!existingTechs.includes(techName)) {
          existingTechs.push(techName);
        }
        return { ...p, technology: existingTechs.join(', ') };
      }
      return p;
    });

    return { ...curr, project_technologies: updated, projects };
  });
  return true;
}

export function removeProjectTechnology(projectId, techId) {
  updateState(curr => ({
    ...curr,
    project_technologies: (curr.project_technologies || []).filter(t => t.id !== techId)
  }));
  return true;
}

// ==========================================
// GITHUB CHECKLISTS (Sections 20, 21, 22)
// ==========================================

export function updateProjectGitHub(projectId, githubData) {
  const now = new Date().toISOString();
  updateState(curr => {
    const ghMap = { ...(curr.project_github || {}) };
    const prev = ghMap[projectId] || { github_ready_checklist: {}, readme_checklist: {} };

    ghMap[projectId] = {
      ...prev,
      ...githubData,
      github_ready_checklist: githubData.github_ready_checklist || prev.github_ready_checklist || {},
      readme_checklist: githubData.readme_checklist || prev.readme_checklist || {},
      last_updated: now
    };

    // Keep project.githubUrl in sync
    const projects = (curr.projects || []).map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          githubUrl: githubData.repo_url !== undefined ? githubData.repo_url : p.githubUrl
        };
      }
      return p;
    });

    const newActivity = {
      id: uid('act'),
      project_id: projectId,
      timestamp: now,
      action_type: 'github_updated',
      description: 'Updated GitHub repository metadata & checklists'
    };

    return {
      ...curr,
      project_github: ghMap,
      projects,
      project_activity: [newActivity, ...(curr.project_activity || [])]
    };
  });
  return true;
}

export function toggleGitHubChecklistItem(projectId, itemKey) {
  const state = getState();
  const gh = (state.project_github && state.project_github[projectId]) || { github_ready_checklist: {} };
  const currentVal = !!gh.github_ready_checklist?.[itemKey];
  const updatedChecklist = { ...(gh.github_ready_checklist || {}), [itemKey]: !currentVal };
  return updateProjectGitHub(projectId, { github_ready_checklist: updatedChecklist });
}

export function toggleReadmeChecklistItem(projectId, itemKey) {
  const state = getState();
  const gh = (state.project_github && state.project_github[projectId]) || { readme_checklist: {} };
  const currentVal = !!gh.readme_checklist?.[itemKey];
  const updatedChecklist = { ...(gh.readme_checklist || {}), [itemKey]: !currentVal };
  return updateProjectGitHub(projectId, { readme_checklist: updatedChecklist });
}

// ==========================================
// DEPLOYMENT TRACKING (Sections 23, 24)
// ==========================================

export function addOrUpdateDeployment(projectId, deployData) {
  const id = deployData.id || uid('dep');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  updateState(curr => {
    const list = curr.project_deployments || [];
    const existingIndex = list.findIndex(d => d.id === id);

    const record = {
      id,
      project_id: projectId,
      platform: deployData.platform || 'Vercel',
      url: deployData.url || '',
      deployment_date: deployData.deployment_date || dateStr,
      environment: deployData.environment || 'Production',
      status: deployData.status || 'Deployed',
      checklist: deployData.checklist || (existingIndex >= 0 ? list[existingIndex].checklist : {})
    };

    let updatedList;
    if (existingIndex >= 0) {
      updatedList = list.map((d, i) => i === existingIndex ? record : d);
    } else {
      updatedList = [...list, record];
    }

    // Update project deployment status & liveUrl
    const projects = (curr.projects || []).map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          liveUrl: record.url || p.liveUrl,
          deploymentStatus: record.status,
          status: record.status === 'Deployed' && p.status !== 'Completed' && p.status !== 'Portfolio Ready' ? 'Deployed' : p.status
        };
      }
      return p;
    });

    const newActivity = {
      id: uid('act'),
      project_id: projectId,
      timestamp: now,
      action_type: 'deployment_updated',
      description: `Deployment on ${record.platform}: status set to ${record.status}`
    };

    return {
      ...curr,
      project_deployments: updatedList,
      projects,
      project_activity: [newActivity, ...(curr.project_activity || [])]
    };
  });

  return id;
}

export function toggleDeploymentChecklistItem(projectId, deployId, itemKey) {
  const state = getState();
  const dep = (state.project_deployments || []).find(d => d.id === deployId);
  if (!dep) return false;
  const currentVal = !!dep.checklist?.[itemKey];
  const checklist = { ...(dep.checklist || {}), [itemKey]: !currentVal };
  return addOrUpdateDeployment(projectId, { ...dep, checklist });
}

// ==========================================
// TESTING SECTION (Section 25)
// ==========================================

export function updateProjectTest(projectId, testData) {
  const id = testData.id || `test-${testData.category.toLowerCase().replace(/\s+/g, '-')}`;
  updateState(curr => {
    const list = curr.project_tests || [];
    const existingIndex = list.findIndex(t => t.id === id && t.project_id === projectId);
    const record = {
      id,
      project_id: projectId,
      category: testData.category,
      name: testData.name || testData.category,
      status: testData.status || 'Not Tested',
      notes: testData.notes || ''
    };

    let updatedList;
    if (existingIndex >= 0) {
      updatedList = list.map((t, i) => i === existingIndex ? { ...t, ...record } : t);
    } else {
      updatedList = [...list, record];
    }

    return { ...curr, project_tests: updatedList };
  });
  return true;
}

// ==========================================
// DOCUMENTATION & ARCHITECTURE (Sections 26, 27)
// ==========================================

export function updateProjectDocumentation(projectId, docData) {
  const now = new Date().toISOString();
  updateState(curr => {
    const docMap = { ...(curr.project_documentation || {}) };
    const prev = docMap[projectId] || {};
    docMap[projectId] = { ...prev, ...docData, last_updated: now };

    const newActivity = {
      id: uid('act'),
      project_id: projectId,
      timestamp: now,
      action_type: 'documentation_updated',
      description: 'Updated project documentation & architecture notes'
    };

    return {
      ...curr,
      project_documentation: docMap,
      project_activity: [newActivity, ...(curr.project_activity || [])]
    };
  });
  return true;
}

// ==========================================
// CHALLENGES & LEARNING LOG (Sections 28, 29, 48)
// ==========================================

export function addProjectChallenge(projectId, data) {
  const id = uid('chal');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  const newChallenge = {
    id,
    project_id: projectId,
    problem: data.problem || '',
    what_i_tried: data.what_i_tried || '',
    final_solution: data.final_solution || '',
    what_i_learned: data.what_i_learned || '',
    date: dateStr
  };

  updateState(curr => ({
    ...curr,
    project_challenges: [newChallenge, ...(curr.project_challenges || [])]
  }));

  return newChallenge;
}

export function addProjectLearningLog(projectId, data) {
  const id = uid('llog');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  const newLog = {
    id,
    project_id: projectId,
    title: data.title || 'Learning Insight',
    content: data.content || '',
    date: data.date || dateStr
  };

  updateState(curr => ({
    ...curr,
    project_learning_logs: [newLog, ...(curr.project_learning_logs || [])]
  }));

  return newLog;
}

// ==========================================
// PORTFOLIO READINESS & QUALITY CHECK (Sections 30, 31, 41, 42, 43)
// ==========================================

export function updateProjectPortfolio(projectId, data) {
  updateState(curr => {
    const pMap = { ...(curr.project_portfolio || {}) };
    const prev = pMap[projectId] || { quality_check: {}, portfolio_readiness_checklist: {} };

    pMap[projectId] = {
      ...prev,
      ...data,
      quality_check: data.quality_check || prev.quality_check || {},
      portfolio_readiness_checklist: data.portfolio_readiness_checklist || prev.portfolio_readiness_checklist || {}
    };

    return { ...curr, project_portfolio: pMap };
  });
  return true;
}

export function updateProjectQualityCheck(projectId, checkItem, value) {
  const state = getState();
  const pMap = state.project_portfolio && state.project_portfolio[projectId] ? state.project_portfolio[projectId] : {};
  const currentQc = pMap.quality_check || {};
  const updatedQc = { ...currentQc, [checkItem]: value };
  return updateProjectPortfolio(projectId, { quality_check: updatedQc });
}

export function togglePortfolioReadinessChecklistItem(projectId, itemKey) {
  const state = getState();
  const pMap = state.project_portfolio && state.project_portfolio[projectId] ? state.project_portfolio[projectId] : {};
  const currentVal = !!pMap.portfolio_readiness_checklist?.[itemKey];
  const updatedChecklist = { ...(pMap.portfolio_readiness_checklist || {}), [itemKey]: !currentVal };
  return updateProjectPortfolio(projectId, { portfolio_readiness_checklist: updatedChecklist });
}

/**
 * Explicitly marks project as Portfolio Ready (Section 31, 42)
 * Only when user explicitly triggers it!
 */
export function markPortfolioReady(projectId) {
  const now = new Date().toISOString();
  updateProject(projectId, {
    portfolio_status: 'Portfolio Ready',
    status: 'Portfolio Ready'
  });

  const newActivity = {
    id: uid('act'),
    project_id: projectId,
    timestamp: now,
    action_type: 'status_changed',
    description: 'Explicitly marked project as Portfolio Ready'
  };

  updateState(curr => ({
    ...curr,
    project_activity: [newActivity, ...(curr.project_activity || [])]
  }));

  return true;
}

// ==========================================
// RESUME BULLET POINTS (Section 32)
// ==========================================

export function updateProjectResume(projectId, resumeData) {
  updateState(curr => {
    const resMap = { ...(curr.project_resume || {}) };
    const prev = resMap[projectId] || {};
    resMap[projectId] = { ...prev, ...resumeData };
    return { ...curr, project_resume: resMap };
  });
  return true;
}

// ==========================================
// STUDY SESSION & TIME TRACKING (Sections 18, 19)
// ==========================================

/**
 * Logs project study session into project_sessions AND studySessions (without double-counting)
 */
export function logProjectSession(projectId, { milestone_id = null, task_id = null, durationMinutes, notes = '' }) {
  const state = getState();
  const now = new Date().toISOString();
  const dateStr = state.activeDate || now.split('T')[0];
  const project = (state.projects || []).find(p => p.id === projectId);
  const projectName = project ? project.name : 'Project';

  const sessionId = uid('sess-proj');

  // 1. Create standard studySessions record
  const studySession = {
    id: sessionId,
    date: dateStr,
    durationMinutes: parseInt(durationMinutes, 10) || 30,
    category: 'Project',
    topic: `${projectName}${task_id ? ` · ${task_id}` : ''}`,
    notes: notes || `Work on ${projectName}`,
    related_project_id: projectId,
    related_project_task_id: task_id,
    timestamp: now
  };

  // 2. Create project_sessions record
  const projectSession = {
    id: uid('psess'),
    project_id: projectId,
    milestone_id,
    task_id,
    date: dateStr,
    duration_minutes: parseInt(durationMinutes, 10) || 30,
    notes,
    study_session_id: sessionId
  };

  // 3. Log activity
  const newActivity = {
    id: uid('act'),
    project_id: projectId,
    timestamp: now,
    action_type: 'session_logged',
    description: `Logged work session: ${durationMinutes} minutes`
  };

  updateState(curr => ({
    ...curr,
    studySessions: [studySession, ...(curr.studySessions || [])],
    project_sessions: [projectSession, ...(curr.project_sessions || [])],
    project_activity: [newActivity, ...(curr.project_activity || [])]
  }));

  return { sessionId, projectSessionId: projectSession.id };
}

// ==========================================
// PROJECT COMPLETION SUMMARY (Section 46)
// ==========================================

export function getProjectCompletionSummary(projectId) {
  const p = getProjectById(projectId);
  if (!p) return null;

  const totalTasks = p.tasks.length;
  const completedTasks = p.tasks.filter(t => t.completed || t.status === 'Completed').length;

  const totalMilestones = p.milestones.length;
  const completedMilestones = p.milestones.filter(m => m.status === 'Completed').length;

  return {
    projectId,
    name: p.name,
    tasks: { completed: completedTasks, total: totalTasks },
    milestones: { completed: completedMilestones, total: totalMilestones },
    githubStatus: p.github?.status || (p.githubUrl ? 'Created' : 'Not Created'),
    deploymentStatus: p.deployments?.[0]?.status || p.deploymentStatus || 'Not Deployed',
    documentationStatus: (p.documentation?.problem && p.documentation?.solution) ? 'Drafted' : 'Minimal',
    portfolioStatus: p.portfolio_status || 'Not Ready',
    canComplete: true
  };
}

export function markProjectCompleted(projectId) {
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  updateProject(projectId, {
    status: 'Completed',
    actual_completion_date: dateStr,
    progress: 100
  });

  const newActivity = {
    id: uid('act'),
    project_id: projectId,
    timestamp: now,
    action_type: 'status_changed',
    description: 'Explicitly marked project as Completed! 🎉'
  };

  updateState(curr => ({
    ...curr,
    project_activity: [newActivity, ...(curr.project_activity || [])]
  }));

  return true;
}

// ==========================================
// PROJECT IDEAS INCUBATOR (Section 44)
// ==========================================

export function addProjectIdea(data) {
  const id = uid('idea');
  const newIdea = {
    id,
    name: data.name || 'Untitled Idea',
    problem: data.problem || '',
    category: data.category || 'AI/ML Projects',
    difficulty: data.difficulty || 'Intermediate',
    potential_technologies: data.potential_technologies || '',
    why_useful: data.why_useful || '',
    notes: data.notes || '',
    converted_to_project_id: null
  };

  updateState(curr => ({
    ...curr,
    project_ideas: [newIdea, ...(curr.project_ideas || [])]
  }));

  return newIdea;
}

/**
 * Converts idea to project: Creates ONE project record, does not duplicate the idea (Section 44)
 */
export function convertIdeaToProject(ideaId) {
  const state = getState();
  const idea = (state.project_ideas || []).find(i => i.id === ideaId);
  if (!idea) return null;

  if (idea.converted_to_project_id) {
    // Already converted, return existing project
    return getProjectById(idea.converted_to_project_id);
  }

  // Create project
  const result = createProject({
    name: idea.name,
    problem_statement: idea.problem,
    category: idea.category,
    difficulty: idea.difficulty,
    technology: idea.potential_technologies,
    notes: `${idea.why_useful ? `Why Useful: ${idea.why_useful}\n\n` : ''}${idea.notes || ''}`,
    status: 'Planned'
  });

  const projectId = result.project.id;

  // Mark idea as converted
  updateState(curr => ({
    ...curr,
    project_ideas: (curr.project_ideas || []).map(i => i.id === ideaId ? { ...i, converted_to_project_id: projectId } : i)
  }));

  return result.project;
}

// ==========================================
// CSV EXPORT (Section 58)
// ==========================================

export function exportPortfolioCSV() {
  const state = getState();
  const projects = state.projects || [];

  const headers = ['Project', 'Description', 'Technologies', 'GitHub', 'Demo', 'Status', 'Portfolio Readiness'];
  const rows = projects.map(p => {
    const full = getProjectById(p.id);
    const tech = full.technologies?.map(t => t.name).join(', ') || p.technology || '';
    const gh = full.github?.repo_url || p.githubUrl || '';
    const demo = full.portfolio?.demo_url || full.deployments?.[0]?.url || p.liveUrl || '';
    const escapeCsv = (str) => `"${(str || '').replace(/"/g, '""')}"`;

    return [
      escapeCsv(p.name || p.title),
      escapeCsv(p.description || p.short_description),
      escapeCsv(tech),
      escapeCsv(gh),
      escapeCsv(demo),
      escapeCsv(p.status),
      escapeCsv(p.portfolio_status || 'Not Ready')
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// ==========================================
// WEEKLY SUMMARY HELPER (Section 56)
// ==========================================

export function getWeeklyProjectsSummary(weekKey = null) {
  const state = getState();
  const activeDate = state.activeDate || new Date().toISOString().split('T')[0];

  // Current week Mon-Sun
  const d = new Date(activeDate);
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  const monStr = mon.toISOString().split('T')[0];
  const sunStr = sun.toISOString().split('T')[0];

  const sessions = (state.studySessions || []).filter(s => s.category === 'Project' && s.date >= monStr && s.date <= sunStr);

  const projectMap = {};
  sessions.forEach(s => {
    const pId = s.related_project_id || (s.topic ? s.topic.split(' · ')[0] : 'General');
    if (!projectMap[pId]) {
      projectMap[pId] = { id: pId, name: s.topic || 'Project Work', minutes: 0, sessions: 0 };
    }
    projectMap[pId].minutes += (s.durationMinutes || 0);
    projectMap[pId].sessions += 1;
  });

  const summary = Object.values(projectMap).map(p => {
    const fullProj = (state.projects || []).find(proj => proj.id === p.id || proj.name === p.name);
    const completedTasksCount = fullProj ? (fullProj.tasks || []).filter(t => t.completed).length : 0;
    const currentMilestone = fullProj?.milestones?.find(m => m.status === 'In Progress') || fullProj?.milestones?.[0];

    return {
      id: p.id,
      name: fullProj ? fullProj.name : p.name,
      hours: Math.round((p.minutes / 60) * 10) / 10,
      sessions: p.sessions,
      tasksCompleted: completedTasksCount,
      currentMilestone: currentMilestone?.title || 'Core Development'
    };
  });

  return summary;
}

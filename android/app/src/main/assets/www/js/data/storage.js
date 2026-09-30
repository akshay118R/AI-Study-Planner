/**
 * Akshay's 12-Month AI/ML Career OS - Storage & Persistence Engine
 * Handles reactive updates, localStorage persistence, JSON backup & recovery.
 */
import { createInitialState } from './initialState.js';

const STORAGE_KEY = 'akshay_career_os_v1';
const LISTENERS = new Set();

let currentState = null;

export function initStorage() {
  const initial = createInitialState();
  try {
    if (typeof localStorage !== 'undefined') {
      const PROD_RESET_FLAG = 'akshay_career_os_prod_clean_final_20261001_v3';
      if (!localStorage.getItem(PROD_RESET_FLAG)) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('career_tracker_simulated_date');
        localStorage.setItem(PROD_RESET_FLAG, 'true');
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Ensure Phase 2 entities exist even if migrating from earlier session
        if (!parsed.roadmap_topics || !parsed.roadmap_topics.length) {
          parsed.roadmap_year = initial.roadmap_year;
          parsed.roadmap_months = initial.roadmap_months;
          parsed.roadmap_topics = initial.roadmap_topics;
          parsed.roadmap_subtopics = initial.roadmap_subtopics;
          parsed.prime_topics = initial.prime_topics;
          parsed.prime_modules = initial.prime_modules;
        }
        // Ensure Phase 3 entities exist
        if (!parsed.daily_reviews) parsed.daily_reviews = initial.daily_reviews;
        if (!parsed.dailyReviews) parsed.dailyReviews = initial.dailyReviews;
        if (!parsed.daily_task_logs) parsed.daily_task_logs = initial.daily_task_logs;
        if (!parsed.daily_tasks) parsed.daily_tasks = parsed.dailyTasks || initial.daily_tasks;
        if (!parsed.dsa_daily_targets) parsed.dsa_daily_targets = initial.dsa_daily_targets;
        if (!parsed.dsaTargets) parsed.dsaTargets = initial.dsaTargets;
        if (!parsed.recoveryDaysUsed) parsed.recoveryDaysUsed = initial.recoveryDaysUsed;
        if (!parsed.studySchedule?.scheduleByDay) parsed.studySchedule = initial.studySchedule;
        // Ensure Phase 4 entities exist
        if (!parsed.monthly_targets) parsed.monthly_targets = initial.monthly_targets;
        if (!parsed.monthlyTargets) parsed.monthlyTargets = initial.monthlyTargets;
        if (!parsed.monthly_goals) parsed.monthly_goals = initial.monthly_goals;
        if (!parsed.monthly_reviews) parsed.monthly_reviews = initial.monthly_reviews;
        if (!parsed.monthly_priorities) parsed.monthly_priorities = initial.monthly_priorities;
        if (!parsed.monthly_topic_status) parsed.monthly_topic_status = initial.monthly_topic_status;
        if (!parsed.monthly_statistics) parsed.monthly_statistics = initial.monthly_statistics;
        if (!parsed.monthly_deadlines) parsed.monthly_deadlines = initial.monthly_deadlines;
        if (!parsed.monthly_reschedules) parsed.monthly_reschedules = initial.monthly_reschedules;
        if (!parsed.weekly_goals) parsed.weekly_goals = initial.weekly_goals;
        // Ensure Phase 5 entities exist
        if (!parsed.dsa_problems) parsed.dsa_problems = parsed.dsaProblems || [];
        if (!parsed.dsaProblems) parsed.dsaProblems = parsed.dsa_problems || [];
        if (!parsed.dsa_attempts) parsed.dsa_attempts = initial.dsa_attempts || [];
        if (!parsed.dsa_sessions) parsed.dsa_sessions = initial.dsa_sessions || [];
        if (!parsed.dsa_patterns) parsed.dsa_patterns = initial.dsa_patterns || [];
        if (!parsed.dsa_problem_patterns) parsed.dsa_problem_patterns = initial.dsa_problem_patterns || [];
        if (!parsed.dsa_revisions) parsed.dsa_revisions = initial.dsa_revisions || [];
        if (!parsed.dsa_mistakes) parsed.dsa_mistakes = initial.dsa_mistakes || [];
        if (!parsed.dsa_bookmarks) parsed.dsa_bookmarks = initial.dsa_bookmarks || [];
        // Ensure Phase 6 entities exist
        if (!parsed.projects || !parsed.projects.length) parsed.projects = initial.projects;
        if (!parsed.project_goals) parsed.project_goals = initial.project_goals || [];
        if (!parsed.project_features) parsed.project_features = initial.project_features || [];
        if (!parsed.project_milestones) parsed.project_milestones = initial.project_milestones || [];
        if (!parsed.project_tasks) parsed.project_tasks = initial.project_tasks || [];
        if (!parsed.project_sessions) parsed.project_sessions = initial.project_sessions || [];
        if (!parsed.project_technologies) parsed.project_technologies = initial.project_technologies || [];
        if (!parsed.project_github) parsed.project_github = initial.project_github || {};
        if (!parsed.project_deployments) parsed.project_deployments = initial.project_deployments || [];
        if (!parsed.project_tests) parsed.project_tests = initial.project_tests || [];
        if (!parsed.project_documentation) parsed.project_documentation = initial.project_documentation || {};
        if (!parsed.project_challenges) parsed.project_challenges = initial.project_challenges || [];
        if (!parsed.project_learning_logs) parsed.project_learning_logs = initial.project_learning_logs || [];
        if (!parsed.project_portfolio) parsed.project_portfolio = initial.project_portfolio || {};
        if (!parsed.project_resume) parsed.project_resume = initial.project_resume || {};
        if (!parsed.project_activity) parsed.project_activity = initial.project_activity || [];
        if (!parsed.project_ideas) parsed.project_ideas = initial.project_ideas || [];
        if (!parsed.max_active_projects) parsed.max_active_projects = initial.max_active_projects || 2;
        // Ensure Phase 7 Career entities exist
        if (!parsed.career_profile) parsed.career_profile = initial.career_profile;
        if (!parsed.career_checklist) parsed.career_checklist = initial.career_checklist;
        if (!parsed.resume_versions) parsed.resume_versions = initial.resume_versions || [];
        if (!parsed.resume_checklist) parsed.resume_checklist = initial.resume_checklist;
        if (!parsed.coding_profiles) parsed.coding_profiles = initial.coding_profiles || [];
        if (!parsed.github_profile) parsed.github_profile = initial.github_profile;
        if (!parsed.linkedin_profile) parsed.linkedin_profile = initial.linkedin_profile;
        if (!parsed.career_achievements) parsed.career_achievements = initial.career_achievements || [];
        if (!parsed.certifications) parsed.certifications = initial.certifications || [];
        if (!parsed.internships) parsed.internships = initial.internships || [];
        if (!parsed.applications) parsed.applications = initial.applications || [];
        if (!parsed.application_events) parsed.application_events = initial.application_events || [];
        if (!parsed.application_followups) parsed.application_followups = initial.application_followups || [];
        if (!parsed.outreach) parsed.outreach = initial.outreach || [];
        if (!parsed.referrals) parsed.referrals = initial.referrals || [];
        if (!parsed.networking) parsed.networking = initial.networking || [];
        if (!parsed.aptitude_sessions) parsed.aptitude_sessions = initial.aptitude_sessions || [];
        if (!parsed.technical_topics) parsed.technical_topics = initial.technical_topics || [];
        if (!parsed.interview_questions) parsed.interview_questions = initial.interview_questions || [];
        if (!parsed.mock_interviews) parsed.mock_interviews = initial.mock_interviews || [];
        if (!parsed.career_milestones) parsed.career_milestones = initial.career_milestones || [];
        if (!parsed.career_documents) parsed.career_documents = initial.career_documents || [];
        if (!parsed.career_journal) parsed.career_journal = initial.career_journal || [];
        if (!parsed.project_interview_prep) parsed.project_interview_prep = initial.project_interview_prep || {};
        // Ensure Phase 8 AI Intelligence entities exist
        if (!parsed.ai_insights) parsed.ai_insights = initial.ai_insights || [];
        if (!parsed.ai_conversations) parsed.ai_conversations = initial.ai_conversations || [];
        if (!parsed.ai_messages) parsed.ai_messages = initial.ai_messages || [];
        if (!parsed.ai_plans) parsed.ai_plans = initial.ai_plans || [];
        if (!parsed.ai_plan_items) parsed.ai_plan_items = initial.ai_plan_items || [];
        if (!parsed.ai_settings) parsed.ai_settings = initial.ai_settings;
        if (!parsed.ai_data_permissions) parsed.ai_data_permissions = initial.ai_data_permissions;
        if (!parsed.ai_action_proposals) parsed.ai_action_proposals = initial.ai_action_proposals || [];
        if (!parsed.ai_action_logs) parsed.ai_action_logs = initial.ai_action_logs || [];
        // Ensure Phase 9 Advanced Analytics & Gamification entities exist
        if (!parsed.achievements) parsed.achievements = initial.achievements || [];
        if (!parsed.achievement_progress) parsed.achievement_progress = initial.achievement_progress || {};
        if (!parsed.milestones) parsed.milestones = initial.milestones || [];
        if (!parsed.milestone_progress) parsed.milestone_progress = initial.milestone_progress || {};
        if (!parsed.goal_history) parsed.goal_history = initial.goal_history || [];
        if (!parsed.progress_snapshots) parsed.progress_snapshots = initial.progress_snapshots || [];
        if (!parsed.personal_records) parsed.personal_records = initial.personal_records;
        if (!parsed.analytics_preferences) parsed.analytics_preferences = initial.analytics_preferences;
        if (!parsed.custom_achievements) parsed.custom_achievements = initial.custom_achievements || [];
        if (!parsed.journey_events) parsed.journey_events = initial.journey_events || [];
        if (!parsed.analytics_exports) parsed.analytics_exports = initial.analytics_exports || [];
        // Ensure Phase 10 Personal Operating System entities exist
        if (!parsed.tasks) parsed.tasks = initial.tasks || [];
        if (!parsed.task_dependencies) parsed.task_dependencies = initial.task_dependencies || [];
        if (!parsed.task_instances) parsed.task_instances = initial.task_instances || [];
        if (!parsed.inbox_items) parsed.inbox_items = initial.inbox_items || [];
        if (!parsed.notes) parsed.notes = initial.notes || [];
        if (!parsed.note_links) parsed.note_links = initial.note_links || [];
        if (!parsed.resources) parsed.resources = initial.resources || [];
        if (!parsed.focus_sessions) parsed.focus_sessions = initial.focus_sessions || [];
        if (!parsed.calendar_items) parsed.calendar_items = initial.calendar_items || [];
        if (!parsed.automations) parsed.automations = initial.automations || [];
        if (!parsed.automation_runs) parsed.automation_runs = initial.automation_runs || [];
        if (!parsed.reviews) parsed.reviews = initial.reviews || [];
        if (!parsed.activity_log) parsed.activity_log = initial.activity_log || [];
        if (!parsed.backups) parsed.backups = initial.backups || [];
        if (!parsed.knowledge_links) parsed.knowledge_links = initial.knowledge_links || [];
        if (!parsed.personal_os_settings) parsed.personal_os_settings = initial.personal_os_settings;
        if (!parsed.today_timeline_blocks) parsed.today_timeline_blocks = initial.today_timeline_blocks || [];
        currentState = deepMerge(initial, parsed);
      } else {
        currentState = initial;
        saveState();
      }
    } else {
      currentState = initial;
    }
  } catch (err) {
    console.error('Storage initialization issue, using initial state:', err);
    currentState = initial;
  }
  return currentState;
}

export function getState() {
  if (!currentState) {
    return initStorage();
  }
  return currentState;
}

export function updateState(updater) {
  if (!currentState) {
    initStorage();
  }
  if (typeof updater === 'function') {
    currentState = updater(currentState);
  } else if (typeof updater === 'object' && updater !== null) {
    currentState = { ...currentState, ...updater };
  }
  saveState();
  notifyListeners();
  return currentState;
}

export function saveState() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    }
  } catch (err) {
    console.error('Storage save error:', err);
  }
}

export function subscribe(listener) {
  LISTENERS.add(listener);
  return () => LISTENERS.delete(listener);
}

function notifyListeners() {
  LISTENERS.forEach(fn => {
    try {
      fn(currentState);
    } catch (err) {
      console.error('Listener callback error:', err);
    }
  });
}

export function exportBackupJSON() {
  const jsonStr = JSON.stringify(currentState, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `akshay-career-os-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBackupJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.user) {
      throw new Error('Invalid backup structure: user profile missing.');
    }
    currentState = parsed;
    saveState();
    notifyListeners();
    return { success: true };
  } catch (err) {
    console.error('Import backup failed:', err);
    return { success: false, error: err.message };
  }
}

export function resetToInitialState() {
  currentState = createInitialState();
  saveState();
  notifyListeners();
  return currentState;
}

function deepMerge(target, source) {
  if (!source) return target;
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key]) && key in target) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

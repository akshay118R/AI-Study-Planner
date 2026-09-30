/**
 * Akshay's 12-Month AI/ML Career OS - Career + Internship Preparation Engine (Phase 7)
 * 
 * Hierarchy & Flow:
 * LEARNING -> DSA / CORE CS -> PROJECTS -> GITHUB / PORTFOLIO -> RESUME -> INTERNSHIP SEARCH -> APPLICATION -> ASSESSMENT -> INTERVIEW PREP -> INTERVIEWS -> PLACEMENT PREPARATION
 * 
 * Strict Phase 7 Rules:
 * - Real metrics only (no fake probabilities or fabricated scores)
 * - Reference Phase 5 DSA and Phase 6 Projects without duplication
 * - Seamless integration with Phase 3 Daily Tasks, Phase 4 Weekly/Monthly Goals, and Phase 2 Roadmap
 */

import { getState, updateState } from '../data/storage.js';
import { calculateDsaAnalytics } from './dsaEngine.js';
import { calculateProjectMetrics, getProjects } from './projectEngine.js';

let seqCounter = 0;
function uid(prefix = 'c') {
  seqCounter += 1;
  return `${prefix}-${Date.now()}-${seqCounter}-${Math.random().toString(36).substring(2, 7)}`;
}

// ==========================================
// CONSTANTS & TAXONOMIES
// ==========================================

export const CODING_PLATFORMS = ['LeetCode', 'Codeforces', 'GeeksforGeeks', 'CodeChef', 'HackerRank'];

export const RESUME_STATUSES = ['Not Started', 'Draft', 'Ready', 'Needs Update'];

export const INTERNSHIP_WORK_TYPES = ['Remote', 'On-site', 'Hybrid'];

export const INTERNSHIP_SOURCES = ['Company Website', 'LinkedIn', 'Job Board', 'College', 'Referral', 'Other'];

export const APPLICATION_STATUSES = [
  'Saved',
  'Applied',
  'Assessment',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
  'Closed'
];

export const OUTREACH_STATUSES = ['Draft', 'Sent', 'Follow-up Due', 'Replied', 'No Response', 'Closed'];

export const REFERRAL_STATUSES = ['Planning', 'Contacted', 'Replied', 'Referral Requested', 'Referred', 'Closed'];

export const NETWORKING_PLATFORMS = ['LinkedIn', 'College', 'Hackathon', 'GitHub', 'Alumni', 'Other'];

export const APTITUDE_CATEGORIES = ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'];

export const APTITUDE_TOPICS = {
  'Quantitative Aptitude': [
    'Percentages',
    'Profit & Loss',
    'Ratios',
    'Averages',
    'Time & Work',
    'Time & Distance',
    'Probability',
    'Permutations & Combinations',
    'Number Systems'
  ],
  'Logical Reasoning': [
    'Series',
    'Coding-Decoding',
    'Blood Relations',
    'Directions',
    'Puzzles',
    'Syllogisms'
  ],
  'Verbal Ability': [
    'Grammar',
    'Vocabulary',
    'Reading Comprehension',
    'Sentence Correction'
  ]
};

export const TECHNICAL_TOPIC_STATUSES = ['Not Started', 'Learning', 'Practicing', 'Interview Ready', 'Needs Revision'];

export const INTERVIEW_QUESTION_CATEGORIES = ['DSA', 'OOP', 'DBMS', 'SQL', 'OS', 'CN', 'ML', 'Projects', 'HR'];

export const INTERVIEW_QUESTION_STATUSES = ['Not Practiced', 'Practiced', 'Needs Revision', 'Ready'];

export const MOCK_INTERVIEW_TYPES = ['Technical', 'DSA', 'Project', 'HR', 'Mixed'];

export const ACHIEVEMENT_CATEGORIES = [
  'Hackathons',
  'Coding Competitions',
  'Open Source',
  'Projects',
  'Certifications',
  'Leadership',
  'Technical Activities'
];

export const RESUME_CHECKLIST_ITEMS = [
  { key: 'education_updated', label: 'Education updated' },
  { key: 'skills_updated', label: 'Skills updated' },
  { key: 'dsa_profile_links', label: 'DSA/profile links' },
  { key: 'projects_added', label: 'Projects added' },
  { key: 'github_added', label: 'GitHub added' },
  { key: 'internship_experience', label: 'Internship experience' },
  { key: 'hackathon_experience', label: 'Hackathon experience' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'contact_info', label: 'Contact information' },
  { key: 'formatting_reviewed', label: 'Formatting reviewed' },
  { key: 'pdf_generated', label: 'Final PDF generated' }
];

export const GITHUB_PROFILE_CHECKLIST_ITEMS = [
  { key: 'profile_complete', label: 'Profile complete' },
  { key: 'profile_photo', label: 'Profile photo' },
  { key: 'bio', label: 'Bio' },
  { key: 'pinned_projects', label: 'Pinned projects' },
  { key: 'clean_repositories', label: 'Clean repositories' },
  { key: 'readme_files', label: 'README files' },
  { key: 'meaningful_commits', label: 'Meaningful commits' },
  { key: 'project_documentation', label: 'Project documentation' },
  { key: 'open_source_contribution', label: 'Open-source contribution' }
];

export const LINKEDIN_CHECKLIST_ITEMS = [
  { key: 'profile_created', label: 'Profile created' },
  { key: 'headline_updated', label: 'Headline updated' },
  { key: 'about_section', label: 'About section' },
  { key: 'education', label: 'Education' },
  { key: 'skills', label: 'Skills' },
  { key: 'projects', label: 'Projects' },
  { key: 'github', label: 'GitHub' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'achievements', label: 'Achievements' }
];

export const PROJECT_INTERVIEW_CHECKLIST_ITEMS = [
  { key: 'exp_30s', label: '30-second explanation' },
  { key: 'exp_1m', label: '1-minute explanation' },
  { key: 'exp_3m', label: '3-minute explanation' },
  { key: 'arch', label: 'Architecture explanation' },
  { key: 'tech_decisions', label: 'Technical decisions' },
  { key: 'challenges', label: 'Challenges' },
  { key: 'tradeoffs', label: 'Trade-offs' },
  { key: 'future_improvements', label: 'Future improvements' }
];

// ==========================================
// 1. PROFILE MANAGEMENT (Section 4)
// ==========================================

export function getCareerProfile() {
  const state = getState();
  return state.career_profile || {
    full_name: state.user?.name || 'Akshay',
    headline: 'Aspiring AI/ML Engineer',
    bio: '',
    location: '',
    education: '',
    degree: '',
    university: '',
    graduation_year: 2030,
    skills: { programming: [], aiml: [], data: [], backend: [], cloud: [], tools: [] }
  };
}

export function updateCareerProfile(updates) {
  const now = new Date().toISOString();
  let updated = null;
  updateState(curr => {
    updated = {
      ...(curr.career_profile || {}),
      ...updates,
      skills: {
        ...(curr.career_profile?.skills || {}),
        ...(updates.skills || {})
      },
      updated_at: now
    };
    return { ...curr, career_profile: updated };
  });
  return updated;
}

// ==========================================
// 2. RESUME TRACKER & CHECKLIST (Sections 5, 6, 7)
// ==========================================

export function getResumeVersions() {
  return getState().resume_versions || [];
}

export function addResumeVersion(data) {
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];
  const newVer = {
    id: data.id || uid('res'),
    version_name: data.version_name || 'Resume v' + ((getState().resume_versions || []).length + 1),
    date_created: data.date_created || dateStr,
    date_updated: now.split('T')[0],
    status: data.status || 'Draft',
    file_url: data.file_url || '',
    notes: data.notes || ''
  };

  updateState(curr => ({
    ...curr,
    resume_versions: [newVer, ...(curr.resume_versions || [])]
  }));
  return newVer;
}

export function updateResumeVersion(id, updates) {
  let updated = null;
  const now = new Date().toISOString();
  updateState(curr => {
    const list = (curr.resume_versions || []).map(r => {
      if (r.id === id) {
        updated = { ...r, ...updates, date_updated: now.split('T')[0] };
        return updated;
      }
      return r;
    });
    return { ...curr, resume_versions: list };
  });
  return updated;
}

export function deleteResumeVersion(id) {
  updateState(curr => ({
    ...curr,
    resume_versions: (curr.resume_versions || []).filter(r => r.id !== id)
  }));
  return true;
}

export function getResumeChecklist() {
  return getState().resume_checklist || {};
}

export function toggleResumeChecklistItem(key) {
  let updated = null;
  updateState(curr => {
    const prev = curr.resume_checklist || {};
    updated = { ...prev, [key]: !prev[key] };
    return { ...curr, resume_checklist: updated };
  });
  return updated;
}

export function getResumeProjectCandidates() {
  const state = getState();
  const projects = state.projects || [];
  const resumeMap = state.project_resume || {};

  return projects.map(p => {
    const resData = resumeMap[p.id] || {};
    return {
      id: p.id,
      project_id: p.id,
      name: p.name || p.title,
      description: p.description || p.short_description,
      technology: p.technology,
      githubUrl: p.githubUrl,
      liveUrl: p.liveUrl,
      progress: p.progress,
      status: p.status,
      portfolio_status: p.portfolio_status,
      resume_ready: resData.resume_ready === true,
      resume_candidate: resData.resume_candidate !== false,
      one_line_description: resData.one_line_description || p.short_description || '',
      achievement: resData.achievement || ''
    };
  });
}

export function toggleProjectResumeCandidate(projectId, isCandidate) {
  updateState(curr => {
    const rMap = { ...(curr.project_resume || {}) };
    rMap[projectId] = { ...(rMap[projectId] || {}), resume_candidate: isCandidate };
    return { ...curr, project_resume: rMap };
  });
  return true;
}

export function toggleProjectResumeReady(projectId, isReady) {
  updateState(curr => {
    const rMap = { ...(curr.project_resume || {}) };
    rMap[projectId] = { ...(rMap[projectId] || {}), resume_ready: isReady };
    return { ...curr, project_resume: rMap };
  });
  return true;
}

// ==========================================
// 3. GITHUB & LINKEDIN PROFILES (Sections 8, 10)
// ==========================================

export function getGitHubProfile() {
  return getState().github_profile || {
    username: '',
    profile_url: '',
    bio: '',
    pinned_projects: [],
    checklist: {}
  };
}

export function updateGitHubProfile(updates) {
  let updated = null;
  updateState(curr => {
    const prev = curr.github_profile || {};
    updated = {
      ...prev,
      ...updates,
      checklist: { ...(prev.checklist || {}), ...(updates.checklist || {}) }
    };
    return { ...curr, github_profile: updated };
  });
  return updated;
}

export function toggleGitHubProfileChecklistItem(key) {
  let updated = null;
  updateState(curr => {
    const prev = curr.github_profile || {};
    const cl = { ...(prev.checklist || {}) };
    cl[key] = !cl[key];
    updated = { ...prev, checklist: cl };
    return { ...curr, github_profile: updated };
  });
  return updated;
}

export function getLinkedInProfile() {
  return getState().linkedin_profile || {
    profile_url: '',
    headline: '',
    about: '',
    skills: [],
    projects: [],
    experience: [],
    education: '',
    certifications: [],
    checklist: {}
  };
}

export function updateLinkedInProfile(updates) {
  let updated = null;
  updateState(curr => {
    const prev = curr.linkedin_profile || {};
    updated = {
      ...prev,
      ...updates,
      checklist: { ...(prev.checklist || {}), ...(updates.checklist || {}) }
    };
    return { ...curr, linkedin_profile: updated };
  });
  return updated;
}

export function toggleLinkedInChecklistItem(key) {
  let updated = null;
  updateState(curr => {
    const prev = curr.linkedin_profile || {};
    const cl = { ...(prev.checklist || {}) };
    cl[key] = !cl[key];
    updated = { ...prev, checklist: cl };
    return { ...curr, linkedin_profile: updated };
  });
  return updated;
}

// ==========================================
// 4. CODING PROFILES (Section 9)
// ==========================================

export function getCodingProfiles() {
  return getState().coding_profiles || [];
}

export function updateCodingProfile(platform, updates) {
  let updated = null;
  updateState(curr => {
    const list = (curr.coding_profiles || []).map(p => {
      if (p.platform.toLowerCase() === platform.toLowerCase()) {
        updated = { ...p, ...updates };
        return updated;
      }
      return p;
    });

    if (!updated) {
      updated = { platform, username: '', url: '', problems_solved: 0, last_activity: '', notes: '', ...updates };
      list.push(updated);
    }
    return { ...curr, coding_profiles: list };
  });
  return updated;
}

// ==========================================
// 5. ACHIEVEMENTS & CERTIFICATIONS (Sections 12, 13)
// ==========================================

export function getAchievements() {
  return getState().career_achievements || [];
}

export function addAchievement(data) {
  const id = data.id || uid('ach');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];
  const newAch = {
    id,
    title: data.title || 'Untitled Achievement',
    category: data.category || 'Hackathons',
    date: data.date || dateStr,
    description: data.description || '',
    evidence_url: data.evidence_url || '',
    notes: data.notes || '',
    status: data.status || 'Completed'
  };

  updateState(curr => ({
    ...curr,
    career_achievements: [newAch, ...(curr.career_achievements || [])]
  }));
  return newAch;
}

export function updateAchievement(id, updates) {
  let updated = null;
  updateState(curr => {
    const list = (curr.career_achievements || []).map(a => {
      if (a.id === id) {
        updated = { ...a, ...updates };
        return updated;
      }
      return a;
    });
    return { ...curr, career_achievements: list };
  });
  return updated;
}

export function deleteAchievement(id) {
  updateState(curr => ({
    ...curr,
    career_achievements: (curr.career_achievements || []).filter(a => a.id !== id)
  }));
  return true;
}

export function getCertifications() {
  return getState().certifications || [];
}

export function addCertification(data) {
  const id = data.id || uid('cert');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];
  const newCert = {
    id,
    certification: data.certification || data.title || 'Certification',
    provider: data.provider || 'Provider',
    date: data.date || dateStr,
    credential_url: data.credential_url || '',
    status: data.status || 'Planned',
    notes: data.notes || ''
  };

  updateState(curr => ({
    ...curr,
    certifications: [newCert, ...(curr.certifications || [])]
  }));
  return newCert;
}

export function updateCertification(id, updates) {
  let updated = null;
  updateState(curr => {
    const list = (curr.certifications || []).map(c => {
      if (c.id === id) {
        updated = { ...c, ...updates };
        return updated;
      }
      return c;
    });
    return { ...curr, certifications: list };
  });
  return updated;
}

export function deleteCertification(id) {
  updateState(curr => ({
    ...curr,
    certifications: (curr.certifications || []).filter(c => c.id !== id)
  }));
  return true;
}

// ==========================================
// 6. INTERNSHIP & APPLICATION PIPELINE (Sections 14, 15, 16, 17, 18, 19, 51)
// ==========================================

export function getInternships(filters = {}) {
  const list = getState().internships || [];
  return list.filter(i => {
    if (filters.status && filters.status !== 'All' && i.status !== filters.status) return false;
    if (filters.work_type && filters.work_type !== 'All' && i.work_type !== filters.work_type) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match = (i.company || '').toLowerCase().includes(q) || (i.role || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

export function addInternship(data) {
  const id = data.id || uid('int');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];
  const newInt = {
    id,
    company: data.company || 'Company Name',
    role: data.role || 'Software Engineering Intern',
    location: data.location || 'Bangalore / Remote',
    work_type: data.work_type || 'Hybrid',
    application_url: data.application_url || '',
    source: data.source || 'LinkedIn',
    date_found: data.date_found || dateStr,
    application_deadline: data.application_deadline || '',
    status: data.status || 'Saved',
    notes: data.notes || '',
    description: data.description || '',
    requirements: data.requirements || '',
    skills: data.skills || ''
  };

  updateState(curr => ({
    ...curr,
    internships: [newInt, ...(curr.internships || [])]
  }));
  return newInt;
}

export function updateInternship(id, updates) {
  let updated = null;
  updateState(curr => {
    const list = (curr.internships || []).map(i => {
      if (i.id === id) {
        updated = { ...i, ...updates };
        return updated;
      }
      return i;
    });
    return { ...curr, internships: list };
  });
  return updated;
}

export function deleteInternship(id) {
  updateState(curr => ({
    ...curr,
    internships: (curr.internships || []).filter(i => i.id !== id)
  }));
  return true;
}

/**
 * Converts an internship lead into an active application (Section 53 Test 9)
 * Creates ONE application record, syncs status, without duplicating records.
 */
export function convertInternshipToApplication(internshipId, extraData = {}) {
  const state = getState();
  const internship = (state.internships || []).find(i => i.id === internshipId);
  if (!internship) return null;

  // Check if an application already references this internship
  const existingApp = (state.applications || []).find(a => a.internship_id === internshipId);
  if (existingApp) {
    return existingApp;
  }

  const now = new Date().toISOString();
  const dateStr = state.activeDate || now.split('T')[0];
  const appId = uid('app');

  const newApp = {
    id: appId,
    internship_id: internshipId,
    company: internship.company,
    role: internship.role,
    date_applied: extraData.date_applied || dateStr,
    deadline: internship.application_deadline || '',
    status: extraData.status || 'Applied',
    next_action: extraData.next_action || 'Prepare for technical assessment',
    next_action_date: extraData.next_action_date || '',
    location: internship.location,
    work_type: internship.work_type,
    application_url: internship.application_url,
    source: internship.source,
    notes: internship.notes || ''
  };

  // Initial event
  const initEvent = {
    id: uid('apev'),
    application_id: appId,
    date: dateStr,
    type: 'Applied',
    notes: `Converted from internship lead. Applied via ${newApp.source || 'portal'}.`
  };

  updateState(curr => {
    // Also mark internship status as Applied
    const updatedInternships = (curr.internships || []).map(i => i.id === internshipId ? { ...i, status: 'Applied' } : i);
    return {
      ...curr,
      internships: updatedInternships,
      applications: [newApp, ...(curr.applications || [])],
      application_events: [initEvent, ...(curr.application_events || [])]
    };
  });

  return newApp;
}

export function getApplications(filters = {}) {
  const list = getState().applications || [];
  return list.filter(a => {
    if (filters.status && filters.status !== 'All' && a.status !== filters.status) return false;
    if (filters.work_type && filters.work_type !== 'All' && a.work_type !== filters.work_type) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match = (a.company || '').toLowerCase().includes(q) || (a.role || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

export function addApplication(data) {
  const id = data.id || uid('app');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  const newApp = {
    id,
    internship_id: data.internship_id || null,
    company: data.company || 'Company Name',
    role: data.role || 'Software Engineering Intern',
    date_applied: data.date_applied || dateStr,
    deadline: data.deadline || '',
    status: data.status || 'Applied',
    next_action: data.next_action || '',
    next_action_date: data.next_action_date || '',
    location: data.location || 'Remote',
    work_type: data.work_type || 'Remote',
    application_url: data.application_url || '',
    source: data.source || 'Company Website',
    notes: data.notes || ''
  };

  const initialEvent = {
    id: uid('apev'),
    application_id: id,
    date: dateStr,
    type: newApp.status,
    notes: `Application recorded with status: ${newApp.status}`
  };

  updateState(curr => ({
    ...curr,
    applications: [newApp, ...(curr.applications || [])],
    application_events: [initialEvent, ...(curr.application_events || [])]
  }));

  return newApp;
}

export function updateApplication(id, updates) {
  let updated = null;
  updateState(curr => {
    const list = (curr.applications || []).map(a => {
      if (a.id === id) {
        updated = { ...a, ...updates };
        return updated;
      }
      return a;
    });
    return { ...curr, applications: list };
  });
  return updated;
}

export function updateApplicationStatus(id, newStatus, eventNotes = '') {
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];
  let updated = null;

  const newEvent = {
    id: uid('apev'),
    application_id: id,
    date: dateStr,
    type: newStatus,
    notes: eventNotes || `Status updated to ${newStatus}`
  };

  updateState(curr => {
    const list = (curr.applications || []).map(a => {
      if (a.id === id) {
        updated = { ...a, status: newStatus };
        return updated;
      }
      return a;
    });

    return {
      ...curr,
      applications: list,
      application_events: [newEvent, ...(curr.application_events || [])]
    };
  });

  return updated;
}

export function deleteApplication(id) {
  updateState(curr => ({
    ...curr,
    applications: (curr.applications || []).filter(a => a.id !== id),
    application_events: (curr.application_events || []).filter(e => e.application_id !== id),
    application_followups: (curr.application_followups || []).filter(f => f.application_id !== id)
  }));
  return true;
}

export function getApplicationEvents(applicationId) {
  const list = getState().application_events || [];
  return list.filter(e => e.application_id === applicationId).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function addApplicationEvent(applicationId, data) {
  const id = uid('apev');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  const newEvent = {
    id,
    application_id: applicationId,
    date: data.date || dateStr,
    type: data.type || 'Note',
    notes: data.notes || ''
  };

  updateState(curr => ({
    ...curr,
    application_events: [newEvent, ...(curr.application_events || [])]
  }));
  return newEvent;
}

export function getApplicationFollowups(applicationId = null) {
  const list = getState().application_followups || [];
  if (applicationId) {
    return list.filter(f => f.application_id === applicationId);
  }
  return list;
}

export function addApplicationFollowup(applicationId, data) {
  const id = uid('apf');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  const newFollowup = {
    id,
    application_id: applicationId,
    action: data.action || 'Follow up with recruiter',
    due_date: data.due_date || data.action_date || data.next_action_date || dateStr,
    status: data.status || 'Pending',
    notes: data.notes || ''
  };

  updateState(curr => {
    // Keep application next_action in sync
    const applications = (curr.applications || []).map(a => {
      if (a.id === applicationId) {
        return {
          ...a,
          next_action: newFollowup.action,
          next_action_date: newFollowup.due_date
        };
      }
      return a;
    });

    return {
      ...curr,
      applications,
      application_followups: [newFollowup, ...(curr.application_followups || [])]
    };
  });

  return newFollowup;
}

export function updateApplicationFollowup(id, updates) {
  let updated = null;
  updateState(curr => {
    const list = (curr.application_followups || []).map(f => {
      if (f.id === id) {
        updated = { ...f, ...updates };
        return updated;
      }
      return f;
    });
    return { ...curr, application_followups: list };
  });
  return updated;
}

export function getApplicationStats() {
  const state = getState();
  const apps = state.applications || [];
  const activeDate = state.activeDate || new Date().toISOString().split('T')[0];
  const activeMonth = activeDate.substring(0, 7);

  // Determine current Monday-Sunday window
  const d = new Date(activeDate);
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const monStr = mon.toISOString().split('T')[0];
  const sunStr = sun.toISOString().split('T')[0];

  let thisWeek = 0;
  let thisMonth = 0;

  apps.forEach(a => {
    if (a.date_applied) {
      if (a.date_applied >= monStr && a.date_applied <= sunStr) thisWeek += 1;
      if (a.date_applied.startsWith(activeMonth)) thisMonth += 1;
    }
  });

  return {
    total: apps.length,
    saved: apps.filter(a => a.status === 'Saved').length,
    applied: apps.filter(a => a.status === 'Applied').length,
    assessments: apps.filter(a => a.status === 'Assessment').length,
    interviews: apps.filter(a => a.status === 'Interview').length,
    offers: apps.filter(a => a.status === 'Offer').length,
    rejected: apps.filter(a => a.status === 'Rejected').length,
    withdrawn: apps.filter(a => a.status === 'Withdrawn').length,
    closed: apps.filter(a => a.status === 'Closed').length,
    thisWeek,
    thisMonth
  };
}

// ==========================================
// 7. OUTREACH, REFERRALS & NETWORKING (Sections 20, 21, 22, 23)
// ==========================================

export function getOutreach() {
  return getState().outreach || [];
}

export function addOutreach(data) {
  const id = data.id || uid('out');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  const newOut = {
    id,
    contact: data.contact || 'Recruiter / Engineer',
    company: data.company || 'Target Company',
    role: data.role || 'Software Engineering Lead',
    date_sent: data.date_sent || dateStr,
    purpose: data.purpose || 'Inquiry regarding 2027 Summer Internship openings',
    status: data.status || 'Sent',
    follow_up_date: data.follow_up_date || '',
    notes: data.notes || ''
  };

  updateState(curr => ({
    ...curr,
    outreach: [newOut, ...(curr.outreach || [])]
  }));
  return newOut;
}

export function updateOutreach(id, updates) {
  let updated = null;
  updateState(curr => {
    const list = (curr.outreach || []).map(o => {
      if (o.id === id) {
        updated = { ...o, ...updates };
        return updated;
      }
      return o;
    });
    return { ...curr, outreach: list };
  });
  return updated;
}

export function deleteOutreach(id) {
  updateState(curr => ({
    ...curr,
    outreach: (curr.outreach || []).filter(o => o.id !== id)
  }));
  return true;
}

export function getReferrals() {
  return getState().referrals || [];
}

export function addReferral(data) {
  const id = data.id || uid('ref');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  const newRef = {
    id,
    person: data.person || 'Alumni / Connection',
    company: data.company || 'Target Company',
    role: data.role || 'Software Engineer',
    date_contacted: data.date_contacted || dateStr,
    status: data.status || 'Contacted',
    notes: data.notes || ''
  };

  updateState(curr => ({
    ...curr,
    referrals: [newRef, ...(curr.referrals || [])]
  }));
  return newRef;
}

export function updateReferral(id, updates) {
  let updated = null;
  updateState(curr => {
    const list = (curr.referrals || []).map(r => {
      if (r.id === id) {
        updated = { ...r, ...updates };
        return updated;
      }
      return r;
    });
    return { ...curr, referrals: list };
  });
  return updated;
}

export function deleteReferral(id) {
  updateState(curr => ({
    ...curr,
    referrals: (curr.referrals || []).filter(r => r.id !== id)
  }));
  return true;
}

export function getNetworking() {
  return getState().networking || [];
}

export function addNetworking(data) {
  const id = data.id || uid('net');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  const newNet = {
    id,
    person: data.person || 'Connection Name',
    organization: data.organization || 'Organization',
    platform: data.platform || 'LinkedIn',
    reason: data.reason || 'Discussed AI systems architecture and internship advice',
    date: data.date || dateStr,
    follow_up_date: data.follow_up_date || '',
    notes: data.notes || ''
  };

  updateState(curr => ({
    ...curr,
    networking: [newNet, ...(curr.networking || [])]
  }));
  return newNet;
}

export function updateNetworking(id, updates) {
  let updated = null;
  updateState(curr => {
    const list = (curr.networking || []).map(n => {
      if (n.id === id) {
        updated = { ...n, ...updates };
        return updated;
      }
      return n;
    });
    return { ...curr, networking: list };
  });
  return updated;
}

export function deleteNetworking(id) {
  updateState(curr => ({
    ...curr,
    networking: (curr.networking || []).filter(n => n.id !== id)
  }));
  return true;
}

// ==========================================
// 8. APTITUDE PREPARATION (Sections 24, 25)
// ==========================================

export function getAptitudeSessions(filters = {}) {
  const list = getState().aptitude_sessions || [];
  return list.filter(s => {
    if (filters.category && filters.category !== 'All' && s.category !== filters.category) return false;
    if (filters.topic && filters.topic !== 'All' && s.topic !== filters.topic) return false;
    return true;
  });
}

export function logAptitudeSession(data) {
  const id = data.id || uid('apt');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  const attempted = parseInt(data.questions_attempted, 10) || 0;
  const solved = parseInt(data.questions_solved, 10) || 0;
  const accuracy = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;

  const newSess = {
    id,
    date: data.date || dateStr,
    category: data.category || 'Quantitative Aptitude',
    topic: data.topic || 'Percentages',
    questions_attempted: attempted,
    questions_solved: solved,
    accuracy,
    time_spent_minutes: parseInt(data.time_spent_minutes, 10) || 30,
    notes: data.notes || ''
  };

  updateState(curr => ({
    ...curr,
    aptitude_sessions: [newSess, ...(curr.aptitude_sessions || [])]
  }));
  return newSess;
}

export function getAptitudeStats() {
  const list = getState().aptitude_sessions || [];
  let totalAttempted = 0;
  let totalSolved = 0;
  let totalMinutes = 0;

  const byCategory = {
    'Quantitative Aptitude': { attempted: 0, solved: 0, sessions: 0 },
    'Logical Reasoning': { attempted: 0, solved: 0, sessions: 0 },
    'Verbal Ability': { attempted: 0, solved: 0, sessions: 0 }
  };

  list.forEach(s => {
    totalAttempted += (s.questions_attempted || 0);
    totalSolved += (s.questions_solved || 0);
    totalMinutes += (s.time_spent_minutes || 0);

    if (byCategory[s.category]) {
      byCategory[s.category].attempted += (s.questions_attempted || 0);
      byCategory[s.category].solved += (s.questions_solved || 0);
      byCategory[s.category].sessions += 1;
    }
  });

  const overallAccuracy = totalAttempted > 0 ? Math.round((totalSolved / totalAttempted) * 100) : 0;

  return {
    sessionsCount: list.length,
    totalSessions: list.length,
    totalAttempted,
    totalSolved,
    overallAccuracy,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    byCategory
  };
}

// ==========================================
// 9. TECHNICAL TOPICS & QUESTIONS (Sections 26, 27, 28, 29)
// ==========================================

export function getTechnicalTopics() {
  return getState().technical_topics || [];
}

export function updateTechnicalTopic(topicKey, updates) {
  let updated = null;
  updateState(curr => {
    const list = (curr.technical_topics || []).map(t => {
      if (t.topic_key.toLowerCase() === topicKey.toLowerCase()) {
        updated = { ...t, ...updates };
        return updated;
      }
      return t;
    });
    return { ...curr, technical_topics: list };
  });
  return updated;
}

export function getInterviewQuestions(filters = {}) {
  const list = getState().interview_questions || [];
  return list.filter(q => {
    if (filters.category && filters.category !== 'All' && q.category !== filters.category) return false;
    if (filters.status && filters.status !== 'All' && q.status !== filters.status) return false;
    if (filters.needsRevisionOnly && q.status !== 'Needs Revision' && !q.revision_required) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const match = (q.question || '').toLowerCase().includes(s) || (q.topic || '').toLowerCase().includes(s);
      if (!match) return false;
    }
    return true;
  });
}

export function addInterviewQuestion(data) {
  const id = data.id || uid('iq');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  const newQ = {
    id,
    question: data.question || 'Interview Question',
    category: data.category || 'DSA',
    topic: data.topic || 'General',
    difficulty: data.difficulty || 'Medium',
    status: data.status || 'Not Practiced',
    answer_notes: data.answer_notes || '',
    revision_required: data.revision_required === true || data.status === 'Needs Revision',
    date_added: data.date_added || dateStr,
    last_practiced: data.last_practiced || null
  };

  updateState(curr => ({
    ...curr,
    interview_questions: [newQ, ...(curr.interview_questions || [])]
  }));
  return newQ;
}

export function updateInterviewQuestion(id, updates) {
  let updated = null;
  const now = new Date().toISOString();
  updateState(curr => {
    const list = (curr.interview_questions || []).map(q => {
      if (q.id === id) {
        const isNeedsRev = updates.status === 'Needs Revision' || (updates.revision_required !== undefined ? updates.revision_required : q.revision_required);
        updated = {
          ...q,
          ...updates,
          revision_required: isNeedsRev,
          last_practiced: updates.status === 'Practiced' || updates.status === 'Ready' ? now.split('T')[0] : q.last_practiced
        };
        return updated;
      }
      return q;
    });
    return { ...curr, interview_questions: list };
  });
  return updated;
}

export function deleteInterviewQuestion(id) {
  updateState(curr => ({
    ...curr,
    interview_questions: (curr.interview_questions || []).filter(q => q.id !== id)
  }));
  return true;
}

export function getProjectInterviewPrep(projectId) {
  const state = getState();
  const map = state.project_interview_prep || {};
  return map[projectId] || {
    project_id: projectId,
    explanation_30s: '',
    explanation_1m: '',
    explanation_3m: '',
    architecture: '',
    tech_decisions: '',
    challenges: '',
    tradeoffs: '',
    future_improvements: '',
    checklist: {}
  };
}

export function updateProjectInterviewPrep(projectId, updates) {
  let updated = null;
  updateState(curr => {
    const map = { ...(curr.project_interview_prep || {}) };
    const prev = map[projectId] || { checklist: {} };
    updated = {
      ...prev,
      ...updates,
      checklist: { ...(prev.checklist || {}), ...(updates.checklist || {}) }
    };
    map[projectId] = updated;
    return { ...curr, project_interview_prep: map };
  });
  return updated;
}

export function toggleProjectInterviewChecklistItem(projectId, key) {
  let updated = null;
  updateState(curr => {
    const map = { ...(curr.project_interview_prep || {}) };
    const prev = map[projectId] || { checklist: {} };
    const cl = { ...(prev.checklist || {}) };
    cl[key] = !cl[key];
    updated = { ...prev, checklist: cl };
    map[projectId] = updated;
    return { ...curr, project_interview_prep: map };
  });
  return updated;
}

// ==========================================
// 10. MOCK INTERVIEWS (Section 30)
// ==========================================

export function getMockInterviews() {
  return getState().mock_interviews || [];
}

export function addMockInterview(data) {
  const id = data.id || uid('mi');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  const newMi = {
    id,
    date: data.date || dateStr,
    type: data.type || 'Technical',
    topics: data.topics || 'DSA & Systems',
    duration_minutes: parseInt(data.duration_minutes, 10) || 45,
    questions: data.questions || '',
    notes: data.notes || '',
    areas_to_improve: data.areas_to_improve || '',
    followup_revision: data.followup_revision || ''
  };

  updateState(curr => ({
    ...curr,
    mock_interviews: [newMi, ...(curr.mock_interviews || [])]
  }));
  return newMi;
}

export function updateMockInterview(id, updates) {
  let updated = null;
  updateState(curr => {
    const list = (curr.mock_interviews || []).map(m => {
      if (m.id === id) {
        updated = { ...m, ...updates };
        return updated;
      }
      return m;
    });
    return { ...curr, mock_interviews: list };
  });
  return updated;
}

export function deleteMockInterview(id) {
  updateState(curr => ({
    ...curr,
    mock_interviews: (curr.mock_interviews || []).filter(m => m.id !== id)
  }));
  return true;
}

// ==========================================
// 11. CAREER MILESTONES (Section 36)
// ==========================================

export function getCareerMilestones() {
  return getState().career_milestones || [];
}

export function toggleCareerMilestone(milestoneKey, isCompleted) {
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];
  let updated = null;

  updateState(curr => {
    const list = (curr.career_milestones || []).map(m => {
      if (m.key === milestoneKey || m.id === milestoneKey) {
        updated = {
          ...m,
          completed: isCompleted,
          completion_date: isCompleted ? dateStr : null
        };
        return updated;
      }
      return m;
    });
    return { ...curr, career_milestones: list };
  });
  return updated;
}

// ==========================================
// 12. CAREER DOCUMENTS & JOURNAL (Sections 37, 38)
// ==========================================

export function getCareerDocuments() {
  return getState().career_documents || [];
}

export function addCareerDocument(data) {
  const id = data.id || uid('cdoc');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  const newDoc = {
    id,
    title: data.title || 'Career Document',
    category: data.category || 'Resume',
    url: data.url || '',
    notes: data.notes || '',
    date: dateStr
  };

  updateState(curr => ({
    ...curr,
    career_documents: [newDoc, ...(curr.career_documents || [])]
  }));
  return newDoc;
}

export function deleteCareerDocument(id) {
  updateState(curr => ({
    ...curr,
    career_documents: (curr.career_documents || []).filter(d => d.id !== id)
  }));
  return true;
}

export function getCareerJournal() {
  return getState().career_journal || [];
}

export function addCareerJournalEntry(data) {
  const id = data.id || uid('cjou');
  const now = new Date().toISOString();
  const dateStr = getState().activeDate || now.split('T')[0];

  const newEntry = {
    id,
    date: data.date || dateStr,
    title: data.title || 'Career Log',
    notes: data.notes || ''
  };

  updateState(curr => ({
    ...curr,
    career_journal: [newEntry, ...(curr.career_journal || [])]
  }));
  return newEntry;
}

export function deleteCareerJournalEntry(id) {
  updateState(curr => ({
    ...curr,
    career_journal: (curr.career_journal || []).filter(j => j.id !== id)
  }));
  return true;
}

// ==========================================
// 13. UPCOMING ACTIONS AGGREGATOR (Sections 18, 31, 40)
// ==========================================

export function getUpcomingActions() {
  const state = getState();
  const activeDate = state.activeDate || new Date().toISOString().split('T')[0];
  const actions = [];

  // 1. Application Deadlines
  (state.applications || []).forEach(a => {
    if (a.deadline && a.status !== 'Rejected' && a.status !== 'Closed') {
      actions.push({
        id: `act-dl-${a.id}`,
        title: `Application Deadline: ${a.company} (${a.role})`,
        type: 'Application Deadline',
        date: a.deadline,
        source: `${a.company} · Application`,
        linkRoute: 'career',
        subTab: 'applications'
      });
    }
  });

  // 2. Application Follow-ups
  (state.application_followups || []).forEach(f => {
    if (f.status === 'Pending' && f.due_date) {
      const app = (state.applications || []).find(a => a.id === f.application_id);
      actions.push({
        id: `act-fu-${f.id}`,
        title: `Follow-up: ${f.action}${app ? ` (${app.company})` : ''}`,
        type: 'Follow-up',
        date: f.due_date,
        source: app ? app.company : 'Application Follow-up',
        linkRoute: 'career',
        subTab: 'applications'
      });
    }
  });

  // 3. Outreach follow-ups
  (state.outreach || []).forEach(o => {
    if (o.follow_up_date && o.status !== 'Closed' && o.status !== 'Replied') {
      actions.push({
        id: `act-out-${o.id}`,
        title: `Outreach Follow-up: ${o.contact} (${o.company})`,
        type: 'Outreach Follow-up',
        date: o.follow_up_date,
        source: o.company,
        linkRoute: 'career',
        subTab: 'outreach'
      });
    }
  });

  // 4. Networking follow-ups
  (state.networking || []).forEach(n => {
    if (n.follow_up_date) {
      actions.push({
        id: `act-net-${n.id}`,
        title: `Networking Follow-up: ${n.person} (${n.organization})`,
        type: 'Networking',
        date: n.follow_up_date,
        source: n.organization,
        linkRoute: 'career',
        subTab: 'outreach'
      });
    }
  });

  // 5. Mock Interviews
  (state.mock_interviews || []).forEach(m => {
    if (m.date >= activeDate) {
      actions.push({
        id: `act-mi-${m.id}`,
        title: `Mock Interview: ${m.type} (${m.topics})`,
        type: 'Mock Interview',
        date: m.date,
        source: `${m.type} Mock Session`,
        linkRoute: 'career',
        subTab: 'interviews'
      });
    }
  });

  // 6. Interview Questions marked Needs Revision
  (state.interview_questions || []).forEach(q => {
    if (q.status === 'Needs Revision' || q.revision_required) {
      actions.push({
        id: `act-rev-iq-${q.id}`,
        title: `Revise Interview Question: ${q.question}`,
        type: 'Question Revision',
        date: activeDate,
        source: `${q.category} · ${q.topic}`,
        linkRoute: 'career',
        subTab: 'interviews'
      });
    }
  });

  // Sort chronologically ascending
  actions.sort((a, b) => new Date(a.date) - new Date(b.date));

  return actions;
}

// ==========================================
// 14. CAREER READINESS CHECKLIST (Section 3)
// ==========================================

export function getCareerReadinessChecklist() {
  const state = getState();

  // Actual DSA numbers
  const dsaAnalytics = calculateDsaAnalytics(state);
  const dsaSolved = dsaAnalytics.solved ?? dsaAnalytics.totalSolved ?? 0;

  // Actual Phase 6 Project numbers
  const projMetrics = calculateProjectMetrics();
  const strongProjects = (state.projects || []).filter(p => p.status === 'Completed' || p.portfolio_status === 'Portfolio Ready').length;

  // Core CS topics
  const techTopics = state.technical_topics || [];
  const coreCsReady = techTopics.filter(t => t.category === 'Core CS' && (t.status === 'Interview Ready' || t.status === 'Practicing')).length;

  // Resume status
  const resumeVer = (state.resume_versions || [])[0];
  const isResumeReady = resumeVer?.status === 'Ready';

  // GitHub & LinkedIn
  const gh = state.github_profile || {};
  const isGhActive = !!(gh.username && gh.pinned_projects?.length);
  const li = state.linkedin_profile || {};
  const isLiReady = !!(li.profile_url && li.headline);

  // Portfolio
  const isPortfolioReady = projMetrics.portfolioReady > 0;

  // Coding profiles
  const profiles = state.coding_profiles || [];
  const activeProfiles = profiles.filter(p => p.username).length;

  // Applications, Mocks, Aptitude
  const apps = state.applications || [];
  const mocks = state.mock_interviews || [];
  const aptSess = state.aptitude_sessions || [];
  const iqReady = (state.interview_questions || []).filter(q => q.status === 'Ready' || q.status === 'Practiced').length;

  return [
    {
      key: 'dsa_foundation',
      title: 'Strong DSA foundation',
      statusText: `${dsaSolved} problems solved`,
      isReady: dsaSolved >= 50,
      detail: 'Target: 50+ problems solved with independent approaches'
    },
    {
      key: 'core_cs_prep',
      title: 'Core CS preparation',
      statusText: `${coreCsReady} / 5 core subjects active`,
      isReady: coreCsReady >= 3,
      detail: 'OOP, DBMS, SQL, OS, Computer Networks'
    },
    {
      key: 'strong_projects',
      title: '2–4 strong projects',
      statusText: `${strongProjects} completed / portfolio projects`,
      isReady: strongProjects >= 2,
      detail: 'Production architecture, live deployment, comprehensive documentation'
    },
    {
      key: 'active_github',
      title: 'Active GitHub profile',
      statusText: isGhActive ? 'Active & pinned' : 'Needs pinned projects',
      isReady: isGhActive,
      detail: 'Meaningful commits, clean READMEs, pinned repositories'
    },
    {
      key: 'resume_prepared',
      title: 'Resume prepared',
      statusText: resumeVer ? resumeVer.status : 'Not Started',
      isReady: isResumeReady,
      detail: 'ATS-friendly, achievements quantified, project demo links'
    },
    {
      key: 'linkedin_prepared',
      title: 'LinkedIn prepared',
      statusText: isLiReady ? 'Profile optimized' : 'Needs update',
      isReady: isLiReady,
      detail: 'Professional headline, bio, project links, skills endorsements'
    },
    {
      key: 'portfolio_website',
      title: 'Portfolio website',
      statusText: isPortfolioReady ? 'Portfolio Ready' : 'In Progress',
      isReady: isPortfolioReady,
      detail: 'Deployed showcase of key engineering milestones'
    },
    {
      key: 'coding_profiles',
      title: 'Active coding profiles',
      statusText: `${activeProfiles} / 5 platforms tracked`,
      isReady: activeProfiles >= 2,
      detail: 'LeetCode, Codeforces, GeeksforGeeks, CodeChef, HackerRank'
    },
    {
      key: 'internship_applications',
      title: 'Internship applications pipeline',
      statusText: `${apps.length} tracked applications`,
      isReady: apps.length >= 5,
      detail: 'Structured tracking of job leads, assessments, and interviews'
    },
    {
      key: 'mock_interviews',
      title: 'Mock interviews',
      statusText: `${mocks.length} completed sessions`,
      isReady: mocks.length >= 2,
      detail: 'Technical and behavioral interview simulations'
    },
    {
      key: 'aptitude_practice',
      title: 'Aptitude practice',
      statusText: `${aptSess.length} practice sessions`,
      isReady: aptSess.length >= 3,
      detail: 'Quantitative, logical reasoning, and verbal practice'
    },
    {
      key: 'technical_interview_prep',
      title: 'Technical interview question bank',
      statusText: `${iqReady} questions mastered`,
      isReady: iqReady >= 10,
      detail: 'Core CS interview question explanations and trade-offs'
    }
  ];
}

// ==========================================
// 15. CAREER HISTORY TIMELINE (Section 41)
// ==========================================

export function getCareerHistoryTimeline() {
  const state = getState();
  const timeline = [];

  // 1. Projects completed
  (state.projects || []).forEach(p => {
    if (p.status === 'Completed' || p.actual_completion_date) {
      timeline.push({
        date: p.actual_completion_date || p.updated_at?.split('T')[0] || p.startDate,
        category: 'Project',
        title: `Completed Project: ${p.name || p.title}`,
        detail: `${p.category} · ${p.technology}`
      });
    }
  });

  // 2. Achievements
  (state.career_achievements || []).forEach(a => {
    timeline.push({
      date: a.date,
      category: a.category,
      title: `Achievement: ${a.title}`,
      detail: a.description
    });
  });

  // 3. Certifications
  (state.certifications || []).forEach(c => {
    if (c.status === 'Completed') {
      timeline.push({
        date: c.date,
        category: 'Certification',
        title: `Earned: ${c.certification}`,
        detail: `Issued by ${c.provider}`
      });
    }
  });

  // 4. Application Events
  (state.application_events || []).forEach(e => {
    const app = (state.applications || []).find(a => a.id === e.application_id);
    timeline.push({
      date: e.date,
      category: 'Application',
      title: `${e.type}: ${app ? app.company : 'Company'}`,
      detail: e.notes || (app ? `${app.role}` : '')
    });
  });

  // 5. Mock Interviews
  (state.mock_interviews || []).forEach(m => {
    timeline.push({
      date: m.date,
      category: 'Mock Interview',
      title: `${m.type} Mock Interview: ${m.topics}`,
      detail: `Duration: ${m.duration_minutes}m · Areas to improve: ${m.areas_to_improve || 'None'}`
    });
  });

  // 6. Career Milestones
  (state.career_milestones || []).forEach(m => {
    if (m.completed && m.completion_date) {
      timeline.push({
        date: m.completion_date,
        category: 'Milestone',
        title: `Career Milestone: ${m.title}`,
        detail: m.notes
      });
    }
  });

  timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
  return timeline;
}

// ==========================================
// 16. UNIFIED CAREER SEARCH (Sections 39, 52)
// ==========================================

export function searchCareer(query) {
  if (!query || !query.trim()) return null;
  const q = query.toLowerCase().trim();
  const state = getState();

  const results = {
    applications: (state.applications || []).filter(a =>
      (a.company || '').toLowerCase().includes(q) || (a.role || '').toLowerCase().includes(q) || (a.notes || '').toLowerCase().includes(q)
    ),
    internships: (state.internships || []).filter(i =>
      (i.company || '').toLowerCase().includes(q) || (i.role || '').toLowerCase().includes(q) || (i.notes || '').toLowerCase().includes(q)
    ),
    outreach: (state.outreach || []).filter(o =>
      (o.company || '').toLowerCase().includes(q) || (o.contact || '').toLowerCase().includes(q) || (o.role || '').toLowerCase().includes(q) || (o.notes || '').toLowerCase().includes(q)
    ),
    referrals: (state.referrals || []).filter(r =>
      (r.company || '').toLowerCase().includes(q) || (r.person || '').toLowerCase().includes(q) || (r.role || '').toLowerCase().includes(q) || (r.notes || '').toLowerCase().includes(q)
    ),
    interviewQuestions: (state.interview_questions || []).filter(iq =>
      (iq.question || '').toLowerCase().includes(q) || (iq.topic || '').toLowerCase().includes(q) || (iq.category || '').toLowerCase().includes(q) || (iq.answer_notes || '').toLowerCase().includes(q)
    ),
    achievements: (state.career_achievements || []).filter(a =>
      (a.title || '').toLowerCase().includes(q) || (a.category || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q)
    ),
    journal: (state.career_journal || []).filter(j =>
      (j.title || '').toLowerCase().includes(q) || (j.notes || '').toLowerCase().includes(q)
    )
  };

  results.questions = results.interviewQuestions;
  results.notes = results.journal;

  return results;
}

// ==========================================
// 17. DAILY & WEEKLY CAREER INTEGRATION (Sections 32, 33)
// ==========================================

export function addCareerDailyTask(taskData) {
  const state = getState();
  const now = new Date().toISOString();
  const dateStr = taskData.date || state.activeDate || now.split('T')[0];
  const id = uid('task-car');

  const newTask = {
    id,
    title: taskData.title || 'Career Preparation Task',
    date: dateStr,
    category: 'Career',
    durationMinutes: parseInt(taskData.durationMinutes, 10) || 30,
    completed: false,
    priority: taskData.priority || 'High',
    source: taskData.source || 'Career Engine',
    related_career_id: taskData.related_career_id || null,
    timestamp: now
  };

  updateState(curr => {
    const list = curr.dailyTasks || curr.daily_tasks || [];
    return {
      ...curr,
      dailyTasks: [...list, newTask],
      daily_tasks: [...list, newTask]
    };
  });

  return newTask;
}

export function getWeeklyCareerSummary() {
  const state = getState();
  const activeDate = state.activeDate || new Date().toISOString().split('T')[0];

  const d = new Date(activeDate);
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const monStr = mon.toISOString().split('T')[0];
  const sunStr = sun.toISOString().split('T')[0];

  const appsThisWeek = (state.applications || []).filter(a => a.date_applied >= monStr && a.date_applied <= sunStr).length;
  const aptSessThisWeek = (state.aptitude_sessions || []).filter(s => s.date >= monStr && s.date <= sunStr).length;
  const mocksThisWeek = (state.mock_interviews || []).filter(m => m.date >= monStr && m.date <= sunStr).length;

  return {
    monStr,
    sunStr,
    applications: appsThisWeek,
    aptitudeSessions: aptSessThisWeek,
    mockInterviews: mocksThisWeek
  };
}

/**
 * Akshay's 12-Month AI/ML Career OS - Career Modals & Dialogs (Phase 7)
 */

import { getState } from '../data/storage.js';
import { getIcon, ICONS } from './icons.js';
import { closeModal, initModalContainer } from './modals.js';
import {
  getCareerProfile,
  updateCareerProfile,
  getResumeVersions,
  addResumeVersion,
  updateResumeVersion,
  getCodingProfiles,
  updateCodingProfile,
  getGitHubProfile,
  updateGitHubProfile,
  getLinkedInProfile,
  updateLinkedInProfile,
  getAchievements,
  addAchievement,
  updateAchievement,
  getCertifications,
  addCertification,
  updateCertification,
  getInternships,
  addInternship,
  updateInternship,
  getApplications,
  addApplication,
  updateApplication,
  addApplicationEvent,
  addApplicationFollowup,
  getOutreach,
  addOutreach,
  updateOutreach,
  getReferrals,
  addReferral,
  updateReferral,
  getNetworking,
  addNetworking,
  updateNetworking,
  logAptitudeSession,
  APTITUDE_CATEGORIES,
  APTITUDE_TOPICS,
  getInterviewQuestions,
  addInterviewQuestion,
  updateInterviewQuestion,
  getMockInterviews,
  addMockInterview,
  updateMockInterview,
  getProjectInterviewPrep,
  updateProjectInterviewPrep,
  addCareerDocument,
  addCareerJournalEntry,
  INTERNSHIP_WORK_TYPES,
  INTERNSHIP_SOURCES,
  APPLICATION_STATUSES,
  OUTREACH_STATUSES,
  REFERRAL_STATUSES,
  NETWORKING_PLATFORMS,
  INTERVIEW_QUESTION_CATEGORIES,
  INTERVIEW_QUESTION_STATUSES,
  MOCK_INTERVIEW_TYPES,
  ACHIEVEMENT_CATEGORIES
} from '../services/careerEngine.js';

// ==========================================
// 1. CAREER PROFILE MODAL
// ==========================================

export function openCareerProfileModal(onSaved = null) {
  initModalContainer();
  const profile = getCareerProfile();
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 650px; max-height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('user', 'text-cyan')}
            <h3 class="modal-title">Edit Career Profile</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="career-profile-form" style="display: flex; flex-direction: column; overflow-y: auto; flex: 1;">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input type="text" class="form-input" id="cpf-name" value="${profile.full_name || ''}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Location</label>
                <input type="text" class="form-input" id="cpf-location" value="${profile.location || ''}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Professional Headline</label>
              <input type="text" class="form-input" id="cpf-headline" value="${profile.headline || ''}" placeholder="e.g. Aspiring AI/ML Engineer & Systems Developer" />
            </div>

            <div class="form-group">
              <label class="form-label">Short Bio</label>
              <textarea class="form-textarea" id="cpf-bio" rows="3" placeholder="Brief technical summary...">${profile.bio || ''}</textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Degree</label>
                <input type="text" class="form-input" id="cpf-degree" value="${profile.degree || 'B.Tech'}" />
              </div>
              <div class="form-group">
                <label class="form-label">University</label>
                <input type="text" class="form-input" id="cpf-university" value="${profile.university || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Graduation Year</label>
                <input type="number" class="form-input" id="cpf-grad-year" value="${profile.graduation_year || 2030}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Programming Languages (comma separated)</label>
              <input type="text" class="form-input" id="cpf-skills-prog" value="${(profile.skills?.programming || []).join(', ')}" />
            </div>

            <div class="form-group">
              <label class="form-label">AI / Machine Learning Skills</label>
              <input type="text" class="form-input" id="cpf-skills-aiml" value="${(profile.skills?.aiml || []).join(', ')}" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Backend & APIs</label>
                <input type="text" class="form-input" id="cpf-skills-backend" value="${(profile.skills?.backend || []).join(', ')}" />
              </div>
              <div class="form-group">
                <label class="form-label">Databases & Data</label>
                <input type="text" class="form-input" id="cpf-skills-data" value="${(profile.skills?.data || []).join(', ')}" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Cloud & DevOps</label>
                <input type="text" class="form-input" id="cpf-skills-cloud" value="${(profile.skills?.cloud || []).join(', ')}" />
              </div>
              <div class="form-group">
                <label class="form-label">Tools & Systems</label>
                <input type="text" class="form-input" id="cpf-skills-tools" value="${(profile.skills?.tools || []).join(', ')}" />
              </div>
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Profile</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('career-profile-form').onsubmit = (e) => {
    e.preventDefault();
    const splitClean = (val) => (val || '').split(',').map(s => s.trim()).filter(Boolean);

    const updates = {
      full_name: document.getElementById('cpf-name').value.trim(),
      location: document.getElementById('cpf-location').value.trim(),
      headline: document.getElementById('cpf-headline').value.trim(),
      bio: document.getElementById('cpf-bio').value.trim(),
      degree: document.getElementById('cpf-degree').value.trim(),
      university: document.getElementById('cpf-university').value.trim(),
      graduation_year: parseInt(document.getElementById('cpf-grad-year').value, 10) || 2030,
      skills: {
        programming: splitClean(document.getElementById('cpf-skills-prog').value),
        aiml: splitClean(document.getElementById('cpf-skills-aiml').value),
        backend: splitClean(document.getElementById('cpf-skills-backend').value),
        data: splitClean(document.getElementById('cpf-skills-data').value),
        cloud: splitClean(document.getElementById('cpf-skills-cloud').value),
        tools: splitClean(document.getElementById('cpf-skills-tools').value)
      }
    };

    updateCareerProfile(updates);
    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

// ==========================================
// 2. RESUME VERSION MODAL
// ==========================================

export function openResumeVersionModal(resumeId = null, onSaved = null) {
  initModalContainer();
  const versions = getResumeVersions();
  const existing = resumeId ? versions.find(r => r.id === resumeId) : null;
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('fileText', 'text-emerald')}
            <h3 class="modal-title">${existing ? 'Edit Resume Version' : 'New Resume Version'}</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="resume-version-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Version Name *</label>
              <input type="text" class="form-input" id="rv-name" value="${existing ? existing.version_name : `Resume v${versions.length + 1}`}" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select" id="rv-status">
                  <option value="Draft" ${existing?.status === 'Draft' ? 'selected' : ''}>Draft</option>
                  <option value="Ready" ${existing?.status === 'Ready' ? 'selected' : ''}>Ready</option>
                  <option value="Needs Update" ${existing?.status === 'Needs Update' ? 'selected' : ''}>Needs Update</option>
                  <option value="Not Started" ${existing?.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">PDF / Doc URL</label>
                <input type="text" class="form-input" id="rv-url" value="${existing?.file_url || ''}" placeholder="https://drive.google.com/..." />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Version Notes</label>
              <textarea class="form-textarea" id="rv-notes" rows="3" placeholder="Key updates in this version...">${existing?.notes || ''}</textarea>
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Version</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('resume-version-form').onsubmit = (e) => {
    e.preventDefault();
    const data = {
      version_name: document.getElementById('rv-name').value.trim(),
      status: document.getElementById('rv-status').value,
      file_url: document.getElementById('rv-url').value.trim(),
      notes: document.getElementById('rv-notes').value.trim()
    };

    if (existing) {
      updateResumeVersion(existing.id, data);
    } else {
      addResumeVersion(data);
    }

    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

// ==========================================
// 3. CODING PROFILE MODAL
// ==========================================

export function openCodingProfileModal(platformName, onSaved = null) {
  initModalContainer();
  const profiles = getCodingProfiles();
  const existing = profiles.find(p => p.platform.toLowerCase() === platformName.toLowerCase()) || {
    platform: platformName,
    username: '',
    url: '',
    problems_solved: 0,
    last_activity: '',
    notes: ''
  };
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 480px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('dsa', 'text-amber')}
            <h3 class="modal-title">${existing.platform} Profile</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="coding-profile-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" class="form-input" id="cp-username" value="${existing.username || ''}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Profile URL</label>
              <input type="url" class="form-input" id="cp-url" value="${existing.url || ''}" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Problems Solved</label>
                <input type="number" class="form-input" id="cp-solved" value="${existing.problems_solved || 0}" min="0" />
              </div>
              <div class="form-group">
                <label class="form-label">Last Activity Date</label>
                <input type="date" class="form-input" id="cp-activity" value="${existing.last_activity || ''}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notes / Practice Focus</label>
              <input type="text" class="form-input" id="cp-notes" value="${existing.notes || ''}" placeholder="e.g. NeetCode 150 / Starters contests" />
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Profile</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('coding-profile-form').onsubmit = (e) => {
    e.preventDefault();
    updateCodingProfile(existing.platform, {
      username: document.getElementById('cp-username').value.trim(),
      url: document.getElementById('cp-url').value.trim(),
      problems_solved: parseInt(document.getElementById('cp-solved').value, 10) || 0,
      last_activity: document.getElementById('cp-activity').value,
      notes: document.getElementById('cp-notes').value.trim()
    });

    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

// ==========================================
// 4. LINKEDIN MODAL
// ==========================================

export function openLinkedInModal(onSaved = null) {
  initModalContainer();
  const li = getLinkedInProfile();
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 540px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('linkedin', 'text-cyan')}
            <h3 class="modal-title">Edit LinkedIn Profile Details</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="linkedin-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Profile URL</label>
              <input type="url" class="form-input" id="li-url" value="${li.profile_url || ''}" />
            </div>

            <div class="form-group">
              <label class="form-label">Headline</label>
              <input type="text" class="form-input" id="li-headline" value="${li.headline || ''}" placeholder="e.g. B.Tech CS (AI/ML) | DSA & Systems Enthusiast" />
            </div>

            <div class="form-group">
              <label class="form-label">About Section</label>
              <textarea class="form-textarea" id="li-about" rows="3">${li.about || ''}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Featured Skills (comma separated)</label>
              <input type="text" class="form-input" id="li-skills" value="${(li.skills || []).join(', ')}" />
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save LinkedIn Info</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('linkedin-form').onsubmit = (e) => {
    e.preventDefault();
    updateLinkedInProfile({
      profile_url: document.getElementById('li-url').value.trim(),
      headline: document.getElementById('li-headline').value.trim(),
      about: document.getElementById('li-about').value.trim(),
      skills: document.getElementById('li-skills').value.split(',').map(s => s.trim()).filter(Boolean)
    });

    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

// ==========================================
// 5. GITHUB PROFILE MODAL
// ==========================================

export function openGitHubProfileModal(onSaved = null) {
  initModalContainer();
  const gh = getGitHubProfile();
  const state = getState();
  const projects = state.projects || [];
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 540px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('github', 'text-purple')}
            <h3 class="modal-title">Edit GitHub Profile Details</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="github-profile-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Username</label>
                <input type="text" class="form-input" id="gh-user" value="${gh.username || ''}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Profile URL</label>
                <input type="url" class="form-input" id="gh-url" value="${gh.profile_url || ''}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Bio</label>
              <input type="text" class="form-input" id="gh-bio" value="${gh.bio || ''}" placeholder="Short GitHub bio..." />
            </div>

            <div class="form-group">
              <label class="form-label">Pinned Projects</label>
              <div style="display: flex; flex-direction: column; gap: 6px; max-height: 140px; overflow-y: auto;">
                ${projects.map(p => `
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
                    <input type="checkbox" name="pinned_proj" value="${p.id}" ${(gh.pinned_projects || []).includes(p.id) ? 'checked' : ''} />
                    <span>${p.name || p.title} (${p.category})</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save GitHub Info</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('github-profile-form').onsubmit = (e) => {
    e.preventDefault();
    const checked = Array.from(document.querySelectorAll('input[name="pinned_proj"]:checked')).map(el => el.value);
    updateGitHubProfile({
      username: document.getElementById('gh-user').value.trim(),
      profile_url: document.getElementById('gh-url').value.trim(),
      bio: document.getElementById('gh-bio').value.trim(),
      pinned_projects: checked
    });

    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

// ==========================================
// 6. ACHIEVEMENTS & CERTIFICATIONS MODALS
// ==========================================

export function openAchievementModal(achId = null, onSaved = null) {
  initModalContainer();
  const achievements = getAchievements();
  const existing = achId ? achievements.find(a => a.id === achId) : null;
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('award', 'text-amber')}
            <h3 class="modal-title">${existing ? 'Edit Achievement' : 'Add Achievement'}</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="achievement-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Title *</label>
              <input type="text" class="form-input" id="ach-title" value="${existing?.title || ''}" placeholder="e.g. Winner - Smart India Hackathon internal round" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-select" id="ach-cat">
                  ${ACHIEVEMENT_CATEGORIES.map(c => `<option value="${c}" ${existing?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-input" id="ach-date" value="${existing?.date || getState().activeDate || ''}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Description / Impact</label>
              <textarea class="form-textarea" id="ach-desc" rows="3" placeholder="Quantifiable impact, ranking, or recognition...">${existing?.description || ''}</textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Evidence / Certificate URL</label>
                <input type="url" class="form-input" id="ach-url" value="${existing?.evidence_url || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select" id="ach-status">
                  <option value="Completed" ${existing?.status === 'Completed' ? 'selected' : ''}>Completed</option>
                  <option value="Planned" ${existing?.status === 'Planned' ? 'selected' : ''}>Planned</option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Achievement</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('achievement-form').onsubmit = (e) => {
    e.preventDefault();
    const data = {
      title: document.getElementById('ach-title').value.trim(),
      category: document.getElementById('ach-cat').value,
      date: document.getElementById('ach-date').value,
      description: document.getElementById('ach-desc').value.trim(),
      evidence_url: document.getElementById('ach-url').value.trim(),
      status: document.getElementById('ach-status').value
    };

    if (existing) {
      updateAchievement(existing.id, data);
    } else {
      addAchievement(data);
    }

    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

export function openCertificationModal(certId = null, onSaved = null) {
  initModalContainer();
  const certs = getCertifications();
  const existing = certId ? certs.find(c => c.id === certId) : null;
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 500px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('award', 'text-cyan')}
            <h3 class="modal-title">${existing ? 'Edit Certification' : 'Add Certification'}</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="cert-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Certification Name *</label>
              <input type="text" class="form-input" id="crt-name" value="${existing?.certification || ''}" placeholder="e.g. AWS Certified Cloud Practitioner" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Provider</label>
                <input type="text" class="form-input" id="crt-provider" value="${existing?.provider || 'AWS / Coursera'}" />
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select" id="crt-status">
                  <option value="Planned" ${existing?.status === 'Planned' ? 'selected' : ''}>Planned</option>
                  <option value="In Progress" ${existing?.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                  <option value="Completed" ${existing?.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-input" id="crt-date" value="${existing?.date || getState().activeDate || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Credential URL</label>
                <input type="url" class="form-input" id="crt-url" value="${existing?.credential_url || ''}" />
              </div>
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Certification</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('cert-form').onsubmit = (e) => {
    e.preventDefault();
    const data = {
      certification: document.getElementById('crt-name').value.trim(),
      provider: document.getElementById('crt-provider').value.trim(),
      status: document.getElementById('crt-status').value,
      date: document.getElementById('crt-date').value,
      credential_url: document.getElementById('crt-url').value.trim()
    };

    if (existing) {
      updateCertification(existing.id, data);
    } else {
      addCertification(data);
    }

    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

// ==========================================
// 7. INTERNSHIP & APPLICATION MODALS
// ==========================================

export function openInternshipModal(internshipId = null, onSaved = null) {
  initModalContainer();
  const internships = getInternships();
  const existing = internshipId ? internships.find(i => i.id === internshipId) : null;
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 600px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('briefcase', 'text-purple')}
            <h3 class="modal-title">${existing ? 'Edit Internship Lead' : 'New Internship Opportunity'}</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="internship-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Company Name *</label>
                <input type="text" class="form-input" id="int-company" value="${existing?.company || ''}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Role Title *</label>
                <input type="text" class="form-input" id="int-role" value="${existing?.role || 'Software Engineering Intern'}" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Work Type</label>
                <select class="form-select" id="int-work-type">
                  ${INTERNSHIP_WORK_TYPES.map(w => `<option value="${w}" ${existing?.work_type === w ? 'selected' : ''}>${w}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Source</label>
                <select class="form-select" id="int-source">
                  ${INTERNSHIP_SOURCES.map(s => `<option value="${s}" ${existing?.source === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Deadline</label>
                <input type="date" class="form-input" id="int-deadline" value="${existing?.application_deadline || ''}" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Location</label>
                <input type="text" class="form-input" id="int-location" value="${existing?.location || 'Remote'}" />
              </div>
              <div class="form-group">
                <label class="form-label">Application URL</label>
                <input type="url" class="form-input" id="int-url" value="${existing?.application_url || ''}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Required Skills</label>
              <input type="text" class="form-input" id="int-skills" value="${existing?.skills || ''}" placeholder="e.g. Python, C++, FastAPI, Docker" />
            </div>

            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea class="form-textarea" id="int-notes" rows="2">${existing?.notes || ''}</textarea>
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Internship</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('internship-form').onsubmit = (e) => {
    e.preventDefault();
    const data = {
      company: document.getElementById('int-company').value.trim(),
      role: document.getElementById('int-role').value.trim(),
      work_type: document.getElementById('int-work-type').value,
      source: document.getElementById('int-source').value,
      application_deadline: document.getElementById('int-deadline').value,
      location: document.getElementById('int-location').value.trim(),
      application_url: document.getElementById('int-url').value.trim(),
      skills: document.getElementById('int-skills').value.trim(),
      notes: document.getElementById('int-notes').value.trim()
    };

    if (existing) {
      updateInternship(existing.id, data);
    } else {
      addInternship(data);
    }

    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

export function openApplicationModal(appId = null, onSaved = null) {
  initModalContainer();
  const apps = getApplications();
  const existing = appId ? apps.find(a => a.id === appId) : null;
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 600px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('briefcase', 'text-cyan')}
            <h3 class="modal-title">${existing ? 'Edit Application' : 'New Application'}</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="app-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Company Name *</label>
                <input type="text" class="form-input" id="app-company" value="${existing?.company || ''}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Role Title *</label>
                <input type="text" class="form-input" id="app-role" value="${existing?.role || 'Software Engineering Intern'}" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select" id="app-status">
                  ${APPLICATION_STATUSES.map(s => `<option value="${s}" ${existing?.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Date Applied</label>
                <input type="date" class="form-input" id="app-date" value="${existing?.date_applied || getState().activeDate || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Deadline</label>
                <input type="date" class="form-input" id="app-deadline" value="${existing?.deadline || ''}" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Next Action</label>
                <input type="text" class="form-input" id="app-next-act" value="${existing?.next_action || ''}" placeholder="e.g. Prepare OA, send follow-up" />
              </div>
              <div class="form-group">
                <label class="form-label">Next Action Due Date</label>
                <input type="date" class="form-input" id="app-next-date" value="${existing?.next_action_date || ''}" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Location / Work Type</label>
                <input type="text" class="form-input" id="app-loc" value="${existing?.location || 'Remote'}" />
              </div>
              <div class="form-group">
                <label class="form-label">Application URL</label>
                <input type="url" class="form-input" id="app-url" value="${existing?.application_url || ''}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea class="form-textarea" id="app-notes" rows="2">${existing?.notes || ''}</textarea>
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Application</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('app-form').onsubmit = (e) => {
    e.preventDefault();
    const data = {
      company: document.getElementById('app-company').value.trim(),
      role: document.getElementById('app-role').value.trim(),
      status: document.getElementById('app-status').value,
      date_applied: document.getElementById('app-date').value,
      deadline: document.getElementById('app-deadline').value,
      next_action: document.getElementById('app-next-act').value.trim(),
      next_action_date: document.getElementById('app-next-date').value,
      location: document.getElementById('app-loc').value.trim(),
      application_url: document.getElementById('app-url').value.trim(),
      notes: document.getElementById('app-notes').value.trim()
    };

    if (existing) {
      updateApplication(existing.id, data);
    } else {
      addApplication(data);
    }

    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

// ==========================================
// 8. OUTREACH, REFERRALS & NETWORKING MODALS
// ==========================================

export function openOutreachModal(outId = null, onSaved = null) {
  initModalContainer();
  const list = getOutreach();
  const existing = outId ? list.find(o => o.id === outId) : null;
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('send', 'text-cyan')}
            <h3 class="modal-title">${existing ? 'Edit Cold Email Outreach' : 'Log Cold Outreach'}</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="outreach-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Contact Name *</label>
                <input type="text" class="form-input" id="out-contact" value="${existing?.contact || ''}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Company *</label>
                <input type="text" class="form-input" id="out-company" value="${existing?.company || ''}" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Target Role</label>
                <input type="text" class="form-input" id="out-role" value="${existing?.role || 'SWE Intern'}" />
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select" id="out-status">
                  ${OUTREACH_STATUSES.map(s => `<option value="${s}" ${existing?.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Date Sent</label>
                <input type="date" class="form-input" id="out-date" value="${existing?.date_sent || getState().activeDate || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label">Follow-up Due Date</label>
                <input type="date" class="form-input" id="out-followup" value="${existing?.follow_up_date || ''}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Purpose / Notes</label>
              <textarea class="form-textarea" id="out-purpose" rows="2">${existing?.purpose || ''}</textarea>
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Outreach</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('outreach-form').onsubmit = (e) => {
    e.preventDefault();
    const data = {
      contact: document.getElementById('out-contact').value.trim(),
      company: document.getElementById('out-company').value.trim(),
      role: document.getElementById('out-role').value.trim(),
      status: document.getElementById('out-status').value,
      date_sent: document.getElementById('out-date').value,
      follow_up_date: document.getElementById('out-followup').value,
      purpose: document.getElementById('out-purpose').value.trim()
    };

    if (existing) {
      updateOutreach(existing.id, data);
    } else {
      addOutreach(data);
    }

    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

export function openReferralModal(refId = null, onSaved = null) {
  initModalContainer();
  const list = getReferrals();
  const existing = refId ? list.find(r => r.id === refId) : null;
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 480px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('users', 'text-emerald')}
            <h3 class="modal-title">${existing ? 'Edit Referral' : 'Log Referral'}</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="referral-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Person Name *</label>
              <input type="text" class="form-input" id="ref-person" value="${existing?.person || ''}" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Company *</label>
                <input type="text" class="form-input" id="ref-company" value="${existing?.company || ''}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select" id="ref-status">
                  ${REFERRAL_STATUSES.map(s => `<option value="${s}" ${existing?.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Role</label>
              <input type="text" class="form-input" id="ref-role" value="${existing?.role || 'Software Engineer'}" />
            </div>

            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea class="form-textarea" id="ref-notes" rows="2">${existing?.notes || ''}</textarea>
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Referral</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('referral-form').onsubmit = (e) => {
    e.preventDefault();
    const data = {
      person: document.getElementById('ref-person').value.trim(),
      company: document.getElementById('ref-company').value.trim(),
      status: document.getElementById('ref-status').value,
      role: document.getElementById('ref-role').value.trim(),
      notes: document.getElementById('ref-notes').value.trim()
    };

    if (existing) {
      updateReferral(existing.id, data);
    } else {
      addReferral(data);
    }

    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

export function openNetworkingModal(netId = null, onSaved = null) {
  initModalContainer();
  const list = getNetworking();
  const existing = netId ? list.find(n => n.id === netId) : null;
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 500px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('users', 'text-purple')}
            <h3 class="modal-title">${existing ? 'Edit Networking Contact' : 'Log Networking Connection'}</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="networking-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Contact Name *</label>
                <input type="text" class="form-input" id="net-person" value="${existing?.person || ''}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Organization / College</label>
                <input type="text" class="form-input" id="net-org" value="${existing?.organization || ''}" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Platform</label>
                <select class="form-select" id="net-platform">
                  ${NETWORKING_PLATFORMS.map(p => `<option value="${p}" ${existing?.platform === p ? 'selected' : ''}>${p}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Follow-up Date</label>
                <input type="date" class="form-input" id="net-followup" value="${existing?.follow_up_date || ''}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Reason / Discussion</label>
              <textarea class="form-textarea" id="net-reason" rows="3" placeholder="Key topics discussed...">${existing?.reason || ''}</textarea>
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Connection</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('networking-form').onsubmit = (e) => {
    e.preventDefault();
    const data = {
      person: document.getElementById('net-person').value.trim(),
      organization: document.getElementById('net-org').value.trim(),
      platform: document.getElementById('net-platform').value,
      follow_up_date: document.getElementById('net-followup').value,
      reason: document.getElementById('net-reason').value.trim()
    };

    if (existing) {
      updateNetworking(existing.id, data);
    } else {
      addNetworking(data);
    }

    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

// ==========================================
// 9. APTITUDE SESSION MODAL
// ==========================================

export function openAptitudeSessionModal(onSaved = null) {
  initModalContainer();
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 480px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('target', 'text-rose')}
            <h3 class="modal-title">Log Aptitude Practice Session</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="aptitude-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-select" id="apt-cat">
                  ${APTITUDE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Topic</label>
                <select class="form-select" id="apt-topic"></select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Attempted</label>
                <input type="number" class="form-input" id="apt-attempted" value="15" min="1" required />
              </div>
              <div class="form-group">
                <label class="form-label">Solved</label>
                <input type="number" class="form-input" id="apt-solved" value="12" min="0" required />
              </div>
              <div class="form-group">
                <label class="form-label">Duration (m)</label>
                <input type="number" class="form-input" id="apt-duration" value="30" min="5" step="5" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Notes & Weak Points</label>
              <textarea class="form-textarea" id="apt-notes" rows="2" placeholder="e.g. Formula memorization for compound interest..."></textarea>
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Session</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const catSelect = document.getElementById('apt-cat');
  const topicSelect = document.getElementById('apt-topic');

  const populateTopics = () => {
    const topics = APTITUDE_TOPICS[catSelect.value] || [];
    topicSelect.innerHTML = topics.map(t => `<option value="${t}">${t}</option>`).join('') + `<option value="Other">Other</option>`;
  };
  catSelect.onchange = populateTopics;
  populateTopics();

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('aptitude-form').onsubmit = (e) => {
    e.preventDefault();
    logAptitudeSession({
      category: catSelect.value,
      topic: topicSelect.value,
      questions_attempted: document.getElementById('apt-attempted').value,
      questions_solved: document.getElementById('apt-solved').value,
      time_spent_minutes: document.getElementById('apt-duration').value,
      notes: document.getElementById('apt-notes').value.trim()
    });

    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

// ==========================================
// 10. INTERVIEW QUESTIONS & MOCKS MODALS
// ==========================================

export function openInterviewQuestionModal(questionId = null, onSaved = null) {
  initModalContainer();
  const list = getInterviewQuestions();
  const existing = questionId ? list.find(q => q.id === questionId) : null;
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 560px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('brain', 'text-amber')}
            <h3 class="modal-title">${existing ? 'Edit Interview Question' : 'Add Technical Interview Question'}</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="iq-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label class="form-label">Interview Question *</label>
              <textarea class="form-textarea" id="iq-question" rows="2" placeholder="e.g. Explain how virtual memory and page tables work in Linux" required>${existing?.question || ''}</textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-select" id="iq-cat">
                  ${INTERVIEW_QUESTION_CATEGORIES.map(c => `<option value="${c}" ${existing?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Topic</label>
                <input type="text" class="form-input" id="iq-topic" value="${existing?.topic || 'Virtual Memory'}" />
              </div>
              <div class="form-group">
                <label class="form-label">Difficulty</label>
                <select class="form-select" id="iq-diff">
                  <option value="Easy" ${existing?.difficulty === 'Easy' ? 'selected' : ''}>Easy</option>
                  <option value="Medium" ${!existing || existing?.difficulty === 'Medium' ? 'selected' : ''}>Medium</option>
                  <option value="Hard" ${existing?.difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select" id="iq-status">
                  ${INTERVIEW_QUESTION_STATUSES.map(s => `<option value="${s}" ${existing?.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="display: flex; align-items: center; margin-top: 22px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.85rem;">
                  <input type="checkbox" id="iq-rev-req" ${existing?.revision_required || existing?.status === 'Needs Revision' ? 'checked' : ''} />
                  <span>Mark Needs Revision</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Answer Notes & Key Points</label>
              <textarea class="form-textarea" id="iq-notes" rows="3" placeholder="Core explanation, trade-offs, diagram references...">${existing?.answer_notes || ''}</textarea>
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Question</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('iq-form').onsubmit = (e) => {
    e.preventDefault();
    const data = {
      question: document.getElementById('iq-question').value.trim(),
      category: document.getElementById('iq-cat').value,
      topic: document.getElementById('iq-topic').value.trim(),
      difficulty: document.getElementById('iq-diff').value,
      status: document.getElementById('iq-status').value,
      revision_required: document.getElementById('iq-rev-req').checked,
      answer_notes: document.getElementById('iq-notes').value.trim()
    };

    if (existing) {
      updateInterviewQuestion(existing.id, data);
    } else {
      addInterviewQuestion(data);
    }

    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

export function openMockInterviewModal(mockId = null, onSaved = null) {
  initModalContainer();
  const mocks = getMockInterviews();
  const existing = mockId ? mocks.find(m => m.id === mockId) : null;
  const container = document.getElementById('modal-root');

  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-dialog" style="max-width: 560px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            ${getIcon('brain', 'text-cyan')}
            <h3 class="modal-title">${existing ? 'Edit Mock Interview' : 'Schedule / Log Mock Interview'}</h3>
          </div>
          <button class="btn btn-ghost btn-icon" id="btn-close-modal">${ICONS.x}</button>
        </div>

        <form id="mock-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Interview Type</label>
                <select class="form-select" id="mi-type">
                  ${MOCK_INTERVIEW_TYPES.map(t => `<option value="${t}" ${existing?.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" class="form-input" id="mi-date" value="${existing?.date || getState().activeDate || ''}" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Topics Covered</label>
                <input type="text" class="form-input" id="mi-topics" value="${existing?.topics || 'DSA & Core CS'}" />
              </div>
              <div class="form-group">
                <label class="form-label">Duration (minutes)</label>
                <input type="number" class="form-input" id="mi-duration" value="${existing?.duration_minutes || 45}" step="5" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Questions Asked</label>
              <textarea class="form-textarea" id="mi-questions" rows="2" placeholder="List questions asked during the simulation...">${existing?.questions || ''}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Areas to Improve</label>
              <textarea class="form-textarea" id="mi-improve" rows="2" placeholder="e.g. Articulating space complexity trade-offs...">${existing?.areas_to_improve || ''}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Follow-up Revision Plan</label>
              <input type="text" class="form-input" id="mi-followup" value="${existing?.followup_revision || ''}" placeholder="e.g. Revise LRU Cache implementation" />
            </div>
          </div>

          <div class="modal-footer" style="border-top: 1px solid var(--color-border); padding: 12px 16px; display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Mock Session</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-close-modal').onclick = closeModal;
  document.getElementById('btn-cancel-modal').onclick = closeModal;
  document.getElementById('modal-backdrop').onclick = (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  };

  document.getElementById('mock-form').onsubmit = (e) => {
    e.preventDefault();
    const data = {
      type: document.getElementById('mi-type').value,
      date: document.getElementById('mi-date').value,
      topics: document.getElementById('mi-topics').value.trim(),
      duration_minutes: document.getElementById('mi-duration').value,
      questions: document.getElementById('mi-questions').value.trim(),
      areas_to_improve: document.getElementById('mi-improve').value.trim(),
      followup_revision: document.getElementById('mi-followup').value.trim()
    };

    if (existing) {
      updateMockInterview(existing.id, data);
    } else {
      addMockInterview(data);
    }

    closeModal();
    if (typeof onSaved === 'function') onSaved();
    window.dispatchEvent(new CustomEvent('career-state-updated'));
  };
}

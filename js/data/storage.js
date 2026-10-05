/**
 * AI Study & Task Planner - Storage & Persistence Engine
 * Centralized offline-first persistence repository.
 * Zero external database dependencies. Safe reactive subscriber model.
 */

import { createInitialState } from './initialState.js';

export const STORAGE_KEY = 'ai_study_task_planner_v2';
const LEGACY_STORAGE_KEYS = [
  'legacy_tracker_v1',
  'legacy_tracker_v8',
  'career_tracker_simulated_date',
  'career_tracker_theme'
];

const LISTENERS = new Set();
let currentState = null;
let _saveTimer = null;

export function initStorage() {
  const initial = createInitialState();
  try {
    if (typeof localStorage !== 'undefined') {
      // Purge any legacy personal tracker data
      LEGACY_STORAGE_KEYS.forEach(key => {
        try { localStorage.removeItem(key); } catch (e) {}
      });

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        currentState = deepMerge(initial, parsed);
        // Ensure arrays are initialized
        if (!Array.isArray(currentState.plans)) currentState.plans = [];
        if (!Array.isArray(currentState.tasks)) currentState.tasks = [];
        if (!Array.isArray(currentState.studySessions)) currentState.studySessions = [];
        if (!currentState.settings) currentState.settings = initial.settings;
        if (!currentState.streak) currentState.streak = initial.streak;
      } else {
        currentState = initial;
        saveState(true);
      }
    } else {
      currentState = initial;
    }
  } catch (err) {
    console.error('Storage initialization issue, using clean state:', err);
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

export function saveState(immediate = false) {
  if (immediate) {
    if (_saveTimer) {
      clearTimeout(_saveTimer);
      _saveTimer = null;
    }
    try {
      if (typeof localStorage !== 'undefined' && currentState) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
      }
    } catch (err) {
      console.error('Storage save error:', err);
    }
    return;
  }

  if (!_saveTimer) {
    _saveTimer = setTimeout(() => {
      _saveTimer = null;
      try {
        if (typeof localStorage !== 'undefined' && currentState) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
        }
      } catch (err) {
        console.error('Storage save error:', err);
      }
    }, 50);
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
  const state = getState();
  // Strip any accidental sensitive tokens
  const cleanExport = {
    appName: 'AI Study & Task Planner',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    activePlanId: state.activePlanId,
    plans: state.plans || [],
    tasks: state.tasks || [],
    studySessions: state.studySessions || [],
    settings: {
      theme: state.settings?.theme || 'light',
      defaultDailyHours: state.settings?.defaultDailyHours || 2,
      defaultDaysPerWeek: state.settings?.defaultDaysPerWeek || 6,
      aiProvider: state.settings?.aiProvider || 'google',
      aiModel: state.settings?.aiModel || 'gemini-1.5-flash'
      // Note: Never export API keys!
    }
  };

  const jsonStr = JSON.stringify(cleanExport, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `study-planner-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBackupJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || (!parsed.plans && !parsed.tasks)) {
      throw new Error('Invalid backup file: missing plans or tasks data.');
    }
    const current = getState();
    const merged = {
      ...current,
      activePlanId: parsed.activePlanId !== undefined ? parsed.activePlanId : current.activePlanId,
      plans: Array.isArray(parsed.plans) ? parsed.plans : current.plans,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : current.tasks,
      studySessions: Array.isArray(parsed.studySessions) ? parsed.studySessions : current.studySessions,
      settings: {
        ...current.settings,
        ...(parsed.settings || {})
      }
    };
    currentState = merged;
    saveState(true);
    notifyListeners();
    return { success: true };
  } catch (err) {
    console.error('Import backup failed:', err);
    return { success: false, error: err.message };
  }
}

export function resetToInitialState() {
  currentState = createInitialState();
  saveState(true);
  notifyListeners();
  return currentState;
}

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target !== undefined ? target : source;
  if (!target || typeof target !== 'object') return source;
  const output = { ...target };
  for (const key of Object.keys(source)) {
    const sVal = source[key];
    const tVal = target[key];
    if (sVal && typeof sVal === 'object' && !Array.isArray(sVal) && tVal && typeof tVal === 'object' && !Array.isArray(tVal)) {
      output[key] = deepMerge(tVal, sVal);
    } else {
      output[key] = sVal;
    }
  }
  return output;
}


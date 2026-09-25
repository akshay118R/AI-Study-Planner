/**
 * Akshay's 12-Month AI/ML Career OS - Storage & Persistence Engine
 * Handles reactive updates, localStorage persistence, JSON backup & recovery.
 */
import { createInitialState } from './initialState.js';

const STORAGE_KEY = 'akshay_career_os_v1';
const LISTENERS = new Set();

let currentState = null;

export function initStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with default initial state to guarantee any missing keys exist
      const initial = createInitialState();
      currentState = deepMerge(initial, parsed);
    } else {
      currentState = createInitialState();
      saveState();
    }
  } catch (err) {
    console.error('Failed to load from storage. Initializing fresh state:', err);
    currentState = createInitialState();
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
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

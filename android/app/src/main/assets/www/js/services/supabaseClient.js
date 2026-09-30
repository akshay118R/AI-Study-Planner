/**
 * Akshay's Career Tracker - Supabase Client & Sync Service
 * Connects directly to Supabase REST API using the publishable anon key.
 * Features safe offline fallback, automatic syncing, and zero sensitive keys.
 */

const SUPABASE_CONFIG = {
  url: 'https://seexdeigpglovjrneowq.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZXhkZWlncGdsb3Zqcm5lb3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTQ2MTgsImV4cCI6MjEwNjE3MDYxOH0.zj5mDCLpTQo-HA0BUylDckPM0urnQcs0y2VlVjGvXJo',
  projectId: 'seexdeigpglovjrneowq'
};

let lastSyncTime = null;
let isConnected = true;
const connectionListeners = new Set();

function setConnectionState(val) {
  const changed = isConnected !== val;
  isConnected = val;
  if (changed) {
    connectionListeners.forEach(cb => {
      try { cb(isConnected); } catch (e) { console.error(e); }
    });
  }
}

// Window network liveness listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    const ok = await SupabaseClient.testConnection();
    if (ok && typeof window.__triggerAppSync === 'function') {
      window.__triggerAppSync();
    }
  });
  window.addEventListener('offline', () => {
    setConnectionState(false);
  });
}

function getHeaders(preferReturn = false) {
  const headers = {
    'apikey': SUPABASE_CONFIG.anonKey,
    'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
    'Content-Type': 'application/json'
  };
  if (preferReturn) {
    headers['Prefer'] = 'return=representation';
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${SUPABASE_CONFIG.url}/rest/v1/${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(options.preferReturn),
        ...options.headers
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Supabase request failed: ${res.status} ${errText}`);
      setConnectionState(false);
      return null;
    }

    setConnectionState(true);
    lastSyncTime = new Date().toISOString();

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    return true;
  } catch (err) {
    console.warn(`Supabase network issue, offline fallback active: ${err.message}`);
    setConnectionState(false);
    return null;
  }
}

export const SupabaseClient = {
  onConnectionChange(callback) {
    connectionListeners.add(callback);
    callback(isConnected);
    return () => connectionListeners.delete(callback);
  },

  getConfig() {
    return {
      projectId: SUPABASE_CONFIG.projectId,
      url: SUPABASE_CONFIG.url,
      connected: isConnected,
      lastSync: lastSyncTime
    };
  },

  async testConnection() {
    const data = await request('profiles?select=id&limit=1');
    const ok = data !== null;
    setConnectionState(ok);
    if (ok) lastSyncTime = new Date().toISOString();
    return ok;
  },

  // -------------------------------------------------------------
  // MONTHS
  // -------------------------------------------------------------
  async fetchMonths() {
    return await request('months?select=*&order=year.asc,month.asc');
  },

  async upsertMonth(month) {
    return await request('months', {
      method: 'POST',
      preferReturn: true,
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(month)
    });
  },

  // -------------------------------------------------------------
  // WEEKS
  // -------------------------------------------------------------
  async fetchWeeks(monthId = null) {
    const query = monthId ? `weeks?month_id=eq.${monthId}&order=week_number.asc` : 'weeks?select=*&order=start_date.asc';
    return await request(query);
  },

  async upsertWeek(week) {
    return await request('weeks', {
      method: 'POST',
      preferReturn: true,
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(week)
    });
  },

  // -------------------------------------------------------------
  // TASKS
  // -------------------------------------------------------------
  async fetchTasks(date = null) {
    const query = date ? `tasks?date=eq.${date}&order=created_at.asc` : 'tasks?select=*&order=date.asc,created_at.asc';
    return await request(query);
  },

  async insertTask(task) {
    return await request('tasks', {
      method: 'POST',
      preferReturn: true,
      body: JSON.stringify(task)
    });
  },

  async updateTask(id, updates) {
    return await request(`tasks?id=eq.${id}`, {
      method: 'PATCH',
      preferReturn: true,
      body: JSON.stringify(updates)
    });
  },

  async deleteTask(id) {
    return await request(`tasks?id=eq.${id}`, {
      method: 'DELETE'
    });
  },

  // -------------------------------------------------------------
  // STUDY SESSIONS
  // -------------------------------------------------------------
  async fetchStudySessions(date = null) {
    const query = date ? `study_sessions?date=eq.${date}&order=created_at.asc` : 'study_sessions?select=*&order=date.desc';
    return await request(query);
  },

  async insertStudySession(session) {
    return await request('study_sessions', {
      method: 'POST',
      preferReturn: true,
      body: JSON.stringify(session)
    });
  },

  // -------------------------------------------------------------
  // DSA PROGRESS
  // -------------------------------------------------------------
  async fetchDSAProgress() {
    return await request('dsa_progress?select=*&order=video_number.asc');
  },

  async updateDSAProgress(id, updates) {
    return await request(`dsa_progress?id=eq.${id}`, {
      method: 'PATCH',
      preferReturn: true,
      body: JSON.stringify(updates)
    });
  },

  // -------------------------------------------------------------
  // SEMESTER ANSWERS
  // -------------------------------------------------------------
  async fetchSemesterAnswers(date = null) {
    const query = date ? `semester_answers?date=eq.${date}&order=created_at.asc` : 'semester_answers?select=*&order=date.asc';
    return await request(query);
  },

  async insertSemesterAnswer(answer) {
    return await request('semester_answers', {
      method: 'POST',
      preferReturn: true,
      body: JSON.stringify(answer)
    });
  },

  async updateSemesterAnswer(id, updates) {
    return await request(`semester_answers?id=eq.${id}`, {
      method: 'PATCH',
      preferReturn: true,
      body: JSON.stringify(updates)
    });
  },

  // -------------------------------------------------------------
  // GOALS
  // -------------------------------------------------------------
  async fetchGoals(type = null, parentId = null) {
    let query = 'goals?select=*&order=created_at.asc';
    if (type === 'MONTHLY' && parentId) {
      query = `goals?type=eq.MONTHLY&month_id=eq.${parentId}&order=created_at.asc`;
    } else if (type === 'WEEKLY' && parentId) {
      query = `goals?type=eq.WEEKLY&week_id=eq.${parentId}&order=created_at.asc`;
    }
    return await request(query);
  },

  async insertGoal(goal) {
    return await request('goals', {
      method: 'POST',
      preferReturn: true,
      body: JSON.stringify(goal)
    });
  },

  async updateGoal(id, updates) {
    return await request(`goals?id=eq.${id}`, {
      method: 'PATCH',
      preferReturn: true,
      body: JSON.stringify(updates)
    });
  },

  async deleteGoal(id) {
    return await request(`goals?id=eq.${id}`, {
      method: 'DELETE'
    });
  },

  // -------------------------------------------------------------
  // MONTHLY REVIEWS
  // -------------------------------------------------------------
  async fetchMonthlyReview(monthId) {
    const list = await request(`monthly_reviews?month_id=eq.${monthId}&limit=1`);
    return list && list.length ? list[0] : null;
  },

  async fetchAllMonthlyReviews() {
    return await request('monthly_reviews?select=*');
  },

  async upsertMonthlyReview(review) {
    return await request('monthly_reviews?on_conflict=month_id', {
      method: 'POST',
      preferReturn: true,
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(review)
    });
  },

  async updateMonth(monthId, updates) {
    return await request(`months?id=eq.${monthId}`, {
      method: 'PATCH',
      preferReturn: true,
      body: JSON.stringify(updates)
    });
  },

  // -------------------------------------------------------------
  // WEEKLY REVIEWS
  // -------------------------------------------------------------
  async fetchWeeklyReview(weekId) {
    const list = await request(`weekly_reviews?week_id=eq.${weekId}&limit=1`);
    return list && list.length ? list[0] : null;
  },

  async fetchAllWeeklyReviews() {
    return await request('weekly_reviews?select=*');
  },

  async upsertWeeklyReview(review) {
    return await request('weekly_reviews?on_conflict=week_id', {
      method: 'POST',
      preferReturn: true,
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(review)
    });
  },

  // -------------------------------------------------------------
  // DAILY REVIEWS
  // -------------------------------------------------------------
  async fetchDailyReview(date) {
    const list = await request(`daily_reviews?date=eq.${date}&limit=1`);
    return list && list.length ? list[0] : null;
  },

  async fetchAllDailyReviews() {
    return await request('daily_reviews?select=*');
  },

  async upsertDailyReview(review) {
    return await request('daily_reviews?on_conflict=date', {
      method: 'POST',
      preferReturn: true,
      headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(review)
    });
  },

  // -------------------------------------------------------------
  // GAMING LOGS
  // -------------------------------------------------------------
  async fetchGamingLogs(startDate = null, endDate = null) {
    let query = 'gaming_logs?select=*&order=date.asc';
    if (startDate && endDate) {
      query = `gaming_logs?date=gte.${startDate}&date=lte.${endDate}&order=date.asc`;
    }
    return await request(query);
  },

  async insertGamingLog(log) {
    return await request('gaming_logs', {
      method: 'POST',
      preferReturn: true,
      body: JSON.stringify(log)
    });
  },

  // -------------------------------------------------------------
  // PROFILES / SETTINGS
  // -------------------------------------------------------------
  async fetchProfile() {
    const list = await request('profiles?id=eq.akshay&limit=1');
    return list && list.length ? list[0] : null;
  },

  async updateProfileSettings(settings) {
    return await request('profiles?id=eq.akshay', {
      method: 'PATCH',
      preferReturn: true,
      body: JSON.stringify({ settings })
    });
  }
};

/**
 * Akshay's Career Tracker - Core Tracker Service
 * Strict data hierarchy: MONTH -> WEEK -> TODAY -> TASK / STUDY SESSION
 * Handles 5 Task Categories: LEARN, PRACTICE, SEMESTER, BUILD, REVISE
 * Persists seamlessly to Supabase with local cache resilience.
 */

import { SupabaseClient } from './supabaseClient.js';
import {
  getCanonicalToday,
  PROGRAM_START_DATE,
  PLAN_START_DATE,
  isProgramStarted,
  getWeekRange,
  getWeeksInMonth,
  formatFullDate,
  formatShortDate,
  formatMonthYear,
  PLAN_12_MONTHS,
  getPrevMonthId,
  getNextMonthId,
  getAllPlanWeeks,
  getWeekById,
  getPrevWeekId,
  getNextWeekId,
  getWeekAndMonthForDate,
  getMondayToSundayDays,
  parseDate,
  formatDateStr,
  shiftDate
} from './dateService.js';
import { calculateStudyStreak, isDaySufficientlyCompleted } from './streakService.js';
import { getState, updateState } from '../data/storage.js';
import {
  DAVINCI_PLAYLIST_URL,
  DAVINCI_PLAYLIST_VIDEOS,
  getDavinciVideoForDate,
  getDavinciVideosForWeek
} from '../data/davinciData.js';
import {
  PRIME_PARTS_CATALOG,
  isPrimeReleaseDay,
  getPrimePartForReleaseDate,
  getPrimePartsForDateRange,
  getPrimePartsForMonth
} from '../data/primeData.js';
import {
  JAVA_PLAYLIST_URL,
  JAVA_PLAYLIST_VIDEOS,
  JAVA_MONTHLY_SCHEDULE,
  getJavaVideoForDate,
  getJavaVideoForWeek,
  getJavaVideosForMonth,
  getJavaProgressSummary,
  JAVA_FUNDAMENTALS_TOPICS,
  getJavaTopicForDate
} from '../data/javaData.js';

export const DSA_PLAYLIST_URL = 'https://youtube.com/playlist?list=PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt&si=7qOZjYth49Nv-6NN';

export function isLegacyCTask(t) {
  if (!t) return false;
  const title = (t.title || '').toLowerCase();
  const desc = (t.description || '').toLowerCase();
  const source = (t.source || '').toLowerCase();
  const notes = (t.notes || '').toLowerCase();
  if (title.includes('practice c arrays') ||
      title.includes('complete c fundamentals') ||
      title.includes('c memory allocator') ||
      title.includes('c compilation') ||
      title.includes('small c project') ||
      title.includes('c pointers') ||
      title.includes('c structures') ||
      title.includes('c file handling') ||
      title.includes('c functions') ||
      source.includes('c arrays') ||
      source.includes('c fundamentals') ||
      source.includes('c pointers') ||
      source.includes('c allocator') ||
      notes.includes('c programming')) {
    return true;
  }
  return false;
}

export const TASK_CATEGORIES = ['LEARN', 'PRACTICE', 'SEMESTER', 'BUILD', 'REVISE', 'DAVINCI', 'HEALTH'];

export const CATEGORY_META = {
  LEARN: {
    label: 'LEARN',
    color: '#3B82F6',
    badgeClass: 'badge-blue',
    subtypes: ['PRIME_3', 'INDIVIDUAL'],
    description: 'Prime 3.0 & Java Playlist Track'
  },
  PRACTICE: {
    label: 'PRACTICE',
    color: '#8B5CF6',
    badgeClass: 'badge-purple',
    subtypes: ['DSA', 'PROBLEMS'],
    description: 'DSA Playlist & Problem Solving'
  },
  SEMESTER: {
    label: 'SEMESTER',
    color: '#06B6D4',
    badgeClass: 'badge-cyan',
    subtypes: ['SEMESTER'],
    description: '2 Required Answers + 1 Optional 3rd'
  },
  BUILD: {
    label: 'BUILD',
    color: '#F97316',
    badgeClass: 'badge-orange',
    subtypes: ['PROJECT'],
    description: 'Project Implementation Milestones'
  },
  REVISE: {
    label: 'REVISE',
    color: '#10B981',
    badgeClass: 'badge-emerald',
    subtypes: ['REVISION'],
    description: 'DSA Revision & Semester Revision'
  },
  DAVINCI: {
    label: 'DAVINCI',
    color: '#EC4899',
    badgeClass: 'badge-pink',
    subtypes: ['DAVINCI_PLAYLIST'],
    description: 'DaVinci Resolve Video Editing Course'
  },
  HEALTH: {
    label: 'HEALTH',
    color: '#10B981',
    badgeClass: 'badge-emerald',
    subtypes: ['EXERCISE'],
    description: 'Exercise — 30 minutes'
  }
};

/**
 * Initialize Tracker Service & Sync with Supabase
 */
export async function initTrackerService() {
  try {
    const connected = await SupabaseClient.testConnection();
    if (connected) {
      console.log('✓ Supabase connection active.');
      // Pre-fetch in foreground
      await syncFromSupabase();
    } else {
      console.log('Using local offline cache for Tracker Service.');
    }
  } catch (e) {
    console.warn('Tracker sync initialization warning:', e);
  }
}

export async function flushPendingSyncsToSupabase() {
  try {
    const state = getState();
    const tasks = (state.remote_tasks && state.remote_tasks.length > 0)
      ? state.remote_tasks
      : (state.daily_tasks || []);
    const pendingTasks = tasks.filter(t => t && t.sync_pending);

    if (pendingTasks.length > 0) {
      for (const pt of pendingTasks) {
        try {
          const res = await SupabaseClient.updateTask(pt.id, {
            completed: !!pt.completed,
            completed_at: pt.completed_at || (pt.completed ? new Date().toISOString() : null),
            skipped: !!pt.skipped,
            ...(pt.date ? { date: pt.date } : {}),
            ...(pt.week_id ? { week_id: pt.week_id } : {}),
            ...(pt.month_id ? { month_id: pt.month_id } : {})
          });

          let syncSucceeded = false;
          if (Array.isArray(res) && res.length === 0) {
            // Task does not exist yet in Supabase tasks table, insert it
            const cat = (pt.category === 'HEALTH') ? 'REVISE' : (pt.category || 'LEARN');
            const insertRes = await SupabaseClient.insertTask({
              id: pt.id,
              date: pt.date,
              week_id: pt.week_id,
              month_id: pt.month_id,
              title: pt.title,
              category: cat,
              subtype: pt.subtype || 'GENERAL',
              completed: !!pt.completed,
              completed_at: pt.completed_at || (pt.completed ? new Date().toISOString() : null),
              estimated_minutes: pt.estimated_minutes || 30,
              priority: pt.priority || 'Normal',
              notes: pt.notes || '',
              skipped: !!pt.skipped,
              created_at: pt.created_at || new Date().toISOString()
            });
            if (insertRes !== null) syncSucceeded = true;
          } else if (res !== null) {
            syncSucceeded = true;
          }

          if (syncSucceeded) {
            updateState(curr => {
              const base = (curr.remote_tasks && curr.remote_tasks.length > 0) ? curr.remote_tasks : (curr.daily_tasks || []);
              const updated = base.map(t => t.id === pt.id ? { ...t, sync_pending: false } : t);
              return { ...curr, remote_tasks: updated, daily_tasks: updated };
            });
          }
        } catch (e) {
          console.warn('[Career Tracker] Failed to flush pending task:', pt.id, e);
        }
      }
    }
  } catch (err) {
    console.warn('[Career Tracker] flushPendingSyncsToSupabase error:', err);
  }
}

export async function syncFromSupabase() {
  try {
    await flushPendingSyncsToSupabase();

    const [tasks, dsa, semester, goals, gaming, months, monthlyReviews, weeks, weeklyReviews, studySessions, dailyReviews] = await Promise.all([
      SupabaseClient.fetchTasks(),
      SupabaseClient.fetchDSAProgress(),
      SupabaseClient.fetchSemesterAnswers(),
      SupabaseClient.fetchGoals(),
      SupabaseClient.fetchGamingLogs(),
      SupabaseClient.fetchMonths(),
      SupabaseClient.fetchAllMonthlyReviews(),
      SupabaseClient.fetchWeeks(),
      SupabaseClient.fetchAllWeeklyReviews(),
      SupabaseClient.fetchStudySessions(),
      SupabaseClient.fetchAllDailyReviews()
    ]);

    const reviewsMap = {};
    if (Array.isArray(monthlyReviews)) {
      monthlyReviews.forEach(r => {
        if (r.month_id) reviewsMap[r.month_id] = r;
      });
    }

    const weeklyReviewsMap = {};
    if (Array.isArray(weeklyReviews)) {
      weeklyReviews.forEach(r => {
        if (r.week_id) weeklyReviewsMap[r.week_id] = r;
      });
    }

    const dailyReviewsMap = {};
    if (Array.isArray(dailyReviews)) {
      dailyReviews.forEach(r => {
        if (r.date) dailyReviewsMap[r.date] = r;
      });
    }

    updateState(curr => {
      const remoteList = tasks || curr.remote_tasks || [];
      const mergedTasks = remoteList.map(rt => {
        const localPending = (curr.remote_tasks || curr.daily_tasks || []).find(lt => lt.id === rt.id && lt.sync_pending);
        return localPending ? { ...rt, ...localPending } : rt;
      });

      return {
        ...curr,
        remote_tasks: mergedTasks,
        daily_tasks: mergedTasks,
        remote_dsa: dsa || curr.remote_dsa || [],
        remote_semester: semester || curr.remote_semester || [],
        remote_goals: goals || curr.remote_goals || [],
        remote_gaming: gaming || curr.remote_gaming || [],
        remote_months: months || curr.remote_months || [],
        remote_weeks: weeks || curr.remote_weeks || [],
        remote_study_sessions: studySessions || curr.remote_study_sessions || [],
        study_sessions: studySessions || curr.study_sessions || [],
        monthly_reviews: { ...(curr.monthly_reviews || {}), ...reviewsMap },
        weekly_reviews: { ...(curr.weekly_reviews || {}), ...weeklyReviewsMap },
        daily_reviews: { ...(curr.daily_reviews || {}), ...dailyReviewsMap },
        lastSupabaseSync: new Date().toISOString()
      };
    });
  } catch (e) {
    console.warn('Sync from Supabase failed:', e);
  }
}

// -------------------------------------------------------------
// WEEKLY PLAN SCHEDULE & ROTATION (From Weekly Plan PDF Pages 2-5)
// Exact daily structure across: LEARN, PRACTICE, SEMESTER, BUILD, REVISE
// -------------------------------------------------------------
export const PDF_WEEKLY_SCHEDULE = {
  MONDAY: {
    dayName: 'MONDAY',
    plannedStudyHours: 4,
    examSubjects: ['Answer 1', 'Answer 2'],
    optionalSubject: 'Answer 3 — Optional',
    learn: 'Prime 3.0 (Part study / assignment) • JAVA — PLAYLIST TRACK',
    practice: 'DSA playlist: Watch next lecture(s) in exact order + DSA practice (1 problem min in C++)',
    semester: 'Answer 1 + Answer 2 + Answer 3 — Optional',
    build: 'Project planned task',
    revise: 'Review DSA + exam answers (10–20 min)',
    gaming: 'Optional recreation (max 6 h weekly)'
  },
  TUESDAY: {
    dayName: 'TUESDAY',
    plannedStudyHours: 4,
    examSubjects: ['Answer 1', 'Answer 2'],
    optionalSubject: 'Answer 3 — Optional',
    learn: 'Prime 3.0 (Part study / assignment) • JAVA — PLAYLIST TRACK',
    practice: 'DSA playlist: Watch next lecture(s) in exact order + DSA practice (1 problem min in C++)',
    semester: 'Answer 1 + Answer 2 + Answer 3 — Optional',
    build: 'Project planned task',
    revise: 'Review DSA + exam answers (10–20 min)',
    gaming: 'Optional recreation (max 6 h weekly)'
  },
  WEDNESDAY: {
    dayName: 'WEDNESDAY',
    plannedStudyHours: 4,
    examSubjects: ['Answer 1', 'Answer 2'],
    optionalSubject: 'Answer 3 — Optional',
    learn: 'Prime 3.0 (Part study / assignment) • JAVA — PLAYLIST TRACK',
    practice: 'DSA playlist: Watch next lecture(s) in exact order + DSA practice (1 problem min in C++)',
    semester: 'Answer 1 + Answer 2 + Answer 3 — Optional',
    build: 'Project planned task',
    revise: 'Review DSA + exam answers (10–20 min)',
    gaming: 'Optional recreation (max 6 h weekly)'
  },
  THURSDAY: {
    dayName: 'THURSDAY',
    plannedStudyHours: 4,
    examSubjects: ['Answer 1', 'Answer 2'],
    optionalSubject: 'Answer 3 — Optional',
    learn: 'Prime 3.0 (Part study / assignment) • JAVA — PLAYLIST TRACK',
    practice: 'DSA playlist: Watch next lecture(s) in exact order + DSA practice (1 problem min in C++)',
    semester: 'Answer 1 + Answer 2 + Answer 3 — Optional',
    build: 'Project planned task',
    revise: 'Review DSA + exam answers (10–20 min)',
    gaming: 'Optional recreation (max 6 h weekly)'
  },
  FRIDAY: {
    dayName: 'FRIDAY',
    plannedStudyHours: 4,
    examSubjects: ['Answer 1', 'Answer 2'],
    optionalSubject: 'Answer 3 — Optional',
    learn: 'Prime 3.0 — New Part Released (Complete when convenient) • JAVA — PLAYLIST TRACK',
    practice: 'DSA playlist: Watch next lecture(s) in exact order + DSA practice (1 problem min in C++)',
    semester: 'Answer 1 + Answer 2 + Answer 3 — Optional',
    build: 'Project planned task',
    revise: 'Review DSA + exam answers (10–20 min)',
    gaming: 'Optional recreation (max 6 h weekly)'
  },
  SATURDAY: {
    dayName: 'SATURDAY',
    plannedStudyHours: 4,
    examSubjects: ['Answer 1', 'Answer 2'],
    optionalSubject: 'Answer 3 — Optional',
    learn: 'Prime 3.0 — New Part Released (Complete when convenient) • JAVA — PLAYLIST TRACK',
    practice: 'DSA playlist: Watch next lecture(s) in exact order + DSA practice (1 problem min in C++)',
    semester: 'Answer 1 + Answer 2 + Answer 3 — Optional',
    build: 'Project planned task',
    revise: 'Review DSA + exam answers (10–20 min)',
    gaming: 'Optional recreation (max 6 h weekly)'
  },
  SUNDAY: {
    dayName: 'SUNDAY',
    plannedStudyHours: 8,
    examSubjects: ['Answer 1', 'Answer 2'],
    optionalSubject: 'Answer 3 — Optional',
    learn: 'Prime 3.0 (Part study / assignment) • JAVA — PLAYLIST TRACK',
    practice: 'DSA playlist: Watch next lecture(s) in exact order + DSA practice (1 problem min in C++)',
    semester: 'Answer 1 + Answer 2 + Answer 3 — Optional',
    build: 'Project planned task',
    revise: 'Review DSA + exam answers (10–20 min)',
    gaming: 'Optional recreation (max 6 h weekly)'
  }
};

PDF_WEEKLY_SCHEDULE.MON = PDF_WEEKLY_SCHEDULE.MONDAY;
PDF_WEEKLY_SCHEDULE.TUE = PDF_WEEKLY_SCHEDULE.TUESDAY;
PDF_WEEKLY_SCHEDULE.WED = PDF_WEEKLY_SCHEDULE.WEDNESDAY;
PDF_WEEKLY_SCHEDULE.THU = PDF_WEEKLY_SCHEDULE.THURSDAY;
PDF_WEEKLY_SCHEDULE.FRI = PDF_WEEKLY_SCHEDULE.FRIDAY;
PDF_WEEKLY_SCHEDULE.SAT = PDF_WEEKLY_SCHEDULE.SATURDAY;
PDF_WEEKLY_SCHEDULE.SUN = PDF_WEEKLY_SCHEDULE.SUNDAY;

// -------------------------------------------------------------
// TODAY DATA
// Strict mental model:
// MONTH -> WEEK -> TODAY -> TASK / STUDY SESSION
// Single source of truth calculated from underlying records
// -------------------------------------------------------------
export function getTodayData(targetDate = null) {
  const state = getState();
  const canonicalToday = getCanonicalToday();
  const activeDate = targetDate || canonicalToday;
  const isActualToday = activeDate === canonicalToday;

  // Pre-start Guard: Before PROGRAM_START_DATE, do not create or activate September tasks (Req 1, 2, 5)
  if (activeDate < PROGRAM_START_DATE) {
    return {
      activeDate,
      canonicalToday,
      isPreStart: true,
      programStartDate: PROGRAM_START_DATE,
      dayName: 'Thursday',
      weekId: '2026-10-W1',
      weekNumber: 1,
      monthId: '2026-10',
      monthTitle: 'October 2026',
      weekRangeLabel: 'Oct 1–7',
      weekStartDate: '2026-10-01',
      weekEndDate: '2026-10-07',
      totalTasks: 0,
      completedTasks: 0,
      optionalTasksCompleted: 0,
      targetStudyHours: 4.0,
      studyHoursCompleted: '0.0',
      studyHoursFormatted: '0h 0m',
      studyMinutesCompleted: 0,
      studyPercent: 0,
      gamingHoursThisWeek: 0,
      gamingLimit: 6,
      semester: { requiredCompleted: 0, requiredTarget: 2, optionalCompleted: 0 },
      dsa: { playlistUrl: DSA_PLAYLIST_URL, assignedVideoNumber: null, videoCompleted: false, assignedVideo: null },
      tasks: { LEARN: [], PRACTICE: [], SEMESTER: [], BUILD: [], REVISE: [], DAVINCI: [], HEALTH: [] },
      todaysPriority: [],
      studySessions: [],
      carriedForwardTasks: [],
      endOfDayReview: { focus_rating: 0, completed_summary: '', challenges: '', continue_tomorrow: '', first_task_tomorrow: '' },
      allTodayTasks: []
    };
  }

  // 1. Resolve Canonical Week & Month (Unified Date Consistency)
  const {
    week,
    weekId,
    weekNumber,
    monthId,
    monthTitle,
    rangeLabel: weekRangeLabel,
    startDate: weekStartDate,
    endDate: weekEndDate
  } = getWeekAndMonthForDate(activeDate);

  const remoteWeeks = state.remote_weeks || [];
  const remoteWeek = remoteWeeks.find(w => w.id === weekId);
  const monthPlan = MONTHLY_PLAN_DATA[monthId] || MONTHLY_PLAN_DATA['2026-10'] || {};

  // Day Name & Schedule Rotation (Monday to Sunday)
  const d = parseDate(activeDate);
  const dayOfWeek = d.getDay(); // 0 is Sun, 1 is Mon, ..., 6 is Sat
  const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayNameUpper = DAY_NAMES[dayOfWeek];
  const daySchedule = PDF_WEEKLY_SCHEDULE[dayNameUpper] || PDF_WEEKLY_SCHEDULE.MONDAY;
  const monIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 for Mon, 1 for Tue, ..., 6 for Sun

  // Study hours target: 4h on weekdays & Saturday, 8.5h on Sunday
  const targetStudyHours = (dayOfWeek === 0) ? 8.5 : 4.0;

  // 2. DSA Playlist Assigned Lecture
  const dsaTargetVideos = Number(remoteWeek?.target_dsa_videos || 3);
  const mStart = monthPlan.dsaStartVideo || 1;
  const weekIndexInMonth = Math.max(1, Math.min(5, weekNumber));
  const weekDsaStartVideo = mStart + (weekIndexInMonth - 1) * 3;
  const hasAssignedVideo = monIndex < dsaTargetVideos;
  const assignedVideoNumber = hasAssignedVideo ? (weekDsaStartVideo + monIndex) : null;

  const allDSA = (state.remote_dsa && state.remote_dsa.length > 0) ? state.remote_dsa : DEFAULT_DSA_PLAYLIST;
  const assignedVideo = assignedVideoNumber
    ? (allDSA.find(v => v.video_number === assignedVideoNumber) || DEFAULT_DSA_PLAYLIST[assignedVideoNumber - 1])
    : null;
  const videoCompleted = assignedVideo ? !!assignedVideo.completed : false;

  // 3. Tasks for Active Date
  let allTasks = state.remote_tasks && state.remote_tasks.length > 0
    ? state.remote_tasks
    : (state.daily_tasks || state.tasks || []);

  // Filter out any legacy C tasks from active lists
  allTasks = allTasks.filter(t => !isLegacyCTask(t));
  let todayTasks = allTasks.filter(t => t.date === activeDate);

  // If no tasks exist for this day yet and date is on/after PROGRAM_START_DATE, derive planned tasks
  if (todayTasks.length === 0 && activeDate >= PROGRAM_START_DATE) {
    const defaultTasks = [];
    const releasedPrimePart = getPrimePartForReleaseDate(activeDate);

    if (releasedPrimePart) {
      // Friday or Saturday content release: treat entire Part as ONE main task
      defaultTasks.push({
        id: `task-prime-part-${releasedPrimePart.part_number}`,
        date: activeDate,
        release_date: activeDate,
        is_prime_part: true,
        part_number: releasedPrimePart.part_number,
        week_id: weekId,
        month_id: monthId,
        category: 'LEARN',
        subtype: 'PRIME_3',
        title: releasedPrimePart.full_title,
        description: 'Complete when convenient after release. Includes all released videos, lecture notes, and assignments.',
        estimated_minutes: 90,
        completed: false,
        completion_date: null,
        completed_at: null,
        priority: 'High',
        status: 'PLANNED',
        contents: ['Videos', 'Lecture Notes', 'Assignment Problems'],
        notes: 'Prime 3.0 AI/ML Batch release • Complete when convenient • Contents: Videos, Lecture Notes, Assignment Problems',
        created_at: new Date().toISOString()
      });
    } else {
      defaultTasks.push({
        id: `task-${activeDate}-p3`,
        date: activeDate,
        week_id: weekId,
        month_id: monthId,
        category: 'LEARN',
        subtype: 'PRIME_3',
        title: `Prime 3.0 (AI/ML): ${remoteWeek?.target_prime || monthPlan.primeTarget || "Course study / assignments"}`,
        description: 'Work on released Prime 3.0 course lectures, notes, or assignments.',
        estimated_minutes: 60,
        completed: false,
        priority: 'High',
        notes: 'Prime 3.0 AI/ML Batch',
        created_at: new Date().toISOString()
      });
    }

    // Java — Playlist Track (Section 1)
    const javaVid = getJavaVideoForDate(activeDate);
    defaultTasks.push({
      id: `task-${activeDate}-java`,
      date: activeDate,
      week_id: weekId,
      month_id: monthId,
      category: 'LEARN',
      subtype: 'INDIVIDUAL',
      is_java_task: true,
      is_java_playlist: true,
      video_number: javaVid ? javaVid.video_number : null,
      title: javaVid ? `Java — Video/Lesson ${javaVid.video_number}: ${javaVid.title}` : 'Java — Playlist Track: Advanced Practice & Project',
      description: javaVid ? `Apna College Java Playlist Lecture ${javaVid.video_number} (${javaVid.duration_text || javaVid.duration_minutes + 'm'})` : 'Placement preparation & review',
      estimated_minutes: javaVid?.duration_minutes || 45,
      completed: false,
      completed_at: null,
      priority: 'Normal',
      notes: `Playlist: ${JAVA_PLAYLIST_URL}`,
      created_at: new Date().toISOString()
    });

    // DSA Playlist Tasks (Learned with C++)
    defaultTasks.push({
      id: `task-${activeDate}-dsa-vid`,
      date: activeDate,
      week_id: weekId,
      month_id: monthId,
      category: 'PRACTICE',
      subtype: 'DSA',
      title: hasAssignedVideo
        ? `DSA Playlist: Lecture ${assignedVideoNumber} — ${assignedVideo?.title || 'Video ' + assignedVideoNumber}`
        : `DSA Playlist: Review & Implement Code for Lectures ${weekDsaStartVideo}–${weekDsaStartVideo + dsaTargetVideos - 1}`,
      estimated_minutes: 60,
      completed: false,
      completed_at: null,
      priority: 'High',
      notes: 'Apna College C++ DSA Playlist',
      created_at: new Date().toISOString()
    });

    defaultTasks.push({
      id: `task-${activeDate}-dsa-prob`,
      date: activeDate,
      week_id: weekId,
      month_id: monthId,
      category: 'PRACTICE',
      subtype: 'DSA',
      title: 'Solve DSA Practice Problem in C++ (LeetCode / Playlist Exercise)',
      estimated_minutes: 45,
      completed: false,
      priority: 'High',
      notes: 'Apna College C++ DSA',
      created_at: new Date().toISOString()
    });

    // Project Task
    defaultTasks.push({
      id: `task-${activeDate}-proj`,
      date: activeDate,
      week_id: weekId,
      month_id: monthId,
      category: 'BUILD',
      subtype: 'PROJECT',
      title: `Project: ${remoteWeek?.target_project || monthPlan.projectMilestone || "Milestone Implementation"}`,
      estimated_minutes: 60,
      completed: false,
      priority: 'Normal',
      notes: '',
      created_at: new Date().toISOString()
    });

    // Revision Task
    defaultTasks.push({
      id: `task-${activeDate}-rev`,
      date: activeDate,
      week_id: weekId,
      month_id: monthId,
      category: 'REVISE',
      subtype: 'REVISION',
      title: "Revision: Review Today's DSA Concepts & Semester Answers (10–20 min)",
      estimated_minutes: 20,
      completed: false,
      completed_at: null,
      priority: 'Normal',
      notes: '',
      created_at: new Date().toISOString()
    });

    // Daily 30-Minute Exercise Routine
    defaultTasks.push({
      id: `task-${activeDate}-exercise`,
      date: activeDate,
      week_id: weekId,
      month_id: monthId,
      category: 'HEALTH',
      subtype: 'EXERCISE',
      title: 'Exercise — 30 minutes',
      estimated_minutes: 30,
      completed: false,
      completed_at: null,
      priority: 'Normal',
      notes: 'Daily 30-minute health & exercise routine',
      created_at: new Date().toISOString()
    });

    // DaVinci Resolve Scheduled Days (Tuesday & Saturday)
    const davinciVid = getDavinciVideoForDate(activeDate);
    if (davinciVid) {
      defaultTasks.push({
        id: `task-${activeDate}-davinci`,
        date: activeDate,
        week_id: weekId,
        month_id: monthId,
        category: 'DAVINCI',
        subtype: 'DAVINCI_PLAYLIST',
        title: `DaVinci Resolve: Video ${davinciVid.video_number} — ${davinciVid.title}`,
        estimated_minutes: davinciVid.duration_minutes || 45,
        completed: false,
        completed_at: null,
        priority: 'Normal',
        notes: `Playlist: ${DAVINCI_PLAYLIST_URL}`,
        created_at: new Date().toISOString()
      });
    }

    todayTasks = defaultTasks;
    updateState(curr => {
      const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
        ? curr.remote_tasks
        : (curr.daily_tasks || curr.tasks || []);
      return {
        ...curr,
        remote_tasks: [...base, ...defaultTasks],
        daily_tasks: [...base, ...defaultTasks]
      };
    });
  } else {
    // If today is a scheduled DaVinci day (Tue/Sat) and no DaVinci task exists yet, add it
    const scheduledDavinciVid = getDavinciVideoForDate(activeDate);
    if (scheduledDavinciVid) {
      const hasDavinciTask = todayTasks.some(t => t.category === 'DAVINCI' || t.subtype === 'DAVINCI_PLAYLIST');
      if (!hasDavinciTask) {
        const newDavinciTask = {
          id: `task-${activeDate}-davinci`,
          date: activeDate,
          week_id: weekId,
          month_id: monthId,
          category: 'DAVINCI',
          subtype: 'DAVINCI_PLAYLIST',
          title: `DaVinci Resolve: Video ${scheduledDavinciVid.video_number} — ${scheduledDavinciVid.title}`,
          estimated_minutes: scheduledDavinciVid.duration_minutes || 45,
          completed: false,
          completed_at: null,
          priority: 'Normal',
          notes: `Playlist: ${DAVINCI_PLAYLIST_URL}`,
          created_at: new Date().toISOString()
        };
        todayTasks.push(newDavinciTask);
        updateState(curr => {
          const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
            ? curr.remote_tasks
            : (curr.daily_tasks || curr.tasks || []);
          return {
            ...curr,
            remote_tasks: [...base, newDavinciTask],
            daily_tasks: [...base, newDavinciTask]
          };
        });
      }
    }

    // Ensure daily exercise task exists
    const hasExerciseTask = todayTasks.some(t => t.category === 'HEALTH' || t.subtype === 'EXERCISE' || (t.title && t.title.toLowerCase().startsWith('exercise')));
    if (!hasExerciseTask) {
      const exerciseTask = {
        id: `task-${activeDate}-exercise`,
        date: activeDate,
        week_id: weekId,
        month_id: monthId,
        category: 'HEALTH',
        subtype: 'EXERCISE',
        title: 'Exercise — 30 minutes',
        estimated_minutes: 30,
        completed: false,
        completed_at: null,
        priority: 'Normal',
        notes: 'Daily 30-minute health & exercise routine',
        created_at: new Date().toISOString()
      };
      todayTasks.push(exerciseTask);
      updateState(curr => {
        const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
          ? curr.remote_tasks
          : (curr.daily_tasks || curr.tasks || []);
        return {
          ...curr,
          remote_tasks: [...base, exerciseTask],
          daily_tasks: [...base, exerciseTask]
        };
      });
    }
  }

  // Ensure DSA video task stays in sync with assignedVideo.completed
  if (hasAssignedVideo && assignedVideo) {
    todayTasks = todayTasks.map(t => {
      if (t.category === 'PRACTICE' && (t.title.includes('Playlist') || t.title.includes('Lecture') || t.title.includes(`Video ${assignedVideoNumber}`))) {
        return { ...t, completed: videoCompleted };
      }
      return t;
    });
  }

  // Ensure Java video task stays in sync with java_progress
  const javaVidForToday = getJavaVideoForDate(activeDate);
  if (javaVidForToday) {
    const isJavaDone = !!(state.java_progress && state.java_progress.some(v => v.video_number === javaVidForToday.video_number && v.completed));
    todayTasks = todayTasks.map(t => {
      if (t.is_java_task || (t.title && t.title.toLowerCase().includes('java'))) {
        return { ...t, completed: isJavaDone || !!t.completed };
      }
      return t;
    });
  }

  // 4. Group tasks strictly into canonical categories:
  // LEARN, PRACTICE, SEMESTER, BUILD, REVISE, DAVINCI, HEALTH
  const groupedTasks = {
    LEARN: [],
    PRACTICE: [],
    SEMESTER: [],
    BUILD: [],
    REVISE: [],
    DAVINCI: [],
    HEALTH: []
  };

  todayTasks.forEach(task => {
    let cat = (task.category || '').toUpperCase();
    if (!cat) {
      const sec = (task.section || task.track || '').toUpperCase();
      if (sec.includes('PRIME') || sec.includes('INDIV') || sec.includes('LEARN')) cat = 'LEARN';
      else if (sec.includes('DSA') || sec.includes('PRACTICE')) cat = 'PRACTICE';
      else if (sec.includes('SEMESTER')) cat = 'SEMESTER';
      else if (sec.includes('PROJ') || sec.includes('BUILD')) cat = 'BUILD';
      else if (sec.includes('REVISE')) cat = 'REVISE';
      else if (sec.includes('DAVINCI')) cat = 'DAVINCI';
      else if (sec.includes('HEALTH') || sec.includes('EXERCISE')) cat = 'HEALTH';
      else cat = 'LEARN';
    }
    if (task.subtype === 'DAVINCI_PLAYLIST' || cat === 'DAVINCI') {
      cat = 'DAVINCI';
    } else if (task.subtype === 'EXERCISE' || cat === 'HEALTH' || (task.title && task.title.toLowerCase().startsWith('exercise'))) {
      cat = 'HEALTH';
    } else if (!groupedTasks[cat]) {
      if (cat.includes('DSA') || cat.includes('PROBLEM')) cat = 'PRACTICE';
      else if (cat.includes('SEMESTER')) cat = 'SEMESTER';
      else if (cat.includes('PROJ') || cat.includes('BUILD')) cat = 'BUILD';
      else if (cat.includes('REVIS')) cat = 'REVISE';
      else if (cat.includes('HEALTH') || cat.includes('EXERCISE')) cat = 'HEALTH';
      else cat = 'LEARN';
    }
    groupedTasks[cat].push({
      ...task,
      category: cat,
      estimated_minutes: task.estimated_minutes || task.durationMinutes || 30,
      completed: !!task.completed
    });
  });

  // 5. Semester Answers for Today (2 Required + 1 Optional 3rd)
  let allSemester = state.remote_semester && state.remote_semester.length > 0
    ? state.remote_semester
    : (state.semester_answers || []);
  let todaySemesterAnswers = allSemester.filter(a => a.date === activeDate);

  // If no semester answers recorded for this day yet, seed default slots without subject names
  if (todaySemesterAnswers.length === 0) {
    const defaultAnswers = [
      {
        id: `sem-${activeDate}-1`,
        date: activeDate,
        day: daySchedule.dayName,
        week_id: weekId,
        month_id: monthId,
        title: 'Answer 1',
        is_optional: false,
        completed: false,
        revised: false,
        created_at: new Date().toISOString()
      },
      {
        id: `sem-${activeDate}-2`,
        date: activeDate,
        day: daySchedule.dayName,
        week_id: weekId,
        month_id: monthId,
        title: 'Answer 2',
        is_optional: false,
        completed: false,
        revised: false,
        created_at: new Date().toISOString()
      },
      {
        id: `sem-${activeDate}-3`,
        date: activeDate,
        day: daySchedule.dayName,
        week_id: weekId,
        month_id: monthId,
        title: 'Answer 3 — Optional',
        is_optional: true,
        completed: false,
        revised: false,
        created_at: new Date().toISOString()
      }
    ];

    todaySemesterAnswers = defaultAnswers;
    updateState(curr => ({
      ...curr,
      remote_semester: [...(curr.remote_semester || []), ...defaultAnswers],
      semester_answers: [...(curr.semester_answers || []), ...defaultAnswers]
    }));
  }

  const requiredAnswers = todaySemesterAnswers.filter(a => !a.is_optional);
  const optionalAnswers = todaySemesterAnswers.filter(a => a.is_optional);
  const semesterRequiredCompleted = requiredAnswers.filter(a => a.completed).length;
  const semesterOptionalCompleted = optionalAnswers.filter(a => a.completed).length;
  const semesterTotalCompleted = semesterRequiredCompleted + semesterOptionalCompleted;
  const semesterRevisedCount = todaySemesterAnswers.filter(a => a.revised).length;

  // Populate groupedTasks.SEMESTER directly so all 3 answers appear in TODAY'S TASKS
  groupedTasks.SEMESTER = [
    {
      id: requiredAnswers[0]?.id || `sem-${activeDate}-1`,
      title: 'Answer 1',
      category: 'SEMESTER',
      subtype: 'SEMESTER_ANSWER',
      is_optional: false,
      completed: !!requiredAnswers[0]?.completed,
      date: activeDate,
      estimated_minutes: 20
    },
    {
      id: requiredAnswers[1]?.id || `sem-${activeDate}-2`,
      title: 'Answer 2',
      category: 'SEMESTER',
      subtype: 'SEMESTER_ANSWER',
      is_optional: false,
      completed: !!requiredAnswers[1]?.completed,
      date: activeDate,
      estimated_minutes: 20
    },
    {
      id: optionalAnswers[0]?.id || `sem-${activeDate}-3`,
      title: 'Answer 3 — Optional',
      category: 'SEMESTER',
      subtype: 'SEMESTER_ANSWER',
      is_optional: true,
      completed: !!optionalAnswers[0]?.completed,
      date: activeDate,
      estimated_minutes: 20
    }
  ];

  // 6. Study Hours from logged Study Sessions
  const allSessions = (state.remote_study_sessions || state.study_sessions || []);
  const todaySessions = allSessions.filter(s => s.date === activeDate);
  const studyMinutesCompleted = todaySessions.reduce((acc, s) => acc + (s.duration_minutes || s.durationMinutes || 0), 0);
  const studyHoursCompleted = (studyMinutesCompleted / 60).toFixed(1);
  const studyHoursFormatted = `${Math.floor(studyMinutesCompleted / 60)}h ${studyMinutesCompleted % 60}m`;
  const studyTargetMinutes = targetStudyHours * 60;
  const studyPercent = Math.min(100, Math.round((studyMinutesCompleted / studyTargetMinutes) * 100));

  // 7. Core Tasks Completion Count (PDF Page 1: 7 core targets)
  // Non-optional tasks + 2 required semester answers
  const coreTasksNonSem = todayTasks.filter(t => !t.is_optional && t.category !== 'SEMESTER');
  const coreTasksCompleted = coreTasksNonSem.filter(t => t.completed).length;
  const requiredTasksCompleted = coreTasksCompleted + semesterRequiredCompleted;
  const requiredTasksTotal = coreTasksNonSem.length + 2; // e.g. 5 standard tasks + 2 core semester answers = 7

  // 8. Weekly Gaming Log (0-6 hours optional)
  const allGaming = state.remote_gaming && state.remote_gaming.length > 0
    ? state.remote_gaming
    : (state.gaming_logs || []);
  const weekGamingHours = allGaming
    .filter(g => (g.date >= weekStartDate && g.date <= weekEndDate) || (g.week_id === weekId))
    .reduce((acc, g) => acc + Number(g.duration_hours || 0), 0);

  // 9. Daily Review / End-of-Day Check
  const reviewsMap = state.daily_reviews || {};
  const currentReview = reviewsMap[activeDate] || {
    date: activeDate,
    went_well: '',
    continue_tomorrow: '',
    main_completed: '',
    main_unfinished: '',
    dsa_revisit: '',
    exam_revise: '',
    what_learned: '',
    first_task_tomorrow: ''
  };

  const dsaVideoDone = hasAssignedVideo ? videoCompleted : false;
  const dsaPracticeDone = todayTasks.some(t => t.category === 'PRACTICE' && (t.title.includes('Problem') || t.subtype === 'PROBLEMS') && t.completed);

  // 10. Today's Priority (Top 3 important tasks from today's plan)
  // Priorities based on:
  // 1. Explicitly marked high priority tasks
  // 2. Required tasks before optional tasks
  // 3. Planned tasks before optional/carry-forward tasks
  const priorityCandidates = [];

  const dsaVideoTask = todayTasks.find(t => t.category === 'PRACTICE' && (t.title.includes('Playlist') || t.title.includes('Lecture') || t.title.includes('Video')));
  if (dsaVideoTask) {
    priorityCandidates.push({
      id: dsaVideoTask.id,
      title: hasAssignedVideo ? `Complete DSA video: Lecture ${assignedVideoNumber}` : dsaVideoTask.title,
      targetId: `task-row-${dsaVideoTask.id}`,
      completed: !!dsaVideoTask.completed,
      priority: dsaVideoTask.priority || 'High',
      rank: 1,
      category: 'PRACTICE'
    });
  }

  const semCompleted = semesterRequiredCompleted >= 2;
  priorityCandidates.push({
    id: `priority-sem-${activeDate}`,
    title: `Complete 2 required semester answers (${semesterRequiredCompleted}/2 done)`,
    targetId: 'section-semester-required',
    completed: semCompleted,
    priority: 'High',
    rank: 2,
    category: 'SEMESTER'
  });

  const primeTask = todayTasks.find(t => t.category === 'LEARN' && (t.subtype === 'PRIME_3' || t.title.toLowerCase().includes('prime')));
  if (primeTask) {
    priorityCandidates.push({
      id: primeTask.id,
      title: `Complete Prime 3.0 task: ${primeTask.title.replace(/^Prime 3\.0:\s*/i, '')}`,
      targetId: `task-row-${primeTask.id}`,
      completed: !!primeTask.completed,
      priority: primeTask.priority || 'High',
      rank: 3,
      category: 'LEARN'
    });
  }

  // Other tasks: Project, DSA Problem, Individual
  todayTasks.forEach(t => {
    if (t.id === dsaVideoTask?.id || t.id === primeTask?.id) return;
    if (t.category === 'SEMESTER') return;
    priorityCandidates.push({
      id: t.id,
      title: t.title,
      targetId: `task-row-${t.id}`,
      completed: !!t.completed,
      priority: t.priority || 'Normal',
      rank: t.priority === 'High' ? 4 : 5,
      category: t.category
    });
  });

  // Sort: Incomplete tasks first, then by rank
  priorityCandidates.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.rank - b.rank;
  });

  const todaysPriority = priorityCandidates.slice(0, 3);

  // 11. Carried Forward Tasks (unfinished tasks from previous active days in plan)
  // Exclude Prime 3.0 Parts (they remain available on later days without being marked overdue)
  const carriedForwardTasks = allTasks
    .filter(t => t.date && t.date >= PLAN_START_DATE && t.date < activeDate && !t.completed && !t.skipped && !t.is_prime_part && t.subtype !== 'PRIME_3' && !isLegacyCTask(t))
    .map(t => ({
      ...t,
      isOverdue: true,
      category: (t.category || 'LEARN').toUpperCase(),
      estimated_minutes: t.estimated_minutes || t.durationMinutes || 45,
      completed: !!t.completed,
      skipped: !!t.skipped,
      sync_pending: !!t.sync_pending
    }));

  return {
    date: activeDate,
    canonicalToday,
    isActualToday,
    dayName: dayNameUpper.charAt(0) + dayNameUpper.slice(1).toLowerCase(),
    fullDate: formatFullDate(activeDate),
    weekId,
    weekNumber,
    weekRangeLabel,
    monthId,
    monthTitle,
    targetStudyHours,
    studyHoursCompleted,
    studyHoursFormatted,
    studyMinutesCompleted,
    studyPercent,
    studySessions: todaySessions,
    tasks: groupedTasks,
    allTodayTasks: Object.values(groupedTasks).flat().map(t => ({
      ...t,
      completed: !!t.completed,
      skipped: !!t.skipped,
      sync_pending: !!t.sync_pending
    })),
    todaysPriority,
    carriedForwardTasks,
    overdueTasks: carriedForwardTasks,
    totalTasks: requiredTasksTotal,
    completedTasks: requiredTasksCompleted,
    optionalTasksCompleted: semesterOptionalCompleted,
    todaySemesterAnswers,
    semester: {
      required: requiredAnswers,
      optional: optionalAnswers,
      requiredCompleted: semesterRequiredCompleted,
      requiredTarget: 2,
      optionalCompleted: semesterOptionalCompleted,
      optionalTarget: 1,
      totalCompleted: semesterTotalCompleted,
      revisedCount: semesterRevisedCount
    },
    dsa: {
      hasAssignedVideo,
      assignedVideoNumber,
      assignedVideoTitle: assignedVideo?.title || (assignedVideoNumber ? `Lecture ${assignedVideoNumber}` : null),
      videoCompleted: dsaVideoDone,
      practiceDone: dsaPracticeDone,
      playlistUrl: DSA_PLAYLIST_URL
    },
    davinci: {
      isScheduledToday: !!getDavinciVideoForDate(activeDate) || todayTasks.some(t => t.category === 'DAVINCI' || t.subtype === 'DAVINCI_PLAYLIST'),
      hasTask: todayTasks.some(t => t.category === 'DAVINCI' || t.subtype === 'DAVINCI_PLAYLIST'),
      task: todayTasks.find(t => t.category === 'DAVINCI' || t.subtype === 'DAVINCI_PLAYLIST') || null,
      videoNumber: getDavinciVideoForDate(activeDate)
        ? getDavinciVideoForDate(activeDate).video_number
        : (parseInt((todayTasks.find(t => t.category === 'DAVINCI' || t.subtype === 'DAVINCI_PLAYLIST')?.title?.match(/Video\s+(\d+)/i) || [])[1]) || null),
      videoTitle: getDavinciVideoForDate(activeDate)
        ? getDavinciVideoForDate(activeDate).title
        : (todayTasks.find(t => t.category === 'DAVINCI' || t.subtype === 'DAVINCI_PLAYLIST')?.title || null),
      completed: todayTasks.find(t => t.category === 'DAVINCI' || t.subtype === 'DAVINCI_PLAYLIST')
        ? !!todayTasks.find(t => t.category === 'DAVINCI' || t.subtype === 'DAVINCI_PLAYLIST').completed
        : false,
      playlistUrl: DAVINCI_PLAYLIST_URL
    },
    java: {
      hasAssignedVideo: !!javaVidForToday,
      assignedVideoNumber: javaVidForToday ? javaVidForToday.video_number : null,
      assignedVideoTitle: javaVidForToday ? javaVidForToday.title : null,
      durationMinutes: javaVidForToday ? javaVidForToday.duration_minutes : null,
      durationText: javaVidForToday ? javaVidForToday.duration_text : null,
      videoCompleted: todayTasks.some(t => (t.is_java_task || (t.title && t.title.toLowerCase().includes('java'))) && t.completed),
      playlistUrl: JAVA_PLAYLIST_URL,
      task: todayTasks.find(t => t.is_java_task || (t.title && t.title.toLowerCase().includes('java'))) || null
    },
    gamingHoursThisWeek: weekGamingHours,
    gamingLimit: 6,
    dailyReview: currentReview
  };
}


// -------------------------------------------------------------
// WEEK DATA
// Pure source of truth calculated from underlying records
// -------------------------------------------------------------
export function getWeekData(targetWeekOrDate = null) {
  const state = getState();
  const canonicalToday = getCanonicalToday();
  const allPlanWeeks = getAllPlanWeeks();

  // 1. Resolve selected week ID
  let selectedWeekId = null;
  if (targetWeekOrDate) {
    if (typeof targetWeekOrDate === 'string' && targetWeekOrDate.includes('-W')) {
      selectedWeekId = targetWeekOrDate;
    } else {
      // Find week matching this date
      const match = allPlanWeeks.find(w => targetWeekOrDate >= w.startDate && targetWeekOrDate <= w.endDate);
      if (match) selectedWeekId = match.weekId;
    }
  }

  if (!selectedWeekId) {
    // Check if canonical today falls into a plan week
    const currentWeekInPlan = allPlanWeeks.find(w => canonicalToday >= w.startDate && canonicalToday <= w.endDate);
    selectedWeekId = currentWeekInPlan ? currentWeekInPlan.weekId : '2026-10-W1';
  }

  // 2. Retrieve week metadata
  const remoteWeeks = state.remote_weeks || [];
  const remoteWeek = remoteWeeks.find(w => w.id === selectedWeekId);
  const fallbackWeek = allPlanWeeks.find(w => w.weekId === selectedWeekId) || {
    weekId: selectedWeekId,
    weekNumber: 1,
    startDate: '2026-10-01',
    endDate: '2026-10-07',
    rangeLabel: 'Oct 1–7'
  };

  const weekId = selectedWeekId;
  const weekNumber = remoteWeek ? remoteWeek.week_number : fallbackWeek.weekNumber;
  const startDate = remoteWeek ? remoteWeek.start_date : fallbackWeek.startDate;
  const endDate = remoteWeek ? remoteWeek.end_date : fallbackWeek.endDate;
  const parentMonthId = remoteWeek?.month_id || (startDate ? startDate.substring(0, 7) : '2026-10');
  const parentMonthTitle = formatMonthYear(parentMonthId);

  const isProgramActive = canonicalToday >= PROGRAM_START_DATE;

  // Status: Current Week / Upcoming / Past (Req 1, 4, 7)
  let weekStatus = 'Upcoming';
  if (isProgramActive && canonicalToday >= startDate && canonicalToday <= endDate) {
    weekStatus = 'Current Week';
  } else if (isProgramActive && canonicalToday > endDate) {
    weekStatus = 'Past';
  } else if (!isProgramActive) {
    weekStatus = 'Upcoming (Starts Oct 1)';
  }

  // Range Label (e.g. October 1–7, 2026)
  const startD = parseDate(startDate);
  const endD = parseDate(endDate);
  const startMName = startD.toLocaleDateString('en-US', { month: 'long' });
  const endMName = endD.toLocaleDateString('en-US', { month: 'long' });
  const rangeLabel = startMName === endMName
    ? `${startMName} ${startD.getDate()}–${endD.getDate()}`
    : `${startMName} ${startD.getDate()} – ${endMName} ${endD.getDate()}`;

  // 3. Targets from Weekly Plan PDF / remoteWeek
  const studyHoursTarget = Number(remoteWeek?.target_study_hours || 32);
  const dsaVideosTarget = Number(remoteWeek?.target_dsa_videos || 3);
  const dsaProblemsTarget = Number(remoteWeek?.target_dsa_problems || 8); // PDF: 5–8 problems
  const semesterRequiredTarget = 14; // PDF: 14 core minimum (2/day)
  const semesterOptionalTarget = 21; // PDF: up to 21 (3/day)
  const revisionTargetSessions = 5; // PDF: 3–5 short sessions
  const primeTargetTitle = remoteWeek?.target_prime || 'Python Environment Setup, Virtual Environments & Syntax';
  const individualTargetTitle = remoteWeek?.target_individual_learning || 'Java Fundamentals: Variables, Data Types, Conditions & Loops';
  const projectMilestoneTitle = remoteWeek?.target_project || 'Milestone 1: Architectural Design & Block Header Struct';
  const gamingLimit = 6; // PDF: 0–6 hours optional recreation

  // 4. Study Hours Progress (from real logged study sessions, ignoring pre-program dates)
  const allSessions = (state.remote_study_sessions || state.study_sessions || []);
  const weekSessions = allSessions.filter(s => s.date >= PROGRAM_START_DATE && ((s.week_id === weekId) || (s.date >= startDate && s.date <= endDate)));
  const weekStudyMinutes = isProgramActive ? weekSessions.reduce((acc, s) => acc + Number(s.duration_minutes || s.durationMinutes || 0), 0) : 0;
  const studyHoursCompleted = Number((weekStudyMinutes / 60).toFixed(1));

  // 5. DSA Playlist Tracking (Apna College Complete C++ DSA Course in strict order)
  const monthPlan = MONTHLY_PLAN_DATA[parentMonthId] || MONTHLY_PLAN_DATA['2026-10'];
  const mStart = monthPlan.dsaStartVideo || 1;
  const mEnd = monthPlan.dsaEndVideo || 12;
  const weekIndexInMonth = Math.max(1, Math.min(5, weekNumber));
  const weekDsaStartVideo = mStart + (weekIndexInMonth - 1) * 3;
  const weekDsaEndVideo = Math.min(weekDsaStartVideo + dsaVideosTarget - 1, mEnd);

  const allDSA = (state.remote_dsa && state.remote_dsa.length > 0) ? state.remote_dsa : DEFAULT_DSA_PLAYLIST;
  const weekVideos = allDSA.filter(v => v.video_number >= weekDsaStartVideo && v.video_number <= weekDsaEndVideo);
  const dsaVideosCompleted = isProgramActive ? weekVideos.filter(v => v.completed).length : 0;
  const dsaVideosRemaining = Math.max(0, weekVideos.length - dsaVideosCompleted);

  // 6. DSA Problems Progress
  const allTasks = (state.remote_tasks || state.daily_tasks || state.tasks || []);
  const weekTasks = allTasks.filter(t => !isLegacyCTask(t) && t.date >= PROGRAM_START_DATE && ((t.week_id === weekId) || (t.date >= startDate && t.date <= endDate)));
  const dsaPracticeTasks = weekTasks.filter(t => t.category === 'PRACTICE' && (t.subtype === 'DSA' || t.subtype === 'PROBLEMS' || (t.title && t.title.toLowerCase().includes('problem'))));
  const dsaProblemsFromTasks = isProgramActive ? dsaPracticeTasks.filter(t => t.completed).length : 0;
  const dsaProblemsFromVideos = isProgramActive ? weekVideos.reduce((acc, v) => acc + Number(v.problems_solved || 0), 0) : 0;
  const dsaProblemsCompleted = Math.max(dsaProblemsFromTasks, dsaProblemsFromVideos);
  const dsaProblemsRemaining = Math.max(0, dsaProblemsTarget - dsaProblemsCompleted);

  // 7. Semester Answers Progress
  const allSemester = (state.remote_semester || state.semester_answers || []);
  const weekSemester = allSemester.filter(a => a.date >= PROGRAM_START_DATE && ((a.week_id === weekId) || (a.date >= startDate && a.date <= endDate)));
  const semesterRequiredCompleted = isProgramActive ? weekSemester.filter(a => !a.is_optional && a.completed).length : 0;
  const semesterOptionalCompleted = isProgramActive ? weekSemester.filter(a => a.is_optional && a.completed).length : 0;
  const semesterTotalCompleted = semesterRequiredCompleted + semesterOptionalCompleted;
  const revisionCompleted = isProgramActive ? (weekSemester.filter(a => a.revised).length + weekTasks.filter(t => t.category === 'REVISE' && t.completed).length) : 0;

  // 8. Prime 3.0, Individual Learning, Project Status
  const primeTasks = weekTasks.filter(t => t.category === 'LEARN' && (t.subtype === 'PRIME_3' || (t.title && t.title.toLowerCase().includes('prime'))));
  const primeCompleted = isProgramActive ? primeTasks.filter(t => t.completed).length : 0;
  const primeProgress = isProgramActive && primeTasks.length > 0 ? `${primeCompleted} / ${primeTasks.length} tasks` : (isProgramActive && primeCompleted > 0 ? `${primeCompleted} tasks` : 'In Progress');

  const indivTasks = weekTasks.filter(t => t.category === 'LEARN' && (t.subtype === 'INDIVIDUAL' || (!t.subtype && !t.title?.toLowerCase().includes('prime'))));
  const indivCompleted = isProgramActive ? indivTasks.filter(t => t.completed).length : 0;
  const indivProgress = isProgramActive && indivTasks.length > 0 ? `${indivCompleted} / ${indivTasks.length} tasks` : (isProgramActive && indivCompleted > 0 ? `${indivCompleted} tasks` : 'In Progress');

  const projectTasks = weekTasks.filter(t => t.category === 'BUILD' || t.subtype === 'PROJECT');
  const projectCompleted = isProgramActive ? projectTasks.filter(t => t.completed).length : 0;
  const projectProgress = isProgramActive && projectTasks.length > 0 ? `${projectCompleted} / ${projectTasks.length} tasks` : (isProgramActive && projectCompleted > 0 ? `${projectCompleted} tasks` : 'In Progress');

  // 8.1 DaVinci Resolve Tracking (2 videos per week, Tue & Sat)
  const weekPlanWeeks = getAllPlanWeeks();
  const weekOverallIndex = Math.max(1, weekPlanWeeks.findIndex(w => w.weekId === weekId) + 1);
  const weekDavinciVideos = getDavinciVideosForWeek(weekOverallIndex);
  const weekDavinciTasks = weekTasks.filter(t => t.category === 'DAVINCI' || t.subtype === 'DAVINCI_PLAYLIST');
  const davinciTargetVideos = 2;
  const davinciVideosCompleted = isProgramActive ? weekDavinciTasks.filter(t => t.completed).length : 0;
  const davinciVideosRemaining = Math.max(0, davinciTargetVideos - davinciVideosCompleted);

  // 8.2 Java Playlist Track (1 video per week: Videos 1 to 39)
  const weekJavaVideo = getJavaVideoForWeek(weekId);
  const weekJavaTasks = weekTasks.filter(t => t.is_java_task || (t.title && t.title.toLowerCase().includes('java')));
  const javaTargetVideos = weekJavaVideo ? 1 : 0;
  const isJavaVidCompleted = weekJavaVideo && state.java_progress
    ? state.java_progress.some(v => v.video_number === weekJavaVideo.video_number && v.completed)
    : false;
  const javaVideosCompleted = isProgramActive ? (isJavaVidCompleted ? 1 : (weekJavaTasks.some(t => t.completed) ? 1 : 0)) : 0;
  const javaVideosRemaining = Math.max(0, javaTargetVideos - javaVideosCompleted);

  // 9. Optional Gaming Hours (0-6 hours/week)
  const allGaming = (state.remote_gaming || state.gaming_logs || []);
  const weekGaming = allGaming.filter(g => g.date >= PROGRAM_START_DATE && g.date >= startDate && g.date <= endDate);
  const gamingActualHours = isProgramActive ? weekGaming.reduce((acc, g) => acc + Number(g.duration_hours || 0), 0) : 0;

  // 10. MONDAY -> SUNDAY (Exactly 7 days)
  const orderedRawDays = getMondayToSundayDays(startDate, endDate);
  const daysWithStats = orderedRawDays.map(day => {
    const dayTasks = allTasks.filter(t => !isLegacyCTask(t) && t.date === day.date && t.date >= PROGRAM_START_DATE);
    const dayCompleted = isProgramActive ? dayTasks.filter(t => t.completed).length : 0;
    const dayTotal = dayTasks.length;

    const dayMinutes = isProgramActive
      ? allSessions.filter(s => s.date === day.date && s.date >= PROGRAM_START_DATE).reduce((acc, s) => acc + Number(s.duration_minutes || s.durationMinutes || 0), 0)
      : 0;
    const actualStudy = (dayMinutes / 60).toFixed(1);

    const schedule = PDF_WEEKLY_SCHEDULE[day.dayName] || PDF_WEEKLY_SCHEDULE.MONDAY;
    const plannedStudy = schedule.plannedStudyHours;

    let status = 'Pending';
    if (dayCompleted > 0 && dayCompleted === dayTotal) {
      status = 'Completed';
    } else if (dayCompleted > 0 || Number(actualStudy) > 0) {
      status = 'In Progress';
    }

    return {
      ...day,
      isToday: isProgramActive && (day.date === canonicalToday),
      tasksCompleted: dayCompleted,
      tasksTotal: dayTotal,
      plannedStudyHours: plannedStudy,
      studyHours: actualStudy,
      status,
      schedule
    };
  });

  // 11. Weekly Goals (Maximum 5 Important Goals)
  const allGoals = (state.remote_goals || state.goals || []);
  const weekGoals = allGoals.filter(g => g.type === 'WEEKLY' && (g.week_id === weekId || (!g.week_id && weekNumber === 1)));
  const defaultGoals = [
    { id: `wg-${weekId}-1`, title: `Complete DSA playlist lectures ${weekDsaStartVideo}–${weekDsaEndVideo}`, category: 'PRACTICE', completed: dsaVideosCompleted === weekVideos.length && weekVideos.length > 0, week_id: weekId },
    { id: `wg-${weekId}-2`, title: `Solve ${dsaProblemsTarget} DSA practice problems`, category: 'PRACTICE', completed: dsaProblemsCompleted >= dsaProblemsTarget, week_id: weekId },
    { id: `wg-${weekId}-3`, title: `Complete 14 core semester answers (2/day)`, category: 'SEMESTER', completed: semesterRequiredCompleted >= semesterRequiredTarget, week_id: weekId },
    { id: `wg-${weekId}-4`, title: `Prime 3.0: ${primeTargetTitle}`, category: 'LEARN', completed: false, week_id: weekId },
    { id: `wg-${weekId}-5`, title: `Project: ${projectMilestoneTitle}`, category: 'BUILD', completed: false, week_id: weekId }
  ];
  const finalWeekGoals = (weekGoals.length > 0 ? weekGoals : defaultGoals).slice(0, 5);

  // 12. Weekly Review (Page 6 of Weekly Plan PDF)
  const reviewsMap = state.weekly_reviews || {};
  const currentReview = reviewsMap[weekId] || {
    completed_summary: '',
    struggles_improvements: '',
    next_week_priority: '',
    what_completed_well: '',
    what_not_completed: '',
    why_not_completed: '',
    top_priority_next_week: '',
    what_deliberately_moved: '',
    dsa_check: '',
    semester_check: ''
  };

  // Parse check JSON if string
  let dsaCheck = { firstLecture: `Lecture ${weekDsaStartVideo}`, lastCompleted: '', nextLecture: '', difficultTopic: '', problemsToResolve: '' };
  if (currentReview.dsa_check) {
    try {
      dsaCheck = typeof currentReview.dsa_check === 'string' ? JSON.parse(currentReview.dsa_check) : currentReview.dsa_check;
    } catch (e) {
      // fallback
    }
  }

  let semesterCheck = { subjectsCovered: '', topicsWeak: '', questionsToRevise: '' };
  if (currentReview.semester_check) {
    try {
      semesterCheck = typeof currentReview.semester_check === 'string' ? JSON.parse(currentReview.semester_check) : currentReview.semester_check;
    } catch (e) {
      // fallback
    }
  }

  // 13. Navigation
  const prevWeekId = getPrevWeekId(weekId);
  const nextWeekId = getNextWeekId(weekId);
  const allWeeksInMonth = getWeeksInMonth(parentMonthId);

  // 14. Plan vs Actual & Incomplete Tasks
  const weekStudyHoursFormatted = `${Math.floor(weekStudyMinutes / 60)}h ${weekStudyMinutes % 60}m`;
  const planVsActual = {
    study: {
      planned: `${studyHoursTarget}h`,
      actual: weekStudyHoursFormatted,
      plannedNum: studyHoursTarget,
      actualNum: studyHoursCompleted
    },
    dsaVideos: {
      planned: dsaVideosTarget,
      actual: dsaVideosCompleted
    },
    dsaProblems: {
      planned: dsaProblemsTarget,
      actual: dsaProblemsCompleted
    },
    semesterAnswers: {
      planned: semesterRequiredTarget,
      actual: semesterRequiredCompleted,
      optional: semesterOptionalCompleted,
      total: semesterTotalCompleted
    },
    davinciVideos: {
      planned: davinciTargetVideos,
      actual: davinciVideosCompleted,
      remaining: davinciVideosRemaining
    },
    javaVideos: {
      label: 'Java Playlist Videos',
      planned: javaTargetVideos,
      actual: javaVideosCompleted,
      remaining: javaVideosRemaining,
      unit: 'videos',
      status: javaVideosCompleted >= javaTargetVideos ? 'Completed' : 'Behind'
    }
  };

  const incompleteTasks = weekTasks.filter(t => !t.completed && !t.skipped);

  return {
    weekId,
    weekNumber,
    startDate,
    endDate,
    rangeLabel,
    parentMonthId,
    parentMonthTitle,
    weekStatus,
    planVsActual,
    incompleteTasks,
    targets: {
      studyHours: studyHoursTarget,
      studyHoursCompleted,
      studyHoursRemaining: Math.max(0, Number((studyHoursTarget - studyHoursCompleted).toFixed(1))),
      dsaVideos: dsaVideosTarget,
      dsaVideosCompleted,
      dsaVideosRemaining,
      dsaProblems: dsaProblemsTarget,
      dsaProblemsCompleted,
      dsaProblemsRemaining,
      semesterRequired: semesterRequiredTarget,
      semesterRequiredCompleted,
      semesterOptional: semesterOptionalTarget,
      semesterOptionalCompleted,
      semesterTotalCompleted,
      revisionTarget: revisionTargetSessions,
      revisionCompleted,
      davinciTarget: davinciTargetVideos,
      davinciCompleted: davinciVideosCompleted,
      davinciRemaining: davinciVideosRemaining,
      javaVideos: javaTargetVideos,
      javaVideosCompleted: javaVideosCompleted,
      javaVideosRemaining: javaVideosRemaining,
      davinciVideos: weekDavinciVideos,
      primeTarget: primeTargetTitle,
      primeProgress,
      individualTarget: individualTargetTitle,
      individualProgress: indivProgress,
      projectMilestone: projectMilestoneTitle,
      projectProgress,
      gamingRange: '0–6 hours/week (optional recreation)',
      gamingLimit,
      gamingActualHours
    },
    dsa: {
      startVideo: weekDsaStartVideo,
      endVideo: weekDsaEndVideo,
      plannedVideos: weekVideos.length,
      completedVideos: dsaVideosCompleted,
      remainingVideos: dsaVideosRemaining,
      playlistUrl: DSA_PLAYLIST_URL,
      courseName: 'Apna College Complete C++ DSA Course',
      videosList: weekVideos,
      problemsTarget: dsaProblemsTarget,
      problemsCompleted: dsaProblemsCompleted,
      problemsRemaining: dsaProblemsRemaining
    },
    semester: {
      requiredTarget: semesterRequiredTarget,
      requiredCompleted: semesterRequiredCompleted,
      optionalTarget: 7, // up to 7 optional answers (making 21 max)
      optionalCompleted: semesterOptionalCompleted,
      totalCompleted: semesterTotalCompleted,
      revisionTarget: revisionTargetSessions,
      revisionCompleted,
      answersList: weekSemester
    },
    days: daysWithStats,
    goals: finalWeekGoals,
    review: {
      ...currentReview,
      dsaCheck,
      semesterCheck
    },
    gamingHours: gamingActualHours,
    gamingLimit,
    actualStudyHours: studyHoursCompleted,
    actualDSACompleted: dsaVideosCompleted,
    actualDSAProblems: dsaProblemsCompleted,
    actualSemesterCompleted: semesterTotalCompleted,
    actualDavinciCompleted: davinciVideosCompleted,
    actualJavaCompleted: javaVideosCompleted,
    java: {
      video: weekJavaVideo,
      targetVideos: javaTargetVideos,
      completedVideos: javaVideosCompleted,
      remainingVideos: javaVideosRemaining,
      isCompleted: javaVideosCompleted >= javaTargetVideos && javaTargetVideos > 0,
      playlistUrl: JAVA_PLAYLIST_URL,
      task: weekJavaTasks[0] || null
    },
    completedTasksCount: isProgramActive ? weekTasks.filter(t => t.completed).length : 0,
    prevWeekId,
    nextWeekId,
    allWeeksInMonth,
    allPlanWeeks
  };
}

// -------------------------------------------------------------
// 12-MONTH PLAN DATA (October 2026 -> September 2027)
// Derived exactly from the Monthly Plan PDF
// -------------------------------------------------------------
export const MONTHLY_PLAN_DATA = {
  '2026-10': {
    id: '2026-10',
    year: 2026,
    month: 10,
    title: 'October 2026',
    theme: 'Foundation + Semester Start',
    academicLearningTarget: 'Start from playlist basics; code each concept; begin answer bank; establish daily routine.',
    dsaStartVideo: 1,
    dsaEndVideo: 12,
    dsaPlannedVideos: 12,
    dsaProblemsTarget: 40,
    semesterAnswersTarget: 62,
    revisionTarget: 20,
    studyHoursTarget: 128,
    primeTarget: 'Prime 3.0: AI/ML Batch (Parts 1–10: Python for AI/ML & Environment)',
    individualTarget: 'Java Fundamentals (Syntax, OOP, Collections Basics, Exceptions), Linux CLI, Git',
    projectMilestone: 'Java CLI Application: Core Architecture & Data Handlers',
    focusLearn: 'Prime 3.0 (Parts 1–10) + Independent Java Track (Java Fundamentals)',
    focusPractice: 'Apna College C++ DSA Videos 1–12 + 40 DSA Problems',
    focusBuild: 'Project: Java CLI Application & Data Manager',
    focusRevise: 'DSA Basics Revision in C++ + Semester Unit 1 Foundational Answers'
  },
  '2026-11': {
    id: '2026-11',
    year: 2026,
    month: 11,
    title: 'November 2026',
    theme: 'DSA Foundation + Consistency',
    academicLearningTarget: 'Continue in order; implement concepts; maintain 2–3 exam answers/day.',
    dsaStartVideo: 13,
    dsaEndVideo: 24,
    dsaPlannedVideos: 12,
    dsaProblemsTarget: 40,
    semesterAnswersTarget: 60,
    revisionTarget: 20,
    studyHoursTarget: 128,
    primeTarget: 'Data Pre-processing & Feature Engineering',
    individualTarget: 'Big-O, Two Pointers, Sliding Window, Recursion Foundations',
    focusLearn: 'Prime 3.0 (Data Pre-processing) + Individual (Big-O, Two Pointers, Recursion)',
    focusPractice: 'Apna College DSA Videos 13–24 + 40 DSA Problems',
    focusBuild: 'Project: Algorithmic Benchmark Engine & Visualizer',
    focusRevise: 'DSA Arrays/Strings Revision + Semester Unit 1 & 2 Answers',
    projectMilestone: 'Algorithmic Benchmark Engine & Visualizer'
  },
  '2026-12': {
    id: '2026-12',
    year: 2026,
    month: 12,
    title: 'December 2026',
    theme: 'DSA Continuation + Revision',
    academicLearningTarget: 'Continue playlist; add short problem practice; revise completed exam answers.',
    dsaStartVideo: 25,
    dsaEndVideo: 36,
    dsaPlannedVideos: 12,
    dsaProblemsTarget: 40,
    semesterAnswersTarget: 62,
    revisionTarget: 25,
    studyHoursTarget: 128,
    primeTarget: 'Data Visualization & Exploratory Data Analysis (EDA)',
    individualTarget: 'Linked Lists, Monotonic Stacks, Hash Tables, Binary Search Trees',
    projectMilestone: 'Supervised ML Exploratory Data Pipeline with Matplotlib & Seaborn',
    focusLearn: 'Prime 3.0 (Data Visualization & EDA) + Individual (Linked Lists, Stacks, BST)',
    focusPractice: 'Apna College DSA Videos 25–36 + 40 DSA Problems',
    focusBuild: 'Project: Supervised ML Exploratory Data Pipeline',
    focusRevise: 'DSA Linked Structures Revision + Semester Midterm Answers'
  },
  '2027-01': {
    id: '2027-01',
    year: 2027,
    month: 1,
    title: 'January 2027',
    theme: 'Semester Focus + DSA',
    academicLearningTarget: 'Keep DSA consistent but reduce load on heavy exam days; prioritize unit-wise answer revision.',
    dsaStartVideo: 37,
    dsaEndVideo: 48,
    dsaPlannedVideos: 12,
    dsaProblemsTarget: 35,
    semesterAnswersTarget: 62,
    revisionTarget: 30,
    studyHoursTarget: 120,
    primeTarget: 'Math for AI: Statistics & Probability',
    individualTarget: 'Heaps, Priority Queues, Graph Traversals (BFS/DFS), Dynamic Programming',
    projectMilestone: 'Graph Algorithm Engine / Interactive Pathfinding Visualizer',
    focusLearn: 'Prime 3.0 (Math for AI: Stats & Prob) + Individual (Heaps, Graphs, DP)',
    focusPractice: 'Apna College DSA Videos 37–48 + 35 DSA Problems',
    focusBuild: 'Project: Graph Algorithm Engine / Pathfinding Visualizer',
    focusRevise: 'DSA Graph/DP Revision + Unit-wise Semester Revision'
  },
  '2027-02': {
    id: '2027-02',
    year: 2027,
    month: 2,
    title: 'February 2027',
    theme: 'Problem Solving',
    academicLearningTarget: 'Continue playlist; code after lectures; clean up semester-answer backlog.',
    dsaStartVideo: 49,
    dsaEndVideo: 60,
    dsaPlannedVideos: 12,
    dsaProblemsTarget: 45,
    semesterAnswersTarget: 56,
    revisionTarget: 20,
    studyHoursTarget: 128,
    primeTarget: 'ML Evaluation Metrics & Supervised Learning (Regression & Classification)',
    individualTarget: 'Relational DBMS, Keys, Normalization (1NF-BCNF), Transactions, ACID, Indexing, PostgreSQL',
    projectMilestone: 'Relational Query Engine & SQL Analytics Dashboard',
    focusLearn: 'Prime 3.0 (Supervised Learning) + Individual (DBMS, Keys, Normalization, ACID)',
    focusPractice: 'Apna College DSA Videos 49–60 + 45 DSA Problems',
    focusBuild: 'Project: Relational Query Engine & SQL Analytics',
    focusRevise: 'DSA Backlog Revision + Semester Answer Cleanup'
  },
  '2027-03': {
    id: '2027-03',
    year: 2027,
    month: 3,
    title: 'March 2027',
    theme: 'DSA + AI/ML Application',
    academicLearningTarget: 'Continue in order; connect coding practice with Prime 3.0/project work.',
    dsaStartVideo: 61,
    dsaEndVideo: 72,
    dsaPlannedVideos: 12,
    dsaProblemsTarget: 40,
    semesterAnswersTarget: 62,
    revisionTarget: 20,
    studyHoursTarget: 128,
    primeTarget: 'Unsupervised Learning, Clustering & Dimensionality Reduction (PCA)',
    individualTarget: 'Processes, Threads, CPU Scheduling, Deadlocks, Virtual Memory & Paging',
    projectMilestone: 'Multi-threaded Task Scheduler / Virtual Memory Simulator',
    focusLearn: 'Prime 3.0 (Unsupervised Learning & PCA) + Individual (OS Processes, Threads, Memory)',
    focusPractice: 'Apna College DSA Videos 61–72 + 40 DSA Problems',
    focusBuild: 'Project: Multi-threaded Task Scheduler / Memory Sim',
    focusRevise: 'DSA Practice Revision + OS Core Question Revision'
  },
  '2027-04': {
    id: '2027-04',
    year: 2027,
    month: 4,
    title: 'April 2027',
    theme: 'DSA + Project Depth',
    academicLearningTarget: 'Continue playlist; write code independently; strengthen project implementation.',
    dsaStartVideo: 73,
    dsaEndVideo: 84,
    dsaPlannedVideos: 12,
    dsaProblemsTarget: 40,
    semesterAnswersTarget: 60,
    revisionTarget: 20,
    studyHoursTarget: 128,
    primeTarget: 'Deep Learning & Neural Network Foundations (Perceptron, Backpropagation)',
    individualTarget: 'OSI 7 Layers, TCP/IP, TCP Handshake, UDP, HTTP/HTTPS, DNS, Sockets',
    projectMilestone: 'High-Performance HTTP/1.1 Server & Packet Sniffer in Python',
    focusLearn: 'Prime 3.0 (Deep Learning & Neural Nets) + Individual (Networks, TCP/IP, Sockets)',
    focusPractice: 'Apna College DSA Videos 73–84 + 40 DSA Problems',
    focusBuild: 'Project: High-Performance HTTP/1.1 Server & Packet Sniffer',
    focusRevise: 'DSA Implementation Revision + Networks Review'
  },
  '2027-05': {
    id: '2027-05',
    year: 2027,
    month: 5,
    title: 'May 2027',
    theme: 'DSA + Interview Foundations',
    academicLearningTarget: 'Continue playlist; maintain problem log; revise core CS and semester answers.',
    dsaStartVideo: 85,
    dsaEndVideo: 96,
    dsaPlannedVideos: 12,
    dsaProblemsTarget: 45,
    semesterAnswersTarget: 62,
    revisionTarget: 25,
    studyHoursTarget: 128,
    primeTarget: 'Computer Vision & Convolutional Neural Networks (AlexNet, ResNet)',
    individualTarget: 'CPU Architecture, Cache Hierarchy, Linear Algebra (Eigenvalues, SVD), Multivariable Calculus',
    projectMilestone: 'CNN Vision Classifier with Custom Data Augmentation Pipeline',
    focusLearn: 'Prime 3.0 (Computer Vision & CNNs) + Individual (Hardware Arch, Linear Algebra)',
    focusPractice: 'Apna College DSA Videos 85–96 + 45 DSA Problems',
    focusBuild: 'Project: CNN Vision Classifier Pipeline',
    focusRevise: 'Core CS Revision + Semester Question Bank'
  },
  '2027-06': {
    id: '2027-06',
    year: 2027,
    month: 6,
    title: 'June 2027',
    theme: 'Roadmap Completion Checkpoint',
    academicLearningTarget: 'Continue playlist; review earlier DSA notes; close important individual-learning gaps.',
    dsaStartVideo: 97,
    dsaEndVideo: 108,
    dsaPlannedVideos: 12,
    dsaProblemsTarget: 40,
    semesterAnswersTarget: 60,
    revisionTarget: 30,
    studyHoursTarget: 128,
    primeTarget: 'Sequence Models, RNNs, LSTMs & NLP Foundations',
    individualTarget: 'NumPy Vectorization, Pandas Data Wrangling, 5 Industry EDA Case Studies',
    projectMilestone: '5 Published EDA Reports + Automated Data Cleaning CLI Tool',
    focusLearn: 'Prime 3.0 (Sequence Models & NLP) + Individual (NumPy, Pandas, 5 EDA Studies)',
    focusPractice: 'Apna College DSA Videos 97–108 + 40 DSA Problems',
    focusBuild: 'Project: 5 EDA Reports + Data Cleaning CLI',
    focusRevise: 'Earlier DSA Notes Revision + Gap Closure'
  },
  '2027-07': {
    id: '2027-07',
    year: 2027,
    month: 7,
    title: 'July 2027',
    theme: 'Practical Depth',
    academicLearningTarget: 'Continue playlist; independent problem solving; apply learning in projects.',
    dsaStartVideo: 109,
    dsaEndVideo: 120,
    dsaPlannedVideos: 12,
    dsaProblemsTarget: 45,
    semesterAnswersTarget: 62,
    revisionTarget: 20,
    studyHoursTarget: 128,
    primeTarget: 'Transformers Architecture, Attention Mechanism & Modern NLP (BERT, GPT)',
    individualTarget: 'HTML/CSS/JS, REST API Design, JWT Auth, FastAPI, SQLAlchemy ORM',
    projectMilestone: 'Full-Stack AI Application with FastAPI Backend & JWT Auth',
    focusLearn: 'Prime 3.0 (Transformers & Attention) + Individual (Web Arch, FastAPI, ORM)',
    focusPractice: 'Apna College DSA Videos 109–120 + 45 DSA Problems',
    focusBuild: 'Project: Full-Stack AI Application with FastAPI & JWT',
    focusRevise: 'DSA Problem Patterns Revision + Practical Subjects'
  },
  '2027-08': {
    id: '2027-08',
    year: 2027,
    month: 8,
    title: 'August 2027',
    theme: 'Interview Preparation',
    academicLearningTarget: 'Continue playlist; strengthen weak DSA areas; technical revision and project explanation.',
    dsaStartVideo: 121,
    dsaEndVideo: 132,
    dsaPlannedVideos: 12,
    dsaProblemsTarget: 50,
    semesterAnswersTarget: 62,
    revisionTarget: 25,
    studyHoursTarget: 130,
    primeTarget: 'Generative AI, LLMs & Retrieval-Augmented Generation (RAG), Vector DBs',
    individualTarget: 'Docker Multi-stage, Docker Compose, Kubernetes Pods/Deployments, GitHub Actions, AWS/Azure',
    projectMilestone: 'Production Multi-Document RAG with Vector Search & Cloud Deployment',
    focusLearn: 'Prime 3.0 (GenAI, LLMs & RAG) + Individual (Docker, K8s, CI/CD, Cloud)',
    focusPractice: 'Apna College DSA Videos 121–132 + 50 DSA Problems',
    focusBuild: 'Project: Multi-Document RAG with Vector Search & Cloud Deployment',
    focusRevise: 'Weak DSA Areas Revision + Technical Interview Q&A'
  },
  '2027-09': {
    id: '2027-09',
    year: 2027,
    month: 9,
    title: 'September 2027',
    theme: 'Finish + Consolidate',
    academicLearningTarget: 'Finish playlist; revise important concepts/problems; review the full year\'s academic answer bank.',
    dsaStartVideo: 133,
    dsaEndVideo: 144,
    dsaPlannedVideos: 12,
    dsaProblemsTarget: 40,
    semesterAnswersTarget: 60,
    revisionTarget: 35,
    studyHoursTarget: 128,
    primeTarget: 'AI Deployment, MLOps, Minor & Major Capstone Projects',
    individualTarget: 'ATS Resume, LinkedIn/GitHub Cleanup, Portfolio Website, Core CS Speed Revision',
    projectMilestone: 'Placement Portfolio Showcase & Live Deployed Capstone',
    focusLearn: 'Prime 3.0 (MLOps & Capstone) + Individual (ATS Resume, Portfolio Website, Speed Revision)',
    focusPractice: 'Apna College DSA Videos 133–144 (Finish Playlist!) + 40 Problems',
    focusBuild: 'Project: Placement Portfolio Showcase & Live Capstone',
    focusRevise: 'Complete DSA Playlist Revision + Full Year Academic Answer Bank Review'
  }
};

// -------------------------------------------------------------
// 144-VIDEO APNA COLLEGE DSA PLAYLIST
// Complete ordered progression distributed 12 videos/month
// -------------------------------------------------------------
const DSA_TOPIC_NAMES = [
  // 1-12 (Oct 2026: Videos 1-12)
  'Flowcharts & Pseudocode', 'Variables & Data Types in C++', 'Conditional Statements & Loops', 'Patterns (Part 1)',
  'Patterns (Part 2)', 'Functions & Scope', 'Binary Number System', 'Bitwise Operators & Data Types Modifiers',
  'Arrays (Part 1) - Introduction & Linear Search', 'Arrays (Part 2) - Subarrays & Kadane Algorithm',
  'Time & Space Complexity', 'Basic Sorting Algorithms (Bubble, Selection, Insertion)',
  // 13-24 (Nov 2026: Videos 13-24)
  '2D Arrays & Matrices', 'Strings & Character Arrays', 'Vectors in C++ / STL Containers',
  'Pointers & Dynamic Memory Allocation', 'Recursion (Part 1) - Basics & Recurrence', 'Recursion (Part 2) - Divide & Conquer',
  'Backtracking - N-Queens & Grid Ways', 'Object Oriented Programming (OOPs)', 'Linked Lists (Part 1) - Singly Linked List',
  'Linked Lists (Part 2) - Doubly & Circular Lists', 'Stacks (Part 1) - Implementation & Next Greater', 'Stacks (Part 2) - Trapping Rainwater',
  // 25-36 (Dec 2026: Videos 25-36)
  'Queues - Deque & Circular Queue', 'Binary Trees (Part 1) - Traversals', 'Binary Trees (Part 2) - Height & Diameter',
  'Binary Search Trees (BST)', 'BST Operations & Validations', 'Heaps & Priority Queues',
  'Hashing & Hashmaps', 'Tries - Prefix Tree', 'Graph Traversals (BFS & DFS)',
  'Topological Sorting & Kahn Algorithm', 'Dijkstra & Shortest Path Algorithms', 'Disjoint Set Union (DSU) & Kruskal MST',
  // 37-48 (Jan 2027: Videos 37-48)
  'Dynamic Programming (Part 1) - Introduction & Memoization', 'DP (Part 2) - 0/1 Knapsack & Variations',
  'DP (Part 3) - Longest Common Subsequence (LCS)', 'DP (Part 4) - Matrix Chain Multiplication & Partition DP',
  'Segment Trees - Range Minimum Query', 'Segment Trees - Lazy Propagation',
  'Bit Manipulation Advanced & Bitmask DP', 'Greedy Algorithms (Part 1)', 'Greedy Algorithms (Part 2)',
  'Binary Lifting & Lowest Common Ancestor (LCA)', 'Math & Number Theory for DSA', 'Backtracking Advanced Optimization',
  // 49-60 (Feb 2027: Videos 49-60)
  'Sliding Window Technique Mastery', 'Two Pointers Deep Dive', 'Monotonic Stack Patterns',
  'Monotonic Queue & Deque Maximums', 'Binary Search on Answers', 'Tree DP - Diameter & Maximum Path Sum',
  'Bipartite Graph & 2-Coloring', 'Bellman-Ford & Floyd-Warshall Algorithms', 'String Matching - KMP Algorithm',
  'Z-Algorithm & Rabin-Karp', 'Game Theory & Minimax DP', 'Heavy-Light Decomposition Intro',
  // 61-72 (Mar 2027: Videos 61-72)
  'DSA Application in AI/ML - Matrix Computations', 'Vector Space Operations & Nearest Neighbors',
  'KD-Trees & Spatial Partitioning', 'Priority Queues in Task Scheduling', 'Convex Hull & Optimization Algorithms',
  'Dynamic Programming in Reinforcement Learning', 'Graph Neural Network Data Structures',
  'LRU & LFU Cache Implementation', 'Concurrent Data Structures & Locks', 'Lock-Free Queue Implementation',
  'Memory Profiling & Dynamic Cache Optimization', 'Algorithm Benchmarking & Performance Profiling',
  // 73-84 (Apr 2027: Videos 73-84)
  'Inverted Index Construction & Search', 'B-Trees & B+ Trees for Disk Storage', 'Log-Structured Merge (LSM) Trees',
  'Bloom Filters & Probabilistic Data Structures', 'Consistent Hashing & Distributed Ring',
  'Token Bucket & Leaky Bucket Rate Limiters', 'Network Packet Queueing & Priority Queues',
  'Serialization & Custom Binary Protocols', 'Memory-Mapped File Buffers', 'External Multi-Way Merge Sort',
  'Cache-Oblivious Data Structures', 'Independent Project Implementation & Verification',
  // 85-96 (May 2027: Videos 85-96)
  'Top Interview 150 Core Patterns', 'Fast & Slow Pointers Pattern', 'Intervals Scheduling & Merging',
  'Cyclic Sort for Missing Numbers', 'In-Place Reversal of LinkedList Nodes', 'Tree Breadth-First Level Traversal Patterns',
  'Tree Depth-First Path Sum Patterns', 'Two Heaps for Median Finding', 'Subsets & Combinations Patterns',
  'Modified Binary Search in Rotated Arrays', 'Top K Frequent Elements Pattern', 'K-Way Merge Pattern',
  // 97-108 (Jun 2027: Videos 97-108)
  'Roadmap Completion Checkpoint - Arrays & Strings Review', 'Roadmap Checkpoint - LinkedList & Stacks Review',
  'Roadmap Checkpoint - Trees & BST Review', 'Roadmap Checkpoint - Graph Algorithms Review',
  'Roadmap Checkpoint - Dynamic Programming Review', 'Earlier DSA Notes Comprehensive Synthesis',
  'Hard Level Tree Interview Problems', 'Hard Level Graph & Network Flow Problems', 'Complex DP State Compression Drills',
  'Individual Learning Gaps Closure', 'Code Refactoring & Testing Standards', 'Comprehensive Midterm Mock Assessment',
  // 109-120 (Jul 2027: Videos 109-120)
  'Practical Depth - Production Data Structures', 'High-Throughput Batch Processing Pipelines',
  'Fast Fourier Transform (FFT) Implementation', 'Computational Geometry & Convex Polygon Algorithms',
  'Max Flow & Min Cut (Ford-Fulkerson & Dinic)', 'String Hashing in Production Systems',
  'Suffix Automaton & Generalized Tries', 'Independent LeetCode Hard Problem Solving',
  'Custom Memory Pools in C++', 'Cache Hierarchy & SIMD Vectorization in Algorithms',
  'Practical Depth - Real-World Algorithm Applications', 'Integration Testing of Algorithmic Modules',
  // 121-132 (Aug 2027: Videos 121-132)
  'Technical Interview Preparation - FAANG Coding Drills', 'Live Whiteboarding Simulation & System Thinking',
  'Dynamic Programming Speed & Pattern Recognition', 'Graph Modeling for Real-World Problems',
  'System Design DSA Applications & Trade-offs', 'Algorithmic Complexity & Edge-Case Articulation',
  'Clean Code & Defensiveness Under Interview Pressure', 'Concurrency & Deadlock Prevention Drills',
  'Mock Interview 1 - Coding Speed & Correctness', 'Mock Interview 2 - Algorithmic Trade-offs',
  'Strengthening Weak DSA Areas & Error Log Review', 'Final Technical Interview Readiness Drills',
  // 133-144 (Sep 2027: Videos 133-144)
  'Finish Playlist - Comprehensive DSA Synthesis', 'Revision of Foundational Data Structures',
  'Revision of Advanced Graph & DP Patterns', 'Placement Coding Exam High-Frequency Questions',
  'Data Structure Selection Heuristics & Decision Trees', 'Algorithmic Optimization Final Case Studies',
  'Full Year DSA Summary & Cheat Sheet Creation', 'Performance Benchmarking & Final Profile',
  'Placement Mock Assessment 1', 'Placement Mock Assessment 2',
  'Academic & DSA Final Year Consolidation', 'Playlist 144 Completion & Career Readiness Finale'
];

export const DEFAULT_DSA_PLAYLIST = DSA_TOPIC_NAMES.map((title, idx) => {
  const videoNum = idx + 1;
  return {
    id: `dsa-${videoNum}`,
    video_number: videoNum,
    title,
    completed: false,
    problems_solved: 0,
    completion_date: null
  };
});

// -------------------------------------------------------------
// MONTH DATA
// -------------------------------------------------------------
export function getMonthData(monthId = null) {
  const state = getState();
  const canonicalToday = getCanonicalToday();
  const isProgramActive = canonicalToday >= PROGRAM_START_DATE;

  // Default to October 2026 if not specified or before 2026-10 (start of 12-month plan, Req 1, 3)
  const selectedMonthId = (monthId && monthId >= '2026-10') ? monthId : '2026-10';

  // Look up month targets in remote_months or fallback to MONTHLY_PLAN_DATA
  const remoteMonth = (state.remote_months || []).find(m => m.id === selectedMonthId);
  const planData = MONTHLY_PLAN_DATA[selectedMonthId] || MONTHLY_PLAN_DATA['2026-10'];
  const monthConfig = remoteMonth ? { ...planData, ...remoteMonth } : planData;

  const [year, monthNum] = selectedMonthId.split('-').map(Number);
  const monthTitle = monthConfig.title || formatMonthYear(selectedMonthId);

  // Targets from PDF / remote month record
  const startVideo = Number(monthConfig.dsa_start_video || monthConfig.dsaStartVideo || 1);
  const endVideo = Number(monthConfig.dsa_end_video || monthConfig.dsaEndVideo || 12);
  const dsaTargetVideos = Number(monthConfig.dsa_target_videos || monthConfig.dsaPlannedVideos || 12);
  const dsaTargetProblems = Number(monthConfig.dsa_target_problems || monthConfig.dsaProblemsTarget || 40);
  const studyTargetHours = Number(monthConfig.study_target_hours || monthConfig.studyHoursTarget || 128);
  const semesterTargetCount = Number(monthConfig.semester_target_count || monthConfig.semesterAnswersTarget || 62);
  const revisionTargetCount = Number(monthConfig.revision_target_count || monthConfig.revisionTarget || 20);

  // 1. DSA Playlist Progress (Exact range [startVideo..endVideo])
  const allDSA = (state.remote_dsa && state.remote_dsa.length > 0)
    ? state.remote_dsa
    : DEFAULT_DSA_PLAYLIST;
  const monthVideos = allDSA.filter(v => v.video_number >= startVideo && v.video_number <= endVideo);
  const dsaVideosCompleted = isProgramActive ? monthVideos.filter(v => v.completed).length : 0;
  const dsaVideosRemaining = Math.max(0, dsaTargetVideos - dsaVideosCompleted);
  const dsaVideosPercent = dsaTargetVideos > 0 ? Math.round((dsaVideosCompleted / dsaTargetVideos) * 100) : 0;

  // 2. DSA Problems Progress (ignoring pre-program dates)
  const allTasks = (state.remote_tasks || state.daily_tasks || state.tasks || []);
  const monthTasks = allTasks.filter(t => t.date && t.date >= PROGRAM_START_DATE && t.date.startsWith(selectedMonthId));
  const monthDsaProblemTasks = monthTasks.filter(t => t.category === 'PRACTICE' && (t.subtype === 'DSA' || t.subtype === 'PROBLEMS' || (t.title && t.title.toLowerCase().includes('problem')))).filter(t => t.completed).length;
  const dsaProblemsFromVideos = isProgramActive ? monthVideos.reduce((acc, v) => acc + Number(v.problems_solved || 0), 0) : 0;
  const dsaProblemsCompleted = isProgramActive ? Math.max(monthDsaProblemTasks, dsaProblemsFromVideos) : 0;
  const dsaProblemsRemaining = Math.max(0, dsaTargetProblems - dsaProblemsCompleted);

  // 3. Study Hours Progress (from real logged study sessions, ignoring pre-program dates)
  const allSessions = (state.remote_study_sessions || state.study_sessions || []);
  const monthSessions = allSessions.filter(s => s.date && s.date >= PROGRAM_START_DATE && s.date.startsWith(selectedMonthId));
  const monthStudyMinutes = isProgramActive ? monthSessions.reduce((acc, s) => acc + Number(s.duration_minutes || s.durationMinutes || 0), 0) : 0;
  const studyHoursCompleted = Number((monthStudyMinutes / 60).toFixed(1));
  const studyHoursRemaining = Math.max(0, Number((studyTargetHours - studyHoursCompleted).toFixed(1)));

  // 4. Semester Answers Progress & Revision
  const allSemester = (state.remote_semester || state.semester_answers || []);
  const monthSemester = allSemester.filter(a => a.date && a.date >= PROGRAM_START_DATE && a.date.startsWith(selectedMonthId));
  const semesterAnswersCompleted = isProgramActive ? monthSemester.filter(a => a.completed).length : 0;
  const semesterAnswersRemaining = Math.max(0, semesterTargetCount - semesterAnswersCompleted);
  const revisionCompleted = isProgramActive ? monthSemester.filter(a => a.revised).length : 0;
  const revisionRemaining = Math.max(0, revisionTargetCount - revisionCompleted);

  // 5. Prime 3.0 Parts Summary (Section 12: summarize Prime 3.0 by Parts)
  const monthPrimeParts = getPrimePartsForMonth(selectedMonthId);
  const partsReleased = monthPrimeParts.filter(p => p.release_date <= canonicalToday);
  const completedPartNumbers = new Set(
    monthTasks.filter(t => (t.is_prime_part || t.subtype === 'PRIME_3') && t.completed)
      .map(t => t.part_number || parseInt((t.title.match(/Part\s+(\d+)/i) || [])[1]))
      .filter(Boolean)
  );
  const primePartsCompletedCount = isProgramActive
    ? partsReleased.filter(p => completedPartNumbers.has(p.part_number)).length
    : 0;
  const primePartsPendingCount = Math.max(0, partsReleased.length - primePartsCompletedCount);
  const primePartsSummary = {
    totalInMonth: monthPrimeParts.length,
    released: partsReleased.length,
    completed: primePartsCompletedCount,
    pending: primePartsPendingCount,
    label: `${partsReleased.length} Parts Released • ${primePartsCompletedCount} Completed • ${primePartsPendingCount} Pending`
  };
  const primeProgress = isProgramActive && partsReleased.length > 0
    ? `${partsReleased.length} Parts Released (${primePartsCompletedCount} Completed, ${primePartsPendingCount} Pending)`
    : (monthPrimeParts.length > 0 ? `${monthPrimeParts.length} Parts Planned` : 'In Progress');

  const indivTasks = monthTasks.filter(t => t.category === 'LEARN' && (t.subtype === 'INDIVIDUAL' || t.is_java_task || (t.title && t.title.toLowerCase().includes('java'))) && !isLegacyCTask(t));
  const indivCompletedCount = isProgramActive ? indivTasks.filter(t => t.completed).length : 0;
  const indivProgress = isProgramActive && indivTasks.length > 0 ? `${indivCompletedCount}/${indivTasks.length} tasks` : (isProgramActive && indivCompletedCount > 0 ? `${indivCompletedCount} tasks` : 'In Progress');

  const projectTasks = monthTasks.filter(t => t.category === 'BUILD' || t.subtype === 'PROJECT');
  const projectCompletedCount = isProgramActive ? projectTasks.filter(t => t.completed).length : 0;
  const projectProgress = isProgramActive && projectTasks.length > 0 ? `${projectCompletedCount}/${projectTasks.length} tasks` : (isProgramActive && projectCompletedCount > 0 ? `${projectCompletedCount} tasks` : 'In Progress');

  // 5.1 DaVinci Resolve Monthly Tracking (Target: 8 videos/month, 2 per week)
  const monthDavinciTasks = monthTasks.filter(t => t.category === 'DAVINCI' || t.subtype === 'DAVINCI_PLAYLIST');
  const davinciTargetVideos = Number(monthConfig.davinci_target_videos || 8);
  const davinciVideosCompleted = isProgramActive ? monthDavinciTasks.filter(t => t.completed).length : 0;
  const davinciVideosRemaining = Math.max(0, davinciTargetVideos - davinciVideosCompleted);

  // 5.2 Java Playlist Track Monthly Tracking
  const monthJavaVideos = getJavaVideosForMonth(selectedMonthId);
  const javaTargetVideos = monthJavaVideos.length;
  const completedJavaSet = new Set((state.java_progress || []).filter(v => v.completed).map(v => v.video_number));
  const monthJavaCompletedCount = isProgramActive
    ? monthJavaVideos.filter(v => completedJavaSet.has(v.video_number)).length
    : 0;
  const javaVideosRemaining = Math.max(0, javaTargetVideos - monthJavaCompletedCount);

  // 6. Optional Gaming Hours (Recreation only, 0-6 hrs/week, not a required target)
  const allGaming = (state.remote_gaming || state.gaming_logs || []);
  const monthGaming = allGaming.filter(g => g.date && g.date >= PROGRAM_START_DATE && g.date.startsWith(selectedMonthId));
  const gamingActualHours = isProgramActive ? monthGaming.reduce((acc, g) => acc + Number(g.duration_hours || 0), 0) : 0;

  // 7. Monthly Goals (5 to 8 goals)
  const allGoals = (state.remote_goals || state.goals || []);
  const monthGoals = allGoals.filter(g => g.type === 'MONTHLY' && g.month_id === selectedMonthId);
  
  // Default goals matching PDF if none exist yet
  const defaultGoals = [
    { id: `mg-${selectedMonthId}-1`, title: `Study: Complete ${studyTargetHours} study hours`, category: 'STUDY', completed: false, month_id: selectedMonthId },
    { id: `mg-${selectedMonthId}-2`, title: `DSA Playlist: Complete videos ${startVideo} to ${endVideo}`, category: 'DSA', completed: isProgramActive && dsaVideosCompleted === dsaTargetVideos, month_id: selectedMonthId },
    { id: `mg-${selectedMonthId}-3`, title: `DSA Practice: Solve ${dsaTargetProblems} problems`, category: 'PRACTICE', completed: isProgramActive && dsaProblemsCompleted >= dsaTargetProblems, month_id: selectedMonthId },
    { id: `mg-${selectedMonthId}-4`, title: `Semester Prep: Maintain 2 answers/day (${semesterTargetCount} target)`, category: 'SEMESTER', completed: false, month_id: selectedMonthId },
    { id: `mg-${selectedMonthId}-5`, title: `Prime 3.0: ${monthConfig.prime_target || monthConfig.primeTarget}`, category: 'LEARN', completed: false, month_id: selectedMonthId },
    { id: `mg-${selectedMonthId}-6`, title: `Individual: ${monthConfig.individual_learning_target || monthConfig.individualTarget}`, category: 'LEARN', completed: false, month_id: selectedMonthId },
    { id: `mg-${selectedMonthId}-7`, title: `Project: ${monthConfig.project_milestone || monthConfig.projectMilestone}`, category: 'BUILD', completed: false, month_id: selectedMonthId }
  ];
  const finalMonthGoals = (monthGoals.length > 0 ? monthGoals : defaultGoals).slice(0, 8);

  // 8. Weeks of selected month
  const weeksList = getWeeksInMonth(selectedMonthId);
  const weeksWithProgress = weeksList.map(w => {
    const wTasks = allTasks.filter(t => t.date >= w.startDate && t.date <= w.endDate && t.date >= PROGRAM_START_DATE);
    const completedTasks = isProgramActive ? wTasks.filter(t => t.completed).length : 0;
    return {
      ...w,
      completedTasks,
      totalTasks: wTasks.length,
      plannedTasks: wTasks.length > 0 ? wTasks.length : 28
    };
  });

  // 9. Monthly Review
  const reviewsMap = state.monthly_reviews || {};
  const currentReview = reviewsMap[selectedMonthId] || {
    completed_this_month: '',
    what_remains_incomplete: '',
    dsa_lectures_revision: '',
    semester_units_practice: '',
    what_moves_to_next_month: '',
    what_needs_improvement: '',
    important_result: '',
    next_month_priority: ''
  };

  // 10. Plan vs Actual & Incomplete Goals
  const planVsActual = {
    study: {
      planned: `${studyTargetHours}h`,
      actual: `${studyHoursCompleted}h`,
      plannedHours: studyTargetHours,
      actualHours: studyHoursCompleted
    },
    dsaVideos: {
      planned: dsaTargetVideos,
      actual: dsaVideosCompleted
    },
    dsaProblems: {
      planned: dsaTargetProblems,
      actual: dsaProblemsCompleted
    },
    semesterAnswers: {
      planned: semesterTargetCount,
      actual: semesterAnswersCompleted
    },
    prime: {
      planned: monthConfig.prime_target || monthConfig.primeTarget || 'Python for AI/ML',
      actual: isProgramActive ? primeProgress : 'Not Started'
    },
    individual: {
      planned: monthConfig.individual_learning_target || monthConfig.individualTarget || 'Java Fundamentals',
      actual: isProgramActive ? indivProgress : 'Not Started'
    },
    project: {
      planned: monthConfig.project_milestone || monthConfig.projectMilestone || 'Project Milestone',
      actual: isProgramActive ? projectProgress : 'Not Started'
    },
    davinciVideos: {
      planned: davinciTargetVideos,
      actual: davinciVideosCompleted,
      remaining: davinciVideosRemaining
    }
  };

  const incompleteGoals = finalMonthGoals.filter(g => !g.completed);

  return {
    monthId: selectedMonthId,
    year,
    monthNum,
    monthTitle,
    theme: monthConfig.theme || '',
    academicLearningTarget: monthConfig.academic_learning_target || monthConfig.academicLearningTarget || '',
    planVsActual,
    incompleteGoals,
    targets: {
      studyHours: studyTargetHours,
      studyHoursCompleted,
      studyHoursRemaining,
      dsaVideos: dsaTargetVideos,
      dsaVideosCompleted,
      dsaVideosRemaining,
      dsaVideosPercent,
      dsaProblems: dsaTargetProblems,
      dsaProblemsCompleted,
      dsaProblemsRemaining,
      semesterAnswersTarget: semesterTargetCount,
      semesterAnswersCompleted,
      semesterAnswersRemaining,
      semesterAnswersRule: '2/day + optional 3rd',
      revisionTarget: revisionTargetCount,
      revisionCompleted,
      davinciTarget: davinciTargetVideos,
      davinciCompleted: davinciVideosCompleted,
      davinciRemaining: davinciVideosRemaining,
      davinciRule: '2 videos / week (8 / month)',
      primeTarget: monthConfig.prime_target || monthConfig.primeTarget || '',
      primeProgress,
      individualTarget: monthConfig.individual_learning_target || monthConfig.individualTarget || '',
      individualProgress: indivProgress,
      projectMilestone: monthConfig.project_milestone || monthConfig.projectMilestone || '',
      projectProgress,
      gamingRange: '0–6 hours/week (optional recreation)',
      gamingActualHours,
      primePartsSummary
    },
    focus: {
      learn: monthConfig.focus_learn || monthConfig.focusLearn || `Prime 3.0 + Individual Learning`,
      practice: monthConfig.focus_practice || monthConfig.focusPractice || `Apna College DSA Videos ${startVideo}–${endVideo} + ${dsaTargetProblems} Problems`,
      build: monthConfig.focus_build || monthConfig.focusBuild || `Project: ${monthConfig.project_milestone || monthConfig.projectMilestone}`,
      revise: monthConfig.focus_revise || monthConfig.focusRevise || `DSA Revision + Semester Revision`
    },
    dsa: {
      startVideo,
      endVideo,
      plannedVideos: dsaTargetVideos,
      completedVideos: dsaVideosCompleted,
      remainingVideos: dsaVideosRemaining,
      percent: dsaVideosPercent,
      problemsTarget: dsaTargetProblems,
      problemsCompleted: dsaProblemsCompleted,
      problemsRemaining: dsaProblemsRemaining,
      videosList: monthVideos
    },
    semester: {
      answersTarget: semesterTargetCount,
      answersCompleted: semesterAnswersCompleted,
      answersRemaining: semesterAnswersRemaining,
      dailyRule: '2 required answers per day + 1 optional third answer',
      revisionTarget: revisionTargetCount,
      revisionCompleted,
      revisionRemaining
    },
    goals: finalMonthGoals,
    weeks: weeksWithProgress,
    review: currentReview,
    allMonths: PLAN_12_MONTHS,
    actualStudyHours: studyHoursCompleted,
    actualDsaVideos: dsaVideosCompleted,
    actualDsaProblems: dsaProblemsCompleted,
    actualSemesterAnswers: semesterAnswersCompleted,
    actualDavinciVideos: davinciVideosCompleted,
    actualJavaVideos: monthJavaCompletedCount,
    java: {
      plannedVideos: monthJavaVideos.map(v => ({
        ...v,
        completed: completedJavaSet.has(v.video_number)
      })),
      targetVideos: javaTargetVideos,
      completedVideos: monthJavaCompletedCount,
      remainingVideos: javaVideosRemaining,
      percentage: javaTargetVideos > 0 ? Math.round((monthJavaCompletedCount / javaTargetVideos) * 100) : 0,
      playlistUrl: JAVA_PLAYLIST_URL
    },
    actualExerciseDays: isProgramActive ? monthTasks.filter(t => (t.category === 'HEALTH' || t.subtype === 'EXERCISE' || (t.title && t.title.toLowerCase().startsWith('exercise'))) && t.completed).length : 0,
    completedTasks: isProgramActive ? monthTasks.filter(t => t.completed).length : 0,
    prevMonthId: getPrevMonthId(selectedMonthId),
    nextMonthId: getNextMonthId(selectedMonthId)
  };
}

// -------------------------------------------------------------
// PROGRESS DATA
// -------------------------------------------------------------
export function getProgressData(viewFilter = 'MONTHLY') {
  const state = getState();
  const canonicalToday = getCanonicalToday();
  const isProgramActive = canonicalToday >= PROGRAM_START_DATE;

  const rawTasks = state.remote_tasks && state.remote_tasks.length > 0 ? state.remote_tasks : (state.daily_tasks || []);
  const rawSessions = state.remote_study_sessions && state.remote_study_sessions.length > 0 ? state.remote_study_sessions : (state.study_sessions || []);
  const rawDSA = state.remote_dsa && state.remote_dsa.length > 0 ? state.remote_dsa : DEFAULT_DSA_PLAYLIST;
  const rawSemester = state.remote_semester && state.remote_semester.length > 0 ? state.remote_semester : [];

  // Ignore any records with date < PROGRAM_START_DATE for program tracking (Req 1, 8, 9)
  const allTasks = rawTasks.filter(t => !t.date || t.date >= PROGRAM_START_DATE);
  const allSessions = rawSessions.filter(s => !s.date || s.date >= PROGRAM_START_DATE);
  const allSemester = rawSemester.filter(a => !a.date || a.date >= PROGRAM_START_DATE);
  const allDSA = rawDSA;

  // Summary Metrics based on real stored data:
  // 1. Study Hours
  const totalStudyMinutes = isProgramActive ? allSessions.reduce((acc, s) => acc + (s.duration_minutes || s.durationMinutes || 0), 0) : 0;
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // 2. DSA Problems
  const totalDSAProblems = isProgramActive ? allDSA.reduce((acc, d) => acc + (d.problems_solved || 0), 0) : 0;

  // 3. Semester Answers
  const totalSemesterAnswers = isProgramActive ? allSemester.filter(a => a.completed).length : 0;

  // 4. Project Progress
  const projectTasks = allTasks.filter(t => t.category === 'BUILD' || t.subtype === 'PROJECT');
  const projectCompleted = isProgramActive ? projectTasks.filter(t => t.completed).length : 0;
  const projectProgress = `${projectCompleted} / ${projectTasks.length} tasks`;

  // 5. DaVinci Resolve Progress
  const davinciTasks = allTasks.filter(t => t.category === 'DAVINCI' || t.subtype === 'DAVINCI_PLAYLIST');
  const davinciCompletedCount = isProgramActive ? davinciTasks.filter(t => t.completed).length : 0;
  const davinciTotalVideos = DAVINCI_PLAYLIST_VIDEOS.length;
  const davinciProgress = `${davinciCompletedCount} / ${davinciTotalVideos} videos`;

  // 5.2 Java Playlist Progress
  const javaCompletedSet = new Set((state.java_progress || []).filter(v => v.completed).map(v => v.video_number));
  allTasks.filter(t => (t.is_java_task || (t.title && t.title.toLowerCase().includes('java'))) && t.completed).forEach(t => {
    const match = t.title.match(/(?:Video\/Lesson|Video|Lecture)\s+(\d+)/i);
    const num = t.video_number || (match ? parseInt(match[1]) : null);
    if (num) javaCompletedSet.add(num);
  });
  const javaCompletedCount = isProgramActive ? JAVA_PLAYLIST_VIDEOS.filter(v => javaCompletedSet.has(v.video_number)).length : 0;
  const javaTotalVideos = JAVA_PLAYLIST_VIDEOS.length; // 39
  const javaProgress = `${javaCompletedCount} / ${javaTotalVideos} videos`;
  const javaPlaylist = JAVA_PLAYLIST_VIDEOS.map(v => ({
    id: `java-vid-${v.video_number}`,
    video_number: v.video_number,
    title: v.title,
    duration_minutes: v.duration_minutes,
    duration_text: v.duration_text,
    videoId: v.videoId,
    url: v.url,
    completed: isProgramActive && javaCompletedSet.has(v.video_number)
  }));

  // 3 Transparent Charts per week for October 2026 plan weeks
  const octWeeks = getWeeksInMonth('2026-10');
  const chartWeeks = octWeeks.map(w => {
    const wTasks = allTasks.filter(t => t.date >= w.startDate && t.date <= w.endDate);
    const wDone = isProgramActive ? wTasks.filter(t => t.completed).length : 0;
    const wSessions = allSessions.filter(s => s.date >= w.startDate && s.date <= w.endDate);
    const wMinutes = isProgramActive ? wSessions.reduce((acc, s) => acc + Number(s.duration_minutes || s.durationMinutes || 0), 0) : 0;
    const studyHours = Number((wMinutes / 60).toFixed(1));
    const dsaProbs = isProgramActive ? wTasks.filter(t => t.category === 'PRACTICE' && (t.subtype === 'PROBLEMS' || t.title.toLowerCase().includes('problem')) && t.completed).length : 0;
    const rate = isProgramActive && wTasks.length > 0 ? Math.round((wDone / wTasks.length) * 100) : 0;
    return {
      label: `Week ${w.weekNumber}`,
      start: w.startDate,
      end: w.endDate,
      studyHours,
      dsaProblems: dsaProbs,
      taskCompletionRate: rate
    };
  });

  const davinciPlaylist = DAVINCI_PLAYLIST_VIDEOS.map(v => {
    const task = davinciTasks.find(t => {
      const match = t.title.match(/Video\s+(\d+)/i);
      return match && parseInt(match[1]) === v.video_number;
    });
    return {
      ...v,
      id: task?.id || `davinci-${v.video_number}`,
      completed: isProgramActive && task ? !!task.completed : false,
      completed_at: isProgramActive ? (task?.completed_at || null) : null,
      taskId: task?.id || null
    };
  });

  return {
    viewFilter,
    summary: {
      studyHours: totalStudyHours,
      dsaVideos: `${isProgramActive ? allDSA.filter(d => d.completed).length : 0} / 144`,
      dsaProblems: totalDSAProblems,
      semesterAnswers: totalSemesterAnswers,
      prime3Progress: `${isProgramActive ? allTasks.filter(t => t.category === 'LEARN' && (t.subtype === 'PRIME_3' || t.title.toLowerCase().includes('prime')) && t.completed).length : 0} lessons`,
      individualProgress: `${isProgramActive ? allTasks.filter(t => t.category === 'LEARN' && (t.subtype === 'INDIVIDUAL' || t.title.toLowerCase().includes('individual')) && t.completed).length : 0} topics`,
      projectProgress,
      davinciProgress,
      davinciCompleted: davinciCompletedCount,
      davinciTotal: davinciTotalVideos,
      exerciseProgress: `${isProgramActive ? allTasks.filter(t => (t.category === 'HEALTH' || t.subtype === 'EXERCISE' || (t.title && t.title.toLowerCase().includes('exercise'))) && t.completed).length : 0} sessions`
    },
    charts: {
      studyHoursPerWeek: chartWeeks.map(w => ({ week: w.label, value: w.studyHours, target: 32 })),
      dsaProblemsPerWeek: chartWeeks.map(w => ({ week: w.label, value: w.dsaProblems, target: 10 })),
      taskCompletionPerWeek: chartWeeks.map(w => ({ week: w.label, value: w.taskCompletionRate, target: 100 }))
    },
    dsaPlaylist: isProgramActive ? allDSA : allDSA.map(d => ({ ...d, completed: false })),
    davinciPlaylist
  };
}

// -------------------------------------------------------------
// PRODUCTIVITY FEATURES HELPERS (Requirements 1–7)
// -------------------------------------------------------------
export { calculateStudyStreak };

/**
 * Weekly Consistency Indicator (Req 3)
 * Returns actual completion state for 7 days (Mon-Sun)
 * Symbols: ✓ = completed, ○ = planned/incomplete, — = no scheduled work
 */
export function getWeeklyConsistency(targetDate = null) {
  const state = getState();
  const canonicalToday = getCanonicalToday();
  const activeDate = targetDate || canonicalToday;
  const isProgramActive = canonicalToday >= PROGRAM_START_DATE;

  // Calendar week Monday -> Sunday
  const d = parseDate(activeDate);
  const dayOfWeek = d.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - distanceToMonday);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    weekDays.push(formatDateStr(cur));
  }

  let allTasks = [];
  if (state.tasks && typeof state.tasks === 'object' && !Array.isArray(state.tasks)) {
    Object.entries(state.tasks).forEach(([dt, tList]) => {
      if (Array.isArray(tList)) {
        tList.forEach(t => allTasks.push({ ...t, date: t.date || dt }));
      }
    });
  } else {
    allTasks = state.remote_tasks && state.remote_tasks.length > 0
      ? state.remote_tasks
      : (state.daily_tasks || state.tasks || []);
  }

  const allSessions = (state.remote_study_sessions || state.study_sessions || []);

  const consistencyDays = weekDays.map((dateStr, idx) => {
    const isFuture = isProgramActive ? (dateStr > canonicalToday) : true;
    const isPreStart = dateStr < PROGRAM_START_DATE;
    const isToday = isProgramActive && (dateStr === canonicalToday);

    const dayTasks = allTasks.filter(t => t.date === dateStr && t.date >= PROGRAM_START_DATE);
    const dayTotal = dayTasks.length;
    const dayCompleted = isProgramActive ? dayTasks.filter(t => t.completed).length : 0;
    const dayStudyMins = isProgramActive
      ? allSessions.filter(s => s.date === dateStr && s.date >= PROGRAM_START_DATE).reduce((acc, s) => acc + (s.duration_minutes || s.durationMinutes || 0), 0)
      : 0;

    const sufficientlyCompleted = isProgramActive && isDaySufficientlyCompleted(dateStr, state);

    let symbol = '—';
    let statusText = 'No scheduled work';
    let statusCode = 'NO_WORK';

    if (isPreStart) {
      symbol = '—';
      statusText = 'No scheduled work (Pre-start)';
      statusCode = 'NO_WORK';
    } else if (isFuture) {
      if (dayTotal > 0) {
        symbol = '○';
        statusText = 'Planned';
        statusCode = 'FUTURE';
      } else {
        symbol = '—';
        statusText = 'No scheduled work';
        statusCode = 'NO_WORK';
      }
    } else {
      // Past or Today (within active program)
      if (dayTotal === 0 && dayStudyMins === 0 && !sufficientlyCompleted) {
        symbol = '—';
        statusText = 'No scheduled work';
        statusCode = 'NO_WORK';
      } else if (sufficientlyCompleted || (dayTotal > 0 && dayCompleted === dayTotal)) {
        symbol = '✓';
        statusText = 'Completed';
        statusCode = 'COMPLETED';
      } else {
        symbol = '○';
        statusText = isToday ? 'In Progress' : 'Incomplete';
        statusCode = 'INCOMPLETE';
      }
    }

    const curD = parseDate(dateStr);
    const mShort = curD.toLocaleDateString('en-US', { month: 'short' });

    return {
      dayName: dayLabels[idx],
      date: dateStr,
      displayDate: `${mShort} ${curD.getDate()}`,
      symbol, // '✓', '○', '—'
      status: statusCode, // 'COMPLETED', 'INCOMPLETE', 'FUTURE', 'NO_WORK'
      statusText,
      statusCode,
      isFuture,
      isToday,
      tasksCompleted: dayCompleted,
      tasksTotal: dayTotal
    };
  });

  const weekData = getWeekData(activeDate);
  consistencyDays.weekRangeLabel = weekData?.rangeLabel || `${weekDays[0]} – ${weekDays[6]}`;
  consistencyDays.days = consistencyDays;
  return consistencyDays;
}

/**
 * Needs Review / Overdue Tasks (Req 4)
 * Returns past scheduled tasks that remain incomplete.
 * Preserves original task date, does NOT auto-mark complete or move into today.
 */
export function getNeedsReviewTasks(targetDate = null) {
  const state = getState();
  const canonicalToday = targetDate || getCanonicalToday();

  // If program has not started yet, there are no overdue past program tasks
  if (canonicalToday <= PROGRAM_START_DATE) {
    return [];
  }

  let allTasks = [];
  if (state.tasks && typeof state.tasks === 'object' && !Array.isArray(state.tasks)) {
    Object.entries(state.tasks).forEach(([d, tList]) => {
      if (Array.isArray(tList)) {
        tList.forEach(t => allTasks.push({ ...t, date: t.date || d }));
      }
    });
  } else {
    allTasks = state.remote_tasks && state.remote_tasks.length > 0
      ? state.remote_tasks
      : (state.daily_tasks || state.tasks || []);
  }

  const overdue = allTasks
    .filter(t => (
      t.date &&
      t.date >= PROGRAM_START_DATE &&
      t.date < canonicalToday &&
      !t.completed &&
      !t.skipped &&
      !t.is_prime_part &&
      t.subtype !== 'PRIME_3' &&
      !(t.title && t.title.toLowerCase().includes('prime 3.0 — part')) &&
      !isLegacyCTask(t)
    ))
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .map(t => ({
      id: t.id,
      title: t.title,
      category: t.category || 'LEARN',
      date: t.date,
      dayLabel: formatShortDate(t.date),
      displayDate: formatShortDate(t.date),
      completed: false,
      estimated_minutes: t.estimated_minutes || 30,
      priority: t.priority || 'Normal'
    }));

  return overdue;
}

/**
 * Next Up Tasks (Req 5)
 * Returns upcoming scheduled tasks for future dates only.
 * Never shows today's completed tasks.
 */
export function getNextUpTasks(targetDate = null, limit = 5) {
  const state = getState();
  const canonicalToday = targetDate || getCanonicalToday();
  const tomorrow = shiftDate(canonicalToday, 1);

  let allTasks = [];
  if (state.tasks && typeof state.tasks === 'object' && !Array.isArray(state.tasks)) {
    Object.entries(state.tasks).forEach(([d, tList]) => {
      if (Array.isArray(tList)) {
        tList.forEach(t => allTasks.push({ ...t, date: t.date || d }));
      }
    });
  } else {
    allTasks = state.remote_tasks && state.remote_tasks.length > 0
      ? state.remote_tasks
      : (state.daily_tasks || state.tasks || []);
  }

  let futureTasks = allTasks
    .filter(t => t.date && t.date > canonicalToday && t.date >= PROGRAM_START_DATE && !t.completed)
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  if (futureTasks.length < limit) {
    const existingDates = new Set(futureTasks.map(u => u.date));
    const startScanDate = canonicalToday < PROGRAM_START_DATE ? shiftDate(PROGRAM_START_DATE, -1) : canonicalToday;
    for (let i = 1; i <= 7 && futureTasks.length < limit; i++) {
      const nextDateStr = shiftDate(startScanDate, i);
      if (nextDateStr > canonicalToday && nextDateStr >= PROGRAM_START_DATE && !existingDates.has(nextDateStr)) {
        const nextDayData = getTodayData(nextDateStr);
        if (nextDayData.allTodayTasks && nextDayData.allTodayTasks.length) {
          const repTask = nextDayData.allTodayTasks.find(t => t.priority === 'High' && !t.completed) || nextDayData.allTodayTasks.find(t => !t.completed);
          if (repTask) {
            futureTasks.push(repTask);
            existingDates.add(nextDateStr);
          }
        }
      }
    }
  }

  return futureTasks.slice(0, limit).map(t => {
    let whenLabel = '';
    if (t.date === tomorrow) {
      whenLabel = 'Tomorrow';
    } else {
      whenLabel = formatShortDate(t.date);
    }
    return {
      id: t.id,
      title: t.title,
      category: t.category || 'LEARN',
      date: t.date,
      dayLabel: whenLabel,
      whenLabel,
      priority: t.priority || 'Normal',
      estimated_minutes: t.estimated_minutes || 45
    };
  });
}

/**
 * Compact Monthly Progress Summary (Req 7)
 * Calculates from actual tracked tasks and targets for categories in the plan.
 */
export function getMonthlyProgressSummary(monthId = null) {
  const canonicalToday = getCanonicalToday();
  const isProgramActive = canonicalToday >= PROGRAM_START_DATE;
  const currentMonthId = monthId || (isProgramActive ? canonicalToday.substring(0, 7) : '2026-10');
  const monthRaw = getMonthData(currentMonthId);

  const allTasks = (getState().remote_tasks || getState().daily_tasks || []);
  const monthTasks = allTasks.filter(t => t.date && t.date >= PROGRAM_START_DATE && t.date.startsWith(currentMonthId));
  const monthCompletedTasks = isProgramActive ? monthTasks.filter(t => t.completed).length : 0;

  const dsaTarget = monthRaw.targets?.dsaVideos || 12;
  const dsaActual = isProgramActive ? (monthRaw.actualDsaVideos || 0) : 0;
  const dsaPercent = dsaTarget > 0 ? Math.min(100, Math.round((dsaActual / dsaTarget) * 100)) : 0;

  const semesterTarget = monthRaw.targets?.semesterAnswers || 62;
  const semesterActual = isProgramActive ? (monthRaw.actualSemesterAnswers || 0) : 0;
  const semesterPercent = semesterTarget > 0 ? Math.min(100, Math.round((semesterActual / semesterTarget) * 100)) : 0;

  const primeTasks = monthTasks.filter(t => t.category === 'LEARN' && (t.subtype === 'PRIME_3' || (t.title && t.title.toLowerCase().includes('prime'))));
  const primePlanned = primeTasks.length || 20;
  const primeDone = isProgramActive ? primeTasks.filter(t => t.completed).length : 0;
  const primePercent = primePlanned > 0 ? Math.min(100, Math.round((primeDone / primePlanned) * 100)) : 0;

  const davinciTarget = Number(monthRaw.targets?.davinciVideos || 8);
  const davinciActual = isProgramActive ? (monthRaw.actualDavinciVideos || 0) : 0;
  const davinciPercent = davinciTarget > 0 ? Math.min(100, Math.round((davinciActual / davinciTarget) * 100)) : 0;

  const exerciseTargetDays = 24;
  const exerciseActualDays = isProgramActive ? (monthRaw.actualExerciseDays || 0) : 0;
  const exercisePercent = exerciseTargetDays > 0 ? Math.min(100, Math.round((exerciseActualDays / exerciseTargetDays) * 100)) : 0;

  const categories = [
    { name: 'DSA', percent: dsaPercent, actual: dsaActual, target: dsaTarget, unit: 'videos' },
    { name: 'Semester', percent: semesterPercent, actual: semesterActual, target: semesterTarget, unit: 'answers' },
    { name: 'Prime 3.0', percent: primePercent, actual: primeDone, target: primePlanned, unit: 'tasks' },
    { name: 'DaVinci Resolve', percent: davinciPercent, actual: davinciActual, target: davinciTarget, unit: 'videos' },
    { name: 'Exercise', percent: exercisePercent, actual: exerciseActualDays, target: exerciseTargetDays, unit: 'days' }
  ];

  const overallPercent = categories.length > 0
    ? Math.round(categories.reduce((acc, c) => acc + c.percent, 0) / categories.length)
    : 0;

  return {
    monthId: currentMonthId,
    monthTitle: monthRaw.title || formatMonthYear(currentMonthId),
    monthName: monthRaw.title || formatMonthYear(currentMonthId),
    overallPercent,
    tasksPlanned: monthTasks.length || 120,
    tasksCompleted: monthCompletedTasks,
    categories,
    isPreStart: !isProgramActive
  };
}

// -------------------------------------------------------------
// DASHBOARD DATA & FOCUS LOGGING (Sections 2–16, 26)
// -------------------------------------------------------------
export function getDashboardData(progressFilter = 'MONTHLY') {
  const state = getState();
  const canonicalToday = getCanonicalToday();
  const isProgramActive = canonicalToday >= PROGRAM_START_DATE;

  // Real local greeting based on device hour (Req 4)
  const currentHour = new Date().getHours();
  let greeting = 'Good evening';
  if (currentHour >= 4 && currentHour < 12) greeting = 'Good morning';
  else if (currentHour >= 12 && currentHour < 17) greeting = 'Good afternoon';

  // Program Day (Req 26.E): Day X of 273 (starts 2026-10-01)
  let programDayText = null;
  if (isProgramActive) {
    const start = new Date(PROGRAM_START_DATE + 'T00:00:00');
    const now = new Date(canonicalToday + 'T00:00:00');
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
    programDayText = `Day ${diffDays} of 273`;
  }

  // Active date: on/after Oct 1 is canonicalToday, before Oct 1 preview is PROGRAM_START_DATE
  const activeDate = isProgramActive ? canonicalToday : PROGRAM_START_DATE;
  const todayRaw = getTodayData(activeDate);

  // 1. Today Overview Stats
  const todayTasksList = todayRaw.allTodayTasks || [];
  const tasksTotal = todayTasksList.length;
  const tasksCompleted = isProgramActive ? todayTasksList.filter(t => t.completed).length : 0;
  const completionRate = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;
  const studyHoursFormatted = isProgramActive ? (todayRaw.studyHoursFormatted || '0h 0m') : '0h 0m';

  // Today Focus time
  const focusSessions = state.focus_sessions || [];
  const todayFocusMinutes = isProgramActive
    ? focusSessions.filter(s => s.date === canonicalToday).reduce((acc, s) => acc + (s.duration_minutes || Math.round((s.duration_seconds || 0) / 60) || 0), 0)
    : 0;
  const todayFocusH = Math.floor(todayFocusMinutes / 60);
  const todayFocusM = todayFocusMinutes % 60;
  const focusFormatted = `${todayFocusH}h ${todayFocusM}m`;

  // 2. Today's Category Progress
  const categoryDefs = [
    { name: 'Prime 3.0', filter: t => (t.category === 'LEARN' && (t.subtype === 'PRIME_3' || (t.title && t.title.toLowerCase().includes('prime')))) && !isLegacyCTask(t) },
    { name: 'DSA (C++)', filter: t => (t.category === 'PRACTICE' || t.subtype === 'DSA' || (t.title && t.title.toLowerCase().includes('dsa'))) && !isLegacyCTask(t) },
    { name: 'Semester', filter: t => (t.category === 'SEMESTER' || (t.title && t.title.toLowerCase().includes('answer'))) && !isLegacyCTask(t) },
    { name: 'Java (Playlist Track)', filter: t => (t.category === 'LEARN' && (t.subtype === 'INDIVIDUAL' || t.is_java_task || (t.title && t.title.toLowerCase().includes('java')))) && !isLegacyCTask(t) },
    { name: 'Java (Independent)', filter: t => (t.category === 'LEARN' && (t.subtype === 'INDIVIDUAL' || t.is_java_task || (t.title && t.title.toLowerCase().includes('java')))) && !isLegacyCTask(t) },
    { name: 'DaVinci Resolve', filter: t => (t.category === 'DAVINCI' || t.subtype === 'DAVINCI_PLAYLIST' || (t.title && t.title.toLowerCase().includes('davinci'))) && !isLegacyCTask(t) },
    { name: 'Projects', filter: t => (t.category === 'BUILD' || t.subtype === 'PROJECT' || (t.title && t.title.toLowerCase().includes('project'))) && !isLegacyCTask(t) },
    { name: 'Exercise', filter: t => (t.category === 'HEALTH' || t.subtype === 'EXERCISE' || (t.title && t.title.toLowerCase().includes('exercise'))) && !isLegacyCTask(t) }
  ];

  const todayCategories = categoryDefs.map(def => {
    const matching = todayTasksList.filter(def.filter);
    const count = matching.length;
    const done = isProgramActive ? matching.filter(t => t.completed).length : 0;
    const percent = count > 0 ? Math.round((done / count) * 100) : 0;
    return {
      name: def.name,
      total: count,
      completed: done,
      percent,
      isDone: count > 0 && done === count
    };
  }).filter(c => c.total > 0 || ['Prime 3.0', 'DSA (C++)', 'Semester', 'Java (Independent)', 'Projects', 'Exercise'].includes(c.name));

  // 3. This Week Stats
  const weekRaw = getWeekData(activeDate);
  const weekSessions = isProgramActive
    ? (state.remote_study_sessions || state.study_sessions || []).filter(s => s.date >= weekRaw.startDate && s.date <= weekRaw.endDate && s.date >= PROGRAM_START_DATE)
    : [];
  const weekStudyMinutes = isProgramActive
    ? weekSessions.reduce((acc, s) => acc + (s.duration_minutes || s.durationMinutes || 0), 0)
    : 0;
  const weekStudyH = Math.floor(weekStudyMinutes / 60);
  const weekStudyM = weekStudyMinutes % 60;

  const weekFocusMinutes = isProgramActive
    ? focusSessions.filter(s => s.date >= weekRaw.startDate && s.date <= weekRaw.endDate && s.date >= PROGRAM_START_DATE).reduce((acc, s) => acc + (s.duration_minutes || Math.round((s.duration_seconds || 0) / 60) || 0), 0)
    : 0;
  const weekFocusH = Math.floor(weekFocusMinutes / 60);
  const weekFocusM = weekFocusMinutes % 60;

  const activeDaysSet = new Set();
  if (isProgramActive) {
    weekSessions.forEach(s => { if (s.duration_minutes > 0) activeDaysSet.add(s.date); });
    (state.remote_tasks || state.daily_tasks || []).forEach(t => {
      if (t.completed && t.date >= weekRaw.startDate && t.date <= weekRaw.endDate) {
        activeDaysSet.add(t.date);
      }
    });
  }

  const exerciseDaysCount = isProgramActive
    ? (state.remote_tasks || state.daily_tasks || []).filter(t =>
        (t.category === 'HEALTH' || t.subtype === 'EXERCISE' || (t.title && t.title.toLowerCase().includes('exercise'))) &&
        t.completed && t.date >= weekRaw.startDate && t.date <= weekRaw.endDate
      ).length
    : 0;

  const allTasksStored = (state.remote_tasks || state.daily_tasks || []);
  const weekTasksTotal = allTasksStored.filter(t => t.date >= weekRaw.startDate && t.date <= weekRaw.endDate && t.date >= PROGRAM_START_DATE).length || 24;

  const thisWeekStats = {
    weekId: weekRaw.weekId,
    weekRangeLabel: weekRaw.rangeLabel,
    tasksTotal: weekTasksTotal,
    tasksCompleted: isProgramActive ? (weekRaw.completedTasksCount || 0) : 0,
    studyFormatted: `${weekStudyH}h ${weekStudyM}m`,
    studyTargetHours: weekRaw.targets?.studyHours || 32,
    focusFormatted: `${weekFocusH}h ${weekFocusM}m`,
    dsaVideos: isProgramActive ? (weekRaw.actualDSACompleted || 0) : 0,
    dsaProblems: isProgramActive ? (weekRaw.actualDSAProblems || 0) : 0,
    semesterAnswers: isProgramActive ? (weekRaw.actualSemesterCompleted || 0) : 0,
    davinciVideos: isProgramActive ? (weekRaw.actualDavinciCompleted || 0) : 0,
    exerciseDays: `${exerciseDaysCount} / 7 days`,
    activeDays: `${activeDaysSet.size} / 7 days active`
  };

  // 4. This Month Stats
  const currentMonthId = isProgramActive ? canonicalToday.substring(0, 7) : '2026-10';
  const monthRaw = getMonthData(currentMonthId);
  const monthTasks = allTasksStored.filter(t => t.date && t.date >= PROGRAM_START_DATE && t.date.startsWith(currentMonthId));
  const monthCompletedTasks = isProgramActive ? monthTasks.filter(t => t.completed).length : 0;
  const monthFocusMinutes = isProgramActive
    ? focusSessions.filter(s => s.date && s.date >= PROGRAM_START_DATE && s.date.startsWith(currentMonthId)).reduce((acc, s) => acc + (s.duration_minutes || Math.round((s.duration_seconds || 0) / 60) || 0), 0)
    : 0;
  const monthFocusH = Math.floor(monthFocusMinutes / 60);

  const thisMonthStats = {
    monthId: currentMonthId,
    monthTitle: monthRaw.monthTitle || monthRaw.title || 'October 2026',
    tasksPlanned: monthTasks.length || 120,
    tasksCompleted: monthCompletedTasks,
    studyHoursActual: isProgramActive ? monthRaw.actualStudyHours : 0,
    studyHoursTarget: monthRaw.targets?.studyHours || 128,
    focusFormatted: `${monthFocusH}h`,
    dsaVideos: isProgramActive ? monthRaw.actualDsaVideos : 0,
    dsaVideosTarget: monthRaw.targets?.dsaVideos || 12,
    dsaProblems: isProgramActive ? monthRaw.actualDsaProblems : 0,
    dsaProblemsTarget: monthRaw.targets?.dsaProblems || 40,
    semesterAnswers: isProgramActive ? monthRaw.actualSemesterAnswers : 0,
    semesterTarget: monthRaw.targets?.semesterAnswers || 56,
    davinciVideos: isProgramActive ? (monthRaw.actualDavinciVideos || 0) : 0,
    davinciTarget: 8,
    javaVideos: isProgramActive ? (monthRaw.actualJavaVideos || 0) : 0,
    javaVideosTarget: monthRaw.targets?.javaVideos || 5,
    exerciseDays: isProgramActive ? (monthRaw.actualExerciseDays || 0) : 0,
    overallPercent: isProgramActive && monthTasks.length > 0 ? Math.round((monthCompletedTasks / monthTasks.length) * 100) : 0
  };

  // 5. Today's Focus (Top 3 tasks)
  const sortedTodayTasks = [...todayTasksList].sort((a, b) => {
    if (a.priority === 'High' && b.priority !== 'High') return -1;
    if (b.priority === 'High' && a.priority !== 'High') return 1;
    return 0;
  });
  const todayFocusTasks = sortedTodayTasks.slice(0, 3).map((t, idx) => ({
    number: idx + 1,
    id: t.id,
    title: t.title,
    category: t.category,
    priority: t.priority || 'Normal',
    estimatedMinutes: t.estimated_minutes || 45,
    completed: isProgramActive ? !!t.completed : false
  }));

  // 6. Upcoming Tasks (Next 3-5 important planned tasks)
  let upcoming = allTasksStored
    .filter(t => t.date && t.date > activeDate && t.date >= PROGRAM_START_DATE)
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  // If fewer than 5 future tasks exist in store, look ahead at next dates
  if (upcoming.length < 5) {
    const existingDates = new Set(upcoming.map(u => u.date));
    for (let i = 1; i <= 6 && upcoming.length < 5; i++) {
      const nextD = new Date(parseDate(activeDate));
      nextD.setDate(nextD.getDate() + i);
      const nextDateStr = nextD.toISOString().split('T')[0];
      if (!existingDates.has(nextDateStr) && nextDateStr >= PROGRAM_START_DATE) {
        const nextDayData = getTodayData(nextDateStr);
        if (nextDayData.allTodayTasks && nextDayData.allTodayTasks.length) {
          const repTask = nextDayData.allTodayTasks.find(t => t.priority === 'High') || nextDayData.allTodayTasks[0];
          upcoming.push(repTask);
          existingDates.add(nextDateStr);
        }
      }
    }
  }

  const upcomingTasks = upcoming.slice(0, 5).map(t => ({
    id: t.id,
    date: t.date,
    title: t.title,
    category: t.category,
    priority: t.priority || 'Normal'
  }));

  // 7. Full Preserved Progress Data
  const progressData = getProgressData(progressFilter);

  // 8. New Productivity Features (Req 1, 3, 4, 5, 7)
  const studyStreak = calculateStudyStreak(state, canonicalToday);
  const weeklyConsistency = getWeeklyConsistency(canonicalToday);
  const needsReviewTasks = getNeedsReviewTasks(canonicalToday);
  const nextUpTasks = getNextUpTasks(canonicalToday, 5);
  const monthlyProgressSummary = getMonthlyProgressSummary(isProgramActive ? canonicalToday.substring(0, 7) : '2026-10');

  const javaProgress = isProgramActive
    ? getJavaProgressSummary(state.java_progress || [])
    : {
        totalVideos: 39,
        completedVideos: 0,
        percentage: 0,
        currentTask: 'Video/Lesson 1: Introduction to Java Language | Lecture 1',
        upcomingTask: 'Video/Lesson 2: Variables in Java | Input Output | Lecture 2',
        playlistUrl: JAVA_PLAYLIST_URL,
        videos: JAVA_PLAYLIST_VIDEOS.map(v => ({ ...v, completed: false }))
      };

  return {
    canonicalToday,
    isProgramActive,
    greeting,
    javaProgress,
    programDayText,
    todayStats: {
      date: activeDate,
      dayName: todayRaw.dayName || 'Thursday',
      isPreStart: !isProgramActive,
      tasksTotal,
      tasksCompleted,
      studyHoursFormatted,
      focusFormatted,
      completionRate,
      categories: todayCategories
    },
    thisWeekStats,
    thisMonthStats,
    todayFocusTasks,
    upcomingTasks,
    progressData,
    studyStreak,
    weeklyConsistency,
    needsReviewTasks,
    nextUpTasks,
    monthlyProgressSummary
  };
}

export async function logFocusSession(sessionData) {
  const canonicalToday = getCanonicalToday();
  const isProgramActive = canonicalToday >= PROGRAM_START_DATE;
  const durationSec = Math.max(1, parseInt(sessionData.durationSeconds || (sessionData.durationMinutes ? sessionData.durationMinutes * 60 : 60), 10));
  const durationMin = Math.max(1, Math.round(durationSec / 60));

  const newSession = {
    id: sessionData.id || `focus-${Date.now()}`,
    date: canonicalToday,
    category: sessionData.category || 'DSA',
    duration_minutes: durationMin,
    duration_seconds: durationSec,
    start_time: sessionData.startTime || new Date(Date.now() - durationSec * 1000).toISOString(),
    end_time: sessionData.endTime || new Date().toISOString(),
    notes: sessionData.notes || '',
    created_at: new Date().toISOString()
  };

  updateState(curr => ({
    ...curr,
    focus_sessions: [newSession, ...(curr.focus_sessions || [])]
  }));

  // Focus time does not count as task completion (Req 8)
  return newSession;
}

export async function toggleJavaVideo(videoNumber, isCompleted, updateTaskBool = true) {
  const canonicalToday = getCanonicalToday();
  if (canonicalToday < PROGRAM_START_DATE) {
    console.warn(`[Career Tracker] Tasks before ${PROGRAM_START_DATE} cannot be completed.`);
    return false;
  }

  const v = JAVA_PLAYLIST_VIDEOS.find(x => x.video_number === videoNumber) || { video_number: videoNumber, title: `Video ${videoNumber}`, duration_minutes: 45 };

  const currentState = getState();
  const existingProg = currentState.java_progress || [];
  const currentItem = existingProg.find(e => e.video_number === videoNumber);
  const targetCompleted = (isCompleted !== undefined) ? !!isCompleted : !(currentItem && currentItem.completed);

  // Update java_progress in state
  updateState(curr => {
    const existing = curr.java_progress || [];
    const updated = JAVA_PLAYLIST_VIDEOS.map(vid => {
      const current = existing.find(e => e.video_number === vid.video_number);
      if (vid.video_number === videoNumber) {
        return {
          id: `java-vid-${vid.video_number}`,
          video_number: vid.video_number,
          title: vid.title,
          duration_minutes: vid.duration_minutes,
          completed: targetCompleted,
          completed_at: targetCompleted ? new Date().toISOString() : null
        };
      }
      return current || {
        id: `java-vid-${vid.video_number}`,
        video_number: vid.video_number,
        title: vid.title,
        duration_minutes: vid.duration_minutes,
        completed: false,
        completed_at: null
      };
    });
    return { ...curr, java_progress: updated };
  });

  if (updateTaskBool) {
    const state = getState();
    const allTasks = state.remote_tasks && state.remote_tasks.length > 0 ? state.remote_tasks : (state.daily_tasks || []);
    let targetTask = allTasks.find(t => (t.is_java_task || (t.title && t.title.toLowerCase().includes('java'))) && (t.video_number === videoNumber || t.title.includes(`Video/Lesson ${videoNumber}`) || t.title.includes(`Lecture ${videoNumber}`) || t.title.includes(`Video ${videoNumber}`)));

    if (!targetTask) {
      const todayStr = getCanonicalToday();
      const { weekId, monthId } = getWeekAndMonthForDate(todayStr);
      targetTask = {
        id: `task-java-v${videoNumber}`,
        date: todayStr,
        week_id: weekId,
        month_id: monthId,
        category: 'LEARN',
        subtype: 'INDIVIDUAL',
        is_java_task: true,
        is_java_playlist: true,
        video_number: videoNumber,
        title: `Java — Video/Lesson ${v.video_number}: ${v.title}`,
        description: `Apna College Java Playlist Lecture ${v.video_number} (${v.duration_text || v.duration_minutes + 'm'})`,
        estimated_minutes: v.duration_minutes || 45,
        completed: targetCompleted,
        completed_at: targetCompleted ? new Date().toISOString() : null,
        priority: 'Normal',
        notes: `Playlist: ${JAVA_PLAYLIST_URL}`,
        created_at: new Date().toISOString()
      };
      updateState(curr => {
        const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
          ? curr.remote_tasks
          : (curr.daily_tasks || curr.tasks || []);
        const list = [...base, targetTask];
        return { ...curr, remote_tasks: list, daily_tasks: list };
      });
      try {
        await SupabaseClient.insertTask(targetTask);
      } catch (e) {
        console.warn('Failed to insert Java task into Supabase:', e);
      }
    } else {
      await toggleTaskCompletion(targetTask.id, targetCompleted);
    }
  }

  return true;
}

export async function toggleDavinciVideo(videoNumber, isCompleted) {
  const state = getState();
  const allTasks = state.remote_tasks && state.remote_tasks.length > 0 ? state.remote_tasks : (state.daily_tasks || []);
  let targetTask = allTasks.find(t => (t.category === 'DAVINCI' || t.subtype === 'DAVINCI_PLAYLIST') && t.title.includes(`Video ${videoNumber}`));

  if (!targetTask) {
    const v = DAVINCI_PLAYLIST_VIDEOS.find(x => x.video_number === videoNumber) || { video_number: videoNumber, title: `Video ${videoNumber}`, duration_minutes: 45 };
    const todayStr = getCanonicalToday();
    const { weekId, monthId } = getWeekAndMonthForDate(todayStr);
    targetTask = {
      id: `task-davinci-v${videoNumber}`,
      date: todayStr,
      week_id: weekId,
      month_id: monthId,
      category: 'DAVINCI',
      subtype: 'DAVINCI_PLAYLIST',
      title: `DaVinci Resolve: Video ${v.video_number} — ${v.title}`,
      estimated_minutes: v.duration_minutes || 45,
      completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      priority: 'Normal',
      notes: `Playlist: ${DAVINCI_PLAYLIST_URL}`,
      created_at: new Date().toISOString()
    };
    updateState(curr => {
      const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
        ? curr.remote_tasks
        : (curr.daily_tasks || curr.tasks || []);
      const list = [...base, targetTask];
      return { ...curr, remote_tasks: list, daily_tasks: list };
    });
    try {
      await SupabaseClient.insertTask(targetTask);
    } catch (e) {
      console.warn('Failed to insert DaVinci task into Supabase:', e);
    }
  } else {
    await toggleTaskCompletion(targetTask.id, isCompleted);
  }
}

// -------------------------------------------------------------
// MUTATIONS & SUPABASE LIVE PERSISTENCE
// -------------------------------------------------------------
export async function editPlannedTask(taskId, newTitle, newNotes = '', newMinutes = null) {
  if (!taskId || !newTitle) return;
  const updates = { title: newTitle.trim() };
  if (newNotes !== undefined && newNotes !== null) updates.notes = newNotes;
  if (newMinutes !== null && !isNaN(newMinutes)) updates.estimated_minutes = parseInt(newMinutes);

  updateState(curr => {
    const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
      ? curr.remote_tasks
      : (curr.daily_tasks || curr.tasks || []);
    const updated = base.map(t => {
      if (t.id === taskId) {
        return { ...t, ...updates };
      }
      return t;
    });
    return {
      ...curr,
      remote_tasks: updated,
      daily_tasks: updated
    };
  });

  try {
    await SupabaseClient.updateTask(taskId, updates);
  } catch (err) {
    console.warn('[Career Tracker] Could not sync task edit to Supabase:', err);
  }
}

export async function toggleTaskCompletion(taskId, isCompleted) {
  const state = getState();
  const allTasks = state.remote_tasks && state.remote_tasks.length > 0 ? state.remote_tasks : (state.daily_tasks || []);
  const existing = allTasks.find(t => t.id === taskId);
  const canonicalToday = getCanonicalToday();

  if (!existing) {
    console.warn(`[Career Tracker] Task ${taskId} not found.`);
    return false;
  }

  // Program start date guard (Req 1, 2, 7)
  if (canonicalToday < PROGRAM_START_DATE) {
    console.warn(`[Career Tracker] Program officially starts on ${PROGRAM_START_DATE}. Tasks cannot be marked completed before start date.`);
    return false;
  }

  // Guard: Tasks before PROGRAM_START_DATE are not actionable (Req 1)
  if (existing && existing.date && existing.date < PROGRAM_START_DATE) {
    console.warn(`[Career Tracker] Tasks before ${PROGRAM_START_DATE} cannot be completed.`);
    return false;
  }

  // Date-based permission logic (Section 6, 7, 8, 9)
  const isPrimePart = existing && (
    existing.is_prime_part ||
    existing.subtype === 'PRIME_3' ||
    (existing.title && existing.title.toLowerCase().includes('prime 3.0 — part'))
  );

  if (isPrimePart) {
    const releaseDate = existing.release_date || existing.date;
    if (canonicalToday < releaseDate) {
      console.warn(`[Career Tracker] Prime 3.0 Part released on ${releaseDate} cannot be completed before its release date.`);
      return false;
    }
  } else {
    // Normal tasks: only tasks whose scheduled date matches actual system date are actionable
    if (existing && existing.date && (existing.date > canonicalToday || existing.date < canonicalToday)) {
      console.warn(`[Career Tracker] Task on ${existing.date} is review-only. Only tasks on today's actual date (${canonicalToday}) are actionable.`);
      return false;
    }
  }

  let targetTask = null;

  // Update local state immediately
  updateState(curr => {
    const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
      ? curr.remote_tasks
      : (curr.daily_tasks || curr.tasks || []);
    const list = base.map(t => {
      if (t.id === taskId) {
        targetTask = {
          ...t,
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          completion_date: isCompleted ? canonicalToday : null,
          status: isCompleted ? 'COMPLETED' : 'PLANNED',
          skipped: false,
          sync_pending: false
        };
        return targetTask;
      }
      return t;
    });
    return { ...curr, remote_tasks: list, daily_tasks: list };
  });

  // If this task represents a DSA playlist video, also update remote_dsa!
  if (targetTask && targetTask.category === 'PRACTICE') {
    const match = targetTask.title.match(/(?:Video|Lecture)\s+(\d+)/i);
    if (match) {
      const vidNum = parseInt(match[1]);
      await toggleDSAVideo(vidNum, isCompleted, false);
    }
  }

  // If this task represents a Java playlist video, also update java_progress!
  if (targetTask && (targetTask.is_java_task || (targetTask.title && targetTask.title.toLowerCase().includes('java')))) {
    const match = targetTask.title.match(/(?:Video\/Lesson|Video|Lecture)\s+(\d+)/i);
    const vidNum = targetTask.video_number || (match ? parseInt(match[1]) : null);
    if (vidNum) {
      await toggleJavaVideo(vidNum, isCompleted, false);
    }
  }

  // Sync to Supabase in background
  try {
    const res = await SupabaseClient.updateTask(taskId, {
      completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      skipped: false
    });
    if (Array.isArray(res) && res.length === 0 && targetTask) {
      // Task was not in Supabase yet; insert it so it syncs cross-platform
      const cat = (targetTask.category === 'HEALTH') ? 'REVISE' : (targetTask.category || 'LEARN');
      await SupabaseClient.insertTask({
        id: targetTask.id,
        date: targetTask.date,
        week_id: targetTask.week_id,
        month_id: targetTask.month_id,
        title: targetTask.title,
        category: cat,
        subtype: targetTask.subtype || 'GENERAL',
        completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        estimated_minutes: targetTask.estimated_minutes || 30,
        priority: targetTask.priority || 'Normal',
        notes: targetTask.notes || '',
        skipped: false,
        created_at: targetTask.created_at || new Date().toISOString()
      });
    } else if (res === null) {
      // Mark sync_pending on network failure (Req 17)
      updateState(curr => {
        const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
          ? curr.remote_tasks
          : (curr.daily_tasks || curr.tasks || []);
        const list = base.map(t => {
          if (t.id === taskId) return { ...t, sync_pending: true };
          return t;
        });
        return { ...curr, remote_tasks: list, daily_tasks: list };
      });
    }
  } catch (err) {
    console.warn('Failed to sync task toggle to Supabase:', err);
    updateState(curr => {
      const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
        ? curr.remote_tasks
        : (curr.daily_tasks || curr.tasks || []);
      const list = base.map(t => {
        if (t.id === taskId) return { ...t, sync_pending: true };
        return t;
      });
      return { ...curr, remote_tasks: list, daily_tasks: list };
    });
  }
  return true;
}

export async function createNewTask(taskData) {
  const canonicalToday = getCanonicalToday();
  const dateStr = taskData.date || (canonicalToday < PROGRAM_START_DATE ? PROGRAM_START_DATE : canonicalToday);
  const { weekId, monthId } = getWeekAndMonthForDate(dateStr);
  const isActionableDate = canonicalToday >= PROGRAM_START_DATE && dateStr === canonicalToday;

  const newTask = {
    id: taskData.id || `task-${Date.now()}`,
    date: dateStr,
    week_id: taskData.week_id || taskData.weekId || weekId,
    month_id: taskData.month_id || taskData.monthId || monthId,
    title: taskData.title,
    category: (taskData.category || 'LEARN').toUpperCase(),
    subtype: taskData.subtype || 'GENERAL',
    completed: isActionableDate ? !!taskData.completed : false,
    completed_at: (isActionableDate && taskData.completed) ? (taskData.completed_at || new Date().toISOString()) : null,
    estimated_minutes: parseInt(taskData.estimatedMinutes || taskData.estimated_minutes || 45),
    priority: taskData.priority || 'Normal',
    notes: taskData.notes || '',
    project_name: taskData.projectName || taskData.project_name || '',
    created_at: new Date().toISOString()
  };

  // Immediate local update
  updateState(curr => {
    const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
      ? curr.remote_tasks
      : (curr.daily_tasks || curr.tasks || []);
    const list = [...base, newTask];
    return { ...curr, remote_tasks: list, daily_tasks: list };
  });

  // Supabase sync
  try {
    const res = await SupabaseClient.insertTask(newTask);
    if (res && res.length) {
      newTask.id = res[0].id;
    }
  } catch (err) {
    console.warn('Failed to insert task into Supabase:', err);
  }

  return newTask;
}

export async function rescheduleTask(taskId, newDate) {
  if (newDate < PROGRAM_START_DATE) {
    console.warn(`[Career Tracker] Cannot reschedule task before program start date (${PROGRAM_START_DATE}).`);
    return;
  }
  const { weekId, monthId } = getWeekAndMonthForDate(newDate);

  updateState(curr => {
    const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
      ? curr.remote_tasks
      : (curr.daily_tasks || curr.tasks || []);
    const list = base.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          date: newDate,
          week_id: weekId,
          month_id: monthId,
          rescheduled_from: t.date
        };
      }
      return t;
    });
    return { ...curr, remote_tasks: list, daily_tasks: list };
  });

  try {
    await SupabaseClient.updateTask(taskId, {
      date: newDate,
      week_id: weekId,
      month_id: monthId
    });
  } catch (err) {
    console.warn('Failed to reschedule task in Supabase:', err);
  }
}

export async function logNewStudySession(sessionData) {
  const dateStr = sessionData.date || getCanonicalToday();
  const canonicalToday = getCanonicalToday();
  if (dateStr < PROGRAM_START_DATE) {
    console.warn(`[Career Tracker] Cannot log study time before program start date (${PROGRAM_START_DATE}).`);
    return null;
  }
  if (dateStr > canonicalToday) {
    console.warn(`[Career Tracker] Cannot log study time for future date ${dateStr}.`);
    return null;
  }
  const { weekId, monthId } = getWeekAndMonthForDate(dateStr);

  const session = {
    id: sessionData.id || `sess-${Date.now()}`,
    date: dateStr,
    week_id: sessionData.week_id || sessionData.weekId || weekId,
    month_id: sessionData.month_id || sessionData.monthId || monthId,
    duration_minutes: parseInt(sessionData.durationMinutes || sessionData.duration_minutes || 60),
    category: (sessionData.category || 'LEARN').toUpperCase(),
    task_id: sessionData.taskId || sessionData.task_id || null,
    notes: sessionData.notes || '',
    created_at: new Date().toISOString()
  };

  updateState(curr => {
    const list = [...(curr.remote_study_sessions || curr.study_sessions || []), session];
    return { ...curr, remote_study_sessions: list, study_sessions: list };
  });

  try {
    await SupabaseClient.insertStudySession(session);
  } catch (err) {
    console.warn('Failed to log study session to Supabase:', err);
  }

  return session;
}

export async function toggleGoalCompletion(goalId, isCompleted) {
  const canonicalToday = getCanonicalToday();
  if (isCompleted && canonicalToday < PROGRAM_START_DATE) {
    console.warn(`[Career Tracker] Cannot complete goals before program start date (${PROGRAM_START_DATE}).`);
    return false;
  }

  updateState(curr => {
    const list = (curr.remote_goals || curr.goals || []).map(g => {
      if (g.id === goalId) {
        return { ...g, completed: isCompleted };
      }
      return g;
    });
    return { ...curr, remote_goals: list, goals: list };
  });

  try {
    await SupabaseClient.updateGoal(goalId, { completed: isCompleted });
  } catch (err) {
    console.warn('Failed to update goal in Supabase:', err);
  }
}

export async function createNewGoal(goalData) {
  const goal = {
    id: `goal-${Date.now()}`,
    type: goalData.type || 'WEEKLY',
    month_id: goalData.monthId || null,
    week_id: goalData.weekId || null,
    title: goalData.title,
    completed: false,
    created_at: new Date().toISOString()
  };

  updateState(curr => {
    const list = [...(curr.remote_goals || curr.goals || []), goal];
    return { ...curr, remote_goals: list, goals: list };
  });

  try {
    await SupabaseClient.insertGoal(goal);
  } catch (err) {
    console.warn('Failed to create goal in Supabase:', err);
  }

  return goal;
}

export async function toggleSemesterAnswer(answerId, field, value) {
  const state = getState();
  const allSemester = state.remote_semester && state.remote_semester.length > 0 ? state.remote_semester : (state.semester_answers || []);
  const existing = allSemester.find(a => a.id === answerId);
  const canonicalToday = getCanonicalToday();

  // Date-based permission logic (Section 6, 7, 8, 9)
  // Only semester answers whose date matches today's actual date are actionable for completion
  if (field === 'completed') {
    if (canonicalToday < PROGRAM_START_DATE || (existing && existing.date && existing.date < PROGRAM_START_DATE)) {
      console.warn(`[Career Tracker] Semester answer cannot be completed before program start date (${PROGRAM_START_DATE}).`);
      return false;
    }
    if (existing && existing.date && (existing.date > canonicalToday || existing.date < canonicalToday)) {
      console.warn(`[Career Tracker] Semester answer on ${existing.date} is review-only. Actionable only on today (${canonicalToday}).`);
      return false;
    }
  }

  updateState(curr => {
    const list = (curr.remote_semester || curr.semester_answers || []).map(a => {
      if (a.id === answerId) {
        return { ...a, [field]: value };
      }
      return a;
    });
    return { ...curr, remote_semester: list, semester_answers: list };
  });

  try {
    await SupabaseClient.updateSemesterAnswer(answerId, { [field]: value });
  } catch (err) {
    console.warn('Failed to update semester answer in Supabase:', err);
  }
}

export async function updateSemesterAnswerData(answerId, updates) {
  updateState(curr => {
    const list = (curr.remote_semester || curr.semester_answers || []).map(a => {
      if (a.id === answerId) {
        return { ...a, ...updates };
      }
      return a;
    });
    return { ...curr, remote_semester: list, semester_answers: list };
  });

  try {
    await SupabaseClient.updateSemesterAnswer(answerId, updates);
  } catch (err) {
    console.warn('Failed to update semester answer in Supabase:', err);
  }
}

export async function createSemesterAnswer(data) {
  const dateStr = data.date || getCanonicalToday();
  const { weekId, monthId } = getWeekAndMonthForDate(dateStr);

  const answer = {
    id: data.id || `sem-${Date.now()}`,
    date: dateStr,
    week_id: data.week_id || data.weekId || weekId,
    month_id: data.month_id || data.monthId || monthId,
    subject: data.subject || 'Operating Systems',
    unit: data.unit || 'Unit 1',
    question: data.question || '',
    is_optional: !!data.isOptional || !!data.is_optional,
    completed: data.completed !== undefined ? !!data.completed : true,
    revised: !!data.revised,
    created_at: new Date().toISOString()
  };

  updateState(curr => {
    const list = [...(curr.remote_semester || curr.semester_answers || []), answer];
    return { ...curr, remote_semester: list, semester_answers: list };
  });

  try {
    await SupabaseClient.insertSemesterAnswer(answer);
  } catch (err) {
    console.warn('Failed to insert semester answer into Supabase:', err);
  }

  return answer;
}

export async function toggleDSAVideo(videoId, isCompleted, syncTask = true) {
  const canonicalToday = getCanonicalToday();
  if (isCompleted && canonicalToday < PROGRAM_START_DATE) {
    console.warn(`[Career Tracker] Cannot mark DSA video complete before program start date (${PROGRAM_START_DATE}).`);
    return false;
  }
  const vidNum = typeof videoId === 'number' ? videoId : parseInt(String(videoId).replace(/\D/g, ''));

  updateState(curr => {
    const list = (curr.remote_dsa || []).map(v => {
      if (v.id === videoId || v.video_number === vidNum) {
        return { ...v, completed: isCompleted, completion_date: isCompleted ? getCanonicalToday() : null };
      }
      return v;
    });

    // Also sync the matching task in remote_tasks if syncTask is true
    let updatedTasks = curr.remote_tasks;
    if (syncTask && curr.remote_tasks) {
      updatedTasks = curr.remote_tasks.map(t => {
        if (t.category === 'PRACTICE' && (t.title.includes(`Video ${vidNum}`) || t.title.includes(`Lecture ${vidNum}`))) {
          return { ...t, completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null };
        }
        return t;
      });
    }

    return {
      ...curr,
      remote_dsa: list,
      ...(updatedTasks ? { remote_tasks: updatedTasks, daily_tasks: updatedTasks } : {})
    };
  });

  try {
    await SupabaseClient.updateDSAProgress(videoId, {
      completed: isCompleted,
      completion_date: isCompleted ? getCanonicalToday() : null
    });
  } catch (err) {
    console.warn('Failed to update DSA video in Supabase:', err);
  }
}

export async function logGamingHours(date, hours) {
  const dateStr = date || getCanonicalToday();
  if (dateStr < PROGRAM_START_DATE) {
    console.warn(`[Career Tracker] Cannot log gaming before program start date (${PROGRAM_START_DATE}).`);
    return null;
  }

  const log = {
    id: `game-${Date.now()}`,
    date: dateStr,
    duration_hours: Number(hours),
    created_at: new Date().toISOString()
  };

  updateState(curr => {
    const existing = curr.remote_gaming || curr.gaming_logs || [];
    const list = [...existing, log];
    return { ...curr, remote_gaming: list, gaming_logs: list };
  });

  try {
    await SupabaseClient.insertGamingLog(log);
  } catch (err) {
    console.warn('Failed to log gaming in Supabase:', err);
  }

  return log;
}

export async function saveDailyReview(date, reviewData) {
  const activeDate = date || getCanonicalToday();
  const updatedReview = {
    id: `dr-${activeDate}`,
    date: activeDate,
    ...reviewData,
    updated_at: new Date().toISOString()
  };

  updateState(curr => ({
    ...curr,
    daily_reviews: {
      ...(curr.daily_reviews || {}),
      [activeDate]: updatedReview
    }
  }));

  try {
    await SupabaseClient.upsertDailyReview(updatedReview);
  } catch (err) {
    console.warn('Failed to save daily review to Supabase:', err);
  }

  return updatedReview;
}

export async function saveWeeklyReview(weekId, reviewData) {
  const updatedReview = {
    id: `wrev-${weekId}`,
    week_id: weekId,
    ...reviewData,
    updated_at: new Date().toISOString()
  };

  updateState(curr => ({
    ...curr,
    weekly_reviews: {
      ...(curr.weekly_reviews || {}),
      [weekId]: updatedReview
    }
  }));

  try {
    await SupabaseClient.upsertWeeklyReview(updatedReview);
  } catch (err) {
    console.warn('Failed to save weekly review to Supabase:', err);
  }

  return updatedReview;
}

export async function deleteWeeklyGoal(goalId) {
  return deleteMonthlyGoal(goalId);
}


export async function saveMonthlyReview(monthId, reviewData) {
  const updatedReview = {
    id: `rev-${monthId}`,
    month_id: monthId,
    ...reviewData,
    updated_at: new Date().toISOString()
  };

  updateState(curr => ({
    ...curr,
    monthly_reviews: {
      ...(curr.monthly_reviews || {}),
      [monthId]: updatedReview
    }
  }));

  try {
    await SupabaseClient.upsertMonthlyReview(updatedReview);
  } catch (err) {
    console.warn('Failed to save monthly review to Supabase:', err);
  }

  return updatedReview;
}

export async function updateMonthlyGoal(goalId, updates) {
  updateState(curr => {
    const list = (curr.remote_goals || curr.goals || []).map(g => {
      if (g.id === goalId) {
        return { ...g, ...updates };
      }
      return g;
    });
    return { ...curr, remote_goals: list, goals: list };
  });

  try {
    await SupabaseClient.updateGoal(goalId, updates);
  } catch (err) {
    console.warn('Failed to update goal in Supabase:', err);
  }
}

export async function deleteMonthlyGoal(goalId) {
  updateState(curr => {
    const list = (curr.remote_goals || curr.goals || []).filter(g => g.id !== goalId);
    return { ...curr, remote_goals: list, goals: list };
  });

  try {
    await SupabaseClient.deleteGoal(goalId);
  } catch (err) {
    console.warn('Failed to delete goal from Supabase:', err);
  }
}

export async function updateMonthTarget(monthId, updates) {
  updateState(curr => {
    const list = (curr.remote_months || []).map(m => {
      if (m.id === monthId) {
        return { ...m, ...updates };
      }
      return m;
    });
    return { ...curr, remote_months: list };
  });

  try {
    await SupabaseClient.updateMonth(monthId, updates);
  } catch (err) {
    console.warn('Failed to update month target in Supabase:', err);
  }
}

// -------------------------------------------------------------
// REFINEMENT FEATURES: SKIP, DO TODAY, MOVE TASKS, EXPORT
// -------------------------------------------------------------

export async function skipTask(taskId) {
  updateState(curr => {
    const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
      ? curr.remote_tasks
      : (curr.daily_tasks || curr.tasks || []);
    const list = base.map(t => {
      if (t.id === taskId) {
        return { ...t, skipped: true, skipped_at: new Date().toISOString(), completed: false };
      }
      return t;
    });
    return { ...curr, remote_tasks: list, daily_tasks: list };
  });

  try {
    const res = await SupabaseClient.updateTask(taskId, { skipped: true, completed: false });
    if (res === null) {
      updateState(curr => {
        const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
          ? curr.remote_tasks
          : (curr.daily_tasks || curr.tasks || []);
        const list = base.map(t => {
          if (t.id === taskId) return { ...t, sync_pending: true };
          return t;
        });
        return { ...curr, remote_tasks: list, daily_tasks: list };
      });
    }
  } catch (err) {
    console.warn('Failed to sync skipTask to Supabase:', err);
  }
}

export async function unskipTask(taskId) {
  updateState(curr => {
    const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
      ? curr.remote_tasks
      : (curr.daily_tasks || curr.tasks || []);
    const list = base.map(t => {
      if (t.id === taskId) {
        return { ...t, skipped: false, skipped_at: null };
      }
      return t;
    });
    return { ...curr, remote_tasks: list, daily_tasks: list };
  });

  try {
    await SupabaseClient.updateTask(taskId, { skipped: false });
  } catch (err) {
    console.warn('Failed to sync unskipTask to Supabase:', err);
  }
}

export async function doTodayTask(taskId, targetDate = null) {
  let destDate = targetDate || getCanonicalToday();
  if (destDate < PROGRAM_START_DATE) {
    destDate = PROGRAM_START_DATE;
  }
  const { weekId, monthId } = getWeekAndMonthForDate(destDate);

  updateState(curr => {
    const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
      ? curr.remote_tasks
      : (curr.daily_tasks || curr.tasks || []);
    const list = base.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          date: destDate,
          week_id: weekId,
          month_id: monthId,
          rescheduled_from: t.date,
          carried_forward: true,
          skipped: false
        };
      }
      return t;
    });
    return { ...curr, remote_tasks: list, daily_tasks: list };
  });

  try {
    const res = await SupabaseClient.updateTask(taskId, {
      date: destDate,
      week_id: weekId,
      month_id: monthId,
      skipped: false
    });
    if (res === null) {
      updateState(curr => {
        const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
          ? curr.remote_tasks
          : (curr.daily_tasks || curr.tasks || []);
        const list = base.map(t => {
          if (t.id === taskId) return { ...t, sync_pending: true };
          return t;
        });
        return { ...curr, remote_tasks: list, daily_tasks: list };
      });
    }
  } catch (err) {
    console.warn('Failed to sync doTodayTask to Supabase:', err);
  }
}

export async function moveTasksToNextWeek(taskIds, nextWeekId) {
  if (!taskIds || taskIds.length === 0 || !nextWeekId) return 0;
  const allWeeks = getAllPlanWeeks();
  const targetWeek = allWeeks.find(w => w.weekId === nextWeekId) || {
    weekId: nextWeekId,
    startDate: '2026-10-08',
    parentMonthId: '2026-10'
  };

  const destDate = targetWeek.startDate;
  const { weekId, monthId } = getWeekAndMonthForDate(destDate);

  updateState(curr => {
    const base = (curr.remote_tasks && curr.remote_tasks.length > 0)
      ? curr.remote_tasks
      : (curr.daily_tasks || curr.tasks || []);
    const list = base.map(t => {
      if (taskIds.includes(t.id)) {
        return {
          ...t,
          date: destDate,
          week_id: weekId,
          month_id: monthId,
          rescheduled_from: t.date,
          carried_over: true
        };
      }
      return t;
    });
    return { ...curr, remote_tasks: list, daily_tasks: list };
  });

  for (const tid of taskIds) {
    try {
      await SupabaseClient.updateTask(tid, {
        date: destDate,
        week_id: weekId,
        month_id: monthId
      });
    } catch (e) {
      console.warn(`Failed to move task ${tid} to next week in Supabase:`, e);
    }
  }

  return taskIds.length;
}

export async function carryMonthlyGoalsToNextMonth(goalIds, nextMonthId) {
  if (!goalIds || goalIds.length === 0 || !nextMonthId) return 0;
  const state = getState();
  const goals = state.remote_goals || state.goals || [];

  for (const gid of goalIds) {
    const existing = goals.find(g => g.id === gid);
    if (existing) {
      await createNewGoal({
        type: 'MONTHLY',
        monthId: nextMonthId,
        title: existing.title,
        category: existing.category || 'LEARN'
      });
    }
  }
  return goalIds.length;
}

export function exportTrackerDataJSON() {
  const state = getState();

  const allTasks = state.remote_tasks && state.remote_tasks.length > 0
    ? state.remote_tasks
    : (state.daily_tasks || state.tasks || []);

  const exerciseTasks = allTasks.filter(t =>
    t.category === 'HEALTH' || t.subtype === 'EXERCISE' || (t.title && t.title.toLowerCase().includes('exercise'))
  );

  const mappedDailyTasks = allTasks.map(t => ({
    id: t.id,
    date: t.date,
    week_id: t.week_id,
    month_id: t.month_id,
    category: t.category,
    subtype: t.subtype || '',
    title: t.title,
    completed: !!t.completed,
    completed_at: t.completed_at || null,
    skipped: !!t.skipped,
    estimated_minutes: t.estimated_minutes || 45,
    priority: t.priority || 'Normal',
    notes: t.notes || ''
  }));

  const mappedFocusSessions = (state.focus_sessions || []).map(f => ({
    id: f.id,
    date: f.date,
    category: f.category,
    duration_minutes: f.duration_minutes || Math.round((f.duration_seconds || 0) / 60) || 0,
    duration_seconds: f.duration_seconds || (f.duration_minutes ? f.duration_minutes * 60 : 0),
    notes: f.notes || '',
    created_at: f.created_at || null
  }));

  const exportPayload = {
    app: 'Akshay Career Tracker',
    version: '1.0.1',
    exported_at: new Date().toISOString(),
    metadata: {
      app: 'Akshay Career Tracker',
      version: '1.0.1',
      exportedAt: new Date().toISOString(),
      programStartDate: PROGRAM_START_DATE
    },
    user: {
      name: state.user?.name || 'Akshay',
      program_start_date: PROGRAM_START_DATE,
      timeZone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Kolkata'
    },
    monthly_plans: state.remote_months || [],
    monthlyPlans: state.remote_months || [],
    weekly_plans: state.remote_weeks || [],
    weeklyPlans: state.remote_weeks || [],
    daily_tasks: mappedDailyTasks,
    dailyTasks: mappedDailyTasks,
    study_sessions: (state.remote_study_sessions || state.study_sessions || []).map(s => ({
      id: s.id,
      date: s.date,
      duration_minutes: s.duration_minutes || s.durationMinutes || 0,
      track: s.track || s.category || '',
      topic: s.topic || '',
      notes: s.notes || ''
    })),
    focus_sessions: mappedFocusSessions,
    focusSessions: mappedFocusSessions,
    dsa_progress: (state.remote_dsa && state.remote_dsa.length > 0 ? state.remote_dsa : DEFAULT_DSA_PLAYLIST).map(d => ({
      video_number: d.video_number,
      title: d.title,
      completed: !!d.completed,
      problems_solved: d.problems_solved || 0,
      date_completed: d.date_completed || null
    })),
    semester_answers: (state.remote_semester || state.semester_answers || []).map(a => ({
      id: a.id,
      date: a.date,
      title: a.title,
      is_optional: !!a.is_optional,
      completed: !!a.completed,
      revised: !!a.revised,
      notes: a.notes || ''
    })),
    davinci_progress: (state.remote_davinci || state.davinciPlaylist || []).map(v => ({
      video_number: v.video_number,
      title: v.title,
      completed: !!v.completed,
      duration_minutes: v.duration_minutes || 45
    })),
    java_progress: (state.java_progress || []).map(j => ({
      video_number: j.video_number,
      title: j.title,
      completed: !!j.completed,
      duration_minutes: j.duration_minutes || 45,
      completed_at: j.completed_at || null
    })),
    exercise_completion: exerciseTasks.map(e => ({
      id: e.id,
      date: e.date,
      title: e.title,
      completed: !!e.completed,
      completed_at: e.completed_at || null
    })),
    goals: (state.remote_goals || state.goals || []).map(g => ({
      id: g.id,
      type: g.type,
      month_id: g.month_id || null,
      week_id: g.week_id || null,
      title: g.title,
      completed: !!g.completed
    })),
    reflections_and_reviews: {
      daily: state.daily_reviews || {},
      weekly: state.weekly_reviews || {},
      monthly: state.monthly_reviews || {}
    },
    gaming_logs: state.remote_gaming || state.gaming_logs || []
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  if (typeof document !== 'undefined' && typeof Blob !== 'undefined') {
    try {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `career_tracker_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('File download trigger skipped in non-browser context:', e);
    }
  }

  return exportPayload;
}

export function exportTrackerDataCSV() {
  const state = getState();
  const tasks = state.remote_tasks && state.remote_tasks.length > 0
    ? state.remote_tasks
    : (state.daily_tasks || state.tasks || []);

  const headers = ['Date', 'Title', 'Category', 'Subtype', 'Completed', 'Skipped', 'EstimatedMinutes', 'Priority', 'WeekId', 'MonthId', 'Id'];
  const rows = tasks.map(t => [
    t.date || '',
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.category || '',
    t.subtype || '',
    t.completed ? 'true' : 'false',
    t.skipped ? 'true' : 'false',
    t.estimated_minutes || '',
    t.priority || 'Normal',
    t.week_id || '',
    t.month_id || '',
    t.id || ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  if (typeof document !== 'undefined' && typeof Blob !== 'undefined') {
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `career_tracker_tasks_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('File download trigger skipped in non-browser context:', e);
    }
  }

  return csvContent;
}




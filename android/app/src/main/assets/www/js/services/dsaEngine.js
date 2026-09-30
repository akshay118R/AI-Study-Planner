/**
 * Akshay's 12-Month AI/ML Career OS - DSA & Problem-Solving Engine (Phase 5)
 * 
 * Hierarchy:
 * Roadmap -> Monthly Plan -> Weekly Goals -> Daily Tasks -> DSA Practice -> Progress -> Revision
 * 
 * Capabilities:
 * - Master DSA Taxonomy (Foundations, Arrays & Strings, Searching & Sorting, Recursion, Linked Structures, Trees, Heaps, Graphs, DP)
 * - Pattern Tracking (14 core patterns: Two Pointers, Sliding Window, Binary Search, etc.)
 * - Attempt & Solution Tracking (Solved independently, with hint, after seeing solution, could not solve)
 * - Solution Understanding & Auto-Revision (Yes, Partially, No -> Partially/No auto-marks Needs Revision)
 * - Mistake Tracking (10 categories with notes)
 * - Revision Queue with Spaced Intervals (1d, 3d, 7d, 14d, 30d) and hidden solution reattempts
 * - Practice Sessions with timer & session history
 * - Independent Solve Rate calculation (Independent / Total Solved)
 * - Weak Topics detection ("Needs More Practice") with neutral phrasing
 * - Bidirectional synchronization with Phase 3 Daily Tasks, Phase 4 Weekly/Monthly Goals, and Phase 2 Roadmap
 * - CSV Import / Export with duplicate prevention
 */

import { getState, updateState } from '../data/storage.js';
import { updateRoadmapTopic } from './roadmapEngine.js';
import { calculateStreaks } from './streakService.js';

export const DSA_TAXONOMY = [
  {
    group: 'FOUNDATIONS',
    topics: ['Big O', 'Time Complexity', 'Space Complexity', 'Basic Problem Solving']
  },
  {
    group: 'ARRAYS & STRINGS',
    topics: ['Arrays', 'Strings', 'Two Pointers', 'Sliding Window']
  },
  {
    group: 'SEARCHING & SORTING',
    topics: ['Linear Search', 'Binary Search', 'Bubble Sort', 'Merge Sort', 'Quick Sort']
  },
  {
    group: 'RECURSION',
    topics: ['Recursion', 'Recursion Patterns', 'Backtracking']
  },
  {
    group: 'LINKED STRUCTURES',
    topics: ['Linked Lists', 'Stack', 'Queue', 'Hashing']
  },
  {
    group: 'TREES',
    topics: ['Trees', 'Binary Search Trees', 'Tree Traversal', 'BFS', 'DFS']
  },
  {
    group: 'HEAPS',
    topics: ['Heap', 'Priority Queue']
  },
  {
    group: 'GRAPHS',
    topics: ['Graphs', 'Graph Traversal', 'BFS', 'DFS']
  },
  {
    group: 'DYNAMIC PROGRAMMING',
    topics: ['Dynamic Programming', 'DP Patterns']
  }
];

export const ALL_DSA_TOPICS = Array.from(new Set(DSA_TAXONOMY.flatMap(g => g.topics)));

export const DSA_PATTERNS = [
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Prefix Sum',
  'Hashing',
  'Stack',
  'Queue',
  'Linked List',
  'Tree Traversal',
  'BFS',
  'DFS',
  'Heap',
  'Backtracking',
  'Dynamic Programming'
];

export const MISTAKE_CATEGORIES = [
  "Didn't understand the pattern",
  'Logic error',
  'Syntax error',
  'Time complexity issue',
  'Space complexity issue',
  'Edge case',
  'Implementation error',
  'Misread problem',
  'Forgot concept',
  'Other'
];

export const SOLUTION_STATUSES = [
  'Solved independently',
  'Solved with hint',
  'Solved after seeing solution',
  'Could not solve'
];

export const REVISION_INTERVALS = [
  { label: '1 Day', days: 1 },
  { label: '3 Days (Default)', days: 3 },
  { label: '7 Days', days: 7 },
  { label: '14 Days', days: 14 },
  { label: '30 Days', days: 30 }
];

/**
 * Calculates complete DSA statistics, topic progress, pattern mastery,
 * revision queue, mistake log, and weak topics
 */
export function calculateDsaAnalytics(state = getState()) {
  const problems = state.dsa_problems || state.dsaProblems || [];
  const activeDate = state.user?.activeDate || '2026-10-01';

  // Overall Problem Counters
  const total = problems.length;
  const attempted = problems.filter(p => p.status === 'Attempted' || p.status === 'Solved' || p.attempt_count > 0 || (p.timeTakenMinutes || 0) > 0).length;
  const solved = problems.filter(p => p.status === 'Solved' || p.solved).length;
  const unsolved = total - solved;
  const needsRevision = problems.filter(p => p.needs_revision || p.revisionRequired || p.status === 'Needs Revision').length;

  const solvedIndependently = problems.filter(p => (p.status === 'Solved' || p.solved) && (p.solution_type === 'Solved independently' || !p.solution_type)).length;
  const solvedWithHint = problems.filter(p => p.solution_type === 'Solved with hint').length;
  const solvedAfterSolution = problems.filter(p => p.solution_type === 'Solved after seeing solution').length;
  const independentSolveRate = solved > 0 ? Math.round((solvedIndependently / solved) * 100) : 0;

  // Difficulty Split
  const difficulty = {
    Easy: problems.filter(p => p.difficulty === 'Easy' && (p.status === 'Solved' || p.solved)).length,
    Medium: problems.filter(p => p.difficulty === 'Medium' && (p.status === 'Solved' || p.solved)).length,
    Hard: problems.filter(p => p.difficulty === 'Hard' && (p.status === 'Solved' || p.solved)).length
  };

  // Streak & Activity
  const calculatedStreaks = calculateStreaks(state);
  const dsaStreak = calculatedStreaks.dsaStreak ?? (state.streaks?.dsaStreak ?? 0);
  const longestStreak = calculatedStreaks.longestStreak ?? (state.streaks?.longestStreak ?? 0);

  // This Week & This Month Calculations
  const curr = new Date(activeDate);
  const day = curr.getDay();
  const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(curr.setDate(diffToMonday));
  const weekStartStr = monday.toISOString().split('T')[0];
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekEndStr = sunday.toISOString().split('T')[0];

  const thisWeekSolved = problems.filter(p => (p.status === 'Solved' || p.solved) && p.date >= weekStartStr && p.date <= weekEndStr).length;
  const weeklyTarget = state.studySchedule?.weeklyDsaTarget || 10;

  const monthKey = activeDate.substring(0, 7);
  const thisMonthSolved = problems.filter(p => (p.status === 'Solved' || p.solved) && p.date && p.date.startsWith(monthKey)).length;
  const monthlyTarget = state.monthly_targets?.[monthKey]?.dsaProblems || 40;

  // Topic Progress Map (Section 3)
  const topicProgressMap = {};
  ALL_DSA_TOPICS.forEach(topicName => {
    const topicProbs = problems.filter(p => p.topic === topicName || p.subtopic === topicName);
    const tAttempted = topicProbs.length;
    const tSolved = topicProbs.filter(p => p.status === 'Solved' || p.solved).length;
    const tNeedsRev = topicProbs.filter(p => p.needs_revision || p.revisionRequired).length;
    const tEasy = topicProbs.filter(p => (p.status === 'Solved' || p.solved) && p.difficulty === 'Easy').length;
    const tMed = topicProbs.filter(p => (p.status === 'Solved' || p.solved) && p.difficulty === 'Medium').length;
    const tHard = topicProbs.filter(p => (p.status === 'Solved' || p.solved) && p.difficulty === 'Hard').length;
    const targetProbs = 30; // standard benchmark target per core topic
    const progress = Math.min(100, Math.round((tSolved / targetProbs) * 100));

    topicProgressMap[topicName] = {
      name: topicName,
      progress,
      attempted: tAttempted,
      solved: tSolved,
      needsRevision: tNeedsRev,
      easy: tEasy,
      medium: tMed,
      hard: tHard
    };
  });

  // Pattern Mastery Tracking (Section 15 & 16)
  const patternMasteryMap = {};
  DSA_PATTERNS.forEach(pattern => {
    const patProbs = problems.filter(p => {
      const pats = Array.isArray(p.patterns) ? p.patterns : (p.pattern ? [p.pattern] : []);
      return pats.includes(pattern) || p.approach?.toLowerCase().includes(pattern.toLowerCase());
    });
    const pTotal = patProbs.length;
    const pSolved = patProbs.filter(p => p.status === 'Solved' || p.solved).length;
    const pIndependent = patProbs.filter(p => (p.status === 'Solved' || p.solved) && (p.solution_type === 'Solved independently' || !p.solution_type)).length;
    const pWithHelp = patProbs.filter(p => p.solution_type === 'Solved with hint' || p.solution_type === 'Solved after seeing solution').length;
    const pNeedsRev = patProbs.filter(p => p.needs_revision || p.revisionRequired).length;

    patternMasteryMap[pattern] = {
      pattern,
      problemsCount: pTotal,
      solved: pSolved,
      independent: pIndependent,
      withHelp: pWithHelp,
      needsRevision: pNeedsRev,
      masteryRate: pTotal > 0 ? Math.round((pIndependent / pTotal) * 100) : 0
    };
  });

  // Revision Queue (Section 21 & 22)
  const revisionQueue = problems
    .filter(p => p.needs_revision || p.revisionRequired || p.status === 'Needs Revision')
    .map(p => {
      const nextDate = p.next_revision_date || activeDate;
      const isDue = nextDate <= activeDate;
      return {
        id: p.id,
        title: p.title || p.name,
        topic: p.topic,
        difficulty: p.difficulty,
        platform: p.platform,
        lastAttempted: p.date_solved || p.date || p.date_first_attempted || 'N/A',
        reason: p.mistake || p.mistakeCategory || (p.solution_understood === 'No' ? 'Solution not understood' : 'Scheduled for revision'),
        nextRevisionDate: nextDate,
        isDue,
        intervalDays: p.revision_interval_days || 3
      };
    })
    .sort((a, b) => new Date(a.nextRevisionDate) - new Date(b.nextRevisionDate));

  // Mistake Log (Section 24)
  const mistakeLog = problems
    .filter(p => (p.mistake && p.mistake !== 'None') || (p.mistakeCategory && p.mistakeCategory !== 'None') || p.mistake_notes)
    .map(p => ({
      id: p.id,
      problemTitle: p.title || p.name,
      topic: p.topic,
      difficulty: p.difficulty,
      platform: p.platform,
      mistakeCategory: p.mistake_type || p.mistakeCategory || p.mistake || 'Logic error',
      notes: p.mistake_notes || p.mistake || p.notes || '',
      date: p.date || p.date_solved || p.date_first_attempted || activeDate
    }));

  // Weak Topics ("Needs More Practice") (Section 25)
  // Appears if: low independent solve rate (<60%), repeated mistakes (>1), high revision count (>1), or low solved/attempted ratio (<50%)
  const weakTopics = [];
  ALL_DSA_TOPICS.forEach(topicName => {
    const tData = topicProgressMap[topicName];
    if (tData.attempted >= 2) {
      const solveRatio = tData.solved / tData.attempted;
      const tMistakes = mistakeLog.filter(m => m.topic === topicName).length;
      if (tData.needsRevision >= 2 || solveRatio < 0.6 || tMistakes >= 2) {
        let reason = '';
        if (tData.needsRevision >= 2) reason = `${tData.needsRevision} problems requiring revision`;
        else if (tMistakes >= 2) reason = `${tMistakes} logged mistakes in this concept`;
        else reason = `Low solve ratio (${Math.round(solveRatio * 100)}%)`;

        weakTopics.push({
          name: topicName,
          reason,
          needsRevision: tData.needsRevision,
          solved: tData.solved,
          attempted: tData.attempted
        });
      }
    }
  });

  // Sessions History
  const sessions = state.dsa_sessions || [];

  return {
    total,
    attempted,
    solved,
    unsolved,
    needsRevision,
    solvedIndependently,
    solvedWithHint,
    solvedAfterSolution,
    independentSolveRate,
    difficulty,
    streak: {
      current: dsaStreak,
      longest: longestStreak
    },
    thisWeek: {
      solved: thisWeekSolved,
      target: weeklyTarget
    },
    thisMonth: {
      solved: thisMonthSolved,
      target: monthlyTarget
    },
    topicProgressMap,
    patternMasteryMap,
    revisionQueue,
    mistakeLog,
    weakTopics,
    sessions,
    problems
  };
}

/**
 * SECTION 6: Add Problem (with duplicate prevention by URL or Platform+Title)
 */
export function addDsaProblem(problemData) {
  const state = getState();
  const existingProblems = state.dsa_problems || state.dsaProblems || [];

  // Duplicate Check
  const isDuplicate = existingProblems.some(p => {
    if (problemData.url && p.url && p.url.trim() === problemData.url.trim()) return true;
    if (problemData.link && p.link && p.link.trim() === problemData.link.trim()) return true;
    const samePlatform = (p.platform || '').toLowerCase() === (problemData.platform || '').toLowerCase();
    const sameTitle = (p.title || p.name || '').toLowerCase().trim() === (problemData.title || problemData.name || '').toLowerCase().trim();
    return samePlatform && sameTitle;
  });

  if (isDuplicate) {
    return { success: false, error: 'A problem with the same title/URL on this platform already exists.' };
  }

  const now = new Date().toISOString();
  const activeDate = state.user?.activeDate || now.split('T')[0];

  const newProblem = {
    id: `dsa-prob-${Date.now()}`,
    title: problemData.title || problemData.name || 'Untitled Problem',
    name: problemData.title || problemData.name || 'Untitled Problem',
    platform: problemData.platform || 'LeetCode',
    url: problemData.url || problemData.link || '',
    link: problemData.url || problemData.link || '',
    topic: problemData.topic || 'Arrays',
    subtopic: problemData.subtopic || '',
    patterns: Array.isArray(problemData.patterns) ? problemData.patterns : (problemData.pattern ? [problemData.pattern] : []),
    difficulty: problemData.difficulty || 'Easy',
    status: problemData.status || 'Not Attempted',
    attempt_count: 0,
    solve_count: 0,
    time_taken: 0,
    timeTakenMinutes: 0,
    date_first_attempted: null,
    date_solved: null,
    date: activeDate,
    needs_revision: false,
    revisionRequired: false,
    revision_interval_days: 3,
    solution_type: problemData.solution_type || (problemData.solved_independently ? 'Solved independently' : null),
    solved_independently: Boolean(problemData.solved_independently || problemData.solution_type === 'Solved independently'),
    needed_hint: Boolean(problemData.needed_hint || problemData.solution_type === 'Solved with hint'),
    viewed_solution: Boolean(problemData.viewed_solution || problemData.solution_type === 'Solved after seeing solution'),
    mistake_type: 'None',
    mistakeCategory: 'None',
    mistake_notes: '',
    approach: '',
    time_complexity: '',
    space_complexity: '',
    notes: problemData.notes || '',
    is_bookmarked: Boolean(problemData.is_bookmarked),
    created_at: now,
    updated_at: now
  };

  updateState(curr => {
    const list = [...(curr.dsa_problems || curr.dsaProblems || []), newProblem];
    return {
      ...curr,
      dsa_problems: list,
      dsaProblems: list
    };
  });

  return { success: true, problem: newProblem };
}

/**
 * SECTION 9 & 10: Solve / Update Problem with full workflow, understanding, and mistake tracking
 */
export function solveDsaProblem(problemId, solutionData) {
  const state = getState();
  const activeDate = state.user?.activeDate || new Date().toISOString().split('T')[0];

  const needsRev = solutionData.solutionUnderstood === 'Partially' ||
                   solutionData.solutionUnderstood === 'No' ||
                   solutionData.needsRevision === true;

  const intervalDays = solutionData.revisionIntervalDays || 3;
  const nextRevDate = new Date(new Date(activeDate).getTime() + (intervalDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

  let targetTopic = 'Arrays';

  updateState(curr => {
    const list = (curr.dsa_problems || curr.dsaProblems || []).map(p => {
      if (p.id === problemId) {
        targetTopic = p.topic || targetTopic;
        const attempts = (p.attempt_count || 0) + 1;
        const solves = (solutionData.solutionType !== 'Could not solve') ? (p.solve_count || 0) + 1 : (p.solve_count || 0);
        const isSolved = solutionData.solutionType !== 'Could not solve';

        return {
          ...p,
          status: isSolved ? 'Solved' : 'Attempted',
          solved: isSolved,
          attempt_count: attempts,
          solve_count: solves,
          time_taken: solutionData.timeTakenMinutes || p.time_taken || 25,
          timeTakenMinutes: solutionData.timeTakenMinutes || p.timeTakenMinutes || 25,
          date_solved: isSolved ? activeDate : p.date_solved,
          date: activeDate,
          solution_type: solutionData.solutionType || 'Solved independently',
          solution_understood: solutionData.solutionUnderstood || 'Yes',
          needs_revision: needsRev,
          revisionRequired: needsRev,
          revision_interval_days: intervalDays,
          next_revision_date: needsRev ? nextRevDate : null,
          mistake_type: solutionData.mistakeCategory || 'None',
          mistakeCategory: solutionData.mistakeCategory || 'None',
          mistake_notes: solutionData.mistakeNotes || '',
          approach: solutionData.approach || p.approach || '',
          time_complexity: solutionData.timeComplexity || p.time_complexity || '',
          space_complexity: solutionData.spaceComplexity || p.space_complexity || '',
          notes: solutionData.notes || p.notes || '',
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

    // Also update Phase 3 Daily Tasks ("Solve 2 DSA problems" task)
    const updatedTasks = (curr.dailyTasks || curr.daily_tasks || []).map(t => {
      if (t.date === activeDate && t.section === 'DSA' && !t.completed) {
        return {
          ...t,
          completed: true,
          status: 'Completed',
          completion_date: activeDate,
          actual_minutes: solutionData.timeTakenMinutes || 30
        };
      }
      return t;
    });

    return {
      ...curr,
      dsa_problems: list,
      dsaProblems: list,
      dailyTasks: updatedTasks,
      daily_tasks: updatedTasks
    };
  });

  // Section 30: Connect to corresponding roadmap topic (e.g. C Arrays / DSA Arrays)
  const roadmapTopic = (state.roadmap_topics || []).find(rt => rt.name.toLowerCase().includes(targetTopic.toLowerCase()));
  if (roadmapTopic) {
    const currentProgress = roadmapTopic.progress || 0;
    updateRoadmapTopic(roadmapTopic.id, {
      progress: Math.min(100, currentProgress + 10)
    });
  }

  return { success: true };
}

/**
 * SECTION 21, 22, 23: Reattempt Revision Problem
 */
export function reattemptRevisionProblem(problemId, reattemptOutcome) {
  const state = getState();
  const activeDate = state.user?.activeDate || new Date().toISOString().split('T')[0];

  updateState(curr => {
    const list = (curr.dsa_problems || curr.dsaProblems || []).map(p => {
      if (p.id === problemId) {
        if (reattemptOutcome === 'Solved independently') {
          // Mastered / Cleared from active queue or bumped to 30d
          return {
            ...p,
            needs_revision: false,
            revisionRequired: false,
            solution_type: 'Solved independently',
            solution_understood: 'Yes',
            next_revision_date: null,
            updated_at: new Date().toISOString()
          };
        } else {
          // Still needs revision -> schedule for next interval
          const interval = 3;
          const nextDate = new Date(new Date(activeDate).getTime() + (interval * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
          return {
            ...p,
            needs_revision: true,
            revisionRequired: true,
            next_revision_date: nextDate,
            updated_at: new Date().toISOString()
          };
        }
      }
      return p;
    });

    return {
      ...curr,
      dsa_problems: list,
      dsaProblems: list
    };
  });
}

/**
 * SECTION 37: Toggle Bookmark
 */
export function toggleDsaBookmark(problemId) {
  updateState(curr => {
    const list = (curr.dsa_problems || curr.dsaProblems || []).map(p => {
      if (p.id === problemId) {
        return { ...p, is_bookmarked: !p.is_bookmarked };
      }
      return p;
    });
    return {
      ...curr,
      dsa_problems: list,
      dsaProblems: list
    };
  });
}

/**
 * SECTION 26 & 27: Save Practice Session
 */
export function saveDsaPracticeSession(sessionData) {
  const now = new Date().toISOString();
  const newSession = {
    id: `dsa-sess-${Date.now()}`,
    date: sessionData.date || now.split('T')[0],
    topic: sessionData.topic || 'Mixed Practice',
    durationMinutes: sessionData.durationMinutes || 60,
    targetProblems: sessionData.targetProblems || 3,
    problemsAttempted: sessionData.problemsAttempted || 0,
    problemsSolved: sessionData.problemsSolved || 0,
    notes: sessionData.notes || '',
    created_at: now
  };

  updateState(curr => {
    const sessions = [newSession, ...(curr.dsa_sessions || [])];
    // Also record into main studySessions for unified hours tracking
    const studySessions = [...(curr.studySessions || []), {
      id: `study-sess-${Date.now()}`,
      date: newSession.date,
      startTime: 'Session',
      endTime: 'Completed',
      durationMinutes: newSession.durationMinutes,
      category: 'DSA',
      topic: newSession.topic,
      notes: newSession.notes
    }];

    return {
      ...curr,
      dsa_sessions: sessions,
      studySessions
    };
  });

  return newSession;
}

/**
 * Delete Problem
 */
export function deleteDsaProblem(problemId) {
  updateState(curr => {
    const list = (curr.dsa_problems || curr.dsaProblems || []).filter(p => p.id !== problemId);
    return {
      ...curr,
      dsa_problems: list,
      dsaProblems: list
    };
  });
  return { success: true };
}

/**
 * Update DSA Problem attributes
 */
export function updateDsaProblem(problemId, updates) {
  updateState(curr => {
    const list = (curr.dsa_problems || curr.dsaProblems || []).map(p => {
      if (p.id === problemId) {
        return {
          ...p,
          ...updates,
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });
    return {
      ...curr,
      dsa_problems: list,
      dsaProblems: list
    };
  });
  return { success: true };
}

/**
 * SECTION 7: Set DSA Daily Target
 */
export function setDsaDailyTarget(target, date = null) {
  const state = getState();
  const activeDate = date || state.user?.activeDate || '2026-10-01';
  const val = Math.max(1, parseInt(target, 10) || 2);
  updateState(curr => ({
    ...curr,
    studySchedule: {
      ...(curr.studySchedule || {}),
      dsaDailyTarget: val
    },
    dsa_daily_targets: {
      ...(curr.dsa_daily_targets || {}),
      [activeDate]: val
    },
    dsaTargets: {
      ...(curr.dsaTargets || {}),
      [activeDate]: val
    }
  }));
  return { success: true, target: val };
}

/**
 * SECTION 7 & 32: Get Today DSA Progress
 */
export function getTodayDsaProgress(state = getState(), targetDate = null) {
  const activeDate = targetDate || state.user?.activeDate || '2026-10-01';
  const problems = state.dsa_problems || state.dsaProblems || [];
  const target = state.dsa_daily_targets?.[activeDate] || state.studySchedule?.dsaDailyTarget || 2;
  const todayProbs = problems.filter(p => p.date === activeDate || p.date_solved === activeDate);
  const attempted = todayProbs.length;
  const solved = todayProbs.filter(p => p.status === 'Solved' || p.solved).length;
  const remaining = Math.max(0, target - solved);

  const curr = new Date(activeDate);
  const day = curr.getDay();
  const diffToMonday = curr.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(curr.setDate(diffToMonday));
  const weekStartStr = monday.toISOString().split('T')[0];
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekEndStr = sunday.toISOString().split('T')[0];
  const weekSolved = problems.filter(p => (p.status === 'Solved' || p.solved) && p.date >= weekStartStr && p.date <= weekEndStr).length;
  const weekTarget = state.studySchedule?.weeklyDsaTarget || 10;

  const revisionCount = problems.filter(p => p.needs_revision || p.revisionRequired || p.status === 'Needs Revision').length;
  const lastProblem = problems[problems.length - 1];
  const currentTopic = lastProblem?.topic || 'Arrays';
  const streaks = calculateStreaks(state);

  return {
    date: activeDate,
    target,
    solved,
    attempted,
    remaining,
    weekSolved,
    weekTarget,
    revisionCount,
    currentTopic,
    streak: streaks.dsaStreak || 0,
    longestStreak: streaks.longestStreak || 0
  };
}

/**
 * SECTION 28: DSA Calendar Activity
 */
export function getDsaCalendarActivity(state = getState()) {
  const problems = state.dsa_problems || state.dsaProblems || [];
  const sessions = state.dsa_sessions || [];
  const calendarMap = {};

  problems.forEach(p => {
    const d = p.date || p.date_solved || p.date_first_attempted;
    if (!d) return;
    if (!calendarMap[d]) {
      calendarMap[d] = { date: d, problemsSolved: 0, problemsAttempted: 0, studyMinutes: 0, problems: [] };
    }
    calendarMap[d].problemsAttempted++;
    if (p.status === 'Solved' || p.solved) {
      calendarMap[d].problemsSolved++;
    }
    calendarMap[d].studyMinutes += (p.timeTakenMinutes || p.time_taken || 0);
    calendarMap[d].problems.push(p);
  });

  sessions.forEach(s => {
    const d = s.date;
    if (!d) return;
    if (!calendarMap[d]) {
      calendarMap[d] = { date: d, problemsSolved: 0, problemsAttempted: 0, studyMinutes: 0, problems: [] };
    }
    calendarMap[d].studyMinutes += (s.durationMinutes || 0);
  });

  return calendarMap;
}

/**
 * SECTION 36: CSV Export
 */
export function exportDsaToCsv(state = getState()) {
  const problems = state.dsa_problems || state.dsaProblems || [];
  const headers = ['Problem', 'Platform', 'Topic', 'Difficulty', 'Status', 'TimeMinutes', 'Notes', 'Mistake', 'NeedsRevision'];
  const rows = problems.map(p => [
    `"${(p.title || p.name || '').replace(/"/g, '""')}"`,
    `"${p.platform || ''}"`,
    `"${p.topic || ''}"`,
    `"${p.difficulty || ''}"`,
    `"${p.status || ''}"`,
    p.timeTakenMinutes || p.time_taken || 0,
    `"${(p.notes || '').replace(/"/g, '""')}"`,
    `"${(p.mistake_notes || p.mistakeCategory || '').replace(/"/g, '""')}"`,
    p.needs_revision || p.revisionRequired ? 'Yes' : 'No'
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * SECTION 36: CSV Import with Duplicate Prevention
 */
export function importDsaFromCsv(csvText) {
  const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return { success: false, error: 'CSV file is empty or missing headers.' };

  let importedCount = 0;
  let skippedDuplicates = 0;

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV row parser handling quotes
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const matches = [];
    let match;
    while ((match = regex.exec(lines[i])) !== null) {
      let val = match[1] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).replace(/""/g, '"');
      }
      matches.push(val);
      if (regex.lastIndex >= lines[i].length) break;
    }

    const [title, platform, topic, difficulty, status, time, notes, mistake, needsRev] = matches;
    if (!title) continue;

    const res = addDsaProblem({
      title,
      platform: platform || 'LeetCode',
      topic: topic || 'Arrays',
      difficulty: difficulty || 'Easy',
      status: status || 'Solved',
      timeTakenMinutes: parseInt(time, 10) || 25,
      notes: notes || '',
      mistakeCategory: mistake || 'None',
      needsRevision: needsRev === 'Yes'
    });

    if (res.success) importedCount++;
    else skippedDuplicates++;
  }

  return { success: true, importedCount, skippedDuplicates };
}

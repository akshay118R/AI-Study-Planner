/**
 * Akshay's 12-Month AI/ML Career OS - Phase 2 Roadmap Engine
 * 
 * Provides:
 * - Real relational calculations (Subtopic -> Topic -> Month -> Year)
 * - Dynamic Current Month determination based on activeDate (never hard-coded!)
 * - Strictly separate calculations for Track A (Prime 3.0) and Track B (Individual CS)
 * - Course Coverage Map generation (Prime 3.0: 11 categories; Individual: 14 categories)
 * - Reactive update and persistence helpers
 */

import { getState, updateState } from '../data/storage.js';
import {
  INITIAL_ROADMAP_YEAR,
  INITIAL_ROADMAP_MONTHS,
  INITIAL_ROADMAP_TOPICS,
  INITIAL_ROADMAP_SUBTOPICS,
  PRIME_3_TOPICS_LIST,
  PRIME_3_MODULES_HIERARCHY
} from '../data/roadmapData.js';

// Get or ensure relational entities exist in state
export function getRoadmapEntities(state = getState()) {
  const year = state.roadmap_year || INITIAL_ROADMAP_YEAR;
  const months = (state.roadmap_months && state.roadmap_months.length) ? state.roadmap_months : INITIAL_ROADMAP_MONTHS;
  const topics = (state.roadmap_topics && state.roadmap_topics.length) ? state.roadmap_topics : INITIAL_ROADMAP_TOPICS;
  const subtopics = (state.roadmap_subtopics && state.roadmap_subtopics.length) ? state.roadmap_subtopics : INITIAL_ROADMAP_SUBTOPICS;
  const primeTopics = (state.prime_topics && state.prime_topics.length) ? state.prime_topics : PRIME_3_TOPICS_LIST;
  const primeModules = (state.prime_modules && state.prime_modules.length) ? state.prime_modules : PRIME_3_MODULES_HIERARCHY;

  return { year, months, topics, subtopics, primeTopics, primeModules };
}

/**
 * Calculates dynamic status for a month based on activeDate and progress.
 * Statuses: Upcoming | Current | On Track | Needs Attention | Completed
 */
export function resolveMonthStatus(month, activeDate, monthProgress) {
  if (!activeDate) activeDate = '2026-10-01';

  // If activeDate falls strictly within the month range
  if (activeDate >= month.start_date && activeDate <= month.end_date) {
    if (monthProgress === 100) return 'Completed';
    if (monthProgress >= 50) return 'Current';
    return 'Current';
  }

  // Future month
  if (activeDate < month.start_date) {
    return 'Upcoming';
  }

  // Past month
  if (activeDate > month.end_date) {
    if (monthProgress === 100) {
      return 'Completed';
    } else {
      return 'Needs Attention';
    }
  }

  return 'Upcoming';
}

/**
 * Calculates topic progress based on its subtopics (if any exist),
 * or returns its explicit progress (0-100).
 */
export function resolveTopicProgress(topic, subtopicsList = []) {
  const childSubtopics = subtopicsList.filter(s => s.topic_id === topic.id);
  if (childSubtopics.length > 0) {
    if (topic.status === 'Completed' || topic.progress === 100) {
      return {
        progress: 100,
        status: 'Completed',
        subtopics: childSubtopics
      };
    }
    const completedCount = childSubtopics.filter(s => s.status === 'Completed' || s.progress === 100).length;
    const computedProgress = Math.round((completedCount / childSubtopics.length) * 100);
    let computedStatus = topic.status;
    if (computedProgress === 100) computedStatus = 'Completed';
    else if (computedProgress > 0 && computedStatus === 'Not Started') computedStatus = 'Learning';
    return {
      progress: computedProgress,
      status: computedStatus,
      subtopics: childSubtopics
    };
  }
  return {
    progress: topic.progress ?? 0,
    status: topic.status || 'Not Started',
    subtopics: []
  };
}

/**
 * Retrieves all 12 roadmap months with dynamic status, real calculated progress,
 * and enriched topic arrays.
 */
export function getEnrichedRoadmapMonths(state = getState()) {
  const { months, topics, subtopics } = getRoadmapEntities(state);
  const activeDate = state.user?.activeDate || '2026-10-01';

  return months.map(m => {
    const monthTopics = topics
      .filter(t => t.month_id === m.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(t => {
        const resolved = resolveTopicProgress(t, subtopics);
        return {
          ...t,
          progress: resolved.progress,
          status: resolved.status,
          subtopics: resolved.subtopics
        };
      });

    const totalTopics = monthTopics.length;
    const completedTopics = monthTopics.filter(t => t.status === 'Completed' || t.progress === 100);
    const progressSum = monthTopics.reduce((acc, t) => acc + (t.progress || 0), 0);
    const progress = totalTopics > 0 ? Math.round(progressSum / totalTopics) : 0;
    const status = resolveMonthStatus(m, activeDate, progress);

    return {
      ...m,
      topics: monthTopics,
      totalTopics,
      completedTopicsCount: completedTopics.length,
      progress,
      status
    };
  });
}

/**
 * Overall Roadmap Progress calculations.
 * Strict separation: Individual Roadmap % vs Prime 3.0 %.
 */
export function getRoadmapAnalytics(state = getState()) {
  const { topics, primeTopics, subtopics } = getRoadmapEntities(state);
  const enrichedMonths = getEnrichedRoadmapMonths(state);
  const activeDate = state.user?.activeDate || '2026-10-01';

  // Individual Track B Calculations
  const resolvedTopics = topics.map(t => resolveTopicProgress(t, subtopics));
  const individualTotal = topics.length;
  const individualCompleted = resolvedTopics.filter(t => t.status === 'Completed' || t.progress === 100).length;
  const individualProgressSum = resolvedTopics.reduce((acc, t) => acc + t.progress, 0);
  const individualPercentage = individualTotal > 0 ? Math.round(individualProgressSum / individualTotal) : 0;

  // Prime 3.0 Track A Calculations
  const primeTotal = primeTopics.length;
  const primeCompleted = primeTopics.filter(t => t.status === 'Completed' || t.progress === 100).length;
  const primeLearning = primeTopics.filter(t => t.status === 'Learning' || t.status === 'Practicing').length;
  const primeProgressSum = primeTopics.reduce((acc, t) => acc + (t.progress || 0), 0);
  const primePercentage = primeTotal > 0 ? Math.round(primeProgressSum / primeTotal) : 0;

  // Combined Learning Progress
  const combinedPercentage = Math.round((individualPercentage + primePercentage) / 2);

  // Current Month detection
  const currentMonth = enrichedMonths.find(m => m.status === 'Current') || enrichedMonths[0];

  return {
    individual: {
      percentage: individualPercentage,
      totalTopics: individualTotal,
      completedTopics: individualCompleted,
      remainingTopics: individualTotal - individualCompleted
    },
    prime: {
      percentage: primePercentage,
      totalTopics: primeTotal,
      completedTopics: primeCompleted,
      learningTopics: primeLearning,
      upcomingTopics: primeTotal - primeCompleted - primeLearning
    },
    combinedPercentage,
    currentMonth,
    activeDate
  };
}

/**
 * Prime 3.0 Course Hierarchy:
 * Prime 3.0 -> Module -> Topic -> Lesson/Task + Progress -> Module Progress -> Overall Course Progress
 */
export function getEnrichedPrimeModules(state = getState()) {
  const { primeTopics, primeModules } = getRoadmapEntities(state);

  const topicMap = new Map();
  primeTopics.forEach(t => topicMap.set(t.id, t));

  return primeModules.map(mod => {
    const modTopics = (mod.topicIds || [])
      .map(tid => topicMap.get(tid))
      .filter(Boolean);

    const totalTopics = modTopics.length;
    const completedTopics = modTopics.filter(t => t.status === 'Completed' || t.progress === 100);
    const progressSum = modTopics.reduce((acc, t) => acc + (t.progress || 0), 0);
    const progress = totalTopics > 0 ? Math.round(progressSum / totalTopics) : 0;

    let status = 'Not Started';
    if (progress === 100) status = 'Completed';
    else if (progress > 0) status = 'In Progress';

    return {
      ...mod,
      topics: modTopics,
      totalTopics,
      completedCount: completedTopics.length,
      progress,
      status
    };
  });
}

/**
 * Coverage Map: "WHAT PRIME 3.0 COVERS" (11 Categories)
 * Categories:
 * Programming, Data, Mathematics, Machine Learning, Deep Learning, GenAI, NLP, Development, Databases, DevOps, Projects
 */
export function getPrimeCoverageMap(state = getState()) {
  const { primeTopics } = getRoadmapEntities(state);
  const categories = [
    'Programming',
    'Data',
    'Mathematics',
    'Machine Learning',
    'Deep Learning',
    'GenAI',
    'NLP',
    'Development',
    'Databases',
    'DevOps',
    'Projects'
  ];

  return categories.map(cat => {
    const catTopics = primeTopics.filter(t => (t.category || '').toLowerCase() === cat.toLowerCase());
    const total = catTopics.length;
    const completed = catTopics.filter(t => t.status === 'Completed' || t.progress === 100).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      category: cat,
      topics: catTopics,
      total,
      completed,
      progress
    };
  });
}

/**
 * Coverage Map: "WHAT I NEED TO LEARN INDIVIDUALLY" (14 Categories)
 * Categories:
 * Programming, DSA, Core CS, DBMS, OS, Computer Networks, Computer Organization,
 * Mathematics, Data Engineering, Software Engineering, Backend, Cloud, MLOps, Placement
 */
export function getIndividualCoverageMap(state = getState()) {
  const { topics, months } = getRoadmapEntities(state);
  const monthMap = new Map();
  months.forEach(m => monthMap.set(m.id, m.month + ' ' + m.year));

  const categories = [
    'Programming',
    'DSA',
    'Core CS',
    'DBMS',
    'OS',
    'Computer Networks',
    'Computer Organization',
    'Mathematics',
    'Data Engineering',
    'Software Engineering',
    'Backend',
    'Cloud',
    'MLOps',
    'Placement'
  ];

  return categories.map(cat => {
    const catTopics = topics.filter(t => (t.category || '').toLowerCase() === cat.toLowerCase());
    const total = catTopics.length;
    const completed = catTopics.filter(t => t.status === 'Completed' || t.progress === 100).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const enrichedCatTopics = catTopics.map(t => ({
      ...t,
      monthName: monthMap.get(t.month_id) || 'Scheduled'
    }));

    return {
      category: cat,
      topics: enrichedCatTopics,
      total,
      completed,
      progress
    };
  });
}

// ==========================================
// PERSISTENCE MUTATION HELPERS
// ==========================================

/**
 * Updates a roadmap topic's status, progress, notes, or target date,
 * ensuring persistence in storage.
 */
export function updateRoadmapTopic(topicId, updates) {
  return updateState(curr => {
    const prevTopics = (curr.roadmap_topics && curr.roadmap_topics.length) ? curr.roadmap_topics : INITIAL_ROADMAP_TOPICS;
    const prevSubtopics = (curr.roadmap_subtopics && curr.roadmap_subtopics.length) ? curr.roadmap_subtopics : INITIAL_ROADMAP_SUBTOPICS;
    let updatedSubtopics = prevSubtopics;

    const updated = prevTopics.map(t => {
      if (t.id === topicId) {
        const next = { ...t, ...updates };
        if (updates.progress === 100 && next.status !== 'Completed') {
          next.status = 'Completed';
          next.completion_date = next.completion_date || new Date().toISOString().split('T')[0];
        } else if (updates.status === 'Completed' && next.progress !== 100) {
          next.progress = 100;
          next.completion_date = next.completion_date || new Date().toISOString().split('T')[0];
        } else if (updates.status && updates.status !== 'Completed' && next.progress === 100) {
          next.progress = 50;
          next.completion_date = null;
        }

        // Sync child subtopics if explicitly completed or reset
        if (next.status === 'Completed' || next.progress === 100) {
          updatedSubtopics = updatedSubtopics.map(s => s.topic_id === topicId ? { ...s, status: 'Completed', progress: 100 } : s);
        } else if (next.status === 'Not Started' || next.progress === 0) {
          updatedSubtopics = updatedSubtopics.map(s => s.topic_id === topicId ? { ...s, status: 'Not Started', progress: 0 } : s);
        }

        return next;
      }
      return t;
    });
    return { ...curr, roadmap_topics: updated, roadmap_subtopics: updatedSubtopics };
  });
}

/**
 * Toggles a subtopic's completion and recalculates parent topic progress & status.
 */
export function toggleSubtopicCompletion(subtopicId) {
  return updateState(curr => {
    const prevSubtopics = (curr.roadmap_subtopics && curr.roadmap_subtopics.length) ? curr.roadmap_subtopics : INITIAL_ROADMAP_SUBTOPICS;
    let targetTopicId = null;

    const updatedSubtopics = prevSubtopics.map(s => {
      if (s.id === subtopicId) {
        targetTopicId = s.topic_id;
        const isDone = s.status === 'Completed' || s.progress === 100;
        return {
          ...s,
          status: isDone ? 'Not Started' : 'Completed',
          progress: isDone ? 0 : 100
        };
      }
      return s;
    });

    if (targetTopicId) {
      // Recalculate parent topic
      const topicSubtopics = updatedSubtopics.filter(s => s.topic_id === targetTopicId);
      const doneCount = topicSubtopics.filter(s => s.status === 'Completed' || s.progress === 100).length;
      const computedPct = Math.round((doneCount / topicSubtopics.length) * 100);

      const prevTopics = (curr.roadmap_topics && curr.roadmap_topics.length) ? curr.roadmap_topics : INITIAL_ROADMAP_TOPICS;
      const updatedTopics = prevTopics.map(t => {
        if (t.id === targetTopicId) {
          return {
            ...t,
            progress: computedPct,
            status: computedPct === 100 ? 'Completed' : (computedPct > 0 ? 'Learning' : 'Not Started'),
            completion_date: computedPct === 100 ? (t.completion_date || new Date().toISOString().split('T')[0]) : null
          };
        }
        return t;
      });

      return {
        ...curr,
        roadmap_subtopics: updatedSubtopics,
        roadmap_topics: updatedTopics
      };
    }

    return { ...curr, roadmap_subtopics: updatedSubtopics };
  });
}

/**
 * Adds a new subtopic to a topic
 */
export function addSubtopicToTopic(topicId, subtopicName) {
  if (!subtopicName || !subtopicName.trim()) return;
  return updateState(curr => {
    const prevSubtopics = (curr.roadmap_subtopics && curr.roadmap_subtopics.length) ? curr.roadmap_subtopics : INITIAL_ROADMAP_SUBTOPICS;
    const childSubs = prevSubtopics.filter(s => s.topic_id === topicId);
    const newSub = {
      id: `sub-${topicId}-${Date.now()}`,
      topic_id: topicId,
      name: subtopicName.trim(),
      order: childSubs.length + 1,
      status: 'Not Started',
      progress: 0,
      notes: ''
    };
    return { ...curr, roadmap_subtopics: [...prevSubtopics, newSub] };
  });
}

/**
 * Updates a Prime 3.0 course topic, verifying Track A changes do NOT affect Track B.
 */
export function updatePrimeTopic(primeTopicId, updates) {
  return updateState(curr => {
    const prevPrime = (curr.prime_topics && curr.prime_topics.length) ? curr.prime_topics : PRIME_3_TOPICS_LIST;
    const updated = prevPrime.map(pt => {
      if (pt.id === primeTopicId) {
        const next = { ...pt, ...updates };
        if (updates.progress === 100 && next.status !== 'Completed') {
          next.status = 'Completed';
          next.completion_date = next.completion_date || new Date().toISOString().split('T')[0];
        } else if (updates.status === 'Completed' && next.progress !== 100) {
          next.progress = 100;
          next.completion_date = next.completion_date || new Date().toISOString().split('T')[0];
        } else if (updates.status && updates.status !== 'Completed' && next.progress === 100) {
          next.progress = 50;
          next.completion_date = null;
        }
        return next;
      }
      return pt;
    });
    return { ...curr, prime_topics: updated };
  });
}

/**
 * Akshay's 12-Month AI/ML Career OS - Initial State
 * Fully populated initial database state
 */
import { PRIME_3_COURSE, INDIVIDUAL_ROADMAP_MONTHS, HABIT_DEFINITIONS } from './curriculum.js';
import {
  INITIAL_ROADMAP_YEAR,
  INITIAL_ROADMAP_MONTHS,
  INITIAL_ROADMAP_TOPICS,
  INITIAL_ROADMAP_SUBTOPICS,
  PRIME_3_TOPICS_LIST,
  PRIME_3_MODULES_HIERARCHY
} from './roadmapData.js';

export function createInitialState() {
  // Build initial lessons dictionary with full 7-step criteria and 0-4 understanding scale
  const primeLessons = {};
  PRIME_3_COURSE.modules.forEach(mod => {
    mod.lessons.forEach(l => {
      primeLessons[l.id] = {
        id: l.id,
        moduleId: mod.id,
        title: l.title,
        estHours: l.estHours,
        watched: false,
        notesTaken: false,
        codedAlong: false,
        recreatedIndependently: false,
        practiced: false,
        understood: false,
        applied: false,
        understandingScore: 0, // 0 = Don't understand, 1 = Recognize, 2 = Can explain, 3 = Can implement, 4 = Can apply
        status: 'Not Started', // Not Started | Learning | Practicing | Understood | Applied | Mastered
        notes: '',
        dateUpdated: null,
        hoursLogged: 0
      };
    });
  });

  // Pre-seed Lesson 1 to demonstrate the system
  if (primeLessons['p-1-1']) {
    primeLessons['p-1-1'].watched = true;
    primeLessons['p-1-1'].notesTaken = true;
    primeLessons['p-1-1'].codedAlong = true;
    primeLessons['p-1-1'].recreatedIndependently = false;
    primeLessons['p-1-1'].practiced = true;
    primeLessons['p-1-1'].understood = true;
    primeLessons['p-1-1'].applied = false;
    primeLessons['p-1-1'].understandingScore = 3;
    primeLessons['p-1-1'].status = 'Understood';
    primeLessons['p-1-1'].hoursLogged = 2.0;
    primeLessons['p-1-1'].notes = 'Mastered variable scoping, list comprehensions, and memory referencing in Python 3.12.';
    primeLessons['p-1-1'].dateUpdated = '2026-10-01';
  }

  // Pre-seed Lesson 2 as Learning
  if (primeLessons['p-1-2']) {
    primeLessons['p-1-2'].watched = true;
    primeLessons['p-1-2'].notesTaken = true;
    primeLessons['p-1-2'].codedAlong = false;
    primeLessons['p-1-2'].understandingScore = 2;
    primeLessons['p-1-2'].status = 'Learning';
    primeLessons['p-1-2'].hoursLogged = 1.0;
    primeLessons['p-1-2'].dateUpdated = '2026-10-01';
  }

  // Roadmap month records
  const roadmapMonths = INDIVIDUAL_ROADMAP_MONTHS.map(m => ({
    ...m,
    status: m.monthIndex === 0 ? 'Current' : 'Upcoming', // Upcoming | Current | On Track | Needs Attention | Completed
    completedTopics: m.monthIndex === 0 ? ['oct-1'] : [],
    hoursLogged: m.monthIndex === 0 ? 8 : 0,
    completionPercentage: m.monthIndex === 0 ? 14 : 0
  }));

  // Initial Daily Tasks for Oct 1, 2026
  const initialTasks = [
    {
      id: 'task-101',
      date: '2026-10-01',
      track: 'Prime 3.0',
      title: 'Prime 3.0: Complete Lesson 1.2 Data Structures & Memory',
      category: 'Prime 3.0',
      durationMinutes: 90,
      completed: true,
      timeCompleted: '2026-10-01T11:30:00',
      subtasks: [
        { id: 'st-1', title: 'Watch lesson videos', completed: true },
        { id: 'st-2', title: 'Take structured notes', completed: true },
        { id: 'st-3', title: 'Code along in Jupyter notebook', completed: true }
      ]
    },
    {
      id: 'task-102',
      date: '2026-10-01',
      track: 'Individual',
      title: 'Individual: C Fundamentals - Compilation Pipeline & Pointers Intro',
      category: 'Individual',
      durationMinutes: 60,
      completed: true,
      timeCompleted: '2026-10-01T15:00:00',
      subtasks: [
        { id: 'st-4', title: 'Review gcc compilation stages (-E, -S, -c)', completed: true },
        { id: 'st-5', title: 'Write 3 small C pointer examples', completed: true }
      ]
    },
    {
      id: 'task-103',
      date: '2026-10-01',
      track: 'DSA',
      title: 'DSA: Solve LeetCode #1 Two Sum & Analyze Space/Time',
      category: 'DSA',
      durationMinutes: 45,
      completed: true,
      timeCompleted: '2026-10-01T17:15:00',
      subtasks: []
    },
    {
      id: 'task-104',
      date: '2026-10-01',
      track: 'Revision',
      title: 'Revision: Review yesterday\'s C memory stack vs heap notes',
      category: 'Revision',
      durationMinutes: 20,
      completed: false,
      subtasks: []
    },
    {
      id: 'task-105',
      date: '2026-10-01',
      track: 'Project',
      title: 'Project: Initialize C CLI Memory Manager repository',
      category: 'Project',
      durationMinutes: 30,
      completed: false,
      subtasks: []
    },
    {
      id: 'task-106',
      date: '2026-10-01',
      track: 'GitHub',
      title: 'GitHub: Commit day 1 code and update README logs',
      category: 'GitHub',
      durationMinutes: 15,
      completed: true,
      timeCompleted: '2026-10-01T21:00:00',
      subtasks: []
    }
  ];

  // Initial Habits Log for Oct 1, 2026
  const habitLogs = {
    '2026-10-01': {
      'h-prime': { status: 'Completed', notes: 'Completed 1.5h lesson and code' },
      'h-dsa': { status: 'Completed', notes: 'Solved Two Sum with hash map O(N)' },
      'h-indiv': { status: 'Completed', notes: 'C compilation stages' },
      'h-coding': { status: 'Completed', notes: 'C program implementation' },
      'h-project': { status: 'Partially completed', notes: 'Set up directory structure' },
      'h-revision': { status: 'Skipped', skipReason: 'College workload', notes: 'Heavy lab assignment due tomorrow' },
      'h-journal': { status: 'Completed', notes: 'Logged day 1 highlights' },
      'h-github': { status: 'Completed', notes: 'Pushed day 1 repo' }
    }
  };

  // Pre-seeded DSA Problems
  const dsaProblems = [
    {
      id: 'dsa-1',
      name: 'Two Sum',
      link: 'https://leetcode.com/problems/two-sum/',
      topic: 'Hashing',
      platform: 'LeetCode',
      difficulty: 'Easy',
      status: 'Solved',
      date: '2026-10-01',
      timeTakenMinutes: 25,
      approach: 'Hash Map single-pass store complement and index for O(N) time and O(N) space.',
      mistakeCategory: 'None',
      solutionUnderstood: true,
      revisionRequired: false,
      notes: 'Initial brute force O(N^2) double loop replaced with hash table complement lookup.'
    },
    {
      id: 'dsa-2',
      name: 'Valid Parentheses',
      link: 'https://leetcode.com/problems/valid-parentheses/',
      topic: 'Stack',
      platform: 'LeetCode',
      difficulty: 'Easy',
      status: 'Solved',
      date: '2026-10-01',
      timeTakenMinutes: 20,
      approach: 'Stack: push opening braces, pop on matching closing brace. Return isEmpty at end.',
      mistakeCategory: 'Edge case handling',
      solutionUnderstood: true,
      revisionRequired: true,
      notes: 'Forgot to check if stack is empty before calling top(). Added to revision queue.'
    },
    {
      id: 'dsa-3',
      name: 'Best Time to Buy and Sell Stock',
      link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
      topic: 'Arrays',
      platform: 'LeetCode',
      difficulty: 'Easy',
      status: 'Solved',
      date: '2026-09-30',
      timeTakenMinutes: 30,
      approach: 'Single pass tracking minimum buying price and maximum delta.',
      mistakeCategory: 'None',
      solutionUnderstood: true,
      revisionRequired: false,
      notes: 'Kadane algorithm variant pattern.'
    }
  ];

  // Pre-seeded Projects
  const projects = [
    {
      id: 'proj-1',
      name: 'C Memory Allocator & CLI Profiler',
      category: 'Python', // C/Systems
      description: 'A custom user-space memory allocator in pure C mimicking malloc/free with block splitting and coalescence, coupled with a CLI memory profiler.',
      technology: 'C, Linux, Valgrind, Make, GDB',
      startDate: '2026-10-01',
      deadline: '2026-10-31',
      status: 'Building',
      progress: 25,
      githubUrl: 'https://github.com/akshay/c-memory-allocator',
      liveUrl: '',
      readmeStatus: 'Drafted',
      deploymentStatus: 'Local CLI',
      tasks: [
        { id: 'pt-1', title: 'Research memory heap management & sbrk/mmap', completed: true },
        { id: 'pt-2', title: 'Design block header metadata struct', completed: true },
        { id: 'pt-3', title: 'Setup Makefile and test harnesses', completed: true },
        { id: 'pt-4', title: 'Implement custom malloc with first-fit search', completed: false },
        { id: 'pt-5', title: 'Implement custom free with block merging', completed: false },
        { id: 'pt-6', title: 'Write unit tests and benchmark vs glibc malloc', completed: false },
        { id: 'pt-7', title: 'Valgrind zero-leak validation', completed: false },
        { id: 'pt-8', title: 'Complete comprehensive README with benchmark charts', completed: false },
        { id: 'pt-9', title: 'GitHub release tag v1.0', completed: false }
      ]
    },
    {
      id: 'proj-2',
      name: 'End-to-End Supervised ML Pipeline',
      category: 'ML',
      description: 'Complete production ML pipeline predicting customer churn with data preprocessing, model selection, hyperparameter tuning and Flask API.',
      technology: 'Python, Scikit-Learn, Pandas, Flask, Docker',
      startDate: '2026-11-15',
      deadline: '2026-12-20',
      status: 'Planning',
      progress: 10,
      githubUrl: 'https://github.com/akshay/ml-churn-pipeline',
      liveUrl: '',
      readmeStatus: 'Planned',
      deploymentStatus: 'Containerized',
      tasks: [
        { id: 'pt-11', title: 'Dataset ingestion and exploratory data analysis', completed: true },
        { id: 'pt-12', title: 'Feature engineering pipeline with ColumnTransformer', completed: false },
        { id: 'pt-13', title: 'Model benchmarking (Logistic, XGBoost, Random Forest)', completed: false },
        { id: 'pt-14', title: 'Threshold optimization for Precision-Recall tradeoff', completed: false },
        { id: 'pt-15', title: 'Flask REST endpoint serving model predictions', completed: false },
        { id: 'pt-16', title: 'Docker containerization and health checks', completed: false }
      ]
    },
    {
      id: 'proj-3',
      name: 'Enterprise Multi-Document RAG Agent',
      category: 'GenAI/LLM',
      description: 'Production-ready RAG application indexing technical documentation with ChromaDB, hybrid search (BM25 + Dense embeddings) and citation synthesis.',
      technology: 'Python, FastAPI, OpenAI API, LangChain, ChromaDB, Docker',
      startDate: '2027-04-01',
      deadline: '2027-05-30',
      status: 'Idea',
      progress: 0,
      githubUrl: '',
      liveUrl: '',
      readmeStatus: 'Planned',
      deploymentStatus: 'Cloud deployed',
      tasks: [
        { id: 'pt-21', title: 'Research chunking strategies & embedding benchmarks', completed: false },
        { id: 'pt-22', title: 'Set up vector store and ingestion pipeline', completed: false },
        { id: 'pt-23', title: 'Implement hybrid retrieval and re-ranking', completed: false },
        { id: 'pt-24', title: 'FastAPI streaming backend and client UI', completed: false }
      ]
    }
  ];

  // Pre-seeded Revision Items
  const revisionItems = [
    {
      id: 'rev-1',
      title: 'Valid Parentheses: Empty Stack Guard Condition',
      source: 'DSA Problem #2',
      type: 'DSA Mistake',
      topic: 'Stack',
      dateAdded: '2026-10-01',
      dueDate: '2026-10-02',
      status: 'Due today', // Due today | Due this week | Overdue | Completed
      difficultyRating: 'Medium',
      reviewCount: 0,
      lastReviewed: null,
      notes: 'Always check !stack.isEmpty() prior to peek() or pop(). Guard against empty string edge cases.'
    },
    {
      id: 'rev-2',
      title: 'C Pointers: Function Pointer Syntax & Array Decay',
      source: 'Individual Roadmap (October)',
      type: 'Concept Confusion',
      topic: 'C Fundamentals',
      dateAdded: '2026-09-30',
      dueDate: '2026-10-03',
      status: 'Due this week',
      difficultyRating: 'Hard',
      reviewCount: 1,
      lastReviewed: '2026-09-30',
      notes: 'Syntax: return_type (*func_ptr)(arg_types). Arrays decay into pointers to their first element when passed into functions.'
    },
    {
      id: 'rev-3',
      title: 'Bias vs Variance Decomposition Formula',
      source: 'Prime 3.0 Module 5',
      type: 'Need Revision',
      topic: 'ML Metrics',
      dateAdded: '2026-09-28',
      dueDate: '2026-10-01',
      status: 'Due today',
      difficultyRating: 'Medium',
      reviewCount: 0,
      lastReviewed: null,
      notes: 'Expected Test Error = Bias^2 + Variance + Irreducible Noise. Review how regularization controls the tradeoff.'
    }
  ];

  // Initial Study Sessions
  const studySessions = [
    {
      id: 'sess-1',
      date: '2026-10-01',
      track: 'Prime 3.0',
      topic: 'Python Memory & Data Structures',
      durationMinutes: 90,
      notes: 'Deep dive into mutability vs immutability and list internal dynamic array doubling.'
    },
    {
      id: 'sess-2',
      date: '2026-10-01',
      track: 'Individual',
      topic: 'C Compilation Pipeline',
      durationMinutes: 60,
      notes: 'Inspected assembly output using gcc -S and examined symbol table.'
    },
    {
      id: 'sess-3',
      date: '2026-10-01',
      track: 'DSA',
      topic: 'Hash Map Lookups',
      durationMinutes: 45,
      notes: 'Solved Two Sum and analyzed amortized O(1) hash lookup.'
    },
    {
      id: 'sess-4',
      date: '2026-10-01',
      track: 'Revision',
      topic: 'Stack Memory vs Heap',
      durationMinutes: 20,
      notes: 'Reviewed stack frames and allocation lifecycles.'
    }
  ];

  // Initial Goals
  const goals = [
    {
      id: 'g-year',
      type: 'Yearly',
      title: 'Become Highly Skilled & Placement-Ready by 2030 (12-Month Target: Sept 30, 2027)',
      description: 'Master Prime 3.0 AI/ML, complete all 12 core CS roadmap months, solve 250+ DSA problems, deploy 3 strong projects.',
      targetDate: '2027-09-30',
      completed: false,
      progress: 8,
      connectedRoadmapMonth: 'All'
    },
    {
      id: 'g-q1',
      type: 'Quarterly',
      title: 'Q1 Mastery: C Systems Foundations + DSA Fundamentals',
      description: 'Conquer low-level C programming, Big-O analysis, linear DSA, Trees, and first 75 problems.',
      targetDate: '2026-12-31',
      completed: false,
      progress: 15,
      connectedRoadmapMonth: 'October - December 2026'
    },
    {
      id: 'g-m1',
      type: 'Monthly',
      title: 'October Goal: Master C Programming & Developer Environment',
      description: 'Finish all 14 October syllabus topics: pointers, dynamic memory, structs, small C CLI project.',
      targetDate: '2026-10-31',
      completed: false,
      progress: 14,
      connectedRoadmapMonth: 'October 2026'
    },
    {
      id: 'g-w1',
      type: 'Weekly',
      title: 'Week 1 Goal: C Fundamentals + Prime 3.0 Module 1 + 5 DSA Problems',
      description: 'Target: 32 study hours, 5 DSA problems, C memory concepts, and Prime 3.0 Module 1 completion.',
      targetDate: '2026-10-07',
      completed: false,
      progress: 35,
      connectedRoadmapMonth: 'October 2026'
    },
    {
      id: 'g-d1',
      type: 'Daily',
      title: 'Complete Today\'s Plan: Prime 1.2 + C Compilation + Two Sum',
      description: 'Hit target 4 hours of focused study without distractions.',
      targetDate: '2026-10-01',
      completed: true,
      progress: 100,
      connectedRoadmapMonth: 'October 2026'
    }
  ];

  // Weekly Goals Container
  const weeklyGoals = {
    '2026-W40': {
      weekKey: '2026-W40',
      weekLabel: 'Week 1: Oct 1 - Oct 7, 2026',
      targetHours: 32,
      primeGoals: [
        { id: 'wg-p1', text: 'Finish Module 1 Python Deep Dive', done: false },
        { id: 'wg-p2', text: 'Build Functional OOP Banking Simulation', done: false }
      ],
      dsaGoals: [
        { id: 'wg-d1', text: 'Solve 10 Easy/Medium LeetCode problems', done: false },
        { id: 'wg-d2', text: 'Practice Array prefix-sum and two-pointer patterns', done: false }
      ],
      individualGoals: [
        { id: 'wg-i1', text: 'C Pointers, Memory Allocation & Valgrind setup', done: false },
        { id: 'wg-i2', text: 'Linux shell command fluency (grep, find, pipes)', done: true }
      ],
      projectGoals: [
        { id: 'wg-pr1', text: 'Scaffold C Memory Allocator repo & Makefile', done: true }
      ],
      dailyBreakdown: {
        '2026-10-01': { targetHours: 4, actualHours: 3.5, dsaCount: 2, tasksDone: 4, tasksTotal: 6 },
        '2026-10-02': { targetHours: 4, actualHours: 0, dsaCount: 0, tasksDone: 0, tasksTotal: 0 },
        '2026-10-03': { targetHours: 4, actualHours: 0, dsaCount: 0, tasksDone: 0, tasksTotal: 0 },
        '2026-10-04': { targetHours: 8, actualHours: 0, dsaCount: 0, tasksDone: 0, tasksTotal: 0 },
        '2026-10-05': { targetHours: 4, actualHours: 0, dsaCount: 0, tasksDone: 0, tasksTotal: 0 },
        '2026-10-06': { targetHours: 4, actualHours: 0, dsaCount: 0, tasksDone: 0, tasksTotal: 0 },
        '2026-10-07': { targetHours: 4, actualHours: 0, dsaCount: 0, tasksDone: 0, tasksTotal: 0 }
      }
    }
  };

  // Learning Journal Entries
  const journalEntries = [
    {
      id: 'j-1',
      date: '2026-10-01',
      topic: 'Day 1 Launch: Python Memory Mechanics & C Pointer Decays',
      learned: 'Dissected how Python variables are references to objects in memory rather than memory boxes themselves. In C, learned how arrays decay into pointers when passed to functions.',
      built: 'Built a C pointer demonstration program tracing memory addresses of local variables on the call stack.',
      confused: 'Double pointers syntax (**ptr) and when to use them for modifying pointer addresses in called functions.',
      importantConcept: 'Stack allocation is fast and managed automatically by CPU, but heap allocation requires manual lifecycle management via malloc/free.',
      resources: 'K&R C Programming Language Chapter 5; Python 3.12 Data Model documentation.',
      nextAction: 'Practice implementing dynamic array resizing in C using realloc.'
    }
  ];

  // Resources
  const resources = [
    {
      id: 'res-1',
      name: 'Beej\'s Guide to C Programming',
      url: 'https://beej.us/guide/bgc/',
      category: 'Book',
      topic: 'C Fundamentals',
      status: 'In Progress',
      notes: 'The single best approachable guide for pointers and memory.'
    },
    {
      id: 'res-2',
      name: 'NeetCode 150 Roadmap',
      url: 'https://neetcode.io/roadmap',
      category: 'Problem',
      topic: 'DSA Practice',
      status: 'Active',
      notes: 'Systematic DSA progression mapped to patterns.'
    },
    {
      id: 'res-3',
      name: 'Scikit-Learn User Guide',
      url: 'https://scikit-learn.org/stable/user_guide.html',
      category: 'Documentation',
      topic: 'Prime 3.0 ML',
      status: 'Reference',
      notes: 'Official documentation for estimators, transformers, and pipelines.'
    },
    {
      id: 'res-4',
      name: 'Operating Systems: Three Easy Pieces (OSTEP)',
      url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
      category: 'Book',
      topic: 'Operating Systems (March 2027)',
      status: 'Bookmarked',
      notes: 'Essential reading for OS processes, virtualization, and concurrency.'
    }
  ];

  // Past Reviews Archive
  const weeklyReviews = [
    {
      id: 'rev-w39',
      weekLabel: 'Week 39: Orientation & Setup (Sept 24 - Sept 30, 2026)',
      date: '2026-09-30',
      answers: {
        q1_learned: 'Set up Linux development environment, installed gcc, gdb, python 3.12, and configured VS Code.',
        q2_built: 'Initial development workspace and Git configuration.',
        q3_dsaCount: '3 problems (Two Sum, Valid Parentheses, Stock Buy/Sell).',
        q4_strugglingWith: 'Pointer arithmetic syntax and remembering edge cases in stack operations.',
        q5_failedToComplete: 'Did not finish reading the second chapter of K&R.',
        q6_whyFailed: 'Underestimated time spent installing and testing Linux toolchains.',
        q7_nextPriority: 'Start Day 1 of the 12-Month OS on Oct 1 with full momentum.'
      },
      stats: {
        studyHours: 12.5,
        primeHours: 4.0,
        individualHours: 5.0,
        dsaProblems: 3,
        projectHours: 2.0,
        githubCommits: 5,
        tasksCompleted: 8,
        tasksSkipped: 1,
        longestStreak: 3
      },
      summary: 'Solid onboarding week. Toolchains configured and initial DSA solved. Ready for October 1 kickoff.'
    }
  ];

  return {
    user: {
      name: 'Akshay',
      role: '1st Year B.Tech Computer Science, AI/ML Specialization',
      careerDirection: 'AI/ML + Software Engineering + Placement Preparation',
      mainGoal: 'Become highly skilled and placement-ready by 2030.',
      targetStartDate: '2026-10-01',
      targetEndDate: '2027-09-30',
      activeDate: '2026-10-01', // User can change active date or test today
      theme: 'dark' // 'dark' | 'light'
    },
    studySchedule: {
      weekdayHours: 4.0, // Mon-Fri
      saturdayHours: 4.0,
      sundayHours: 8.0,
      defaultAllocations: {
        primeHours: 1.5,
        dsaHours: 1.0,
        individualHours: 1.0,
        revisionProjectHours: 0.5
      }
    },
    notifications: {
      morningEnabled: true,
      eveningEnabled: true,
      sundayEnabled: true,
      monthEndEnabled: true,
      dismissedIds: []
    },
    habits: HABIT_DEFINITIONS,
    habitLogs,
    dailyTasks: initialTasks,
    primeLessons,
    roadmapMonths,
    // Phase 2 Relational Roadmap Database Entities
    roadmap_year: INITIAL_ROADMAP_YEAR,
    roadmap_months: INITIAL_ROADMAP_MONTHS,
    roadmap_topics: INITIAL_ROADMAP_TOPICS,
    roadmap_subtopics: INITIAL_ROADMAP_SUBTOPICS,
    prime_topics: PRIME_3_TOPICS_LIST,
    prime_modules: PRIME_3_MODULES_HIERARCHY,
    dsaProblems,
    projects,
    revisionItems,
    studySessions,
    goals,
    weeklyGoals,
    journalEntries,
    resources,
    weeklyReviews,
    monthlyReviews: []
  };
}

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
import { JAVA_PLAYLIST_VIDEOS } from './javaData.js';

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


  // Roadmap month records
  const roadmapMonths = INDIVIDUAL_ROADMAP_MONTHS.map(m => ({
    ...m,
    status: m.monthIndex === 0 ? 'Current' : 'Upcoming', // Upcoming | Current | On Track | Needs Attention | Completed
    completedTopics: [],
    hoursLogged: 0,
    completionPercentage: 0
  }));

  // Initial Daily Tasks for Oct 1, 2026 (Structured according to Phase 3 sections and sources)
  const initialTasks = [
    {
      id: 'task-101',
      date: '2026-10-01',
      dueDate: '2026-10-01',
      section: 'PRIME 3.0',
      track: 'Prime 3.0',
      title: 'Complete Prime 3.0: Python Environment Setup & Syntax',
      description: 'Python environment setup, Jupyter notebooks, variables, data structures, and core syntax.',
      source: 'Prime 3.0 → Module 1: Python Foundations',
      durationMinutes: 90,
      priority: 'Critical',
      status: 'Pending',
      completed: false,
      completion_date: null,
      completion_time: null,
      completed_at: null,
      actual_minutes: 0,
      related_prime_topic_id: 'prime-top-1',
      subtasks: [
        { id: 'st-p1', title: 'Course lesson & video breakdown', completed: false },
        { id: 'st-p2', title: 'Take structured notes', completed: false },
        { id: 'st-p3', title: 'Coding / practice along in Jupyter', completed: false },
        { id: 'st-p4', title: 'Quick concept revision', completed: false }
      ]
    },
    {
      id: 'task-102',
      date: '2026-10-01',
      dueDate: '2026-10-01',
      section: 'INDIVIDUAL LEARNING',
      track: 'Individual',
      category: 'LEARN',
      subtype: 'INDIVIDUAL',
      is_java_task: true,
      is_java_playlist: true,
      video_number: 1,
      title: 'Java — Video/Lesson 1: Introduction to Java Language | Lecture 1',
      description: 'Introduction to Java Language | Lecture 1 | Complete Placement Course (18:46)',
      source: 'JAVA — PLAYLIST TRACK (Video 1)',
      durationMinutes: 19,
      priority: 'Normal',
      status: 'Pending',
      completed: false,
      completion_date: null,
      completion_time: null,
      completed_at: null,
      actual_minutes: 0,
      related_roadmap_topic_id: 'top-oct-1',
      subtasks: [
        { id: 'st-i1', title: 'Watch Lecture 1: Java Intro, JDK/JRE/JVM', completed: false },
        { id: 'st-i2', title: 'Install JDK & verify first Hello World', completed: false },
        { id: 'st-i3', title: 'Notes on bytecode & memory structure', completed: false }
      ]
    },
    {
      id: 'task-103',
      date: '2026-10-01',
      dueDate: '2026-10-01',
      section: 'DSA',
      track: 'DSA',
      category: 'PRACTICE',
      subtype: 'DSA',
      title: 'DSA Playlist: Lecture 1 — Flowcharts & Pseudocode',
      description: 'Apna College C++ DSA Playlist Lecture 1.',
      source: 'DSA Weekly Goal',
      durationMinutes: 60,
      priority: 'High',
      status: 'Pending',
      completed: false,
      completion_date: null,
      completion_time: null,
      actual_minutes: 0,
      subtasks: [
        { id: 'st-d1', title: 'Watch Lecture 1', completed: false },
        { id: 'st-d2', title: 'Practice pseudocode in notebook', completed: false }
      ]
    },
    {
      id: 'task-2026-10-01-dsa-prob',
      date: '2026-10-01',
      dueDate: '2026-10-01',
      section: 'DSA',
      track: 'DSA',
      category: 'PRACTICE',
      subtype: 'DSA',
      title: 'Solve DSA Practice Problem in C++ (LeetCode / Playlist Exercise)',
      description: 'Solve first practice problem in C++.',
      source: 'DSA Practice',
      durationMinutes: 45,
      priority: 'High',
      status: 'Pending',
      completed: false,
      completion_date: null,
      completion_time: null,
      actual_minutes: 0,
      subtasks: []
    },
    {
      id: 'task-104',
      date: '2026-10-01',
      dueDate: '2026-10-01',
      section: 'PROJECT',
      track: 'Project',
      category: 'BUILD',
      subtype: 'PROJECT',
      title: 'Project: Java CLI Application - Model Architecture & CLI Menu',
      description: 'Design and test Java record/class structures and console menu navigation loop.',
      source: 'Active Project: Java CLI Application & Data Manager',
      durationMinutes: 60,
      priority: 'Normal',
      status: 'Not Started',
      completed: false,
      related_project_id: 'proj-1',
      subtasks: [
        { id: 'st-pr1', title: "Today's project task: Header struct", completed: false }
      ]
    },
    {
      id: 'task-105',
      date: '2026-10-01',
      dueDate: '2026-10-01',
      section: 'REVISION',
      track: 'Revision',
      category: 'REVISE',
      subtype: 'REVISION',
      title: "Revision: Review Today's DSA Concepts & Semester Answers",
      description: 'Review notes, edge cases, and core concepts.',
      source: 'Spaced Revision Queue',
      durationMinutes: 20,
      priority: 'Normal',
      status: 'Not Started',
      completed: false,
      related_revision_id: 'rev-1',
      subtasks: [
        { id: 'st-r1', title: 'Review due topic notes & edge cases', completed: false }
      ]
    },
    {
      id: 'task-2026-10-01-exercise',
      date: '2026-10-01',
      dueDate: '2026-10-01',
      section: 'HEALTH',
      track: 'Exercise',
      category: 'HEALTH',
      subtype: 'EXERCISE',
      title: 'Exercise — 30 minutes',
      description: 'Daily 30-minute health & exercise routine.',
      source: 'Daily Health Cadence',
      durationMinutes: 30,
      priority: 'Normal',
      status: 'Pending',
      completed: false,
      completion_date: null,
      completion_time: null,
      completed_at: null,
      actual_minutes: 0,
      subtasks: []
    },
    {
      id: 'task-106',
      date: '2026-10-01',
      dueDate: '2026-10-01',
      section: 'OPTIONAL',
      track: 'GitHub',
      title: 'GitHub & Extra Practice: Commit day 1 code and update repo log',
      description: 'Document today\'s learnings and push repo commits (not mandatory).',
      source: 'Optional Daily Cadence',
      durationMinutes: 15,
      priority: 'Low',
      status: 'Pending',
      completed: false,
      completion_date: null,
      completion_time: null,
      completed_at: null,
      actual_minutes: 0,
      subtasks: []
    }
  ];

  // Initial Habits Log for Oct 1, 2026 (Starts empty)
  const habitLogs = {};

  // Phase 5 DSA Database Entities (Initialized without fake solved problems per Section 39)
  const dsaProblems = [];

  // Pre-seeded Projects (Phase 6 Project Management & Portfolio Engine)
  const projects = [
    {
      id: 'proj-1',
      name: 'Java CLI Application & Data Manager',
      title: 'Java CLI Application & Data Manager',
      short_description: 'A structured command-line data management and record processing application built in modern Java demonstrating OOP, robust exception handling, and file persistence.',
      description: 'A structured command-line data management and record processing application built in modern Java demonstrating OOP, robust exception handling, and file persistence.',
      type: 'Small Project',
      category: 'Learning Projects',
      difficulty: 'Intermediate',
      priority: 'High',
      portfolio_priority: 'Medium',
      startDate: '2026-10-01',
      start_date: '2026-10-01',
      deadline: '2026-10-31',
      target_date: '2026-10-31',
      actual_completion_date: null,
      status: 'Planned',
      portfolio_status: 'In Progress',
      progress: 0,
      problem_statement: 'Building practical Java fluency requires working with collections, file I/O streams, and clean object-oriented architecture without heavy frameworks.',
      goal: 'Deliver a modular, crash-resilient console application with full CRUD operations, search filtering, and persistent data storage.',
      target_users: 'Command-line tool users, Java developers, Technical interviewers.',
      expected_outcome: 'Production-tested Java application with clean architecture, unit tests, and comprehensive documentation.',
      notes: 'Roadmap Milestone: Week 4 of October 2026.',
      roadmap_topic_id: 'top-oct-14',
      technology: 'Java, Maven/Gradle, JUnit, File I/O',
      githubUrl: 'https://github.com/akshay/java-cli-datamanager',
      liveUrl: '',
      readmeStatus: 'Drafted',
      deploymentStatus: 'Local CLI',
      tasks: [
        { id: 'pt-1', title: 'Research memory heap management & sbrk/mmap', completed: false },
        { id: 'pt-2', title: 'Design block header metadata struct', completed: false },
        { id: 'pt-3', title: 'Setup Makefile and test harnesses', completed: false },
        { id: 'pt-4', title: 'Implement custom malloc with first-fit search', completed: false },
        { id: 'pt-5', title: 'Implement custom free with block merging', completed: false },
        { id: 'pt-6', title: 'Write unit tests and benchmark vs glibc malloc', completed: false },
        { id: 'pt-7', title: 'Valgrind zero-leak validation', completed: false },
        { id: 'pt-8', title: 'Complete comprehensive README with benchmark charts', completed: false },
        { id: 'pt-9', title: 'GitHub release tag v1.0', completed: false }
      ],
      created_at: '2026-10-01T08:00:00.000Z',
      updated_at: '2026-10-01T12:00:00.000Z'
    },
    {
      id: 'proj-2',
      name: 'End-to-End Supervised ML Pipeline',
      title: 'End-to-End Supervised ML Pipeline',
      short_description: 'Complete production ML pipeline predicting customer churn with data preprocessing, model selection, hyperparameter tuning and Flask API.',
      description: 'Complete production ML pipeline predicting customer churn with data preprocessing, model selection, hyperparameter tuning and Flask API.',
      type: 'AI/ML Project',
      category: 'AI/ML Projects',
      difficulty: 'Intermediate',
      priority: 'Critical',
      portfolio_priority: 'High',
      startDate: '2026-11-15',
      start_date: '2026-11-15',
      deadline: '2026-12-20',
      target_date: '2026-12-20',
      actual_completion_date: null,
      status: 'Planned',
      portfolio_status: 'Not Ready',
      progress: 0,
      problem_statement: 'High customer churn in SaaS platforms causes revenue loss. A reproducible pipeline is needed to ingest raw event logs and output real-time churn probability.',
      goal: 'Achieve ROC-AUC > 0.88 with reproducible sklearn ColumnTransformer pipelines.',
      target_users: 'Product analytics and customer retention teams.',
      expected_outcome: 'Containerized Flask microservice serving sub-50ms predictions.',
      notes: 'Connected to Prime 3.0 Module 8 & Roadmap Strong ML Project.',
      roadmap_topic_id: 'top-sep-8',
      technology: 'Python, Scikit-Learn, Pandas, Flask, Docker',
      githubUrl: 'https://github.com/akshay/ml-churn-pipeline',
      liveUrl: '',
      readmeStatus: 'Planned',
      deploymentStatus: 'Containerized',
      tasks: [
        { id: 'pt-11', title: 'Dataset ingestion and exploratory data analysis', completed: false },
        { id: 'pt-12', title: 'Feature engineering pipeline with ColumnTransformer', completed: false },
        { id: 'pt-13', title: 'Model benchmarking (Logistic, XGBoost, Random Forest)', completed: false },
        { id: 'pt-14', title: 'Threshold optimization for Precision-Recall tradeoff', completed: false },
        { id: 'pt-15', title: 'Flask REST endpoint serving model predictions', completed: false },
        { id: 'pt-16', title: 'Docker containerization and health checks', completed: false }
      ],
      created_at: '2026-10-01T08:00:00.000Z',
      updated_at: '2026-10-01T08:00:00.000Z'
    },
    {
      id: 'proj-3',
      name: 'Enterprise Multi-Document RAG Agent',
      title: 'Enterprise Multi-Document RAG Agent',
      short_description: 'Production-ready RAG application indexing technical documentation with ChromaDB, hybrid search (BM25 + Dense embeddings) and citation synthesis.',
      description: 'Production-ready RAG application indexing technical documentation with ChromaDB, hybrid search (BM25 + Dense embeddings) and citation synthesis.',
      type: 'GenAI/LLM Project',
      category: 'GenAI Projects',
      difficulty: 'Advanced',
      priority: 'Critical',
      portfolio_priority: 'High',
      startDate: '2027-04-01',
      start_date: '2027-04-01',
      deadline: '2027-05-30',
      target_date: '2027-05-30',
      actual_completion_date: null,
      status: 'Idea',
      portfolio_status: 'Not Ready',
      progress: 0,
      problem_statement: 'Engineering teams struggle with hallucinated answers and out-of-date internal wiki search.',
      goal: 'Build an accurate RAG agent with source attribution citations and sub-second retrieval.',
      target_users: 'Software engineering teams, enterprise knowledge workers.',
      expected_outcome: 'FastAPI streaming backend and client UI deployed on cloud.',
      notes: 'Roadmap Milestone: Month 7 Prime 3.0 GenAI & LLMs.',
      roadmap_topic_id: 'top-sep-10',
      technology: 'Python, FastAPI, OpenAI API, LangChain, ChromaDB, Docker',
      githubUrl: '',
      liveUrl: '',
      readmeStatus: 'Planned',
      deploymentStatus: 'Not Deployed',
      tasks: [
        { id: 'pt-21', title: 'Research chunking strategies & embedding benchmarks', completed: false },
        { id: 'pt-22', title: 'Set up vector store and ingestion pipeline', completed: false },
        { id: 'pt-23', title: 'Implement hybrid retrieval and re-ranking', completed: false },
        { id: 'pt-24', title: 'FastAPI streaming backend and client UI', completed: false }
      ],
      created_at: '2026-10-01T08:00:00.000Z',
      updated_at: '2026-10-01T08:00:00.000Z'
    }
  ];

  // Normalized Phase 6 Project Tasks (Sections 10, 11)
  const projectTasks = [
    { id: 'pt-1', project_id: 'proj-1', milestone_id: 'pms-1-1', title: 'Research memory heap management & sbrk/mmap', status: 'Not Started', priority: 'High', estimated_hours: 4, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-2', project_id: 'proj-1', milestone_id: 'pms-1-1', title: 'Design block header metadata struct', status: 'Not Started', priority: 'Critical', estimated_hours: 3, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-3', project_id: 'proj-1', milestone_id: 'pms-1-1', title: 'Setup Makefile and test harnesses', status: 'Not Started', priority: 'Normal', estimated_hours: 2, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-4', project_id: 'proj-1', milestone_id: 'pms-1-2', title: 'Implement custom malloc with first-fit search', status: 'Not Started', priority: 'Critical', estimated_hours: 6, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-5', project_id: 'proj-1', milestone_id: 'pms-1-2', title: 'Implement custom free with block merging', status: 'Not Started', priority: 'Critical', estimated_hours: 5, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-6', project_id: 'proj-1', milestone_id: 'pms-1-3', title: 'Write unit tests and benchmark vs glibc malloc', status: 'Not Started', priority: 'Normal', estimated_hours: 4, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-7', project_id: 'proj-1', milestone_id: 'pms-1-3', title: 'Valgrind zero-leak validation', status: 'Not Started', priority: 'High', estimated_hours: 3, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-8', project_id: 'proj-1', milestone_id: 'pms-1-4', title: 'Complete comprehensive README with benchmark charts', status: 'Not Started', priority: 'Normal', estimated_hours: 3, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-9', project_id: 'proj-1', milestone_id: 'pms-1-4', title: 'GitHub release tag v1.0', status: 'Not Started', priority: 'Low', estimated_hours: 1, actual_hours: 0, completed: false, completed_at: null },
    // Proj 2
    { id: 'pt-11', project_id: 'proj-2', milestone_id: 'pms-2-1', title: 'Dataset ingestion and exploratory data analysis', status: 'Not Started', priority: 'Normal', estimated_hours: 4, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-12', project_id: 'proj-2', milestone_id: 'pms-2-1', title: 'Feature engineering pipeline with ColumnTransformer', status: 'Not Started', priority: 'High', estimated_hours: 5, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-13', project_id: 'proj-2', milestone_id: 'pms-2-2', title: 'Model benchmarking (Logistic, XGBoost, Random Forest)', status: 'Not Started', priority: 'Critical', estimated_hours: 6, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-14', project_id: 'proj-2', milestone_id: 'pms-2-2', title: 'Threshold optimization for Precision-Recall tradeoff', status: 'Not Started', priority: 'High', estimated_hours: 3, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-15', project_id: 'proj-2', milestone_id: 'pms-2-3', title: 'Flask REST endpoint serving model predictions', status: 'Not Started', priority: 'Normal', estimated_hours: 4, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-16', project_id: 'proj-2', milestone_id: 'pms-2-3', title: 'Docker containerization and health checks', status: 'Not Started', priority: 'Normal', estimated_hours: 3, actual_hours: 0, completed: false, completed_at: null },
    // Proj 3
    { id: 'pt-21', project_id: 'proj-3', milestone_id: 'pms-3-1', title: 'Research chunking strategies & embedding benchmarks', status: 'Not Started', priority: 'High', estimated_hours: 4, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-22', project_id: 'proj-3', milestone_id: 'pms-3-1', title: 'Set up vector store and ingestion pipeline', status: 'Not Started', priority: 'Critical', estimated_hours: 6, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-23', project_id: 'proj-3', milestone_id: 'pms-3-2', title: 'Implement hybrid retrieval and re-ranking', status: 'Not Started', priority: 'Critical', estimated_hours: 6, actual_hours: 0, completed: false, completed_at: null },
    { id: 'pt-24', project_id: 'proj-3', milestone_id: 'pms-3-3', title: 'FastAPI streaming backend and client UI', status: 'Not Started', priority: 'High', estimated_hours: 8, actual_hours: 0, completed: false, completed_at: null }
  ];

  // Milestones (Section 12)
  const projectMilestones = [
    { id: 'pms-1-1', project_id: 'proj-1', title: 'Milestone 1: Architectural Design & Harnesses', target_date: '2026-10-07', status: 'Planned', progress: 0 },
    { id: 'pms-1-2', project_id: 'proj-1', title: 'Milestone 2: Allocation & Free Core Logic', target_date: '2026-10-18', status: 'Planned', progress: 0 },
    { id: 'pms-1-3', project_id: 'proj-1', title: 'Milestone 3: Benchmark Validation & Leak Checks', target_date: '2026-10-25', status: 'Planned', progress: 0 },
    { id: 'pms-1-4', project_id: 'proj-1', title: 'Milestone 4: Documentation & GitHub Release', target_date: '2026-10-31', status: 'Planned', progress: 0 },
    // Proj 2
    { id: 'pms-2-1', project_id: 'proj-2', title: 'Milestone 1: Data Ingestion & Preprocessing Pipeline', target_date: '2026-11-25', status: 'Planned', progress: 0 },
    { id: 'pms-2-2', project_id: 'proj-2', title: 'Milestone 2: Model Training & Evaluation', target_date: '2026-12-05', status: 'Planned', progress: 0 },
    { id: 'pms-2-3', project_id: 'proj-2', title: 'Milestone 3: REST API & Docker Containerization', target_date: '2026-12-20', status: 'Planned', progress: 0 }
  ];

  // Technologies (Section 9)
  const projectTechnologies = [
    { id: 'tech-1', project_id: 'proj-1', category: 'Languages', name: 'C' },
    { id: 'tech-2', project_id: 'proj-1', category: 'DevOps', name: 'Linux' },
    { id: 'tech-3', project_id: 'proj-1', category: 'DevOps', name: 'Valgrind' },
    { id: 'tech-4', project_id: 'proj-1', category: 'DevOps', name: 'Make' },
    { id: 'tech-5', project_id: 'proj-1', category: 'DevOps', name: 'GDB' },
    { id: 'tech-6', project_id: 'proj-2', category: 'Languages', name: 'Python' },
    { id: 'tech-7', project_id: 'proj-2', category: 'AI/ML', name: 'Scikit-learn' },
    { id: 'tech-8', project_id: 'proj-2', category: 'AI/ML', name: 'Pandas' },
    { id: 'tech-9', project_id: 'proj-2', category: 'Backend', name: 'Flask' },
    { id: 'tech-10', project_id: 'proj-2', category: 'DevOps', name: 'Docker' }
  ];

  // GitHub Checklists (Sections 20, 21, 22)
  const projectGithub = {
    'proj-1': {
      repo_url: 'https://github.com/akshay/c-memory-allocator',
      repo_name: 'c-memory-allocator',
      visibility: 'Public',
      branch: 'main',
      last_updated: '2026-10-01T14:30:00.000Z',
      status: 'Active',
      github_ready_checklist: {
        repo_created: true,
        meaningful_name: true,
        readme_added: true,
        gitignore_added: true,
        clean_structure: true,
        dependencies_documented: true,
        env_documented: false,
        screenshots_added: false,
        installation_instructions: true,
        usage_instructions: false,
        license_added: true,
        final_code_pushed: false
      },
      readme_checklist: {
        title: true,
        problem_statement: true,
        features: true,
        tech_stack: true,
        architecture: false,
        installation: true,
        usage: false,
        screenshots: false,
        demo: false,
        future_improvements: false
      }
    },
    'proj-2': {
      repo_url: 'https://github.com/akshay/ml-churn-pipeline',
      repo_name: 'ml-churn-pipeline',
      visibility: 'Public',
      branch: 'main',
      last_updated: '2026-10-01T09:00:00.000Z',
      status: 'Created',
      github_ready_checklist: {
        repo_created: true,
        meaningful_name: true,
        readme_added: true,
        gitignore_added: true,
        clean_structure: false,
        dependencies_documented: false,
        env_documented: false,
        screenshots_added: false,
        installation_instructions: false,
        usage_instructions: false,
        license_added: true,
        final_code_pushed: false
      },
      readme_checklist: {
        title: true,
        problem_statement: true,
        features: false,
        tech_stack: true,
        architecture: false,
        installation: false,
        usage: false,
        screenshots: false,
        demo: false,
        future_improvements: false
      }
    }
  };

  // Deployments (Sections 23, 24)
  const projectDeployments = [
    {
      id: 'dep-1',
      project_id: 'proj-1',
      platform: 'Docker',
      url: 'https://github.com/akshay/c-memory-allocator/releases',
      deployment_date: '2026-10-01',
      environment: 'Development',
      status: 'Not Deployed',
      checklist: {
        prod_build: true,
        env_vars: true,
        db_connected: true,
        api_working: true,
        frontend_working: true,
        error_handling: true,
        mobile_tested: false,
        desktop_tested: true,
        prod_url_working: false
      }
    }
  ];

  // Testing (Section 25)
  const projectTests = [
    { id: 'test-func-1', project_id: 'proj-1', category: 'Functionality', name: 'Malloc & Free Basic Cycle', status: 'Pass', notes: 'Successfully passed 10,000 malloc/free sequential cycles without segfault.' },
    { id: 'test-mem-1', project_id: 'proj-1', category: 'Performance', name: 'Valgrind Zero-Leak Run', status: 'Pass', notes: 'All heap blocks freed; 0 errors from 0 contexts.' },
    { id: 'test-stress-1', project_id: 'proj-1', category: 'Database', name: 'Memory Overhead & Fragmentation', status: 'Not Tested', notes: 'Run coalescence benchmark under randomized chunk sizes.' }
  ];

  // Documentation (Sections 26, 27)
  const projectDocumentation = {
    'proj-1': {
      problem: 'Building robust console applications in Java requires mastering object modeling, file stream I/O, and structured error handling.',
      solution: 'Interactive CLI data management application utilizing OOP principles, custom exceptions, and serialization for file persistence.',
      architecture: 'CLI Driver -> Service Layer -> Domain Models -> File Storage Repository.',
      tech_choices: 'Java 21 for modern syntax and records; JUnit 5 for unit testing; Standard java.nio for file I/O.',
      implementation: 'Separation of concerns between terminal I/O, business validation, and persistent file storage.',
      challenges: 'Handling malformed input and corrupted records without crashing the interactive loop.',
      solutions: 'Custom unchecked exceptions and graceful validation recovery with user feedback.',
      results: 'Achieved 95% test coverage across core model validation and file persistence handlers.',
      future_improvements: 'Add JSON export/import and SQLite backend option.',
      architecture_components: 'Console UI, Validation Engine, Repository Layer, Storage Serializer',
      architecture_data_flow: 'user input -> command parser -> controller -> repository -> file system',
      architecture_image_ref: ''
    }
  };

  // Challenges (Section 29)
  const projectChallenges = [
    {
      id: 'chal-1',
      project_id: 'proj-1',
      problem: 'Coalescence of adjacent free chunks caused pointer corruption when merging the head of the free list.',
      what_i_tried: 'Traversing the entire heap linearly from the base pointer on every free call.',
      final_solution: 'Added explicit previous pointer in free blocks (explicit free list) instead of implicit traversal.',
      what_i_learned: 'Explicit free lists trade 8 bytes of overhead per block for an O(free blocks) speedup instead of O(all blocks).',
      date: '2026-10-01'
    }
  ];

  // Learning Logs (Sections 28, 48)
  const projectLearningLogs = [
    {
      id: 'llog-1',
      project_id: 'proj-1',
      date: '2026-10-01',
      title: 'Virtual Memory & System Break (brk/sbrk)',
      content: 'Learned how the Linux kernel maps memory pages on demand. Calling sbrk increments the program break, but pages are actually faulted into physical RAM only upon first write.'
    }
  ];

  // Portfolio & Resume (Sections 30, 31, 32, 42)
  const projectPortfolio = {
    'proj-1': {
      demo_url: '',
      video_url: '',
      screenshots: '',
      presentation_file_ref: '',
      presentation_notes: 'Highlight block coalescence and benchmarking charts during technical interviews.',
      quality_check: {
        code_quality: 'Ready',
        functionality: 'Needs Work',
        documentation: 'Ready',
        github: 'Ready',
        deployment: 'Not Checked',
        testing: 'Needs Work',
        presentation: 'Not Checked'
      },
      portfolio_readiness_checklist: {
        working_project: true,
        github_repo: true,
        clean_code: true,
        readme: true,
        screenshots: false,
        demo_video: false,
        deployment: false,
        architecture_doc: true,
        challenges_doc: true,
        results_doc: true,
        portfolio_desc: true,
        resume_bullets: true
      }
    }
  };

  const projectResume = {
    'proj-1': {
      title: 'Java CLI Application & Data Manager',
      one_line_description: 'Modular command-line data management tool in Java with robust OOP design, file persistence, and automated test coverage.',
      technologies: 'Java, JUnit 5, File I/O, Git',
      achievement_result: 'Designed full CRUD and search operations with 95% unit test coverage and resilient exception handling.',
      project_url: '',
      github_url: 'https://github.com/akshay/java-cli-datamanager',
      resume_ready: true
    }
  };

  // Activity Log (Section 39)
  const projectActivity = [
    { id: 'act-1', project_id: 'proj-1', timestamp: '2026-10-01T08:00:00.000Z', action_type: 'status_changed', description: 'Project initialized in Building state' },
    { id: 'act-2', project_id: 'proj-1', timestamp: '2026-10-01T10:00:00.000Z', action_type: 'task_completed', description: 'Completed task: "Research memory heap management & sbrk/mmap"' },
    { id: 'act-3', project_id: 'proj-1', timestamp: '2026-10-01T12:00:00.000Z', action_type: 'task_completed', description: 'Completed task: "Design block header metadata struct"' },
    { id: 'act-4', project_id: 'proj-1', timestamp: '2026-10-01T14:00:00.000Z', action_type: 'task_completed', description: 'Completed task: "Setup Makefile and test harnesses"' },
    { id: 'act-5', project_id: 'proj-1', timestamp: '2026-10-01T14:15:00.000Z', action_type: 'milestone_completed', description: 'Completed Milestone 1: Architectural Design & Harnesses' }
  ];

  // Project Ideas Incubator (Section 44)
  const projectIdeas = [
    {
      id: 'idea-1',
      name: 'ClientHunter AI - Intelligent B2B Lead Filtering',
      problem: 'Sales teams spend 15+ hours weekly qualifying incoming inbound leads and manually scraping company metadata.',
      category: 'AI/ML Projects',
      difficulty: 'Intermediate',
      potential_technologies: 'Python, FastAPI, LangChain, BeautifulSoup, PostgreSQL',
      why_useful: 'High-value real-world SaaS automation with clear ROI metric for placement resume.',
      notes: 'Can integrate with LinkedIn scraping and automated enrichment APIs.',
      converted_to_project_id: null
    }
  ];

  // ==========================================
  // PHASE 7: CAREER & INTERNSHIP PREPARATION (Section 47)
  // ==========================================
  const careerProfile = {
    full_name: 'Akshay',
    headline: 'Aspiring AI/ML Engineer & Systems Software Developer',
    bio: '1st Year B.Tech Computer Science student specializing in AI/ML. Building production-grade AI systems, solid low-level systems programming in C, algorithmic problem solving in DSA, and end-to-end cloud deployments.',
    location: 'Bangalore, India',
    education: 'B.Tech in Computer Science and Engineering (AI/ML)',
    degree: 'B.Tech',
    university: 'Technological University',
    graduation_year: 2030,
    skills: {
      programming: ['Python', 'C', 'C++', 'JavaScript', 'SQL'],
      aiml: ['NumPy', 'Pandas', 'Scikit-learn', 'PyTorch', 'Data Pre-processing', 'Transformers', 'Hugging Face'],
      data: ['PostgreSQL', 'MySQL', 'Data Modeling', 'Query Optimization', 'Supabase'],
      backend: ['FastAPI', 'Node.js', 'REST APIs', 'Express'],
      cloud: ['Docker', 'AWS (Foundations)', 'Vercel', 'Render', 'Linux'],
      tools: ['Git', 'GitHub', 'Bash', 'VS Code', 'GDB', 'Make']
    },
    updated_at: '2026-09-26T00:00:00.000Z'
  };

  const careerChecklist = {
    dsa_foundation: false,
    core_cs_prep: false,
    strong_projects: false,
    active_github: true,
    resume_prepared: false,
    linkedin_prepared: false,
    portfolio_website: false,
    coding_profiles: true,
    internship_applications: false,
    mock_interviews: false,
    aptitude_practice: false,
    technical_interview_prep: false
  };

  const resumeVersions = [
    {
      id: 'res-v1',
      version_name: 'Resume v1 - 1st Year Core Draft',
      date_created: '2026-09-26',
      date_updated: '2026-09-26',
      status: 'Draft',
      file_url: '',
      notes: 'Initial 1st-year draft focusing on Java fundamentals, C++ DSA, and early AI/ML foundations'
    }
  ];

  const resumeChecklist = {
    education_updated: true,
    skills_updated: true,
    dsa_profile_links: true,
    projects_added: false,
    github_added: true,
    internship_experience: false,
    hackathon_experience: false,
    achievements: false,
    certifications: false,
    contact_info: true,
    formatting_reviewed: false,
    pdf_generated: false
  };

  const codingProfiles = [
    { platform: 'LeetCode', username: 'akshay_code', url: 'https://leetcode.com/u/akshay_code', problems_solved: 0, last_activity: '2026-10-01', notes: 'Primary platform: NeetCode 150 & Striver A2Z' },
    { platform: 'Codeforces', username: 'akshay_cf', url: 'https://codeforces.com/profile/akshay_cf', problems_solved: 0, last_activity: '', notes: 'Targeting Div 3 & Div 4 contests' },
    { platform: 'GeeksforGeeks', username: 'akshay_gfg', url: 'https://auth.geeksforgeeks.org/user/akshay_gfg', problems_solved: 0, last_activity: '', notes: 'Core CS interview problem sets' },
    { platform: 'CodeChef', username: 'akshay_cc', url: 'https://www.codechef.com/users/akshay_cc', problems_solved: 0, last_activity: '', notes: 'Weekly Starters contests' },
    { platform: 'HackerRank', username: 'akshay_hr', url: 'https://www.hackerrank.com/akshay_hr', problems_solved: 0, last_activity: '', notes: 'Language verification badges' }
  ];

  const githubProfile = {
    username: 'akshay-dev',
    profile_url: 'https://github.com/akshay-dev',
    bio: '1st Year B.Tech CSE (AI/ML) · Building real systems from scratch',
    pinned_projects: ['proj-1'],
    checklist: {
      profile_complete: true,
      profile_photo: true,
      bio: true,
      pinned_projects: true,
      clean_repositories: true,
      readme_files: true,
      meaningful_commits: true,
      project_documentation: true,
      open_source_contribution: false
    }
  };

  const linkedinProfile = {
    profile_url: 'https://linkedin.com/in/akshay-dev',
    headline: 'B.Tech CS (AI/ML) | DSA & Systems Enthusiast',
    about: 'Passionate computer science student focused on AI/ML and low-level systems engineering.',
    skills: ['Java Programming', 'Data Structures (C++)', 'Python', 'FastAPI', 'Machine Learning'],
    projects: ['Java CLI Application & Data Manager'],
    experience: [],
    education: 'B.Tech in Computer Science and Engineering (AI/ML), 2026 - 2030',
    certifications: [],
    checklist: {
      profile_created: true,
      headline_updated: true,
      about_section: true,
      education: true,
      skills: true,
      projects: false,
      github: true,
      portfolio: false,
      achievements: false
    }
  };

  const careerAchievements = [];
  const careerCertifications = [];
  const careerInternships = [];
  const careerApplications = [];
  const applicationEvents = [];
  const applicationFollowups = [];
  const careerOutreach = [];
  const careerReferrals = [];
  const careerNetworking = [];
  const aptitudeSessions = [];

  const technicalTopics = [
    { topic_key: 'dsa', name: 'DSA', category: 'Algorithms', status: 'Learning', questions_practiced: 0, notes: 'Arrays, Pointers, Stack, Queue, Binary Search, Trees, Graphs, DP', revision_date: '', confidence_note: 'Active Phase 5 foundation' },
    { topic_key: 'oop', name: 'OOP', category: 'Core CS', status: 'Not Started', questions_practiced: 0, notes: 'Encapsulation, Inheritance, Polymorphism, Abstraction, SOLID principles, Design Patterns', revision_date: '', confidence_note: '' },
    { topic_key: 'dbms', name: 'DBMS', category: 'Core CS', status: 'Not Started', questions_practiced: 0, notes: 'ACID properties, Transactions, Concurrency Control, Normalization, Indexing (B-Trees)', revision_date: '', confidence_note: '' },
    { topic_key: 'sql', name: 'SQL', category: 'Core CS', status: 'Not Started', questions_practiced: 0, notes: 'Joins, Aggregations, Subqueries, Window Functions, CTEs, Execution Plans', revision_date: '', confidence_note: '' },
    { topic_key: 'os', name: 'OS', category: 'Core CS', status: 'Not Started', questions_practiced: 0, notes: 'Processes vs Threads, CPU Scheduling, Synchronization, Deadlocks, Virtual Memory, Paging', revision_date: '', confidence_note: '' },
    { topic_key: 'cn', name: 'Computer Networks', category: 'Core CS', status: 'Not Started', questions_practiced: 0, notes: 'OSI 7 Layers, TCP/IP, TCP 3-way handshake, UDP, DNS, HTTP/HTTPS, WebSockets', revision_date: '', confidence_note: '' },
    { topic_key: 'co', name: 'Computer Organization', category: 'Core CS', status: 'Not Started', questions_practiced: 0, notes: 'Von Neumann architecture, Memory hierarchy, Cache mapping, Registers, Instruction sets', revision_date: '', confidence_note: '' },
    { topic_key: 'ml', name: 'ML', category: 'AI/ML', status: 'Learning', questions_practiced: 0, notes: 'Supervised vs Unsupervised, Bias-Variance, Loss functions, Optimization, Overfitting & Regularization', revision_date: '', confidence_note: 'Active Prime 3.0 course' },
    { topic_key: 'projects', name: 'Projects', category: 'Practical', status: 'Learning', questions_practiced: 0, notes: 'Architecture walkthrough, trade-offs, scalability, edge case handling, tech stack justification', revision_date: '', confidence_note: 'Phase 6 projects capstone' }
  ];

  const interviewQuestions = [];
  const mockInterviews = [];

  const careerMilestones = [
    { id: 'cm-1', key: 'foundation_ready', title: 'Foundation Ready', completed: false, completion_date: null, notes: 'Programming, DSA, Core CS, SQL, Git foundations established' },
    { id: 'cm-2', key: 'dsa_foundation_ready', title: 'DSA Foundation Ready', completed: false, completion_date: null, notes: '100+ problems solved across core algorithmic patterns' },
    { id: 'cm-3', key: 'core_cs_ready', title: 'Core CS Ready', completed: false, completion_date: null, notes: 'OS, DBMS, CN, OOP conceptual interview depth achieved' },
    { id: 'cm-4', key: 'project_portfolio_ready', title: 'Project Portfolio Ready', completed: false, completion_date: null, notes: '2-4 production-grade projects deployed with architecture docs' },
    { id: 'cm-5', key: 'resume_ready', title: 'Resume Ready', completed: false, completion_date: null, notes: 'Clean ATS-friendly resume reviewed, formatted & finalized' },
    { id: 'cm-6', key: 'profile_ready', title: 'Profile Ready', completed: false, completion_date: null, notes: 'GitHub, LinkedIn, Portfolio and Coding Profiles active and polished' },
    { id: 'cm-7', key: 'internship_app_ready', title: 'Internship Application Ready', completed: false, completion_date: null, notes: 'Outreach pipeline, application tracking system & referrals ready' },
    { id: 'cm-8', key: 'interview_ready', title: 'Interview Ready', completed: false, completion_date: null, notes: 'Mock interviews, project explanations & behavioral HR prep mastered' }
  ];

  const careerDocuments = [];
  const careerJournal = [];
  const projectInterviewPrep = {};

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
      title: 'Java References: Pass-by-Value vs Object Mutation',
      source: 'Individual Roadmap (October)',
      type: 'Concept Clarification',
      topic: 'Java Fundamentals',
      dateAdded: '2026-09-30',
      dueDate: '2026-10-03',
      status: 'Due this week',
      difficultyRating: 'Medium',
      reviewCount: 1,
      lastReviewed: '2026-09-30',
      notes: 'Java is strictly pass-by-value. Object references are copied by value, allowing state mutation but preventing reassigning caller pointer.'
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
      title: 'Q1 Mastery: Java Foundations + DSA in C++',
      description: 'Conquer Java fundamentals, Big-O analysis, linear DSA, Trees, and first 75 problems in C++.',
      targetDate: '2026-12-31',
      completed: false,
      progress: 15,
      connectedRoadmapMonth: 'October - December 2026'
    },
    {
      id: 'g-m1',
      type: 'Monthly',
      title: 'October Goal: Master Java Fundamentals & Developer Environment',
      description: 'Finish all 14 October syllabus topics: Java syntax, OOP, collections basics, exceptions, and Java CLI project.',
      targetDate: '2026-10-31',
      completed: false,
      progress: 14,
      connectedRoadmapMonth: 'October 2026'
    },
    {
      id: 'g-w1',
      type: 'Weekly',
      title: 'Week 1 Goal: Java Fundamentals + Prime 3.0 Module 1 + 5 DSA Problems',
      description: 'Target: 32 study hours, 5 DSA problems in C++, Java syntax & OOP concepts, and Prime 3.0 Module 1 completion.',
      targetDate: '2026-10-07',
      completed: false,
      progress: 35,
      connectedRoadmapMonth: 'October 2026'
    },
    {
      id: 'g-d1',
      type: 'Daily',
      title: 'Complete Today\'s Plan: Prime 3.0 + Java Fundamentals + Two Sum',
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
        { id: 'wg-i1', text: 'Java Syntax, Variables, Control Flow & Scanner setup', done: false },
        { id: 'wg-i2', text: 'Linux shell command fluency (grep, find, pipes)', done: true }
      ],
      projectGoals: [
        { id: 'wg-pr1', text: 'Scaffold Java CLI Application repo & project structure', done: true }
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
      topic: 'Day 1 Launch: Python Memory Mechanics & Java Object Model',
      learned: 'Dissected how Python variables are references to objects in memory. In Java, explored JVM memory architecture, stack vs heap for objects, and primitive vs reference types.',
      built: 'Built a Java demonstration program tracing primitive types vs object references on the heap.',
      confused: 'Pass-by-value vs pass-by-reference semantics for Java object references.',
      importantConcept: 'Java is strictly pass-by-value, where the value passed for objects is the reference address itself.',
      resources: 'Oracle Java Documentation; Python 3.12 Data Model documentation.',
      nextAction: 'Practice implementing Java control structures and classes.'
    }
  ];

  // Resources
  const resources = [
    {
      id: 'res-1',
      name: 'Java: The Complete Reference / MOOC.fi Java',
      url: 'https://java-programming.mooc.fi/',
      category: 'Course',
      topic: 'Java Fundamentals',
      status: 'In Progress',
      notes: 'The industry-standard University of Helsinki practical Java curriculum.'
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

  // Past Reviews Archive (Starts clean on Oct 1, 2026)
  const weeklyReviews = [];

  // Initial Daily End-of-Day Review (Starts empty)
  const dailyReviews = [];

  // Initial Daily Task Logs (Starts empty)
  const dailyTaskLogs = [];

  return {
    user: {
      name: 'Akshay',
      role: '1st Year B.Tech Computer Science, AI/ML Specialization',
      careerDirection: 'AI/ML + Software Engineering + Placement Preparation',
      mainGoal: 'Become highly skilled and placement-ready by 2030.',
      targetStartDate: '2026-10-01',
      targetEndDate: '2027-09-30',
      activeDate: '2026-10-01', // User can change active date or test today
      theme: 'light' // 'light' | 'dark'
    },
    studySchedule: {
      weekdayHours: 4.0, // Mon-Fri: 4 hours
      saturdayHours: 4.0, // Sat: 4 hours
      sundayHours: 8.0, // Sun: 8 hours
      weeklyTargetHours: 32.0, // Weekly target: 32 hours
      dsaDailyTarget: 2,
      scheduleByDay: {
        Monday: 4.0,
        Tuesday: 4.0,
        Wednesday: 4.0,
        Thursday: 4.0,
        Friday: 4.0,
        Saturday: 4.0,
        Sunday: 8.0
      },
      defaultAllocations: {
        primeHours: 1.5,
        dsaHours: 1.0,
        individualHours: 1.0,
        revisionProjectHours: 0.5
      }
    },
    notifications: {
      morningEnabled: true,
      morningTime: '08:00',
      eveningEnabled: true,
      eveningTime: '21:00',
      sundayEnabled: true,
      sundayTime: '18:00',
      monthEndEnabled: true,
      dismissedIds: []
    },
    habits: HABIT_DEFINITIONS,
    habitLogs,
    dailyTasks: initialTasks,
    // Phase 3 Relational Database Entities
    daily_tasks: initialTasks,
    daily_task_logs: dailyTaskLogs,
    daily_reviews: dailyReviews,
    dailyReviews,
    dsa_daily_targets: { '2026-10-01': 2 },
    dsaTargets: { '2026-10-01': 2 },
    recoveryDaysUsed: { '2026-W40': 0 },
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
    // Phase 5 Relational DSA Database Entities (Section 40)
    dsa_problems: dsaProblems,
    dsa_attempts: [],
    dsa_sessions: [],
    dsa_patterns: [
      'Two Pointers', 'Sliding Window', 'Binary Search', 'Prefix Sum',
      'Hashing', 'Stack', 'Queue', 'Linked List', 'Tree Traversal',
      'BFS', 'DFS', 'Heap', 'Backtracking', 'Dynamic Programming'
    ],
    dsa_problem_patterns: [],
    dsa_revisions: [],
    dsa_mistakes: [],
    dsa_bookmarks: [],
    projects,
    // Phase 6 Relational Database Entities (Section 52)
    project_goals: [],
    project_features: [],
    project_milestones: projectMilestones,
    project_tasks: projectTasks,
    project_sessions: [],
    project_technologies: projectTechnologies,
    project_github: projectGithub,
    project_deployments: projectDeployments,
    project_tests: projectTests,
    project_documentation: projectDocumentation,
    project_challenges: projectChallenges,
    project_learning_logs: projectLearningLogs,
    project_portfolio: projectPortfolio,
    project_resume: projectResume,
    project_activity: projectActivity,
    project_ideas: projectIdeas,
    max_active_projects: 2,
    // Phase 7 Career & Internship Preparation Database Entities (Section 47)
    career_profile: careerProfile,
    career_checklist: careerChecklist,
    resume_versions: resumeVersions,
    resume_checklist: resumeChecklist,
    coding_profiles: codingProfiles,
    github_profile: githubProfile,
    linkedin_profile: linkedinProfile,
    career_achievements: careerAchievements,
    certifications: careerCertifications,
    internships: careerInternships,
    applications: careerApplications,
    application_events: applicationEvents,
    application_followups: applicationFollowups,
    outreach: careerOutreach,
    referrals: careerReferrals,
    networking: careerNetworking,
    aptitude_sessions: aptitudeSessions,
    technical_topics: technicalTopics,
    interview_questions: interviewQuestions,
    mock_interviews: mockInterviews,
    career_milestones: careerMilestones,
    career_documents: careerDocuments,
    career_journal: careerJournal,
    project_interview_prep: projectInterviewPrep,
    revisionItems,
    studySessions,
    goals,
    weeklyGoals,
    weekly_goals: weeklyGoals,
    journalEntries,
    resources,
    weeklyReviews,
    monthlyReviews: [],
    // Phase 4 Relational Monthly Database Entities (Section 33)
    monthly_targets: {
      '2026-10': { studyHours: 128, dsaProblems: 40, primeSessions: 20, individualSessions: 20, projectSessions: 8, revisionSessions: 8, isCustom: false },
      '2026-11': { studyHours: 128, dsaProblems: 40, primeSessions: 20, individualSessions: 20, projectSessions: 8, revisionSessions: 8, isCustom: false }
    },
    monthlyTargets: {
      '2026-10': { studyHours: 128, dsaProblems: 40, primeSessions: 20, individualSessions: 20, projectSessions: 8, revisionSessions: 8, isCustom: false },
      '2026-11': { studyHours: 128, dsaProblems: 40, primeSessions: 20, individualSessions: 20, projectSessions: 8, revisionSessions: 8, isCustom: false }
    },
    monthly_goals: {
      '2026-10': [
        { id: 'mg-oct-1', topicId: 'top-oct-1', title: 'Complete Java Syntax & Basics', source: 'October 2026 → Java Fundamentals', targetDate: '2026-10-07', priority: 'High', status: 'Completed' },
        { id: 'mg-oct-2', topicId: 'top-oct-2', title: 'Complete Java Arrays & Loops', source: 'October 2026 → Java Arrays', targetDate: '2026-10-14', priority: 'Critical', status: 'Learning' },
        { id: 'mg-oct-3', topicId: 'top-oct-4', title: 'Complete Java OOP Basics', source: 'October 2026 → Java OOP', targetDate: '2026-10-21', priority: 'Critical', status: 'Needs Revision' },
        { id: 'mg-oct-4', topicId: 'top-oct-14', title: 'Deliver Java CLI Project', source: 'October 2026 → Java CLI Project', targetDate: '2026-10-28', priority: 'High', status: 'Learning' }
      ]
    },
    monthly_reviews: [],
    monthly_priorities: {
      '2026-11': {
        primary: 'top-nov-1',
        secondary: ['top-nov-2', 'top-nov-3'],
        optional: ['top-nov-4']
      }
    },
    monthly_topic_status: {},
    monthly_statistics: {},
    monthly_deadlines: [],
    monthly_reschedules: [],
    // ==========================================
    // Phase 8 AI Career Intelligence Entities (Section 52)
    // ==========================================
    ai_insights: [],
    ai_conversations: [
      {
        id: 'conv-main',
        title: 'Career & Placement Mentor',
        created_at: '2026-09-26',
        updated_at: '2026-09-26',
        system_prompt: 'You are Akshay\'s personal AI Career Intelligence & Placement Mentor. Provide concise, fact-grounded recommendations using real app data without hallucinating.'
      }
    ],
    ai_messages: [
      {
        id: 'msg-init-1',
        conversation_id: 'conv-main',
        sender: 'mentor',
        text: 'Welcome back Akshay. I am your AI Career Intelligence Mentor. I continuously inspect your real roadmap, DSA practice, projects, and applications to provide actionable guidance.',
        format: {
          short_answer: 'Systems initialized and synchronized with your active records.',
          why: 'Grounded on your actual 12-month roadmap, Phase 5 DSA database, Phase 6 project registry, and Phase 7 applications.',
          next_actions: [
            'Review Today\'s AI Briefing',
            'Check your DSA revision queue',
            'Inspect pending project tasks'
          ]
        },
        data_sources: ['Roadmap', 'DSA', 'Projects', 'Career'],
        timestamp: '2026-09-26T12:00:00.000Z'
      }
    ],
    ai_plans: [],
    ai_plan_items: [],
    ai_settings: {
      enable_insights: true,
      daily_briefing: true,
      weekly_review: true,
      monthly_review: true,
      ai_mentor: true,
      priority_recommendations: true,
      study_planning: true,
      provider: 'heuristic_local',
      model: 'mentor-v1',
      temperature: 0.2
    },
    ai_data_permissions: {
      roadmap: true,
      study: true,
      dsa: true,
      projects: true,
      career: true,
      applications: true,
      habits: true
    },
    ai_action_proposals: [],
    ai_action_logs: [],
    // ==========================================
    // Phase 9 Advanced Analytics, Gamification & Long-Term Progress (Section 55)
    // ==========================================
    achievements: [
      // 1. Learning (Section 22)
      { id: 'ach-learn-1', code: 'first_study_session', category: 'Learning', name: 'First Study Session', description: 'Log your very first dedicated study session.', requirement: '1 study session logged', target: 1, metric: 'study_sessions' },
      { id: 'ach-learn-2', code: '10_study_sessions', category: 'Learning', name: '10 Study Sessions', description: 'Build momentum by logging 10 study sessions.', requirement: '10 study sessions logged', target: 10, metric: 'study_sessions' },
      { id: 'ach-learn-3', code: '50_study_sessions', category: 'Learning', name: '50 Study Sessions', description: 'Demonstrate deep commitment with 50 logged sessions.', requirement: '50 study sessions logged', target: 50, metric: 'study_sessions' },
      { id: 'ach-learn-4', code: '100_study_sessions', category: 'Learning', name: '100 Study Sessions', description: 'Century mark: 100 study sessions completed.', requirement: '100 study sessions logged', target: 100, metric: 'study_sessions' },
      { id: 'ach-learn-5', code: 'first_topic_completed', category: 'Learning', name: 'First Topic Completed', description: 'Fully finish your first curriculum or roadmap topic.', requirement: '1 topic completed', target: 1, metric: 'topics_completed' },
      { id: 'ach-learn-6', code: '10_topics_completed', category: 'Learning', name: '10 Topics Completed', description: 'Master foundational knowledge across 10 curriculum topics.', requirement: '10 topics completed', target: 10, metric: 'topics_completed' },

      // 2. DSA (Section 23)
      { id: 'ach-dsa-1', code: 'first_dsa_problem', category: 'DSA', name: 'First DSA Problem', description: 'Solve your first problem in the Phase 5 DSA Tracker.', requirement: '1 DSA problem solved', target: 1, metric: 'dsa_solved' },
      { id: 'ach-dsa-2', code: '10_dsa_problems', category: 'DSA', name: '10 Problems', description: 'Build consistency with 10 problems solved.', requirement: '10 DSA problems solved', target: 10, metric: 'dsa_solved' },
      { id: 'ach-dsa-3', code: '50_dsa_problems', category: 'DSA', name: '50 Problems', description: 'Solid problem-solving foundation with 50 solves.', requirement: '50 DSA problems solved', target: 50, metric: 'dsa_solved' },
      { id: 'ach-dsa-4', code: '100_dsa_problems', category: 'DSA', name: '100 Problems', description: 'Triple digits: 100 algorithmic problems solved.', requirement: '100 DSA problems solved', target: 100, metric: 'dsa_solved' },
      { id: 'ach-dsa-5', code: 'first_revision', category: 'DSA', name: 'First Revision', description: 'Review your first spaced-repetition revision item.', requirement: '1 revision completed', target: 1, metric: 'dsa_revisions' },
      { id: 'ach-dsa-6', code: '10_revisions', category: 'DSA', name: '10 Revisions', description: 'Keep concepts fresh with 10 completed revisions.', requirement: '10 revisions completed', target: 10, metric: 'dsa_revisions' },
      { id: 'ach-dsa-7', code: 'first_tree_problem', category: 'DSA', name: 'First Tree Problem', description: 'Solve your first Tree or Binary Tree problem.', requirement: '1 Tree problem solved', target: 1, metric: 'dsa_tree' },
      { id: 'ach-dsa-8', code: 'first_graph_problem', category: 'DSA', name: 'First Graph Problem', description: 'Solve your first Graph traversal or shortest-path problem.', requirement: '1 Graph problem solved', target: 1, metric: 'dsa_graph' },
      { id: 'ach-dsa-9', code: 'first_dp_problem', category: 'DSA', name: 'First Dynamic Programming Problem', description: 'Solve your first Dynamic Programming problem.', requirement: '1 DP problem solved', target: 1, metric: 'dsa_dp' },

      // 3. Projects (Section 24)
      { id: 'ach-proj-1', code: 'first_project_started', category: 'Projects', name: 'First Project Started', description: 'Initialize your first project in the Projects Hub.', requirement: '1 project started', target: 1, metric: 'projects_started' },
      { id: 'ach-proj-2', code: 'first_project_completed', category: 'Projects', name: 'First Project Completed', description: 'Take a project across the finish line to Completed.', requirement: '1 project completed', target: 1, metric: 'projects_completed' },
      { id: 'ach-proj-3', code: 'first_project_deployed', category: 'Projects', name: 'First Project Deployed', description: 'Ship code to a live cloud platform (Vercel, Render, AWS).', requirement: '1 project deployed', target: 1, metric: 'projects_deployed' },
      { id: 'ach-proj-4', code: 'first_portfolio_ready', category: 'Projects', name: 'First Portfolio-Ready Project', description: 'Polish a deployed project with documentation for recruiters.', requirement: '1 portfolio-ready project', target: 1, metric: 'portfolio_ready' },
      { id: 'ach-proj-5', code: 'multiple_projects_completed', category: 'Projects', name: 'Multiple Projects Completed', description: 'Build an engineering portfolio with 3+ completed projects.', requirement: '3 projects completed', target: 3, metric: 'projects_completed' },

      // 4. Career (Section 25)
      { id: 'ach-car-1', code: 'resume_created', category: 'Career', name: 'Resume Created', description: 'Draft and log your first targeted technical resume version.', requirement: '1 resume version created', target: 1, metric: 'resume_versions' },
      { id: 'ach-car-2', code: 'portfolio_created', category: 'Career', name: 'Portfolio Created', description: 'Complete portfolio checklist items or link deployed portfolio.', requirement: 'Portfolio link or checklist added', target: 1, metric: 'portfolio_created' },
      { id: 'ach-car-3', code: 'first_application_tracked', category: 'Career', name: 'First Application Tracked', description: 'Log your first job or internship application in the pipeline.', requirement: '1 application tracked', target: 1, metric: 'applications_tracked' },
      { id: 'ach-car-4', code: 'first_mock_interview', category: 'Career', name: 'First Mock Interview', description: 'Conduct and log your first technical or behavioral mock interview.', requirement: '1 mock interview logged', target: 1, metric: 'mock_interviews' },
      { id: 'ach-car-5', code: 'first_certification_recorded', category: 'Career', name: 'First Certification Recorded', description: 'Earn and log a recognized technical or cloud certification.', requirement: '1 certification recorded', target: 1, metric: 'certifications' },

      // 5. Consistency (Section 26)
      { id: 'ach-con-1', code: '7_day_streak', category: 'Consistency', name: '7-day Study Streak', description: 'Maintain regular study discipline for 7 consecutive days.', requirement: '7-day study streak', target: 7, metric: 'study_streak' },
      { id: 'ach-con-2', code: '14_day_streak', category: 'Consistency', name: '14-day Study Streak', description: 'Fortify your daily study habit with a 2-week active streak.', requirement: '14-day study streak', target: 14, metric: 'study_streak' },
      { id: 'ach-con-3', code: '30_day_streak', category: 'Consistency', name: '30-day Study Streak', description: 'One full month of unbroken learning consistency.', requirement: '30-day study streak', target: 30, metric: 'study_streak' },
      { id: 'ach-con-4', code: '50_study_sessions_consistent', category: 'Consistency', name: '50 Completed Study Sessions', description: 'Reward steady consistency across 50 dedicated sessions.', requirement: '50 completed study sessions', target: 50, metric: 'study_sessions' }
    ],
    achievement_progress: {},
    milestones: [
      { id: 'mile-1', title: 'Complete Python Foundation', description: 'Master Python 3.12 syntax, data structures, OOP, and scientific computing packages.', category: 'Learning', target: '100% of Python core topics', current_progress: 0, progress_percentage: 0, start_date: '2026-10-01', target_date: '2026-11-15', status: 'In Progress', linked_roadmap_items: ['prime-top-1', 'top-oct-1', 'top-oct-2'] },
      { id: 'mile-2', title: 'Complete DSA Foundation', description: 'Solve foundational problems across Two Pointers, Sliding Window, Trees, and Binary Search.', category: 'DSA', target: '50 foundational DSA problems', current_progress: 0, progress_percentage: 0, start_date: '2026-10-01', target_date: '2026-12-31', status: 'In Progress', linked_roadmap_items: ['month-2026-11'] },
      { id: 'mile-3', title: 'Complete First Major Project', description: 'Architect, develop, test, and polish an end-to-end fullstack or ML system.', category: 'Projects', target: '1 project completed with testing', current_progress: 0, progress_percentage: 0, start_date: '2026-10-01', target_date: '2027-01-31', status: 'In Progress', linked_roadmap_items: ['proj-1'] },
      { id: 'mile-4', title: 'Deploy First Project', description: 'Set up automated CI/CD pipeline and deploy project to production with live domain.', category: 'Projects', target: '1 live deployed project', current_progress: 0, progress_percentage: 0, start_date: '2026-10-01', target_date: '2027-02-28', status: 'Not Started', linked_roadmap_items: ['proj-1'] },
      { id: 'mile-5', title: 'Complete AI/ML Milestone', description: 'Train and evaluate neural networks, embeddings, and fine-tuned LLM agents.', category: 'Learning', target: 'Prime 3.0 Module 8 reached', current_progress: 0, progress_percentage: 0, start_date: '2026-11-01', target_date: '2027-04-30', status: 'Not Started', linked_roadmap_items: ['prime-top-5', 'prime-top-6'] },
      { id: 'mile-6', title: 'Build Portfolio', description: 'Design portfolio site with live project demos, GitHub links, and technical writeups.', category: 'Career', target: 'Portfolio live & reviewed', current_progress: 0, progress_percentage: 0, start_date: '2027-01-01', target_date: '2027-04-30', status: 'Not Started', linked_roadmap_items: ['career-profile'] },
      { id: 'mile-7', title: 'Complete Internship Preparation Milestone', description: 'Prepare resumes, practice technical and mock interviews, and begin targeted applications.', category: 'Career', target: '5 mock interviews & 10 applications', current_progress: 0, progress_percentage: 0, start_date: '2027-03-01', target_date: '2027-06-30', status: 'Not Started', linked_roadmap_items: ['app-pipeline'] }
    ],
    milestone_progress: {},
    goal_history: [],
    progress_snapshots: [],
    personal_records: {
      most_sessions_month: 0,
      most_dsa_week: 0,
      longest_streak: 0,
      most_project_hours_month: 0,
      most_achievements_month: 0
    },
    analytics_preferences: {
      widgets: [
        { id: 'widget-study-time', name: 'Study Time', visible: true, order: 1 },
        { id: 'widget-dsa-activity', name: 'DSA Activity', visible: true, order: 2 },
        { id: 'widget-project-activity', name: 'Project Activity', visible: true, order: 3 },
        { id: 'widget-career-activity', name: 'Career Activity', visible: true, order: 4 },
        { id: 'widget-habit-streak', name: 'Habit Streak', visible: true, order: 5 },
        { id: 'widget-achievements', name: 'Achievements', visible: true, order: 6 },
        { id: 'widget-milestones', name: 'Milestones', visible: true, order: 7 },
        { id: 'widget-monthly-progress', name: 'Monthly Progress', visible: true, order: 8 },
        { id: 'widget-year-progress', name: 'Year Progress', visible: true, order: 9 }
      ],
      defaultChartHorizon: 'month',
      activeFilterPeriod: '30d'
    },
    custom_achievements: [],
    journey_events: [],
    analytics_exports: [],

    // ==========================================
    // PHASE 10: PERSONAL OPERATING SYSTEM ENTITIES (Section 78)
    // ==========================================
    tasks: [],
    task_dependencies: [],
    task_instances: [],
    inbox_items: [],
    notes: [],
    note_links: [],
    resources: [],
    focus_sessions: [],
    calendar_items: [],
    automations: [
      {
        id: 'auto-1',
        title: 'Project Milestone Documentation Review',
        trigger: 'project_milestone_reached',
        condition_type: 'always',
        condition_value: '',
        action_type: 'create_task',
        action_payload: {
          title: 'Review and update documentation for completed milestone',
          area: 'Projects',
          priority: 'Medium',
          estimated_duration: 30
        },
        is_enabled: true,
        require_approval: true,
        created_at: '2026-10-01'
      },
      {
        id: 'auto-2',
        title: 'Achievement Unlocked Timeline Log',
        trigger: 'achievement_unlocked',
        condition_type: 'always',
        condition_value: '',
        action_type: 'create_notification',
        action_payload: {
          title: 'Achievement Unlocked: Milestone added to journey timeline',
          type: 'achievement'
        },
        is_enabled: true,
        require_approval: false,
        created_at: '2026-10-01'
      },
      {
        id: 'auto-3',
        title: 'Overdue Task Attention Flag',
        trigger: 'task_overdue',
        condition_type: 'always',
        condition_value: '',
        action_type: 'create_review_item',
        action_payload: {
          title: 'Review overdue task and reschedule',
          type: 'task_review'
        },
        is_enabled: true,
        require_approval: true,
        created_at: '2026-10-01'
      }
    ],
    automation_runs: [],
    reviews: [],
    activity_log: [],
    backups: [],
    knowledge_links: [],
    personal_os_settings: {
      default_task_duration: 30,
      calendar_start_day: 'monday',
      time_format: '24h',
      week_start: 'monday',
      notification_preferences: { reminders: true, review_alerts: true },
      ai_preferences: { auto_suggest_inbox: true, require_plan_confirmation: true },
      automation_preferences: { auto_execute_safe: false },
      dashboard_layout: {
        compact_mode: false,
        widgets: ['today', 'goals', 'projects', 'dsa', 'career', 'focus', 'ai', 'upcoming', 'achievements']
      }
    },
    today_timeline_blocks: [
      { id: 'tb-1', date: '2026-10-01', start_time: '08:00', end_time: '09:00', title: 'DSA Practice & Pattern Solving', category: 'DSA', is_completed: false },
      { id: 'tb-2', date: '2026-10-01', start_time: '09:30', end_time: '16:30', title: 'College Classes & Academic Lab', category: 'Personal', is_completed: false },
      { id: 'tb-3', date: '2026-10-01', start_time: '17:00', end_time: '18:30', title: 'AI/ML Prime 3.0 Module Deep Dive', category: 'Learning', is_completed: false },
      { id: 'tb-4', date: '2026-10-01', start_time: '19:00', end_time: '20:30', title: 'Project Development: Core Architecture', category: 'Projects', is_completed: false },
      { id: 'tb-5', date: '2026-10-01', start_time: '21:00', end_time: '22:00', title: 'Nightly Revision & Personal Reflection', category: 'Personal', is_completed: false }
    ],
    java_progress: JAVA_PLAYLIST_VIDEOS.map(v => ({
      video_number: v.video_number,
      title: v.title,
      duration_minutes: v.duration_minutes,
      completed: false,
      completed_at: null
    })),
    study_sessions: [],
    remote_study_sessions: [],
    remote_semester: [],
    remote_gaming: [],
    remote_tasks: []
  };
}

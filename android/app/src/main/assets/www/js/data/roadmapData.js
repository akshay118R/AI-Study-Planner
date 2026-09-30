/**
 * Akshay's 12-Month AI/ML Career OS - Phase 2 Complete Roadmap Database
 * 
 * Hierarchy:
 * roadmap_year
 *    ↓
 * roadmap_months
 *    ↓
 * roadmap_topics
 *    ↓
 * roadmap_subtopics
 * 
 * And Dedicated Prime 3.0 Course Hierarchy:
 * prime_course
 *    ↓
 * prime_modules
 *    ↓
 * prime_topics
 *    ↓
 * prime_lessons
 */

export const INITIAL_ROADMAP_YEAR = {
  id: 'year-2026-2027',
  title: '12-Month AI/ML + Software Engineering + Placement Career OS',
  user: 'Akshay',
  startDate: '2026-10-01',
  endDate: '2027-09-30',
  targetHours: 1664 // 52 weeks * 32 hours/week
};

export const INITIAL_ROADMAP_MONTHS = [
  {
    id: 'month-2026-10',
    month: 'October',
    year: 2026,
    monthKey: '2026-10',
    order: 1,
    title: 'Programming + Developer Foundations',
    description: 'Java — Playlist Track (Apna College): Lectures 1–5 (Language Intro, Variables, Conditionals, Loops, Patterns), developer environment, and initial Java CLI project.',
    start_date: '2026-10-01',
    end_date: '2026-10-31',
    status: 'Current',
    progress: 0,
    target_hours: 135
  },
  {
    id: 'month-2026-11',
    month: 'November',
    year: 2026,
    monthKey: '2026-11',
    order: 2,
    title: 'DSA Foundations',
    description: 'Big-O asymptotic analysis, space & time complexity, array & string algorithms, two pointers, sliding window, recursion, and initial 30-40 DSA problems.',
    start_date: '2026-11-01',
    end_date: '2026-11-30',
    status: 'Upcoming',
    progress: 0,
    target_hours: 135
  },
  {
    id: 'month-2026-12',
    month: 'December',
    year: 2026,
    monthKey: '2026-12',
    order: 3,
    title: 'Core DSA',
    description: 'Linked lists, stack, queue, hashing, binary search in depth, trees, BST, tree traversals, BFS, DFS, and 40-50 targeted problems.',
    start_date: '2026-12-01',
    end_date: '2026-12-31',
    status: 'Upcoming',
    progress: 0,
    target_hours: 135
  },
  {
    id: 'month-2027-01',
    month: 'January',
    year: 2027,
    monthKey: '2027-01',
    order: 4,
    title: 'Advanced DSA',
    description: 'Heaps, priority queues, graphs, graph traversals, recursion patterns, backtracking, dynamic programming fundamentals and DP patterns, 50-60 problems.',
    start_date: '2027-01-01',
    end_date: '2027-01-31',
    status: 'Upcoming',
    progress: 0,
    target_hours: 135
  },
  {
    id: 'month-2027-02',
    month: 'February',
    year: 2027,
    monthKey: '2027-02',
    order: 5,
    title: 'DBMS + SQL Depth',
    description: 'Relational database fundamentals, keys, normalization (1NF-BCNF), transactions, ACID properties, indexing & B-trees, query optimization, MySQL, PostgreSQL, MongoDB.',
    start_date: '2027-02-01',
    end_date: '2027-02-28',
    status: 'Upcoming',
    progress: 0,
    target_hours: 135
  },
  {
    id: 'month-2027-03',
    month: 'March',
    year: 2027,
    monthKey: '2027-03',
    order: 6,
    title: 'Operating Systems',
    description: 'Processes, threads, CPU scheduling algorithms, deadlock prevention, memory management, virtual memory & paging, file systems, Linux command-line internals.',
    start_date: '2027-03-01',
    end_date: '2027-03-31',
    status: 'Upcoming',
    progress: 0,
    target_hours: 135
  },
  {
    id: 'month-2027-04',
    month: 'April',
    year: 2027,
    monthKey: '2027-04',
    order: 7,
    title: 'Computer Networks',
    description: 'Networking fundamentals, OSI 7-layer model, TCP/IP stack, IP addressing & CIDR, TCP vs UDP, HTTP/HTTPS, DNS lifecycle, client-server architecture, sockets.',
    start_date: '2027-04-01',
    end_date: '2027-04-30',
    status: 'Upcoming',
    progress: 0,
    target_hours: 135
  },
  {
    id: 'month-2027-05',
    month: 'May',
    year: 2027,
    monthKey: '2027-05',
    order: 8,
    title: 'Computer Organization + Mathematics',
    description: 'Computer Organization (CPU, registers, memory hierarchy, cache, architecture) + Essential Mathematics (vectors, matrices, eigenvalues, calculus, gradients).',
    start_date: '2027-05-01',
    end_date: '2027-05-31',
    status: 'Upcoming',
    progress: 0,
    target_hours: 135
  },
  {
    id: 'month-2027-06',
    month: 'June',
    year: 2027,
    monthKey: '2027-06',
    order: 9,
    title: 'Data Engineering Foundations',
    description: 'NumPy vectorized arrays, Pandas DataFrames & data wrangling, missing data imputation, Matplotlib, Seaborn, and 5 comprehensive EDA datasets & reports.',
    start_date: '2027-06-01',
    end_date: '2027-06-30',
    status: 'Upcoming',
    progress: 0,
    target_hours: 135
  },
  {
    id: 'month-2027-07',
    month: 'July',
    year: 2027,
    monthKey: '2027-07',
    order: 10,
    title: 'Software Engineering + Backend',
    description: 'Modern HTML/CSS/JS, REST API architecture, JWT authentication, JSON, Node.js & Express, FastAPI, database integration, and deployed backend service.',
    start_date: '2027-07-01',
    end_date: '2027-07-31',
    status: 'Upcoming',
    progress: 0,
    target_hours: 135
  },
  {
    id: 'month-2027-08',
    month: 'August',
    year: 2027,
    monthKey: '2027-08',
    order: 11,
    title: 'Cloud + MLOps',
    description: 'Docker multi-stage containers, Docker Compose, Kubernetes fundamentals (pods, services, deployments), CI/CD pipelines, AWS/Azure, and AI/ML model deployment workflows.',
    start_date: '2027-08-01',
    end_date: '2027-08-31',
    status: 'Upcoming',
    progress: 0,
    target_hours: 135
  },
  {
    id: 'month-2027-09',
    month: 'September',
    year: 2027,
    monthKey: '2027-09',
    order: 12,
    title: 'Placement + Portfolio',
    description: '100+ LeetCode problems sprint, 5 major portfolio projects, ATS resume, GitHub, LinkedIn, portfolio site, core CS interview prep, ML interview prep, and mock interviews.',
    start_date: '2027-09-01',
    end_date: '2027-09-30',
    status: 'Upcoming',
    progress: 0,
    target_hours: 135
  }
];

export const INITIAL_ROADMAP_TOPICS = [
  // ==========================================
  // OCTOBER 2026: Programming + Developer Foundations (14 topics)
  // ==========================================
  {
    id: 'top-oct-1', month_id: 'month-2026-10', name: 'Java — Playlist Track: Lecture 1', category: 'Programming',
    description: 'Introduction to Java Language | Lecture 1 | Apna College Course',
    order: 1, status: 'Not Started', progress: 0, target_hours: 10, notes: '',
    start_date: '2026-10-01', target_date: '2026-10-03', completion_date: null, related_prime_topic_id: null
  },
  {
    id: 'top-oct-2', month_id: 'month-2026-10', name: 'Java — Playlist Track: Lecture 2', category: 'Programming',
    description: 'Variables in Java | Input Output | Lecture 2 | Apna College Course',
    order: 2, status: 'Not Started', progress: 0, target_hours: 8, notes: '',
    start_date: '2026-10-03', target_date: '2026-10-05', completion_date: null, related_prime_topic_id: null
  },
  {
    id: 'top-oct-3', month_id: 'month-2026-10', name: 'Java — Playlist Track: Lecture 3', category: 'Programming',
    description: 'Conditional Statements | If-else, Switch Break | Lecture 3 | Apna College',
    order: 3, status: 'Not Started', progress: 0, target_hours: 8, notes: '',
    start_date: '2026-10-05', target_date: '2026-10-07', completion_date: null, related_prime_topic_id: null
  },
  {
    id: 'top-oct-4', month_id: 'month-2026-10', name: 'Java — Playlist Track: Lecture 4', category: 'Programming',
    description: 'Loops in Java | Lecture 4 | Apna College Course',
    order: 4, status: 'Not Started', progress: 0, target_hours: 14, notes: '',
    start_date: '2026-10-07', target_date: '2026-10-10', completion_date: null, related_prime_topic_id: null
  },
  {
    id: 'top-oct-5', month_id: 'month-2026-10', name: 'Java — Playlist Track: Lecture 5', category: 'Programming',
    description: '9 Best Patterns Questions In Java (for Beginners) | Lecture 5 | Apna College',
    order: 5, status: 'Not Started', progress: 0, target_hours: 8, notes: '',
    start_date: '2026-10-10', target_date: '2026-10-12', completion_date: null, related_prime_topic_id: null
  },
  {
    id: 'top-oct-6', month_id: 'month-2026-10', name: 'Java Strings', category: 'Programming',
    description: 'String pool, immutability, StringBuilder, string methods & manipulation.',
    order: 6, status: 'Not Started', progress: 0, target_hours: 12, notes: '',
    start_date: '2026-10-12', target_date: '2026-10-15', completion_date: null, related_prime_topic_id: null
  },
  {
    id: 'top-oct-7', month_id: 'month-2026-10', name: 'Java Methods', category: 'Programming',
    description: 'Method signatures, parameters, return values, pass-by-value & method overloading.',
    order: 7, status: 'Not Started', progress: 0, target_hours: 8, notes: '',
    start_date: '2026-10-15', target_date: '2026-10-17', completion_date: null, related_prime_topic_id: null
  },
  {
    id: 'top-oct-8', month_id: 'month-2026-10', name: 'Java OOP: Classes & Objects', category: 'Programming',
    description: 'State & behavior, instantiation, object lifecycle & the this keyword.',
    order: 8, status: 'Not Started', progress: 0, target_hours: 8, notes: '',
    start_date: '2026-10-17', target_date: '2026-10-19', completion_date: null, related_prime_topic_id: null
  },
  {
    id: 'top-oct-9', month_id: 'month-2026-10', name: 'Java OOP: Constructors & Encapsulation', category: 'Programming',
    description: 'Default & parameterized constructors, access modifiers (private, public, protected), getters/setters.',
    order: 9, status: 'Not Started', progress: 0, target_hours: 10, notes: '',
    start_date: '2026-10-19', target_date: '2026-10-22', completion_date: null, related_prime_topic_id: null
  },
  {
    id: 'top-oct-10', month_id: 'month-2026-10', name: 'Java OOP: Inheritance & Polymorphism', category: 'Programming',
    description: 'extends, super, method overriding, @Override, dynamic method dispatch.',
    order: 10, status: 'Not Started', progress: 0, target_hours: 8, notes: '',
    start_date: '2026-10-22', target_date: '2026-10-24', completion_date: null, related_prime_topic_id: null
  },
  {
    id: 'top-oct-11', month_id: 'month-2026-10', name: 'Linux Basics', category: 'Core CS',
    description: 'Filesystem hierarchy, bash scripting, file permissions (chmod, chown), pipes, redirection.',
    order: 11, status: 'Not Started', progress: 0, target_hours: 8, notes: '',
    start_date: '2026-10-24', target_date: '2026-10-26', completion_date: null, related_prime_topic_id: null
  },
  {
    id: 'top-oct-12', month_id: 'month-2026-10', name: 'VS Code / Development Environment', category: 'Core CS',
    description: 'Debugger configuration (launch.json, tasks.json), linters, JDK setup, keybindings.',
    order: 12, status: 'Not Started', progress: 0, target_hours: 6, notes: '',
    start_date: '2026-10-26', target_date: '2026-10-27', completion_date: null, related_prime_topic_id: null
  },
  {
    id: 'top-oct-13', month_id: 'month-2026-10', name: 'Git/GitHub Practice', category: 'Core CS',
    description: 'Branching strategies, commit hygiene, remotes, pull requests, resolving merge conflicts.',
    order: 13, status: 'Not Started', progress: 0, target_hours: 8, notes: '',
    start_date: '2026-10-27', target_date: '2026-10-29', completion_date: null, related_prime_topic_id: 'prime-top-36'
  },
  {
    id: 'top-oct-14', month_id: 'month-2026-10', name: 'Java CLI Project', category: 'Projects',
    description: 'Roadmap Milestone: Interactive menu-driven CLI management application in pure Java with file persistence.',
    order: 14, status: 'Not Started', progress: 0, target_hours: 14, notes: '',
    start_date: '2026-10-29', target_date: '2026-10-31', completion_date: null, related_prime_topic_id: null
  },

  // ==========================================
  // NOVEMBER 2026: DSA Foundations (12 topics)
  // ==========================================
  { id: 'top-nov-1', month_id: 'month-2026-11', name: 'Big-O', category: 'DSA', description: 'Asymptotic upper bound definition, growth rates, comparing logarithmic to exponential complexity.', order: 1, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2026-11-01', target_date: '2026-11-03', completion_date: null, related_prime_topic_id: null },
  { id: 'top-nov-2', month_id: 'month-2026-11', name: 'Time Complexity', category: 'DSA', description: 'Counting operations, amortized analysis, worst-case, best-case, average-case analysis.', order: 2, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2026-11-03', target_date: '2026-11-05', completion_date: null, related_prime_topic_id: null },
  { id: 'top-nov-3', month_id: 'month-2026-11', name: 'Space Complexity', category: 'DSA', description: 'Auxiliary memory vs input memory, recursion stack space, in-place algorithmic design.', order: 3, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2026-11-05', target_date: '2026-11-07', completion_date: null, related_prime_topic_id: null },
  { id: 'top-nov-4', month_id: 'month-2026-11', name: 'Arrays', category: 'DSA', description: 'Prefix sums, kadanes algorithm, contiguous sub-arrays, cyclic sort, rotate arrays.', order: 4, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2026-11-07', target_date: '2026-11-10', completion_date: null, related_prime_topic_id: null },
  { id: 'top-nov-5', month_id: 'month-2026-11', name: 'Strings', category: 'DSA', description: 'String manipulation, palindromes, anagrams, substring search, string builders.', order: 5, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2026-11-10', target_date: '2026-11-13', completion_date: null, related_prime_topic_id: null },
  { id: 'top-nov-6', month_id: 'month-2026-11', name: 'Searching', category: 'DSA', description: 'Linear search, binary search on sorted sequences, lower bound and upper bound.', order: 6, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2026-11-13', target_date: '2026-11-16', completion_date: null, related_prime_topic_id: null },
  { id: 'top-nov-7', month_id: 'month-2026-11', name: 'Sorting', category: 'DSA', description: 'Merge sort, quick sort, insertion sort, heap sort, Dutch national flag 3-way partition.', order: 7, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2026-11-16', target_date: '2026-11-19', completion_date: null, related_prime_topic_id: null },
  { id: 'top-nov-8', month_id: 'month-2026-11', name: 'Two Pointers', category: 'DSA', description: 'Opposite direction pointers, same direction fast/slow pointers, 3Sum, container with most water.', order: 8, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2026-11-19', target_date: '2026-11-22', completion_date: null, related_prime_topic_id: null },
  { id: 'top-nov-9', month_id: 'month-2026-11', name: 'Sliding Window', category: 'DSA', description: 'Fixed window, dynamic window, longest substring without repeating characters, minimum window substring.', order: 9, status: 'Not Started', progress: 0, target_hours: 14, start_date: '2026-11-22', target_date: '2026-11-24', completion_date: null, related_prime_topic_id: null },
  { id: 'top-nov-10', month_id: 'month-2026-11', name: 'Recursion', category: 'DSA', description: 'Base cases, recurrence relations, call stack behavior, divide and conquer paradigm.', order: 10, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2026-11-24', target_date: '2026-11-26', completion_date: null, related_prime_topic_id: null },
  { id: 'top-nov-11', month_id: 'month-2026-11', name: 'Basic Problem-Solving Patterns', category: 'DSA', description: 'Template recognition, boundary testing, edge cases, invariant preservation.', order: 11, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2026-11-26', target_date: '2026-11-28', completion_date: null, related_prime_topic_id: null },
  { id: 'top-nov-12', month_id: 'month-2026-11', name: '30–40 DSA Problems', category: 'DSA', description: 'Solving and logging 30 to 40 curated foundational problems across LeetCode & GeeksforGeeks.', order: 12, status: 'Not Started', progress: 0, target_hours: 20, start_date: '2026-11-28', target_date: '2026-11-30', completion_date: null, related_prime_topic_id: null },

  // ==========================================
  // DECEMBER 2026: Core DSA (11 topics)
  // ==========================================
  { id: 'top-dec-1', month_id: 'month-2026-12', name: 'Linked Lists', category: 'DSA', description: 'Singly, doubly, and circular linked lists, reversals, middle finding, cycle detection.', order: 1, status: 'Not Started', progress: 0, target_hours: 14, start_date: '2026-12-01', target_date: '2026-12-04', completion_date: null, related_prime_topic_id: null },
  { id: 'top-dec-2', month_id: 'month-2026-12', name: 'Stack', category: 'DSA', description: 'Stack implementation, monotonic stack, next greater element, balanced parentheses.', order: 2, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2026-12-04', target_date: '2026-12-07', completion_date: null, related_prime_topic_id: null },
  { id: 'top-dec-3', month_id: 'month-2026-12', name: 'Queue', category: 'DSA', description: 'Queue, circular queue, deque, sliding window maximum with deque.', order: 3, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2026-12-07', target_date: '2026-12-10', completion_date: null, related_prime_topic_id: null },
  { id: 'top-dec-4', month_id: 'month-2026-12', name: 'Hashing', category: 'DSA', description: 'Hash functions, collision resolution (chaining, open addressing), load factor, hash maps.', order: 4, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2026-12-10', target_date: '2026-12-13', completion_date: null, related_prime_topic_id: null },
  { id: 'top-dec-5', month_id: 'month-2026-12', name: 'Binary Search', category: 'DSA', description: 'Search space reduction, search on answer, lower/upper bounds, rotated sorted arrays.', order: 5, status: 'Not Started', progress: 0, target_hours: 14, start_date: '2026-12-13', target_date: '2026-12-16', completion_date: null, related_prime_topic_id: null },
  { id: 'top-dec-6', month_id: 'month-2026-12', name: 'Trees', category: 'DSA', description: 'Binary tree structure, height, diameter, maximum path sum, lowest common ancestor.', order: 6, status: 'Not Started', progress: 0, target_hours: 14, start_date: '2026-12-16', target_date: '2026-12-19', completion_date: null, related_prime_topic_id: null },
  { id: 'top-dec-7', month_id: 'month-2026-12', name: 'Binary Search Trees', category: 'DSA', description: 'BST validation, search, insertion, deletion, inorder successor, balanced BST concepts.', order: 7, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2026-12-19', target_date: '2026-12-22', completion_date: null, related_prime_topic_id: null },
  { id: 'top-dec-8', month_id: 'month-2026-12', name: 'Tree Traversals', category: 'DSA', description: 'Inorder, preorder, postorder, level order, Morris traversal for O(1) space.', order: 8, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2026-12-22', target_date: '2026-12-24', completion_date: null, related_prime_topic_id: null },
  { id: 'top-dec-9', month_id: 'month-2026-12', name: 'BFS', category: 'DSA', description: 'Breadth-First Search queue exploration, shortest path in unweighted graph/grid.', order: 9, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2026-12-24', target_date: '2026-12-26', completion_date: null, related_prime_topic_id: null },
  { id: 'top-dec-10', month_id: 'month-2026-12', name: 'DFS', category: 'DSA', description: 'Depth-First Search recursion, connected components, path counting.', order: 10, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2026-12-26', target_date: '2026-12-28', completion_date: null, related_prime_topic_id: null },
  { id: 'top-dec-11', month_id: 'month-2026-12', name: '40–50 DSA Problems', category: 'DSA', description: 'Solving 40 to 50 core problems focusing on Linked Lists, Trees, and Stacks.', order: 11, status: 'Not Started', progress: 0, target_hours: 20, start_date: '2026-12-28', target_date: '2026-12-31', completion_date: null, related_prime_topic_id: null },

  // ==========================================
  // JANUARY 2027: Advanced DSA (10 topics)
  // ==========================================
  { id: 'top-jan-1', month_id: 'month-2027-01', name: 'Heaps', category: 'DSA', description: 'Min-heap, max-heap, heapify, array implementation, top-K patterns.', order: 1, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-01-01', target_date: '2027-01-04', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jan-2', month_id: 'month-2027-01', name: 'Priority Queue', category: 'DSA', description: 'Priority queue mechanics, K-way merge, task scheduler, Huffman coding principles.', order: 2, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-01-04', target_date: '2027-01-07', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jan-3', month_id: 'month-2027-01', name: 'Graphs', category: 'DSA', description: 'Adjacency list & matrix representations, directed vs undirected, weighted graphs.', order: 3, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-01-07', target_date: '2027-01-10', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jan-4', month_id: 'month-2027-01', name: 'Graph Traversal', category: 'DSA', description: 'BFS, DFS on graphs, cycle detection, topological sort (Kahn algorithm), bipartite graphs.', order: 4, status: 'Not Started', progress: 0, target_hours: 14, start_date: '2027-01-10', target_date: '2027-01-14', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jan-5', month_id: 'month-2027-01', name: 'Recursion Patterns', category: 'DSA', description: 'Subsets generation, combinations, permutations, phone keypad combinations.', order: 5, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-01-14', target_date: '2027-01-17', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jan-6', month_id: 'month-2027-01', name: 'Backtracking', category: 'DSA', description: 'N-Queens, Sudoku solver, word search, subset sum with constraints.', order: 6, status: 'Not Started', progress: 0, target_hours: 14, start_date: '2027-01-17', target_date: '2027-01-20', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jan-7', month_id: 'month-2027-01', name: 'Dynamic Programming Fundamentals', category: 'DSA', description: 'Optimal substructure, overlapping subproblems, memoization vs tabulation.', order: 7, status: 'Not Started', progress: 0, target_hours: 14, start_date: '2027-01-20', target_date: '2027-01-23', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jan-8', month_id: 'month-2027-01', name: 'DP Patterns', category: 'DSA', description: '0/1 Knapsack, Unbounded Knapsack, LCS, LIS, Matrix Chain Multiplication.', order: 8, status: 'Not Started', progress: 0, target_hours: 16, start_date: '2027-01-23', target_date: '2027-01-27', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jan-9', month_id: 'month-2027-01', name: 'Mixed DSA Practice', category: 'DSA', description: 'Tackling complex multi-concept interview problems combining graphs, DP, and heaps.', order: 9, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-01-27', target_date: '2027-01-29', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jan-10', month_id: 'month-2027-01', name: '50–60 DSA Problems', category: 'DSA', description: 'High-intensity problem-solving sprint target for the month.', order: 10, status: 'Not Started', progress: 0, target_hours: 20, start_date: '2027-01-29', target_date: '2027-01-31', completion_date: null, related_prime_topic_id: null },

  // ==========================================
  // FEBRUARY 2027: DBMS + SQL Depth (14 topics)
  // ==========================================
  { id: 'top-feb-1', month_id: 'month-2027-02', name: 'Database Fundamentals', category: 'DBMS', description: 'DBMS architecture, 3-tier schema, data abstraction, DBMS vs File system.', order: 1, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-02-01', target_date: '2027-02-03', completion_date: null, related_prime_topic_id: null },
  { id: 'top-feb-2', month_id: 'month-2027-02', name: 'Relational Databases', category: 'DBMS', description: 'Relational model, entities, attributes, tuples, ER diagram to relational schema.', order: 2, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-02-03', target_date: '2027-02-05', completion_date: null, related_prime_topic_id: null },
  { id: 'top-feb-3', month_id: 'month-2027-02', name: 'Keys', category: 'DBMS', description: 'Super key, candidate key, primary key, foreign key, alternate key, composite key.', order: 3, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-02-05', target_date: '2027-02-07', completion_date: null, related_prime_topic_id: null },
  { id: 'top-feb-4', month_id: 'month-2027-02', name: 'Primary Key', category: 'DBMS', description: 'Primary key constraints, uniqueness, not-null requirements, clustered index binding.', order: 4, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-02-07', target_date: '2027-02-09', completion_date: null, related_prime_topic_id: null },
  { id: 'top-feb-5', month_id: 'month-2027-02', name: 'Foreign Key', category: 'DBMS', description: 'Referential integrity, cascade updates and deletes, foreign key indexing.', order: 5, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-02-09', target_date: '2027-02-11', completion_date: null, related_prime_topic_id: null },
  { id: 'top-feb-6', month_id: 'month-2027-02', name: 'Normalization', category: 'DBMS', description: 'Functional dependencies, 1NF, 2NF, 3NF, BCNF, lossless join decomposition.', order: 6, status: 'Not Started', progress: 0, target_hours: 14, start_date: '2027-02-11', target_date: '2027-02-14', completion_date: null, related_prime_topic_id: null },
  { id: 'top-feb-7', month_id: 'month-2027-02', name: 'Transactions', category: 'DBMS', description: 'Transaction states, schedules, serializability, conflict and view serializability.', order: 7, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-02-14', target_date: '2027-02-16', completion_date: null, related_prime_topic_id: null },
  { id: 'top-feb-8', month_id: 'month-2027-02', name: 'ACID', category: 'DBMS', description: 'Atomicity, Consistency, Isolation levels (Dirty Read, Non-repeatable, Phantom), Durability.', order: 8, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-02-16', target_date: '2027-02-18', completion_date: null, related_prime_topic_id: null },
  { id: 'top-feb-9', month_id: 'month-2027-02', name: 'Indexing', category: 'DBMS', description: 'Clustered vs non-clustered indexes, B-Trees and B+ Trees internal search algorithms.', order: 9, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-02-18', target_date: '2027-02-20', completion_date: null, related_prime_topic_id: null },
  { id: 'top-feb-10', month_id: 'month-2027-02', name: 'Database Design', category: 'DBMS', description: 'Schema design best practices, relationship cardinalities, denormalization trade-offs.', order: 10, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-02-20', target_date: '2027-02-22', completion_date: null, related_prime_topic_id: null },
  { id: 'top-feb-11', month_id: 'month-2027-02', name: 'Query Optimization Basics', category: 'DBMS', description: 'EXPLAIN execution plans, query cost, index scans vs table scans, join algorithms.', order: 11, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-02-22', target_date: '2027-02-24', completion_date: null, related_prime_topic_id: null },
  { id: 'top-feb-12', month_id: 'month-2027-02', name: 'MySQL', category: 'DBMS', description: 'InnoDB engine, storage, transactions, foreign key checks, MySQL configuration.', order: 12, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-02-24', target_date: '2027-02-26', completion_date: null, related_prime_topic_id: 'prime-top-35' },
  { id: 'top-feb-13', month_id: 'month-2027-02', name: 'PostgreSQL', category: 'DBMS', description: 'MVCC concurrency control, JSONB support, advanced indexing (GIN, GiST), window functions.', order: 13, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-02-26', target_date: '2027-02-27', completion_date: null, related_prime_topic_id: 'prime-top-35' },
  { id: 'top-feb-14', month_id: 'month-2027-02', name: 'MongoDB Basics', category: 'DBMS', description: 'Document databases, BSON, collections, document embeds vs references, aggregation pipeline.', order: 14, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-02-27', target_date: '2027-02-28', completion_date: null, related_prime_topic_id: null },

  // ==========================================
  // MARCH 2027: Operating Systems (14 topics)
  // ==========================================
  { id: 'top-mar-1', month_id: 'month-2027-03', name: 'OS Fundamentals', category: 'OS', description: 'Dual mode operation, kernel mode vs user mode, system call interface, interrupts, traps.', order: 1, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-03-01', target_date: '2027-03-03', completion_date: null, related_prime_topic_id: null },
  { id: 'top-mar-2', month_id: 'month-2027-03', name: 'Processes', category: 'OS', description: 'Process states, PCB, process scheduling queues, context switching, fork(), exec().', order: 2, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-03-03', target_date: '2027-03-05', completion_date: null, related_prime_topic_id: null },
  { id: 'top-mar-3', month_id: 'month-2027-03', name: 'Threads', category: 'OS', description: 'Kernel-level vs user-level threads, multithreading models, thread pools, synchronization primitives.', order: 3, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-03-05', target_date: '2027-03-07', completion_date: null, related_prime_topic_id: null },
  { id: 'top-mar-4', month_id: 'month-2027-03', name: 'Process vs Thread', category: 'OS', description: 'Memory space sharing, context switch latency comparison, IPC vs shared memory.', order: 4, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-03-07', target_date: '2027-03-09', completion_date: null, related_prime_topic_id: null },
  { id: 'top-mar-5', month_id: 'month-2027-03', name: 'CPU Scheduling', category: 'OS', description: 'Preemptive vs non-preemptive, turnaround time, waiting time, response time, CPU-I/O burst cycle.', order: 5, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-03-09', target_date: '2027-03-12', completion_date: null, related_prime_topic_id: null },
  { id: 'top-mar-6', month_id: 'month-2027-03', name: 'Scheduling Algorithms', category: 'OS', description: 'FCFS, SJF, Shortest Remaining Time First, Round Robin, Priority Scheduling, Multi-Level Feedback Queue.', order: 6, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-03-12', target_date: '2027-03-15', completion_date: null, related_prime_topic_id: null },
  { id: 'top-mar-7', month_id: 'month-2027-03', name: 'Deadlocks', category: 'OS', description: 'Coffman 4 conditions (Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait), RAG graph.', order: 7, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-03-15', target_date: '2027-03-17', completion_date: null, related_prime_topic_id: null },
  { id: 'top-mar-8', month_id: 'month-2027-03', name: 'Deadlock Prevention/Avoidance', category: 'OS', description: 'Bankers algorithm, safe states, deadlock detection, resource preemption and recovery.', order: 8, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-03-17', target_date: '2027-03-20', completion_date: null, related_prime_topic_id: null },
  { id: 'top-mar-9', month_id: 'month-2027-03', name: 'Memory Management', category: 'OS', description: 'Contiguous vs non-contiguous allocation, internal and external fragmentation, segmentation, paging.', order: 9, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-03-20', target_date: '2027-03-22', completion_date: null, related_prime_topic_id: null },
  { id: 'top-mar-10', month_id: 'month-2027-03', name: 'Virtual Memory', category: 'OS', description: 'Demand paging, page fault handling, TLB, FIFO, LRU, Optimal page replacement, thrashing.', order: 10, status: 'Not Started', progress: 0, target_hours: 14, start_date: '2027-03-22', target_date: '2027-03-25', completion_date: null, related_prime_topic_id: null },
  { id: 'top-mar-11', month_id: 'month-2027-03', name: 'File Systems', category: 'OS', description: 'Inodes, directory structures, file allocation methods (contiguous, linked, indexed), disk block caching.', order: 11, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-03-25', target_date: '2027-03-27', completion_date: null, related_prime_topic_id: null },
  { id: 'top-mar-12', month_id: 'month-2027-03', name: 'Linux Processes', category: 'OS', description: 'Process hierarchy, init/systemd, zombie processes, orphan processes, daemon processes.', order: 12, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-03-27', target_date: '2027-03-29', completion_date: null, related_prime_topic_id: null },
  { id: 'top-mar-13', month_id: 'month-2027-03', name: 'Linux Commands', category: 'OS', description: 'ps, top, htop, kill, nice, /proc exploration, strace, lsof for operating system inspection.', order: 13, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-03-29', target_date: '2027-03-30', completion_date: null, related_prime_topic_id: null },
  { id: 'top-mar-14', month_id: 'month-2027-03', name: 'OS Interview Questions', category: 'OS', description: 'Dining Philosophers, Readers-Writers, Semaphores vs Mutex, spinlocks, critical section solutions.', order: 14, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-03-30', target_date: '2027-03-31', completion_date: null, related_prime_topic_id: null },

  // ==========================================
  // APRIL 2027: Computer Networks (14 topics)
  // ==========================================
  { id: 'top-apr-1', month_id: 'month-2027-04', name: 'Networking Fundamentals', category: 'Computer Networks', description: 'Network topologies, packet switching vs circuit switching, bandwidth, latency, throughput.', order: 1, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-04-01', target_date: '2027-04-03', completion_date: null, related_prime_topic_id: null },
  { id: 'top-apr-2', month_id: 'month-2027-04', name: 'OSI Model', category: 'Computer Networks', description: '7 Layers of OSI (Physical to Application), data encapsulation and decapsulation.', order: 2, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-04-03', target_date: '2027-04-06', completion_date: null, related_prime_topic_id: null },
  { id: 'top-apr-3', month_id: 'month-2027-04', name: 'TCP/IP', category: 'Computer Networks', description: 'TCP/IP 4-layer model, mapping to OSI layers, protocol stack architecture.', order: 3, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-04-06', target_date: '2027-04-08', completion_date: null, related_prime_topic_id: null },
  { id: 'top-apr-4', month_id: 'month-2027-04', name: 'IP Addressing', category: 'Computer Networks', description: 'IPv4 vs IPv6, CIDR notation, subnetting, public vs private IP addresses, NAT.', order: 4, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-04-08', target_date: '2027-04-11', completion_date: null, related_prime_topic_id: null },
  { id: 'top-apr-5', month_id: 'month-2027-04', name: 'TCP', category: 'Computer Networks', description: '3-way handshake, 4-way connection teardown, TCP flags (SYN, ACK, FIN, RST), sequence numbers.', order: 5, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-04-11', target_date: '2027-04-14', completion_date: null, related_prime_topic_id: null },
  { id: 'top-apr-6', month_id: 'month-2027-04', name: 'UDP', category: 'Computer Networks', description: 'Connectionless datagrams, lightweight header, DNS/streaming use cases.', order: 6, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-04-14', target_date: '2027-04-16', completion_date: null, related_prime_topic_id: null },
  { id: 'top-apr-7', month_id: 'month-2027-04', name: 'TCP vs UDP', category: 'Computer Networks', description: 'Reliability, speed, ordered delivery, flow control, congestion control comparison.', order: 7, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-04-16', target_date: '2027-04-18', completion_date: null, related_prime_topic_id: null },
  { id: 'top-apr-8', month_id: 'month-2027-04', name: 'HTTP', category: 'Computer Networks', description: 'HTTP/1.0, HTTP/1.1 persistent connections, pipelining, request/response headers, status codes.', order: 8, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-04-18', target_date: '2027-04-20', completion_date: null, related_prime_topic_id: null },
  { id: 'top-apr-9', month_id: 'month-2027-04', name: 'HTTPS', category: 'Computer Networks', description: 'TLS/SSL handshake, certificate authorities, symmetric vs asymmetric encryption in HTTPS.', order: 9, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-04-20', target_date: '2027-04-22', completion_date: null, related_prime_topic_id: null },
  { id: 'top-apr-10', month_id: 'month-2027-04', name: 'DNS', category: 'Computer Networks', description: 'Recursive vs iterative queries, DNS caching, DNS records (A, AAAA, CNAME, MX, TXT).', order: 10, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-04-22', target_date: '2027-04-24', completion_date: null, related_prime_topic_id: null },
  { id: 'top-apr-11', month_id: 'month-2027-04', name: 'Client-Server Architecture', category: 'Computer Networks', description: 'Request-response lifecycle, proxy servers, reverse proxies, load balancing fundamentals.', order: 11, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-04-24', target_date: '2027-04-26', completion_date: null, related_prime_topic_id: null },
  { id: 'top-apr-12', month_id: 'month-2027-04', name: 'Ports', category: 'Computer Networks', description: 'Port numbers (0-65535), well-known ports (80, 443, 22, 53, 3306), ephemeral ports, sockets.', order: 12, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-04-26', target_date: '2027-04-28', completion_date: null, related_prime_topic_id: null },
  { id: 'top-apr-13', month_id: 'month-2027-04', name: 'Basic Networking Troubleshooting', category: 'Computer Networks', description: 'ping, traceroute, nslookup, dig, netstat, tcpdump, Wireshark packet analysis.', order: 13, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-04-28', target_date: '2027-04-29', completion_date: null, related_prime_topic_id: null },
  { id: 'top-apr-14', month_id: 'month-2027-04', name: 'Networking Interview Questions', category: 'Computer Networks', description: 'What happens when you type a URL into a browser? (Complete DNS to rendering trace), TCP windowing.', order: 14, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-04-29', target_date: '2027-04-30', completion_date: null, related_prime_topic_id: null },

  // ==========================================
  // MAY 2027: Computer Organization + Mathematics (17 topics: 7 CO, 10 Math)
  // ==========================================
  // COMPUTER ORGANIZATION
  { id: 'top-may-1', month_id: 'month-2027-05', name: 'CPU', category: 'Computer Organization', description: 'ALU, Control Unit, registers, Von Neumann vs Harvard architecture, CPU clock speed.', order: 1, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-05-01', target_date: '2027-05-03', completion_date: null, related_prime_topic_id: null },
  { id: 'top-may-2', month_id: 'month-2027-05', name: 'Registers', category: 'Computer Organization', description: 'General purpose registers, special registers (PC, IR, MAR, MDR, Stack Pointer).', order: 2, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-05-03', target_date: '2027-05-05', completion_date: null, related_prime_topic_id: null },
  { id: 'top-may-3', month_id: 'month-2027-05', name: 'Memory', category: 'Computer Organization', description: 'RAM, ROM, memory hierarchy, cache levels, bus widths, memory cycle times.', order: 3, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-05-05', target_date: '2027-05-07', completion_date: null, related_prime_topic_id: null },
  { id: 'top-may-4', month_id: 'month-2027-05', name: 'Cache', category: 'Computer Organization', description: 'L1/L2/L3 cache, cache mapping (direct, associative, set-associative), cache replacement policies, cache hit/miss.', order: 4, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-05-07', target_date: '2027-05-10', completion_date: null, related_prime_topic_id: null },
  { id: 'top-may-5', month_id: 'month-2027-05', name: 'CPU Architecture Basics', category: 'Computer Organization', description: 'Instruction cycle (Fetch-Decode-Execute), data bus, address bus, control bus.', order: 5, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-05-10', target_date: '2027-05-12', completion_date: null, related_prime_topic_id: null },
  { id: 'top-may-6', month_id: 'month-2027-05', name: 'Instruction Basics', category: 'Computer Organization', description: 'RISC vs CISC instruction sets, opcodes, operands, addressing modes, instruction pipelining.', order: 6, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-05-12', target_date: '2027-05-14', completion_date: null, related_prime_topic_id: null },
  { id: 'top-may-7', month_id: 'month-2027-05', name: 'Computer Architecture Fundamentals', category: 'Computer Organization', description: 'Direct Memory Access (DMA), pipeline hazards (structural, data, control), branch prediction.', order: 7, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-05-14', target_date: '2027-05-16', completion_date: null, related_prime_topic_id: null },
  // MATHEMATICS
  { id: 'top-may-8', month_id: 'month-2027-05', name: 'Vectors', category: 'Mathematics', description: 'Vector spaces, span, linear combination, linear independence, vector norms (L1, L2 norms).', order: 8, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-05-16', target_date: '2027-05-18', completion_date: null, related_prime_topic_id: 'prime-top-4' },
  { id: 'top-may-9', month_id: 'month-2027-05', name: 'Matrices', category: 'Mathematics', description: 'Matrix representations, rank, determinant, inverse, transpose, identity, symmetric matrices.', order: 9, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-05-18', target_date: '2027-05-20', completion_date: null, related_prime_topic_id: 'prime-top-4' },
  { id: 'top-may-10', month_id: 'month-2027-05', name: 'Matrix Operations', category: 'Mathematics', description: 'Matrix multiplication, row-column operations, matrix transformations, computational complexity.', order: 10, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-05-20', target_date: '2027-05-22', completion_date: null, related_prime_topic_id: 'prime-top-4' },
  { id: 'top-may-11', month_id: 'month-2027-05', name: 'Dot Product', category: 'Mathematics', description: 'Geometric dot product, projection of vectors, cosine similarity, orthogonal vectors.', order: 11, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-05-22', target_date: '2027-05-23', completion_date: null, related_prime_topic_id: 'prime-top-4' },
  { id: 'top-may-12', month_id: 'month-2027-05', name: 'Eigenvalues', category: 'Mathematics', description: 'Characteristic polynomial, scalar factors in linear transformations, geometric multiplicity.', order: 12, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-05-23', target_date: '2027-05-25', completion_date: null, related_prime_topic_id: 'prime-top-4' },
  { id: 'top-may-13', month_id: 'month-2027-05', name: 'Eigenvectors', category: 'Mathematics', description: 'Principal invariant directions, diagonalizability, connection to PCA dimensionality reduction.', order: 13, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-05-25', target_date: '2027-05-27', completion_date: null, related_prime_topic_id: 'prime-top-4' },
  { id: 'top-may-14', month_id: 'month-2027-05', name: 'Differentiation', category: 'Mathematics', description: 'Rate of change, limit definition, rules of differentiation (product, quotient, chain rule).', order: 14, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-05-27', target_date: '2027-05-28', completion_date: null, related_prime_topic_id: 'prime-top-4' },
  { id: 'top-may-15', month_id: 'month-2027-05', name: 'Derivatives', category: 'Mathematics', description: 'Higher order derivatives, tangent planes, stationary points, local minima/maxima.', order: 15, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-05-28', target_date: '2027-05-29', completion_date: null, related_prime_topic_id: 'prime-top-4' },
  { id: 'top-may-16', month_id: 'month-2027-05', name: 'Integration Basics', category: 'Mathematics', description: 'Definite and indefinite integrals, Fundamental Theorem of Calculus, area under curve.', order: 16, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-05-29', target_date: '2027-05-30', completion_date: null, related_prime_topic_id: 'prime-top-4' },
  { id: 'top-may-17', month_id: 'month-2027-05', name: 'Gradients', category: 'Mathematics', description: 'Vector of partial derivatives, directional derivatives, steepest descent direction in optimization.', order: 17, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-05-30', target_date: '2027-05-31', completion_date: null, related_prime_topic_id: 'prime-top-4' },

  // ==========================================
  // JUNE 2027: Data Engineering Foundations (22 topics)
  // ==========================================
  { id: 'top-jun-1', month_id: 'month-2027-06', name: 'NumPy', category: 'Data Engineering', description: 'NumPy architecture, memory layout, vectorization advantages over pure Python loops.', order: 1, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-06-01', target_date: '2027-06-02', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-2', month_id: 'month-2027-06', name: 'NumPy Arrays', category: 'Data Engineering', description: 'ndarray object, shape, dimensions, creation routines (zeros, ones, arange, linspace).', order: 2, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-06-02', target_date: '2027-06-03', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-3', month_id: 'month-2027-06', name: 'Indexing', category: 'Data Engineering', description: 'Integer indexing, multidimensional indexing, views vs copies.', order: 3, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-06-03', target_date: '2027-06-04', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-4', month_id: 'month-2027-06', name: 'Slicing', category: 'Data Engineering', description: 'Slice strides, ellipsis syntax, modifying sliced arrays.', order: 4, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-06-04', target_date: '2027-06-05', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-5', month_id: 'month-2027-06', name: 'Array Operations', category: 'Data Engineering', description: 'Broadcasting rules, arithmetic operators, universal functions (ufuncs), linear algebra operations.', order: 5, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-06-05', target_date: '2027-06-07', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-6', month_id: 'month-2027-06', name: 'Pandas', category: 'Data Engineering', description: 'Pandas internals, memory optimization, data structures overview.', order: 6, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-06-07', target_date: '2027-06-08', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-7', month_id: 'month-2027-06', name: 'Series', category: 'Data Engineering', description: '1D labeled arrays, index operations, alignment, vector operations.', order: 7, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-06-08', target_date: '2027-06-09', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-8', month_id: 'month-2027-06', name: 'DataFrames', category: 'Data Engineering', description: '2D tabular data structure, row/column indexes, dtypes, memory usage inspection.', order: 8, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-06-09', target_date: '2027-06-11', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-9', month_id: 'month-2027-06', name: 'Reading Datasets', category: 'Data Engineering', description: 'Reading CSV, JSON, Excel, Parquet, chunking large datasets.', order: 9, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-06-11', target_date: '2027-06-12', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-10', month_id: 'month-2027-06', name: 'Filtering', category: 'Data Engineering', description: 'Boolean masking, loc, iloc, query(), conditional filtering.', order: 10, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-06-12', target_date: '2027-06-13', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-11', month_id: 'month-2027-06', name: 'Grouping', category: 'Data Engineering', description: 'groupby(), aggregation functions, transform(), filter(), apply().', order: 11, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-06-13', target_date: '2027-06-15', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-12', month_id: 'month-2027-06', name: 'Merging', category: 'Data Engineering', description: 'concat(), merge(), inner/left/right/outer joins, cross joins.', order: 12, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-06-15', target_date: '2027-06-17', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-13', month_id: 'month-2027-06', name: 'Missing Values', category: 'Data Engineering', description: 'isna, notna, dropna, fillna, forward/backward fill, interpolation.', order: 13, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-06-17', target_date: '2027-06-18', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-14', month_id: 'month-2027-06', name: 'Matplotlib', category: 'Data Engineering', description: 'Figures, axes, subplots, line plots, scatter plots, bar charts, custom formatting.', order: 14, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-06-18', target_date: '2027-06-20', completion_date: null, related_prime_topic_id: 'prime-top-3' },
  { id: 'top-jun-15', month_id: 'month-2027-06', name: 'Seaborn', category: 'Data Engineering', description: 'Statistical plots, heatmaps, pairplots, distribution plots, theme styling.', order: 15, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-06-20', target_date: '2027-06-22', completion_date: null, related_prime_topic_id: 'prime-top-3' },
  { id: 'top-jun-16', month_id: 'month-2027-06', name: 'EDA', category: 'Data Engineering', description: 'Exploratory Data Analysis principles, handling skewed distributions, correlation analysis.', order: 16, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-06-22', target_date: '2027-06-24', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-17', month_id: 'month-2027-06', name: 'EDA Dataset 1', category: 'Data Engineering', description: 'End-to-end EDA on real-world tabular dataset: univariate and bivariate analysis.', order: 17, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-06-24', target_date: '2027-06-25', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-18', month_id: 'month-2027-06', name: 'EDA Dataset 2', category: 'Data Engineering', description: 'EDA on financial / timeseries dataset with trend analysis and moving averages.', order: 18, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-06-25', target_date: '2027-06-26', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-19', month_id: 'month-2027-06', name: 'EDA Dataset 3', category: 'Data Engineering', description: 'EDA on healthcare dataset handling class imbalance and categorical encoding.', order: 19, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-06-26', target_date: '2027-06-27', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-20', month_id: 'month-2027-06', name: 'EDA Dataset 4', category: 'Data Engineering', description: 'EDA on e-commerce transaction dataset with RFM customer segmentation analysis.', order: 20, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-06-27', target_date: '2027-06-28', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-21', month_id: 'month-2027-06', name: 'EDA Dataset 5', category: 'Data Engineering', description: 'EDA on sensor / telemetry dataset with anomaly detection and outlier handling.', order: 21, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-06-28', target_date: '2027-06-29', completion_date: null, related_prime_topic_id: 'prime-top-2' },
  { id: 'top-jun-22', month_id: 'month-2027-06', name: 'EDA Reports', category: 'Data Engineering', description: 'Synthesizing professional executive reports with visualization dashboards and business insights.', order: 22, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-06-29', target_date: '2027-06-30', completion_date: null, related_prime_topic_id: 'prime-top-3' },

  // ==========================================
  // JULY 2027: Software Engineering + Backend (13 topics)
  // ==========================================
  { id: 'top-jul-1', month_id: 'month-2027-07', name: 'HTML Fundamentals', category: 'Software Engineering', description: 'Semantic HTML5, DOM elements, forms, accessibility, page structure.', order: 1, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-07-01', target_date: '2027-07-03', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jul-2', month_id: 'month-2027-07', name: 'CSS Fundamentals', category: 'Software Engineering', description: 'Box model, Flexbox, CSS Grid, media queries, responsive design.', order: 2, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-07-03', target_date: '2027-07-05', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jul-3', month_id: 'month-2027-07', name: 'JavaScript Fundamentals', category: 'Software Engineering', description: 'ES6+ syntax, asynchronous programming, Promises, async/await, closures.', order: 3, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-07-05', target_date: '2027-07-08', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jul-4', month_id: 'month-2027-07', name: 'REST APIs', category: 'Backend', description: 'REST architectural constraints, resource naming, HTTP status codes.', order: 4, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-07-08', target_date: '2027-07-10', completion_date: null, related_prime_topic_id: 'prime-top-34' },
  { id: 'top-jul-5', month_id: 'month-2027-07', name: 'API Authentication', category: 'Backend', description: 'JWT tokens, Bearer auth, API keys, password hashing, OAuth2 basics.', order: 5, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-07-10', target_date: '2027-07-13', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jul-6', month_id: 'month-2027-07', name: 'JSON', category: 'Backend', description: 'JSON structure, parsing, serialization, schema validation.', order: 6, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-07-13', target_date: '2027-07-14', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jul-7', month_id: 'month-2027-07', name: 'HTTP Methods', category: 'Backend', description: 'GET, POST, PUT, PATCH, DELETE semantics, idempotency.', order: 7, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-07-14', target_date: '2027-07-16', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jul-8', month_id: 'month-2027-07', name: 'Node.js Basics', category: 'Backend', description: 'Node runtime, event loop, CommonJS vs ES Modules, file system module.', order: 8, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-07-16', target_date: '2027-07-18', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jul-9', month_id: 'month-2027-07', name: 'Express Basics', category: 'Backend', description: 'Middleware architecture, router setup, error handling, CORS.', order: 9, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-07-18', target_date: '2027-07-21', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jul-10', month_id: 'month-2027-07', name: 'FastAPI', category: 'Backend', description: 'Pydantic models, type annotations, dependency injection, auto OpenAPI docs.', order: 10, status: 'Not Started', progress: 0, target_hours: 14, start_date: '2027-07-21', target_date: '2027-07-24', completion_date: null, related_prime_topic_id: 'prime-top-34' },
  { id: 'top-jul-11', month_id: 'month-2027-07', name: 'Backend Project', category: 'Projects', description: 'Roadmap Milestone: Complete REST backend service with auth, validation, and CRUD.', order: 11, status: 'Not Started', progress: 0, target_hours: 16, start_date: '2027-07-24', target_date: '2027-07-27', completion_date: null, related_prime_topic_id: null },
  { id: 'top-jul-12', month_id: 'month-2027-07', name: 'Database Integration', category: 'Backend', description: 'SQLAlchemy / ORM setup, connection pools, migrations, transaction boundaries.', order: 12, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-07-27', target_date: '2027-07-29', completion_date: null, related_prime_topic_id: 'prime-top-35' },
  { id: 'top-jul-13', month_id: 'month-2027-07', name: 'API Deployment', category: 'Backend', description: 'Deploying backend REST service to Render, Railway, or VPS with environment variables.', order: 13, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-07-29', target_date: '2027-07-31', completion_date: null, related_prime_topic_id: null },

  // ==========================================
  // AUGUST 2027: Cloud + MLOps (15 topics)
  // ==========================================
  { id: 'top-aug-1', month_id: 'month-2027-08', name: 'Docker', category: 'Cloud', description: 'Containerization principles, images vs containers, UnionFS, architecture.', order: 1, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-08-01', target_date: '2027-08-03', completion_date: null, related_prime_topic_id: 'prime-top-37' },
  { id: 'top-aug-2', month_id: 'month-2027-08', name: 'Dockerfiles', category: 'Cloud', description: 'Multi-stage builds, caching layers, non-root users, .dockerignore.', order: 2, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-08-03', target_date: '2027-08-05', completion_date: null, related_prime_topic_id: 'prime-top-37' },
  { id: 'top-aug-3', month_id: 'month-2027-08', name: 'Docker Compose', category: 'Cloud', description: 'Multi-container services orchestration (API + DB + Redis).', order: 3, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-08-05', target_date: '2027-08-07', completion_date: null, related_prime_topic_id: 'prime-top-37' },
  { id: 'top-aug-4', month_id: 'month-2027-08', name: 'Containers', category: 'Cloud', description: 'Container networking, volumes, bind mounts, lifecycle commands.', order: 4, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-08-07', target_date: '2027-08-09', completion_date: null, related_prime_topic_id: 'prime-top-37' },
  { id: 'top-aug-5', month_id: 'month-2027-08', name: 'Kubernetes Fundamentals', category: 'Cloud', description: 'Control plane, worker nodes, API server, etcd, scheduler, kubelet.', order: 5, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-08-09', target_date: '2027-08-12', completion_date: null, related_prime_topic_id: 'prime-top-38' },
  { id: 'top-aug-6', month_id: 'month-2027-08', name: 'Pods', category: 'Cloud', description: 'Pod lifecycle, multi-container pods, pod spec manifests.', order: 6, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-08-12', target_date: '2027-08-14', completion_date: null, related_prime_topic_id: 'prime-top-38' },
  { id: 'top-aug-7', month_id: 'month-2027-08', name: 'Services', category: 'Cloud', description: 'ClusterIP, NodePort, LoadBalancer, Ingress routing in K8s.', order: 7, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-08-14', target_date: '2027-08-16', completion_date: null, related_prime_topic_id: 'prime-top-38' },
  { id: 'top-aug-8', month_id: 'month-2027-08', name: 'Deployments', category: 'Cloud', description: 'ReplicaSets, rolling updates, rollbacks, resource limits.', order: 8, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-08-16', target_date: '2027-08-18', completion_date: null, related_prime_topic_id: 'prime-top-38' },
  { id: 'top-aug-9', month_id: 'month-2027-08', name: 'CI/CD Concepts', category: 'MLOps', description: 'Automated test pipelines, GitHub Actions workflows, build & release triggers.', order: 9, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-08-18', target_date: '2027-08-21', completion_date: null, related_prime_topic_id: null },
  { id: 'top-aug-10', month_id: 'month-2027-08', name: 'Cloud Fundamentals', category: 'Cloud', description: 'Cloud computing models (IaaS, PaaS, SaaS), availability zones, regions.', order: 10, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-08-21', target_date: '2027-08-23', completion_date: null, related_prime_topic_id: null },
  { id: 'top-aug-11', month_id: 'month-2027-08', name: 'AWS OR Azure', category: 'Cloud', description: 'Core services: IAM, compute instances (EC2/VM), object storage (S3/Blob).', order: 11, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-08-23', target_date: '2027-08-25', completion_date: null, related_prime_topic_id: null },
  { id: 'top-aug-12', month_id: 'month-2027-08', name: 'Application Deployment', category: 'Cloud', description: 'Deploying containerized web services onto cloud infrastructure.', order: 12, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-08-25', target_date: '2027-08-27', completion_date: null, related_prime_topic_id: null },
  { id: 'top-aug-13', month_id: 'month-2027-08', name: 'AI/ML API Deployment', category: 'MLOps', description: 'Serving machine learning models via high-performance inference APIs.', order: 13, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-08-27', target_date: '2027-08-28', completion_date: null, related_prime_topic_id: 'prime-top-34' },
  { id: 'top-aug-14', month_id: 'month-2027-08', name: 'Basic MLOps', category: 'MLOps', description: 'Model registries, experiment tracking with MLflow, data drift monitoring.', order: 14, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-08-28', target_date: '2027-08-29', completion_date: null, related_prime_topic_id: null },
  { id: 'top-aug-15', month_id: 'month-2027-08', name: 'Model Deployment Workflow', category: 'MLOps', description: 'End-to-end automated deployment pipeline from trained weights to public endpoint.', order: 15, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-08-29', target_date: '2027-08-31', completion_date: null, related_prime_topic_id: null },

  // ==========================================
  // SEPTEMBER 2027: Placement + Portfolio (26 topics across DSA, Projects, Career)
  // ==========================================
  // DSA
  { id: 'top-sep-1', month_id: 'month-2027-09', name: 'DSA Revision', category: 'Placement', description: 'Targeted revision of all major patterns: Arrays to Graphs and DP.', order: 1, status: 'Not Started', progress: 0, target_hours: 14, start_date: '2027-09-01', target_date: '2027-09-05', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-2', month_id: 'month-2027-09', name: '100+ Additional DSA Problems', category: 'Placement', description: 'Sprint solving 100+ high-frequency interview problems.', order: 2, status: 'Not Started', progress: 0, target_hours: 24, start_date: '2027-09-01', target_date: '2027-09-20', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-3', month_id: 'month-2027-09', name: 'LeetCode', category: 'Placement', description: 'Top Interview 150 & Blind 75 curation.', order: 3, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-09-05', target_date: '2027-09-15', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-4', month_id: 'month-2027-09', name: 'Mixed-Topic Practice', category: 'Placement', description: 'Multi-topic contest problem simulations.', order: 4, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-09-10', target_date: '2027-09-20', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-5', month_id: 'month-2027-09', name: 'Timed Problems', category: 'Placement', description: '45-minute strict timeboxed mock interview solving sessions.', order: 5, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-09-15', target_date: '2027-09-25', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-6', month_id: 'month-2027-09', name: 'Weak-Topic Revision', category: 'Placement', description: 'Targeting remaining items from Spaced Revision Queue.', order: 6, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-09-20', target_date: '2027-09-30', completion_date: null, related_prime_topic_id: null },
  // PROJECTS
  { id: 'top-sep-7', month_id: 'month-2027-09', name: 'Strong Python Project', category: 'Projects', description: 'Clean architecture, type hints, unit test coverage, packaging.', order: 7, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-09-01', target_date: '2027-09-08', completion_date: null, related_prime_topic_id: 'prime-top-1' },
  { id: 'top-sep-8', month_id: 'month-2027-09', name: 'Strong ML Project', category: 'Projects', description: 'End-to-end ML prediction pipeline, feature engineering, evaluation metrics.', order: 8, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-09-05', target_date: '2027-09-12', completion_date: null, related_prime_topic_id: 'prime-top-39' },
  { id: 'top-sep-9', month_id: 'month-2027-09', name: 'Deep Learning Project', category: 'Projects', description: 'Computer vision or sequence model trained with transfer learning.', order: 9, status: 'Not Started', progress: 0, target_hours: 14, start_date: '2027-09-10', target_date: '2027-09-18', completion_date: null, related_prime_topic_id: 'prime-top-39' },
  { id: 'top-sep-10', month_id: 'month-2027-09', name: 'GenAI/LLM Project', category: 'Projects', description: 'Production RAG agent with vector database and citation attribution.', order: 10, status: 'Not Started', progress: 0, target_hours: 14, start_date: '2027-09-15', target_date: '2027-09-22', completion_date: null, related_prime_topic_id: 'prime-top-39' },
  { id: 'top-sep-11', month_id: 'month-2027-09', name: 'At Least One Deployed Project', category: 'Projects', description: 'Public cloud endpoint with containerization and live URL.', order: 11, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-09-20', target_date: '2027-09-26', completion_date: null, related_prime_topic_id: 'prime-top-39' },
  // CAREER
  { id: 'top-sep-12', month_id: 'month-2027-09', name: 'Resume', category: 'Placement', description: 'ATS-optimized technical resume using STAR method with quantified results.', order: 12, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-09-01', target_date: '2027-09-05', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-13', month_id: 'month-2027-09', name: 'LinkedIn', category: 'Placement', description: 'Professional headline, project features, and technical networking.', order: 13, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-09-05', target_date: '2027-09-08', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-14', month_id: 'month-2027-09', name: 'GitHub Cleanup', category: 'Placement', description: 'Polishing pinned repositories, licensing, contribution history.', order: 14, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-09-08', target_date: '2027-09-12', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-15', month_id: 'month-2027-09', name: 'Portfolio Website', category: 'Placement', description: 'Fast, responsive developer portfolio showcasing projects and skills.', order: 15, status: 'Not Started', progress: 0, target_hours: 12, start_date: '2027-09-12', target_date: '2027-09-18', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-16', month_id: 'month-2027-09', name: 'Project README Files', category: 'Placement', description: 'Comprehensive READMEs with architecture diagrams, benchmarks, and installation commands.', order: 16, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-09-18', target_date: '2027-09-22', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-17', month_id: 'month-2027-09', name: 'Technical Interview Preparation', category: 'Placement', description: 'Reviewing core CS domains for campus and off-campus placements.', order: 17, status: 'Not Started', progress: 0, target_hours: 10, start_date: '2027-09-20', target_date: '2027-09-26', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-18', month_id: 'month-2027-09', name: 'OOP Interview Questions', category: 'Placement', description: 'High-frequency OOP questions (solid principles, virtual functions, abstract classes).', order: 18, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-09-22', target_date: '2027-09-24', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-19', month_id: 'month-2027-09', name: 'DBMS Interview Questions', category: 'Placement', description: 'Transactions, indexing, normalization, ACID, stored procedures.', order: 19, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-09-24', target_date: '2027-09-26', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-20', month_id: 'month-2027-09', name: 'OS Interview Questions', category: 'Placement', description: 'Deadlocks, virtual memory, process synchronization, threading.', order: 20, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-09-25', target_date: '2027-09-27', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-21', month_id: 'month-2027-09', name: 'CN Interview Questions', category: 'Placement', description: 'TCP vs UDP, 3-way handshake, DNS trace, HTTP/HTTPS.', order: 21, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-09-26', target_date: '2027-09-28', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-22', month_id: 'month-2027-09', name: 'SQL Interview Questions', category: 'Placement', description: 'Complex joins, window functions (ROW_NUMBER, DENSE_RANK), aggregations.', order: 22, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-09-27', target_date: '2027-09-29', completion_date: null, related_prime_topic_id: 'prime-top-35' },
  { id: 'top-sep-23', month_id: 'month-2027-09', name: 'ML Interview Questions', category: 'Placement', description: 'Bias-variance, regularization, loss functions, activation functions, CNN/RNN/Transformers.', order: 23, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-09-28', target_date: '2027-09-30', completion_date: null, related_prime_topic_id: 'prime-top-9' },
  { id: 'top-sep-24', month_id: 'month-2027-09', name: 'Project Explanation Practice', category: 'Placement', description: 'Behavioral rounds, STAR method delivery, system design whiteboard explanation.', order: 24, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-09-28', target_date: '2027-09-30', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-25', month_id: 'month-2027-09', name: 'HR Questions', category: 'Placement', description: 'Behavioral, teamwork, conflict resolution, leadership principles, company culture.', order: 25, status: 'Not Started', progress: 0, target_hours: 6, start_date: '2027-09-29', target_date: '2027-09-30', completion_date: null, related_prime_topic_id: null },
  { id: 'top-sep-26', month_id: 'month-2027-09', name: 'Mock Interviews', category: 'Placement', description: 'Live timed mock technical coding sessions and behavioral evaluation rounds.', order: 26, status: 'Not Started', progress: 0, target_hours: 8, start_date: '2027-09-29', target_date: '2027-09-30', completion_date: null, related_prime_topic_id: null }
];

export const INITIAL_ROADMAP_SUBTOPICS = [
  // Subtopics for Java Fundamentals (top-oct-1)
  { id: 'sub-oct-1-1', topic_id: 'top-oct-1', name: 'Primitive data types & byte sizes', order: 1, status: 'Not Started', progress: 0, notes: 'int, float, double, char, boolean, byte, short, long' },
  { id: 'sub-oct-1-2', topic_id: 'top-oct-1', name: 'JVM architecture (JDK, JRE, bytecode & JVM execution)', order: 2, status: 'Not Started', progress: 0, notes: 'Inspected bytecode compilation and JVM execution model' },
  { id: 'sub-oct-1-3', topic_id: 'top-oct-1', name: 'Variables, type casting (widening & narrowing) & scopes', order: 3, status: 'Not Started', progress: 0, notes: 'Type casting boundaries and scope lifecycles' },
  { id: 'sub-oct-1-4', topic_id: 'top-oct-1', name: 'Basic arithmetic & logical expressions', order: 4, status: 'Not Started', progress: 0, notes: 'Arithmetic, logical and assignment operators' },

  // Subtopics for Java Input/Output & Operators (top-oct-2)
  { id: 'sub-oct-2-1', topic_id: 'top-oct-2', name: 'Scanner input parsing & tokenization', order: 1, status: 'Not Started', progress: 0, notes: 'Handling nextLine(), nextInt() line buffer flushes' },
  { id: 'sub-oct-2-2', topic_id: 'top-oct-2', name: 'System.out formatting (printf, println)', order: 2, status: 'Not Started', progress: 0, notes: 'Format specifiers %d, %s, %f' },
  { id: 'sub-oct-2-3', topic_id: 'top-oct-2', name: 'Relational and equality operators', order: 3, status: 'Not Started', progress: 0, notes: '' },
  { id: 'sub-oct-2-4', topic_id: 'top-oct-2', name: 'Bitwise operators and precedence', order: 4, status: 'Not Started', progress: 0, notes: '' },

  // Subtopics for Java Conditions & Control Flow (top-oct-3)
  { id: 'sub-oct-3-1', topic_id: 'top-oct-3', name: 'if / else if / else branching', order: 1, status: 'Not Started', progress: 0, notes: '' },
  { id: 'sub-oct-3-2', topic_id: 'top-oct-3', name: 'Nested condition statements', order: 2, status: 'Not Started', progress: 0, notes: '' },
  { id: 'sub-oct-3-3', topic_id: 'top-oct-3', name: 'Ternary conditional operator', order: 3, status: 'Not Started', progress: 0, notes: '' },
  { id: 'sub-oct-3-4', topic_id: 'top-oct-3', name: 'Enhanced switch-case expressions', order: 4, status: 'Not Started', progress: 0, notes: '' },

  // Subtopics for Java Loops & Iteration (top-oct-4)
  { id: 'sub-oct-4-1', topic_id: 'top-oct-4', name: 'for loops & enhanced for-each loops', order: 1, status: 'Not Started', progress: 0, notes: '' },
  { id: 'sub-oct-4-2', topic_id: 'top-oct-4', name: 'while & do-while iteration', order: 2, status: 'Not Started', progress: 0, notes: '' },
  { id: 'sub-oct-4-3', topic_id: 'top-oct-4', name: 'Nested loops & matrix traversal', order: 3, status: 'Not Started', progress: 0, notes: '' },
  { id: 'sub-oct-4-4', topic_id: 'top-oct-4', name: 'break, continue & labeled statements', order: 4, status: 'Not Started', progress: 0, notes: '' },

  // Subtopics for Java Arrays (top-oct-5)
  { id: 'sub-oct-5-1', topic_id: 'top-oct-5', name: '1D Arrays instantiation & indexing', order: 1, status: 'Not Started', progress: 0, notes: '' },
  { id: 'sub-oct-5-2', topic_id: 'top-oct-5', name: '2D Arrays & matrix operations', order: 2, status: 'Not Started', progress: 0, notes: '' },
  { id: 'sub-oct-5-3', topic_id: 'top-oct-5', name: 'Arrays utility class (sort, binarySearch, copyOf)', order: 3, status: 'Not Started', progress: 0, notes: '' },

  // Subtopics for Java Strings (top-oct-6)
  { id: 'sub-oct-6-1', topic_id: 'top-oct-6', name: 'String pool & immutability semantics', order: 1, status: 'Not Started', progress: 0, notes: '' },
  { id: 'sub-oct-6-2', topic_id: 'top-oct-6', name: 'Core String methods (substring, indexOf, replace)', order: 2, status: 'Not Started', progress: 0, notes: '' },
  { id: 'sub-oct-6-3', topic_id: 'top-oct-6', name: 'StringBuilder for high-performance concatenation', order: 3, status: 'Not Started', progress: 0, notes: '' }
];

// DEDICATED PRIME 3.0 COURSE TOPICS (Track A - 39 Topics exactly as listed)
export const PRIME_3_TOPICS_LIST = [
  { id: 'prime-top-1', name: 'Python', category: 'Programming', order: 1, status: 'Not Started', progress: 0, notes: 'Python 3.12 syntax, data structures, and OOP.', start_date: '2026-10-01', target_date: '2026-10-15', completion_date: null },
  { id: 'prime-top-2', name: 'Data Pre-processing', category: 'Data', order: 2, status: 'Not Started', progress: 0, notes: 'Missing data imputation, outlier detection, scaling.', start_date: '2026-10-16', target_date: '2026-10-31', completion_date: null },
  { id: 'prime-top-3', name: 'Data Visualization', category: 'Data', order: 3, status: 'Not Started', progress: 0, notes: 'Matplotlib and Seaborn statistical plots.', start_date: '2026-11-01', target_date: '2026-11-15', completion_date: null },
  { id: 'prime-top-4', name: 'Math for AI - Statistics and Probability', category: 'Mathematics', order: 4, status: 'Not Started', progress: 0, notes: 'Distributions, hypothesis testing, Bayes rule.', start_date: '2026-11-16', target_date: '2026-11-30', completion_date: null },
  { id: 'prime-top-5', name: 'Precision', category: 'Machine Learning', order: 5, status: 'Not Started', progress: 0, notes: 'TP / (TP + FP) optimization.', start_date: '2026-12-01', target_date: '2026-12-05', completion_date: null },
  { id: 'prime-top-6', name: 'Recall', category: 'Machine Learning', order: 6, status: 'Not Started', progress: 0, notes: 'TP / (TP + FN) sensitivity.', start_date: '2026-12-05', target_date: '2026-12-10', completion_date: null },
  { id: 'prime-top-7', name: 'F1', category: 'Machine Learning', order: 7, status: 'Not Started', progress: 0, notes: 'Harmonic mean of precision and recall.', start_date: '2026-12-10', target_date: '2026-12-15', completion_date: null },
  { id: 'prime-top-8', name: 'Bias/Variance Tradeoff', category: 'Machine Learning', order: 8, status: 'Not Started', progress: 0, notes: 'Underfitting vs overfitting diagnostics.', start_date: '2026-12-15', target_date: '2026-12-20', completion_date: null },
  { id: 'prime-top-9', name: 'Machine Learning', category: 'Machine Learning', order: 9, status: 'Not Started', progress: 0, notes: 'Foundational ML pipelines and validation.', start_date: '2026-12-20', target_date: '2026-12-31', completion_date: null },
  { id: 'prime-top-10', name: 'Supervised Learning', category: 'Machine Learning', order: 10, status: 'Not Started', progress: 0, notes: 'Label-guided training workflows.', start_date: '2027-01-01', target_date: '2027-01-08', completion_date: null },
  { id: 'prime-top-11', name: 'Regression', category: 'Machine Learning', order: 11, status: 'Not Started', progress: 0, notes: 'Continuous target estimation (MSE/MAE).', start_date: '2027-01-08', target_date: '2027-01-15', completion_date: null },
  { id: 'prime-top-12', name: 'Classification', category: 'Machine Learning', order: 12, status: 'Not Started', progress: 0, notes: 'Discrete class decision boundaries.', start_date: '2027-01-15', target_date: '2027-01-22', completion_date: null },
  { id: 'prime-top-13', name: 'Unsupervised Learning', category: 'Machine Learning', order: 13, status: 'Not Started', progress: 0, notes: 'Pattern discovery without ground truth labels.', start_date: '2027-01-22', target_date: '2027-01-31', completion_date: null },
  { id: 'prime-top-14', name: 'Clustering', category: 'Machine Learning', order: 14, status: 'Not Started', progress: 0, notes: 'Centroid and density-based grouping.', start_date: '2027-02-01', target_date: '2027-02-08', completion_date: null },
  { id: 'prime-top-15', name: 'Association', category: 'Machine Learning', order: 15, status: 'Not Started', progress: 0, notes: 'Apriori and FP-Growth association rules.', start_date: '2027-02-08', target_date: '2027-02-15', completion_date: null },
  { id: 'prime-top-16', name: 'Reinforcement Learning', category: 'Machine Learning', order: 16, status: 'Not Started', progress: 0, notes: 'MDP, Bellman equations, and Q-learning.', start_date: '2027-02-15', target_date: '2027-02-28', completion_date: null },
  { id: 'prime-top-17', name: 'Logistic Regression', category: 'Machine Learning', order: 17, status: 'Not Started', progress: 0, notes: 'Sigmoid activation and log-loss.', start_date: '2027-03-01', target_date: '2027-03-08', completion_date: null },
  { id: 'prime-top-18', name: 'SVM', category: 'Machine Learning', order: 18, status: 'Not Started', progress: 0, notes: 'Hyperplane separation and kernel tricks.', start_date: '2027-03-08', target_date: '2027-03-15', completion_date: null },
  { id: 'prime-top-19', name: 'Decision Tree', category: 'Machine Learning', order: 19, status: 'Not Started', progress: 0, notes: 'Entropy, Gini impurity, and pruning.', start_date: '2027-03-15', target_date: '2027-03-22', completion_date: null },
  { id: 'prime-top-20', name: 'K-Means', category: 'Machine Learning', order: 20, status: 'Not Started', progress: 0, notes: 'Centroid initialization and elbow method.', start_date: '2027-03-22', target_date: '2027-03-31', completion_date: null },
  { id: 'prime-top-21', name: 'OpenAI APIs', category: 'GenAI', order: 21, status: 'Not Started', progress: 0, notes: 'ChatCompletions, function calling, streaming.', start_date: '2027-04-01', target_date: '2027-04-08', completion_date: null },
  { id: 'prime-top-22', name: 'Deep Learning', category: 'Deep Learning', order: 22, status: 'Not Started', progress: 0, notes: 'Neural network architectures and gradient backprop.', start_date: '2027-04-08', target_date: '2027-04-15', completion_date: null },
  { id: 'prime-top-23', name: 'Perceptron', category: 'Deep Learning', order: 23, status: 'Not Started', progress: 0, notes: 'Single-layer linear threshold unit.', start_date: '2027-04-15', target_date: '2027-04-20', completion_date: null },
  { id: 'prime-top-24', name: 'FNN', category: 'Deep Learning', order: 24, status: 'Not Started', progress: 0, notes: 'Feed-forward multi-layer networks.', start_date: '2027-04-20', target_date: '2027-04-25', completion_date: null },
  { id: 'prime-top-25', name: 'CNN', category: 'Deep Learning', order: 25, status: 'Not Started', progress: 0, notes: 'Convolutional layers, pooling, feature maps.', start_date: '2027-04-25', target_date: '2027-04-30', completion_date: null },
  { id: 'prime-top-26', name: 'RNN', category: 'NLP', order: 26, status: 'Not Started', progress: 0, notes: 'Recurrent hidden states for sequence data.', start_date: '2027-05-01', target_date: '2027-05-10', completion_date: null },
  { id: 'prime-top-27', name: 'Transformers', category: 'GenAI', order: 27, status: 'Not Started', progress: 0, notes: 'Multi-head self-attention mechanism.', start_date: '2027-05-10', target_date: '2027-05-20', completion_date: null },
  { id: 'prime-top-28', name: 'TensorFlow', category: 'Deep Learning', order: 28, status: 'Not Started', progress: 0, notes: 'Keras models, custom layers, training loops.', start_date: '2027-05-20', target_date: '2027-05-31', completion_date: null },
  { id: 'prime-top-29', name: 'GenAI', category: 'GenAI', order: 29, status: 'Not Started', progress: 0, notes: 'Generative models and latent spaces.', start_date: '2027-06-01', target_date: '2027-06-10', completion_date: null },
  { id: 'prime-top-30', name: 'LLMs', category: 'GenAI', order: 30, status: 'Not Started', progress: 0, notes: 'Large Language Model scaling, tokens, and inference.', start_date: '2027-06-10', target_date: '2027-06-20', completion_date: null },
  { id: 'prime-top-31', name: 'NLP', category: 'NLP', order: 31, status: 'Not Started', progress: 0, notes: 'Tokenization, embeddings, text preprocessing.', start_date: '2027-06-20', target_date: '2027-06-30', completion_date: null },
  { id: 'prime-top-32', name: 'RAG', category: 'GenAI', order: 32, status: 'Not Started', progress: 0, notes: 'Retrieval-Augmented Generation with vector stores.', start_date: '2027-07-01', target_date: '2027-07-15', completion_date: null },
  { id: 'prime-top-33', name: 'GAN', category: 'Deep Learning', order: 33, status: 'Not Started', progress: 0, notes: 'Generator vs Discriminator minimax training.', start_date: '2027-07-15', target_date: '2027-07-31', completion_date: null },
  { id: 'prime-top-34', name: 'Flask', category: 'Development', order: 34, status: 'Not Started', progress: 0, notes: 'REST API model serving endpoints.', start_date: '2027-08-01', target_date: '2027-08-08', completion_date: null },
  { id: 'prime-top-35', name: 'SQL for Data Science', category: 'Databases', order: 35, status: 'Not Started', progress: 0, notes: 'Querying, joins, and aggregating features.', start_date: '2027-08-08', target_date: '2027-08-15', completion_date: null },
  { id: 'prime-top-36', name: 'Git & GitHub', category: 'DevOps', order: 36, status: 'Not Started', progress: 0, notes: 'Version control for AI code and weights.', start_date: '2027-08-15', target_date: '2027-08-20', completion_date: null },
  { id: 'prime-top-37', name: 'Docker', category: 'DevOps', order: 37, status: 'Not Started', progress: 0, notes: 'Containerizing inference environments.', start_date: '2027-08-20', target_date: '2027-08-25', completion_date: null },
  { id: 'prime-top-38', name: 'Kubernetes', category: 'DevOps', order: 38, status: 'Not Started', progress: 0, notes: 'Scaling model pods and cluster deployments.', start_date: '2027-08-25', target_date: '2027-08-31', completion_date: null },
  { id: 'prime-top-39', name: 'Multiple Minor & Major Projects', category: 'Projects', order: 39, status: 'Not Started', progress: 0, notes: 'Production capstone pipelines and deployment.', start_date: '2027-09-01', target_date: '2027-09-30', completion_date: null }
];

export const PRIME_3_MODULES_HIERARCHY = [
  { id: 'pmod-1', name: 'Module 1: Python & Development Environment', order: 1, topicIds: ['prime-top-1', 'prime-top-36'] },
  { id: 'pmod-2', name: 'Module 2: Data Pre-processing & Feature Engineering', order: 2, topicIds: ['prime-top-2'] },
  { id: 'pmod-3', name: 'Module 3: Data Visualization & EDA', order: 3, topicIds: ['prime-top-3'] },
  { id: 'pmod-4', name: 'Module 4: Math for AI (Statistics & Probability)', order: 4, topicIds: ['prime-top-4'] },
  { id: 'pmod-5', name: 'Module 5: Machine Learning Evaluation & Metrics', order: 5, topicIds: ['prime-top-5', 'prime-top-6', 'prime-top-7', 'prime-top-8'] },
  { id: 'pmod-6', name: 'Module 6: Classical Supervised Machine Learning', order: 6, topicIds: ['prime-top-9', 'prime-top-10', 'prime-top-11', 'prime-top-12', 'prime-top-17', 'prime-top-18', 'prime-top-19'] },
  { id: 'pmod-7', name: 'Module 7: Unsupervised Learning & Clustering', order: 7, topicIds: ['prime-top-13', 'prime-top-14', 'prime-top-15', 'prime-top-20'] },
  { id: 'pmod-8', name: 'Module 8: Reinforcement Learning', order: 8, topicIds: ['prime-top-16'] },
  { id: 'pmod-9', name: 'Module 9: Deep Learning & Neural Network Foundations', order: 9, topicIds: ['prime-top-22', 'prime-top-23', 'prime-top-24', 'prime-top-28'] },
  { id: 'pmod-10', name: 'Module 10: Computer Vision & CNNs', order: 10, topicIds: ['prime-top-25'] },
  { id: 'pmod-11', name: 'Module 11: Sequence Models, RNNs & NLP', order: 11, topicIds: ['prime-top-26', 'prime-top-31'] },
  { id: 'pmod-12', name: 'Module 12: Transformers & Modern Language Models', order: 12, topicIds: ['prime-top-27'] },
  { id: 'pmod-13', name: 'Module 13: Generative AI, LLMs & OpenAI APIs', order: 13, topicIds: ['prime-top-21', 'prime-top-29', 'prime-top-30', 'prime-top-32'] },
  { id: 'pmod-14', name: 'Module 14: Generative Adversarial Networks (GANs)', order: 14, topicIds: ['prime-top-33'] },
  { id: 'pmod-15', name: 'Module 15: AI Deployment, Backend & MLOps', order: 15, topicIds: ['prime-top-34', 'prime-top-35', 'prime-top-37', 'prime-top-38'] },
  { id: 'pmod-16', name: 'Module 16: Minor & Major Capstone Projects', order: 16, topicIds: ['prime-top-39'] }
];

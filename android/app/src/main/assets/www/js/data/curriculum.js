/**
 * Akshay's 12-Month AI/ML Career OS - Curriculum Data
 * Track A: Prime 3.0 AI/ML (Separate specialized course tracker)
 * Track B: Individual Learning Roadmap (October 1, 2026 to September 30, 2027)
 */

export const PRIME_3_COURSE = {
  id: 'prime-3.0',
  title: 'Prime 3.0 AI/ML',
  instructor: 'AI/ML Specialization Cohort',
  totalHoursEst: 350,
  modules: [
    {
      id: 'p-mod-1',
      title: 'Python for AI/ML & Environment Setup',
      topics: ['Python Basics', 'Data Structures (Lists, Dicts, Sets)', 'Functions & Lambda', 'OOP in Python', 'Virtual Envs & Git Workflow'],
      lessons: [
        { id: 'p-1-1', title: 'Python Syntax, Control Flow & Data Types', estHours: 2.0 },
        { id: 'p-1-2', title: 'Python Data Structures & Memory References', estHours: 2.5 },
        { id: 'p-1-3', title: 'Functional Programming & Comprehensions', estHours: 2.0 },
        { id: 'p-1-4', title: 'OOP in Python: Classes, Magic Methods & Inheritance', estHours: 3.0 },
        { id: 'p-1-5', title: 'File Handling, JSON & Exception Management', estHours: 2.0 }
      ]
    },
    {
      id: 'p-mod-2',
      title: 'Data Pre-processing & Feature Engineering',
      topics: ['Data Pre-processing', 'Missing Value Imputation', 'Outlier Detection', 'Feature Scaling', 'Categorical Encoding'],
      lessons: [
        { id: 'p-2-1', title: 'Data Cleaning Strategies & Identifying Noise', estHours: 2.5 },
        { id: 'p-2-2', title: 'Handling Missing Data: Mean, Median, KNN & MICE', estHours: 2.5 },
        { id: 'p-2-3', title: 'Feature Scaling: StandardScaler vs MinMaxScaler vs Robust', estHours: 2.0 },
        { id: 'p-2-4', title: 'Outlier Detection: IQR, Z-Score & Isolation Forests', estHours: 2.5 },
        { id: 'p-2-5', title: 'Encoding Techniques: One-Hot, Target & Ordinal Encoding', estHours: 2.5 }
      ]
    },
    {
      id: 'p-mod-3',
      title: 'Data Visualization & Exploratory Data Analysis (EDA)',
      topics: ['Data Visualization', 'Matplotlib Mastery', 'Seaborn Aesthetics', 'Statistical Visualizations'],
      lessons: [
        { id: 'p-3-1', title: 'Matplotlib Architecture: Subplots, Figures & Axes', estHours: 2.5 },
        { id: 'p-3-2', title: 'Seaborn for Statistical Distributions & Relationships', estHours: 2.5 },
        { id: 'p-3-3', title: 'Multivariate Analysis & Correlation Heatmaps', estHours: 2.0 },
        { id: 'p-3-4', title: 'Interactive EDA Pipelines & Storytelling Visuals', estHours: 3.0 }
      ]
    },
    {
      id: 'p-mod-4',
      title: 'Math for AI: Statistics & Probability',
      topics: ['Math for AI - Statistics and Probability', 'Probability Distributions', 'Hypothesis Testing', 'Bayes Theorem'],
      lessons: [
        { id: 'p-4-1', title: 'Descriptive Statistics: Central Tendency, Variance & Skewness', estHours: 2.5 },
        { id: 'p-4-2', title: 'Probability Rules, Conditional Probability & Bayes Theorem', estHours: 3.0 },
        { id: 'p-4-3', title: 'Continuous & Discrete Probability Distributions (Normal, Binomial, Poisson)', estHours: 3.0 },
        { id: 'p-4-4', title: 'Inferential Statistics, CLT, Confidence Intervals & P-values', estHours: 3.5 }
      ]
    },
    {
      id: 'p-mod-5',
      title: 'Machine Learning Evaluation Metrics & Tradeoffs',
      topics: ['Precision', 'Recall', 'F1', 'Bias/Variance Tradeoff', 'ROC-AUC', 'Cross-Validation'],
      lessons: [
        { id: 'p-5-1', title: 'Confusion Matrix, Precision, Recall & Specificity', estHours: 2.5 },
        { id: 'p-5-2', title: 'F1-Score, Macro/Micro/Weighted F1 & Threshold Tuning', estHours: 2.5 },
        { id: 'p-5-3', title: 'Bias-Variance Decomposition & Diagnosing Over/Underfitting', estHours: 3.0 },
        { id: 'p-5-4', title: 'ROC-AUC Curves & Precision-Recall Curves in Imbalanced Data', estHours: 2.5 },
        { id: 'p-5-5', title: 'K-Fold Cross-Validation & Stratified Splitting Protocols', estHours: 2.0 }
      ]
    },
    {
      id: 'p-mod-6',
      title: 'Supervised Learning: Regression & Classification',
      topics: ['Supervised Learning', 'Regression', 'Classification', 'Logistic Regression', 'SVM', 'Decision Tree'],
      lessons: [
        { id: 'p-6-1', title: 'Simple & Multiple Linear Regression, Cost Function (MSE/MAE)', estHours: 3.0 },
        { id: 'p-6-2', title: 'Gradient Descent Optimization (Batch, Mini-batch, Stochastic)', estHours: 3.0 },
        { id: 'p-6-3', title: 'Regularization: Ridge (L2), Lasso (L1) & ElasticNet', estHours: 2.5 },
        { id: 'p-6-4', title: 'Logistic Regression & Sigmoid Decision Boundaries', estHours: 3.0 },
        { id: 'p-6-5', title: 'Support Vector Machines (SVM): Hard/Soft Margin & Kernels', estHours: 3.5 },
        { id: 'p-6-6', title: 'Decision Trees: Information Gain, Gini Impurity & Pruning', estHours: 3.0 },
        { id: 'p-6-7', title: 'Ensemble Learning: Random Forests, Bagging & Boosting (XGBoost/LightGBM)', estHours: 4.0 }
      ]
    },
    {
      id: 'p-mod-7',
      title: 'Unsupervised Learning & Clustering',
      topics: ['Unsupervised Learning', 'Clustering', 'K-Means', 'Association', 'PCA'],
      lessons: [
        { id: 'p-7-1', title: 'K-Means Clustering: Algorithm, Elbow Method & Silhouette Score', estHours: 3.0 },
        { id: 'p-7-2', title: 'Hierarchical Clustering & DBSCAN Density-based Clustering', estHours: 3.0 },
        { id: 'p-7-3', title: 'Dimensionality Reduction: Principal Component Analysis (PCA)', estHours: 3.5 },
        { id: 'p-7-4', title: 'Association Rule Mining: Apriori Algorithm & FP-Growth', estHours: 2.5 }
      ]
    },
    {
      id: 'p-mod-8',
      title: 'Reinforcement Learning Foundations',
      topics: ['Reinforcement Learning', 'Markov Decision Process', 'Q-Learning', 'Bellman Equation'],
      lessons: [
        { id: 'p-8-1', title: 'RL Framework: Agent, Environment, State, Action & Reward', estHours: 3.0 },
        { id: 'p-8-2', title: 'Markov Decision Processes (MDP) & Bellman Optimality Equations', estHours: 3.5 },
        { id: 'p-8-3', title: 'Q-Learning: Tabular Q-Learning & Exploration vs Exploitation (Epsilon-Greedy)', estHours: 3.5 },
        { id: 'p-8-4', title: 'Deep Q-Networks (DQN) Overview & Policy Gradients Intro', estHours: 3.0 }
      ]
    },
    {
      id: 'p-mod-9',
      title: 'Deep Learning & Neural Network Foundations',
      topics: ['Deep Learning', 'Perceptron', 'FNN', 'TensorFlow', 'Backpropagation'],
      lessons: [
        { id: 'p-9-1', title: 'Biological vs Artificial Neuron: Perceptron Model & Math', estHours: 2.5 },
        { id: 'p-9-2', title: 'Feed-Forward Neural Networks (FNN) & Multilayer Perceptrons (MLP)', estHours: 3.0 },
        { id: 'p-9-3', title: 'Activation Functions: ReLU, LeakyReLU, Sigmoid, Tanh, GELU', estHours: 2.5 },
        { id: 'p-9-4', title: 'Backpropagation Calculus & Computational Graphs', estHours: 4.0 },
        { id: 'p-9-5', title: 'TensorFlow & Keras Implementation from Scratch', estHours: 3.5 },
        { id: 'p-9-6', title: 'Modern Optimizers: SGD with Momentum, RMSprop, Adam, AdamW', estHours: 2.5 }
      ]
    },
    {
      id: 'p-mod-10',
      title: 'Computer Vision & Convolutional Neural Networks',
      topics: ['CNN', 'Convolution Kernels', 'Pooling Layers', 'Transfer Learning'],
      lessons: [
        { id: 'p-10-1', title: 'Computer Vision Basics: Kernels, Convolutions, Stride & Padding', estHours: 3.0 },
        { id: 'p-10-2', title: 'CNN Architecture: Conv2D, MaxPool, Flatten & Dense Layers', estHours: 3.5 },
        { id: 'p-10-3', title: 'Regularization in CNNs: Dropout, Batch Normalization, Data Augmentation', estHours: 2.5 },
        { id: 'p-10-4', title: 'Classic CNN Architectures: AlexNet, VGG, ResNet & Skip Connections', estHours: 4.0 },
        { id: 'p-10-5', title: 'Transfer Learning with Pretrained Models (ResNet50 / MobileNet)', estHours: 3.5 }
      ]
    },
    {
      id: 'p-mod-11',
      title: 'Sequence Models, RNNs & Natural Language Processing',
      topics: ['RNN', 'NLP', 'LSTMs', 'Tokenization', 'Word Embeddings'],
      lessons: [
        { id: 'p-11-1', title: 'NLP Pipeline: Text Preprocessing, Tokenization, Stemming & Lemmatization', estHours: 2.5 },
        { id: 'p-11-2', title: 'Word Representation: Bag of Words, TF-IDF & Word2Vec Embeddings', estHours: 3.0 },
        { id: 'p-11-3', title: 'Recurrent Neural Networks (RNN) & Vanishing Gradient Problem', estHours: 3.0 },
        { id: 'p-11-4', title: 'Long Short-Term Memory (LSTM) Networks & Gated Recurrent Units (GRU)', estHours: 4.0 },
        { id: 'p-11-5', title: 'Bidirectional RNNs & Sequence-to-Sequence Architecture', estHours: 3.5 }
      ]
    },
    {
      id: 'p-mod-12',
      title: 'Transformers Architecture & Modern NLP',
      topics: ['Transformers', 'Attention Mechanism', 'Self-Attention', 'BERT', 'GPT'],
      lessons: [
        { id: 'p-12-1', title: 'The Attention Mechanism & Bahdanau Attention', estHours: 3.5 },
        { id: 'p-12-2', title: 'Transformer Deep Dive: Scaled Dot-Product & Multi-Head Self-Attention', estHours: 4.5 },
        { id: 'p-12-3', title: 'Positional Encoding, LayerNorm & Residual Connections', estHours: 3.0 },
        { id: 'p-12-4', title: 'Encoder Models (BERT) vs Decoder Models (GPT)', estHours: 3.5 },
        { id: 'p-12-5', title: 'Hugging Face Transformers Ecosystem & Pipelines', estHours: 4.0 }
      ]
    },
    {
      id: 'p-mod-13',
      title: 'Generative AI, LLMs & Retrieval-Augmented Generation (RAG)',
      topics: ['GenAI', 'LLMs', 'OpenAI APIs', 'RAG', 'Vector Databases'],
      lessons: [
        { id: 'p-13-1', title: 'Generative AI & Modern LLM Architectures (Parameters, Context Windows)', estHours: 3.0 },
        { id: 'p-13-2', title: 'OpenAI APIs: ChatCompletions, Streaming, Embeddings & Function Calling', estHours: 3.5 },
        { id: 'p-13-3', title: 'Prompt Engineering Strategies: Chain-of-Thought, ReAct, Few-Shot', estHours: 2.5 },
        { id: 'p-13-4', title: 'RAG Architecture: Document Chunking, Embedding Models & Vector Stores', estHours: 4.0 },
        { id: 'p-13-5', title: 'Vector Databases: ChromaDB, FAISS & Similarity Search (Cosine, Dot)', estHours: 3.5 },
        { id: 'p-13-6', title: 'Building an End-to-End Production RAG Application', estHours: 5.0 }
      ]
    },
    {
      id: 'p-mod-14',
      title: 'Generative Models: GANs (Generative Adversarial Networks)',
      topics: ['GAN', 'Generative Models', 'Adversarial Training'],
      lessons: [
        { id: 'p-14-1', title: 'GAN Theory: Minimax Game, Generator vs Discriminator', estHours: 3.5 },
        { id: 'p-14-2', title: 'Deep Convolutional GANs (DCGAN) Architecture & Training Stability', estHours: 4.0 },
        { id: 'p-14-3', title: 'Conditional GANs & Image-to-Image Translation Overview', estHours: 3.0 }
      ]
    },
    {
      id: 'p-mod-15',
      title: 'AI Deployment, Backend & MLOps in Prime 3.0',
      topics: ['Flask', 'SQL for Data Science', 'Git & GitHub', 'Docker', 'Kubernetes'],
      lessons: [
        { id: 'p-15-1', title: 'SQL for Data Science: Joins, Aggregations & Querying Features', estHours: 3.0 },
        { id: 'p-15-2', title: 'Serving Models with Flask: REST Endpoints & Serialization (Pickle/ONNX)', estHours: 3.5 },
        { id: 'p-15-3', title: 'Git & GitHub Best Practices for AI/ML Repositories', estHours: 2.5 },
        { id: 'p-15-4', title: 'Dockerizing Machine Learning Models & Containerizing APIs', estHours: 4.0 },
        { id: 'p-15-5', title: 'Kubernetes for AI: Pods, Deployments & Scaling Inference', estHours: 4.0 }
      ]
    },
    {
      id: 'p-mod-16',
      title: 'Prime 3.0 Minor & Major Capstone Projects',
      topics: ['Multiple Minor & Major Projects'],
      lessons: [
        { id: 'p-16-1', title: 'Minor Project 1: End-to-End Supervised ML Pipeline with Dashboard', estHours: 8.0 },
        { id: 'p-16-2', title: 'Minor Project 2: Deep Learning Vision Classification System', estHours: 10.0 },
        { id: 'p-16-3', title: 'Major Project 1: Production Multi-Document RAG with OpenAI APIs', estHours: 16.0 },
        { id: 'p-16-4', title: 'Major Project 2: Containerized & Deployed Full-Stack AI Application', estHours: 20.0 }
      ]
    }
  ]
};

export const INDIVIDUAL_ROADMAP_MONTHS = [
  {
    monthIndex: 0,
    monthKey: '2026-10',
    name: 'October 2026',
    title: 'Programming + Developer Foundations',
    theme: 'Low-Level Mastery & Developer Tooling',
    targetHours: 110,
    topics: [
      { id: 'oct-1', title: 'Java — Playlist Track: Lecture 1', detail: 'Introduction to Java Language, JDK/JRE/JVM, installation & first program.' },
      { id: 'oct-2', title: 'Java — Playlist Track: Lecture 2', detail: 'Variables in Java, Data Types & Input/Output (Scanner).' },
      { id: 'oct-3', title: 'Java — Playlist Track: Lecture 3', detail: 'Conditional Statements: if-else, nested conditions, switch-case & break.' },
      { id: 'oct-4', title: 'Java — Playlist Track: Lecture 4', detail: 'Loops in Java: for, while, do-while loops & loop termination.' },
      { id: 'oct-5', title: 'Java — Playlist Track: Lecture 5', detail: '9 Best Patterns Questions in Java (Star, pyramid, matrix logic).' },
      { id: 'oct-6', title: 'Java Strings & Methods Practice', detail: 'String manipulation, methods and problem solving in pure Java.' },
      { id: 'oct-7', title: 'Java OOP Foundations', detail: 'Classes, objects, constructors & modular method design.' },
      { id: 'oct-8', title: 'Java Collections Basics', detail: 'ArrayList, LinkedList and dynamic collection storage in Java.' },
      { id: 'oct-9', title: 'Java Exception Handling & File I/O', detail: 'try-catch-finally, throws, File, BufferedReader & FileWriter.' },
      { id: 'oct-10', title: 'Practical Java Console Project', detail: 'Interactive menu-driven CLI management application in pure Java.' }
    ]
  },
  {
    monthIndex: 1,
    monthKey: '2026-11',
    name: 'November 2026',
    title: 'DSA Foundations',
    theme: 'Complexity & Foundational Algorithms',
    targetHours: 110,
    targetProblems: 35,
    topics: [
      { id: 'nov-1', title: 'Big-O Notation', detail: 'Asymptotic notation, best/average/worst case, growth rates.' },
      { id: 'nov-2', title: 'Time Complexity', detail: 'Analyzing loops, nested loops, recursive time complexity.' },
      { id: 'nov-3', title: 'Space Complexity', detail: 'Auxiliary space, recursive call stack overhead.' },
      { id: 'nov-4', title: 'Arrays Algorithms', detail: 'Prefix sum, Kadanes algorithm, in-place manipulation, Dutch National Flag.' },
      { id: 'nov-5', title: 'Strings Algorithms', detail: 'Palindromes, anagrams, substring search, string matching.' },
      { id: 'nov-6', title: 'Searching Algorithms', detail: 'Linear search, binary search fundamentals, order agnostic search.' },
      { id: 'nov-7', title: 'Sorting Algorithms', detail: 'Bubble, Insertion, Selection, Merge Sort, Quick Sort.' },
      { id: 'nov-8', title: 'Two Pointers Pattern', detail: 'Opposite direction, same direction, fast and slow pointers.' },
      { id: 'nov-9', title: 'Sliding Window Pattern', detail: 'Fixed size window, dynamic size window, frequency map windows.' },
      { id: 'nov-10', title: 'Recursion Foundations', detail: 'Base condition, recursive tree, recurrence relations.' },
      { id: 'nov-11', title: 'Basic Problem-Solving Patterns', detail: 'Pattern recognition, edge case handling, boundary testing.' },
      { id: 'nov-12', title: '30-40 DSA Problems Target', detail: 'Structured problem solving across LeetCode & GFG.' }
    ]
  },
  {
    monthIndex: 2,
    monthKey: '2026-12',
    name: 'December 2026',
    title: 'Core DSA',
    theme: 'Linear & Non-Linear Data Structures',
    targetHours: 110,
    targetProblems: 45,
    topics: [
      { id: 'dec-1', title: 'Linked Lists', detail: 'Singly, doubly, circular linked lists, reversals, cycle detection (Floyds algorithm).' },
      { id: 'dec-2', title: 'Stack', detail: 'Array/LL implementation, Monotonic Stack, Next Greater Element, Valid Parentheses.' },
      { id: 'dec-3', title: 'Queue & Deque', detail: 'Circular queue, sliding window maximum, queue using stacks.' },
      { id: 'dec-4', title: 'Hashing & Hash Tables', detail: 'Collision resolution (chaining, open addressing), load factor, hash maps.' },
      { id: 'dec-5', title: 'Binary Search in Depth', detail: 'Search on answer, lower/upper bound, rotated sorted arrays, peak element.' },
      { id: 'dec-6', title: 'Trees Foundations', detail: 'Binary tree representations, properties, depth vs height, diameter.' },
      { id: 'dec-7', title: 'Binary Search Trees (BST)', detail: 'BST search, insertion, deletion, validation, lowest common ancestor.' },
      { id: 'dec-8', title: 'Tree Traversals', detail: 'In-order, Pre-order, Post-order, Morris traversal, Level-order.' },
      { id: 'dec-9', title: 'Breadth-First Search (BFS)', detail: 'Queue-based level-by-level exploration, shortest path in unweighted graphs.' },
      { id: 'dec-10', title: 'Depth-First Search (DFS)', detail: 'Recursive and iterative tree DFS, path sums, tree serialization.' },
      { id: 'dec-11', title: '40-50 DSA Problems Target', detail: 'Targeted medium-level problems on Tree and LL patterns.' }
    ]
  },
  {
    monthIndex: 3,
    monthKey: '2027-01',
    name: 'January 2027',
    title: 'Advanced DSA',
    theme: 'Graphs, Heaps & Dynamic Programming',
    targetHours: 110,
    targetProblems: 55,
    topics: [
      { id: 'jan-1', title: 'Heaps & Priority Queues', detail: 'Binary heap, min-heap, max-heap, heapify, Top-K elements, Median Finder.' },
      { id: 'jan-2', title: 'Priority Queue Patterns', detail: 'K-way merge, task scheduler, Huffman coding concepts.' },
      { id: 'jan-3', title: 'Graphs Representation', detail: 'Adjacency matrix vs adjacency list, directed/undirected, weighted.' },
      { id: 'jan-4', title: 'Graph Traversal (BFS & DFS)', detail: 'Cycle detection, topological sort (Kahns algorithm), bipartite graph.' },
      { id: 'jan-5', title: 'Recursion Patterns & Subsets', detail: 'Subsets generation, permutations, combinations, phone letter combos.' },
      { id: 'jan-6', title: 'Backtracking', detail: 'N-Queens, Sudoku solver, word search, palindrome partitioning.' },
      { id: 'jan-7', title: 'Dynamic Programming Fundamentals', detail: 'Overlapping subproblems, optimal substructure, Memoization vs Tabulation.' },
      { id: 'jan-8', title: 'Classic DP Patterns', detail: '0/1 Knapsack, Unbounded Knapsack, Longest Common Subsequence, LIS, Coin Change.' },
      { id: 'jan-9', title: 'Mixed DSA Practice', detail: 'Hard mix LeetCode problems combining graphs, DP, and heaps.' },
      { id: 'jan-10', title: '50-60 DSA Problems Target', detail: 'High intensity problem-solving target for technical interviews.' }
    ]
  },
  {
    monthIndex: 4,
    monthKey: '2027-02',
    name: 'February 2027',
    title: 'DBMS + SQL Depth',
    theme: 'Relational Design, ACID & Query Optimization',
    targetHours: 110,
    topics: [
      { id: 'feb-1', title: 'Database Fundamentals', detail: 'DBMS architecture, 3-tier schema, data abstraction, DBMS vs File system.' },
      { id: 'feb-2', title: 'Relational Databases & ER Modeling', detail: 'Entities, attributes, relationships, ER to relational schema mapping.' },
      { id: 'feb-3', title: 'Keys in Relational Systems', detail: 'Candidate key, Primary key, Foreign key, Super key, Composite key.' },
      { id: 'feb-4', title: 'Normalization', detail: 'Functional dependencies, 1NF, 2NF, 3NF, BCNF, lossless join decomposition.' },
      { id: 'feb-5', title: 'Transactions & Concurrency', detail: 'Transaction lifecycle, schedules, serializability, conflict serializability.' },
      { id: 'feb-6', title: 'ACID Properties', detail: 'Atomicity, Consistency, Isolation levels (Read Uncommitted to Serializable), Durability.' },
      { id: 'feb-7', title: 'Indexing & B-Trees', detail: 'Clustered vs Non-clustered indexing, B-Tree and B+ Tree internal structure.' },
      { id: 'feb-8', title: 'Database Design Best Practices', detail: 'Schema design, denormalization tradeoffs, integrity constraints.' },
      { id: 'feb-9', title: 'Query Optimization Basics', detail: 'EXPLAIN plans, query execution trees, cost-based optimizer, indexing strategies.' },
      { id: 'feb-10', title: 'MySQL & PostgreSQL Administration', detail: 'Dialect differences, stored procedures, triggers, views, connection pooling.' },
      { id: 'feb-11', title: 'MongoDB Basics (NoSQL)', detail: 'Document model, BSON, collections, aggregation pipelines, when NoSQL fits.' }
    ]
  },
  {
    monthIndex: 5,
    monthKey: '2027-03',
    name: 'March 2027',
    title: 'Operating Systems',
    theme: 'Concurrency, Memory & Kernel Concepts',
    targetHours: 110,
    topics: [
      { id: 'mar-1', title: 'OS Fundamentals & Dual Mode', detail: 'Kernel vs User mode, system calls, interrupts, trap architecture.' },
      { id: 'mar-2', title: 'Processes & Process Control Block (PCB)', detail: 'Process states, context switching, fork(), exec(), process termination.' },
      { id: 'mar-3', title: 'Threads & Multithreading', detail: 'Kernel vs User threads, thread synchronization, race conditions, POSIX pthreads.' },
      { id: 'mar-4', title: 'Process vs Thread Deep Dive', detail: 'Memory sharing, context switch cost, IPC mechanisms (pipes, sockets, shared memory).' },
      { id: 'mar-5', title: 'CPU Scheduling Fundamentals', detail: 'Preemptive vs Non-preemptive, turnaround time, waiting time, response time.' },
      { id: 'mar-6', title: 'Scheduling Algorithms', detail: 'FCFS, SJF, Round Robin, Priority Scheduling, Multi-Level Feedback Queues.' },
      { id: 'mar-7', title: 'Deadlocks', detail: 'Coffman 4 conditions (Mutual exclusion, Hold & wait, No preemption, Circular wait).' },
      { id: 'mar-8', title: 'Deadlock Prevention & Avoidance', detail: 'Resource allocation graphs, Bankers Algorithm, deadlock detection & recovery.' },
      { id: 'mar-9', title: 'Memory Management', detail: 'Contiguous vs non-contiguous, fragmentation (internal/external), paging, segmentation.' },
      { id: 'mar-10', title: 'Virtual Memory & Page Replacement', detail: 'Demand paging, page faults, TLB, Page replacement: FIFO, LRU, Optimal, Thrashing.' },
      { id: 'mar-11', title: 'File Systems & Storage', detail: 'Inodes, directory structures, allocation methods (contiguous, linked, indexed).' },
      { id: 'mar-12', title: 'Linux Processes & Commands', detail: 'ps, top, htop, kill, nice, /proc filesystem exploration.' },
      { id: 'mar-13', title: 'OS Technical Interview Questions', detail: 'Critical section problem, Semaphores, Mutex, Monitored variables, Dining Philosophers.' }
    ]
  },
  {
    monthIndex: 6,
    monthKey: '2027-04',
    name: 'April 2027',
    title: 'Computer Networks',
    theme: 'Protocols, TCP/IP & Network Architecture',
    targetHours: 110,
    topics: [
      { id: 'apr-1', title: 'Networking Fundamentals', detail: 'Network topologies, packet switching vs circuit switching, bandwidth & latency.' },
      { id: 'apr-2', title: 'OSI Model (7 Layers)', detail: 'Physical, Data Link, Network, Transport, Session, Presentation, Application.' },
      { id: 'apr-3', title: 'TCP/IP Model', detail: 'Network Interface, Internet, Transport, Application layer mapping.' },
      { id: 'apr-4', title: 'IP Addressing & Subnetting', detail: 'IPv4 vs IPv6, CIDR notation, subnet masks, public vs private IPs, NAT.' },
      { id: 'apr-5', title: 'TCP Protocol Deep Dive', detail: '3-way handshake, 4-way termination, flow control (sliding window), congestion control.' },
      { id: 'apr-6', title: 'UDP Protocol', detail: 'Connectionless, lightweight headers, use cases (streaming, DNS, gaming).' },
      { id: 'apr-7', title: 'TCP vs UDP Comparison', detail: 'Reliability, speed, header size, packet ordering, error checking.' },
      { id: 'apr-8', title: 'HTTP & HTTPS', detail: 'HTTP/1.1 vs HTTP/2 vs HTTP/3, TLS/SSL handshake, symmetric/asymmetric encryption.' },
      { id: 'apr-9', title: 'DNS Architecture', detail: 'Recursive vs Iterative lookup, DNS records (A, AAAA, CNAME, MX), TTL, DNS cache.' },
      { id: 'apr-10', title: 'Client-Server Architecture', detail: 'Request-response cycle, WebSockets, proxies, reverse proxies, load balancing.' },
      { id: 'apr-11', title: 'Ports & Sockets', detail: 'Standard well-known ports (80, 443, 22, 53, 3306), socket programming basics.' },
      { id: 'apr-12', title: 'Basic Networking Troubleshooting', detail: 'ping, traceroute, netstat, nslookup, dig, tcpdump, Wireshark inspection.' },
      { id: 'apr-13', title: 'Networking Interview Questions', detail: 'What happens when you type google.com into your browser? (End-to-end trace).' }
    ]
  },
  {
    monthIndex: 7,
    monthKey: '2027-05',
    name: 'May 2027',
    title: 'Computer Organization + Mathematics',
    theme: 'Hardware Architecture & Linear Algebra / Calculus for ML',
    targetHours: 110,
    topics: [
      { id: 'may-1', title: 'CPU Architecture Basics', detail: 'ALU, Control Unit, Registers, Von Neumann vs Harvard architecture.' },
      { id: 'may-2', title: 'Registers & Instruction Cycle', detail: 'PC, IR, MAR, MDR, Fetch-Decode-Execute cycle.' },
      { id: 'may-3', title: 'Memory Hierarchy & Cache', detail: 'L1, L2, L3 caches, cache hits/misses, direct mapped vs associative, cache lines.' },
      { id: 'may-4', title: 'Instruction Basics & Pipelining', detail: 'Instruction set architecture (RISC vs CISC), 5-stage pipeline, pipeline hazards.' },
      { id: 'may-5', title: 'Computer Architecture Fundamentals', detail: 'Bus architectures, memory interleaving, DMA (Direct Memory Access).' },
      { id: 'may-6', title: 'Linear Algebra: Vectors & Spaces', detail: 'Vector spaces, linear combinations, span, linear independence, basis, dimensions.' },
      { id: 'may-7', title: 'Matrices & Matrix Operations', detail: 'Addition, scalar multiplication, matrix multiplication, transpose, trace, inverse.' },
      { id: 'may-8', title: 'Dot Product & Projections', detail: 'Geometric interpretation, cosine similarity, orthogonal vectors, Gram-Schmidt.' },
      { id: 'may-9', title: 'Eigenvalues & Eigenvectors', detail: 'Characteristic equation, geometric transformation, spectral theorem, PCA connection.' },
      { id: 'may-10', title: 'Differentiation & Derivatives', detail: 'Limits, slope, power rule, product rule, quotient rule, chain rule.' },
      { id: 'may-11', title: 'Integration Basics', detail: 'Definite vs indefinite integrals, area under curve, expectation calculation.' },
      { id: 'may-12', title: 'Gradients & Vector Calculus', detail: 'Partial derivatives, gradient vector, Jacobian matrix, Hessian matrix, Taylor expansion.' }
    ]
  },
  {
    monthIndex: 8,
    monthKey: '2027-06',
    name: 'June 2027',
    title: 'Data Engineering Foundations',
    theme: 'NumPy, Pandas & End-to-End EDA Case Studies',
    targetHours: 110,
    topics: [
      { id: 'jun-1', title: 'NumPy Fundamentals & Arrays', detail: 'ndarray, creation routines, data types, memory layout, vectorization speedup.' },
      { id: 'jun-2', title: 'NumPy Indexing & Slicing', detail: '1D, 2D, boolean masking, fancy indexing, views vs copies.' },
      { id: 'jun-3', title: 'NumPy Array Operations', detail: 'Broadcasting rules, universal functions (ufuncs), linear algebra (np.linalg), random.' },
      { id: 'jun-4', title: 'Pandas Series & DataFrames', detail: 'Data structures, index objects, loading CSV, JSON, Parquet, Excel.' },
      { id: 'jun-5', title: 'Pandas Reading & Writing Datasets', detail: 'Chunking large files, memory optimization, data type casting.' },
      { id: 'jun-6', title: 'Filtering & Selecting Data', detail: 'loc, iloc, query, boolean filtering, conditional assignments.' },
      { id: 'jun-7', title: 'Grouping & Aggregations', detail: 'groupby, agg, transform, apply, pivot tables, cross-tabulations.' },
      { id: 'jun-8', title: 'Merging, Joining & Concatenating', detail: 'Inner, outer, left, right joins, multi-index joining, concat.' },
      { id: 'jun-9', title: 'Handling Missing Values in Pandas', detail: 'isna, notna, dropna, fillna, forward/backward fill, interpolation.' },
      { id: 'jun-10', title: 'Matplotlib & Seaborn Advanced Workflows', detail: 'Custom color palettes, subfigure grids, styling for research reports.' },
      { id: 'jun-11', title: 'Exploratory Data Analysis (EDA) Best Practices', detail: 'Univariate, bivariate, multivariate inspection, skewness correction.' },
      { id: 'jun-12', title: '5 Complete EDA Datasets & Reports', detail: '5 industry datasets (Finance, Healthcare, E-commerce, Housing, Telecom).' }
    ]
  },
  {
    monthIndex: 9,
    monthKey: '2027-07',
    name: 'July 2027',
    title: 'Software Engineering + Backend',
    theme: 'Web Architecture, REST APIs, FastAPI & Database Integration',
    targetHours: 110,
    topics: [
      { id: 'jul-1', title: 'HTML Fundamentals', detail: 'Semantic HTML5, DOM structure, forms, accessibility, meta tags.' },
      { id: 'jul-2', title: 'CSS Fundamentals', detail: 'Box model, Flexbox, CSS Grid, responsive design, media queries.' },
      { id: 'jul-3', title: 'JavaScript Fundamentals', detail: 'ES6+, async/await, Promises, Fetch API, closures, event loop.' },
      { id: 'jul-4', title: 'REST API Design Principles', detail: 'Statelessness, resource URIs, HTTP status codes, versioning, idempotent operations.' },
      { id: 'jul-5', title: 'API Authentication & Security', detail: 'JWT tokens, Bearer auth, API keys, CORS, HTTPS, hashing passwords (bcrypt).' },
      { id: 'jul-6', title: 'JSON & HTTP Methods', detail: 'GET, POST, PUT, PATCH, DELETE, request headers, payload serialization.' },
      { id: 'jul-7', title: 'Node.js & Express Basics', detail: 'Event loop, middleware, routing, express application structure.' },
      { id: 'jul-8', title: 'FastAPI for High-Performance Python', detail: 'Pydantic data validation, type hints, dependency injection, auto OpenAPI docs.' },
      { id: 'jul-9', title: 'Backend Project Development', detail: 'Full CRUD REST API service with routing, validation, error handling.' },
      { id: 'jul-10', title: 'Database Integration (SQLAlchemy/PostgreSQL)', detail: 'ORM vs raw SQL, migrations (Alembic), relationship mapping, connection pools.' },
      { id: 'jul-11', title: 'API Deployment & Testing', detail: 'Pytest API testing, Postman collections, deploying to Render / Railway.' }
    ]
  },
  {
    monthIndex: 10,
    monthKey: '2027-08',
    name: 'August 2027',
    title: 'Cloud + MLOps',
    theme: 'Containerization, Kubernetes, Cloud & CI/CD Pipelines',
    targetHours: 110,
    topics: [
      { id: 'aug-1', title: 'Docker Core Concepts', detail: 'Virtual machines vs containers, image layers, UnionFS, Docker daemon.' },
      { id: 'aug-2', title: 'Dockerfiles & Best Practices', detail: 'Multi-stage builds, non-root users, .dockerignore, minimal base images (Alpine/Slim).' },
      { id: 'aug-3', title: 'Docker Compose', detail: 'Multi-container setups: backend API + database + Redis caching.' },
      { id: 'aug-4', title: 'Container Management', detail: 'Container lifecycle, volumes, bind mounts, networking, inspect, logs.' },
      { id: 'aug-5', title: 'Kubernetes Fundamentals', detail: 'K8s architecture: Control plane (API server, etcd, scheduler) & Worker nodes (kubelet).' },
      { id: 'aug-6', title: 'K8s Pods, Services & Deployments', detail: 'Manifests YAML, ReplicaSets, ClusterIP, NodePort, LoadBalancer, rolling updates.' },
      { id: 'aug-7', title: 'CI/CD Pipelines (GitHub Actions)', detail: 'Automated test runners, linting, Docker build & push, deployment triggers.' },
      { id: 'aug-8', title: 'Cloud Fundamentals (AWS / Azure)', detail: 'IAM roles, EC2 / VMs, S3 / Blob storage, security groups, billing alarms.' },
      { id: 'aug-9', title: 'Application Deployment to Cloud', detail: 'Deploying containerized backend on cloud infrastructure.' },
      { id: 'aug-10', title: 'AI/ML API Deployment', detail: 'Gunicorn/Uvicorn workers, latency optimization, ONNX runtime, model loading.' },
      { id: 'aug-11', title: 'Basic MLOps Concepts', detail: 'Model versioning (MLflow/DVC), experiment tracking, data drift, monitoring.' },
      { id: 'aug-12', title: 'Model Deployment Workflow', detail: 'End-to-end automated deployment pipeline from trained weights to public endpoint.' }
    ]
  },
  {
    monthIndex: 11,
    monthKey: '2027-09',
    name: 'September 2027',
    title: 'Placement + Portfolio',
    theme: 'Interview Mastery, Capstones, Resume & Placement Readiness',
    targetHours: 120,
    targetProblems: 100,
    topics: [
      { id: 'sep-1', title: 'DSA Revision (100+ Additional Problems)', detail: 'High-frequency LeetCode Top Interview 150 & Striver SDE sheet.' },
      { id: 'sep-2', title: 'Mixed-Topic & Timed Problem Practice', detail: 'Contest simulations, 45-min time-boxed 2-problem mock sessions.' },
      { id: 'sep-3', title: 'Weak-Topic Targeted Revision', detail: 'Clearing all remaining items from the Revision Queue.' },
      { id: 'sep-4', title: 'Strong Python Project Showcase', detail: 'Clean code architecture, packaging, type hints, unit test coverage.' },
      { id: 'sep-5', title: 'Strong Machine Learning Project', detail: 'Feature pipeline, baseline comparison, error analysis, hyperparameter tuning.' },
      { id: 'sep-6', title: 'Deep Learning Vision/NLP Project', detail: 'Custom architecture or transfer learning with detailed ablation study.' },
      { id: 'sep-7', title: 'GenAI / LLM Application Project', detail: 'Production RAG with vector search, citation attribution, guardrails.' },
      { id: 'sep-8', title: 'Live Deployed Project with Monitoring', detail: 'Publicly accessible URL, Dockerized container, CI/CD automated pipeline.' },
      { id: 'sep-9', title: 'ATS-Friendly Technical Resume', detail: 'STAR method bullet points, quantifiable metrics, skills categorization.' },
      { id: 'sep-10', title: 'LinkedIn Profile & GitHub Cleanup', detail: 'Professional headline, featured repositories, comprehensive README files.' },
      { id: 'sep-11', title: 'Portfolio Website', detail: 'Modern developer portfolio showcasing projects, live demos, code repos.' },
      { id: 'sep-12', title: 'Technical Interview Prep: OOP, DBMS, OS, CN, SQL, ML', detail: 'Speed revision sheets for all 6 core computer science interview domains.' },
      { id: 'sep-13', title: 'Project Explanation Practice & System Architecture', detail: 'Whiteboard walkthrough, trade-off explanations, handling deep technical questions.' },
      { id: 'sep-14', title: 'HR Questions & Mock Interviews', detail: 'Behavioral rounds, leadership principles, situational answers, mock drills.' }
    ]
  }
];

export const HABIT_DEFINITIONS = [
  { id: 'h-prime', name: 'Prime 3.0 AI/ML Session', category: 'Prime 3.0', defaultMinutes: 90, icon: 'brain', description: 'Watched lesson, coded along, or practiced concepts.' },
  { id: 'h-dsa', name: 'DSA Problem Solving', category: 'DSA', defaultMinutes: 60, icon: 'code', description: 'Solved 1-2 algorithmic problems and documented approach.' },
  { id: 'h-indiv', name: 'Individual Learning Roadmap', category: 'Individual', defaultMinutes: 60, icon: 'book', description: 'Learned scheduled monthly computer science topic.' },
  { id: 'h-coding', name: 'Practical Coding Implementation', category: 'Coding', defaultMinutes: 30, icon: 'terminal', description: 'Hands-on coding in IDE (not passive watching).' },
  { id: 'h-project', name: 'Project Development Work', category: 'Project', defaultMinutes: 30, icon: 'folder', description: 'Feature building, debugging, testing, or deploying.' },
  { id: 'h-revision', name: 'Spaced Revision Review', category: 'Revision', defaultMinutes: 30, icon: 'rotate-cw', description: 'Reviewing past topics, mistakes, or flashcards.' },
  { id: 'h-journal', name: 'Learning Log / Journal Entry', category: 'Notes', defaultMinutes: 15, icon: 'edit', description: 'Documenting what was learned, what was built, and next steps.' },
  { id: 'h-github', name: 'GitHub Activity (When Applicable)', category: 'GitHub', defaultMinutes: 10, icon: 'git-commit', description: 'Pushing code or updating documentation. Not forced every day.' }
];

export const SKIP_REASONS = [
  'College workload',
  'Difficult topic',
  'Time management',
  'Technical issue',
  'Procrastination',
  'Personal reason',
  'Other'
];

export const DSA_TOPICS = [
  'Arrays',
  'Strings',
  'Linked List',
  'Stack',
  'Queue',
  'Hashing',
  'Binary Search',
  'Trees',
  'Graphs',
  'Heap',
  'Recursion',
  'Backtracking',
  'Greedy',
  'Dynamic Programming',
  'Two Pointers',
  'Sliding Window',
  'Other'
];

export const DSA_PLATFORMS = [
  'LeetCode',
  'CodeChef',
  'Codeforces',
  'GeeksforGeeks',
  'HackerRank',
  'Other'
];

export const PROJECT_CATEGORIES = [
  'Python',
  'ML',
  'Deep Learning',
  'GenAI/LLM',
  'Web/Backend',
  'Other'
];

export const PROJECT_STATUSES = [
  'Idea',
  'Planning',
  'Building',
  'Testing',
  'Deployed',
  'Completed'
];

export const PROJECT_TASK_TEMPLATES = [
  'Research & Architecture Design',
  'System Design & Wireframing',
  'Project Setup & Dependencies',
  'Core Logic & Feature Development',
  'Testing & Edge Case Handling',
  'Documentation & Clean README',
  'GitHub Repository Push & Release',
  'Production Deployment & CI/CD',
  'Final Polish & Portfolio Showcase'
];

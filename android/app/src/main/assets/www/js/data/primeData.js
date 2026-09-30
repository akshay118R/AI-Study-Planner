/**
 * Prime 3.0: AI/ML Batch - Release & Course Hierarchy Module
 * 
 * Rules:
 * - Content is released every FRIDAY and SATURDAY.
 * - Each release day provides ONE COURSE PART.
 * - Each Part contains:
 *     • Videos
 *     • Lecture notes
 *     • Assignment problems
 * - Release day is NOT a mandatory viewing deadline.
 * - Completion date is recorded independently when completed.
 * - Before release date, completion is not permitted.
 * - Parts do not become overdue merely because release day has passed.
 */

import { PROGRAM_START_DATE } from '../services/dateService.js';

export const PRIME_PARTS_CATALOG = [
  { part: 1, title: 'Python Environment, Syntax & Variables', module: 'Python for AI/ML' },
  { part: 2, title: 'Python Control Flow, Operators & Functions', module: 'Python for AI/ML' },
  { part: 3, title: 'Data Structures: Lists, Tuples, Sets & Dicts', module: 'Python for AI/ML' },
  { part: 4, title: 'OOP in Python: Classes, Methods & Inheritance', module: 'Python for AI/ML' },
  { part: 5, title: 'File Handling, JSON & Exception Management', module: 'Python for AI/ML' },
  { part: 6, title: 'Functional Programming & Comprehensions', module: 'Python for AI/ML' },
  { part: 7, title: 'NumPy Arrays & Vectorized Computations', module: 'Data Analysis' },
  { part: 8, title: 'Pandas Foundations: Series & DataFrames', module: 'Data Analysis' },
  { part: 9, title: 'Data Pre-processing: Missing Value Imputation', module: 'Data Pre-processing' },
  { part: 10, title: 'Feature Scaling, Normalization & Encoding', module: 'Data Pre-processing' },
  { part: 11, title: 'Outlier Detection: IQR & Z-Score Analysis', module: 'Data Pre-processing' },
  { part: 12, title: 'Matplotlib Architecture & Statistical Plots', module: 'Data Visualization' },
  { part: 13, title: 'Seaborn Aesthetics & Multivariate EDA', module: 'Data Visualization' },
  { part: 14, title: 'Interactive EDA Pipelines & Storytelling', module: 'Data Visualization' },
  { part: 15, title: 'Descriptive Statistics & Probability Distributions', module: 'Math for AI' },
  { part: 16, title: 'Hypothesis Testing & Bayes Theorem', module: 'Math for AI' },
  { part: 17, title: 'Linear Algebra: Vectors, Matrices & Dot Products', module: 'Math for AI' },
  { part: 18, title: 'Multivariable Calculus & Gradient Descent', module: 'Math for AI' },
  { part: 19, title: 'Machine Learning Workflow & Evaluation Metrics', module: 'Machine Learning' },
  { part: 20, title: 'Linear Regression & Cost Function Optimization', module: 'Machine Learning' },
  { part: 21, title: 'Logistic Regression & Binary Classification', module: 'Machine Learning' },
  { part: 22, title: 'Decision Trees, Gini Impurity & Pruning', module: 'Machine Learning' },
  { part: 23, title: 'Random Forests & Ensemble Bagging Techniques', module: 'Machine Learning' },
  { part: 24, title: 'Gradient Boosting: XGBoost & LightGBM', module: 'Machine Learning' },
  { part: 25, title: 'Support Vector Machines (SVM) & Kernel Tricks', module: 'Machine Learning' },
  { part: 26, title: 'K-Means Clustering & Elbow Optimization', module: 'Machine Learning' },
  { part: 27, title: 'Hierarchical Clustering & DBSCAN', module: 'Machine Learning' },
  { part: 28, title: 'Principal Component Analysis (PCA) & Dimensionality Reduction', module: 'Machine Learning' },
  { part: 29, title: 'Neural Networks: Perceptron & Forward Propagation', module: 'Deep Learning' },
  { part: 30, title: 'Backpropagation, Activation Functions & Optimizers', module: 'Deep Learning' },
  { part: 31, title: 'Overfitting Regularization: Dropout & Batch Normalization', module: 'Deep Learning' },
  { part: 32, title: 'Convolutional Neural Networks: Kernels, Stride & Pooling', module: 'Deep Learning' },
  { part: 33, title: 'Classic CNN Architectures: VGG, ResNet & Transfer Learning', module: 'Deep Learning' },
  { part: 34, title: 'Object Detection Concepts & YOLO Architecture', module: 'Computer Vision' },
  { part: 35, title: 'Recurrent Neural Networks (RNN) & Vanishing Gradients', module: 'NLP & Sequence Models' },
  { part: 36, title: 'LSTM Networks & Gated Recurrent Units (GRU)', module: 'NLP & Sequence Models' },
  { part: 37, title: 'Tokenization, Word2Vec & GloVe Embeddings', module: 'NLP & Sequence Models' },
  { part: 38, title: 'Attention Mechanism & Bahdanau Alignment', module: 'Transformers' },
  { part: 39, title: 'Transformer Architecture: Multi-Head Self-Attention', module: 'Transformers' },
  { part: 40, title: 'BERT & Encoder Models for Classification & NER', module: 'Transformers' },
  { part: 41, title: 'GPT & Autoregressive Decoder Models', module: 'Transformers' },
  { part: 42, title: 'Hugging Face Ecosystem & Pipeline Fine-tuning', module: 'Transformers' },
  { part: 43, title: 'Generative AI Foundations & Modern LLMs', module: 'GenAI & LLMs' },
  { part: 44, title: 'OpenAI APIs, Streaming & Function Calling', module: 'GenAI & LLMs' },
  { part: 45, title: 'Prompt Engineering: ReAct, Chain-of-Thought & Few-Shot', module: 'GenAI & LLMs' },
  { part: 46, title: 'RAG Architecture: Document Chunking & Embedding Models', module: 'GenAI & LLMs' },
  { part: 47, title: 'Vector Databases: ChromaDB, FAISS & Cosine Similarity', module: 'GenAI & LLMs' },
  { part: 48, title: 'Production Multi-Document RAG Application', module: 'GenAI & LLMs' },
  { part: 49, title: 'FastAPI for High-Throughput Model Serving', module: 'MLOps & Deployment' },
  { part: 50, title: 'Docker Containers for AI Services & Multi-Stage Builds', module: 'MLOps & Deployment' },
  { part: 51, title: 'Docker Compose & Service Orchestration', module: 'MLOps & Deployment' },
  { part: 52, title: 'CI/CD Pipelines & GitHub Actions for ML Models', module: 'MLOps & Deployment' },
  { part: 53, title: 'Cloud Inference Deployment (AWS / GCP / Render)', module: 'MLOps & Deployment' },
  { part: 54, title: 'Model Monitoring, Data Drift & Prometheus Tracking', module: 'MLOps & Deployment' },
  { part: 55, title: 'Capstone AI Project: Production End-to-End System', module: 'Capstone' },
  { part: 56, title: 'AI Portfolio Showcase & Placement Preparation', module: 'Capstone' }
];

/**
 * Check if a date string is a Prime 3.0 release date (Friday or Saturday on/after PROGRAM_START_DATE)
 */
export function isPrimeReleaseDay(dateStr) {
  if (!dateStr || dateStr < PROGRAM_START_DATE) return false;
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 5 = Friday, 6 = Saturday
  return day === 5 || day === 6;
}

/**
 * Deterministically compute the Prime 3.0 Part for a given release date.
 * Returns null if not a release day or before program start.
 */
export function getPrimePartForReleaseDate(dateStr) {
  if (!isPrimeReleaseDay(dateStr)) return null;

  // Count Friday & Saturday release days between PROGRAM_START_DATE and dateStr inclusive
  const start = new Date(PROGRAM_START_DATE + 'T00:00:00');
  const target = new Date(dateStr + 'T00:00:00');

  let partNumber = 0;
  const curr = new Date(start);
  while (curr <= target) {
    const day = curr.getDay();
    if (day === 5 || day === 6) {
      partNumber++;
    }
    curr.setDate(curr.getDate() + 1);
  }

  const catalogEntry = PRIME_PARTS_CATALOG.find(p => p.part === partNumber);
  const partTitle = catalogEntry
    ? catalogEntry.title
    : `Course Part ${partNumber}`;
  const moduleName = catalogEntry ? catalogEntry.module : 'AI/ML Specialization';

  const d = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = d.getDay();
  const dayLabel = dayOfWeek === 5 ? 'Friday' : 'Saturday';

  return {
    part_number: partNumber,
    partNumber: partNumber,
    title: `Prime 3.0 — Part ${partNumber}`,
    topic_title: partTitle,
    full_title: `Prime 3.0 — Part ${partNumber}: ${partTitle}`,
    module: moduleName,
    release_date: dateStr,
    release_day: dayLabel,
    contents: ['Videos', 'Lecture Notes', 'Assignment Problems'],
    description: 'Complete when convenient after release. Includes all released videos, lecture notes, and assignments.'
  };
}

/**
 * Get all Prime Parts scheduled for release within a date range
 */
export function getPrimePartsForDateRange(startDateStr, endDateStr) {
  const parts = [];
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  const curr = new Date(start);

  while (curr <= end) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const day = String(curr.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    const part = getPrimePartForReleaseDate(dateStr);
    if (part) {
      parts.push(part);
    }
    curr.setDate(curr.getDate() + 1);
  }
  return parts;
}

/**
 * Get all Prime Parts for a specific month (e.g. '2026-10')
 */
export function getPrimePartsForMonth(monthId) {
  const [yearStr, monthStr] = monthId.split('-');
  const y = parseInt(yearStr);
  const m = parseInt(monthStr);
  const startDateStr = `${monthId}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const endDateStr = `${monthId}-${String(lastDay).padStart(2, '0')}`;
  return getPrimePartsForDateRange(startDateStr, endDateStr);
}

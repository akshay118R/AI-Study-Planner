# AI Study Planner

> **A 100% local-first, privacy-preserving study and productivity tracker that transforms ambitious learning goals into structured Monthly Themes, Weekly Objectives, and Daily Actionable Tasks powered by a local Gemma model running in Ollama.**

---

## 📖 Table of Contents

1. [Overview](#1-overview)
2. [Problem It Solves](#2-problem-it-solves)
3. [Main Features](#3-main-features)
4. [AI Architecture](#4-ai-architecture)
5. [Technologies Used](#5-technologies-used)
6. [How It Was Built](#6-how-it-was-built)
7. [Local AI Setup](#7-local-ai-setup)
8. [Example Usage](#8-example-usage)
9. [Project Structure](#9-project-structure)
10. [Privacy / Local AI](#10-privacy--local-ai)
11. [Configuration](#11-configuration)
12. [Development](#12-development)
13. [Contributing](#13-contributing)
14. [Hacktoberfest / Open Source](#14-hacktoberfest--open-source)
15. [License](#15-license)

---

## 1. Overview

**AI Study Planner** is a modern, offline-first productivity and curriculum planning platform available as both a lightweight web application and a cross-platform desktop application via Electron.

Instead of forcing users to manually research, design, and schedule hundreds of calendar tasks by hand, AI Study Planner allows you to articulate a natural-language goal (such as learning a programming language, preparing for technical interviews, or mastering a framework) and automatically generates an end-to-end curriculum.

### The Planning & Execution Workflow

```
User provides goal & study parameters
  ↓
Local AI analyzes constraints & timeline
  ↓
AI generates proposed curriculum (Monthly Milestones → Weekly Focus → Daily Tasks)
  ↓
Plan validation & workload auto-repair ensures realistic schedule
  ↓
User reviews, customizes, and inspects the plan in interactive preview
  ↓
User explicitly clicks "Approve & Implement Plan"
  ↓
Application atomically creates tracker tasks
  ↓
Month → Week → Today tracking with strict daily execution lock
```

---

## 2. Problem It Solves

Traditional task management apps and to-do lists suffer from major shortcomings when applied to long-term learning and skill acquisition:

1. **Planner Fatigue & Burnout**: Breaking a multi-month goal (e.g., "Learn Machine Learning" or "Prepare for DSA Interviews") into granular daily sessions requires immense effort. Most learners abandon planning before they even begin.
2. **Unrealistic Daily Workloads**: Without strict workload capping, self-made study plans often assign too many hours to single days, resulting in immediate burnout.
3. **Lack of Structure & Progression**: Watching random video tutorials lacks prerequisite ordering. Foundational concepts must precede advanced topics and hands-on capstone projects.
4. **Cloud Privacy & Subscription Paywalls**: Cloud-based AI planners require monthly subscriptions, send personal goals to remote servers, and risk leaking private study intentions.

**AI Study Planner** solves this by generating realistic, structured, milestone-driven curriculums running 100% locally on your machine with zero subscription fees, zero cloud token costs, and zero cloud API keys.

---

## 3. Main Features

- 🧠 **Local AI Curriculum Generation**: Translates free-form goals into structured learning roadmaps using Google's `gemma4:e2b` running locally via Ollama.
- 📅 **Strict Data Hierarchy**: Organizes learning into a coherent progression:
  - **Month**: Overarching thematic milestones and skill targets.
  - **Week**: Focused learning objectives with target hour allocations.
  - **Today / Day**: Granular, bite-sized actionable tasks (30–90 minutes each).
- 🔒 **Plan Preview Before Implementation**: The AI generates a draft. Tasks are **never** added to your tracker until you review, edit, and explicitly approve the plan.
- 🛡️ **Workload Balancing & Auto-Repair**: Ensures total scheduled minutes per day never exceed your available study hours, marks rest/buffer days, and respects topic dependencies.
- 🎯 **Strict Today Execution Lock**: You can check off and complete tasks only for the active day (`Today`), preventing premature rushing, false progress, or historical tampering.
- 🔄 **Resilient JSON Recovery**: Built-in parser automatically repairs unterminated strings or cutoffs from local LLM outputs without throwing unhandled exceptions.
- 📊 **Streak & Consistency Tracking**: Tracks your current streak, longest streak, total completed hours, and completion rates calculated directly from real task completions.
- 🌓 **Vanilla Design System**: Fast, responsive user interface with curated color palettes, glassmorphism accents, and instant light/dark mode switching.
- 💾 **100% Offline Persistence**: Uses browser/local storage with zero external database dependencies. Backup and restore your complete roadmap as JSON anytime.

---

## 4. AI Architecture

The application enforces a strict separation of concerns between non-deterministic AI generation and deterministic application state management:

```
┌─────────────────────────────────────────────────────────────┐
│                       USER BROWSER                          │
│  Enters goal, timeline (e.g. 90 days), hours/day (e.g. 2h)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP POST /api/generate-plan
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    NODE.JS / ELECTRON SERVER                │
│  Formats prompt with GEMMA_SYSTEM_INSTRUCTION & schema rules│
└──────────────────────────────┬──────────────────────────────┘
                               │ Loopback POST /api/chat
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                        LOCAL OLLAMA                         │
│  Runs local model: gemma4:e2b (num_ctx: 16384)              │
└──────────────────────────────┬──────────────────────────────┘
                               │ Raw JSON response
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     JSON REPAIR ENGINE                      │
│  Recovers cutoffs, closes brackets, fixes unescaped chars   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Structured draft object
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    PLAN VALIDATOR ENGINE                    │
│  Verifies dates, caps daily workload, fixes dependencies    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Validated draft
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     PLAN PREVIEW SCREEN                     │
│  User reviews monthly breakdown, weekly targets & tasks     │
└──────────────────────────────┬──────────────────────────────┘
                               │ User clicks "Approve Plan"
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    TRACKER SERVICE (CRUD)                   │
│  Atomically commits tasks to Month → Week → Today tracker   │
└─────────────────────────────────────────────────────────────┘
```

### AI Role vs. Deterministic Code Role
| Responsibility | Handled By | Details |
|---|---|---|
| Goal analysis & topic breakdown | **Gemma (Ollama)** | Deconstructs goal into skills, weekly modules, and realistic tasks. |
| System instruction & role constraints | **`gemmaSystemPrompt.js`** | Dedicated 21-rule prompt enforcing concise output and boundaries. |
| Token output repair | **`jsonRepair.js`** | Resiliently recovers mid-token cutoffs and unclosed brackets. |
| Calendar dates & timezone safety | **`dateService.js`** | Deterministic calendar math, leap-year handling, week boundaries. |
| Workload safety & dependency ordering | **`planValidator.js`** | Enforces maximum daily study minutes and prerequisites. |
| Data persistence & state management | **`storage.js`** | Pub/sub reactive storage with automatic LocalStorage synchronization. |
| Task checkoffs & streak calculation | **`streakService.js`** | Verifies active day completion status without hallucinated streaks. |

> **Critical Safety Rule:** The local Gemma model NEVER writes directly to any database, never modifies existing completed tasks, and never changes application configuration. Gemma only proposes structured plans.

---

## 5. Technologies Used

- **Frontend Core**: Vanilla HTML5, modern ES6+ JavaScript (ES Modules).
- **Styling**: Pure Vanilla CSS using custom design tokens, CSS variables, and fluid responsive layouts (no Tailwind, zero heavy CSS bloat).
- **Desktop Runtime**: [Electron](https://www.electronjs.org/) (cross-platform desktop integration with window-state persistence).
- **Local Server**: Node.js built-in `http` module (loopback-only binding to `127.0.0.1`).
- **AI Engine**: [Ollama](https://ollama.com/) running **`gemma4:e2b`** locally.
- **Testing**: Node.js built-in `assert` test runner (38 automated unit and integration tests).
- **Packaging**: `electron-builder` for desktop packaging.

---

## 6. How It Was Built

The project was developed with a **local-first, zero-cloud-dependency** philosophy:

1. **Deterministic Foundations First**: Before integrating AI, the core hierarchy (`Month → Week → Today → Task`) and date manipulation services were designed to ensure mathematical accuracy across timezones and leap years.
2. **Vanilla Web Architecture**: Standard ES modules allow the frontend to execute directly in the browser or inside Electron without build steps or complex transpilers.
3. **Offline AI Bridge**: Rather than bundling massive multi-gigabyte neural network binaries inside the git repository, the application connects via loopback HTTP (`http://127.0.0.1:11434`) to the user's local Ollama instance.
4. **Resilient Failover**: If the local LLM times out or encounters memory constraints, the application provides built-in fallback planning engines so user workflows are never blocked.

---

## 7. Local AI Setup

### Step 1: Install Ollama

Download and install Ollama for your operating system:

- **Windows**: Download installer from [ollama.com/download/windows](https://ollama.com/download/windows)
- **macOS**: Download from [ollama.com/download/mac](https://ollama.com/download/mac) or install via Homebrew:
  ```bash
  brew install ollama
  ```
- **Linux**: Install via the official install script:
  ```bash
  curl -fsSL https://ollama.com/install.sh | sh
  ```

Ensure Ollama is running in the background (or run `ollama serve` in a terminal).

### Step 2: Install the Required Gemma Model

Pull the configured Gemma model (`gemma4:e2b`):

```bash
ollama pull gemma4:e2b
```

### Step 3: Verify Ollama Setup

Verify that Ollama and the model are installed and responding:

```bash
# Using the built-in diagnostic script
npm run check:ai
```

*(On Windows PowerShell, you can alternatively run: `.\scripts\check-ollama.ps1`)*

If verified, the command will display:
```
===================================================
  Ollama Local AI Diagnostics
===================================================
  Ollama URL     : http://127.0.0.1:11434
  Required Model : gemma4:e2b
  Status         : READY (100% Local Inference Available)
===================================================
```

### Step 4: Run the Application

Start the local development server:

```bash
# Start local HTTP server on port 3000
npm start
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

To launch as a native desktop application:

```bash
npm run electron
```

---

## 8. Example Usage

### Scenario: Beginner Learning Python in 1 Month

1. **Enter Your Goal**:
   - **Goal Description**: *"Learn Python fundamentals from scratch, including data structures, functions, and building 2 small CLI projects."*
   - **Start Date**: Today's date
   - **Target Date**: 30 days from today
   - **Daily Study Time**: `1.5 hours/day`
   - **Study Days Per Week**: `5 days/week` (with 2 rest/buffer days)
   - **Experience Level**: `Beginner`

2. **AI Processing**:
   - The local Gemma model analyzes the timeline and constraints.
   - Deconstructs the goal into:
     - **Month 1**: Python Syntax & Foundational Data Structures.
     - **Week 1**: Variables, Conditionals, and Control Flow.
     - **Week 2**: Lists, Dictionaries, and String Manipulation.
     - **Week 3**: Functions, Modules, and Error Handling.
     - **Week 4**: Mini-Projects (CLI Calculator & Note Taking App) and Revision.
   - Generates actionable daily tasks (e.g., *"Learn Python list slicing with 8 exercises"*, 45 min).

3. **Review & Approval**:
   - The interactive **Plan Preview Screen** displays the proposed curriculum.
   - You can review the weekly milestones, edit task titles, or adjust durations.
   - Click **"Approve & Implement Plan"**.

4. **Execution & Tracking**:
   - The plan is loaded into the **Dashboard**, **Month View**, **Week View**, and **Today View**.
   - Tasks for the current calendar day appear in **Today View**.
   - Checking off completed tasks increases your progress bars and increments your study streak.

---

## 9. Project Structure

```
ai-study-planner/
├── css/                        # Design tokens & view styles
│   ├── base.css                # Base typography & resets
│   ├── components.css          # Cards, buttons, modals, badges
│   ├── layout.css              # App shell & responsive sidebar
│   ├── variables.css           # Color tokens, light/dark themes
│   └── views.css               # Dashboard, planner & tracker view styles
├── electron/                   # Desktop application wrapper
│   ├── main.js                 # Electron main lifecycle controller
│   ├── server.js               # Embedded loopback server
│   └── windowState.js          # Multi-monitor bounds persistence
├── js/                         # Application logic (ES Modules)
│   ├── components/             # Reusable UI components
│   │   ├── icons.js            # Crisp inline SVG icon set
│   │   ├── quickAddModal.js    # Quick task add modal
│   │   └── trackerModals.js    # Task edit, reschedule & delete dialogs
│   ├── data/                   # State management
│   │   ├── initialState.js     # Clean initial state factory
│   │   └── storage.js          # Reactive LocalStorage persistence
│   ├── models/                 # Data model contracts
│   │   ├── planModel.js        # Plan draft data schema
│   │   └── taskModel.js        # Task schema & category metadata
│   ├── services/               # Core application services
│   │   ├── aiPlanGenerator.js  # Ollama plan generation & cancellation
│   │   ├── dateService.js      # Canonical calendar math & timezone safety
│   │   ├── gemmaSystemPrompt.js# Dedicated 21-rule Gemma system instruction
│   │   ├── jsonRepair.js       # Resilient JSON repair utility for LLM cutoffs
│   │   ├── ollamaConfig.js     # Central Ollama endpoints & defaults
│   │   ├── planValidator.js    # Schema validator & workload cap enforcement
│   │   ├── streakService.js    # Study streak calculation logic
│   │   └── trackerService.js   # Atomic plan implementation & CRUD
│   ├── views/                  # Primary application views
│   │   ├── dashboardView.js    # Summary metrics, agenda & streak widget
│   │   ├── monthlyView.js      # Monthly calendar & expandable breakdown
│   │   ├── planView.js         # Goal input form, AI preview & plan editor
│   │   ├── settingsView.js     # Theme, AI status diagnostics & data backup
│   │   ├── todayView.js        # Daily execution with Strict Today Lock
│   │   └── weeklyView.js       # Weekly focus modules & day breakdown
│   └── app.js                  # Application bootstrap & router
├── scripts/                    # Developer tooling & diagnostics
│   ├── check-ollama.js         # Cross-platform Node.js diagnostics
│   ├── check-ollama.ps1        # Windows PowerShell diagnostics
│   └── prepare-icons.js        # Icon packaging script
├── tests/                      # Automated test suite
│   ├── dates.test.js           # Date boundaries, leap years, week ranges
│   ├── implementation.test.js  # Atomic plan implementation guarantees
│   ├── ollama-plan-generation.test.js # Local AI states, mocks & smoke test
│   ├── persistence.test.js     # LocalStorage CRUD & restart persistence
│   ├── plan-validation.test.js # Schema validation & workload caps
│   ├── run-all-tests.js        # Master automated test runner
│   └── task-completion.test.js # Checkbox toggles & Today Lock tests
├── .env.example                # Example environment configuration template
├── .gitignore                  # Git exclusions (models, logs, build output)
├── index.html                  # Single-page web application entry point
├── package.json                # Project dependencies, scripts & metadata
├── package-lock.json           # Deterministic dependency lockfile
├── README.md                   # Complete public documentation
└── server.js                   # Node.js development server & Ollama proxy
```

---

## 10. Privacy / Local AI

- **No Remote AI Calls**: All planning inference is executed by your local machine via Ollama.
- **Zero Cloud API Keys**: No OpenAI, Anthropic, or Google Cloud API keys are required.
- **No Telemetry or Tracking**: The application does not collect user analytics or sell personal data.
- **Loopback-Only Binding**: The development server binds strictly to `127.0.0.1` (localhost) to prevent unauthorized network access.
- **Local-Only Storage**: All plans, tasks, streaks, and progress records reside strictly in your browser's LocalStorage or Electron user directory.

---

## 11. Configuration

The application works out of the box with default settings. You can optionally customize local server and Ollama parameters by creating a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### Available Configuration Parameters

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `3000` | Port for the local web server |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | URL of the local Ollama instance |
| `OLLAMA_MODEL` | `gemma4:e2b` | Gemma model tag installed in Ollama |
| `OLLAMA_TIMEOUT_MS` | `180000` | Generation timeout in milliseconds (3 minutes) |
| `OLLAMA_TEMPERATURE`| `0.2` | Sampling temperature (lower = more deterministic) |

> **Security Note:** Never place cloud API keys or passwords in `.env`. Local Ollama does not require credentials.

---

## 12. Development

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (version 9 or higher)
- [Ollama](https://ollama.com/) with model `gemma4:e2b`

### Setup Steps
```bash
# 1. Clone the repository
git clone https://github.com/akshay118R/AI-Study-Planner.git
cd AI-Study-Planner

# 2. Install dependencies
npm install

# 3. Verify Ollama setup
npm run check:ai

# 4. Run automated test suite
npm test

# 5. Start the local development server
npm start
```

### Building the Desktop Application
```bash
# Build unpacked desktop application directory
npm run pack

# Build Windows installer
npm run build
```

---

## 13. Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make Your Changes**: Adhere to the existing vanilla JavaScript and CSS design token conventions. Preserve documentation integrity.
4. **Run the Test Suite**:
   ```bash
   npm test
   ```
   Ensure all 38 automated tests pass without errors.
5. **Commit Your Changes**: Write clear, descriptive commit messages:
   ```bash
   git commit -m "Add feature: enhance weekly export formatting"
   ```
6. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**: Submit your PR with a concise description of your changes.

---

## 14. Hacktoberfest / Open Source

This project participates in open-source development and welcomes Hacktoberfest contributors!

### Great Areas for Contribution:
- 🎨 **Accessibility (a11y)**: Enhancing ARIA landmarks, keyboard navigation, and high-contrast themes.
- 🧪 **Test Coverage**: Adding edge-case tests for multi-year leap-year transitions and complex dependency graphs.
- 📱 **Mobile Responsive Layouts**: Refining fluid CSS layouts on small viewport mobile screens.
- 🌐 **Export / Import Utilities**: Adding Markdown, iCalendar (`.ics`), or Notion export formats for study plans.
- ⚡ **Local LLM Performance**: Optimizing prompt token efficiency and streaming generation options.

*Please ensure all PRs adhere to community guidelines and pass `npm test` before submitting.*

---

## 15. License

This project is licensed under the **MIT License**. See [package.json](package.json) for details.

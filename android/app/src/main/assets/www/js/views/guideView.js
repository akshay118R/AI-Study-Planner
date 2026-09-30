/**
 * Akshay's 12-Month AI/ML Career OS - In-App "APP GUIDE" View
 * 
 * Complete operational blueprint explaining:
 * 1. Morning Routine (5-10 mins)
 * 2. During Study Sessions
 * 3. Evening Routine (Night check-in)
 * 4. Sunday Routine (Weekly review & planning)
 * 5. Month-End Routine (Audit & transition)
 * 6. Module-by-module reference for all 13 core modules
 */
import { getIcon } from '../components/icons.js';

let activeGuideSection = 'daily-rhythms';

export function renderGuide(container) {
  container.innerHTML = `
    <div class="view-header">
      <div class="view-title-wrap">
        <h1 class="view-title">${getIcon('guide', 'text-cyan')} Personal AI/ML Career OS: Application Guide</h1>
        <div class="view-subtitle">
          Akshay's 12-Month Operational Blueprint (October 1, 2026 → September 30, 2027)
        </div>
      </div>
      <div class="view-actions">
        <span class="badge badge-emerald">Master Playbook</span>
      </div>
    </div>

    <!-- Guide Navigation Tabs -->
    <div class="tabs-nav">
      <button class="tab-btn ${activeGuideSection === 'daily-rhythms' ? 'active' : ''}" data-sec="daily-rhythms">
        Operational Rhythms (How to Use Daily)
      </button>
      <button class="tab-btn ${activeGuideSection === 'modules-guide' ? 'active' : ''}" data-sec="modules-guide">
        Module-by-Module Reference
      </button>
      <button class="tab-btn ${activeGuideSection === 'rules-principles' ? 'active' : ''}" data-sec="rules-principles">
        Core Rules & Success Principles
      </button>
    </div>

    <!-- Tab 1: Operational Rhythms -->
    ${activeGuideSection === 'daily-rhythms' ? `
      <div class="guide-content-box">
        <h2 style="font-size: 1.3rem; margin-bottom: var(--space-md); color: var(--color-primary);">
          Your Daily, Weekly & Monthly Operational Cadence
        </h2>

        <!-- 1. Every Morning -->
        <div class="guide-step-card" style="border-left: 4px solid var(--color-primary);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <strong style="font-size: 1.05rem;">🌅 1. Every Morning (5 to 10 Minutes)</strong>
            <span class="badge badge-primary">Orientation</span>
          </div>
          <p style="font-size: 0.88rem; color: var(--color-text-secondary); margin-bottom: 8px;">
            Before opening social media, WhatsApp, or random tutorials:
          </p>
          <ol style="margin-left: 20px; font-size: 0.85rem; color: var(--color-text-secondary); display: flex; flex-direction: column; gap: 6px;">
            <li>Open the <strong>Today</strong> tab. The system will greet you with today's target and your active learning streak.</li>
            <li>Inspect <strong>Today's Roadmap Tasks</strong>: It tells you exactly what Prime 3.0 lesson to study, what individual CS topic to conquer, how many DSA problems to solve, and which project milestone to advance.</li>
            <li>Review your available study budget: <strong>4 hours/day (Mon-Fri & Sat)</strong> or <strong>8 hours (Sunday)</strong>.</li>
            <li>Mentally commit to the schedule: Prime 3.0 (1.5h), DSA (1h), Individual CS (1h), Revision/Project (0.5h).</li>
          </ol>
        </div>

        <!-- 2. During Study Sessions -->
        <div class="guide-step-card" style="border-left: 4px solid var(--color-accent-cyan);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <strong style="font-size: 1.05rem;">⚡ 2. During Study Sessions (Deep Focus Mode)</strong>
            <span class="badge badge-cyan">Execution</span>
          </div>
          <p style="font-size: 0.88rem; color: var(--color-text-secondary); margin-bottom: 8px;">
            Do not multitask. Execute one block at a time:
          </p>
          <ul style="margin-left: 20px; font-size: 0.85rem; color: var(--color-text-secondary); display: flex; flex-direction: column; gap: 6px;">
            <li><strong>Prime 3.0 AI/ML:</strong> In the Prime 3.0 tab, check off criteria as you do them: <em>Watched, Notes Taken, Coded Along, Recreated Independently, Practiced</em>. Rate your understanding honestly from <strong>0 to 4</strong>. If marked <strong>0</strong>, the app immediately queues it for revision!</li>
            <li><strong>DSA Solving:</strong> Open the DSA Tracker. Record your time taken, approach, and mistake category (e.g. edge case or TLE). If you struggled, toggle <em>"Add to Spaced Revision Queue"</em>.</li>
            <li><strong>Log Study:</strong> Click <em>"+ Quick Action" → "Log Study Session Hours"</em> to record real minutes studied.</li>
          </ul>
        </div>

        <!-- 3. Every Evening -->
        <div class="guide-step-card" style="border-left: 4px solid var(--color-accent-amber);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <strong style="font-size: 1.05rem;">🌙 3. Every Evening (Night Check-In & Habit Audit)</strong>
            <span class="badge badge-amber">Accounting</span>
          </div>
          <p style="font-size: 0.88rem; color: var(--color-text-secondary); margin-bottom: 8px;">
            Close the loop before going to sleep:
          </p>
          <ol style="margin-left: 20px; font-size: 0.85rem; color: var(--color-text-secondary); display: flex; flex-direction: column; gap: 6px;">
            <li>Check off completed tasks in the <strong>Today</strong> tab.</li>
            <li>Fill out the <strong>Daily Habits Checklist</strong>: Mark each core habit as <em>Done, Partial, or Skipped</em>.</li>
            <li>If you skipped a habit, select the honest reason (College workload, Difficult topic, etc.). This tracks blockers objectively without toxic guilt.</li>
            <li>Open the <strong>Learning Journal</strong> and write 3-5 sentences: What did you learn? What did you build? What confused you?</li>
            <li>Click <strong>"Complete Today's Plan"</strong>. Watch your progress ring hit 100% and your daily streak advance!</li>
          </ol>
        </div>

        <!-- 4. Every Sunday -->
        <div class="guide-step-card" style="border-left: 4px solid var(--color-accent-purple);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <strong style="font-size: 1.05rem;">📅 4. Every Sunday (8-Hour Power Session & Weekly Review)</strong>
            <span class="badge badge-purple">Reflection & Planning</span>
          </div>
          <p style="font-size: 0.88rem; color: var(--color-text-secondary); margin-bottom: 8px;">
            Sunday is your secret weapon. You have an 8-hour block allocated:
          </p>
          <ul style="margin-left: 20px; font-size: 0.85rem; color: var(--color-text-secondary); display: flex; flex-direction: column; gap: 6px;">
            <li><strong>Block 1 (1.5h):</strong> Open <strong>Sunday Weekly Review</strong>. Answer the 7 core questions honestly. View your auto-calculated study hours, DSA count, and habit skips. Save the review to your permanent archive.</li>
            <li><strong>Block 2 (3.5h):</strong> Deep Project Development. Work on your flagship portfolio project (C memory allocator, ML pipeline, RAG agent).</li>
            <li><strong>Block 3 (2.0h):</strong> Clear items from your <strong>Revision Queue</strong>.</li>
            <li><strong>Block 4 (1.0h):</strong> Open <strong>Weekly Planner</strong>. Set targets for next week (Prime goals, DSA 10 problems, Individual topics).</li>
          </ul>
        </div>

        <!-- 5. Month-End Routine -->
        <div class="guide-step-card" style="border-left: 4px solid var(--color-accent-emerald);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <strong style="font-size: 1.05rem;">🏆 5. At the End of Every Month (Audit & Transition)</strong>
            <span class="badge badge-emerald">Milestone Checkpoint</span>
          </div>
          <p style="font-size: 0.88rem; color: var(--color-text-secondary); margin-bottom: 8px;">
            Evaluate month completion before advancing to the next subject:
          </p>
          <ol style="margin-left: 20px; font-size: 0.85rem; color: var(--color-text-secondary); display: flex; flex-direction: column; gap: 6px;">
            <li>Open the <strong>Monthly Dashboard</strong>. Review your completion percentage across the month's syllabus topics.</li>
            <li>Verify you hit your monthly study budget (~110 hours) and solved the target DSA problem count.</li>
            <li>Check the <strong>Roadmap</strong>: Ensure all foundational topics are understood. If any topics remain in progress, they roll over without shame.</li>
            <li>Export a JSON backup from <strong>Settings</strong> to keep your data safe.</li>
          </ol>
        </div>
      </div>
    ` : ''}

    <!-- Tab 2: Module-by-Module Reference -->
    ${activeGuideSection === 'modules-guide' ? `
      <div class="guide-content-box">
        <h2 style="font-size: 1.3rem; margin-bottom: var(--space-md); color: var(--color-primary);">
          Module-by-Module Breakdown & Purpose
        </h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-md);">
          <div class="card" style="background: var(--color-bg-base);">
            <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 4px;">1. Dashboard</h3>
            <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
              Your high-level command center. Displays overall 12-month goal, 4 track stat cards (Prime 3.0, Individual CS, DSA, Projects), today's 5 primary tasks, consistency streak counter, and quick logging shortcuts.
            </p>
          </div>

          <div class="card" style="background: var(--color-bg-base);">
            <h3 style="font-size: 1rem; color: var(--color-accent-emerald); margin-bottom: 4px;">2. Today</h3>
            <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
              Your focused execution screen. Answers "What do I need to do today?". Features the animated circular progress ring, tasks checklist with subtask breakdown, study time meter (X/4 hours), and the complete 8-habit checklist.
            </p>
          </div>

          <div class="card" style="background: var(--color-bg-base);">
            <h3 style="font-size: 1rem; color: var(--color-accent-cyan); margin-bottom: 4px;">3. Roadmap</h3>
            <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
              The visual 12-month timeline from October 2026 to September 2027. Displays month focus, all 12-14 core topics, target hours, and real percentage completion without harsh failure tags.
            </p>
          </div>

          <div class="card" style="background: var(--color-bg-base);">
            <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 4px;">4. Prime 3.0 AI/ML</h3>
            <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
              Track A specialized dashboard. Contains all 16 modules and granular lessons with the 7-step criteria (Watched, Notes, Coded, Recreated, Practiced, Understood, Applied) and the 0-4 understanding scale.
            </p>
          </div>

          <div class="card" style="background: var(--color-bg-base);">
            <h3 style="font-size: 1rem; color: var(--color-accent-amber); margin-bottom: 4px;">5. DSA Tracker</h3>
            <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
              Comprehensive problem tracker. Filter by topic (Arrays to DP), difficulty (E/M/H), and platform. Logs approach, time taken, and mistake categories (TLE, edge cases, data structures).
            </p>
          </div>

          <div class="card" style="background: var(--color-bg-base);">
            <h3 style="font-size: 1rem; color: var(--color-accent-purple); margin-bottom: 4px;">6. Projects Hub</h3>
            <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
              Lifecycle management for your portfolio capstones. Follows the 9-stage checklist: Research → Design → Setup → Development → Testing → Documentation → GitHub → Deployment → Polish.
            </p>
          </div>

          <div class="card" style="background: var(--color-bg-base);">
            <h3 style="font-size: 1rem; color: var(--color-accent-cyan); margin-bottom: 4px;">7. Weekly Planner</h3>
            <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
              Displays "This Week's Goals" (Prime, DSA 10 problems, Individual topics, Project features) and a 7-day Monday through Sunday grid with target study hours vs actual hours logged.
            </p>
          </div>

          <div class="card" style="background: var(--color-bg-base);">
            <h3 style="font-size: 1rem; color: var(--color-accent-purple); margin-bottom: 4px;">8. Sunday Review</h3>
            <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
              Weekly audit screen. Walks you through the 7 exact reflection questions, displays auto-calculated weekly hours, DSA counts, skipped habits, and saves each review to your permanent history.
            </p>
          </div>

          <div class="card" style="background: var(--color-bg-base);">
            <h3 style="font-size: 1rem; color: var(--color-accent-emerald); margin-bottom: 4px;">9. Monthly Dashboard</h3>
            <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
              Evaluates monthly completion percentage, study hours, and renders topic progress bars (C foundations, DSA, Prime 3.0) with non-punitive status indicators.
            </p>
          </div>

          <div class="card" style="background: var(--color-bg-base);">
            <h3 style="font-size: 1rem; color: var(--color-accent-rose); margin-bottom: 4px;">10. Revision Queue</h3>
            <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
              Spaced repetition queue automatically fed whenever you make a DSA mistake or rate a concept with low understanding. Tabs for Due Today, Due This Week, Overdue, and Completed.
            </p>
          </div>

          <div class="card" style="background: var(--color-bg-base);">
            <h3 style="font-size: 1rem; color: var(--color-accent-cyan); margin-bottom: 4px;">11. Analytics</h3>
            <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
              Multi-dimensional data visualization with clean responsive SVG charts for weekly hours, difficulty distribution, and 12-month trajectory. Strictly avoids meaningless single scores.
            </p>
          </div>

          <div class="card" style="background: var(--color-bg-base);">
            <h3 style="font-size: 1rem; color: var(--color-accent-amber); margin-bottom: 4px;">12. Goals Center</h3>
            <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
              Strategic hierarchy tracking Yearly (2030 placement target), Quarterly, Monthly, Weekly, and Daily goals, explicitly linked to curriculum roadmap items.
            </p>
          </div>

          <div class="card" style="background: var(--color-bg-base);">
            <h3 style="font-size: 1rem; color: var(--color-primary); margin-bottom: 4px;">13. Learning Journal & Resources</h3>
            <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
              Markdown-supported engineering log capturing what you learned, what you built, and what confused you, paired with a curated resource library for high-signal documentation and books.
            </p>
          </div>
        </div>
      </div>
    ` : ''}

    <!-- Tab 3: Core Rules & Success Principles -->
    ${activeGuideSection === 'rules-principles' ? `
      <div class="guide-content-box">
        <h2 style="font-size: 1.3rem; margin-bottom: var(--space-md); color: var(--color-primary);">
          Core Behavioral Rules & Operating Principles
        </h2>

        <div style="display: flex; flex-direction: column; gap: var(--space-md);">
          <div style="padding: 14px; background: var(--color-bg-base); border-radius: var(--radius-md); border-left: 4px solid var(--color-accent-emerald);">
            <h3 style="font-size: 1rem; margin-bottom: 4px;">1. Passive Watching Is Not Learning</h3>
            <p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.6;">
              Watching a video does not count as mastering a topic. You must code along, recreate the program independently without looking at the instructor's code, and write unit tests or examples. The Prime 3.0 tracker strictly enforces this hierarchy.
            </p>
          </div>

          <div style="padding: 14px; background: var(--color-bg-base); border-radius: var(--radius-md); border-left: 4px solid var(--color-primary);">
            <h3 style="font-size: 1rem; margin-bottom: 4px;">2. Minimum Successful Day Rule</h3>
            <p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.6;">
              A day counts toward your learning streak if you complete: <strong>(Prime 3.0 OR Individual Learning) + (DSA OR Practical Coding)</strong>. This guarantees that theory and algorithmic problem solving are paired daily.
            </p>
          </div>

          <div style="padding: 14px; background: var(--color-bg-base); border-radius: var(--radius-md); border-left: 4px solid var(--color-accent-amber);">
            <h3 style="font-size: 1rem; margin-bottom: 4px;">3. The 1 Recovery Day Protection</h3>
            <p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.6;">
              Real college life includes exams, illness, and travel. You are granted <strong>1 Recovery Day per 7-day rolling window</strong>. If life gets hectic for one day, your streak will not break. However, two missed days will pause the streak.
            </p>
          </div>

          <div style="padding: 14px; background: var(--color-bg-base); border-radius: var(--radius-md); border-left: 4px solid var(--color-accent-purple);">
            <h3 style="font-size: 1rem; margin-bottom: 4px;">4. Adaptive Rescheduling (No Silent Task Deletion)</h3>
            <p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.6;">
              If you fall behind, the app never secretly deletes tasks. It alerts you ("You are X tasks behind this week") and offers three options: <em>Recover this week</em>, <em>Move to Sunday Power Block</em>, or <em>Move to next week</em>.
            </p>
          </div>

          <div style="padding: 14px; background: var(--color-bg-base); border-radius: var(--radius-md); border-left: 4px solid var(--color-accent-cyan);">
            <h3 style="font-size: 1rem; margin-bottom: 4px;">5. Zero Fake Progress</h3>
            <p style="font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.6;">
              Every percentage in this application is calculated directly from actual completed checklist items, verified DSA problem records, and real logged study sessions.
            </p>
          </div>
        </div>
      </div>
    ` : ''}
  `;

  // Handlers
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      activeGuideSection = btn.getAttribute('data-sec');
      renderGuide(container);
    };
  });
}

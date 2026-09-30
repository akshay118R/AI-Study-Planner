import { createInitialState } from '../js/data/initialState.js';

const s = createInitialState();

console.log('--- primeLessons with watched=true ---');
for (const [id, l] of Object.entries(s.primeLessons || {})) {
  if (l.watched || l.status !== 'Not Started' || l.understandingScore > 0) {
    console.log(`primeLesson ${id}: watched=${l.watched}, status=${l.status}, score=${l.understandingScore}`);
  }
}

console.log('--- projects with progress > 0 or completed tasks ---');
(s.projects || []).forEach(p => {
  const compTasks = (p.tasks || []).filter(t => t.completed);
  if (p.progress > 0 || compTasks.length > 0 || p.status !== 'Planned') {
    console.log(`project ${p.id}: progress=${p.progress}, status=${p.status}, completedTasks=${compTasks.length}`);
  }
});

console.log('--- project_tasks with completed=true ---');
(s.project_tasks || []).filter(t => t.completed).forEach(t => {
  console.log(`project_task ${t.id}: ${t.title} (${t.status})`);
});

console.log('--- project_milestones with status=Completed or progress > 0 ---');
(s.project_milestones || []).filter(m => m.status === 'Completed' || m.progress > 0).forEach(m => {
  console.log(`project_milestone ${m.id}: ${m.title} (${m.status}, ${m.progress}%)`);
});

console.log('--- roadmap_topics with status=Completed ---');
(s.roadmap_topics || []).filter(t => t.status === 'Completed').forEach(t => {
  console.log(`roadmap_topic ${t.id}: ${t.title}`);
});

console.log('--- roadmap_subtopics with status=Completed ---');
(s.roadmap_subtopics || []).filter(t => t.status === 'Completed').forEach(t => {
  console.log(`roadmap_subtopic ${t.id}: ${t.title}`);
});

console.log('--- prime_topics with status=Completed ---');
(s.prime_topics || []).filter(t => t.status === 'Completed').forEach(t => {
  console.log(`prime_topic ${t.id}: ${t.title}`);
});

console.log('--- dsa_sessions ---', s.dsa_sessions?.length);
console.log('--- project_sessions ---', s.project_sessions?.length);
console.log('--- aptitude_sessions ---', s.aptitude_sessions?.length);
console.log('--- focus_sessions ---', s.focus_sessions?.length);
console.log('--- reviews ---', s.reviews?.length);
console.log('--- daily_reviews ---', Object.keys(s.daily_reviews || {}));
console.log('--- monthly_reviews ---', Object.keys(s.monthly_reviews || {}));
console.log('--- personal_records streak ---', s.personal_records);
console.log('--- achievements ---', (s.achievements || []).filter(a => a.unlocked || a.unlocked_at));

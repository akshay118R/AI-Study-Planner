import { initStorage, getState } from '../js/data/storage.js';
import { getTodayData, getWeekData, getMonthData } from '../js/services/trackerService.js';
import { getCanonicalToday } from '../js/services/dateService.js';

initStorage();
console.log('Canonical today:', getCanonicalToday());

const oct1Data = getTodayData('2026-10-01');
console.log('oct1Data keys:', Object.keys(oct1Data));
console.log('todayTasks count:', oct1Data.todayTasks?.length);
console.log('todayTasks:', oct1Data.todayTasks?.map(t => ({ id: t.id, title: t.title, completed: t.completed })));
console.log('Oct 1 stats:', {
  completed: oct1Data.completedTasksCount,
  total: oct1Data.totalTasksCount,
  percentage: oct1Data.taskCompletionPercentage
});

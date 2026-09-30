import { createInitialState } from '../js/data/initialState.js';

const s = createInitialState();
console.log('Top keys count:', Object.keys(s).length);

for (const k of Object.keys(s)) {
  const val = s[k];
  const str = JSON.stringify(val);
  if (!str) continue;
  
  const matches = [];
  if (str.includes('"completed":true')) matches.push('completed:true');
  if (str.includes('"watched":true')) matches.push('watched:true');
  if (str.includes('"status":"Completed"')) matches.push('status:Completed');
  if (str.includes('streak')) matches.push('streak');
  if (k.includes('review') || k.includes('session')) matches.push('review/session');
  
  if (matches.length > 0) {
    console.log(`Key [${k}] matched: ${matches.join(', ')}`);
  }
}

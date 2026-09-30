import * as curr from '../js/data/curriculum.js';
import * as dav from '../js/data/davinciData.js';
import * as jav from '../js/data/javaData.js';
import * as pri from '../js/data/primeData.js';
import { PDF_WEEKLY_SCHEDULE, MONTHLY_PLAN_DATA } from '../js/services/trackerService.js';

console.log('curriculum.js has completed:true ?', JSON.stringify(curr).includes('"completed":true'));
console.log('davinciData.js has completed:true ?', JSON.stringify(dav).includes('"completed":true'));
console.log('javaData.js has completed:true ?', JSON.stringify(jav).includes('"completed":true'));
console.log('primeData.js has completed:true ?', JSON.stringify(pri).includes('"completed":true'));
console.log('PDF_WEEKLY_SCHEDULE has completed:true ?', JSON.stringify(PDF_WEEKLY_SCHEDULE).includes('"completed":true'));
console.log('MONTHLY_PLAN_DATA has completed:true ?', JSON.stringify(MONTHLY_PLAN_DATA).includes('"completed":true'));

import { execSync } from 'child_process';
import fs from 'fs';

const aapt = 'C:\\Users\\Akshay\\AppData\\Local\\Android\\Sdk\\build-tools\\35.0.0\\aapt.exe';
const apk = 'd:\\Antigravity\\New folder\\android\\app\\build\\outputs\\apk\\debug\\app-debug.apk';

const stat = fs.statSync(apk);
console.log('File Path:', apk);
console.log('File Size (bytes):', stat.size);
console.log('File Size (MB):', (stat.size / (1024 * 1024)).toFixed(2) + ' MB');
console.log('Last Modified:', stat.mtime.toISOString());

const out = execSync(`"${aapt}" dump badging "${apk}"`, { encoding: 'utf8' });
const lines = out.split('\n');
lines.forEach(l => {
  if (
    l.startsWith('package:') ||
    l.startsWith('application-label:') ||
    l.startsWith('launchable-activity:') ||
    l.startsWith('uses-permission:') ||
    l.startsWith('application:')
  ) {
    console.log(l.trim());
  }
});

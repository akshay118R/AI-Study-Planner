/**
 * Java Learning Curriculum — Official YouTube Playlist Track
 * Course: Apna College — Complete Java Placement Course (Java + DSA)
 * Playlist URL: https://youtube.com/playlist?list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop&si=wQIkHGx0hH7rED5K
 * 
 * Rules:
 * - Java is learned ONLY through this authentic 39-video playlist.
 * - Track name: JAVA — PLAYLIST TRACK
 * - Integrated across MONTH → WEEK → TODAY.
 * - PROGRAM_START_DATE = 2026-10-01.
 * - All tasks initially start UNCHECKED.
 * - Sequential tracking with date protection for future tasks.
 */

import { PROGRAM_START_DATE, parseDate, formatDateStr } from '../services/dateService.js';

export const JAVA_PLAYLIST_URL = 'https://youtube.com/playlist?list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop&si=wQIkHGx0hH7rED5K';

export const JAVA_PLAYLIST_VIDEOS = [
  {
    "video_number": 1,
    "title": "Introduction to Java Language | Lecture 1 | Complete Placement Course",
    "videoId": "yRpLlJmRo2w",
    "duration_text": "18:46",
    "duration_minutes": 19,
    "url": "https://www.youtube.com/watch?v=yRpLlJmRo2w&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 2,
    "title": "Variables in Java | Input Output | Complete Placement Course | Lecture 2",
    "videoId": "LusTv0RlnSU",
    "duration_text": "42:36",
    "duration_minutes": 43,
    "url": "https://www.youtube.com/watch?v=LusTv0RlnSU&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 3,
    "title": "Conditional Statements | If-else, Switch Break | Complete Java Placement Course | Lecture 3",
    "videoId": "I5srDu75h_M",
    "duration_text": "25:08",
    "duration_minutes": 25,
    "url": "https://www.youtube.com/watch?v=I5srDu75h_M&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 4,
    "title": "Loops in Java | Java Placement Full Course | Lecture 4",
    "videoId": "0r1SfRoLuzU",
    "duration_text": "29:33",
    "duration_minutes": 30,
    "url": "https://www.youtube.com/watch?v=0r1SfRoLuzU&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 5,
    "title": "9 Best Patterns Questions In Java (for Beginners) | Java Placement Course | Lecture 5",
    "videoId": "GjHNGM7KN3w",
    "duration_text": "58:25",
    "duration_minutes": 58,
    "url": "https://www.youtube.com/watch?v=GjHNGM7KN3w&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 6,
    "title": "Advanced Pattern Questions | Java | Complete Placement Course - Lecture 6",
    "videoId": "Dr4PpNa7AYo",
    "duration_text": "39:05",
    "duration_minutes": 39,
    "url": "https://www.youtube.com/watch?v=Dr4PpNa7AYo&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 7,
    "title": "Functions & Methods | Java  Complete Placement Course | Lecture 7",
    "videoId": "qcSz4ef9UHA",
    "duration_text": "26:49",
    "duration_minutes": 27,
    "url": "https://www.youtube.com/watch?v=qcSz4ef9UHA&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 8,
    "title": "Functions in Java | Practice Questions | Complete Placement Course | Lecture 8",
    "videoId": "pFPZ83mgH00",
    "duration_text": "1:33",
    "duration_minutes": 2,
    "url": "https://www.youtube.com/watch?v=pFPZ83mgH00&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 9,
    "title": "Basics of Time Complexity and Space Complexity | Java | Complete Placement Course | Lecture 9",
    "videoId": "bQssdSrSGNE",
    "duration_text": "21:55",
    "duration_minutes": 22,
    "url": "https://www.youtube.com/watch?v=bQssdSrSGNE&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 10,
    "title": "Arrays Introduction | Java Complete Placement Course | Lecture 10",
    "videoId": "NTHVTY6w2Co",
    "duration_text": "25:44",
    "duration_minutes": 26,
    "url": "https://www.youtube.com/watch?v=NTHVTY6w2Co&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 11,
    "title": "2D Arrays | Java Complete Placement Course | Lecture 11",
    "videoId": "18Zt5I4S45o",
    "duration_text": "19:53",
    "duration_minutes": 20,
    "url": "https://www.youtube.com/watch?v=18Zt5I4S45o&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 12,
    "title": "Strings | Lecture 12 | Java Placement Series",
    "videoId": "vCRD36bG8xQ",
    "duration_text": "26:07",
    "duration_minutes": 26,
    "url": "https://www.youtube.com/watch?v=vCRD36bG8xQ&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 13,
    "title": "String Builder | Java Placement Course Lecture 13",
    "videoId": "ZLDwskEhIFg",
    "duration_text": "24:31",
    "duration_minutes": 25,
    "url": "https://www.youtube.com/watch?v=ZLDwskEhIFg&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 14,
    "title": "Operators & Binary Number System | Java Lecture 14",
    "videoId": "Oud4alVQU4s",
    "duration_text": "36:18",
    "duration_minutes": 36,
    "url": "https://www.youtube.com/watch?v=Oud4alVQU4s&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 15,
    "title": "Bit Manipulation | Java Placement Course | Lecture 15",
    "videoId": "OSoO8eCEEC8",
    "duration_text": "26:38",
    "duration_minutes": 27,
    "url": "https://www.youtube.com/watch?v=OSoO8eCEEC8&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 16,
    "title": "Sorting in Java | Bubble Sort, Selection Sort & Insertion Sort | Java Placement Course",
    "videoId": "PkJIc5tBRUE",
    "duration_text": "33:29",
    "duration_minutes": 33,
    "url": "https://www.youtube.com/watch?v=PkJIc5tBRUE&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 17,
    "title": "Recursion in One Shot | Theory + Question Practice + Code | Level 1 - Easy",
    "videoId": "5Boqfjissv0",
    "duration_text": "1:25:04",
    "duration_minutes": 85,
    "url": "https://www.youtube.com/watch?v=5Boqfjissv0&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 18,
    "title": "Recursion in One Shot | 9 Best Problems",
    "videoId": "u-HgzgYe8KA",
    "duration_text": "1:37:05",
    "duration_minutes": 97,
    "url": "https://www.youtube.com/watch?v=u-HgzgYe8KA&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 19,
    "title": "Recursion One Shot - Advanced Level Questions | Placement (Tech)",
    "videoId": "xZykmhcWGuY",
    "duration_text": "50:26",
    "duration_minutes": 50,
    "url": "https://www.youtube.com/watch?v=xZykmhcWGuY&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 20,
    "title": "Backtracking | N Queens Problem | Permutations |  The Java Placement Course | Apna College |",
    "videoId": "bRs6E_SL2Tk",
    "duration_text": "46:33",
    "duration_minutes": 47,
    "url": "https://www.youtube.com/watch?v=bRs6E_SL2Tk&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 21,
    "title": "Java Sudoku Solver | Backtracking | Java Placement Course",
    "videoId": "tRj4VlVTat8",
    "duration_text": "25:43",
    "duration_minutes": 26,
    "url": "https://www.youtube.com/watch?v=tRj4VlVTat8&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 22,
    "title": "Merge Sort | For Beginners | Java Placement Course",
    "videoId": "unxAnJBy12Q",
    "duration_text": "21:25",
    "duration_minutes": 21,
    "url": "https://www.youtube.com/watch?v=unxAnJBy12Q&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 23,
    "title": "Quick Sort For Beginners | Java Placement Course | @ApnaCollegeOfficial",
    "videoId": "QXum8HQd_l4",
    "duration_text": "23:30",
    "duration_minutes": 24,
    "url": "https://www.youtube.com/watch?v=QXum8HQd_l4&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 24,
    "title": "Java OOPs in One Shot | Object Oriented Programming | Java Language | Placement Course",
    "videoId": "bSrm9RXwBaI",
    "duration_text": "1:06:27",
    "duration_minutes": 66,
    "url": "https://www.youtube.com/watch?v=bSrm9RXwBaI&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 25,
    "title": "ArrayList In Java + Notes | Java Placement Course",
    "videoId": "liFyhzZl9uw",
    "duration_text": "17:13",
    "duration_minutes": 17,
    "url": "https://www.youtube.com/watch?v=liFyhzZl9uw&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 26,
    "title": "Java Collections Framework | Java Placement Course",
    "videoId": "VphowcSkBX4",
    "duration_text": "17:53",
    "duration_minutes": 18,
    "url": "https://www.youtube.com/watch?v=VphowcSkBX4&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 27,
    "title": "Introduction to Linked List | Data Structures & Algorithms | Java Placement Course",
    "videoId": "oAja8-Ulz6o",
    "duration_text": "48:50",
    "duration_minutes": 49,
    "url": "https://www.youtube.com/watch?v=oAja8-Ulz6o&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 28,
    "title": "How to Reverse a Linked List? | Iterative + Recursive | Java Placement Course",
    "videoId": "t7YaoQOFXzk",
    "duration_text": "20:23",
    "duration_minutes": 20,
    "url": "https://www.youtube.com/watch?v=t7YaoQOFXzk&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 29,
    "title": "Most IMPORTANT Linked List Questions for Placements | Java Full Course",
    "videoId": "cL4gHVuFOvk",
    "duration_text": "45:20",
    "duration_minutes": 45,
    "url": "https://www.youtube.com/watch?v=cL4gHVuFOvk&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 30,
    "title": "Stack Data Structure in One Video | Java Placement Course",
    "videoId": "7m1DMYAbdiY",
    "duration_text": "36:45",
    "duration_minutes": 37,
    "url": "https://www.youtube.com/watch?v=7m1DMYAbdiY&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 31,
    "title": "Complete Queue Data Structure | in One Shot | Java Placement Course",
    "videoId": "va_6RmSrKCg",
    "duration_text": "45:50",
    "duration_minutes": 46,
    "url": "https://www.youtube.com/watch?v=va_6RmSrKCg&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 32,
    "title": "Binary Tree in Data Structures | All about Binary Tree | DSA Course",
    "videoId": "-DzowlcaUmE",
    "duration_text": "1:22:13",
    "duration_minutes": 82,
    "url": "https://www.youtube.com/watch?v=-DzowlcaUmE&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 33,
    "title": "Binary Search Trees | BST in One Video | Java Placement Course | Data Structures & Algorithms",
    "videoId": "qAeitQWjNNg",
    "duration_text": "1:09:16",
    "duration_minutes": 69,
    "url": "https://www.youtube.com/watch?v=qAeitQWjNNg&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 34,
    "title": "HashSet in Java | Hashing | Java Placement Course | Data Structures & Algorithms",
    "videoId": "eJiGN1h8XzM",
    "duration_text": "20:48",
    "duration_minutes": 21,
    "url": "https://www.youtube.com/watch?v=eJiGN1h8XzM&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 35,
    "title": "HashMap in Java | Hashing | Java Placement Course | Data Structures & Algorithms",
    "videoId": "WeF3_nk-UqY",
    "duration_text": "24:10",
    "duration_minutes": 24,
    "url": "https://www.youtube.com/watch?v=WeF3_nk-UqY&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 36,
    "title": "HashMap Implementation in Java | HashMap | Java with DSA",
    "videoId": "KDZ_IXvpMG4",
    "duration_text": "58:19",
    "duration_minutes": 58,
    "url": "https://www.youtube.com/watch?v=KDZ_IXvpMG4&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 37,
    "title": "Hashing in Java | One Shot | 5 Best Questions",
    "videoId": "rTRcntABSZ4",
    "duration_text": "1:37:33",
    "duration_minutes": 98,
    "url": "https://www.youtube.com/watch?v=rTRcntABSZ4&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 38,
    "title": "Trie Data Structure | Java DSA Course",
    "videoId": "m9zawMC6QAI",
    "duration_text": "2:16:35",
    "duration_minutes": 137,
    "url": "https://www.youtube.com/watch?v=m9zawMC6QAI&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  },
  {
    "video_number": 39,
    "title": "Graph Data Structure | Tutorial for Graphs in Data Structures",
    "videoId": "59fUtYYz7ZU",
    "duration_text": "6:44:00",
    "duration_minutes": 404,
    "url": "https://www.youtube.com/watch?v=59fUtYYz7ZU&list=PLfqMhTWNBTe3LtFWcvwpqTkUSlB32kJop"
  }
];

// Aliased for backwards compatibility with any legacy imports
export const JAVA_FUNDAMENTALS_TOPICS = JAVA_PLAYLIST_VIDEOS.map(v => ({
  id: 'java-vid-' + v.video_number,
  video_number: v.video_number,
  title: v.title,
  description: 'Apna College Java Playlist Lecture ' + v.video_number + ' (' + v.duration_text + ')',
  minutes: v.duration_minutes,
  videoId: v.videoId,
  url: v.url
}));

/**
 * Monthly distribution of the 39 videos across the 12-month curriculum:
 * October 2026 to May 2027: 1 video per week (39 weeks total)
 * June 2027 to September 2027: Project & Placement DSA/Java Revision
 */
export const JAVA_MONTHLY_SCHEDULE = {
  '2026-10': { startVideo: 1, endVideo: 5, targetVideos: 5, label: 'Videos 1–5: Language Intro, Variables, Conditionals, Loops & Patterns' },
  '2026-11': { startVideo: 6, endVideo: 10, targetVideos: 5, label: 'Videos 6–10: Advanced Patterns, Functions, Complexity & Arrays' },
  '2026-12': { startVideo: 11, endVideo: 15, targetVideos: 5, label: 'Videos 11–15: 2D Arrays, Strings, StringBuilder, Operators & Bits' },
  '2027-01': { startVideo: 16, endVideo: 20, targetVideos: 5, label: 'Videos 16–20: Sorting, Recursion Levels 1-3 & Backtracking' },
  '2027-02': { startVideo: 21, endVideo: 24, targetVideos: 4, label: 'Videos 21–24: Sudoku Solver, Merge/Quick Sort & OOPs in One Shot' },
  '2027-03': { startVideo: 25, endVideo: 29, targetVideos: 5, label: 'Videos 25–29: ArrayList, Collections Framework & Linked Lists' },
  '2027-04': { startVideo: 30, endVideo: 34, targetVideos: 5, label: 'Videos 30–34: Stacks, Queues, Binary Trees, BST & HashSets' },
  '2027-05': { startVideo: 35, endVideo: 39, targetVideos: 5, label: 'Videos 35–39: HashMap Implementation, Hashing, Tries & Graphs' },
  '2027-06': { startVideo: 39, endVideo: 39, targetVideos: 0, label: 'Java Capstone: Project Architecture & Domain Modeling' },
  '2027-07': { startVideo: 39, endVideo: 39, targetVideos: 0, label: 'Java Capstone: REST API / CLI Data Storage & Testing' },
  '2027-08': { startVideo: 39, endVideo: 39, targetVideos: 0, label: 'Java Interview Revision: Core OOP, Collections & System Design' },
  '2027-09': { startVideo: 39, endVideo: 39, targetVideos: 0, label: 'Final Placement Readiness: Mock Interviews & LeetCode Java' }
};

/**
 * Weekly mapping helper:
 * Maps a given week (e.g. '2026-10-W1') to its planned Java video.
 * Week 1 gets Video 1, Week 2 gets Video 2, etc.
 */
export function getJavaVideoForWeek(weekId) {
  if (!weekId) return null;
  const match = weekId.match(/^(\d{4}-\d{2})-W(\d+)$/);
  if (!match) return null;
  const monthId = match[1];
  const weekNum = parseInt(match[2], 10);
  
  const mSched = JAVA_MONTHLY_SCHEDULE[monthId];
  if (!mSched || mSched.targetVideos === 0) return null;

  const vidNum = mSched.startVideo + (weekNum - 1);
  if (vidNum > mSched.endVideo || vidNum > JAVA_PLAYLIST_VIDEOS.length) {
    return null;
  }
  return JAVA_PLAYLIST_VIDEOS[vidNum - 1] || null;
}

/**
 * Get the planned Java video for a given date.
 * Each week has an assigned Java video from the playlist.
 */
export function getJavaVideoForDate(dateStr) {
  if (!dateStr || dateStr < PROGRAM_START_DATE) return null;
  const monthId = dateStr.substring(0, 7);
  const dayOfMonth = parseInt(dateStr.substring(8, 10), 10);
  
  // Week number in month (1..5)
  const weekNum = Math.min(5, Math.floor((dayOfMonth - 1) / 7) + 1);
  const weekId = monthId + '-W' + weekNum;
  
  return getJavaVideoForWeek(weekId);
}

/**
 * Backwards compatibility helper for getJavaTopicForDate
 */
export function getJavaTopicForDate(dateStr) {
  const vid = getJavaVideoForDate(dateStr);
  if (!vid) return null;
  return {
    id: 'java-vid-' + vid.video_number,
    video_number: vid.video_number,
    title: 'Video/Lesson ' + vid.video_number + ': ' + vid.title,
    description: 'Apna College Java Playlist (' + vid.duration_text + ')',
    minutes: vid.duration_minutes,
    videoId: vid.videoId,
    url: vid.url
  };
}

/**
 * Get all planned Java videos for a month.
 */
export function getJavaVideosForMonth(monthId) {
  const mSched = JAVA_MONTHLY_SCHEDULE[monthId];
  if (!mSched || mSched.targetVideos === 0) return [];
  return JAVA_PLAYLIST_VIDEOS.slice(mSched.startVideo - 1, mSched.endVideo);
}

/**
 * Calculate Java progress summary from completed video numbers.
 */
export function getJavaProgressSummary(input = []) {
  let list = [];
  if (Array.isArray(input)) {
    list = input;
  } else if (input && typeof input === 'object') {
    if (Array.isArray(input.java_progress)) {
      list = input.java_progress;
    } else if (Array.isArray(input.completedList)) {
      list = input.completedList;
    }
  }

  const completedSet = new Set(
    list
      .filter(item => {
        if (typeof item === 'object' && item !== null) {
          return item.completed === true;
        }
        return typeof item === 'number' || typeof item === 'string';
      })
      .map(item => (typeof item === 'object' && item !== null) ? item.video_number : item)
  );
  
  const total = JAVA_PLAYLIST_VIDEOS.length; // 39
  const completedCount = JAVA_PLAYLIST_VIDEOS.filter(v => completedSet.has(v.video_number)).length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  
  const currentVid = JAVA_PLAYLIST_VIDEOS.find(v => !completedSet.has(v.video_number)) || JAVA_PLAYLIST_VIDEOS[total - 1];
  const nextIdx = currentVid ? currentVid.video_number : total;
  const upcomingVid = (nextIdx < total) ? JAVA_PLAYLIST_VIDEOS[nextIdx] : null;

  return {
    totalVideos: total,
    completedVideos: completedCount,
    percentage,
    currentTask: currentVid ? 'Video/Lesson ' + currentVid.video_number + ': ' + currentVid.title : 'Complete Course',
    upcomingTask: upcomingVid ? 'Video/Lesson ' + upcomingVid.video_number + ': ' + upcomingVid.title : 'All Videos Completed',
    playlistUrl: JAVA_PLAYLIST_URL,
    videos: JAVA_PLAYLIST_VIDEOS.map(v => ({
      ...v,
      completed: completedSet.has(v.video_number)
    }))
  };
}

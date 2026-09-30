/**
 * DaVinci Resolve Complete Learning Curriculum
 * Official Course: Control Z - DaVinci Resolve Full Course / Masterclass
 * Playlist URL: https://youtube.com/playlist?list=PLzlU7AmRSD8YCSar4ZdlNPpDce_lDbLe2&si=A5VpaF6NZNWSc6Hf
 * 
 * Rules:
 * - 2 days per week (Tuesday & Saturday)
 * - 1 video on each day
 * - Target: 2 videos / week
 * - Sequential order (Video 1 -> 54)
 * - Every task/video starts UNCHECKED (completed: false)
 */

export const DAVINCI_PLAYLIST_URL = 'https://youtube.com/playlist?list=PLzlU7AmRSD8YCSar4ZdlNPpDce_lDbLe2&si=A5VpaF6NZNWSc6Hf';

export const DAVINCI_PLAYLIST_VIDEOS = [
  { video_number: 1, title: 'DaVinci Resolve Full Course for Beginners | Start Editing Like a Pro (Hindi) | Class 01', duration_minutes: 45 },
  { video_number: 2, title: 'How to import media in DaVinci Resolve | How to add videos in media pool', duration_minutes: 30 },
  { video_number: 3, title: 'DaVinci Resolve for Beginners | Media Pool & Edit Page Hindi Tutorial | Class 02', duration_minutes: 40 },
  { video_number: 4, title: 'Master the Timeline in DaVinci Resolve Like a Pro! | Class 3', duration_minutes: 45 },
  { video_number: 5, title: 'Fix Start Timecode Problems in DaVinci Resolve!', duration_minutes: 25 },
  { video_number: 6, title: 'Unlock the Power of Inspector in DaVinci Resolve | Class 4 (Full Guide)', duration_minutes: 45 },
  { video_number: 7, title: 'Mastering PowerBins in Davinci Resolve | Class 5 | Part 1', duration_minutes: 35 },
  { video_number: 8, title: '30 Hidden Tips & Tricks in DaVinci Resolve You MUST Know! | Class 5 | Part 2', duration_minutes: 45 },
  { video_number: 9, title: 'DaVinci Resolve Masterclass 6 | Unlock Project & Timeline Settings Like a Pro | Hindi', duration_minutes: 40 },
  { video_number: 10, title: 'BEST Way To Learn Keyframing In DaVinci Resolve | Class 7', duration_minutes: 45 },
  { video_number: 11, title: 'Proxies & Render Cache Tips to SUPERCHARGE Your Video Editing Workflow | Class 8', duration_minutes: 40 },
  { video_number: 12, title: 'Top Keyboard Customization Tips for Faster Editing in DaVinci Resolve | Class 9', duration_minutes: 35 },
  { video_number: 13, title: 'The Secret to Seamless Transitions in DaVinci Resolve 19 | Class 10', duration_minutes: 45 },
  { video_number: 14, title: 'Best Titles in DaVinci Resolve (Complete Guide)', duration_minutes: 40 },
  { video_number: 15, title: 'Mastering Text+ in Resolve Made EASY with PRO Techniques', duration_minutes: 45 },
  { video_number: 16, title: 'Create AMAZING Motion Backgrounds in DaVinci Resolve | Class 12', duration_minutes: 40 },
  { video_number: 17, title: 'Secret OpenFX & Effects Tools in DaVinci Resolve That Will Blow Your Mind | Class 13', duration_minutes: 45 },
  { video_number: 18, title: 'Mastering Fairlight: The Future of Audio Editing | Class 14', duration_minutes: 50 },
  { video_number: 19, title: 'The BEST Motion Tracking Tips from a DaVinci Resolve MASTER', duration_minutes: 45 },
  { video_number: 20, title: 'Color Grading for Beginners: DaVinci Resolve Tutorial | Class 16', duration_minutes: 50 },
  { video_number: 21, title: 'What Happens When You MASTER Color Grading in DaVinci Resolve? | Class 17', duration_minutes: 45 },
  { video_number: 22, title: 'Master Primaries Color Wheel in DaVinci Resolve | Step-by-Step Class 18', duration_minutes: 45 },
  { video_number: 23, title: 'Why Color Nodes Are BETTER than Layers | Class 19', duration_minutes: 40 },
  { video_number: 24, title: '10 DaVinci Resolve EXPORT Tips You NEED to Know', duration_minutes: 35 },
  { video_number: 25, title: '4K Sony RAW Clips - Working with Log Footage & RAW Workflow', duration_minutes: 40 },
  { video_number: 26, title: 'Cinematic Title Pack & Text Animations in DaVinci Resolve', duration_minutes: 40 },
  { video_number: 27, title: 'Top DaVinci Resolve Plugins (Installation & Practical Workflow Guide)', duration_minutes: 35 },
  { video_number: 28, title: 'Create Stunning Vanishing Effects in DaVinci Resolve | Full Guide', duration_minutes: 45 },
  { video_number: 29, title: 'DaVinci Resolve Picture-in-Picture (PIP) Effect Mastery', duration_minutes: 35 },
  { video_number: 30, title: 'Professional Video Editing Workflow & Assembly Walkthrough', duration_minutes: 40 },
  { video_number: 31, title: 'How to Clone Yourself in DaVinci Resolve | Step-by-Step Guide', duration_minutes: 40 },
  { video_number: 32, title: 'Best DaVinci Resolve Effects & Creative Transitions', duration_minutes: 35 },
  { video_number: 33, title: 'DaVinci Resolve Fusion Basics | Interface, Nodes, Use & Importance', duration_minutes: 50 },
  { video_number: 34, title: "DaVinci Resolve 'FUSION NODES' | Types, Use & Practical Architecture", duration_minutes: 45 },
  { video_number: 35, title: 'Fusion Text Animation & Kinetic Typography in Resolve', duration_minutes: 40 },
  { video_number: 36, title: 'Masking & Keying Inside Fusion Workspace', duration_minutes: 45 },
  { video_number: 37, title: 'Depth Channel & 3D Camera Projection in Fusion', duration_minutes: 45 },
  { video_number: 38, title: 'Shape Morphing Tutorial | Vector Shape Animations in Resolve', duration_minutes: 40 },
  { video_number: 39, title: 'Fusion Map Animations & Travel Route Tracking', duration_minutes: 45 },
  { video_number: 40, title: 'Text Behind Objects: Depth Matte & Rotoscoping', duration_minutes: 40 },
  { video_number: 41, title: '4 Animated Lines Techniques for Explainer Videos', duration_minutes: 40 },
  { video_number: 42, title: 'Hologram & Sci-Fi Visual Effects Tutorial', duration_minutes: 45 },
  { video_number: 43, title: 'Waterfilling & Liquid Effects in Fusion', duration_minutes: 45 },
  { video_number: 44, title: 'DaVinci Resolve Advanced Color Science & ACES Workflow', duration_minutes: 40 },
  { video_number: 45, title: 'Fusion Line Graphs & Dynamic Data Infographics', duration_minutes: 40 },
  { video_number: 46, title: 'Essential Third-Party Plugins & LUT Integration', duration_minutes: 35 },
  { video_number: 47, title: 'Advanced Multicam Editing & Audio Syncing', duration_minutes: 45 },
  { video_number: 48, title: 'Audio Mastering in Fairlight: EQ, Compression & Noise Reduction', duration_minutes: 45 },
  { video_number: 49, title: 'Speed Ramping & Optical Flow Frame Interpolation', duration_minutes: 40 },
  { video_number: 50, title: 'Automated Cut Detection & Fast Rough Cut Strategies', duration_minutes: 35 },
  { video_number: 51, title: 'BEST EXPORT SETTINGS for YouTube, Web & High-Bitrate Archival', duration_minutes: 40 },
  { video_number: 52, title: 'Video Codecs Explained: H.264 vs H.265 vs ProRes vs DNxHR', duration_minutes: 40 },
  { video_number: 53, title: 'Color Match Between Multiple Cameras in DaVinci Resolve', duration_minutes: 45 },
  { video_number: 54, title: 'Multi-Track Audio Channel Configuration & Final Project Delivery', duration_minutes: 45 }
];

/**
 * Get the sequential DaVinci Resolve video assigned to a specific date.
 * DaVinci Resolve is scheduled 2 days per week: Tuesday (day 2) and Saturday (day 6).
 * Starting on October 1, 2026:
 * - Oct 3 (Sat): Video 1
 * - Oct 6 (Tue): Video 2
 * - Oct 10 (Sat): Video 3
 * - Oct 13 (Tue): Video 4
 * ... sequentially.
 */
export function getDavinciVideoForDate(dateStr) {
  if (!dateStr || dateStr < '2026-10-01') return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayOfWeek = dateObj.getDay(); // 0: Sun, 1: Mon, 2: Tue, 6: Sat

  if (dayOfWeek !== 2 && dayOfWeek !== 6) {
    return null; // Not a scheduled DaVinci day
  }

  // Count scheduled DaVinci days (Tue & Sat) between 2026-10-01 and dateStr inclusive
  let count = 0;
  const cur = new Date(2026, 9, 1); // 2026-10-01
  while (cur <= dateObj) {
    const dow = cur.getDay();
    if (dow === 2 || dow === 6) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  const videoIndex = count - 1;
  if (videoIndex >= 0 && videoIndex < DAVINCI_PLAYLIST_VIDEOS.length) {
    return DAVINCI_PLAYLIST_VIDEOS[videoIndex];
  }

  // After 54 videos, cycle or return revision video
  const cycledNum = ((count - 1) % DAVINCI_PLAYLIST_VIDEOS.length) + 1;
  const base = DAVINCI_PLAYLIST_VIDEOS[cycledNum - 1];
  return {
    ...base,
    video_number: count,
    title: `Advanced Practice: ${base.title}`
  };
}

/**
 * Get assigned videos for a given week (e.g. 2 videos per week)
 */
export function getDavinciVideosForWeek(weekIndex) {
  const wIdx = Math.max(1, Number(weekIndex) || 1);
  const v1Num = (wIdx - 1) * 2 + 1;
  const v2Num = (wIdx - 1) * 2 + 2;

  const v1 = DAVINCI_PLAYLIST_VIDEOS[v1Num - 1] || { video_number: v1Num, title: `DaVinci Project Practice Video ${v1Num}` };
  const v2 = DAVINCI_PLAYLIST_VIDEOS[v2Num - 1] || { video_number: v2Num, title: `DaVinci Project Practice Video ${v2Num}` };

  return [v1, v2];
}

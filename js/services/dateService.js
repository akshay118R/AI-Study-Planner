/**
 * Akshay's Career Tracker - Date Synchronization Service
 * Single Canonical Current Date architecture.
 * Synchronizes Month -> Week -> Today without date drift.
 */

// Hard program start date: October 1, 2026 (Req 1, 2, 7, 10)
export const PROGRAM_START_DATE = '2026-10-01';
export const PLAN_START_DATE = PROGRAM_START_DATE;

export function getProgramStartDate() {
  return PROGRAM_START_DATE;
}

export function isProgramStarted(d = getCanonicalToday()) {
  return d >= PROGRAM_START_DATE;
}

export function getDeviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch (e) {
    return 'Asia/Kolkata';
  }
}

let simulatedDate = null;

export function setSimulatedToday(d) {
  simulatedDate = d;
  try {
    if (typeof localStorage !== 'undefined') {
      if (d) {
        localStorage.setItem('career_tracker_simulated_date', d);
      } else {
        localStorage.removeItem('career_tracker_simulated_date');
      }
    }
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  window.setSimulatedToday = setSimulatedToday;
}

export function getSimulatedToday() {
  if (simulatedDate) return simulatedDate;
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('career_tracker_simulated_date');
      if (stored) return stored;
    }
  } catch (e) {}
  return null;
}

export function getCanonicalToday() {
  if (simulatedDate) return simulatedDate;
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('career_tracker_simulated_date');
      if (stored) return stored;
    }
  } catch (e) {}
  try {
    const tz = getDeviceTimeZone();
    const now = new Date();
    // en-CA produces YYYY-MM-DD in the device local timezone
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
  } catch (e) {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export function formatLiveDateTime(dateObj = new Date()) {
  const tz = getDeviceTimeZone();
  const dateFormatted = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);

  const timeFormatted = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(dateObj);

  return `${dateFormatted} • ${timeFormatted}`;
}

export function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateStr(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatFullDate(dateStr) {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatShortDate(dateStr) {
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatMonthYear(dateStrOrMonthId) {
  let y, m;
  if (dateStrOrMonthId.includes('-') && dateStrOrMonthId.length === 7) {
    [y, m] = dateStrOrMonthId.split('-').map(Number);
  } else {
    const parts = dateStrOrMonthId.split('-').map(Number);
    y = parts[0];
    m = parts[1];
  }
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Given any date string, return Monday & Sunday of that week,
 * plus details for all 7 days (MON to SUN).
 */
export function getWeekRange(dateStr) {
  const d = parseDate(dateStr);
  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  // Distance to Monday (if day is Sunday (0), distance is -6; else 1 - dayOfWeek)
  const distToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(d);
  monday.setDate(d.getDate() + distToMonday);

  const days = [];
  const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const dateFormatted = formatDateStr(current);
    days.push({
      dayName: DAY_NAMES[i],
      date: dateFormatted,
      displayDate: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayNumber: current.getDate(),
      isToday: dateFormatted === getCanonicalToday()
    });
  }

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startMonth = monday.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
  const startDay = monday.getDate();
  const endDay = sunday.getDate();
  const year = sunday.getFullYear();

  let rangeLabel = '';
  if (startMonth === endMonth) {
    rangeLabel = `${startMonth} ${startDay}–${endDay}, ${year}`;
  } else {
    rangeLabel = `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
  }

  // Calculate week number in month or year
  const firstDayOfMonth = new Date(monday.getFullYear(), monday.getMonth(), 1);
  const weekNum = Math.ceil((monday.getDate() + firstDayOfMonth.getDay()) / 7);

  const weekId = `${formatDateStr(monday)}_to_${formatDateStr(sunday)}`;

  return {
    weekId,
    weekNumber: weekNum,
    startDate: formatDateStr(monday),
    endDate: formatDateStr(sunday),
    rangeLabel,
    days,
    monthId: formatDateStr(monday).substring(0, 7)
  };
}

/**
 * Returns weeks for a month (e.g. October 2026)
 */
export function getWeeksInMonth(monthId) {
  if (!monthId || monthId < '2026-10') {
    return [];
  }
  const [year, month] = monthId.split('-').map(Number);
  const weeks = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  let currentDay = 1;
  let weekNum = 1;

  while (currentDay <= daysInMonth) {
    const startD = new Date(year, month - 1, currentDay);
    const endDayNum = Math.min(daysInMonth, currentDay + 6);
    const endD = new Date(year, month - 1, endDayNum);
    const startStr = formatDateStr(startD);
    const endStr = formatDateStr(endD);

    const startMName = startD.toLocaleDateString('en-US', { month: 'short' });
    const endMName = endD.toLocaleDateString('en-US', { month: 'short' });
    const rangeLabel = startMName === endMName
      ? `${startMName} ${startD.getDate()}–${endD.getDate()}`
      : `${startMName} ${startD.getDate()}–${endMName} ${endD.getDate()}`;

    weeks.push({
      weekNumber: weekNum,
      weekId: `${monthId}-W${weekNum}`,
      startDate: startStr,
      endDate: endStr,
      rangeLabel
    });

    currentDay += 7;
    weekNum++;
  }

  return weeks;
}

export function shiftDate(dateStr, deltaDays) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + deltaDays);
  return formatDateStr(d);
}

export function shiftWeek(dateStr, deltaWeeks) {
  return shiftDate(dateStr, deltaWeeks * 7);
}

export const PLAN_12_MONTHS = [
  { id: '2026-10', label: 'October 2026', monthNum: 10, year: 2026 },
  { id: '2026-11', label: 'November 2026', monthNum: 11, year: 2026 },
  { id: '2026-12', label: 'December 2026', monthNum: 12, year: 2026 },
  { id: '2027-01', label: 'January 2027', monthNum: 1, year: 2027 },
  { id: '2027-02', label: 'February 2027', monthNum: 2, year: 2027 },
  { id: '2027-03', label: 'March 2027', monthNum: 3, year: 2027 },
  { id: '2027-04', label: 'April 2027', monthNum: 4, year: 2027 },
  { id: '2027-05', label: 'May 2027', monthNum: 5, year: 2027 },
  { id: '2027-06', label: 'June 2027', monthNum: 6, year: 2027 },
  { id: '2027-07', label: 'July 2027', monthNum: 7, year: 2027 },
  { id: '2027-08', label: 'August 2027', monthNum: 8, year: 2027 },
  { id: '2027-09', label: 'September 2027', monthNum: 9, year: 2027 }
];

export function getPrevMonthId(monthId) {
  const idx = PLAN_12_MONTHS.findIndex(m => m.id === monthId);
  if (idx > 0) return PLAN_12_MONTHS[idx - 1].id;
  return null;
}

export function getNextMonthId(monthId) {
  const idx = PLAN_12_MONTHS.findIndex(m => m.id === monthId);
  if (idx >= 0 && idx < PLAN_12_MONTHS.length - 1) return PLAN_12_MONTHS[idx + 1].id;
  return null;
}

export function getAllPlanWeeks() {
  const allWeeks = [];
  PLAN_12_MONTHS.forEach(m => {
    const mWeeks = getWeeksInMonth(m.id);
    allWeeks.push(...mWeeks);
  });
  return allWeeks;
}

export function getWeekById(weekId) {
  if (!weekId) return null;
  const match = weekId.match(/^(\d{4}-\d{2})-W(\d+)$/);
  if (match) {
    const monthId = match[1];
    const weekNum = parseInt(match[2]);
    const weeks = getWeeksInMonth(monthId);
    return weeks.find(w => w.weekNumber === weekNum) || null;
  }
  return null;
}

export function getPrevWeekId(weekId) {
  const allWeeks = getAllPlanWeeks();
  const idx = allWeeks.findIndex(w => w.weekId === weekId);
  if (idx > 0) return allWeeks[idx - 1].weekId;
  return null;
}

export function getNextWeekId(weekId) {
  const allWeeks = getAllPlanWeeks();
  const idx = allWeeks.findIndex(w => w.weekId === weekId);
  if (idx >= 0 && idx < allWeeks.length - 1) return allWeeks[idx + 1].weekId;
  return null;
}

export function getWeekAndMonthForDate(dateStr) {
  if (!dateStr) dateStr = getCanonicalToday();
  const allWeeks = getAllPlanWeeks();
  const found = allWeeks.find(w => dateStr >= w.startDate && dateStr <= w.endDate);
  if (found) {
    const monthId = found.weekId.substring(0, 7);
    return {
      week: found,
      weekId: found.weekId,
      weekNumber: found.weekNumber,
      monthId,
      monthTitle: formatMonthYear(monthId),
      rangeLabel: found.rangeLabel,
      startDate: found.startDate,
      endDate: found.endDate
    };
  }

  // Pre-start: Dates before 2026-10-01 must map to the initial program week & month (Req 1, 3, 4)
  if (dateStr < PROGRAM_START_DATE) {
    const firstWeek = allWeeks[0] || {
      weekNumber: 1,
      weekId: '2026-10-W1',
      startDate: '2026-10-01',
      endDate: '2026-10-07',
      rangeLabel: 'Oct 1–7'
    };
    return {
      week: firstWeek,
      weekId: firstWeek.weekId,
      weekNumber: firstWeek.weekNumber,
      monthId: '2026-10',
      monthTitle: formatMonthYear('2026-10'),
      rangeLabel: firstWeek.rangeLabel,
      startDate: firstWeek.startDate,
      endDate: firstWeek.endDate
    };
  }

  // Fallback for dates beyond the plan
  const monthId = dateStr.substring(0, 7);
  const mWeeks = getWeeksInMonth(monthId);
  const mFound = mWeeks.find(w => dateStr >= w.startDate && dateStr <= w.endDate) || mWeeks[0] || {
    weekNumber: 1,
    weekId: `${monthId}-W1`,
    startDate: dateStr,
    endDate: dateStr,
    rangeLabel: dateStr
  };

  return {
    week: mFound,
    weekId: mFound.weekId,
    weekNumber: mFound.weekNumber,
    monthId,
    monthTitle: formatMonthYear(monthId),
    rangeLabel: mFound.rangeLabel,
    startDate: mFound.startDate,
    endDate: mFound.endDate
  };
}

export function getDaysInWeek(startDate, endDate) {
  const days = [];
  const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const startD = parseDate(startDate);
  const endD = parseDate(endDate);
  const canonicalToday = getCanonicalToday();
  const isProgramActive = canonicalToday >= PROGRAM_START_DATE;

  const cur = new Date(startD);
  while (cur <= endD && days.length < 7) {
    const dateStr = formatDateStr(cur);
    const dayOfWeek = cur.getDay();
    days.push({
      date: dateStr,
      dayName: DAY_NAMES[dayOfWeek],
      dayOfWeek,
      displayDate: cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayNumber: cur.getDate(),
      isToday: isProgramActive && (dateStr === canonicalToday)
    });
    cur.setDate(cur.getDate() + 1);
  }

  // Ensure exactly 7 days
  while (days.length < 7) {
    const dateStr = formatDateStr(cur);
    const dayOfWeek = cur.getDay();
    days.push({
      date: dateStr,
      dayName: DAY_NAMES[dayOfWeek],
      dayOfWeek,
      displayDate: cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayNumber: cur.getDate(),
      isToday: isProgramActive && (dateStr === canonicalToday)
    });
    cur.setDate(cur.getDate() + 1);
  }

  return days;
}

export function getTrackingTomorrow(currentDate = getCanonicalToday()) {
  if (currentDate < PROGRAM_START_DATE) return PROGRAM_START_DATE;
  return shiftDate(currentDate, 1);
}

export function getMondayToSundayDays(startDate, endDate) {
  const days = getDaysInWeek(startDate, endDate);
  const ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const orderedDays = [];
  ORDER.forEach(name => {
    const found = days.find(d => d.dayName === name);
    if (found) orderedDays.push(found);
  });
  if (orderedDays.length === 7) return orderedDays;
  return days;
}




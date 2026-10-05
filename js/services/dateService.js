/**
 * AI Study & Task Planner - Dynamic Date Synchronization Service
 * Single Canonical Current Date architecture without hardcoded dates or years.
 * Perfectly handles month boundaries, year boundaries, leap years, and timezones.
 */

export function getDeviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch (e) {
    return 'UTC';
  }
}

let simulatedDate = null;

export function setSimulatedToday(d) {
  simulatedDate = d;
  try {
    if (typeof localStorage !== 'undefined') {
      if (d) {
        localStorage.setItem('study_planner_simulated_date', d);
      } else {
        localStorage.removeItem('study_planner_simulated_date');
      }
    }
  } catch (e) {}
}

export function getCanonicalToday() {
  if (simulatedDate) return simulatedDate;
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('study_planner_simulated_date');
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

export function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  if (parts.length === 2) {
    return new Date(parts[0], parts[1] - 1, 1);
  }
  return new Date();
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

export function formatMonthYear(monthOrDateStr) {
  if (!monthOrDateStr) return '';
  const parts = monthOrDateStr.split('-').map(Number);
  const y = parts[0];
  const m = parts[1] || 1;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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

/**
 * Returns Monday to Sunday for any date, with zero timezone drift.
 */
export function getWeekRange(dateStr) {
  const targetDate = dateStr || getCanonicalToday();
  const d = parseDate(targetDate);
  const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const distToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(d);
  monday.setDate(d.getDate() + distToMonday);

  const days = [];
  const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const canonicalToday = getCanonicalToday();

  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const formatted = formatDateStr(cur);
    days.push({
      dayName: DAY_NAMES[i],
      date: formatted,
      displayDate: cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayNumber: cur.getDate(),
      isToday: formatted === canonicalToday
    });
  }

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startMonth = monday.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
  const startDay = monday.getDate();
  const endDay = sunday.getDate();
  const year = sunday.getFullYear();

  const rangeLabel = startMonth === endMonth
    ? `${startMonth} ${startDay}–${endDay}, ${year}`
    : `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;

  const weekId = `${formatDateStr(monday)}_to_${formatDateStr(sunday)}`;
  const monthId = formatDateStr(monday).substring(0, 7);

  // Approximate week number in year or month
  const firstDayOfYear = new Date(monday.getFullYear(), 0, 1);
  const weekNum = Math.ceil((((monday - firstDayOfYear) / 86400000) + firstDayOfYear.getDay() + 1) / 7);

  return {
    weekId,
    weekNumber: weekNum,
    startDate: formatDateStr(monday),
    endDate: formatDateStr(sunday),
    rangeLabel,
    days,
    monthId
  };
}

/**
 * Returns weeks for any month (YYYY-MM) dynamically.
 */
export function getWeeksInMonth(monthId) {
  if (!monthId || !monthId.includes('-')) {
    const now = getCanonicalToday();
    monthId = now.substring(0, 7);
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

export function getPrevMonthId(monthId) {
  const parts = monthId.split('-').map(Number);
  let y = parts[0];
  let m = parts[1] - 1;
  if (m < 1) {
    m = 12;
    y -= 1;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
}

export function getNextMonthId(monthId) {
  const parts = monthId.split('-').map(Number);
  let y = parts[0];
  let m = parts[1] + 1;
  if (m > 12) {
    m = 1;
    y += 1;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
}

export function getPrevWeekStartDate(currentStartDate) {
  return shiftDate(currentStartDate, -7);
}

export function getNextWeekStartDate(currentStartDate) {
  return shiftDate(currentStartDate, 7);
}

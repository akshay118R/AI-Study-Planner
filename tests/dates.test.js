/**
 * Automated Tests: Dynamic Date Handling
 */

import assert from 'assert';
import {
  getCanonicalToday,
  shiftDate,
  parseDate,
  formatDateStr,
  getWeekRange,
  getWeeksInMonth,
  getPrevMonthId,
  getNextMonthId
} from '../js/services/dateService.js';

export function runDateTests() {
  console.log('--- Running Date Tests ---');

  // Test 1: Today, Tomorrow, Previous Day
  {
    const today = getCanonicalToday();
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(today), 'Today must be YYYY-MM-DD');

    const tomorrow = shiftDate(today, 1);
    const yesterday = shiftDate(today, -1);
    assert.notStrictEqual(today, tomorrow);
    assert.notStrictEqual(today, yesterday);
    assert.strictEqual(shiftDate(yesterday, 1), today);
    assert.strictEqual(shiftDate(tomorrow, -1), today);
    console.log('✓ Today, tomorrow, yesterday shifting verified');
  }

  // Test 2: Month Boundary (e.g. Oct 31 -> Nov 1)
  {
    const oct31 = '2026-10-31';
    const nov1 = shiftDate(oct31, 1);
    assert.strictEqual(nov1, '2026-11-01', 'Oct 31 + 1 day must be Nov 01');

    const backToOct = shiftDate(nov1, -1);
    assert.strictEqual(backToOct, '2026-10-31', 'Nov 01 - 1 day must be Oct 31');
    console.log('✓ Month boundary shifting verified');
  }

  // Test 3: Year Boundary (e.g. Dec 31 -> Jan 1)
  {
    const dec31 = '2026-12-31';
    const jan1 = shiftDate(dec31, 1);
    assert.strictEqual(jan1, '2027-01-01', 'Dec 31 + 1 day must be Jan 01 of next year');

    const backToDec = shiftDate(jan1, -1);
    assert.strictEqual(backToDec, '2026-12-31', 'Jan 01 - 1 day must be Dec 31 of prior year');
    console.log('✓ Year boundary shifting verified');
  }

  // Test 4: Leap Year (2028 is a leap year; 2027 is not)
  {
    const leapFeb28 = '2028-02-28';
    const leapFeb29 = shiftDate(leapFeb28, 1);
    assert.strictEqual(leapFeb29, '2028-02-29', '2028-02-28 + 1 day must be 2028-02-29 in leap year');

    const leapMar1 = shiftDate(leapFeb29, 1);
    assert.strictEqual(leapMar1, '2028-03-01', '2028-02-29 + 1 day must be 2028-03-01');

    // Non-leap year check (2027)
    const nonLeapFeb28 = '2027-02-28';
    const nonLeapMar1 = shiftDate(nonLeapFeb28, 1);
    assert.strictEqual(nonLeapMar1, '2027-03-01', '2027-02-28 + 1 day must be 2027-03-01 in non-leap year');
    console.log('✓ Leap year and non-leap year boundaries verified');
  }

  // Test 5: Week Range Monday to Sunday
  {
    // 2026-10-07 is Wednesday -> Week is Mon 2026-10-05 to Sun 2026-10-11
    const week = getWeekRange('2026-10-07');
    assert.strictEqual(week.startDate, '2026-10-05', 'Monday must be 2026-10-05');
    assert.strictEqual(week.endDate, '2026-10-11', 'Sunday must be 2026-10-11');
    assert.strictEqual(week.days.length, 7, 'Must have exactly 7 days');
    assert.strictEqual(week.days[0].dayName, 'MON');
    assert.strictEqual(week.days[6].dayName, 'SUN');
    console.log('✓ Monday to Sunday week range verified');
  }

  // Test 6: Weeks in Month
  {
    const weeks = getWeeksInMonth('2026-10');
    assert.ok(weeks.length >= 4 && weeks.length <= 6, 'A month should contain 4 to 6 weeks');
    assert.strictEqual(weeks[0].startDate, '2026-10-01', 'First week starts on 1st of month');
    console.log('✓ Weeks in month generation verified');
  }

  // Test 7: Prev / Next Month IDs
  {
    assert.strictEqual(getPrevMonthId('2027-01'), '2026-12');
    assert.strictEqual(getNextMonthId('2026-12'), '2027-01');
    assert.strictEqual(getNextMonthId('2026-05'), '2026-06');
    assert.strictEqual(getPrevMonthId('2026-06'), '2026-05');
    console.log('✓ Month ID navigation across year boundaries verified');
  }

  console.log('✓ All Date Tests Passed!\n');
}

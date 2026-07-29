import { ChampionEntry, HistoryMatrixRow, CalendarEvent, UniverseTime } from '../types';

export const UNIVERSE_MONTH_DAYS: Record<string, number> = {
  May: 31,
  June: 30,
  July: 31,
  August: 31,
  September: 30,
  October: 31,
  November: 30,
  December: 31,
  January: 31,
  February: 28,
  March: 31,
  April: 30,
};

export const UNIVERSE_MONTH_ORDER = [
  'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April'
];

export const UNIVERSE_WEEKS = [
  'Day 1 (Start of Month - 0d)',
  'Day 7 (PLE / W2 - 7d)',
  'Day 14 (PLE / W3 - 14d)',
  'Day 21 (PLE / W4 - 21d)',
  'Day 28 (PLE / W5 - 28d)',
  'Day 30/31 (Month End - 30d)'
];

export const getUniverseTotalDays = (year: number, month: string, week: string): number => {
  const weekDayOffset: Record<string, number> = {
    'Week 1': 0,
    'Day 1 (Start of Month - 0d)': 0,
    'Day 1 (Start of Month)': 0,
    'Week 2': 7,
    'Day 7 (PLE / W2 - 7d)': 7,
    'Day 7 (PLE / Week 2)': 7,
    'Week 3': 14,
    'Day 14 (PLE / W3 - 14d)': 14,
    'Day 14 (PLE / Week 3)': 14,
    'Week 4': 21,
    'Day 21 (PLE / W4 - 21d)': 21,
    'Day 21 (PLE / Week 4)': 21,
    'Week 5': 28,
    'Day 28 (PLE / W5 - 28d)': 28,
    'Day 28 (PLE / Week 5)': 28,
    'Month End': 30,
    'Day 30/31 (Month End - 30d)': 30,
    'Day 30/31 (Month End)': 30,
  };

  let total = (Math.max(1, year) - 1) * 365;
  for (const m of UNIVERSE_MONTH_ORDER) {
    if (m === month) break;
    total += UNIVERSE_MONTH_DAYS[m] || 30;
  }
  total += (weekDayOffset[week] ?? 0);
  return total;
};

// Current Game Universe Date: Year 2, May, Day 14 (1 year finished, now in Yr 2 May Day 14)
export const CURRENT_UNIVERSE_YEAR = 2;
export const CURRENT_UNIVERSE_MONTH = 'May';
export const CURRENT_UNIVERSE_WEEK = UNIVERSE_WEEKS[2];

export const calculateDaysBetween = (
  sinceYear: number,
  sinceMonth: string,
  sinceWeek: string,
  currYear: number = CURRENT_UNIVERSE_YEAR,
  currMonth: string = CURRENT_UNIVERSE_MONTH,
  currWeek: string = CURRENT_UNIVERSE_WEEK
): number => {
  const startDays = getUniverseTotalDays(sinceYear, sinceMonth, sinceWeek);
  const endDays = getUniverseTotalDays(currYear, currMonth, currWeek);
  return Math.max(0, endDays - startDays);
};

export interface ParsedUniverseDate {
  year: number;
  month: string;
  week: string;
}

export const parseAcquiredDate = (acquiredDate?: string): ParsedUniverseDate => {
  if (!acquiredDate || !acquiredDate.includes('|')) {
    return { year: 1, month: 'May', week: UNIVERSE_WEEKS[0] };
  }
  const parts = acquiredDate.split('|');
  const yearStr = parts[0].replace(/[^0-9]/g, '');
  const year = parseInt(yearStr) || 1;
  const month = UNIVERSE_MONTH_ORDER.includes(parts[1]) ? parts[1] : 'May';
  let week = parts[2] || UNIVERSE_WEEKS[0];
  if (week === 'Week 1' || week.includes('Day 1')) week = UNIVERSE_WEEKS[0];
  else if (week === 'Week 2' || week.includes('Day 7')) week = UNIVERSE_WEEKS[1];
  else if (week === 'Week 3' || week.includes('Day 14')) week = UNIVERSE_WEEKS[2];
  else if (week === 'Week 4' || week.includes('Day 21')) week = UNIVERSE_WEEKS[3];
  else if (week === 'Week 5' || week.includes('Day 28')) week = UNIVERSE_WEEKS[4];
  else if (week.includes('Month End') || week.includes('Day 30')) week = UNIVERSE_WEEKS[5];
  else if (!UNIVERSE_WEEKS.includes(week)) week = UNIVERSE_WEEKS[0];
  return { year, month, week };
};

export const formatAcquiredDate = (year: number, month: string, week: string): string => {
  return `Year ${year}|${month}|${week}`;
};

export const getDisplayAcquiredDate = (acquiredDate?: string): string => {
  const { year, month, week } = parseAcquiredDate(acquiredDate);
  let shortWeek = 'Day 1';
  if (week.includes('Day 1')) shortWeek = 'Day 1';
  else if (week.includes('Day 7')) shortWeek = 'Day 7 (PLE)';
  else if (week.includes('Day 14')) shortWeek = 'Day 14 (PLE)';
  else if (week.includes('Day 21')) shortWeek = 'Day 21 (PLE)';
  else if (week.includes('Day 28')) shortWeek = 'Day 28 (PLE)';
  else if (week.includes('Month End') || week.includes('Day 30')) shortWeek = 'Month End';
  return `Yr ${year} • ${month} (${shortWeek})`;
};

const TITLE_TO_MATRIX_PATH: Record<string, (row: HistoryMatrixRow) => string | undefined> = {
  'World Heavyweight Championship': (r) => r.champions?.['c-raw-whc'] || r.raw?.whc,
  'Men\'s Intercontinental Championship': (r) => r.champions?.['c-raw-ic'] || r.raw?.ic,
  'World Tag Team Championship': (r) => r.champions?.['c-raw-tag'] || r.raw?.tag,
  'Women\'s World Championship': (r) => r.champions?.['c-raw-wwc'] || r.raw?.wwc,
  'Women\'s Intercontinental Championship': (r) => r.champions?.['c-raw-wic'] || r.raw?.wic,
  'Undisputed WWE Championship': (r) => r.champions?.['c-sd-und'] || r.sd?.und,
  'Men\'s United States Championship': (r) => r.champions?.['c-sd-us'] || r.sd?.us,
  'WWE Tag Team Championship': (r) => r.champions?.['c-sd-tag'] || r.sd?.tag,
  'WWE Women\'s Championship': (r) => r.champions?.['c-sd-wwe'] || r.sd?.wwe,
  'Women\'s United States Championship': (r) => r.champions?.['c-sd-wus'] || r.sd?.wus,
  'NXT Championship': (r) => r.champions?.['c-nxt-nxt'] || r.nxt?.nxt,
  'Men\'s NXT NA Championship': (r) => r.champions?.['c-nxt-na'] || r.nxt?.na,
  'NXT Tag Team Championship': (r) => r.champions?.['c-nxt-tag'] || r.nxt?.tag,
  'NXT Women\'s Championship': (r) => r.champions?.['c-nxt-wnxt'] || r.nxt?.wnxt,
  'Women\'s NXT NA Championship': (r) => r.champions?.['c-nxt-wna'] || r.nxt?.wna,
  'WWE Women\'s Tag Team Championship': (r) => r.champions?.['c-joint-wtag'] || r.joint?.wtag,
};

export const calculateChampionsReign = (
  champions: ChampionEntry[],
  historyMatrix: HistoryMatrixRow[],
  emptyMatrix: HistoryMatrixRow[],
  calendarEvents: CalendarEvent[],
  currentTime: UniverseTime
): ChampionEntry[] => {
  const allHistory = [...(historyMatrix || []), ...(emptyMatrix || [])];
  if (allHistory.length === 0) return champions;

  // Determine the Year, Month, Week for each row in the combined chronological history
  let year = 1; // Assumed start year for historyMatrix
  let prevMonthIdx = -1;

  const chronologicalRows = allHistory.map((row) => {
    const monthIdx = UNIVERSE_MONTH_ORDER.indexOf(row.month);
    if (prevMonthIdx !== -1 && monthIdx < prevMonthIdx) {
      year++;
    }
    prevMonthIdx = monthIdx >= 0 ? monthIdx : prevMonthIdx;

    let week = UNIVERSE_WEEKS[1]; // default to Day 7
    const pleName = row.mainPle || row.nxtPle || '';
    if (pleName) {
      const event = calendarEvents.find(e => e.eventName === pleName && e.month === row.month);
      if (event && event.date) {
        week = event.date;
      }
    }
    return { ...row, calcYear: year, calcWeek: week };
  });

  const currentTotalDays = getUniverseTotalDays(currentTime.year, currentTime.month, currentTime.week);

  return champions.map(champ => {
    const getter = TITLE_TO_MATRIX_PATH[champ.titleName];
    if (!getter) return { ...champ, daysHeld: 0 };

    let currentChampName = '';
    let currentChampAcquired = { year: 1, month: 'May', week: UNIVERSE_WEEKS[0] };
    
    let prevChampName = '';
    let prevChampAcquired = { year: 1, month: 'May', week: UNIVERSE_WEEKS[0] };
    let prevChampDays = 0;

    for (const row of chronologicalRows) {
      // If this row is in the future relative to currentTime, stop processing
      const rowTotalDays = getUniverseTotalDays(row.calcYear, row.month, row.calcWeek);
      if (rowTotalDays > currentTotalDays) {
        break;
      }

      const champInRow = getter(row)?.trim();
      
      // If we see a valid champion name and it's different from the current
      if (champInRow && champInRow.toLowerCase() !== currentChampName.toLowerCase()) {
        if (currentChampName !== '') {
          prevChampName = currentChampName;
          prevChampDays = calculateDaysBetween(
            currentChampAcquired.year, currentChampAcquired.month, currentChampAcquired.week,
            row.calcYear, row.month, row.calcWeek
          );
        }

        currentChampName = champInRow;
        currentChampAcquired = { year: row.calcYear, month: row.month, week: row.calcWeek };
      }
    }

    let currentDaysHeld = 0;
    if (currentChampName) {
      currentDaysHeld = calculateDaysBetween(
        currentChampAcquired.year, currentChampAcquired.month, currentChampAcquired.week,
        currentTime.year, currentTime.month, currentTime.week
      );
    }

    let prevChampString = champ.previousChampion;
    if (prevChampName) {
      prevChampString = `${prevChampName} (${prevChampDays} Days)`;
    }

    return {
      ...champ,
      currentChampion: currentChampName || champ.currentChampion,
      previousChampion: prevChampString,
      daysHeld: currentDaysHeld,
      acquiredDate: formatAcquiredDate(currentChampAcquired.year, currentChampAcquired.month, currentChampAcquired.week)
    };
  });
};

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

export const UNIVERSE_WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

export const getUniverseTotalDays = (year: number, month: string, week: string): number => {
  const weekDayOffset: Record<string, number> = {
    'Week 1': 0,
    'Week 2': 7,
    'Week 3': 14,
    'Week 4': 21,
  };

  let total = (Math.max(1, year) - 1) * 365;
  for (const m of UNIVERSE_MONTH_ORDER) {
    if (m === month) break;
    total += UNIVERSE_MONTH_DAYS[m] || 30;
  }
  total += (weekDayOffset[week] ?? 0);
  return total;
};

// Current Game Universe Date: Year 2, May, Week 3 (1 year finished, now in Yr 2 May W3)
export const CURRENT_UNIVERSE_YEAR = 2;
export const CURRENT_UNIVERSE_MONTH = 'May';
export const CURRENT_UNIVERSE_WEEK = 'Week 3';

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
    return { year: 1, month: 'May', week: 'Week 1' };
  }
  const parts = acquiredDate.split('|');
  const yearStr = parts[0].replace(/[^0-9]/g, '');
  const year = parseInt(yearStr) || 1;
  const month = UNIVERSE_MONTH_ORDER.includes(parts[1]) ? parts[1] : 'May';
  const week = UNIVERSE_WEEKS.includes(parts[2]) ? parts[2] : 'Week 1';
  return { year, month, week };
};

export const formatAcquiredDate = (year: number, month: string, week: string): string => {
  return `Year ${year}|${month}|${week}`;
};

export const getDisplayAcquiredDate = (acquiredDate?: string): string => {
  const { year, month, week } = parseAcquiredDate(acquiredDate);
  const shortWeek = week.replace('Week ', 'W');
  return `Yr ${year} • ${month} (${shortWeek})`;
};

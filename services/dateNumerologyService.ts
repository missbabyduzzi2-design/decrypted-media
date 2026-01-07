
import { type DateSpanAnalysis, type EntityChronology, type DayCountRow } from '../types';

export interface DateNumerologyResult {
    fullDate: { sum: number; reduced: number };
    monthDay: { sum: number; reduced: number };
    year: { sum: number; reduced: number };
}

// Specific control numbers for the Chronology section
const CHRONOLOGY_CONTROL_NUMBERS = [33, 56, 84, 113, 171, 201, 223, 322, 911];

// Fixed Ritual Dates (Month-Day)
const RITUAL_DATES = [
    { name: "Skull & Bones (322)", month: 3, day: 22 },
    { name: "Ignatius Loyola Birth", month: 10, day: 23 }, // Jesuit Founder
    { name: "Jesuit Founding", month: 8, day: 15 },
    { name: "Pope Francis Birth", month: 12, day: 17 },
    { name: "May Day (Illuminati)", month: 5, day: 1 },
    { name: "9/11 Ritual", month: 9, day: 11 },
    { name: "Halloween/Reformation", month: 10, day: 31 },
    { name: "Christmas", month: 12, day: 25 },
    { name: "Spring Equinox", month: 3, day: 20 }, // Approx
    { name: "Summer Solstice", month: 6, day: 21 }, // Approx
    { name: "Autumn Equinox", month: 9, day: 22 }, // Approx
    { name: "Winter Solstice", month: 12, day: 21 }, // Approx
    { name: "Balfour Declaration", month: 11, day: 2 },
    { name: "Hiroshima", month: 8, day: 6 },
];

// Reduces a number to a single digit, respecting master numbers 11, 22, 33.
const reduceNumber = (num: number): { sum: number, reduced: number } => {
  const originalSum = num;
  let currentNum = num;

  while (currentNum > 9) {
    if (currentNum === 11 || currentNum === 22 || currentNum === 33) {
      break;
    }
    currentNum = String(currentNum).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  
  return { sum: originalSum, reduced: currentNum };
};

const sumDigitsFromString = (str: string): number => {
    return str.split('').reduce((acc, char) => {
        const digit = parseInt(char, 10);
        return isNaN(digit) ? acc : acc + digit;
    }, 0);
};

export const calculateDateNumerology = (text: string): DateNumerologyResult | null => {
  if (!/\d/.test(text)) {
    return null;
  }
  
  const date = new Date(text);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  const day = date.getDate();
  const month = date.getMonth() + 1; // 0-indexed
  const year = date.getFullYear();

  const fullSum = sumDigitsFromString(String(month)) + sumDigitsFromString(String(day)) + sumDigitsFromString(String(year));
  const monthDaySum = sumDigitsFromString(String(month)) + sumDigitsFromString(String(day));
  const yearSum = sumDigitsFromString(String(year));

  return {
    fullDate: reduceNumber(fullSum),
    monthDay: reduceNumber(monthDaySum),
    year: reduceNumber(yearSum),
  };
};

// Recursive digit sum (e.g. 20605 -> 13 -> 4)
export const getDigitSum = (num: number): number => {
    let sum = num;
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        sum = String(sum).split('').reduce((acc, curr) => acc + parseInt(curr), 0);
    }
    return sum;
};

// Zero dropping (e.g. 20605 -> 265)
export const getZeroDroppedValue = (num: number): number => {
    const s = String(num).replace(/0/g, '');
    return parseInt(s, 10) || 0;
};

export const checkControlMatch = (val: number): boolean => {
    return CHRONOLOGY_CONTROL_NUMBERS.includes(val);
};

export const calculateDateSpan = (date1Str: string, date2Str: string): DateSpanAnalysis | null => {
    const d1 = new Date(date1Str);
    const d2 = new Date(date2Str);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate Y/M/D components (Approximate)
    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    let days = d2.getDate() - d1.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    
    if (d1 > d2) {
         // Normalize to ensure positive calculations if needed, or handle negative
         // For day counts we usually want absolute magnitude
    }

    const digitSum = getDigitSum(totalDays);
    const zeroDropped = getZeroDroppedValue(totalDays);
    
    const matchTotal = checkControlMatch(totalDays);
    const matchReduced = checkControlMatch(digitSum);
    const matchZero = checkControlMatch(zeroDropped);

    return {
        totalDays,
        years,
        months,
        days,
        digitSum,
        zeroDropped,
        isControlMatch: matchTotal || matchReduced || matchZero,
        controlMatchValue: matchTotal ? totalDays : (matchZero ? zeroDropped : (matchReduced ? digitSum : undefined))
    };
};

export const generateDayCountTable = (entities: EntityChronology[], articleDate: string): DayCountRow[] => {
    const rows: DayCountRow[] = [];
    
    const articleD = new Date(articleDate);
    const hasArticleDate = !isNaN(articleD.getTime());

    // Identify any astronomical entities explicitly found (e.g. "Next Solar Eclipse")
    const eclipseEntity = entities.find(e => e.entityType === 'Astronomical' && (e.entityName.includes('Eclipse') || e.entityName.includes('Moon')));
    const eclipseDate = eclipseEntity?.events[0]?.dateValue;

    entities.forEach(entity => {
        
        // 1. Intra-Entity Analysis: Birth -> Death / Founding -> Event
        const birthEvent = entity.events.find(e => e.dateType.toLowerCase().includes('birth') || e.dateType.toLowerCase().includes('founding'));
        const deathEvent = entity.events.find(e => e.dateType.toLowerCase().includes('death'));

        if (birthEvent && deathEvent) {
             addComparisonRows(rows, birthEvent.dateValue, deathEvent.dateValue, `${entity.entityName}: Birth → Death`);
        }

        // 2. Event Analysis
        entity.events.forEach(event => {
            if (!event.dateValue) return;

            // Compare to Article Date
            if (hasArticleDate) {
                 // Prevent duplicate if article date is same as event date
                 if (event.dateValue !== articleDate) {
                    addComparisonRows(rows, event.dateValue, articleDate, `${entity.entityName} (${event.dateType}) → Article`);
                 }
            }

            // Compare to Eclipse (if exists and isn't self)
            if (eclipseDate && entity !== eclipseEntity) {
                addComparisonRows(rows, event.dateValue, eclipseDate, `${entity.entityName} → Next Eclipse`);
            }

            // Compare to Ritual Dates
            // We check the year of the event, and potentially the year of the article to catch syncs
            const yearsToCheck = new Set<number>();
            const eventYear = new Date(event.dateValue).getFullYear();
            if (!isNaN(eventYear)) yearsToCheck.add(eventYear);
            if (hasArticleDate) yearsToCheck.add(articleD.getFullYear());

            yearsToCheck.forEach(year => {
                RITUAL_DATES.forEach(ritual => {
                    // Construct ritual date for that year
                    const ritualDateStr = `${year}-${String(ritual.month).padStart(2, '0')}-${String(ritual.day).padStart(2, '0')}`;
                    addComparisonRows(rows, event.dateValue, ritualDateStr, `${entity.entityName} → ${ritual.name} (${year})`);
                });
            });
        });
    });

    // Sort rows: Matches first, then descending by day count
    return rows.sort((a, b) => {
        if (a.isControlMatch && !b.isControlMatch) return -1;
        if (!a.isControlMatch && b.isControlMatch) return 1;
        return 0; // Keep generation order or sort by count
    });
};

const addComparisonRows = (rows: DayCountRow[], d1Str: string, d2Str: string, label: string) => {
    const d1 = new Date(d1Str);
    const d2 = new Date(d2Str);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return;
    if (d1.getTime() === d2.getTime()) return; // Skip same day

    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const totalDaysExclusive = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalDaysInclusive = totalDaysExclusive + 1;

    // Limit max days to prevent noise (e.g. < 100 years ~ 36500 days) unless it's a direct hit
    if (totalDaysExclusive > 40000) {
        // Optimization: only process very long spans if they hit a control number
        // But for now, process all for completeness as requested
    }

    // Process Exclusive
    processSingleCount(rows, label, d1Str, d2Str, totalDaysExclusive, false);
    // Process Inclusive
    processSingleCount(rows, label, d1Str, d2Str, totalDaysInclusive, true);
};

const processSingleCount = (rows: DayCountRow[], label: string, start: string, end: string, count: number, inclusive: boolean) => {
    const digitSum = getDigitSum(count);
    const zeroDropped = getZeroDroppedValue(count);
    
    const matchRaw = checkControlMatch(count);
    const matchSum = checkControlMatch(digitSum);
    const matchZero = checkControlMatch(zeroDropped);
    
    let matchNote = '';
    let isMatch = false;

    if (matchRaw) {
        matchNote = `${count}`;
        isMatch = true;
    } else if (matchZero) {
        matchNote = `${zeroDropped} (Zero Drop)`;
        isMatch = true;
    } else if (matchSum) {
        matchNote = `${digitSum} (Sum)`;
        isMatch = true;
    }

    // Only add non-matches if requested or keep all? 
    // Requirement says "write every total — even when no control numbers hit."
    rows.push({
        comparison: label,
        startDate: start,
        endDate: end,
        dayCount: count,
        isInclusive: inclusive,
        digitSum,
        zeroDropped,
        isControlMatch: isMatch,
        controlMatchValue: matchNote,
        notes: isMatch ? `Sync: ${matchNote}` : ''
    });
};

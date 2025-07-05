// src/utils/dateUrls.ts
import { parseDate } from './timezone';

/**
 * Convert a date string (YYYY-MM-DD) to URL path segments
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Object with year, month, day for URL construction
 */
export function dateToUrlSegments(dateString: string): { year: string; month: string; day: string } {
  const date = parseDate(dateString);
  return {
    year: date.getFullYear().toString(),
    month: (date.getMonth() + 1).toString().padStart(2, '0'),
    day: date.getDate().toString().padStart(2, '0'),
  };
}

/**
 * Convert URL path segments to date string
 * @param year - Year as string
 * @param month - Month as string (1-12, padded or not)
 * @param day - Day as string (1-31, padded or not)
 * @returns Date string in YYYY-MM-DD format, or null if invalid
 */
export function urlSegmentsToDate(year: string, month: string, day: string): string | null {
  // Basic validation
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);

  // Check ranges
  if (yearNum < 2020 || yearNum > 2030) return null;
  if (monthNum < 1 || monthNum > 12) return null;
  if (dayNum < 1 || dayNum > 31) return null;

  // Format to YYYY-MM-DD
  const formattedDate = `${yearNum}-${monthNum.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
  
  // Validate the date actually exists (e.g., not Feb 30)
  try {
    const testDate = parseDate(formattedDate);
    // Check if the parsed date matches our input (catches invalid dates like Feb 30)
    if (testDate.getFullYear() !== yearNum || 
        testDate.getMonth() + 1 !== monthNum || 
        testDate.getDate() !== dayNum) {
      return null;
    }
    return formattedDate;
  } catch {
    return null;
  }
}

/**
 * Generate clean URL path for a workout date
 * @param dateString - Date in YYYY-MM-DD format
 * @returns URL path like "/2025/07/05"
 */
export function generateWorkoutUrl(dateString: string): string {
  const segments = dateToUrlSegments(dateString);
  return `/${segments.year}/${segments.month}/${segments.day}`;
}

/**
 * Check if a date string is valid
 * @param dateString - Date in YYYY-MM-DD format
 * @returns boolean indicating if date is valid
 */
export function isValidDateString(dateString: string): boolean {
  try {
    const date = parseDate(dateString);
    // Check if the date string matches the parsed date (prevents invalid dates)
    const reformatted = date.toISOString().split('T')[0];
    return reformatted === dateString;
  } catch {
    return false;
  }
}
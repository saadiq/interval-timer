import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const DEFAULT_TIMEZONE = 'America/New_York';

/**
 * Get the user's timezone, falling back to the default if not available
 */
export function getUserTimezone(): string {
  if (typeof window !== 'undefined' && window.Intl) {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      console.warn('Could not determine user timezone:', e);
    }
  }
  return DEFAULT_TIMEZONE;
}

/**
 * Convert a date string or Date object to a Date object
 */
function toDateObject(date: Date | string): Date {
  if (date instanceof Date) {
    return date;
  }
  // YYYY-MM-DD format uses parseDate for consistent handling
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return parseDate(date);
  }
  return new Date(date);
}

/**
 * Format a date in the user's timezone
 */
export function formatInTimezone(date: Date | string, formatStr: string): string {
  return format(toDateObject(date), formatStr);
}

/**
 * Get today's date in YYYY-MM-DD format in the user's timezone
 *
 * IMPORTANT: This returns the date at 00:00:00 in the user's timezone,
 * which ensures consistent date handling across the application.
 */
export function getLocalDate(): string {
  // Get the current date in the user's timezone
  const timezone = getUserTimezone();

  // Create a new date object for the current time
  const now = new Date();

  // Get the current date components in the user's timezone
  const zonedDate = toZonedTime(now, timezone);

  // Extract year, month, day in the user's timezone
  const year = zonedDate.getFullYear();
  const month = zonedDate.getMonth() + 1; // JavaScript months are 0-indexed
  const day = zonedDate.getDate();

  // Format as YYYY-MM-DD
  const localDate = `${year}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;

  return localDate;
}

/**
 * Parse a date string (YYYY-MM-DD) and create a Date object that represents
 * that exact date, regardless of the user's timezone.
 *
 * This is crucial for displaying dates consistently across the application.
 */
export function parseDate(dateString: string): Date {
  // Parse the date string
  const [year, month, day] = dateString.split('-').map(Number);

  // Create a date object for this date in the user's timezone

  // Create a new date object with the local year, month, day at 12:00 noon
  // Using noon helps avoid any potential timezone-related date shifting
  const date = new Date(year, month - 1, day, 12, 0, 0);

  return date;
}

/**
 * Format a date with optional timezone indicator
 */
export function formatDateWithTimezone(
  date: Date | string,
  formatStr: string = 'MMMM d, yyyy',
  showTimezone: boolean = false
): string {
  const dateObj = toDateObject(date);
  const formattedDate = format(dateObj, formatStr);

  if (!showTimezone) {
    return formattedDate;
  }

  // Get timezone abbreviation
  const tzAbbr = dateObj.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ')[2];

  return `${formattedDate} (${tzAbbr})`;
}

import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

// Default timezone - can be overridden by user preference
const DEFAULT_TIMEZONE = "America/New_York";

/**
 * Get the user's timezone, falling back to the default if not available
 */
export function getUserTimezone(): string {
  // In browser environments, try to get the user's timezone
  if (typeof window !== "undefined" && window.Intl) {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return timezone;
    } catch (e) {
      console.warn("Could not determine user timezone:", e);
    }
  }

  // Fall back to default timezone
  return DEFAULT_TIMEZONE;
}

/**
 * Format a date in the user's timezone
 */
export function formatInTimezone(
  date: Date | string,
  formatStr: string
): string {

  let dateObj: Date;

  // Handle different date input formats
  if (typeof date === "string") {
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // If it's a YYYY-MM-DD string, use our parseDate function
      dateObj = parseDate(date);
    } else {
      // Otherwise, use the standard Date constructor
      dateObj = new Date(date);
    }
  } else {
    // If it's already a Date object, use it directly
    dateObj = date;
  }

  // Format the date according to the specified format
  const formattedDate = format(dateObj, formatStr);

  return formattedDate;
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
  const localDate = `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;

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
  const [year, month, day] = dateString.split("-").map(Number);

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
  formatStr: string = "MMMM d, yyyy",
  showTimezone: boolean = false
): string {

  let dateObj: Date;

  // Handle different date input formats
  if (typeof date === "string") {
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // If it's a YYYY-MM-DD string, use our parseDate function
      dateObj = parseDate(date);
    } else {
      // Otherwise, use the standard Date constructor
      dateObj = new Date(date);
    }
  } else {
    // If it's already a Date object, use it directly
    dateObj = date;
  }

  // Format the date according to the specified format
  const formattedDate = format(dateObj, formatStr);

  // Add timezone indicator if requested
  if (showTimezone) {
    // Get timezone abbreviation
    const tzAbbr = dateObj
      .toLocaleTimeString("en-US", { timeZoneName: "short" })
      .split(" ")[2];

    return `${formattedDate} (${tzAbbr})`;
  }

  return formattedDate;
}

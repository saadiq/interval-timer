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
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
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
  const timezone = getUserTimezone();
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const zonedDate = toZonedTime(dateObj, timezone);
  return format(zonedDate, formatStr);
}

/**
 * Get today's date in YYYY-MM-DD format in the user's timezone
 */
export function getLocalDate(): string {
  return formatInTimezone(new Date(), "yyyy-MM-dd");
}

/**
 * Format a date with optional timezone indicator
 */
export function formatDateWithTimezone(
  date: Date | string,
  formatStr: string = "MMMM d, yyyy",
  showTimezone: boolean = false
): string {
  const timezone = getUserTimezone();
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const zonedDate = toZonedTime(dateObj, timezone);

  if (!showTimezone) {
    return format(zonedDate, formatStr);
  }

  // Get timezone abbreviation
  const tzAbbr = zonedDate
    .toLocaleTimeString("en-US", { timeZoneName: "short" })
    .split(" ")[2];

  return `${format(zonedDate, formatStr)} (${tzAbbr})`;
}

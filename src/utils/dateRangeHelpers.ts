/**
 * Standardized date range helpers for report filtering
 * Ensures consistent date handling across all report pages
 */

export type Period = "day" | "week" | "month" | "year";

/**
 * Get date range for a given period
 * Returns ISO string dates in local timezone
 * @param period - The period type (day, week, month, year)
 * @returns Object with from and to ISO date strings
 */
export function getDateRange(period: Period): { from: string; to: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  // Helper to create start of day (00:00:00.000)
  const startOfDay = (y: number, m: number, d: number) =>
    new Date(y, m, d, 0, 0, 0, 0);

  // Helper to create end of day (23:59:59.999)
  const endOfDay = (y: number, m: number, d: number) =>
    new Date(y, m, d, 23, 59, 59, 999);

  let fromDate: Date;
  let toDate: Date = endOfDay(year, month, date); // End of today

  switch (period) {
    case "day":
      fromDate = startOfDay(year, month, date);
      break;
    case "week":
      // Current work week, Monday through today (capped at Friday).
      const dayOfWeek = new Date(year, month, date).getDay();
      const daysSinceMonday = (dayOfWeek + 6) % 7;
      fromDate = startOfDay(year, month, date - daysSinceMonday);
      const fridayDate = date - daysSinceMonday + 4;
      const lastReachedWeekday = Math.min(date, fridayDate);
      toDate = endOfDay(year, month, lastReachedWeekday);
      break;
    case "month":
      // From first day of current month
      fromDate = startOfDay(year, month, 1);
      break;
    case "year":
      // From first day of current year
      fromDate = startOfDay(year, 0, 1);
      break;
  }

  return {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  };
}

/**
 * Create custom date range from date strings (YYYY-MM-DD format)
 * Ensures consistent time handling (start of from date to end of to date)
 * @param fromDate - Start date string (YYYY-MM-DD)
 * @param toDate - End date string (YYYY-MM-DD)
 * @returns Object with from and to ISO date strings, or null if invalid
 */
export function getCustomDateRange(
  fromDate: string,
  toDate: string,
): { from: string; to: string } | null {
  if (!fromDate || !toDate) return null;

  try {
    // Parse dates (assumes YYYY-MM-DD format from date input)
    const [fromY, fromM, fromD] = fromDate.split("-").map(Number);
    const [toY, toM, toD] = toDate.split("-").map(Number);

    // Create dates in local timezone
    const from = new Date(fromY, fromM - 1, fromD, 0, 0, 0, 0);
    const to = new Date(toY, toM - 1, toD, 23, 59, 59, 999);

    // Validate dates
    if (isNaN(from.getTime()) || isNaN(to.getTime())) return null;
    if (from > to) return null;

    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Period options for UI tabs
 */
export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "day", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

/**
 * Format date for display
 * @param date - Date string or Date object
 * @param format - Format type ('short' | 'long' | 'numeric')
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  format: "short" | "long" | "numeric" = "short",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  const options: Intl.DateTimeFormatOptions =
    format === "long"
      ? { day: "numeric", month: "long", year: "numeric" }
      : format === "numeric"
        ? { day: "2-digit", month: "2-digit", year: "numeric" }
        : { day: "2-digit", month: "short", year: "numeric" };

  return d.toLocaleDateString("en-RW", options);
}

/**
 * Check if a date is within a range
 * @param date - Date to check
 * @param from - Start of range
 * @param to - End of range
 * @returns True if date is within range
 */
export function isDateInRange(
  date: string | Date,
  from: string | Date,
  to: string | Date,
): boolean {
  const d = new Date(date);
  const f = new Date(from);
  const t = new Date(to);

  if (isNaN(d.getTime()) || isNaN(f.getTime()) || isNaN(t.getTime())) {
    return false;
  }

  return d >= f && d <= t;
}

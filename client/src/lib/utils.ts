import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get initials from a name (first 2 letters)
 * Example: "John Doe" -> "JD"
 */
export function getInitials(name: string): string {
  if (!name) return "U";
  
  const parts = name.split(" ");
  if (parts.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format date for consistent display across the application
 * @param date Date object or string
 * @param formatStr Optional format string, defaults to "MMM d, yyyy"
 * @returns Formatted date string, or "Invalid date" if input is invalid
 */
export function formatDateForDisplay(date: Date | string | null, formatStr = "MMM d, yyyy"): string {
  if (!date) return "N/A";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (!isValid(dateObj)) {
    return "Invalid date";
  }
  
  return format(dateObj, formatStr);
}

/**
 * Truncate a string to a specified length and add ellipsis
 * @param str String to truncate
 * @param length Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export function truncateText(str: string, length: number): string {
  if (!str) return "";
  if (str.length <= length) return str;
  
  return str.substring(0, length) + "...";
}

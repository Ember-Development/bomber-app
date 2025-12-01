/**
 * Formats an age group string from "U8", "U10" format to "8U", "10U" format
 * - Converts "U8" to "8U"
 * - Converts "U10" to "10U"
 * - Handles already formatted strings (returns as-is)
 * - Returns original string if pattern doesn't match
 */
export function formatAgeGroup(ageGroup: string | null | undefined): string {
  if (!ageGroup) return '';

  // Trim whitespace
  const trimmed = ageGroup.trim();

  // Check if it's already in the correct format (number followed by U)
  if (/^\d+U$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Check if it's in the format U followed by number (U8, U10, etc.)
  const match = trimmed.match(/^U(\d+)$/i);
  if (match) {
    return `${match[1]}U`;
  }

  // Return original if pattern doesn't match
  return trimmed;
}

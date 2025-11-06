/**
 * Formats a position string to be human-readable
 * - Removes underscores
 * - Capitalizes properly
 * - Handles common abbreviations
 */
export function formatPosition(position: string | null | undefined): string {
  if (!position) return 'N/A';

  // Remove underscores and replace with spaces
  let formatted = position.replace(/_/g, ' ');

  // Trim and convert to uppercase for consistency
  formatted = formatted.trim().toUpperCase();

  // Handle common abbreviations and formats
  const positionMap: Record<string, string> = {
    P: 'P',
    C: 'C',
    '1B': '1B',
    '2B': '2B',
    '3B': '3B',
    SS: 'SS',
    OF: 'OF',
    LF: 'LF',
    CF: 'CF',
    RF: 'RF',
    INF: 'INF',
    DH: 'DH',
    INFIELD: 'INF',
    OUTFIELD: 'OF',
    PITCHER: 'P',
    CATCHER: 'C',
    'FIRST BASE': '1B',
    'SECOND BASE': '2B',
    'THIRD BASE': '3B',
    SHORTSTOP: 'SS',
    'LEFT FIELD': 'LF',
    'CENTER FIELD': 'CF',
    'RIGHT FIELD': 'RF',
    'DESIGNATED HITTER': 'DH',
  };

  // Check if we have a direct mapping
  if (positionMap[formatted]) {
    return positionMap[formatted];
  }

  // Otherwise return the cleaned up version
  return formatted;
}

/**
 * Combines pos1 and pos2 into a readable string
 */
export function formatPositions(
  pos1: string | null | undefined,
  pos2: string | null | undefined
): string {
  const formatted1 = formatPosition(pos1);
  const formatted2 = formatPosition(pos2);

  // If both positions are valid and different, combine them
  if (
    formatted1 !== 'N/A' &&
    formatted2 !== 'N/A' &&
    formatted1 !== formatted2
  ) {
    return `${formatted1} / ${formatted2}`;
  }

  // Otherwise just return the first position
  return formatted1;
}

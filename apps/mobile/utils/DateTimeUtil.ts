import { formatDistanceToNow, parseISO } from 'date-fns';

// format dates into a human-readable relative time (any use case: mostly groups)
// e.g - 5 minutes ago
export const formatRelativeTime = (date: Date | string): string => {
  const parsedDate = new Date(date);
  return formatDistanceToNow(parsedDate, { addSuffix: true });
};

// format time into standard readable time (any use case)
// e.g. 3:45 PM
export const formatTime = (time: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date(time));
};

import { formatDistanceToNow, parseISO } from 'date-fns';

// format dates into a human-readable relative time (for groups)
// e.g - 5 minutes ago
export const formatRelativeTime = (date: string): string => {
  return formatDistanceToNow(parseISO(date), { addSuffix: true });
};

// format time into standard readable time
// e.g. 3:45 PM
export const formatTime = (time: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date(time));
};

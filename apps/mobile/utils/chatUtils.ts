import { MessageFE } from '@bomber-app/database';
import { format } from 'date-fns';

// get user initials
export const getInitials = (fname: string, lname: string): string => {
  return `${fname[0].toUpperCase()}${lname[0].toUpperCase()}`;
};

//format date for headers
export const formatMessageDate = (date: Date | string): string => {
  return format(new Date(date), 'EEEE, MMMM d, yyyy');
};

//check if we should show the date header
export const shouldShowDateHeader = (
  messages: MessageFE[],
  index: number
): boolean => {
  if (index === 0) return true;
  const currentMessageDate = format(
    new Date(messages[index].createdAt),
    'yyyy-MM-dd'
  );
  const prevMessageDate = format(
    new Date(messages[index - 1].createdAt),
    'yyyy-MM-dd'
  );
  return currentMessageDate !== prevMessageDate;
};

//check if we should show the sender's name
export const shouldShowSenderName = (
  messages: MessageFE[],
  index: number,
  currentUserId: string
): boolean => {
  if (index === 0) return messages[index].sender.id !== currentUserId;
  return (
    messages[index].sender.id !== currentUserId &&
    messages[index - 1].sender.id !== messages[index].sender.id
  );
};

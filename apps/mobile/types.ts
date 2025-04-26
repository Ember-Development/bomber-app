import {
  AttendanceStatus,
  EventDynamic,
  TournamentDynamic,
} from '@bomber-app/database';

// Frontend type created with backend Types
export type UserEvent = {
  id: number;
  eventID: number;
  userID: number;
  status: AttendanceStatus;

  event: Pick<
    EventDynamic<['tournament', 'attendees']>,
    'start' | 'end' | 'eventType'
  > & {
    tournament?: Pick<TournamentDynamic<[]>, 'title'>;
  };
};

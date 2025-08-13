import {
  AttendanceStatus,
  EventDynamic,
  MessageFE,
  TournamentDynamic,
  UserRole,
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

export type CreateGroupPayload = {
  title: string;
  userIds: string[];
  creatorId: string;
};

//Role
export type Role =
  | 'ADMIN'
  | 'COACH'
  | 'REGIONAL_COACH'
  | 'PLAYER'
  | 'PARENT'
  | 'FAN';

export type Action =
  | 'view-my-info'
  | 'edit-my-info'
  | 'delete-my-team'
  | 'edit-my-team'
  | 'view-my-team'
  | 'edit-player'
  | 'remove-player'
  | 'edit-coach'
  | 'remove-coach'
  | 'create-team-event'
  | 'update-team-event'
  | 'remove-team-event'
  | 'create-team-group'
  | 'add-user-to-group'
  | 'create-trophy'
  | 'edit-trophy'
  | 'remove-trophy'
  | 'edit-player-bathand'
  | 'cms:create-article'
  | 'cms:edit-article'
  | 'cms:delete-article'
  | 'cms:publish-article'
  | 'edit-player';

export const roleToActions: Record<Role, Action[]> = {
  ADMIN: [
    'view-my-info',
    'delete-my-team',
    'edit-my-team',
    'edit-my-info',
    'view-my-team',
    'create-team-group',
    'add-user-to-group',
    'edit-player-bathand',
    'cms:create-article',
    'cms:edit-article',
    'cms:delete-article',
    'cms:publish-article',
    'create-trophy',
    'edit-trophy',
    'remove-trophy',
    'edit-player',
  ],
  COACH: [
    'view-my-info',
    'edit-my-team',
    'edit-my-info',
    'view-my-team',
    'edit-player',
    'remove-player',
    'edit-coach',
    'create-team-event',
    'update-team-event',
    'remove-team-event',
    'create-team-group',
    'add-user-to-group',
    'create-trophy',
    'edit-trophy',
    'remove-trophy',
    'edit-player',
  ],
  REGIONAL_COACH: [
    'view-my-info',
    'edit-my-info',
    'view-my-team',
    'edit-player',
    'remove-player',
    'edit-coach',
    'create-team-group',
    'add-user-to-group',
    'create-trophy',
    'edit-trophy',
    'remove-trophy',
    'edit-player',
  ],
  PLAYER: ['view-my-info', 'edit-my-info', 'view-my-team'],
  PARENT: ['view-my-info', 'edit-my-info', 'view-my-team', 'edit-player'],
  FAN: ['view-my-info', 'edit-my-info', 'view-my-team'],
};

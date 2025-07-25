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
  | 'cms:publish-article';

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
  ],
  REGIONAL_COACH: [
    'view-my-info',
    'edit-my-info',
    'view-my-team',
    'create-team-group',
    'add-user-to-group',
    'create-trophy',
    'edit-trophy',
    'remove-trophy',
  ],
  PLAYER: ['view-my-info', 'edit-my-info', 'view-my-team'],
  PARENT: ['view-my-info', 'edit-my-info', 'view-my-team'],
  FAN: ['view-my-info', 'edit-my-info', 'view-my-team'],
};

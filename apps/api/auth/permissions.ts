export type Role =
  | 'ADMIN'
  | 'COACH'
  | 'REGIONAL_COACH'
  | 'PLAYER'
  | 'PARENT'
  | 'FAN';

export type Action =
  | 'delete-my-team'
  | 'edit-my-team'
  | 'view-my-team'
  | 'edit-player-bathand'
  | 'cms:create-article'
  | 'cms:edit-article'
  | 'cms:delete-article'
  | 'cms:publish-article';

export const roleToActions: Record<Role, Action[]> = {
  ADMIN: [
    'delete-my-team',
    'edit-my-team',
    'view-my-team',
    'edit-player-bathand',
    'cms:create-article',
    'cms:edit-article',
    'cms:delete-article',
    'cms:publish-article',
  ],
  COACH: ['delete-my-team', 'edit-my-team', 'view-my-team'],
  REGIONAL_COACH: ['view-my-team'],
  PLAYER: ['view-my-team'],
  PARENT: ['view-my-team'],
  FAN: ['view-my-team'],
};

// Standalone enum exports for React Native compatibility
// These mirror the Prisma-generated enums but don't require Node.js modules

export const EventType = {
  TOURNAMENT: 'TOURNAMENT',
  PRACTICE: 'PRACTICE',
  GLOBAL: 'GLOBAL',
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

export const UserRole = {
  ADMIN: 'ADMIN',
  COACH: 'COACH',
  REGIONAL_COACH: 'REGIONAL_COACH',
  PLAYER: 'PLAYER',
  PARENT: 'PARENT',
  FAN: 'FAN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Position = {
  PITCHER: 'PITCHER',
  CATCHER: 'CATCHER',
  FIRST_BASE: 'FIRST_BASE',
  SECOND_BASE: 'SECOND_BASE',
  THIRD_BASE: 'THIRD_BASE',
  SHORTSTOP: 'SHORTSTOP',
  LEFT_FIELD: 'LEFT_FIELD',
  CENTER_FIELD: 'CENTER_FIELD',
  RIGHT_FIELD: 'RIGHT_FIELD',
  DESIGNATED_HITTER: 'DESIGNATED_HITTER',
} as const;

export type Position = (typeof Position)[keyof typeof Position];

export const PantsSizes = [
  'SIZE_20',
  'SIZE_22',
  'SIZE_24',
  'SIZE_26',
  'SIZE_30',
  'SIZE_32',
  'SIZE_33',
  'SIZE_34',
  'SIZE_36',
  'SIZE_38',
] as const;

export const AgeGroups = [
  'U8',
  'U10',
  'U12',
  'U14',
  'U16',
  'U18',
  'ALUMNI',
] as const;

export const Positions = [
  'PITCHER',
  'CATCHER',
  'FIRST_BASE',
  'SECOND_BASE',
  'THIRD_BASE',
  'SHORTSTOP',
  'LEFT_FIELD',
  'CENTER_FIELD',
  'RIGHT_FIELD',
  'DESIGNATED_HITTER',
] as const;

export const JerseySizes = [
  'YXS',
  'YS',
  'YM',
  'YL',
  'YXL',
  'AS',
  'AM',
  'AL',
  'AXL',
  'A2XL',
] as const;

export const StirrupSizes = ['SM', 'LG', 'XL'] as const;

export const ShortsSizes = ['YXL', 'ASM', 'AMD', 'ALG', 'AXL', 'A2XL'] as const;

export type PantsSize = (typeof PantsSizes)[number];
export type AgeGroup = (typeof AgeGroups)[number];
export type Position = (typeof Positions)[number];
export type JerseySize = (typeof JerseySizes)[number];
export type StirrupSize = (typeof StirrupSizes)[number];
export type ShortsSize = (typeof ShortsSizes)[number];

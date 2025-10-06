import { AgeGroup } from '@bomber-app/database';
import { PositionEnum } from './positions';

export const POSITIONS = [
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
].map((pos) => ({
  label: pos
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase()),
  value: pos,
}));

export const POSITION_DISPLAY: Record<string, string> = {
  PITCHER: 'Pitcher',
  CATCHER: 'Catcher',
  FIRST_BASE: 'First Base',
  SECOND_BASE: 'Second Base',
  THIRD_BASE: 'Third Base',
  SHORTSTOP: 'Shortstop',
  LEFT_FIELD: 'Left Field',
  CENTER_FIELD: 'Center Field',
  RIGHT_FIELD: 'Right Field',
  DESIGNATED_HITTER: 'Designated Hitter',
};

export const formatPosition = (pos?: string | null) =>
  pos ? (POSITION_DISPLAY[pos] ?? pos) : '';

export const POSITIONS_DROPDOWN = (
  Object.keys(POSITION_DISPLAY) as PositionEnum[]
).map((pos) => ({
  label: POSITION_DISPLAY[pos],
  value: pos,
}));

export const POSITION_SHORT: Record<string, string> = {
  PITCHER: 'P',
  CATCHER: 'C',
  FIRST_BASE: '1B',
  SECOND_BASE: '2B',
  THIRD_BASE: '3B',
  SHORTSTOP: 'SS',
  LEFT_FIELD: 'LF',
  CENTER_FIELD: 'CF',
  RIGHT_FIELD: 'RF',
  DESIGNATED_HITTER: 'DH',
};

export const formatPositionShort = (pos?: string | null) =>
  pos ? (POSITION_SHORT[pos] ?? pos) : '';

export const JERSEY_SIZES = [
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
].map((s) => ({ label: s, value: s }));

export const PANT_SIZES = [
  'SIZE_20',
  'SIZE_22',
  'SIZE_24',
  'SIZE_26',
  'SIZE_27',
  'SIZE_28',
  'SIZE_30',
  'SIZE_32',
  'SIZE_33',
  'SIZE_34',
  'SIZE_36',
  'SIZE_38',
].map((s) => ({ label: s.replace('SIZE_', ''), value: s }));

export const formatPantSize = (value?: string) => {
  if (!value) return 'N/A';
  return value.replace('SIZE_', '');
};

<<<<<<< HEAD
export const STIRRUP_SIZES = ['ADULT', 'ADULT_LONG', 'XL', 'XL_WIDE'].map(
  (s) => ({
    label: s,
    value: s,
  })
);
=======
export const STIRRUP_SIZES = ['SM', 'LG', 'XL'].map((s) => ({
  label: s,
  value: s,
}));
>>>>>>> events-tab

export const SHORTS_SIZES = ['YXL', 'ASM', 'AMD', 'ALG', 'AXL', 'A2XL'].map(
  (s) => ({ label: s, value: s })
);

export enum MediaCategory {
  TRAINING = 'TRAINING',
  PODCAST = 'PODCAST',
  HIGHLIGHTS = 'HIGHLIGHTS',
  INTERVIEWS = 'INTERVIEWS',
  MERCH = 'MERCH',
}

export const MEDIA_CATEGORIES = Object.values(MediaCategory).map((c) => ({
  label: c
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (s) => s.toUpperCase()),
  value: c,
}));

const AGE_DISPLAY: Record<AgeGroup, string> = {
  U8: '8U',
  U10: '10U',
  U12: '12U',
  U14: '14U',
  U16: '16U',
  U18: '18U',
  ALUMNI: 'Alumni',
};

export const AGE_GROUPS = (Object.keys(AGE_DISPLAY) as AgeGroup[]).map((g) => ({
  label: AGE_DISPLAY[g], // what users see
  value: g, // what you send/store
}));

// Optional helpers if you want to use them elsewhere:
export const formatAgeGroup = (g?: AgeGroup | null) =>
  g ? AGE_DISPLAY[g] : '';
export const parseAgeGroupLabel = (label: string): AgeGroup | undefined => {
  const n = label.toUpperCase().replace(/\s/g, '');
  if (n === 'ALUMNI') return 'ALUMNI';
  const m = n.match(/^(\d{1,2})U$/) || n.match(/^U(\d{1,2})$/);
  return m ? (`U${m[1]}` as AgeGroup) : undefined;
};

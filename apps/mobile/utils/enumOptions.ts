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
  'SIZE_30',
  'SIZE_32',
  'SIZE_33',
  'SIZE_34',
  'SIZE_36',
  'SIZE_38',
].map((s) => ({ label: s.replace('SIZE_', ''), value: s }));

export const STIRRUP_SIZES = ['SM', 'LG', 'XL'].map((s) => ({
  label: s,
  value: s,
}));

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

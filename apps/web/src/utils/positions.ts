export type PositionEnum =
  | 'PITCHER'
  | 'CATCHER'
  | 'FIRST_BASE'
  | 'SECOND_BASE'
  | 'THIRD_BASE'
  | 'SHORTSTOP'
  | 'LEFT_FIELD'
  | 'CENTER_FIELD'
  | 'RIGHT_FIELD'
  | 'DESIGNATED_HITTER';

const PRETTY: Record<PositionEnum, string> = {
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

const ABBR: Record<PositionEnum, string> = {
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

const ORDER: PositionEnum[] = [
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
];

export const POSITION_OPTIONS = ORDER.map((value) => ({
  value,
  label: `${PRETTY[value]} (${ABBR[value]})`,
  labelShort: ABBR[value], // great for tight UIs
  labelPretty: PRETTY[value], // if you want no abbreviations
}));

// Helpers for ad‑hoc rendering
export const formatPosition = (p?: PositionEnum | null) => (p ? PRETTY[p] : '');
export const formatPositionAbbr = (p?: PositionEnum | null) =>
  p ? ABBR[p] : '';

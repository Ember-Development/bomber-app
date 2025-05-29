// utils/region.ts
export const REGION_LABELS: Record<string, string> = {
  NW: 'Northwest',
  SW: 'Southwest',
  S: 'South',
  SE: 'Southeast',
  NE: 'Northeast',
  MW: 'Midwest',
};

export function getRegionLabel(regionCode: string): string {
  return REGION_LABELS[regionCode] || regionCode;
}

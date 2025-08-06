export function formatLabel(text?: string | null): string {
  if (!text) return '—';

  return text
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatGearLabel(text?: string | null): string {
  if (!text) return '—';
  return text.replace(/^SIZE_/, '').toUpperCase();
}

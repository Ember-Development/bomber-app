/**
 * Validation utility functions
 */

export function isEmail(v: unknown): v is string {
  if (typeof v !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function nonEmptyString(v: unknown, minLength = 0): v is string {
  if (typeof v !== 'string') return false;
  return v.trim().length >= minLength;
}


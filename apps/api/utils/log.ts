import crypto from 'crypto';

export const maskEmail = (e?: string) => {
  if (!e) return '<empty>';
  const [u, d] = String(e).split('@');
  if (!d) return '<invalid>';
  return `${u[0] ?? ''}***@${d}`;
};

export const hashEmail = (e?: string) =>
  e
    ? crypto
        .createHash('sha256')
        .update(String(e).toLowerCase().trim())
        .digest('hex')
        .slice(0, 10)
    : 'empty';

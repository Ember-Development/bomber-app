import jwt, { Secret } from 'jsonwebtoken';

const ACCESS_SECRET: Secret = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET!;

const ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';

export function signAccess(payload: object): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN as any,
  });
}

export function signRefresh(payload: object): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN as any,
  });
}

export function verifyAccess(token: string): object | string {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefresh(token: string): object | string {
  return jwt.verify(token, REFRESH_SECRET);
}

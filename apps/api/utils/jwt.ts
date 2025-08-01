import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_EXPIRES_IN: ACCESS_EXPIRES_IN_RAW,
  REFRESH_EXPIRES_IN: REFRESH_EXPIRES_IN_RAW,
} = process.env;

if (!JWT_ACCESS_SECRET) {
  throw new Error('Missing environment variable: JWT_ACCESS_SECRET');
}
if (!JWT_REFRESH_SECRET) {
  throw new Error('Missing environment variable: JWT_REFRESH_SECRET');
}

const ACCESS_SECRET: Secret = JWT_ACCESS_SECRET;
const REFRESH_SECRET: Secret = JWT_REFRESH_SECRET;
const ACCESS_EXPIRES_IN = ACCESS_EXPIRES_IN_RAW || '15m';
const REFRESH_EXPIRES_IN = REFRESH_EXPIRES_IN_RAW || '7d';

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

import jwt from 'jsonwebtoken';

const base = process.env.JWT_ACCESS_SECRET!;
if (!base) throw new Error('JWT_SECRET is required');

export function signResetToken(
  userId: string | number,
  email: string,
  userPassHash: string,
  ttl = '15m'
) {
  return jwt.sign(
    { sub: String(userId), email, kind: 'pwd-reset' },
    base + userPassHash,
    { expiresIn: ttl } as jwt.SignOptions
  );
}

export function verifyResetToken(token: string, userPassHash: string) {
  const p = jwt.verify(token, base + userPassHash) as {
    sub: string;
    email: string;
    kind: 'pwd-reset';
    iat: number;
    exp: number;
  };
  if (p.kind !== 'pwd-reset') throw new Error('Invalid kind');
  return p;
}

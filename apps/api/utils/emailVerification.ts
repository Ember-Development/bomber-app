import jwt from 'jsonwebtoken';

const base = process.env.JWT_ACCESS_SECRET!;
if (!base) throw new Error('JWT_SECRET is required');

export function signVerificationToken(
  userId: string,
  email: string,
  ttl = '7d' // 7 days expiry
) {
  return jwt.sign(
    { sub: userId, email, kind: 'email-verification' },
    base + email, // Use email in secret for uniqueness
    { expiresIn: ttl } as jwt.SignOptions
  );
}

export function verifyVerificationToken(token: string, email: string) {
  const p = jwt.verify(token, base + email) as {
    sub: string;
    email: string;
    kind: 'email-verification';
    iat: number;
    exp: number;
  };
  if (p.kind !== 'email-verification') throw new Error('Invalid kind');
  return p;
}

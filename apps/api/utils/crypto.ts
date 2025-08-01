import bcrypt from 'bcrypt';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, SALT_ROUNDS);
export const verifyPassword = (
  password: string,
  hash: string
): Promise<boolean> => bcrypt.compare(password, hash);

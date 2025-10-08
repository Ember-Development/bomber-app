import { hashPassword, verifyPassword } from './utils/hash';

async function main() {
  const raw = process.argv[2];
  if (!raw) {
    console.error(
      '❌ Please provide a password: pnpm tsx test-hash.ts myPassword'
    );
    process.exit(1);
  }

  const hashed = await hashPassword(raw);
  console.log('Hashed:', hashed);

  const ok = await verifyPassword(raw, hashed);
  console.log('Verify correct password:', ok);

  const fail = await verifyPassword('wrong123', hashed);
  console.log('Verify wrong password:', fail);
}

main();

import { randomUUID } from 'crypto';
import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        email: randomUUID(),
        pass: randomUUID(),
        fname: randomUUID(),
        lname: randomUUID(),
        primaryRole: 'ADMIN',
      },
      {
        email: randomUUID(),
        pass: randomUUID(),
        fname: randomUUID(),
        lname: randomUUID(),
        primaryRole: 'ADMIN',
      },
      {
        email: randomUUID(),
        pass: randomUUID(),
        fname: randomUUID(),
        lname: randomUUID(),
        primaryRole: 'ADMIN',
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ UUID users seeded');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

//NOTE: run this to test that prisma queries are working how you expect
//
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getUsers() {
  const allUsers = await prisma.user.findMany();
  console.dir(allUsers, { depth: null });
}

async function main() {
  //toggle this to see upsert in action

  await getUsers();

  await prisma.user.delete({ where: { email: "alice@prisma.io" } });
  await getUsers();

  await prisma.user.upsert({
    where: {
      email: "alice@prisma.io",
    },
    update: {
      name: "alice",
    },
    create: {
      name: "alice",
      email: "alice@prisma.io",
      posts: {
        create: { title: "hello world" },
      },
      profile: {
        create: { bio: "I like tortles" },
      },
    },
  });
  await getUsers();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

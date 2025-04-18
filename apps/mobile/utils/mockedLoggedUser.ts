import { prisma, UserFE } from '@bomber-app/database';

export const getMockLoggedInUser = async (): Promise<UserFE> => {
  const user = await prisma.user.findUnique({
    where: { id: '15181fa0-16aa-4583-bbb7-9a6f26ae3227' },
    include: {
      player: {
        include: {
          team: {
            include: {
              headCoach: true,
              players: true,
              coaches: true,
              trophyCase: true,
            },
          },
          parents: true,
          address: true,
        },
      },
      admin: true,
      coach: true,
      regCoach: true,
      parent: true,
      fan: true,
      sentMessages: true,
      chats: true,
      events: true,
      notifications: true,
    },
  });

  if (!user) throw new Error('Mock user not found');
  console.log(JSON.stringify(user, null, 2));

  return user as unknown as UserFE;
};

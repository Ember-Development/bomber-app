import { prisma } from '@bomber-app/database';

//FIXME: replace the any once we have full types
const validatePlayer = (player: any) => {
  //TODO: use enums when we have full types
  const isPlayerParentManaged =
    player.ageGroup == '8u' ||
    player.ageGroup == '10u' ||
    player.ageGroup == '12u' ||
    (player.ageGroup == '14u' && player.isTrusted == false);

  const errors = [];

  if (!isPlayerParentManaged) {
    if (!player.addressID)
      errors.push('Self managed players must have an address'); //TODO: perhaps we can do more to validate the address than just checking an ID exists?
  } else {
    if (player.parents.length < 1)
      errors.push(
        'Parent managed players must have at least one parent relation'
      );
  }

  if (errors.length > 0) return errors;
};

export { validatePlayer };

export const playerService = {
  getPlayerById: async (id: string) => {
    return prisma.player.findUnique({
      where: { id },
      include: {
        user: true,
        team: true,
        parents: true,
        address: true,
      },
    });
  },
};

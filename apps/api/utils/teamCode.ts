import { prisma } from '@bomber-app/database';

/* Generate a random 5-digit string, e.g. "04237" */
function genTeamCode(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

/* Loop until we find a code not already in use */
export async function getUniqueTeamCode(): Promise<string> {
  let code: string;
  let exists: boolean;

  do {
    code = genTeamCode();
    exists = !!(await prisma.team.findUnique({ where: { teamCode: code } }));
  } while (exists);

  return code;
}

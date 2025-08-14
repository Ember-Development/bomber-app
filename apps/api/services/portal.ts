import { prisma, Prisma } from '@bomber-app/database';

type CreateLeadInput = {
  kind: 'PLAYER' | 'PARENT';
  playerFirstName: string;
  playerLastName: string;
  ageGroup: string; // AgeGroup
  pos1?: string; // Position
  pos2?: string; // Position
  gradYear?: string;

  email?: string;
  phone?: string;

  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
};

const isUnder14 = (ag?: string) =>
  ag === 'U8' || ag === 'U10' || ag === 'U12' || ag === 'U14';

export const portalService = {
  createLead: async (data: CreateLeadInput) => {
    // COPPA guard for PLAYER leads under 14U
    if (data.kind === 'PLAYER' && isUnder14(data.ageGroup)) {
      throw new Error(
        'Players 14U and under must apply via a parent/guardian.'
      );
    }

    if (data.kind === 'PARENT') {
      if (!data.parentEmail && !data.parentPhone) {
        throw new Error('Parent email or phone required.');
      }
    } else {
      // PLAYER (U16/U18)
      if (!data.email && !data.phone) {
        throw new Error('Contact email or phone required.');
      }
    }

    return prisma.portalLead.create({
      data: {
        kind: data.kind as any,
        playerFirstName: data.playerFirstName,
        playerLastName: data.playerLastName,
        ageGroup: data.ageGroup as any,
        pos1: data.pos1 as any,
        pos2: data.pos2 as any,
        gradYear: data.gradYear,
        email: data.kind === 'PLAYER' ? data.email : null,
        phone: data.kind === 'PLAYER' ? data.phone : null,
        parentFirstName: data.kind === 'PARENT' ? data.parentFirstName : null,
        parentLastName: data.kind === 'PARENT' ? data.parentLastName : null,
        parentEmail: data.kind === 'PARENT' ? data.parentEmail : null,
        parentPhone: data.kind === 'PARENT' ? data.parentPhone : null,
      },
    });
  },

  getLeads: async () => {
    return prisma.portalLead.findMany({ orderBy: { createdAt: 'desc' } });
  },
};

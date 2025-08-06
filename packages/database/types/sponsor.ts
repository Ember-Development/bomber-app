import { PrismaClient, Sponsor } from '../generated/client';

const prisma = new PrismaClient();

export type SponsorDB = Sponsor;

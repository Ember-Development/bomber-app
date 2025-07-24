// src/types/media.ts
import { PrismaClient, Media } from '../generated/client';
const prisma = new PrismaClient();
export type MediaDB = Media;

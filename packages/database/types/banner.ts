// src/types/banner.ts
import { PrismaClient, Banner } from '../generated/client';
const prisma = new PrismaClient();
export type BannerDB = Banner;

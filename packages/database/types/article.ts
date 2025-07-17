// src/types/article.ts
import { PrismaClient, Article } from '../generated/client';
const prisma = new PrismaClient();
export type ArticleDB = Article;

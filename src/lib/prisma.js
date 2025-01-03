import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['warn', 'error'], // Logs all database queries to the console during development
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

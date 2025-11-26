import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Log slow queries in development
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  prisma.$on('query', (e: any) => {
    if (e.duration > 100) {
      console.warn(`Slow query (${e.duration}ms): ${e.query}`);
    }
  });
}

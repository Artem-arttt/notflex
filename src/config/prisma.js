import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Единый экземпляр клиента на всё приложение
export const prisma = new PrismaClient({ adapter });
import { prisma } from '../config/prisma.js';
import { publicUserSelect } from '../utils/userSelect.js';

export function listUsers() {
  return prisma.user.findMany({
    select: publicUserSelect,
    orderBy: { id: 'asc' },
  });
}
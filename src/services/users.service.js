import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { publicUserSelect } from '../utils/userSelect.js';

export function listUsers() {
  return prisma.user.findMany({
    select: publicUserSelect,
    orderBy: { id: 'asc' },
  });
}

export async function changeUserRole(id, role, currentUser) {
  // Защита от потери доступа: администратор не может понизить сам себя
  if (id === currentUser.id) {
    throw ApiError.badRequest('Нельзя изменить собственную роль');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound(`Пользователь с id ${id} не найден`);

  return prisma.user.update({
    where: { id },
    data: { role },
    select: publicUserSelect,
  });
}
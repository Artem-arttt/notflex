import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const authorSelect = { id: true, name: true };
const titleSelect = { id: true, name: true, type: true, releaseYear: true };

async function assertTitleExists(titleId) {
  const title = await prisma.title.findUnique({ where: { id: titleId }, select: { id: true } });
  if (!title) throw ApiError.notFound(`Тайтл с id ${titleId} не найден`);
}

async function getRatingOrThrow(id) {
  const rating = await prisma.rating.findUnique({ where: { id } });
  if (!rating) throw ApiError.notFound(`Оценка с id ${id} не найдена`);
  return rating;
}

// Оценки тайтла с именами авторов (Prisma include/select)
export async function listTitleRatings(titleId, { page, limit }) {
  await assertTitleExists(titleId);

  const where = { titleId };
  const [items, total] = await prisma.$transaction([
    prisma.rating.findMany({
      where,
      include: { user: { select: authorSelect } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.rating.count({ where }),
  ]);

  return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

// Мои оценки вместе с тайтлами
export function listMyRatings(userId) {
  return prisma.rating.findMany({
    where: { userId },
    include: { title: { select: titleSelect } },
    orderBy: { createdAt: 'desc' },
  });
}

// userId приходит из подтверждённого токена (req.user.id), а не из тела запроса
export async function createRating(userId, titleId, { value, comment }) {
  await assertTitleExists(titleId);

  const existing = await prisma.rating.findUnique({ where: { userId_titleId: { userId, titleId } } });
  if (existing) throw ApiError.conflict('Вы уже оценили этот тайтл. Измените оценку через PATCH /api/ratings/:id');

  return prisma.rating.create({
    data: { userId, titleId, value, comment: comment ?? null },
    include: { user: { select: authorSelect } },
  });
}

// Менять оценку может только её автор
export async function updateRating(id, currentUser, data) {
  const rating = await getRatingOrThrow(id);
  if (rating.userId !== currentUser.id) {
    throw ApiError.forbidden('Можно изменять только свои оценки');
  }
  return prisma.rating.update({
    where: { id },
    data,
    include: { user: { select: authorSelect } },
  });
}

// Удалять оценку может автор или администратор
export async function deleteRating(id, currentUser) {
  const rating = await getRatingOrThrow(id);
  if (rating.userId !== currentUser.id && currentUser.role !== 'ADMIN') {
    throw ApiError.forbidden('Можно удалять только свои оценки');
  }
  await prisma.rating.delete({ where: { id } });
}
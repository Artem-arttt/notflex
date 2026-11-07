import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

// Связанные данные, которые отдаём вместе с тайтлом (Prisma include)
const titleInclude = {
  director: { select: { id: true, name: true } },
  genres: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
};

// Добавляет к тайтлам среднюю оценку и число оценок одним запросом groupBy
async function attachRatingStats(titles) {
  if (titles.length === 0) return titles;

  const stats = await prisma.rating.groupBy({
    by: ['titleId'],
    where: { titleId: { in: titles.map((t) => t.id) } },
    _avg: { value: true },
    _count: { _all: true },
  });
  const byTitle = new Map(stats.map((s) => [s.titleId, s]));

  return titles.map((title) => {
    const s = byTitle.get(title.id);
    return {
      ...title,
      ratingStats: {
        average: s ? Number(s._avg.value.toFixed(1)) : null,
        count: s ? s._count._all : 0,
      },
    };
  });
}

// Бизнес-правило: у фильма нет сезонов, у сериала нет длительности
function assertTypeFields({ type, durationMin, seasons }) {
  if (type === 'MOVIE' && seasons != null) {
    throw ApiError.badRequest('У фильма (MOVIE) не может быть поля seasons');
  }
  if (type === 'SERIES' && durationMin != null) {
    throw ApiError.badRequest('У сериала (SERIES) не может быть поля durationMin');
  }
}

async function assertRelationsExist({ directorId, genreIds }) {
  if (directorId != null) {
    const director = await prisma.director.findUnique({ where: { id: directorId } });
    if (!director) throw ApiError.badRequest(`Режиссёр с id ${directorId} не найден`);
  }
  if (genreIds && genreIds.length > 0) {
    const unique = [...new Set(genreIds)];
    const found = await prisma.genre.count({ where: { id: { in: unique } } });
    if (found !== unique.length) throw ApiError.badRequest('Один или несколько жанров из genreIds не найдены');
  }
}

export async function listTitles({ type, genreId, directorId, year, search, page, limit, sort, order }) {
  const where = {
    ...(type && { type }),
    ...(directorId && { directorId }),
    ...(year && { releaseYear: year }),
    ...(genreId && { genres: { some: { id: genreId } } }),
    ...(search && { name: { contains: search, mode: 'insensitive' } }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.title.findMany({
      where,
      include: titleInclude,
      orderBy: [{ [sort]: order }, { id: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.title.count({ where }),
  ]);

  return {
    data: await attachRatingStats(items),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getTitleById(id) {
  const title = await prisma.title.findUnique({ where: { id }, include: titleInclude });
  if (!title) throw ApiError.notFound(`Тайтл с id ${id} не найден`);
  const [withStats] = await attachRatingStats([title]);
  return withStats;
}

export async function createTitle({ genreIds, ...data }) {
  assertTypeFields(data);
  await assertRelationsExist({ directorId: data.directorId, genreIds });

  const created = await prisma.title.create({
    data: {
      ...data,
      ...(genreIds && { genres: { connect: [...new Set(genreIds)].map((id) => ({ id })) } }),
    },
  });
  return getTitleById(created.id);
}

export async function updateTitle(id, { genreIds, ...data }) {
  const existing = await prisma.title.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound(`Тайтл с id ${id} не найден`);

  // Проверяем итоговое состояние: значения из запроса поверх текущих
  assertTypeFields({
    type: data.type ?? existing.type,
    durationMin: data.durationMin !== undefined ? data.durationMin : existing.durationMin,
    seasons: data.seasons !== undefined ? data.seasons : existing.seasons,
  });
  await assertRelationsExist({ directorId: data.directorId, genreIds });

  await prisma.title.update({
    where: { id },
    data: {
      ...data,
      ...(genreIds && { genres: { set: [...new Set(genreIds)].map((gid) => ({ id: gid })) } }),
    },
  });
  return getTitleById(id);
}

export async function deleteTitle(id) {
  const existing = await prisma.title.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound(`Тайтл с id ${id} не найден`);
  await prisma.title.delete({ where: { id } }); // оценки удалятся каскадно
}
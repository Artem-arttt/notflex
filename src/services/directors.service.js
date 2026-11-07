import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export function listDirectors() {
  return prisma.director.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { titles: true } } },
  });
}

export async function getDirectorById(id) {
  // Связанный запрос: режиссёр вместе со своими тайтлами
  const director = await prisma.director.findUnique({
    where: { id },
    include: {
      titles: { select: { id: true, name: true, type: true, releaseYear: true }, orderBy: { releaseYear: 'asc' } },
    },
  });
  if (!director) throw ApiError.notFound(`Режиссёр с id ${id} не найден`);
  return director;
}

export function createDirector({ name }) {
  return prisma.director.create({ data: { name } });
}

export async function updateDirector(id, { name }) {
  await getDirectorById(id);
  return prisma.director.update({ where: { id }, data: { name } });
}

export async function deleteDirector(id) {
  await getDirectorById(id);
  await prisma.director.delete({ where: { id } }); // у его тайтлов directorId станет NULL
}
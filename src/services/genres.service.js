import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export function listGenres() {
  return prisma.genre.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { titles: true } } },
  });
}

export async function getGenreById(id) {
  // Связанный запрос: жанр вместе со списком его тайтлов
  const genre = await prisma.genre.findUnique({
    where: { id },
    include: {
      titles: { select: { id: true, name: true, type: true, releaseYear: true }, orderBy: { name: 'asc' } },
    },
  });
  if (!genre) throw ApiError.notFound(`Жанр с id ${id} не найден`);
  return genre;
}

async function assertNameFree(name, exceptId) {
  const same = await prisma.genre.findUnique({ where: { name } });
  if (same && same.id !== exceptId) throw ApiError.conflict('Жанр с таким названием уже существует');
}

export async function createGenre({ name }) {
  await assertNameFree(name);
  return prisma.genre.create({ data: { name } });
}

export async function updateGenre(id, { name }) {
  await getGenreById(id);
  await assertNameFree(name, id);
  return prisma.genre.update({ where: { id }, data: { name } });
}

export async function deleteGenre(id) {
  await getGenreById(id);
  await prisma.genre.delete({ where: { id } }); // связи с тайтлами удаляются, сами тайтлы остаются
}
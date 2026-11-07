import { z } from 'zod';

const positiveInt = (label) =>
  z.coerce.number({ error: `${label} должен быть числом` }).int(`${label} должен быть целым числом`).positive(`${label} должен быть положительным`);

const year = z.number({ error: 'Год должен быть числом' }).int('Год должен быть целым числом').min(1888, 'Год не может быть раньше 1888').max(2100, 'Год не может быть позже 2100');

const typeEnum = z.enum(['MOVIE', 'SERIES'], { error: 'type должен быть MOVIE или SERIES' });

const fields = {
  name: z.string({ error: 'Название обязательно' }).trim().min(1, 'Название не может быть пустым').max(200, 'Название не длиннее 200 символов'),
  type: typeEnum,
  description: z.string().trim().max(2000, 'Описание не длиннее 2000 символов').nullable(),
  releaseYear: year,
  durationMin: z.number().int('Длительность должна быть целым числом').positive('Длительность должна быть положительной').max(1000, 'Слишком большая длительность').nullable(),
  seasons: z.number().int('Количество сезонов должно быть целым числом').positive('Количество сезонов должно быть положительным').max(100, 'Слишком много сезонов').nullable(),
  directorId: z.number().int().positive('directorId должен быть положительным').nullable(),
  genreIds: z.array(z.number().int().positive(), { error: 'genreIds должен быть массивом чисел' }).max(10, 'Не более 10 жанров'),
};

// POST /titles: обязательны name, type, releaseYear
export const createTitleSchema = z.object({
  name: fields.name,
  type: fields.type,
  releaseYear: fields.releaseYear,
  description: fields.description.optional(),
  durationMin: fields.durationMin.optional(),
  seasons: fields.seasons.optional(),
  directorId: fields.directorId.optional(),
  genreIds: fields.genreIds.optional(),
});

// PATCH /titles/:id: все поля необязательны, но хотя бы одно должно прийти
export const updateTitleSchema = z
  .object({
    name: fields.name,
    type: fields.type,
    releaseYear: fields.releaseYear,
    description: fields.description,
    durationMin: fields.durationMin,
    seasons: fields.seasons,
    directorId: fields.directorId,
    genreIds: fields.genreIds,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Передайте хотя бы одно поле для изменения' });

// GET /titles: фильтры, сортировка и пагинация
export const listTitlesQuerySchema = z.object({
  type: typeEnum.optional(),
  genreId: positiveInt('genreId').optional(),
  directorId: positiveInt('directorId').optional(),
  year: z.coerce.number({ error: 'year должен быть числом' }).int().min(1888).max(2100).optional(),
  search: z.string().trim().min(1, 'search не может быть пустым').max(100).optional(),
  page: z.coerce.number({ error: 'page должен быть числом' }).int().min(1, 'page начинается с 1').default(1),
  limit: z.coerce.number({ error: 'limit должен быть числом' }).int().min(1, 'limit не меньше 1').max(50, 'limit не больше 50').default(10),
  sort: z.enum(['id', 'name', 'releaseYear'], { error: 'sort: id, name или releaseYear' }).default('id'),
  order: z.enum(['asc', 'desc'], { error: 'order: asc или desc' }).default('asc'),
});
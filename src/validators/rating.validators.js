import { z } from 'zod';

const value = z
  .number({ error: 'Оценка должна быть числом' })
  .int('Оценка должна быть целым числом')
  .min(1, 'Оценка не может быть меньше 1')
  .max(10, 'Оценка не может быть больше 10');

const comment = z.string({ error: 'Комментарий должен быть строкой' }).trim().max(1000, 'Комментарий не длиннее 1000 символов').nullable();

// POST /titles/:id/ratings. Поля userId и titleId в теле не принимаются:
// автор берётся из токена, тайтл из адреса.
export const createRatingSchema = z.object({
  value,
  comment: comment.optional(),
});

// PATCH /ratings/:id
export const updateRatingSchema = z
  .object({ value, comment })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Передайте хотя бы одно поле для изменения' });

// GET /titles/:id/ratings: пагинация
export const listRatingsQuerySchema = z.object({
  page: z.coerce.number({ error: 'page должен быть числом' }).int().min(1, 'page начинается с 1').default(1),
  limit: z.coerce.number({ error: 'limit должен быть числом' }).int().min(1, 'limit не меньше 1').max(50, 'limit не больше 50').default(10),
});
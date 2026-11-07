import { z } from 'zod';

// Параметр маршрута :id — положительное целое число
export const idParamSchema = z.object({
  id: z.coerce.number({ error: 'id должен быть числом' }).int('id должен быть целым числом').positive('id должен быть положительным'),
});
import { ApiError } from '../utils/ApiError.js';

// validate(schema, 'body' | 'params' | 'query') — проверяет часть запроса по схеме zod.
// Проверенные данные кладутся обратно в req, лишние поля отбрасываются.
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      return next(ApiError.badRequest('Ошибка валидации данных', details));
    }

    if (source === 'query') {
      // В Express 5 req.query доступен только для чтения
      req.validatedQuery = result.data;
    } else {
      req[source] = result.data;
    }
    next();
  };
}
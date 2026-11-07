import { ApiError } from '../utils/ApiError.js';

// Единое место, где любая ошибка превращается в JSON-ответ.
// Формат: { "error": { "status": 400, "message": "...", "details": [...] } }
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let status = 500;
  let message = 'Внутренняя ошибка сервера';
  let details;

  if (err instanceof ApiError) {
    ({ status, message, details } = err);
  } else if (err.type === 'entity.parse.failed') {
    // Некорректный JSON в теле запроса
    status = 400;
    message = 'Тело запроса содержит некорректный JSON';
  } else if (err.code === 'P2002') {
    // Prisma: нарушено ограничение уникальности
    status = 409;
    message = 'Запись с такими данными уже существует';
  } else if (err.code === 'P2025') {
    // Prisma: запись для изменения или удаления не найдена
    status = 404;
    message = 'Запись не найдена';
  } else if (err.code === 'P2003') {
    // Prisma: нарушение внешнего ключа
    status = 400;
    message = 'Связанная запись не существует';
  }

  if (status === 500) {
    // Подробности пишем только в лог сервера, клиенту их не отдаём
    console.error(err);
  }

  res.status(status).json({ error: { status, message, ...(details && { details }) } });
}
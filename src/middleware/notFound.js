import { ApiError } from '../utils/ApiError.js';

// Срабатывает, если ни один маршрут не подошёл
export function notFound(req, res, next) {
  next(ApiError.notFound(`Маршрут ${req.method} ${req.originalUrl} не найден`));
}
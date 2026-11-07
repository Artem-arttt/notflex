// Ошибка с HTTP-статусом. Бросаем её из сервисов и middleware,
// а превращает в JSON-ответ централизованный errorHandler.
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  static badRequest(message = 'Некорректный запрос', details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Требуется авторизация') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Недостаточно прав') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Ресурс не найден') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Конфликт данных') {
    return new ApiError(409, message);
  }
}
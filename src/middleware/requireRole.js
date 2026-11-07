import { ApiError } from '../utils/ApiError.js';

// requireRole('ADMIN') — пускает только пользователей с нужной ролью.
// Всегда ставится ПОСЛЕ requireAuth.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden('Недостаточно прав для этой операции');
    }
    next();
  };
}
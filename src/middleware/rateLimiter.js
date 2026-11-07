import { rateLimit } from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';

// Ограничение частоты запросов к /auth (защита от подбора паролей)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next) => next(new ApiError(429, 'Слишком много запросов, попробуйте позже')),
});
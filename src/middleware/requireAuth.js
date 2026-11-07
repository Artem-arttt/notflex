import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { publicUserSelect } from '../utils/userSelect.js';

// Проверяет заголовок Authorization: Bearer <accessToken>.
// При успехе кладёт в req.user данные ИЗ БАЗЫ (а не из токена),
// поэтому смена роли или удаление пользователя действуют сразу.
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Отсутствует заголовок Authorization: Bearer <accessToken>');
  }

  const token = header.slice('Bearer '.length).trim();

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Срок действия токена истёк' : 'Недействительный токен';
    throw ApiError.unauthorized(message);
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: publicUserSelect,
  });

  if (!user) {
    throw ApiError.unauthorized('Пользователь токена не найден');
  }

  req.user = user;
  next();
}
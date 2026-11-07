import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { publicUserSelect } from '../utils/userSelect.js';

// Хеш-пустышка: чтобы время ответа не выдавало, существует ли email
const DUMMY_HASH = await argon2.hash('dummy-password');

function signAccessToken(user) {
  return jwt.sign({ role: user.role }, env.jwtSecret, {
    subject: String(user.id),
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256',
  });
}

export async function register({ email, name, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('Пользователь с таким email уже существует');
  }

  const passwordHash = await argon2.hash(password); // Argon2id

  // Роль не берётся из запроса: публичная регистрация всегда создаёт USER
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role: 'USER' },
    select: publicUserSelect,
  });

  return { user, accessToken: signAccessToken(user) };
}

export async function login({ email, password }) {
  const found = await prisma.user.findUnique({ where: { email } });

  const passwordOk = await argon2.verify(found ? found.passwordHash : DUMMY_HASH, password);
  if (!found || !passwordOk) {
    // Одинаковое сообщение для «нет такого email» и «неверный пароль»
    throw ApiError.unauthorized('Неверный email или пароль');
  }

  const user = {
    id: found.id,
    email: found.email,
    name: found.name,
    role: found.role,
    createdAt: found.createdAt,
  };

  return { user, accessToken: signAccessToken(user) };
}
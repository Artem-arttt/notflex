import { z } from 'zod';

// Лишние поля (например, role) zod по умолчанию отбрасывает,
// поэтому при регистрации назначить себе роль ADMIN невозможно.
export const registerSchema = z.object({
  email: z.string({ error: 'email обязателен' }).trim().toLowerCase().pipe(z.email('Некорректный email')),
  name: z
    .string({ error: 'Имя обязательно' })
    .trim()
    .min(2, 'Имя должно содержать не менее 2 символов')
    .max(50, 'Имя должно содержать не более 50 символов'),
  password: z
    .string({ error: 'Пароль обязателен' })
    .min(8, 'Пароль должен содержать не менее 8 символов')
    .max(128, 'Пароль должен содержать не более 128 символов')
    .regex(/[A-Za-zА-Яа-я]/, 'Пароль должен содержать хотя бы одну букву')
    .regex(/\d/, 'Пароль должен содержать хотя бы одну цифру'),
});

export const loginSchema = z.object({
  email: z.string({ error: 'email обязателен' }).trim().toLowerCase().pipe(z.email('Некорректный email')),
  password: z.string({ error: 'Пароль обязателен' }).min(1, 'Пароль обязателен'),
});
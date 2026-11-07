import { z } from 'zod';

// Жанры и режиссёры
export const genreSchema = z.object({
  name: z.string({ error: 'Название обязательно' }).trim().min(2, 'Название не короче 2 символов').max(50, 'Название не длиннее 50 символов'),
});

export const directorSchema = z.object({
  name: z.string({ error: 'Имя обязательно' }).trim().min(2, 'Имя не короче 2 символов').max(100, 'Имя не длиннее 100 символов'),
});
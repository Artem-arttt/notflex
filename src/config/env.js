// Чтение и проверка переменных окружения (.env подгружается флагом --env-file)
const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  throw new Error(`Не заданы переменные окружения: ${missing.join(', ')}. Проверьте файл .env`);
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
};
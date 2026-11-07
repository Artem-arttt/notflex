// Тестовые данные для NotFlex. Запуск: npm run db:seed
import argon2 from 'argon2';
import { prisma } from '../src/config/prisma.js';

const ADMIN = { email: 'admin@notflex.local', name: 'Администратор', password: 'Admin123!' };
const USER = { email: 'user@notflex.local', name: 'Тестовый пользователь', password: 'User1234!' };

const genreNames = ['Драма', 'Комедия', 'Фантастика', 'Триллер', 'Криминал', 'Приключения', 'Фэнтези', 'Боевик'];

const directorNames = [
  'Фрэнк Дарабонт',
  'Кристофер Нолан',
  'Фрэнсис Форд Коппола',
  'Квентин Тарантино',
  'Лана и Лилли Вачовски',
  'Винс Гиллиган',
  'Дэвид Бениофф',
  'Братья Даффер',
  'Стивен Моффат',
];

const titles = [
  { name: 'Побег из Шоушенка', type: 'MOVIE', releaseYear: 1994, durationMin: 142, director: 'Фрэнк Дарабонт', genres: ['Драма'], description: 'Банкир, осуждённый за убийство, годами готовит побег из тюрьмы.' },
  { name: 'Начало', type: 'MOVIE', releaseYear: 2010, durationMin: 148, director: 'Кристофер Нолан', genres: ['Фантастика', 'Триллер', 'Боевик'], description: 'Вор, крадущий секреты из снов, получает задание внедрить идею в чужое сознание.' },
  { name: 'Интерстеллар', type: 'MOVIE', releaseYear: 2014, durationMin: 169, director: 'Кристофер Нолан', genres: ['Фантастика', 'Драма', 'Приключения'], description: 'Экипаж космонавтов отправляется через червоточину на поиски нового дома для человечества.' },
  { name: 'Крёстный отец', type: 'MOVIE', releaseYear: 1972, durationMin: 175, director: 'Фрэнсис Форд Коппола', genres: ['Криминал', 'Драма'], description: 'Сага о семье итало-американской мафии и передаче власти новому поколению.' },
  { name: 'Криминальное чтиво', type: 'MOVIE', releaseYear: 1994, durationMin: 154, director: 'Квентин Тарантино', genres: ['Криминал', 'Триллер'], description: 'Несколько переплетённых историй из жизни лос-анджелесских бандитов.' },
  { name: 'Матрица', type: 'MOVIE', releaseYear: 1999, durationMin: 136, director: 'Лана и Лилли Вачовски', genres: ['Фантастика', 'Боевик'], description: 'Хакер узнаёт, что привычный мир — компьютерная симуляция.' },
  { name: 'Во все тяжкие', type: 'SERIES', releaseYear: 2008, seasons: 5, director: 'Винс Гиллиган', genres: ['Драма', 'Криминал', 'Триллер'], description: 'Школьный учитель химии начинает производить метамфетамин.' },
  { name: 'Игра престолов', type: 'SERIES', releaseYear: 2011, seasons: 8, director: 'Дэвид Бениофф', genres: ['Фэнтези', 'Драма', 'Приключения'], description: 'Борьба знатных родов за Железный трон Семи королевств.' },
  { name: 'Очень странные дела', type: 'SERIES', releaseYear: 2016, seasons: 5, director: 'Братья Даффер', genres: ['Фантастика', 'Триллер'], description: 'В маленьком городке пропадает мальчик, а рядом появляется девочка со сверхспособностями.' },
  { name: 'Шерлок', type: 'SERIES', releaseYear: 2010, seasons: 4, director: 'Стивен Моффат', genres: ['Криминал', 'Драма'], description: 'Современная версия приключений Шерлока Холмса в Лондоне.' },
];

// [название тайтла, оценка, комментарий]
const userRatings = [
  ['Побег из Шоушенка', 10, 'Лучший фильм о надежде'],
  ['Начало', 9, 'Сюжет держит до конца'],
  ['Во все тяжкие', 10, 'Эталон сериала'],
];
const adminRatings = [
  ['Побег из Шоушенка', 9, null],
  ['Матрица', 8, 'Классика жанра'],
  ['Игра престолов', 7, 'Первые сезоны сильнее'],
];

async function upsertUser({ email, name, password }, role) {
  const passwordHash = await argon2.hash(password); // Argon2id по умолчанию
  return prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role },
    create: { email, name, passwordHash, role },
  });
}

async function main() {
  // Каталог пересоздаём с нуля, чтобы seed можно было запускать повторно.
  // RESTART IDENTITY сбрасывает нумерацию id, пользователи не затрагиваются.
  await prisma.$executeRaw`TRUNCATE TABLE "ratings", "titles", "genres", "directors" RESTART IDENTITY CASCADE`;

  const admin = await upsertUser(ADMIN, 'ADMIN');
  const user = await upsertUser(USER, 'USER');

  await prisma.genre.createMany({ data: genreNames.map((name) => ({ name })) });
  await prisma.director.createMany({ data: directorNames.map((name) => ({ name })) });

  const directors = await prisma.director.findMany();
  const directorId = Object.fromEntries(directors.map((d) => [d.name, d.id]));

  for (const t of titles) {
    await prisma.title.create({
      data: {
        name: t.name,
        type: t.type,
        description: t.description,
        releaseYear: t.releaseYear,
        durationMin: t.durationMin ?? null,
        seasons: t.seasons ?? null,
        directorId: directorId[t.director],
        genres: { connect: t.genres.map((name) => ({ name })) },
      },
    });
  }

  const all = await prisma.title.findMany();
  const titleId = Object.fromEntries(all.map((t) => [t.name, t.id]));

  const toData = (userId, list) =>
    list.map(([name, value, comment]) => ({ userId, titleId: titleId[name], value, comment }));
  await prisma.rating.createMany({
    data: [...toData(user.id, userRatings), ...toData(admin.id, adminRatings)],
  });

  console.log('Seed выполнен:');
  console.log(`  пользователей: ${await prisma.user.count()}`);
  console.log(`  жанров: ${await prisma.genre.count()}, режиссёров: ${await prisma.director.count()}`);
  console.log(`  тайтлов: ${await prisma.title.count()}, оценок: ${await prisma.rating.count()}`);
  console.log(`  admin: ${ADMIN.email} / ${ADMIN.password}`);
  console.log(`  user:  ${USER.email} / ${USER.password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
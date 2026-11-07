// Поля пользователя, которые разрешено отдавать клиенту.
// passwordHash сюда намеренно не входит.
export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
};
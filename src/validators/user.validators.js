import { z } from 'zod';

// PATCH /users/:id/role
export const changeRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'], { error: 'role должен быть USER или ADMIN' }),
});
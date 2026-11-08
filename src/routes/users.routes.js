import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validators.js';
import { changeRoleSchema } from '../validators/user.validators.js';

const router = Router();
const adminOnly = [requireAuth, requireRole('ADMIN')];

// Только для администратора
router.get('/', ...adminOnly, usersController.list);
router.patch('/:id/role', ...adminOnly, validate(idParamSchema, 'params'), validate(changeRoleSchema), usersController.changeRole);

export default router;
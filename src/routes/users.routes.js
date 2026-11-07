import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// Только для администратора
router.get('/', requireAuth, requireRole('ADMIN'), usersController.list);

export default router;
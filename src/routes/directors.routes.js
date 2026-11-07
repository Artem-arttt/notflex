import { Router } from 'express';
import * as directorsController from '../controllers/directors.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { directorSchema } from '../validators/catalog.validators.js';
import { idParamSchema } from '../validators/common.validators.js';

const router = Router();
const adminOnly = [requireAuth, requireRole('ADMIN')];

router.get('/', directorsController.list);
router.get('/:id', validate(idParamSchema, 'params'), directorsController.getById);

router.post('/', ...adminOnly, validate(directorSchema), directorsController.create);
router.patch('/:id', ...adminOnly, validate(idParamSchema, 'params'), validate(directorSchema), directorsController.update);
router.delete('/:id', ...adminOnly, validate(idParamSchema, 'params'), directorsController.remove);

export default router;
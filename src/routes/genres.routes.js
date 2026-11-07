import { Router } from 'express';
import * as genresController from '../controllers/genres.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { genreSchema } from '../validators/catalog.validators.js';
import { idParamSchema } from '../validators/common.validators.js';

const router = Router();
const adminOnly = [requireAuth, requireRole('ADMIN')];

router.get('/', genresController.list);
router.get('/:id', validate(idParamSchema, 'params'), genresController.getById);

router.post('/', ...adminOnly, validate(genreSchema), genresController.create);
router.patch('/:id', ...adminOnly, validate(idParamSchema, 'params'), validate(genreSchema), genresController.update);
router.delete('/:id', ...adminOnly, validate(idParamSchema, 'params'), genresController.remove);

export default router;
import { Router } from 'express';
import * as ratingsController from '../controllers/ratings.controller.js';
import * as titlesController from '../controllers/titles.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validators.js';
import { createRatingSchema, listRatingsQuerySchema } from '../validators/rating.validators.js';
import { createTitleSchema, listTitlesQuerySchema, updateTitleSchema } from '../validators/title.validators.js';

const router = Router();
const adminOnly = [requireAuth, requireRole('ADMIN')];

// Чтение — для всех (guest, user, admin)
router.get('/', validate(listTitlesQuerySchema, 'query'), titlesController.list);
router.get('/:id', validate(idParamSchema, 'params'), titlesController.getById);

// Изменение каталога — только admin
router.post('/', ...adminOnly, validate(createTitleSchema), titlesController.create);
router.patch('/:id', ...adminOnly, validate(idParamSchema, 'params'), validate(updateTitleSchema), titlesController.update);
router.delete('/:id', ...adminOnly, validate(idParamSchema, 'params'), titlesController.remove);

// Оценки тайтла: читать может любой, ставить — авторизованный пользователь
router.get('/:id/ratings', validate(idParamSchema, 'params'), validate(listRatingsQuerySchema, 'query'), ratingsController.listForTitle);
router.post('/:id/ratings', requireAuth, validate(idParamSchema, 'params'), validate(createRatingSchema), ratingsController.create);

export default router;
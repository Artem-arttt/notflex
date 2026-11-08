import { Router } from 'express';
import * as ratingsController from '../controllers/ratings.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validators.js';
import { updateRatingSchema } from '../validators/rating.validators.js';

const router = Router();

// Маршрут /my должен стоять раньше /:id
router.get('/my', requireAuth, ratingsController.listMine);
router.patch('/:id', requireAuth, validate(idParamSchema, 'params'), validate(updateRatingSchema), ratingsController.update);
router.delete('/:id', requireAuth, validate(idParamSchema, 'params'), ratingsController.remove);

export default router;
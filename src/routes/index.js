import { Router } from 'express';
import authRoutes from './auth.routes.js';
import directorsRoutes from './directors.routes.js';
import genresRoutes from './genres.routes.js';
import titlesRoutes from './titles.routes.js';
import usersRoutes from './users.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'NotFlex API' });
});

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/titles', titlesRoutes);
router.use('/genres', genresRoutes);
router.use('/directors', directorsRoutes);

export default router;
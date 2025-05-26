import express from 'express';
import gameRoutes from './gameRoutes';
import userRoutes from './userRoutes';

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ status: 'API is working' });
});

router.use('/games', gameRoutes)
router.use('/users', userRoutes);

export default router;

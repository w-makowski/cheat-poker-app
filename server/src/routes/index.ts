import express from 'express';
import gameRoutes from './gameRoutes';

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ status: 'API is working' });
});

router.use('/games', gameRoutes)

export default router;

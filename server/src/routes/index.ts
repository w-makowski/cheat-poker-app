import express from 'express';
import gameRoutes from './gameRoutes';
import userRoutes from './userRoutes';
import adminRoutes from "./adminRoutes";

const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ status: 'API is working' });
});

router.use('/games', gameRoutes)
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;

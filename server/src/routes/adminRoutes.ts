import express from 'express';
import { checkJwt } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import {
    getAllPlayersHandler,
    getAllGamesHandler,
    banPlayerHandler,
    deleteGameHandler,
    unbanPlayerHandler
} from '../controllers/adminController';

const router = express.Router();

router.get('/players', checkJwt, requireAdmin, getAllPlayersHandler);
router.get('/games', checkJwt, requireAdmin, getAllGamesHandler);
router.post('/banPlayer/:playerId', checkJwt, requireAdmin, banPlayerHandler);
router.delete('/deleteGame/:gameId', checkJwt, requireAdmin, deleteGameHandler);
router.post('/unbanPlayer/:playerId', checkJwt, requireAdmin, unbanPlayerHandler);

export default router;
import express, { RequestHandler } from 'express';
import {
    createGame,
    getWaitingGames,
    joinGame,
    startGame,
    getGameDetails
} from '../controllers/gameController';

const router = express.Router();

router.post('/', createGame as RequestHandler);
router.get('/waiting', getWaitingGames as RequestHandler);
router.post('/join', joinGame as RequestHandler);
router.post('/:gameId/start', startGame as RequestHandler);
router.get('/:gameId', getGameDetails as RequestHandler);

export default router;

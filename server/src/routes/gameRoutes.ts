import express, { RequestHandler } from 'express';
import { checkJwt } from '../middleware/auth';
import {
    createGame,
    getWaitingGames,
    joinGame,
    startGame,
    getGameDetails
} from '../controllers/gameController';

const router = express.Router();

router.post('/', checkJwt, createGame as RequestHandler);
router.get('/waiting', getWaitingGames as RequestHandler);
router.post('/join', checkJwt, joinGame as RequestHandler);
router.post('/:gameId/start', checkJwt, startGame as RequestHandler);
router.get('/:gameId', checkJwt, getGameDetails as RequestHandler);

export default router;

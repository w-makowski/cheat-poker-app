import express, { RequestHandler } from 'express';
import { checkJwt } from '../middleware/auth';
import { updateUsernameHandler, getMeHandler } from '../controllers/userController';

const router = express.Router();

router.get('/me', checkJwt, getMeHandler as RequestHandler);
router.patch('/username', checkJwt, updateUsernameHandler as RequestHandler);

export default router;

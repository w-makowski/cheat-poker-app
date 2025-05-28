import express, { RequestHandler } from 'express';
import { Request, Response, NextFunction } from 'express';
import { checkJwt } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();


const getMeHandler = async (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth;

    console.log('auth:', auth);

    const auth0Id = auth?.sub;
    const email = auth?.['https://cheat-poker-game-user/email'];
    const username = auth?.[process.env.AUTH0_ACCESS_TOKEN_DOMAIN+'username'];

    console.log('Email:', email);
    console.log('Username:', username);

    if (!auth0Id || !email) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }
  
    try {
      let user = await User.findOne({ where: { auth0Id } });
  
      if (!user) {
        user = await User.create({
          auth0Id,
          email,
          username: username || email.split('@')[0]
        });
      }
  
      res.json({
        id: user.id,
        username: user.username,
        email: user.email
      });
    } catch (err) {
      console.error('User fetch error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };

router.get('/me', checkJwt, getMeHandler as RequestHandler);

export default router;

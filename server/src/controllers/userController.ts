import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { generateUniqueUsername } from '../utils/utils';
import { getUserProfile } from '../repositories/userRepository';
import { get } from 'http';


export const getMeHandler = async (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth;

    console.log('auth:', auth);

    const auth0Id = auth?.sub;
    const email = auth?.[process.env.AUTH0_ACCESS_TOKEN_DOMAIN+'email'];
    // const username = auth?.[process.env.AUTH0_ACCESS_TOKEN_DOMAIN+'username'];

    console.log('Email:', email);
    // console.log('Username:', username);

    if (!auth0Id || !email) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }
  
    try {
      let user = await User.findOne({ where: { auth0Id } });
  
      if (!user) {
        const username = await generateUniqueUsername();
        console.log('Generated username:', username);
        user = await User.create({
          auth0Id,
          email,
          username: username,
            role: 'user',
            accountStatus: 'active'
        });
      }

      const userProfile = await getUserProfile(auth0Id);
      res.json({
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        gamesPlayed: userProfile.gamesPlayed,
        gamesWon: userProfile.gamesWon,
        isBanned: userProfile.isBanned
      });
    } catch (err) {
      console.error('User fetch error:', err);
      res.status(500).json({ message: 'Server error' });
    }
};

export const updateUsernameHandler = async (req: Request, res: Response) => {

    try {
        const { username } = req.body;
        const auth0Id = (req as any).auth?.sub;
    
        if (!username || typeof username !== 'string' || username.trim().length < 3) {
            return res.status(400).json({ error: 'Invalid username' });
        }
    
        const existing = await User.findOne({ where: { username } });
        if (existing) {
            return res.status(409).json({ error: 'Username already taken' });
        }
    
        const user = await User.findOne({ where: { auth0Id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
    
        user.username = username;
        await user.save();
    
        return res.status(200).json({ message: 'Username updated', username });
    } catch (error) {
        console.error('Error updating username:', error);
        res.status(500).json({ error: 'Failed to update username' });
    }
};
  
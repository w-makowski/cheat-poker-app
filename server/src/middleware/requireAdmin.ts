// server/src/middleware/requireAdmin.ts
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    const auth = (req as Request & { auth?: { sub?: string } }).auth;
    const userId = auth?.sub;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    const user = await User.findOne({ where: { auth0Id: userId } });
    if (!user || user.role !== 'admin' || user.accountStatus === 'banned') {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    next();
}
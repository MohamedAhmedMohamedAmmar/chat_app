import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userId?: string;
    username?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as any;
        req.userId = decoded.userId;
        req.username = decoded.username;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

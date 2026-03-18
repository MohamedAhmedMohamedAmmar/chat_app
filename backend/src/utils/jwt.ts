import jwt from 'jsonwebtoken';
import { IUser } from '../types';

export const generateToken = (user: IUser): string => {
    return jwt.sign(
        {
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
        },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: '7d' }
    );
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    } catch (error) {
        return null;
    }
};

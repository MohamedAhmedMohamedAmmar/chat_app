import { ObjectId } from 'mongoose';

export interface IUser {
    _id: ObjectId;
    username: string;
    email: string;
    password: string;
    avatar: string | null;
    bio: string;
    createdAt: Date;
    updatedAt: Date;
    starMessages: Array<{ message: ObjectId; starredAt: Date }>;
    isOnline: boolean;
    lastSeen: Date | null;
    comparePassword: (password: string) => Promise<boolean>;
}
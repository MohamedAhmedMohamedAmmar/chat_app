import { ObjectId } from 'mongoose';

export interface IChat {
  _id: ObjectId;
  participantIds: ObjectId[];
  lastMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

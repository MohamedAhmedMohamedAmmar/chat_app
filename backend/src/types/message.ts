import { ObjectId } from 'mongoose';

export interface IMessage {
  _id: ObjectId;
  content: string;
  sender: ObjectId;
  chatId: ObjectId;
  attachment: any | null;
  type: string;
  userReaded: ObjectId[];
  fileId?: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

import { ObjectId } from 'mongoose';

export interface IFile {
  _id: ObjectId;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploader: ObjectId;
  chatId: ObjectId;
  url: string;
  fileType: 'image' | 'video' | 'document' | 'audio' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

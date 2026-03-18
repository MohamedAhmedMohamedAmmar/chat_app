import mongoose from 'mongoose';
import { IMessage } from '../types';

const messageSchema = new mongoose.Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    userReaded: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    type:{
      type:String,
      enum:["text","image","video","file"],
      default:"text"
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      default: null,
    }
  },
  { timestamps: true }
);

// Index for faster queries
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);

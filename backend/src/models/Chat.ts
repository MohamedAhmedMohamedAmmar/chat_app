import mongoose from 'mongoose';
import { IChat } from '../types';

const chatSchema = new mongoose.Schema<IChat>(
  {
    participantIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      required: true,
      validate: {
        validator: function(v: any) {
          return v.length === 2; // Only allow 1-on-1 chats
        },
        message: 'Chat must have exactly 2 participants'
      }
    },
    lastMessage: {
      type: String,
      default: null,
    },
    
  },
  { timestamps: true }
);

// Index for faster queries
chatSchema.index({ participantIds: 1 });

export const Chat = mongoose.model<IChat>('Chat', chatSchema);

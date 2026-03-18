import mongoose from 'mongoose';
import { IFile } from '../types/file';

const fileSchema = new mongoose.Schema<IFile>(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['image', 'video', 'document', 'audio', 'other'],
      default: 'other',
    }
  },
  { timestamps: true }
);
 
// Index for faster queries
fileSchema.index({ chatId: 1 });
fileSchema.index({ uploader: 1 });
fileSchema.index({ createdAt: -1 });

export const File = mongoose.model<IFile>('File', fileSchema);

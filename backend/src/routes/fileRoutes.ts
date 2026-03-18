import { Router } from 'express';
import { uploadFile, getFile, downloadFile } from '../controller/fileController';
import { authMiddleware } from '../middleware/auth';

export const fileRouter = Router();

// Upload file
fileRouter.post('/upload', authMiddleware, uploadFile);

// Get file metadata by ID
fileRouter.get('/:fileId', authMiddleware, getFile);

// Download file by ID
fileRouter.get('/:fileId/download', authMiddleware, downloadFile);

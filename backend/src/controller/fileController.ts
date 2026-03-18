import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { File } from '../models/File';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const chatId = req.body.chatId;
        const fileArray = req.body.files || [];

        if (!chatId || fileArray.length === 0) {
            res.status(400).json({ message: 'Missing required fields: chatId or files' });
            return;
        }

        const uploadedFiles: any[] = [];
        if (fileArray.length > 0) {
            for (const file of fileArray) {
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    res.status(400).json({ message: `File ${file.name || file.filename} exceeds the 10MB size limit` });
                    return;
                }
            }
        }
        // Process each file
        for (const fileData of fileArray) {
            const fileId = new mongoose.Types.ObjectId();
            
            // Ensure uploads directory exists
            const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            const fileDoc = new File({
                filename: fileData.name || fileData.filename,
                originalName: fileData.name || fileData.filename,
                mimetype: fileData.type || 'application/octet-stream',
                size: fileData.size || 0,
                fileType: detectFileType(fileData.type),
                url: `/api/files/${fileId}/download`,
                uploader: new mongoose.Types.ObjectId(req.userId),
                chatId: new mongoose.Types.ObjectId(chatId),
                _id: fileId,
            });
            const filePath = path.join(uploadDir, fileId.toString());
            fs.writeFileSync(filePath, Buffer.from(fileData.data, 'base64'));
            await fileDoc.save();
            uploadedFiles.push({
                _id: fileDoc._id,
                filename: fileDoc.filename,
                originalName: fileDoc.originalName,
                mimetype: fileDoc.mimetype,
                size: fileDoc.size,
                fileType: fileDoc.fileType,
                url: fileDoc.url,
            });
        }

        res.status(201).json(uploadedFiles);
    } catch (error: any) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
};

export const getFile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { fileId } = req.params;

        const file = await File.findById(fileId);
        if (!file) {
            res.status(404).json({ message: 'File not found' });
            return;
        }

        // Return file metadata
        res.json({
            _id: file._id,
            filename: file.filename,
            originalName: file.originalName,
            mimetype: file.mimetype,
            size: file.size,
            fileType: file.fileType,
            url: file.url,
            uploader: file.uploader,
            chatId: file.chatId,
            createdAt: file.createdAt,
        });
    } catch (error: any) {
        console.error('Error fetching file:', error);
        res.status(500).json({ message: 'Error fetching file', error: error.message });
    }
};

export const downloadFile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { fileId } = req.params;

        const file = await File.findById(fileId);
        if (!file) {
            res.status(404).json({ message: 'File not found in database' });
            return;
        }

        const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
        const filePath = path.join(uploadDir, file._id.toString());

        // Check if file exists on disk
        if (!fs.existsSync(filePath)) {
            console.error(`File not found at path: ${filePath}`);
            res.status(404).json({ message: 'File data not available on disk', path: filePath });
            return;
        }

        // Read file from disk
        const fileData = fs.readFileSync(filePath);

        // Set response headers for file download
        res.setHeader('Content-Type', file.mimetype);
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Length', file.size.toString());

        // Send file data
        res.send(fileData);
    } catch (error: any) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Error downloading file', error: error.message });
    }
};

// Helper function to detect file type
const detectFileType = (mimetype: string): string => {
    if (!mimetype) return 'other';
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('word') || mimetype.includes('spreadsheet')) {
        return 'document';
    }
    return 'other';
};

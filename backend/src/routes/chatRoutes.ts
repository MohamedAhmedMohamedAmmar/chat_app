import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
    createChat,
    getUserChats,
    getChatMessages,
    deleteChat,
    downloadChat,
} from '../controller/chatController';

const router = Router();

router.post('/', authMiddleware, createChat);
router.get('/', authMiddleware, getUserChats);
router.get('/:chatId/messages', authMiddleware, getChatMessages);
// export chat history as a text file
router.get('/:chatId/download', authMiddleware, downloadChat);
router.delete('/:chatId', authMiddleware, deleteChat);

export default router;

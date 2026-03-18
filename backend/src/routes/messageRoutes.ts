import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
    sendMessage,
    editMessage,
    deleteMessage,
    markMessageAsRead,
} from '../controller/messageController';

const router = Router();

router.post('/', authMiddleware, sendMessage);
router.put('/:messageId', authMiddleware, editMessage);
router.delete('/:messageId', authMiddleware, deleteMessage);
router.patch('/:messageId/read', authMiddleware, markMessageAsRead);

export default router;

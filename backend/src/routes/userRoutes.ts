import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
    registerUser,
    loginUser,
    getProfile,
    // updateProfile,
    // getFriends,
    // addFriend,
    // requestPasswordReset,
    // verifyResetCode,
    // confirmPasswordReset,
    searchUsers,
    addStarMessage,
    removeStarMessage,
    getStarredMessages,
    
} from '../controller/userController';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// router.post('/reset-password/request', requestPasswordReset);
// router.post('/reset-password/verify', verifyResetCode);
// router.post('/reset-password/confirm', confirmPasswordReset);
router.get('/profile', authMiddleware, getProfile);
// router.put('/profile', authMiddleware, updateProfile);
router.post('/search', authMiddleware, searchUsers);
router.put('/message/star', authMiddleware, addStarMessage);
router.put('/message/removeStar', authMiddleware, removeStarMessage);
router.post('/message/starred', authMiddleware, getStarredMessages);
export default router;

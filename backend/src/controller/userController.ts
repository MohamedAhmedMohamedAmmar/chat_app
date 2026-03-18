import { Request, Response } from 'express';
import { User } from '../models/User';
import bcryptjs from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { Message } from '../models/Message';

// In-memory store for password reset codes
// In production, use a database with TTL
const resetCodes = new Map<string, { code: string; expiresAt: number }>();

const generateResetCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const registerUser = async (req: Request, res: Response) => {
    try {
        console.log('Registering user with data:', req.body);
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ username, email, password });
        await user.save();

        const token = generateToken(user);
        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: { _id: user._id, username: user.username, email: user.email }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user);
        res.json({ 
            message: 'Login successful',
            token,
            user: { _id: user._id, username: user.username, email: user.email }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// export const requestPasswordReset = async (req: Request, res: Response) => {
//     try {
//         const { email } = req.body;

//         const user = await User.findOne({ email });
//         if (!user) {
//             // Don't reveal if email exists for security
//             return res.status(200).json({ 
//                 message: 'If an account exists with this email, a reset code will be sent',
//                 mockCode: '123456' // For testing only
//             });
//         }

//         const code = generateResetCode();
//         const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
        
//         resetCodes.set(email, { code, expiresAt });

//         // In production, send email here with the code
//         console.log(`Reset code for ${email}: ${code}`);

//         res.json({ 
//             message: 'A reset code has been sent to your email',
//             // For testing: mockCode should be removed in production
//             mockCode: code
//         });
//     } catch (error: any) {
//         res.status(500).json({ message: 'Error requesting password reset', error: error.message });
//     }
// };

// export const verifyResetCode = async (req: Request, res: Response) => {
//     try {
//         const { email, code } = req.body;

//         const storedData = resetCodes.get(email);
        
//         if (!storedData) {
//             return res.status(400).json({ message: 'No reset code found for this email' });
//         }

//         if (Date.now() > storedData.expiresAt) {
//             resetCodes.delete(email);
//             return res.status(400).json({ message: 'Reset code has expired' });
//         }

//         if (storedData.code !== code) {
//             return res.status(400).json({ message: 'Invalid reset code' });
//         }

//         res.json({ message: 'Reset code verified successfully' });
//     } catch (error: any) {
//         res.status(500).json({ message: 'Error verifying reset code', error: error.message });
//     }
// };

// export const confirmPasswordReset = async (req: Request, res: Response) => {
//     try {
//         const { email, code, newPassword } = req.body;

//         const storedData = resetCodes.get(email);
        
//         if (!storedData) {
//             return res.status(400).json({ message: 'No reset code found for this email' });
//         }

//         if (Date.now() > storedData.expiresAt) {
//             resetCodes.delete(email);
//             return res.status(400).json({ message: 'Reset code has expired' });
//         }

//         if (storedData.code !== code) {
//             return res.status(400).json({ message: 'Invalid reset code' });
//         }

//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Update password (pre-save hook will hash it)
//         user.password = newPassword;
//         await user.save();

//         // Clean up the reset code
//         resetCodes.delete(email);

//         res.json({ message: 'Password reset successfully' });
//     } catch (error: any) {
//         res.status(500).json({ message: 'Error resetting password', error: error.message });
//     }
// };

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
    try {
        console.log('Searching users with query:', req.body);
        
        const {username} = req.body;
        if (!username) {
            return res.status(400).json({ message: 'Search query required' });
        }
        const users = await User.findOne({username}).select('username email avatar');
        if (!users) {
            return res.status(404).json({ message: 'No users found' });
        }
        
        return res.json(users);
    }
    catch (error: any) {
        res.status(500).json({ message: 'Error searching users', error: error.message });
    }
};

export const addStarMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { messageId } = req.body;
        const isMassegeFound = await Message.findById(messageId);
        if (!isMassegeFound) {
            return res.status(404).json({ message: 'Message not found' });
        }
        const user = await User.findOneAndUpdate(
            { _id: req.userId },
            { $push: { starMessages: { message: messageId, starredAt: new Date() } } },
            { new: true }
        ).populate({ path: 'starMessages.message', select: 'sender chatId content createdAt' });
        if (!user) {
            return res.status(400).json({ message: 'Message already starred' });
        }
        res.json({ message: 'Message starred', user });
    }
    catch (error: any) {
        res.status(500).json({ message: 'Error starring message', error: error.message });
    }
};

export const removeStarMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { messageId } = req.body;
            const isMassegeFound = await Message.findById(messageId);
        if (!isMassegeFound) {
            return res.status(404).json({ message: 'Message not found' });
        }
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $pull: { starMessages: { message: messageId } } },
            { new: true }
        ).populate({ path: 'starMessages.message', select: 'sender chatId content createdAt' });
        if (!user) {
            return res.status(404).json({ message: 'Message not found in starred messages' });
        }
        res.json({ message: 'Message unstarred', user });
    }
    catch (error: any) {
        res.status(500).json({ message: 'Error unstarring message', error: error.message });
    }
};

export const getStarredMessages = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.userId)
            .populate({ path: 'starMessages.message', select: 'sender chatId content createdAt' });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // convert to simpler structure
        const starred = (user.starMessages || []).map((entry: any) => ({
            _id: (entry.message && entry.message._id) ? entry.message._id : entry.message,
            starredAt: entry.starredAt,
        }));
        res.json({ starredMessages: starred });
    }
    catch (error: any) {
        res.status(500).json({ message: 'Error fetching starred messages', error: error.message });
    }
};

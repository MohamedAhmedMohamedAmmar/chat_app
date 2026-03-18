import { Response } from 'express';
import { Message } from '../models/Message';
import { Chat } from '../models/Chat';
import { File } from '../models/File';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Auto-friend helper function
const autoFriendUsers = async (userId: string, chatId: string) => {
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        for (const participantId of chat.participantIds) {
            if (participantId.toString() !== userId) {
                // Add participant to user's friends
                await User.findByIdAndUpdate(
                    userId,
                    { $addToSet: { friends: participantId } }
                );
                
                // Add user to participant's friends
                await User.findByIdAndUpdate(
                    participantId,
                    { $addToSet: { friends: userId } }
                );
            }
        }
    } catch (error) {
        console.error('Error auto-friending users:', error);
    }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { chatId, content, attachment, type = 'text', fileId } = req.body;

        if (!chatId || !req.userId) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const message = new Message({
            sender: req.userId,
            chatId,
            content,
            attachment: attachment || null,
            type,
            fileId: fileId || null,
            userReaded: [req.userId],
        });

        await message.save();
        await Chat.findByIdAndUpdate(chatId, { lastMessage: content });
        
        // Auto-friend chat participants
        await autoFriendUsers(req.userId, chatId);

        const populatedMessage = await message
            .populate('sender', 'username avatar');
        
        res.status(201).json(populatedMessage);
    } catch (error: any) {
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
};

export const editMessage = async (req: AuthRequest, res: Response): Promise<void> => {
try {
        const { messageId } = req.params;
        const { content } = req.body;

        const message = await Message.findByIdAndUpdate(
            messageId,
            { content },
            { new: true }
        ).populate('sender', 'username avatar');

        res.json(message);
    } catch (error: any) {
        res.status(500).json({ message: 'Error editing message', error: error.message });
    }
};

export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { messageId } = req.params;
        
        // Find message and delete associated file if exists
        const message = await Message.findById(messageId);
        if (message?.fileId) {
            await File.findByIdAndDelete(message.fileId);
        }

        await Message.findByIdAndDelete(messageId);

        res.json({ message: 'Message deleted' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting message', error: error.message });
    }
};

export const markMessageAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { messageId } = req.params;
        
        const message = await Message.findByIdAndUpdate(
            messageId,
            { $addToSet: { userReaded: req.userId } },
            { new: true }
        ).populate('sender', 'username avatar');

        res.json(message);
    } catch (error: any) {
        res.status(500).json({ message: 'Error marking message as read', error: error.message });
    }
};

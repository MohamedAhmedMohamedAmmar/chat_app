import { Response } from 'express';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import { File } from '../models/File';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Auto-friend users when chat is created
const autoFriendUsers = async (participantIds: any[]) => {
    try {
        for (let i = 0; i < participantIds.length; i++) {
            for (let j = i + 1; j < participantIds.length; j++) {
                const user1 = participantIds[i];
                const user2 = participantIds[j];
                
                // Add user2 to user1's friends
                await User.findByIdAndUpdate(
                    user1,
                    { $addToSet: { friends: user2 } }
                );
                
                // Add user1 to user2's friends
                await User.findByIdAndUpdate(
                    user2,
                    { $addToSet: { friends: user1 } }
                );
            }
        }
    } catch (error) {
        console.error('Error auto-friending users:', error);
    }
};

export const createChat = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { participantIds } = req.body;
        
        // Only allow 1-on-1 chats
        if (!participantIds || participantIds.length !== 1) {
            res.status(400).json({ message: 'Please provide exactly one other participant for 1-on-1 chat' });
            return;
        }

        const allParticipants = [req.userId, participantIds[0]];
        
        // Check if chat already exists
        const existingChat = await Chat.findOne({
            participantIds: { $all: allParticipants, $size: 2 }
        });
        
        if (existingChat) {
            res.status(200).json({ message: 'Chat exists', chat: existingChat });
            return;
        }

        const chat = new Chat({
            participantIds: allParticipants,
        });

        await chat.save();
        
        // Auto-friend both participants
        await autoFriendUsers(allParticipants);

        res.status(201).json({ message: 'Chat created', chat });
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating chat', error: error.message });
    }
};

export const getUserChats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const chats = await Chat.find({ participantIds: req.userId })
            .populate('participantIds', 'username avatar isOnline lastSeen')
            .sort({ updatedAt: -1 });

        res.json(chats);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching chats', error: error.message });
    }
};

export const getChatMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { chatId } = req.params;
        const messages = await Message.find({ chatId })
            .populate('sender', 'username avatar')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
};

export const deleteChat = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { chatId } = req.params;
        
        // Find all messages and delete associated files
        const messages = await Message.find({ chatId });
        const fileIds = messages
            .filter(msg => msg.fileId)
            .map(msg => msg.fileId);
        
        // Delete files from database
        if (fileIds.length > 0) {
            await File.deleteMany({ _id: { $in: fileIds } });
        }
        
        // Delete all messages for this chat
        await Message.deleteMany({ chatId });
        
        // Delete the chat
        await Chat.findByIdAndDelete(chatId);

        res.json({ message: 'Chat deleted successfully for all users' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting chat', error: error.message });
    }
};

// Allows a user to download the entire chat history as a text file
export const downloadChat = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { chatId } = req.params;
        const messages = await Message.find({ chatId })
            .populate('sender', 'username')
            .sort({ createdAt: 1 });

        let exportText = '';
        messages.forEach(msg => {
            const time = msg.createdAt.toISOString();
            const sender = (msg.sender as any)?.username || 'Unknown';
            let content = msg.content;
            if (msg.fileId && msg.content) {
                content += ` [file: ${msg.content}]`;
            }
            exportText += `[${time}] ${sender}: ${content}\n`;
        });

        res.setHeader('Content-Disposition', `attachment; filename="chat-${chatId}.txt"`);
        res.setHeader('Content-Type', 'text/plain');
        res.send(exportText);
    } catch (error: any) {
        res.status(500).json({ message: 'Error exporting chat', error: error.message });
    }
};

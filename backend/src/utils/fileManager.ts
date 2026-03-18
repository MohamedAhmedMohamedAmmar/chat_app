import { File as FileModel } from '../models/File';
import { Message } from '../models/Message';
import { Chat } from '../models/Chat';
import { User } from '../models/User';
import { ObjectId } from 'mongoose';

/**
 * Delete all files associated with a chat
 */
export const deleteFilesByChat = async (chatId: string) => {
  try {
    const files = await FileModel.find({ chatId });
    
    if (files.length > 0) {
      const fileIds = files.map(f => f._id);
      // Delete from File collection
      await FileModel.deleteMany({ chatId });
      // Remove references from messages
      await Message.updateMany(
        { fileId: { $in: fileIds } },
        { $unset: { fileId: 1 } }
      );
    }
  } catch (error) {
    console.error('Error deleting files for chat:', error);
  }
};

/**
 * Delete all files associated with a user
 */
export const deleteFilesByUser = async (userId: string) => {
  try {
    const files = await FileModel.find({ uploader: userId });
    
    if (files.length > 0) {
      const fileIds = files.map(f => f._id);
      await FileModel.deleteMany({ uploader: userId });
      await Message.updateMany(
        { fileId: { $in: fileIds } },
        { $unset: { fileId: 1 } }
      );
    }
  } catch (error) {
    console.error('Error deleting files for user:', error);
  }
};

/**
 * Delete files by specific IDs
 */
export const deleteFilesByIds = async (fileIds: ObjectId[]) => {
  try {
    if (fileIds.length === 0) return;
    
    await FileModel.deleteMany({ _id: { $in: fileIds } });
    await Message.updateMany(
      { fileId: { $in: fileIds } },
      { $unset: { fileId: 1 } }
    );
  } catch (error) {
    console.error('Error deleting files by IDs:', error);
  }
};

/**
 * Auto-friend all users in a chat
 */
export const autoFriendChatUsers = async (chatId: string) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participantIds) return;

    const participants = chat.participantIds;
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        const user1Id = participants[i];
        const user2Id = participants[j];
        
        // Add user2 to user1's friends
        await User.findByIdAndUpdate(
          user1Id,
          { $addToSet: { friends: user2Id } }
        );
        
        // Add user1 to user2's friends
        await User.findByIdAndUpdate(
          user2Id,
          { $addToSet: { friends: user1Id } }
        );
      }
    }
  } catch (error) {
    console.error('Error auto-friending chat users:', error);
  }
};

/**
 * Remove friendships between users who no longer chat
 */
export const removeFriendsFromDeletedChat = async (chatId: string, participantIds: ObjectId[]) => {
  try {
    // This could be more sophisticated - checking if users have other chats together
    // For now, we'll keep friends but could update based on business logic
    console.log('Chat deleted. Users remain friends.');
  } catch (error) {
    console.error('Error removing friends:', error);
  }
};

/**
 * Get all files in a chat
 */
export const getChatFiles = async (chatId: string) => {
  try {
    return await FileModel.find({ chatId })
      .populate('uploader', 'username avatar')
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error fetching chat files:', error);
    return [];
  }
};

/**
 * Get unread messages for a user in a chat
 */
export const getUnreadMessages = async (chatId: string, userId: string) => {
  try {
    return await Message.find({
      chatId,
      userReaded: { $ne: userId }
    }).populate('sender', 'username avatar');
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    return [];
  }
};

/**
 * Mark all messages as read for a user in a chat
 */
export const markChatAsRead = async (chatId: string, userId: string) => {
  try {
    const result = await Message.updateMany(
      { chatId },
      { $addToSet: { userReaded: userId } }
    );
    return result;
  } catch (error) {
    console.error('Error marking chat as read:', error);
    throw error;
  }
};

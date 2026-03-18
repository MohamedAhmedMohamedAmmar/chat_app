import { Server, Socket } from "socket.io";
import parseCookies from "../controller/parseCookies";
import StorageSocket from "./storage";
import { Message } from "../models/Message";
import { Chat } from "../models/Chat";
import { User } from "../models/User";
import { File as FileModel } from "../models/File";
import { deleteFilesByChat } from "../utils/fileManager";
import mongoose from "mongoose";

export default function InitSocket(io: Server) {
    io.on("connection", (socket: Socket) => {
        console.log("a user connected:", socket.id);
        
        socket.on("auth",async (token: string) => {
            try {
                const cookie = parseCookies(token);
                if (!cookie) {
                    console.log("Invalid token");
                    socket.emit("auth:error", { message: "Invalid token" });
                    socket.disconnect(true);
                    return;
                }
                
                // Update user's online status and lastSeen in database
                await User.findByIdAndUpdate(
                    cookie.userId,
                    {
                        isOnline: true,
                        lastSeen: new Date()
                    },
                    { new: true }
                );
                
                StorageSocket.setItem(cookie.userId, {
                    userId: cookie.userId,
                    userName: cookie.username,
                    soketId: socket.id,
                    isOnline: true,
                    lastSeen: new Date(),
                });
                (socket as any).userId = cookie.userId;
                (socket as any).username = cookie.username;
                console.log("User authenticated:", cookie.username);
                
                // Broadcast user online status to all connected clients
                io.emit("user:online", { 
                    userId: cookie.userId, 
                    username: cookie.username,
                    isOnline: true,
                    lastSeen: new Date()
                });
                
                socket.emit("auth:success", { 
                    userId: cookie.userId, 
                    username: cookie.username,
                    isOnline: true 
                });
            } catch (error) {
                console.error("Auth error:", error);
                socket.emit("auth:error", { message: "Authentication failed" });
            }
        });

        // Join chat room
        socket.on("chat:join", async (chatId: string) => {
            const userId = (socket as any).userId;
            if (!userId) {
                socket.emit("chat:error", { message: "Not authenticated" });
                return;
            }
            if (!chatId) {
                socket.emit("chat:error", { message: "chatId is required" });
                return;
            }
            if (!mongoose.Types.ObjectId.isValid(chatId)) {
                socket.emit("chat:error", { message: "Invalid chatId" });
                return;
            }

            const chat = await Chat.findById(chatId);
            if (!chat) {
                socket.emit("chat:error", { message: "Chat not found" });
                return;
            }
            const isParticipant = chat.participantIds
                .map((id) => id.toString())
                .includes(userId);
            if (!isParticipant) {
                socket.emit("chat:error", { message: "Unauthorized to join this chat" });
                return;
            }

            socket.join(`chat:${chatId}`);
            console.log(`User ${userId} joined chat ${chatId}`);
            socket.emit("chat:joined", { chatId });
        });

        // Leave chat room
        socket.on("chat:leave", (chatId: string) => {
            const userId = (socket as any).userId;
            if (!userId) {
                return;
            }
            if (!chatId) return;
            socket.leave(`chat:${chatId}`);
            console.log(`User ${userId} left chat ${chatId}`);
        });

        // Create new chat
        socket.on("chat:create", async (data: any) => {
            try {
                const { recipientId } = data;
                const userId = (socket as any).userId;

                if (!recipientId || !userId) {
                    socket.emit("chat:error", { message: "Missing required fields" });
                    return;
                }

                // Check if chat already exists
                const existingChat = await Chat.findOne({
                    participantIds: { $all: [userId, recipientId], $size: 2 }
                });

                if (existingChat) {
                    socket.emit("chat:created", {
                        chatId: existingChat._id,
                        exists: true
                    });
                    return;
                }

                // Create new chat
                const newChat = new Chat({
                    participantIds: [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(recipientId)]
                });

                await newChat.save();
                const populatedChat = await newChat.populate("participantIds", "username avatar email isOnline lastSeen");

                // Notify both users
                socket.emit("chat:created", {
                    chatId: newChat._id,
                    chat: populatedChat,
                    exists: false
                });

                // Notify the other user - broadcast to all other connected clients
                socket.broadcast.emit("chat:created", {
                    chatId: newChat._id,
                    chat: populatedChat,
                    exists: false
                });

                console.log("Chat created:", newChat._id);
            } catch (error: any) {
                console.error("Error creating chat:", error);
                socket.emit("chat:error", { message: "Error creating chat", error: error.message });
            }
        });

        // Delete chat
        socket.on("chat:delete", async (data: any) => {
            try {
                const { chatId } = data;
                const userId = (socket as any).userId;

                if (!chatId || !userId) {
                    socket.emit("chat:error", { message: "Missing required fields" });
                    return;
                }

                const chat = await Chat.findById(chatId);
                if (!chat) {
                    socket.emit("chat:error", { message: "Chat not found" });
                    return;
                }

                // Check if user is a participant
                if (!chat.participantIds.map(id => id.toString()).includes(userId)) {
                    socket.emit("chat:error", { message: "Unauthorized" });
                    return;
                }

                // Delete all messages associated with this chat
                await Message.deleteMany({ chatId });

                // Delete all files associated with this chat
                await deleteFilesByChat(chatId);

                // Delete the chat
                await Chat.findByIdAndDelete(chatId);

                // Notify all connected clients
                socket.emit("chat:deleted", { chatId });
                socket.broadcast.emit("chat:deleted", { chatId });

                // Remove everyone from the chat room
                io.to(`chat:${chatId}`).emit("chat:deleted", { chatId });

                console.log("Chat deleted:", chatId, "- All messages and files removed");
            } catch (error: any) {
                console.error("Error deleting chat:", error);
                socket.emit("chat:error", { message: "Error deleting chat", error: error.message });
            }
        });

        // Send message - Save to DB and broadcast to chat room
        socket.on("message:send", async (data: any, callback: any) => {
            try {
                const { chatId, content, type = 'text', fileId } = data;
                const userId = (socket as any).userId;

                if (!chatId || !content || !userId) {
                    const err = { message: "Missing required fields" };
                    socket.emit("message:error", err);
                    if (typeof callback === "function") callback({ success: false, error: err });
                    return;
                }

                if (!mongoose.Types.ObjectId.isValid(chatId)) {
                    const err = { message: "Invalid chatId" };
                    socket.emit("message:error", err);
                    if (typeof callback === "function") callback({ success: false, error: err });
                    return;
                }

                if (fileId && !mongoose.Types.ObjectId.isValid(fileId)) {
                    const err = { message: "Invalid fileId" };
                    socket.emit("message:error", err);
                    if (typeof callback === "function") callback({ success: false, error: err });
                    return;
                }

                // Check if chat exists
                const chat = await Chat.findById(chatId);
                if (!chat) {
                    const err = { message: "Chat not found" };
                    socket.emit("message:error", err);
                    if (typeof callback === "function") callback({ success: false, error: err });
                    return;
                }
                if (!chat.participantIds.map((id: any) => id.toString()).includes(userId)) {
                    const err = { message: "You are not a participant of this chat" };
                    socket.emit("message:error", err);
                    if (typeof callback === "function") callback({ success: false, error: err });
                    return;
                }

                // Create and save message
                const message = new Message({
                    sender: new mongoose.Types.ObjectId(userId),
                    chatId: new mongoose.Types.ObjectId(chatId),
                    content,
                    type: type || 'text',
                    fileId: fileId ? new mongoose.Types.ObjectId(fileId) : null,
                });
                console.log(`message:send - Saving message to DB: ${message._id}, chatId: ${chatId}, sender: ${userId}, content: ${content}, type: ${type}, fileId: ${fileId}`);
                
                await message.save();
                const populatedMessage = await message.populate("sender", "username avatar email");

                // Update chat's last message
                await Chat.findByIdAndUpdate(chatId, { lastMessage: content });

                // Emit to all OTHER users in the chat room (NOT the sender)
                socket.broadcast.to(`chat:${chatId}`).emit("message:receive", populatedMessage.toJSON());

                // Return saved message to sender via callback
                if (typeof callback === "function") callback({ success: true, message: populatedMessage.toJSON() });

                console.log("Message sent:", populatedMessage._id);
            } catch (error: any) {
                console.error("Error sending message:", error);
                const err = { message: "Error sending message", error: error.message };
                socket.emit("message:error", err);
                if (typeof callback === "function") callback({ success: false, error: err });
            }
        });


        socket.on("disconnect", async () => {
            const userId = (socket as any).userId;
            const username = (socket as any).username;
            console.log("user disconnected:", socket.id);
            
            // Update user's offline status and lastSeen in database
            if (userId) {
                await User.findByIdAndUpdate(
                    userId,
                    {
                        isOnline: false,
                        lastSeen: new Date()
                    },
                    { new: true }
                ).catch(err => console.error("Error updating user offline status:", err));
            }
            
            // Broadcast user offline status
            io.emit("user:offline", { 
                userId: userId,
                username: username,
                isOnline: false,
                lastSeen: new Date()
            });
            
            StorageSocket.removeItem(userId || socket.id);
        });

        // Get all online users
        socket.on("users:getOnline", () => {
            const onlineUsers = StorageSocket.getAllOnlineUsers();
            socket.emit("users:online", onlineUsers);
        });

    });
}
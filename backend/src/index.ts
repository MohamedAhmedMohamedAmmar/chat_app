import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db";
import InitSocket from "./config/event";

import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import { fileRouter } from "./routes/fileRoutes";
import rateLimit from "express-rate-limit";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        credentials: true,
    },
});
// express.
// Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.set('trust proxy', true);
//app.use(limiter);
app.use(cors({ credentials: true,  origin: process.env.CLIENT_URL || '*' }));
app.set("Access-Control-Allow-Origin",process.env.CLIENT_URL || 'http://localhost:3000')

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
io.use((socket, next) => {
    const cookie = socket.handshake.headers.cookie;
        if (!cookie) {
            console.log("No token provided in handshake");
            socket.emit("auth:error", { message: "No token provided" });
            socket.disconnect(true);
            return;
        }
        next();
});
// Connect to DB
connectDB();

// Socket.IO initialization
InitSocket(io); 
 
// Routes
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/files", fileRouter);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ message: "Server is running" });
});
console.log("updated backend/index.ts with health checkroute and error handling middleware");

// Error handling middleware 
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.message || "Internal server error" });
});

httpServer.listen(process.env.PORT || 5001, () => {
    console.log(`Server is running on port ${process.env.PORT || 5001}`);
    console.log(`WebSocket server ready on ws://localhost:${process.env.PORT || 5001}`);
});  

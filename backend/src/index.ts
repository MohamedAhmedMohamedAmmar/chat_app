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

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.set("trust proxy", 1);

// ✅ Fix 1: Replace app.set("Access-Control-Allow-Origin") with proper CORS middleware
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (origin === CLIENT_URL) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 204,
};

app.use(limiter);
app.use(cors(corsOptions));

// ✅ Fix 2: Handle OPTIONS preflight explicitly
app.options("*", cors(corsOptions));

// ✅ Fix 3: Set security & referrer-policy headers
app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// io.use((socket, next) => {
//   const cookie = socket.handshake.headers.cookie;
//   if (!cookie) {
//     console.log("No token provided in handshake");
//     socket.emit("auth:error", { message: "No token provided" });
//     socket.disconnect(true);
//     return;
//   }
//   next();
// });

connectDB();
InitSocket(io);

app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/files", fileRouter);

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Internal server error" });
  }
);

httpServer.listen(process.env.PORT || 5001, () => {
  console.log(`Server is running on port ${process.env.PORT || 5001}`);
  console.log(
    `WebSocket server ready on ws://localhost:${process.env.PORT || 5001}`
  );
});

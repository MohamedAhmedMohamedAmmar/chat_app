import mongoose from "mongoose";
export default function connectDB  ()  {

    mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/chat-app", {
    }).then(() => {
        console.log("Connected to MongoDB");
    }).catch((error) => {
        console.error("MongoDB connection error:", error);
        // process.exit(1);
    });
}
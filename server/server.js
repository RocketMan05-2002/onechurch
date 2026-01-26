import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { createServer } from "http";
import { initializeSocket } from "./socket/socket.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // e.g., http://localhost:5173
    credentials: true,
  }),
);

// Database Connection
console.log("Connecting to MongoDB at:", process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
import userRouter from "./routers/user.routes.js";
import ministerRouter from "./routers/minister.routes.js";
import postRouter from "./routers/post.routes.js";
import tweetRouter from "./routers/tweet.routes.js";
import searchRouter from "./routers/search.routes.js";
import storyRouter from "./routers/story.routes.js";
import exploreRouter from "./routers/explore.routes.js";
import commentRouter from "./routers/comment.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/ministers", ministerRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/stories", storyRouter);
app.use("/api/v1/explore", exploreRouter);
app.use("/api/v1/comments", commentRouter);

// Health Check
app.get("/", (req, res) => {
  res.send("OneChurch API is running...");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start Server
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready`);
});

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
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CORS_ORIGIN,
  "https://believers-ark.vercel.app/", // Add your explicit Vercel domain here if known
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.includes("vercel.app")
      ) {
        // Trust the origin if it's in our list or is a vercel preview
        callback(null, true);
      } else {
        // For development, you might want to log this to debug connection issues
        console.log("Blocked by CORS:", origin);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
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

// Health check endpoint for keep-alive
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
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

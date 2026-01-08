import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // e.g., http://localhost:5173
    credentials: true,
  })
);
// adding the universal error handler that handles any error passed by next(error) wherever in the whole code base
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Database Connection
// Database Connection
console.log("Connecting to MongoDB at:", process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.error(" MongoDB Connection Error:", err));

// Routes
import userRouter from "./routers/user.routes.js";
import churchRouter from "./routers/church.routes.js";
import postRouter from "./routers/post.routes.js";
import searchRouter from "./routers/search.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/churches", churchRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/search", searchRouter);

// Health Check
app.get("/", (req, res) => {
  res.send("OneChurch API is running...");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(" Error:", err);
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
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

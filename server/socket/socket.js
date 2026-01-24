import { Server } from "socket.io";

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join user-specific room
    socket.on("join", (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join feed room (for general updates)
    socket.on("join-feed", () => {
      socket.join("feed");
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ Client disconnected: ${socket.id}, Reason: ${reason}`);
    });

    socket.on("error", (error) => {
      console.error(` Socket error for ${socket.id}:`, error);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Event emitters for different actions
export const emitNewPost = (post) => {
  if (io) {
    io.to("feed").emit("new-post", post);
  }
};

export const emitNewTweet = (tweet) => {
  if (io) {
    io.to("feed").emit("new-tweet", tweet);
  }
};

export const emitNewStory = (story) => {
  if (io) {
    io.to("feed").emit("new-story", story);
  }
};

export const emitPostLike = (postId, likeCount) => {
  if (io) {
    io.to("feed").emit("post-liked", { postId, likeCount });
  }
};

export const emitTweetLike = (tweetId, likes) => {
  if (io) {
    io.to("feed").emit("tweet-liked", { tweetId, likes });
  }
};

export const emitNewComment = (tweetId, comment) => {
  if (io) {
    io.to("feed").emit("new-comment", { tweetId, comment });
  }
};

export const emitNewRetweet = (retweet) => {
  if (io) {
    io.to("feed").emit("new-retweet", retweet);
  }
};

export const emitNewFollow = (followerId, followingId) => {
  if (io) {
    // Notify the person being followed
    io.to(`user:${followingId}`).emit("new-follower", { followerId });
  }
};

export const emitUnfollow = (followerId, followingId) => {
  if (io) {
    io.to(`user:${followingId}`).emit("unfollowed", { followerId });
  }
};

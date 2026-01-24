import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      trim: true,
      maxlength: [280, "Tweet cannot exceed 280 characters"],
      default: "",
    },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ["image", "video"], default: "image" },
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "authorModel",
    },
    authorModel: {
      type: String,
      required: true,
      enum: ["User", "Minister"],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "comments.userModel",
        },
        userModel: {
          type: String,
          enum: ["User", "Minister"],
        },
        text: { type: String, required: true, maxlength: 280 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    retweets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "retweetModel",
      },
    ],
    retweetModel: {
      type: String,
      enum: ["User", "Minister"],
    },
    shares: {
      type: Number,
      default: 0,
    },
    // For retweets: reference to original tweet
    originalTweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
    },
    isRetweet: {
      type: Boolean,
      default: false,
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet",
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Tweet = mongoose.model("Tweet", tweetSchema);

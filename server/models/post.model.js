import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    body: {
      type: String,
      trim: true,
      maxlength: [5000, "Post body cannot exceed 5000 characters"],
    },
    media: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["image", "video", "document"],
          required: true,
        },
        thumbnail: { type: String },
        duration: { type: Number },
        size: { type: Number },
      },
    ],
    mediaType: {
      type: String,
      enum: ["none", "image", "video", "mixed"],
      default: "none",
    }, // for efficient filtering on feed
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Church",
      required: true,
      index: true,
    },
    likes: [
      {
        liker: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "likes.likerType",
          required: true,
        },
        likerType: {
          type: String,
          enum: ["User", "Church"],
          required: true,
        },
        likedAt: { type: Date, default: Date.now },
      },
    ],
    shareCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
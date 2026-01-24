import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: false, // Optional - posts can have no title
      trim: true,
    },
    body: {
      type: String,
      required: true,
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
      required: true,
      refPath: "posterModel",
      index: true,
    },
    posterModel: {
      type: String,
      required: true,
      enum: ["User", "Minister"],
      default: "Minister",
    },
    thumbnail: {
      type: String,
      default: null,
      required: false,
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
          enum: ["User", "Minister"],
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
  },
);

const PostModel = mongoose.model("Post", postSchema);

export default PostModel;

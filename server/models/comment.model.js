import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ["post", "tweet"],
      index: true,
    },
    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "commenterModel",
      required: true,
      index: true,
    },
    commenterModel: {
      type: String,
      required: true,
      enum: ["User", "Minister"],
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    likes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        likedAt: { type: Date, default: Date.now },
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const CommentModel = mongoose.model("Comment", commentSchema);

export default CommentModel;

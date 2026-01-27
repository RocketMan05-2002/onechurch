import CommentModel from "../models/comment.model.js";
import PostModel from "../models/post.model.js";
import { Tweet } from "../models/tweet.model.js";
import User from "../models/user.model.js";
import Minister from "../models/minister.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// Create a comment
export const createComment = asyncHandler(async (req, res) => {
  const { contentId, contentType, body } = req.body;
  const userId = req.user._id;

  if (!contentId || !contentType || !body) {
    throw new ApiError(
      400,
      "Content ID, content type, and comment body are required",
    );
  }

  if (!["post", "tweet"].includes(contentType)) {
    throw new ApiError(400, "Invalid content type");
  }

  // Verify content exists
  if (contentType === "post") {
    const post = await PostModel.findById(contentId);
    if (!post) {
      throw new ApiError(404, "Post not found");
    }
  } else {
    const tweet = await Tweet.findById(contentId);
    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }
  }

  // Determine commenter model
  let commenterModel = "User";
  const minister = await Minister.findById(userId);
  if (minister) {
    commenterModel = "Minister";
  }

  const comment = await CommentModel.create({
    contentId,
    contentType,
    body,
    commentedBy: userId,
    commenterModel,
  });

  // Populate commenter info
  await comment.populate("commentedBy", "fullName profilePic email");

  // Increment comment count on the post
  if (contentType === "post") {
    await PostModel.findByIdAndUpdate(contentId, {
      $inc: { commentCount: 1 },
    });
  } else if (contentType === "tweet") {
    await Tweet.findByIdAndUpdate(contentId, {
      $inc: { commentCount: 1 },
    });
  }

  return res.status(201).json({
    success: true,
    comment,
    message: "Comment added successfully",
  });
});

// Get comments for a post or tweet
export const getComments = asyncHandler(async (req, res) => {
  const { contentType, contentId } = req.params;

  if (!["post", "tweet"].includes(contentType)) {
    throw new ApiError(400, "Invalid content type");
  }

  const comments = await CommentModel.find({
    contentId,
    contentType,
    parentComment: null, // Only top-level comments
  })
    .populate("commentedBy", "fullName profilePic email role ministerType")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    comments,
    count: comments.length,
  });
});

// Delete a comment
export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const comment = await CommentModel.findById(id);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if user owns the comment
  if (comment.commentedBy.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own comments");
  }

  await CommentModel.findByIdAndDelete(id);

  // Decrement comment count on the post/tweet
  if (comment.contentType === "post") {
    await PostModel.findByIdAndUpdate(comment.contentId, {
      $inc: { commentCount: -1 },
    });
  } else if (comment.contentType === "tweet") {
    await Tweet.findByIdAndUpdate(comment.contentId, {
      $inc: { commentCount: -1 },
    });
  }

  return res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});

// Get replies to a comment
export const getReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const replies = await CommentModel.find({
    parentComment: commentId,
  })
    .populate("commentedBy", "fullName profilePic email role ministerType")
    .sort({ createdAt: 1 });

  return res.status(200).json({
    success: true,
    replies,
    count: replies.length,
  });
});

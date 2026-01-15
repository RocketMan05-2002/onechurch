import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import PostModel from "../models/post.model.js";

export const createPost = asyncHandler(async (req, res) => {
  const { title, body, media, mediaType } = req.body;

  if (!body && (!media || media.length === 0)) {
    throw new ApiError(400, "Post content cannot be empty");
  }

  // Determine author
  const authorId = req.user?._id;
  const authorType = req.userType === "user" ? "User" : "Minister";

  if (!authorId) {
    throw new ApiError(401, "Unauthorized");
  }

  const post = await PostModel.create({
    title: title || "Untitled",
    body,
    media: media || [],
    mediaType: mediaType || "none",
    postedBy: authorId,
    posterModel: authorType,
  });

  return res.status(201).json({ post });
});

export const getAllPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, userId, ministerId } = req.query;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  if (userId) filter.postedBy = userId;
  if (ministerId) filter.postedBy = ministerId;

  const posts = await PostModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("postedBy", "fullName profilePic location email ministerType");

  return res.status(200).json({ posts });
});

export const toggleLikePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const likerId = req.user?._id;
  const likerType = req.userType === "user" ? "User" : "Minister";

  if (!likerId) throw new ApiError(401, "Unauthorized");

  const post = await PostModel.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const existingLikeIndex = post.likes.findIndex(
    (like) =>
      like.liker.toString() === likerId.toString() &&
      like.likerType === likerType
  );

  if (existingLikeIndex > -1) {
    // Unlike
    post.likes.splice(existingLikeIndex, 1);
    post.likeCount = Math.max(0, post.likeCount - 1);
  } else {
    // Like
    post.likes.push({ liker: likerId, likerType });
    post.likeCount += 1;
  }

  await post.save();
  return res.status(200).json({ success: true, likeCount: post.likeCount });
});

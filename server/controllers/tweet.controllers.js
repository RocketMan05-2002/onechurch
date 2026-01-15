import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.create({
    content,
    author: req.user._id,
    authorModel: req.user.role === "minister" ? "Minister" : "User",
  });

  return res.status(201).json({ tweet, message: "Tweet created successfully" });
});

export const getTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.find()
    .populate("author", "fullName profilePic")
    .sort({ createdAt: -1 });

  return res.status(200).json({ tweets });
});

export const deleteTweet = asyncHandler(async (req, res) => {
  const tweet = await Tweet.findById(req.params.id);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this tweet");
  }

  await Tweet.findByIdAndDelete(req.params.id);
  return res.status(200).json({ message: "Tweet deleted successfully" });
});

export const likeTweet = asyncHandler(async (req, res) => {
  const tweet = await Tweet.findById(req.params.id);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const isLiked = tweet.likes.includes(req.user._id);
  if (isLiked) {
    tweet.likes = tweet.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
  } else {
    tweet.likes.push(req.user._id);
  }

  await tweet.save();
  return res
    .status(200)
    .json({ tweet, message: isLiked ? "Unliked" : "Liked" });
});

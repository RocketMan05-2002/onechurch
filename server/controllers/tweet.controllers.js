import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/uploadHelper.js";
import {
  emitNewTweet,
  emitTweetLike,
  emitNewComment,
  emitNewRetweet,
} from "../socket/socket.js";

export const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const imageFile = req.file; // From multer

  if (!content && !imageFile) {
    throw new ApiError(400, "Content or image is required");
  }

  let mediaArray = [];

  // Upload image to Cloudinary if provided
  if (imageFile) {
    const imageUrl = await uploadToCloudinary(
      imageFile.buffer,
      "onechurch/tweets",
    );
    mediaArray.push({ url: imageUrl, type: "image" });
  }

  const tweet = await Tweet.create({
    content: content || "",
    media: mediaArray,
    author: req.user._id,
    authorModel: req.userType === "minister" ? "Minister" : "User",
  });

  const populatedTweet = await Tweet.findById(tweet._id).populate(
    "author",
    "fullName profilePic",
  );

  // Emit real-time event
  emitNewTweet(populatedTweet);

  return res
    .status(201)
    .json({ tweet: populatedTweet, message: "Tweet created successfully" });
});

export const getTweets = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const filter = {};
  if (userId) filter.author = userId;

  const tweets = await Tweet.find(filter)
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

export const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const tweetId = req.params.id;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Check ownership
  if (tweet.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to edit this tweet");
  }

  tweet.content = content;
  // Note: Not handling media updates in edit for now as per minimal requirement, but can be added.
  await tweet.save();

  // Re-populate for response
  const populatedTweet = await Tweet.findById(tweetId).populate(
    "author",
    "fullName profilePic",
  );

  return res.status(200).json({
    tweet: populatedTweet,
    message: "Tweet updated successfully",
  });
});

export const likeTweet = asyncHandler(async (req, res) => {
  const tweet = await Tweet.findById(req.params.id);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const isLiked = tweet.likes.includes(req.user._id);
  if (isLiked) {
    tweet.likes = tweet.likes.filter(
      (id) => id.toString() !== req.user._id.toString(),
    );
  } else {
    tweet.likes.push(req.user._id);
  }

  await tweet.save();

  // Emit real-time event
  emitTweetLike(req.params.id, tweet.likes);

  return res
    .status(200)
    .json({ tweet, message: isLiked ? "Unliked" : "Liked" });
});

export const getTrendingHashtags = asyncHandler(async (req, res) => {
  // Aggregate tweets to find most used hashtags
  // Assumption: Hashtags are stored in content or we have a tags array.
  // Previous analysis: Tweet model has `content`.
  // We need to parse content for #hashtags.
  // Doing this on the fly:

  // Ideally, we should extract hashtags on creation and store in a `hashtags` field in Tweet schema.
  // Since I can't easily change schema/migration now without risk, I will do a heavy aggregation OR just a simple regex find if dataset is small.
  // BETTER: Update Tweet model to store hashtags arrays?
  // Let's stick to the requirements. "Trending hashtags".
  // I will implement a simpler version: Top 5 hashtags from recent 100 tweets.

  const tweets = await Tweet.find().sort({ createdAt: -1 }).limit(100);
  const hashtagMap = {};

  tweets.forEach((tweet) => {
    const extracted = tweet.content.match(/#[a-z0-9_]+/gi);
    if (extracted) {
      extracted.forEach((tag) => {
        const lowerTag = tag.toLowerCase();
        hashtagMap[lowerTag] = (hashtagMap[lowerTag] || 0) + 1;
      });
    }
  });

  const sortedTags = Object.entries(hashtagMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  return res.status(200).json({ trending: sortedTags });
});

export const commentOnTweet = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const tweetId = req.params.id;

  if (!text || text.trim().length === 0) {
    throw new ApiError(400, "Comment text is required");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const comment = {
    user: req.user._id,
    userModel: req.userType === "minister" ? "Minister" : "User",
    text: text.trim(),
    createdAt: new Date(),
  };

  tweet.comments.push(comment);
  await tweet.save();

  const populatedTweet = await Tweet.findById(tweetId)
    .populate("author", "fullName profilePic")
    .populate("comments.user", "fullName profilePic");

  return res.status(200).json({
    tweet: populatedTweet,
    message: "Comment added successfully",
  });

  // Emit real-time event (after response)
  process.nextTick(() => {
    emitNewComment(tweetId, comment);
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { id: tweetId, commentId } = req.params;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const commentIndex = tweet.comments.findIndex(
    (c) => c._id.toString() === commentId,
  );

  if (commentIndex === -1) {
    throw new ApiError(404, "Comment not found");
  }

  const comment = tweet.comments[commentIndex];

  // Check if user owns the comment or the tweet
  if (
    comment.user.toString() !== req.user._id.toString() &&
    tweet.author.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  tweet.comments.splice(commentIndex, 1);
  await tweet.save();

  return res.status(200).json({ message: "Comment deleted successfully" });
});

export const retweetTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params.id;
  const { comment } = req.body; // Optional comment on retweet

  const originalTweet = await Tweet.findById(tweetId);
  if (!originalTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Check if user already retweeted
  const userModel = req.userType === "minister" ? "Minister" : "User";
  const alreadyRetweeted = originalTweet.retweets.some(
    (id) => id.toString() === req.user._id.toString(),
  );

  if (alreadyRetweeted) {
    // Undo retweet
    originalTweet.retweets = originalTweet.retweets.filter(
      (id) => id.toString() !== req.user._id.toString(),
    );
    await originalTweet.save();

    // Delete the retweet post if it exists
    await Tweet.deleteMany({
      author: req.user._id,
      originalTweet: tweetId,
      isRetweet: true,
    });

    return res.status(200).json({ message: "Retweet removed" });
  }

  // Add to retweets
  originalTweet.retweets.push(req.user._id);
  originalTweet.retweetModel = userModel;
  await originalTweet.save();

  // Create a retweet tweet
  const retweet = await Tweet.create({
    content: comment || "",
    author: req.user._id,
    authorModel: userModel,
    originalTweet: tweetId,
    isRetweet: true,
  });

  const populatedRetweet = await Tweet.findById(retweet._id)
    .populate("author", "fullName profilePic")
    .populate("originalTweet");

  return res.status(201).json({
    tweet: populatedRetweet,
    message: "Retweeted successfully",
  });

  // Emit real-time event (after response)
  process.nextTick(() => {
    emitNewRetweet(populatedRetweet);
  });
});

export const shareTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params.id;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Increment share count
  tweet.shares = (tweet.shares || 0) + 1;
  await tweet.save();

  // Generate shareable link
  const shareLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/tweet/${tweetId}`;

  return res.status(200).json({
    shareLink,
    message: "Share link generated",
    shares: tweet.shares,
  });
});

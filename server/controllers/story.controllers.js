import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import StoryModel from "../models/story.model.js";
import Minister from "../models/minister.model.js";

export const createStory = asyncHandler(async (req, res) => {
  // Only ministers can create stories
  if (req.user.role !== "minister") {
    throw new ApiError(403, "Only ministers can create stories");
  }

  const { mediaUrl, mediaType, duration } = req.body;

  if (!mediaUrl || !mediaType) {
    throw new ApiError(400, "Media URL and type are required");
  }

  // default expiration 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const story = await StoryModel.create({
    media: {
      url: mediaUrl,
      type: mediaType,
      duration: duration || 5, // default 5 seconds
    },
    postedBy: req.user._id,
    expiresAt,
  });

  return res.status(201).json({ story, message: "Story created successfully" });
});

export const getStories = asyncHandler(async (req, res) => {
  // Get valid stories (not expired)
  // TODO: In future, filter by following. For now, show global/random or just active ones.
  // As per common requirement often we show stories from people we follow, but let's just fetch all active for now to populate the UI
  // OR fetch stories from ministers the user follows.
  // Let's implement a mix: all active stories for now to ensure content visibility.

  const stories = await StoryModel.find({
    expiresAt: { $gt: new Date() },
  })
    .populate("postedBy", "fullName profilePic")
    .sort({ createdAt: -1 });

  return res.status(200).json({ stories });
});

export const viewStory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const story = await StoryModel.findById(id);
  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  // Check if already viewed
  const alreadyViewed = story.views.some(
    (view) => view.user.toString() === userId.toString(),
  );

  if (!alreadyViewed) {
    story.views.push({ user: userId });
    await story.save();
  }

  return res
    .status(200)
    .json({ success: true, message: "Story view recorded" });
});

export const reactToStory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const story = await StoryModel.findById(id);
  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  // Like toggle logic or just simple 'heart'
  // For stories, often it's just 'like' or 'react'.
  // Model has `likes` array.

  const alreadyLikedIndex = story.likes.findIndex(
    (like) => like.user.toString() === userId.toString(),
  );

  if (alreadyLikedIndex > -1) {
    story.likes.splice(alreadyLikedIndex, 1);
  } else {
    story.likes.push({ user: userId });
  }

  await story.save();

  return res.status(200).json({ success: true, likes: story.likes.length });
});

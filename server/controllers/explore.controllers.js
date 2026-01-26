import { asyncHandler } from "../utils/asyncHandler.js";
import PostModel from "../models/post.model.js";
import { Tweet } from "../models/tweet.model.js";
import Minister from "../models/minister.model.js";

export const getExploreFeed = asyncHandler(async (req, res) => {
  // Simple algorithm: Fetch recent posts and tweets, and mix them.
  // Also fetch some ministers to suggest.

  const posts = await PostModel.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("postedBy", "fullName profilePic ministerType");

  const tweets = await Tweet.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("author", "fullName profilePic");

  // Mix function
  const feed = [];
  const maxLen = Math.max(posts.length, tweets.length);

  for (let i = 0; i < maxLen; i++) {
    if (posts[i]) feed.push({ ...posts[i].toObject(), type: "post" });
    if (tweets[i]) feed.push({ ...tweets[i].toObject(), type: "tweet" });
  }

  // Shuffle feed slightly?
  // Let's just return as is for now: Post, Tweet, Post, Tweet...

  return res.status(200).json({ feed });
});

import { Router } from "express";
import {
  createTweet,
  getTweets,
  deleteTweet,
  likeTweet,
  getTrendingHashtags,
  commentOnTweet,
  deleteComment,
  retweetTweet,
  shareTweet,
  updateTweet,
} from "../controllers/tweet.controllers.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

router.use(verifyJwt);

router.get("/trending", getTrendingHashtags);
router.post("/", upload.single("image"), createTweet);
router.get("/", getTweets);
router.put("/:id", updateTweet);
router.delete("/:id", deleteTweet);
router.post("/:id/like", likeTweet);
router.post("/:id/comment", commentOnTweet);
router.delete("/:id/comment/:commentId", deleteComment);
router.post("/:id/retweet", retweetTweet);
router.post("/:id/share", shareTweet);

export default router;

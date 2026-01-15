import { Router } from "express";
import {
  createTweet,
  getTweets,
  deleteTweet,
  likeTweet,
} from "../controllers/tweet.controllers.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

router.post("/", createTweet);
router.get("/", getTweets);
router.delete("/:id", deleteTweet);
router.post("/:id/like", likeTweet);

export default router;

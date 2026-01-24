import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  createStory,
  getStories,
  viewStory,
  reactToStory,
} from "../controllers/story.controllers.js";

const router = Router();

// Apply auth middleware to all story routes
router.use(verifyJwt);

router.route("/").get(getStories).post(createStory);
router.route("/:id/view").post(viewStory);
router.route("/:id/react").post(reactToStory);

export default router;

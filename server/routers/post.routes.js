import { Router } from "express";
import {
  createPost,
  getAllPosts,
  toggleLikePost,
  savePost,
  unsavePost,
  reportPost,
  updatePost,
  deletePost,
} from "../controllers/post.controllers.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

// Public feed? Or protected? User said "unless a user is logged in he cant go to /".
// So protected.
router.use(verifyJwt);

router.post("/", upload.single("image"), createPost);
router.get("/", getAllPosts);
router.post("/:postId/like", toggleLikePost);
router.post("/:id/save", savePost);
router.delete("/:id/save", unsavePost);
router.post("/:id/report", reportPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

export default router;

import { Router } from "express";
import {
  createComment,
  getComments,
  deleteComment,
  getReplies,
} from "../controllers/comment.controllers.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", verifyJwt, createComment);
router.get("/:contentType/:contentId", getComments);
router.delete("/:id", verifyJwt, deleteComment);
router.get("/:commentId/replies", getReplies);

export default router;

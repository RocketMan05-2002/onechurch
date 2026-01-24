import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  updateProfilePicture,
  recordAmen,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controllers/user.controllers.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJwt, logoutUser);
router.get("/me", verifyJwt, getCurrentUser);
router.post("/amen", verifyJwt, recordAmen);

// Profile routes
router.get("/:id/profile", getUserProfile);
router.put("/profile", verifyJwt, updateUserProfile);
router.put(
  "/profile-picture",
  verifyJwt,
  upload.single("image"),
  updateProfilePicture,
);

router.post("/:id/follow", verifyJwt, followUser);
router.delete("/:id/follow", verifyJwt, unfollowUser);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);

export default router;

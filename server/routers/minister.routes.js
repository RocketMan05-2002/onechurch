import { Router } from "express";
import {
  registerMinister,
  loginMinister,
  getMinisterProfile,
  updateMinisterProfile,
  updateMinisterProfilePicture,
  getAllMinisters,
  getRecommendedMinisters,
  recordMinisterAmen,
} from "../controllers/minister.controllers.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();

router.post("/register", registerMinister);
router.post("/login", loginMinister);
router.get("/all", getAllMinisters);
router.get("/recommended", getRecommendedMinisters);
router.get("/profile/me", verifyJwt, getMinisterProfile);
router.get("/profile/:id", getMinisterProfile);
router.put("/profile", verifyJwt, updateMinisterProfile);
router.put(
  "/profile-picture",
  verifyJwt,
  upload.single("image"),
  updateMinisterProfilePicture,
);
router.post("/amen", verifyJwt, recordMinisterAmen);

export default router;

import { Router } from "express";
import {
  registerMinister,
  loginMinister,
  getMinisterProfile,
  updateMinisterProfile,
  getAllMinisters,
} from "../controllers/minister.controllers.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerMinister);
router.post("/login", loginMinister);
router.get("/all", getAllMinisters);
router.get("/profile/me", verifyJwt, getMinisterProfile);
router.get("/profile/:id", getMinisterProfile);
router.put("/profile", verifyJwt, updateMinisterProfile);

export default router;

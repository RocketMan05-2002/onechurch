import { Router } from "express";
import { getExploreFeed } from "../controllers/explore.controllers.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJwt);

router.get("/", getExploreFeed);

export default router;

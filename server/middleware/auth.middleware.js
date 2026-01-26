import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Minister from "../models/minister.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Verifies JWT for either a User or a Minister document.
export const verifyJwt = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers?.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Try to resolve the subject as either a User or a Minister.
    const [user, minister] = await Promise.all([
      User.findById(decoded?._id).select("-password -refreshToken"),
      Minister.findById(decoded?._id).select("-password"),
    ]);

    const actor = user || minister;

    if (!actor) {
      return res.status(401).json({ message: "Invalid Access Token" });
    }

    if (minister) {
      req.user = minister;
      req.userType = "minister";
    } else {
      req.user = user;
      req.userType = "user";
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid Access Token" });
  }
});

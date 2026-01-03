
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Church from "../models/church.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// Verifies JWT for either a User or a Church document.
export const verifyJwt = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Access token is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Try to resolve the subject as either a User or a Church.
        const [user, church] = await Promise.all([
            User.findById(decoded?._id).select("-password -refreshToken"),
            Church.findById(decoded?._id).select("-password"),
        ]);

        const actor = user || church;

        if (!actor) {
            return res.status(401).json({ message: "Invalid Access Token" });
        }

        req.user = actor;
        req.userType = user ? "user" : "church";
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid Access Token" });
    }
});
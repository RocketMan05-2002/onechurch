import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Minister from "../models/minister.model.js";

export const search = asyncHandler(async (req, res) => {
  const { q, type } = req.query; // type: 'users' or 'ministers'

  if (!q) {
    return res.status(200).json({ results: [] });
  }

  const regex = new RegExp(q, "i");
  let results = [];

  if (type === "users") {
    results = await User.find({
      $or: [{ fullName: regex }, { email: regex }],
    }).select("fullName profilePic email role");
  } else {
    // Default to ministers
    results = await Minister.find({
      $or: [{ fullName: regex }, { email: regex }],
    }).select("fullName profilePic location isVerified ministerType bio");
  }

  return res.status(200).json({ results });
});

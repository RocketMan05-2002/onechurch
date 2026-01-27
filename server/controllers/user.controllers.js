import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Minister from "../models/minister.model.js";
import { uploadToCloudinary } from "../utils/uploadHelper.js";

const buildSafeUser = (user) => ({
  id: user._id,
  email: user.email,
  fullName: user.fullName,
  profilePic: user.profilePic,
  role: user.role,
});

const signAccessToken = (user) =>
  jwt.sign(
    { _id: user._id, email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" },
  );

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, username, profilePic, role } = req.body;

  if (!fullName || !email || !password || !username) {
    throw new ApiError(
      400,
      "Full name, email, username, and password are required",
    );
  }

  // Check if email already exists
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Check if username already exists
  const existingUsername = await User.findOne({
    username: username.toLowerCase(),
  });
  if (existingUsername) {
    throw new ApiError(409, "Username is already taken");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password: hashedPassword,
    profilePic: profilePic || "",
    role: role || "user",
  });

  return res.status(201).json({
    message: "User registered successfully",
    user: buildSafeUser(user),
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password");
  }

  const accessToken = signAccessToken(user);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json({
      message: "User logged in successfully",
      user: buildSafeUser(user),
      accessToken,
    });
});

export const logoutUser = asyncHandler(async (_req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .json({ message: "User logged out successfully" });
});

export const recordAmen = asyncHandler(async (req, res) => {
  let user = await User.findById(req.user?._id);
  if (!user) {
    user = await Minister.findById(req.user?._id);
  }
  if (!user) {
    throw new ApiError(404, "User/Minister not found");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastAmen = user.lastAmenDate ? new Date(user.lastAmenDate) : null;
  if (lastAmen) {
    lastAmen.setHours(0, 0, 0, 0);
  }

  const diffTime = lastAmen ? today.getTime() - lastAmen.getTime() : null;
  const diffDays = diffTime
    ? Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    : null;

  if (diffDays === 1) {
    // Yesterday was the last amen, increment streak
    user.prayerStreak += 1;
  } else if (diffDays === 0) {
    // Already did it today, do nothing or just return
  } else {
    // Missed a day or first time
    user.prayerStreak = 1;
  }

  user.lastAmenDate = new Date();
  await user.save();

  return res.status(200).json({
    message: "Amen recorded",
    prayerStreak: user.prayerStreak,
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  // Try User first
  let user = await User.findById(req.user?._id).select("-password");

  // If not found, try Minister
  if (!user) {
    user = await Minister.findById(req.user?._id).select(
      "-password -refreshToken",
    );
  }

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json({ user });
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid User ID");
  }

  // Try to find as User first
  let user = await User.findById(id).select("-password");

  // If not found, try Minister
  if (!user) {
    user = await Minister.findById(id).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  }

  return res.status(200).json({ user });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const { fullName, bio } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { fullName, bio } },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json({ user, message: "Profile updated successfully" });
});

export const updateProfilePicture = asyncHandler(async (req, res) => {
  const imageFile = req.file;

  if (!imageFile) {
    throw new ApiError(400, "Profile picture file is required");
  }

  // Upload to Cloudinary
  const imageUrl = await uploadToCloudinary(
    imageFile.buffer,
    "onechurch/profiles",
  );

  // Update user's profile picture
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { profilePic: imageUrl } },
    { new: true },
  ).select("-password");

  return res.status(200).json({
    user,
    profilePic: imageUrl,
    message: "Profile picture updated successfully",
  });
});

export const updateProfileBanner = asyncHandler(async (req, res) => {
  const imageFile = req.file;

  if (!imageFile) {
    throw new ApiError(400, "Banner file is required");
  }

  // Upload to Cloudinary
  const imageUrl = await uploadToCloudinary(
    imageFile.buffer,
    "onechurch/banners",
  );

  // Determine if User or Minister
  let user = await User.findById(req.user?._id);
  if (user) {
    user.bannerPic = imageUrl;
    await user.save();
  } else {
    user = await Minister.findById(req.user?._id);
    if (user) {
      user.bannerPic = imageUrl;
      await user.save();
    } else {
      throw new ApiError(404, "User not found");
    }
  }

  // Reload to exclude password if needed or just return fields
  return res.status(200).json({
    user: buildSafeUser(user), // Ensure this helper works for both or maps correctly
    bannerPic: imageUrl,
    message: "Profile banner updated successfully",
  });
});

export const followUser = asyncHandler(async (req, res) => {
  const { id } = req.params; // Target user/minister ID
  const { targetModel } = req.body; // 'User' or 'Minister'
  const followerId = req.user._id;

  console.log("Follow request:", { followerId, targetId: id, targetModel });

  if (!targetModel || !["User", "Minister"].includes(targetModel)) {
    throw new ApiError(400, "Invalid or missing targetModel");
  }

  try {
    // 1. Get current user (could be User or Minister)
    let currentUser = await User.findById(followerId);
    let isMinisterFollower = false;

    if (!currentUser) {
      currentUser = await Minister.findById(followerId);
      isMinisterFollower = true;
    }

    if (!currentUser) {
      throw new ApiError(404, "Current user not found");
    }

    console.log("Current user found:", {
      id: currentUser._id,
      isMinister: isMinisterFollower,
      hasFollowing: !!currentUser.following,
    });

    // Check if already following
    const isAlreadyFollowing = currentUser.following?.some(
      (f) => f.targetId.toString() === id.toString(),
    );

    if (isAlreadyFollowing) {
      return res.status(400).json({ message: "Already following" });
    }

    // Add to following - Use findByIdAndUpdate to avoid validation issues with legacy data
    console.log("Updating current user following...");
    const updateQuery = {
      $push: { following: { targetId: id, targetModel } },
      $inc: { followingCount: 1 },
    };

    if (isMinisterFollower) {
      await Minister.findByIdAndUpdate(followerId, updateQuery);
    } else {
      await User.findByIdAndUpdate(followerId, updateQuery);
    }
    console.log("Current user updated successfully");

    // 2. Add to Target's 'followers' list
    console.log("Updating target followers...");
    if (targetModel === "Minister") {
      await Minister.findByIdAndUpdate(id, {
        $push: { followers: followerId },
        $inc: { followerCount: 1 },
      });
    } else {
      await User.findByIdAndUpdate(id, {
        $push: { followers: followerId },
        $inc: { followerCount: 1 },
      });
    }
    console.log("Target updated successfully");

    return res
      .status(200)
      .json({ success: true, message: "Followed successfully" });
  } catch (error) {
    console.error("Follow error details:", error);
    throw error;
  }
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const followerId = req.user._id;

  // 1. Get current user (could be User or Minister)
  let currentUser = await User.findById(followerId);

  if (!currentUser) {
    currentUser = await Minister.findById(followerId);
  }

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }

  const followingEntry = currentUser.following?.find(
    (f) => f.targetId.toString() === id.toString(),
  );

  if (!followingEntry) {
    return res.status(400).json({ message: "Not following" });
  }

  const targetModel = followingEntry.targetModel;

  // Remove from following
  currentUser.following = currentUser.following.filter(
    (f) => f.targetId.toString() !== id.toString(),
  );
  currentUser.followingCount = Math.max(
    (currentUser.followingCount || 0) - 1,
    0,
  );
  await currentUser.save();

  // Remove from target's followers
  if (targetModel === "Minister") {
    await Minister.findByIdAndUpdate(id, {
      $pull: { followers: followerId },
      $inc: { followerCount: -1 },
    });
  } else {
    await User.findByIdAndUpdate(id, {
      $pull: { followers: followerId },
      $inc: { followerCount: -1 },
    });
  }

  return res
    .status(200)
    .json({ success: true, message: "Unfollowed successfully" });
});

export const getFollowers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try User first
  let user = await User.findById(id);

  // If not found, try Minister
  if (!user) {
    user = await Minister.findById(id);
  }

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Manually fetch each follower from both User and Minister collections
  const followers = [];

  for (const followerId of user.followers || []) {
    // Try to find in User collection first
    let follower = await User.findById(followerId).select(
      "fullName profilePic email bio role username",
    );

    // If not found in User, try Minister collection
    if (!follower) {
      follower = await Minister.findById(followerId).select(
        "fullName profilePic email bio ministerType",
      );
    }

    // If found in either collection, add to results
    if (follower) {
      followers.push({
        _id: follower._id,
        fullName: follower.fullName,
        profilePic: follower.profilePic,
        email: follower.email,
        bio: follower.bio,
        role: follower.role || follower.ministerType,
        username: follower.username,
      });
    }
  }

  return res.status(200).json({ followers });
});

export const getFollowing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try User first
  let user = await User.findById(id);

  // If not found, try Minister
  if (!user) {
    user = await Minister.findById(id);
  }

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Manually populate following with both User and Minister
  const following = [];
  for (const f of user.following || []) {
    let targetUser;
    if (f.targetModel === "Minister") {
      targetUser = await Minister.findById(f.targetId).select(
        "fullName profilePic email bio ministerType",
      );
    } else {
      targetUser = await User.findById(f.targetId).select(
        "fullName profilePic email bio role",
      );
    }

    if (targetUser) {
      following.push({
        _id: targetUser._id,
        fullName: targetUser.fullName,
        profilePic: targetUser.profilePic,
        email: targetUser.email,
        bio: targetUser.bio,
        role: targetUser.role || targetUser.ministerType,
        targetModel: f.targetModel,
      });
    }
  }

  return res.status(200).json({ following });
});

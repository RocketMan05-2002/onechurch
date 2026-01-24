import { Minister } from "../models/minister.model.js";
import PostModel from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/uploadHelper.js";

const generateAccessAndRefereshTokens = async (ministerId) => {
  try {
    const minister = await Minister.findById(ministerId);
    const accessToken = minister.generateAccessToken();
    const refreshToken = minister.generateRefreshToken();

    minister.refreshToken = refreshToken;
    await minister.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens",
    );
  }
};

export const registerMinister = asyncHandler(async (req, res) => {
  const { fullName, email, password, ministerType, bio, location } = req.body;

  if (!fullName || !email || !password) {
    throw new ApiError(400, "FullName, email, and password are required");
  }

  const existingMinister = await Minister.findOne({ email });
  if (existingMinister) {
    throw new ApiError(400, "Minister already exists with this email");
  }

  const minister = await Minister.create({
    fullName,
    email,
    password,
    ministerType: ministerType || "church",
    bio: bio || "",
    location: location || "",
  });

  const createdMinister = await Minister.findById(minister._id).select(
    "-password -refreshToken",
  );

  if (!createdMinister) {
    throw new ApiError(
      500,
      "Something went wrong while registering the minister",
    );
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    minister._id,
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({ minister: createdMinister, accessToken });
});

export const loginMinister = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const minister = await Minister.findOne({ email });
  if (!minister) {
    throw new ApiError(400, "Minister does not exist with this email");
  }

  const isPasswordCorrect = await minister.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    minister._id,
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      message: "Login successful",
      minister: {
        _id: minister._id,
        fullName: minister.fullName,
        email: minister.email,
        role: "minister",
        ministerType: minister.ministerType,
      },
      accessToken,
    });
});

export const getMinisterProfile = asyncHandler(async (req, res) => {
  const ministerId = req.params.id || req.user?._id;
  const minister = await Minister.findById(ministerId).select(
    "-password -refreshToken",
  );
  if (!minister) {
    throw new ApiError(404, "Minister not found");
  }
  return res.status(200).json({ minister });
});

export const updateMinisterProfile = asyncHandler(async (req, res) => {
  const { fullName, bio, location, ministerType } = req.body;
  const minister = await Minister.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        bio,
        location,
        ministerType,
      },
    },
    { new: true },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json({ minister, message: "Profile updated successfully" });
});

export const updateMinisterProfilePicture = asyncHandler(async (req, res) => {
  const imageFile = req.file;

  if (!imageFile) {
    throw new ApiError(400, "Profile picture file is required");
  }

  // Upload to Cloudinary
  const imageUrl = await uploadToCloudinary(
    imageFile.buffer,
    "onechurch/profiles",
  );

  // Update minister's profile picture
  const minister = await Minister.findByIdAndUpdate(
    req.user?._id,
    { $set: { profilePic: imageUrl } },
    { new: true },
  ).select("-password -refreshToken");

  return res.status(200).json({
    minister,
    profilePic: imageUrl,
    message: "Profile picture updated successfully",
  });
});

export const getAllMinisters = asyncHandler(async (req, res) => {
  const ministers = await Minister.find().select("-password -refreshToken");
  return res.status(200).json({ ministers });
});

export const getRecommendedMinisters = asyncHandler(async (req, res) => {
  // Recommendation logic:
  // For now, return random 5 ministers.
  // Or sort by popularity (followerCount)?

  const recommended = await Minister.find()
    .sort({ followerCount: -1 })
    .limit(5)
    .select("-password -refreshToken");

  return res.status(200).json({ ministers: recommended });
});

export const recordMinisterAmen = asyncHandler(async (req, res) => {
  const ministerId = req.user?._id;
  const minister = await Minister.findById(ministerId);

  if (!minister) {
    throw new ApiError(404, "Minister not found");
  }

  const now = new Date();
  const lastAmen = minister.lastAmenDate;

  // Check if last amen was yesterday
  let streak = minister.prayerStreak || 0;

  if (lastAmen) {
    const lastAmenDate = new Date(lastAmen);
    const daysDiff = Math.floor(
      (now.getTime() - lastAmenDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff === 0) {
      // Already prayed today
      return res.status(200).json({
        message: "You've already prayed today!",
        prayerStreak: streak,
      });
    } else if (daysDiff === 1) {
      // Consecutive day - increment streak
      streak += 1;
    } else {
      // Streak broken - reset to 1
      streak = 1;
    }
  } else {
    // First time
    streak = 1;
  }

  minister.prayerStreak = streak;
  minister.lastAmenDate = now;
  await minister.save();

  return res.status(200).json({
    message: "Amen recorded!",
    prayerStreak: streak,
  });
});

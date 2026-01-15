import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";

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
    { expiresIn: "1h" }
  );

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, profilePic, role } = req.body;

  if (!fullName || !email || !password) {
    throw new ApiError(400, "Full name, email, and password are required");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
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
    sameSite: "strict",
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
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .json({ message: "User logged out successfully" });
});

export const recordAmen = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
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
  const user = await User.findById(req.user?._id).select("-password");
  return res.status(200).json({ user });
});

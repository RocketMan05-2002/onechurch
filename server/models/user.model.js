import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-z0-9_]+$/,
        "Username can only contain lowercase letters, numbers, and underscores",
      ],
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
    },
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    profilePic: {
      type: String,
      default: "",
    },
    bannerPic: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["minister", "user"],
      default: "user",
    },
    prayerStreak: {
      type: Number,
      default: 0,
    },
    lastAmenDate: {
      type: Date,
      default: null,
    },
    following: [
      {
        targetId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "following.targetModel",
        },
        targetModel: {
          type: String,
          required: true,
          enum: ["User", "Minister"],
        },
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followerCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);
const UserModel = mongoose.model("User", userSchema);

export default UserModel;

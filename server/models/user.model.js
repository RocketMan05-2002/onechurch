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
    role: {
      type: String,
      enum: ["admin", "user"], // made a separate model for church removed the church field
      default: "user",
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);
const UserModel = mongoose.model("User", userSchema);

export default UserModel;

import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    media: {
      url: {
        type: String, // any source url (CDN, Cloudinary, S3, etc.)
        required: true,
      },
      type: {
        type: String,
        enum: ["image", "video"],
        required: true,
      },
      duration: {
        type: Number, // for the bar which tracks the viewing time
      },
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Church",
      required: true,
      index: true,
    },
    views: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    likes: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        likedAt: { type: Date, default: Date.now },
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Story = mongoose.model("Story", storySchema);
export default Story;
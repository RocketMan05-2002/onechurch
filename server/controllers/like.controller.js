import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

// --- NO CHANGES TO THE TOGGLE FUNCTIONS ---

const togglePostLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    const existingLike = await Like.findOne({ post: postId, likedBy: userId });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Post disliked successfully"));
    }

    const newLike = await Like.create({ post: postId, likedBy: userId });

    if (!newLike) {
        throw new ApiError(500, "Failed to like the post");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }, "Post liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Comment disliked successfully"));
    }

    const newLike = await Like.create({ comment: commentId, likedBy: userId });

    if (!newLike) {
        throw new ApiError(500, "Failed to like the comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }, "Comment liked successfully"));
});

const toggleStoryLike = asyncHandler(async (req, res) => {
    const { storyId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(storyId)) {
        throw new ApiError(400, "Invalid story ID");
    }

    const existingLike = await Like.findOne({ story: storyId, likedBy: userId });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Tweet disliked successfully"));
    }

    const newLike = await Like.create({ story: storyId, likedBy: userId });

    if (!newLike) {
        throw new ApiError(500, "Failed to like the story");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }, "Story liked successfully"));
});

const getLikedPosts = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedPosts = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                post: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "posts",
                localField: "post",
                foreignField: "_id",
                as: "postDetails"
            }
        },
        {
            $unwind: "$postDetails"
        },
        {
            $lookup: {
                from: "users",
                localField: "postDetails.owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: "$ownerDetails"
        },
        {
            $project: {
                _id: "$postDetails._id",
                title: "$postDetails.title",
                views: "$postDetails.viewCount",
                createdAt: "$postDetails.createdAt",
                ownerDetails: {
                    username: "$ownerDetails.username",
                    avatar: "$ownerDetails.avatar"
                }
            }
        },
        {
            $sort: {
                createdAt: -1 // Sort by most recently liked
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, likedPosts, "Liked posts fetched successfully"));
});


// --- NEW FUNCTION ADDED BELOW ---
// This function will render the page with data instead of just returning JSON.
// export const renderLikedVideosPage = asyncHandler(async (req, res) => {
//     const userId = req.user._id;

//     const likedVideos = await Like.aggregate([
//         // This is the same database query as getLikedVideos
//         {
//             $match: {
//                 likedBy: new mongoose.Types.ObjectId(userId),
//                 video: { $exists: true }
//             }
//         },
//         { $lookup: { from: "videos", localField: "video", foreignField: "_id", as: "videoDetails" } },
//         { $unwind: "$videoDetails" },
//         { $lookup: { from: "users", localField: "videoDetails.owner", foreignField: "_id", as: "ownerDetails" } },
//         { $unwind: "$ownerDetails" },
//         {
//             $project: {
//                 _id: "$videoDetails._id",
//                 title: "$videoDetails.title",
//                 thumbnail: "$videoDetails.thumbnail",
//                 duration: "$videoDetails.duration",
//                 views: "$videoDetails.views",
//                 createdAt: "$videoDetails.createdAt",
//                 ownerDetails: {
//                     username: "$ownerDetails.username",
//                     avatar: "$ownerDetails.avatar"
//                 }
//             }
//         },
//         { $sort: { createdAt: -1 } }
//     ]);

//     // Instead of res.json, we use res.render to build the page with data
//     res.render("liked", {
//         title: "Liked Videos",
//         likedVideos: likedVideos
//     });
// });


export {
    toggleCommentLike,
    toggleStoryLike,
    togglePostLike,
    getLikedPosts
};
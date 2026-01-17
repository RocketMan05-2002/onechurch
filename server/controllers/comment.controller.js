import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getPostComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {postId} = req.params
    const {page = 1, limit = 10} = req.query
const comments = await Comment.aggregate([
  {
    $match: {
      post: new mongoose.ObjectId(postId)
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "commentedBy",
      foreignField: "_id",
      as: "commentedBy",
      pipeline: [
        {
          $project: {
            username: 1,
            fullName: 1,
            avatar: 1
          }
        }
      ]
    }
  },
  {
    $addFields: {
      commentedBy: {
        $first: "$commentedBy"
      }
    }
  },
  {
    $sort: {
      createdAt: -1
    }
  },
  {
    $project: {
      content: 1,
      createdAt: 1,
      updatedAt: 1,
      commentedBy: 1
    }
  }
]);

    return res
    .status(200)
    .json(
        new ApiResponse(200, comments, "Comments retrieved successfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {postId}=req.params
    const {content}=req.body
    if(!content){
        throw new ApiError(400, "Content is required")
    }
    const comment=await Comment.create({
        content:content,
        post:new mongoose.ObjectId(postId),
        commentedBy:req.user._id
    })
    res
    .status(201)
    .json(new ApiResponse("Comment added successfully", comment))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const commentId = req.params.commentId
    const {content}=req.body
    if(!content){
        throw new ApiError(400, "Content is required")
    }
    const comment=await Comment.findByIdAndUpdate(commentId,{content:content}, {new: true})
    if(!comment){
        throw new ApiError(404, "Comment not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const commentId= req.params.commentId
    await Comment.findByIdAndDelete(commentId)
    return res
    .status(200)
    .json(
        new ApiResponse(200, null, "Comment deleted successfully")
    )
})

export {
    getPostComments, 
    addComment, 
    updateComment,
    deleteComment
    }
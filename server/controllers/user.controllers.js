import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, 'Error generating tokens');
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
        throw new ApiError(400, "Username, email and password are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Handle file uploads
    const avatarPath = req.body.avatar;
    if (!avatarPath) {
        throw new ApiError(400, "Avatar file is required");
    }


    // Upload to cloudinary
    if (!avatarPath) {
        throw new ApiError(400, "Error uploading avatar");
    }
    const avatar = { url: avatarPath };
    // Create user
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName: fullName || "",
        profilePic: avatar.url,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (!(username || email)) {
        throw new ApiError(400, 'username or email required')
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, 'User not found')
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if (!isPasswordCorrect) {
        throw new ApiError(401, 'Invalid password')
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select('-password -refreshToken')

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict'
    }

    return res
        .status(200)
        .cookie('refreshToken', refreshToken, options)
        .cookie('accessToken', accessToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
                "User logged in successfully"
            )
        )
})

export const logoutUser = asyncHandler(async (_req, res) => {
   await User.findByIdAndUpdate(req.user._id,{
    $unset:{
        refreshToken: 1
    }
   })
   const options={
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict',
   }
   return res.status(200)
   .clearCookie('refreshToken',options)
   .clearCookie('accessToken',options)
   .json(new ApiResponse(200,null,"User logged out successfully"))
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, 'Refresh token is required')
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, 'Invalid Refresh Token')
        }

        if (user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, 'Refresh token is expired or used')
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict'
        }

        return res
            .status(200)
            .cookie('refreshToken', newRefreshToken, options)
            .cookie('accessToken', accessToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    'Access token refreshed successfully'
                )
            )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req,res) =>{
    const {oldPassword ,newPassword} =req.body;

    if(!oldPassword || !newPassword){
        throw new ApiError(400,"Old password and new password are required")
    }
    if(oldPassword === newPassword){
        throw new ApiError(400,"New password must be different from old password")
    }
    const user =await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(401,"Old password is incorrect")
    }
     user.password =newPassword;
     await user.save({validateBeforeSave:false});

     return res.status(200)
     .json(new ApiResponse(200,null,"Password changed successfully"))
    
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"Current user fetched successfully"))
})

const updateAccountDetails= asyncHandler(async(req,res)=>{
    const {fullname,email} = req.body;
    if(!fullname && !email){
        throw new ApiError(400,"At least one field (fullname or email) is required to update")
    }
    const user= await User.findByIdAndUpdate(req.user._id,{
        $set:{
            fullname: fullname || req.user.fullname,
            email: email || req.user.email,
        }
    },{new:true}).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar= asyncHandler(async(req,res)=>{
    const avatarPath=req.body.avatar;
    if(!avatarPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const user=await User.findByIdAndUpdate(req.user._id,{
        $set:{
            profilePic: avatarPath
        }
    },{new:true}).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"User avatar updated successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
}


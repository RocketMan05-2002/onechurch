// todo -> logi  for church , signup  and generate access and refresh token for church verufyJWT is common for both the userschema and churchschema
import { ChurchModel } from "../models/church.model.js";
import { PostModel } from "../models/post.model.js";

export const generateAccessAndRefereshTokens = async (churchId) => {
  try {
    const church = await ChurchModel.findById(churchId);
    const accessToken = church.generateAccessToken();
    const refreshToken = church.generateRefreshToken();

    church.refreshToken = refreshToken;
    await church.save({ validateBeforeSave: false });
    // validateBeforeSave: false is used to avoid validation errors like vo sab recheck karne lag jata h
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

export const registerChurch = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    // check if he has submitted all or not
    if (!fullName || !email || !password) {
      throw new ApiError(400, "All fields are required");
    }
    // check if church already exists
    const existingChurch = await ChurchModel.findOne({ email });

    if (existingChurch) {
      throw new ApiError(400, "Church already exists with this email");
    }

    // password will be hashed in the model pre-save hook
    const church = await ChurchModel.create({ fullName, email, password });

    const createdChurch = await ChurchModel.findById(church._id).select(
      "-password -refreshToken"
    );

    if (createdChurch) {
      // generate access and referesh tokens and send them in the response
      const { accessToken, refreshToken } =
        await generateAccessAndRefereshTokens(church._id);
      const options = {
        httpOnly: true,
        secure: true,
      };
      res
        .status(201)
        .cookie("refreshToken", refreshToken, options)
        .json({ church: createdChurch, accessToken });
    } else {
      throw new ApiError(
        500,
        "Something went wrong while registering the church"
      );
    }
  } catch (error) {
    next(error);
  }
};

export const loginChurch = async (req, res, next) => {
  try {
    // take out church credentials from request body
    // check if they are present or not
    // db call to find church by email
    // if church exists, check if password is correct or not
    // if password is correct, generate access and refresh tokens

    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }
    const church = await ChurchModel.findOne({ email });
    if (!church) {
      throw new ApiError(400, "Church does not exist with this email");
    }
    const isPasswordCorrect = await church.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new ApiError(400, "Incorrect password");
    }
    // generate access and referesh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      church._id
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({ message: "Login successful", accessToken });
  } catch (error) {
    next(error);
  }
};

export const logoutChurch = async (req, res, next) => {
  try {
    // clear the cookies and redirect to login page
    res
      .clearCookie("accessToken", { httpOnly: true, secure: true })
      .clearCookie("refreshToken", { httpOnly: true, secure: true })
      .status(200)
      .json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

export const changeChurchPassword = async (req, res, next) => {
  try {
    const churchId = req.church._id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new ApiError(400, "Old password and new password are required");
    }
    const church = await ChurchModel.findById(churchId);
    const isOldPasswordCorrect = await church.isPasswordCorrect(oldPassword);
    if (!isOldPasswordCorrect) {
      throw new ApiError(400, "Old password is incorrect");
    }
    church.password = newPassword;
    await church.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

export const changeChurchAvatar = async (req, res, next) => {
  try {
    const churchId = req.church._id;
    const { avatarUrl } = req.body;
    if (!avatarUrl) {
      throw new ApiError(400, "Avatar URL is required");
    }

    const church = await ChurchModel.findById(churchId);
    church.avatarUrl = avatarUrl;
    await church.save();
    res.status(200).json({ message: "Avatar changed successfully" });
  } catch (error) {
    next(error);
  }
};

export const getChurchProfile = async (req, res, next) => {
  try {
    const churchId = req.church._id;
    const church = await ChurchModel.findById(churchId).select(
      "name profilePic country address website followerCount isVerified bio postCount"
    );
    if (!church) {
      throw new ApiError(404, "Church not found");
    }
    // add a boolean that if user follows this church or not
    res.status(200).json({ church });
  } catch (error) {
    next(error);
  }
};

export const getChurchPostsMetaData = async (req, res, next) => {
  try {
    const churchId = req.church._id;
    const posts = await PostModel.find({ postedBy: churchId }).select(
      "thumbnail createdAt likes viewCount shareCount"
    );
    res.status(200).json({ posts }); // return array of posts with only metadata to show in grid format
  } catch (error) {
    next(error);
  }
};

// this controller will return full post data for a given postId
export const getChurchPosts = async (req, res, next) => {
  try {
    // get postId from req.params
    const postId = req.params.postId;
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new ApiError(404, "Post not found");
    }
    res.status(200).json({ post });
  } catch (error) {
    next(error);
  }
};

// controller to delete the post of church
export const deleteChurchPost = async (req, res, next) => {
  try {
    const churchId = req.church._id;
    const postId = req.params.postId;

    const deletedPost = await PostModel.findOneAndDelete({
      _id: postId,
      postedBy: churchId,
    });

    if (!deletedPost) {
      throw new ApiError(
        404,
        "Post not found or you are not authorized to delete this post"
      );
    }

    const church = await ChurchModel.findById(churchId);
    church.postCount = Math.max(0, church.postCount - 1); // extra safety to avoid negative post count btw is there is not post then no deleted button will be shown
    await church.save({ validateBeforeSave: false });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};

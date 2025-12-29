// todo -> logi  for church , signup  and generate access and refresh token for church verufyJWT is common for both the userschema and churchschema
import { ChurchModel } from "../models/church.model.js";

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

export const registerChurch = async (req, res) => {
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
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      church._id
    );
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
};

export const loginChurch = async (req, res) => {
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
};

export const logoutChurch = async (req, res) => {
  // clear the cookies and redirect to login page
  res
    .clearCookie("accessToken", { httpOnly: true, secure: true })
    .clearCookie("refreshToken", { httpOnly: true, secure: true })
    .status(200)
    .json({ message: "Logout successful" });
};

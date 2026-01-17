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
    refreshToken: {
        type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash the password before saving a new user or updating the password
userSchema.pre("save",async function(next){
  // Only hash the password if it has been modified (or is new)
  if(!this.isModified("password")){
    return next();
  }
  // Hash the password with a salt round of 10
  this.password= await bcrypt.hash(this.password,10)
  next();
});

// Method to compare the provided password with the hashed password in the database
userSchema.methods.isPasswordCorrect = async function(password){
  // Use bcrypt to compare the plain text password with the hashed password
  return await bcrypt.compare(password,this.password)
}

//methods to generate accesstoken for the user
userSchema.methods.generateAccessToken= function(){
  return jwt.sign(
    {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET, // Secret key from environment variables
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // Expiry from environment variables
        }
  )
}

userSchema.methods.generateRefreshToken = function () {
    // Sign the JWT with user ID, secret, and expiry
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET, // Secret key from environment variables
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // Expiry from environment variables
        }
    );
};

const User = mongoose.model("User", userSchema);

export default User;
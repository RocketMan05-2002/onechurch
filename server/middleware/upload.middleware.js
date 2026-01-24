import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

// Use memory storage to process files before uploading to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only image files are allowed"), false);
  }
};

// 4MB limit
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB
  },
  fileFilter: fileFilter,
});

export default upload;

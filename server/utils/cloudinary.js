import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

const configureCloudinary = () => {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Log for debugging (remove in production)
  console.log("Configuring Cloudinary...", {
    cloud_name: cloudName ? "✓" : "✗",
    api_key: apiKey ? "✓" : "✗",
    api_secret: apiSecret ? "✓" : "✗",
  });

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("❌ Missing Cloudinary credentials in environment variables");
    console.error("Make sure these are set in .env file:");
    console.error("- CLOUDINARY_CLOUD_NAME");
    console.error("- CLOUDINARY_API_KEY");
    console.error("- CLOUDINARY_API_SECRET");
    throw new Error("Missing Cloudinary credentials");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  isConfigured = true;
  console.log("✅ Cloudinary configured successfully");
};

// Create a proxy that configures on first use
const cloudinaryProxy = new Proxy(cloudinary, {
  get(target, prop) {
    configureCloudinary();
    return target[prop];
  },
});

export default cloudinaryProxy;

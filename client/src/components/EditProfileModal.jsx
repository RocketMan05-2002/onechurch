import { useState } from "react";
import { X, Loader2, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { toast } from "react-hot-toast";

export default function EditProfileModal({ user, onClose }) {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    location: user?.location || "",
    ministerType: user?.ministerType || "church",
  });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(
    user?.profilePic || "",
  );

  const isMinister = user?.role === "minister" || user?.ministerType;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleProfilePicUpload = async () => {
    if (!profilePicFile) return;

    setUploadingPic(true);
    try {
      const formData = new FormData();
      formData.append("image", profilePicFile);

      const endpoint = isMinister
        ? "/ministers/profile-picture"
        : "/users/profile-picture";

      await api.put(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile picture updated!");
      setProfilePicFile(null);
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload profile picture",
      );
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First upload profile picture if selected
      if (profilePicFile) {
        await handleProfilePicUpload();
      }

      // Then update profile data
      const endpoint = isMinister ? "/ministers/profile" : "/users/profile";
      const payload = isMinister
        ? {
            fullName: formData.fullName,
            bio: formData.bio,
            location: formData.location,
            ministerType: formData.ministerType,
          }
        : {
            fullName: formData.fullName,
            bio: formData.bio,
          };

      await api.put(endpoint, payload);
      toast.success("Profile updated successfully!");

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg relative shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <img
                src={profilePicPreview || "/logo2.jpg"}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="profile-pic-input"
                />
                <label
                  htmlFor="profile-pic-input"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-gray-950 rounded-lg hover:bg-accent-hover transition cursor-pointer text-sm font-semibold"
                >
                  <Upload size={16} />
                  Choose Image
                </label>
                {profilePicFile && (
                  <p className="text-xs text-accent dark:text-accent mt-2">
                    ✓ Image selected: {profilePicFile.name}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Upload a new profile picture (will be saved automatically)
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Minister-specific fields */}
          {isMinister && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Minister Type
                </label>
                <select
                  name="ministerType"
                  value={formData.ministerType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                >
                  <option value="church">Church</option>
                  <option value="evangelist">Evangelist</option>
                  <option value="musician">Musician</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-900 dark:text-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingPic}
              className="flex-1 px-4 py-3 rounded-lg bg-accent text-gray-950 font-semibold hover:bg-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(loading || uploadingPic) && (
                <Loader2 size={16} className="animate-spin" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Backdrop */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}

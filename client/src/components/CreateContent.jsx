import { useState } from "react";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { usePost } from "../context/PostContext";
import { useForumContext } from "../context/ForumContext";
import { useAuth } from "../context/AuthContext";
import { createPortal } from "react-dom";

export default function CreateContent({ onClose, initialType = "tweet" }) {
  const { createPost } = usePost();
  const { postTweet } = useForumContext();
  const { user } = useAuth();

  const [contentType, setContentType] = useState(initialType);
  const [body, setBody] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const isMinister = user?.role === "minister";

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim() && !image) return;

    setLoading(true);

    try {
      if (contentType === "post") {
        // Send FormData for file upload
        const formData = new FormData();
        formData.append("body", body);
        if (image) {
          formData.append("image", image); // Actual File object
        }
        const success = await createPost(formData);
        if (success) {
          onClose();
        }
      } else {
        // Tweet
        const tweetData = {
          content: body,
          image: image, // Pass the actual File object
        };
        await postTweet(tweetData);
        onClose();
      }
    } catch (error) {
      console.error("Failed to create content:", error);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl z-10">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Create {contentType === "post" ? "Post" : "Tweet"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Type Selector (only show if minister) */}
        {isMinister && (
          <div className="px-6 pt-4 flex gap-2">
            <button
              onClick={() => setContentType("tweet")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                contentType === "tweet"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Tweet
            </button>
            <button
              onClick={() => setContentType("post")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                contentType === "post"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Post
            </button>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex gap-4">
            <img
              src={user?.profilePic || "/logo2.jpg"}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                placeholder={
                  contentType === "post"
                    ? "Share an inspiring message..."
                    : "What's happening?"
                }
                className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100 text-lg placeholder:text-gray-400 resize-none min-h-[120px]"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                autoFocus
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative rounded-xl overflow-hidden mt-4 border border-gray-200 dark:border-gray-700">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition backdrop-blur-sm"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
            <label className="flex items-center gap-2 text-blue-500 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-full transition">
              <ImageIcon size={22} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>

            <button
              type="submit"
              disabled={loading || (!body.trim() && !image)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all shadow-md flex items-center gap-2 ${
                contentType === "post"
                  ? "bg-green-600 hover:bg-green-500 text-white shadow-green-500/20"
                  : "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20"
              } active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {contentType === "post" ? "Post" : "Tweet"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

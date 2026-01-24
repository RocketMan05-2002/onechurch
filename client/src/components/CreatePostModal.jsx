import { useState } from "react";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { usePost } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";

export default function CreatePostModal({ onClose }) {
  const { createPost } = usePost();
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body && !imageUrl) return;

    setLoading(true);
    const postData = {
      body,
      media: imageUrl ? [{ type: "image", url: imageUrl }] : [],
    };

    const success = await createPost(postData);
    if (success) {
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
          Create Post
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <img
              src={user?.profilePic || "/logo2.jpg"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            <textarea
              placeholder={`What's happening, ${user?.fullName || "Minister"}?`}
              className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100 text-lg placeholder:text-gray-400 resize-none min-h-[100px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          {imageUrl && (
            <div className="relative rounded-xl overflow-hidden mb-2">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-auto max-h-80 object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex gap-2">
              {/* For now, just a text input for Image URL due to lack of file upload backend in this context yet, 
                    or simulate file upload if we had cloud storage. 
                    Let's revert to a simple prompt or input trigger for now. 
                */}
              <button
                type="button"
                onClick={() => {
                  const url = prompt("Enter image URL:");
                  if (url) setImageUrl(url);
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-green-600 transition-colors"
                title="Add Image"
              >
                <ImagePlus size={22} />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || (!body && !imageUrl)}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-full font-bold text-sm transition-all shadow-md shadow-green-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Post
            </button>
          </div>
        </form>
      </div>
      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}

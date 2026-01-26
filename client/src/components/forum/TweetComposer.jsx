import { useState } from "react";
import { Image, X } from "lucide-react";

export default function TweetComposer({ onPost, user }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  const handlePost = () => {
    if (!content.trim()) return;
    onPost({ content, image, createdAt: new Date() });
    setContent("");
    setImage(null);
  };

  return (
    <div className="bg-transparent flex gap-4 w-full max-w-xl">
      {/* Avatar */}
      <img
        src={user?.profilePic || "/logo2.jpg"}
        alt="User"
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full resize-none bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-lg py-2"
          rows={2}
        />

        {/* Hashtag Reminder */}
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
          💡 Tip: Add at least one hashtag (e.g., #faith, #prayer) to help
          others discover your tweet
        </p>

        {/* Image Preview */}
        {image && (
          <div className="relative w-full rounded-2xl overflow-hidden shadow-sm">
            <img
              src={URL.createObjectURL(image)}
              alt="Preview"
              className="w-full max-h-80 object-cover"
            />
            <button
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition backdrop-blur-sm"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
          <label className="flex items-center gap-2 text-blue-500 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-full transition">
            <Image size={20} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && setImage(e.target.files[0])}
            />
          </label>

          <button
            onClick={handlePost}
            className={`
              bg-blue-500 text-white px-5 py-1.5 rounded-full font-bold transition shadow-sm
              ${
                !content.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600 active:scale-95"
              }
            `}
            disabled={!content.trim()}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

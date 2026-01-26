import { X } from "lucide-react";
import PostCard from "../PostCard";
import TweetCard from "../forum/TweetCard";

export default function ExplorePostModal({ post, onClose }) {
  const isTweet = post?.type === "tweet";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="relative max-w-lg w-full">
        {/* Close Button - Outside or smartly placed */}
        <button
          onClick={onClose}
          className="
            absolute -top-10 right-0 md:-right-10
            text-white/80 hover:text-white
            transition
          "
        >
          <X size={28} />
        </button>

        <div className="rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-2xl">
          {isTweet ? (
            <div className="p-0 border-none shadow-none">
              <TweetCard tweet={post} />
            </div>
          ) : (
            <PostCard post={post} />
          )}
        </div>
      </div>
    </div>
  );
}

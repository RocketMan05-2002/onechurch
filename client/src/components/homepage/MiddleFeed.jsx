import StoriesRow from "./StoriesRow";
import PostCard from "../PostCard";
import { usePost } from "../../context/PostContext";
import { useForumContext } from "../../context/ForumContext";
import { useNavigate } from "react-router-dom";

export default function MiddleFeed() {
  const { posts, loading: postsLoading } = usePost();
  const { trending } = useForumContext();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* Stories Section - Instagram style */}
      <div className="sticky top-0 lg:top-0 z-20 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black px-2 py-3">
        <StoriesRow />
      </div>

      {/* Trending Section - Mobile optimized */}
      {trending && trending.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black py-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-4 mb-2">
            Trending Now
          </h2>
          <div className="flex overflow-x-auto no-scrollbar gap-2 px-4 pb-1">
            {trending.map((item) => (
              <div
                key={item.tag}
                className="flex-shrink-0 w-36 p-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all active:scale-95"
                onClick={() => navigate(`/forum`)}
              >
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
                  {item.tag}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.count} posts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Feed - Instagram style */}
      <div className="flex-1 overflow-y-auto">
        {/* Desktop: Centered container with max-width, Mobile: Full width */}
        <div className="w-full lg:flex lg:justify-center">
          <div className="w-full lg:max-w-2xl flex flex-col">
            {postsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-100 rounded-full animate-spin"></div>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="text-center py-20 px-4">
                <div className="text-6xl mb-4">📖</div>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No posts yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Follow some ministers to see their posts!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

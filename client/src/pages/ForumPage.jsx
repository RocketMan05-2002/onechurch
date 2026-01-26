// src/pages/ForumPage.jsx
import TweetComposer from "../components/forum/TweetComposer";
import ForumFeed from "../components/forum/ForumFeed";
import LeftSidebar from "../components/LeftSidebar";
import ForumRightSidebar from "../components/forum/ForumRightSidebar";
import { useAuth } from "../context/AuthContext";
import { useForumContext } from "../context/ForumContext";

export default function ForumPage() {
  const { tweets, postTweet, likeTweet, loading } = useForumContext();
  const { user } = useAuth(); // for passing user to composer if needed

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Left Sidebar */}
      <div className="w-60 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 hidden md:block">
        <LeftSidebar />
      </div>

      {/* Middle Feed (Scrollable) */}
      <div className="flex-1 min-w-0 border-r border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold">Forum</h1>
        </div>

        {/* Composer */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <TweetComposer onPost={postTweet} user={user} />
        </div>

        {/* Feed */}
        {loading ? (
          <div className="p-10 text-center">Loading tweets...</div>
        ) : (
          <ForumFeed tweets={tweets} onLike={likeTweet} />
        )}
      </div>

      {/* Right Sidebar (Forum Specific)
      <div className="hidden lg:block w-80 pl-8 pr-4 py-4 h-screen sticky top-0 overflow-y-auto">
        <ForumRightSidebar />
      </div> */}
    </div>
  );
}

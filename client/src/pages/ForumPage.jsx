// src/pages/ForumPage.jsx
import { useState } from "react";
import TweetComposer from "../components/forum/TweetComposer";
import ForumFeed from "../components/forum/ForumFeed";
import LeftSidebar from "../components/LeftSidebar";
import ForumRightSidebar from "../components/forum/ForumRightSidebar";
import MobileNavBar from "../components/MobileNavBar";
import MobileHeader from "../components/MobileHeader";
import SidebarMenuPopup from "../components/SidebarMenuPopup";
import { useAuth } from "../context/AuthContext";
import { useForumContext } from "../context/ForumContext";

export default function ForumPage() {
  const { tweets, postTweet, likeTweet, loading } = useForumContext();
  const { user } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setShowMobileMenu(true)} />

      {/* Mobile Menu Popup */}
      {showMobileMenu && (
        <SidebarMenuPopup onClose={() => setShowMobileMenu(false)} />
      )}

      {/* Main Layout */}
      <div className="flex">
        {/* Left Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-60 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
          <LeftSidebar />
        </div>

        {/* Middle Feed */}
        <div className="flex-1 min-w-0 lg:border-r border-gray-200 dark:border-gray-800 pt-14 lg:pt-0 pb-16 lg:pb-0">
          {/* Header */}
          <div className="sticky top-14 lg:top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-3 border-b border-gray-200 dark:border-gray-800">
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

        {/* Right Sidebar - Hidden on mobile and tablet */}
        <div className="w-80 flex-shrink-0 hidden xl:block border-l border-gray-200 dark:border-gray-800">
          <ForumRightSidebar />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavBar />
    </div>
  );
}

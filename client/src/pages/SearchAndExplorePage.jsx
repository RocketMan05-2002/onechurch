import { useState } from "react";
import LeftSidebar from "../components/LeftSidebar";
import SearchSidebar from "../components/search/SearchSidebar";
import ExploreGrid from "../components/search/ExploreGrid";
import ExplorePostModal from "../components/search/ExplorePostModal";
import MobileNavBar from "../components/MobileNavBar";
import MobileHeader from "../components/MobileHeader";
import SidebarMenuPopup from "../components/SidebarMenuPopup";

export default function SearchAndExplorePage() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setShowMobileMenu(true)} />

      {/* Mobile Menu Popup */}
      {showMobileMenu && (
        <SidebarMenuPopup onClose={() => setShowMobileMenu(false)} />
      )}

      <div className="flex">
        {/* Left Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-60 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
          <LeftSidebar />
        </div>

        {/* Search Column - Full width on mobile, sidebar on desktop */}
        <div className="w-full lg:w-80 flex-shrink-0 lg:border-r border-gray-200 dark:border-gray-700 pt-14 lg:pt-0">
          <SearchSidebar />
        </div>

        {/* Explore Grid - Hidden on mobile (search results show instead) */}
        <div className="hidden lg:block flex-1 overflow-y-auto pb-16 lg:pb-0">
          <ExploreGrid onPostClick={setSelectedPost} />
        </div>
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <ExplorePostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileNavBar />
    </div>
  );
}

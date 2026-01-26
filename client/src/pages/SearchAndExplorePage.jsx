import { useState } from "react";
import LeftSidebar from "../components/LeftSidebar";
import SearchSidebar from "../components/search/SearchSidebar";
import ExploreGrid from "../components/search/ExploreGrid";
import ExplorePostModal from "../components/search/ExplorePostModal";

export default function SearchAndExplorePage() {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Left Sidebar */}
      <div className="w-60 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
        <LeftSidebar />
      </div>

      {/* Search Column */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
        <SearchSidebar />
      </div>

      {/* Explore Grid */}
      <div className="flex-1 overflow-y-auto">
        <ExploreGrid onPostClick={setSelectedPost} />
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <ExplorePostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}

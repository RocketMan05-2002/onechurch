import { useState, useEffect } from "react";
import LeftSidebar from "../components/LeftSidebar";
import MiddleFeed from "../components/homepage/MiddleFeed";
import RightSidebar from "../components/homepage/RightSidebar";
import MobileNavBar from "../components/MobileNavBar";
import MobileHeader from "../components/MobileHeader";
import SidebarMenuPopup from "../components/SidebarMenuPopup";

export default function HomePage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
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

        {/* Middle Feed - Full width on mobile */}
        <div className="flex-1 min-w-0 lg:border-r border-gray-200 dark:border-gray-700 pt-14 lg:pt-0 pb-16 lg:pb-0">
          <MiddleFeed />
        </div>

        {/* Right Sidebar - Hidden on mobile and tablet */}
        <div className="w-80 flex-shrink-0 hidden xl:block">
          <RightSidebar />
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavBar />
    </div>
  );
}

import LeftSidebar from "../components/LeftSidebar";
import MiddleFeed from "../components/homepage/MiddleFeed";
import RightSidebar from "../components/homepage/RightSidebar";

export default function HomePage() {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Left Sidebar */}
      <div className="w-60 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
        <LeftSidebar />
      </div>

      {/* Middle Feed */}
      <div className="flex-1 min-w-0 border-r border-gray-200 dark:border-gray-700">
        <MiddleFeed />
      </div>

      {/* Right Sidebar */}
      <div className="w-80 flex-shrink-0 hidden lg:block">
        <RightSidebar />
      </div>
    </div>
  );
}

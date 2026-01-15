import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { Bell, Settings } from "lucide-react";

export default function SidebarMenuPopup() {
  const { logout } = useAuth();

  return (
    <div className="absolute left-full bottom-0 ml-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
      <button
        onClick={logout}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        Logout
      </button>
      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
        Saved Posts
      </button>
      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
        Report a Problem
      </button>
      {/* <button className="w-full items-center text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
        <ThemeToggle />
        <span>Theme</span>
      </button>

      <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition">
        <Bell size={20} />
      </button>

      <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition">
        <Settings size={20} />
      </button> */}
    </div>
  );
}

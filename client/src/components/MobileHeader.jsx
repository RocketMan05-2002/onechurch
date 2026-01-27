import { Menu, Bell } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MobileHeader({ onMenuClick }) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 lg:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <img
            src="/logo45.png"
            alt="OneChurch"
            className="h-8 w-auto"
            onError={(e) => {
              e.target.src = "/logo1.png";
            }}
          />
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/notifications")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Bell size={22} className="text-gray-700 dark:text-gray-300" />
          </button>

          <button
            onClick={onMenuClick}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <Menu size={22} className="text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
}

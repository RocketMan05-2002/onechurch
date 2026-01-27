import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, LogOut, Bookmark, AlertCircle } from "lucide-react";

export default function SidebarMenuPopup({ buttonRef, onClose }) {
  const { logout } = useAuth();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (buttonRef?.current) {
      // Desktop Sidebar Logic
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom - 200, // Position above the button
        left: rect.right + 8, // 8px margin to the right
        isDesktop: true,
      });
    } else {
      // Mobile Top Right Logic
      setPosition({
        top: 60, // Below header
        right: 16,
        isMobile: true,
      });
    }
  }, [buttonRef]);

  const style = position.isMobile
    ? { top: `${position.top}px`, right: `${position.right}px` }
    : { top: `${position.top}px`, left: `${position.left}px` };

  return createPortal(
    <>
      {/* Backdrop for mobile */}
      {position.isMobile && (
        <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      )}

      <div
        className="fixed w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 rounded-xl shadow-xl py-2 z-[9999] animate-fade-in"
        style={style}
      >
        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700/50 mb-1 lg:hidden">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Menu
          </h3>
        </div>

        {/* <div className="px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>
        </div> */}

        <div className="border-t border-gray-100 dark:border-gray-700/50 my-1" />

        <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition">
          <Bookmark size={18} />
          <span>Saved Posts</span>
        </button>
        <button className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition">
          <AlertCircle size={18} />
          <span>Report a Problem</span>
        </button>

        <div className="border-t border-gray-100 dark:border-gray-700/50 my-1" />

        <button
          onClick={logout}
          className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 flex items-center gap-3 transition"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </>,
    document.body,
  );
}

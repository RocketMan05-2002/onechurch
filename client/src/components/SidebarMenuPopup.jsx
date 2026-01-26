import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { Bell, Settings } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

export default function SidebarMenuPopup({ buttonRef }) {
  const { logout } = useAuth();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom - 200, // Position above the button
        left: rect.right + 8, // 8px margin to the right
      });
    }
  }, [buttonRef]);

  return createPortal(
    <div
      className="fixed w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-200 rounded-lg shadow-lg py-2 z-[9999]"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
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
    </div>,
    document.body,
  );
}

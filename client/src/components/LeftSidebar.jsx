import {
  Home,
  Search,
  PlusCircle,
  MessageCircle,
  User,
  Menu,
  X,
} from "lucide-react";
import { useState, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import SidebarMenuPopup from "./SidebarMenuPopup";
import CreateContent from "./CreateContent";
import { useAuth } from "../context/AuthContext";
import { createPortal } from "react-dom";

export default function LeftSidebar() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const { user } = useAuth();

  const navigation = [
    { label: "Home", to: "/", icon: Home },
    { label: "Search & Explore", to: "/search", icon: Search },
    { label: "Forum", to: "/forum", icon: MessageCircle },
    { label: "Create", to: "#", icon: PlusCircle },
    {
      label: "Profile",
      to: user ? `/profile/${user._id}` : "/profile",
      icon: User,
    },
  ];

  const handleCreateClick = () => {
    // Check role, open modal
    setCreateModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full py-4 px-3 gap-6 relative bg-gray-950">
      {/* Logo */}
      <div className="flex justify-center items-end gap-2 mb-4">
        <img src="/logo45.png" alt="" className="w-34 h-20" />
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-1">
        {navigation.map((item, idx) =>
          item.label === "Create" ? (
            <button
              key={idx}
              onClick={handleCreateClick}
              className="flex items-center gap-6 px-4 py-2 w-full
                           rounded-lg transition
                           hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <item.icon size={24} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ) : (
            <NavLink
              key={idx}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-6 px-4 py-2 w-full rounded-lg transition
                 ${
                   isActive
                     ? "bg-gray-200 dark:bg-gray-700 font-semibold"
                     : "hover:bg-gray-200 dark:hover:bg-gray-700"
                 }`
              }
            >
              <item.icon size={24} />
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ),
        )}
      </div>

      {/* Bottom Menu */}
      <div className="absolute bottom-8">
        <button
          ref={menuButtonRef}
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-6 px-4 py-2 w-full
                     rounded-lg transition
                     hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Menu size={22} />
          <span className="text-sm font-medium">More</span>
        </button>

        {menuOpen && <SidebarMenuPopup buttonRef={menuButtonRef} />}
      </div>

      {createModalOpen && (
        <CreateModal
          onClose={() => setCreateModalOpen(false)}
          userRole={user?.role}
        />
      )}
    </div>
  );
}

function CreateModal({ onClose, userRole }) {
  const [contentType, setContentType] = useState(null);

  if (contentType) {
    return <CreateContent onClose={onClose} initialType={contentType} />;
  }

  const isMinister = userRole === "minister";

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[9999] text-gray-200 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl z-10">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-6 text-center">Create</h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => setContentType("tweet")}
            className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition font-semibold text-center w-full"
          >
            Create Tweet
          </button>

          {isMinister && (
            <>
              <button
                onClick={() => setContentType("post")}
                className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition font-semibold text-center w-full"
              >
                Create Post
              </button>
              <Link
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Story creation coming soon!");
                  onClose();
                }}
                className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition font-semibold text-center"
              >
                Add to Story
              </Link>
            </>
          )}
        </div>
      </div>
      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>,
    document.body,
  );
}

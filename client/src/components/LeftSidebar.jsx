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
import CreateSelectorModal from "./CreateSelectorModal";
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
        <CreateSelectorModal
          onClose={() => setCreateModalOpen(false)}
          userRole={user?.role}
        />
      )}
    </div>
  );
}

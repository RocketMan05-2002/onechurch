import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, MessageCircle, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import CreateSelectorModal from "./CreateSelectorModal";

export default function MobileNavBar() {
  const { user } = useAuth();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "#create", icon: PlusSquare, label: "Create", isAction: true },
    { path: "/forum", icon: MessageCircle, label: "Forum" },
    { path: `/profile/${user?._id}`, icon: User, label: "Profile" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 lg:hidden">
        <div className="flex justify-around items-center h-14 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = !item.isAction && isActive(item.path);

            if (item.isAction) {
              return (
                <button
                  key={item.label}
                  onClick={() => setShowCreateModal(true)}
                  className="flex flex-col items-center justify-center p-2"
                >
                  <div className="p-2 rounded-lg bg-accent text-black">
                    <Icon size={22} strokeWidth={2} />
                  </div>
                </button>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center p-2 min-w-[60px]"
              >
                <Icon
                  size={24}
                  strokeWidth={active ? 2.5 : 1.5}
                  className={`transition-colors ${
                    active ? "text-accent" : "text-gray-500 dark:text-gray-400"
                  }`}
                />
              </NavLink>
            );
          })}
        </div>

        {/* Safe area padding for notched phones */}
        <div className="h-safe-area-inset-bottom bg-white dark:bg-gray-950" />
      </nav>

      {showCreateModal && (
        <CreateSelectorModal
          onClose={() => setShowCreateModal(false)}
          userRole={user?.role}
        />
      )}
    </>
  );
}

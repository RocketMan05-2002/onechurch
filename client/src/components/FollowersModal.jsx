import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FollowersModal({ followers, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredFollowers = followers.filter((follower) =>
    follower.fullName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Followers ({followers.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search followers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Followers List */}
        <div className="overflow-y-auto max-h-[calc(80vh-140px)]">
          {filteredFollowers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? "No followers found" : "No followers yet"}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredFollowers.map((follower) => (
                <div
                  key={follower._id}
                  onClick={() => handleUserClick(follower._id)}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition flex items-center gap-3"
                >
                  <img
                    src={follower.profilePic || "/logo2.jpg"}
                    alt={follower.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {follower.fullName}
                    </h3>
                    {follower.bio && (
                      <p className="text-sm text-gray-500 truncate">
                        {follower.bio}
                      </p>
                    )}
                    {follower.role && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {follower.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

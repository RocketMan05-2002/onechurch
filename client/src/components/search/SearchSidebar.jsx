import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../context/SearchContext";

export default function SearchSidebar() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("churches");
  const navigate = useNavigate();

  const { results, performSearch, loading } = useSearch();

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      performSearch(query, activeTab);
    }, 500);
    return () => clearTimeout(handler);
  }, [query, activeTab]);

  const showResults = query.trim().length > 0;

  return (
    <div className="p-4 h-full flex flex-col gap-4 bg-white dark:bg-black">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={`Search ${activeTab}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="
            w-full pl-10 pr-4 py-2 rounded-xl
            bg-gray-100 dark:bg-gray-800
            text-sm
            outline-none
            focus:ring-2 focus:ring-blue-500/90
            text-gray-900 dark:text-gray-100
          "
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {["churches", "users"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex-1 py-2 rounded-xl text-sm font-medium capitalize
              transition
              ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Results / Empty State */}
      <div className="flex-1 overflow-y-auto mt-2 custom-scrollbar">
        {!showResults && (
          <div className="text-center text-sm text-gray-400 mt-10">
            Start typing to search {activeTab}
          </div>
        )}

        {showResults && loading && (
          <div className="text-center text-sm text-gray-400 mt-4">
            Searching...
          </div>
        )}

        {showResults && !loading && (
          <div className="space-y-2">
            {results.length === 0 ? (
              <div className="text-center text-sm text-gray-400 mt-4">
                No results found
              </div>
            ) : (
              results.map((item, i) => (
                <div
                  key={item._id || i}
                  onClick={() => navigate(`/profile/${item._id}`)}
                  className="
                    flex items-center gap-3 p-3 rounded-xl
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    cursor-pointer transition
                    "
                >
                  <img
                    src={
                      item.profilePic || item.avatarUrl || "/default-avatar.png"
                    }
                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                    alt=""
                  />

                  <div className="leading-tight">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.name || item.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activeTab === "churches" ? item.address : item.email}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import CreateContent from "./CreateContent";

export default function CreateSelectorModal({ onClose, userRole }) {
  const [contentType, setContentType] = useState(null);

  if (contentType) {
    return <CreateContent onClose={onClose} initialType={contentType} />;
  }

  const isMinister = userRole === "minister";

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[9999] text-gray-200 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl z-10 animate-fade-in border border-gray-200 dark:border-gray-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
          Create
        </h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => setContentType("tweet")}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition font-semibold text-center w-full text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700"
          >
            Create Tweet
          </button>

          {isMinister && (
            <>
              <button
                onClick={() => setContentType("post")}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition font-semibold text-center w-full text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700"
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
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition font-semibold text-center text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700"
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

import { useState, useEffect } from "react";
import { useComment } from "../context/CommentContext";
import { useAuth } from "../context/AuthContext";
import { Trash2, Send } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CommentSection({ contentType, contentId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { createComment, getComments, deleteComment } = useComment();
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [contentId]);

  const fetchComments = async () => {
    const fetchedComments = await getComments(contentType, contentId);
    setComments(fetchedComments);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    const comment = await createComment(
      contentType,
      contentId,
      newComment.trim(),
    );
    if (comment) {
      setComments([comment, ...comments]);
      setNewComment("");
    }
    setLoading(false);
  };

  const handleDelete = async (commentId) => {
    const success = await deleteComment(commentId);
    if (success) {
      setComments(comments.filter((c) => c._id !== commentId));
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    // More than a week, show date
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: diffDays > 365 ? "numeric" : undefined,
    });
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <img
          src={user?.profilePic || "/logo2.jpg"}
          alt="Your avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="px-4 py-2 bg-accent text-gray-950 rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="flex gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <img
                src={comment.commentedBy?.profilePic || "/logo2.jpg"}
                alt={comment.commentedBy?.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {comment.commentedBy?.fullName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {comment.body}
                </p>
              </div>
              {user?._id === comment.commentedBy?._id && (
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Repeat,
  Share,
  Send,
  Trash2,
  MoreHorizontal,
  Edit3,
  X,
  Check,
} from "lucide-react";
import { useForumContext } from "../../context/ForumContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export default function TweetCard({ tweet }) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const {
    likeTweet,
    commentOnTweet,
    retweetTweet,
    shareTweet,
    deleteTweet,
    editTweet,
    deleteComment,
  } = useForumContext();

  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(
    tweet.body || tweet.content || "",
  );

  // Backend returns populated 'author', fallback for safety
  const author = tweet.author || tweet.postedBy || {};
  const authorId = author._id || author.id;

  const authorName = author.fullName || tweet.username || "Unknown";
  const authorHandle =
    author.email?.split("@")[0] ||
    tweet.handle ||
    authorName.replace(/\s+/g, "").toLowerCase();

  const avatarUrl = author.profilePic || "/logo2.jpg";
  const content = tweet.body || tweet.content || "";

  const likeCount = Array.isArray(tweet.likes)
    ? tweet.likes.length
    : tweet.likeCount || 0;

  const isOwner =
    currentUser &&
    (currentUser._id === authorId || currentUser.id === authorId);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await commentOnTweet(tweet._id, commentText);
      setCommentText("");
      setShowCommentBox(false);
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetweet = async () => {
    try {
      await retweetTweet(tweet._id);
      toast.success("Retweeted!");
    } catch (error) {
      toast.error("Failed to retweet");
    }
  };

  const handleShare = async () => {
    try {
      const link = await shareTweet(tweet._id);
      await navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to share");
    }
  };

  const handleDeleteTweet = async () => {
    if (!confirm("Are you sure you want to delete this tweet?")) return;
    try {
      await deleteTweet(tweet._id || tweet.id);
      toast.success("Tweet deleted");
    } catch (error) {
      toast.error("Failed to delete tweet");
    }
    setShowMenu(false);
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setSubmitting(true);
    try {
      await editTweet(tweet._id, { content: editContent });
      setIsEditing(false);
      toast.success("Tweet updated");
    } catch (error) {
      toast.error("Failed to update tweet");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(tweet._id, commentId);
      toast.success("Comment deleted");
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const goToProfile = (userId) => {
    if (userId) navigate(`/profile/${userId}`);
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
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 p-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition">
      <div className="flex gap-3">
        {/* Avatar - clickable */}
        <div
          className="flex-shrink-0 cursor-pointer"
          onClick={() => goToProfile(authorId)}
        >
          <img
            src={avatarUrl}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition"
          />
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm mb-1 min-w-0">
              <span
                onClick={() => goToProfile(authorId)}
                className="font-bold text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:underline"
              >
                {authorName}
              </span>
              <span className="text-gray-500 truncate">@{authorHandle}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 hover:underline">
                {formatTime(tweet.createdAt)}
              </span>
            </div>

            {/* Tweet menu */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <MoreHorizontal size={16} className="text-gray-500" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteTweet}
                      className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left text-sm"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Text Body */}
          {isEditing ? (
            <div className="mb-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"
                  disabled={submitting}
                >
                  <X size={18} />
                </button>
                <button
                  onClick={handleEdit}
                  className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                  disabled={submitting}
                >
                  <Check size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-900 dark:text-gray-100 text-[15px] leading-normal whitespace-pre-wrap break-words">
              {content}
            </div>
          )}

          {/* Tweet Image */}
          {tweet.media && tweet.media.length > 0 && tweet.media[0].url && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img
                src={tweet.media[0].url}
                alt="Tweet media"
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center mt-3 max-w-sm text-gray-500">
            <button
              onClick={() => setShowCommentBox(!showCommentBox)}
              className="flex items-center gap-2 group hover:text-blue-500 transition-colors"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition">
                <MessageCircle size={18} />
              </div>
              <span className="text-xs">{tweet.comments?.length || 0}</span>
            </button>

            <button
              onClick={handleRetweet}
              className="flex items-center gap-2 group hover:text-green-500 transition-colors"
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition">
                <Repeat size={18} />
              </div>
              <span className="text-xs">{tweet.retweets?.length || 0}</span>
            </button>

            <button
              onClick={() => likeTweet(tweet._id || tweet.id)}
              className="flex items-center gap-2 group hover:text-pink-500 transition-colors"
            >
              <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition">
                <Heart size={18} />
              </div>
              <span className="text-xs">{likeCount}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 group hover:text-blue-500 transition-colors"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition">
                <Share size={18} />
              </div>
              <span className="text-xs">{tweet.shares || 0}</span>
            </button>
          </div>

          {/* Comment Box */}
          {showCommentBox && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 outline-none text-sm"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !submitting) {
                    handleComment();
                  }
                }}
              />
              <button
                onClick={handleComment}
                disabled={submitting || !commentText.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-semibold"
              >
                <Send size={14} />
              </button>
            </div>
          )}

          {/* Show existing comments with full info */}
          {tweet.comments && tweet.comments.length > 0 && (
            <div className="mt-3 space-y-2">
              {tweet.comments.map((comment, idx) => {
                const commenter = comment.user || {};
                const commenterId = commenter._id || commenter.id;
                const commenterName = commenter.fullName || "User";
                const commenterPic = commenter.profilePic || "/logo2.jpg";
                const canDeleteComment =
                  currentUser &&
                  (currentUser._id === commenterId ||
                    currentUser.id === commenterId ||
                    isOwner);

                return (
                  <div
                    key={comment._id || idx}
                    className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2"
                  >
                    <img
                      src={commenterPic}
                      alt=""
                      onClick={() => goToProfile(commenterId)}
                      className="w-7 h-7 rounded-full object-cover cursor-pointer hover:opacity-80"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => goToProfile(commenterId)}
                          className="font-semibold text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                        >
                          {commenterName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {comment.text}
                      </p>
                    </div>
                    {canDeleteComment && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { EllipsisVertical, Trash2, Edit3, X, Check } from "lucide-react";

import { FaHeart, FaShare, FaPrayingHands } from "react-icons/fa";
import { BiSolidCommentDetail } from "react-icons/bi";
import { usePost } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";
import CommentSection from "./CommentSection";

export default function PostCard({ post }) {
  const { likePost, savePost, reportPost, deletePost, editPost } = usePost();
  const { user } = useAuth();
  const [liked, setLiked] = useState(
    post.likes?.some((l) => l.liker === user?._id) || false,
  );
  const [saved, setSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [editData, setEditData] = useState({
    title: post.title || "",
    body: post.body || "",
  });
  const [submitting, setSubmitting] = useState(false);

  const author = post.postedBy || {};
  const isOwner =
    user &&
    (user._id === author._id ||
      user.id === author._id ||
      user._id === author.id);

  const handleLike = async () => {
    setLiked(!liked);
    await likePost(post._id);
  };

  const handleSave = async () => {
    setSaved(!saved);
    await savePost(post._id);
  };

  const handleReport = async () => {
    // Simple prompt for now
    const reason = prompt("Reason for reporting:");
    if (reason) {
      await reportPost(post._id, reason);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(post._id);
    }
    setShowMenu(false);
  };

  const handleEdit = async () => {
    setSubmitting(true);
    const success = await editPost(post._id, editData);
    if (success) {
      setIsEditing(false);
    }
    setSubmitting(false);
  };

  const handleShare = async () => {
    const authorId = post.postedBy?._id || post.postedBy?.id;
    const shareLink = `${window.location.origin}/profile/${authorId}`;
    try {
      await navigator.clipboard.writeText(shareLink);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="relative">
      {/* Sacred halo / aura */}
      <div
        className="
          absolute -inset-1
          rounded-2xl
          blur-xl
          bg-blue-300/10 ark:bg-blue-400/5
          pointer-events-none
        "
      />

      {/* Card */}
      <div
        className="
          relative
          bg-white dark:bg-gray-950
          dark:border-gray-800
          rounded-2xl
          shadow-sm
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <img
              src={author.profilePic || "https://via.placeholder.com/40"}
              alt={author.fullName}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-300 dark:ring-gray-700"
            />
            <div className="flex flex-col">
              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                {author.fullName}
              </span>
              {author.location && (
                <span className="text-xs text-gray-500">{author.location}</span>
              )}
            </div>
          </div>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)}>
              <EllipsisVertical size={22} className="text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 py-2">
                {isOwner ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <Edit3 size={16} /> Edit Post
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition"
                    >
                      <Trash2 size={16} /> Delete Post
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleReport();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Report Post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        {isEditing ? (
          <div className="px-4 pb-4 space-y-3">
            <input
              type="text"
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
              placeholder="Title (optional)"
            />
            <textarea
              value={editData.body}
              onChange={(e) =>
                setEditData({ ...editData, body: e.target.value })
              }
              rows={4}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white resize-none"
              placeholder="What's on your mind?"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
                disabled={submitting}
              >
                <X size={20} />
              </button>
              <button
                onClick={handleEdit}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Check size={20} />
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {post.title && (
              <div className="px-4 pb-2 font-semibold text-gray-900 dark:text-gray-100">
                {post.title}
              </div>
            )}

            {post.body && (
              <div className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {post.body}
              </div>
            )}
          </>
        )}

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="bg-black mt-2">
            {/* Just show first media for now or carousel if multiple */}
            {post.media[0].type === "image" ? (
              <img
                src={post.media[0].url}
                alt="Post"
                className="w-full max-h-[500px] object-cover"
              />
            ) : (
              <video
                src={post.media[0].url}
                controls
                className="w-full max-h-[500px]"
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between px-4 py-3 mt-1">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition group ${liked ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}
            >
              <FaHeart
                size={24}
                className="cursor-pointer group-hover:scale-110 transition"
              />
              <span className="text-sm font-medium">{post.likeCount || 0}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 text-gray-700 dark:text-gray-300 group"
            >
              <BiSolidCommentDetail
                size={24}
                className="cursor-pointer group-hover:scale-110 transition"
              />
              <span className="text-sm font-medium">
                {post.commentCount || 0}
              </span>
            </button>
          </div>
          <div className="flex flex-row gap-5 relative">
            <button
              onClick={handleShare}
              className="text-gray-700 dark:text-gray-300 hover:text-accent transition relative"
            >
              <FaShare
                size={22}
                className="cursor-pointer hover:scale-110 transition"
              />
              {/* Copied Tooltip */}
              {showCopied && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-accent text-gray-950 text-xs px-3 py-1.5 rounded-lg shadow-lg z-50 whitespace-nowrap animate-fade-in">
                  Link copied!
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent rotate-45"></div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Time */}
        <div className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wide">
          {formatDistanceToNow(new Date(post.createdAt || Date.now()), {
            addSuffix: true,
          })}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="px-4 pb-4">
            <CommentSection contentType="post" contentId={post._id} />
          </div>
        )}
      </div>
    </div>
  );
}

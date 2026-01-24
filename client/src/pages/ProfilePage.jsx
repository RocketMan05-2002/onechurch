import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LeftSidebar from "../components/LeftSidebar";
import TweetCard from "../components/forum/TweetCard";
import EditProfileModal from "../components/EditProfileModal";
import ExplorePostModal from "../components/search/ExplorePostModal";
import { Grid, MessageSquare, Sparkles, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import api from "../api/axios";

export default function ProfilePage() {
  const { id } = useParams(); // Get profile ID from URL
  const { user: currentUser, loading: authLoading } = useAuth();
  const { followUser, unfollowUser } = useSocial();

  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState("tweets");
  const [posts, setPosts] = useState([]);
  const [userTweets, setUserTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);

  const isOwnProfile = !id || id === currentUser?._id || id === currentUser?.id;
  const displayUser = isOwnProfile ? currentUser : profileUser;

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfilePic(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const endpoint =
        currentUser?.role === "minister"
          ? "/ministers/profile-picture"
          : "/users/profile-picture";

      const response = await api.put(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update currentUser in AuthContext or reload page
      window.location.reload();
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setUploadingProfilePic(false);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const targetId = id || currentUser?._id || currentUser?.id;

        if (!targetId || targetId === "undefined") {
          setLoading(false);
          return;
        }

        // Fetch user profile if viewing someone else
        if (!isOwnProfile) {
          const profileRes = await api.get(`/users/${id}/profile`);
          setProfileUser(profileRes.data.user || profileRes.data.minister);

          // Check if following
          const isFollowingUser = currentUser?.following?.some(
            (f) => f.targetId === id || f.targetId?._id === id,
          );
          setIsFollowing(!!isFollowingUser);
        }

        // Fetch posts and tweets
        const [postsRes, tweetsRes] = await Promise.all([
          api
            .get(`/posts?userId=${targetId}`)
            .catch(() => ({ data: { posts: [] } })),
          api
            .get(`/tweets?userId=${targetId}`)
            .catch(() => ({ data: { tweets: [] } })),
        ]);

        setPosts(postsRes.data.posts || []);
        setUserTweets(tweetsRes.data.tweets || []);
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, currentUser, isOwnProfile]);

  const handleFollow = async () => {
    if (!displayUser) return;

    const targetModel =
      displayUser.role === "minister" || displayUser.ministerType
        ? "Minister"
        : "User";

    if (isFollowing) {
      await unfollowUser(displayUser._id);
      setIsFollowing(false);
    } else {
      await followUser(displayUser._id, targetModel);
      setIsFollowing(true);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-black dark:text-gray-100">
        <p>Please log in to view profiles.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-black dark:text-gray-100">
        <p>Loading profile...</p>
      </div>
    );
  }

  const isMinister =
    displayUser?.role === "minister" || displayUser?.ministerType;
  const showPostsTab = isMinister;

  return (
    <div className="min-h-screen flex bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 w-full">
      {/* Left Sidebar */}
      <div className="w-60 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 hidden md:block">
        <LeftSidebar />
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto w-full">
        {/* Cover + Profile Header */}
        <div className="relative">
          <div className="w-full h-60 bg-gradient-to-r from-blue-400 to-purple-500">
            {/* Placeholder Cover */}
          </div>

          <div className="px-8 relative">
            <div className="absolute -top-16 left-8">
              <div className="relative group">
                <img
                  src={displayUser?.profilePic || "/logo2.jpg"}
                  alt="Profile"
                  className={`w-32 h-32 rounded-full border-4 border-white dark:border-black object-cover bg-white ${
                    isOwnProfile ? "cursor-pointer" : ""
                  }`}
                  onClick={() => {
                    if (isOwnProfile && !uploadingProfilePic) {
                      document.getElementById("profile-pic-upload")?.click();
                    }
                  }}
                />
                {isOwnProfile && (
                  <>
                    <input
                      id="profile-pic-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePicUpload}
                      disabled={uploadingProfilePic}
                    />
                    {uploadingProfilePic && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {!uploadingProfilePic && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                        <span className="text-white text-xs font-semibold">
                          Change
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Edit Profile or Follow Button */}
            <div className="flex justify-end pt-4">
              {isOwnProfile ? (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition ${
                    isFollowing
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="mt-4 mb-6">
              <h1 className="text-2xl font-bold">{displayUser?.fullName}</h1>
              <p className="text-gray-500">
                @{displayUser?.email?.split("@")[0]}
              </p>

              {isMinister && displayUser?.ministerType && (
                <span className="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
                  {displayUser.ministerType}
                </span>
              )}

              <p className="mt-4 max-w-xl text-sm text-gray-700 dark:text-gray-300">
                {displayUser?.bio || "No bio yet."}
              </p>

              {/* Stats Row */}
              <div className="flex gap-8 mt-4 text-sm text-gray-500">
                {showPostsTab && (
                  <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-gray-100 font-bold text-lg leading-tight">
                      {posts.length}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                      Posts
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-gray-900 dark:text-gray-100 font-bold text-lg leading-tight">
                    {displayUser?.followerCount ||
                      displayUser?.followers?.length ||
                      0}
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                    Followers
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-900 dark:text-gray-100 font-bold text-lg leading-tight">
                    {displayUser?.followingCount ||
                      displayUser?.following?.length ||
                      0}
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                    Following
                  </span>
                </div>
                {displayUser?.prayerStreak !== undefined && (
                  <div className="flex flex-col group cursor-help border-l border-gray-100 dark:border-gray-800 pl-8">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={16} className="text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-black text-lg leading-tight">
                        {displayUser.prayerStreak || 0}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 group-hover:text-green-500 transition-colors">
                      Prayer Streak
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-900 sticky top-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl z-10">
          {showPostsTab && (
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 ${
                activeTab === "posts"
                  ? "border-b-2 border-green-500 text-green-600 dark:text-green-400"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Grid size={16} /> Posts
            </button>
          )}
          <button
            onClick={() => setActiveTab("tweets")}
            className={`flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 ${
              activeTab === "tweets"
                ? "border-b-2 border-green-500 text-green-600 dark:text-green-400"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <MessageSquare size={16} /> Tweets
          </button>
        </div>

        {/* Content Feed */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (activeTab === "posts" && posts.length === 0) ||
            (activeTab === "tweets" && userTweets.length === 0) ? (
            <div className="p-12 text-center flex flex-col items-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                {activeTab === "posts" ? (
                  <Grid size={24} />
                ) : (
                  <MessageSquare size={24} />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                No {activeTab} yet
              </h3>
              <p className="text-sm">
                {isOwnProfile
                  ? `When you create ${activeTab}, they will appear here.`
                  : `This user hasn't posted any ${activeTab} yet.`}
              </p>
            </div>
          ) : (
            <div
              className={
                activeTab === "posts"
                  ? "grid grid-cols-3 gap-1"
                  : "flex flex-col"
              }
            >
              {activeTab === "posts"
                ? posts.map((post) => (
                    <div
                      key={post._id}
                      onClick={() => setSelectedPost(post)}
                      className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer hover:opacity-90 transition relative group"
                    >
                      {post.media && post.media[0] ? (
                        <>
                          <img
                            src={post.media[0].url}
                            className="w-full h-full object-cover"
                            alt="Post"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex items-center gap-4 text-white font-semibold">
                              <div className="flex items-center gap-1">
                                <Heart size={20} fill="white" />
                                <span>
                                  {post.likeCount || post.likes?.length || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 p-2 text-xs text-center">
                          {post.body || "No Image"}
                        </div>
                      )}
                    </div>
                  ))
                : userTweets.map((tweet) => (
                    <TweetCard key={tweet._id} tweet={tweet} />
                  ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <EditProfileModal
          user={currentUser}
          onClose={() => setEditModalOpen(false)}
        />
      )}

      {/* Post Modal */}
      {selectedPost && (
        <ExplorePostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}

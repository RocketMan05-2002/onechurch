import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LeftSidebar from "../components/LeftSidebar";
import TweetCard from "../components/forum/TweetCard";
import EditProfileModal from "../components/EditProfileModal";
import ExplorePostModal from "../components/search/ExplorePostModal";
import FollowersModal from "../components/FollowersModal";
import FollowingModal from "../components/FollowingModal";
import MobileNavBar from "../components/MobileNavBar";
import MobileHeader from "../components/MobileHeader";
import SidebarMenuPopup from "../components/SidebarMenuPopup";
import { Grid, MessageSquare, Sparkles, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocial } from "../context/SocialContext";
import useProfileCache from "../hooks/useProfileCache";
import { toast } from "react-hot-toast";
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
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isOwnProfile = !id || id === currentUser?._id || id === currentUser?.id;
  // Prioritize profileUser (fetched full data) over currentUser (context partial data)
  // ONLY use currentUser as fallback or for ID checks.
  const displayUser = profileUser || (isOwnProfile ? currentUser : null);

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

      await api.put(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile picture updated successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to upload profile picture. Please try again.",
      );
    } finally {
      setUploadingProfilePic(false);
    }
  };

  // Profile caching
  const targetId = id || currentUser?._id || currentUser?.id;
  const { cachedData, setCache, isCacheValid } = useProfileCache(targetId);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Wait for auth to finish loading
        if (authLoading) {
          return;
        }

        const targetId = id || currentUser?._id || currentUser?.id;

        if (!targetId || targetId === "undefined") {
          setLoading(false);
          return;
        }

        // Check cache first for non-own profiles
        if (!isOwnProfile && cachedData && isCacheValid()) {
          console.log("📦 Using cached profile data");
          setProfileUser(cachedData.user);
          setPosts(cachedData.posts || []);
          setUserTweets(cachedData.tweets || []);
          setIsFollowing(cachedData.isFollowing || false);
          setLoading(false);
          return;
        }

        setLoading(true);

        // ALWAYS fetch the full profile data from the API, even for own profile.
        // This fixes the issue where 'currentUser' context has incomplete data (missing bio, banner, etc.)
        // immediately after login.

        // 1. Fetch User Data
        let userData = null;
        let isFollowingUser = false;

        if (isOwnProfile) {
          // For own profile, try to get from /me endpoint via the specific ID to ensure we get "Profile" view
          // Actually, we can just use the generic profile endpoint
          const profileRes = await api.get(`/users/${targetId}/profile`);
          userData = profileRes.data.user || profileRes.data.minister;
        } else {
          const profileRes = await api.get(`/users/${id}/profile`);
          userData = profileRes.data.user || profileRes.data.minister;

          // Check following status
          isFollowingUser = currentUser?.following?.some(
            (f) => f.targetId === id || f.targetId?._id === id,
          );
          setIsFollowing(!!isFollowingUser);
        }

        setProfileUser(userData);

        // 2. Fetch Content (Posts/Tweets)
        const [postsRes, tweetsRes] = await Promise.all([
          api
            .get(`/posts?userId=${targetId}`)
            .catch(() => ({ data: { posts: [] } })),
          api
            .get(`/tweets?userId=${targetId}`)
            .catch(() => ({ data: { tweets: [] } })),
        ]);

        const postsData = postsRes.data.posts || [];
        const tweetsData = tweetsRes.data.tweets || [];

        setPosts(postsData);
        setUserTweets(tweetsData);

        // Cache the data (for everyone)
        setCache({
          user: userData,
          posts: postsData,
          tweets: tweetsData,
          isFollowing: !!isFollowingUser,
        });
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, currentUser?._id, isOwnProfile, authLoading]);

  const handleFollow = async () => {
    if (!displayUser) return;

    const targetModel =
      displayUser.role === "minister" || displayUser.ministerType
        ? "Minister"
        : "User";

    try {
      if (isFollowing) {
        const success = await unfollowUser(displayUser._id);
        if (success) {
          setIsFollowing(false);
          // Update counts optimistically
          setProfileUser((prev) => ({
            ...prev,
            followerCount: Math.max((prev?.followerCount || 0) - 1, 0),
          }));
        }
      } else {
        const success = await followUser(displayUser._id, targetModel);
        if (success) {
          setIsFollowing(true);
          // Update counts optimistically
          setProfileUser((prev) => ({
            ...prev,
            followerCount: (prev?.followerCount || 0) + 1,
          }));
        }
      }
    } catch (error) {
      console.error("Follow/unfollow error:", error);
    }
  };

  const handleShowFollowers = async () => {
    try {
      // Block viewing other ministers' followers, but allow viewing own
      if (displayUser?.role === "minister" && !isOwnProfile) return;
      const targetId = displayUser?._id;
      if (!targetId) return;
      const res = await api.get(`/users/${targetId}/followers`);
      setFollowers(res.data.followers || []);
      setShowFollowersModal(true);
    } catch (error) {
      console.error("Failed to fetch followers:", error);
    }
  };

  const handleShowFollowing = async () => {
    try {
      // Block viewing other ministers' following, but allow viewing own
      if (displayUser?.role === "minister" && !isOwnProfile) return;
      const targetId = displayUser?._id;
      if (!targetId) return;
      const res = await api.get(`/users/${targetId}/following`);
      setFollowing(res.data.following || []);
      setShowFollowingModal(true);
    } catch (error) {
      console.error("Failed to fetch following:", error);
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
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setShowMobileMenu(true)} />

      {/* Mobile Menu Popup */}
      {showMobileMenu && (
        <SidebarMenuPopup onClose={() => setShowMobileMenu(false)} />
      )}

      <div className="flex">
        {/* Left Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-60 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0">
          <LeftSidebar />
        </div>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto w-full pt-14 lg:pt-0 pb-16 lg:pb-0">
          {/* Cover + Profile Header */}
          <div className="relative group/banner">
            <div className="w-full h-60 bg-gray-800 overflow-hidden relative">
              {displayUser?.bannerPic ? (
                <img
                  src={displayUser.bannerPic}
                  className="w-full h-full object-contain"
                  alt="Banner"
                />
              ) : null}

              {/* Banner Overlay & Edit Button for Owner */}
              {isOwnProfile && (
                <>
                  <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const formData = new FormData();
                        formData.append("image", file);
                        const endpoint =
                          currentUser?.role === "minister"
                            ? "/ministers/banner-picture"
                            : "/users/banner-picture";
                        await api.put(endpoint, formData, {
                          headers: { "Content-Type": "multipart/form-data" },
                        });
                        toast.success("Banner updated successfully!");
                        window.location.reload();
                      } catch (err) {
                        console.error("Banner upload failed", err);
                        toast.error(
                          err.response?.data?.message ||
                            "Failed to upload banner. Please try again.",
                        );
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("banner-upload")?.click()
                    }
                    className="absolute inset-0 bg-black/0 group-hover/banner:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover/banner:opacity-100 cursor-pointer w-full h-full border-0"
                    aria-label="Change banner"
                  >
                    <span className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md pointer-events-none">
                      Change Banner
                    </span>
                  </button>
                </>
              )}
            </div>

            <div className="px-8 relative">
              <div className="absolute -top-16 left-8">
                <div className="relative group">
                  <img
                    src={displayUser?.profilePic || "/logo2.jpg"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-black object-cover bg-white"
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
                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("profile-pic-upload")
                              ?.click()
                          }
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer border-0"
                          aria-label="Change profile picture"
                        >
                          <span className="text-white text-xs font-semibold pointer-events-none">
                            Change
                          </span>
                        </button>
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
                ) : // Hide follow button if current user is minister and profile user is regular user
                currentUser?.role === "minister" &&
                  displayUser?.role === "user" ? (
                  <button
                    className={`px-6 py-2 rounded-full font-semibold text-sm transition ${
                      isFollowing
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300"
                        : "bg-gray-900 text-gray-900"
                    }`}
                  >
                    {isFollowing ? "-" : "-"}
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-full font-semibold text-sm transition ${
                      isFollowing
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-950 hover:bg-gray-300"
                        : "bg-accent text-gray-950 hover:bg-accent-hover"
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
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-accent-hover text-gray-950 dark:text-gray-950 rounded-full text-xs font-semibold">
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
                  <div
                    onClick={handleShowFollowers}
                    className={`flex flex-col transition ${
                      displayUser?.role === "minister" && !isOwnProfile
                        ? "cursor-default"
                        : "cursor-pointer hover:opacity-80"
                    }`}
                  >
                    <span className="text-gray-900 dark:text-gray-100 font-bold text-lg leading-tight">
                      {displayUser?.followerCount ||
                        displayUser?.followers?.length ||
                        0}
                    </span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                      Followers
                    </span>
                  </div>
                  <div
                    onClick={handleShowFollowing}
                    className={`flex flex-col transition ${
                      displayUser?.role === "minister" && !isOwnProfile
                        ? "cursor-default"
                        : "cursor-pointer hover:opacity-80"
                    }`}
                  >
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
                        <Sparkles size={16} className="text-accent-light" />
                        <span className="text-green-600 dark:text-accent-hover font-black text-lg leading-tight">
                          {displayUser.prayerStreak || 0}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 group-hover:text-accent-hover transition-colors">
                        Prayer Streak
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-900 sticky top-0 bg-white/95 dark:bg-gray-950 backdrop-blur-xl z-10">
            {showPostsTab && (
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 ${
                  activeTab === "posts"
                    ? "border-b-2 border-accent text-accent dark:text-accent"
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
                  ? "border-b-2 border-accent text-accent dark:text-accent"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <MessageSquare size={16} /> Tweets
            </button>
          </div>

          {/* Content Feed */}
          <div className="min-h-[300px] dark:bg-gray-950">
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
                    ? "columns-3 gap-4 p-4"
                    : "flex flex-col"
                }
              >
                {activeTab === "posts"
                  ? posts.map((post) => (
                      <div
                        key={post._id}
                        onClick={() => setSelectedPost(post)}
                        className="
                        relative cursor-pointer overflow-hidden
                        rounded-xl bg-gray-100 dark:bg-gray-800
                        shadow-sm
                        transition-all duration-300 ease-out
                        hover:shadow-xl hover:-translate-y-1
                        active:scale-[0.98]
                        group
                        mb-4
                        break-inside-avoid
                      "
                      >
                        {post.media && post.media[0] ? (
                          <>
                            <img
                              src={post.media[0].url}
                              className="
                              w-full h-auto
                              object-cover
                              transition-transform duration-300
                              group-hover:scale-[1.05]
                            "
                              alt="Post"
                            />
                            {/* Hover overlay */}
                            <div
                              className="
                            absolute inset-0
                            bg-black/0 group-hover:bg-black/40
                            transition
                            flex items-center justify-center
                            opacity-0 group-hover:opacity-100
                          "
                            >
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
                          <div className="w-full h-full flex items-center justify-center text-gray-400 p-4 text-sm text-center">
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

        {/* Followers Modal */}
        {showFollowersModal && (
          <FollowersModal
            followers={followers}
            onClose={() => setShowFollowersModal(false)}
          />
        )}

        {/* Following Modal */}
        {showFollowingModal && (
          <FollowingModal
            following={following}
            onClose={() => setShowFollowingModal(false)}
          />
        )}

        {/* Mobile Bottom Navigation */}
        <MobileNavBar />
      </div>
    </div>
  );
}

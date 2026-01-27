import { useEffect, useState } from "react";
import api from "../../api/axios";
import { devotionalsData } from "../../data/devotionalsData";
import { CheckCircle2, Quote, Sparkles } from "lucide-react";
import { useSocial } from "../../context/SocialContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RightSidebar() {
  const [devotional, setDevotional] = useState(null);
  const [amenClicked, setAmenClicked] = useState(false);
  const [recommended, setRecommended] = useState([]);
  const { followUser, unfollowUser } = useSocial();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Pick random devotional ONCE
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * devotionalsData.length);
    setDevotional(devotionalsData[randomIndex]);
  }, []);

  // Fetch recommended ministers
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const { data } = await api.get("/ministers/recommended");
        // Filter out current user if they're a minister
        const filteredMinisters = (data.ministers || []).filter(
          (minister) => minister._id !== currentUser?._id,
        );

        // Mark ministers as followed if they're in the current user's following list
        const ministersWithFollowState = filteredMinisters.map((minister) => {
          const isFollowed = currentUser?.following?.some(
            (f) =>
              f.targetId === minister._id || f.targetId?._id === minister._id,
          );
          return { ...minister, isFollowed: !!isFollowed };
        });

        setRecommended(ministersWithFollowState);
      } catch (error) {
        console.error("Failed to fetch recommended", error);
      }
    };
    fetchRecommended();
  }, [currentUser]);

  const handleAmen = async () => {
    setAmenClicked(true);
    try {
      await api.post("/users/amen");
    } catch (err) {
      console.error("Failed to record amen", err);
    }
  };

  const handleFollow = async (id, isFollowed) => {
    // Optimistically update UI
    setRecommended((prev) =>
      prev.map((m) => (m._id === id ? { ...m, isFollowed: !isFollowed } : m)),
    );

    try {
      if (isFollowed) {
        await unfollowUser(id);
      } else {
        await followUser(id, "Minister");
      }
    } catch (error) {
      // Revert if failed
      setRecommended((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isFollowed: isFollowed } : m)),
      );
    }
  };

  if (!devotional) return null;

  return (
    <div className="p-4 flex flex-col h-[calc(100vh)] bg-white dark:bg-gray-950">
      {/* Suggestions Section */}
      <div className="flex flex-col gap-5 mb-8">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
            Ministers for you
          </h2>
          <button
            onClick={() => navigate("/search")}
            className="text-[11px] font-bold text-accent hover:opacity-80 transition-colors uppercase tracking-wider"
          >
            Explore
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {recommended.length > 0 ? (
            recommended.map((church, idx) => (
              <div
                key={church._id || idx}
                onClick={() => navigate(`/profile/${church._id}`)}
                className="flex justify-between items-center group cursor-pointer p-2 -m-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 group-hover:from-orange-400 group-hover:to-yellow-500 transition-all duration-500">
                      <img
                        src={church.profilePic || "/logo2.jpg"}
                        onError={(e) => {
                          e.target.src = "/logo2.jpg";
                        }}
                        alt=""
                        className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-950"
                      />
                    </div>
                    {/* Assuming verification logic exists or hardcode check */}
                    {church.isVerified && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-gray-950 rounded-full p-0.5 shadow-sm">
                        <CheckCircle2
                          size={13}
                          className="text-accent fill-accent/10"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-accent transition-colors">
                      {church.fullName}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                      {church.location || "Global"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!church.isFollowed) {
                      handleFollow(church._id, church.isFollowed);
                    } else {
                      handleFollow(church._id, church.isFollowed);
                    }
                  }}
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all duration-300 active:scale-90 ${
                    church.isFollowed
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 border-transparent hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 hover:border-red-200"
                      : "border-gray-200 dark:border-gray-800 hover:border-accent hover:bg-accent hover:text-gray-950 dark:hover:bg-accent dark:hover:border-accent"
                  }`}
                >
                  {church.isFollowed ? "Following" : "Follow"}
                </button>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-400 text-center">
              No recommendations yet.
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto px-1">
        {/* Daily Bread (Devotional) Section - Minimalistic */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-900 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-accent">
              Daily Bread
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[14px] leading-relaxed text-gray-800 dark:text-gray-200 font-medium italic">
              "{devotional.verse}"
            </p>
          </div>

          <button
            onClick={handleAmen}
            className={`
              w-full py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200
              ${
                amenClicked
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:bg-accent hover:text-gray-950 cursor-pointer"
              }
            `}
          >
            {amenClicked ? "Recorded in logs" : "Amen"}
          </button>
        </div>
      </div>
    </div>
  );
}

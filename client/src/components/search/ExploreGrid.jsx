import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Heart, MessageCircle } from "lucide-react";

export default function ExploreGrid({ onPostClick }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        const { data } = await api.get("/explore");
        setItems(data?.feed || []);
      } catch (error) {
        console.error("Failed to fetch explore feed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExplore();
  }, []);

  return (
    <div
      className="
        p-4
        grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4
        gap-4
        auto-rows-min
        grid-flow-row-dense
      "
    >
      {loading ? (
        [...Array(12)].map((_, i) => <SkeletonCard key={i} />)
      ) : items.length === 0 ? (
        <div className="col-span-full text-center py-10 text-gray-500">
          No exploration posts found.
        </div>
      ) : (
        items.map((item) => {
          // Determine image source based on type
          let imageUrl = null;
          if (item.type === "post") {
            imageUrl = item.media?.[0]?.url;
          } else if (item.type === "tweet") {
            imageUrl = item.media?.[0]?.url; // Tweets might have media
          }

          // If no image, maybe show a text card?
          // For now, let's filter out text-only items for the grid to keep it visual
          if (!imageUrl) return null;

          const likes = item.likes?.length || 0;
          const comments = item.comments?.length || 0; // Assuming comments array exists or populate logic

          return (
            <div
              key={item._id}
              onClick={() => onPostClick?.(item)}
              className="
                relative cursor-pointer overflow-hidden
                rounded-xl bg-white dark:bg-gray-900
                shadow-sm
                transition-all duration-300 ease-out
                hover:shadow-xl hover:-translate-y-1
                active:scale-[0.98]
                group
                aspect-[4/5]
              "
            >
              <img
                src={imageUrl}
                alt=""
                className="
                  w-full h-full
                  object-cover
                  transition-transform duration-300
                  group-hover:scale-[1.05]
                "
              />

              {/* Hover Overlay */}
              <div
                className="
                  absolute inset-0
                  bg-black/0 group-hover:bg-black/40
                  transition
                  flex items-center justify-center
                  opacity-0 group-hover:opacity-100
                "
              >
                <div className="flex items-center gap-6 text-white font-semibold">
                  <div className="flex items-center gap-2">
                    <Heart size={20} fill="white" />
                    <span>{likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={20} />
                    <span>{comments}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="
        rounded-xl
        bg-gray-200 dark:bg-gray-800
        animate-pulse
        h-56 sm:h-60 md:h-64 lg:h-56
      "
    />
  );
}

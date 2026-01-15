import StoriesRow from "./StoriesRow";
import { postsData } from "../../data/postsData";
import PostCard from "../PostCard";

export default function MiddleFeed() {
  return (
    <div className="flex flex-col h-screen dark:bg-gray-950">
      {/* Top Bar (fixed) */}
      <div
        className="
          sticky top-0 z-20
          flex justify-between items-center
          px-6 py-4
          dark:border-gray-800
          bg-white/80 dark:bg-gray-950/80
          backdrop-blur
        "
      >
        {/* <div className="text-xl font-semibold tracking-wide">
          Believer&apos;s Ark
        </div> */}
      </div>

      {/* Stories (fixed) */}
      <div
        className="
          sticky top-0 z-20
          border-b border-gray-200 dark:border-gray-800
          bg-white/90 dark:bg-gray-950/90
          backdrop-blur
          px-4 pb-4
        "
      >
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 px-4 mb-1">
          Stories
        </h2>
        <StoriesRow />

        {/* Trending Section */}
        <div className="mt-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 px-4 mb-3">
            Trending Now
          </h2>
          <div className="flex overflow-x-auto no-scrollbar gap-3 px-4">
            {[
              { tag: "#Faith", posts: "1.2k", likes: "5.4k" },
              { tag: "#Hope", posts: "850", likes: "3.2k" },
              { tag: "#Community", posts: "2.1k", likes: "12k" },
              { tag: "#SundayService", posts: "3.4k", likes: "20k" },
              { tag: "#Gospel", posts: "920", likes: "4.1k" },
              { tag: "#ModernWorship", posts: "1.1k", likes: "6.7k" },
            ].map((item) => (
              <div
                key={item.tag}
                className="
                  flex-shrink-0
                  w-40 p-4
                  bg-gray-50 dark:bg-gray-900/50
                  hover:bg-white dark:hover:bg-gray-800
                  rounded-2xl
                  border border-gray-100 dark:border-gray-800
                  hover:border-green-300 dark:hover:border-green-900/50
                  hover:shadow-lg hover:shadow-green-500/10
                  cursor-pointer 
                  transition-all duration-300
                  group
                "
              >
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {item.tag}
                </div>
                <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-tight text-gray-500 dark:text-gray-500">
                  <span className="group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                    {item.posts} posts
                  </span>
                  <span className="group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                    {item.likes} likes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Background (subtle sacred texture) */}
      <div className="relative flex-1 overflow-y-auto">
        <div
          className="
            absolute inset-0
            pointer-events-none
          "
        />

        {/* Posts (ONLY SCROLL AREA) */}
        <div className="relative px-4 py-8 flex justify-center">
          <div className="w-full max-w-xl flex flex-col gap-10">
            {postsData.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

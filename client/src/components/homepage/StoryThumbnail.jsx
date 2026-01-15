export default function StoryThumbnail({ church, isWatched, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        flex flex-col items-center gap-2
        w-20 flex-shrink-0
        group
      "
    >
      {/* Ring */}
      <div
        className={`
          relative
          p-[2.5px]
          rounded-full
          transition-all duration-300
          ${
            isWatched
              ? "bg-gray-300 dark:bg-gray-700 opacity-70"
              : "bg-gradient-to-tr from-green-400 via-green-500 to-yellow-400"
          }
          group-hover:scale-105
        `}
      >
        {/* Glow */}
        {!isWatched && (
          <div
            className="
              absolute inset-0 rounded-full
              blur-md
              bg-green-400/40
              dark:bg-green-500/20
              -z-10
            "
          />
        )}

        {/* Image & Hover Overlay */}
        <div className="relative overflow-hidden rounded-full">
          <img
            src={church.profileThumb}
            alt={church.churchName}
            className="
              w-20 h-20
              rounded-full
              object-cover
              border-2
              border-white dark:border-black
              bg-gray-100 dark:bg-gray-900
              transition-all duration-300
              group-hover:opacity-0
              group-hover:blur-[1px]
            "
          />
          <div
            className="
            absolute inset-0 
            flex items-center justify-center
            bg-black/40
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
            pointer-events-none
          "
          >
            <span className="text-white text-[10px] font-bold uppercase tracking-wider">
              see story
            </span>
          </div>
        </div>
      </div>

      {/* Name */}
      <span
        className="
          text-xs
          truncate
          w-full
          text-center
          text-gray-700 dark:text-gray-300
          group-hover:text-black dark:group-hover:text-white
          transition
        "
      >
        {church.churchName}
      </span>
    </button>
  );
}

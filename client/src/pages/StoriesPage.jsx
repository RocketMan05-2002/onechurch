import { X } from "lucide-react";
import { BsArrowLeftCircleFill, BsArrowRightCircleFill } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStory } from "../context/StoryContext";

const STORY_DURATION = 5000;

export default function StoriesPage() {
  const { churchId } = useParams();
  const navigate = useNavigate();
  const { stories: allStories, viewStory } = useStory();

  // Filter stories for this specific church/minister
  const stories = allStories.filter(
    (s) => s.postedBy?._id?.toString() === churchId,
  );

  // If no stories found, go back
  useEffect(() => {
    // Only redirect if we are sure we have loaded stories and still found none
    // For now, let's just handle empty state loosely or it might redirect prematurely before load
    if (allStories.length > 0 && stories.length === 0) {
      // navigate(-1);
    }
  }, [allStories, stories.length, navigate]);

  const [index, setIndex] = useState(0);
  const progressRef = useRef(null);
  const timerRef = useRef(null);

  // Mark view on index change
  useEffect(() => {
    if (stories[index]) {
      viewStory(stories[index]._id);
    }
  }, [index, stories]);

  const startStory = () => {
    if (!progressRef.current) return;

    progressRef.current.style.transition = "none";
    progressRef.current.style.width = "0%";

    requestAnimationFrame(() => {
      progressRef.current.style.transition = `width ${STORY_DURATION}ms linear`;
      progressRef.current.style.width = "100%";
    });

    timerRef.current = setTimeout(() => {
      setIndex((i) => i + 1);
    }, STORY_DURATION);
  };

  useEffect(() => {
    if (stories.length === 0) return;

    if (index >= stories.length) {
      navigate(-1);
      return;
    }

    clearTimeout(timerRef.current);
    startStory();

    return () => clearTimeout(timerRef.current);
  }, [index, stories.length, navigate]);

  if (stories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center z-50">
        <p>Loading stories...</p>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-white/80 hover:text-white"
        >
          <X size={28} />
        </button>
      </div>
    );
  }

  const currentStory = stories[index];
  const church = currentStory.postedBy;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-white/80 hover:text-white"
      >
        <X size={28} />
      </button>

      <div className="relative w-full max-w-md h-full flex flex-col justify-center">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10">
          {/* Progress */}
          <div className="flex gap-1 mb-3">
            {stories.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-[3px] bg-white/30 rounded overflow-hidden"
              >
                {i === index && (
                  <div ref={progressRef} className="h-full bg-white w-0" />
                )}
                {i < index && <div className="h-full bg-white w-full" />}
              </div>
            ))}
          </div>

          {/* Church Info */}
          <div className="flex items-center gap-3">
            <img
              src={church?.profilePic || "https://via.placeholder.com/40"}
              className="w-9 h-9 rounded-full object-cover border border-white/40"
              alt={church?.fullName}
            />
            <span className="text-white text-sm font-medium">
              {church?.fullName || "Church"}
            </span>
          </div>
        </div>

        {/* Story Content */}
        <div className="relative w-full h-full flex items-center justify-center group bg-gray-900">
          {currentStory.media?.type === "image" ? (
            <img
              src={currentStory.media.url}
              className="max-h-full max-w-full object-contain"
              alt="Story"
            />
          ) : (
            <video
              src={currentStory.media.url}
              className="max-h-full max-w-full object-contain"
              autoPlay
              muted // Muted for autoplay policy, maybe add toggle
              playsInline
            />
          )}

          {/* Left Arrow */}
          {index > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIndex((i) => Math.max(i - 1, 0));
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 
                 text-white/70 hover:text-white
                 opacity-0 group-hover:opacity-100
                 transition"
            >
              <BsArrowLeftCircleFill size={24} />
            </button>
          )}

          {/* Right Arrow */}
          {index < stories.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIndex((i) => i + 1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 
                 text-white/70 hover:text-white
                 opacity-0 group-hover:opacity-100
                 transition"
            >
              <BsArrowRightCircleFill size={24} />
            </button>
          )}

          {/* Tap zones */}
          <div
            className="absolute left-0 top-0 w-1/3 h-full z-0"
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          />
          <div
            className="absolute right-0 top-0 w-2/3 h-full z-0"
            onClick={() => setIndex((i) => i + 1)}
          />
        </div>
      </div>
    </div>
  );
}

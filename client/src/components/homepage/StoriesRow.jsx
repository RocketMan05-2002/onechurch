import { useNavigate } from "react-router-dom";
import StoryThumbnail from "./StoryThumbnail";
import { useStory } from "../../context/StoryContext";

export default function StoriesRow() {
  const navigate = useNavigate();
  const { stories } = useStory();

  // Group stories by minister/church
  const groupedStories = stories.reduce((acc, story) => {
    const authorId = story.postedBy?._id;
    if (!authorId) return acc;

    if (!acc[authorId]) {
      acc[authorId] = {
        churchId: authorId,
        churchName: story.postedBy.fullName,
        profileThumb: story.postedBy.profilePic,
        stories: [],
      };
    }
    acc[authorId].stories.push(story);
    // Sort logic handled in backend mostly, or here.
    return acc;
  }, {});

  const validStories = Object.values(groupedStories);

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto px-4 py-3 scrollbar-hide">
        {validStories.length > 0 ? (
          validStories.map((church) => (
            <StoryThumbnail
              key={church.churchId}
              church={church}
              onClick={() => navigate(`/stories/${church.churchId}`)}
            />
          ))
        ) : (
          <div className="text-xs text-gray-500 px-2">No active stories</div>
        )}
      </div>
    </div>
  );
}

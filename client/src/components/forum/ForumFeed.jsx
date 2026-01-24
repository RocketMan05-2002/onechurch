// src/components/forum/ForumFeed.jsx
import TweetCard from "./TweetCard";

export default function ForumFeed({ tweets, onLike }) {
  if (!tweets || tweets.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No posts yet. Be the first to post!
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {tweets.map((tweet) => (
        <TweetCard key={tweet._id || tweet.id} tweet={tweet} onLike={onLike} />
      ))}
    </div>
  );
}

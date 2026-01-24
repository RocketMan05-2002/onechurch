import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
import { useWebSocket } from "./WebSocketContext";

const ForumContext = createContext();

export const ForumProvider = ({ children }) => {
  const [tweets, setTweets] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { socket } = useWebSocket();

  const fetchTweets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/tweets");
      setTweets(data.tweets);
    } catch (error) {
      console.error("Failed to fetch tweets", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const { data } = await api.get("/tweets/trending");
      setTrending(data.trending);
    } catch (error) {
      console.error("Failed to fetch trending", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTweets();
      fetchTrending();
    }
  }, [user]);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    // New tweet
    socket.on("new-tweet", (tweet) => {
      setTweets((prev) => {
        if (prev.find((t) => t._id === tweet._id)) return prev;
        return [tweet, ...prev];
      });
    });

    // Tweet liked
    socket.on("tweet-liked", ({ tweetId, likes }) => {
      setTweets((prev) =>
        prev.map((t) => (t._id === tweetId ? { ...t, likes } : t)),
      );
    });

    // New comment
    socket.on("new-comment", ({ tweetId, comment }) => {
      setTweets((prev) =>
        prev.map((t) =>
          t._id === tweetId
            ? { ...t, comments: [...(t.comments || []), comment] }
            : t,
        ),
      );
    });

    // New retweet
    socket.on("new-retweet", (retweet) => {
      setTweets((prev) => {
        if (prev.find((t) => t._id === retweet._id)) return prev;
        return [retweet, ...prev];
      });
    });

    return () => {
      socket.off("new-tweet");
      socket.off("tweet-liked");
      socket.off("new-comment");
      socket.off("new-retweet");
    };
  }, [socket]);

  const postTweet = async (tweetData) => {
    try {
      const formData = new FormData();
      formData.append("content", tweetData.content || "");

      // If image is a File object, append it
      if (tweetData.image && tweetData.image instanceof File) {
        formData.append("image", tweetData.image);
      }

      const { data } = await api.post("/tweets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Add author info for immediate UI update
      const newTweet = { ...data.tweet, author: user };
      setTweets((prev) => [newTweet, ...prev]);
      return newTweet;
    } catch (error) {
      console.error("Post tweet failed", error);
      throw error;
    }
  };

  const likeTweet = async (id) => {
    try {
      const { data } = await api.post(`/tweets/${id}/like`);
      // Update local state based on response
      setTweets((prev) =>
        prev.map((t) => (t._id === id ? { ...t, likes: data.tweet.likes } : t)),
      );
    } catch (error) {
      console.error("Like tweet failed", error);
    }
  };

  const commentOnTweet = async (id, text) => {
    try {
      const { data } = await api.post(`/tweets/${id}/comment`, { text });
      // Update local state
      setTweets((prev) => prev.map((t) => (t._id === id ? data.tweet : t)));
      return data.tweet;
    } catch (error) {
      console.error("Comment failed", error);
      throw error;
    }
  };

  const retweetTweet = async (id, comment = "") => {
    try {
      const { data } = await api.post(`/tweets/${id}/retweet`, { comment });
      // Add the retweet to feed if created
      if (data.tweet) {
        setTweets((prev) => [data.tweet, ...prev]);
      }
      return data;
    } catch (error) {
      console.error("Retweet failed", error);
      throw error;
    }
  };

  const shareTweet = async (id) => {
    try {
      const { data } = await api.post(`/tweets/${id}/share`);
      // Update share count
      setTweets((prev) =>
        prev.map((t) => (t._id === id ? { ...t, shares: data.shares } : t)),
      );
      return data.shareLink;
    } catch (error) {
      console.error("Share failed", error);
      throw error;
    }
  };

  const deleteTweet = async (id) => {
    try {
      await api.delete(`/tweets/${id}`);
      setTweets((prev) => prev.filter((t) => t._id !== id));
      return true;
    } catch (error) {
      console.error("Delete tweet failed", error);
      throw error;
    }
  };

  const editTweet = async (id, updatedData) => {
    try {
      const { data } = await api.put(`/tweets/${id}`, updatedData);
      setTweets((prev) => prev.map((t) => (t._id === id ? data.tweet : t)));
      return data.tweet;
    } catch (error) {
      console.error("Edit tweet failed", error);
      throw error;
    }
  };

  const deleteComment = async (tweetId, commentId) => {
    try {
      await api.delete(`/tweets/${tweetId}/comment/${commentId}`);
      // Update local state
      setTweets((prev) =>
        prev.map((t) =>
          t._id === tweetId
            ? { ...t, comments: t.comments.filter((c) => c._id !== commentId) }
            : t,
        ),
      );
      return true;
    } catch (error) {
      console.error("Delete comment failed", error);
      throw error;
    }
  };

  return (
    <ForumContext.Provider
      value={{
        tweets,
        loading,
        postTweet,
        likeTweet,
        commentOnTweet,
        retweetTweet,
        shareTweet,
        deleteTweet,
        editTweet,
        deleteComment,
        refresh: fetchTweets,
        trending,
      }}
    >
      {children}
    </ForumContext.Provider>
  );
};

export const useForumContext = () => useContext(ForumContext);

import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { useWebSocket } from "./WebSocketContext";
import { useAuth } from "./AuthContext"; // Import AuthContext

const PostContext = createContext();

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useWebSocket();
  const { user } = useAuth(); // Import user from AuthContext (need to import AuthContext first)

  // Fetch all posts
  const getPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      setPosts(res.data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      // toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // WebSocket listeners for real-time post updates
  useEffect(() => {
    if (!socket) return;

    socket.on("new-post", (post) => {
      setPosts((prev) => {
        if (prev.find((p) => p._id === post._id)) return prev;
        return [post, ...prev];
      });
    });

    socket.on("post-liked", ({ postId, likeCount }) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likeCount } : p)),
      );
    });

    return () => {
      socket.off("new-post");
      socket.off("post-liked");
    };
  }, [socket]);

  const createPost = async (postData) => {
    try {
      // Check if postData is FormData (for file uploads) or regular object
      const isFormData = postData instanceof FormData;

      const res = await api.post("/posts", postData, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
      });

      setPosts((prev) => [res.data.post, ...prev]);
      toast.success("Post created!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create post");
      return false;
    }
  };

  const likePost = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      // Update local state
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? { ...post, likeCount: res.data.likeCount } // We might need to toggle 'isLiked' manually if API doesn't return it
            : post,
        ),
      );
      return true;
    } catch (error) {
      console.error("Like error:", error);
      return false;
    }
  };

  const savePost = async (postId) => {
    try {
      await api.post(`/posts/${postId}/save`);
      toast.success("Post saved");
      return true;
    } catch (error) {
      toast.error("Failed to save post");
      console.error(error);
      return false;
    }
  };

  const unsavePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}/save`);
      toast.success("Post removed from saved");
      return true;
    } catch (error) {
      toast.error("Failed to unsave post");
      return false;
    }
  };

  const reportPost = async (postId, reason) => {
    try {
      await api.post(`/posts/${postId}/report`, { reason });
      toast.success("Post reported");
      return true;
    } catch (error) {
      toast.error("Failed to report post");
      return false;
    }
  };

  const deletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success("Post deleted");
      return true;
    } catch (error) {
      toast.error("Failed to delete post");
      return false;
    }
  };

  const editPost = async (postId, updatedData) => {
    try {
      const res = await api.put(`/posts/${postId}`, updatedData);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? res.data.post : p)),
      );
      toast.success("Post updated!");
      return true;
    } catch (error) {
      toast.error("Failed to update post");
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      getPosts();
    }
  }, [user]);

  return (
    <PostContext.Provider
      value={{
        posts,
        loading,
        getPosts,
        createPost,
        likePost,
        savePost,
        unsavePost,
        reportPost,
        deletePost,
        editPost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => useContext(PostContext);

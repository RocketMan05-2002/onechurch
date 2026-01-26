import { createContext, useContext, useState } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const CommentContext = createContext();

export const CommentProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const createComment = async (contentType, contentId, body) => {
    setLoading(true);
    try {
      const res = await api.post("/comments", {
        contentType,
        contentId,
        body,
      });
      toast.success("Comment added!");
      return res.data.comment;
    } catch (error) {
      console.error("Create comment error:", error);
      toast.error(error.response?.data?.message || "Failed to add comment");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getComments = async (contentType, contentId) => {
    try {
      const res = await api.get(`/comments/${contentType}/${contentId}`);
      return res.data.comments || [];
    } catch (error) {
      console.error("Get comments error:", error);
      return [];
    }
  };

  const deleteComment = async (commentId) => {
    setLoading(true);
    try {
      await api.delete(`/comments/${commentId}`);
      toast.success("Comment deleted");
      return true;
    } catch (error) {
      console.error("Delete comment error:", error);
      toast.error("Failed to delete comment");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommentContext.Provider
      value={{ createComment, getComments, deleteComment, loading }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export const useComment = () => useContext(CommentContext);

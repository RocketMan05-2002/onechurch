import { createContext, useContext, useState } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const SocialContext = createContext();

export const SocialProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const followUser = async (id, targetModel) => {
    setLoading(true);
    try {
      await api.post(`/users/${id}/follow`, { targetModel });
      toast.success(
        `Followed ${targetModel === "Minister" ? "Minister" : "User"}`,
      );
      return true;
    } catch (error) {
      console.error("Follow error:", error);
      toast.error(error.response?.data?.message || "Failed to follow");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unfollowUser = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/users/${id}/follow`);
      toast.success("Unfollowed");
      return true;
    } catch (error) {
      console.error("Unfollow error:", error);
      toast.error("Failed to unfollow");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getFollowers = async (id) => {
    try {
      const res = await api.get(`/users/${id}/followers`);
      return res.data.followers;
    } catch (error) {
      console.error("Get followers error:", error);
      return [];
    }
  };

  const getFollowing = async (id) => {
    try {
      const res = await api.get(`/users/${id}/following`);
      return res.data.following;
    } catch (error) {
      console.error("Get following error:", error);
      return [];
    }
  };

  return (
    <SocialContext.Provider
      value={{ followUser, unfollowUser, getFollowers, getFollowing, loading }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => useContext(SocialContext);

import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const StoryContext = createContext();

export const StoryProvider = ({ children }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

  const getStories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/stories");
      setStories(res.data.stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      // toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  const createStory = async (storyData) => {
    try {
      const res = await api.post("/stories", storyData);
      setStories((prev) => [res.data.story, ...prev]);
      toast.success("Story posted successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create story");
      return false;
    }
  };

  const viewStory = async (id) => {
    try {
      await api.post(`/stories/${id}/view`);
      // Optimistically update view count if we tracked it locally in detail
    } catch (error) {
      console.error("Error viewing story:", error);
    }
  };

  const reactToStory = async (id) => {
    try {
      await api.post(`/stories/${id}/react`);
      // Refresh stories or update local state
      getStories();
    } catch (error) {
      console.error("Error reacting to story:", error);
    }
  };

  useEffect(() => {
    getStories();
  }, []);

  return (
    <StoryContext.Provider
      value={{
        stories,
        loading,
        getStories,
        createStory,
        viewStory,
        reactToStory,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => useContext(StoryContext);

import { useState, useEffect } from "react";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_PREFIX = "profile_cache_";

/**
 * Custom hook for caching user profile data in localStorage
 * @param {string} userId - The user ID to cache data for
 * @returns {object} - Cache utilities
 */
export default function useProfileCache(userId) {
  const [cachedData, setCachedData] = useState(null);

  const cacheKey = `${CACHE_PREFIX}${userId}`;

  // Load cache on mount
  useEffect(() => {
    if (!userId) return;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setCachedData(parsed);
      }
    } catch (error) {
      console.error("Error loading profile cache:", error);
    }
  }, [userId, cacheKey]);

  // Check if cache is still valid
  const isCacheValid = () => {
    if (!cachedData || !cachedData.timestamp) return false;
    const now = Date.now();
    return now - cachedData.timestamp < CACHE_DURATION;
  };

  // Set cache data
  const setCache = (data) => {
    if (!userId) return;

    const cacheData = {
      ...data,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      setCachedData(cacheData);
    } catch (error) {
      console.error("Error setting profile cache:", error);
    }
  };

  // Clear cache
  const clearCache = () => {
    if (!userId) return;

    try {
      localStorage.removeItem(cacheKey);
      setCachedData(null);
    } catch (error) {
      console.error("Error clearing profile cache:", error);
    }
  };

  return {
    cachedData,
    isCacheValid,
    setCache,
    clearCache,
  };
}

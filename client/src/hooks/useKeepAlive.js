import { useEffect, useRef } from "react";
import api from "../api/axios";

/**
 * Custom hook to keep the backend server alive by sending periodic health check requests
 * @param {boolean} enabled - Whether the keep-alive is enabled
 * @param {number} interval - Interval in milliseconds between pings (default: 4 minutes)
 */
export default function useKeepAlive(enabled = true, interval = 4 * 60 * 1000) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const ping = async () => {
      try {
        await api.get("/health");
        console.log("✅ Backend keep-alive ping successful");
      } catch (error) {
        console.warn("⚠️ Backend keep-alive ping failed:", error.message);
      }
    };

    // Initial ping
    ping();

    // Set up interval
    intervalRef.current = setInterval(ping, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval]);
}

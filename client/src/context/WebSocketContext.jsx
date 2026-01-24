import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectionState, setConnectionState] = useState("disconnected");
  const { user } = useAuth();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      // Clean up socket when user logs out
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
        setConnectionState("disconnected");
      }
      return;
    }

    // Only create socket if it doesn't exist
    if (socketRef.current) return;

    setConnectionState("connecting");

    // Initialize socket connection
    const socketInstance = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:8080",
      {
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: maxReconnectAttempts,
        timeout: 20000,
      },
    );

    socketInstance.on("connect", () => {
      console.log("✅ WebSocket connected:", socketInstance.id);
      setConnectionState("connected");
      reconnectAttemptsRef.current = 0;

      // Join user-specific room
      if (user._id || user.id) {
        socketInstance.emit("join", user._id || user.id);
      }

      // Join general feed room
      socketInstance.emit("join-feed");
    });

    socketInstance.on("disconnect", (reason) => {
      console.log(`❌ WebSocket disconnected: ${reason}`);
      setConnectionState("disconnected");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
      reconnectAttemptsRef.current++;

      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
        setConnectionState("error");
      }
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      // Only disconnect on unmount or user logout
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [user?._id || user?.id]); // Only depend on user ID, not entire user object

  const value = {
    socket,
    isConnected: connectionState === "connected",
    connectionState,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
};

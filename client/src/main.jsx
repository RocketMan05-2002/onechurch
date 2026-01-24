import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { WebSocketProvider } from "./context/WebSocketContext.jsx";
import { ForumProvider } from "./context/ForumContext.jsx";
import { SearchProvider } from "./context/SearchContext.jsx";
import { StoryProvider } from "./context/StoryContext.jsx";
import { SocialProvider } from "./context/SocialContext.jsx";
import { PostProvider } from "./context/PostContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <WebSocketProvider>
        <StoryProvider>
          <SocialProvider>
            <PostProvider>
              <ForumProvider>
                <SearchProvider>
                  <App />
                </SearchProvider>
              </ForumProvider>
            </PostProvider>
          </SocialProvider>
        </StoryProvider>
      </WebSocketProvider>
    </AuthProvider>
  </StrictMode>,
);

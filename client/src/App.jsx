import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SearchAndExplorePage from "./pages/SearchAndExplorePage.jsx";
import ForumPage from "./pages/ForumPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Search / Explore */}
        <Route path="/search" element={<SearchAndExplorePage />} />

        {/* Forum */}
        <Route path="/forum" element={<ForumPage />} />

        {/* Profile */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Catch-all: Redirect unknown routes to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

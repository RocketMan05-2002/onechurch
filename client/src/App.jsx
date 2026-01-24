import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SearchAndExplorePage from "./pages/SearchAndExplorePage.jsx";
import ForumPage from "./pages/ForumPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import StoriesPage from "./pages/StoriesPage.jsx";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const PublicRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null; // Or spinner
  return user ? <Navigate to="/" replace /> : <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchAndExplorePage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/stories/:churchId" element={<StoriesPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedRole = localStorage.getItem("role"); // 'user' or 'minister'
      if (!storedRole) {
        setLoading(false);
        return;
      }

      try {
        const endpoint =
          storedRole === "minister" ? "/ministers/profile/me" : "/users/me";
        const { data } = await api.get(endpoint);

        const userData = data.user || data.minister;
        // Ensure role is set on the user object
        userData.role = storedRole;
        setUser(userData);
      } catch (error) {
        console.error("Auth check failed", error);
        localStorage.removeItem("role");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password, role) => {
    const isMinister = role === "minister";
    const endpoint = isMinister ? "/ministers/login" : "/users/login";

    const { data } = await api.post(endpoint, { email, password });

    const userData = data.user || data.minister;
    userData.role = isMinister ? "minister" : "user";
    setUser(userData);

    // Store both role and token in localStorage
    localStorage.setItem("role", isMinister ? "minister" : "user");
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }

    return data;
  };

  const register = async (formData, role) => {
    const isMinister = role === "minister";
    const payload = {
      fullName: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: role,
    };

    const endpoint = isMinister ? "/ministers/register" : "/users/register";
    const { data } = await api.post(endpoint, payload);

    // No longer auto-login
    // setUser(userData);
    // localStorage.setItem("role", ...);

    return data;
  };

  const logout = async () => {
    const storedRole = localStorage.getItem("role");
    const endpoint =
      storedRole === "minister" ? "/ministers/logout" : "/users/logout";

    setUser(null);
    localStorage.removeItem("role");
    localStorage.removeItem("accessToken");

    try {
      await api.post(endpoint);
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

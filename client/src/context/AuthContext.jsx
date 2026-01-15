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

        setUser(data.user || data.minister);
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

    setUser(data.user || data.minister);
    localStorage.setItem("role", isMinister ? "minister" : "user");
    return data;
  };

  const register = async (formData, role) => {
    const isMinister = role === "minister";
    const payload = {
      fullName: formData.name,
      email: formData.email,
      password: formData.password,
      role: role,
    };

    const endpoint = isMinister ? "/ministers/register" : "/users/register";
    const { data } = await api.post(endpoint, payload);

    setUser(data.user || data.minister);
    localStorage.setItem("role", isMinister ? "minister" : "user");
    return data;
  };

  const logout = async () => {
    const storedRole = localStorage.getItem("role");
    const endpoint =
      storedRole === "minister" ? "/ministers/logout" : "/users/logout";

    setUser(null);
    localStorage.removeItem("role");

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

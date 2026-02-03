// hooks/useAuthForm.js
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Add navigation

export function useAuthForm() {
  const { login, register } = useAuth();
  // We need to access role state for login.
  // The LoginUI handles "role" field update.
  // The original useAuthForm had separate `updateField`.

  const [mode, setMode] = useState("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "", // Used for Full Name
    username: "",
    email: "",
    password: "",
    role: "user", // Default role
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear error on change
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const submitSignup = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }
    try {
      await register(formData, formData.role);
      // Success! Now switch to login mode.
      setMode("login");
      setError(""); // Clear any prev errors
      setFormData((prev) => ({ ...prev, password: "" })); // Clear password
      // Ideally show a toast or message here, but we'll let the UI handle "state change" for now
      // or set a temporary success message in error field?
      alert("Account created successfully! Please log in."); // Simple feedback
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  const submitLogin = async () => {
    try {
      await login(formData.email, formData.password, formData.role);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return {
    mode,
    setMode,
    showPassword,
    togglePassword,
    formData,
    updateField,
    submitSignup,
    submitLogin,
    error,
  };
}

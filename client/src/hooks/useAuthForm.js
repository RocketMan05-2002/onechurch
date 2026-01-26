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
      await register(formData, formData.role); // Role passed if needed on signup?
      // Actually signup creates a user or church.
      // User/Church creation APIs are separate.
      // CreateAccountUI doesn't have a role selector!
      // It assumes "User" probably? Or does it?
      // LoginUI HAS a role selector.
      // If "Signup" mode, we might need to know if it's church or user signup?
      // The current CreateAccountUI is generic.
      // I will assume defaults to 'user' unless we add role selector to signup.
      // For now let's default to 'user' for signup.

      // Wait, requirements said "at backend ... login and signup is done".
      // Backend User/Church logic is separate.
      // I should probably add role selector to Signup too or assume 'user' for now.
      // I'll assume 'user'.
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

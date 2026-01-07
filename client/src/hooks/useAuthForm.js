// hooks/useAuthForm.js
import { useState } from "react";

export function useAuthForm() {
  const [mode, setMode] = useState("signup");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const submitSignup = () => {
    if (!formData.name || !formData.email || !formData.password) return;
    console.log("Create Account Data:", formData);
  };

  const submitLogin = () => {
    console.log("Login Data:", formData);
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
  };
}

export default function CreateAccountUI({ auth }) {
  const {
    formData,
    updateField,
    showPassword,
    togglePassword,
    submitSignup,
    setMode,
  } = auth;

  const isFormValid =
    formData.name.trim() &&
    formData.username?.trim() &&
    formData.email.trim() &&
    formData.password.length >= 8;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-light text-gray-900 dark:text-gray-100">
          Create Account
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <button
            onClick={() => setMode("login")}
            className="text-accent font-medium hover:underline"
          >
            Log in
          </button>
        </p>
      </div>

      {/* Role Selector */}
      <div className="flex justify-center gap-2">
        {["user", "minister"].map((r) => (
          <button
            key={r}
            onClick={() => updateField("role", r)}
            className={`px-8 py-2 text-xs font-medium uppercase tracking-wider rounded-full transition-all
              ${
                formData.role === r
                  ? "bg-accent text-gray-950"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }
            `}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Name */}
      <div>
        <input
          type="text"
          placeholder="Full name"
          className="w-full px-4 py-3.5 rounded-lg
                     bg-transparent
                     border border-gray-200 dark:border-gray-700
                     text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500
                     outline-none
                     focus:border-accent
                     transition-colors"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
      </div>

      {/* Username */}
      <div>
        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-3.5 rounded-lg
                     bg-transparent
                     border border-gray-200 dark:border-gray-700
                     text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500
                     outline-none
                     focus:border-accent
                     transition-colors"
          value={formData.username || ""}
          onChange={(e) =>
            updateField(
              "username",
              e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
            )
          }
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 ml-1">
          Lowercase, numbers, and underscores only
        </p>
      </div>

      {/* Email */}
      <div>
        <input
          type="email"
          placeholder="Email address"
          className="w-full px-4 py-3.5 rounded-lg
                     bg-transparent
                     border border-gray-200 dark:border-gray-700
                     text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500
                     outline-none
                     focus:border-accent
                     transition-colors"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
      </div>

      {/* Password */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full px-4 py-3.5 rounded-lg
                     bg-transparent
                     border border-gray-200 dark:border-gray-700
                     text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500
                     outline-none
                     focus:border-accent
                     transition-colors"
          value={formData.password}
          onChange={(e) => updateField("password", e.target.value)}
        />
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-4 top-[35%] -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 ml-1">
          Minimum 8 characters
        </p>
      </div>

      {/* CTA */}
      <button
        disabled={!isFormValid}
        onClick={submitSignup}
        className={`w-full py-3.5 rounded-lg font-medium transition-colors
          ${
            isFormValid
              ? "bg-accent text-gray-950 hover:bg-accent-hover"
              : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          }
        `}
      >
        Create Account
      </button>
    </div>
  );
}

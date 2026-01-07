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
    formData.email.trim() &&
    formData.password.length >= 8;

  return (
    <div className="text-center text-white">
      <h1 className="text-2xl font-semibold">Create an account</h1>

      <p className="text-sm text-white/70 mt-1">
        Already have an account?{" "}
        <button onClick={() => setMode("login")} className="underline">
          Log in
        </button>
      </p>

      {/* Name */}
      <div className="mt-8 text-left">
        <label className="text-sm">What should we call you?</label>
        <input
          type="text"
          placeholder="Enter your profile name"
          className="w-full mt-2 px-4 py-3 rounded-xs bg-white/80 text-black outline-none"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
      </div>

      {/* Email */}
      <div className="mt-6 text-left">
        <label className="text-sm">What's your email?</label>
        <input
          type="email"
          placeholder="Enter your email address"
          className="w-full mt-2 px-4 py-3 rounded-xs bg-white/80 text-black outline-none"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
      </div>

      {/* Password */}
      <div className="mt-6 text-left relative">
        <label className="text-sm">Create a password</label>

        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-4 top-12 text-sm text-gray-600"
        >
          {showPassword ? "Hide" : "Show"}
        </button>

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          className="w-full mt-2 px-4 py-3 rounded-xs bg-white/80 text-black outline-none"
          value={formData.password}
          onChange={(e) => updateField("password", e.target.value)}
        />

        <p className="text-xs text-white/70 mt-2">
          Use 8 or more characters with letters, numbers & symbols
        </p>
      </div>

      {/* CTA */}
      <button
        disabled={!isFormValid}
        onClick={submitSignup}
        className={`w-full mt-6 py-3 rounded-md transition
          ${
            isFormValid
              ? "bg-black text-white"
              : "bg-gray-400 text-white cursor-not-allowed"
          }
        `}
      >
        Create an account
      </button>
    </div>
  );
}

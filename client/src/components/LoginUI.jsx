export default function LoginUI({ auth }) {
  const { updateField, submitLogin, setMode } = auth;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-light text-gray-900 dark:text-gray-100">
          Welcome Back
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <button
            onClick={() => setMode("signup")}
            className="text-accent font-medium hover:underline"
          >
            Create one
          </button>
        </p>
      </div>

      {/* Role Selector */}
      <div className="flex justify-center gap-2">
        {["user", "minister"].map((role) => (
          <button
            key={role}
            onClick={() => updateField("role", role)}
            className={`px-8 py-2 text-xs font-medium uppercase tracking-wider rounded-full transition-all
              ${
                auth.formData.role === role
                  ? "bg-accent text-gray-950"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }
            `}
          >
            {role}
          </button>
        ))}
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
                     focus:border-[--color-accent]
                     transition-colors"
          onChange={(e) => updateField("email", e.target.value)}
        />
      </div>

      {/* Password */}
      <div>
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3.5 rounded-lg
                     bg-transparent
                     border border-gray-200 dark:border-gray-700
                     text-gray-900 dark:text-gray-100
                     placeholder-gray-400 dark:placeholder-gray-500
                     outline-none
                     focus:border-[--color-accent]
                     transition-colors"
          onChange={(e) => updateField("password", e.target.value)}
        />
      </div>

      {/* CTA */}
      <button
        onClick={submitLogin}
        className="w-full py-3.5 rounded-lg
                   bg-accent text-gray-950 font-medium
                   hover:bg-accent-hover
                   transition-colors"
      >
        Log in
      </button>
    </div>
  );
}

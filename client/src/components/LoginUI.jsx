export default function LoginUI({ auth }) {
  const { updateField, submitLogin, setMode } = auth;

  return (
    <div className="text-center text-white">
      <h1 className="text-2xl font-semibold">Log in</h1>

      <p className="text-sm text-white/70 mt-1">
        Don’t have an account?{" "}
        <button onClick={() => setMode("signup")} className="underline">
          Create one
        </button>
      </p>

      {/* Role Selector */}
      <div className="mt-8 flex justify-center gap-2">
        {["user", "minister"].map((role) => (
          <button
            key={role}
            onClick={() => updateField("role", role)}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all
              ${
                auth.formData.role === role
                  ? "bg-white text-black shadow-lg"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }
            `}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Email */}
      <input
        type="email"
        placeholder="Email"
        className="w-full mt-8 px-4 py-3 rounded-md
                   bg-white/80 text-black outline-none
                   focus:ring-2 focus:ring-black/40"
        onChange={(e) => updateField("email", e.target.value)}
      />

      {/* Password */}
      <input
        type="password"
        placeholder="Password"
        className="w-full mt-4 px-4 py-3 rounded-md
                   bg-white/80 text-black outline-none
                   focus:ring-2 focus:ring-black/40"
        onChange={(e) => updateField("password", e.target.value)}
      />

      {/* CTA */}
      <button
        onClick={submitLogin}
        className="w-full mt-6 py-3 rounded-full
                   bg-black text-white
                   hover:opacity-90 transition"
      >
        Log in
      </button>
    </div>
  );
}

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

      <input
        type="email"
        placeholder="Email"
        className="w-full mt-8 px-4 py-3 rounded-md bg-white/80 text-black outline-none"
        onChange={(e) => updateField("email", e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full mt-4 px-4 py-3 rounded-md bg-white/80 text-black outline-none"
        onChange={(e) => updateField("password", e.target.value)}
      />

      <button
        onClick={submitLogin}
        className="w-full mt-6 py-3 rounded-full bg-black text-white"
      >
        Log in
      </button>
    </div>
  );
}

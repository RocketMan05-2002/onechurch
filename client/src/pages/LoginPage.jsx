import { useEffect, useState } from "react";
import { useAuthForm } from "../hooks/useAuthForm.js";
import CreateAccountUI from "../components/CreateAccountUI.jsx";
import LoginUI from "../components/LoginUI.jsx";
import BackgroundAudio from "../components/BackgroundAudio.jsx";

const backgrounds = ["/bg1.png", "/bg2.jpg", "/bg3.png"];
const ROTATE_INTERVAL = 10000; // 10s
const FADE_DURATION = 2000; // 2s

export default function LoginPage() {
  const auth = useAuthForm();
  const [activeBg, setActiveBg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBg((prev) => (prev + 1) % backgrounds.length);
    }, ROTATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Backgrounds */}
      {backgrounds.map((bg, index) => (
        <div
          key={bg}
          className={`absolute inset-0 transition-opacity duration-[${FADE_DURATION}ms] ${
            activeBg === index ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Logo */}
      <img
        src="/logo1.png"
        alt="logo"
        className="absolute top-6 left-6 w-22 h-18 z-20"
      />

      {/* Glass Auth Card */}
      <div className="relative z-20 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/20 border border-white/30 rounded-xl shadow-xl p-8">
          {auth.mode === "signup" ? (
            <CreateAccountUI auth={auth} />
          ) : (
            <LoginUI auth={auth} />
          )}
        </div>
      </div>

      {/* Background Music */}
      <BackgroundAudio />
    </div>
  );
}

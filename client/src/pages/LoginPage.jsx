import { useEffect, useState } from "react";
import { useAuthForm } from "../hooks/useAuthForm.js";
import CreateAccountUI from "../components/CreateAccountUI.jsx";
import LoginUI from "../components/LoginUI.jsx";
import BackgroundAudio from "../components/BackgroundAudio.jsx";

const backgrounds = ["/bg1.png", "/bg2.jpg", "/bg3.png"];
const ROTATE_INTERVAL = 10000; // 10s

const taglines = [
  {
    title: "Unite in Faith, Connect in Spirit",
    subtitle: "Join a global community of believers",
  },
  {
    title: "Jesus is Coming Soon",
    subtitle: "Prepare your heart for His return",
  },
  {
    title: "Walk by Faith, Not by Sight",
    subtitle: "Trust in the Lord with all your heart",
  },
  {
    title: "Love One Another",
    subtitle: "As I have loved you, so you must love one another",
  },
  {
    title: "Be Still and Know",
    subtitle: "That I am God - Psalm 46:10",
  },
];

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
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-gray-950">
      {/* Left Side - Branding & Images */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10"></div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-between p-4 w-full ">
          {/* Top Section - Logo & Branding */}
          <div className="space-y-4">
            <img
              src="/logo45.png"
              alt="OneChurch Logo"
              className="h-22 w-auto object-contain"
              onError={(e) => {
                e.target.src = "/logo1.png"; // Fallback
              }}
            />
            <p className="text-white/90 text-[12px] font-medium tracking-wide ">
              <span className="text-[9px]">by </span>
              Global Church Initiative
            </p>
          </div>

          {/* Middle Section - Rotating Taglines */}
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="relative border border-white/20 rounded-2xl px-8 py-10 backdrop-blur-sm bg-white/5 max-w-2xl">
              <div className="relative w-[360px] min-h-[200px] flex items-center justify-center">
                {taglines.map((tagline, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col items-center justify-center text-center ${
                      activeBg === index ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <h2 className="text-white text-2xl md:text-3xl font-bold mb-3 leading-tight px-4">
                      {tagline.title}
                    </h2>
                    <p className="text-white/90 text-sm md:text-base max-w-lg px-4">
                      {tagline.subtitle}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tagline Indicators */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                {taglines.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveBg(index)}
                    className={`h-2 rounded-full transition-all ${
                      activeBg === index
                        ? "w-8 bg-white"
                        : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to tagline ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-white/60 text-xs">
              © 2025 Global Church Initiative. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <img
              src="/logo45.png"
              alt="OneChurch Logo"
              className="h-16 w-auto object-contain mx-auto mb-2"
              onError={(e) => {
                e.target.src = "/logo1.png";
              }}
            />
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              by Global Church Initiative
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white dark:bg-gray-900 backdrop-blur-sm bg-white/5 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
            {auth.mode === "signup" ? (
              <CreateAccountUI auth={auth} />
            ) : (
              <LoginUI auth={auth} />
            )}
          </div>
        </div>
      </div>

      {/* Background Music */}
      <BackgroundAudio />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";

export default function BackgroundAudio() {
  const audioRef = useRef(null);
  const fadeRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // New: controls pop-up

  // Unlock audio on first click
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = 0;
    audio.loop = true;

    const unlock = () => {
      if (audioUnlocked) return;
      setAudioUnlocked(true);
      fadeIn();
      document.removeEventListener("click", unlock);
    };

    document.addEventListener("click", unlock);
    return () => document.removeEventListener("click", unlock);
  }, [audioUnlocked]);

  const fadeIn = () => {
    const audio = audioRef.current;

    audio.play().then(() => {
      setIsPlaying(true);
      clearInterval(fadeRef.current);

      fadeRef.current = setInterval(() => {
        audio.volume = Math.min(audio.volume + 0.02, volume);
        if (audio.volume >= volume) clearInterval(fadeRef.current);
      }, 100);
    });
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!isPlaying) {
      fadeIn();
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/bgmusic1.mp3" />

      {/* 🎵 Compact Audio Pop-up */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Expandable Controls */}
        <div
          className={`flex items-center gap-3 p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg
                      transition-all duration-300 ${
                        isOpen
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 translate-x-8 pointer-events-none"
                      }`}
        >
          {/* Volume Slider (left side) */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 accent-white cursor-pointer order-1"
          />

          {/* Volume Button */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-white/20 transition order-2"
            aria-label="Mute music"
          >
            {isMuted ? (
              <VolumeX size={18} className="text-white" />
            ) : (
              <Volume2 size={18} className="text-white" />
            )}
          </button>

          {/* Play / Pause Button */}
          <button
            onClick={togglePlay}
            className="p-2 rounded-full hover:bg-white/20 transition order-3"
            aria-label="Toggle music"
          >
            {isPlaying ? (
              <Pause size={18} className="text-white" />
            ) : (
              <Play size={18} className="text-white" />
            )}
          </button>
        </div>

        {/* Main Music Icon */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="p-4 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/20 transition"
          aria-label="Open music controls"
        >
          <Music size={20} className="text-white" />
        </button>
      </div>
    </>
  );
}

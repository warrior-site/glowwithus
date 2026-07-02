"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Banner({ banner }) {
  const router = useRouter();

  const [visible, setVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  const fullText = banner?.message || "";

  // 🧠 Typewriter effect
  useEffect(() => {
    let index = 0;
    setVisible(true);

    const interval = setInterval(() => {
      setDisplayedText(fullText.slice(0, index + 1));
      index++;

      if (index >= fullText.length) {
        clearInterval(interval);

        // ⏳ Auto hide after 2.5 sec
        setTimeout(() => {
          setVisible(false);
        }, 2500);
      }
    }, 20); // speed of typing

    return () => clearInterval(interval);
  }, [fullText]);

  // 🎬 Action handler
  const handleAction = () => {
    if (!banner) return;

    switch (banner.action_type) {
      case "navigate":
        router.push(banner?.action_payload?.route || "/");
        break;

      case "trigger_analysis":
        router.push("/analysis");
        break;

      case "start_routine":
        router.push("/routine");
        break;

      case "log_today":
        router.push("/logs");
        break;

      default:
        break;
    }

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={`
        fixed top-5 left-1/2 -translate-x-1/2 z-50
        max-w-md w-[90%]
        bg-white/90 backdrop-blur-lg
        shadow-xl rounded-xl
        border border-gray-200
        p-4
        transition-all duration-500 ease-out
        animate-slideDown
      `}
    >
      {/* ❌ Close Button */}
      <button
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-black"
      >
        ✕
      </button>

      {/* 🧠 Title */}
      <h3 className="text-lg font-semibold mb-1">
        {banner.title}
      </h3>

      {/* ✨ Animated Text */}
      <p className="text-sm text-gray-700 min-h-[40px]">
        {displayedText}
      </p>

      {/* 🚀 Action Button */}
      <button
        onClick={handleAction}
        className="mt-3 w-full bg-black text-white py-2 rounded-lg text-sm hover:opacity-90"
      >
        Continue
      </button>
    </div>
  );
}
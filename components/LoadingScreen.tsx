"use client";

import { useEffect, useState } from "react";

/**
 * شاشة تحميل بتصميم شمعة متحركة — بتظهر لحظة فتح الموقع
 * وبتختفي بسلاسة لما الصفحة تخلص تحميل (أو بعد حد أدنى بسيط
 * من الوقت عشان الأنيميشن يبان وميحصلش "وميض" مزعج).
 */
export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const MIN_VISIBLE_MS = 650;
    const start = Date.now();

    function finish() {
      const elapsed = Date.now() - start;
      const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);
      window.setTimeout(() => setHidden(true), remaining);
    }

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      // fallback في حالة "load" اتأخر لسبب ما
      const fallback = window.setTimeout(finish, 3000);
      return () => {
        window.removeEventListener("load", finish);
        window.clearTimeout(fallback);
      };
    }
  }, []);

  useEffect(() => {
    if (!hidden) return;
    const t = window.setTimeout(() => setRemoved(true), 550);
    return () => window.clearTimeout(t);
  }, [hidden]);

  if (removed) return null;

  return (
    <div className="candle-loader" data-hidden={hidden} role="status" aria-live="polite">
      <svg
        width="120"
        height="180"
        viewBox="0 0 120 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* glow */}
        <ellipse
          cx="60"
          cy="42"
          rx="34"
          ry="34"
          fill="#ffdff0"
          className="origin-center animate-glow"
        />
        {/* flame */}
        <g className="origin-bottom animate-flicker" style={{ transformBox: "fill-box" }}>
          <path
            d="M60 12C60 12 44 34 44 50C44 63 51 72 60 72C69 72 76 63 76 50C76 34 60 12 60 12Z"
            fill="url(#flameGradient)"
          />
          <path
            d="M60 34C60 34 53 46 53 55C53 62 56 66 60 66C64 66 67 62 67 55C67 46 60 34 60 34Z"
            fill="#fff7d6"
            opacity="0.9"
          />
        </g>
        {/* wick */}
        <rect x="58.5" y="66" width="3" height="10" rx="1.5" fill="#5a3b2e" />
        {/* candle body */}
        <rect x="38" y="76" width="44" height="88" rx="6" fill="url(#candleGradient)" />
        <ellipse cx="60" cy="76" rx="22" ry="6" fill="#ffe6f2" />
        {/* drip details */}
        <path d="M46 88c0 6-4 8-4 14s4 6 4 2" stroke="#f8b8d8" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M76 100c0 6 4 8 4 14s-4 6-4 2" stroke="#f8b8d8" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* base plate */}
        <ellipse cx="60" cy="168" rx="36" ry="7" fill="#f0428d" opacity="0.25" />

        <defs>
          <linearGradient id="flameGradient" x1="60" y1="12" x2="60" y2="72" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffd166" />
            <stop offset="0.5" stopColor="#f0428d" />
            <stop offset="1" stopColor="#d92a72" />
          </linearGradient>
          <linearGradient id="candleGradient" x1="38" y1="76" x2="82" y2="164" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#ffe1ee" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-2xl text-brand-700">YAQEEN</span>
        <span className="text-xs font-bold tracking-[3px] text-brand-500">جارٍ التحميل...</span>
      </div>
    </div>
  );
}

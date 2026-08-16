export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-black">
      <svg
        width="120"
        height="160"
        viewBox="0 0 120 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* توهج الشمعة */}
        <ellipse className="candle-glow" cx="60" cy="45" rx="26" ry="26" fill="#FFD9A0" opacity="0.6" />

        {/* اللهب */}
        <g className="candle-flame">
          <path
            d="M60 20C60 20 70 33 70 43C70 49.6274 65.5228 55 60 55C54.4772 55 50 49.6274 50 43C50 33 60 20 60 20Z"
            fill="url(#flameGradient)"
          />
        </g>

        {/* الفتيل */}
        <rect x="58.5" y="52" width="3" height="9" rx="1.5" fill="#5A4632" />

        {/* جسم الشمعة */}
        <rect x="38" y="60" width="44" height="80" rx="6" fill="#FFC1D9" />
        <rect x="38" y="60" width="44" height="14" rx="6" fill="#FF8FB3" />

        {/* قطرات الشمع */}
        <path d="M46 74C46 74 43 84 46 90C48 94 52 92 51 87C50 82 46 74 46 74Z" fill="#FFE4EC" />
        <path d="M76 74C76 74 80 86 77 93C75 97 70 95 71 89C72 83 76 74 76 74Z" fill="#FFE4EC" />

        <defs>
          <linearGradient id="flameGradient" x1="60" y1="20" x2="60" y2="55" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF3B0" />
            <stop offset="0.5" stopColor="#FF8FB3" />
            <stop offset="1" stopColor="#E8558A" />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-xl text-black">YAQEEN</span>
        <span className="candle-loading-dots flex gap-1 text-2xl leading-none text-[#E8558A]">
          <span>•</span>
          <span>•</span>
          <span>•</span>
        </span>
      </div>
    </div>
  );
}

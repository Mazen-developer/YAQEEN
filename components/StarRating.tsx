"use client";

import { useState } from "react";

export function StarRatingDisplay({ rating, size = "text-base" }: { rating: number; size?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${size}`} aria-label={`${rating} من 5 نجوم`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(rating) ? "text-[#e8558a]" : "text-black/15"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1 text-3xl">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} نجوم`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className={`transition ${
            n <= (hover || value) ? "text-[#e8558a]" : "text-black/15"
          } hover:scale-110`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

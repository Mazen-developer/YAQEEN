"use client";

import { useEffect, useState } from "react";

export default function ProductImageSlider({
  images,
  alt,
  className = "",
  imgClassName = "",
  showDots = false,
  intervalMs = 2000,
}: {
  images: string[];
  alt: string;
  className?: string;
  imgClassName?: string;
  showDots?: boolean;
  intervalMs?: number;
}) {
  const list = images.filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [list.length, list[0]]);

  useEffect(() => {
    if (list.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [list.length, intervalMs]);

  if (list.length === 0) return null;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {list.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      ))}

      {showDots && list.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1.5">
          {list.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition ${
                i === index ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

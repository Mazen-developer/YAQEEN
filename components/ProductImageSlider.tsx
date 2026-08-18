"use client";

import { useEffect, useState } from "react";

export default function ProductImageSlider({
  images,
  alt,
  className = "",
  imgClassName = "",
  showDots = false,
  intervalMs = 2000,
  enableZoom = false,
}: {
  images: string[];
  alt: string;
  className?: string;
  imgClassName?: string;
  showDots?: boolean;
  intervalMs?: number;
  enableZoom?: boolean;
}) {
  const list = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

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

  useEffect(() => {
    if (!zoomOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [zoomOpen]);

  if (list.length === 0) return null;

  return (
    <>
      <div
        className={`relative overflow-hidden ${className} ${
          enableZoom ? "cursor-zoom-in" : ""
        }`}
        onClick={() => enableZoom && setZoomOpen(true)}
      >
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

      {enableZoom && zoomOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="absolute left-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-white/20"
            aria-label="إغلاق"
          >
            ✕
          </button>

          {list.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i - 1 + list.length) % list.length);
                }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-lg font-bold text-white transition hover:bg-white/20"
                aria-label="السابق"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i + 1) % list.length);
                }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-lg font-bold text-white transition hover:bg-white/20"
                aria-label="التالي"
              >
                ›
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={list[index]}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full cursor-zoom-out rounded-lg object-contain"
          />
        </div>
      )}
    </>
  );
}

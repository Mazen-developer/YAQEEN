"use client";

import { useEffect, useRef, useState } from "react";

const TESTIMONIALS: string[] = [
  "توحفه\nتسلم ايديك",
  "هو مشاء الله تحفه تسلم ايدك وربنا يوسع رزقك يارب واتفاجات بيها والله تحفه اوي والريحه تحفه وثابته مشاء الله يحبيبي🤍🤍🤍🤍",
  "حبيبي الفواحه وصلت امبارح ريحتها جميله مشاءالله ربنا يحسن مابين ايدك🤍🤍",
  "يخ رابييي ع التحفهههه 🥺🥺🥺🥺🥺🥺🥺\nشكلها جميل خالص\nتسلم ايدك متخيلتش انها هتبقي حلوه اوي كده\nعجبتني اوي اوي 💋",
  "تحفه تحفه تحفه الهوايات خطيرة بجد يارونا والبوكس جميل اوي ❤️❤️❤️❤️❤️❤️",
  "اقسم بالله تحفه تسلم ايدك ياروان انا مستنيه تيجي من العمره واقولك احلي ريفيوو في الدنيا وبصراحه انتي ذوق جدا ومعاملتك قمر اول مره اتعامل معاكي ومش اخر مره ان شاءالله",
];

const AUTOPLAY_MS = 4500;

export default function TestimonialsSwiper() {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, []);

  function go(next: number) {
    setIndex(((next % TESTIMONIALS.length) + TESTIMONIALS.length) % TESTIMONIALS.length);
  }

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    startX.current = e.clientX;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    setDragX(e.clientX - startX.current);
  }

  function endDrag() {
    if (!dragging.current) return;
    dragging.current = false;
    // dir=rtl: swipe right (positive) means "next" in reading order feel;
    // we treat a clear horizontal drag as a slide change either direction.
    if (dragX > 60) go(index - 1);
    else if (dragX < -60) go(index + 1);
    setDragX(0);
  }

  return (
    <section className="mt-16">
      <div className="mb-6 text-center">
        <h2 className="font-display text-3xl text-black">آراء عملائنا</h2>
        <div className="mx-auto mt-2 h-[3px] w-14 rounded bg-brand-500" />
      </div>

      <div
        className="relative mx-auto max-w-2xl touch-pan-y select-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(${index * 100}% - ${dragX}px))`,
          }}
        >
          {TESTIMONIALS.map((text, i) => (
            <div key={i} className="w-full shrink-0 px-2">
              <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-white p-6 text-center shadow-sm sm:p-8">
                <span className="font-display text-4xl leading-none text-brand-300">”</span>
                <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700 sm:text-base">
                  {text}
                </p>
                <div className="mt-1 flex gap-0.5 text-brand-500">
                  {"★★★★★".split("").map((s, si) => (
                    <span key={si}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="السابق"
          className="absolute right-1 top-1/2 hidden -translate-y-1/2 rounded-full border border-line bg-white/90 p-2 text-brand-700 shadow-sm transition hover:bg-brand-50 sm:block"
        >
          ›
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="التالي"
          className="absolute left-1 top-1/2 hidden -translate-y-1/2 rounded-full border border-line bg-white/90 p-2 text-brand-700 shadow-sm transition hover:bg-brand-50 sm:block"
        >
          ‹
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-1.5">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`عرض رأي رقم ${i + 1}`}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-5 bg-brand-500" : "w-2 bg-brand-200"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

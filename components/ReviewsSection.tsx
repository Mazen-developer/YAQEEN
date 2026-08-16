"use client";

import { useEffect, useState } from "react";
import type { Review } from "@/lib/types";
import { StarRatingDisplay, StarRatingInput } from "./StarRating";
import { useToast } from "./ToastProvider";

export default function ReviewsSection({ productId }: { productId: string }) {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [average, setAverage] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const res = await fetch(`/api/products/${productId}/reviews`);
    const data = await res.json();
    setReviews(data.reviews ?? []);
    setAverage(data.average ?? 0);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (rating < 1) {
      setError("من فضلك اختر تقييمًا بالنجوم");
      return;
    }
    if (!comment.trim()) {
      setError("من فضلك اكتب تعليقك");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ، حاول مرة أخرى");
        setSubmitting(false);
        return;
      }
      setRating(0);
      setComment("");
      setName("");
      showToast("شكرًا لتقييمك! 🌸");
      await load();
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-12 border-t border-line pt-8">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="font-display text-2xl text-black">التقييمات</h2>
        {reviews && reviews.length > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-600">
            <StarRatingDisplay rating={average} />
            <span className="font-bold text-black">{average.toFixed(1)}</span>
            <span>({reviews.length} تقييم)</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm"
        >
          <h3 className="mb-3 text-sm font-black">شاركنا رأيك</h3>
          <StarRatingInput value={rating} onChange={setRating} />

          <label className="mb-1.5 mt-4 text-sm font-bold">اسمك (اختياري)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="اكتب اسمك"
            className="rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-black focus:outline-none"
          />

          <label className="mb-1.5 mt-4 text-sm font-bold">تعليقك</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="إيه رأيك في المنتج؟"
            className="min-h-[90px] resize-y rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-black focus:outline-none"
          />

          {error && <div className="mt-3 text-sm font-bold text-black">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-lg bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitting ? "جارٍ الإرسال..." : "إرسال التقييم"}
          </button>
        </form>

        <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
          {reviews === null ? (
            <div className="py-8 text-center text-sm text-neutral-500">جارٍ التحميل...</div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-line bg-white/60 py-8 text-center text-sm text-neutral-600">
              لا يوجد تقييمات حتى الآن، كن أول من يقيّم!
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-line bg-white p-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-bold">{r.name || "زائر"}</span>
                  <StarRatingDisplay rating={r.rating} size="text-sm" />
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                  {r.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

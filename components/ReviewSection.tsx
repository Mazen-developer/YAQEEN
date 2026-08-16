"use client";

import { useState } from "react";
import type { Review } from "@/lib/types";
import { useReviewer } from "@/lib/useReviewer";
import { useToast } from "./ToastProvider";
import StarRating from "./StarRating";
import RatingSummary from "./RatingSummary";

export default function ReviewSection({
  productId,
  initialReviews,
}: {
  productId: string;
  initialReviews: Review[];
}) {
  const { userId, userName, setUserName, hydrated } = useReviewer();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState(userName);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError("");

    if (rating < 1) {
      setError("من فضلك اختر تقييمًا بالنجوم قبل الإرسال");
      return;
    }
    if (!comment.trim()) {
      setError("من فضلك اكتب تعليقًا قبل الإرسال");
      return;
    }
    if (!userId) {
      setError("تعذر التعرف على المستخدم، حاول تحديث الصفحة");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userName: name, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ، حاول مرة أخرى");
        setSubmitting(false);
        return;
      }
      setUserName(name);
      setReviews((prev) => [data.review, ...prev]);
      setRating(0);
      setComment("");
      showToast("تم إرسال تقييمك، شكرًا لك!");
    } catch {
      setError("تعذر الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl text-black">التقييمات والآراء</h2>
        <RatingSummary reviews={reviews} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-2xl border border-brand-200 bg-brand-50/50 p-5"
      >
        <div className="mb-3">
          <div className="mb-1.5 text-sm font-bold">تقييمك</div>
          <StarRating value={rating} onChange={setRating} size={26} />
        </div>

        <label className="mb-1.5 mt-2 block text-sm font-bold">اسمك (اختياري)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسمك اللي هيظهر مع التقييم"
          className="w-full rounded-lg border-[1.5px] border-line bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />

        <label className="mb-1.5 mt-3 block text-sm font-bold">تعليقك</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="شاركنا رأيك في المنتج..."
          className="min-h-[90px] w-full resize-y rounded-lg border-[1.5px] border-line bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />

        {error && (
          <div className="mt-2 text-sm font-bold text-brand-700" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !hydrated}
          className="mt-4 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? "جارٍ الإرسال..." : "إرسال التقييم"}
        </button>
      </form>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line bg-white/60 py-10 text-center text-neutral-600">
          لا يوجد تقييمات بعد
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="animate-fade-in rounded-xl border border-line bg-white p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-bold text-black">{r.userName}</span>
                <StarRating value={r.rating} readOnly size={16} />
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">{r.comment}</p>
              <div className="mt-1.5 text-xs text-neutral-400">
                {new Date(r.createdAt).toLocaleDateString("ar-EG", { dateStyle: "medium" })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

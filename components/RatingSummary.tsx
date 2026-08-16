import type { Review } from "@/lib/types";
import StarRating from "./StarRating";

export default function RatingSummary({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <div className="text-sm text-neutral-500">لا يوجد تقييمات بعد — كن أول من يقيّم هذا المنتج</div>;
  }

  const average = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="flex items-center gap-2">
      <StarRating value={Math.round(average)} readOnly size={18} />
      <span className="text-sm font-bold text-black">{average.toFixed(1)}</span>
      <span className="text-sm text-neutral-500">({reviews.length} تقييم)</span>
    </div>
  );
}

"use client";

export default function StarRating({
  value,
  onChange,
  size = 20,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`flex items-center gap-0.5 ${readOnly ? "" : "cursor-pointer"}`} role={readOnly ? undefined : "radiogroup"} aria-label="التقييم بالنجوم">
      {stars.map((s) => {
        const filled = s <= value;
        if (readOnly) {
          return (
            <span
              key={s}
              aria-hidden="true"
              style={{ fontSize: size, color: filled ? "#f0428d" : "#e5c9d6", lineHeight: 1 }}
            >
              ★
            </span>
          );
        }
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={value === s}
            aria-label={`${s} من 5 نجوم`}
            onClick={() => onChange?.(s)}
            className="transition hover:scale-110"
            style={{ fontSize: size, color: filled ? "#f0428d" : "#e5c9d6", lineHeight: 1 }}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

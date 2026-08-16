"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, SelectedVariant } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useToast } from "./ToastProvider";

export default function ProductActions({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const options = product.options;
  const hasColors = !!options?.colors?.length;
  const hasSizes = !!options?.sizes?.length;
  const hasTypes = !!options?.types?.length;
  const minQuantity = Math.max(1, options?.minQuantity ?? 1);

  const [color, setColor] = useState<string | undefined>(hasColors ? options!.colors[0].name : undefined);
  const [size, setSize] = useState<string | undefined>(hasSizes ? options!.sizes[0] : undefined);
  const [type, setType] = useState<string | undefined>(hasTypes ? options!.types[0] : undefined);
  const [qty, setQty] = useState(minQuantity);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const variant: SelectedVariant | undefined = useMemo(() => {
    if (!hasColors && !hasSizes && !hasTypes) return undefined;
    return { color, size, type };
  }, [color, size, type, hasColors, hasSizes, hasTypes]);

  function validate(): boolean {
    if (hasColors && !color) {
      setError("من فضلك اختر اللون");
      return false;
    }
    if (hasSizes && !size) {
      setError("من فضلك اختر المقاس");
      return false;
    }
    if (hasTypes && !type) {
      setError("من فضلك اختر النوع");
      return false;
    }
    if (!Number.isFinite(qty) || qty < minQuantity) {
      setError(`أقل كمية للطلب هي ${minQuantity}`);
      return false;
    }
    setError("");
    return true;
  }

  function runGuarded(after: () => void) {
    if (busy) return;
    if (!validate()) return;
    setBusy(true);
    addToCart(product.id, qty, variant);
    after();
    window.setTimeout(() => setBusy(false), 500);
  }

  return (
    <div className="mt-2 flex flex-col gap-4">
      {hasColors && (
        <div>
          <div className="mb-1.5 text-sm font-bold">اللون</div>
          <div className="flex flex-wrap gap-2">
            {options!.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                aria-pressed={color === c.name}
                title={c.name}
                className={`flex h-9 items-center gap-2 rounded-full border-2 px-3 text-xs font-bold transition ${
                  color === c.name
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-line text-neutral-600 hover:border-brand-400"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-black/15"
                  style={{ backgroundColor: c.hex || "#f0428d" }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasSizes && (
        <div>
          <div className="mb-1.5 text-sm font-bold">المقاس</div>
          <div className="flex flex-wrap gap-2">
            {options!.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={`rounded-lg border-2 px-3.5 py-1.5 text-sm font-bold transition ${
                  size === s
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line text-neutral-700 hover:border-brand-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasTypes && (
        <div>
          <div className="mb-1.5 text-sm font-bold">النوع</div>
          <div className="flex flex-wrap gap-2">
            {options!.types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={`rounded-lg border-2 px-3.5 py-1.5 text-sm font-bold transition ${
                  type === t
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-line text-neutral-700 hover:border-brand-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-1.5 text-sm font-bold">
          الكمية {minQuantity > 1 && <span className="text-xs font-normal text-neutral-500">(أقل كمية {minQuantity})</span>}
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(minQuantity, q - 1))}
            className="h-9 w-9 rounded-full border border-line bg-white font-black transition hover:border-brand-500"
            aria-label="تقليل الكمية"
          >
            −
          </button>
          <span className="w-8 text-center font-bold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="h-9 w-9 rounded-full border border-line bg-white font-black transition hover:border-brand-500"
            aria-label="زيادة الكمية"
          >
            +
          </button>
        </div>
      </div>

      {error && <div className="text-sm font-bold text-brand-700" role="alert">{error}</div>}

      <div className="flex gap-2.5">
        <button
          disabled={busy}
          onClick={() =>
            runGuarded(() => showToast("تمت الإضافة إلى السلة"))
          }
          className="flex-1 rounded-lg border-[1.5px] border-line px-4 py-3 text-sm font-bold transition hover:border-brand-500 disabled:opacity-50"
        >
          أضف للسلة
        </button>
        <button
          disabled={busy}
          onClick={() => runGuarded(() => router.push("/checkout"))}
          className="flex-1 rounded-lg border-[1.5px] border-brand-600 bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          اشترِ الآن
        </button>
      </div>
    </div>
  );
}

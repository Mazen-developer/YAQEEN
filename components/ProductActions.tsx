"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, SelectedVariant } from "@/lib/types";
import { getVariantPrice } from "@/lib/productOptions";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";
import { useToast } from "./ToastProvider";

export default function ProductActions({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const optionList = product.options?.list ?? [];
  const hasOptions = optionList.length > 0;
  const minQuantity = Math.max(1, product.options?.minQuantity ?? 1);

  const [selection, setSelection] = useState<SelectedVariant>(() => {
    const initial: SelectedVariant = {};
    for (const option of optionList) {
      if (option.values.length) initial[option.name] = option.values[0].value;
    }
    return initial;
  });
  const [qty, setQty] = useState(minQuantity);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const variant: SelectedVariant | undefined = hasOptions ? selection : undefined;

  const currentPrice = useMemo(
    () => getVariantPrice(product, variant),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product, JSON.stringify(variant)]
  );

  function selectValue(optionName: string, value: string) {
    setSelection((prev) => ({ ...prev, [optionName]: value }));
  }

  function validate(): boolean {
    for (const option of optionList) {
      if (!selection[option.name]) {
        setError(`من فضلك اختر ${option.name}`);
        return false;
      }
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
      <span className="relative -rotate-2 self-start rounded-l-sm rounded-r-lg border-[1.5px] border-dashed border-brand-600/60 bg-white px-4 py-2 text-lg font-black text-brand-700">
        {formatPrice(currentPrice)}
      </span>

      {product.description ? (
        <div className="border-t border-line pt-4">
          <h2 className="mb-2 text-sm font-bold text-black">الوصف</h2>
          <p className="whitespace-pre-line leading-relaxed text-neutral-700">
            {product.description}
          </p>
        </div>
      ) : (
        <div className="border-t border-line pt-4">
          <h2 className="mb-2 text-sm font-bold text-black">الوصف</h2>
          <p className="text-sm text-neutral-500">لا يوجد وصف لهذا المنتج حاليًا.</p>
        </div>
      )}

      {optionList.map((option) => (
        <div key={option.name}>
          <div className="mb-1.5 text-sm font-bold">{option.name}</div>
          <div className="flex flex-wrap gap-2">
            {option.values.map((v) => {
              const active = selection[option.name] === v.value;
              return (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => selectValue(option.name, v.value)}
                  aria-pressed={active}
                  title={v.value}
                  className={`flex h-9 items-center gap-2 rounded-full border-2 px-3.5 text-xs font-bold transition ${
                    active
                      ? "border-brand-600 bg-brand-50 text-brand-700"
                      : "border-line text-neutral-600 hover:border-brand-400"
                  }`}
                >
                  {v.hex && (
                    <span
                      className="h-4 w-4 rounded-full border border-black/15"
                      style={{ backgroundColor: v.hex }}
                    />
                  )}
                  {v.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

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

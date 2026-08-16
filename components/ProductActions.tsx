"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useToast } from "./ToastProvider";

export default function ProductActions({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const minQty = product.minOrderQty && product.minOrderQty > 0 ? product.minOrderQty : 1;
  const hasStock = typeof product.stock === "number";
  const outOfStock = hasStock && (product.stock as number) <= 0;

  const [color, setColor] = useState(product.colors?.[0] ?? "");
  const [size, setSize] = useState(product.sizes?.[0] ?? "");
  const [type, setType] = useState(product.types?.[0] ?? "");
  const [qty, setQty] = useState(minQty);

  const maxQty = hasStock ? Math.max(product.stock as number, minQty) : undefined;

  const options = useMemo(
    () => ({
      color: product.colors?.length ? color : undefined,
      size: product.sizes?.length ? size : undefined,
      type: product.types?.length ? type : undefined,
    }),
    [product.colors, product.sizes, product.types, color, size, type]
  );

  function clampQty(n: number) {
    let v = Math.max(minQty, n);
    if (maxQty) v = Math.min(maxQty, v);
    setQty(v);
  }

  return (
    <div className="mt-2 flex flex-col gap-3.5">
      {!!product.colors?.length && (
        <div>
          <label className="mb-1.5 block text-sm font-bold">اللون</label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-bold transition ${
                  color === c ? "border-black bg-black text-white" : "border-line hover:border-black"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {!!product.sizes?.length && (
        <div>
          <label className="mb-1.5 block text-sm font-bold">الحجم</label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-bold transition ${
                  size === s ? "border-black bg-black text-white" : "border-line hover:border-black"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {!!product.types?.length && (
        <div>
          <label className="mb-1.5 block text-sm font-bold">النوع</label>
          <div className="flex flex-wrap gap-2">
            {product.types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-bold transition ${
                  type === t ? "border-black bg-black text-white" : "border-line hover:border-black"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-bold">
          الكمية {minQty > 1 && <span className="font-normal text-neutral-500">(أقل عدد للطلب: {minQty})</span>}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => clampQty(qty - 1)}
            className="h-8 w-8 rounded-full border border-line bg-white font-black"
          >
            −
          </button>
          <span className="w-8 text-center font-bold">{qty}</span>
          <button
            type="button"
            onClick={() => clampQty(qty + 1)}
            className="h-8 w-8 rounded-full border border-line bg-white font-black"
          >
            +
          </button>
          {hasStock && (
            <span className="text-xs text-neutral-500">
              {outOfStock ? "نفدت الكمية" : `المتاح: ${product.stock}`}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2.5">
        <button
          disabled={outOfStock}
          onClick={() => {
            addToCart(product.id, qty, options);
            showToast("تمت الإضافة إلى السلة");
          }}
          className="flex-1 rounded-lg border-[1.5px] border-line px-4 py-3 text-sm font-bold transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          أضف للسلة
        </button>
        <button
          disabled={outOfStock}
          onClick={() => {
            addToCart(product.id, qty, options);
            router.push("/checkout");
          }}
          className="flex-1 rounded-lg border-[1.5px] border-black bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          اشترِ الآن
        </button>
      </div>
    </div>
  );
}

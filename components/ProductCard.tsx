"use client";

import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useToast } from "./ToastProvider";
import { formatPrice } from "@/lib/format";
import { categoryOf } from "@/lib/categories";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-1">
      <div className="aspect-square overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="text-lg font-bold leading-snug">{product.name}</h3>

        <span className="self-start rounded-full bg-black/[0.06] px-2.5 py-0.5 text-xs font-bold text-neutral-600">
          {categoryOf(product.category)}
        </span>

        <span className="relative -rotate-2 self-start rounded-l-sm rounded-r-lg border-[1.5px] border-dashed border-black/55 bg-white px-3.5 py-1.5 pl-2.5 text-sm font-black">
          {formatPrice(product.price)}
        </span>

        <div className="mt-auto flex gap-2">
          <button
            onClick={() => {
              addToCart(product.id);
              showToast("تمت الإضافة إلى السلة");
            }}
            className="flex-1 rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm font-bold transition hover:border-black"
          >
            أضف للسلة
          </button>
          <button
            onClick={() => {
              addToCart(product.id);
              router.push("/checkout");
            }}
            className="flex-1 rounded-lg border-[1.5px] border-black bg-black px-3 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            اشترِ الآن
          </button>
        </div>
      </div>
    </div>
  );
}

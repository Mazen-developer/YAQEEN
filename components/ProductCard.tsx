"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useToast } from "./ToastProvider";
import { formatPrice } from "@/lib/format";
import { categoryOf } from "@/lib/categories";
import { getPriceRange } from "@/lib/productOptions";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const hasOptions = !!product.options?.list?.length;
  const minQuantity = Math.max(1, product.options?.minQuantity ?? 1);
  const { min, hasRange } = getPriceRange(product);

  function quickAdd(goToCheckout: boolean) {
    if (hasOptions) {
      // فيه خيارات لازم تتحدد الأول (لون/مقاس/نوع) — نروح لصفحة المنتج
      router.push(`/product/${product.id}`);
      return;
    }
    addToCart(product.id, minQuantity);
    if (goToCheckout) {
      router.push("/checkout");
    } else {
      showToast("تمت الإضافة إلى السلة");
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-200/50 animate-pop-in">
      <Link href={`/product/${product.id}`} className="block aspect-square overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-lg font-bold leading-snug transition hover:underline">{product.name}</h3>
        </Link>

        <span className="self-start rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
          {categoryOf(product.category)}
        </span>

        <span className="relative -rotate-2 self-start rounded-l-sm rounded-r-lg border-[1.5px] border-dashed border-brand-600/60 bg-white px-3.5 py-1.5 pl-2.5 text-sm font-black text-brand-700">
          {hasRange ? `يبدأ من ${formatPrice(min)}` : formatPrice(min)}
        </span>

        <div className="mt-auto flex gap-2">
          <button
            onClick={() => quickAdd(false)}
            className="flex-1 rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm font-bold transition hover:border-brand-500 hover:text-brand-700"
          >
            {hasOptions ? "اختر الخيارات" : "أضف للسلة"}
          </button>
          <button
            onClick={() => quickAdd(true)}
            className="flex-1 rounded-lg border-[1.5px] border-brand-600 bg-brand-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            اشترِ الآن
          </button>
        </div>
      </div>
    </div>
  );
}

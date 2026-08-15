"use client";

import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { useToast } from "./ToastProvider";

export default function ProductActions({ productId }: { productId: string }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  return (
    <div className="mt-2 flex gap-2.5">
      <button
        onClick={() => {
          addToCart(productId);
          showToast("تمت الإضافة إلى السلة");
        }}
        className="flex-1 rounded-lg border-[1.5px] border-line px-4 py-3 text-sm font-bold transition hover:border-black"
      >
        أضف للسلة
      </button>
      <button
        onClick={() => {
          addToCart(productId);
          router.push("/checkout");
        }}
        className="flex-1 rounded-lg border-[1.5px] border-black bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
      >
        اشترِ الآن
      </button>
    </div>
  );
}

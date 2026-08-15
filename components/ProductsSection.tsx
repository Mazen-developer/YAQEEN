"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { categoryOf } from "@/lib/categories";
import ProductCard from "./ProductCard";

const ALL = "الكل";

export default function ProductsSection({ products }: { products: Product[] }) {
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => categoryOf(p.category)));
    return [ALL, ...Array.from(set)];
  }, [products]);

  const [active, setActive] = useState(ALL);

  const filtered = useMemo(
    () =>
      active === ALL
        ? products
        : products.filter((p) => categoryOf(p.category) === active),
    [products, active]
  );

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-line bg-white/60 py-16 text-center text-neutral-600">
        <div className="mb-1 font-display text-2xl text-black">الرفوف لسه فاضية</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full border-[1.5px] px-4 py-1.5 text-sm font-bold transition ${
              active === cat
                ? "border-black bg-black text-white"
                : "border-line text-black hover:border-black"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line bg-white/60 py-16 text-center text-neutral-600">
          <div className="mb-1 font-display text-2xl text-black">لا يوجد منتجات في هذا التصنيف</div>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

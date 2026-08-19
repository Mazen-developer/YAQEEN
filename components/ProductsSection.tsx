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
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const byCategory =
      active === ALL ? products : products.filter((p) => categoryOf(p.category) === active);

    const q = query.trim().toLowerCase();
    if (!q) return byCategory;

    return byCategory.filter((p) =>
      [p.name, p.description, p.category].some((field) => field?.toLowerCase().includes(q))
    );
  }, [products, active, query]);

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-line bg-white/60 py-16 text-center text-neutral-600">
        <div className="mb-1 font-display text-2xl text-black">الرفوف لسه فاضية</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto mb-6 max-w-md">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="w-full rounded-full border-[1.5px] border-line bg-white px-5 py-2.5 pr-11 text-sm text-black placeholder:text-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-brand-500"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="مسح البحث"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-brand-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full border-[1.5px] px-4 py-1.5 text-sm font-bold transition ${
              active === cat
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-line text-black hover:border-brand-500 hover:text-brand-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line bg-white/60 py-16 text-center text-neutral-600">
          <div className="mb-1 font-display text-2xl text-black">
            {query.trim() ? "مفيش منتجات مطابقة للبحث" : "لا يوجد منتجات في هذا التصنيف"}
          </div>
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

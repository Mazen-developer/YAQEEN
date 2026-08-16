"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-l from-brand-600 via-brand-500 to-brand-400 px-6 py-4 text-white shadow-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-white/50 bg-white font-display text-xl font-bold text-black">
            <img className="rounded-full" src="logo.jpg" alt="logo" />
          </div>
          <div>
            <h1 className="font-display text-2xl leading-tight">YAQEEN</h1>
            <span className="block text-[11px] tracking-[2px] opacity-80">For Your Peace of Mind </span>
          </div>
        </Link>

        <Link
          href="/checkout"
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-brand-700 transition hover:bg-brand-50"
        >
          🛍️ السلة
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs text-white">
            {count}
          </span>
        </Link>
      </div>
    </header>
  );
}

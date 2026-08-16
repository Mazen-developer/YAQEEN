"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-[#C8A96B]/95 pb-3 pt-2 text-white shadow-md backdrop-blur">
      {/* السلة في الزاوية */}
      <div className="mx-auto flex max-w-5xl justify-end px-6">
        <Link
          href="/checkout"
          className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-black text-black transition hover:bg-neutral-200"
        >
          🛍️ السلة
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
            {count}
          </span>
        </Link>
      </div>

      {/* اللوجو في مكان بارز ومتوسط */}
      <Link href="/" className="mx-auto -mt-1 flex w-fit flex-col items-center gap-1.5 px-6">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-white shadow-lg ring-2 ring-white/40">
          <img className="h-full w-full object-cover" src="logo.jpg" alt="logo" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl leading-tight">YAQEEN</h1>
          <span className="block text-[11px] tracking-[2px] opacity-80">For Your Peace of Mind</span>
        </div>
      </Link>
    </header>
  );
}

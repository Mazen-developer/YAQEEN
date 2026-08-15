"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import { GOVERNORATES } from "@/lib/governorates";
import type { Product } from "@/lib/types";

export default function CheckoutPage() {
  const { cart, changeQty, removeFromCart, clearCart } = useCart();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmedPhone, setConfirmedPhone] = useState<string | null>(null);
  const [confirmedGov, setConfirmedGov] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []));
  }, []);

  const rows = useMemo(() => {
    if (!products) return [];
    return cart
      .map((line) => ({ ...line, product: products.find((p) => p.id === line.id) }))
      .filter((r): r is typeof r & { product: Product } => Boolean(r.product));
  }, [cart, products]);

  const total = rows.reduce((s, r) => s + r.product.price * r.qty, 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          governorate: form.get("governorate"),
          address: form.get("address"),
          cart,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ، حاول مرة أخرى");
        setSubmitting(false);
        return;
      }

      const customerName = String(form.get("name"));
      const governorate = String(form.get("governorate"));
      const address = String(form.get("address"));
      const productLines = rows.map((r) => `- ${r.product.name} × ${r.qty}`).join("\n");
      const message =
        `مرحبًا، أنا ${customerName} 👋\n` +
        `عايز أأكد طلبي من YAQEEN:\n\n` +
        `${productLines}\n\n` +
        `الإجمالي: ${formatPrice(total)}\n` +
        `المحافظة: ${governorate}\n` +
        `العنوان: ${address}`;
      const whatsappUrlValue = `https://wa.me/201272637415?text=${encodeURIComponent(message)}`;
      setWhatsappUrl(whatsappUrlValue);
      window.open(whatsappUrlValue, "_blank");

      setConfirmedPhone(String(form.get("phone")));
      setConfirmedGov(governorate);
      clearCart();
    } catch {
      setError("تعذر الاتصال بالخادم، حاول مرة أخرى");
      setSubmitting(false);
    }
  }

  if (confirmedPhone) {
    return (
      <div className="py-16 text-center">
        <div className="font-display text-3xl text-black">تم استلام طلبك! 🎉</div>
        <p className="mt-2 text-neutral-600">
          هنتواصل معاك على <strong>{confirmedPhone}</strong> قريبًا لتأكيد التوصيل لـ {confirmedGov}.
        </p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-lg bg-black px-6 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            فتح واتساب لتأكيد الطلب
          </a>
        )}
        <div>
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-bold text-neutral-600 underline underline-offset-2 hover:text-black"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  if (products === null) {
    return <div className="py-16 text-center text-neutral-500">جارٍ التحميل...</div>;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-line bg-white/60 py-16 text-center text-neutral-600">
        <div className="mb-1 font-display text-2xl text-black">السلة فاضية</div>
        <p>ارجع للرئيسية وضيف منتجات الأول</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-black px-6 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800"
        >
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="font-display text-4xl text-black">إتمام الشراء</h2>
        <div className="mx-auto my-3.5 h-[3px] w-16 rounded bg-black" />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex flex-col gap-2.5">
            {rows.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-white p-2.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.product.image}
                  alt=""
                  className="h-[52px] w-[52px] rounded-lg object-cover"
                />
                <div className="flex-1 font-bold">{r.product.name}</div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => changeQty(r.id, -1)}
                    className="h-6.5 w-6.5 rounded-full border border-line bg-white font-black"
                  >
                    −
                  </button>
                  <span className="w-5 text-center">{r.qty}</span>
                  <button
                    onClick={() => changeQty(r.id, 1)}
                    className="h-6.5 w-6.5 rounded-full border border-line bg-white font-black"
                  >
                    +
                  </button>
                </div>
                <div className="min-w-[80px] text-left font-black">
                  {formatPrice(r.product.price * r.qty)}
                </div>
                <button
                  onClick={() => removeFromCart(r.id)}
                  className="px-1.5 font-black text-black/70 hover:text-black"
                  aria-label="إزالة"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3.5 flex items-center justify-between border-t-2 border-dashed border-line pt-3.5 text-lg font-black">
            <span>الإجمالي</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-display text-2xl text-black">بيانات التوصيل</h2>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <label className="mb-1.5 mt-4 text-sm font-bold">الاسم</label>
            <input
              name="name"
              type="text"
              required
              placeholder="اكتب اسمك بالكامل"
              className="rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-black focus:outline-none"
            />

            <label className="mb-1.5 mt-4 text-sm font-bold">رقم الهاتف</label>
            <input
              name="phone"
              type="tel"
              required
              placeholder="01xxxxxxxxx"
              pattern="^01[0125][0-9]{8}$"
              className="rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-black focus:outline-none"
            />
            <div className="mt-1 text-xs text-neutral-500">مثال: 01012345678</div>

            <label className="mb-1.5 mt-4 text-sm font-bold">المحافظة</label>
            <select
              name="governorate"
              required
              defaultValue=""
              className="rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-black focus:outline-none"
            >
              <option value="" disabled>
                اختر المحافظة
              </option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <label className="mb-1.5 mt-4 text-sm font-bold">العنوان بالتفصيل</label>
            <textarea
              name="address"
              required
              placeholder="الشارع، رقم المبنى، علامة مميزة..."
              className="min-h-[80px] resize-y rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-black focus:outline-none"
            />

            {error && <div className="mt-3 text-sm font-bold text-black">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 rounded-lg bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {submitting ? "جارٍ الحفظ..." : `تأكيد الطلب — ${formatPrice(total)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

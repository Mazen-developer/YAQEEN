"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { SUGGESTED_CATEGORIES } from "@/lib/categories";

function fileToCompressedDataURL(file: File, maxW = 700, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = Math.round(h * (maxW / w));
          w = maxW;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas context"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProductForm({
  password,
  mode,
  product,
}: {
  password: string;
  mode: "add" | "edit";
  product?: Product;
}) {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(product?.image ?? null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessingImage(true);
    try {
      const dataUrl = await fileToCompressedDataURL(file);
      setImage(dataUrl);
    } finally {
      setProcessingImage(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!image) {
      setError("من فضلك اختر صورة للمنتج");
      return;
    }
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || "").trim(),
      price: Number(form.get("price")),
      category: String(form.get("category") || "").trim(),
      description: String(form.get("description") || "").trim(),
      image,
    };

    const url = mode === "add" ? "/api/products" : `/api/products/${product?.id}`;
    const method = mode === "add" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ، حاول مرة أخرى");
        setSubmitting(false);
        return;
      }
      router.push("/admin");
    } catch {
      setError("تعذر الاتصال بالخادم");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-display text-2xl text-black">
        {mode === "add" ? "إضافة منتج جديد" : "تعديل المنتج"}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label className="mb-1.5 text-sm font-bold">اسم المنتج</label>
        <input
          name="name"
          type="text"
          required
          defaultValue={product?.name}
          placeholder="مثال: قميص قطن"
          className="rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-black focus:outline-none"
        />

        <label className="mb-1.5 mt-4 text-sm font-bold">سعر المنتج (ج.م)</label>
        <input
          name="price"
          type="number"
          required
          min={0}
          step="0.01"
          defaultValue={product?.price}
          placeholder="0.00"
          className="rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-black focus:outline-none"
        />

        <label className="mb-1.5 mt-4 text-sm font-bold">تصنيف المنتج</label>
        <input
          name="category"
          type="text"
          required
          list="category-suggestions"
          defaultValue={product?.category}
          placeholder="مثال: إلكترونيات"
          className="rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-black focus:outline-none"
        />
        <datalist id="category-suggestions">
          {SUGGESTED_CATEGORIES.map((cat) => (
            <option key={cat} value={cat} />
          ))}
        </datalist>

        <label className="mb-1.5 mt-4 text-sm font-bold">وصف المنتج</label>
        <textarea
          name="description"
          defaultValue={product?.description}
          placeholder="اكتب تفاصيل عن المنتج، المقاس، الخامة، إلخ..."
          className="min-h-[100px] resize-y rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-black focus:outline-none"
        />

        <label className="mb-1.5 mt-4 text-sm font-bold">صورة المنتج</label>
        <label
          htmlFor="imgInput"
          className="cursor-pointer rounded-xl border-2 border-dashed border-line p-4.5 text-center text-sm text-neutral-600 transition hover:border-black hover:text-black"
        >
          {processingImage
            ? "جارٍ معالجة الصورة..."
            : image
            ? "اضغط لتغيير الصورة"
            : "اضغط لاختيار صورة المنتج"}
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="mx-auto mt-2.5 max-h-40 rounded-lg" />
          )}
        </label>
        <input
          id="imgInput"
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        {error && <div className="mt-3 text-sm font-bold text-black">{error}</div>}

        <div className="mt-5 flex gap-2.5">
          <button
            type="submit"
            disabled={submitting || processingImage}
            className="flex-1 rounded-lg bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {submitting ? "جارٍ الحفظ..." : mode === "add" ? "إضافة المنتج" : "حفظ التعديلات"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-lg border-[1.5px] border-line px-5 py-3 text-sm font-bold transition hover:border-black"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

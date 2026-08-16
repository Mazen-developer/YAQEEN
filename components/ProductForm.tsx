"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ColorOption, Product } from "@/lib/types";
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

/** محرر عام لقوائم نصية (Sizes / Types) — إضافة وحذف بدون لمس الكود */
function TagListEditor({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v || values.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  }

  return (
    <div className="mt-4">
      <label className="mb-1.5 block text-sm font-bold">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg border-[1.5px] border-brand-500 px-4 py-2.5 text-sm font-bold text-brand-600 transition hover:bg-brand-500 hover:text-white"
        >
          + إضافة
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {values.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                aria-label={`حذف ${v}`}
                className="text-brand-500 hover:text-brand-700"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorListEditor({
  values,
  onChange,
}: {
  values: ColorOption[];
  onChange: (next: ColorOption[]) => void;
}) {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#f0428d");

  function add() {
    const v = name.trim();
    if (!v || values.some((c) => c.name === v)) {
      setName("");
      return;
    }
    onChange([...values, { name: v, hex }]);
    setName("");
  }

  return (
    <div className="mt-4">
      <label className="mb-1.5 block text-sm font-bold">الألوان المتاحة</label>
      <div className="flex flex-wrap gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="h-[42px] w-12 cursor-pointer rounded-lg border-[1.5px] border-line bg-white p-1"
          aria-label="اختر كود اللون"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="اسم اللون، مثال: وردي"
          className="min-w-[140px] flex-1 rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg border-[1.5px] border-brand-500 px-4 py-2.5 text-sm font-bold text-brand-600 transition hover:bg-brand-500 hover:text-white"
        >
          + إضافة
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {values.map((c) => (
            <span
              key={c.name}
              className="flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 py-1 pl-3 pr-1.5 text-xs font-bold text-brand-700"
            >
              <span
                className="h-3.5 w-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: c.hex || "#f0428d" }}
              />
              {c.name}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x.name !== c.name))}
                aria-label={`حذف ${c.name}`}
                className="text-brand-500 hover:text-brand-700"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
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

  const [colors, setColors] = useState<ColorOption[]>(product?.options?.colors ?? []);
  const [sizes, setSizes] = useState<string[]>(product?.options?.sizes ?? []);
  const [types, setTypes] = useState<string[]>(product?.options?.types ?? []);
  const [minQuantity, setMinQuantity] = useState<number>(product?.options?.minQuantity ?? 1);

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
    if (submitting) return;
    if (!Number.isFinite(minQuantity) || minQuantity < 1) {
      setError("الحد الأدنى للكمية يجب أن يكون 1 على الأقل");
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
      options: {
        colors,
        sizes,
        types,
        minQuantity: Math.floor(minQuantity),
      },
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
          className="rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
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
          className="rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />

        <label className="mb-1.5 mt-4 text-sm font-bold">تصنيف المنتج</label>
        <input
          name="category"
          type="text"
          required
          list="category-suggestions"
          defaultValue={product?.category}
          placeholder="مثال: إلكترونيات"
          className="rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
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
          className="min-h-[100px] resize-y rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />

        <label className="mb-1.5 mt-4 text-sm font-bold">صورة المنتج</label>
        <label
          htmlFor="imgInput"
          className="cursor-pointer rounded-xl border-2 border-dashed border-line p-4.5 text-center text-sm text-neutral-600 transition hover:border-brand-500 hover:text-brand-700"
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

        <div className="mt-6 rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-4">
          <h3 className="mb-1 font-display text-lg text-brand-700">خيارات المنتج (اختياري)</h3>
          <p className="mb-1 text-xs text-neutral-600">
            أضف ألوان، مقاسات، وأنواع مختلفة — المستخدم هيختار من بينها في صفحة المنتج.
          </p>

          <ColorListEditor values={colors} onChange={setColors} />
          <TagListEditor
            label="المقاسات المتاحة (Size)"
            placeholder="مثال: Medium"
            values={sizes}
            onChange={setSizes}
          />
          <TagListEditor
            label="الأنواع المتاحة (Type)"
            placeholder="مثال: Premium"
            values={types}
            onChange={setTypes}
          />

          <label className="mb-1.5 mt-4 block text-sm font-bold">أقل كمية للطلب (Minimum Quantity)</label>
          <input
            type="number"
            min={1}
            step={1}
            value={minQuantity}
            onChange={(e) => setMinQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="w-full rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-neutral-500">
            المستخدم مش هيقدر يضيف كمية أقل من الرقم ده للسلة.
          </p>
        </div>

        {error && <div className="mt-3 text-sm font-bold text-brand-700">{error}</div>}

        <div className="mt-5 flex gap-2.5">
          <button
            type="submit"
            disabled={submitting || processingImage}
            className="flex-1 rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? "جارٍ الحفظ..." : mode === "add" ? "إضافة المنتج" : "حفظ التعديلات"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-lg border-[1.5px] border-line px-5 py-3 text-sm font-bold transition hover:border-brand-500"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

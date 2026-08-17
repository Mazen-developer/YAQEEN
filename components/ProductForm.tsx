"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Product, ProductOption, ProductOptionValue, VariantCombination } from "@/lib/types";
import { SUGGESTED_CATEGORIES } from "@/lib/categories";
import { combinationKey, generateCombinations } from "@/lib/productOptions";
import { formatPrice } from "@/lib/format";

const MAX_COMBINATIONS_SHOWN = 300;

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

/* ------------------------------------------------------------------ */
/* محرر قيم Option واحد (مثال: قيم "اللون" -> أحمر، أزرق...)            */
/* ------------------------------------------------------------------ */

function OptionValuesEditor({
  values,
  onChange,
}: {
  values: ProductOptionValue[];
  onChange: (next: ProductOptionValue[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [hex, setHex] = useState("#f0428d");
  const [useColor, setUseColor] = useState(false);

  function add() {
    const v = draft.trim();
    if (!v || values.some((x) => x.value.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...values, { value: v, hex: useColor ? hex : undefined }]);
    setDraft("");
  }

  return (
    <div className="mt-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
          <input
            type="checkbox"
            checked={useColor}
            onChange={(e) => setUseColor(e.target.checked)}
            className="h-3.5 w-3.5"
          />
          إظهار لون مميز لكل قيمة
        </label>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {useColor && (
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="h-[38px] w-11 cursor-pointer rounded-lg border-[1.5px] border-line bg-white p-1"
            aria-label="اختر كود اللون"
          />
        )}
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
          placeholder="اكتب قيمة، مثال: أحمر أو Small"
          className="min-w-[120px] flex-1 rounded-lg border-[1.5px] border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg border-[1.5px] border-brand-500 px-3.5 py-2 text-xs font-bold text-brand-600 transition hover:bg-brand-500 hover:text-white"
        >
          + إضافة قيمة
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v.value}
              className="flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 py-1 pl-2.5 pr-1.5 text-xs font-bold text-brand-700"
            >
              {v.hex && (
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/10"
                  style={{ backgroundColor: v.hex }}
                />
              )}
              {v.value}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x.value !== v.value))}
                aria-label={`حذف ${v.value}`}
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

/* ------------------------------------------------------------------ */
/* محرر كل الـ Options (اللون، الحجم، النوع، أو أي اسم يضيفه الأدمن)     */
/* ------------------------------------------------------------------ */

function OptionsEditor({
  options,
  onChange,
}: {
  options: ProductOption[];
  onChange: (next: ProductOption[]) => void;
}) {
  function addOption() {
    onChange([...options, { name: "", values: [] }]);
  }

  function updateOption(index: number, patch: Partial<ProductOption>) {
    onChange(options.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  }

  function removeOption(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-bold">Options المنتج (اللون، الحجم، النوع...)</label>
        <button
          type="button"
          onClick={addOption}
          className="rounded-lg border-[1.5px] border-brand-500 px-3.5 py-1.5 text-xs font-bold text-brand-600 transition hover:bg-brand-500 hover:text-white"
        >
          + إضافة Option جديد
        </button>
      </div>

      {options.length === 0 && (
        <p className="text-xs text-neutral-500">
          لسه معملتش أي Option. لو المنتج بسيط من غير اختيارات، سيبها فاضية.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {options.map((option, i) => (
          <div key={i} className="rounded-xl border-[1.5px] border-line bg-white p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={option.name}
                onChange={(e) => updateOption(i, { name: e.target.value })}
                placeholder="اسم الـ Option، مثال: اللون"
                className="flex-1 rounded-lg border-[1.5px] border-line px-3 py-2 text-sm font-bold focus:border-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeOption(i)}
                aria-label="حذف Option"
                className="rounded-lg border-[1.5px] border-line px-2.5 py-2 text-sm text-neutral-500 transition hover:border-brand-500 hover:text-brand-700"
              >
                🗑
              </button>
            </div>
            <OptionValuesEditor
              values={option.values}
              onChange={(values) => updateOption(i, { values })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* جدول أسعار كل التركيبات (Combinations)                              */
/* ------------------------------------------------------------------ */

function CombinationsPriceTable({
  options,
  basePrice,
  priceMap,
  onChange,
}: {
  options: ProductOption[];
  basePrice: number;
  priceMap: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  const combinations = useMemo(() => generateCombinations(options), [options]);
  const optionNames = options.map((o) => o.name).filter(Boolean);

  if (!optionNames.length || combinations.length === 0) return null;

  if (combinations.length > MAX_COMBINATIONS_SHOWN) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-brand-300 bg-white p-3 text-xs text-neutral-600">
        عدد التركيبات ({combinations.length}) كبير جدًا لعرضه كجدول. قلّل عدد القيم في كل Option
        لو عايز تحدد سعر مختلف لكل تركيبة، وإلا هيتم استخدام السعر الأساسي للمنتج للكل.
      </div>
    );
  }

  function setPrice(key: string, value: string) {
    onChange({ ...priceMap, [key]: value });
  }

  return (
    <div className="mt-4">
      <label className="mb-1.5 block text-sm font-bold">أسعار التركيبات (Combinations)</label>
      <p className="mb-2 text-xs text-neutral-500">
        سيب الخانة فاضية لو عايز تستخدم السعر الأساسي للمنتج ({formatPrice(basePrice)}) لهذه التركيبة.
      </p>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[360px] border-collapse bg-white text-sm">
          <thead>
            <tr className="bg-brand-50 text-brand-700">
              {optionNames.map((name) => (
                <th key={name} className="px-3 py-2 text-right font-bold">
                  {name}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-bold">السعر (ج.م)</th>
            </tr>
          </thead>
          <tbody>
            {combinations.map((combo: VariantCombination) => {
              const key = combinationKey(combo);
              return (
                <tr key={key} className="border-t border-line">
                  {optionNames.map((name) => (
                    <td key={name} className="px-3 py-2">
                      {combo[name]}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={priceMap[key] ?? ""}
                      onChange={(e) => setPrice(key, e.target.value)}
                      placeholder={String(basePrice)}
                      className="w-28 rounded-lg border-[1.5px] border-line px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* الفورم الرئيسي                                                      */
/* ------------------------------------------------------------------ */

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

  const [price, setPrice] = useState<number>(product?.price ?? 0);
  const [options, setOptions] = useState<ProductOption[]>(product?.options?.list ?? []);
  const [minQuantity, setMinQuantity] = useState<number>(product?.options?.minQuantity ?? 1);

  const [priceMap, setPriceMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const v of product?.options?.variants ?? []) {
      if (typeof v.price === "number") {
        map[combinationKey(v.combination)] = String(v.price);
      }
    }
    return map;
  });

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
    const cleanOptions = options
      .map((o) => ({ ...o, name: o.name.trim() }))
      .filter((o) => o.name && o.values.length > 0);

    for (const o of cleanOptions) {
      if (!o.values.length) {
        setError(`الـ Option "${o.name}" لازم يحتوي على قيمة واحدة على الأقل`);
        return;
      }
    }

    setSubmitting(true);
    const form = new FormData(e.currentTarget);

    const combinations = generateCombinations(cleanOptions);
    const variants = combinations
      .map((combination) => {
        const key = combinationKey(combination);
        const raw = priceMap[key];
        if (raw === undefined || raw === "") return null;
        const parsed = Number(raw);
        if (!Number.isFinite(parsed) || parsed < 0) return null;
        return { combination, price: parsed };
      })
      .filter(Boolean);

    const payload = {
      name: String(form.get("name") || "").trim(),
      price: Number(form.get("price")),
      category: String(form.get("category") || "").trim(),
      description: String(form.get("description") || "").trim(),
      image,
      options: {
        list: cleanOptions,
        variants,
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
    <div className="mx-auto max-w-2xl rounded-2xl border border-line bg-white p-6 shadow-sm">
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

        <label className="mb-1.5 mt-4 text-sm font-bold">السعر الأساسي للمنتج (ج.م)</label>
        <input
          name="price"
          type="number"
          required
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))}
          placeholder="0.00"
          className="rounded-lg border-[1.5px] border-line px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-neutral-500">
          هذا السعر بيتستخدم لو المنتج من غير Options، أو لأي تركيبة ملهاش سعر خاص في الجدول تحت.
        </p>

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
          <h3 className="mb-1 font-display text-lg text-brand-700">خيارات المنتج والأسعار (اختياري)</h3>
          <p className="mb-1 text-xs text-neutral-600">
            أضف أي Options زي اللون أو الحجم أو النوع، وحدد سعر مختلف لكل تركيبة لو احتجت.
          </p>

          <OptionsEditor options={options} onChange={setOptions} />

          <CombinationsPriceTable
            options={options}
            basePrice={price}
            priceMap={priceMap}
            onChange={setPriceMap}
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

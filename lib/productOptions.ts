import type {
  Product,
  ProductOption,
  ProductOptionValue,
  ProductOptions,
  ProductVariant,
  VariantCombination,
} from "./types";

/* ---------------------------------------------------------------------- */
/* Parsing / migration                                                    */
/* ---------------------------------------------------------------------- */

function parseOptionValue(raw: unknown): ProductOptionValue | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Partial<ProductOptionValue>;
  if (typeof v.value !== "string" || !v.value.trim()) return null;
  return {
    value: v.value.trim(),
    hex: typeof v.hex === "string" && v.hex.trim() ? v.hex.trim() : undefined,
  };
}

function parseOption(raw: unknown): ProductOption | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Partial<ProductOption>;
  if (typeof o.name !== "string" || !o.name.trim()) return null;

  const seen = new Set<string>();
  const values: ProductOptionValue[] = Array.isArray(o.values)
    ? o.values
        .map(parseOptionValue)
        .filter((v): v is ProductOptionValue => {
          if (!v) return false;
          const key = v.value.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
    : [];

  return { name: o.name.trim(), values };
}

/** يتأكد إن كل مفتاح/قيمة في التركيبة موجودين فعليًا في تعريف المنتج (حماية من قيم مزيّفة) */
export function sanitizeCombination(
  raw: Record<string, unknown> | undefined | null,
  list: ProductOption[]
): VariantCombination {
  const result: VariantCombination = {};
  if (!raw) return result;
  for (const option of list) {
    const val = raw[option.name];
    if (typeof val !== "string") continue;
    const match = option.values.find((v) => v.value === val);
    if (match) result[option.name] = match.value;
  }
  return result;
}

function parseVariant(raw: unknown, validOptions: ProductOption[]): ProductVariant | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as { combination?: unknown; price?: unknown };
  if (!v.combination || typeof v.combination !== "object") return null;

  const combination = sanitizeCombination(v.combination as Record<string, unknown>, validOptions);
  // تركيبة صالحة لازم تحدد قيمة لكل Option معرّف في المنتج
  if (Object.keys(combination).length !== validOptions.length) return null;

  const price =
    v.price === null || v.price === undefined || v.price === ("" as unknown)
      ? undefined
      : Number(v.price);

  return {
    combination,
    price: typeof price === "number" && Number.isFinite(price) && price >= 0 ? price : undefined,
  };
}

/** يتحوّل من الشكل القديم (colors/sizes/types) لو موجود، عشان منتجات قديمة متتكسرش */
function migrateLegacyOptions(raw: Record<string, unknown>): ProductOption[] | null {
  const hasLegacyShape =
    Array.isArray(raw.colors) || Array.isArray(raw.sizes) || Array.isArray(raw.types);
  if (!hasLegacyShape) return null;

  const list: ProductOption[] = [];

  if (Array.isArray(raw.colors) && raw.colors.length) {
    const values: ProductOptionValue[] = raw.colors
      .filter(
        (c: unknown): c is { name: string; hex?: string } =>
          !!c && typeof c === "object" && typeof (c as { name?: unknown }).name === "string"
      )
      .map((c) => ({ value: c.name.trim(), hex: c.hex }))
      .filter((v) => v.value !== "");
    if (values.length) list.push({ name: "اللون", values });
  }

  if (Array.isArray(raw.sizes) && raw.sizes.length) {
    const values: ProductOptionValue[] = raw.sizes
      .filter((s: unknown): s is string => typeof s === "string" && s.trim() !== "")
      .map((s) => ({ value: s.trim() }));
    if (values.length) list.push({ name: "المقاس", values });
  }

  if (Array.isArray(raw.types) && raw.types.length) {
    const values: ProductOptionValue[] = raw.types
      .filter((t: unknown): t is string => typeof t === "string" && t.trim() !== "")
      .map((t) => ({ value: t.trim() }));
    if (values.length) list.push({ name: "النوع", values });
  }

  return list;
}

/** يحوّل أي مدخل قادم من الـAdmin (JSON) أو من قاعدة البيانات لشكل ProductOptions آمن ومتحقق منه */
export function parseProductOptions(raw: unknown): ProductOptions {
  const o = (raw ?? {}) as Record<string, unknown>;

  let list: ProductOption[] = Array.isArray(o.list)
    ? (o.list.map(parseOption).filter(Boolean) as ProductOption[])
    : [];

  if (!Array.isArray(o.list)) {
    const migrated = migrateLegacyOptions(o);
    if (migrated) list = migrated;
  }

  // امنع تكرار اسم الـ Option، وامنع الـ Options الفاضية من القيم
  const seenNames = new Set<string>();
  list = list.filter((opt) => {
    if (!opt.values.length) return false;
    const key = opt.name.toLowerCase();
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    return true;
  });

  const variants: ProductVariant[] = Array.isArray(o.variants)
    ? (o.variants.map((v) => parseVariant(v, list)).filter(Boolean) as ProductVariant[])
    : [];

  const parsedMin = Number(o.minQuantity);
  const minQuantity = Number.isFinite(parsedMin) && parsedMin >= 1 ? Math.floor(parsedMin) : 1;

  return { list, variants, minQuantity };
}

/* ---------------------------------------------------------------------- */
/* Combinations                                                           */
/* ---------------------------------------------------------------------- */

/** يبني كل التركيبات الممكنة (Cartesian product) من كل الـ Options وقيمها */
export function generateCombinations(list: ProductOption[]): VariantCombination[] {
  if (!list.length) return [];
  return list.reduce<VariantCombination[]>(
    (acc, option) => {
      if (!option.values.length) return acc;
      const next: VariantCombination[] = [];
      for (const combo of acc) {
        for (const val of option.values) {
          next.push({ ...combo, [option.name]: val.value });
        }
      }
      return next;
    },
    [{}]
  );
}

/** مفتاح ثابت لأي تركيبة، بيتبني بترتيب أسماء الـ Options عشان يفضل نفسه دايمًا */
export function combinationKey(combination?: VariantCombination): string {
  if (!combination) return "";
  const keys = Object.keys(combination).sort();
  return keys.map((k) => `${k}:${combination[k]}`).join("|");
}

/** نص وصفي للعرض للعميل/الأدمن، مثال: "وردي · Small" */
export function combinationLabel(combination?: VariantCombination): string {
  if (!combination) return "";
  return Object.keys(combination)
    .sort()
    .map((k) => combination[k])
    .filter(Boolean)
    .join(" · ");
}

function findVariant(
  options: ProductOptions | undefined,
  combination: VariantCombination
): ProductVariant | undefined {
  if (!options?.variants?.length) return undefined;
  const key = combinationKey(combination);
  return options.variants.find((v) => combinationKey(v.combination) === key);
}

/** السعر الفعلي لتركيبة معينة: سعر الـ Variant لو محدد، وإلا سعر المنتج الأساسي */
export function getVariantPrice(product: Product, combination?: VariantCombination): number {
  if (!combination || !Object.keys(combination).length) return product.price;
  const variant = findVariant(product.options, combination);
  return typeof variant?.price === "number" ? variant.price : product.price;
}

/** نطاق السعر عبر كل التركيبات الممكنة — مفيد لعرض "يبدأ من" في صفحات القوائم */
export function getPriceRange(product: Product): { min: number; max: number; hasRange: boolean } {
  const list = product.options?.list ?? [];
  const combinations = generateCombinations(list);
  if (!combinations.length) {
    return { min: product.price, max: product.price, hasRange: false };
  }
  const prices = combinations.map((c) => getVariantPrice(product, c));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max, hasRange: min !== max };
}

import type { ColorOption, ProductOptions } from "./types";

/** يحوّل أي مدخل قادم من الـAdmin (JSON) لشكل ProductOptions آمن ومتحقق منه */
export function parseProductOptions(raw: unknown): ProductOptions {
  const o = (raw ?? {}) as Partial<ProductOptions>;

  const colors: ColorOption[] = Array.isArray(o.colors)
    ? o.colors
        .filter(
          (c): c is ColorOption =>
            !!c &&
            typeof c === "object" &&
            typeof (c as ColorOption).name === "string" &&
            (c as ColorOption).name.trim() !== ""
        )
        .map((c) => ({
          name: c.name.trim(),
          hex: typeof c.hex === "string" && c.hex.trim() ? c.hex.trim() : undefined,
        }))
    : [];

  const sizes: string[] = Array.isArray(o.sizes)
    ? o.sizes.filter((s): s is string => typeof s === "string" && s.trim() !== "").map((s) => s.trim())
    : [];

  const types: string[] = Array.isArray(o.types)
    ? o.types.filter((t): t is string => typeof t === "string" && t.trim() !== "").map((t) => t.trim())
    : [];

  const parsedMin = Number(o.minQuantity);
  const minQuantity = Number.isFinite(parsedMin) && parsedMin >= 1 ? Math.floor(parsedMin) : 1;

  return { colors, sizes, types, minQuantity };
}

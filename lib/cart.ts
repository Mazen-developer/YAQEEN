import type { SelectedVariant } from "./types";

/** بيبني id فريد لكل تركيبة (منتج + لون/مقاس/نوع) عشان تتخزن كسطر منفصل في السلة */
export function buildLineId(productId: string, variant?: SelectedVariant): string {
  if (!variant) return productId;
  const parts = [variant.color ?? "", variant.size ?? "", variant.type ?? ""];
  const suffix = parts.some(Boolean) ? `::${parts.join("|")}` : "";
  return `${productId}${suffix}`;
}

export function variantLabel(variant?: SelectedVariant): string {
  if (!variant) return "";
  return [variant.color, variant.size, variant.type].filter(Boolean).join(" · ");
}

import type { SelectedVariant } from "./types";
import { combinationKey, combinationLabel } from "./productOptions";

/** بيبني id فريد لكل تركيبة (منتج + كل الـ Options المختارة) عشان تتخزن كسطر منفصل في السلة */
export function buildLineId(productId: string, variant?: SelectedVariant): string {
  const key = combinationKey(variant);
  return key ? `${productId}::${key}` : productId;
}

export function variantLabel(variant?: SelectedVariant): string {
  return combinationLabel(variant);
}

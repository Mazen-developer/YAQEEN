export function formatPrice(n: number): string {
  return `${Number(n).toLocaleString("en-US")} ج.م`;
}

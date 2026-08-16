"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine, SelectedVariant } from "@/lib/types";
import { buildLineId } from "@/lib/cart";

type CartContextValue = {
  cart: CartLine[];
  count: number;
  addToCart: (id: string, qty?: number, variant?: SelectedVariant) => void;
  changeQty: (lineId: string, delta: number, minQty?: number) => void;
  removeFromCart: (lineId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "saffi-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // توافق مع نسخ سابقة كانت بتخزن { id, qty } بدون lineId
        const migrated: CartLine[] = Array.isArray(parsed)
          ? parsed.map((line: Partial<CartLine> & { id: string; qty: number }) => ({
              lineId: line.lineId ?? buildLineId(line.id, line.variant),
              id: line.id,
              qty: line.qty,
              variant: line.variant,
            }))
          : [];
        setCart(migrated);
      }
    } catch {
      // ignore corrupted cart
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const addToCart = useCallback((id: string, qty: number = 1, variant?: SelectedVariant) => {
    const lineId = buildLineId(id, variant);
    setCart((prev) => {
      const existing = prev.find((line) => line.lineId === lineId);
      if (existing) {
        return prev.map((line) =>
          line.lineId === lineId ? { ...line, qty: line.qty + qty } : line
        );
      }
      return [...prev, { lineId, id, qty, variant }];
    });
  }, []);

  const changeQty = useCallback((lineId: string, delta: number, minQty: number = 1) => {
    setCart((prev) =>
      prev.reduce<CartLine[]>((acc, line) => {
        if (line.lineId !== lineId) {
          acc.push(line);
          return acc;
        }
        const nextQty = line.qty + delta;
        if (nextQty <= 0) return acc; // إزالة السطر
        if (delta < 0 && nextQty < minQty) {
          acc.push(line); // امنع النزول تحت أقل كمية مسموحة
          return acc;
        }
        acc.push({ ...line, qty: nextQty });
        return acc;
      }, [])
    );
  }, []);

  const removeFromCart = useCallback((lineId: string) => {
    setCart((prev) => prev.filter((line) => line.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const count = useMemo(() => cart.reduce((s, c) => s + c.qty, 0), [cart]);

  const value = useMemo(
    () => ({ cart, count, addToCart, changeQty, removeFromCart, clearCart }),
    [cart, count, addToCart, changeQty, removeFromCart, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

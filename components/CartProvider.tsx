"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/lib/types";

export type CartOptions = { color?: string; size?: string; type?: string };

type CartContextValue = {
  cart: CartLine[];
  count: number;
  addToCart: (id: string, qty?: number, options?: CartOptions) => void;
  changeQty: (lineKey: string, delta: number) => void;
  removeFromCart: (lineKey: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "saffi-cart";

function makeLineKey(id: string, options?: CartOptions): string {
  return [id, options?.color || "", options?.size || "", options?.type || ""].join("::");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // backward compatibility: old carts didn't have lineKey
        const normalized: CartLine[] = Array.isArray(parsed)
          ? parsed.map((line: CartLine) => ({
              ...line,
              lineKey: line.lineKey || makeLineKey(line.id, line),
            }))
          : [];
        setCart(normalized);
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

  const addToCart = useCallback((id: string, qty: number = 1, options?: CartOptions) => {
    const lineKey = makeLineKey(id, options);
    setCart((prev) => {
      const existing = prev.find((line) => line.lineKey === lineKey);
      if (existing) {
        return prev.map((line) =>
          line.lineKey === lineKey ? { ...line, qty: line.qty + qty } : line
        );
      }
      return [
        ...prev,
        { lineKey, id, qty, color: options?.color, size: options?.size, type: options?.type },
      ];
    });
  }, []);

  const changeQty = useCallback((lineKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) => (line.lineKey === lineKey ? { ...line, qty: line.qty + delta } : line))
        .filter((line) => line.qty > 0)
    );
  }, []);

  const removeFromCart = useCallback((lineKey: string) => {
    setCart((prev) => prev.filter((line) => line.lineKey !== lineKey));
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

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

type CartContextValue = {
  cart: CartLine[];
  count: number;
  addToCart: (id: string, qty?: number) => void;
  changeQty: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
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
      if (raw) setCart(JSON.parse(raw));
    } catch {
      // ignore corrupted cart
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const addToCart = useCallback((id: string, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((line) => line.id === id);
      if (existing) {
        return prev.map((line) =>
          line.id === id ? { ...line, qty: line.qty + qty } : line
        );
      }
      return [...prev, { id, qty }];
    });
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((line) => (line.id === id ? { ...line, qty: line.qty + delta } : line))
        .filter((line) => line.qty > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((line) => line.id !== id));
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

"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { id: number; name: string; priceCents: number; emoji: string; qty: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  totalCents: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "cyberhub_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore corrupted cart
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const add = (item: Omit<CartItem, "qty">, qty = 1) => {
      setItems((prev) => {
        const found = prev.find((i) => i.id === item.id);
        if (found) {
          return prev.map((i) => (i.id === item.id ? { ...i, qty: Math.min(i.qty + qty, 99) } : i));
        }
        return [...prev, { ...item, qty }];
      });
    };
    const remove = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));
    const setQty = (id: number, qty: number) =>
      setItems((prev) =>
        qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, 99) } : i))
      );
    const clear = () => setItems([]);
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const totalCents = items.reduce((sum, i) => sum + i.qty * i.priceCents, 0);
    return { items, count, totalCents, add, remove, setQty, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

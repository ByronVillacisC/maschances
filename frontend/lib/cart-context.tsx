"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import api from "@/lib/api";

interface CartItem {
  id: string;
  raffleId: string;
  raffleName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  ticketNumbers?: string[];
  image?: string | null;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  total: number;
  count: number;
  fetchCart: () => Promise<void>;
  addToCart: (raffleId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  checkout: () => Promise<any>;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const safeItems = Array.isArray(items) ? items : [];
  const total = safeItems.reduce((sum: number, item: any) => sum + (item?.total ?? 0), 0);
  const count = safeItems.reduce((sum: number, item: any) => sum + (item?.quantity ?? 0), 0);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/cart");
      const payload = res?.data?.data ?? res?.data;
      const list = payload?.items ?? payload?.cart?.items ?? payload;
      setItems(Array.isArray(list) ? list : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (raffleId: string, quantity: number) => {
    await api.post("/cart/add", { raffleId, quantity });
    await fetchCart();
  }, [fetchCart]);

  const removeFromCart = useCallback(async (itemId: string) => {
    await api.delete(`/cart/${itemId}`);
    await fetchCart();
  }, [fetchCart]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    await api.put(`/cart/${itemId}`, { quantity });
    await fetchCart();
  }, [fetchCart]);

  const checkout = useCallback(async () => {
    const res = await api.post("/cart/checkout");
    setItems([]);
    return res?.data?.data ?? res?.data;
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider
      value={{ items: safeItems, loading, total, count, fetchCart, addToCart, removeFromCart, updateQuantity, checkout, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default CartContext;

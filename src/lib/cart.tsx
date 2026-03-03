"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  name: string;
  pricePaise: number;
  qty: number;
  imageUrl?: string | null;
  unit?: string | null;
};

export type CartState = {
  // kept for backward compatibility with older saved carts
  shopId: string | null;
  items: CartItem[];
};

const STORAGE_KEY = "bbabibazzar_cart_v1";

function safeParseCart(raw: string | null): CartState {
  if (!raw) return { shopId: null, items: [] };
  try {
    const obj = JSON.parse(raw);
    const itemsRaw = Array.isArray(obj?.items) ? obj.items : [];

    const items: CartItem[] = itemsRaw
      .map((x: any) => ({
        productId: String(x?.productId ?? ""),
        name: String(x?.name ?? ""),
        pricePaise: Number(x?.pricePaise ?? x?.appPricePaise ?? 0),
        qty: Number(x?.qty ?? 1),
        imageUrl: x?.imageUrl ?? null,
        unit: x?.unit ?? null,
      }))
      .filter((x: CartItem) => x.productId && x.name && Number.isFinite(x.pricePaise) && Number.isFinite(x.qty));

    return { shopId: null, items };
  } catch {
    return { shopId: null, items: [] };
  }
}

function saveCart(cart: CartState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {}
}

type AddPayload = {
  productId: string;
  name: string;
  pricePaise: number;
  imageUrl?: string | null;
  unit?: string | null;
  qty?: number;
};

export type CartContextValue = {
  shopId: string | null;
  items: CartItem[];
  isHydrated: boolean;

  addItem: (payload: AddPayload, shopId?: string) => void;

  removeItem: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;

  totalPaise: number;
  totalQty: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({ shopId: null, items: [] });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setState(safeParseCart(localStorage.getItem(STORAGE_KEY)));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    saveCart(state);
  }, [state]);

  const totalPaise = useMemo(
    () => state.items.reduce((sum, it) => sum + it.pricePaise * it.qty, 0),
    [state.items]
  );

  const totalQty = useMemo(
    () => state.items.reduce((sum, it) => sum + (it.qty || 0), 0),
    [state.items]
  );

  const addItem: CartContextValue["addItem"] = (payload) => {
    setState((prev) => {
      const idx = prev.items.findIndex((x) => x.productId === payload.productId);
      const addQty = payload.qty ?? 1;

      if (idx === -1) {
        return {
          shopId: null,
          items: [
            ...prev.items,
            {
              productId: payload.productId,
              name: payload.name,
              pricePaise: payload.pricePaise,
              qty: addQty,
              imageUrl: payload.imageUrl ?? null,
              unit: payload.unit ?? null,
            },
          ],
        };
      }

      const items = prev.items.slice();
      items[idx] = { ...items[idx], qty: (items[idx].qty || 0) + addQty };
      return { shopId: null, items };
    });
  };

  const removeItem = (productId: string) => {
    setState((prev) => {
      const items = prev.items.filter((x) => x.productId !== productId);
      return { shopId: null, items };
    });
  };

  const setQty = (productId: string, qty: number) => {
    setState((prev) => {
      const q = Math.max(1, Math.floor(qty || 1));
      return { ...prev, items: prev.items.map((x) => (x.productId === productId ? { ...x, qty: q } : x)) };
    });
  };

  const clear = () => setState({ shopId: null, items: [] });

  const value: CartContextValue = {
    shopId: state.shopId,
    items: state.items,
    isHydrated,
    addItem,
    removeItem,
    setQty,
    clear,
    totalPaise,
    totalQty,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

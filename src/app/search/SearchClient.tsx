"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/lib/cart";

type Result = {
  id: string;
  name: string;
  unit: string | null;
  imageUrl: string | null;
  appPricePaise: number;
  shopPricePaise: number;
};

function money(paise: number) {
  return `₹${Math.round(paise / 100)}`;
}

function pickFn<T extends Function>(obj: any, names: string[]): T | null {
  for (const n of names) {
    if (typeof obj?.[n] === "function") return obj[n] as T;
  }
  return null;
}

export default function SearchClient({
  q,
  results,
}: {
  q: string;
  results: Result[];
}) {
  const cartAny = useCart() as any;

  const items: any[] = cartAny.items ?? cartAny.cartItems ?? [];

  const add =
    pickFn<(payload: any) => void>(cartAny, [
      "addItem",
      "addToCart",
      "add",
      "addProduct",
      "incrementItem",
      "inc",
    ]) ?? null;

  const dec =
    pickFn<(productId: string) => void>(cartAny, [
      "decrementItem",
      "decrement",
      "dec",
      "removeOne",
      "decreaseQty",
    ]) ?? null;

  const qtyOf = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of items) {
      const pid = it.productId ?? it.id;
      const q = it.qty ?? it.quantity ?? 0;
      if (pid) map.set(pid, q);
    }
    return (productId: string) => map.get(productId) ?? 0;
  }, [items]);

  function addOne(r: Result) {
    if (!add) {
      alert("Cart add function not found in src/lib/cart.ts");
      return;
    }

    add({
      productId: r.id,
      name: r.name,
      unit: r.unit ?? "",
      appPricePaise: r.appPricePaise,
      shopPricePaise: r.shopPricePaise,
      qty: 1,
    });
  }

  function removeOne(productId: string) {
    if (!dec) return;
    dec(productId);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Search</h1>
        <div className="flex items-center gap-3">
          <Link href="/cart" className="text-sm text-blue-600">
            Cart
          </Link>
          <Link href="/" className="text-sm text-blue-600">
            Home
          </Link>
        </div>
      </header>

      <div className="mb-4 rounded-lg border bg-white p-3">
        <div className="text-sm text-gray-600">
          Showing results for:{" "}
          <span className="font-semibold text-black">{q || "—"}</span>
        </div>
      </div>

      {q && results.length === 0 ? (
        <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">
          No results found.
        </div>
      ) : null}

      <div className="grid gap-3">
        {results.map((r) => {
          const qty = qtyOf(r.id);

          return (
            <div
              key={r.id}
              className="flex gap-3 rounded-lg border bg-white p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.imageUrl || "/placeholder.png"}
                alt={r.name}
                className="h-16 w-16 rounded-lg border object-cover"
              />

              <div className="flex-1">
                <div className="font-medium">{r.name}</div>
                <div className="text-sm text-gray-500">{r.unit ?? ""}</div>
                <div className="mt-1 text-sm font-semibold text-green-700">
                  {money(r.appPricePaise)}
                </div>

                <div className="mt-1 inline-block text-xs text-blue-600">Available in your store</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="h-9 w-9 rounded-lg border"
                  onClick={() => removeOne(r.id)}
                  disabled={qty <= 0}
                >
                  -
                </button>
                <div className="w-6 text-center">{qty}</div>
                <button
                  className="h-9 w-9 rounded-lg border"
                  onClick={() => addOne(r)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

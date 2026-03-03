"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/lib/cart";
import { useSettings } from "@/lib/settings";

function money(paise: number) {
  return `Rs ${Math.round(paise / 100)}`;
}

function normalizeImageUrl(url?: string | null) {
  const u = (url || "").trim();
  if (!u) return "";
  if (u.startsWith("uploads/")) return `/${u}`;
  return u;
}

export default function CartPage() {
  const cart = useCart();
  const { lang } = useSettings();
  const hi = lang === "hi";

  const items = cart.items ?? [];

  const qtySum = useMemo(() => {
    let t = 0;
    for (const it of items) t += Number(it.qty ?? 0) || 0;
    return t;
  }, [items]);

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{hi ? "?????" : "Cart"}</h1>
        <Link href="/" className="text-sm text-blue-600">
          {hi ? "? ???? ?? ????" : "? Back to home"}
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-600">{hi ? "???? ????? ???? ???" : "Your cart is empty."}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {items.map((i) => {
              const img = normalizeImageUrl(i.imageUrl);

              return (
                <div key={i.productId} className="flex items-center justify-between gap-4 rounded-lg border bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-lg border bg-gray-100">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={i.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                          {hi ? "??? ???? ????" : "No image"}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="font-medium">{i.name}</div>
                      <div className="text-sm text-gray-500">{i.unit ?? ""}</div>
                      <div className="text-sm text-green-700">
                        {money(i.pricePaise)} {hi ? "?????" : "each"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const next = (i.qty ?? 1) - 1;
                        if (next <= 0) cart.removeItem(i.productId);
                        else cart.setQty(i.productId, next);
                      }}
                      className="h-9 w-9 rounded-lg border bg-white text-lg disabled:opacity-50"
                      disabled={(i.qty ?? 0) <= 0}
                    >
                      -
                    </button>
                    <div className="min-w-8 text-center font-medium">{i.qty}</div>
                    <button
                      onClick={() => cart.setQty(i.productId, (i.qty ?? 0) + 1)}
                      className="h-9 w-9 rounded-lg border bg-white text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{hi ? "??????" : "Items"}</span>
              <span className="font-medium">{qtySum}</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-gray-600">{hi ? "??????" : "Subtotal"}</span>
              <span className="font-semibold">{money(cart.totalPaise ?? 0)}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => cart.clear()} className="rounded-lg border px-4 py-2 text-sm">
                {hi ? "??? ????" : "Clear"}
              </button>

              <Link href="/checkout" className="ml-auto rounded-lg bg-black px-4 py-2 text-sm text-white">
                {hi ? "?????? ?? ????" : "Proceed to Checkout"}
              </Link>
            </div>
          </div>
        </>
      )}
    </main>
  );
}


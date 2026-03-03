"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useCart } from "@/lib/cart";

type ResultProduct = {
  id: string;
  name: string;
  category: string | null;
  unit: string | null;
  imageUrl: string | null;
  inStock: boolean;
  appPricePaise: number;
  shopPricePaise: number;
};

function money(paise: number) {
  return `₹${Math.round(paise / 100)}`;
}

function safeImg(src?: string | null) {
  if (!src) return null;
  const s = src.trim();
  if (!s) return null;
  if (s.startsWith("/") || s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("uploads/")) return `/${s}`;
  return s;
}

export default function SearchResultsClient({
  q,
  results,
}: {
  q: string;
  results: ResultProduct[];
}) {
  const cart = useCart();

  const cartQty = useMemo(() => cart.totalQty, [cart.totalQty]);

  function addOne(p: ResultProduct) {
    cart.addItem(
      {
        productId: p.id,
        name: p.name,
        pricePaise: p.appPricePaise,
        imageUrl: p.imageUrl ?? null,
      }
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <header className="mx-auto mb-4 flex max-w-5xl items-center justify-between gap-3">
        <div>
          <div className="text-sm text-gray-600">Search results for</div>
          <h1 className="text-xl font-bold">“{q}”</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-lg border bg-white px-3 py-2 text-sm">
            ← Home
          </Link>
          <Link href="/cart" className="rounded-lg bg-black px-3 py-2 text-sm text-white">
            Cart ({cartQty})
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl">
        {results.length === 0 ? (
          <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">
            No results found.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {results.map((p) => {
              const img = safeImg(p.imageUrl);

              return (
                <div key={p.id} className="rounded-xl border bg-white p-4">
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-gray-50">
                      {img ? (
                        <Image
                          src={img}
                          alt={p.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{p.name}</div>
                      <div className="text-xs text-gray-600">
                        {p.category ? p.category : "Uncategorized"}
                        {p.unit ? ` • ${p.unit}` : ""}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-green-700">{money(p.appPricePaise)}</div>
                          <div className="text-xs text-gray-500 line-through">
                            {money(p.shopPricePaise)}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!p.inStock}
                          onClick={() => addOne(p)}
                          className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                            p.inStock ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          Add
                        </button>
                      </div>

                      <div className="mt-3 rounded-lg bg-gray-50 p-2 text-xs text-gray-700">
                        Fast delivery from your store.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

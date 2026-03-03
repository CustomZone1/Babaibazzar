"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/lib/cart";

type Product = {
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
  return `Rs ${Math.round((paise || 0) / 100)}`;
}

function safeImg(src?: string | null) {
  if (!src) return null;
  const s = src.trim();
  if (!s) return null;
  if (s.startsWith("/") || s.startsWith("http://") || s.startsWith("https://")) return s;
  if (s.startsWith("uploads/")) return `/${s}`;
  return s;
}

export default function ProductCatalogClient({
  products,
  storeName,
}: {
  products: Product[];
  storeName: string;
}) {
  const cart = useCart();
  const cartQty = useMemo(() => cart.totalQty ?? 0, [cart.totalQty]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{storeName}</h1>
          <div className="text-sm text-neutral-600">All products</div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/" className="rounded border px-3 py-2 text-sm">
            Back
          </Link>
          <Link href="/cart" className="rounded bg-black px-3 py-2 text-sm text-white">
            Cart ({cartQty})
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const img = safeImg(p.imageUrl);
          const inStock = !!p.inStock;

          return (
            <div key={p.id} className="rounded-lg border p-4">
              <div className="flex gap-3">
                <div className="h-16 w-16 overflow-hidden rounded border bg-neutral-50">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{p.name}</div>

                  <div className="text-xs text-neutral-600">
                    {p.unit ? p.unit : null}
                    {p.unit && p.category ? " • " : null}
                    {p.category ? p.category : null}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="leading-tight">
                      <div className="font-bold text-green-700">{money(p.appPricePaise)}</div>
                      <div className="text-xs text-neutral-500 line-through">{money(p.shopPricePaise)}</div>
                    </div>

                    <button
                      className={`rounded px-3 py-2 text-sm ${inStock ? "bg-black text-white" : "bg-neutral-200 text-neutral-500"}`}
                      disabled={!inStock}
                      onClick={() =>
                        cart.addItem({
                          productId: p.id,
                          name: p.name,
                          pricePaise: p.appPricePaise,
                          qty: 1,
                          imageUrl: p.imageUrl ?? null,
                          unit: p.unit ?? null,
                        })
                      }
                      type="button"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-2">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs ${inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {inStock ? "In stock" : "Out of stock"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


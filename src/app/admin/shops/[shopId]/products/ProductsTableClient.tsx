"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ProductRow = {
  id: string;
  name: string;
  category: string | null;
  unit: string | null;
  inStock: boolean;
  imageUrl: string | null;
  shopPricePaise: number;
  appPricePaise: number;
};

function money(paise: number | null | undefined) {
  const v = typeof paise === "number" ? paise : 0;
  return `Rs ${(v / 100).toFixed(0)}`;
}

export default function ProductsTableClient({
  shopId,
  initialProducts,
}: {
  shopId: string;
  initialProducts: ProductRow[];
}) {
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [busyById, setBusyById] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const rows = useMemo(() => products, [products]);

  async function patchProduct(productId: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(String(data?.error || "Action failed"));
    }
  }

  async function onToggleStock(row: ProductRow) {
    setError("");
    setBusyById((prev) => ({ ...prev, [row.id]: true }));
    const prevRows = products;

    setProducts((prev) =>
      prev.map((p) => (p.id === row.id ? { ...p, inStock: !p.inStock } : p))
    );

    try {
      await patchProduct(row.id, { inStock: !row.inStock });
    } catch (e: any) {
      setProducts(prevRows);
      setError(e?.message || "Failed to update stock");
    } finally {
      setBusyById((prev) => ({ ...prev, [row.id]: false }));
    }
  }

  async function onRemove(row: ProductRow) {
    setError("");
    setBusyById((prev) => ({ ...prev, [row.id]: true }));
    const prevRows = products;

    setProducts((prev) => prev.filter((p) => p.id !== row.id));

    try {
      await patchProduct(row.id, { isActive: false });
    } catch (e: any) {
      setProducts(prevRows);
      setError(e?.message || "Failed to remove product");
    } finally {
      setBusyById((prev) => ({ ...prev, [row.id]: false }));
    }
  }

  return (
    <div className="mt-6 rounded-xl border">
      {error ? (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="hidden grid-cols-12 gap-2 border-b bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-700 md:grid">
        <div className="col-span-4">Product</div>
        <div className="col-span-2">Prices</div>
        <div className="col-span-2">Stock</div>
        <div className="col-span-2">Image</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {rows.length === 0 ? (
        <div className="p-6 text-sm text-gray-600">
          No products yet. Click <b>+ Add product</b>.
        </div>
      ) : (
        <div className="divide-y">
          {rows.map((p) => {
            const busy = !!busyById[p.id];
            return (
              <div key={p.id} className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-12 md:items-center md:gap-2">
                <div className="md:col-span-4">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:hidden">
                    Product
                  </div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-gray-600">
                    {p.category ? p.category : "-"} {p.unit ? `• ${p.unit}` : ""}
                  </div>
                </div>

                <div className="text-sm md:col-span-2">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:hidden">
                    Prices
                  </div>
                  <div className="text-gray-700">
                    Shop: <span className="font-medium">{money(p.shopPricePaise)}</span>
                  </div>
                  <div className="text-gray-700">
                    App: <span className="font-medium">{money(p.appPricePaise)}</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:hidden">
                    Stock
                  </div>
                  <div className="text-sm font-medium">{p.inStock ? "In stock" : "Out of stock"}</div>

                  <button
                    className="mt-2 rounded-lg border px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
                    type="button"
                    disabled={busy}
                    onClick={() => onToggleStock(p)}
                  >
                    {busy ? "Saving..." : `Mark ${p.inStock ? "out" : "in"}`}
                  </button>
                </div>

                <div className="md:col-span-2">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:hidden">
                    Image
                  </div>
                  {p.imageUrl ? (
                    <a href={p.imageUrl} target="_blank" className="text-xs underline" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    <span className="text-xs text-gray-500">No image</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 md:col-span-2 md:justify-end">
                  <div className="w-full text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:hidden">
                    Actions
                  </div>

                  <Link
                    href={`/admin/shops/${shopId}/products/${p.id}/edit`}
                    className="rounded-lg border px-2 py-1 text-xs whitespace-nowrap hover:bg-gray-50"
                  >
                    Edit
                  </Link>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onRemove(p)}
                    className="rounded-lg border px-2 py-1 text-xs whitespace-nowrap text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {busy ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

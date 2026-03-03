"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Initial = {
  name: string;
  category: string;
  unit: string;
  imageUrl: string;
  inStock: boolean;
  showInTrending: boolean;
  showInNewArrivals: boolean;
  shopPricePaise: number;
  appPricePaise: number;
};

function rupeesFromPaise(paise: number) {
  return (paise / 100).toFixed(2);
}

function paiseFromRupeeInput(v: string) {
  const clean = String(v || "").trim();
  if (!clean) return 0;
  const n = Number(clean);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

export default function ProductForm({
  mode,
  shopId,
  productId,
  initial,
}: {
  mode: "create" | "edit";
  shopId: string;
  productId?: string;
  initial?: Partial<Initial>;
}) {
  const router = useRouter();

  const init = useMemo<Initial>(() => {
    return {
      name: initial?.name ?? "",
      category: initial?.category ?? "",
      unit: initial?.unit ?? "",
      imageUrl: initial?.imageUrl ?? "",
      inStock: initial?.inStock ?? true,
      showInTrending: initial?.showInTrending ?? false,
      showInNewArrivals: initial?.showInNewArrivals ?? false,
      shopPricePaise:
        typeof initial?.shopPricePaise === "number" && Number.isFinite(initial.shopPricePaise)
          ? initial.shopPricePaise
          : 0,
      appPricePaise:
        typeof initial?.appPricePaise === "number" && Number.isFinite(initial.appPricePaise)
          ? initial.appPricePaise
          : 0,
    };
  }, [initial]);

  const [name, setName] = useState(init.name);
  const [category, setCategory] = useState(init.category);
  const [unit, setUnit] = useState(init.unit);
  const [imageUrl, setImageUrl] = useState(init.imageUrl);
  const [inStock, setInStock] = useState(init.inStock);
  const [showInTrending, setShowInTrending] = useState(init.showInTrending);
  const [showInNewArrivals, setShowInNewArrivals] = useState(init.showInNewArrivals);

  const [shopPriceInput, setShopPriceInput] = useState(rupeesFromPaise(init.shopPricePaise));
  const [appPriceInput, setAppPriceInput] = useState(rupeesFromPaise(init.appPricePaise));

  const shopPricePaise = useMemo(() => paiseFromRupeeInput(shopPriceInput), [shopPriceInput]);
  const appPricePaise = useMemo(() => paiseFromRupeeInput(appPriceInput), [appPriceInput]);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(init.imageUrl?.trim() ? init.imageUrl.trim() : "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function uploadIfNeeded(): Promise<string | null> {
    if (!file) return imageUrl.trim() ? imageUrl.trim() : null;

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error || "Upload failed");
    }

    return typeof data?.url === "string" ? data.url : null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (shopPricePaise <= 0) {
      setError("Shop price must be > 0.");
      return;
    }
    if (appPricePaise <= 0) {
      setError("App price must be > 0.");
      return;
    }
    if (mode === "edit" && !productId) {
      setError("Missing productId for edit.");
      return;
    }

    setLoading(true);
    try {
      const finalImageUrl = await uploadIfNeeded();

      const body = {
        name: name.trim(),
        category: category.trim() || null,
        unit: unit.trim() || null,
        imageUrl: finalImageUrl || null,
        inStock,
        showInTrending,
        showInNewArrivals,
        shopPricePaise,
        appPricePaise,
      };

      const url = mode === "create" ? `/api/admin/shops/${shopId}/products` : `/api/admin/products/${productId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Server error");
        return;
      }

      router.push(`/admin/shops/${shopId}/products`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border p-4">
      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-2">
        <label className="text-sm font-medium">Name *</label>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Fortune Oil"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Category</label>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., Grocery / Dairy"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Unit</label>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="e.g., 1 L / 500 ml / 1 kg"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Product image</label>

        <input
          type="file"
          accept="image/*"
          className="text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setFile(f);

            if (f) {
              const url = URL.createObjectURL(f);
              setPreviewUrl(url);
            } else {
              setPreviewUrl(imageUrl.trim() ? imageUrl.trim() : "");
            }
          }}
        />

        <div className="text-xs text-gray-600">(Optional) Choose a file. It will upload to <b>/public/uploads</b>.</div>

        <label className="text-xs text-gray-600">Or paste Image URL (optional):</label>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            if (!file) setPreviewUrl(e.target.value.trim());
          }}
          placeholder="https://..."
        />

        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Preview" className="mt-2 h-28 w-28 rounded-lg border object-cover" />
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <input id="inStock" type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
        <label htmlFor="inStock" className="text-sm">
          In stock
        </label>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <input
            id="showInTrending"
            type="checkbox"
            checked={showInTrending}
            onChange={(e) => setShowInTrending(e.target.checked)}
          />
          Show in Trending near you
        </label>

        <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <input
            id="showInNewArrivals"
            type="checkbox"
            checked={showInNewArrivals}
            onChange={(e) => setShowInNewArrivals(e.target.checked)}
          />
          Show in New arrivals
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Shop price (Rs) *</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            inputMode="decimal"
            value={shopPriceInput}
            onChange={(e) => setShopPriceInput(e.target.value)}
            placeholder="e.g. 150"
          />
          <p className="text-xs text-gray-600">Saved as paise: {shopPricePaise}</p>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">App price (Rs) *</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            inputMode="decimal"
            value={appPriceInput}
            onChange={(e) => setAppPriceInput(e.target.value)}
            placeholder="e.g. 155"
          />
          <p className="text-xs text-gray-600">Saved as paise: {appPricePaise}</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Saving..." : mode === "create" ? "Add product" : "Save changes"}
      </button>
    </form>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProductFormData = {
  name: string;
  category: string;
  unit: string;
  shopPricePaise: number;
  appPricePaise: number;
  inStock: boolean;
  imageUrl: string;
};

export default function ProductForm({
  mode,
  shopId,
  productId,
  initial,
}: {
  mode: "create" | "edit";
  shopId: string;
  productId?: string;
  initial?: Partial<ProductFormData>;
}) {
  const router = useRouter();

  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [shopPrice, setShopPrice] = useState(
    String((initial?.shopPricePaise ?? 0) / 100)
  );
  const [appPrice, setAppPrice] = useState(
    String((initial?.appPricePaise ?? 0) / 100)
  );
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [file, setFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    return imageUrl || "";
  }, [file, imageUrl]);

  function toPaise(rsStr: string) {
    const n = Number(rsStr);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 100);
  }

  async function uploadIfNeeded(): Promise<string> {
    if (!file) return imageUrl || "";

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Upload failed");

    return String(data.url || "");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const uploadedUrl = await uploadIfNeeded();

      const payload = {
        shopId,
        name: name.trim(),
        category: category.trim() || null,
        unit: unit.trim() || null,
        imageUrl: uploadedUrl || null,
        inStock,
        shopPricePaise: toPaise(shopPrice),
        appPricePaise: toPaise(appPrice),
      };

      if (!payload.name) {
        throw new Error("Name is required");
      }

      if (mode === "create") {
        const res = await fetch(`/api/admin/shops/${shopId}/products`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Create failed");
      } else {
        if (!productId) throw new Error("Missing productId");
        const res = await fetch(`/api/admin/products/${productId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Update failed");
      }

      router.push(`/admin/shops/${shopId}/products`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Server error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-2">
        <label className="text-sm font-medium">Name</label>
        <input
          className="rounded-lg border px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Fortune Oil"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Category (optional)</label>
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Grocery"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">Unit (optional)</label>
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="e.g. 1 L / 500 ml / 1 kg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Shop Price (₹)</label>
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            value={shopPrice}
            onChange={(e) => setShopPrice(e.target.value)}
            inputMode="decimal"
            placeholder="e.g. 150"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium">App Price (₹)</label>
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            value={appPrice}
            onChange={(e) => setAppPrice(e.target.value)}
            inputMode="decimal"
            placeholder="e.g. 155"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="inStock"
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
        />
        <label htmlFor="inStock" className="text-sm">
          In stock
        </label>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Product image</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <div className="text-xs text-gray-500">
          (Optional) If you upload a file, it will be saved into /public/uploads.
        </div>

        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="preview"
            className="mt-2 h-28 w-28 rounded-lg border object-cover"
          />
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={saving}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
          type="submit"
        >
          {saving ? "Saving..." : mode === "create" ? "Create product" : "Save changes"}
        </button>

        <button
          type="button"
          className="rounded-lg border px-4 py-2 text-sm"
          onClick={() => router.push(`/admin/shops/${shopId}/products`)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function money(paise: number | null | undefined) {
  const v = typeof paise === "number" ? paise : 0;
  return `Rs ${(v / 100).toFixed(0)}`;
}

export default async function AdminShopProductsPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) notFound();

  const products = await prisma.product.findMany({
    where: { shopId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  async function toggleStock(formData: FormData) {
    "use server";
    const productId = String(formData.get("productId") || "");
    const next = String(formData.get("next") || "");
    if (!productId) return;

    await prisma.product.update({
      where: { id: productId },
      data: { inStock: next === "1" },
    });

    redirect(`/admin/shops/${shopId}/products`);
  }

  async function softDelete(formData: FormData) {
    "use server";
    const productId = String(formData.get("productId") || "");
    if (!productId) return;

    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    redirect(`/admin/shops/${shopId}/products`);
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Products</h1>
          <p className="text-sm text-gray-600">
            Shop: <span className="font-medium text-black">{shop.name}</span>
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Link href="/admin/orders" className="rounded-lg border px-3 py-2 text-sm">
            Admin Orders
          </Link>
          <Link
            href={`/admin/shops/${shopId}/products/new`}
            className="rounded-lg bg-black px-3 py-2 text-sm text-white"
          >
            + Add product
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-xl border">
        <div className="hidden grid-cols-12 gap-2 border-b bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-700 md:grid">
          <div className="col-span-4">Product</div>
          <div className="col-span-2">Prices</div>
          <div className="col-span-2">Stock</div>
          <div className="col-span-2">Image</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {products.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">
            No products yet. Click <b>+ Add product</b>.
          </div>
        ) : (
          <div className="divide-y">
            {products.map((p) => (
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

                  <form action={toggleStock} className="mt-2">
                    <input type="hidden" name="productId" value={p.id} />
                    <input type="hidden" name="next" value={p.inStock ? "0" : "1"} />
                    <button className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50" type="submit">
                      Mark {p.inStock ? "out" : "in"}
                    </button>
                  </form>
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

                  <form action={softDelete}>
                    <input type="hidden" name="productId" value={p.id} />
                    <button
                      type="submit"
                      className="rounded-lg border px-2 py-1 text-xs whitespace-nowrap text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">"Remove" is soft delete (isActive=false).</div>
    </div>
  );
}

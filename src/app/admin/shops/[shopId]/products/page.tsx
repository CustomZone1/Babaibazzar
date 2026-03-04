import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductsTableClient from "./ProductsTableClient";

export default async function AdminShopProductsPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { id: true, name: true },
  });

  if (!shop) notFound();

  const products = await prisma.product.findMany({
    where: { shopId, isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      category: true,
      unit: true,
      inStock: true,
      imageUrl: true,
      shopPricePaise: true,
      appPricePaise: true,
    },
  });

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
          <Link href={`/admin/shops/${shopId}/products/new`} className="rounded-lg bg-black px-3 py-2 text-sm text-white">
            + Add product
          </Link>
        </div>
      </div>

      <ProductsTableClient shopId={shopId} initialProducts={products} />

      <div className="mt-4 text-xs text-gray-500">"Remove" is soft delete (isActive=false).</div>
    </div>
  );
}

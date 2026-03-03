import { prisma } from "@/lib/prisma";
import { getPrimaryStore } from "@/lib/store";
import ProductCatalogClient from "./ProductCatalogClient";

export default async function ProductsPage() {
  const store = await getPrimaryStore();

  if (!store) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <div className="rounded-xl border bg-red-50 p-4 text-red-700">
          Store not configured. Please create a shop entry first.
        </div>
      </main>
    );
  }

  const products = await prisma.product.findMany({
    where: { shopId: store.id, isActive: true },
    orderBy: [{ inStock: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      name: true,
      category: true,
      unit: true,
      imageUrl: true,
      inStock: true,
      appPricePaise: true,
      shopPricePaise: true,
    },
  });

  return <ProductCatalogClient products={products} storeName={store.name} />;
}


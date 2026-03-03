import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../../ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ shopId: string; productId: string }>;
}) {
  const { shopId, productId } = await params;

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shopId,
    },
  });

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold">Edit Product</h1>

      <ProductForm
        mode="edit"
        shopId={shopId}
        productId={productId}
        initial={{
          name: product.name,
          category: product.category ?? "",
          unit: product.unit ?? "",
          imageUrl: product.imageUrl ?? "",
          inStock: product.inStock,
          showInTrending: product.showInTrending,
          showInNewArrivals: product.showInNewArrivals,
          shopPricePaise: product.shopPricePaise,
          appPricePaise: product.appPricePaise,
        }}
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../ProductForm";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) notFound();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold">Add product</h1>
      <p className="text-sm text-gray-600">
        Shop: <span className="font-medium text-black">{shop.name}</span>
      </p>

      <ProductForm mode="create" shopId={shopId} />
    </div>
  );
}

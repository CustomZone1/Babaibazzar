import { redirect } from "next/navigation";
import { getPrimaryStore } from "@/lib/store";

export default async function AdminProductsPage() {
  const store = await getPrimaryStore();

  if (!store) {
    return (
      <main className="p-4">
        <div className="rounded-xl border bg-red-50 p-4 text-red-700">
          Store not found. Please seed or create a shop record first.
        </div>
      </main>
    );
  }

  redirect(`/admin/shops/${store.id}/products`);
}


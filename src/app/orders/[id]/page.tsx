import Link from "next/link";
import { prisma } from "@/lib/prisma";
import OrderTimeline from "./order-timeline";
import { getServerLang } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

function money(paise: number) {
  return `₹${Math.round((paise || 0) / 100)}`;
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const lang = await getServerLang();
  const hi = lang === "hi";
  const t = {
    invalidOrderId: hi ? "अमान्य ऑर्डर आईडी" : "Invalid order id",
    orderNotFound: hi ? "ऑर्डर नहीं मिला" : "Order not found",
    home: hi ? "होम" : "Home",
    orderId: hi ? "ऑर्डर आईडी" : "Order ID",
    status: hi ? "स्टेटस" : "Status",
    unknown: hi ? "अज्ञात" : "UNKNOWN",
    refresh: hi ? "स्टेटस रीफ्रेश करें" : "Refresh status",
    items: hi ? "आइटम्स" : "Items",
    noItems: hi ? "इस ऑर्डर में कोई आइटम नहीं मिला।" : "No items found for this order.",
    total: hi ? "कुल" : "Total",
  };

  const { id: rawId } = await params;
  const id = typeof rawId === "string" ? rawId.trim() : "";

  if (!id) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-3xl rounded-xl border bg-white p-4">
          <div className="text-red-600 font-semibold">{t.invalidOrderId}</div>
          <div className="text-sm text-gray-600 mt-1">ID: (empty)</div>
          <Link className="text-blue-600 text-sm" href="/">
            ← {t.home}
          </Link>
        </div>
      </main>
    );
  }

  // ✅ IMPORTANT: do NOT include shop relation (it caused Prisma validation error)
  // We only include items (your schema definitely has items because create uses `items: { create: ... }`)
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              unit: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-3xl rounded-xl border bg-white p-4">
          <div className="text-red-600 font-semibold">{t.orderNotFound}</div>
          <div className="text-sm text-gray-600 mt-1">ID: {id}</div>
          <Link className="text-blue-600 text-sm" href="/">
            ← {t.home}
          </Link>
        </div>
      </main>
    );
  }

  // Some schemas might not have these totals; fallback safely
  const total =
    (order as any).totalAppPaise ??
    (order as any).subtotalAppPaise ??
    (order as any).totalPaise ??
    0;

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm text-gray-500">{t.orderId}</div>
          <div className="font-semibold break-all">{order.id}</div>

          <div className="mt-2 text-sm">
            {t.status}: <span className="font-semibold">{(order as any).status ?? t.unknown}</span>
          </div>
          <OrderTimeline status={String((order as any).status ?? "PLACED")} />

          <div className="mt-3">
            <Link
              href={`/orders/${order.id}`}
              className="inline-flex rounded-lg border bg-white px-3 py-2 text-sm"
            >
              {t.refresh}
            </Link>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="text-sm font-semibold mb-2">{t.items}</div>

          {(order.items || []).length === 0 ? (
            <div className="text-sm text-gray-600">{t.noItems}</div>
          ) : (
            <div className="space-y-2">
              {order.items.map((it: any) => {
                const line =
                  it.lineAppTotalPaise ??
                  (it.appPricePaise != null ? it.appPricePaise * (it.qty || 0) : null) ??
                  0;

                return (
                  <div key={it.id} className="flex items-center justify-between text-sm">
                    <div className="text-gray-700">
                      <div className="font-medium">
                        {String(it?.product?.name || it.productId)}
                        {it?.product?.unit ? ` (${String(it.product.unit)})` : ""}
                      </div>
                      {it.productId} × {it.qty}
                    </div>
                    <div className="font-semibold">{money(line)}</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>{t.total}</span>
            <span>{money(total)}</span>
          </div>

          <div className="mt-3">
            <Link className="text-blue-600 text-sm" href="/">
              ← {t.home}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

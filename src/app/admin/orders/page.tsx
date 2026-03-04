import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import OrderStatusSelect from "./status-select";
import WalletCreditsAdmin from "./wallet-credits-admin";

const VALID_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PACKING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(v: string): v is OrderStatus {
  return (VALID_STATUSES as readonly string[]).includes(v);
}

function money(paise: number) {
  return `₹${Math.round(paise / 100)}`;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;

  const rawStatus = String(sp.status ?? "ALL").toUpperCase().trim();
  const q = String(sp.q ?? "").trim();

  // ✅ Only pass valid enum values to Prisma
  const statusFilter: OrderStatus | null =
    rawStatus === "ALL" ? null : isValidStatus(rawStatus) ? rawStatus : null;

  const where: Prisma.OrderWhereInput = {};

  if (statusFilter) {
    where.status = statusFilter;
  }

  if (q) {
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { customerPhone: { contains: q, mode: "insensitive" } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    select: {
      id: true,
      createdAt: true,
      totalAppPaise: true,
      status: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <WalletCreditsAdmin />

      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin • Orders</h1>
          <p className="text-sm text-gray-600">
            Latest 50 orders. Filter + search + update status.
          </p>
        </div>
        <Link href="/" className="text-sm text-blue-600">
          Back to home
        </Link>
      </header>

      <form
        method="GET"
        className="mb-4 flex flex-col gap-2 rounded-lg border bg-white p-3 md:flex-row md:items-center"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status</span>
          <select
            name="status"
            defaultValue={statusFilter ?? "ALL"}
            className="rounded-lg border px-2 py-1 text-sm"
          >
            <option value="ALL">ALL</option>
            {VALID_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <input
          name="q"
          defaultValue={q}
          placeholder="Search: order id / name / phone"
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
        />

        <button className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">
          Apply
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Created</th>
              <th className="p-3">Order</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Open</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3 text-gray-600">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td className="p-3 font-mono">{o.id.slice(-10)}</td>
                <td className="p-3 font-semibold">{money(o.totalAppPaise)}</td>
                <td className="p-3">
                  <OrderStatusSelect orderId={o.id} value={o.status as OrderStatus} />
                </td>
                <td className="p-3">
                  <Link
                    href={`/orders/${o.id}`}
                    className="text-blue-600 underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {orders.length === 0 ? (
              <tr>
                <td className="p-4 text-gray-600" colSpan={5}>
                  No matching orders.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}

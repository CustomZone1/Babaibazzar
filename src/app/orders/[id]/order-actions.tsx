"use client";

import Link from "next/link";

export default function OrderActions({ orderId }: { orderId: string }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Link href="/" className="rounded-lg border bg-white px-3 py-2 text-sm">
        ← Home
      </Link>

      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(orderId);
          alert("Order ID copied ✅");
        }}
        className="rounded-lg border bg-white px-3 py-2 text-sm"
      >
        Copy Order ID
      </button>
    </div>
  );
}

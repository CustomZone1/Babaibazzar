"use client";

import { useEffect, useMemo, useState } from "react";

const STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PACKING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof STATUSES)[number];

function isValidStatus(v: string): v is OrderStatus {
  return (STATUSES as readonly string[]).includes(v);
}

export default function OrderStatusSelect({
  orderId,
  value,
}: {
  orderId: string;
  value: string;
}) {
  const initial = useMemo<OrderStatus>(() => {
    const up = String(value ?? "").toUpperCase().trim();
    return isValidStatus(up) ? up : "PLACED";
  }, [value]);

  const [status, setStatus] = useState<OrderStatus>(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    // if parent re-renders with new value, keep select in sync
    setStatus(initial);
  }, [initial]);

  async function update(next: OrderStatus) {
    setErr("");
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error || "Failed to update status");
        // revert UI if server rejected
        setStatus(initial);
        return;
      }

      // success
      setStatus(next);
    } catch (e: any) {
      setErr(e?.message || "Network error");
      setStatus(initial);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={status}
        disabled={saving}
        onChange={(e) => {
          const next = String(e.target.value).toUpperCase().trim();
          if (!isValidStatus(next)) return;

          // optimistic UI
          setStatus(next);
          update(next);
        }}
        className="rounded-lg border px-2 py-1 text-sm disabled:opacity-60"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {err ? (
        <div className="text-xs text-red-600">{err}</div>
      ) : saving ? (
        <div className="text-xs text-gray-500">Saving…</div>
      ) : null}
    </div>
  );
}

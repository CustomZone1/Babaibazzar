"use client";

import { useEffect, useState } from "react";

type CreditRow = {
  id: string;
  transactionId: string;
  amountPaise: number;
  status: string;
  createdByAdmin: string;
  claimedByUsername: string;
  claimedAt: string;
  createdAt: string;
};

function money(paise: number) {
  return `Rs ${Math.round((paise || 0) / 100)}`;
}

export default function WalletCreditsAdmin() {
  const [transactionId, setTransactionId] = useState("");
  const [amountRupees, setAmountRupees] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [rows, setRows] = useState<CreditRow[]>([]);

  async function loadRows() {
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(String(data?.error || "Failed to load wallet transaction IDs."));
        return;
      }
      setRows(Array.isArray(data?.credits) ? data.credits : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load wallet transaction IDs.");
    }
  }

  async function onCreate() {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "create_upi_credit",
          transactionId: transactionId.trim(),
          amountRupees: Number(amountRupees || 0),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(String(data?.error || "Failed to create transaction ID."));
        return;
      }
      setInfo("Transaction ID saved. User can claim now.");
      setTransactionId("");
      setAmountRupees("");
      await loadRows();
    } catch (e: any) {
      setError(e?.message || "Failed to create transaction ID.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRows();
  }, []);

  return (
    <section className="mb-4 rounded-lg border bg-white p-4">
      <h2 className="text-lg font-semibold">Wallet UPI Credits</h2>
      <p className="mt-1 text-sm text-gray-600">
        Add transaction ID + amount from your received UPI payment. User can claim with this exact transaction ID.
      </p>

      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_180px_auto]">
        <input
          className="rounded-lg border px-3 py-2 text-sm"
          placeholder="UPI Transaction ID"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
        />
        <input
          className="rounded-lg border px-3 py-2 text-sm"
          placeholder="Amount (Rs)"
          value={amountRupees}
          onChange={(e) => setAmountRupees(e.target.value)}
          inputMode="numeric"
        />
        <button
          type="button"
          onClick={onCreate}
          disabled={loading}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save ID"}
        </button>
      </div>

      {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
      {info ? <div className="mt-2 text-sm text-green-700">{info}</div> : null}

      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Created</th>
              <th className="p-2">Transaction ID</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Claimed By</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 text-gray-600">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-2 font-mono">{r.transactionId}</td>
                <td className="p-2 font-semibold">{money(r.amountPaise)}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2 text-gray-700">{r.claimedByUsername || "-"}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td className="p-3 text-gray-600" colSpan={5}>
                  No transaction IDs added yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}


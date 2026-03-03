"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSettings } from "@/lib/settings";

type MyOrder = {
  id: string;
  status: string;
  totalAppPaise: number;
  createdAt: string;
};

type WalletTxn = {
  id: string;
  type: string;
  amountPaise: number;
  balanceAfterPaise: number;
  note: string;
  refOrderId: string;
  createdAt: string;
};

function money(paise: number) {
  return `Rs ${Math.round((paise || 0) / 100)}`;
}

function statusClass(status: string) {
  const s = String(status || "").toUpperCase();
  if (s === "DELIVERED") return "bg-green-100 text-green-700 border-green-200";
  if (s === "CANCELLED") return "bg-red-100 text-red-700 border-red-200";
  if (s === "OUT_FOR_DELIVERY") return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

function isOpenOrder(status: string) {
  const s = String(status || "").toUpperCase();
  return s !== "DELIVERED" && s !== "CANCELLED";
}

export default function MyOrdersClient() {
  const { lang, isLoggedIn, isAuthLoading, userUsername } = useSettings();
  const sp = useSearchParams();
  const hi = lang === "hi";
  const isWalletView = sp.get("view") === "wallet";

  const ORDER_STEPS = useMemo(
    () =>
      [
        { key: "PLACED", label: hi ? "\u092a\u094d\u0932\u0947\u0938\u094d\u0921" : "Placed" },
        { key: "CONFIRMED", label: hi ? "\u0915\u0928\u094d\u092b\u0930\u094d\u092e\u094d\u0921" : "Confirmed" },
        { key: "PACKING", label: hi ? "\u092a\u0948\u0915\u093f\u0902\u0917" : "Packing" },
        { key: "OUT_FOR_DELIVERY", label: hi ? "\u0921\u093f\u0932\u093f\u0935\u0930\u0940 \u092a\u0930" : "Out for delivery" },
        { key: "DELIVERED", label: hi ? "\u0921\u093f\u0932\u093f\u0935\u0930\u094d\u0921" : "Delivered" },
      ] as const,
    [hi]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [walletBalancePaise, setWalletBalancePaise] = useState(0);
  const [walletTxns, setWalletTxns] = useState<WalletTxn[]>([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [walletInfo, setWalletInfo] = useState("");
  const [claimTransactionId, setClaimTransactionId] = useState("");
  const [topupRequests] = useState<any[]>([]);

  const t = {
    title: isWalletView ? (hi ? "\u0935\u0949\u0932\u0947\u091f" : "Wallet") : hi ? "\u092e\u0947\u0930\u0947 \u0911\u0930\u094d\u0921\u0930" : "My Orders",
    loginRequired: hi ? "\u0911\u0930\u094d\u0921\u0930 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0932\u0949\u0917\u093f\u0928 \u0915\u0930\u0947\u0902\u0964" : "Login is required to view your orders.",
    goLogin: hi ? "\u0932\u0949\u0917\u093f\u0928 \u0915\u0930\u0947\u0902" : "Go to Login",
    loading: hi ? "\u0932\u094b\u0921 \u0939\u094b \u0930\u0939\u093e \u0939\u0948..." : "Loading...",
    failed: hi ? "\u0911\u0930\u094d\u0921\u0930 \u0932\u094b\u0921 \u0928\u0939\u0940\u0902 \u0939\u0941\u090f" : "Failed to load orders",
    orderId: hi ? "\u0911\u0930\u094d\u0921\u0930 \u0906\u0908\u0921\u0940" : "Order ID",
    tracking: hi ? "\u091f\u094d\u0930\u0948\u0915\u093f\u0902\u0917" : "Tracking",
    openDetails: hi ? "\u0935\u093f\u0935\u0930\u0923 \u0916\u094b\u0932\u0947\u0902" : "Open details",
    noOrders: hi ? "\u0915\u094b\u0908 \u0911\u0930\u094d\u0921\u0930 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u093e\u0964" : "No orders found.",
    signedInAs: hi ? "\u0932\u0949\u0917\u093f\u0928 \u092f\u0942\u091c\u0930\u0928\u0947\u092e" : "Signed in username",
    wallet: hi ? "\u0907\u0928-\u090f\u092a \u0935\u0949\u0932\u0947\u091f" : "In-app Wallet",
    walletBalance: hi ? "\u0935\u0949\u0932\u0947\u091f \u092c\u0948\u0932\u0947\u0902\u0938" : "Wallet balance",
    claimWallet: hi ? "\u091f\u094d\u0930\u093e\u0902\u091c\u0948\u0915\u094d\u0936\u0928 \u0906\u0908\u0921\u0940 \u0938\u0947 \u0935\u0949\u0932\u0947\u091f \u0915\u094d\u0932\u0947\u092e" : "Claim wallet by Transaction ID",
    transactionId: hi ? "\u091f\u094d\u0930\u093e\u0902\u091c\u0948\u0915\u094d\u0936\u0928 \u0906\u0908\u0921\u0940" : "Transaction ID",
    claimNow: hi ? "\u0905\u092d\u0940 \u0915\u094d\u0932\u0947\u092e \u0915\u0930\u0947\u0902" : "Claim Now",
    claimNotice: hi ? "\u092a\u0939\u0932\u0947 \u0939\u092e\u093e\u0930\u0947 UPI \u092a\u0930 \u092a\u0947 \u0915\u0930\u0947\u0902\u0964 \u090f\u0921\u092e\u093f\u0928 \u0906\u092a\u0915\u0940 \u091f\u094d\u0930\u093e\u0902\u091c\u0948\u0915\u094d\u0936\u0928 \u0906\u0908\u0921\u0940 \u090f\u0921 \u0915\u0930\u0947\u0917\u093e\u0964 \u092b\u093f\u0930 \u0938\u093f\u0930\u094d\u092b ID \u0921\u093e\u0932\u0915\u0930 \u0915\u094d\u0932\u0947\u092e \u0915\u0930\u0947\u0902\u0964" : "Pay on our UPI first. Admin adds your transaction ID + amount. Then enter only transaction ID here to claim.",
    topupRequests: hi ? "\u0930\u093f\u0915\u0949\u0930\u094d\u0921\u094d\u0938" : "Records",
    recentTxns: hi ? "\u0939\u093e\u0932 \u0915\u0947 \u0932\u0947\u0928-\u0926\u0947\u0928" : "Recent transactions",
    noTxns: hi ? "\u0905\u092d\u0940 \u0915\u094b\u0908 \u0932\u0947\u0928-\u0926\u0947\u0928 \u0928\u0939\u0940\u0902\u0964" : "No transactions yet.",
    noTopupRequests: hi ? "\u0915\u094b\u0908 \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0928\u0939\u0940\u0902\u0964" : "No records yet.",
  };

  async function loadOrders() {
    if (!isLoggedIn) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders/history", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || t.failed);
        setOrders([]);
        return;
      }
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (e: any) {
      setError(e?.message || t.failed);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadWallet() {
    if (!isLoggedIn) return;
    setWalletLoading(true);
    setWalletError("");
    setWalletInfo("");
    try {
      const res = await fetch("/api/auth/me?includeWallet=1", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.authenticated) {
        setWalletError("Failed to load wallet");
        return;
      }
      const user = data?.user || {};
      setWalletBalancePaise(Number(user?.walletBalancePaise || 0));
      setWalletTxns(Array.isArray(user?.walletTransactions) ? user.walletTransactions : []);
    } catch (e: any) {
      setWalletError(e?.message || "Failed to load wallet");
    } finally {
      setWalletLoading(false);
    }
  }

  async function onClaim() {
    if (!claimTransactionId.trim()) {
      setWalletError("Enter transaction ID");
      return;
    }
    setWalletLoading(true);
    setWalletError("");
    setWalletInfo("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "claim_upi_txn", transactionId: claimTransactionId.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setWalletError(String(data?.error || "Claim failed"));
        return;
      }
      setWalletInfo(String(data?.message || "Wallet credited successfully."));
      setClaimTransactionId("");
      await loadWallet();
    } catch (e: any) {
      setWalletError(e?.message || "Claim failed");
    } finally {
      setWalletLoading(false);
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      if (isWalletView) loadWallet();
      else loadOrders();
    }
  }, [isLoggedIn, isWalletView]);

  if (isAuthLoading) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-3xl rounded-xl border bg-white p-4 text-sm text-gray-600">{t.loading}</div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-3xl rounded-xl border bg-white p-4">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{t.loginRequired}</p>
          <Link href="/login" className="mt-3 inline-flex rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">
            {t.goLogin}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-xl border bg-white p-4">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {t.signedInAs}: <span className="font-medium">@{userUsername}</span>
          </p>
          {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
        </div>

        {isWalletView ? <div id="wallet" className="rounded-xl border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-lg font-semibold">{t.wallet}</div>
            <div className="text-sm text-gray-600">
              {t.walletBalance}: <span className="font-bold">{money(walletBalancePaise)}</span>
            </div>
          </div>

          <div className="mt-3 text-sm font-medium">{t.claimWallet}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              value={claimTransactionId}
              onChange={(e) => setClaimTransactionId(e.target.value)}
              className="w-64 rounded-lg border px-3 py-2 text-sm"
              placeholder={t.transactionId}
            />
            <button
              type="button"
              onClick={onClaim}
              disabled={walletLoading}
              className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {t.claimNow}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-600">{t.claimNotice}</div>

          {walletError ? <div className="mt-2 text-sm text-red-600">{walletError}</div> : null}
          {walletInfo ? <div className="mt-2 text-sm text-green-700">{walletInfo}</div> : null}

          <div className="mt-4">
            <div className="mb-2 text-sm font-semibold">{t.topupRequests}</div>
            {topupRequests.length === 0 ? (
              <div className="text-sm text-gray-600">{t.noTopupRequests}</div>
            ) : (
              <div className="space-y-2">
                {topupRequests.slice(0, 8).map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                    <div>
                      <div className="font-medium">{money(r.amountPaise)} • {r.status}</div>
                      <div className="text-xs text-gray-500">UPI Ref: {r.upiRef}</div>
                    </div>
                    <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="mb-2 text-sm font-semibold">{t.recentTxns}</div>
            {walletTxns.length === 0 ? (
              <div className="text-sm text-gray-600">{walletLoading ? t.loading : t.noTxns}</div>
            ) : (
              <div className="space-y-2">
                {walletTxns.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                    <div>
                      <div className="font-medium">{tx.type}</div>
                      <div className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</div>
                    </div>
                    <div className={`font-semibold ${tx.type === "ORDER_DEBIT" ? "text-red-700" : "text-green-700"}`}>
                      {tx.type === "ORDER_DEBIT" ? "-" : "+"}
                      {money(Math.abs(Number(tx.amountPaise || 0)))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div> : null}

        {!isWalletView ? <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-xl border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-gray-500">{t.orderId}</div>
                  <div className="font-mono text-sm">{o.id}</div>
                </div>
                <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(o.status)}`}>
                  {String(o.status || "PLACED")}
                </div>
              </div>

              <div className="mt-2 text-sm text-gray-700">
                {new Date(o.createdAt).toLocaleString()}
              </div>

              <div className="mt-1 text-sm font-semibold">{money(o.totalAppPaise)}</div>

              {isOpenOrder(o.status) ? (
                <div className="mt-3 rounded-lg border p-3">
                  <div className="mb-2 text-sm font-medium">{t.tracking}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    {ORDER_STEPS.map((step, i) => {
                      const currentIndex = Math.max(
                        0,
                        ORDER_STEPS.findIndex((s) => s.key === String(o.status || "").toUpperCase())
                      );
                      const done = i <= currentIndex;

                      return (
                        <div key={step.key} className="flex min-w-[95px] flex-1 items-center gap-2">
                          <div
                            className={`h-3 w-3 rounded-full border ${
                              done ? "border-green-500 bg-green-500" : "border-neutral-300 bg-white"
                            }`}
                          />
                          <div className={`text-xs ${done ? "text-green-700" : "text-neutral-500"}`}>{step.label}</div>
                          {i !== ORDER_STEPS.length - 1 ? (
                            <div className={`h-[2px] flex-1 ${done ? "bg-green-500" : "bg-neutral-200"}`} />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-3">
                <Link href={`/orders/${o.id}`} className="text-sm text-blue-600 underline">
                  {t.openDetails}
                </Link>
              </div>
            </div>
          ))}

          {!loading && !error && orders.length === 0 ? (
            <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">{t.noOrders}</div>
          ) : null}
        </div> : null}
      </div>
    </main>
  );
}

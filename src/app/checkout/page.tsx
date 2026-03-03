"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { useSettings } from "@/lib/settings";

function money(paise: number) {
  return `Rs ${Math.round((paise || 0) / 100)}`;
}

export default function CheckoutPage() {
  const cart = useCart();
  const { lang, userUsername, userName } = useSettings();
  const hi = lang === "hi";

  const t = {
    checkout: hi ? "??????" : "Checkout",
    backToCart: hi ? "????? ?? ????" : "Back to cart",
    preparing: hi ? "???? ?????? ????? ?? ??? ??..." : "Preparing your checkout...",
    placingTitle: hi ? "???? ????? ????? ?? ??? ??..." : "Your order is getting placed...",
    placingSub: hi ? "????? ?????? ???? ?? ??? ??????? ? ?????" : "Please wait and do not refresh this page.",
    yourCartEmpty: hi ? "???? ????? ???? ???" : "Your cart is empty.",
    missingShop: hi ? "?? ??? ??????? ????" : "Store not available right now.",
    required: hi ? "???, ??? ?? ??? ???? 1 ????? ???" : "Name, Phone, and Address Line 1 are required.",
    serverNoId: hi ? "????? ?? ??? ????? ???? ???? ?????" : "Order created but server did not return an order id.",
    deliveryDetails: hi ? "??????? ?????" : "Delivery details",
    fullName: hi ? "???? ??? *" : "Full name *",
    phone: hi ? "??? ???? *" : "Phone number *",
    line1: hi ? "??? ???? 1 *" : "Address Line 1 *",
    line2: hi ? "??? ???? 2 (????????)" : "Address Line 2 (optional)",
    landmark: hi ? "????????? (????????)" : "Landmark (optional)",
    area: hi ? "????? (????????)" : "Area (optional)",
    notes: hi ? "????? (????????)" : "Notes (optional)",
    savedAddress: hi ? "???? ???? ????" : "Saved address",
    changeAddress: hi ? "????? ??????" : "Change Address",
    saveAddressHint: hi ? "???? ??? ??? ???????? ???? ???? ?????? ???? ????" : "This address will be saved to your account for future orders.",
    wallet: hi ? "??????" : "Wallet",
    walletBalance: hi ? "?????? ???????" : "Wallet balance",
    walletLoginNeed: hi ? "?????? ??? ?????? ????? ?????? ???? ????????" : "Login required for wallet payment.",
    walletLow: hi ? "?????? ??????? ???? ????" : "Insufficient wallet balance.",
    orderSummary: hi ? "????? ??????" : "Order summary",
    addProducts: hi ? "+ ???????? ??????" : "+ Add products",
    subtotal: hi ? "??????" : "Subtotal",
    placeOrder: hi ? "????? ????? ????" : "Place order",
    placing: hi ? "????? ?? ??? ??..." : "Placing...",
    prepareBtn: hi ? "????? ?? ??? ??..." : "Preparing...",
    pleaseWait: hi ? "????? ????? ?????? ?????" : "Preparing checkout. Please wait a moment.",
  };

  const subtotalPaise = useMemo(() => {
    return cart.items.reduce((sum, it) => sum + (it.pricePaise || 0) * (it.qty || 0), 0);
  }, [cart.items]);

  const [name, setName] = useState(userName || "");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [landmark, setLandmark] = useState("");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [showAddressEditor, setShowAddressEditor] = useState(true);

  const [paymentMode, setPaymentMode] = useState<"COD" | "UPI" | "WALLET">("COD");
  const [walletBalancePaise, setWalletBalancePaise] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    if (userName) setName((prev) => prev || userName);
  }, [userName]);

  useEffect(() => {
    try {
      const savedPhone = localStorage.getItem("bb_customer_phone") || "";
      if (savedPhone) setPhone((prev) => prev || savedPhone);
    } catch {}
  }, []);

  useEffect(() => {
    let canceled = false;
    if (!userUsername) return;

    (async () => {
      try {
        const res = await fetch("/api/auth/me?includeWallet=1", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.authenticated || canceled) return;

        const u = data?.user || {};
        const d = u?.defaultAddress || {};
        const savedLine1 = String(d?.line1 || "").trim();
        const savedLine2 = String(d?.line2 || "").trim();
        const savedLandmark = String(d?.landmark || "").trim();
        const savedArea = String(d?.area || "").trim();

        if (String(u?.name || "").trim()) {
          setName((prev) => prev || String(u.name).trim());
        }
        setWalletBalancePaise(Number(u?.walletBalancePaise || 0));

        if (savedLine1) {
          setLine1((prev) => prev || savedLine1);
          setLine2((prev) => prev || savedLine2);
          setLandmark((prev) => prev || savedLandmark);
          setArea((prev) => prev || savedArea);
          setShowAddressEditor(false);
        }
      } catch {}
    })();

    return () => {
      canceled = true;
    };
  }, [userUsername]);

  async function placeOrder() {
    setError("");

    if (!cart.isHydrated) {
      setError(t.pleaseWait);
      return;
    }

    if (cart.items.length === 0) {
      setError(t.yourCartEmpty);
      return;
    }

    if (!name.trim() || !phone.trim() || !line1.trim()) {
      setError(t.required);
      return;
    }
    if (paymentMode === "WALLET" && !userUsername) {
      setError(t.walletLoginNeed);
      return;
    }
    if (paymentMode === "WALLET" && subtotalPaise > walletBalancePaise) {
      setError(t.walletLow);
      return;
    }

    setLoading(true);
    const startedAt = Date.now();

    try {
      const payload = {
        accountUsername: userUsername || undefined,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        deliveryLine1: line1.trim(),
        deliveryLine2: line2.trim() || null,
        landmark: landmark.trim() || null,
        area: area.trim() || null,
        notes: notes.trim() || null,
        paymentMode,
        items: cart.items.map((it) => ({ productId: it.productId, qty: it.qty })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const elapsed = Date.now() - startedAt;
        if (elapsed < 700) await wait(700 - elapsed);
        setError(data?.error || "Server error");
        return;
      }

      const createdId = data?.orderId || data?.id;
      if (!createdId) {
        const elapsed = Date.now() - startedAt;
        if (elapsed < 700) await wait(700 - elapsed);
        setError(t.serverNoId);
        return;
      }

      const elapsed = Date.now() - startedAt;
      if (elapsed < 700) await wait(700 - elapsed);

      try {
        localStorage.setItem("bb_customer_phone", phone.trim());
      } catch {}

      cart.clear();
      window.location.href = `/orders/${createdId}`;
    } catch (e: any) {
      const elapsed = Date.now() - startedAt;
      if (elapsed < 700) await wait(700 - elapsed);
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 text-center shadow-xl">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
            <div className="mt-3 text-base font-semibold">{t.placingTitle}</div>
            <div className="mt-1 text-sm text-gray-600">{t.placingSub}</div>
          </div>
        </div>
      ) : null}

      <header className="mx-auto mb-4 flex max-w-3xl items-center justify-between">
        <h1 className="text-2xl font-bold">{t.checkout}</h1>
        <Link href="/cart" className="text-sm text-blue-600">
          {t.backToCart}
        </Link>
      </header>

      <div className="mx-auto max-w-3xl space-y-4">
        {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {!cart.isHydrated ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span>{t.preparing}</span>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 text-sm font-semibold">{t.deliveryDetails}</div>

          <div className="grid gap-3">
            <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder={t.fullName} value={name} onChange={(e) => setName(e.target.value)} />
            <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder={t.phone} value={phone} onChange={(e) => setPhone(e.target.value)} />
            {!showAddressEditor && line1 ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
                <div className="mb-1 font-semibold text-emerald-800">{t.savedAddress}</div>
                <div className="text-gray-800">{line1}</div>
                {line2 ? <div className="text-gray-700">{line2}</div> : null}
                {landmark || area ? <div className="text-gray-700">{[landmark, area].filter(Boolean).join(", ")}</div> : null}
                <button
                  type="button"
                  className="mt-2 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700"
                  onClick={() => setShowAddressEditor(true)}
                >
                  {t.changeAddress}
                </button>
              </div>
            ) : (
              <>
                <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder={t.line1} value={line1} onChange={(e) => setLine1(e.target.value)} />
                <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder={t.line2} value={line2} onChange={(e) => setLine2(e.target.value)} />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder={t.landmark} value={landmark} onChange={(e) => setLandmark(e.target.value)} />
                  <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder={t.area} value={area} onChange={(e) => setArea(e.target.value)} />
                </div>
                {userUsername ? <div className="text-xs text-gray-500">{t.saveAddressHint}</div> : null}
              </>
            )}
            <textarea className="w-full rounded-lg border px-3 py-2 text-sm" placeholder={t.notes} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />

            <div className="mt-2 grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setPaymentMode("COD")} className={`rounded-lg border px-3 py-2 text-sm ${paymentMode === "COD" ? "bg-black text-white" : "bg-white"}`}>
                COD
              </button>
              <button type="button" onClick={() => setPaymentMode("UPI")} className={`rounded-lg border px-3 py-2 text-sm ${paymentMode === "UPI" ? "bg-black text-white" : "bg-white"}`}>
                UPI
              </button>
              <button type="button" onClick={() => setPaymentMode("WALLET")} className={`rounded-lg border px-3 py-2 text-sm ${paymentMode === "WALLET" ? "bg-black text-white" : "bg-white"}`}>
                {t.wallet}
              </button>
            </div>
            {userUsername ? (
              <div className="text-xs text-gray-600">
                {t.walletBalance}: <span className="font-semibold">{money(walletBalancePaise)}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="text-sm font-semibold">{t.orderSummary}</div>
            <Link href="/search" className="rounded-lg border px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50">
              {t.addProducts}
            </Link>
          </div>

          <div className="grid gap-2 text-sm">
            {cart.items.map((it) => (
              <div key={it.productId} className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-gray-700">
                  <div className="truncate">{it.name}</div>
                  <div className="mt-1 inline-flex items-center gap-1">
                    <button
                      type="button"
                      className="h-7 w-7 rounded-md border text-base"
                      onClick={() => {
                        const next = (it.qty || 1) - 1;
                        if (next <= 0) cart.removeItem(it.productId);
                        else cart.setQty(it.productId, next);
                      }}
                    >
                      -
                    </button>
                    <span className="min-w-6 text-center text-xs font-medium">{it.qty}</span>
                    <button type="button" className="h-7 w-7 rounded-md border text-base" onClick={() => cart.setQty(it.productId, (it.qty || 0) + 1)}>
                      +
                    </button>
                  </div>
                </div>
                <div className="font-semibold">{money(it.pricePaise * it.qty)}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
            <span className="text-gray-600">{t.subtotal}</span>
            <span className="font-bold">{money(subtotalPaise)}</span>
          </div>

          <button disabled={loading || !cart.isHydrated} onClick={placeOrder} className="mt-4 w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {!cart.isHydrated ? t.prepareBtn : loading ? t.placing : t.placeOrder}
          </button>
        </div>
      </div>
    </main>
  );
}


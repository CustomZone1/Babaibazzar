import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth-server";
import { saveLocalAccountDefaultAddress } from "@/lib/local-auth-db";
import { chargeWalletForOrder } from "@/lib/wallet-db";
import { getPrimaryStore } from "@/lib/store";

type Body = {
  accountUsername?: string;
  customerName: string;
  customerPhone: string;
  deliveryLine1: string;
  deliveryLine2?: string | null;
  landmark?: string | null;
  area?: string | null;
  notes?: string | null;
  paymentMode?: "COD" | "UPI" | "WALLET";
  items: Array<{ productId: string; qty: number }>;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    const store = await getPrimaryStore();
    if (!store) {
      return NextResponse.json({ error: "Store is not configured yet." }, { status: 500 });
    }

    const customerName = String(body?.customerName || "").trim();
    if (!customerName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const customerPhone = String(body?.customerPhone || "").trim();
    if (!customerPhone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }

    const deliveryLine1 = String(body?.deliveryLine1 || "").trim();
    if (!deliveryLine1) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const rawItems = Array.isArray(body?.items) ? body.items : [];
    const items = rawItems
      .map((it) => ({
        productId: String(it?.productId || "").trim(),
        qty: Number(it?.qty || 0),
      }))
      .filter((it) => it.productId && Number.isFinite(it.qty) && it.qty > 0);

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const productIds = items.map((i) => i.productId);

    // NOTE: support both schemas (with/without isActive)
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        shopId: store.id,
        inStock: true,
      },
      select: {
        id: true,
        inStock: true,
        shopPricePaise: true,
        appPricePaise: true,
        // @ts-ignore
        isActive: true,
      },
    });

    const map = new Map(products.map((p) => [p.id, p]));

    for (const it of items) {
      const p: any = map.get(it.productId);
      if (!p) {
        return NextResponse.json({ error: `Product not available: ${it.productId}` }, { status: 400 });
      }
      if (!p.inStock) {
        return NextResponse.json({ error: "Out of stock product in cart" }, { status: 400 });
      }
      if (typeof p.isActive === "boolean" && p.isActive === false) {
        return NextResponse.json({ error: "Inactive product in cart" }, { status: 400 });
      }
    }

    let subtotalAppPaise = 0;
    let subtotalShopPaise = 0;

    const orderItems = items.map((it) => {
      const p: any = map.get(it.productId);

      const lineAppTotalPaise = p.appPricePaise * it.qty;
      const lineShopTotalPaise = p.shopPricePaise * it.qty;

      subtotalAppPaise += lineAppTotalPaise;
      subtotalShopPaise += lineShopTotalPaise;

      return {
        productId: p.id,
        qty: it.qty,
        appPricePaise: p.appPricePaise,
        shopPricePaise: p.shopPricePaise,
        lineAppTotalPaise,
        lineShopTotalPaise,
      };
    });

    const deliveryFeePaise = 0;
    const totalAppPaise = subtotalAppPaise + deliveryFeePaise;
    const marginPaise = subtotalAppPaise - subtotalShopPaise;

    const accountUsername = String(body?.accountUsername || "").trim().toLowerCase();
    const paymentMode = body.paymentMode === "UPI" ? "UPI" : body.paymentMode === "WALLET" ? "WALLET" : "COD";
    if (paymentMode === "WALLET") {
      const session = getSessionFromRequest(req);
      if (!session) {
        return NextResponse.json({ error: "Login required for wallet payment." }, { status: 401 });
      }
      if (!accountUsername || accountUsername !== session.username) {
        return NextResponse.json({ error: "Wallet payment user mismatch." }, { status: 400 });
      }
    }
    const existingNotes = body.notes?.trim() || null;
    const taggedNotes = accountUsername
      ? `${existingNotes ? `${existingNotes} ` : ""}[user:${accountUsername}]`
      : existingNotes;

    const created = await prisma.order.create({
      data: {
        shopId: store.id,
        status: "PLACED",

        customerName,
        customerPhone,
        deliveryLine1,
        deliveryLine2: body.deliveryLine2?.trim() || null,
        landmark: body.landmark?.trim() || null,
        area: body.area?.trim() || null,
        notes: taggedNotes,

        paymentMode,

        deliveryFeePaise,
        subtotalAppPaise,
        totalAppPaise,
        subtotalShopPaise,
        marginPaise,

        items: { create: orderItems },
      },
      select: { id: true },
    });

    // ✅ return BOTH keys so old frontends also work
    if (paymentMode === "WALLET" && accountUsername) {
      try {
        await chargeWalletForOrder({
          username: accountUsername,
          orderId: created.id,
          amountPaise: totalAppPaise,
          note: "Order payment",
        });
      } catch (e: any) {
        await prisma.order.delete({ where: { id: created.id } }).catch(() => null);
        return NextResponse.json({ error: e?.message || "Wallet payment failed." }, { status: 400 });
      }
    }
    if (accountUsername) {
      await saveLocalAccountDefaultAddress(accountUsername, {
        line1: deliveryLine1,
        line2: body.deliveryLine2?.trim() || null,
        landmark: body.landmark?.trim() || null,
        area: body.area?.trim() || null,
      });
    }
    return NextResponse.json({ orderId: created.id, id: created.id }, { status: 200 });
  } catch (e: any) {
    console.error("CREATE ORDER ERROR:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

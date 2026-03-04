import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function requireAdmin(req: NextRequest) {
  return req.cookies.get("bb_admin")?.value === "1";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;
    const body = await req.json().catch(() => ({}));

    const data: Record<string, unknown> = {};

    if (typeof body?.name === "string") {
      const name = body.name.trim();
      if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      data.name = name;
    }

    if ("category" in body) {
      data.category = body?.category ? String(body.category).trim() : null;
    }

    if ("unit" in body) {
      data.unit = body?.unit ? String(body.unit).trim() : null;
    }

    if ("imageUrl" in body) {
      data.imageUrl = body?.imageUrl ? String(body.imageUrl).trim() : null;
    }

    if (typeof body?.inStock === "boolean") {
      data.inStock = body.inStock;
    }

    if (typeof body?.isActive === "boolean") {
      data.isActive = body.isActive;
    }

    if (typeof body?.showInTrending === "boolean") {
      data.showInTrending = body.showInTrending;
    }

    if (typeof body?.showInNewArrivals === "boolean") {
      data.showInNewArrivals = body.showInNewArrivals;
    }

    if ("shopPricePaise" in body) {
      const v = Number(body.shopPricePaise);
      if (!Number.isFinite(v) || v <= 0) {
        return NextResponse.json({ error: "Invalid shop price" }, { status: 400 });
      }
      data.shopPricePaise = Math.round(v);
    }

    if ("appPricePaise" in body) {
      const v = Number(body.appPricePaise);
      if (!Number.isFinite(v) || v <= 0) {
        return NextResponse.json({ error: "Invalid app price" }, { status: 400 });
      }
      data.appPricePaise = Math.round(v);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data,
      select: {
        id: true,
        name: true,
        category: true,
        unit: true,
        imageUrl: true,
        inStock: true,
        isActive: true,
        showInTrending: true,
        showInNewArrivals: true,
        shopPricePaise: true,
        appPricePaise: true,
      },
    });

    return NextResponse.json({ product: updated });
  } catch (e: any) {
    console.error("UPDATE PRODUCT ERROR:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

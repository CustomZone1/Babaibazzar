import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function requireAdmin(req: NextRequest) {
  return req.cookies.get("bb_admin")?.value === "1";
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ shopId: string }> }
) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shopId } = await ctx.params;

    // If you added soft delete (isActive), show only active products
    const products = await prisma.product.findMany({
      where: { shopId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (e: any) {
    console.error("PRODUCTS GET ERROR:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ shopId: string }> }
) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shopId } = await ctx.params;

    const body = await req.json();

    const name = String(body?.name || "").trim();
    const category = body?.category ? String(body.category).trim() : null;
    const unit = body?.unit ? String(body.unit).trim() : null;
    const imageUrl = body?.imageUrl ? String(body.imageUrl).trim() : null;

    const inStock = Boolean(body?.inStock);
    const showInTrending = Boolean(body?.showInTrending);
    const showInNewArrivals = Boolean(body?.showInNewArrivals);
    const shopPricePaise = Number(body?.shopPricePaise);
    const appPricePaise = Number(body?.appPricePaise);

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!Number.isFinite(shopPricePaise) || shopPricePaise <= 0) {
      return NextResponse.json(
        { error: "Shop price must be > 0" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(appPricePaise) || appPricePaise <= 0) {
      return NextResponse.json(
        { error: "App price must be > 0" },
        { status: 400 }
      );
    }

    // Ensure shop exists
    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const created = await prisma.product.create({
      data: {
        shopId,
        name,
        category,
        unit,
        imageUrl,
        inStock,
        showInTrending,
        showInNewArrivals,
        shopPricePaise,
        appPricePaise,

        // If you added soft-delete field
        isActive: true,
      },
    });

    return NextResponse.json({ product: created }, { status: 201 });
  } catch (e: any) {
    console.error("PRODUCTS POST ERROR:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

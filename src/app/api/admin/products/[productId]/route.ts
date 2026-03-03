import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const body = await req.json();

    const {
      name,
      category,
      unit,
      imageUrl,
      inStock,
      showInTrending,
      showInNewArrivals,
      shopPricePaise,
      appPricePaise,
    } = body;

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        category: category || null,
        unit: unit || null,
        imageUrl: imageUrl || null,
        inStock: Boolean(inStock),
        showInTrending: Boolean(showInTrending),
        showInNewArrivals: Boolean(showInNewArrivals),
        shopPricePaise: Number(shopPricePaise),
        appPricePaise: Number(appPricePaise),
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("UPDATE PRODUCT ERROR:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

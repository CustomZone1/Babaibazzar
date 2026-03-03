import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PACKING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

const OPTIONS: OrderStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PACKING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const isAuthed = req.cookies.get("bb_admin")?.value === "1";
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const nextStatus = body?.status as OrderStatus;

    if (!OPTIONS.includes(nextStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
    });

    return NextResponse.json({ success: true, status: updated.status });
  } catch (err: any) {
    console.error("STATUS UPDATE ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

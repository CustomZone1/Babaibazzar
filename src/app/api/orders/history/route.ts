import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: { notes: { contains: `[user:${session.username}]` } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        status: true,
        totalAppPaise: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (e: any) {
    console.error("ORDER HISTORY ERROR:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

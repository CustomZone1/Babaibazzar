import { NextRequest, NextResponse } from "next/server";
import { createAdminUpiCredit, listAdminUpiCredits } from "@/lib/wallet-db";

export async function GET() {
  try {
    const credits = await listAdminUpiCredits(120);
    return NextResponse.json({ credits }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "").trim().toLowerCase();

    if (action !== "create_upi_credit") {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const transactionId = String(body?.transactionId || "").trim();
    const amountRupees = Number(body?.amountRupees || 0);
    const amountPaise = Math.round(amountRupees * 100);
    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required." }, { status: 400 });
    }
    if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
      return NextResponse.json({ error: "Valid amount is required." }, { status: 400 });
    }

    const created = await createAdminUpiCredit({
      transactionId,
      amountPaise,
      createdByAdmin: "admin",
    });
    return NextResponse.json({ ok: true, credit: created }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 400 });
  }
}


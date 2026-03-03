import { NextResponse } from "next/server";
import { createOtp, isPhoneValid, normalizePhone } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone = normalizePhone(String(body?.phone || ""));
    const name = String(body?.name || "").trim();

    if (!isPhoneValid(phone)) {
      return NextResponse.json({ error: "Valid phone is required." }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const otp = createOtp(phone, name);

    // Mock mode for now. Integrate SMS provider here for production.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV OTP] ${phone}: ${otp}`);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

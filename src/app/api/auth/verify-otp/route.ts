import { NextResponse } from "next/server";
import { createSession, isPhoneValid, normalizePhone, setSessionCookie, verifyOtp } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone = normalizePhone(String(body?.phone || ""));
    const otp = String(body?.otp || "").trim();

    if (!isPhoneValid(phone)) {
      return NextResponse.json({ error: "Valid phone is required." }, { status: 400 });
    }
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "Valid 6-digit OTP is required." }, { status: 400 });
    }

    const checked = verifyOtp(phone, otp);
    if (!checked.ok) {
      return NextResponse.json({ error: checked.error }, { status: 401 });
    }

    const token = createSession(phone, checked.name);
    const res = NextResponse.json(
      {
        ok: true,
        user: { name: checked.name, phone },
      },
      { status: 200 }
    );
    setSessionCookie(res, token);
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

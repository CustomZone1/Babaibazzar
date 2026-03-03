import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const pass = body?.pass;
  const expected = process.env.ADMIN_PASS || process.env.ADMIN_PASSCODE;

  if (!pass) {
    return NextResponse.json({ error: "Passcode required" }, { status: 400 });
  }

  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSCODE not set in .env" },
      { status: 500 }
    );
  }

  if (pass !== expected) {
    return NextResponse.json({ error: "Wrong passcode" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  // simple cookie-based session
  res.cookies.set("admin_session", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}

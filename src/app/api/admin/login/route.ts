import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { passcode } = await req.json();

    const expected = process.env.ADMIN_PASSCODE;
    if (!expected) {
      return NextResponse.json(
        { error: "ADMIN_PASSCODE missing in .env" },
        { status: 500 }
      );
    }

    if (String(passcode || "") !== String(expected)) {
      return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });

    // cookie used by middleware + API
    res.cookies.set("bb_admin", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (e: any) {
    console.error("LOGIN API ERROR:", e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth-server";
import { loginLocalAccount } from "@/lib/local-auth-db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");

    const user = await loginLocalAccount(username, password);
    const token = createSession(user.username, user.name);

    const res = NextResponse.json(
      { ok: true, user: { name: user.name, username: user.username } },
      { status: 200 }
    );
    setSessionCookie(res, token);
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 401 });
  }
}

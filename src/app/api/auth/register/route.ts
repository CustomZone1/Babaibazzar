import { NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth-server";
import { registerLocalAccount, suggestAvailableUsernames } from "@/lib/local-auth-db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const firstName = String(body?.firstName || "").trim();
  const lastName = String(body?.lastName || "").trim();
  const name = String(body?.name || "").trim() || `${firstName} ${lastName}`.trim();
  const username = String(body?.username || "").trim();
  const password = String(body?.password || "");

  try {
    const user = await registerLocalAccount(name, username, password);
    const token = createSession(user.username, user.name);

    const res = NextResponse.json(
      { ok: true, user: { name: user.name, username: user.username } },
      { status: 200 }
    );
    setSessionCookie(res, token);
    return res;
  } catch (e: any) {
    const msg = String(e?.message || "Server error");
    if (msg.toLowerCase().includes("username already taken")) {
      const suggestions = await suggestAvailableUsernames(firstName, lastName);
      return NextResponse.json({ error: "Username already taken.", suggestions }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

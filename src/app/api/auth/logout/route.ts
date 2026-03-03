import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, destroySession, getSessionFromRequest } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (session) destroySession(session.token);

  const res = NextResponse.json({ ok: true }, { status: 200 });
  clearSessionCookie(res);
  return res;
}

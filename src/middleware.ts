import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Allow login page + login API without auth
  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  // ✅ must match login API cookie name
  const authed = req.cookies.get("bb_admin")?.value === "1";

  if (!authed) {
    // If it's an API call, return 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Else redirect to login page
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname.replace(/^\/admin/, "/admin"));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

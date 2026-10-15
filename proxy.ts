import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession, nextProxyCookies } from "iron-session";
import { sessionOptions, type SiteSession } from "@/lib/site-auth";

// Gates the whole site behind SITE_PASSWORD. Visitors without a valid session are sent to /login, and API requests
// get a 401 instead of a redirect.
export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SiteSession>(nextProxyCookies(request, response), sessionOptions());
  if (session.authed) {
    return response;
  }
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Your session has expired. Please reload the page and sign in again." },
      { status: 401 },
    );
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Everything except the login page itself and the assets it needs to render.
  matcher: ["/((?!login|_next/static|_next/image|icon.svg|favicon.ico).*)"],
};

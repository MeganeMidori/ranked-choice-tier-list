import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

// Shared by proxy.ts and the login action. The session lives in a cookie that iron-session encrypts and signs with
// SESSION_SECRET, so visitors can neither read nor forge it.

export type SiteSession = { authed: boolean };

export function sessionOptions(): SessionOptions {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  return {
    cookieName: "site_auth",
    password: secret,
    ttl: 60 * 60 * 24 * 30,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

// For route handlers and server actions. proxy.ts already turns away requests without a session, but checking again
// where the data is written means a mistake in its matcher can't open things up.
export async function isSignedIn(): Promise<boolean> {
  const session = await getIronSession<SiteSession>(await cookies(), sessionOptions());
  return session.authed === true;
}

export function isSitePassword(attempt: string): boolean {
  const password = process.env.SITE_PASSWORD;
  if (!password) {
    console.error("SITE_PASSWORD is not set, so nobody can log in.");
    return false;
  }
  // timingSafeEqual needs equal-length inputs, so compare digests rather than the raw strings.
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(attempt), digest(password));
}

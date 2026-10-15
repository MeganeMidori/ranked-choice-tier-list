"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { isSitePassword, sessionOptions, type SiteSession } from "@/lib/site-auth";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const attempt = formData.get("password");
  if (typeof attempt !== "string" || !isSitePassword(attempt)) {
    return "Incorrect password.";
  }

  const session = await getIronSession<SiteSession>(await cookies(), sessionOptions());
  session.authed = true;
  await session.save();
  redirect("/");
}

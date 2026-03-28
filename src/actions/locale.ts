"use server";

import { cookies } from "next/headers";
import { locales, type Locale } from "@/i18n/request";

export async function setLocale(locale: string): Promise<void> {
  if (!locales.includes(locale as Locale)) return;
  (cookies() as unknown as { set: (k: string, v: string, opts: object) => void }).set(
    "NEXT_LOCALE",
    locale,
    { path: "/", maxAge: 365 * 24 * 60 * 60, sameSite: "lax" }
  );
}

import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const locales = ["cs", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "cs";

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const raw = (cookieStore as unknown as { get: (k: string) => { value: string } | undefined }).get("NEXT_LOCALE")?.value;
  const locale: Locale = locales.includes(raw as Locale) ? (raw as Locale) : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default as Record<string, unknown>,
  };
});

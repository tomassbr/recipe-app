import { SUPABASE_ANON_KEY } from "@/lib/supabase/middleware-env";

/**
 * Prohlížeč při GET na /auth/v1/authorize neposílá hlavičku `apikey`.
 * Hosted GoTrue často vyžaduje `apikey` v query — bez něj může být odpověď 400.
 */
export function withApiKeyOnAuthorizeUrl(authorizeUrl: string): string {
  try {
    const u = new URL(authorizeUrl);
    const path = u.pathname;
    if (!path.includes("/authorize")) return authorizeUrl;
    if (!u.hostname.includes("supabase.co")) return authorizeUrl;
    if (!SUPABASE_ANON_KEY) return authorizeUrl;
    if (!u.searchParams.has("apikey")) {
      u.searchParams.set("apikey", SUPABASE_ANON_KEY);
    }
    return u.toString();
  } catch {
    return authorizeUrl;
  }
}

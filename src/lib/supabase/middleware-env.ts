/**
 * Veřejné Supabase URL + anon klíč (middleware, server routes, browser).
 *
 * V `.env.local` použij `NEXT_PUBLIC_SUPABASE_ANON_KEY` z Dashboard → API:
 * buď **Legacy anon** (`eyJ…`), nebo **publishable** (`sb_publishable_…`).
 * Při problémech s OAuth zkus nejdřív legacy JWT anon klíč.
 *
 * URL fallback jen kvůli Edge dev; klíč v kódu neukládáme — musí být v env
 * (next.config `env` ho inlinuje z .env.local při buildu).
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://osbkmhmeadvdvfbtdnyg.supabase.co";

// `|| ""` — bez env spadne createClient s jasnou chybou; neembedovat tajné klíče.
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

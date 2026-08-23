import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Keeps Supabase project alive (free tier pauses after 1 week of inactivity).
// Called by Vercel Cron — see vercel.json. Runs a real table query so the
// activity definitely registers on Supabase's side (a bare /rest/v1/ ping
// only serves the cached OpenAPI schema and may not count).
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ status: "error", reason: "missing env" }, { status: 500 });
  }

  try {
    const res = await fetch(`${url}/rest/v1/recipes?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      Sentry.captureMessage("supabase keep-alive failed", {
        level: "error",
        extra: { supabaseStatus: res.status },
      });
      return NextResponse.json({ status: "error", supabase: res.status }, { status: 502 });
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    Sentry.captureMessage("supabase keep-alive failed", {
      level: "error",
      extra: { reason: err instanceof Error ? err.message : String(err) },
    });
    return NextResponse.json({ status: "error", reason: "timeout" }, { status: 504 });
  }
}

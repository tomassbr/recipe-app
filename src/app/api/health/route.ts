import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Keeps Supabase project alive (free tier pauses after 1 week of inactivity).
// Called by Vercel Cron — see vercel.json.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ status: "error", reason: "missing env" }, { status: 500 });
  }

  try {
    const res = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ status: "error", supabase: res.status }, { status: 502 });
    }

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error", reason: "timeout" }, { status: 504 });
  }
}

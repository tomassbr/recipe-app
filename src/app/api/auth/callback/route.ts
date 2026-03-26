import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/middleware-env";

const OAUTH_NEXT_COOKIE = "pastrycalc-oauth-next";

function safeRelativePath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const cookieStore = cookies();

  const nextFromQuery = searchParams.get("next");
  const nextFromCookie = cookieStore.get(OAUTH_NEXT_COOKIE)?.value;
  let nextPath = "/";
  if (nextFromQuery) {
    try {
      nextPath = safeRelativePath(decodeURIComponent(nextFromQuery));
    } catch {
      nextPath = "/";
    }
  } else if (nextFromCookie) {
    try {
      nextPath = safeRelativePath(decodeURIComponent(nextFromCookie));
    } catch {
      nextPath = "/";
    }
  }

  if (code) {
    const supabase = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${nextPath}`);
      response.cookies.set(OAUTH_NEXT_COOKIE, "", {
        path: "/",
        maxAge: 0,
      });
      return response;
    }
  }

  const fail = NextResponse.redirect(`${origin}/login?error=auth`);
  fail.cookies.set(OAUTH_NEXT_COOKIE, "", { path: "/", maxAge: 0 });
  return fail;
}

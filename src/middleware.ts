import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
} from "@/lib/supabase/middleware-env";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value, cookie);
  });
}

function isPublicPath(pathname: string) {
  if (pathname === "/login") return true;
  if (pathname === "/api/health") return true;
  if (pathname.startsWith("/api/auth/callback")) return true;
  return false;
}

/**
 * Decodes the JWT payload without signature verification.
 * Safe for routing decisions — actual data access is protected by Supabase RLS.
 * Claims are injected by custom_access_token_hook (see migration).
 */
function decodeJwtClaims(token: string): Record<string, unknown> {
  try {
    const payload = token.split(".")[1];
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // getSession reads the JWT cookie locally — no network call.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  if (!session) {
    if (!isPublicPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      const redirect = NextResponse.redirect(url);
      copyCookies(supabaseResponse, redirect);
      return redirect;
    }
    return supabaseResponse;
  }

  // Authenticated — read role/approved from JWT claims (no DB query).
  const claims = decodeJwtClaims(session.access_token);
  const isApproved = claims.user_approved === true;
  const isAdmin = claims.user_role === "admin";

  if (pathname === "/login") {
    const redirect = NextResponse.redirect(new URL("/", request.url));
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  if (!isApproved && pathname !== "/pending") {
    const redirect = NextResponse.redirect(new URL("/pending", request.url));
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  if (isApproved && pathname === "/pending") {
    const redirect = NextResponse.redirect(new URL("/", request.url));
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  if (pathname.startsWith("/admin") && !isAdmin) {
    const redirect = NextResponse.redirect(new URL("/", request.url));
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

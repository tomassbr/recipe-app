import fs from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const { loadEnvConfig } = nextEnv;

const projectDir = process.cwd();

/** Ruční parsování .env.local — záloha, když loadEnvConfig vrátí prázdné hodnoty. */
function parseEnvLocalFile() {
  const envPath = path.join(projectDir, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let value = t.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const { combinedEnv } = loadEnvConfig(
  projectDir,
  process.env.NODE_ENV !== "production"
);

const fileEnv = parseEnvLocalFile();

const supabaseUrl =
  combinedEnv.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  fileEnv.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  combinedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Build the Supabase origin for CSP connect-src
const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";
const supabaseWsOrigin = supabaseOrigin
  ? supabaseOrigin.replace(/^https/, "wss")
  : "";

function buildCsp(isDev) {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline'";
  const connectSrc = [
    "'self'",
    supabaseOrigin,
    supabaseWsOrigin,
    "https://accounts.google.com",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `connect-src ${connectSrc}`,
    "img-src 'self' data: blob: https://*.googleusercontent.com",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src https://accounts.google.com",
    "frame-ancestors 'none'",
    "form-action 'self' https://accounts.google.com",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const csp = buildCsp(process.env.NODE_ENV === "development");
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  ...(supabaseUrl && supabaseAnonKey
    ? {
        env: {
          NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
        },
      }
    : {}),
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  // Disable automatic instrumentation that would cause build errors without SENTRY_AUTH_TOKEN
  autoInstrumentServerFunctions: false,
  autoInstrumentMiddleware: false,
});

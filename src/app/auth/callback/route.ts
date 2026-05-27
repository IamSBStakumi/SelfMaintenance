import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server";

const DEFAULT_REDIRECT_PATH = "/dashboard";
const AUTH_CODE_ERROR_PATH = "/auth/auth-code-error";
const LOCALHOST_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const SAFE_RELATIVE_PATH_PATTERN = /^\/(?![/\\])/;

function normalizeOrigin(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(
      value.startsWith("http://") || value.startsWith("https://")
        ? value
        : `https://${value}`,
    );

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

function getAllowedRedirectOrigins() {
  return [
    process.env.APP_ORIGIN,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL,
    process.env.ALLOWED_REDIRECT_ORIGINS,
  ]
    .flatMap((value) => value?.split(",") ?? [])
    .map((value) => normalizeOrigin(value.trim()))
    .filter((origin): origin is string => origin !== null);
}

function isLocalOrigin(origin: string) {
  try {
    return LOCALHOST_HOSTNAMES.has(new URL(origin).hostname);
  } catch {
    return false;
  }
}

export function resolveRedirectOrigin(requestOrigin: string) {
  const allowedOrigins = getAllowedRedirectOrigins();

  if (allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  if (process.env.NODE_ENV === "development" && isLocalOrigin(requestOrigin)) {
    return requestOrigin;
  }

  return allowedOrigins[0] ?? requestOrigin;
}

export function resolveRedirectPath(next: string | null) {
  if (!next || !SAFE_RELATIVE_PATH_PATTERN.test(next)) {
    return DEFAULT_REDIRECT_PATH;
  }

  try {
    const url = new URL(next, "https://example.com");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_REDIRECT_PATH;
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectOrigin = resolveRedirectOrigin(origin);
  const next = resolveRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, redirectOrigin));
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL(AUTH_CODE_ERROR_PATH, redirectOrigin));
}

import { NextRequest, NextResponse } from "next/server";
import { createSpotifyAuthorizationUrl } from "@/lib/spotify-auth";
import {
  SPOTIFY_STATE_COOKIE,
  createState,
  getStateCookieOptions
} from "@/lib/session";

export const runtime = "nodejs";

function redirectWithAuthError(request: NextRequest, error: string) {
  const redirectUrl = new URL("/", request.nextUrl.origin);
  redirectUrl.searchParams.set("auth_error", error);

  return NextResponse.redirect(redirectUrl);
}

export function GET(request: NextRequest) {
  try {
    const state = createState();
    const response = NextResponse.redirect(createSpotifyAuthorizationUrl(state));

    response.cookies.set(SPOTIFY_STATE_COOKIE, state, getStateCookieOptions());

    return response;
  } catch {
    return redirectWithAuthError(request, "missing_spotify_configuration");
  }
}

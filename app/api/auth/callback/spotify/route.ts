import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/env";
import { exchangeSpotifyCode } from "@/lib/spotify-auth";
import {
  SPOTIFY_SESSION_COOKIE,
  SPOTIFY_STATE_COOKIE,
  encodeSession,
  getSessionCookieOptions
} from "@/lib/session";

export const runtime = "nodejs";

function redirectWithError(error: string) {
  const redirectUrl = new URL("/", getBaseUrl());
  redirectUrl.searchParams.set("auth_error", error);

  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");
  const spotifyError = request.nextUrl.searchParams.get("error");
  const expectedState = request.cookies.get(SPOTIFY_STATE_COOKIE)?.value;

  if (spotifyError) {
    return redirectWithError(spotifyError);
  }

  if (!code) {
    return redirectWithError("missing_code");
  }

  if (!returnedState || !expectedState || returnedState !== expectedState) {
    return redirectWithError("invalid_state");
  }

  try {
    const session = await exchangeSpotifyCode(code);
    const response = NextResponse.redirect(new URL("/dashboard", getBaseUrl()));

    response.cookies.delete(SPOTIFY_STATE_COOKIE);
    response.cookies.set(
      SPOTIFY_SESSION_COOKIE,
      encodeSession(session),
      getSessionCookieOptions()
    );

    return response;
  } catch {
    return redirectWithError("token_exchange_failed");
  }
}

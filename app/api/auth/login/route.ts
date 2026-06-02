import { NextResponse } from "next/server";
import { createSpotifyAuthorizationUrl } from "@/lib/spotify-auth";
import {
  SPOTIFY_STATE_COOKIE,
  createState,
  getStateCookieOptions
} from "@/lib/session";

export const runtime = "nodejs";

export function GET() {
  try {
    const state = createState();
    const response = NextResponse.redirect(createSpotifyAuthorizationUrl(state));

    response.cookies.set(SPOTIFY_STATE_COOKIE, state, getStateCookieOptions());

    return response;
  } catch (error) {
    const redirectUrl = new URL(
      "/?auth_error=missing_spotify_configuration",
      "http://127.0.0.1:3000"
    );

    return NextResponse.redirect(redirectUrl);
  }
}

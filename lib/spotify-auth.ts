import { getSpotifyCredentials, getSpotifyRedirectUri } from "@/lib/env";
import type { SpotifySession } from "@/lib/session";

const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
const SPOTIFY_SCOPES = ["user-read-private", "user-read-email", "user-top-read"];

type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
};

type SpotifyErrorResponse = {
  error: string;
  error_description?: string;
};

export function createSpotifyAuthorizationUrl(state: string) {
  const { clientId } = getSpotifyCredentials();
  const url = new URL("/authorize", SPOTIFY_ACCOUNTS_URL);

  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", getSpotifyRedirectUri());
  url.searchParams.set("scope", SPOTIFY_SCOPES.join(" "));
  url.searchParams.set("state", state);
  url.searchParams.set("show_dialog", "true");

  return url;
}

export async function exchangeSpotifyCode(code: string): Promise<SpotifySession> {
  const { clientId, clientSecret } = getSpotifyCredentials();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${SPOTIFY_ACCOUNTS_URL}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getSpotifyRedirectUri()
    }),
    cache: "no-store"
  });

  const payload = (await response.json()) as SpotifyTokenResponse | SpotifyErrorResponse;

  if (!response.ok || "error" in payload) {
    const message =
      "error_description" in payload && payload.error_description
        ? payload.error_description
        : "Spotify token exchange failed.";

    throw new Error(message);
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
    tokenType: payload.token_type,
    scope: payload.scope
  };
}

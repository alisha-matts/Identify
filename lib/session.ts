import { cookies } from "next/headers";

export const SPOTIFY_SESSION_COOKIE = "identify_spotify_session";
export const SPOTIFY_STATE_COOKIE = "identify_spotify_state";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type SpotifySession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: string;
  scope: string;
};

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/"
} as const;

export function createState() {
  return crypto.randomUUID();
}

export function getStateCookieOptions() {
  return {
    ...baseCookieOptions,
    maxAge: 60 * 10
  };
}

export function getSessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    ...baseCookieOptions,
    maxAge
  };
}

export function encodeSession(session: SpotifySession) {
  return encodeURIComponent(JSON.stringify(session));
}

export function decodeSession(value?: string): SpotifySession | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as SpotifySession;
  } catch {
    return null;
  }
}

export async function getSpotifySession() {
  const cookieStore = await cookies();

  return decodeSession(cookieStore.get(SPOTIFY_SESSION_COOKIE)?.value);
}

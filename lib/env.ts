export const SPOTIFY_REDIRECT_PATH = "/api/auth/callback/spotify";

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function getBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    ? normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL)
    : "";

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL is required.");
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_BASE_URL must be a valid absolute URL.");
  }

  if (parsedUrl.hostname === "localhost") {
    throw new Error("NEXT_PUBLIC_BASE_URL must not use localhost.");
  }

  const isLocalIp = parsedUrl.hostname === "127.0.0.1";
  const isHttps = parsedUrl.protocol === "https:";

  if (!isLocalIp && !isHttps) {
    throw new Error(
      "NEXT_PUBLIC_BASE_URL must be https in production or http://127.0.0.1:3000 locally."
    );
  }

  if (isLocalIp && parsedUrl.origin !== "http://127.0.0.1:3000") {
    throw new Error("Local NEXT_PUBLIC_BASE_URL must be http://127.0.0.1:3000.");
  }

  return baseUrl;
}

export function getSpotifyCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are required.");
  }

  return {
    clientId,
    clientSecret
  };
}

export function getSpotifyRedirectUri() {
  return `${getBaseUrl()}${SPOTIFY_REDIRECT_PATH}`;
}

export function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim();
}

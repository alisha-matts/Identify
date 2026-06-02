import type { SpotifySession } from "@/lib/session";

const SPOTIFY_API_URL = "https://api.spotify.com/v1";
export const SPOTIFY_TOP_READ_SCOPE = "user-top-read";

export const timeframes = ["last-month", "last-6-months", "last-year"] as const;

export type Timeframe = (typeof timeframes)[number];

export const timeframeLabels: Record<Timeframe, string> = {
  "last-month": "Last month",
  "last-6-months": "Last 6 months",
  "last-year": "Last year"
};

export const spotifyTimeRanges: Record<Timeframe, SpotifyTimeRange> = {
  "last-month": "short_term",
  "last-6-months": "medium_term",
  "last-year": "long_term"
};

type SpotifyTimeRange = "short_term" | "medium_term" | "long_term";

type SpotifyImage = {
  height: number | null;
  url: string;
  width: number | null;
};

type SpotifyArtistSummary = {
  id: string;
  name: string;
};

type SpotifyTopTracksResponse = {
  items?: Array<{
    album?: {
      images?: SpotifyImage[];
      name?: string;
    };
    artists?: SpotifyArtistSummary[];
    duration_ms?: number;
    id: string;
    name: string;
    popularity?: number;
    external_urls?: {
      spotify?: string;
    };
  }>;
};

type SpotifyTopArtistsResponse = {
  items?: Array<{
    external_urls?: {
      spotify?: string;
    };
    genres?: string[];
    id: string;
    images?: SpotifyImage[];
    name: string;
    popularity?: number;
  }>;
};

type SpotifyErrorResponse = {
  error?: {
    message?: string;
    status?: number;
  };
};

export class SpotifyApiError extends Error {
  endpoint: string;
  status: number;

  constructor({
    endpoint,
    message,
    status
  }: {
    endpoint: string;
    message: string;
    status: number;
  }) {
    super(message);
    this.name = "SpotifyApiError";
    this.endpoint = endpoint;
    this.status = status;
  }
}

export type TopTrack = {
  albumName: string;
  artistNames: string;
  durationMs: number;
  id: string;
  imageUrl?: string;
  name: string;
  popularity: number;
  spotifyUrl: string;
};

export type TopArtist = {
  genres: string[];
  id: string;
  imageUrl?: string;
  name: string;
  popularity: number;
  spotifyUrl: string;
};

export type SpotifyTopData = {
  artists: TopArtist[];
  tracks: TopTrack[];
};

export function parseTimeframe(value?: string): Timeframe {
  if (value && timeframes.includes(value as Timeframe)) {
    return value as Timeframe;
  }

  if (value === "month" || value === "day") {
    return "last-month";
  }

  if (value === "week") {
    return "last-6-months";
  }

  return "last-month";
}

export function hasTopReadScope(scope: string) {
  return scope.split(/\s+/).includes(SPOTIFY_TOP_READ_SCOPE);
}

function getFirstImageUrl(images?: SpotifyImage[]) {
  return Array.isArray(images) ? images[0]?.url : undefined;
}

function getSpotifyUrl(externalUrls?: { spotify?: string }) {
  return externalUrls?.spotify ?? "https://open.spotify.com";
}

function getArtistNames(artists?: SpotifyArtistSummary[]) {
  const names = artists?.map((artist) => artist.name).filter(Boolean) ?? [];

  return names.length > 0 ? names.join(", ") : "Unknown artist";
}

async function spotifyFetch<T>(
  session: SpotifySession,
  path: string,
  params: Record<string, string>
) {
  const url = new URL(`${SPOTIFY_API_URL}${path}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `${session.tokenType} ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    let message = `Spotify API request failed with status ${response.status}.`;

    try {
      const payload = (await response.json()) as SpotifyErrorResponse;
      message = payload.error?.message ?? message;
    } catch {
      // Keep the status-based message when Spotify does not return JSON.
    }

    throw new SpotifyApiError({
      endpoint: path,
      message,
      status: response.status
    });
  }

  return (await response.json()) as T;
}

export async function getSpotifyTopData(
  session: SpotifySession,
  timeframe: Timeframe
): Promise<SpotifyTopData> {
  const timeRange = spotifyTimeRanges[timeframe];

  const [tracksResponse, artistsResponse] = await Promise.all([
    spotifyFetch<SpotifyTopTracksResponse>(session, "/me/top/tracks", {
      limit: "25",
      time_range: timeRange
    }),
    spotifyFetch<SpotifyTopArtistsResponse>(session, "/me/top/artists", {
      limit: "15",
      time_range: timeRange
    })
  ]);

  return {
    tracks: (tracksResponse.items ?? []).map((track) => ({
      albumName: track.album?.name ?? "Unknown album",
      artistNames: getArtistNames(track.artists),
      durationMs: track.duration_ms ?? 0,
      id: track.id,
      imageUrl: getFirstImageUrl(track.album?.images),
      name: track.name,
      popularity: track.popularity ?? 0,
      spotifyUrl: getSpotifyUrl(track.external_urls)
    })),
    artists: (artistsResponse.items ?? []).map((artist) => ({
      genres: artist.genres?.slice(0, 3) ?? [],
      id: artist.id,
      imageUrl: getFirstImageUrl(artist.images),
      name: artist.name,
      popularity: artist.popularity ?? 0,
      spotifyUrl: getSpotifyUrl(artist.external_urls)
    }))
  };
}

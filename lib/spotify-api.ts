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

export type AudioMetricKey =
  | "energy"
  | "valence"
  | "danceability"
  | "acousticness"
  | "tempo"
  | "instrumentalness";

export type ListeningProfile = Record<AudioMetricKey, number> & {
  analyzedTrackCount: number;
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
  params: Record<string, string>,
  attempt = 0
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

  if (response.status === 429 && attempt < 3) {
    const retryAfterSeconds = Number(response.headers.get("Retry-After") ?? "1");
    const retryAfterMs = Number.isFinite(retryAfterSeconds)
      ? retryAfterSeconds * 1000
      : 1000;
    const backoffMs = Math.max(retryAfterMs, 2 ** attempt * 500);

    await new Promise((resolve) => setTimeout(resolve, backoffMs));

    return spotifyFetch<T>(session, path, params, attempt + 1);
  }

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

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function weightedAverage(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  let total = 0;
  let weightTotal = 0;

  values.forEach((value, index) => {
    const weight = 1 / (index + 1);
    total += value * weight;
    weightTotal += weight;
  });

  return total / weightTotal;
}

function roundedMetric(value: number) {
  return Math.round(value * 100) / 100;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function clampMetric(value: number) {
  return Math.max(0, Math.min(1, roundedMetric(value)));
}

function genreScore(genres: string[], keywords: string[]) {
  if (genres.length === 0) {
    return 0.35;
  }

  const matches = genres.filter((genre) =>
    keywords.some((keyword) => genre.includes(keyword))
  ).length;

  return matches / genres.length;
}

function normalizedTextHash(values: string[]) {
  const text = values.join("|");

  if (!text) {
    return 0.5;
  }

  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 10000;
  }

  return hash / 10000;
}

function uniqueRatio(values: string[]) {
  if (values.length === 0) {
    return 0;
  }

  return new Set(values).size / values.length;
}

function timeframeProfileShift(timeframe: Timeframe) {
  if (timeframe === "last-month") {
    return {
      acousticness: -0.03,
      danceability: 0.04,
      energy: 0.05,
      instrumentalness: -0.01,
      tempo: 5,
      valence: 0.02
    };
  }

  if (timeframe === "last-year") {
    return {
      acousticness: 0.05,
      danceability: -0.02,
      energy: -0.04,
      instrumentalness: 0.03,
      tempo: -4,
      valence: -0.01
    };
  }

  return {
    acousticness: 0,
    danceability: 0,
    energy: 0,
    instrumentalness: 0,
    tempo: 0,
    valence: 0
  };
}

export function getEstimatedListeningProfile(
  data: SpotifyTopData,
  timeframe: Timeframe
): ListeningProfile {
  const genres = data.artists.flatMap((artist) =>
    artist.genres.map((genre) => genre.toLowerCase())
  );
  const trackPopularity = weightedAverage(
    data.tracks.map((track) => track.popularity / 100)
  );
  const artistPopularity = weightedAverage(
    data.artists.map((artist) => artist.popularity / 100)
  );
  const popularity = average([trackPopularity, artistPopularity].filter(isNumber));
  const trackSignature = normalizedTextHash(
    data.tracks.map((track) => `${track.id}:${track.name}:${track.artistNames}`)
  );
  const artistSignature = normalizedTextHash(
    data.artists.map((artist) => `${artist.id}:${artist.name}`)
  );
  const genreDiversity = uniqueRatio(genres);
  const artistDiversity = uniqueRatio(
    data.tracks.flatMap((track) =>
      track.artistNames.split(",").map((artistName) => artistName.trim())
    )
  );
  const averageDurationMinutes =
    average(data.tracks.map((track) => track.durationMs).filter(isNumber)) / 60000;
  const shift = timeframeProfileShift(timeframe);
  const danceGenreScore = genreScore(genres, [
    "dance",
    "disco",
    "edm",
    "funk",
    "house",
    "hip hop",
    "latin",
    "pop",
    "r&b",
    "rap",
    "reggaeton"
  ]);
  const energyGenreScore = genreScore(genres, [
    "dance",
    "edm",
    "electronic",
    "hardcore",
    "house",
    "metal",
    "pop",
    "punk",
    "rap",
    "rock",
    "techno",
    "trap"
  ]);
  const acousticGenreScore = genreScore(genres, [
    "acoustic",
    "classical",
    "country",
    "folk",
    "indie folk",
    "jazz",
    "singer-songwriter"
  ]);
  const instrumentalGenreScore = genreScore(genres, [
    "ambient",
    "classical",
    "instrumental",
    "jazz",
    "lo-fi",
    "post-rock",
    "score",
    "soundtrack"
  ]);
  const brightGenreScore = genreScore(genres, [
    "dance",
    "disco",
    "funk",
    "latin",
    "pop",
    "reggae",
    "soul",
    "tropical"
  ]);
  const darkGenreScore = genreScore(genres, [
    "emo",
    "goth",
    "grunge",
    "melancholia",
    "metal",
    "sad"
  ]);
  const energy = clampMetric(
    0.2 +
      energyGenreScore * 0.44 +
      popularity * 0.2 +
      trackSignature * 0.08 +
      (1 - genreDiversity) * 0.05 +
      shift.energy
  );
  const danceability = clampMetric(
    0.2 +
      danceGenreScore * 0.5 +
      popularity * 0.15 +
      artistSignature * 0.08 +
      artistDiversity * 0.05 +
      shift.danceability
  );
  const acousticness = clampMetric(
    0.12 +
      acousticGenreScore * 0.58 +
      (1 - popularity) * 0.08 +
      Math.min(averageDurationMinutes / 7, 1) * 0.07 +
      shift.acousticness
  );
  const instrumentalness = clampMetric(
    0.04 +
      instrumentalGenreScore * 0.54 +
      genreDiversity * 0.05 +
      Math.max(averageDurationMinutes - 3, 0) * 0.025 +
      shift.instrumentalness
  );
  const valence = clampMetric(
    0.3 +
      brightGenreScore * 0.4 +
      popularity * 0.12 +
      trackSignature * 0.08 -
      darkGenreScore * 0.3 +
      shift.valence
  );
  const tempo = Math.round(
    70 + energy * 58 + danceability * 34 + (trackSignature - 0.5) * 14 + shift.tempo
  );

  return {
    energy,
    valence,
    danceability,
    acousticness,
    tempo,
    instrumentalness,
    analyzedTrackCount: data.tracks.length
  };
}

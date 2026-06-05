import { unstable_cache } from "next/cache";
import { getGeminiApiKey } from "@/lib/env";
import {
  timeframeLabels,
  type ListeningProfile,
  type Timeframe,
  type TopArtist,
  type TopTrack
} from "@/lib/spotify-api";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const IDENTITY_CACHE_VERSION = 1;

export const emotionalTraits = [
  "Dreamy",
  "Romantic",
  "Nostalgic",
  "Melancholic",
  "Energetic",
  "Chaotic",
  "Confident",
  "Introspective",
  "Cinematic",
  "Euphoric",
  "Rebellious",
  "Playful",
  "Focused",
  "Adventurous",
  "Warm"
] as const;

export type EmotionalTrait = (typeof emotionalTraits)[number];

export type ListeningIdentity = {
  description: string;
  identityName: string;
  source: "gemini" | "fallback";
  traitScores: Record<EmotionalTrait, number>;
  traits: [EmotionalTrait, EmotionalTrait, EmotionalTrait];
  vibeSummary: string;
};

type IdentityInput = {
  artists: TopArtist[];
  profile: ListeningProfile;
  timeframe: Timeframe;
  tracks: TopTrack[];
};

type GeminiIdentityPayload = {
  description?: unknown;
  identityName?: unknown;
  traits?: unknown;
  vibeSummary?: unknown;
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function boundedWords(value: string, maxWords: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);

  return words.slice(0, maxWords).join(" ");
}

function createTraitScores(profile: ListeningProfile): Record<EmotionalTrait, number> {
  return {
    Dreamy: clampScore(35 + profile.acousticness * 35 + profile.instrumentalness * 25),
    Romantic: clampScore(30 + profile.valence * 25 + profile.acousticness * 25),
    Nostalgic: clampScore(35 + profile.acousticness * 30 + (1 - profile.energy) * 20),
    Melancholic: clampScore(25 + (1 - profile.valence) * 45 + profile.acousticness * 15),
    Energetic: clampScore(20 + profile.energy * 65),
    Chaotic: clampScore(20 + profile.energy * 30 + (1 - profile.valence) * 25),
    Confident: clampScore(30 + profile.energy * 30 + profile.valence * 25),
    Introspective: clampScore(35 + (1 - profile.valence) * 25 + profile.instrumentalness * 20),
    Cinematic: clampScore(30 + profile.instrumentalness * 35 + profile.acousticness * 20),
    Euphoric: clampScore(20 + profile.valence * 45 + profile.energy * 25),
    Rebellious: clampScore(25 + profile.energy * 35 + (1 - profile.acousticness) * 20),
    Playful: clampScore(20 + profile.danceability * 45 + profile.valence * 25),
    Focused: clampScore(30 + profile.instrumentalness * 25 + (1 - profile.tempo / 200) * 20),
    Adventurous: clampScore(25 + profile.energy * 30 + profile.danceability * 25),
    Warm: clampScore(30 + profile.valence * 30 + profile.acousticness * 25)
  };
}

function topTraits(scores: Record<EmotionalTrait, number>) {
  return [...emotionalTraits]
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, 3) as [EmotionalTrait, EmotionalTrait, EmotionalTrait];
}

function fallbackName(profile: ListeningProfile, traits: EmotionalTrait[]) {
  if (profile.energy >= 0.62 && profile.valence < 0.45) {
    return "Velvet Chaos";
  }

  if (profile.instrumentalness >= 0.32 || traits.includes("Cinematic")) {
    return "Cinematic Overthinker";
  }

  if (profile.acousticness >= 0.45 && profile.valence < 0.55) {
    return "Nocturnal Romantic";
  }

  if (profile.valence >= 0.65 && profile.danceability >= 0.55) {
    return "Neon Daydreamer";
  }

  if (profile.energy >= 0.62) {
    return "Electric Wanderer";
  }

  return "Midnight Archivist";
}

export function generateFallbackIdentity(input: IdentityInput): ListeningIdentity {
  const traitScores = createTraitScores(input.profile);
  const traits = topTraits(traitScores);
  const identityName = fallbackName(input.profile, traits);
  const topArtistNames = input.artists
    .slice(0, 3)
    .map((artist) => artist.name)
    .join(", ");
  const timeframe = timeframeLabels[input.timeframe].toLowerCase();

  return {
    description: boundedWords(`Your ${timeframe} listening leans ${traits
      .map((trait) => trait.toLowerCase())
      .join(", ")}, shaped by ${topArtistNames || "your top artists"}.`, 24),
    identityName,
    source: "fallback",
    traitScores,
    traits,
    vibeSummary: boundedWords(`A ${traits[0].toLowerCase()} pulse with ${traits[1].toLowerCase()} edges and a ${traits[2].toLowerCase()} afterglow.`, 18)
  };
}

function buildIdentityPrompt(input: IdentityInput) {
  return [
    "Generate an emotional Spotify listening identity.",
    "Return JSON only. Avoid generic moods. Keep it concise, aesthetic, and specific.",
    "Limits: identityName <= 4 words, description <= 22 words, vibeSummary <= 16 words.",
    `Traits must be exactly 3 values from: ${emotionalTraits.join(", ")}.`,
    `Timeframe: ${timeframeLabels[input.timeframe]}.`,
    `Profile: energy ${input.profile.energy}, valence ${input.profile.valence}, danceability ${input.profile.danceability}, acousticness ${input.profile.acousticness}, tempo ${input.profile.tempo}, instrumentalness ${input.profile.instrumentalness}.`,
    `Top artists: ${input.artists
      .slice(0, 8)
      .map((artist) => `${artist.name}${artist.genres.length ? ` (${artist.genres.join(", ")})` : ""}`)
      .join("; ")}.`,
    `Top tracks: ${input.tracks
      .slice(0, 10)
      .map((track) => `${track.name} by ${track.artistNames}`)
      .join("; ")}.`
  ].join("\n");
}

function extractGeminiText(response: GeminiGenerateContentResponse) {
  return response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
}

function parseGeminiJson(text: string) {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("{")
    ? trimmed
    : trimmed.match(/\{[\s\S]*\}/)?.[0];

  if (!jsonText) {
    throw new Error("Gemini did not return JSON.");
  }

  return JSON.parse(jsonText) as GeminiIdentityPayload;
}

function normalizeTraits(value: unknown, fallbackTraits: ListeningIdentity["traits"]) {
  if (!Array.isArray(value)) {
    return fallbackTraits;
  }

  const traits = value.filter((trait): trait is EmotionalTrait =>
    emotionalTraits.includes(trait as EmotionalTrait)
  );
  const merged = [...traits, ...fallbackTraits].filter(
    (trait, index, list) => list.indexOf(trait) === index
  );

  return merged.slice(0, 3) as ListeningIdentity["traits"];
}

function normalizeText(value: unknown, fallback: string, maxLength: number) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }

  return value.trim().slice(0, maxLength);
}

function normalizeWords(value: unknown, fallback: string, maxWords: number, maxLength: number) {
  return boundedWords(normalizeText(value, fallback, maxLength), maxWords);
}

export function getIdentityCacheKey(input: IdentityInput) {
  const profileKey = [
    input.profile.energy,
    input.profile.valence,
    input.profile.danceability,
    input.profile.acousticness,
    input.profile.tempo,
    input.profile.instrumentalness
  ].join(":");
  const trackKey = input.tracks
    .slice(0, 8)
    .map((track) => track.id)
    .join(",");
  const artistKey = input.artists
    .slice(0, 5)
    .map((artist) => artist.id)
    .join(",");

  return `${IDENTITY_CACHE_VERSION}:${input.timeframe}:${profileKey}:${trackKey}:${artistKey}`;
}

export async function generateListeningIdentity(
  input: IdentityInput
): Promise<ListeningIdentity> {
  const fallback = generateFallbackIdentity(input);
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return fallback;
  }

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: buildIdentityPrompt(input)
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              identityName: { type: "string" },
              description: { type: "string" },
              traits: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "string",
                  enum: emotionalTraits
                }
              },
              vibeSummary: { type: "string" }
            },
            required: ["identityName", "description", "traits", "vibeSummary"]
          },
          temperature: 0.85
        }
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}.`);
    }

    const payload = (await response.json()) as GeminiGenerateContentResponse;
    const parsed = parseGeminiJson(extractGeminiText(payload) ?? "");
    const traits = normalizeTraits(parsed.traits, fallback.traits);

    return {
      description: normalizeWords(parsed.description, fallback.description, 22, 150),
      identityName: normalizeWords(parsed.identityName, fallback.identityName, 4, 44),
      source: "gemini",
      traitScores: fallback.traitScores,
      traits,
      vibeSummary: normalizeWords(parsed.vibeSummary, fallback.vibeSummary, 16, 120)
    };
  } catch {
    return fallback;
  }
}

export function generateCachedListeningIdentity(input: IdentityInput) {
  const cacheKey = getIdentityCacheKey(input);

  return unstable_cache(
    () => generateListeningIdentity(input),
    ["listening-identity", cacheKey],
    {
      revalidate: 60 * 60 * 24 * 14
    }
  )();
}

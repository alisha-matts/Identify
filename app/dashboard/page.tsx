import Link from "next/link";
import { redirect } from "next/navigation";
import {
  SPOTIFY_TOP_READ_SCOPE,
  SpotifyApiError,
  getSpotifyTopData,
  hasTopReadScope,
  parseTimeframe,
  timeframeLabels,
  timeframes,
  type SpotifyTopData,
  type Timeframe,
  type TopArtist,
  type TopTrack
} from "@/lib/spotify-api";
import { getSpotifySession } from "@/lib/session";

type DashboardPageProps = {
  searchParams?:
    | {
        timeframe?: string;
      }
    | Promise<{
        timeframe?: string;
      }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getSpotifySession();

  if (!session || session.expiresAt <= Date.now()) {
    redirect("/?auth_error=session_expired");
  }

  if (!hasTopReadScope(session.scope)) {
    redirect("/api/auth/login");
  }

  const resolvedSearchParams = await searchParams;
  const timeframe = parseTimeframe(resolvedSearchParams?.timeframe);
  let topData: SpotifyTopData | null = null;
  let fetchError: SpotifyApiError | Error | null = null;

  try {
    topData = await getSpotifyTopData(session, timeframe);
  } catch (error) {
    fetchError = error instanceof Error ? error : new Error("Unknown Spotify error.");
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <DashboardHeader />

        <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-signal/80">
                Spotify Listening Data
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Your top tracks and artists.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-mist/[0.72]">
                Browse your current Spotify favorites by timeframe. This phase
                fetches listening data only, with no audio feature analysis or
                AI identity generation.
              </p>
            </div>

            <TimeframeSelector activeTimeframe={timeframe} />
          </div>
        </section>

        {fetchError ? (
          <SpotifyErrorNotice error={fetchError} />
        ) : null}

        {topData ? (
          <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <TrackList tracks={topData.tracks} />
            <ArtistGrid artists={topData.artists} />
          </section>
        ) : null}
      </div>
    </main>
  );
}

function SpotifyErrorNotice({ error }: { error: Error }) {
  const spotifyError = error instanceof SpotifyApiError ? error : null;
  const isAuthError =
    spotifyError?.status === 401 ||
    spotifyError?.status === 403 ||
    error.message.toLowerCase().includes("scope");
  const title = isAuthError
    ? "Spotify needs a fresh authorization."
    : "Spotify data could not be loaded.";
  const detail = spotifyError
    ? `${spotifyError.endpoint} returned ${spotifyError.status}: ${spotifyError.message}`
    : error.message;

  return (
    <section className="rounded-lg border border-pulse/40 bg-pulse/[0.12] p-5 text-sm leading-6 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-white/[0.76]">{detail}</p>
          {isAuthError ? (
            <p className="mt-2 text-white/[0.68]">
              Reconnect Spotify and approve the{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5">
                {SPOTIFY_TOP_READ_SCOPE}
              </code>{" "}
              scope.
            </p>
          ) : null}
        </div>
        <Link
          className="inline-flex w-fit items-center justify-center rounded-lg bg-[#1ed760] px-4 py-2.5 font-semibold text-ink transition hover:bg-[#2bea70]"
          href="/api/auth/login"
        >
          Reconnect Spotify
        </Link>
      </div>
    </section>
  );
}

function DashboardHeader() {
  return (
    <header className="flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
      <Link className="flex items-center gap-3" href="/">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-base font-black text-ink">
          ID
        </span>
        <span className="text-lg font-semibold text-white">Identify</span>
      </Link>

      <span className="w-fit rounded-full border border-[#1ed760]/40 bg-[#1ed760]/10 px-4 py-2 text-sm font-medium text-[#8bf6ad]">
        Spotify connected
      </span>
    </header>
  );
}

function TimeframeSelector({
  activeTimeframe
}: {
  activeTimeframe: Timeframe;
}) {
  return (
    <nav
      aria-label="Listening timeframe"
      className="grid w-full grid-cols-3 rounded-lg border border-white/10 bg-white/[0.06] p-1 sm:w-auto"
    >
      {timeframes.map((timeframe) => {
        const isActive = timeframe === activeTimeframe;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={[
              "rounded-md px-4 py-2.5 text-center text-sm font-semibold transition",
              isActive
                ? "bg-white text-ink"
                : "text-mist/[0.72] hover:bg-white/[0.08] hover:text-white"
            ].join(" ")}
            href={`/dashboard?timeframe=${timeframe}`}
            key={timeframe}
          >
            {timeframeLabels[timeframe]}
          </Link>
        );
      })}
    </nav>
  );
}

function TrackList({ tracks }: { tracks: TopTrack[] }) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4 backdrop-blur sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-acid/80">
            Top Tracks
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">25 tracks</h2>
        </div>
      </div>

      <div className="space-y-3">
        {tracks.map((track, index) => (
          <a
            className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border border-white/10 bg-ink/[0.48] p-3 transition hover:border-signal/40 hover:bg-white/[0.075]"
            href={track.spotifyUrl}
            key={track.id}
            rel="noreferrer"
            target="_blank"
          >
            <span className="w-7 text-center text-sm font-semibold text-mist/[0.52]">
              {index + 1}
            </span>
            <span className="flex min-w-0 items-center gap-3">
              <Artwork alt={`${track.name} album artwork`} src={track.imageUrl} />
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold text-white">
                  {track.name}
                </span>
                <span className="mt-1 block truncate text-sm text-mist/[0.64]">
                  {track.artistNames}
                </span>
              </span>
            </span>
            <span className="hidden text-sm font-medium text-mist/[0.58] sm:block">
              {formatDuration(track.durationMs)}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function ArtistGrid({ artists }: { artists: TopArtist[] }) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4 backdrop-blur sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-acid/80">
        Top Artists
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white">15 artists</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {artists.map((artist, index) => (
          <a
            className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-ink/[0.48] p-3 transition hover:border-pulse/40 hover:bg-white/[0.075]"
            href={artist.spotifyUrl}
            key={artist.id}
            rel="noreferrer"
            target="_blank"
          >
            <span className="w-6 text-center text-sm font-semibold text-mist/[0.52]">
              {index + 1}
            </span>
            <Artwork alt={`${artist.name} artist image`} src={artist.imageUrl} />
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold text-white">
                {artist.name}
              </span>
              <span className="mt-1 block truncate text-sm text-mist/[0.64]">
                {artist.genres.length > 0
                  ? artist.genres.join(", ")
                  : "No genre listed"}
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Artwork({ alt, src }: { alt: string; src?: string }) {
  if (!src) {
    return (
      <span
        aria-label={alt}
        className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-signal/40 via-pulse/30 to-acid/30 text-sm font-black text-white"
        role="img"
      >
        ID
      </span>
    );
  }

  return (
    <img
      alt={alt}
      className="h-14 w-14 shrink-0 rounded-lg object-cover"
      height={56}
      loading="lazy"
      src={src}
      width={56}
    />
  );
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

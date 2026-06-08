import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { ShareIdentityCard } from "@/components/share-identity-card";
import {
  generateCachedListeningIdentity,
  type ListeningIdentity
} from "@/lib/identity";
import {
  SPOTIFY_TOP_READ_SCOPE,
  SpotifyApiError,
  getEstimatedListeningProfile,
  getSpotifyTopData,
  hasTopReadScope,
  parseTimeframe,
  timeframeLabels,
  timeframes,
  type SpotifyTopData,
  type Timeframe,
  type ListeningProfile,
  type TopArtist,
  type TopTrack
} from "@/lib/spotify-api";
import { getSpotifySession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  let identity: ListeningIdentity | null = null;
  let listeningProfile: ListeningProfile | null = null;

  try {
    topData = await getSpotifyTopData(session, timeframe);
  } catch (error) {
    fetchError = error instanceof Error ? error : new Error("Unknown Spotify error.");
  }

  if (topData) {
    listeningProfile = getEstimatedListeningProfile(topData);
  }

  if (topData && listeningProfile) {
    identity = await generateCachedListeningIdentity({
      artists: topData.artists,
      profile: listeningProfile,
      timeframe,
      tracks: topData.tracks
    });
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <DashboardHeader />

        <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/70">
                Final Listening Identity
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
                A colorful read on your Spotify rotation.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-mist/[0.72]">
                Switch timeframes to see your identity, traits, artists, and
                listening profile light up around that slice of your taste.
              </p>
            </div>

            <TimeframeSelector activeTimeframe={timeframe} />
          </div>
        </section>

        {fetchError ? (
          <SpotifyErrorNotice error={fetchError} />
        ) : null}

        {topData && identity && listeningProfile ? (
          <FinalIdentityDashboard
            identity={identity}
            profile={listeningProfile}
            timeframe={timeframe}
            topData={topData}
          />
        ) : null}
      </div>
    </main>
  );
}

function FinalIdentityDashboard({
  identity,
  profile,
  timeframe,
  topData
}: {
  identity: ListeningIdentity;
  profile: ListeningProfile;
  timeframe: Timeframe;
  topData: SpotifyTopData;
}) {
  return (
    <DashboardTabs
      tabs={[
        {
          id: "identity",
          label: "Identity + Share",
          content: (
            <>
              <IdentityHero identity={identity} timeframe={timeframe} />
              <ShareIdentityCard
                artists={topData.artists}
                identity={identity}
                timeframeLabel={timeframeLabels[timeframe]}
                tracks={topData.tracks}
              />
            </>
          )
        },
        {
          id: "profile",
          label: "Traits + Profile",
          content: (
            <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <TraitBreakdown identity={identity} />
              <ListeningVibe profile={profile} timeframe={timeframe} />
            </section>
          )
        },
        {
          id: "source",
          label: "Artists + Tracks",
          content: (
            <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <ArtistGrid artists={topData.artists} />
              <TrackList tracks={topData.tracks} />
            </section>
          )
        }
      ]}
    />
  );
}

function IdentityHero({
  identity,
  timeframe
}: {
  identity: ListeningIdentity;
  timeframe: Timeframe;
}) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/[0.62] p-6 shadow-[0_18px_56px_rgba(120,95,130,0.14)] backdrop-blur-xl sm:p-8">
      <div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mist">
              Identity
            </p>
            <span className="rounded-full border border-ink/10 bg-white/60 px-3 py-1 text-xs font-medium text-mist">
              {timeframeLabels[timeframe]}
            </span>
            <span className="rounded-full border border-ink/10 bg-white/60 px-3 py-1 text-xs font-medium text-mist">
              {identity.source === "gemini" ? "Gemini" : "Local fallback"}
            </span>
          </div>

          <h2 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.98] text-ink [overflow-wrap:anywhere] sm:text-6xl">
            {identity.identityName}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-mist/[0.78] [overflow-wrap:anywhere]">
            {identity.description}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-mist/[0.64] [overflow-wrap:anywhere]">
            {identity.vibeSummary}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {identity.traits.map((trait) => (
              <span
                className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-semibold text-ink"
                key={trait}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TraitBreakdown({ identity }: { identity: ListeningIdentity }) {
  const traits = [...identity.traits].sort(
    (a, b) => identity.traitScores[b] - identity.traitScores[a]
  );

  return (
    <section className="rounded-[1.25rem] border border-white/70 bg-white/[0.62] p-5 shadow-[0_18px_48px_rgba(120,95,130,0.12)] backdrop-blur sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mist">
        Trait Breakdown
      </p>
      <h3 className="mt-2 text-2xl font-semibold text-ink">Emotional signal</h3>

      <div className="mt-6 space-y-4">
        {traits.map((trait) => (
          <div className="rounded-lg border border-ink/10 bg-white/65 p-4" key={trait}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-ink">{trait}</p>
              <p className="text-sm font-medium text-mist/[0.62]">
                {identity.traitScores[trait]}%
              </p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-ink/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pulse via-signal to-acid transition-all duration-700"
                style={{ width: `${identity.traitScores[trait]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ListeningVibe({
  profile,
  timeframe
}: {
  profile: ListeningProfile;
  timeframe: Timeframe;
}) {
  return (
    <section className="rounded-[1.25rem] border border-white/70 bg-white/[0.62] p-5 shadow-[0_18px_48px_rgba(120,95,130,0.12)] backdrop-blur sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mist">
        Listening Profile
      </p>
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
        <RadarCard profile={profile} timeframe={timeframe} />
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard label="Energy" value={profile.energy} />
          <MetricCard label="Valence" value={profile.valence} />
          <MetricCard label="Danceability" value={profile.danceability} />
          <MetricCard label="Acousticness" value={profile.acousticness} />
          <MetricCard
            label="Tempo"
            suffix=" BPM"
            value={profile.tempo}
            valueKind="tempo"
          />
          <MetricCard label="Instrumentalness" value={profile.instrumentalness} />
        </div>
      </div>
    </section>
  );
}

function AudioProfileSection({
  profile,
  timeframe
}: {
  profile: ListeningProfile | null;
  timeframe: Timeframe;
}) {
  if (!profile) {
    return (
      <section className="rounded-lg border border-white/70 bg-white/[0.62] p-5 text-sm leading-6 text-mist/[0.78]">
        Listening profile metrics are not available for these top tracks yet.
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-lg border border-signal/30 bg-signal/[0.1] p-5 text-sm leading-6 text-ink lg:col-span-2">
        <p className="font-semibold">Listening profile estimated</p>
        <p className="mt-1 text-ink/[0.76]">
          Spotify no longer provides Audio Features to this app, so these metrics
          are estimated from {timeframeLabels[timeframe].toLowerCase()}'s top
          tracks, artists, popularity, and genre metadata.
        </p>
      </div>
      <RadarCard profile={profile} timeframe={timeframe} />
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard label="Energy" value={profile.energy} />
        <MetricCard label="Valence" value={profile.valence} />
        <MetricCard label="Danceability" value={profile.danceability} />
        <MetricCard label="Acousticness" value={profile.acousticness} />
        <MetricCard
          label="Tempo"
          suffix=" BPM"
          value={profile.tempo}
          valueKind="tempo"
        />
        <MetricCard label="Instrumentalness" value={profile.instrumentalness} />
      </div>
    </section>
  );
}

function RadarCard({
  profile,
  timeframe
}: {
  profile: ListeningProfile;
  timeframe: Timeframe;
}) {
  const radarMetrics = [
    { label: "Energy", value: profile.energy },
    { label: "Valence", value: profile.valence },
    { label: "Dance", value: profile.danceability },
    { label: "Acoustic", value: profile.acousticness },
    {
      label: "Tempo",
      value: Math.min(profile.tempo / 200, 1)
    },
    { label: "Instr.", value: profile.instrumentalness }
  ];
  const points = buildRadarPoints(radarMetrics.map((metric) => metric.value));

  return (
    <section className="rounded-[1.25rem] border border-ink/10 bg-white/65 p-5 backdrop-blur lg:row-span-2">
      <h2 className="text-2xl font-semibold text-ink">
        {profile.analyzedTrackCount} tracks analyzed
      </h2>
      <p className="mt-2 text-sm text-mist/[0.62]">
        Source: Estimated from {timeframeLabels[timeframe].toLowerCase()} data
      </p>

      <div className="mt-6 grid place-items-center">
        <svg
          aria-label="Estimated listening profile radar chart"
          className="h-72 w-full max-w-sm"
          role="img"
          viewBox="0 0 240 240"
        >
          {[90, 65, 40].map((radius) => (
            <polygon
              className="fill-transparent stroke-ink/10"
              key={radius}
              points={buildRadarPoints(Array(6).fill(1), radius)}
              strokeWidth="1"
            />
          ))}
          {radarMetrics.map((metric, index) => {
            const angle = (Math.PI * 2 * index) / radarMetrics.length - Math.PI / 2;
            const labelRadius = 108;
            const x = 120 + Math.cos(angle) * labelRadius;
            const y = 120 + Math.sin(angle) * labelRadius;

            return (
              <text
                className="fill-mist text-[10px] font-semibold"
                dominantBaseline="middle"
                key={metric.label}
                textAnchor="middle"
                x={x}
                y={y}
              >
                {metric.label}
              </text>
            );
          })}
          <polygon
            className="fill-signal/20 stroke-signal"
            points={points}
            strokeLinejoin="round"
            strokeWidth="2"
          />
          {points.split(" ").map((point) => {
            const [x, y] = point.split(",");

            return (
              <circle
                className="fill-ink"
                cx={x}
                cy={y}
                key={point}
                r="3"
              />
            );
          })}
        </svg>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  suffix = "",
  value,
  valueKind = "ratio"
}: {
  label: string;
  suffix?: string;
  value: number;
  valueKind?: "ratio" | "tempo";
}) {
  const displayValue =
    valueKind === "tempo" ? `${value}${suffix}` : `${Math.round(value * 100)}%`;
  const barValue = valueKind === "tempo" ? Math.min(value / 200, 1) : value;

  return (
    <article className="rounded-lg border border-ink/10 bg-white/65 p-5 backdrop-blur">
      <p className="text-sm leading-5 text-mist/[0.62] [overflow-wrap:anywhere]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-ink">{displayValue}</p>
      <div className="mt-4 h-2 rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-signal"
          style={{ width: `${Math.round(barValue * 100)}%` }}
        />
      </div>
    </article>
  );
}

function buildRadarPoints(values: number[], radius = 90) {
  return values
    .map((value, index) => {
      const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;
      const scaledRadius = Math.max(0, Math.min(value, 1)) * radius;
      const x = 120 + Math.cos(angle) * scaledRadius;
      const y = 120 + Math.sin(angle) * scaledRadius;

      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
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
    <section className="rounded-lg border border-pulse/40 bg-pulse/[0.12] p-5 text-sm leading-6 text-ink">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-ink/[0.76]">{detail}</p>
          {isAuthError ? (
            <p className="mt-2 text-ink/[0.68]">
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
        <span
          aria-hidden="true"
          className="grid h-10 w-10 place-items-center rounded-lg bg-white text-2xl"
        >
          {"\u{1F481}\u200D\u2640\uFE0F"}
        </span>
        <span className="text-lg font-semibold text-ink">Identify</span>
      </Link>

      <span className="w-fit rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-semibold text-ink">
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
          <a
            aria-current={isActive ? "page" : undefined}
            className={[
              "rounded-md px-4 py-2.5 text-center text-sm font-semibold transition",
              isActive
                ? "bg-white text-ink"
                : "text-mist/[0.72] hover:bg-white/[0.08] hover:text-ink"
            ].join(" ")}
            href={`/dashboard?timeframe=${timeframe}`}
            key={timeframe}
          >
            {timeframeLabels[timeframe]}
          </a>
        );
      })}
    </nav>
  );
}

function TrackList({ tracks }: { tracks: TopTrack[] }) {
  return (
    <section className="rounded-[1.25rem] border border-white/70 bg-white/[0.62] p-4 shadow-[0_18px_48px_rgba(120,95,130,0.12)] backdrop-blur sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mist">
            Top Tracks
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">25 tracks</h2>
        </div>
      </div>

      <div className="space-y-3">
        {tracks.map((track, index) => (
          <a
            className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border border-ink/10 bg-white/65 p-3 transition hover:bg-white"
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
                <span className="block truncate text-base font-semibold text-ink">
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
    <section className="rounded-[1.25rem] border border-white/70 bg-white/[0.62] p-4 shadow-[0_18px_48px_rgba(120,95,130,0.12)] backdrop-blur sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mist">
        Top Artists
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">15 artists</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {artists.map((artist, index) => (
          <a
            className="flex min-w-0 items-center gap-3 rounded-lg border border-ink/10 bg-white/65 p-3 transition hover:bg-white"
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
              <span className="block truncate text-base font-semibold text-ink">
                {artist.name}
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
        className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-signal/40 via-pulse/30 to-acid/30 text-2xl"
        role="img"
      >
        {"\u{1F481}\u200D\u2640\uFE0F"}
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

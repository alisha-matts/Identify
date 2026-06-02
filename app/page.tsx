import { FeatureCard } from "@/components/feature-card";
import { SiteHeader } from "@/components/site-header";
import { SpotifyLoginButton } from "@/components/spotify-login-button";

const signals = ["Dreamy", "Kinetic", "Nostalgic", "Introspective"];

const authErrorMessages: Record<string, string> = {
  access_denied: "Spotify authorization was canceled.",
  invalid_state: "The Spotify login session expired. Try signing in again.",
  missing_code: "Spotify did not return an authorization code.",
  missing_spotify_configuration:
    "Spotify credentials are missing. Check your .env.local file.",
  session_expired: "Your Spotify session expired. Sign in again to continue.",
  token_exchange_failed:
    "Spotify login started, but the token exchange failed. Check your redirect URI."
};

type HomeProps = {
  searchParams?: {
    auth_error?: string;
  };
};

export default function Home({ searchParams }: HomeProps) {
  const authError = searchParams?.auth_error;
  const authErrorMessage = authError ? authErrorMessages[authError] : undefined;

  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />

      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:px-10 lg:pb-20">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm font-medium text-mist shadow-glow backdrop-blur">
            Spotify identity analysis
          </p>

          {authErrorMessage ? (
            <div className="mb-5 rounded-lg border border-pulse/40 bg-pulse/[0.12] px-4 py-3 text-sm leading-6 text-white">
              {authErrorMessage}
            </div>
          ) : null}

          <h1 className="text-balance text-5xl font-semibold leading-[0.96] tracking-normal text-white sm:text-6xl lg:text-7xl">
            Find the listening identity hiding in your music.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-mist/[0.82] sm:text-xl">
            Identify turns your Spotify patterns into a vivid emotional profile,
            blending listening stats with cinematic visual language.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <SpotifyLoginButton />
            <p className="max-w-sm text-sm leading-6 text-mist/[0.62]">
              Sign in through Spotify to validate the OAuth flow before any
              listening data is requested.
            </p>
          </div>

          <div className="mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {signals.map((signal) => (
              <div
                className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-center text-sm font-medium text-white/[0.86]"
                key={signal}
              >
                {signal}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none" id="preview">
          <div className="glass-panel relative overflow-hidden rounded-[2rem] p-5 shadow-rose sm:p-7">
            <div className="absolute inset-x-0 top-0 h-px animate-scan bg-gradient-to-r from-transparent via-signal to-transparent" />

            <div className="rounded-3xl border border-white/10 bg-ink/[0.72] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-signal/80">
                    Aura Preview
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">
                    Velvet Static
                  </h2>
                </div>
                <div className="h-14 w-14 rounded-full bg-[conic-gradient(from_180deg,#72e8ff,#ff4f87,#b9ff66,#72e8ff)] p-1 shadow-glow">
                  <div className="h-full w-full rounded-full bg-night" />
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <div>
                  <div className="mb-2 flex justify-between text-sm text-mist/[0.72]">
                    <span>Motion</span>
                    <span>78%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full w-[78%] rounded-full bg-signal shadow-glow" />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm text-mist/[0.72]">
                    <span>Feeling</span>
                    <span>64%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full w-[64%] rounded-full bg-pulse shadow-rose" />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm text-mist/[0.72]">
                    <span>Glow</span>
                    <span>91%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full w-[91%] rounded-full bg-acid" />
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-white/[0.06] p-4">
                  <p className="text-2xl font-semibold text-white">25</p>
                  <p className="mt-1 text-xs text-mist/[0.62]">Tracks</p>
                </div>
                <div className="rounded-lg bg-white/[0.06] p-4">
                  <p className="text-2xl font-semibold text-white">15</p>
                  <p className="mt-1 text-xs text-mist/[0.62]">Artists</p>
                </div>
                <div className="rounded-lg bg-white/[0.06] p-4">
                  <p className="text-2xl font-semibold text-white">3</p>
                  <p className="mt-1 text-xs text-mist/[0.62]">Ranges</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-8 -left-5 hidden w-44 animate-float rounded-2xl border border-white/[0.12] bg-white/[0.07] p-4 shadow-glow backdrop-blur md:block">
            <p className="text-sm text-mist/[0.72]">Current mood</p>
            <p className="mt-1 text-xl font-semibold text-white">Electric calm</p>
          </div>
        </div>
      </section>

      <section
        className="mx-auto grid w-full max-w-7xl gap-4 px-5 pb-12 sm:px-8 md:grid-cols-3 lg:px-10"
        id="foundation"
      >
        <FeatureCard
          eyebrow="Profile"
          title="Listening shape"
          body="A focused first screen for the emotional profile that later phases will generate."
        />
        <FeatureCard
          eyebrow="Design"
          title="Cinematic theme"
          body="Dark gradients, glass surfaces, and motion cues establish the visual direction."
        />
        <FeatureCard
          eyebrow="Foundation"
          title="Ready for OAuth"
          body="The app structure is prepared for Spotify login without implementing auth early."
        />
      </section>
    </main>
  );
}

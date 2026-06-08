import { SiteHeader } from "@/components/site-header";
import { SpotifyLoginButton } from "@/components/spotify-login-button";

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

      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl items-center px-5 pb-16 pt-10 text-center sm:px-8 lg:px-10">
        <div className="mx-auto">
          <div
            aria-hidden="true"
            className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-[1.5rem] border border-white/80 bg-white/65 text-5xl shadow-[0_18px_48px_rgba(120,95,130,0.14)] backdrop-blur"
          >
            {"\u{1F481}\u200D\u2640\uFE0F"}
          </div>

          {authErrorMessage ? (
            <div className="mx-auto mb-5 max-w-2xl rounded-lg border border-pulse/40 bg-white/70 px-4 py-3 text-sm leading-6 text-ink">
              {authErrorMessage}
            </div>
          ) : null}

          <h1 className="text-balance text-5xl font-semibold leading-[0.98] tracking-normal text-ink sm:text-6xl">
            Find the listening identity hiding in your music.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-mist/[0.86] sm:text-xl">
            Identify turns your Spotify patterns into a vivid emotional profile,
            using your top songs and artists to describe your taste in a simple,
            shareable way.
          </p>

          <div className="mt-9 flex justify-center">
            <SpotifyLoginButton />
          </div>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSpotifySession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSpotifySession();

  if (!session) {
    redirect("/?auth_error=session_expired");
  }

  const expiresAt = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(session.expiresAt));

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
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

        <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.24em] text-signal/80">
            Authenticated
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Spotify OAuth is connected.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-mist/[0.72]">
            Phase 2 stops here. The app has exchanged the authorization code for
            a token and stored it in an httpOnly session cookie. Listening data
            will be fetched in Phase 3.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
              <p className="text-sm text-mist/[0.62]">Session</p>
              <p className="mt-2 text-xl font-semibold text-white">Active</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
              <p className="text-sm text-mist/[0.62]">Token type</p>
              <p className="mt-2 text-xl font-semibold text-white">
                {session.tokenType}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5">
              <p className="text-sm text-mist/[0.62]">Access expires</p>
              <p className="mt-2 text-xl font-semibold text-white">{expiresAt}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

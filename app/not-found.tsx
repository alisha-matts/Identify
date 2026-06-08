import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-12 text-center">
      <section className="max-w-lg rounded-[1.5rem] border border-white/70 bg-white/[0.68] p-8 shadow-[0_18px_56px_rgba(120,95,130,0.14)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mist">
          Page not found
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink">
          This page is not part of Identify.
        </h1>
        <p className="mt-4 text-base leading-7 text-mist/[0.84]">
          Head back to the login page to start a Spotify identity session.
        </p>
        <Link
          className="mt-7 inline-flex rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/86 focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2"
          href="/"
        >
          Back to login
        </Link>
      </section>
    </main>
  );
}

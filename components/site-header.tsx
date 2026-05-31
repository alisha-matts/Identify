import Link from "next/link";
import { SpotifyLoginButton } from "./spotify-login-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-base font-black text-ink">
            ID
          </span>
          <span className="text-lg font-semibold tracking-normal text-white">
            Identify
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-mist/[0.72] md:flex">
          <a className="transition hover:text-white" href="#preview">
            Preview
          </a>
          <a className="transition hover:text-white" href="#foundation">
            Foundation
          </a>
        </nav>

        <div className="hidden sm:block">
          <SpotifyLoginButton compact />
        </div>
      </div>
    </header>
  );
}

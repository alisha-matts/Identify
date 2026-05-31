type SpotifyLoginButtonProps = {
  compact?: boolean;
};

export function SpotifyLoginButton({ compact = false }: SpotifyLoginButtonProps) {
  return (
    <a
      className={[
        "inline-flex items-center justify-center gap-3 rounded-lg bg-[#1ed760] font-semibold text-ink shadow-[0_16px_40px_rgba(30,215,96,0.24)] transition hover:-translate-y-0.5 hover:bg-[#2bea70] focus:outline-none focus:ring-2 focus:ring-[#1ed760] focus:ring-offset-2 focus:ring-offset-ink",
        compact ? "px-4 py-2.5 text-sm" : "px-6 py-4 text-base"
      ].join(" ")}
      href="/api/auth/login"
    >
      <span aria-hidden="true" className="grid h-5 w-5 place-items-center">
        <span className="h-4 w-4 rounded-full border-[3px] border-ink" />
      </span>
      Login with Spotify
    </a>
  );
}

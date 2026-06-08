"use client";

import { useState } from "react";
import type { ListeningIdentity } from "@/lib/identity";
import type { TopArtist, TopTrack } from "@/lib/spotify-api";

type ShareIdentityCardProps = {
  artists: TopArtist[];
  identity: ListeningIdentity;
  timeframeLabel: string;
  tracks: TopTrack[];
};

const CARD_WIDTH = 768;
const CARD_HEIGHT = 960;

export function ShareIdentityCard({
  artists,
  identity,
  timeframeLabel,
  tracks
}: ShareIdentityCardProps) {
  const [status, setStatus] = useState<string | null>(null);
  const topArtist = artists[0];
  const topTrack = tracks[0];

  function downloadCard() {
    const svg = createShareSvg({
      artists,
      identity,
      timeframeLabel,
      tracks
    });
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${slugify(identity.identityName)}-identify-card.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Card downloaded.");
  }

  return (
    <section className="grid gap-6 rounded-[1.25rem] border border-white/70 bg-white/[0.62] p-5 shadow-[0_18px_48px_rgba(120,95,130,0.12)] backdrop-blur lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/70">
          Share Card
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">
          Social identity snapshot
        </h2>
        <p className="mt-3 text-sm leading-6 text-mist/[0.68]">
          Export a compact card with your identity, top artist, top song, traits, and
          listening vibe for {timeframeLabel.toLowerCase()}.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/80"
            onClick={downloadCard}
            type="button"
          >
            Download Card
          </button>
        </div>

        {status ? (
          <p className="mt-3 text-sm font-medium text-signal" role="status">
            {status}
          </p>
        ) : null}
      </div>

      <article className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[1.4rem] border border-white/80 bg-gradient-to-br from-[#fffdf3] via-[#ffdff2] to-[#e7ffd4] p-6 shadow-[0_24px_70px_rgba(120,95,130,0.18)]">
        <div className="relative flex h-full flex-col">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/70">
              Identify
            </p>
            <h3 className="mt-4 text-4xl font-semibold leading-none text-ink [overflow-wrap:anywhere]">
              {identity.identityName}
            </h3>
            <p className="mt-4 text-sm leading-6 text-mist/[0.72]">
              {identity.vibeSummary}
            </p>
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap gap-2">
              {identity.traits.map((trait) => (
                <span
                  className="rounded-full border border-ink/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-ink"
                  key={trait}
                >
                  {trait}
                </span>
              ))}
            </div>

            <div className="mt-4 grid gap-3">
              {topArtist ? (
                <div className="flex items-center gap-3">
                  {topArtist.imageUrl ? (
                    <img
                      alt={`${topArtist.name} artist image`}
                      className="h-9 w-9 rounded-lg object-cover"
                      height={36}
                      loading="lazy"
                      src={topArtist.imageUrl}
                      width={36}
                    />
                  ) : (
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/70 text-lg">
                      {"\u{1F481}\u200D\u2640\uFE0F"}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-xs font-medium uppercase tracking-[0.16em] text-mist/[0.46]">
                      Top Artist
                    </span>
                    <span className="mt-1 block truncate text-sm font-semibold text-ink">
                      {topArtist.name}
                    </span>
                  </span>
                </div>
              ) : null}
              {topTrack ? (
                <div className="flex items-center gap-3">
                  {topTrack.imageUrl ? (
                    <img
                      alt={`${topTrack.name} album artwork`}
                      className="h-9 w-9 rounded-lg object-cover"
                      height={36}
                      loading="lazy"
                      src={topTrack.imageUrl}
                      width={36}
                    />
                  ) : (
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/70 text-lg">
                      {"\u{1F481}\u200D\u2640\uFE0F"}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-xs font-medium uppercase tracking-[0.16em] text-mist/[0.46]">
                      Top Song
                    </span>
                    <span className="mt-1 block truncate text-sm font-semibold text-ink">
                      {topTrack.name}
                    </span>
                  </span>
                </div>
              ) : null}
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-mist/[0.7]">
              {timeframeLabel}
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}

function createShareSvg({
  artists,
  identity,
  timeframeLabel,
  tracks
}: ShareIdentityCardProps) {
  const topArtist = artists[0];
  const topTrack = tracks[0];
  const traitNodes = identity.traits
    .map(
      (trait) =>
        `<span class="trait">${escapeHtml(trait)}</span>`
    )
    .join("");
  const sourceNodes = [
    topArtist
      ? createSourceNode({
          imageUrl: topArtist.imageUrl,
          label: "Top Artist",
          name: topArtist.name
        })
      : "",
    topTrack
      ? createSourceNode({
          imageUrl: topTrack.imageUrl,
          label: "Top Song",
          name: topTrack.name
        })
      : ""
  ].join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" class="card">
      <style>
        * { box-sizing: border-box; }
        .card {
          position: relative;
          width: ${CARD_WIDTH}px;
          height: ${CARD_HEIGHT}px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.88);
          border-radius: 42px;
          background: linear-gradient(135deg, #fffdf3 0%, #ffdff2 54%, #e7ffd4 100%);
          color: #3f3947;
          font-family: Inter, Arial, sans-serif;
          padding: 48px;
        }
        .content {
          position: relative;
          z-index: 1;
          display: flex;
          height: 100%;
          flex-direction: column;
          justify-content: flex-start;
        }
        .eyebrow {
          margin: 0;
          color: rgba(63,57,71,0.7);
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .title {
          margin: 32px 0 0;
          color: #3f3947;
          font-size: 72px;
          font-weight: 650;
          line-height: 0.95;
          overflow-wrap: anywhere;
        }
        .vibe {
          margin: 28px 0 0;
          max-width: 560px;
          color: rgba(63,57,71,0.72);
          font-size: 28px;
          line-height: 1.5;
        }
        .traits {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 42px;
        }
        .trait {
          border: 1px solid rgba(63,57,71,0.1);
          border-radius: 999px;
          background: rgba(255,255,255,0.62);
          color: #3f3947;
          font-size: 19px;
          font-weight: 700;
          padding: 12px 18px;
        }
        .sources {
          margin-top: 28px;
          display: grid;
          gap: 16px;
        }
        .source-row {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .source-image,
        .source-fallback {
          width: 54px;
          height: 54px;
          flex: 0 0 auto;
          border-radius: 12px;
          object-fit: cover;
        }
        .source-fallback {
          display: grid;
          place-items: center;
          background: rgba(255,255,255,0.7);
          font-size: 26px;
        }
        .source-text {
          min-width: 0;
        }
        .source-label {
          color: rgba(63,57,71,0.52);
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .source-name {
          display: block;
          margin-top: 6px;
          overflow: hidden;
          color: #3f3947;
          font-size: 24px;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .footer {
          margin: 28px 0 0;
          color: rgba(63,57,71,0.7);
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
      </style>
      <div class="content">
        <div>
          <p class="eyebrow">Identify</p>
          <h1 class="title">${escapeHtml(identity.identityName)}</h1>
          <p class="vibe">${escapeHtml(identity.vibeSummary)}</p>
        </div>
        <div>
          <div class="traits">${traitNodes}</div>
          <div class="sources">${sourceNodes}</div>
          <p class="footer">${escapeHtml(timeframeLabel)}</p>
        </div>
      </div>
    </div>
  </foreignObject>
</svg>`;
}

function createSourceNode({
  imageUrl,
  label,
  name
}: {
  imageUrl?: string;
  label: string;
  name: string;
}) {
  const image = imageUrl
    ? `<img alt="" class="source-image" src="${escapeHtml(imageUrl)}" />`
    : `<span class="source-fallback">&#x1F481;&#x200D;&#x2640;&#xFE0F;</span>`;

  return `<div class="source-row">${image}<span class="source-text"><span class="source-label">${escapeHtml(label)}</span><span class="source-name">${escapeHtml(name)}</span></span></div>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || "spotify-identity";
}

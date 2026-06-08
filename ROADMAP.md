# Identify Project Roadmap (Phase-by-Phase Build Plan)

This project should be built incrementally so each phase is testable before moving on.

The goal is:

* avoid overwhelming complexity
* make debugging easier
* validate Spotify auth before AI integration
* ensure the UI evolves cleanly

---

# PHASE 1 — Project Setup & Landing Page

## Goal

Create the basic Next.js app structure and a polished landing page.

## Features

* Next.js App Router
* Tailwind setup
* Dark gradient theme
* Responsive layout
* Landing page UI
* “Login with Spotify” button
* Navigation/header

## Pages

* /
  Landing page

## Environment Variables

Create:

* .env.local

Include:

* SPOTIFY_CLIENT_ID
* SPOTIFY_CLIENT_SECRET
* NEXT_PUBLIC_BASE_URL=http://127.0.0.1:3000
* GEMINI_API_KEY

IMPORTANT:
Never use localhost.
Always use:
http://127.0.0.1:3000

## Deliverables

Generate:

* full project structure
* Tailwind config
* app layout
* landing page
* reusable UI components
* responsive styling

## Test Checklist

Before continuing:

* app runs successfully
* no TypeScript errors
* Tailwind works
* landing page looks polished
* animations work
* app loads on:
  http://127.0.0.1:3000

STOP AFTER THIS PHASE.

Do NOT implement Spotify auth yet.

---

# PHASE 2 — Spotify OAuth Authentication

## Goal

Implement Spotify login flow.

## Features

* Spotify OAuth
* login route
* callback route
* access token exchange
* secure environment variable usage
* redirect after successful login

## Required Redirect URI

Use ONLY:
http://127.0.0.1:3000/api/auth/callback/spotify

Never use localhost.

## Pages/Routes

* /api/auth/login
* /api/auth/callback/spotify

## After Login

Redirect user to:

* /dashboard

## Deliverables

Generate:

* Spotify OAuth implementation
* token exchange logic
* auth utilities
* cookie/session handling
* loading/error states

## Test Checklist

Before continuing:

* clicking login redirects to Spotify
* Spotify login works
* callback succeeds
* token exchange works
* user redirects to dashboard
* no redirect URI mismatch errors

STOP AFTER THIS PHASE.

Do NOT fetch Spotify listening data yet.

---

# PHASE 3 — Fetch Spotify Listening Data

## Goal

Pull user listening data from Spotify.

## Features

Fetch:

* top tracks
* top artists

Support time ranges:

* Day
* Week
* Month

Map to:

* short_term
* medium_term
* long_term

Default:

* Month

## Spotify Endpoints

Use:

* /me/top/tracks
* /me/top/artists

Fetch:

* 25 tracks
* 15 artists

## UI

Create a simple dashboard page displaying:

* top tracks
* top artists
* timeframe selector

No AI yet.

## Deliverables

Generate:

* Spotify API utilities
* typed API responses
* dashboard data fetching
* loading skeletons
* timeframe selector

## Test Checklist

Before continuing:

* dashboard loads user data
* timeframe switching works
* artists display correctly
* tracks display correctly
* images render correctly
* API calls succeed

STOP AFTER THIS PHASE.

Do NOT implement AI yet.

---

# PHASE 4 — Audio Feature Analysis

## Goal

Analyze listening patterns using Spotify audio features.

## Features

Fetch and calculate:

* energy
* valence
* danceability
* acousticness
* tempo
* instrumentalness

Create:

* aggregated listening profile
* averaged metrics

## UI

Add:

* radar chart
* stat cards
* vibe metrics

## Example Output

{
energy: 0.62,
valence: 0.44,
acousticness: 0.71
}

## Deliverables

Generate:

* audio feature utilities
* profile aggregation logic
* charts/graphs
* reusable stat components

## Test Checklist

Before continuing:

* audio features calculate correctly
* charts render
* no API failures
* averages look reasonable

STOP AFTER THIS PHASE.

Do NOT implement Gemini yet.

---

# PHASE 5 — Gemini AI Identity Generation

## Goal

Generate emotional listening identities using Gemini AI.

## Features

Send summarized listening profile to Gemini.

Gemini should return:

* identity name
* short description
* 3 emotional traits
* vibe summary

Examples:

* Nocturnal Romantic
* Velvet Chaos
* Cinematic Overthinker

Responses should:

* avoid generic moods
* feel emotional/aesthetic
* be concise
* use JSON

## Traits must come from this list:

* Dreamy
* Romantic
* Nostalgic
* Melancholic
* Energetic
* Chaotic
* Confident
* Introspective
* Cinematic
* Euphoric
* Rebellious
* Playful
* Focused
* Adventurous
* Warm

## Fallback System

If Gemini fails:
generate identity locally using heuristics.

## Deliverables

Generate:

* Gemini API utility
* AI prompt logic
* fallback logic
* typed AI responses

## Test Checklist

Before continuing:

* Gemini responses work
* identities feel unique
* fallback logic works
* no API crashes

STOP AFTER THIS PHASE.

---

# PHASE 6 — Final Identity Dashboard UI

## Goal

Transform the dashboard into a polished cinematic experience.

## Features

Create:

* hero identity card
* glowing gradient UI
* trait bars
* artist cards
* listening stats
* animated charts
* aura/vibe sections

## Sections

* Identity Hero
* Trait Breakdown
* Listening Vibe
* Top Artists
* Listening Stats
* Aura Color
* Timeline Placeholder

## Styling

Use:

* glassmorphism
* gradients
* glow effects
* smooth transitions
* Framer Motion

## Deliverables

Generate:

* polished dashboard
* reusable UI components
* responsive layouts
* animations
* mobile optimization

## Test Checklist

Before continuing:

* UI feels polished
* mobile layout works
* animations are smooth
* no hydration errors
* charts animate correctly

STOP AFTER THIS PHASE.

---

# PHASE 7 — Shareable Results Card

## Goal

Create a social-sharing style identity card.

## Features

Generate a compact visual card showing:

* identity title
* top artists
* traits
* listening vibe

Add:

* download/share button

## Deliverables

Generate:

* share card component
* export/download functionality
* responsive social layout

## Test Checklist

Before continuing:

* card renders correctly
* export works
* mobile formatting works

STOP AFTER THIS PHASE.

---

# PHASE 8 — Cleanup & Production Readiness

## Goal

Prepare app for deployment.

## Features

* environment validation
* loading states
* error handling
* responsive QA
* accessibility improvements

## Deliverables

Generate:

* production-ready cleanup
* final folder cleanup

## Final Test Checklist

* no TypeScript errors
* production build succeeds
* OAuth works in production
* no console errors
* environment variables documented

END OF PROJECT.
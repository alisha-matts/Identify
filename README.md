# Identify

Identify is a Next.js App Router project for turning Spotify listening patterns
into a visual identity profile.

## Phase 1

Implemented:

- Next.js App Router structure
- Tailwind CSS setup
- Dark responsive landing page
- Header/navigation
- Reusable landing UI components
- Spotify login button placeholder

Spotify OAuth is intentionally not implemented until Phase 2.

## Phase 2

Implemented:

- Spotify OAuth login redirect at `/api/auth/login`
- Spotify callback route at `/api/auth/callback/spotify`
- Authorization code token exchange
- OAuth state cookie validation
- httpOnly Spotify session cookie
- Redirect to `/dashboard` after successful login
- Landing-page error states for failed auth

Required Spotify redirect URI:

```text
http://127.0.0.1:3000/api/auth/callback/spotify
```

Listening data is intentionally not fetched until Phase 3.

## Phase 3

Implemented:

- Spotify top tracks fetching from `/me/top/tracks`
- Spotify top artists fetching from `/me/top/artists`
- 25-track and 15-artist limits
- Last month, Last 6 months, and Last year timeframe selector
- Timeframe mapping to `short_term`, `medium_term`, and `long_term`
- Dashboard data display with track and artist images
- Dashboard loading skeletons

Audio feature analysis and AI identity generation are intentionally not
implemented until later phases.

## Phase 4

Implemented:

- Estimated metrics for energy, valence, danceability, acousticness, tempo, and
  instrumentalness
- Listening profile summary
- Radar chart visualization
- Audio metric stat cards
- Vibe metric labels

Gemini and AI identity generation are intentionally not implemented until
Phase 5.

## Phase 5

Implemented:

- Gemini identity generation using JSON mode
- Prompt generation from listening profile, top tracks, and top artists
- Identity name, description, three approved emotional traits, and vibe summary
- Trait score mapping
- Local heuristic fallback when Gemini is unavailable or invalid

Final cinematic dashboard polish is intentionally not implemented until Phase 6.

## Phase 6

Implemented:

- Cinematic identity hero card
- Responsive glassmorphism dashboard layout
- Trait breakdown bars
- Listening profile section with radar and metric cards
- Top artists panel
- CSS-driven hover, glow, and motion effects

Share/export features and code cleanup are intentionally not implemented until
later phases.

## Local Setup

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

Do not use `localhost` for this project.

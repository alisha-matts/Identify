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

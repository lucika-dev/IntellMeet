# @wraith/auth

Wraith Auth is a hosted-auth SDK for web apps.

- Your users integrate this package in their frontend and backend.
- They only use publishable/browser-safe values on the client.
- Real auth authority (OAuth exchange, token verification, profile sync) stays on your hosted auth/backend services.

## Install

```bash
pnpm add @wraith/auth @supabase/supabase-js
```

## 1) Set environment variables

Frontend env (`.env.local` for Next.js, `.env` for Vite):

```bash
# Supabase browser config (publishable)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx

# or Vite
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxx

# Hosted Wraith auth origin
NEXT_PUBLIC_AUTH_ORIGIN=https://auth.wraithorg.com
# or
VITE_AUTH_ORIGIN=https://auth.wraithorg.com
```

Backend env:

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

## 2) Frontend setup (minimal)

```ts
import auth from '@wraith/auth';

const session = await auth.requireAuth();
if (session) {
  // user is authenticated
}
```

Named import style:

```ts
import { createWraithAuth } from '@wraith/auth';

const auth = createWraithAuth({
  authOrigin: 'https://auth.wraithorg.com'
});
```

## 3) Auth redirect flow

Use Wraith hosted login URL and preserve `return_to`:

```ts
import auth from '@wraith/auth';

const loginUrl = auth.buildLoginUrl(window.location.href);
window.location.href = loginUrl;
```

Your callback page should:

1. Read session (or hydrate tokens from hash if your flow returns hash tokens).
2. Call your backend sync endpoint with bearer token.
3. Fetch profile status (`/api/user/me`).
4. Redirect either to profile completion or `return_to`.

## 3.1) Logout and account switching

By default, Wraith auth should be treated as app-scoped account switching:

- `auth.signOut({ switchAccount: true })` clears the current app session and sends the user back through the login flow with account chooser enabled.
- `auth.signOut({ global: true })` exists for advanced/admin use cases, but should not be surfaced in the normal product UI.

This matches the usual website model: users can sign out of one app without losing access to unrelated apps that also use Wraith auth.

## 4) Backend verification and middleware

```ts
import { authMiddleware, supabaseAdmin } from '@wraith/auth/server';

app.get('/api/private', authMiddleware, async (req, res) => {
  res.json({ ok: true });
});
```

## 5) Complete profile page ownership model

You can host the complete profile UI in the customer app (their frontend), while auth trust stays on Wraith services:

- Customer frontend collects profile fields.
- Customer frontend sends authenticated request with bearer token.
- Customer backend (or Wraith-backed endpoint) verifies token and persists profile.
- Redirect user to `return_to` once onboarding/profile completion is done.

## 6) Recommended production guardrails

- Strict allowlist for accepted `return_to` hosts.
- Signed state or nonce validation for callback flow.
- Rate limit OAuth start/sync endpoints.
- Never expose service-role secrets to browsers.

## API

### `createWraithAuth(options)`

Options:

- `supabaseUrl?: string`
- `supabaseAnonKey?: string`
- `storageKey?: string`
- `authOrigin?: string`

Returns:

- `supabase`
- `getSession()`
- `requireAuth(returnTo?)`
- `buildLoginUrl(returnTo?)`
- `redirectToLogin(returnTo?)`
- `signOut()`

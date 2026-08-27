# Valyd SDK Starter

A minimal Express app that demonstrates the full **Valyd OpenID Connect** flow using
`@valyd/sdk`: state, nonce, S256 PKCE, one-time code exchange, RS256/JWKS
signature validation, and UserInfo.

## Why a server-side OIDC transaction?

The SDK generates `state`, `nonce`, and the PKCE verifier together. This starter stores that
transaction server-side and sends only an opaque lookup cookie to the browser. The callback
consumes it once, compares `state`, sends the verifier, and validates the signed ID token.

## Run it

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# → fill in VALYD_CLIENT_ID, VALYD_CLIENT_SECRET, VALYD_REDIRECT_URI

# 3. Start
npm run dev
# → http://localhost:8080
```

In the [Valyd dev portal](https://dev.valyd.work), create a **project** (a "Login with Valyd" app).
Give it a **Domain** and a **Redirect URL** matching `VALYD_REDIRECT_URI`
(default: `http://localhost:8080/callback`) — redirects are exact-match. Copy the project's
**Client ID** and **Client Secret** into `.env`. The default scopes are `profile verifications`.

> Verification for the signed-in user lives on the project's **Verification** tab (its API key +
> workflows). For a quick no-account anti-spoof check, every organization also has a built-in
> **Verify Fresh** key on the dashboard.

## What's wired up

| Route             | What it does                                                            |
| ----------------- | ----------------------------------------------------------------------- |
| `GET  /`          | Home — login button, or signed-in profile card                          |
| `GET  /login`     | Create + store an OIDC transaction, then redirect to Valyd              |
| `GET  /callback`  | Validate state/PKCE/nonce/signature, then fetch UserInfo                 |
| `POST /logout`    | Destroys the in-memory app session and cookies                          |

To repoint at a different Valyd environment, edit `src/config.ts` (or set
`VALYD_BASE_URL` in `.env`). No other file changes required.

## Layout

```
src/
  config.ts        — single place for env config
  server.ts        — Express routes + SDK calls
  sessions.ts      — tiny in-memory app session store (swap for Redis in prod)
  views/           — server-rendered HTML
public/styles.css  — styling
.env.example
```

## Production checklist

- Replace `sessions.ts` with Redis / your DB session store.
- Set `NODE_ENV=production` so cookies are issued with `Secure`.
- Serve over HTTPS.
- Never expose `VALYD_CLIENT_SECRET`, tokens, or the OIDC transaction to browser JS.

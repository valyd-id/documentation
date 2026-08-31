# Authorization Code flow

> 🔑 **Auth:** `client_id` + `client_secret` (server-side) · 👤 **This IS the login** — standard OpenID Connect · 📖 **Result:** tokens on your backend, user profile via UserInfo

The Authorization Code flow is the main way an app logs a user in with Valyd. The browser only
ever carries a one-time `code`; your backend exchanges it for tokens using your `client_secret`,
so no token ever touches the front end.

## When to use it

- Any app with a backend (web app, SSR site, mobile app with a server) that wants **Connect with
  Valyd**.
- You want the user's profile, `id_verified` status, licenses, or verification proofs after login.
- You're using the [drop-in button](/docs/flows/button), the `@valyd/sdk`, or
  [your own OIDC library](/docs/oidc) — all of them run this exact flow underneath.

Don't use it for the [Unique Human API](/verifications/unique-human) — those API-key calls answer
"is this a live, unique human?" with no user login involved at all.

## How it works

```mermaid
sequenceDiagram
    participant B as Browser
    participant Y as Your backend
    participant V as Valyd IdP
    B->>Y: 1. GET /login
    Note over Y: generate state + nonce (+ PKCE), store server-side
    Y-->>B: 2. 302 to /api/auth/oidc/authorize?client_id=...
    B->>V: 3. follow redirect
    Note over B,V: user signs in and approves the scopes (consent screen)
    V-->>B: 4. 302 to your redirect_uri?code=...&state=...
    B->>Y: 5. GET /callback?code&state
    Note over Y: 6. compare state (CSRF)
    Y->>V: 7. POST /api/auth/oidc/token
    V-->>Y: access_token + refresh_token + id_token
    Note over Y: 8. verify id_token (RS256/JWKS, nonce)
    Y->>V: 9. GET /userinfo (Bearer)
    V-->>Y: sub, name, id_verified, ...
    Y-->>B: 10. your own app session
```

## Steps

1. **Start the flow.** Your login route generates a random `state` + `nonce` (and an S256 PKCE
   pair), stores them server-side, and redirects the browser to
   `https://idp.valyd.work/api/auth/oidc/authorize` with `client_id`, `redirect_uri`,
   `response_type=code`, `scope` (must include `openid`), `state`, and `nonce`. With the SDK
   this is `valyd.createAuthorizationRequest({ scope: [...] })`.
2. **User authenticates and consents.** Valyd shows the consent screen with the requested
   scopes; on approval it issues a one-time authorization `code`.
3. **Callback.** Valyd redirects the browser to your registered `redirect_uri` with
   `?code=…&state=…`. The `state` is echoed back unchanged.
4. **CSRF check.** Compare the callback `state` strictly against the value you stored. Reject
   with HTTP 400 on any mismatch, before touching the code.
5. **Exchange the code (server-side).** `POST https://idp.valyd.work/api/auth/oidc/token` with
   `grant_type: "authorization_code"`, your client credentials, the `code`, and the **same**
   `redirect_uri`. The response is a top-level token JSON: `access_token`, `refresh_token`,
   `id_token`, `expires_in` (≈ 900), `scope`, `token_type`.
6. **Validate the ID token.** Verify the RS256 signature against the JWKS at
   `https://idp.valyd.work/api/auth/oidc/jwks.json`, and check `iss`, `aud` (= your
   `client_id`), `exp`, and that `nonce` equals the value you sent. The SDK's
   `handleCallback()` does steps 4–6 in one call.
7. **Fetch the user.** `GET https://idp.valyd.work/api/auth/oidc/userinfo` with
   `Authorization: Bearer <access_token>` returns `sub` (stable `valyd_…` id),
   `preferred_username`, `name`, `id_verified`, and more per the granted scopes. Set your own
   app session and you're done.

## Security notes

- **Codes are single-use, short-lived, and client-bound** — exchange immediately; a replay
  returns `invalid_grant`.
- **The `state` comparison is your CSRF protection.** Never skip it.
- **The `nonce` check is your replay protection** for the ID token.
- **`client_secret` and tokens live on your backend only** — the exchange must never run in the
  browser.
- Access tokens last ~15 minutes; use the [refresh flow](/docs/flows/refresh) to renew.
  Refresh tokens rotate on every use.
- The `redirect_uri` must exactly match a registered redirect URI — scheme, host, and path.

## Build it

- Drop-in front end: the [Sign-in button flow](/docs/flows/button)
- Full raw-HTTP walkthrough with SDK + Python/PHP/Java examples: [Authentication](/docs/authentication)
- Complete Express example: [Node.js quickstart](/docs/quickstart/node)
- Bring your own library via discovery: [Use any OIDC library](/docs/oidc)
- What's inside each token: [Tokens](/docs/tokens)

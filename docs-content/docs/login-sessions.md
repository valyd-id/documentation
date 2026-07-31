> Source: https://{{DOCS_BASE_URL}}/docs/login-sessions
> Part of: Valyd ID API documentation — static copy generated for AI agents
> Generated from repo component: LoginSessionsSection.tsx

# Login sessions (CSRF protection)

## Agent Quick-Start
- Source URL: https://{{DOCS_BASE_URL}}/docs/login-sessions
- Credentials / env vars needed: none directly (relies on the configured `valyd` client, which uses your client ID/secret — get these from the Valyd developer portal → your project → Credentials)
- Files an integrator edits: server route handlers (the login redirect route and the callback route)
- Estimated steps: 2
- Can complete without human input: YES — this is a code-only CSRF mechanism using SDK methods; no portal action is required for the mechanism itself (though the `valyd` client must already be configured with credentials).
- Prerequisites:
  - A configured `valyd` client (`new ValydClient({...})`) from `@valyd/sdk` version `^0.2.0` or later.
  - Server-side storage available for the marker (httpOnly cookie, encrypted session, or KV store).

The classic OAuth CSRF check — generate a random `state`, then compare what the IdP echoes — does NOT work for Valyd TPSSO, because Valyd returns its own session id on the callback. The SDK ships with a purpose-built mechanism: **login sessions**.

**The problem:** Comparing the callback `state` against the value you sent will always fail — Valyd substitutes its own opaque session id on the redirect back.

**The solution:** Call `createLoginSession()` before the redirect and store the `marker` server-side. On the callback, call `verifyLoginSession(marker)`.

### Prerequisites

- A configured `valyd` client instance from `@valyd/sdk` (`^0.2.0`+), constructed with your `clientId`, `clientSecret`, and `redirectUri` (get the client ID and secret from the Valyd developer portal → your project → Credentials).
- Server-side storage for the marker: an `httpOnly` cookie, an encrypted server session, or a KV store. The marker must never be exposed to client-side JavaScript.

### Steps

1. **Before redirecting the user to Valyd, create a login session and store the marker.** `createLoginSession()` returns an `authorizeState` and an HMAC-signed `marker`. Store the marker server-side (here, an `httpOnly` cookie with a 10-minute lifetime to match the marker TTL), then redirect to the authorize URL using `session.authorizeState` as `state`.

   ```typescript
   // 1. Before redirecting the user to Valyd
   const session = await valyd.createLoginSession();
   // → { authorizeState: "...", marker: "v1.<sig>.<payload>" }

   res.cookie("valyd_login", session.marker, {
     httpOnly: true,
     sameSite: "lax",
     secure: true,
     maxAge: 10 * 60 * 1000, // 10 minutes (matches marker TTL)
   });

   res.redirect(valyd.getAuthorizationUrl({
     state: session.authorizeState,
     scope: ["profile", "verifications"],
   }));
   ```

   **Expected output:** `createLoginSession()` resolves to `{ authorizeState: "...", marker: "v1.<sig>.<payload>" }`. The `valyd_login` cookie is set with the marker, and the browser is redirected (HTTP 302) to the Valyd authorize URL.

2. **On the callback, verify the stored marker.** Read the marker from your server-side storage and pass it to `verifyLoginSession(marker)`. It returns `{ valid: boolean }` and never throws on an invalid marker.

   ```typescript
   // 2. On the callback
   const marker = req.cookies.valyd_login;
   const { valid } = await valyd.verifyLoginSession(marker);
   if (!valid) {
     // Expired login, missing cookie, or tampered marker.
     return res.status(400).send("Invalid login session");
   }
   ```

   **Expected output:** On a legitimate login within the TTL, `verifyLoginSession(marker)` returns `{ valid: true }`. Otherwise it returns `{ valid: false }` and this route responds HTTP 400 with body `"Invalid login session"`.

   IF the marker cookie is present and within its 10-minute TTL and untampered:  → `{ valid: true }`; proceed to `exchangeCode()`.
   IF the marker is expired (older than 10 minutes), the cookie is missing, or the marker was tampered with:  → `{ valid: false }`; respond HTTP 400 `"Invalid login session"` and stop. Do NOT call `exchangeCode()`.
   IF you are unsure whether the marker is valid:  → call `await valyd.verifyLoginSession(marker)` and branch on the returned `valid` boolean (it never throws).

### Marker / login-session properties

| Property | Details |
| --- | --- |
| Marker format | HMAC-signed string. Signed with your client secret on Valyd's side. |
| TTL | 10 minutes. After that, `verifyLoginSession` returns `{ valid: false }`. |
| Storage | Server only — `httpOnly` cookie, encrypted session, or KV. Never expose to JS. |
| Return value | `verifyLoginSession` returns `{ valid: boolean }`. It never throws on an invalid marker. |
| When to verify | On the callback, before `exchangeCode()`. |

A full Express example is available in the SDK repo: https://github.com/valyd/idp-sdk/blob/HEAD/examples/express-login.ts

### Verification

- Happy path: complete a real login. On the callback, `verifyLoginSession(marker)` should return `{ valid: true }` and the request should proceed to `exchangeCode()`.
- Negative path: clear or wait out the `valyd_login` cookie (or modify a character in the marker), then hit the callback. `verifyLoginSession(marker)` should return `{ valid: false }` and the route should respond HTTP 400 `"Invalid login session"`.

### Common errors

- **Using OAuth `state` comparison for CSRF.**
  - **Cause:** Valyd substitutes its own opaque session id for the `state` on the callback, so comparing it to the value you sent always fails (and offers no protection).
  - **Fix:** Use the login-session mechanism: `createLoginSession()` before the redirect, store the `marker` server-side, and `verifyLoginSession(marker)` on the callback.

- **`verifyLoginSession` returns `{ valid: false }` for a legitimate user.**
  - **Cause:** The marker expired (more than 10 minutes elapsed before the callback), the cookie was not sent back, or the marker was altered in transit/storage.
  - **Fix:** Set the marker cookie with `maxAge: 10 * 60 * 1000` to match the TTL, ensure it is `httpOnly` and returned on the callback, and have the user complete login within 10 minutes. Store the marker verbatim — do not re-encode or truncate it.

- **Exposing the marker to client-side JavaScript.**
  - **Cause:** Storing the marker somewhere readable by the browser (non-`httpOnly` cookie, localStorage), which undermines the CSRF protection.
  - **Fix:** Store the marker server-side only — an `httpOnly` cookie, an encrypted server session, or a KV store. Never expose it to JS.

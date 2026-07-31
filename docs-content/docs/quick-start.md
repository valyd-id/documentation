> Source: https://{{DOCS_BASE_URL}}/docs/quick-start
> Part of: Valyd ID API documentation — static copy generated for AI agents
> Generated from repo component: QuickStartSection.tsx

# Quick start — Login with Valyd

## Agent Quick-Start
- Source URL: https://{{DOCS_BASE_URL}}/docs/quick-start
- Credentials / env vars needed: VALYD_CLIENT_ID, VALYD_CLIENT_SECRET, VALYD_REDIRECT_URI
- Files an integrator edits: .env, server route handlers (e.g. server.ts: /login and /callback)
- Estimated steps: 6
- Can complete without human input: NO — the client ID, client secret, and registered redirect URI must be created/copied by a human from the Valyd developer portal, and scopes must be enabled there.
- Prerequisites:
  - Node.js 18+ installed.
  - A registered app in the Valyd developer portal with a client ID and client secret.
  - The redirect URI (e.g. http://localhost:8080/callback) registered in the portal, matching exactly (no trailing slash).
  - The scopes you intend to request (profile, verifications, doctor_license, zkp, mcp) enabled in the portal.

### Prerequisites

- Node.js 18+ (the SDK requires it).
- `@valyd/sdk` version `^0.2.0` or later (older versions lack the login-session helpers used here).
- A Valyd app with credentials. Obtain `VALYD_CLIENT_ID` and `VALYD_CLIENT_SECRET` from the Valyd developer portal (get these from the developer portal → your project → Credentials). `VALYD_CLIENT_SECRET` is server-side only and must never reach a browser.
- A redirect URI registered in the portal that exactly matches `VALYD_REDIRECT_URI` (no trailing slash).
- Scopes enabled in the portal: any of `profile`, `verifications`, `doctor_license`, `zkp`, `mcp`.

### Steps

1. **Install the SDK.** Run the install command (the official `@valyd/sdk` handles the full TPSSO/OAuth2 flow, login sessions for CSRF protection, and typed resource calls).

   ```bash
   npm install @valyd/sdk@^0.2.0
   ```

   **Expected output:** npm adds `@valyd/sdk` (a `0.2.x` or newer release) to `dependencies` in `package.json` and reports the package was added with no error exit code.

2. **Create the `.env` file.** Use `KEY=value` with no spaces around `=`. The values shown are examples — substitute your own.

   ```bash
   # .env  — no spaces around =
   VALYD_CLIENT_ID=9357c59bc1794b4c9efe8823e5878147
   VALYD_CLIENT_SECRET=sk_live_a1b2c3d4e5f6...
   VALYD_REDIRECT_URI=http://localhost:8080/callback
   ```

   - `VALYD_CLIENT_ID` — get this from the Valyd developer portal → your project → Credentials.
   - `VALYD_CLIENT_SECRET` — get this from the Valyd developer portal → your project → Credentials. Server-side only; never bundle into the browser.
   - `VALYD_REDIRECT_URI` — must match the value registered in the portal exactly (no trailing slash). For local dev use e.g. `http://localhost:8080/callback` and also register it in the portal.

   **Expected output:** A `.env` file on disk with the three keys set. No command output; verify the file contents are correct.

3. **Initialize the client.** Construct a `ValydClient` from your environment variables. `baseUrl` defaults to `https://{{IDP_BASE_URL}}`.

   ```typescript
   // server.ts
   import { ValydClient } from "@valyd/sdk";

   const valyd = new ValydClient({
     clientId: process.env.VALYD_CLIENT_ID!,
     clientSecret: process.env.VALYD_CLIENT_SECRET!,
     redirectUri: process.env.VALYD_REDIRECT_URI!, // e.g. http://localhost:8080/callback
     // baseUrl defaults to https://{{IDP_BASE_URL}}
   });
   ```

   **Expected output:** A configured `valyd` client instance. No network call is made at construction.

4. **Start a login session and redirect to Valyd.** Before redirecting the user, call `createLoginSession()`. This issues an HMAC-signed marker that you must store server-side (here, an `httpOnly` cookie). Then build the authorize URL with `getAuthorizationUrl()` and redirect.

   ```typescript
   // 1. Start a login session before redirecting the user.
   //    This issues an HMAC-signed marker you must store server-side.
   app.get("/login", async (req, res) => {
     const session = await valyd.createLoginSession();

     // Persist the marker (httpOnly cookie or server session).
     res.cookie("valyd_login", session.marker, {
       httpOnly: true,
       sameSite: "lax",
       secure: process.env.NODE_ENV === "production",
       maxAge: 10 * 60 * 1000, // 10 minutes
     });

     // 2. Build the authorize URL and redirect.
     const url = valyd.getAuthorizationUrl({
       state: session.authorizeState,
       scope: ["profile", "verifications"],
       productName: "My App",
     });
     res.redirect(url);
   });
   ```

   **Expected output:** `createLoginSession()` returns an object containing `authorizeState` and `marker`. The browser is redirected (HTTP 302) to the Valyd authorize URL, and the `valyd_login` cookie is set with the marker.

5. **Handle the callback and verify the login session (CSRF check).** On the callback route, parse the query, then verify the stored marker — NOT the callback `state`.

   ```typescript
   // 3. Handle the callback.
   app.get("/callback", async (req, res) => {
     const { code, error } = valyd.parseCallback(req.url);
     if (error || !code) return res.status(400).send(error ?? "missing code");

     // 4. CSRF check — verify the marker we stored, NOT the callback state.
     const marker = req.cookies.valyd_login;
     const check = await valyd.verifyLoginSession(marker);
     if (!check.valid) return res.status(400).send("Invalid login session");
   });
   ```

   **Expected output:** `parseCallback(req.url)` returns `{ code, error }`. On a valid login, `verifyLoginSession(marker)` returns `{ valid: true }`. If the marker is expired, missing, or tampered, it returns `{ valid: false }` and the route responds HTTP 400 `"Invalid login session"`.

   IF the callback contains an `error` or no `code`:  → respond HTTP 400 with the error message (or `"missing code"`) and stop.
   IF `verifyLoginSession(marker)` returns `{ valid: false }`:  → respond HTTP 400 `"Invalid login session"` and stop; do NOT exchange the code.
   IF you are tempted to compare the sent `state` to the callback `state`:  → do NOT. Valyd does not echo your `state`; the callback `state` is Valyd's own session id. Use `verifyLoginSession(marker)` instead. See login-sessions.md.

6. **Exchange the code for tokens and call resource endpoints.** After the CSRF check passes, exchange the authorization code and use the access token to fetch user data.

   ```typescript
   // 5. Exchange the code for tokens.
   const tokens = await valyd.exchangeCode(code);

   // 6. Call resource endpoints with the access token.
   const profile = await valyd.getUserInfo(tokens.accessToken);
   const verifications = await valyd.getVerifications(tokens.accessToken);

   res.clearCookie("valyd_login");
   // ...set your own app session and redirect the user.
   ```

   **Expected output:** `exchangeCode(code)` returns a tokens object containing `accessToken`. `getUserInfo(tokens.accessToken)` returns the user's profile and `getVerifications(tokens.accessToken)` returns their verifications. The `valyd_login` cookie is cleared. You then set your own app session and redirect the user.

### The flow at a glance

| Step | What | SDK method |
| --- | --- | --- |
| 1 | Start login, store marker | `createLoginSession()` |
| 2 | Redirect to Valyd | `getAuthorizationUrl()` |
| 3 | Read callback query | `parseCallback()` |
| 4 | CSRF check | `verifyLoginSession(marker)` |
| 5 | Get tokens | `exchangeCode(code)` |
| 6 | User data | `getUserInfo()`, `getVerifications()`, … |

### Environment & app setup

| Item | Rule |
| --- | --- |
| `VALYD_CLIENT_ID` | From the dev portal. |
| `VALYD_CLIENT_SECRET` | Server-side only. Never bundle into the browser. |
| `VALYD_REDIRECT_URI` | Must match the portal value exactly (no trailing slash). |
| Local dev | e.g. `http://localhost:8080/callback` — also register in the portal. |
| Scopes | Enable in the portal: `profile`, `verifications`, `doctor_license`, `zkp`, `mcp`. |

### Verification

- Confirm the SDK installed at the required version:

  ```bash
  npm ls @valyd/sdk
  ```

  **Expected output:** `@valyd/sdk@0.2.x` (or newer) listed. If it shows below `0.2.0`, the login-session helpers (`createLoginSession`, `verifyLoginSession`) will be missing.

- Run the full round trip: start the server, visit the `/login` route in a browser, complete login at Valyd, and confirm the `/callback` route reaches step 6. A successful run sets the `valyd_login` cookie on `/login`, passes `verifyLoginSession` on the callback, and returns a populated `profile` from `getUserInfo`.

### Common errors

- **Comparing OAuth `state` for CSRF (the most common mistake).**
  - **Cause:** Valyd (TPSSO) does not echo the `state` you send on `authorize`; the `state` on the callback is Valyd's own session id, so `sentState !== callbackState` is always "broken" and rejects valid logins.
  - **Fix:** Do not compare states. Use `createLoginSession()` before redirect and `verifyLoginSession(marker)` on the callback for CSRF. See login-sessions.md.

- **"Invalid login session" on the callback.**
  - **Cause:** The marker cookie is missing (cookie not set, blocked, or expired beyond the 10-minute TTL) or tampered, so `verifyLoginSession(marker)` returns `{ valid: false }`.
  - **Fix:** Ensure the `valyd_login` cookie is set on `/login` with `maxAge: 10 * 60 * 1000` and `httpOnly: true`, that the browser sends it back on `/callback`, and that the user completes login within 10 minutes.

- **Redirect URI mismatch / scope errors at the authorize step.**
  - **Cause:** `VALYD_REDIRECT_URI` does not exactly match the value registered in the portal (e.g. a trailing slash), or a requested scope is not enabled in the portal.
  - **Fix:** Make `VALYD_REDIRECT_URI` identical to the registered value (no trailing slash), and enable each requested scope (`profile`, `verifications`, `doctor_license`, `zkp`, `mcp`) in the portal before requesting it.

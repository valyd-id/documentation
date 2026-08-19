# Changelog

## v1.10.1 — Secure OIDC transaction (2026-08-18)

- **Added:** Login with Valyd is now standard OpenID Connect end to end. `valyd.auth.getAuthorizationUrl()`
  targets `GET /api/auth/oidc/authorize`, takes `state` + `nonce`, and adds the required `openid`
  scope automatically. `exchangeCode()` / `refreshToken()` use `POST /api/auth/oidc/token` and return
  the standard top-level token JSON (`access_token`, `refresh_token`, `id_token`, `expires_in`, `scope`).
- **Added:** `createAuthorizationRequest()` + `handleCallback(url, { transaction })` keep state,
  nonce, and S256 PKCE together and validate the RS256 ID token against discovery/JWKS.
- **Breaking (docs):** the IdP now **echoes your `state` back on the callback** — the standard OAuth
  `state` comparison is the correct, required CSRF check. The login-session "marker" pattern is
  deprecated; `createLoginSession()` / `verifyLoginSession()` are now deprecated no-ops kept only for
  backward compatibility.
- **Docs:** Login with Valyd and the Verification API are documented as separate integration paths.

## Docs — Anti-spoof, face uniqueness & developer accounts

- **Added (API docs):** `POST /api/v2/antispoof` (single image or live burst → `human_score`),
  `POST /api/v2/antispoof/identity` (liveness + stable `valyd_` uuid for duplicate detection),
  `POST /api/v2/face-uniqueness` (+ unlink), and `POST /api/v2/location` are now in the
  [Core APIs reference](/verifications/standalone).
- **Added (page):** [Developer accounts & sign-in](/docs/developer-accounts) — passwordless
  sign-in (magic link or face), connecting a Valyd ID to an email-only account, and one identity
  owning several console accounts with account switching.
- **Docs:** every relying party now receives the user's **real legal name** (not the pseudonym).

## v1.8.0 — Member resolve + reactivate; login-only consent

- **Added:** `resolveMember({ valydId })` / `{ email }` — look up ONE person's membership in your org
  at ANY role (returns the `Member` with `role` + `status`, or `null`). Lets you tell a workforce
  member apart from a developer/admin, or from someone not in your org. (`POST /api/sdk/members/resolve`)
- **Added:** `reactivateMember(memberId)` — undo a `removeMember`; restores `active` (or `invited` if
  never activated). (`PATCH /api/sdk/members/{memberId}/reactivate`)
- **Docs:** the member table now documents `removeMember` (deactivate) and `reactivateMember` — the
  older "no deactivate over the API" note was stale.
- **Breaking (behavior):** the **at-login attribute release** on the consent screen (`attr_code`,
  remembered consent) is **currently disabled** — the consent screen is **login-only**. Request raw
  data with the **after-login** `requestAttributes` flow (user approves in their Valyd app). See
  `/docs/request-data`.

## v1.5.1 — Unified SDK + Workforce Members API

- **Added:** Workforce Members API on `ValydClient` — `addMembers()` (single or bulk ≤ 500, `notify` flag), `getMembers()` (roster with `status` + `valyd_id`), `getBilling()` (seats, price, trial, balance, invoices).
- **Added:** One unified package `@valyd/sdk` — `valyd.auth` (Login with Valyd) + `valyd.verify` (verification) + workforce members; one credential, one host.
- **Docs:** The Organizations page lists every member operation; install is now `npm install @valyd/sdk@^1.10.1`.

---

## v0.2.0 — Legacy login-session helpers (superseded by v1.10.1)

- **Added:** `createLoginSession()` and `verifyLoginSession()` helpers.
- **Docs:** Clarified that the callback `state` is Valyd's session id, not your authorize state.
- **Breaking (docs):** Removed the state-equality CSRF pattern — use `verifyLoginSession` instead.

---

## v0.1.0 — Initial release

- **Added:** `ValydClient` with `getAuthorizationUrl`, `parseCallback`, `exchangeCode`, `refreshToken`.
- **Added:** Resource helpers: `getUserInfo`, `getLicenses`, `getCprLicense`, `getDoctorLicense`, `getVerifications`.

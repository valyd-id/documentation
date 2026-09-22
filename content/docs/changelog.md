# Changelog

## Platform update — OIDC standards compliance (2026-09-18)

The Valyd IdP now follows OAuth 2.0 / OpenID Connect to the letter. Any conformant OIDC library
works unchanged; hand-rolled integrations should check the **Breaking** items. Update to
**`@valyd/sdk` 1.12.0**, which matches the new contract.

- **Breaking (Authorize):** **PKCE is required for every client**, public and confidential —
  send `code_challenge` (43–128 base64url chars) + `code_challenge_method=S256` (`plain` is not
  supported) and the `code_verifier` at the token endpoint. Missing PKCE → redirect with
  `error=invalid_request`.
- **Breaking (Token / UserInfo / Registration errors):** OIDC protocol endpoints now return
  standard errors — `{"error":"invalid_grant","error_description":"…"}` (`error` is a **string**)
  with `Cache-Control: no-store`, instead of `{"success":false,"data":[],"error":{"code","message"}}`.
  `invalid_client` is `401` (+ `WWW-Authenticate: Basic` when HTTP Basic was used). UserInfo uses
  RFC 6750 (`401 invalid_token` / `403 insufficient_scope` with `WWW-Authenticate: Bearer`).
  Registration uses RFC 7591 (`invalid_redirect_uri`, `invalid_client_metadata`). Every other
  Valyd API keeps the envelope.
- **Breaking (Authorize errors):** once `client_id` + `redirect_uri` are verified, every error is
  redirected back to your app as `?error=…&error_description=…&state=…&iss=…`. **Cancel** on the
  consent screen → `access_denied`; a private org app with an unassigned user → `access_denied`
  (was a 403 JSON). Only an unknown client / unregistered `redirect_uri` shows an error page.
- **Breaking (Access token):** access tokens are RFC 9068 JWTs (`typ: at+jwt`) and `sub` is now the
  user's `valyd_…` id (same as the ID token and UserInfo — previously a numeric id); they also carry
  `jti`, `client_id`, `scope`, `valyd_id`, and `aud` = the RFC 8707 resource if bound, else `vc-api`.
- **Breaking (Token client auth):** use `client_secret_basic` **or** `client_secret_post` — both on
  one request → `invalid_request`. Basic credentials are form-urlencoded (RFC 6749 §2.3.1).
- **Changed (Authorize):** `state` is optional (still recommended) and echoed verbatim only if
  sent — no minimum length. `nonce` is optional and the ID token contains `nonce` **only if you
  sent one** (the IdP no longer invents one). `response_type` is `code` only, `response_mode`
  `query` only; `request` / `request_uri` → `request_not_supported` / `request_uri_not_supported`.
- **Changed (UserInfo):** `email_verified` is always `false` — Valyd does not verify email
  ownership; identity verification is the separate `id_verified` claim.
- **Changed (Logout):** RP-initiated logout (`/api/auth/oidc/logout`, GET or POST) now **ends the
  Valyd session in that browser** (cookies, refresh token, IdP web-app storage) and revokes the
  calling app's tokens for the user. Without a valid `id_token_hint` the user sees a "Sign out of
  Valyd?" confirmation. `post_logout_redirect_uri` must be registered (developer-portal apps may use
  a registered redirect URI until 2026-12-01); `state` is appended.
- **Added (Authorize):** GET **and POST** (form); `prompt` (`none` / `login` / `consent` /
  `select_account`) — `prompt=none` returns `login_required` / `consent_required`; `max_age`
  (ID token always has `auth_time` = the real sign-in time); `id_token_hint`; `login_hint`.
- **Added (Authorize):** RFC 9207 `iss` on every authorization response (success and error) —
  verify it equals the issuer. Advertised as `authorization_response_iss_parameter_supported: true`.
- **Added (Token):** refresh grant accepts an optional `scope` to **narrow** the new access token
  (widening → `invalid_scope`).
- **Added (UserInfo):** POST, and the token in a form-body `access_token` (not both).
- **Added (Discovery):** `response_modes_supported`, `prompt_values_supported`,
  `claim_types_supported`, `request_parameter_supported: false`,
  `request_uri_parameter_supported: false`, `claims_parameter_supported: false`,
  `frontchannel_logout_supported: false`, `backchannel_logout_supported: false`,
  `authorization_response_iss_parameter_supported: true`.
- **Fixed (Token):** replaying an authorization code is rejected **and revokes every token it
  already produced** (RFC 6749 §4.1.2).
- **SDK — `@valyd/sdk` 1.12.0:** reads both error shapes (`ValydError.code` = `error`);
  `getAuthorizationUrl()` throws `pkce_required` without `codeChallenge` — use
  `createAuthorizationRequest()`; `handleCallback()` verifies the callback `iss`
  (`issuer_mismatch`); new `getEndSessionUrl({ idTokenHint, postLogoutRedirectUri, state })`.
  See [Deprecations](/docs/deprecations).

## Platform update — recovery email, liveness reliability & auth (2026-09-16)

- **Changed (Account Recovery):** `startAccountRecovery` now **always emails** the recovery link to
  the member's on-file address — email is the primary channel for a locked-out user, so it no longer
  depends on an opt-in. The `deliverEmail` flag is deprecated and ignored; the hosted `recoveryUrl`
  is still returned so you can additionally deliver it via your own channel (SMS / in-app).
- **Improved (Liveness):** more reliable liveness capture — head-turn challenges are now verified by
  yaw *movement* (offset-invariant across cameras), the spoof threshold is calibrated per deployment,
  and the capture screen coaches distance and centering ("move closer", "center your face in the
  oval") before starting, cutting false "spoof detected" / "action not detected" rejections.
- **Changed (Auth):** login refresh tokens now last **24 hours**.
- **Improved (Auth):** when face login or registration is temporarily locked after too many
  attempts, the screen shows a **countdown timer** until you can try again, instead of a retry button
  that would only re-lock.

## v1.10.5 — Hosted flow only: standalone direct checks hidden (2026-08-27)

- **Changed (SDK):** the public surface is now the hosted flow only — `valyd.auth`
  (Connect with Valyd / OIDC), `verify.sessions.*` (hosted verification sessions), and the
  Unique Human API anti-spoof (`verify.standalone.antispoof` / `antispoofIdentity`).
- **Hidden (SDK):** the remaining standalone direct checks (`idVerification`, `faceMatch`,
  `locationMatch`, `ageVerification`, `credential`, `kycCredential`) and the `kyc.redirectUrl`
  helper are no longer exposed. Run these through a hosted workflow session instead; they return
  if/when standalone direct calls ship as a confirmed public API.
- **Docs:** install commands are now unversioned — `npm install @valyd/sdk` always pulls the latest published release.

## v1.10.4 — Workflow CRUD & evvPresence removed from the SDK (2026-08-21)

- **Removed (SDK):** `verify.workflows.*` CRUD — workflows are composed in the
  [Developer Portal](https://dev.valyd.work); the SDK no longer exposes create/list/update/remove.
  Pass the resulting `workflowId` to `verify.sessions.create({ workflowId, ... })`. Returns if/when
  the server contract is a confirmed public API.
- **Removed (SDK):** `verify.standalone.evvPresence` — the `/evv-presence` endpoint does not exist
  server-side (it always 404'd). Compose presence from `faceMatch` + `locationMatch` instead.

## v1.10.3 — Credential-type discovery (2026-08-20)

- **Added (SDK):** `verify.credentials.types(state?, provider?)` — list credential/license types
  (whole catalog, per-state, or per-provider-in-a-state), routed through the Valyd API (never `vc.*`
  directly).

## v1.10.2 — Anti-spoof in the SDK + idempotency (2026-08-19)

- **Added (SDK):** `verify.standalone.antispoof()` and `verify.standalone.antispoofIdentity()` —
  the `/api/v2/antispoof` endpoints are now first-class SDK methods (single `image` or 3–8 burst
  `frames`; `/identity` resolves the proven-live face to a stable `valyd_` uuid).
- **Added (SDK):** `verify.standalone.antispoofChallenge()` — single-use, 60s gesture challenge;
  echo `challengeId` back on antispoof / face-uniqueness runs (required by strict projects, which
  also accept `challengeId` on `faceUniqueness()`).
- **Added (SDK):** optional `idempotencyKey` on every billable standalone check — sent as the
  `Idempotency-Key` header so a network retry can never double-charge or double-run a check.
- **Docs:** [Standalone checks](/verifications/unique-human) split into per-check pages, SDK call
  first.

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
  [Standalone checks reference](/verifications/unique-human).
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
- **Docs:** The Organizations page lists every member operation.

---

## v0.2.0 — Legacy login-session helpers (superseded by v1.10.1)

- **Added:** `createLoginSession()` and `verifyLoginSession()` helpers.
- **Docs:** Clarified that the callback `state` is Valyd's session id, not your authorize state.
- **Breaking (docs):** Removed the state-equality CSRF pattern — use `verifyLoginSession` instead.

---

## v0.1.0 — Initial release

- **Added:** `ValydClient` with `getAuthorizationUrl`, `parseCallback`, `exchangeCode`, `refreshToken`.
- **Added:** Resource helpers: `getUserInfo`, `getLicenses`, `getCprLicense`, `getDoctorLicense`, `getVerifications`.

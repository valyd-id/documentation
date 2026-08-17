# Changelog

## Agent Quick-Start
- Source URL: https://docs.valyd.work/docs/changelog
- Credentials / env vars needed: none
- Files an integrator edits: none — reference only
- Estimated steps: 0 (read to confirm which SDK version introduces the helper you need)
- Can complete without human input: YES — this is a read-only version history.
- Prerequisites: none

This page tracks releases of the Valyd SDK. Tags: **Added** (new functionality), **Docs** (documentation-only changes), **Breaking (docs)** (a documented pattern was removed or changed).

---

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
- **Docs:** The Organizations page lists every member operation; install is now `npm install @valyd/sdk` (latest).

---

## v0.2.0 — Login sessions for TPSSO

- **Added:** `createLoginSession()` and `verifyLoginSession()` helpers.
- **Docs:** Clarified that the callback `state` is Valyd's session id, not your authorize state.
- **Breaking (docs):** Removed the state-equality CSRF pattern — use `verifyLoginSession` instead.

---

## v0.1.0 — Initial release

- **Added:** `ValydClient` with `getAuthorizationUrl`, `parseCallback`, `exchangeCode`, `refreshToken`.
- **Added:** Resource helpers: `getUserInfo`, `getLicenses`, `getCprLicense`, `getDoctorLicense`, `getVerifications`.

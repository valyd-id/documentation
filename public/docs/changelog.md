> Source: https://docs.valyd.work/docs/changelog
> Part of: Valyd ID API documentation — static copy generated for AI agents
> Generated from repo component: ChangelogSection.tsx

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

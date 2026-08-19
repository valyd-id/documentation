# Deprecations & removals

One place to check whether something you integrated against has changed. Anything not listed
here is current.

| What | Status | Since | Use instead |
| --- | --- | --- | --- |
| `POST /api/auth/tpsso/token`, `/refresh`, `/tpsso/authorize` (legacy TPSSO OAuth) | **Removed — 410 Gone** | 2026-08-18 | [`/api/auth/oidc/*`](/docs/endpoints) — see the [migration guide](/docs/migrate-tpsso-to-oidc) |
| SDK `createLoginSession()` / `verifyLoginSession()` (login-session "marker" CSRF) | **Deprecated no-ops** | SDK 1.10.1 | Standard `state` comparison — [`handleCallback()`](/docs/quickstart/node) does it for you |
| Comparing callback `state` was documented as *wrong* | **Reversed** | 2026-08-18 | State comparison is now the correct, required CSRF check |
| Age check `bands.*.verified` response field | **Deprecated alias** | 2026-08-19 | Read `satisfied` — same value, honest name ([why](/verifications/standalone)) |
| `pollus_id` user identifier | **Removed from API** | SDK 1.4.0 | `valyd_id` (same value as OIDC `sub`) |
| `/verifications/modes` docs page | Moved | 2026-08-19 | [Choose your integration](/docs/choose) |

**Policy:** removed endpoints return an explicit error (`410` with a pointer, never a silent
404). Deprecated SDK methods keep compiling but stop being documented. Breaking changes land in
the [changelog](/docs/changelog) first.

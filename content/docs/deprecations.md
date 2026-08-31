# Deprecations & removals

One place to check whether something you integrated against has changed. Anything not listed
here is current.

| What | Status | Since | Use instead |
| --- | --- | --- | --- |
| Age check `bands.*.verified` response field | **Deprecated alias** | 2026-08-19 | Read `satisfied` — same value, honest name ([why](/verifications/unique-human)) |
| `POST /api/auth/tpsso/token`, `/refresh`, `/tpsso/authorize` (legacy TPSSO OAuth) | **Removed — 410 Gone** | 2026-08-18 | [`/api/auth/oidc/*`](/docs/endpoints) — see the [OIDC guide](/docs/oidc) |

**Policy:** removed endpoints return an explicit error (`410` with a pointer, never a silent
404). Deprecated SDK methods keep compiling but stop being documented. Breaking changes land in
the [changelog](/docs/changelog) first.

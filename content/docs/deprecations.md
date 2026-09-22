# Deprecations & removals

One place to check whether something you integrated against has changed. Anything not listed
here is current.

| What | Status | Since | Use instead |
| --- | --- | --- | --- |
| Age check `bands.*.verified` response field | **Deprecated alias** | 2026-08-19 | Read `satisfied` — same value, honest name ([why](/verifications/unique-human)) |
| `POST /api/auth/tpsso/token`, `/refresh`, `/tpsso/authorize` (legacy TPSSO OAuth) | **Removed — 410 Gone** | 2026-08-18 | [`/api/auth/oidc/*`](/docs/endpoints) — see the [OIDC guide](/docs/oidc) |
| `/api/auth/oidc/authorize` **without PKCE** (no `code_challenge`, or `code_challenge_method=plain`) | **Removed** — redirected back with `error=invalid_request` | 2026-09-18 | Send `code_challenge` + `code_challenge_method=S256` and the `code_verifier` at the token endpoint — `valyd.auth.createAuthorizationRequest()` does it ([Authentication](/docs/authentication)) |
| Envelope-shaped errors (`{"success":false,"error":{"code","message"}}`) on the OIDC token, UserInfo and registration endpoints | **Replaced** | 2026-09-18 | Standard `{"error":"…","error_description":"…"}` (RFC 6749 §5.2 / RFC 6750 / RFC 7591) — `@valyd/sdk` ≥ 1.12 reads both ([Errors](/docs/errors#oidc-protocol-errors)). All non-OIDC APIs keep the envelope |
| Logout `post_logout_redirect_uri` matching one of the app's **redirect URIs** (instead of a registered post-logout URI) — developer-portal apps | **Transitional — sunset 2026-12-01** | 2026-09-18 | Register a dedicated post-logout URI for your app ([Refresh & logout](/docs/flows/refresh#logout--revocation)) |
| Server-generated `nonce` in the ID token when the client sent none | **Removed** | 2026-09-18 | Send your own `nonce` on `/authorize`; the ID token carries `nonce` only if you sent one |

**Policy:** removed endpoints return an explicit error (`410` with a pointer, never a silent
404). Deprecated SDK methods keep compiling but stop being documented. Breaking changes land in
the [changelog](/docs/changelog) first.

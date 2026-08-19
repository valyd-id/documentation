# Sessions

> 🧭 **One word, two things:** a *login session* (a signed-in user) and a *verification session* (one run through a check). They are unrelated objects with unrelated lifetimes.

Valyd docs use "session" for two different things. If you're debugging "the session expired",
first work out which one you're holding.

| | Login session | Verification session |
| --- | --- | --- |
| **What it is** | A signed-in user: an access token (~15 min) + a rotating refresh token (30 days) held by your backend, usually mirrored by your own app session cookie. | One person's single run through a [workflow](/verifications/workflows)'s checks: a `session_id`, hosted `url`, and a status machine ending in a decision. |
| **How it starts** | The [Authorization Code flow](/docs/flows/authorization-code) — button click, consent, code exchange at the token endpoint. | Your backend calls `POST /api/v2/session` with an `X-API-Key` and `workflow_id` ([hosted flow](/docs/flows/hosted-verification)). |
| **How long it lasts** | Access token ≈ 15 minutes, silently renewed via the [refresh flow](/docs/flows/refresh) for up to 30 days per rotating refresh token. | Until a terminal status — `APPROVED` / `DECLINED` / `ABANDONED` / `EXPIRED` (its `ttl_seconds` elapsed). See the [session lifecycle](/verifications/hosted#session-lifecycle). |
| **How it ends** | [Logout](/docs/flows/refresh#logout--revocation) via `end_session_endpoint` (revokes the client's tokens), refresh-token theft detection, or 30 days of silence. | It reaches a terminal status. Terminal is terminal: an abandoned or expired session is never resumed — create a new one. |
| **What survives it** | Nothing by itself — but proofs saved to the account outlive every login. | The decision (webhook + decision API); with a user token attached, a **proof** on the account. |

The bridge between the two is the [account-connected flow](/docs/flows/account-connected): a
login session supplies the `valyd_access_token`, a verification session runs with it, and the
resulting proof outlives both — readable on any future login without re-running the check.

Two practical corollaries:

- A dead **login** session doesn't invalidate any verification result; a finished
  **verification** session doesn't log anyone in.
- "Session expired" from a resource API means *refresh the access token*; `EXPIRED` from the
  decision API means *create a new verification session*.



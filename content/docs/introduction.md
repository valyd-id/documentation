# Introduction

Valyd does two things:

1. **Verification** — we verify people for you: KYC, liveness, face match, age, and professional
   licenses. Call it as a plain API from your backend (App API key, no user login), or let our
   hosted page handle the capture UI for you.
2. **Login with Valyd** — users sign in with their verified identity, and your app reads what
   their account already holds.

**The recommended way to verify is with the user's account:** run any verification with a
signed-in user's token and the passed proof saves to their Valyd account — your app reads
verified status instead of handling documents and personal data, and while the proof is still
fresh enough for your policy there's no re-run and no new per-check cost. Verification also
works without any login — but then the user's personal information is returned to your system,
and managing it becomes your responsibility.

Not sure which? → [Choose your integration](/docs/choose)

## Every API, in one table

| What | Needs login? | Credential | Where the result goes |
| --- | --- | --- | --- |
| [Account API](/docs/endpoints#resource-api--user-data) — `userinfo`, `licenses`, `verifications` (badges/proofs) | **Yes** | Bearer access token | Read-only — returns what the account already holds |
| [Checks API](/verifications/standalone) — KYC, liveness, face match, age, license lookup | No | `X-API-Key` | Your system (the HTTP response) |
| [Hosted](/verifications/hosted) — same checks on a Valyd-hosted capture page | No | `X-API-Key` + workflow | Your system (webhook + decision endpoint, all checks together) |
| [Account attach](/verifications/managed) — add `valyd_access_token` to any check | Yes, first | API key + user token | Your system **and** the user's account (reusable proof) |

Two rules cover everything:

- **Account API never runs a check** — it reads what previous checks already proved.
- **A check never touches an account** — unless you attach the user's token.

## Concepts & terms

| Term | Meaning |
| --- | --- |
| **Valyd ID** | A person's verified identity: their face vector, verified legal name, and every proof they've earned. One per human. |
| `valyd_id` | The stable identifier of that identity (`valyd_…`) — same value as the OIDC `sub`. Key your users on it. |
| **App** | What you register in the [Developer Portal](https://dev.valyd.work): an OAuth client (`client_id` + `client_secret`) for login, plus its verification capability. |
| **App API key** | The `X-API-Key` credential of the app's verification side — used for [checks](/verifications/standalone), never in a browser. |
| **Check** | One verification action (KYC, liveness, face match, license lookup). Returns one result. |
| **Workflow** | A saved bundle of checks for the [hosted flow](/verifications/hosted) — the user completes them in one session and you get one combined decision. |
| **Proof / badge** | The durable outcome of a passed check saved on a Valyd account (`id_verified`, verified licenses, age bands). Read via the [Account API](/docs/endpoints#resource-api--user-data). |
| **Scope** | What the user permits your app to read at login (`profile`, `verifications`, …). [Managed per app](/docs/scopes). |
| **Organization** | A shared workspace: one team, shared apps, a workforce roster, one bill. [Details](/docs/organizations). |
| **Workforce member** | A person in your org roster who signs into your apps by face — they never see the org itself. |
| **Consent flow** | The explicit approval step for releasing raw identity data (DOB, document fields) — separate from login. |

## What do you want to do?

- **Add "Sign in with Valyd" to my app** → [Login with Valyd](/docs) (a 2-line button)
- **See a full working login app** → [Complete example](/docs/quick-start)
- **Run one check and get the result** → [Verification quickstart](/verifications/quickstart)
- **Let Valyd handle the capture UI** → [Hosted verification](/verifications/hosted)
- **Save a passed check to the user's account** → [Account-connected](/verifications/managed)
- **Manage what my app may read** → [Scopes](/docs/scopes)

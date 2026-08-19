# Introduction

Valyd gives your business two things — and they work together or apart:

1. **An OIDC identity provider** — "Sign in with Valyd", standard OpenID Connect. Works with
   any OIDC library or a 2-line button.
2. **Verification workflows** — KYC, liveness, face match, age, license checks — run on a
   hosted page we serve, **with or without** a Valyd login.

## 1 · The identity provider

Users sign in with a verified identity. Your backend gets an access token, and with it three
APIs that read what the account already holds:

| API | One call gets you |
| --- | --- |
| [`GET /oidc/userinfo`](/docs/endpoints#get-userinfo--get-user-profile) | Who they are — legal name, username, country, `id_verified` |
| [`GET /oidc/licenses`](/docs/endpoints#get-licenses--get-professional-licenses) | Professional licenses already verified on their account |
| [`GET /oidc/verifications`](/docs/endpoints#get-verifications--get-identity-verifications) | Every proof and badge they've earned — KYC done, age bands |

If the account already proves what you need, **you're finished — no check, no cost.** One rule
to remember: the **Account API never runs a check** — it reads what previous checks already
proved. Raw identity data (DOB, document fields) is separate: it needs the user's explicit
[approval](/docs/request-data).

**Start here:** [add the login button](/docs) ·
[everything the token unlocks — on one page](/docs/user-token) ·
[use your own OIDC library](/docs/oidc) · [quickstart for your stack](/docs/quickstarts)

## 2 · The verification workflows

Need to run checks? Don't wire five APIs — **compose a workflow**: in the
[Developer Portal](https://dev.valyd.work) select the checks you want (KYC, liveness, license,
age), in order. That's your `workflowId`. Then one call:

```typescript
const session = await verify.sessions.create({ workflowId, redirectUrl });
// → send the person to session.url — they complete every check on our hosted page
// → the decision arrives on your webhook
```

The same call runs in two modes — that's the whole choice:

| | You pass | The person's data | You get back |
| --- | --- | --- | --- |
| **Tied to the user's identity** | `valydAccessToken` (they signed in) | Stays with us, encrypted | **Non-PII results + proofs** — saved to their Valyd ID, readable forever via the APIs above |
| **Standalone** | nothing extra — no login, no token (a [verification-only project](/verifications/setup) is all the setup) | **Comes home to you** — we keep no [identity data](/verifications/data-sharing) | Full results, identity data included, yours to manage |

**Start here:** [hosted for your users — every portal step](/docs/user-token/hosted) ·
[compose a workflow](/verifications/workflows)

## Working as an organization?

Put apps, workflows, and billing in a shared [Organization](/docs/organizations) — and let us
onboard your workforce: add people by API or CSV, each gets a face-activation link, and from
then on they sign into your apps by face. Roles (owner, admin, developer, member), member
management over the SDK, and one bill. Account **recovery** for members is coming soon.

---

## Verification without a Valyd account

Some integrations never want a Valyd account in the picture — you just need checks run and the
data delivered to **you**, Didit-style. Same call, same workflows — the setup is one dialog: a
**verification-only project** on the dashboard (no login setup, just an API key), and the full
results — identity data included — return to your system. We keep no identity data, only the
check-outcome record for billing and audit.

**[Standalone checks →](/verifications/standalone)** ·
**[What data you receive & your responsibilities →](/verifications/data-sharing)**

## Want to go deeper?

The two pages above get you live. When you want the full picture:
[how Valyd works](/docs/how-valyd-works) · [flows](/docs/flows/authorization-code) ·
[tokens](/docs/tokens) · [scopes](/docs/scopes) · [API reference](/docs/endpoints) ·
[errors](/docs/errors)

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

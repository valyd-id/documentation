# Introduction

Valyd is a verified-identity platform. You can **verify your users**, or let people **sign in
with an identity they've already verified** — so you read proofs instead of re-collecting
documents.

Three ways to integrate. Pick the one that fits what you're building:

- **Verification API** — verify a user from your own backend. You run the checks (KYC, liveness,
  face match, age, professional license) and get the result.
- **Hosted Verification** — send the user to a Valyd-hosted page. We handle the capture UI and
  the whole collection flow, then return the decision.
- **Login with Valyd** — let users sign in and reuse the identity proofs they already hold. You
  read their verified status instead of collecting it again.

## Choose your integration

| If you want to… | Use | Start here |
| --- | --- | --- |
| Run checks yourself, from your backend | **Verification API** | [Verification](/verifications) |
| Let Valyd collect the documents and selfie on a ready-made page | **Hosted Verification** | [Hosted](/verifications/hosted) |
| Let users sign in and reuse their verified identity | **Login with Valyd** | [Login with Valyd](/docs) |

Not sure which fits — or want the details on what each returns and who holds the data?
→ **[Choose your integration](/docs/choose)**

## Where everything lives

| Host | What it is |
| --- | --- |
| **`idp.valyd.work`** | The Valyd API — verification, the account APIs, and sign-in. Your app talks to this host. |
| **`dev.valyd.work`** | The **Developer Portal** — create apps, get your keys, and compose hosted flows. |
| **`docs.valyd.work`** | These docs, the [API Playground](/sandbox), and the [live demos](/demos). |

New accounts start with a **$100 credit** so you can build and [test](/docs/testing) for free.

## Concepts & terms

| Term | Meaning |
| --- | --- |
| **Valyd ID** | A person's verified identity: their face vector, verified legal name, and every proof they've earned. One per human. |
| `valyd_id` | The stable identifier of that identity — key your users on it. |
| **App** | What you register in the [Developer Portal](https://dev.valyd.work): the credentials your integration uses. |
| **Check** | One verification action (KYC, liveness, face match, license lookup). Returns one result. |
| **Workflow** | A saved bundle of checks the user completes in one [hosted](/verifications/hosted) session. |
| **Proof / badge** | The durable outcome of a passed check, saved on a Valyd account and reusable later. |
| **Scope** | What a user permits your app to read at login. [Managed per app](/docs/scopes). |
| **Organization** | A shared workspace: one team, shared apps, a workforce roster, one bill. [Details](/docs/organizations). |
| **Consent flow** | The explicit approval step for releasing raw identity data — separate from login. |

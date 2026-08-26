# Introduction

Valyd is a verified-identity platform. It gives developers **two products**:

- **[Unique Human API](/verifications/standalone)** — determine whether you're interacting with a
  **live, unique human**. You create an app, copy its API key, start a session for a workflow with
  the liveness and/or uniqueness checks, and redirect the person to Valyd's verification page. The
  verdict returns to your system; no account is involved and nothing is saved to one.
- **[Reusable Verification](/verifications)** — users **connect their Valyd identity** (standard
  OpenID Connect), you read the verified information they already hold and have consented to
  share, and for anything missing you run a **[workflow](/verifications/workflows)** — KYC,
  professional licenses, face match, liveness, location, and more. Passed proofs save to the
  user's Valyd ID, so they're reusable the next time.

| If you want to… | Use | Start here |
| --- | --- | --- |
| Know whether this person is live and unique | **Unique Human API** | [Overview](/verifications/standalone) |
| Let users reuse verified identity — and verify what's missing | **Reusable Verification** | [Overview](/verifications) |

> Connect with Valyd is built on OpenID Connect and can also serve as your app's sign-in — see
> [Connect with Valyd](/docs). It's part of Reusable Verification, not a separate product.

## Onboarding a workforce? Use an organization

If you're bringing a whole team or workforce onto Valyd — employees, staff, contractors — use an
**Organization**. Your people connect with Valyd (standard OIDC), and each active member gets
**unlimited verifications for $0.99 / month** (14-day free trial). Face login, no passwords, and
you always know exactly who signed in.

→ **[Organizations](/docs/organizations)** — how it works, roles, member onboarding, and pricing.

## Where everything lives

| Host | What it is |
| --- | --- |
| **`idp.valyd.work`** | The Valyd API — verification, the account APIs, and sign-in. Your app talks to this host. |
| **`dev.valyd.work`** | The **Developer Portal** — create apps, get your keys, and configure workflows. |
| **`docs.valyd.work`** | These docs, the [API Playground](/sandbox), and the [live demos](/demos). |

New accounts start with a **$100 credit** so you can build and [test](/docs/testing) for free.

## Concepts & terms

| Term | Meaning |
| --- | --- |
| **Valyd ID** | A person's verified identity: their face vector, verified legal name, and every proof they've earned. One per human. |
| `valyd_id` | The stable identifier of that identity — key your users on it. |
| **App** | What you register in the [Developer Portal](https://dev.valyd.work): the credentials your integration uses. |
| **Check** | One verification action (KYC, liveness, face match, license lookup). Returns one result. |
| **Workflow** | The saved bundle of checks you configure for your app — a user completes it in one [verification session](/verifications/quickstart). |
| **Proof / badge** | The durable outcome of a passed check, saved on a Valyd account and reusable later. |
| **Scope** | What a user permits your app to read when they connect. [Managed per app](/docs/scopes). |
| **Organization** | A shared workspace: one team, shared apps, a workforce roster, one bill. [Details](/docs/organizations). |
| **Consent flow** | The explicit approval step for releasing raw identity data — separate from connecting. |

---
product: valyd-id
api_version: oidc
auth: oidc-bearer
billable: true
pii_mode: proofs
human_setup_required: true
source_of_truth: openapi
---

# Reusable Identity

> 🔑 **Auth:** the user's Bearer `valyd_access_token` (from [Connect with Valyd](/docs)) · 💾 Passed checks save to the user's Valyd ID · 🔒 PII stays with Valyd

The user connected with Valyd — their access token now unlocks everything in this section. The
habit that makes Valyd cheap and fast: **read first, verify only what's missing.**

| Page | What it does |
| --- | --- |
| [Read verified data](/docs/user-token/account) | Profile, licenses, proofs — free, instant, the KYC-reuse story |
| [KYC / ID verification](/docs/user-token/kyc) | Government-ID identity → `id_verified: true` |
| [Checks reference](/verifications/types) | Face match, liveness, license, age, location — every check a workflow can run |
| [Workflows](/verifications/workflows) | Configure the checks in the portal, run them all on one page |

This is **[Reusable Verification](/verifications)**: you create a verification session with
`valydAccessToken` attached, the user completes the configured **workflow** on Valyd's
verification page, the passed proofs save to their Valyd ID, and next time
[the read](/docs/user-token/account) answers yes. ID/KYC, face match, age, and professional
license all run this way — as workflow checks on the connected user's session, never as direct
public API calls. (Need only Liveness or Uniqueness, with no login and nothing saved? That's the
[Unique Human API](/verifications/standalone).)

## Run a workflow

**Configure the checks in the portal, we run them all on one page** — and send you proofs,
public data, and what passed, on your webhook:

![Composing a workflow: pick the checks, in order](/images/screenshots/portal-workflow-wizard.png)

```typescript
const session = await verify.sessions.create({
  workflowId,                      // the checks you picked
  valydAccessToken: accessToken,   // ties the run to the user
  redirectUrl: "https://yourapp.com/verified",
});
// → send the user to session.url
// → webhook: what passed + proofs + public data — the account updates itself
```

Full walkthrough with every portal step: **[Run a verification →](/verifications/quickstart)**

## Raw identity data is separate

Everything above returns proofs and public data — never documents or DOB. If you genuinely
need a raw attribute, the user approves it explicitly: [consent flow](/docs/request-data).

## Working as an organization?

Apps, workflows, and billing can live in a shared [Organization](/docs/organizations) — and we
onboard the workforce for you: add members over the [SDK](/docs/organizations/api),
each is notified with a face-activation link, and signs into your apps by face from then on.
Fetch member details, assign roles, deactivate/reactivate — all documented there. Member account
**recovery** is coming soon.

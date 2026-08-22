---
product: valyd-id
api_version: oidc
sdk_min_version: 1.10.3
auth: oidc-bearer
billable: true
pii_mode: proofs
human_setup_required: true
source_of_truth: openapi
---

# Reusable Identity

> 🔑 **Auth:** the user's Bearer `valyd_access_token` (from [login](/docs)) · 💾 Passed checks save to the user's Valyd ID · 🔒 PII stays with Valyd

The user signed in — their access token now unlocks everything in this section. The habit that
makes Valyd cheap and fast: **read first, verify only what's missing.**

| Page | What it does |
| --- | --- |
| [Read proofs](/docs/user-token/account) | Profile, licenses, proofs — free, instant, the KYC-reuse story |
| [Face match](/verifications/standalone/face-match) | The person on your screen is the account holder |
| [Liveness](/verifications/standalone/liveness) | A live person, not a photo or replay |
| [License verification](/verifications/standalone/credential-verification) | A professional license, verified at the source |
| [Age check](/verifications/standalone/age-verification) | An age band (`is_18_plus`, …) — never the date of birth |
| [KYC / ID verification](/docs/user-token/kyc) | Government-ID identity — hosted page only |
| [Hosted for your users](/verifications/hosted) | Select checks in the portal, we run them all on one page |

Running a check **with the user's token** is the **[Managed by Valyd](/verifications/managed)** lane:
you run a hosted session with `valydAccessToken` attached, the passed proof saves to the user's
Valyd ID, and next time [the read](/docs/user-token/account) answers yes. ID/KYC, face match, age,
and professional license all run this way — on the signed-in user's session, not as self-serve
direct calls. (A tokenless liveness/uniqueness check with nothing saved is the
[Verify Fresh](/verifications/standalone) lane.)

## Or let us host the whole thing

Don't want to call checks one by one? **Select them in the portal, we run them all on one
hosted page** — and send you proofs, public data, and what passed, on your webhook:

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

Full walkthrough with every portal step: **[Hosted verification →](/verifications/hosted)**

## Raw identity data is separate

Everything above returns proofs and public data — never documents or DOB. If you genuinely
need a raw attribute, the user approves it explicitly: [consent flow](/docs/request-data).

## Working as an organization?

Apps, workflows, and billing can live in a shared [Organization](/docs/organizations) — and we
onboard the workforce for you: add members over the [SDK](/docs/organizations/api),
each is notified with a face-activation link, and signs into your apps by face from then on.
Fetch member details, assign roles, deactivate/reactivate — all documented there. Member account
**recovery** is coming soon.

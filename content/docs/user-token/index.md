# With the user's token

> 🔑 **Auth:** the user's Bearer `valyd_access_token` (from [login](/docs)) · 💾 Passed checks save to the user's Valyd ID · 🔒 PII stays with Valyd

The user signed in — their access token now unlocks everything in this section. The habit that
makes Valyd cheap and fast: **read first, verify only what's missing.**

| Page | What it does |
| --- | --- |
| [Read the account](/docs/user-token/account) | Profile, licenses, proofs — free, instant, the KYC-reuse story |
| [Face match](/docs/user-token/face-match) | The person on your screen is the account holder |
| [Liveness](/docs/user-token/liveness) | A live person, not a photo or replay |
| [License verification](/docs/user-token/license) | A professional license, verified at the source |
| [Age check](/docs/user-token/age) | An age band (`is_18_plus`, …) — never the date of birth |
| [KYC / ID verification](/docs/user-token/kyc) | Government-ID identity — hosted page only |
| [Hosted for your users](/docs/user-token/hosted) | Select checks in the portal, we run them all on one page |

Every check is one call with `valydAccessToken` on the request — the passed proof saves to the
user's Valyd ID, and next time [the read](/docs/user-token/account) answers yes.

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

Full walkthrough with every portal step: **[Hosted for your users →](/docs/user-token/hosted)**

## Raw identity data is separate

Everything above returns proofs and public data — never documents or DOB. If you genuinely
need a raw attribute, the user approves it explicitly: [consent flow](/docs/request-data).

## Working as an organization?

Apps, workflows, and billing can live in a shared [Organization](/docs/organizations) — and we
onboard the workforce for you: add members over the [SDK](/docs/organizations#manage-members-via-the-api-server-to-server),
each is notified with a face-activation link, and signs into your apps by face from then on.
Fetch member details, assign roles, deactivate/reactivate — all documented there. Member account
**recovery** is coming soon.

# Hosted for your users

> 🔑 **Auth:** App API key + the user's `valyd_access_token` · 🖥 We build the UI · 📩 Results on your webhook · 💾 Proofs save to the user's Valyd ID

You pick the checks, we host everything: capture UI, cameras, retries, document scanning. The
user completes it all on one page. You get back **what passed, the proofs, and the public
data** — never the raw PII — and the user's account updates itself.

## 1. Pick your checks — that's a workflow

In your app in the [Developer Portal](https://dev.valyd.work), open **Workflows** and select
what this run should verify — KYC, liveness, face match, age, license — in order:

![The workflow wizard: select checks and their order](/images/screenshots/portal-workflow-wizard.png)

Save it and copy the `workflow_id`. (Building for checks **without** a user account? That
lives in a [verification-only project](/verifications/setup) instead.)

## 2. Grab your API key

Your app's **Verification** tab holds the `X-API-Key` — shown once at creation, rotatable
anytime:

![The app's Verification tab with the API key panel](/images/screenshots/portal-app-verification.png)

## 3. One call — send the user to the page

```typescript
import { VerifyClient } from "@valyd/sdk";
const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY });

const session = await verify.sessions.create({
  workflowId:       process.env.VALYD_WORKFLOW_ID,
  valydAccessToken: accessToken,          // the signed-in user's token
  redirectUrl:      "https://yourapp.com/verified",
  callback:         "https://api.yourapp.com/webhooks/valyd",
});
// → res.redirect(session.url)
```

The user lands on our hosted page with their identity already attached — KYC steps their
account has already passed are skipped automatically.

## 4. The webhook tells you everything

When the flow finishes, your `callback` receives one signed event: **which checks passed, the
proofs earned, and the public data** (`valyd_id`, `id_verified`, age bands, license badges).
The same proofs are now saved on the user's Valyd ID — [read them](/docs/user-token) on every
future visit instead of re-running anything.

Verify the signature and shape before going live with the portal's **Webhook Tester**:

![The Webhook Tester in the Developer Portal](/images/screenshots/portal-webhook-tester.png)

Webhook signature scheme, retries, and payloads: [Webhooks](/verifications/webhooks) ·
Decision statuses: [Decisions & statuses](/verifications/statuses)

## The one rule

With the user's token on the session, identity data stays with Valyd and **you get proofs**.
No token? The same hosted flow returns the full data **to you** — that's the separate
[standalone product](/verifications/standalone).

# Setup

> 🔑 **What you leave with:** an App **API key** (`X-API-Key`, shown once) and — for hosted runs — a `workflow_id`

Where verification lives in the [Developer Portal](https://dev.valyd.work), and the three things
to grab before your first call. Don't have an account yet?
[Create one first](/docs/create-account) — it takes a minute and comes with a $100 welcome credit.

## Where verification lives in the portal

There are two homes, matching the two products:

- **Verification for your users lives inside your app.** If you're pairing verification with
  [Sign in with Valyd](/docs) — the main story — open the app itself → its **Verification** tab.
  The app's OAuth side signs users in; this tab is its verification side:

  ![The Verification tab inside an app in the Developer Portal](/images/screenshots/portal-app-verification.png)

- **[Standalone](/verifications/standalone) projects live on the dashboard.** The plain API-key
  product for checks on your own data: your project, your key, results returned to you. Create
  and manage these directly from the dashboard's Verifications area:

  ![Standalone verification projects on the Developer Portal dashboard](/images/screenshots/portal-dashboard-verifications.png)

  Click **New verification-only project** — one dialog, no login setup:

  ![Creating a verification-only project](/images/screenshots/portal-create-verification-project.png)

Either way you end up with the same credential — an App API key — and the same APIs.

## Get your API key (shown once)

![The app's Verification tab with the API key panel](/images/screenshots/portal-app-verification.png)

When you create the project (or enable the app's verification capability), the portal shows the
**API key exactly once** in a show-once panel. Copy it immediately and store it server-side —
it cannot be retrieved again. If you lose it, rotate it in the portal to mint a new one.

Never put the key in browser code: it belongs in your backend's environment
(`X-API-Key` header on server-to-server calls only).

## Create a workflow (hosted runs)

Hosted sessions run a **workflow** — a saved bundle of checks. Build one with the workflow
wizard in the portal (or [via the API](/verifications/workflows)) and copy its `workflow_id`:

![The workflow creation wizard in the Developer Portal](/images/screenshots/portal-workflow-wizard.png)

Direct API calls don't need a workflow — just the key.

## Configure webhooks (hosted runs)

Set your endpoint URL and copy the signing secret under **Webhooks**. Valyd POSTs signed events
there when a session finishes — [Webhooks](/verifications/webhooks) covers verification of the
signature. The portal includes a **webhook tester** so you can fire test events at your endpoint
before going live:

![The webhook tester in the Developer Portal](/images/screenshots/portal-webhook-tester.png)

## Next

- [Quickstart](/verifications/quickstart) — run your first check with the key you just copied.
- [Hosted verification](/verifications/hosted) — let Valyd build the capture UI.
- [The Developer Portal reference](/verifications/console) — apps, workflows, webhooks, SSO.

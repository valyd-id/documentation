# Create a workflow

> 🔑 **What you leave with:** an App **API key** (shown once), a `workflowId`, and a webhook secret

Portal setup for [Reusable Verification](/verifications): where verification lives in the
[Developer Portal](https://dev.valyd.work), and the three things to grab before your first
session. Don't have an account yet? [Create one first](/docs/create-account) — it takes a minute
and comes with a $100 welcome credit.

## Where verification lives in the portal

Verification is configured **inside your app** — the same app whose OIDC credentials power
[Connect with Valyd](/docs/authentication). Open the app → its **Verification** tab:

![The Verification tab inside an app in the Developer Portal](/images/screenshots/portal-app-verification.png)

(Building only with the [Unique Human API](/verifications/standalone)? No project needed — every
organization has a built-in **Verify Fresh** key on the dashboard for no-account anti-spoof checks;
see that page's setup section.)

## Get your API key (shown once)

When you open the app's **Verification** tab, the portal shows the **API key exactly once**
in a show-once panel. Copy it immediately and store it server-side — it cannot be retrieved
again. If you lose it, rotate it in the portal to mint a new one.

Never put the key in browser code: it belongs in your backend's environment, passed to the SDK
client on server-to-server calls only.

## Build the workflow

A [workflow](/verifications/workflows) is the saved bundle of checks your app requires — KYC,
professional license, face match, liveness, location, and more. Build one with the workflow
wizard and copy its `workflowId`:

![The workflow creation wizard in the Developer Portal](/images/screenshots/portal-workflow-wizard.png)

## Configure webhooks

Set your endpoint URL and copy the signing secret under **Webhooks**. Valyd POSTs signed events
there when a session finishes — [Webhooks](/verifications/webhooks) covers verification of the
signature. The portal includes a **webhook tester** so you can fire test events at your endpoint
before going live:

![The webhook tester in the Developer Portal](/images/screenshots/portal-webhook-tester.png)

## Next

- [Run a verification](/verifications/quickstart) — first session with the key and `workflowId`
  you just copied.
- [Workflows](/verifications/workflows) — presets, bundling checks, and changing a workflow.
- [Checks reference](/verifications/types) — everything a workflow can verify.

# Hosted vs Core APIs

## Agent Quick-Start
- Source URL: https://docs.valyd.work/verify#modes
- Credentials / env vars needed: none to choose a mode (each mode later needs an App API key from https://dev.valyd.work; Hosted also needs a `workflow_id`)
- Files an integrator edits: none — reference only (decision aid for picking a mode)
- Estimated steps: 0 (decision aid)
- Can complete without human input: YES — choosing a mode is a decision based on your requirements; no actions required
- Prerequisites: none

Verification APIs offers two integration modes. Use the decision tree to pick one, then follow the matching path.

## The full model: two API types × two modes (2×2)

Two axes. **Account (Managed by Valyd)** vs **Non-account (Fresh)** — whether a verified identity is
stored on a Valyd account and reused. And **Hosted** vs **Core APIs** — whether Valyd renders the capture
page or you call REST directly.

| | Hosted | Core APIs |
|---|---|---|
| **Account (Managed by Valyd)** | Login with Valyd → workflow on the hosted page; steps stored on the account; reuse skips done steps. Proofs only. | Call REST with the user's token — license (badge on account), face (vs stored vector), reuse read. KYC redirects to Valyd. Proofs only. |
| **Non-account (Fresh)** | One-shot hosted capture, nothing retained. Raw data. | Per-endpoint REST capture in your own UI. Raw data. |

**Data-sharing rule.** Account APIs return **proofs only** (pseudonym, `id_verified`, license badges,
age bands) and **never** raw KYC; raw account attributes are released solely through the **consent Core
API** (the user approves in-app). Non-account (Fresh) APIs return the captured **raw data as-is**. See
[Account (Managed by Valyd)](https://docs.valyd.work/verify/managed.md).

## Decision tree

```text
IF you need an end-user KYC flow with live camera/ID + selfie capture, and you do NOT want to build the capture UI:
  → Use Hosted. Redirect the user to a Valyd-hosted session URL; receive the result via webhook + decision API.
  → Next: create a Workflow (get workflow_id) and configure a webhook in the Console (https://docs.valyd.work/verify#console), then create a session (https://docs.valyd.work/verify#quickstart).

IF you want to call individual capabilities server-to-server from your backend with your own UI and data, and want a synchronous result:
  → Use Core APIs. Call the per-endpoint REST API (e.g. POST /api/v2/age-verification) with your App API key.
  → Next: get an App API key from the Console (https://docs.valyd.work/verify#console), then call the endpoint (https://docs.valyd.work/verify#quickstart).

IF your use case is backoffice, batch processing, or a fully custom UX (no camera redirect):
  → Use Core APIs.

IF unsure:
  → If a human end-user must take a live selfie/photo of their ID in a browser, choose Hosted.
  → Otherwise choose Core APIs.
```

## Comparison

| Aspect | Hosted | Core APIs |
| --- | --- | --- |
| UI | Valyd-hosted capture page | You build it |
| Trigger | Redirect user to session URL | Server-to-server REST call |
| Result delivery | Webhook + decision API | Synchronous response |
| Best for | End-user KYC flows with camera | Backoffice, batch, custom UX |
| Identifier | `workflow_id` (bundle of services) | Per-endpoint call |

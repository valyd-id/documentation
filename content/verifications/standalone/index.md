---
product: valyd-verify
api_version: v2
sdk_min_version: 1.10.3
auth: x-api-key
billable: true
pii_mode: standalone
human_setup_required: true
source_of_truth: openapi
---

# Verify Fresh — liveness & uniqueness

> 🔑 **Auth:** API key (`X-API-Key`) · 👤 **User login:** none — non-account · 💾 **Result:** returned to your system

**Verify Fresh** is the non-account, API-key-only lane: **no login, no Valyd account**, nothing
saved to one. It runs only the **liveness**, **anti-spoof**, and **face-uniqueness** family of
checks on images your app captures, and the result returns straight to your system. It runs on
Valyd's hosted capture page **or** as direct API calls from your backend.

> **Need ID/KYC, face match, age, professional license, or location?** Those are no longer
> self-serve direct checks — they now run through **[Managed by Valyd](/verifications/managed)**, on
> a signed-in user's hosted session, so the raw identity data stays encrypted with Valyd and your
> app receives the decision plus reusable proofs.

**Setup is one dialog:** on the [dashboard](https://dev.valyd.work) create a
**verification-only project** — no login setup, just a key — and copy its API key (the same
`X-API-Key` credential every endpoint below uses; an app's Verification-tab key works too).
Portal sign-in works with an **email magic link** as well as a Valyd ID — no Valyd account is
needed to use this lane:

![Creating a verification-only project on the dashboard](/images/screenshots/portal-create-verification-project.png)

**Rather not build the UI?** The same Verify Fresh checks run as a hosted workflow — select them in
the project, get a `workflow_id`, one `sessions.create({ workflowId, redirectUrl })` call, and the
results still return to you: [Hosted delivery](/verifications/hosted).

## Overview

Direct, synchronous, server-to-server checks. You build your own UI and call these endpoints from
your backend. Every request uses `X-API-Key: <App API key>`—not an OIDC access token. Keep the key
server-side and never ship it to the browser.

Base URL for every endpoint below: `https://idp.valyd.work`

Every response uses the standard envelope and includes a `check` object:

```json
{
  "success": true,
  "data": {
    "session_id": "ses_…",
    "status": "passed",   // passed | failed | review
    "check": {
      "type": "liveness" | "antispoof" | "face_uniqueness",
      "status": "passed" | "failed" | "review",
      "score": 0.97,
      "data": { /* per-check details */ },
      "error": null
    }
  },
  "error": null
}
```

The JSON blocks shown under each endpoint page are the contents of `check.data` (the per-check details), unless the block is labeled otherwise.

## Idempotency

Every billable `POST /api/v2/*` accepts an **`Idempotency-Key`** header. Send a unique key with each
logical operation and Valyd stores the first response and **replays it byte-for-byte** for any repeat
with the same key — so a network retry can never double-charge or double-run a check.
In the SDK (v1.10.2+), pass `idempotencyKey` on any billable check and the header is sent for
you; over raw HTTP set it yourself — [example](/verifications/standalone/http#idempotency-header).

```javascript
await verify.standalone.liveness({
  image: readImage("./selfie.jpg"),
  idempotencyKey: "op-8412-attempt", // your unique id for this logical operation
});
```

- Keys are scoped **per project** and retained for **24 hours**.
- A replayed response carries the header `Idempotency-Replayed: true`.
- Reusing a key with a **different request body** returns `422 idempotency_key_reused`.
- A key whose first request is still in flight returns `409 idempotency_in_progress` — retry shortly.
- Only successful (2xx) responses are stored; a failed call leaves the key free to retry.

## SDK quick start

The official Node SDK is published on npm as `@valyd/sdk` (https://www.npmjs.com/package/@valyd/sdk). Image fields accept a file path via `readImage("./x.jpg")`, a `Buffer`, or a base64 / data-URL string. Over plain HTTP, send images as a base64 string in the JSON field (or as a multipart file under the same field name).

Install:

```bash
npm i @valyd/sdk@^1.10.4
```

Create a client (do this once and reuse it):

```javascript
import { VerifyClient, readImage } from "@valyd/sdk";

const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY });
// keep VALYD_API_KEY on the server — never in browser code
// key location: Developer Portal → your verification-only project (or an app's Verification tab): https://dev.valyd.work
```

Set the API key in your environment before running:

```bash
export VALYD_API_KEY="<your App API key from https://dev.valyd.work>"
```

## Endpoints

Each endpoint has its own page with the SDK call and the expected response. All raw HTTP requests
live together on one page: [Raw HTTP (cURL)](/verifications/standalone/http).

| Endpoint | Purpose |
| --- | --- |
| [Liveness](/verifications/standalone/liveness) · `POST /api/v2/liveness` | Passive liveness check on a single selfie. |
| [Anti-spoof](/verifications/standalone/antispoof) · `POST /api/v2/antispoof` + `/antispoof/identity` | "Is this a live human capture?" — single image or burst; `/identity` adds the stable `valyd_` uuid. |
| [Face uniqueness](/verifications/standalone/face-uniqueness) · `POST /api/v2/face-uniqueness` | One face = one Valyd uuid — duplicate-account / sybil detection. |
| [Raw HTTP (cURL)](/verifications/standalone/http) | Every endpoint's raw request, collected in one place. |
| [Common errors](/verifications/standalone/errors) | Error envelope, status codes, and fixes for the frequent failures. |

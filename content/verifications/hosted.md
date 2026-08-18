# Hosted Verification

> **Scope: Non-account (Fresh) hosted.** No Valyd login, nothing retained; the decision returns the **raw** captured data. For the Account variant — result stored on the user's Valyd account, reuse (returning users verify with a selfie only), and **proofs-only** results — see [Account (Managed by Valyd)](/verifications/managed). Same hosted page; you additionally pass the user's `valyd_access_token` when creating the session.

## Agent Quick-Start
- Source URL: https://docs.valyd.work/verifications/hosted
- Credentials / env vars needed: VALYD_API_KEY, VALYD_WEBHOOK_SECRET, VALYD_WORKFLOW_ID (workflow created in the Developer Portal: https://dev.valyd.work), APP_URL
- Files an integrator edits: .env (credentials), server route handlers (session create, redirect callback, webhook receiver)
- Estimated steps: 4 (create session → redirect → handle redirect-back → read authoritative result)
- Can complete without human input: NO — a human must create the App API key, the webhook signing secret, and a workflow in the Developer Portal to obtain a `workflow_id`.
- Prerequisites:
  - An App API key (`X-API-Key`) — server-side only, never exposed to the browser. Get this from the Developer Portal: https://dev.valyd.work
  - A webhook signing secret (`VALYD_WEBHOOK_SECRET`) — get this from the Developer Portal: https://dev.valyd.work
  - A `workflow_id` — create the workflow in the Developer Portal (Workflows → "License Verification" or "KYC + License" preset) or via the API, then copy its `workflow_id`.
  - Node.js project with `@valyd/sdk` installed (for the SDK examples).

> ALL server-to-server calls use the header `X-API-Key: <App API key>`. Keep this key SERVER-SIDE ONLY — never expose it to the browser. Every response uses the envelope `{ success, data, error: { code, message } }`.

---

## Overview

Hosted Verification lets you create a session, redirect the user to a Valyd-hosted page that captures everything, and receive the result via a signed webhook plus the decision API. No UI to build, no PII handled by you.

The official Node SDK is `@valyd/sdk` (https://www.npmjs.com/package/@valyd/sdk). It wraps sessions, workflows, webhooks, and the decision API.

Install it:

```bash
npm i @valyd/sdk
```

Initialize the client:

```javascript
import { VerifyClient } from "@valyd/sdk";

const verify = new VerifyClient({
  apiKey:        process.env.VALYD_API_KEY!,
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET!, // used by verify.webhooks.constructEvent
});
```

Hosted flow at a glance:

1. Create a session on your server with a `workflow_id`.
2. Redirect the user's browser to the returned `url`.
3. Valyd captures everything and redirects back to your `redirect_url`.
4. Receive a signed webhook, then fetch the authoritative result from the decision API.

---

## The two hosted products

Both products use the SAME integration code — only the `workflow_id` differs. Create the workflow in the Developer Portal (https://dev.valyd.work) under Workflows → "License Verification" or "KYC + License" preset, or via the API, then copy its `workflow_id`.

```text
IF you only need to verify a professional license (no ID scan):  → use the "License Verification" workflow_id
IF you need identity + credential (ID scan + selfie + license):  → use the "KYC + License" workflow_id
IF unsure which workflow_id to use:                              → open the Developer Portal (https://dev.valyd.work) → Workflows, and copy the workflow_id of the preset you created
```

### License Verification (badge: Credential only)
- Checks: `[credential]`
- Hosted flow: State → license type → name + license number → verify.
- Fastest path to verify a professional license. No ID scan required.

### KYC + License (badge: Identity + Credential)
- Checks: `[id_verification, liveness, face_match, credential]`
- Hosted flow: Scan ID + selfie (OCR + liveness + 1:1 face match), then state + license type + license number.
- The name is taken from the verified ID automatically (the user doesn't type it), so a license belonging to a different person is rejected.

---

## Recipe: Integration steps

The steps are identical for both products. Swap the `workflow_id` to switch between License Verification and KYC + License.

### Prerequisites
- `VALYD_API_KEY` set server-side (App API key — get from the Developer Portal: https://dev.valyd.work).
- `VALYD_WEBHOOK_SECRET` set server-side (webhook signing secret — get from the Developer Portal: https://dev.valyd.work).
- `VALYD_WORKFLOW_ID` — the `workflow_id` of the workflow you want to run (get from the Developer Portal: https://dev.valyd.work, or create via the Workflows API below).
- `APP_URL` — your application's public base URL (used to build `redirect_url` and `callback`).

### Steps

#### Step 1 — Create a session (server-side)

POST `/api/v2/session` from your backend. The response includes the hosted `url` you'll send the user to.

cURL:

```bash
curl -X POST https://idp.valyd.work/api/v2/session \
  -H "X-API-Key: $VALYD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id":  "wf_…",
    "redirect_url": "https://app.example.com/verify/callback",
    "callback":     "https://api.example.com/webhooks/valyd",
    "vendor_data":  "user_123",
    "ttl_seconds":  900,
    "metadata":     { "plan": "pro" }
  }'
```

SDK (Node):

```javascript
const session = await verify.sessions.create({
  workflowId:  process.env.VALYD_WORKFLOW_ID!, // license-only OR kyc+license workflow
  redirectUrl: "https://app.example.com/verify/callback",
  callback:    "https://api.example.com/webhooks/valyd",
  vendorData:  "user_123",          // your internal ref — echoed back on the webhook
  ttlSeconds:  900,
  metadata:    { plan: "pro" },
});

// session.url       → redirect the user here
// session.sessionId, session.sessionToken, session.expiresAt
```

Expected output: HTTP 200 with the envelope `{ success: true, data: { … } }`. The `data` object:

```json
{
  "session_id":    "ses_…",
  "status":        "NOT_STARTED",
  "url":           "https://idp.valyd.work/s/…",
  "session_token": "stk_…",
  "features":      ["id_verification","liveness","face_match","credential"],
  "redirect_url":  "https://app.example.com/verify/callback",
  "expires_at":    "2026-06-11T12:00:00Z"
}
```

> Placeholder source: `wf_…` / `VALYD_WORKFLOW_ID` is the `workflow_id` from the Developer Portal (https://dev.valyd.work → Workflows). `$VALYD_API_KEY` is your App API key from the same console.

#### Step 2 — Redirect the user to the hosted page

Send the user's browser to `data.url`. Valyd handles the entire capture and verification UI; the steps auto-adapt to the workflow's checks.

```javascript
// Express
app.post("/start-verification", async (req, res) => {
  const session = await verify.sessions.create({
    workflowId:  process.env.VALYD_WORKFLOW_ID!,
    redirectUrl: `${process.env.APP_URL}/verify/callback`,
    callback:    `${process.env.APP_URL}/webhooks/valyd`,
    vendorData:  req.user.id,
  });
  res.redirect(session.url);
});
```

Expected output: an HTTP 302 redirect of the user's browser to the Valyd-hosted `session.url` (under `https://idp.valyd.work/s/…`).

#### Step 3 — Handle the redirect back

When the user finishes (or abandons), Valyd redirects to `redirect_url?session_id=…&status=…`. Treat `status` as a HINT ONLY — always fetch the authoritative decision in step 4.

```javascript
app.get("/verify/callback", async (req, res) => {
  const { session_id } = req.query;
  // Don't trust ?status= — confirm via the decision API or webhook.
  res.redirect(`/verify/pending?s=${session_id}`);
});
```

Expected output: your app receives a GET on `redirect_url` with query params `session_id` and `status`; you redirect the user to a pending/result page and do NOT trust the `status` query param as final.

```text
IF you trust the ?status= query param as final:  → DON'T. It is a hint only.
IF you need the final outcome:                    → fetch it from the decision API (Step 4) or from the signed webhook (below).
```

#### Step 4 — Get the authoritative result

Use the signed webhook (push) and/or call the decision endpoint (pull). See "Webhooks" and "Reading the decision" below.

### Verification

To confirm the integration end-to-end, after a session reaches a terminal status:

```bash
curl https://idp.valyd.work/api/v2/session/ses_…/decision \
  -H "X-API-Key: $VALYD_API_KEY"
```

Expected output: HTTP 200 with `data.status` one of `"APPROVED" | "DECLINED" | "IN_REVIEW"` and a `data.checks` array, confirming the session was processed.

### Common errors

1. Invalid webhook signature
   - Cause: verifying the signature against a re-serialized JSON body, or using the wrong signing secret.
   - Fix: verify against the RAW request body (no JSON re-serialisation) using `express.raw({ type: "application/json" })`, and use the correct `VALYD_WEBHOOK_SECRET`. The SDK throws `ValydVerifyError` with `code === "invalid_signature"`; return HTTP 400.

2. Trusting the redirect `?status=` as the final decision
   - Cause: reading the `status` query param on `redirect_url` and treating it as authoritative.
   - Fix: treat it as a hint only; confirm via the webhook or the decision endpoint.

3. Exposing the API key to the browser
   - Cause: calling `/api/v2/session` (or any server-to-server endpoint) from frontend code.
   - Fix: keep `X-API-Key` server-side only. Only the hosted `url` and the `session_token` are sent to the browser.

---

## Webhooks

On a terminal session, Valyd POSTs to your `callback` URL with these headers:

- `X-Valyd-Timestamp` — unix seconds the request was signed.
- `X-Valyd-Event-Id` — unique event id (use to dedupe).
- `X-Valyd-Signature` — `hmac_sha256(`${timestamp}.${rawBody}`, webhook_signing_secret)`, lowercase hex.

Verify against the RAW request body (no JSON re-serialisation), use a constant-time compare, and reject stale timestamps (e.g. > 5 minutes old).

Webhook body:

```json
{
  "event_id":    "evt_…",
  "type":        "verification.approved",   // verification.declined | .in_review | .abandoned | .expired
  "session_id":  "ses_…",
  "status":      "APPROVED",
  "vendor_data": "user_123",
  "decision":    { /* same shape as the decision API */ },
  "occurred_at": "2026-06-11T12:05:00Z"
}
```

Event `type` values: `verification.approved`, `verification.declined`, `verification.in_review`, `verification.abandoned`, `verification.expired`.

SDK (Node) — verify and handle the webhook:

```javascript
import express from "express";
import { VerifyClient, ValydVerifyError } from "@valyd/sdk";

const verify = new VerifyClient({
  apiKey:        process.env.VALYD_API_KEY!,
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET!,
});

// IMPORTANT: use raw body for signature verification
app.post(
  "/webhooks/valyd",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = verify.webhooks.constructEvent(req.body, req.headers);
      // event.sessionId, event.type, event.status, event.decision, event.vendorData
      await persistDecision(event);
      res.json({ ok: true });
    } catch (err) {
      if (err instanceof ValydVerifyError && err.code === "invalid_signature") {
        return res.status(400).send("bad signature");
      }
      throw err;
    }
  }
);
```

Manual verify (Node) — verify the signature without the SDK:

```javascript
import crypto from "node:crypto";

function verifyValydSignature(rawBody, headers, secret) {
  const ts  = headers["x-valyd-timestamp"];
  const sig = headers["x-valyd-signature"];
  if (!ts || !sig) throw new Error("missing signature headers");

  // Reject stale (> 5 min)
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) {
    throw new Error("stale timestamp");
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ts}.${rawBody}`)
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(sig, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("invalid signature");
  }
}
```

The webhook is a NOTIFICATION. For the full check breakdown, call the decision endpoint below.

---

## Reading the decision

Decision tree for reading the verification decision:

```text
IF you received a webhook:               → it carries event.status and event.decision; still call the decision API for the full check breakdown.
IF you want to pull the result yourself: → GET /api/v2/session/<session_id>/decision with X-API-Key.

Then read d.status:
  IF d.status == "APPROVED":   → verification succeeded (see the per-check rule below for KYC + License).
  IF d.status == "DECLINED":   → verification failed; inspect d.checks for the failing check's error.
  IF d.status == "IN_REVIEW":  → a human/manual review is pending; wait for a terminal webhook or poll again.

Per check in d.checks (each: { type, status, score, data, error }):
  IF check.status == "passed":  → this check succeeded.
  IF check.status == "failed":  → read check.error?.message (e.g. "License belongs to a different name").
  IF check.status == "review":  → this check is awaiting manual review.
  IF check.status == "pending" or "running": → not finished yet.
```

cURL:

```bash
curl https://idp.valyd.work/api/v2/session/ses_…/decision \
  -H "X-API-Key: $VALYD_API_KEY"
```

SDK (Node):

```javascript
const d = await verify.sessions.decision(sessionId);

// d.status   → session progress: "APPROVED" | "DECLINED" | "IN_REVIEW" (may still be pending)
// d.decision → final business outcome, resolved only: "APPROVED" | "DECLINED" (never IN_REVIEW)
// d.checks     → [{ type, status, score, data, error }]
// d.decided_at → ISO timestamp

const credential = d.checks.find(c => c.type === "credential");
if (credential.status === "failed") {
  console.log(credential.error?.message);
  // e.g. "License belongs to a different name"
}
```

Expected output — HTTP 200, `data`:

```json
{
  "status":   "APPROVED",
  "decision": "APPROVED",
  "decided_at": "2026-06-11T12:05:00Z",
  "checks": [
    { "type": "id_verification", "status": "passed", "score": 0.97, "data": { /* fields, portrait, … */ } },
    { "type": "liveness",        "status": "passed", "score": 1.00, "data": { "live_score": 1 } },
    { "type": "face_match",      "status": "passed", "score": 0.97, "data": { "similarity": 0.97, "threshold": 0.95 } },
    { "type": "credential",      "status": "passed", "score": 1.00,
      "data": { "match": true, "license": { "status": "active", "expires_at": "2027-01-01" } } }
  ]
}
```

APPROVED for KYC + License means ALL of:
- The ID was verified (OCR + authenticity).
- The selfie was live.
- The selfie matches the ID portrait.
- The license exists AND belongs to the person on the ID.

---

## Other session & workflow helpers

```javascript
// Sessions
const session = await verify.sessions.retrieve(sessionId);
const page    = await verify.sessions.list({ status: "APPROVED", vendorData: "user_123", limit: 50 });
await verify.sessions.updateStatus(sessionId, "APPROVED"); // or "DECLINED" — manual override

// Workflows  (↔ /api/v2/workflows)
const wf = await verify.workflows.create({
  name: "KYC + License",
  features: ["id_verification", "liveness", "face_match", "credential"],
});
await verify.workflows.list();
await verify.workflows.retrieve(wf.id);
await verify.workflows.update(wf.id, { name: "KYC + License (v2)" });
await verify.workflows.remove(wf.id);
```

---

## Statuses

### Session status

```text
NOT_STARTED → IN_PROGRESS → (IN_REVIEW) → APPROVED | DECLINED
```

Plus terminal: `ABANDONED`, `EXPIRED`.

Full set of session status values: `NOT_STARTED`, `IN_PROGRESS`, `IN_REVIEW`, `APPROVED`, `DECLINED`, `ABANDONED`, `EXPIRED`.

### Check status

```text
pending → running → passed | failed | review
```

Full set of check status values: `pending`, `running`, `passed`, `failed`, `review`.

---

## API reference (endpoints used in this flow)

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `https://idp.valyd.work/api/v2/session` | `X-API-Key` | Create a hosted verification session. |
| GET | `https://idp.valyd.work/api/v2/session/<session_id>/decision` | `X-API-Key` | Read the authoritative decision and per-check breakdown. |
| GET (SDK: `sessions.retrieve`) | `https://idp.valyd.work/api/v2/session/<session_id>` | `X-API-Key` | Retrieve a session. |
| GET (SDK: `sessions.list`) | `https://idp.valyd.work/api/v2/session` | `X-API-Key` | List sessions (filter by `status`, `vendorData`, `limit`). |
| POST/PATCH (SDK: `sessions.updateStatus`) | `https://idp.valyd.work/api/v2/session/<session_id>` | `X-API-Key` | Manually override session status to `APPROVED` or `DECLINED`. |
| POST (SDK: `workflows.create`) | `https://idp.valyd.work/api/v2/workflows` | `X-API-Key` | Create a workflow. |
| GET (SDK: `workflows.list`) | `https://idp.valyd.work/api/v2/workflows` | `X-API-Key` | List workflows. |
| GET (SDK: `workflows.retrieve`) | `https://idp.valyd.work/api/v2/workflows/<id>` | `X-API-Key` | Retrieve a workflow. |
| PATCH (SDK: `workflows.update`) | `https://idp.valyd.work/api/v2/workflows/<id>` | `X-API-Key` | Update a workflow. |
| DELETE (SDK: `workflows.remove`) | `https://idp.valyd.work/api/v2/workflows/<id>` | `X-API-Key` | Delete a workflow. |
| POST (your endpoint) | `<your callback URL>` | Signed via `X-Valyd-Signature` | Webhook Valyd POSTs to on a terminal session. |

> The exact HTTP methods/paths for the SDK helpers `sessions.retrieve`, `sessions.list`, `sessions.updateStatus`, and the `workflows.*` helpers are inferred from the SDK method names and the noted `↔ /api/v2/workflows` mapping in the source; the component only spells out the literal paths `POST /api/v2/session` and `GET /api/v2/session/<id>/decision`.

---

## End-to-end Express example

```javascript
import express from "express";
import { VerifyClient, ValydVerifyError } from "@valyd/sdk";

const app = express();
const verify = new VerifyClient({
  apiKey:        process.env.VALYD_API_KEY!,
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET!,
});

// 1) Start hosted verification
app.post("/start-verification", express.json(), async (req, res) => {
  const session = await verify.sessions.create({
    workflowId:  process.env.VALYD_WORKFLOW_ID!,   // license-only OR kyc+license
    redirectUrl: `${process.env.APP_URL}/verify/callback`,
    callback:    `${process.env.APP_URL}/webhooks/valyd`,
    vendorData:  req.body.userId,
  });
  res.json({ url: session.url, sessionId: session.sessionId });
});

// 2) Redirect-back (status is a hint only)
app.get("/verify/callback", (req, res) => {
  res.redirect(`/verify/pending?s=${req.query.session_id}`);
});

// 3) Signed webhook — MUST use raw body
app.post(
  "/webhooks/valyd",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = verify.webhooks.constructEvent(req.body, req.headers);

      // 4) Pull the full decision (webhook is a notification)
      const decision = await verify.sessions.decision(event.sessionId);
      await persist(event.vendorData, decision);

      res.json({ ok: true });
    } catch (err) {
      if (err instanceof ValydVerifyError && err.code === "invalid_signature") {
        return res.status(400).send("bad signature");
      }
      throw err;
    }
  }
);

app.listen(3000);
```

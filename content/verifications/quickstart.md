---
product: valyd-verify
sdk_min_version: 1.10.3
billable: true
pii_mode: proofs
human_setup_required: true
source_of_truth: sdk
---

# Run a verification

> 🔑 **Auth:** SDK client (App API key) + a `workflowId` · 👤 Include the connected user's `valyd_access_token` so the proof saves to their Valyd ID

Start a verification session for your [workflow](/verifications/workflows), send the user to
Valyd's verification page — Valyd handles the capture UI, camera, retries, and security — and read
one combined decision when they're done. There is no capture UI to build.

The flow at a glance:

1. Create a session on your server with a `workflowId` (and the user's `valyd_access_token`).
2. Redirect the user's browser to the returned `url`.
3. Valyd captures everything and redirects back to your `redirectUrl`.
4. Receive a signed webhook, then fetch the authoritative result with `verify.sessions.decision(id)`.

### Prerequisites

All from [Create a workflow](/verifications/setup) — developer setup, not part of your end-user
flow:

- The **App API key**, copied at app creation (shown once). Store it server-side only.
- A **`workflowId`** from a workflow you created in the [Developer Portal](https://dev.valyd.work).
- A **webhook URL + signing secret** configured under Webhooks in the portal.
- The connected user's `valyd_access_token` from [Connect with Valyd](/docs/authentication), so the
  passed proofs save to their Valyd ID and already-proven steps are skipped.

Install and initialize the SDK:

```bash
npm i @valyd/sdk@^1.10.4
```

```javascript
import { VerifyClient } from "@valyd/sdk";

const verify = new VerifyClient({
  apiKey:        process.env.VALYD_API_KEY,
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET, // used by verify.webhooks.constructEvent
});
```

## Create a session

Call `verify.sessions.create` from your **backend**. The response includes the `url` you send the
user to:

```javascript
const session = await verify.sessions.create({
  workflowId:       process.env.VALYD_WORKFLOW_ID, // the checks you picked in the portal
  valydAccessToken: accessToken,                   // ties the run to the connected user
  redirectUrl:      "https://app.example.com/verify/callback",
  callback:         "https://api.example.com/webhooks/valyd",
  vendorData:       "user_123",          // your internal ref — echoed back on the webhook
  ttlSeconds:       900,
});

// session.url       → redirect the user's browser here
// session.sessionId, session.sessionToken, session.expiresAt
```

The returned `session` carries the verification-page `url` plus `sessionId`, `sessionToken`,
`features`, `redirectUrl`, and `expiresAt`:

```json
{
  "sessionId":    "ses_…",
  "status":       "NOT_STARTED",
  "url":          "https://idp.valyd.work/s/…",
  "sessionToken": "stk_…",
  "features":     ["id_verification","liveness","face_match","credential"],
  "redirectUrl":  "https://app.example.com/verify/callback",
  "expiresAt":    "2026-06-11T12:00:00Z"
}
```

> Keep your API key **server-side only** — never create a session from the browser. Only the
> session `url` and the `sessionToken` are safe to send to the client. `VALYD_WORKFLOW_ID` is the
> `workflowId` from the Developer Portal (https://dev.valyd.work → Workflows).

Then redirect the user's browser to `session.url` (e.g. `res.redirect(session.url)`). Valyd renders
the whole capture and verification UI; the steps auto-adapt to the workflow's checks. With the
user's token on the session, the run pre-fills from their account, skips already-proven steps, and
saves passed proofs to their Valyd ID.

## After the user returns

Valyd sends the user's browser back to your `redirectUrl` with `?session_id=…&status=…`. **Treat
`status` as a hint only** — never grant access on that query param. Fetch the authoritative outcome
with `verify.sessions.decision(id)` (or wait for the signed webhook):

```javascript
const decision = await verify.sessions.decision(sessionId);
// decision.status, decision.checks[]
```

- [Session lifecycle](/verifications/session-lifecycle) — the full state machine and what to do at each stage.
- [Results & decisions](/verifications/statuses) — every status value, the per-check statuses, and reading the decision payload.
- [Webhooks](/verifications/webhooks) — the signed terminal-state callback and how to verify it.

## Other session helpers

```javascript
const session = await verify.sessions.retrieve(sessionId);
const page    = await verify.sessions.list({ status: "APPROVED", vendorData: "user_123", limit: 50 });
await verify.sessions.updateStatus(sessionId, "APPROVED"); // or "DECLINED" — manual review decision (IN_REVIEW sessions only)
```

## SDK surface used in this flow

| SDK method | Purpose |
| --- | --- |
| `verify.sessions.create({ workflowId, valydAccessToken?, redirectUrl, callback?, vendorData?, ttlSeconds? })` | Create a verification session. |
| `verify.sessions.decision(id)` | Read the authoritative decision and per-check breakdown. |
| `verify.sessions.retrieve(id)` | Retrieve a session. |
| `verify.sessions.list({ status?, vendorData?, limit? })` | List sessions. |
| `verify.sessions.updateStatus(id, "APPROVED" \| "DECLINED")` | Manually decide an `IN_REVIEW` session (approval still requires passed ID, liveness, and face-match checks). |
| `verify.webhooks.constructEvent(rawBody, headers)` | Verify and parse the signed webhook Valyd POSTs to your `callback`. |

> **Workflow CRUD is not in the SDK** — compose workflows in the
> [Developer Portal](https://dev.valyd.work) and pass the resulting `workflowId` to
> `verify.sessions.create({ workflowId, … })`.

## Full implementation example

The complete Express integration — create the session, handle the redirect back (status is a hint
only), verify the signed webhook, then pull the authoritative decision:

```javascript
import express from "express";
import { VerifyClient, ValydVerifyError } from "@valyd/sdk";

const app = express();
const verify = new VerifyClient({
  apiKey:        process.env.VALYD_API_KEY,
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET,
});

// 1) Start verification
app.post("/start-verification", express.json(), async (req, res) => {
  const session = await verify.sessions.create({
    workflowId:  process.env.VALYD_WORKFLOW_ID,   // license-only OR kyc+license
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

### Common errors

1. **`API_KEY_INVALID`** — missing, wrong, or rotated API key, or it was used client-side.
   Re-copy the key from the portal (or rotate it), set `VALYD_API_KEY` server-side, and pass it to
   `new VerifyClient({ apiKey })`. Never expose it in browser code.
2. **`VALIDATION_ERROR` on `verify.sessions.create`** — missing or invalid `workflowId`. Create a
   workflow in the portal, set `VALYD_WORKFLOW_ID`, and verify `echo $VALYD_WORKFLOW_ID` is
   non-empty.
3. **No webhook received** — webhook URL/signing secret not configured, or your endpoint is not
   publicly reachable. Set them in Portal → Webhooks, ensure the URL is publicly reachable, and
   verify the signature via `verify.webhooks.constructEvent` before trusting the event.

### Next steps

- **Compose the checks** — [Workflows](/verifications/workflows) · [Checks reference](/verifications/types).
- **Track the run** — [Session lifecycle](/verifications/session-lifecycle).
- **Read the result** — [Results & decisions](/verifications/statuses) and [Webhooks](/verifications/webhooks).

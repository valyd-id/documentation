# Webhooks

> **Try it without a real session:** the Developer Portal's **Webhook Tester** (app → webhook
> settings) sends simulated decision events — signed with your real secret, marked
> `"test": true` — plus duplicate-event and bad-signature modes to prove your handler's
> defenses. See [Testing](/docs/testing#testing-webhooks).

## Recipe: register a callback and verify webhook signatures

### Prerequisites
- A publicly reachable HTTPS URL for your webhook handler.
- A webhook signing secret. Configure the callback URL and obtain the signing secret in the Valyd Developer Portal (https://dev.valyd.work). Store it as `VALYD_WEBHOOK_SECRET`.
- An App API key stored as `VALYD_API_KEY`, used to fetch the full decision after a webhook arrives.

### Steps

1. **Register your callback URL.** In the Developer Portal (https://dev.valyd.work) set the app-level callback URL, or pass a per-session callback URL when creating the session. Note the webhook signing secret shown there.

   **Expected output:** The console shows your callback URL saved and a signing secret. There is no HTTP response to capture for this step — it is a portal action.

2. **Store the secrets in your environment.**

   ```bash
   # .env
   VALYD_WEBHOOK_SECRET=whsec_...   # the webhook signing secret from the Developer Portal (https://dev.valyd.work)
   VALYD_API_KEY=...                # your App API key from the Developer Portal (https://dev.valyd.work)
   ```

   **Expected output:** Both variables are available to your process via `process.env`.

3. **Receive the POST and verify the signature using the RAW body.** Valyd sends these headers on every webhook request:

   - `X-Valyd-Timestamp` — unix seconds when the event was sent
   - `X-Valyd-Event-Id` — unique event id (use for idempotency)
   - `X-Valyd-Signature` — lowercase hex HMAC-SHA256

   Compute `HMAC_SHA256("{timestamp}.{rawBody}", webhookSigningSecret)` and compare it in constant time against the `X-Valyd-Signature` header. Reject the request on any mismatch.

   ```javascript
   import crypto from "crypto";
   import express from "express";

   const app = express();

   // IMPORTANT: capture the RAW body for HMAC verification
   app.post(
     "/api/valyd-webhook",
     express.raw({ type: "application/json" }),
     (req, res) => {
       const ts  = req.header("X-Valyd-Timestamp");
       const sig = req.header("X-Valyd-Signature") || "";
       const raw = req.body; // Buffer

       const expected = crypto
         .createHmac("sha256", process.env.VALYD_WEBHOOK_SECRET)
         .update(`${ts}.${raw.toString("utf8")}`)
         .digest("hex");

       const ok =
         sig.length === expected.length &&
         crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));

       if (!ok) return res.status(400).send("bad signature");

       // Replay protection: reject deliveries older than 5 minutes. `X-Valyd-Timestamp`
       // is signed into the HMAC above, so it can't be tampered with.
       if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) {
         return res.status(400).send("stale timestamp");
       }

       const event = JSON.parse(raw.toString("utf8"));
       // event = { event_id, type: "verification.approved" | ..., session_id, status, vendor_data, decision, occurred_at }

       // Respond fast; then fetch the full decision asynchronously.
       res.status(200).json({ ok: true });
     }
   );
   ```

   **Expected output:** On a valid signature your handler returns HTTP 200. On a bad signature it returns HTTP 400 with body `bad signature`.

4. **Fetch the full decision after acknowledging the webhook.** The webhook body is a notification; the decision endpoint (session id from the event) returns the full per-check breakdown — complete extracted data on standalone (tokenless) sessions, proofs + public data on sessions created with the user's `valyd_access_token`.

   ```bash
   curl https://idp.valyd.work/api/v2/session/SES_ID/decision \
     -H "X-API-Key: $VALYD_API_KEY"
   ```

   **Expected output:** HTTP 200 with the full decision and per-check data for that session. (See api-reference.md → Decision for the endpoint details.)

### Event body

The decoded JSON event has this shape:

```json
{
  "event_id": "evt_...",
  "type": "verification.approved",
  "session_id": "ses_...",
  "status": "APPROVED",
  "vendor_data": "user-123",
  "decision": "approved",
  "occurred_at": "2025-06-05T11:42:13Z"
}
```

Field notes:
- `event_id` — matches the `X-Valyd-Event-Id` header; use it to deduplicate retried deliveries **and manual resends** (both carry the same id).
- `type` — the event type. The full set is:
  - `verification.approved` — terminal, passed.
  - `verification.declined` — terminal, failed.
  - `verification.in_review` — a manual/agent review is pending (not yet terminal).
  - `verification.abandoned` — the user left the hosted flow without finishing.
  - `verification.expired` — the session's TTL elapsed before completion.
- `session_id` — the session that triggered the event; pass it to `GET /api/v2/session/{id}/decision`.
- `status` — the session status (e.g. `APPROVED`). See statuses.md for every possible value.
- `decision` — the final business outcome string (`approved` / `declined`).

### Delivery and retries
- Your endpoint must return a 2xx status and respond fast — defer heavy work to a background queue.
- Non-2xx (or timed-out) deliveries are **retried automatically**. Because the same event may arrive
  more than once, treat delivery as **at-least-once** and **deduplicate on `X-Valyd-Event-Id`**.
- Verify the HMAC signature and reject stale timestamps (> 5 minutes) on every delivery.

#### Retry schedule

A delivery is attempted up to **10 times**. After a failed attempt Valyd waits, then retries:

| After attempt | Wait before next try |
|---|---|
| 1 | 5 seconds |
| 2 | 30 seconds |
| 3 | 2 minutes |
| 4 | 10 minutes |
| 5 and later | 30 minutes |

So a persistently failing endpoint is retried across roughly **2.5 hours** before Valyd stops. Every
retry carries the **same** `X-Valyd-Event-Id`, so deduplicating on that header collapses all retries
of one event into a single unit of work.

#### Delivery log and manual resend (Developer Portal)

Every attempt — successful or failed — is recorded in the **Developer Portal** (https://dev.valyd.work),
on your application's **Verification** page under **Recent webhook deliveries**. For each attempt you
can see the destination URL, the exact payload and headers we sent, the receiver's HTTP status and
response body, and any transport error.

Use the **Resend** button next to a delivery to re-queue that webhook — for example after you've fixed
a bug in your handler, or if an endpoint was down during the automatic retry window. A manual resend
carries the **same** `X-Valyd-Event-Id` as the original, so an idempotent handler treats it as the same
event rather than a new one.

> If a webhook is ever missed entirely, the decision API (`GET /api/v2/session/{id}/decision`) is the
> authoritative source of the result — poll or fetch it any time.

### Verification
- Send a test webhook (or trigger a real terminal session) and confirm your handler logs a valid signature and returns HTTP 200.
- Manually corrupt the secret and confirm your handler returns HTTP 400 `bad signature` — this proves verification is actually running.

### Common errors

1. **Signature always mismatches.**
   - **Cause:** The framework parsed and re-serialized the JSON body, so the bytes used for HMAC differ from what Valyd signed.
   - **Fix:** Capture the raw body (e.g. `express.raw({ type: "application/json" })`) and run HMAC over the exact raw bytes before any JSON parsing.

2. **Signature mismatch despite using the raw body.**
   - **Cause:** Wrong signing input or secret — the signed string must be `"{timestamp}.{rawBody}"` (timestamp, a literal dot, then the raw body), and the secret must be the webhook signing secret, not the App API key.
   - **Fix:** Build the HMAC input as `${ts}.${raw.toString("utf8")}` and use `VALYD_WEBHOOK_SECRET`. Compare in constant time against the lowercase hex `X-Valyd-Signature`.

3. **Duplicate processing / webhook retried.**
   - **Cause:** Your endpoint returned non-2xx (or timed out), so Valyd retried with exponential backoff.
   - **Fix:** Return 2xx immediately and process asynchronously; deduplicate on `X-Valyd-Event-Id`.

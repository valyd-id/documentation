# Webhooks

## Agent Quick-Start
- Source URL: https://docs.valyd.work/verify#webhooks
- Credentials / env vars needed: VALYD_WEBHOOK_SECRET (the webhook signing secret), VALYD_API_KEY (App API key, to fetch the full decision)
- Files an integrator edits: server route handler (e.g. an Express handler), .env (to store VALYD_WEBHOOK_SECRET and VALYD_API_KEY)
- Estimated steps: 4
- Can complete without human input: NO — you must obtain the webhook signing secret and register a callback URL in the Valyd Developer Portal (https://dev.valyd.work), which is a human/portal action.
- Prerequisites:
  - A publicly reachable HTTPS endpoint to receive POST callbacks
  - A webhook signing secret configured on your App or session (from the Developer Portal: https://dev.valyd.work)
  - An App API key to call the decision endpoint
  - Ability to read the raw (unparsed) request body in your web framework

Valyd POSTs to your app or session callback URL when a verification session reaches a terminal state. The webhook is a **notification only** — always call `GET /api/v2/session/{id}/decision` for the full extracted data.

> IMPORTANT: Read the **raw** request body before parsing it as JSON. You need the exact bytes that were sent in order to verify the HMAC signature. If your framework auto-parses JSON and re-serializes it, the bytes will differ and verification will fail.

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

       const event = JSON.parse(raw.toString("utf8"));
       // event = { event_id, type: "verification.approved" | ..., session_id, status, vendor_data, decision, occurred_at }

       // Respond fast; then fetch the full decision asynchronously.
       res.status(200).json({ ok: true });
     }
   );
   ```

   **Expected output:** On a valid signature your handler returns HTTP 200. On a bad signature it returns HTTP 400 with body `bad signature`.

4. **Fetch the full decision after acknowledging the webhook.** The webhook body is a notification; retrieve the complete extracted data with the decision endpoint using the session id from the event.

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
- `event_id` — matches the `X-Valyd-Event-Id` header; use it to deduplicate retried deliveries.
- `type` — the event type, e.g. `verification.approved`.
- `session_id` — the session that triggered the event; pass it to `GET /api/v2/session/{id}/decision`.
- `status` — the terminal session status (e.g. `APPROVED`). See statuses.md for every possible value.
- `decision` — short decision string (e.g. `approved`).

### Delivery and retries
- Your endpoint must return a 2xx status and respond fast — defer heavy work to a background queue.
- Non-2xx responses are retried with exponential backoff.
- Use `X-Valyd-Event-Id` for idempotency, since the same event may be delivered more than once.

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

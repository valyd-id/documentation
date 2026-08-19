# Hosted verification flow

> 🔑 **Auth:** App API key (`X-API-Key`) + workflow · 💾 With the user's `valyd_access_token`, proofs save to their Valyd ID

Hosted verification runs a KYC or license check with **no UI to build**: your backend creates a
session, you send the person to Valyd's capture page, and the result comes back as a signed
webhook plus an authoritative decision API. Include the signed-in user's token when creating the
session and passed proofs save to their Valyd ID
([account-connected flow](/docs/flows/account-connected)).

## When to use it

- You want Valyd to own the capture UX (camera, retries, anti-spoofing) end to end.
- Identity or license checks during onboarding, gig-worker screening, license validation.
- Also available for [standalone checks](/verifications/standalone) on data you keep yourself.

## How it works

```mermaid
sequenceDiagram
    participant B as Browser
    participant Y as Your backend
    participant V as Valyd IdP
    Y->>V: 1. POST /api/v2/session (X-API-Key, workflow_id, redirect_url, callback)
    V-->>Y: url, session_id, session_token, expires_at
    Y-->>B: 2. 302 to hosted url
    B->>V: 3. capture on idp.valyd.work/s/... (ID, selfie, license)
    V-->>B: 4. 302 to redirect_url?session_id&status (status = HINT only)
    V->>Y: 5. signed webhook POST — verify X-Valyd-Signature
    Y->>V: 6. GET /api/v2/session/{id}/decision
    V-->>Y: APPROVED/DECLINED + per-check results
```

## Steps

1. **Create a session (server-side)**: `POST https://idp.valyd.work/api/v2/session` with your
   `X-API-Key`, a `workflow_id`, your `redirect_url` and webhook `callback`, and `vendor_data`
   (your internal user ref, echoed back on the webhook).
2. **Redirect the browser** to the returned hosted `url`; the capture steps auto-adapt to the
   workflow's checks. Status moves `NOT_STARTED → IN_PROGRESS → …`.
3. **Handle the return** to `redirect_url?session_id=…&status=…` — the `status` param is a
   **hint only**; show a pending page.
4. **Receive the signed webhook** on a terminal status (`APPROVED`, `DECLINED`, `ABANDONED`,
   `EXPIRED`), then **fetch the authoritative decision**:
   `GET /api/v2/session/{session_id}/decision` for the full per-check breakdown.

## Security notes

- Keep `X-API-Key` server-side only — the browser sees only the hosted `url`/`session_token`.
- Verify webhooks against the **raw** body (HMAC-SHA256, `X-Valyd-Signature`) and reject stale
  timestamps; dedupe on `X-Valyd-Event-Id`.
- Never treat the redirect `?status=` as final — only the webhook/decision API is authoritative.
- Raw KYC fields appear in a decision only on tokenless (standalone) sessions, and only after
  the required ID, liveness, and face-match gates pass; with the user's token the decision
  returns proofs and public data only. Expired or abandoned sessions are never resumed — create
  a new one.

## Build it

- **Full guide (SDK code, webhooks, decision reading, statuses):** [Hosted verification](/verifications/hosted)
- Save results to the user's account instead: [Account-connected flow](/docs/flows/account-connected)
- Pick the checks a session runs: [Workflows](/verifications/workflows)
- What each status means: [Decisions & statuses](/verifications/statuses)

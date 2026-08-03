# Verification APIs Quickstart

## Agent Quick-Start
- Source URL: https://docs.valyd.work/verify#quickstart
- Credentials / env vars needed: VALYD_API_KEY, VALYD_WORKFLOW_ID (Hosted only)
- Files an integrator edits: .env (to store VALYD_API_KEY and VALYD_WORKFLOW_ID), server route handler (to make the API call and, for Hosted, handle the webhook)
- Estimated steps: 6
- Can complete without human input: NO — steps 1-4 require a human to sign in with Valyd SSO, copy the one-time API key, create a Workflow, and configure the webhook in the Developer Portal (https://dev.valyd.work). The API call itself (steps 5-6) can be automated once credentials exist.
- Prerequisites:
  - A Valyd SSO account able to sign in to the Developer Portal
  - An App API key copied from the Console (shown once at creation)
  - For Hosted: a `workflow_id` from a created Workflow
  - For Hosted: a publicly reachable webhook URL and signing secret

### Prerequisites
- Access to the Developer Portal at https://dev.valyd.work (sign in with Valyd SSO).
- The App API key, copied at App creation (shown once). Store it server-side only.
- For the Hosted snippet: a `workflow_id` from a Workflow you created in the Console.

### Steps

1. Sign in to the Developer Portal with Valyd SSO and create an app — owned by your individual account or your organization. That ONE app issues your OAuth credentials (client_id / client_secret, used for BOTH login and verification), a project API key for verification-only use, and your workflows. One SDK (@valyd/sdk), one host (the Valyd IdP), no second dashboard. (Human-only step.)

   ```text
   Open https://dev.valyd.work and sign in with Valyd SSO.
   ```

   **Expected output:** You are signed in and a default App is visible in the Console.

2. Copy the App API key (shown once at creation). Keep it server-side only. (Human-only step.) Then store it in your environment.

   ```bash
   export VALYD_API_KEY="paste-the-one-time-app-api-key-here"
   ```

   (Get the API key from the Developer Portal → your App → it is shown once at creation: https://dev.valyd.work)

   **Expected output:** `VALYD_API_KEY` is set in your shell/`.env`. The key cannot be retrieved again after creation — rotate it in the Console if lost.

3. (Hosted only) Create a Workflow and copy its `workflow_id`. (Human-only step.) Then store it.

   ```bash
   export VALYD_WORKFLOW_ID="paste-your-workflow-id-here"
   ```

   (Get the `workflow_id` from the Developer Portal → Workflows → your Workflow: https://dev.valyd.work)

   **Expected output:** `VALYD_WORKFLOW_ID` is set. Required only for the Hosted session call in step 6.

4. (Hosted only) Set your webhook URL and signing secret under Webhooks in the Console. (Human-only step.)

   ```text
   In the Console → Webhooks: set the endpoint URL (e.g. https://your-app.com/api/valyd-webhook)
   and copy the signing secret.
   ```

   **Expected output:** Valyd will POST signed events to your URL when a session reaches a terminal state.

5. Run your first Core APIs call (age verification) to confirm your API key works.

   ```bash
   curl -X POST https://idp.valyd.work/api/v2/age-verification \
     -H "X-API-Key: $VALYD_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{ "dob": "1995-06-01", "bands": ["is_18_plus"] }'
   ```

   **Expected output:** HTTP `200` with the standard envelope, e.g. `{ "success": true, "data": { ... } }`. On a bad/missing key expect a `4xx` with `{ "success": false, "error": { "code": "...", "message": "..." } }`.

6. (Hosted only) Create a Hosted session from your server, then redirect the user's browser to the returned URL.

   ```javascript
   const res = await fetch("https://idp.valyd.work/api/v2/session", {
     method: "POST",
     headers: {
       "X-API-Key": process.env.VALYD_API_KEY,
       "Content-Type": "application/json",
     },
     body: JSON.stringify({
       workflow_id: process.env.VALYD_WORKFLOW_ID,
       redirect_url: "https://your-app.com/verify/result",
       callback: "https://your-app.com/api/valyd-webhook",
       vendor_data: "user-123",
     }),
   });
   const { data } = await res.json();
   // Redirect the user's browser to data.url
   ```

   **Expected output:** HTTP `200` with `{ "success": true, "data": { "url": "https://..." } }`. Redirect the user's browser to `data.url`. The verification result arrives later via your configured webhook (step 4).

### Verification
- Core APIs: the curl in step 5 returns HTTP `200` and a body where `success` is `true`.

  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://idp.valyd.work/api/v2/age-verification \
    -H "X-API-Key: $VALYD_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{ "dob": "1995-06-01", "bands": ["is_18_plus"] }'
  ```

  Expect `200` printed.
- Hosted: the step-6 call returns a non-empty `data.url`. Confirm `echo $VALYD_WORKFLOW_ID` is non-empty before calling.

### Common errors

1. **401 / 403 Unauthorized**
   - **Cause:** Missing, wrong, or rotated `X-API-Key`, or the key was sent client-side.
   - **Fix:** Re-copy the API key from the Console (or rotate it), set `VALYD_API_KEY` server-side, and send it in the `X-API-Key` header. Never expose it in browser code.

2. **400 Bad Request on /api/v2/session**
   - **Cause:** Missing or invalid `workflow_id` (Hosted requires a real Workflow id), or malformed JSON body.
   - **Fix:** Create a Workflow in the Console, set `VALYD_WORKFLOW_ID`, and verify `echo $VALYD_WORKFLOW_ID` is non-empty. Ensure `Content-Type: application/json` and valid JSON.

3. **No webhook received after a Hosted session**
   - **Cause:** Webhook URL/signing secret not configured, or your endpoint is not publicly reachable.
   - **Fix:** Set the webhook URL and signing secret in Console → Webhooks (step 4), ensure the URL is publicly reachable, and verify the signature using the signing secret before trusting the event.

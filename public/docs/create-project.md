> Source: https://docs.valyd.work/docs/create-project
> Part of: Valyd ID API documentation — static copy generated for AI agents
> Generated from repo component: GettingStartedSection.tsx

# Create a Project & Get Your Credentials

## Agent Quick-Start
- Source URL: https://docs.valyd.work/docs/create-project
- Credentials / env vars needed: produces `client_id` and `client_secret` (these are the OUTPUT of this page, not a prerequisite)
- Files an integrator edits: your backend environment file (e.g. `.env`) to store `client_secret` after you obtain it
- Estimated steps: 3
- Can complete without human input: NO — every step is a manual action in the Developer Portal web UI (sign up, create project, copy the one-time-shown secret). An automated agent cannot perform these; a human must do them and then hand the agent the resulting `client_id` and `client_secret`.
- Prerequisites:
  - A basic Valyd account (sign up at https://dev.valyd.work — no KYC verification required)
  - Access to a browser to use the Developer Portal at https://dev.valyd.work
  - The exact production domain(s) your app sends requests from (for Allowed Web Origins)
  - Your callback/redirect URL, with NO trailing slash (e.g. `https://myapp.com/callback`)

Before integrating with Valyd SSO, you need to register your application in the Developer Portal to obtain your client credentials. Access to the Developer Portal requires a basic Valyd account; no KYC verification is needed — just sign up at https://dev.valyd.work.

## Prerequisites

- A Valyd account. Sign up at https://dev.valyd.work if you do not have one. No KYC verification is required for portal access.
- The list of domains your application sends requests from (used for Allowed Web Origins).
- Your redirect/callback URL, without a trailing slash.
- A decision on which data scopes your application needs (`profile`, `verifications`, `zkp` — detailed below).

## Steps

This is a portal-driven setup. All steps below are performed by a human in the web UI at https://dev.valyd.work — there is no API to automate project creation.

### Step 1 — Visit the Developer Portal and log in

Open the Developer Portal in a browser and log in with your Valyd account.

```text
https://dev.valyd.work
```

**Expected output:** You are signed in and see the Developer Portal dashboard with an option to create a new project.

### Step 2 — Create the project and fill in project details

Click "Create Project" and fill in the following fields. Required/Optional status is as shown in the portal.

**Project Name** (Required)
- Your application's name that users will see on the consent screen when logging in.
- Example: `My Awesome App`

**Description** (Optional)
- A brief description of your application. Helps users understand what they're authorizing.

**Allowed Web Origins** (Required)
- The domains from which your application will send requests. This is a security feature to prevent unauthorized domains from using your credentials.
- Example: `https://myapp.com, https://staging.myapp.com`

**Redirect URL** (Required)
- The URL where users will be redirected after authentication. This is where you'll receive the authorization code.
- Example: `https://myapp.com/callback`
- IMPORTANT: The redirect URL must NOT end with a trailing slash (`/`).

  ```text
  IF your callback is https://myapp.com/callback   → register exactly this (no trailing slash)
  IF your callback is https://myapp.com/callback/  → remove the trailing slash before registering
  ```

**Allowed Scopes** (Required)

Select the data permissions your application needs. Users will see these scopes on the consent screen. Available scopes and their fields:

- `profile` — **Required.** Core biometric identity. Face vector is required for most Valyd features. KYC fields are optional.
  - Core Biometrics (always enabled — cannot be turned off):
    - `Face Vector` — Biometric face data, foundational to Valyd
    - `Face Match` — Facial recognition matching
  - KYC Data (optional — select verification method):
    - `Name` — User's self-reported name
    - `Age` — User's age estimate
    - `Portrait` — User's profile photo
- `verifications` — Document-based identity verification.
  - `ID Verification` — Government ID document verification
  - `Licenses` — Professional or driver's licenses
- `zkp` — Zero-Knowledge Proof verification: prove facts without revealing data.
  - `Age Verification` — Prove age without revealing birthdate
  - `Country Verification` — Prove residency without revealing address

**Expected output:** The project form is submitted successfully.

### Step 3 — Save your credentials

After creating your project, you'll immediately see a modal with your credentials.

**Client ID** — your unique application identifier. You can view this anytime in your project settings.

```text
Example Client ID format: 9357c59bc1794b4c9efe8823e5878147
```

**Client Secret** — shown only once.

```text
Example Client Secret format: sk_live_a1b2c3d4e5f6g7h8i9j0...
```

IMPORTANT: The Client Secret is shown only once. Copy and store it securely immediately. If you lose it, you'll need to regenerate it.

Store the secret in your backend environment file, for example:

```bash
# .env (server-side only — never commit or expose in frontend code)
VALYD_CLIENT_ID=9357c59bc1794b4c9efe8823e5878147
VALYD_CLIENT_SECRET=sk_live_a1b2c3d4e5f6g7h8i9j0...
```

**Expected output:** You have copied and stored a `client_id` (32-hex-character string) and a `client_secret` (prefixed `sk_live_...`). The secret is now saved server-side.

## You're Ready — Next Steps

With your Client ID and Client Secret you can now integrate Valyd SSO into your application:

1. Store your `client_secret` securely in your backend environment variables.
2. Implement the "Login with Valyd" button that redirects to the authorization URL (`https://idp.valyd.work/auth?client_id=...&redirect_url=...&scope=...`).
3. Handle the callback and exchange the one-time code for tokens using your `client_secret` (backend only).
4. Use the `access_token` to fetch user data.

## Verification

There is no CLI/API check for project creation; verify manually in the portal:

```text
IF you can see your project listed in the Developer Portal at https://dev.valyd.work  → project was created
IF the credentials modal showed a Client ID and Client Secret                       → credentials were issued
IF you saved the Client Secret before closing the modal                             → you can proceed
IF you closed the modal without copying the Client Secret                           → regenerate it from project settings (it is shown only once per generation)
```

## Common errors

1. **Redirect URL rejected / authorization fails with a redirect mismatch**
   - **Cause:** The registered Redirect URL has a trailing slash, or does not exactly match the `redirect_url` your app sends.
   - **Fix:** Register the redirect URL with NO trailing slash and ensure the value used in the authorization request matches it character-for-character.

2. **Lost the Client Secret**
   - **Cause:** The Client Secret is shown only once when the project is created and was not copied before the modal was closed.
   - **Fix:** Regenerate the Client Secret from your project settings in the Developer Portal, then update your backend environment variable.

3. **Requests blocked from your domain**
   - **Cause:** The requesting domain is not listed in Allowed Web Origins.
   - **Fix:** Add the exact origin (scheme + host, e.g. `https://myapp.com`) to Allowed Web Origins in the project settings.

> Source: https://{{DOCS_BASE_URL}}/verify#sdk
> Part of: Verification API documentation — static copy generated for AI agents
> Generated from repo component: SdkSection.tsx

# Node SDK

## Agent Quick-Start
- Source URL: https://{{DOCS_BASE_URL}}/verify#sdk
- Credentials / env vars needed: VALYD_API_KEY, VALYD_WEBHOOK_SECRET (for hosted/webhook flows), VALYD_WORKFLOW_ID (for hosted sessions)
- Files an integrator edits: .env, your server bootstrap (VerifyClient init), and a webhook route handler (e.g. Express)
- Estimated steps: 3 (install, initialise, call resources)
- Can complete without human input: NO — you must first obtain an API key, a webhook secret, and a workflow ID from the Valyd Developer Portal (https://{{DEV_PORTAL_URL}}); these cannot be generated programmatically here.
- Prerequisites:
  - Node 18+ (the SDK relies on the built-in `fetch` and `crypto`)
  - A Verification API key (X-API-Key) — get it from the dashboard: https://{{DEV_PORTAL_URL}}
  - For hosted/webhook flows: a webhook secret and a workflow ID from the dashboard
  - Server-side runtime only — the API key must never reach the browser

`@valyd/sdk` (https://www.npmjs.com/package/@valyd/sdk) is the single, unified Valyd SDK — **Login with Valyd** lives on `valyd.auth` and the **Verification APIs** on `valyd.verify`. **One app credential** (client_id / client_secret, from an app in the developer portal owned by your individual account or your organization) authenticates both; a project API key works for verification-only use. Everything routes through one host (the Valyd IdP) — there is no separate verify service or URL. Zero-dependency, dual ESM + CJS, fully typed TypeScript; Node 18+ (built-in `fetch` / `crypto`).

> Server-side only. Your API key must never reach the browser. The hosted flow is just a redirect to `session.url` — there is no browser SDK.

## Recipe

### Prerequisites
- Node 18+ installed. Check with:
  ```bash
  node --version
  ```
  **Expected output:** `v18.x.x` or higher. If lower, upgrade Node before continuing.
- Credentials from the Valyd Developer Portal (https://{{DEV_PORTAL_URL}}):
  - `VALYD_API_KEY` — sent as the `X-API-Key` header on every request.
  - `VALYD_WEBHOOK_SECRET` — needed to verify webhook signatures (hosted flow).
  - `VALYD_WORKFLOW_ID` — needed when creating hosted sessions.

```text
IF you are building a hosted flow (redirect the user to a Valyd-hosted page):
  → you need VALYD_API_KEY, VALYD_WEBHOOK_SECRET, and VALYD_WORKFLOW_ID
IF you are building a Core APIs flow (call individual checks server-side):
  → you only need VALYD_API_KEY
IF unsure which credentials you have:
  → log in to https://{{DEV_PORTAL_URL}} and check your project's API keys / webhooks / workflows
```

### Steps

1. **Install the SDK.**
   ```bash
   npm i @valyd/sdk
   ```
   **Expected output:** npm adds `@valyd/sdk` to `dependencies` in `package.json` and reports `added 1 package`. Versions follow semver and are pinned per release — lock to `^x.y.z` for backwards-compatible upgrades.

2. **Set environment variables** (e.g. in a `.env` file or your process environment). Get each value from the Valyd Developer Portal: https://{{DEV_PORTAL_URL}}.
   ```bash
   VALYD_API_KEY=your_api_key_here          # X-API-Key for every request
   VALYD_WEBHOOK_SECRET=your_webhook_secret  # required for hosted/webhook flows
   VALYD_WORKFLOW_ID=your_workflow_id        # required to create hosted sessions
   ```
   **Expected output:** no output; these are read at runtime via `process.env.*`.

3. **Initialise the client** in your server code.
   ```javascript
   import { VerifyClient } from "@valyd/sdk";

   const verify = new VerifyClient({
     apiKey: process.env.VALYD_API_KEY!,
   });
   ```
   **Expected output:** a `VerifyClient` instance. No network call is made on construction. If `apiKey` is missing, a later call throws `ValydVerifyError` with code `config_error`.

#### Constructor options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `apiKey` | string | — | Required. Sent as the `X-API-Key` header on every request. |
| `baseUrl` | string | `https://{{VERIFY_BASE_URL}}` | API base URL. Override only for staging/self-hosted. |
| `webhookSecret` | string | — | Optional. When set, `webhooks.constructEvent` / `verify` can be called without passing the secret explicitly. |
| `timeoutMs` | number | `15000` | Per-request timeout. Increase for credential lookups (10–60s). |
| `fetch` | typeof fetch | — | Custom fetch implementation (proxies, instrumentation, tests). |

### Resources

After initialising `verify`, use these resource namespaces.

#### `verify.sessions`
- `create(params): Promise<Session>` — Create a hosted session. Returns `.url` and `.sessionId` — see the Hosted Verification guide.
- `retrieve(id): Promise<Session>` — Fetch a session by id.
- `list({ status?, vendorData?, limit? }): Promise<SessionSummary[]>` — List sessions, filterable by status / vendor_data.
- `decision(id): Promise<Decision>` — Authoritative result with `.checks[]` — call this after the webhook.
- `updateStatus(id, "APPROVED" | "DECLINED"): Promise<Session>` — Manual override (e.g. after agent review).

#### `verify.workflows`
- `create({ name, features, settings? }): Promise<Workflow>` — e.g. `features: ["id_verification","liveness","face_match","credential"]`.
- `list(): Promise<Workflow[]>` — List all workflows in the app.
- `retrieve(id): Promise<Workflow>` — Fetch a workflow.
- `update(id, patch): Promise<Workflow>` — Partial update.
- `remove(id): Promise<void>` — Delete a workflow.

#### `verify.standalone`
- `idVerification({ frontImage, backImage? }): Promise<CheckEnvelope>` — OCR + authenticity from a government ID.
- `liveness({ image }): Promise<CheckEnvelope>` — Passive liveness on a selfie.
- `faceMatch({ idImage, selfie }): Promise<CheckEnvelope>` — 1:1 face match.
- `ageVerification({ dob, bands? }): Promise<CheckEnvelope>` — Age + bands (e.g. `["is_18_plus"]`).
- `credentialVerification({ firstName, lastName, providerCode, licenseState, licenseNumber, npi? }): Promise<CheckEnvelope>` — Professional license lookup.
- `kycCredential({ frontImage, selfie, backImage?, providerCode, licenseState, licenseNumber, npi? }): Promise<KycCredentialResult>` — ID + liveness + face match + license, matched against the OCR'd name.

See the Core APIs guide for full field details.

#### `verify.credentials`
- `states(): Promise<{ states: CredentialState[] }>` — List supported states.
- `providers(state): Promise<{ providers: CredentialProvider[] }>` — List providers (license types) in a state, with `required_fields`.

#### `verify.webhooks`
- `constructEvent(rawBody, headers, secret?, { toleranceSeconds? }): WebhookEvent` — Verifies the HMAC signature and returns the parsed event. Throws `ValydVerifyError` with code `invalid_signature` on mismatch.
- `verify(rawBody, headers, secret?, { toleranceSeconds? }): boolean` — Boolean check, no parse, no throw.

Also exported as top-level `constructEvent` / `verify`. When `webhookSecret` is set on the client, the `secret` arg is optional.

### Helpers & types

`readImage` and `ImageInput` cover all the ways an image can be supplied:

```typescript
import { readImage, type ImageInput } from "@valyd/sdk";

// ImageInput accepted everywhere an image is required:
//   Buffer | Uint8Array | base64 string | data-URL string
const fromFile: ImageInput = readImage("./id_front.jpg"); // reads to base64
const fromBuf:  ImageInput = await fs.promises.readFile("./selfie.jpg");
const fromDataUrl: ImageInput = "data:image/jpeg;base64,/9j/4AAQ...";
```

Every response is strongly typed. Public API uses `camelCase`; wire payloads stay `snake_case`.

```typescript
import type {
  Session,
  SessionSummary,
  Decision,
  Check,
  CheckEnvelope,
  KycCredentialResult,
  Workflow,
  CredentialState,
  CredentialProvider,
  WebhookEvent,
} from "@valyd/sdk";
```

### Error handling

Every failure throws `ValydVerifyError` with `{ code, status?, data? }`. The `code` is either an API code (e.g. `API_KEY_INVALID`, `VALIDATION_ERROR`) or an SDK code:

- `network_error` — DNS/socket failure.
- `timeout` — exceeded `timeoutMs`.
- `invalid_signature` — webhook HMAC mismatch or stale timestamp.
- `config_error` — missing `apiKey` / `webhookSecret`.

```javascript
import { VerifyClient, ValydVerifyError } from "@valyd/sdk";

const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY!, timeoutMs: 90_000 });

try {
  const { check } = await verify.standalone.credentialVerification({
    firstName: "Jane", lastName: "Doe",
    providerCode: "MD", licenseState: "CA", licenseNumber: "A12345",
  });
} catch (err) {
  if (err instanceof ValydVerifyError) {
    console.error(err.code, err.status, err.message, err.data);
    if (err.code === "API_KEY_INVALID") { /* rotate / refetch */ }
  } else {
    throw err;
  }
}
```

### Quickstarts

#### Hosted quickstart

```javascript
import { VerifyClient } from "@valyd/sdk";

const verify = new VerifyClient({
  apiKey:        process.env.VALYD_API_KEY!,
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET!,
});

// 1) Create a session and redirect the user
const session = await verify.sessions.create({
  workflowId:  process.env.VALYD_WORKFLOW_ID!,
  redirectUrl: "https://app.example.com/verify/callback",
  callback:    "https://api.example.com/webhooks/valyd",
  vendorData:  "user_123",
});
// res.redirect(session.url)

// 2) In your webhook handler:
const event = verify.webhooks.constructEvent(rawBody, headers); // throws on bad signature

// 3) Pull the authoritative decision
const decision = await verify.sessions.decision(event.session_id);
// decision.status, decision.checks[]
```

**Expected output:** `verify.sessions.create(...)` resolves to a `Session` with `.url` (redirect the user here) and `.sessionId`. After the user finishes, your webhook fires; `constructEvent` returns the parsed `WebhookEvent`, and `verify.sessions.decision(...)` resolves to a `Decision` with `.status` and `.checks[]`.

#### Core APIs quickstart

```javascript
import { VerifyClient, readImage } from "@valyd/sdk";

const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY! });

// 1) Build a state/license picker
const { states }    = await verify.credentials.states();
const { providers } = await verify.credentials.providers("CA");

// 2) Run KYC + License in one call
const result = await verify.standalone.kycCredential({
  frontImage:    readImage("./id_front.jpg"),
  selfie:        readImage("./selfie.jpg"),
  providerCode:  "MD",
  licenseState:  "CA",
  licenseNumber: "A12345",
});
// result.status === "passed" only when ALL checks pass
```

**Expected output:** `verify.credentials.states()` resolves to `{ states }`, `verify.credentials.providers("CA")` resolves to `{ providers }`, and `verify.standalone.kycCredential(...)` resolves to a `KycCredentialResult` whose `.status` is `"passed"` only when ALL checks pass.

### Express webhook

Use `express.raw()` so the body bytes match what Valyd signed.

```javascript
import express from "express";
import { VerifyClient, ValydVerifyError } from "@valyd/sdk";

const app = express();
const verify = new VerifyClient({
  apiKey:        process.env.VALYD_API_KEY!,
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET!,
});

app.post(
  "/webhooks/valyd",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = verify.webhooks.constructEvent(req.body, req.headers);
      const decision = await verify.sessions.decision(event.session_id);
      await persist(event.vendor_data, decision);
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

**Expected output:** on a valid signature the handler responds `200` with `{ "ok": true }`; on a bad signature it responds `400` with body `bad signature`.

### Verification
- Confirm the SDK is installed:
  ```bash
  npm ls @valyd/sdk
  ```
  **Expected output:** a line like `@valyd/sdk@x.y.z`.
- Confirm credentials are wired (Core APIs path, only needs `VALYD_API_KEY`):
  ```javascript
  import { VerifyClient } from "@valyd/sdk";
  const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY! });
  const { states } = await verify.credentials.states();
  console.log(states.length); // > 0 means the API key works
  ```
  **Expected output:** a number greater than 0. If it throws `ValydVerifyError` with code `API_KEY_INVALID`, the key is wrong or missing.

### Common errors

1. **`ValydVerifyError` code `config_error`**
   - **Cause:** `apiKey` (or `webhookSecret` for webhook calls) was not provided to `VerifyClient`.
   - **Fix:** Set `VALYD_API_KEY` (and `VALYD_WEBHOOK_SECRET` for webhooks) in the environment and pass them to the constructor: `new VerifyClient({ apiKey: process.env.VALYD_API_KEY!, webhookSecret: process.env.VALYD_WEBHOOK_SECRET! })`.

2. **`ValydVerifyError` code `invalid_signature` in the webhook handler**
   - **Cause:** webhook HMAC mismatch or stale timestamp — most often because the request body was parsed/re-serialized before signature verification, so the bytes no longer match what Valyd signed.
   - **Fix:** Mount the webhook route with `express.raw({ type: "application/json" })` so `req.body` is the exact raw bytes, and make sure the `webhookSecret` matches the one in the dashboard.

3. **`ValydVerifyError` code `timeout`**
   - **Cause:** the request exceeded `timeoutMs` (default `15000`). Credential lookups can be slow.
   - **Fix:** Increase the per-request timeout for credential lookups (10–60s), e.g. `new VerifyClient({ apiKey: process.env.VALYD_API_KEY!, timeoutMs: 90_000 })`.

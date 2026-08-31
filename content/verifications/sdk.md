# Node SDK

## Recipe

### Prerequisites
- Node 18+ installed. Check with:
  ```bash
  node --version
  ```
  **Expected output:** `v18.x.x` or higher. If lower, upgrade Node before continuing.
- Credentials from the Valyd Developer Portal (https://dev.valyd.work):
  - `VALYD_API_KEY` — the App API key the SDK client authenticates with on every request.
  - `VALYD_WEBHOOK_SECRET` — needed to verify webhook signatures (Reusable Verification).
  - `VALYD_WORKFLOW_ID` — needed when creating verification sessions.

```text
IF you are building Reusable Verification (send the user to Valyd's verification page):
  → you need VALYD_API_KEY, VALYD_WEBHOOK_SECRET, and VALYD_WORKFLOW_ID
IF you are using the Unique Human API (a no-account session for a liveness/uniqueness workflow):
  → you need VALYD_API_KEY and VALYD_WORKFLOW_ID
IF unsure which credentials you have:
  → log in to https://dev.valyd.work and check your app's API keys / webhooks / workflows
```

### Steps

1. **Install the SDK.**
   ```bash
   npm i @valyd/sdk
   ```
   **Expected output:** npm adds `@valyd/sdk` at its latest published version to `dependencies` in `package.json`, so a fresh install always pulls the newest release.

2. **Set environment variables** (e.g. in a `.env` file or your process environment). Get each value from the Valyd Developer Portal: https://dev.valyd.work.
   ```bash
   VALYD_API_KEY=your_api_key_here          # App API key for every request
   VALYD_WEBHOOK_SECRET=your_webhook_secret  # required for webhook handling
   VALYD_WORKFLOW_ID=your_workflow_id        # required to create verification sessions
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
| `apiKey` | string | — | Required. The App API key the client authenticates with on every request. |
| `baseUrl` | string | `https://idp.valyd.work` | API base URL. Override only for staging/self-hosted. |
| `webhookSecret` | string | — | Optional. When set, `webhooks.constructEvent` / `verify` can be called without passing the secret explicitly. |
| `timeoutMs` | number | `15000` | Per-request timeout. **Credential lookups (`credentialVerification`, `kycCredential`) automatically use at least 60s** — set a higher value here only if you want a bigger floor for all calls. |
| `fetch` | typeof fetch | — | Custom fetch implementation (proxies, instrumentation, tests). |

### Authentication

Every Verification API call is authenticated by your **App API key** — the `apiKey` you pass to the
constructor. This is the credential that matters for the SDK; get it from the Developer Portal → your
project → Credentials.

- **`apiKey` (`vrf_…`)** — authenticates all `verify.*` calls (sessions, the Unique Human API,
  workflows). This is the only credential the SDK needs to make requests.
- **`webhookSecret` (`whsec_…`)** — NOT an auth credential for outbound calls. It is used only to
  verify the HMAC signature on **incoming** webhooks (`verify.webhooks.constructEvent`).
- **`client_id` / `client_secret`** — these belong to **Connect with Valyd** (standard OAuth 2.0 /
  OIDC), the sign-in step of Reusable Verification. They do **not** authenticate verification
  calls; use the App API key for that. (You hold both credentials, used independently.)

So: integrations that only call the Verification API need just the `apiKey`. There is no constructor form that
authenticates verify calls without it.

### Resources

After initialising `verify`, use these resource namespaces.

#### `verify.sessions`
- `create(params): Promise<Session>` — Create a verification session. Returns `.url` and `.sessionId` — see [Run a verification](/verifications/quickstart).
- `retrieve(id): Promise<Session>` — Fetch a session by id.
- `list({ status?, vendorData?, limit? }): Promise<SessionSummary[]>` — List sessions, filterable by status / vendor_data.
- `decision(id): Promise<Decision>` — Authoritative result with `.checks[]` — call this after the webhook.
- `updateStatus(id, "APPROVED" | "DECLINED"): Promise<Session>` — Manual override (e.g. after agent review).

> **Workflows** are composed in the [Developer Portal](https://dev.valyd.work) — the Node SDK does
> not expose workflow CRUD. You pass the resulting `workflowId` to `sessions.create(...)`.

#### The Unique Human API

The **Unique Human API** is the same `verify.sessions` surface with **no user token**: create a
session for a workflow containing the anti-spoof and/or face-uniqueness checks, redirect the
person to `session.url`, and read the verdict from `verify.sessions.decision()`. No account is
involved, the result returns to you, and nothing is saved to one. See the
[Unique Human API](/verifications/unique-human) reference.

- `faceUniquenessUnlink(valydUuid)` — GDPR: forget this project's link to a face id (deletes the
  face entirely when no remaining project or Valyd account knows it).

> **ID/KYC, face match, age, professional license, and location run only as workflow checks in
> [Reusable Verification](/verifications)** (a verification session for a user who connected with
> Valyd), never as their own public APIs. The SDK's other low-level `verify.standalone.*` methods
> remain for compatibility and are not part of the public products.

Every billable check also accepts an optional `idempotencyKey` — sent as the
`Idempotency-Key` header so a network retry can never double-charge or double-run.

#### `verify.credentials`
- `states(): Promise<CredentialState[]>` — List supported states.
- `providers(state): Promise<CredentialProvider[]>` — List providers (license types) in a state, with `required_fields`.

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

const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY! });

try {
  const session = await verify.sessions.create({
    workflowId:  process.env.VALYD_WORKFLOW_ID!,
    redirectUrl: "https://yourapp.com/checked",
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

#### Reusable Verification quickstart

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
const decision = await verify.sessions.decision(event.sessionId);
// decision.status, decision.checks[]
```

**Expected output:** `verify.sessions.create(...)` resolves to a `Session` with `.url` (redirect the user here) and `.sessionId`. After the user finishes, your webhook fires; `constructEvent` returns the parsed `WebhookEvent`, and `verify.sessions.decision(...)` resolves to a `Decision` with `.status` and `.checks[]`.

#### Unique Human API quickstart

The Unique Human API is API-key-only — a **no-account session** for a workflow containing the
liveness and/or uniqueness checks; the person is redirected to Valyd's verification page and
nothing is saved to an account. (ID/KYC, face match, age, license, and location run as workflow
checks in [Reusable Verification](/verifications) instead.)

```javascript
import { VerifyClient } from "@valyd/sdk";

const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY });

const session = await verify.sessions.create({
  workflowId:  process.env.VALYD_WORKFLOW_ID,   // liveness and/or uniqueness
  redirectUrl: "https://yourapp.com/checked",
});
// → redirect the person to session.url, then:
const decision = await verify.sessions.decision(session.sessionId);
// antispoof check data → { human_score, assurance: "captured", ... }
// face_uniqueness check data → { valyd_uuid, registered: "new" | "existing" }
```

**Expected output:** the decision's `status` is `"APPROVED"` on a live, unique capture, with the per-check data on `decision.checks[]`.

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
```

**Expected output:** on a valid signature the handler responds `200` with `{ "ok": true }`; on a bad signature it responds `400` with body `bad signature`.

### Verification
- Confirm the SDK is installed:
  ```bash
  npm ls @valyd/sdk
  ```
  **Expected output:** `@valyd/sdk` at its latest published version.
- Confirm credentials are wired (only needs `VALYD_API_KEY`):
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

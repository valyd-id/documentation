# Node SDK

## Recipe

### Prerequisites
- Node 18+ installed. Check with:
  ```bash
  node --version
  ```
  **Expected output:** `v18.x.x` or higher. If lower, upgrade Node before continuing.
- Credentials from the Valyd Developer Portal (https://dev.valyd.work):
  - `VALYD_API_KEY` — sent as the `X-API-Key` header on every request.
  - `VALYD_WEBHOOK_SECRET` — needed to verify webhook signatures (hosted flow).
  - `VALYD_WORKFLOW_ID` — needed when creating hosted sessions.

```text
IF you are building a hosted flow (redirect the user to a Valyd-hosted page):
  → you need VALYD_API_KEY, VALYD_WEBHOOK_SECRET, and VALYD_WORKFLOW_ID
IF you are building a standalone-checks flow (call individual checks server-side):
  → you only need VALYD_API_KEY
IF unsure which credentials you have:
  → log in to https://dev.valyd.work and check your app's API keys / webhooks / workflows
```

### Steps

1. **Install the SDK.**
   ```bash
   npm i @valyd/sdk@^1.10.2
   ```
   **Expected output:** npm adds `@valyd/sdk` at `^1.10.2` to `dependencies` in `package.json`. This allows backwards-compatible patch and minor upgrades while keeping the documented minimum version.

2. **Set environment variables** (e.g. in a `.env` file or your process environment). Get each value from the Valyd Developer Portal: https://dev.valyd.work.
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
| `baseUrl` | string | `https://idp.valyd.work` | API base URL. Override only for staging/self-hosted. |
| `webhookSecret` | string | — | Optional. When set, `webhooks.constructEvent` / `verify` can be called without passing the secret explicitly. |
| `timeoutMs` | number | `15000` | Per-request timeout. **Credential lookups (`credentialVerification`, `kycCredential`) automatically use at least 60s** — set a higher value here only if you want a bigger floor for all calls. |
| `fetch` | typeof fetch | — | Custom fetch implementation (proxies, instrumentation, tests). |

### Authentication

Every Verification API call is authenticated by your **App API key** — the `apiKey` you pass to the
constructor, sent as the `X-API-Key` header on each request. This is the credential that matters for the SDK; get it from the Developer Portal → your
project → Credentials.

- **`apiKey` (`vrf_…`)** — authenticates all `verify.*` calls (sessions, standalone checks,
  workflows). This is the only credential the SDK needs to make requests.
- **`webhookSecret` (`whsec_…`)** — NOT an auth credential for outbound calls. It is used only to
  verify the HMAC signature on **incoming** webhooks (`verify.webhooks.constructEvent`).
- **`client_id` / `client_secret`** — these belong to **Login with Valyd** (OAuth 2.0 / OIDC), a
  separate product. They do **not** authenticate verification calls; use the App API key for that.
  (If you build both, you hold both credentials, used independently.)

So: verification-only integrations need just the `apiKey`. There is no constructor form that
authenticates verify calls without it.

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
- `antispoof({ image? | frames?, challengeId? }): Promise<CheckEnvelope>` — "Is this a live human capture?" — `human_score` 0–100 in `check.data`. Single `image` (score capped at 85) or 3–8 burst `frames`. *v1.10.2+*
- `antispoofIdentity({ image? | frames?, challengeId? }): Promise<CheckEnvelope>` — Anti-spoof, then resolves the proven-live face to a stable `valyd_` uuid (`check.data.identity`). *v1.10.2+*
- `antispoofChallenge(): Promise<LivenessChallengeResult>` — Single-use 60s gesture challenge; echo `challengeId` back on antispoof / face-uniqueness runs. *v1.10.2+*
- `faceMatch({ idImage, selfie }): Promise<CheckEnvelope>` — 1:1 face match.
- `faceUniqueness({ selfie? | frames?, externalRef?, challengeId? }): Promise<CheckEnvelope>` — One face = one uuid: enroll-or-match against the global gallery (`check.data.valyd_uuid`, `registered`).
- `faceUniquenessUnlink(valydUuid): Promise<{ valyd_uuid, unlinked, deleted }>` — GDPR forget: unlink a face from your project.
- `locationMatch({ latitude, longitude, accuracy?, expectedLatitude?, expectedLongitude?, radiusM? }): Promise<CheckEnvelope>` — Record or verdict a geolocation fix.
- `ageVerification({ dob, bands? }): Promise<CheckEnvelope>` — Age + bands (e.g. `["is_18_plus"]`).
- `credentialVerification({ licenseState, licenseNumber, ...name, ...license, npi? }): Promise<CheckEnvelope>` — Professional license lookup. Give the holder's **name** as `firstName` + `lastName` **or** `fullName`; identify the **license** with `licenseType` (Valyd resolves the provider board for you — no `providerCode` needed) **or** pass `providerCode` directly. `npi?` is optional.
- `kycCredential({ frontImage, selfie, backImage?, providerCode, licenseState, licenseNumber, npi? }): Promise<KycCredentialResult>` — ID + liveness + face match + license, matched against the OCR'd name.
- `evvPresence({ selfie, idImage? | valydAccessToken?, latitude, longitude, expectedLatitude?, expectedLongitude?, radiusM? }): Promise<CheckEnvelope>` — EVV bundle: face match + location match in one call.

Every billable check also accepts an optional `idempotencyKey` (*v1.10.2+*) — sent as the
`Idempotency-Key` header so a network retry can never double-charge or double-run
([how it behaves](/verifications/standalone#idempotency)).

See the [Standalone checks](/verifications/standalone) reference for full field details.

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
const decision = await verify.sessions.decision(event.sessionId);
// decision.status, decision.checks[]
```

**Expected output:** `verify.sessions.create(...)` resolves to a `Session` with `.url` (redirect the user here) and `.sessionId`. After the user finishes, your webhook fires; `constructEvent` returns the parsed `WebhookEvent`, and `verify.sessions.decision(...)` resolves to a `Decision` with `.status` and `.checks[]`.

#### Standalone checks quickstart

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
  **Expected output:** `@valyd/sdk@1.10.2` (or a newer compatible version allowed by `^1.10.2`).
- Confirm credentials are wired (standalone path, only needs `VALYD_API_KEY`):
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

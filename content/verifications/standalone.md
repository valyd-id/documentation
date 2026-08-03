# Core APIs (server-to-server verification)

> **Raw data vs proofs.** Without a Valyd user token these are **Non-account (Fresh)** checks: you did the capture, nothing is retained, and the response contains the **raw** extracted data (document `fields`, `dob`, portrait, OCR). Pass a `valyd_access_token` (or `valyd_id`) and the same endpoints run in **Account (Managed by Valyd)** mode — answering from the user's stored identity and returning **proofs only** (`id_verified`, match + score, license badges, age bands), never raw KYC. Raw account attributes come only from the consent Core API. See [Account (Managed by Valyd)](https://docs.valyd.work/verify/managed.md).

## Agent Quick-Start
- Source URL: https://docs.valyd.work/verify#standalone
- Credentials / env vars needed: VALYD_API_KEY (App API key — keep server-side, never ship to the browser)
- Files an integrator edits: server route handler / backend service, .env (for VALYD_API_KEY)
- Estimated steps: 3 (install SDK or use cURL, set VALYD_API_KEY, call the endpoint)
- Can complete without human input: NO — you must obtain an App API key from the Valyd Developer Portal (https://dev.valyd.work) before any call will authenticate.
- Prerequisites:
  - A Valyd App API key. Pass it as the HTTP header `X-API-Key: <App API key>` on every request. Get this from the Developer Portal → your project → Credentials: https://dev.valyd.work
  - A server/backend to make the call from (these are server-to-server APIs; never call them from the browser, because the API key would be exposed).
  - (SDK path only) Node.js with the `@valyd/sdk` npm package installed.

## Overview

Direct, synchronous, server-to-server checks. You build your own UI and call these endpoints from your backend. Every request uses the header `X-API-Key: <App API key>` — keep this server-side, never ship it to the browser.

Base URL for every endpoint below: `https://idp.valyd.work`

Every response uses the standard envelope and includes a `check` object:

```json
{
  "success": true,
  "data": {
    "session_id": "ses_…",
    "status": "passed",   // passed | failed | review
    "check": {
      "type": "id_verification" | "liveness" | "face_match" | "age" | "credential",
      "status": "passed" | "failed" | "review",
      "score": 0.97,
      "data": { /* per-check details */ },
      "error": null
    }
  },
  "error": null
}
```

The JSON blocks shown under each endpoint below are the contents of `check.data` (the per-check details), unless the block is labeled otherwise.

## SDK quick start

The official Node SDK is published on npm as `@valyd/sdk` (https://www.npmjs.com/package/@valyd/sdk). Image fields accept a file path via `readImage("./x.jpg")`, a `Buffer`, or a base64 / data-URL string. Over plain HTTP, send images as a base64 string in the JSON field (or as a multipart file under the same field name).

Install:

```bash
npm i @valyd/sdk
```

Create a client (do this once and reuse it):

```javascript
import { VerifyClient, readImage } from "@valyd/sdk";

const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY! });
// keep VALYD_API_KEY on the server — never in browser code
// get the API key from the Developer Portal → your project → Credentials: https://dev.valyd.work
```

Set the API key in your environment before running:

```bash
export VALYD_API_KEY="<your App API key from https://dev.valyd.work>"
```

---

## POST /api/v2/id-verification — ID Verification

OCR + authenticity from a government ID.

**Method:** POST
**Full URL:** `https://idp.valyd.work/api/v2/id-verification`
**Auth header:** `X-API-Key: <App API key>`

**Fields:**
- `front_image` (image) **required** — Front of the ID. File, Buffer, or base64/data-URL.
- `back_image` (image) — Back of the ID (when applicable).

**Request (cURL):**

```bash
curl -X POST https://idp.valyd.work/api/v2/id-verification \
  -H "X-API-Key: $VALYD_API_KEY" \
  -F "front_image=@./id_front.jpg" \
  -F "back_image=@./id_back.jpg"
```

**Request (SDK, Node):**

```javascript
import { VerifyClient, readImage } from "@valyd/sdk";
const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY! });

const { check } = await verify.standalone.idVerification({
  frontImage: readImage("./id_front.jpg"),
  backImage:  readImage("./id_back.jpg"), // optional
});

console.log(check.data.fields.full_name, check.data.fields.document_number);
```

**Expected output:** HTTP 200 with the standard envelope (`success: true`); `check.type` is `"id_verification"` and `check.data` is:

```json
{
  "fields": {
    "full_name": "Jane Doe",
    "fathers_name": "John Doe",
    "document_number": "X1234567",
    "date_of_birth": "1990-01-15",
    "date_of_issue": "2020-03-10",
    "date_of_expiry": "2030-03-10",
    "sex": "F",
    "issuing_state": "CA",
    "country": "US",
    "document_type": "driver_license"
  },
  "portrait": "<base64>",
  "dob": "1990-01-15",
  "authenticity": { "score": 0.96 }
}
```

---

## POST /api/v2/liveness — Liveness

Passive liveness check. Passes when `live_score === 1`.

**Method:** POST
**Full URL:** `https://idp.valyd.work/api/v2/liveness`
**Auth header:** `X-API-Key: <App API key>`

**Fields:**
- `image` (image) **required** — A selfie. File, Buffer, or base64/data-URL.

**Request (cURL):**

```bash
curl -X POST https://idp.valyd.work/api/v2/liveness \
  -H "X-API-Key: $VALYD_API_KEY" \
  -F "image=@./selfie.jpg"
```

**Request (SDK, Node):**

```javascript
const { check } = await verify.standalone.liveness({
  image: readImage("./selfie.jpg"),
});
// check.status === "passed" when check.data.live_score === 1
```

**Expected output:** HTTP 200 with the standard envelope (`success: true`); `check.type` is `"liveness"`. `check.status === "passed"` when `live_score === 1`. `check.data` is:

```json
{
  "live_score": 1,
  "result": "live"
}
```

`live_score` values: `1` = live, `0` = spoof, `< 0` = no face detected.

---

## POST /api/v2/face-match — Face Match

Compare two images. Passes when similarity ≥ threshold (default ~0.95).

**Method:** POST
**Full URL:** `https://idp.valyd.work/api/v2/face-match`
**Auth header:** `X-API-Key: <App API key>`

**Fields:**
- `image1` (image) **required** — Reference image (typically the ID portrait).
- `image2` (image) **required** — Selfie to compare against the reference.

**Request (cURL):**

```bash
curl -X POST https://idp.valyd.work/api/v2/face-match \
  -H "X-API-Key: $VALYD_API_KEY" \
  -F "image1=@./id_portrait.jpg" \
  -F "image2=@./selfie.jpg"
```

**Request (SDK, Node):**

```javascript
const { check } = await verify.standalone.faceMatch({
  idImage: readImage("./id_portrait.jpg"),
  selfie:  readImage("./selfie.jpg"),
});
// check.data.similarity, check.data.threshold
```

**Expected output:** HTTP 200 with the standard envelope (`success: true`); `check.type` is `"face_match"`. `check.data` is:

```json
{ "similarity": 0.973, "threshold": 0.95 }
```

---

## POST /api/v2/age-verification — Age Verification

JSON body. Computes age from DOB and verifies the requested age bands (no ZKP).

**Method:** POST
**Full URL:** `https://idp.valyd.work/api/v2/age-verification`
**Auth header:** `X-API-Key: <App API key>`
**Content-Type:** `application/json`

**Fields:**
- `dob` (string, `YYYY-MM-DD`) **required** — Date of birth.
- `bands` (string[]) **required** — e.g. `["is_18_plus","is_21_plus"]`.

**Request (cURL):**

```bash
curl -X POST https://idp.valyd.work/api/v2/age-verification \
  -H "X-API-Key: $VALYD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "dob": "1995-06-01", "bands": ["is_18_plus","is_21_plus"] }'
```

**Request (SDK, Node):**

```javascript
const { check } = await verify.standalone.ageVerification({
  dob: "1995-06-01",
  bands: ["is_18_plus", "is_21_plus"],
});
```

**Expected output:** HTTP 200 with the standard envelope (`success: true`); `check.type` is `"age"`. `check.data` is:

```json
{
  "age": 30,
  "dob": "1995-06-01",
  "bands": {
    "is_18_plus": { "verified": true, "min_age": 18 },
    "is_21_plus": { "verified": true, "min_age": 21 }
  }
}
```

---

## POST /api/v2/credential-verification — Credential Verification

Look up a professional license in the provider registry. Registry lookups can take 10–60s — use a generous timeout.

**Method:** POST
**Full URL:** `https://idp.valyd.work/api/v2/credential-verification`
**Auth header:** `X-API-Key: <App API key>`
**Content-Type:** `application/json`

**Fields:**
- `first_name` (string) **required** — Required even when `required_fields` omits it — the registry always needs a name.
- `last_name` (string) **required** — Or supply `full_name` instead of first/last.
- `license_type` (string) **required** — Provider code, e.g. `'MD'`. Alias: `provider_code`.
- `license_state` (string) **required** — 2-letter state code. Alias: `state`.
- `license_number` (string) **required** — Alias: `license_no`.
- `npi` (string) — Optional NPI when applicable.

**Request (cURL):**

```bash
curl -X POST https://idp.valyd.work/api/v2/credential-verification \
  -H "X-API-Key: $VALYD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name":  "Doe",
    "license_type":   "MD",
    "license_state":  "CA",
    "license_number": "A12345",
    "npi": "1234567890"
  }'
```

**Request (SDK, Node):**

```javascript
const { check } = await verify.standalone.credentialVerification({
  firstName: "Jane",
  lastName:  "Doe",
  providerCode: "MD",
  licenseState: "CA",
  licenseNumber: "A12345",
  npi: "1234567890", // optional
});
// check.data.match, check.data.license
```

**Expected output:** HTTP 200 with the standard envelope (`success: true`); `check.type` is `"credential"`. `check.data` is:

```json
{
  "match": true,
  "license": {
    "license_number": "A12345",
    "status": "active",
    "issued_at": "2015-01-01",
    "expires_at": "2027-01-01",
    "specialty": "Internal Medicine"
  }
}
```

---

## POST /api/v2/kyc-credential — KYC + Credential

Combined ID verification + liveness + face match + license lookup, in one call. The license is matched against the name OCR'd from the ID — never a client-supplied name — so the holder cannot impersonate someone else's license.

**Method:** POST
**Full URL:** `https://idp.valyd.work/api/v2/kyc-credential`
**Auth header:** `X-API-Key: <App API key>`

**Fields:**
- `front_image` (image) **required** — Front of the government ID.
- `selfie` (image) **required** — Live selfie for liveness + face match.
- `back_image` (image) — Back of the ID (when applicable).
- `license_type` (string) **required** — Provider code. Alias: `provider_code`.
- `license_state` (string) **required** — State code. Alias: `state`.
- `license_number` (string) **required** — Alias: `license_no`.
- `npi` (string) — Optional NPI.

**Request (cURL):**

```bash
curl -X POST https://idp.valyd.work/api/v2/kyc-credential \
  -H "X-API-Key: $VALYD_API_KEY" \
  -F "front_image=@./id_front.jpg" \
  -F "selfie=@./selfie.jpg" \
  -F "license_type=MD" \
  -F "license_state=CA" \
  -F "license_number=A12345"
```

**Request (SDK, Node):**

```javascript
const result = await verify.standalone.kycCredential({
  frontImage: readImage("./id_front.jpg"),
  selfie:     readImage("./selfie.jpg"),
  providerCode:  "MD",
  licenseState:  "CA",
  licenseNumber: "A12345",
});

// result.status === "passed" only when every check passes
// result.checks: [id_verification, liveness, face_match, credential]
// result.identity: { name, dob }  ← name used for the license match
```

**Expected output:** HTTP 200 with the standard envelope (`success: true`). The `data` object is:

```json
{
  "session_id": "ses_…",
  "status": "passed",
  "identity": { "name": "Jane Doe", "dob": "1990-01-15" },
  "checks": [
    { "type": "id_verification", "status": "passed", "data": { /* … */ } },
    { "type": "liveness",        "status": "passed", "data": { "live_score": 1 } },
    { "type": "face_match",      "status": "passed", "data": { "similarity": 0.97 } },
    { "type": "credential",      "status": "passed", "data": { "match": true, "license": { /* … */ } } }
  ]
}
```

`status` is `"passed"` only when every check passes.

---

## Credential discovery

Use these endpoints to build state and license-type pickers in your UI before calling `credential-verification` or `kyc-credential`. A provider's `required_fields` tells you which license inputs to collect — but always collect first / last name even when it isn't listed, because the registry lookup needs it.

### GET /api/v2/credential/states — list states

**Method:** GET
**Full URL:** `https://idp.valyd.work/api/v2/credential/states`
**Auth header:** `X-API-Key: <App API key>`

**Request (cURL):**

```bash
curl https://idp.valyd.work/api/v2/credential/states \
  -H "X-API-Key: $VALYD_API_KEY"
```

**Request (SDK, Node):**

```javascript
const { states } = await verify.credentials.states();
// states: [{ state_name: "California", state_code: "CA" }, …]
```

**Expected output:** HTTP 200 with the standard envelope (`success: true`); `data` is:

```json
{ "states": [ { "state_name": "California", "state_code": "CA" } ] }
```

### GET /api/v2/credential/states/{state}/providers — list providers for a state

`{state}` is a 2-letter state code (e.g. `CA`).

**Method:** GET
**Full URL:** `https://idp.valyd.work/api/v2/credential/states/{state}/providers`
**Auth header:** `X-API-Key: <App API key>`

**Request (cURL):**

```bash
curl https://idp.valyd.work/api/v2/credential/states/CA/providers \
  -H "X-API-Key: $VALYD_API_KEY"
```

**Request (SDK, Node):**

```javascript
const { providers } = await verify.credentials.providers("CA");
// providers: [{ provider_code, provider_display_name, credential_name, required_fields, … }]
```

**Expected output:** HTTP 200 with the standard envelope (`success: true`); `data` is:

```json
{
  "providers": [
    {
      "provider_code": "MD",
      "provider_display_name": "Medical Board of California",
      "credential_name": "Physician & Surgeon",
      "required_fields": ["license_number"]
    }
  ]
}
```

---

## Errors

Over HTTP, failures return the envelope `{ success: false, error: { code, message } }` with the matching HTTP status:

- `401` — invalid or missing API key.
- `400` — validation error (missing field, bad image, unknown provider).
- `404` — unknown state or provider.
- `429` — rate limited.
- `5xx` — upstream registry or internal error.

In the SDK, the same failures throw `ValydVerifyError` with `{ code, status, message }`. Credential registry lookups can take **10–60 seconds** — configure a generous client timeout.

```javascript
import { VerifyClient, ValydVerifyError, readImage } from "@valyd/sdk";

const verify = new VerifyClient({
  apiKey: process.env.VALYD_API_KEY!,
  timeoutMs: 90_000, // registry lookups can be slow
});

try {
  const { check } = await verify.standalone.credentialVerification({
    firstName: "Jane", lastName: "Doe",
    providerCode: "MD", licenseState: "CA", licenseNumber: "A12345",
  });
} catch (err) {
  if (err instanceof ValydVerifyError) {
    console.error(err.status, err.code, err.message);
  } else {
    throw err;
  }
}
```

### Common errors

1. **HTTP 401 — invalid or missing API key.**
   - Cause: The `X-API-Key` header is absent or holds a wrong/revoked key.
   - Fix: Set `X-API-Key: <App API key>` on the request (or `apiKey` in the SDK client). Obtain a valid key from the Developer Portal → your project → Credentials: https://dev.valyd.work

2. **Client timeout on credential / kyc-credential calls.**
   - Cause: Registry lookups can take 10–60 seconds; the default client timeout aborts first.
   - Fix: Configure a generous timeout (e.g. `timeoutMs: 90_000` in the SDK client, or `--max-time 90` for cURL).

3. **HTTP 400 / 404 — validation error or unknown state/provider.**
   - Cause: A required field is missing, an image is unreadable, or the supplied `license_state` / `license_type` (`provider_code`) is not in the registry.
   - Fix: Call `GET /api/v2/credential/states` and `GET /api/v2/credential/states/{state}/providers` first to get valid codes and each provider's `required_fields`; always include first/last name even if `required_fields` omits it.

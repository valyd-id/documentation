# KYC + Credential

`POST /api/v2/kyc-credential` — combined ID verification + liveness + face match + license lookup, in one call. The license is matched against the name OCR'd from the ID — never a client-supplied name — so the holder cannot impersonate someone else's license.

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

Get valid state and provider codes from the
[credential discovery endpoints](/verifications/standalone/credential-verification#credential-discovery).

**Request (SDK, Node):**

```javascript
import { VerifyClient, readImage } from "@valyd/sdk";
const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY });

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

**Raw HTTP:** [cURL example →](/verifications/standalone/http#kyc--credential)

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

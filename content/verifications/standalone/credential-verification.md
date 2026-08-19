# Credential Verification

`POST /api/v2/credential-verification` — look up a professional license in the provider registry.
Registry lookups can take 10–60s — use a generous timeout. Use the
[discovery endpoints](#credential-discovery) below to get valid state and provider codes first.

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

**Request (SDK, Node):**

```javascript
import { VerifyClient } from "@valyd/sdk";
const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY });

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

**Raw HTTP:** [cURL example →](/verifications/standalone/http#credential-verification)

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

## Credential discovery

Use these endpoints to build state and license-type pickers in your UI before calling `credential-verification` or [`kyc-credential`](/verifications/standalone/kyc-credential). A provider's `required_fields` tells you which license inputs to collect — but always collect first / last name even when it isn't listed, because the registry lookup needs it.

### GET /api/v2/credential/states — list states

**Method:** GET
**Full URL:** `https://idp.valyd.work/api/v2/credential/states`
**Auth header:** `X-API-Key: <App API key>`

**Request (SDK, Node):**

```javascript
const states = await verify.credentials.states();
// states: [{ stateName: "California", stateCode: "CA", … }]  (SDK maps to camelCase)
```

**Raw HTTP:** [cURL example →](/verifications/standalone/http#credential-discovery)

**Expected output:** HTTP 200 with the standard envelope (`success: true`); `data` is:

```json
{ "states": [ { "state_name": "California", "state_code": "CA" } ] }
```

### GET /api/v2/credential/states/{state}/providers — list providers for a state

`{state}` is a 2-letter state code (e.g. `CA`).

**Method:** GET
**Full URL:** `https://idp.valyd.work/api/v2/credential/states/{state}/providers`
**Auth header:** `X-API-Key: <App API key>`

**Request (SDK, Node):**

```javascript
const providers = await verify.credentials.providers("CA");
// providers: [{ providerCode, providerDisplayName, credentialName, requiredFields, … }]  (camelCase)
```

**Raw HTTP:** [cURL example →](/verifications/standalone/http#credential-discovery)

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

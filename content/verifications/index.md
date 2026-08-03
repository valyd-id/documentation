# Verification APIs

## Agent Quick-Start
- Source URL: https://docs.valyd.work/verify#intro
- Credentials / env vars needed: none (this is an overview; you need an App API key from the Developer Portal before making calls — get it at https://dev.valyd.work)
- Files an integrator edits: none — reference only
- Estimated steps: 0 (conceptual overview)
- Can complete without human input: YES — reading/reference only, no actions required
- Prerequisites: none

Verification APIs has **two API types** — **Account (Managed by Valyd)**, where the user has a Valyd account and their verified identity is stored and reused, and **Non-account (Fresh)**, a one-shot check with nothing retained. Each is available two ways: **Hosted** (Valyd renders the capture page) or **Core APIs** (you call REST directly with your own UI).

| | Hosted | Core APIs |
|---|---|---|
| **Account (Managed by Valyd)** | Login with Valyd → run a workflow on the hosted page; steps stored on the account; reuse skips already-done steps. **Proofs only.** | Call REST with the user's token — license (badge on the account), face (vs their stored vector), reuse read. KYC redirects to Valyd. **Proofs only.** |
| **Non-account (Fresh)** | One-shot hosted capture, nothing retained. **Raw data.** | Per-endpoint REST capture in your own UI. **Raw data.** |

**Data-sharing rule.** Account APIs return **proofs only** — a pseudonym, `id_verified`, verified license badges and age bands — and **never** raw KYC (legal name, date of birth, document images). Raw account attributes are released solely through the **consent Core API**, where the user approves the release in their Valyd app and the values are sealed to your public key. Non-account (Fresh) APIs return the captured **raw data as-is**. See [Account (Managed by Valyd)](https://docs.valyd.work/verify/managed.md).

## Integration modes

### Hosted
Redirect your user to Valyd's hosted page for ID + selfie capture. Receive the result via a signed webhook and a decision API call. No UI to build.

### Core APIs
Call per-capability REST endpoints server-to-server with your own UI and data. Synchronous JSON result returned on the same request.

To choose between them, see https://docs.valyd.work/verify#modes (modes.md).

## Services

| Service | Description |
| --- | --- |
| `id_verification` | KYC / OCR from a government ID |
| `liveness` | Passive liveness check |
| `face_match` | Selfie vs ID portrait |
| `age` | Age band checks from DOB |
| `credential` | Professional license lookup |

## Base URL

```text
https://idp.valyd.work
```

## Response envelope

Every API response uses this envelope. `success` is always present; `error` is only present when `success` is `false`.

```json
{
  "success": true,
  "data": {},
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

Note: the `error` object is only included in the response when `success` is `false`. On success, only `success` and `data` are present.

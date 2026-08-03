# Account (Managed by Valyd)

## Agent Quick-Start
- Source URL: https://docs.valyd.work/verify?mode=managed
- Credentials / env vars needed: ONE app from the Developer Portal (https://dev.valyd.work) — it gives you both the OAuth `client_id`/`client_secret` for "Login with Valyd" AND the Verify API key (`X-API-Key`) and `workflow_id`. There is no second console.
- Auth: the end user logs in with Valyd (OAuth2/TPSSO); you pass their `valyd_access_token` when creating a session or calling a reuse/core API
- Prerequisites: the user has (or creates) a Valyd account

Account ("Managed by Valyd") is one of the two Valyd API types. The other is Non-account
("Fresh"). Each type is available as **Hosted** (Valyd renders the capture page) or **Core APIs**
(you call REST directly) — a 2×2:

| | Hosted | Core APIs |
|---|---|---|
| **Account (Managed by Valyd)** | Login with Valyd → workflow on the hosted page; steps stored on the account; reuse skips already-done steps. Proofs only. | Call REST with the user's token — license (badge on account), face (vs stored vector), reuse read/revoke. KYC redirects to Valyd. Proofs only. |
| **Non-account (Fresh)** | One-shot hosted capture, nothing retained. Raw data. | Per-endpoint REST capture in your own UI. Raw data. |

## Data-sharing rule (critical)

- **Account APIs return proofs only** — a pseudonym, `id_verified`, verified license badges, and age
  bands. They **never** return raw KYC (legal name, date of birth, document images). In a decision,
  the `id_verification` check reduces to `{ status, id_verified }`; `identity` is
  `{ valyd_id, pseudonym, id_verified, age_bands, licenses, verified_at }`.
- **Raw account KYC is released only through the consent Core API** — you request specific attributes,
  the user approves in their Valyd app, and the values are returned end-to-end encrypted (X25519 sealed
  box) to your public key. See "Consent Core API" below.
- **Non-account (Fresh) APIs return the captured raw data as-is** — you performed the capture and Valyd
  retains nothing.

## Why: Account vs Non-account

- **Account**: the verified identity is stored on the user's Valyd account and **reused** everywhere.
  A returning user re-verifies with a **selfie only** (matched against their stored face vector);
  already-verified KYC and licenses are skipped. Data belongs to the user's account; integrators get
  proofs.
- **Non-account**: a one-shot capture; nothing is stored; the integrator receives the raw result.

## Hosted flow (Account × Hosted)

1. Register your app at the Developer Portal (https://dev.valyd.work) → `client_id` / `client_secret`, and in the same portal create a Verify project → API key (`vrf_…`, shown once) + `workflow_id`. One console, all credentials.
2. Log the user in with Valyd (OAuth2/TPSSO), exchange the code → `valyd_access_token` + identity.
3. If KYC is required and not done, **redirect the user to Valyd** to complete it (raw KYC is stored
   under the user's per-user key; it can't be a plain API write).
4. Create a session: `POST https://idp.valyd.work/api/v2/session` with `workflow_id`, `valyd_access_token`,
   `vendor_data`, and (for redirect) `redirect_url` + `callback`.
5. Redirect the user to the returned hosted `url`. Reuse skips already-completed steps.
6. Read the result via the signed webhook and/or `GET /api/v2/session/{id}/decision` — **proofs only**
   (`origin: "managed"`).

## Core APIs (Account × Core)

- **License / credential**: matched against the account's real name, the verified badge is stored on the
  account, and a proof is returned.
- **Face match**: a selfie is matched against the account's stored face vector (only the selfie leaves
  your server).
- **Reuse read / revoke**: `GET /api/v2/identity?valyd_id=…` (proofs only) and
  `DELETE /api/v2/identity/{valyd_id}`.
- **KYC**: redirect the user to Valyd (raw KYC needs the per-user encryption key to store).

## Consent Core API — request raw KYC (user approves)

There are **two ways** to get raw account attributes (full guide: `/docs/request-data`):

- **At login (recommended)** — add `attributes` + your X25519 `requester_public_key` to the
  authorize URL. The user checks/unchecks them on the Login-with-Valyd consent screen and the
  granted fields ride back with the login as `attr_code`. Consent is **remembered per app**, so a
  returning user isn't re-prompted. No mobile step.
- **Any time after login** — the `attribute-request` flow below; the user approves in their Valyd
  app. Use it for fields the user didn't grant at login.

After login, request explicitly:

```bash
# 1) Request specific attributes, sending your X25519 public key
curl -X POST https://idp.valyd.work/api/auth/attribute-request \
  -H "Authorization: Bearer $CLIENT_TOKEN" -H "Content-Type: application/json" \
  -d '{ "client_id": "$CLIENT_ID",
        "attributes": ["legal_name","dob","id_verified"],
        "requester_public_key": "<base64 X25519 pubkey>" }'
# → { data: { request_id, status: "pending" } }

# 2) The USER approves in their Valyd app. Then:
curl https://idp.valyd.work/api/auth/attribute-request/<request_id>/result \
  -H "Authorization: Bearer $CLIENT_TOKEN"
# → { data: { status: "approved", sealed_box: "<base64>" } }  # decrypt with your X25519 private key
```

A second consent surface, `credential-share`, releases a specific vault credential and gates the release
with a face scan as the user's consent.

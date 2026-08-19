# Account-connected verification

> 🔑 **Auth:** App API key + the user's access token · 👤 **User login:** required (sign in first) · 💾 **Result:** proof saves to the user's Valyd account

```mermaid
flowchart LR
    L["Login (OIDC sign-in)"] --> V["Verify (check runs with the user token)"] --> P["Proof (saved to the user's account)"] --> R["Reuse (next login: read it — no re-run while still fresh for your policy)"]
```

**What is a proof?** The durable outcome of a passed check saved on the user's Valyd account — a
pseudonym, `id_verified`, verified license badges, age bands — read back any time via the
[Account API](/docs/endpoints#resource-api--user-data) or `GET /api/v2/identity`. The account's
`identity` object carries a `verified_at` timestamp so you can judge freshness; a license badge
carries the registry's own `status` and `expires_at`. Re-run a check when your policy needs a
fresher answer.

Use this path when a successful KYC or license result should be saved to a signed-in user's Valyd
account. Two steps:

1. **[Sign in with Valyd](/docs) signs the user in** and gives your backend their access token.
2. **The Verification API runs the check with that token** and the passed proof saves to the account.

Prefer the result only in your own system? Use the
[API-key-only quickstart](/verifications/quickstart) — no user sign-in, but the person's identity
data then lives in your backend, yours to manage.

## Data-sharing rule (critical)

- **Account APIs return proofs only** — a pseudonym, `id_verified`, verified license badges, and age
  bands. They **never** return raw KYC (legal name, date of birth, document images). In a decision,
  the `id_verification` check reduces to `{ status, id_verified }`; `identity` is
  `{ valyd_id, pseudonym, id_verified, age_bands, licenses, verified_at }`.
- **Raw account KYC is released only through the consent Core API** — you request specific attributes,
  the user approves in their Valyd app, and the values are returned end-to-end encrypted (X25519 sealed
  box) to your public key. See "Consent Core API" below.
- A **one-off KYC decision** releases raw data only after required ID, liveness, and face-match
  checks pass. Before that gate, sensitive data remains encrypted. A one-off license lookup returns
  its registry result directly.

## Why: Account vs Non-account

- **Account**: the verified identity is stored on the user's Valyd account and **reused** everywhere.
  A returning user re-verifies with a **selfie only** (matched against their stored face vector);
  already-verified KYC and licenses are skipped. Data belongs to the user's account; integrators get
  proofs.
- **Non-account**: a one-shot capture; nothing is stored; the integrator receives the raw result.

## Hosted flow (Account × Hosted)

1. Register your app at the Developer Portal (https://dev.valyd.work) → `client_id` / `client_secret`, and set up its verification capability in the same portal (surfaced there as a Verify "project") → API key (`vrf_…`, shown once) + `workflow_id`. One console, all credentials.
2. Log the user in with Valyd (OAuth2/OIDC), exchange the code → `valyd_access_token` + identity.
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

- **Any time after login (use this today)** — the `attribute-request` flow below; the user approves
  in their Valyd app (notification → face approval). This is the supported path.
- **At login** *(currently disabled — the consent screen is login-only right now)* — when enabled,
  add `attributes` + your X25519 `requester_public_key` to the authorize URL and the granted fields
  ride back with the login as `attr_code`.

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

# OAuth2 Scopes

## Scopes summary

**What the user sees** — the consent screen lists exactly the scopes you request, in plain
language:

![The Valyd consent screen showing the requested scopes](/images/screenshots/idp-consent-screen.png)

| Scope | Required | Description | Grants access to |
| --- | --- | --- | --- |
| `profile` | Yes (Mandatory) | User profile: legal name, username, country, and verification status (no photo is shared) | `/userinfo` |
| `email` | Optional | User's email address (a private relay address, unless your app is a trusted first party) | `/userinfo` |
| `phone` | Optional | User's phone number (a private relay number, unless your app is a trusted first party) | `/userinfo` |
| `verifications` | Optional | Identity verification status: human (liveness) check, ID/KYC verification, and linked professional licenses | `/verifications` |
| `doctor_license` | Optional | Medical/nursing license details for verified healthcare practitioners | Doctor/nursing license endpoints |
| `zkp` | Optional | Zero-Knowledge Proof age verification data | ZKP-related endpoints |
| `mcp` | Optional | Access to Model Context Protocol (MCP) endpoints | MCP endpoints |

## Requesting scopes

Pass the scopes to the SDK. It adds `openid` and generates state, nonce, and S256 PKCE.

```javascript
const transaction = valyd.auth.createAuthorizationRequest({
  scope: ["profile", "verifications", "zkp"],
});

req.session.valydOidc = transaction; // keep server-side
res.redirect(transaction.url);
```

Expected output: `transaction.url` is a standard OIDC authorization URL containing `openid`, the
requested scopes, state, nonce, and an S256 PKCE challenge.

## Scope enforcement

- Scopes are verified against your app's settings in the Developer Portal.
- If you request a scope not enabled for your app, authorization will fail.
- If your access token doesn't have a required scope, a resource endpoint (`/licenses`, `/verifications`, …) returns `403 Forbidden` with `insufficient_scope` in the Valyd envelope. `/userinfo` instead omits the claims of scopes you weren't granted, and returns the RFC 6750 form `{"error":"insufficient_scope","error_description":"..."}` only when the token lacks `openid`.

Decision tree when authorization or a scoped request fails:

```text
IF authorization fails immediately (before the consent screen):  → the requested scope is not enabled for your app. Enable it in the Developer Portal → your app → Scopes: https://dev.valyd.work
IF a scoped endpoint returns 403 with code "insufficient_scope": → the access token is missing that scope. Add the scope to your authorization URL and have the user re-authenticate.
IF unsure which scopes a token carries:                          → re-run the authorization flow and confirm the requested `scope` parameter matches the scopes the endpoint requires.
```

---

## `profile` scope (Required / Mandatory)

User profile: legal name, username, country, and verification status. No photo is shared.

### Grants access to

- `/userinfo`

### Response fields

| Field | Description |
| --- | --- |
| `sub` | Unique user identifier |
| `first_name` | User's first name |
| `last_name` | User's last name |
| `full_name` | User's full name |
| `country` | User's country |
| `valyd_id` | The user's unique Valyd account identifier |
| `id_verified` | Whether ID is verified (boolean) |
| `created_at` | Account creation timestamp |

### Without this scope

`/userinfo` does not fail when `profile` is missing — it simply omits the profile claims. The only
scope error `/userinfo` returns is for a token without `openid` — a standard RFC 6750 error
(no `success`/`data` envelope) with a `WWW-Authenticate: Bearer realm="valyd", error="insufficient_scope", scope="openid"` header:

```json
{
  "error": "insufficient_scope",
  "error_description": "The access token does not have the openid scope"
}
```

---

## `email` scope (Optional)

The user's email address. By default this is a **private relay address** (the user's real email stays
hidden); trusted first-party apps receive the real address. Request `email` as its own scope — it is
**not** part of `profile`.

### Grants access to

- `/userinfo` (and the ID token)

### Response fields

| Field | Description |
| --- | --- |
| `email` | The user's email address (relay address unless your app is a trusted first party) |
| `email_verified` | Always `false` — Valyd does not verify email ownership (identity verification is `id_verified`, under `profile`) |

### Without this scope

`/userinfo` does not fail when `email` is missing — it simply omits `email` / `email_verified`. The only
scope error `/userinfo` returns is for a token without `openid` — a standard RFC 6750 error
(no `success`/`data` envelope) with a `WWW-Authenticate: Bearer realm="valyd", error="insufficient_scope", scope="openid"` header:

```json
{
  "error": "insufficient_scope",
  "error_description": "The access token does not have the openid scope"
}
```

---

## `phone` scope (Optional)

The user's phone number. By default this is a **private relay number** (the user's real number stays
hidden); trusted first-party apps receive the real number. Request `phone` as its own scope — it is
**not** part of `profile`.

### Grants access to

- `/userinfo` (and the ID token)

### Response fields

| Field | Description |
| --- | --- |
| `phone_number` | The user's phone number (relay number unless your app is a trusted first party) |
| `phone_number_verified` | Always `false` — Valyd does not verify phone numbers |

### Without this scope

`/userinfo` does not fail when `phone` is missing — it simply omits `phone_number` / `phone_number_verified`. The only
scope error `/userinfo` returns is for a token without `openid` — a standard RFC 6750 error
(no `success`/`data` envelope) with a `WWW-Authenticate: Bearer realm="valyd", error="insufficient_scope", scope="openid"` header:

```json
{
  "error": "insufficient_scope",
  "error_description": "The access token does not have the openid scope"
}
```

---

## `verifications` scope (Optional)

Identity verification status: whether the user passed a human (liveness) check, whether they completed identity (KYC) verification, and any professional licenses linked to their Valyd identity.

### Grants access to

- `/verifications`

### Response fields

| Field | Description |
| --- | --- |
| `human_verified` | Whether the user passed a liveness / anti-spoof human check |
| `id_verified` | Whether the user completed identity (KYC) verification |
| `licenses` | Array of linked professional licenses (`license_type`, `verified`, `verified_from`, `expire_at`) |

### Missing scope error (403 Forbidden)

```json
{
  "success": false,
  "error": {
    "code": "insufficient_scope",
    "message": "The request requires the verifications scope"
  }
}
```

---

## `doctor_license` scope (Optional)

Medical/nursing license details for verified healthcare practitioners. Request this scope only when the user is expected to have a verified medical or nursing license (for example, a doctor or nurse account).

### Grants access to

- Doctor/nursing license endpoints (retrieved via the SDK helpers `getDoctorLicense`, `getLicenses`, and `getCprLicense`)

### Missing scope error (403 Forbidden)

```json
{
  "success": false,
  "error": {
    "code": "insufficient_scope",
    "message": "The request requires the doctor_license scope"
  }
}
```

---

## `zkp` scope (Optional)

Zero-Knowledge Proof age verification data. Allows age verification without revealing exact birth date.

### Grants access to

- ZKP-related endpoints

### Response fields

| Field | Description |
| --- | --- |
| `is_18` | Whether user is 18+ (without revealing age) |
| `is_21` | Whether user is 21+ (without revealing age) |
| `is_25` | Whether user is 25+ (without revealing age) |

### Missing scope error (403 Forbidden)

```json
{
  "success": false,
  "error": {
    "code": "insufficient_scope",
    "message": "The request requires the zkp scope"
  }
}
```

---

## `mcp` scope (Optional)

Access to Model Context Protocol (MCP) endpoints. Lets AI agents and tools retrieve the user's authorized identity and verification data through the MCP interface, on the user's behalf.

### Grants access to

- MCP endpoints

### Response fields

| Field | Description |
| --- | --- |
| `tools` | MCP tools the agent is authorized to call |
| `context` | User identity and verification context exposed to the agent |

### Missing scope error (403 Forbidden)

```json
{
  "success": false,
  "error": {
    "code": "insufficient_scope",
    "message": "The request requires the mcp scope"
  }
}
```

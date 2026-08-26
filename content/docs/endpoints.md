# Account API

This page is only for Connect with Valyd and reading a connected user's account. These endpoints
do not start any check. To run a check, use a configured workflow — see
[Reusable Verification](/verifications) and the
[Verification API reference](/verifications/api-reference).

## General notes
- Every API response carries an **`X-Request-Id`** header. Log it, and quote it when contacting support — never send API keys, tokens, or identity data.
- All API requests must be made over HTTPS.
- Endpoints that require authentication expect a Bearer token in the `Authorization` header: `Authorization: Bearer YOUR_ACCESS_TOKEN`.
- If you are using the SDK, prefer the typed helpers (`getAuthorizationUrl()`, `exchangeCode()`, `handleCallback()`, `refreshToken()`) — they call these endpoints for you.
- **One API namespace:** authorize, token, JWKS, UserInfo, licenses, and verifications are under `https://idp.valyd.work/api/auth/oidc`. Discovery is at `/.well-known/openid-configuration` (the `/api/.well-known/...` alias also works).

## SDK methods (@valyd/sdk 1.10.4)

### `valyd.auth.createAuthorizationRequest({ scope, redirectUri? })`
Recommended Connect entry point. Generates strong `state`, `nonce`, and an S256 PKCE verifier/challenge together. Store the returned transaction server-side and redirect to `transaction.url`.

### `valyd.auth.getAuthorizationUrl({ state, nonce, codeChallenge, scope, redirectUri? })`
Low-level URL builder. `state` is required. Prefer `createAuthorizationRequest()` so PKCE and nonce cannot be forgotten.

### `valyd.auth.exchangeCode(code)`
Exchanges the authorization code at `POST /api/auth/oidc/token`. The SDK verifies the ID token against discovery/JWKS before returning `{ accessToken, refreshToken, idToken, claims, expiresIn, scope, tokenType }`.

### `valyd.auth.handleCallback(url, { transaction })`
One callback call: compares state, sends the PKCE verifier, exchanges the code, verifies RS256/JWKS plus issuer/audience/expiry/nonce, and fetches UserInfo.

### `valyd.auth.refreshToken(refreshToken)`
Refreshes at `POST /api/auth/oidc/token` with `grant_type: "refresh_token"`. Rotation is on — persist the returned `refreshToken` every time.

## OIDC endpoints (current — use these)

### GET /api/.well-known/openid-configuration — Discovery

- **Method:** GET
- **Full URL:** `https://idp.valyd.work/api/.well-known/openid-configuration`
- **Auth:** none

Standard OIDC discovery document: issuer, `authorization_endpoint`, `token_endpoint`, `userinfo_endpoint`, `jwks_uri`, supported scopes/grants/algorithms. Point any OIDC-capable framework at this URL to auto-configure. See the [OIDC integration guide](/docs/oidc) for the full response.

### GET /api/auth/oidc/authorize — Authorization

- **Method:** GET (browser redirect)
- **Full URL:** `https://idp.valyd.work/api/auth/oidc/authorize`
- **Auth:** none (user authenticates interactively)

Query parameters: `client_id`, `redirect_uri`, `response_type=code`, `scope` (space-separated, **must include `openid`**), `state` (required — echoed back unchanged on the callback), `nonce` (recommended — bound into the `id_token`). On consent, Valyd redirects to your `redirect_uri` with `?code=...&state=<your original state>`.

### POST /api/auth/oidc/token — Token (exchange + refresh)

- **Method:** POST
- **Full URL:** `https://idp.valyd.work/api/auth/oidc/token`
- **Auth:** client credentials in the body (`client_secret_post`) or HTTP Basic (`client_secret_basic`)
- **Required headers:** `Content-Type: application/json`

Two grants:

| `grant_type` | Body fields |
|---|---|
| `authorization_code` | `client_id`, `client_secret`, `code`, `redirect_uri` (exact match), `code_verifier` when PKCE was used |
| `refresh_token` | `client_id`, `client_secret`, `refresh_token` |

Returns a **standard top-level token JSON** (no `data` wrapper):

```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "rfrsh_abc123...",
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 900,
  "scope": "openid profile verifications"
}
```

Notes:
- Authorization codes are single-use and client-bound — exchange immediately.
- The `id_token` is an RS256 JWT; validate it against the JWKS below and check its `nonce` claim.
- Refresh **rotation is on for every refresh**: the `refresh_token` you sent is revoked and a new one is returned — always persist the new value. Replaying a rotated-away token revokes every refresh token for that user and client.
- The returned `access_token` works on all resource endpoints below (`/userinfo`, `/licenses`, `/verifications`).
- What each of the three tokens is for, with decoded examples: [Tokens](/docs/tokens).

### GET /api/auth/oidc/logout — RP-initiated logout

- **Method:** GET (browser redirect)
- **Full URL:** `https://idp.valyd.work/api/auth/oidc/logout`
- **Auth:** none (identity proven by `id_token_hint`)

Query parameters: `id_token_hint` (the id_token you received at login — an expired one is
accepted, its signature still proves the user/client), `post_logout_redirect_uri` (must
**exactly match** one of your registered redirect URIs — register your post-logout URL as an
additional redirect URI), `state` (optional, echoed back). Revokes the user's refresh tokens and
access tokens **for your client**, then redirects. Advertised in discovery as
`end_session_endpoint`.

### GET /api/auth/oidc/jwks.json — Signing keys

- **Method:** GET
- **Full URL:** `https://idp.valyd.work/api/auth/oidc/jwks.json`
- **Auth:** none

Public RSA keys (JWK set) for validating `id_token` signatures (RS256).

### GET /api/auth/oidc/userinfo — Standard OIDC userinfo

- **Method:** GET
- **Full URL:** `https://idp.valyd.work/api/auth/oidc/userinfo`
- **Auth:** `Authorization: Bearer YOUR_ACCESS_TOKEN`

Returns top-level standard OIDC claims such as `sub`, `valyd_id`, `preferred_username`, `email`, `name`, and `id_verified` according to the granted scopes.

---

## Resource API — user data

> 🔑 **Auth:** Bearer access token (from login) · 👤 **User login:** required · 📄 **Scope-gated** — these READ the account; they never run a new check

These canonical `/api/auth/oidc/*` endpoints accept access tokens minted by the
[OIDC token endpoint](#post-apiauthoidctoken--token-exchange--refresh). The **Account API never runs a check** — it reads what previous checks already proved. To run a new check, see
[Verification](/verifications).

**Raw identity data** (DOB, document number, address …) is never returned by these endpoints — it
requires the user's explicit approval via the [consent flow](/docs/request-data), and comes back
end-to-end encrypted.

## GET /userinfo — Get User Profile

- **Method:** GET
- **Full URL:** `https://idp.valyd.work/api/auth/oidc/userinfo`
- **Base URL:** `https://idp.valyd.work/api/auth/oidc`
- **Path:** `/userinfo`
- **Auth / required scope:** Bearer access token required; required scope: `profile`
- **Required headers:**
  - `Accept: application/json`
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`

Retrieve the authenticated user's profile information including name, email, and verification status.

`YOUR_ACCESS_TOKEN`: the `access_token` returned by [`POST /api/auth/oidc/token`](#post-apiauthoidctoken--token-exchange--refresh) (code exchange or refresh grant).

### Example

```bash
curl -X GET "https://idp.valyd.work/api/auth/oidc/userinfo" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Response

```json
{
  "sub": "valyd_225c7f2ac450496f97bbbc57354a5898",
  "valyd_id": "valyd_225c7f2ac450496f97bbbc57354a5898",
  "preferred_username": "johndoe",
  "email": "user@example.com",
  "name": "John Doe",
  "id_verified": true
}
```

## GET /licenses — Get Professional Licenses

- **Method:** GET
- **Full URL:** `https://idp.valyd.work/api/auth/oidc/licenses`
- **Base URL:** `https://idp.valyd.work/api/auth/oidc`
- **Path:** `/licenses`
- **Auth / required scope:** Bearer access token required (no specific scope declared on this endpoint in the source)
- **Required headers:**
  - `Accept: application/json`
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`

Returns a snapshot of the user's professional licenses as verified by Valyd. Includes nursing licenses, CDL endorsements, CPR/BLS certifications, Food Handler permits, and more.

`YOUR_ACCESS_TOKEN`: the `access_token` returned by [`POST /api/auth/oidc/token`](#post-apiauthoidctoken--token-exchange--refresh) (code exchange or refresh grant).

### Example

```bash
curl -X GET "https://idp.valyd.work/api/auth/oidc/licenses" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Response

```json
{
  "success": true,
  "data": {
    "licenses": [
      {
        "type": "nurse_licenses",
        "number": "RN-123456",
        "status": "Active",
        "expires_on": "2027-06-30",
        "issuer": "CA Board of Nursing"
      },
      {
        "type": "cpr_certification",
        "number": "CPR-998877",
        "status": "Active",
        "expires_on": "2026-05-15",
        "issuer": "American Heart Association"
      }
    ]
  }
}
```

## GET /verifications — Get Identity Verifications

- **Method:** GET
- **Full URL:** `https://idp.valyd.work/api/auth/oidc/verifications`
- **Base URL:** `https://idp.valyd.work/api/auth/oidc`
- **Path:** `/verifications`
- **Auth / required scope:** Bearer access token required; required scope: `verifications`
- **Required headers:**
  - `Accept: application/json`
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`

Returns the user's verification status: whether they passed a human (liveness) check, whether they completed identity (KYC) verification, and any professional licenses linked to their Valyd identity. Use alongside `/userinfo` for a complete user picture.

`YOUR_ACCESS_TOKEN`: the `access_token` returned by [`POST /api/auth/oidc/token`](#post-apiauthoidctoken--token-exchange--refresh) (code exchange or refresh grant).

**Response fields (`data.verifications`):**

| Field | Type | Description |
|---|---|---|
| `human_verified` | boolean | The user passed a liveness / anti-spoof human check. Falls back to `id_verified` when no explicit human check is on file. |
| `id_verified` | boolean | The user completed identity (KYC) document verification. |
| `licenses` | array | Professional / credential licenses linked to the user. Empty array if none. |
| `licenses[].license_type` | string | The kind of license (e.g. `drivers_license`, `medical`). |
| `licenses[].verified` | boolean | Whether that license is currently verified. |
| `licenses[].verified_from` | string \| null | Source the license was verified against. |
| `licenses[].expire_at` | string \| null | ISO-8601 expiry timestamp, or `null` if it does not expire. |

### Example

```bash
curl -X GET "https://idp.valyd.work/api/auth/oidc/verifications" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Response

```json
{
  "success": true,
  "data": {
    "verifications": {
      "human_verified": true,
      "id_verified": true,
      "licenses": [
        {
          "license_type": "drivers_license",
          "verified": true,
          "verified_from": "kyc",
          "expire_at": "2027-03-01T00:00:00+00:00"
        }
      ]
    }
  }
}
```

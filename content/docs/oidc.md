# Use any OIDC library or platform

> 🔑 **Auth:** `client_id` + `client_secret` · 👤 Standard OpenID Connect · 🔌 Works with any OIDC-capable library or SSO console

Valyd is a standards-compliant OpenID Connect provider. If your stack already speaks OIDC —
Auth.js, Passport, Spring Security, django-allauth, or an enterprise platform's SSO console —
point it at Valyd's discovery document and you're done. No Valyd-specific code.

## 1. Register a client

In the [Developer Portal](https://dev.valyd.work) create an app, enable the scopes you need, and
register your platform's exact callback URL (for example
`https://your-app.example.com/oidc/callback`). Copy the `client_id` and one-time `client_secret`.

## 2. Point your library at discovery

```text
https://idp.valyd.work/api/.well-known/openid-configuration
```

Most libraries take just the issuer + credentials. Auth.js example:

```typescript
// auth.ts (Auth.js / NextAuth)
providers: [
  {
    id: "valyd",
    name: "Valyd",
    type: "oidc",
    issuer: "https://idp.valyd.work",
    wellKnown: "https://idp.valyd.work/api/.well-known/openid-configuration",
    clientId: process.env.VALYD_CLIENT_ID,
    clientSecret: process.env.VALYD_CLIENT_SECRET,
    authorization: { params: { scope: "openid profile" } },
  },
]
```

## 3. Manual values (if your console has no discovery field)

| Setting | Value |
| --- | --- |
| Issuer | `https://idp.valyd.work` |
| Authorization endpoint | `https://idp.valyd.work/api/auth/oidc/authorize` |
| Token endpoint | `https://idp.valyd.work/api/auth/oidc/token` |
| Userinfo endpoint | `https://idp.valyd.work/api/auth/oidc/userinfo` (GET or POST) |
| End-session (logout) endpoint | `https://idp.valyd.work/api/auth/oidc/logout` |
| JWKS URI | `https://idp.valyd.work/api/auth/oidc/jwks.json` |
| Scopes | `openid profile` (add `email`, `phone`, `verifications`, `doctor_license` as needed) |
| Auth method | `client_secret_post` or `client_secret_basic` (never both on one request) |
| ID token algorithm | `RS256` |
| PKCE | **Required** for every client — `S256` only (`plain` is not supported) |
| Response type / mode | `code` / `query` |
| `iss` in callback | Yes (RFC 9207) — verify it equals the issuer |

## 4. Map claims to your user fields

| Your user field | OIDC claim |
| --- | --- |
| Username / unique key | `sub` (stable `valyd_` id — use this as the primary key) |
| Display username | `preferred_username` |
| Email | `email` (requires the `email` scope) |
| Phone | `phone_number` (requires the `phone` scope) |
| Full name | `name` |
| First / last name | `first_name` / `last_name` |
| Identity verified | `id_verified` |
| Country | `country` |

> `email_verified` is always `false`: Valyd does not verify ownership of the email address.
> Whether the *person* has been identity-verified is the separate `id_verified` claim.

Sample userinfo response:

```json
{
  "sub": "valyd_f895da61d5174b81b8dd6a4e3b417339",
  "valyd_id": "valyd_f895da61d5174b81b8dd6a4e3b417339",
  "preferred_username": "john.doe",
  "email": "john.doe@example.com",
  "email_verified": false,
  "name": "John Doe",
  "first_name": "John",
  "last_name": "Doe",
  "id_verified": true,
  "country": "US"
}
```

No photo is ever returned — Valyd accounts hold irreversible face vectors, not images, and the
vector (template) itself is never exposed through any API. (The `portrait` a KYC check returns is
extracted from the ID document submitted in that request, not a stored account photo — see
[Data & trust](/docs/data-and-trust).)

## Notes

- Redirect URIs are matched **exactly** — register every environment's callback URL.
- **PKCE (S256) is mandatory**, even for confidential clients with a `client_secret`. Make sure
  your library sends `code_challenge` / `code_verifier` (Auth.js does by default; other libraries
  may need PKCE switched on explicitly). A request without it is sent back to your
  `redirect_uri` with `error=invalid_request`.
- The authorization endpoint accepts **GET and POST** and supports `prompt`
  (`none` / `login` / `consent` / `select_account`), `max_age`, `id_token_hint`, and
  `login_hint`. `request` / `request_uri` objects are not supported.
- Once your `client_id` and `redirect_uri` are verified, **every** authorization error comes back
  to your `redirect_uri` as `?error=…&error_description=…&state=…&iss=…` (e.g. `access_denied`
  when the user cancels). Token, UserInfo and registration errors use the standard
  `{ "error": "…", "error_description": "…" }` body — see [Errors](/docs/errors).
- `nonce` is optional; the ID token only carries `nonce` if you sent one. `auth_time` is always
  present.
- Logout via `end_session_endpoint` ends the user's Valyd session in that browser — see
  [Refresh & logout](/docs/flows/refresh#logout--revocation).
- Access tokens expire in ~15 minutes; refresh tokens rotate on every refresh — persist the new one.
- Prefer our tooling instead? Use the [drop-in button](/docs) or the
  [`@valyd/sdk` quickstart](/docs/quick-start). Raw HTTP is documented in
  [Authentication](/docs/authentication).

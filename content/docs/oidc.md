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
| Userinfo endpoint | `https://idp.valyd.work/api/auth/oidc/userinfo` |
| JWKS URI | `https://idp.valyd.work/api/auth/oidc/jwks.json` |
| Scopes | `openid profile` (add `email`, `verifications`, `doctor_license` as needed) |
| Auth method | `client_secret_post` or `client_secret_basic` |
| ID token algorithm | `RS256` |
| PKCE | S256 supported |

## 4. Map claims to your user fields

| Your user field | OIDC claim |
| --- | --- |
| Username / unique key | `sub` (stable `valyd_` id — use this as the primary key) |
| Display username | `preferred_username` |
| Email | `email` |
| Full name | `name` |
| First / last name | `first_name` / `last_name` |
| Identity verified | `id_verified` |

Sample userinfo response:

```json
{
  "sub": "valyd_f895da61d5174b81b8dd6a4e3b417339",
  "valyd_id": "valyd_f895da61d5174b81b8dd6a4e3b417339",
  "preferred_username": "john.doe",
  "email": "john.doe@example.com",
  "email_verified": true,
  "name": "John Doe",
  "first_name": "John",
  "last_name": "Doe",
  "id_verified": true
}
```

No photo is ever returned — Valyd accounts hold irreversible face vectors, not images, and the
vector (template) itself is never exposed through any API. (The `portrait` a KYC check returns is
extracted from the ID document submitted in that request, not a stored account photo — see
[Data & trust](/docs/data-and-trust).)

## Notes

- Redirect URIs are matched **exactly** — register every environment's callback URL.
- Access tokens expire in ~15 minutes; refresh tokens rotate on every refresh — persist the new one.
- Prefer our tooling instead? Use the [drop-in button](/docs) or the
  [`@valyd/sdk` quickstart](/docs/quick-start). Raw HTTP is documented in
  [Authentication](/docs/authentication).

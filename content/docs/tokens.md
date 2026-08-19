# Tokens

> 🔑 **Minted by:** `POST /api/auth/oidc/token` · 🎫 Three tokens per login: access, ID, refresh · 📏 **Rule of thumb:** access token → call APIs, ID token → establish the login, refresh token → renew quietly

Every successful [Authorization Code](/docs/flows/authorization-code) exchange returns three
tokens in one top-level JSON. Each has exactly one job — most integration bugs come from using
one token for another's job.

| Token | Lifetime | Job |
| --- | --- | --- |
| Access token | ~15 minutes (`expires_in` ≈ 900) | Call Valyd resource APIs as the user |
| ID token | Validated once at login (`exp` ≈ 15 min) | Prove *who* logged in, to *your* backend |
| Refresh token | 30 days, **rotates on every refresh** | Mint new access tokens without the user |

## Access token

Sent as `Authorization: Bearer …` to `/userinfo`, `/licenses`, `/verifications`, and to the
Verification API as `valyd_access_token` for
[account-connected checks](/docs/flows/account-connected). It's scope-gated: it can only reach
what the user approved on the consent screen.

Decoded example payload (illustrative):

```json
{
  "iss": "https://idp.valyd.work",
  "sub": "valyd_f895da61d5174b81b8dd6a4e3b417339",
  "aud": "YOUR_CLIENT_ID",
  "iat": 1755600000,
  "exp": 1755600900,
  "scope": "openid profile verifications"
}
```

**Use it for:** calling Valyd APIs on the user's behalf; attaching to a verification session so
the proof saves to their account.

**Never use it for:** identifying the user in your app (that's the ID token's job), or storing
long-term — it dies in ~15 minutes; [refresh](/docs/flows/refresh) instead.

> **Treat it as opaque.** Its internal format is Valyd's to change. Don't parse it, don't build
> logic on its claims — pass it in the `Authorization` header and let the API validate it.

## ID token

An **RS256-signed JWT** — the login receipt. Your backend validates it once at login and uses
its claims to create your own session.

Decoded example payload (illustrative):

```json
{
  "iss": "https://idp.valyd.work",
  "sub": "valyd_f895da61d5174b81b8dd6a4e3b417339",
  "aud": "YOUR_CLIENT_ID",
  "iat": 1755600000,
  "exp": 1755600900,
  "nonce": "RANDOM_NONCE_FROM_AUTHORIZE",
  "name": "John Doe",
  "preferred_username": "john.doe",
  "id_verified": true
}
```

Claim notes: `sub` is the **stable `valyd_…` id — use it as your primary key**; `aud` must equal
your `client_id`; `nonce` must equal the value you sent on `/authorize` (replay protection);
`id_verified` tells you the account passed identity verification.

**Use it for:** establishing the login on your backend, keying the user by `sub`, and later as
the `id_token_hint` on [logout](/docs/flows/refresh#logout--revocation).

**Never send it to an API.** It is not an access credential — Valyd endpoints will reject it,
and an ID token accepted as an API credential anywhere is a security bug. It also never belongs
in a URL or in browser storage.

> **Always validate before trusting**: signature (RS256/JWKS), `iss`, `aud`, `exp`, `nonce`. An
> unvalidated ID token is just attacker-writable JSON.

## Refresh token

An opaque string (`rfrsh_…` — not a JWT, nothing to decode) held **only on your backend**:

```json
{
  "refresh_token": "rfrsh_abc123…",
  "what_you_can_read_from_it": "nothing — it is an opaque credential, not a JWT"
}
```

**Use it for:** minting a new access token at the token endpoint with
`grant_type: "refresh_token"`, from your backend, with your client credentials.

**Never use it for:** calling APIs, or anywhere client-side. It's the longest-lived credential
in the system — treat it like a password.

> **Rotation is on.** Every refresh revokes the token you sent and returns a new one — persist
> the new value every time. Replaying a rotated-away token is treated as **theft** and revokes
> the user's entire refresh-token family for your client. Full mechanics:
> [Refresh & logout flow](/docs/flows/refresh).

## Validating tokens

**Let a library do it.** The `@valyd/sdk` (`^1.10.2`) `handleCallback()` / `exchangeCode()`
verify the ID token's RS256 signature against discovery/JWKS plus issuer, audience, expiry, and
nonce before returning. Any standard OIDC library pointed at
`https://idp.valyd.work/api/.well-known/openid-configuration` does the same.

**Validating manually** (no SDK): fetch the signing keys from the JWKS at
`https://idp.valyd.work/api/auth/oidc/jwks.json`, verify the RS256 signature, then check
`iss === "https://idp.valyd.work"`, `aud === your client_id`, `exp` in the future, and
`nonce === the value you sent`. Never accept `alg: "none"` or an unexpected algorithm.

## Related

- Where tokens come from: [Authorization Code flow](/docs/flows/authorization-code)
- Endpoint contract: [API reference — token endpoint](/docs/endpoints#post-apiauthoidctoken--token-exchange--refresh)
- Keeping them fresh: [Refresh & logout flow](/docs/flows/refresh)

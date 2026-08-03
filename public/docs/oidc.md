> Source: https://docs.valyd.work/docs/oidc
> Part of: Valyd ID API documentation — static copy generated for AI agents
> Generated from repo component: OIDCSection.tsx

# OpenID Connect (OIDC) Integration Guide

## Agent Quick-Start
- Source URL: https://docs.valyd.work/docs/oidc
- Credentials / env vars needed: OIDC_CLIENT_ID, OIDC_CLIENT_SECRET (get both from the Developer Portal → your project → Credentials: https://dev.valyd.work), OIDC_REDIRECT_URI (the callback URL you register, e.g. https://your-app.mendixcloud.com/oidc/callback)
- Files an integrator edits: your platform's SSO/OIDC config (Mendix Studio Pro module config, Mendix Cloud Portal Environment → Security, or a custom OIDC module's constants file)
- Estimated steps: 8 (register client → configure issuer/endpoints → set scopes → enter credentials → set redirect URI → test login → exchange code → map user)
- Can complete without human input: NO — a human must sign in to the Developer Portal at https://dev.valyd.work, create the OIDC client, and copy the client_secret (shown only once). After credentials exist, the rest can be automated.
- Prerequisites:
  - A Mendix account, or admin access to your target OIDC-compatible platform's console.
  - Access to the Developer Portal at https://dev.valyd.work (used to register the client).
  - A registered OIDC client (created as a project in the Developer Portal — yields client_id and client_secret).
  - A redirect URL that matches EXACTLY what you configure in your platform (no trailing slashes, correct protocol).

---

## What is OpenID Connect?

OpenID Connect (OIDC) is an identity layer built on top of OAuth 2.0. It allows applications to verify user identity and obtain basic profile information in a standardized, secure way.

Valyd implements OIDC to provide a secure, standards-compliant authentication mechanism that works seamlessly with enterprise platforms like Mendix, and any OIDC-compatible application.

### When to Use OIDC vs Regular OAuth

```text
USE OIDC WHEN:
  - Integrating with enterprise platforms (Mendix, Salesforce, etc.)
  - Your framework requires OIDC discovery endpoints
  - You need ID tokens with signed claims (JWT)
  - You need automatic discovery of endpoints

USE REGULAR OAUTH WHEN:
  - Building a custom web/mobile application
  - You only need access tokens for API calls
  - Simpler integration requirements
```

### OIDC Authentication Flow

```text
User  →  Your App  →  Authorization  →  Token  →  Userinfo/JWKS

1. Click Login
2. Redirect to Valyd
3. User authenticates
4. Exchange code for tokens
5. Fetch user info
```

---

### Prerequisites

Before integrating OIDC, ensure you have the following:

1. **Mendix account** — Or access to your target platform's admin console.
2. **Access to Developer Portal** — Visit https://dev.valyd.work to register.
3. **Registered OIDC client** — Create a project in the Developer Portal.
4. **Correct redirect URL** — Must match exactly what you configure in your platform.

---

### Steps

#### Step 1 — Log into the Developer Portal (human required)

Open the Developer Portal and sign in with your account.

```text
Open: https://dev.valyd.work
```

**Expected output:** You are signed in and can see your projects dashboard.

#### Step 2 — Register a new OIDC client (human required)

Click "Create Project" and fill in the required fields:

| Field           | Description                                   | Required |
| --------------- | --------------------------------------------- | -------- |
| `client_id`     | Auto-generated unique identifier              | Auto     |
| `client_secret` | Auto-generated secret (shown only once!)      | Auto     |
| `redirect_uri`  | Must match EXACTLY — no trailing slashes      | Required |

Example redirect URI:

```text
https://your-app.mendixcloud.com/oidc/callback
```

**⚠️ Critical — Save your client_secret:** The `client_secret` is displayed only once during registration. Copy it immediately and store it securely. If lost, you must regenerate it.

**Expected output:** A project with a `client_id` and a one-time-displayed `client_secret`, plus your registered `redirect_uri`.

#### Step 3 — Get OIDC endpoints (auto-discovery or manual)

```text
IF your platform supports OIDC auto-discovery:
  → Point it at the discovery URL and let it auto-configure all endpoints:
    GET https://idp.valyd.work/api/.well-known/openid-configuration
IF your platform does NOT support auto-discovery:
  → Enter the endpoint values manually (see "Manual OIDC Configuration" below).
IF unsure whether discovery works:
  → Run: curl -s https://idp.valyd.work/api/.well-known/openid-configuration
    A 200 response with a JSON body containing "issuer" means discovery works.
```

**Discovery endpoint** (method + full URL):

```http
GET https://idp.valyd.work/api/.well-known/openid-configuration
```

The discovery endpoint provides all the information needed to configure your OIDC client automatically. Most platforms can use this URL to auto-configure all endpoints.

**Expected output:** HTTP 200 with this JSON body:

```json
{
  "issuer": "https://idp.valyd.work",
  "authorization_endpoint": "https://idp.valyd.work/api/auth/oidc/authorize",
  "token_endpoint": "https://idp.valyd.work/api/auth/oidc/token",
  "userinfo_endpoint": "https://idp.valyd.work/api/auth/oidc/userinfo",
  "jwks_uri": "https://idp.valyd.work/api/auth/oidc/jwks.json",
  "response_types_supported": ["code", "id_token", "token id_token"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "subject_types_supported": ["public"],
  "id_token_signing_alg_values_supported": ["RS256"],
  "scopes_supported": ["openid", "profile", "email", "verifications", "zkp"],
  "token_endpoint_auth_methods_supported": ["client_secret_post", "client_secret_basic"],
  "claims_supported": [
    "sub", "iss", "aud", "exp", "iat", "name", "email",
    "preferred_username", "first_name", "last_name"
  ]
}
```

**Discovery response fields:**

| Field                        | Description                                                     |
| ---------------------------- | --------------------------------------------------------------- |
| `issuer`                     | The base URL of the identity provider                           |
| `authorization_endpoint`     | URL to redirect users for authentication                        |
| `token_endpoint`             | URL to exchange authorization code for tokens                   |
| `userinfo_endpoint`          | URL to fetch user profile information                           |
| `jwks_uri`                   | URL to fetch public keys for JWT validation                     |
| `response_types_supported`   | Supported OAuth response types (code, id_token, etc.)           |
| `grant_types_supported`      | Supported grant types (authorization_code, refresh_token)       |
| `scopes_supported`           | Available scopes: openid, profile, email, verifications, zkp    |

#### Step 4 — Manual OIDC configuration (only if auto-discovery is unsupported)

If your platform doesn't support auto-discovery, use these values to configure manually:

| Setting                | Value                                            |
| ---------------------- | ------------------------------------------------ |
| Issuer                 | `https://idp.valyd.work`                           |
| Authorization Endpoint | `https://idp.valyd.work/api/auth/oidc/authorize`   |
| Token Endpoint         | `https://idp.valyd.work/api/auth/oidc/token`       |
| Userinfo Endpoint      | `https://idp.valyd.work/api/auth/oidc/userinfo`    |
| JWKS URI               | `https://idp.valyd.work/api/auth/oidc/jwks.json`   |
| Auth Method            | `client_secret_post` / `client_secret_basic`     |
| ID Token Algorithm     | `RS256`                                          |

**Expected output:** Your platform's OIDC client config now has the issuer, all four endpoints, the JWKS URI, an auth method, and the signing algorithm set.

#### Step 5 — Configure your platform (Mendix or custom)

Choose the path that matches your deployment:

```text
IF you build/configure the app in Mendix Studio Pro:
  → Follow "Method 1 — Mendix Studio Pro" below.
IF your app is already deployed to Mendix Cloud:
  → Follow "Method 2 — Mendix Cloud Portal" below.
IF you use a custom OIDC module (any platform):
  → Follow "Method 3 — Custom Module Configuration" below.
IF your platform is not Mendix but is OIDC-compatible:
  → Use the discovery URL (Step 3) or the manual values (Step 4) in that
    platform's OIDC/SSO settings; map claims per "User Mapping Guide" below.
```

##### Method 1 — Mendix Studio Pro

Configure OIDC directly in Mendix Studio Pro:

1. **Add Issuer URL** — In your SSO configuration, set:
   ```text
   https://idp.valyd.work
   ```
2. **Configure Endpoints:**
   - Authorization: `/api/auth/oidc/authorize`
   - Token: `/api/auth/oidc/token`
   - Userinfo: `/api/auth/oidc/userinfo`
3. **Set Scopes:**
   ```text
   openid profile email
   ```
4. **Enter Credentials** — Add your `client_id` and `client_secret` from the Developer Portal (https://dev.valyd.work → your project → Credentials).
5. **Set Redirect URI** — Format:
   ```text
   https://your-app.mendixcloud.com/oidc/callback
   ```

**Expected output:** The Mendix SSO module shows a fully configured OpenID Connect provider with issuer, endpoints, scopes, credentials, and redirect URI.

##### Method 2 — Mendix Cloud Portal

For apps deployed to Mendix Cloud, configure via the Cloud Portal:

1. Go to your app in the Mendix Cloud Portal.
2. Navigate to Environment → Security.
3. Enable SSO and select "OpenID Connect".
4. Enter the issuer URL: `https://idp.valyd.work`
5. Add your client credentials (`client_id` and `client_secret` from https://dev.valyd.work).
6. Save and restart your application.

**Expected output:** SSO is enabled for the environment; after restart the login page offers OpenID Connect sign-in.

##### Method 3 — Custom Module Configuration

For custom OIDC module implementations, use these constants. Replace the placeholder values:
- `your-client-id` → your `client_id` (from https://dev.valyd.work → your project → Credentials)
- `your-client-secret` → your `client_secret` (from the same place; shown only once at registration)
- `OIDC_REDIRECT_URI` → the callback URL you registered

```javascript
// OIDC Configuration Constants
const OIDC_ISSUER = "https://idp.valyd.work";
const OIDC_CLIENT_ID = "your-client-id";
const OIDC_CLIENT_SECRET = "your-client-secret";
const OIDC_REDIRECT_URI = "https://your-app.mendixcloud.com/oidc/callback";
const OIDC_SCOPES = "openid profile email";
```

**Expected output:** Your module holds the issuer, credentials, redirect URI, and scope string needed to start the authorization-code flow.

#### Step 6 — Map OIDC claims to user fields

Map OIDC claims to your platform's user fields:

| Mendix Field | OIDC Claim                  |
| ------------ | --------------------------- |
| Username     | `preferred_username` or `sub` |
| Email        | `email`                     |
| Name         | `name`                      |
| First Name   | `first_name`                |
| Last Name    | `last_name`                 |

**Sample userinfo response** (returned by `GET https://idp.valyd.work/api/auth/oidc/userinfo` with a valid access token):

```json
{
  "sub": "user_12345",
  "preferred_username": "john.doe",
  "email": "john.doe@example.com",
  "email_verified": true,
  "name": "John Doe",
  "first_name": "John",
  "last_name": "Doe",
  "picture": "https://example.com/avatar.jpg"
}
```

**Expected output:** Each platform user field is populated from the corresponding claim above after a successful login.

#### Step 7 — Complete example: Mendix SSO JSON configuration

Complete configuration example for Mendix SSO. Replace `mendix-app-123` with your `client_id` and `your-secret-here` with your `client_secret` (both from https://dev.valyd.work), and adjust `redirect_uri` to your app's callback URL:

```json
{
  "sso": {
    "enabled": true,
    "provider": "openid_connect",
    "config": {
      "issuer": "https://idp.valyd.work",
      "client_id": "mendix-app-123",
      "client_secret": "your-secret-here",
      "authorization_endpoint": "https://idp.valyd.work/api/auth/oidc/authorize",
      "token_endpoint": "https://idp.valyd.work/api/auth/oidc/token",
      "userinfo_endpoint": "https://idp.valyd.work/api/auth/oidc/userinfo",
      "jwks_uri": "https://idp.valyd.work/api/auth/oidc/jwks.json",
      "scopes": ["openid", "email", "profile"],
      "redirect_uri": "https://your-app.mendixcloud.com/oidc/callback",
      "token_endpoint_auth_method": "client_secret_post",
      "id_token_signing_alg": "RS256",
      "user_mapping": {
        "username": "preferred_username",
        "email": "email",
        "name": "name",
        "first_name": "first_name",
        "last_name": "last_name"
      }
    }
  }
}
```

**Expected output:** A valid Mendix SSO config block your platform can load to enable OpenID Connect sign-in with Valyd.

#### Step 8 — Test the full login flow

Walk through the flow end to end:

1. **Open your application** — Navigate to your deployed app's login page.
2. **Click Login** — Click the SSO or "Login with Valyd" button.
3. **Redirect to authorization** — You should be redirected to `https://idp.valyd.work/api/auth/oidc/authorize`.
4. **Authenticate** — Log in with your Valyd credentials.
5. **Consent screen** — Approve the requested scopes if prompted.
6. **Callback redirect** — You're redirected back to your app with an authorization code.
7. **Token exchange** — Your app exchanges the code for `access_token`, `id_token`, and `refresh_token`.
8. **User logged in** — User session is created with mapped profile data.

**Expected output:** You land back in your app authenticated, with a session whose profile fields are populated from the OIDC claims.

---

### Verification

```text
1. Verify discovery is reachable:
   curl -s https://idp.valyd.work/api/.well-known/openid-configuration
   → Expect HTTP 200 and a JSON body whose "issuer" is "https://idp.valyd.work".

2. Verify JWKS is reachable (needed for ID token signature validation):
   curl -s https://idp.valyd.work/api/auth/oidc/jwks.json
   → Expect HTTP 200 and a JSON body containing a "keys" array.

3. Verify the end-to-end login (Step 8):
   → A click on Login redirects to https://idp.valyd.work/api/auth/oidc/authorize,
     and after authenticating you return to your app logged in with mapped fields.

4. Verify userinfo returns mapped claims:
   → With a valid access token, GET https://idp.valyd.work/api/auth/oidc/userinfo
     returns 200 with sub, preferred_username, email, name, first_name, last_name.
```

---

### Common errors

**Invalid redirect_uri**
- **Cause:** The redirect URI in your request doesn't match what's registered.
- **Fix:** Ensure the `redirect_uri` matches EXACTLY (no trailing slashes, correct protocol) the value registered in the Developer Portal at https://dev.valyd.work.

**Invalid client credentials**
- **Cause:** Wrong `client_id` or `client_secret`.
- **Fix:** Verify credentials in the Developer Portal (https://dev.valyd.work). If the secret is lost, regenerate it (it is shown only once).

**User mapping failed**
- **Cause:** Expected claims are missing from the ID token or userinfo.
- **Fix:** Check your scope configuration includes `profile` and `email`.

**ID token validation failed**
- **Cause:** Token signature verification failed or token is expired.
- **Fix:** Ensure your server time is synchronized. Verify the JWKS endpoint (https://idp.valyd.work/api/auth/oidc/jwks.json) is accessible.

**Discovery endpoint failed**
- **Cause:** Cannot reach the `.well-known/openid-configuration` URL.
- **Fix:** Check network connectivity to https://idp.valyd.work. Ensure no firewall blocks the request.

---

## Security Best Practices

- **Never expose client_secret** — Keep it server-side only. Never include it in frontend code or version control.
- **Always use HTTPS** — All OAuth/OIDC traffic must be encrypted. Never use HTTP.
- **Validate redirect URIs strictly** — Register exact URIs. Don't use wildcards in production.
- **Rotate secrets regularly** — Implement a secret rotation schedule (every 90 days recommended).

### Token Expiry Information

| Token         | Expiry     |
| ------------- | ---------- |
| ID Token      | 15 minutes |
| Access Token  | 1 hour     |
| Refresh Token | 30 days    |

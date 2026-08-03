> Source: https://docs.valyd.work/docs/errors
> Part of: Valyd ID API documentation — static copy generated for AI agents
> Generated from repo component: ErrorsSection.tsx

# Error Codes Reference

## Agent Quick-Start
- Source URL: https://docs.valyd.work/docs/errors
- Credentials / env vars needed: none (reference page; fixes may require CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
- Files an integrator edits: none — reference only (apply fixes in your auth/route-handler code as indicated per error)
- Estimated steps: 0 (look up the error code, apply the listed fix)
- Can complete without human input: YES — match the error `code` you received to a section below and apply its Fix.
- Prerequisites: none

All error responses follow a consistent format: a `success: false` flag and an `error` object containing a `code` and a human-readable `message`.

```json
{
  "success": false,
  "error": {
    "code": "<error_code>",
    "message": "<human-readable message>"
  }
}
```

To pick the right section, match on the `error.code` value (or the symptom for the SDK-level error):

```text
IF code == "invalid_client":           → go to "invalid_client" below (401)
IF code == "invalid_token":            → go to "invalid_token" below (401)
IF code == "insufficient_scope":       → go to "insufficient_scope" below (403)
IF code == "invalid_grant":            → go to "invalid_grant" below (400)
IF code == "invalid_request":          → go to "invalid_request" below (400)
IF code == "access_denied":            → go to "access_denied" below (403)
IF verifyLoginSession returns valid:false (no thrown error): → go to "Invalid login session" below (SDK / app-level)
```

---

## `invalid_client`

- **Status:** 401 Unauthorized
- **Cause:** The `client_id` or `client_secret` is invalid or doesn't match.
- **Fix:** Verify your credentials in the Developer Portal (https://dev.valyd.work → your project → Credentials) and ensure you're using the correct values. The `client_id` comes from the portal; the `client_secret` is generated in the portal by a human.

Example response:

```json
{
  "success": false,
  "error": {
    "code": "invalid_client",
    "message": "client_id/client_secret invalid"
  }
}
```

---

## `invalid_token`

- **Status:** 401 Unauthorized
- **Cause:** The access token is invalid, malformed, or has expired.
- **Fix:** Use the `/refresh` endpoint to get a new access token, or re-authenticate the user.

Example response:

```json
{
  "success": false,
  "error": {
    "code": "invalid_token",
    "message": "token invalid/expired"
  }
}
```

---

## `insufficient_scope`

- **Status:** 403 Forbidden
- **Cause:** The access token doesn't have the required scope for this endpoint.
- **Fix:** Request the missing scope in your authorization URL (space-separated, URL-encoded `scope` parameter) and have the user re-authenticate. The scope must also be enabled for your project in the Developer Portal: https://dev.valyd.work

Example response:

```json
{
  "success": false,
  "error": {
    "code": "insufficient_scope",
    "message": "The request requires the profile scope"
  }
}
```

---

## `invalid_grant`

- **Status:** 400 Bad Request
- **Cause:** The authorization code or refresh token is invalid, expired, already used, or the `redirect_uri` doesn't match the one registered in the portal.
- **Fix:** Authorization codes expire after 5 minutes and can only be used once. Verify your redirect URI matches exactly the one registered in the Developer Portal (https://dev.valyd.work). For refresh tokens, have the user re-authenticate.

Example response:

```json
{
  "success": false,
  "error": {
    "code": "invalid_grant",
    "message": "refresh_token is invalid or expired"
  }
}
```

---

## `invalid_request`

- **Status:** 400 Bad Request
- **Cause:** The request is missing required parameters or has invalid parameter values.
- **Fix:** Check the API documentation for required parameters and ensure all values are properly formatted.

Example response:

```json
{
  "success": false,
  "error": {
    "code": "invalid_request",
    "message": "Missing required parameter: code"
  }
}
```

---

## `access_denied`

- **Status:** 403 Forbidden
- **Cause:** The user denied the authorization request on the consent screen.
- **Fix:** The user chose not to grant access. You may prompt them to try again or explain why the permissions are needed.

Example response:

```json
{
  "success": false,
  "error": {
    "code": "access_denied",
    "message": "User denied the authorization request"
  }
}
```

---

## Invalid login session

- **Status:** SDK / app-level (no HTTP error code; the SDK call returns `{ valid: false }` and never throws on invalid markers)
- **Cause:** `valyd.verifyLoginSession(marker)` returned `{ valid: false }`. Possible reasons:
  - The login session expired (10-minute TTL).
  - The marker cookie is missing.
  - The marker was tampered with.
  - You're verifying with a different `clientSecret` than the one that created the session.
- **Fix:** Send the user back through `/login` to issue a fresh login session. Make sure the marker is stored server-side (httpOnly cookie or session) and survives the full redirect round-trip. Do NOT try to compare the callback `state` — that is Valyd's session id, not your CSRF token.

Example (SDK call):

```ts
// SDK call
const { valid } = await valyd.verifyLoginSession(marker);
// { valid: false } — never throws on invalid markers
```

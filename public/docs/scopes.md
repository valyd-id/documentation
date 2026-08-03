> Source: https://docs.valyd.work/docs/scopes
> Part of: Valyd ID API documentation — static copy generated for AI agents
> Generated from repo component: ScopesSection.tsx

# OAuth2 Scopes

## Agent Quick-Start
- Source URL: https://docs.valyd.work/docs/scopes
- Credentials / env vars needed: CLIENT_ID, REDIRECT_URI (access token also required to call scoped endpoints)
- Files an integrator edits: the code that builds your authorization URL (e.g. server route handler or auth helper)
- Estimated steps: 2 (choose scopes, add them space-separated and URL-encoded to the authorization URL)
- Can complete without human input: NO — each requested scope must first be enabled for your project in the Developer Portal (https://dev.valyd.work) by a human.
- Prerequisites:
  - A registered project in the Developer Portal: https://dev.valyd.work
  - The scopes you intend to request are enabled for that project in the portal
  - A `client_id` and registered `redirect_url` for the project

Valyd uses OAuth2 scope-based access control. When initiating the authorization flow, you specify which permissions your application needs. Users see these scopes on the consent screen before granting access.

## Scopes summary

| Scope | Required | Description | Grants access to |
| --- | --- | --- | --- |
| `profile` | Yes (Mandatory) | User profile information including name, photo, and age verification status | `/userinfo` |
| `verifications` | Optional | Identity verification data including ID verification status, face match confidence, and verification timestamps | `/verifications` |
| `doctor_license` | Optional | Medical/nursing license details for verified healthcare practitioners | Doctor/nursing license endpoints |
| `zkp` | Optional | Zero-Knowledge Proof age verification data | ZKP-related endpoints |
| `mcp` | Optional | Access to Model Context Protocol (MCP) endpoints | MCP endpoints |

## Requesting scopes

Include the `scope` parameter in your authorization URL. Multiple scopes must be **space-separated** and URL-encoded.

```javascript
const clientId = "YOUR_CLIENT_ID";        // get this from the Developer Portal → your project → Credentials: https://dev.valyd.work
const redirectUrl = "YOUR_REDIRECT_URI";  // must match a redirect URL registered for your project in the Developer Portal: https://dev.valyd.work

const scopes = "profile verifications zkp"; // Space-separated

const authURL = `https://idp.valyd.work/auth?client_id=${clientId}&redirect_url=${redirectUrl}&scope=${encodeURIComponent(scopes)}`;

// Result: scope=profile%20verifications%20zkp
```

Expected output: a fully-formed authorization URL string. Redirecting the user to it shows the Valyd consent screen listing exactly the scopes you requested.

## Scope enforcement

- Scopes are verified against your project settings in the Developer Portal.
- If you request a scope not enabled for your project, authorization will fail.
- If your access token doesn't have a required scope, the endpoint returns `403 Forbidden`.

Decision tree when authorization or a scoped request fails:

```text
IF authorization fails immediately (before the consent screen):  → the requested scope is not enabled for your project. Enable it in the Developer Portal → your project → Scopes: https://dev.valyd.work
IF a scoped endpoint returns 403 with code "insufficient_scope": → the access token is missing that scope. Add the scope to your authorization URL and have the user re-authenticate.
IF unsure which scopes a token carries:                          → re-run the authorization flow and confirm the requested `scope` parameter matches the scopes the endpoint requires.
```

---

## `profile` scope (Required / Mandatory)

User profile information including name, photo, and age verification status.

### Grants access to

- `/userinfo`

### Response fields

| Field | Description |
| --- | --- |
| `sub` | Unique user identifier |
| `email` | User's email address |
| `first_name` | User's first name |
| `last_name` | User's last name |
| `full_name` | User's full name |
| `valyd_id` | The user's unique Valyd account identifier |
| `id_verified` | Whether ID is verified (boolean) |
| `created_at` | Account creation timestamp |

### Missing scope error (403 Forbidden)

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

## `verifications` scope (Optional)

Identity verification data including ID verification status, face match confidence, and verification timestamps.

### Grants access to

- `/verifications`

### Response fields

| Field | Description |
| --- | --- |
| `id_verified` | Whether the user's ID is verified |
| `face_match` | Face match confidence score (0-1) |
| `last_checked` | Timestamp of last verification check |

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

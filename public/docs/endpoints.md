> Source: https://docs.valyd.work/docs/endpoints
> Part of: Valyd ID API documentation — static copy generated for AI agents
> Generated from repo component: EndpointsSection.tsx

# API Reference

## Agent Quick-Start
- Source URL: https://docs.valyd.work/docs/endpoints
- Credentials / env vars needed: CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN, REFRESH_TOKEN, AUTH_CODE
- Files an integrator edits: none — reference only (consumed by your backend route handlers)
- Estimated steps: N/A (reference)
- Can complete without human input: NO — CLIENT_ID and CLIENT_SECRET must be obtained by a human from the Developer Portal (https://dev.valyd.work)
- Prerequisites:
  - A registered application with a Client ID and Client Secret (get these from the Developer Portal: https://dev.valyd.work)
  - All requests must be made over HTTPS
  - Authenticated endpoints require a Bearer access token in the `Authorization` header
  - The base URL for every endpoint below is `https://idp.valyd.work/api/auth/tpsso`

## General notes
- All API requests must be made over HTTPS.
- Endpoints that require authentication expect a Bearer token in the `Authorization` header: `Authorization: Bearer YOUR_ACCESS_TOKEN`.
- If you are using the SDK, prefer the typed helpers (`createLoginSession()`, `verifyLoginSession(marker)`, `getAuthorizationUrl()`, `exchangeCode`) — they call these endpoints for you.
- Base URL (used by every endpoint below): `https://idp.valyd.work/api/auth/tpsso`

## SDK methods (v0.2.0)

### `valyd.createLoginSession()` (New in 0.2.0)
Issues a one-time login session. Call **before** redirecting the user to Valyd. Returns `{ authorizeState, marker }`.
- **authorizeState** — pass as `state` in `getAuthorizationUrl()`.
- **marker** — HMAC-signed string. Store server-side (httpOnly cookie or session). Never expose to the browser JS.
- **TTL** — 10 minutes.

### `valyd.verifyLoginSession(marker)` (New in 0.2.0)
Validates the marker on the callback, **before** `exchangeCode`. Returns `{ valid: boolean }`. Never throws on an invalid marker.
- Use this as your CSRF check. Do **not** compare callback `state` to anything.
- Returns `{ valid: false }` for expired, missing, or tampered markers.

---

## POST /token — Exchange Code for Tokens

- **Method:** POST
- **Full URL:** `https://idp.valyd.work/api/auth/tpsso/token`
- **Base URL:** `https://idp.valyd.work/api/auth/tpsso`
- **Path:** `/token`
- **Auth / required scope:** None (authenticated via `client_id` + `client_secret` in the request body)
- **Required headers:**
  - `Content-Type: application/json`
  - `Accept: application/json`

Exchange the one-time authorization code you received on your callback URL for access and refresh tokens. This should be called from your backend server.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `grant_type` | string | Yes | Must be "authorization_code" |
| `client_id` | string | Yes | Your assigned Client ID (get this from the Developer Portal → your project → Credentials: https://dev.valyd.work) |
| `client_secret` | string | Yes | Your Client Secret (server-side only!) (get this from the Developer Portal → your project → Credentials: https://dev.valyd.work) |
| `code` | string | Yes | The authorization code from callback |

### Request body (application/json)

```json
{
  "grant_type": "authorization_code",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "AUTH_CODE_FROM_CALLBACK"
}
```

`YOUR_CLIENT_ID` / `YOUR_CLIENT_SECRET`: get these from the Developer Portal → your project → Credentials: https://dev.valyd.work
`AUTH_CODE_FROM_CALLBACK`: the one-time authorization code delivered to your registered callback URL after the user authenticates.

### Code examples

```bash
curl -X POST "https://idp.valyd.work/api/auth/tpsso/token" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "code": "AUTH_CODE_FROM_CALLBACK"
  }'
```

```javascript
const response = await fetch("https://idp.valyd.work/api/auth/tpsso/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify({
    grant_type: "authorization_code",
    client_id: "YOUR_CLIENT_ID",
    client_secret: "YOUR_CLIENT_SECRET",
    code: authCode
  })
});

const data = await response.json();
const { access_token, refresh_token } = data.data;
```

```python
import requests

response = requests.post(
    "https://idp.valyd.work/api/auth/tpsso/token",
    json={
        "grant_type": "authorization_code",
        "client_id": "YOUR_CLIENT_ID",
        "client_secret": "YOUR_CLIENT_SECRET",
        "code": auth_code
    },
    headers={
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
)

data = response.json()
access_token = data["data"]["access_token"]
refresh_token = data["data"]["refresh_token"]
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "https://idp.valyd.work/api/auth/tpsso/token",
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode([
        "grant_type" => "authorization_code",
        "client_id" => "YOUR_CLIENT_ID",
        "client_secret" => "YOUR_CLIENT_SECRET",
        "code" => $authCode
    ]),
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Accept: application/json"
    ],
    CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($ch);
$data = json_decode($response, true);
$accessToken = $data["data"]["access_token"];
?>
```

```java
HttpClient client = HttpClient.newHttpClient();

String body = """
{
    "grant_type": "authorization_code",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "code": "%s"
}
""".formatted(authCode);

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://idp.valyd.work/api/auth/tpsso/token"))
    .header("Content-Type", "application/json")
    .header("Accept", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());

// Parse response with your preferred JSON library
```

### Expected output

**Response — 200 OK** (Success Response):

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...",
    "token_type": "Bearer",
    "expires_in": 900,
    "refresh_token": "rfrsh_abc123...",
    "user": {
      "id": 123,
      "email": "user@example.com",
      "username": "john_doe",
      "name": "John Doe",
      "valyd_id": "valyd_225c7f2ac450496f97bbbc57354a5898",
      "avatar_url": null,
      "created_at": "2025-09-11T10:15:00Z"
    }
  }
}
```

**Response — Error** (Error Response):

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

## GET /userinfo — Get User Profile

- **Method:** GET
- **Full URL:** `https://idp.valyd.work/api/auth/tpsso/userinfo`
- **Base URL:** `https://idp.valyd.work/api/auth/tpsso`
- **Path:** `/userinfo`
- **Auth / required scope:** Bearer access token required; required scope: `profile`
- **Required headers:**
  - `Accept: application/json`
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`

Retrieve the authenticated user's profile information including name, email, and verification status.

`YOUR_ACCESS_TOKEN`: the `access_token` returned by `POST /token` (or `POST /refresh`).

### Code examples

```bash
curl -X GET "https://idp.valyd.work/api/auth/tpsso/userinfo" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

```javascript
const response = await fetch("https://idp.valyd.work/api/auth/tpsso/userinfo", {
  method: "GET",
  headers: {
    "Accept": "application/json",
    "Authorization": `Bearer ${accessToken}`
  }
});

const data = await response.json();
const user = data.data;
console.log(user.full_name, user.email);
```

```python
import requests

response = requests.get(
    "https://idp.valyd.work/api/auth/tpsso/userinfo",
    headers={
        "Accept": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
)

user = response.json()["data"]
print(user["full_name"], user["email"])
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "https://idp.valyd.work/api/auth/tpsso/userinfo",
    CURLOPT_HTTPHEADER => [
        "Accept: application/json",
        "Authorization: Bearer " . $accessToken
    ],
    CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($ch);
$user = json_decode($response, true)["data"];
echo $user["full_name"];
?>
```

```java
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://idp.valyd.work/api/auth/tpsso/userinfo"))
    .header("Accept", "application/json")
    .header("Authorization", "Bearer " + accessToken)
    .GET()
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());
```

### Expected output

**Response — 200 OK** (Success Response):

```json
{
  "success": true,
  "data": {
    "sub": "valyd_225c7f2ac450496f97bbbc57354a5898",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "valyd_id": "valyd_225c7f2ac450496f97bbbc57354a5898",
    "id_verified": true,
    "created_at": "2025-09-10T12:00:00Z"
  }
}
```

**Response — Error** (Error Response):

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

## GET /licenses — Get Professional Licenses

- **Method:** GET
- **Full URL:** `https://idp.valyd.work/api/auth/tpsso/licenses`
- **Base URL:** `https://idp.valyd.work/api/auth/tpsso`
- **Path:** `/licenses`
- **Auth / required scope:** Bearer access token required (no specific scope declared on this endpoint in the source)
- **Required headers:**
  - `Accept: application/json`
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`

Returns a snapshot of the user's professional licenses as verified by Valyd. Includes nursing licenses, CDL endorsements, CPR/BLS certifications, Food Handler permits, and more.

`YOUR_ACCESS_TOKEN`: the `access_token` returned by `POST /token` (or `POST /refresh`).

### Code examples

```bash
curl -X GET "https://idp.valyd.work/api/auth/tpsso/licenses" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

```javascript
const response = await fetch("https://idp.valyd.work/api/auth/tpsso/licenses", {
  method: "GET",
  headers: {
    "Accept": "application/json",
    "Authorization": `Bearer ${accessToken}`
  }
});

const data = await response.json();
const licenses = data.data.licenses;

licenses.forEach(license => {
  console.log(`${license.type}: ${license.status}`);
});
```

```python
import requests

response = requests.get(
    "https://idp.valyd.work/api/auth/tpsso/licenses",
    headers={
        "Accept": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
)

licenses = response.json()["data"]["licenses"]
for license in licenses:
    print(f"{license['type']}: {license['status']}")
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "https://idp.valyd.work/api/auth/tpsso/licenses",
    CURLOPT_HTTPHEADER => [
        "Accept: application/json",
        "Authorization: Bearer " . $accessToken
    ],
    CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($ch);
$licenses = json_decode($response, true)["data"]["licenses"];

foreach ($licenses as $license) {
    echo $license["type"] . ": " . $license["status"] . "\n";
}
?>
```

```java
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://idp.valyd.work/api/auth/tpsso/licenses"))
    .header("Accept", "application/json")
    .header("Authorization", "Bearer " + accessToken)
    .GET()
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());

// Parse licenses from response
```

### Expected output

**Response — 200 OK** (Success Response):

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

**Response — Error** (Error Response):

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

## GET /verifications — Get Identity Verifications

- **Method:** GET
- **Full URL:** `https://idp.valyd.work/api/auth/tpsso/verifications`
- **Base URL:** `https://idp.valyd.work/api/auth/tpsso`
- **Path:** `/verifications`
- **Auth / required scope:** Bearer access token required; required scope: `verifications`
- **Required headers:**
  - `Accept: application/json`
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`

Returns identity and verification results including ID verification status, face match confidence, and last verification timestamp. Use alongside `/userinfo` for a complete user picture.

`YOUR_ACCESS_TOKEN`: the `access_token` returned by `POST /token` (or `POST /refresh`).

### Code examples

```bash
curl -X GET "https://idp.valyd.work/api/auth/tpsso/verifications" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

```javascript
const response = await fetch("https://idp.valyd.work/api/auth/tpsso/verifications", {
  method: "GET",
  headers: {
    "Accept": "application/json",
    "Authorization": `Bearer ${accessToken}`
  }
});

const data = await response.json();
const { id_verified, face_match } = data.data.verifications;

if (id_verified && face_match > 0.9) {
  console.log("User is fully verified!");
}
```

```python
import requests

response = requests.get(
    "https://idp.valyd.work/api/auth/tpsso/verifications",
    headers={
        "Accept": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
)

verifications = response.json()["data"]["verifications"]
if verifications["id_verified"] and verifications["face_match"] > 0.9:
    print("User is fully verified!")
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "https://idp.valyd.work/api/auth/tpsso/verifications",
    CURLOPT_HTTPHEADER => [
        "Accept: application/json",
        "Authorization: Bearer " . $accessToken
    ],
    CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($ch);
$verifications = json_decode($response, true)["data"]["verifications"];

if ($verifications["id_verified"] && $verifications["face_match"] > 0.9) {
    echo "User is fully verified!";
}
?>
```

```java
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://idp.valyd.work/api/auth/tpsso/verifications"))
    .header("Accept", "application/json")
    .header("Authorization", "Bearer " + accessToken)
    .GET()
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());

// Parse verifications from response
```

### Expected output

**Response — 200 OK** (Success Response):

```json
{
  "success": true,
  "data": {
    "verifications": {
      "id_verified": true,
      "face_match": 0.98,
      "last_checked": "2025-09-11T12:00:00Z"
    }
  }
}
```

**Response — Error** (Error Response):

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

## POST /refresh — Refresh Access Token

- **Method:** POST
- **Full URL:** `https://idp.valyd.work/api/auth/tpsso/refresh`
- **Base URL:** `https://idp.valyd.work/api/auth/tpsso`
- **Path:** `/refresh`
- **Auth / required scope:** None (authenticated via the `refresh_token` in the request body)
- **Required headers:**
  - `Content-Type: application/json`
  - `Accept: application/json`

Use your `refresh_token` to obtain a new `access_token` when it expires. Optionally rotate the refresh token for enhanced security.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `refresh_token` | string | Yes | Your current refresh token |
| `rotate_refresh` | boolean | No | Set to true to also get a new refresh token |

### Request body (application/json)

```json
{
  "refresh_token": "rfrsh_abc123...",
  "rotate_refresh": true
}
```

`refresh_token`: the `refresh_token` previously returned by `POST /token` (or by a prior `POST /refresh` when `rotate_refresh` was true).

### Code examples

```bash
curl -X POST "https://idp.valyd.work/api/auth/tpsso/refresh" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "refresh_token": "rfrsh_abc123...",
    "rotate_refresh": true
  }'
```

```javascript
const response = await fetch("https://idp.valyd.work/api/auth/tpsso/refresh", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify({
    refresh_token: refreshToken,
    rotate_refresh: true // Recommended for security
  })
});

const data = await response.json();
const { access_token, refresh_token } = data.data.tokens;

// Update stored tokens
localStorage.setItem("access_token", access_token);
localStorage.setItem("refresh_token", refresh_token);
```

```python
import requests

response = requests.post(
    "https://idp.valyd.work/api/auth/tpsso/refresh",
    json={
        "refresh_token": refresh_token,
        "rotate_refresh": True  # Recommended for security
    },
    headers={
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
)

tokens = response.json()["data"]["tokens"]
access_token = tokens["access_token"]
refresh_token = tokens["refresh_token"]
```

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "https://idp.valyd.work/api/auth/tpsso/refresh",
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode([
        "refresh_token" => $refreshToken,
        "rotate_refresh" => true
    ]),
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Accept: application/json"
    ],
    CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($ch);
$tokens = json_decode($response, true)["data"]["tokens"];
$accessToken = $tokens["access_token"];
$refreshToken = $tokens["refresh_token"];
?>
```

```java
HttpClient client = HttpClient.newHttpClient();

String body = """
{
    "refresh_token": "%s",
    "rotate_refresh": true
}
""".formatted(refreshToken);

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://idp.valyd.work/api/auth/tpsso/refresh"))
    .header("Content-Type", "application/json")
    .header("Accept", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());
```

### Expected output

**Response — 200 OK** (Success Response):

```json
{
  "success": true,
  "data": {
    "tokens": {
      "access_token": "eyJhbGciOi...",
      "token_type": "Bearer",
      "expires_in": 900,
      "refresh_token": "rfrsh_new456..."
    }
  }
}
```

**Response — Error** (Error Response):

```json
{
  "success": false,
  "error": {
    "code": "invalid_grant",
    "message": "refresh_token is invalid or expired"
  }
}
```

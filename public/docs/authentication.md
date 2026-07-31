> Source: https://docs.valyd.work/docs/authentication
> Part of: Valyd ID API documentation — static copy generated for AI agents
> Generated from repo component: AuthenticationSection.tsx

# Authentication (OAuth2 / TPSSO Flow)

## Agent Quick-Start
- Source URL: https://docs.valyd.work/docs/authentication
- Credentials / env vars needed: VALYD_CLIENT_ID, VALYD_CLIENT_SECRET, VALYD_REDIRECT_URI
- Files an integrator edits: .env (credentials), server route handler for `/callback`, login/redirect route handler
- Estimated steps: 6
- Can complete without human input: NO — a human must register the app and obtain a Client ID + Client Secret from the Developer Portal (https://dev.valyd.work), and register the exact redirect/callback URL.
- Prerequisites:
  - A Valyd application registered in the Developer Portal (https://dev.valyd.work) with a Client ID and Client Secret.
  - The exact callback/redirect URL (e.g. `https://yourapp.com/callback`) registered on that application — it must match the `redirect_url` you send.
  - A server-side environment that can keep `VALYD_CLIENT_SECRET` private (token exchange MUST happen server-side).
  - (Recommended) Node project with the official SDK: `npm install @valyd/sdk@^0.2.0`

---

Valyd uses the OAuth2 Authorization Code flow (referred to internally as TPSSO). This is a server-side integration: you redirect the user to Valyd, the user consents, Valyd redirects back to your callback with a one-time `code`, and your server exchanges that code for tokens.

CRITICAL behavioral difference from standard OAuth2: Valyd does NOT echo your `state` back on the callback. The `state` returned to your callback is Valyd's own opaque session id. Do NOT use it for CSRF protection by comparing it to a value you sent. Instead, create a login session up front, store its marker, and verify the marker on the callback.

### Prerequisites
- Client ID and Client Secret (get these from the Developer Portal → your project → Credentials: https://dev.valyd.work).
- A registered redirect/callback URL matching what you send as `redirect_url`.
- Environment variables set on your server:
  - `VALYD_CLIENT_ID` (get from Developer Portal: https://dev.valyd.work)
  - `VALYD_CLIENT_SECRET` (get from Developer Portal: https://dev.valyd.work)
  - `VALYD_REDIRECT_URI` (the exact callback URL you registered, e.g. `https://yourapp.com/callback`)

### Steps

1. **Construct the authorization URL.** Redirect users to the Valyd authorization endpoint with your client credentials and requested scopes. The exact URL format is:

   ```text
   https://idp.valyd.work/auth?client_id={client_id}&redirect_url={redirect_url}&scope={scopes}
   ```

   Parameters:

   | Parameter | Required | Description |
   | --- | --- | --- |
   | `client_id` | Yes | Your application's Client ID from the Developer Portal (https://dev.valyd.work). |
   | `redirect_url` | Yes | The URL to redirect to after authentication. Must match the URL registered on your application. |
   | `scope` | Yes | Space-separated list of scopes, URL-encoded. Example: `profile%20verifications`. |
   | `state` | Optional | Pass `session.authorizeState` from `createLoginSession()`. NOT echoed on the callback for TPSSO — do not use it for CSRF on its own. |

   **Expected output:** A fully-formed URL string. Example with encoded scopes `profile verifications`:

   ```text
   https://idp.valyd.work/auth?client_id=YOUR_CLIENT_ID&redirect_url=https://yourapp.com/callback&scope=profile%20verifications
   ```

2. **Issue a login session and redirect (recommended: use the SDK).** On your login route, create a login session, store its marker (httpOnly cookie or server session), build the authorization URL, and redirect the user:

   ```javascript
   import { ValydClient } from "@valyd/sdk";

   const valyd = new ValydClient({
     clientId: process.env.VALYD_CLIENT_ID!,
     clientSecret: process.env.VALYD_CLIENT_SECRET!,
     redirectUri: "https://yourapp.com/callback",
   });

   // Issue a login session and redirect — never compare state on the callback.
   const session = await valyd.createLoginSession();
   // store session.marker in an httpOnly cookie or server session

   const url = valyd.getAuthorizationUrl({
     state: session.authorizeState,
     scope: ["profile", "verifications", "zkp"],
     productName: "My App",
   });
   res.redirect(url);
   ```

   **Expected output:** HTTP 302 redirect sending the user's browser to `https://idp.valyd.work/auth?...`. The login session marker is now stored on the user's side (cookie/session) for the CSRF check in step 5.

3. **User consents on the Valyd consent screen.** Valyd shows the consent screen with the requested scopes and, on approval, issues a one-time authorization `code`.

   **Expected output:** Valyd redirects the user's browser to your callback URL with the code attached. The `code` is valid for only 5 minutes.

4. **Receive the callback on your server.** The user is redirected to your registered callback URL with the authorization code as a query parameter. Format:

   ```text
   https://yourapp.com/callback?code=AUTH_CODE_HERE
   ```

   Callback query parameters:

   | Parameter | Description |
   | --- | --- |
   | `code` | The one-time authorization code (valid for 5 minutes). |
   | `state` | Valyd's own session id (opaque). Do NOT compare it to the value you sent on `authorize`. Use `verifyLoginSession(marker)` for CSRF. |

   **Expected output:** Your `/callback` route is invoked with `code` (and possibly `error`) present in the query string.

5. **CSRF check via the login session.** Verify the marker you stored in step 2. This is how you protect against CSRF — NOT by comparing the callback `state`.

   ```javascript
   const marker = req.cookies.valyd_login;
   const { valid } = await valyd.verifyLoginSession(marker);
   if (!valid) return res.status(400).send("Invalid login session");
   ```

   **Expected output:** `verifyLoginSession(marker)` returns `{ valid: true }` for a legitimate flow. If `valid` is `false`, reject the request (HTTP 400).

6. **Exchange the code for tokens, then fetch the user (server-side).** Immediately exchange the `code` (it expires in 5 minutes). Full Node/Express + SDK handler:

   ```javascript
   // Recommended: use the official SDK.
   //   npm install @valyd/sdk@^0.2.0
   import { ValydClient } from "@valyd/sdk";

   const valyd = new ValydClient({
     clientId: process.env.VALYD_CLIENT_ID!,
     clientSecret: process.env.VALYD_CLIENT_SECRET!,
     redirectUri: process.env.VALYD_REDIRECT_URI!,
   });

   app.get("/callback", async (req, res) => {
     // 1. Pull code + state out of the redirect.
     const { code, error } = valyd.parseCallback(req.url);
     if (error || !code) return res.status(400).send(error ?? "missing code");

     // 2. CSRF — verify the marker we stored on the way out.
     //    Do NOT compare req.query.state to anything you sent.
     const marker = req.cookies.valyd_login;
     const { valid } = await valyd.verifyLoginSession(marker);
     if (!valid) return res.status(400).send("Invalid login session");

     // 3. Exchange the code for tokens (server-side).
     const tokens = await valyd.exchangeCode(code);

     // 4. Fetch user data.
     const user = await valyd.getUserInfo(tokens.accessToken);

     res.clearCookie("valyd_login");
     // ...set your own app session, then redirect to /dashboard
   });
   ```

   **Expected output:** `exchangeCode(code)` returns tokens (with `accessToken`); `getUserInfo(accessToken)` returns the user's profile data. Then set your own app session and redirect (e.g. to `/dashboard`).

#### Token exchange without the SDK (raw HTTP)

The token endpoint is `POST https://idp.valyd.work/api/auth/tpsso/token` with a JSON body. The response wraps the tokens under a `data` key (i.e. `response.data.access_token`).

Request shape:

```http
POST /api/auth/tpsso/token HTTP/1.1
Host: idp.valyd.work
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "AUTH_CODE_HERE"
}
```

**Expected output:** HTTP 200 with a JSON body whose `data` object contains `access_token` (read it as `response.data.access_token`).

Python (Flask):

```python
from flask import Flask, request, redirect, session
import requests

app = Flask(__name__)

@app.route("/callback")
def callback():
    code = request.args.get("code")
    if not code:
        return "missing code", 400

    response = requests.post(
        "https://idp.valyd.work/api/auth/tpsso/token",
        json={
            "grant_type": "authorization_code",
            "client_id": "YOUR_CLIENT_ID",
            "client_secret": "YOUR_CLIENT_SECRET",
            "code": code,
        },
    )
    tokens = response.json()["data"]
    session["access_token"] = tokens["access_token"]
    return redirect("/dashboard")
```

PHP:

```php
<?php
$code = $_GET['code'] ?? null;
if (!$code) { http_response_code(400); exit('missing code'); }

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => 'https://idp.valyd.work/api/auth/tpsso/token',
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode([
        'grant_type' => 'authorization_code',
        'client_id' => 'YOUR_CLIENT_ID',
        'client_secret' => 'YOUR_CLIENT_SECRET',
        'code' => $code
    ]),
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
]);
$data = json_decode(curl_exec($ch), true);
session_start();
$_SESSION['access_token'] = $data['data']['access_token'];
header('Location: /dashboard');
```

Java (Spring):

```java
@GetMapping("/callback")
public ResponseEntity<?> callback(@RequestParam String code) {
    RestTemplate rt = new RestTemplate();
    Map<String, String> body = Map.of(
        "grant_type", "authorization_code",
        "client_id", "YOUR_CLIENT_ID",
        "client_secret", "YOUR_CLIENT_SECRET",
        "code", code
    );
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    rt.postForEntity("https://idp.valyd.work/api/auth/tpsso/token",
        new HttpEntity<>(body, headers), String.class);
    return ResponseEntity.status(302).header("Location", "/dashboard").build();
}
```

In all raw-HTTP examples, replace `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with your real values (get these from the Developer Portal → your project → Credentials: https://dev.valyd.work). Never expose `YOUR_CLIENT_SECRET` in client-side code — the token exchange must run on your server.

### Auth-flow decision tree

```text
IF the request just hit your login/start route:
    → call valyd.createLoginSession(), store session.marker (httpOnly cookie / server session),
      build the URL with valyd.getAuthorizationUrl({ state: session.authorizeState, scope, productName }),
      and res.redirect(url).

IF the request hit your /callback route:
    → parse it: const { code, error } = valyd.parseCallback(req.url)
    IF error is set OR code is missing:  → return HTTP 400 (error ?? "missing code"). STOP.
    IF code is present:                  → continue to the CSRF check below.

CSRF check (do this on every callback):
    → const { valid } = await valyd.verifyLoginSession(req.cookies.valyd_login)
    IF valid === false:  → return HTTP 400 "Invalid login session". STOP.
    IF valid === true:   → proceed to token exchange.

    DO NOT compare the callback `state` to anything you sent —
    for TPSSO it is Valyd's opaque session id, not your value.

Token exchange:
    → const tokens = await valyd.exchangeCode(code)   // must run server-side, within 5 minutes of issue
    IF more than 5 minutes elapsed since the code was issued:  → the code is expired; restart the flow from the login route.
    → const user = await valyd.getUserInfo(tokens.accessToken)
    → res.clearCookie("valyd_login"), set your own app session, redirect to /dashboard.

IF you are not using Node / the SDK:
    → POST https://idp.valyd.work/api/auth/tpsso/token with JSON
      { grant_type: "authorization_code", client_id, client_secret, code }
      and read the token from response.data.access_token.
```

### Verification
- Confirm the redirect: opening your login route returns HTTP 302 with a `Location` header beginning `https://idp.valyd.work/auth?client_id=...&redirect_url=...&scope=...`.
- After consenting, confirm your `/callback` route receives a `code` query parameter.
- Confirm the token exchange succeeds:

  ```bash
  curl -i -X POST https://idp.valyd.work/api/auth/tpsso/token \
    -H "Content-Type: application/json" \
    -d '{"grant_type":"authorization_code","client_id":"YOUR_CLIENT_ID","client_secret":"YOUR_CLIENT_SECRET","code":"AUTH_CODE_HERE"}'
  ```

  Expected: HTTP 200 and a JSON body containing `data.access_token`.

### Common errors

1. **Comparing the callback `state` to the value you sent (flow always rejected).**
   - Cause: Valyd's TPSSO does not echo your `state`; the `state` on the callback is Valyd's own opaque session id, so any equality check against your sent value fails.
   - Fix: Remove the `state` comparison. Use `valyd.createLoginSession()` + store `session.marker`, then verify on the callback with `valyd.verifyLoginSession(marker)` expecting `{ valid: true }`.

2. **"missing code" / expired code (HTTP 400 on callback or 4xx from /token).**
   - Cause: No `code` in the callback (user denied or an `error` was returned), or the code was used more than 5 minutes after issue.
   - Fix: When `parseCallback` returns `error` or no `code`, return HTTP 400 and restart the flow. Exchange the code immediately on the server — it is valid for only 5 minutes.

3. **`redirect_url` mismatch (authorization rejected by Valyd).**
   - Cause: The `redirect_url` sent on the authorization request does not exactly match the URL registered for your application.
   - Fix: Set `VALYD_REDIRECT_URI` (and the SDK `redirectUri`) to the exact callback URL registered in the Developer Portal (https://dev.valyd.work), matching scheme, host, and path.

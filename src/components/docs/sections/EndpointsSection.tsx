import { API_CONFIG } from "@/lib/api-config";
import { EndpointCard } from "../EndpointCard";

export const EndpointsSection = () => {
  const endpoints = [
    {
      id: "endpoint-token",
      method: "POST" as const,
      path: "/token",
      title: "Exchange Code for Tokens",
      description: "Exchange the one-time authorization code you received on your callback URL for access and refresh tokens. This should be called from your backend server.",
      parameters: [
        { name: "grant_type", type: "string", required: true, description: 'Must be "authorization_code"' },
        { name: "client_id", type: "string", required: true, description: "Your assigned Client ID" },
        { name: "client_secret", type: "string", required: true, description: "Your Client Secret (server-side only!)" },
        { name: "code", type: "string", required: true, description: "The authorization code from callback" },
      ],
      requestBody: `{
  "grant_type": "authorization_code",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "AUTH_CODE_FROM_CALLBACK"
}`,
      responseExample: `{
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
}`,
      errorExample: `{
  "success": false,
  "error": {
    "code": "invalid_client",
    "message": "client_id/client_secret invalid"
  }
}`,
      codeExamples: {
        curl: `curl -X POST "${API_CONFIG.API_BASE_URL}/token" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "grant_type": "authorization_code",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "code": "AUTH_CODE_FROM_CALLBACK"
  }'`,
        javascript: `const response = await fetch("${API_CONFIG.API_BASE_URL}/token", {
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
const { access_token, refresh_token } = data.data;`,
        python: `import requests

response = requests.post(
    "${API_CONFIG.API_BASE_URL}/token",
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
refresh_token = data["data"]["refresh_token"]`,
        php: `<?php
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "${API_CONFIG.API_BASE_URL}/token",
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
?>`,
        java: `HttpClient client = HttpClient.newHttpClient();

String body = """
{
    "grant_type": "authorization_code",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "code": "%s"
}
""".formatted(authCode);

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${API_CONFIG.API_BASE_URL}/token"))
    .header("Content-Type", "application/json")
    .header("Accept", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());

// Parse response with your preferred JSON library`,
      },
    },
    {
      id: "endpoint-userinfo",
      method: "GET" as const,
      path: "/userinfo",
      title: "Get User Profile",
      description: "Retrieve the authenticated user's profile information including name, email, and verification status.",
      requiredScope: "profile",
      responseExample: `{
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
}`,
      errorExample: `{
  "success": false,
  "error": {
    "code": "insufficient_scope",
    "message": "The request requires the profile scope"
  }
}`,
      codeExamples: {
        curl: `curl -X GET "${API_CONFIG.API_BASE_URL}/userinfo" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`,
        javascript: `const response = await fetch("${API_CONFIG.API_BASE_URL}/userinfo", {
  method: "GET",
  headers: {
    "Accept": "application/json",
    "Authorization": \`Bearer \${accessToken}\`
  }
});

const data = await response.json();
const user = data.data;
console.log(user.full_name, user.email);`,
        python: `import requests

response = requests.get(
    "${API_CONFIG.API_BASE_URL}/userinfo",
    headers={
        "Accept": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
)

user = response.json()["data"]
print(user["full_name"], user["email"])`,
        php: `<?php
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "${API_CONFIG.API_BASE_URL}/userinfo",
    CURLOPT_HTTPHEADER => [
        "Accept: application/json",
        "Authorization: Bearer " . $accessToken
    ],
    CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($ch);
$user = json_decode($response, true)["data"];
echo $user["full_name"];
?>`,
        java: `HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${API_CONFIG.API_BASE_URL}/userinfo"))
    .header("Accept", "application/json")
    .header("Authorization", "Bearer " + accessToken)
    .GET()
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());`,
      },
    },
    {
      id: "endpoint-licenses",
      method: "GET" as const,
      path: "/licenses",
      title: "Get Professional Licenses",
      description: "Returns a snapshot of the user's professional licenses as verified by Valyd. Includes nursing licenses, CDL endorsements, CPR/BLS certifications, Food Handler permits, and more.",
      responseExample: `{
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
}`,
      errorExample: `{
  "success": false,
  "error": {
    "code": "invalid_token",
    "message": "token invalid/expired"
  }
}`,
      codeExamples: {
        curl: `curl -X GET "${API_CONFIG.API_BASE_URL}/licenses" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`,
        javascript: `const response = await fetch("${API_CONFIG.API_BASE_URL}/licenses", {
  method: "GET",
  headers: {
    "Accept": "application/json",
    "Authorization": \`Bearer \${accessToken}\`
  }
});

const data = await response.json();
const licenses = data.data.licenses;

licenses.forEach(license => {
  console.log(\`\${license.type}: \${license.status}\`);
});`,
        python: `import requests

response = requests.get(
    "${API_CONFIG.API_BASE_URL}/licenses",
    headers={
        "Accept": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
)

licenses = response.json()["data"]["licenses"]
for license in licenses:
    print(f"{license['type']}: {license['status']}")`,
        php: `<?php
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "${API_CONFIG.API_BASE_URL}/licenses",
    CURLOPT_HTTPHEADER => [
        "Accept: application/json",
        "Authorization: Bearer " . $accessToken
    ],
    CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($ch);
$licenses = json_decode($response, true)["data"]["licenses"];

foreach ($licenses as $license) {
    echo $license["type"] . ": " . $license["status"] . "\\n";
}
?>`,
        java: `HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${API_CONFIG.API_BASE_URL}/licenses"))
    .header("Accept", "application/json")
    .header("Authorization", "Bearer " + accessToken)
    .GET()
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());

// Parse licenses from response`,
      },
    },
    {
      id: "endpoint-verifications",
      method: "GET" as const,
      path: "/verifications",
      title: "Get Identity Verifications",
      description: "Returns identity and verification results including ID verification status, face match confidence, and last verification timestamp. Use alongside /userinfo for a complete user picture.",
      requiredScope: "verifications",
      responseExample: `{
  "success": true,
  "data": {
    "verifications": {
      "id_verified": true,
      "face_match": 0.98,
      "last_checked": "2025-09-11T12:00:00Z"
    }
  }
}`,
      errorExample: `{
  "success": false,
  "error": {
    "code": "insufficient_scope",
    "message": "The request requires the verifications scope"
  }
}`,
      codeExamples: {
        curl: `curl -X GET "${API_CONFIG.API_BASE_URL}/verifications" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`,
        javascript: `const response = await fetch("${API_CONFIG.API_BASE_URL}/verifications", {
  method: "GET",
  headers: {
    "Accept": "application/json",
    "Authorization": \`Bearer \${accessToken}\`
  }
});

const data = await response.json();
const { id_verified, face_match } = data.data.verifications;

if (id_verified && face_match > 0.9) {
  console.log("User is fully verified!");
}`,
        python: `import requests

response = requests.get(
    "${API_CONFIG.API_BASE_URL}/verifications",
    headers={
        "Accept": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
)

verifications = response.json()["data"]["verifications"]
if verifications["id_verified"] and verifications["face_match"] > 0.9:
    print("User is fully verified!")`,
        php: `<?php
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "${API_CONFIG.API_BASE_URL}/verifications",
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
?>`,
        java: `HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${API_CONFIG.API_BASE_URL}/verifications"))
    .header("Accept", "application/json")
    .header("Authorization", "Bearer " + accessToken)
    .GET()
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());

// Parse verifications from response`,
      },
    },
    {
      id: "endpoint-refresh",
      method: "POST" as const,
      path: "/refresh",
      title: "Refresh Access Token",
      description: "Use your refresh_token to obtain a new access_token. Requires client authentication (client_id + client_secret) and the token must belong to that client. Rotation is on by default: the token you send is revoked and replaced — store the new one. Replaying a rotated-away token revokes every refresh token for that user and client.",
      parameters: [
        { name: "refresh_token", type: "string", required: true, description: "Your current refresh token" },
        { name: "client_id", type: "string", required: true, description: "Your application's client ID" },
        { name: "client_secret", type: "string", required: true, description: "Your client secret (server-side only)" },
        { name: "rotate_refresh", type: "boolean", required: false, description: "Defaults to true. Set false only if you cannot store the replacement token" },
      ],
      requestBody: `{
  "refresh_token": "rfrsh_abc123...",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET"
}`,
      responseExample: `{
  "success": true,
  "data": {
    "tokens": {
      "access_token": "eyJhbGciOi...",
      "token_type": "Bearer",
      "expires_in": 900,
      "refresh_token": "rfrsh_new456..."
    }
  }
}`,
      errorExample: `{
  "success": false,
  "error": {
    "code": "invalid_grant",
    "message": "refresh_token is invalid or expired"
  }
}`,
      codeExamples: {
        curl: `curl -X POST "${API_CONFIG.API_BASE_URL}/refresh" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "refresh_token": "rfrsh_abc123...",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
  }'`,
        javascript: `const response = await fetch("${API_CONFIG.API_BASE_URL}/refresh", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify({
    refresh_token: refreshToken,
    client_id: process.env.VALYD_CLIENT_ID,
    client_secret: process.env.VALYD_CLIENT_SECRET // server-side only
  })
});

const data = await response.json();
const { access_token, refresh_token } = data.data;

// Rotation is on by default: the token you just sent is now revoked.
// Persist the replacement, or the next refresh trips reuse detection.
await saveTokens({ access_token, refresh_token });`,
        python: `import requests

response = requests.post(
    "${API_CONFIG.API_BASE_URL}/refresh",
    json={
        "refresh_token": refresh_token,
        "client_id": os.environ["VALYD_CLIENT_ID"],
        "client_secret": os.environ["VALYD_CLIENT_SECRET"],  # server-side only
    },
    headers={
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
)

tokens = response.json()["data"]
access_token = tokens["access_token"]
# Rotation is on by default - the token you sent is revoked. Store this one.
refresh_token = tokens["refresh_token"]`,
        php: `<?php
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => "${API_CONFIG.API_BASE_URL}/refresh",
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode([
        "refresh_token" => $refreshToken,
        "client_id" => getenv("VALYD_CLIENT_ID"),
        "client_secret" => getenv("VALYD_CLIENT_SECRET"), // server-side only
    ]),
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Accept: application/json"
    ],
    CURLOPT_RETURNTRANSFER => true
]);

$response = curl_exec($ch);
$tokens = json_decode($response, true)["data"];
$accessToken = $tokens["access_token"];
// Rotation is on by default - the token you sent is revoked. Store this one.
$refreshToken = $tokens["refresh_token"];
?>`,
        java: `HttpClient client = HttpClient.newHttpClient();

String body = """
{
    "refresh_token": "%s",
    "client_id": "%s",
    "client_secret": "%s"
}
""".formatted(refreshToken, clientId, clientSecret);

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${API_CONFIG.API_BASE_URL}/refresh"))
    .header("Content-Type", "application/json")
    .header("Accept", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(request, 
    HttpResponse.BodyHandlers.ofString());`,
      },
    },
  ];

  return (
    <div className="space-y-12">
      <section className="scroll-mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">API Reference</h2>
        <p className="text-muted-foreground mb-6">
          All API requests must be made over HTTPS. Endpoints that require authentication
          expect a Bearer token in the Authorization header. If you're using the SDK, prefer the
          typed helpers below — they call these endpoints for you.
        </p>

        {/* SDK methods — added in v0.2.0 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">SDK methods (v0.2.0)</h3>

          <div className="p-5 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <code className="text-primary font-semibold">valyd.createLoginSession()</code>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">New in 0.2.0</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Issues a one-time login session. Call <strong>before</strong> redirecting the user to
              Valyd. Returns <code>{`{ authorizeState, marker }`}</code>.
            </p>
            <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
              <li><strong>authorizeState</strong> — pass as <code>state</code> in <code>getAuthorizationUrl()</code>.</li>
              <li><strong>marker</strong> — HMAC-signed string. Store server-side (httpOnly cookie or session). Never expose to the browser JS.</li>
              <li><strong>TTL</strong> — 10 minutes.</li>
            </ul>
          </div>

          <div className="p-5 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <code className="text-primary font-semibold">valyd.verifyLoginSession(marker)</code>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">New in 0.2.0</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Validates the marker on the callback, <strong>before</strong> <code>exchangeCode</code>.
              Returns <code>{`{ valid: boolean }`}</code>. Never throws on an invalid marker.
            </p>
            <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
              <li>Use this as your CSRF check. Do <strong>not</strong> compare callback <code>state</code> to anything.</li>
              <li>Returns <code>{`{ valid: false }`}</code> for expired, missing, or tampered markers.</li>
            </ul>
          </div>
        </div>
      </section>

      {endpoints.map((endpoint) => (
        <div key={endpoint.id}>
          {endpoint.id === "endpoint-refresh" && (
            <div className="mb-4 flex gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-foreground">
              <svg className="h-4 w-4 shrink-0 mt-0.5 text-primary opacity-70" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold mb-1">When to call this</p>
                <p className="text-muted-foreground">
                  Access tokens expire after <strong>15 minutes</strong> (<code className="font-mono text-xs">expires_in: 900</code>). Call{" "}
                  <code className="font-mono text-xs">POST /refresh</code> before the token expires — don't wait for a 401.
                  In practice: check <code className="font-mono text-xs">expires_in</code> when you store the token and
                  schedule a refresh ~60 s early. This call requires your{" "}
                  <code className="font-mono text-xs">client_id</code> and{" "}
                  <code className="font-mono text-xs">client_secret</code>, so make it from your backend.
                  Rotation is on by default: each refresh returns a new{" "}
                  <code className="font-mono text-xs">refresh_token</code> and revokes the one you sent — always store
                  the replacement. Replaying an old token revokes every refresh token for that user and client.
                </p>
              </div>
            </div>
          )}
          <EndpointCard {...endpoint} />
        </div>
      ))}
    </div>
  );
};

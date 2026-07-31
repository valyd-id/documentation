import { API_CONFIG } from "@/lib/api-config";
import { CodeBlock } from "../CodeBlock";
import { LanguageTabs } from "../LanguageTabs";

export const AuthenticationSection = () => {
  const authUrlExample = `import { ValydClient } from "@valyd/sdk";

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
res.redirect(url);`;

  const callbackExamples = [
    {
      language: "javascript",
      label: "Node (Express + SDK)",
      code: `// Recommended: use the official SDK.
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
});`,
    },
    {
      language: "python",
      label: "Python (Flask)",
      code: `from flask import Flask, request, redirect, session
import requests

app = Flask(__name__)

@app.route("/callback")
def callback():
    code = request.args.get("code")
    if not code:
        return "missing code", 400

    response = requests.post(
        "${API_CONFIG.API_BASE_URL}/token",
        json={
            "grant_type": "authorization_code",
            "client_id": "YOUR_CLIENT_ID",
            "client_secret": "YOUR_CLIENT_SECRET",
            "code": code,
        },
    )
    tokens = response.json()["data"]
    session["access_token"] = tokens["access_token"]
    return redirect("/dashboard")`,
    },
    {
      language: "php",
      label: "PHP",
      code: `<?php
$code = $_GET['code'] ?? null;
if (!$code) { http_response_code(400); exit('missing code'); }

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => '${API_CONFIG.API_BASE_URL}/token',
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
header('Location: /dashboard');`,
    },
    {
      language: "java",
      label: "Java (Spring)",
      code: `@GetMapping("/callback")
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
    rt.postForEntity("${API_CONFIG.API_BASE_URL}/token",
        new HttpEntity<>(body, headers), String.class);
    return ResponseEntity.status(302).header("Location", "/dashboard").build();
}`,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Authorization URL */}
      <section id="auth-url" className="scroll-mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Authorization URL</h2>

        <div className="space-y-6">
          <p className="text-muted-foreground">
            To initiate the login flow, redirect users to the {API_CONFIG.BRAND_NAME} authorization endpoint with your
            client credentials and requested scopes.
          </p>

          {/* URL Structure */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">URL Structure</h3>
            <CodeBlock
              code={`${API_CONFIG.IDP_BASE_URL}/auth?client_id={client_id}&redirect_url={redirect_url}&scope={scopes}`}
              language="text"
            />
          </div>

          {/* Parameters Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Parameter</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Required</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-primary">client_id</td>
                  <td className="px-4 py-3">
                    <span className="text-orange-600 font-medium">Yes</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Your application's Client ID from the Developer Portal
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-primary">redirect_url</td>
                  <td className="px-4 py-3">
                    <span className="text-orange-600 font-medium">Yes</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    The URL to redirect to after authentication (must match registered URL)
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-primary">scope</td>
                  <td className="px-4 py-3">
                    <span className="text-orange-600 font-medium">Yes</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Space-separated list of scopes (URL encoded). Example:{" "}
                    <code className="bg-muted px-1 rounded">profile%20verifications</code>
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-primary">state</td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground font-medium">Optional</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    Pass <code>session.authorizeState</code> from <code>createLoginSession()</code>.{" "}
                    <strong>Not echoed on the callback for TPSSO</strong> — do not use it for CSRF
                    on its own.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Example Code */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Example: Login Button</h3>
            <CodeBlock code={authUrlExample} language="javascript" title="JavaScript" />
          </div>
        </div>
      </section>

      {/* OAuth Flow */}
      <section id="oauth-flow" className="scroll-mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">OAuth2 Flow</h2>

        <div className="space-y-6">
          <p className="text-muted-foreground">
            {API_CONFIG.BRAND_NAME} uses the OAuth2 Authorization Code flow. Here's what happens at each step:
          </p>

          {/* Flow Diagram */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="space-y-6">
              {[
                {
                  step: "1. Issue a login session",
                  description: "Server calls valyd.createLoginSession() and stores the marker (httpOnly cookie or server session).",
                },
                {
                  step: "2. Redirect to Valyd",
                  description: "Server calls valyd.getAuthorizationUrl({ state: session.authorizeState, scope, productName }) and redirects.",
                },
                {
                  step: "3. User consents",
                  description: "Valyd shows the consent screen with the requested scopes and issues a one-time code (valid 5 minutes).",
                },
                {
                  step: "4. Callback hits your server",
                  description: "URL: yourapp.com/callback?code=…&state=<Valyd session id>. Use valyd.parseCallback().",
                },
                {
                  step: "5. CSRF check via login session",
                  description: "valyd.verifyLoginSession(marker) → must return { valid: true }. Do NOT compare callback state.",
                },
                {
                  step: "6. Exchange code → tokens → user",
                  description: "valyd.exchangeCode(code), then valyd.getUserInfo() / getVerifications() / …",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{item.step}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Note */}
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
            <p className="text-blue-700">
              <strong>💡 Important:</strong> The authorization code is valid for only <strong>5 minutes</strong>. Make
              sure your backend exchanges it for tokens immediately after receiving the callback.
            </p>
          </div>
        </div>
      </section>

      {/* Callback Handling */}
      <section id="callback-handling" className="scroll-mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Callback Handling</h2>

        <div className="space-y-6">
          <p className="text-muted-foreground">
            When the user approves the authorization, they are redirected to your registered callback URL with the
            authorization code as a query parameter.
          </p>

          {/* Callback URL Example */}
          <div className="p-6 rounded-lg border border-border bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Callback URL Format</h3>
            <CodeBlock code={`https://yourapp.com/callback?code=AUTH_CODE_HERE`} language="text" />
          </div>

          {/* Query Parameters */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Parameter</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-primary">code</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    The one-time authorization code (valid for 5 minutes).
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-primary">state</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <strong>Valyd's own session id (opaque).</strong> Do not compare to the value
                    you sent on <code>authorize</code>. Use <code>verifyLoginSession(marker)</code>{" "}
                    for CSRF.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Code Examples */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Implementation Examples</h3>
            <LanguageTabs examples={callbackExamples} />
          </div>
        </div>
      </section>
    </div>
  );
};

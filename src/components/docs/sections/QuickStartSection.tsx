import { CodeBlock } from "../CodeBlock";
import { AlertTriangle, Shield, Package, Terminal, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { API_CONFIG } from "@/lib/api-config";

export const QuickStartSection = () => {
  const installCmd = `npm install @valyd/sdk`;

  const quickStartCode = `// server.ts
import { ValydClient } from "@valyd/sdk";

const valyd = new ValydClient({
  clientId: process.env.VALYD_CLIENT_ID!,
  clientSecret: process.env.VALYD_CLIENT_SECRET!,
  redirectUri: process.env.VALYD_REDIRECT_URI!, // e.g. http://localhost:8080/callback
  // baseUrl defaults to ${API_CONFIG.IDP_BASE_URL}
});

// 1. Start a login session before redirecting the user.
//    This issues an HMAC-signed marker you must store server-side.
app.get("/login", async (req, res) => {
  const session = await valyd.createLoginSession();

  // Persist the marker (httpOnly cookie or server session).
  res.cookie("valyd_login", session.marker, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  // 2. Build the authorize URL and redirect.
  const url = valyd.getAuthorizationUrl({
    state: session.authorizeState,
    scope: ["profile", "verifications"],
    productName: "My App",
  });
  res.redirect(url);
});

// 3. Handle the callback.
app.get("/callback", async (req, res) => {
  const { code, error } = valyd.parseCallback(req.url);
  if (error || !code) return res.status(400).send(error ?? "missing code");

  // 4. CSRF check — verify the marker we stored, NOT the callback state.
  const marker = req.cookies.valyd_login;
  const check = await valyd.verifyLoginSession(marker);
  if (!check.valid) return res.status(400).send("Invalid login session");

  // 5. Exchange the code for tokens.
  const tokens = await valyd.exchangeCode(code);

  // 6. Call resource endpoints with the access token.
  const profile = await valyd.getUserInfo(tokens.accessToken);
  const verifications = await valyd.getVerifications(tokens.accessToken);

  res.clearCookie("valyd_login");
  // ...set your own app session and redirect the user.
});`;

  const envExample = `# .env  — no spaces around =
VALYD_CLIENT_ID=9357c59bc1794b4c9efe8823e5878147
VALYD_CLIENT_SECRET=sk_live_a1b2c3d4e5f6...
VALYD_REDIRECT_URI=http://localhost:8080/callback`;

  return (
    <div className="space-y-12">
      {/* Installation */}
      <section id="quick-install" className="scroll-mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" /> Installation
        </h2>
        <p className="text-muted-foreground mb-4">
          The official <code className="bg-muted px-1.5 py-0.5 rounded">@valyd/sdk</code> handles
          the full TPSSO/OAuth2 flow, login sessions for CSRF protection, and typed resource calls.
        </p>

        <CodeBlock code={installCmd} language="bash" title="Install" />

        <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-700 space-y-1">
            <div><strong>Version:</strong> <code>@valyd/sdk</code> latest (<code>^1.5.1</code>) — login sessions, verification, and the workforce Members API all ship in the current release.</div>
            <div><strong>Runtime:</strong> Node.js 18+.</div>
            <div><strong>Server-side only.</strong> Your <code>clientSecret</code> must never reach a browser.</div>
          </div>
        </div>
      </section>

      {/* Quick start */}
      <section id="quick-start" className="scroll-mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary" /> Quick start — Login with Valyd
        </h2>
        <p className="text-muted-foreground mb-4">
          The recommended flow uses <code>createLoginSession</code> on the way out and
          {" "}<code>verifyLoginSession</code> on the way back. The marker is the source of truth for
          CSRF — the OAuth <code>state</code> on the callback is <em>not</em> what you sent.
        </p>

        <CodeBlock code={quickStartCode} language="typescript" title="server.ts" />

        {/* TPSSO state callout */}
        <div className="mt-6 p-5 rounded-lg border-2 border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-bold text-amber-900">TPSSO / OAuth state — read this</h4>
              <p className="text-sm text-amber-900">
                Valyd <strong>does not echo</strong> the <code>state</code> you send on
                {" "}<code>authorize</code>. The <code>state</code> you receive on the callback is
                Valyd's own session id. <strong>Do not</strong> compare them:
              </p>
              <div className="p-2 rounded bg-amber-100/60 text-sm font-mono text-amber-900">
                ❌ if (sentState !== callbackState) // broken for TPSSO
              </div>
              <p className="text-sm text-amber-900">
                Use <code>createLoginSession()</code> before redirect and
                {" "}<code>verifyLoginSession(marker)</code> on the callback for CSRF.{" "}
                <Link to="/docs/login-sessions" className="underline font-semibold">
                  Read the full explanation →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Flow table */}
      <section id="quick-flow" className="scroll-mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">The flow at a glance</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Step</th>
                <th className="text-left px-4 py-3 font-medium">What</th>
                <th className="text-left px-4 py-3 font-medium">SDK method</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["1", "Start login, store marker", "createLoginSession()"],
                ["2", "Redirect to Valyd", "getAuthorizationUrl()"],
                ["3", "Read callback query", "parseCallback()"],
                ["4", "CSRF check", "verifyLoginSession(marker)"],
                ["5", "Get tokens", "exchangeCode(code)"],
                ["6", "User data", "getUserInfo(), getVerifications(), …"],
              ].map(([s, w, m]) => (
                <tr key={s} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{s}</td>
                  <td className="px-4 py-3 text-foreground">{w}</td>
                  <td className="px-4 py-3 font-mono text-primary">{m}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Env setup */}
      <section id="quick-env" className="scroll-mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" /> Environment & app setup
        </h2>
        <div className="border border-border rounded-lg overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Item</th>
                <th className="text-left px-4 py-3 font-medium">Rule</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["VALYD_CLIENT_ID", "From the dev portal."],
                ["VALYD_CLIENT_SECRET", "Server-side only. Never bundle into the browser."],
                ["VALYD_REDIRECT_URI", "Must match the portal value exactly (no trailing slash)."],
                ["Local dev", "e.g. http://localhost:8080/callback — also register in the portal."],
                ["Scopes", "Enable in the portal: profile, verifications, doctor_license, zkp, mcp."],
              ].map(([k, v]) => (
                <tr key={k} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-primary whitespace-nowrap">{k}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CodeBlock code={envExample} language="bash" title=".env (KEY=value — no spaces around =)" />
      </section>
    </div>
  );
};

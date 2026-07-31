import { ShieldCheck, Globe, Server } from "lucide-react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { VERIFY_CONFIG } from "@/lib/verify-config";

export const IntroSection = () => (
  <section id="intro" className="scroll-mt-8 space-y-6">
    <div>
      <h1 className="text-4xl font-bold text-foreground">Verification APIs</h1>
      <p className="text-lg text-muted-foreground mt-4 max-w-3xl">
        Verification APIs has <strong>two API types</strong> — <strong>Account (Managed by Valyd)</strong>,
        where the user has a Valyd account and their verified identity is stored and reused, and{" "}
        <strong>Non-account (Fresh)</strong>, a one-shot check with nothing retained. Each is available
        two ways: <strong>Hosted</strong> (Valyd renders the capture page) or <strong>Core APIs</strong>{" "}
        (you call REST directly with your own UI).
      </p>
    </div>

    {/* The 2×2 */}
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left px-4 py-3 font-medium"></th>
            <th className="text-left px-4 py-3 font-medium">Hosted</th>
            <th className="text-left px-4 py-3 font-medium">Core APIs</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-border">
            <td className="px-4 py-3 font-medium text-foreground">
              Account<br />
              <span className="text-xs text-muted-foreground">Managed by Valyd</span>
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              Login with Valyd → run a workflow on the hosted page. Steps are stored on the account and
              reuse skips already-done steps. <strong>Proofs only.</strong>
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              Call REST with the user's token — license (badge on the account), face (vs their stored
              vector), reuse read. KYC redirects to Valyd. <strong>Proofs only.</strong>
            </td>
          </tr>
          <tr className="border-t border-border">
            <td className="px-4 py-3 font-medium text-foreground">
              Non-account<br />
              <span className="text-xs text-muted-foreground">Fresh</span>
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              One-shot hosted capture, nothing retained. <strong>Raw data.</strong>
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              Per-endpoint REST capture in your own UI. <strong>Raw data.</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground">
      <strong className="text-foreground">Data-sharing rule.</strong> Account APIs return{" "}
      <strong>proofs only</strong> — a pseudonym, <code>id_verified</code>, verified license badges and
      age bands — and <strong>never</strong> raw KYC (legal name, date of birth, document images). Raw
      account attributes are released solely through the <strong>consent Core API</strong>, where the user
      approves the release in their Valyd app and the values are sealed to your public key. Non-account
      (Fresh) APIs return the captured <strong>raw data as-is</strong> — you did the capture and Valyd
      retains nothing.
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-5 rounded-lg border border-border bg-card">
        <Globe className="h-6 w-6 text-primary mb-2" />
        <h3 className="font-semibold text-foreground">Hosted</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Redirect your user to Valyd's hosted page for ID + selfie capture. Receive the
          result via a signed webhook and a decision API call. No UI to build.
        </p>
      </div>
      <div className="p-5 rounded-lg border border-border bg-card">
        <Server className="h-6 w-6 text-primary mb-2" />
        <h3 className="font-semibold text-foreground">Core APIs</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Call per-capability REST endpoints server-to-server with your own UI and data.
          Synchronous JSON result returned on the same request.
        </p>
      </div>
    </div>

    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" /> Services
      </h3>
      <ul className="text-sm text-muted-foreground grid sm:grid-cols-2 gap-2">
        <li><code className="bg-muted px-1.5 py-0.5 rounded">id_verification</code> — KYC / OCR from a government ID</li>
        <li><code className="bg-muted px-1.5 py-0.5 rounded">liveness</code> — passive liveness check</li>
        <li><code className="bg-muted px-1.5 py-0.5 rounded">face_match</code> — selfie vs ID portrait</li>
        <li><code className="bg-muted px-1.5 py-0.5 rounded">age</code> — age band checks from DOB</li>
        <li><code className="bg-muted px-1.5 py-0.5 rounded">credential</code> — professional license lookup</li>
      </ul>
    </div>

    <div className="p-6 rounded-lg border border-border bg-card">
      <h3 className="font-semibold text-foreground mb-3">Base URL</h3>
      <CodeBlock code={VERIFY_CONFIG.API_BASE_URL} language="text" />
      <h3 className="font-semibold text-foreground mt-6 mb-3">Response envelope</h3>
      <CodeBlock
        code={`{
  "success": true,
  "data": { /* ... */ },
  "error": { "code": "string", "message": "string" } // only when success=false
}`}
        language="json"
      />
    </div>
  </section>
);

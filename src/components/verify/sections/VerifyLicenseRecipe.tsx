import { AlertTriangle, Info } from "lucide-react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { VERIFY_CONFIG } from "@/lib/verify-config";

const BASE = VERIFY_CONFIG.API_BASE_URL;

const Callout = ({
  type,
  children,
}: {
  type: "warning" | "info";
  children: React.ReactNode;
}) => {
  const styles = {
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    info:    "bg-primary/5 border-primary/20 text-foreground",
  };
  const Icon = { warning: AlertTriangle, info: Info }[type];
  return (
    <div className={`flex gap-3 rounded-lg border p-4 text-sm leading-relaxed ${styles[type]}`}>
      <Icon className="h-4 w-4 shrink-0 mt-0.5 opacity-70" />
      <div>{children}</div>
    </div>
  );
};

const Step = ({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: number;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-8 space-y-4">
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-background text-sm font-bold">
        {n}
      </span>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
    </div>
    <div className="space-y-4 pl-11">{children}</div>
  </section>
);

export const VerifyLicenseRecipe = () => (
  <div className="space-y-12">
    {/* ── Header ── */}
    <div id="vl-overview" className="scroll-mt-8 space-y-3 pb-6 border-b border-border">
      <div className="text-xs font-semibold uppercase tracking-wider text-primary">Recipe</div>
      <h1 className="text-3xl font-bold text-foreground">Verify a professional license</h1>
      <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
        Use Valyd's Core credential-verification API to check whether a professional license
        (medical, nursing, law, engineering, and more) is active and belongs to the person you
        expect. No hosted flow required — your backend calls the API directly and returns the
        result.
      </p>
      <div className="flex flex-wrap gap-2 text-xs">
        {["~15 min", "Express / Node.js", "server-side only"].map((tag) => (
          <span key={tag} className="rounded-full bg-muted border border-border px-3 py-1 font-mono text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
    </div>

    {/* ── Prerequisites ── */}
    <section id="vl-prereqs" className="scroll-mt-8 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Prerequisites</h2>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground w-1/3">Variable</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Where to get it</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["VALYD_API_KEY", "Developer Portal → your Verify project → API key (shown once)"],
            ].map(([v, where]) => (
              <tr key={v} className="border-t border-border">
                <td className="px-4 py-2 font-mono text-xs">{v}</td>
                <td className="px-4 py-2 text-muted-foreground">{where}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock language="bash" title=".env" code={`VALYD_API_KEY=your_api_key`} />
    </section>

    {/* ── Step 1 ── */}
    <Step id="vl-discover" n={1} title="Discover providers (optional)">
      <p className="text-sm text-muted-foreground leading-relaxed">
        If you don't yet know which provider (licensing board) covers your user's license type and
        state, use the discovery endpoints. These are read-only and can be called at setup time
        or cached — they don't change often.
      </p>
      <CodeBlock language="bash" title="1a — list all supported states" code={`curl ${BASE}/api/v2/credential/states \\
  -H "X-API-Key: $VALYD_API_KEY"`} />
      <CodeBlock language="json" title="Response" code={`{
  "states": [
    { "state": "CA", "name": "California", "provider_count": 14 },
    { "state": "NY", "name": "New York",   "provider_count": 11 }
  ]
}`} />
      <CodeBlock language="bash" title="1b — list providers for a state" code={`curl ${BASE}/api/v2/credential/states/CA/providers \\
  -H "X-API-Key: $VALYD_API_KEY"`} />
      <CodeBlock language="json" title="Response (excerpt)" code={`{
  "providers": [
    {
      "provider_id": "ca_medical_board",
      "name":        "California Medical Board",
      "license_types": ["MD", "DO", "PA"]
    },
    {
      "provider_id": "ca_board_rn",
      "name":        "California Board of Registered Nursing",
      "license_types": ["RN", "NP", "LVN"]
    }
  ]
}`} />
      <Callout type="info">
        You don't need to pass a <code className="font-mono text-xs">provider_id</code> to the
        verification endpoint — Valyd resolves the correct board from the{" "}
        <code className="font-mono text-xs">license_type</code> and{" "}
        <code className="font-mono text-xs">license_state</code> automatically. The discovery
        endpoints are useful when you want to present a provider-aware UI to the user.
      </Callout>
    </Step>

    {/* ── Step 2 ── */}
    <Step id="vl-verify" n={2} title="Submit the verification">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Call <code className="font-mono text-xs">POST /api/v2/credential-verification</code> — just
        <strong> state + license type (default MD) + number</strong>. No <code className="font-mono text-xs">provider_code</code>;
        Valyd resolves the board. The check runs synchronously (10–60 s) — set your timeout to at least 90 s.
      </p>
      <CodeBlock language="javascript" title="Valyd SDK (recommended)" code={`import { VerifyClient } from "@valyd/sdk";
const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY, timeoutMs: 90_000 });

const { check } = await verify.standalone.credentialVerification({
  licenseState:  "CA",
  licenseType:   "MD",        // default MD; provider auto-resolved — no provider_code
  licenseNumber: "G12345",
  fullName:      "Jane Smith", // the board matches on name + number
});
// check.status === "passed" · check.data.license.status ("active" | "expired" | …)`} />
      <CodeBlock language="javascript" title="Node.js (fetch)" code={`const response = await fetch(
  "${BASE}/api/v2/credential-verification",
  {
    method:  "POST",
    headers: {
      "X-API-Key":     process.env.VALYD_API_KEY!,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      first_name:     "Jane",
      last_name:      "Smith",
      license_type:   "MD",
      license_state:  "CA",
      license_number: "G12345",
    }),
    signal: AbortSignal.timeout(90_000),
  }
);

const result = await response.json();`} />
      <CodeBlock language="bash" title="cURL" code={`curl -X POST ${BASE}/api/v2/credential-verification \\
  -H "X-API-Key: $VALYD_API_KEY" \\
  -H "Content-Type: application/json" \\
  --max-time 90 \\
  -d '{
    "first_name":     "Jane",
    "last_name":      "Smith",
    "license_type":   "MD",
    "license_state":  "CA",
    "license_number": "G12345"
  }'`} />
      <Callout type="warning">
        This endpoint is <strong>server-side only</strong>. Never call it from the browser —
        your API key would be exposed. Have the user submit their license details to your backend
        and call Valyd from there.
      </Callout>
    </Step>

    {/* ── Step 3 ── */}
    <Step id="vl-result" n={3} title="Read the result">
      <p className="text-sm text-muted-foreground leading-relaxed">
        A successful response includes a top-level <code className="font-mono text-xs">status</code>{" "}
        and a <code className="font-mono text-xs">checks</code> array with per-check details. Act
        on <code className="font-mono text-xs">status</code>; inspect{" "}
        <code className="font-mono text-xs">checks</code> for error detail or additional data.
      </p>
      <CodeBlock language="json" title="Approved response" code={`{
  "verification_id": "ver_…",
  "status": "APPROVED",
  "checks": [
    {
      "type":   "credential",
      "status": "passed",
      "data": {
        "license_status": "active",
        "expiry_date":    "2026-12-31",
        "name_match":     true
      }
    }
  ]
}`} />
      <CodeBlock language="json" title="Declined response" code={`{
  "verification_id": "ver_…",
  "status": "DECLINED",
  "checks": [
    {
      "type":   "credential",
      "status": "failed",
      "error": {
        "code":    "name_mismatch",
        "message": "License belongs to a different name"
      }
    }
  ]
}`} />
      <CodeBlock language="javascript" title="Handle in Node.js" code={`if (result.status === "APPROVED") {
  // Grant access — store the verification_id against the user record
  await db.users.update(userId, {
    verificationId: result.verification_id,
    licenseVerified: true,
  });
} else {
  // Surface a user-friendly message — don't expose raw error codes
  const check = result.checks.find(c => c.type === "credential");
  const reason = check?.error?.code ?? "unknown";
  // e.g. "name_mismatch", "license_not_found", "license_expired", "license_inactive"
  throw new VerificationError(reason);
}`} />
    </Step>

    {/* ── Status reference ── */}
    <section id="vl-statuses" className="scroll-mt-8 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Status reference</h2>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground w-1/4">status</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Meaning</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["APPROVED", "License is active and the name matches.", "Grant access."],
              ["DECLINED", "License not found, expired, inactive, or name doesn't match.", "Inspect checks[].error.code for the specific reason."],
              ["IN_REVIEW", "Board returned data that requires manual review.", "Wait for a follow-up webhook or poll until terminal."],
            ].map(([status, meaning, action]) => (
              <tr key={status} className="border-t border-border align-top">
                <td className="px-4 py-3 font-mono text-xs">{status}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{meaning}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="font-semibold text-foreground mt-6">Decline error codes</h3>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground w-1/3">error.code</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">What it means</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["license_not_found", "No license matching that number + state + type was found."],
              ["license_expired", "The license number was found but is past its expiry date."],
              ["license_inactive", "The license exists but has been suspended, revoked, or lapsed."],
              ["name_mismatch", "The license is valid but registered to a different person."],
              ["board_unavailable", "The licensing board's system was unreachable. Retry in a few minutes."],
            ].map(([code, meaning]) => (
              <tr key={code} className="border-t border-border">
                <td className="px-4 py-2 font-mono text-xs">{code}</td>
                <td className="px-4 py-2 text-muted-foreground text-xs">{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    {/* ── Common errors ── */}
    <section id="vl-errors" className="scroll-mt-8 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Common errors</h2>
      <div className="space-y-3">
        {[
          {
            title: "408 / timeout",
            cause: "HTTP client timeout shorter than the board response time.",
            fix: "Set your HTTP client timeout to at least 90 seconds. Most boards respond in under 30 s, but some run slower.",
          },
          {
            title: "400 invalid_license_type",
            cause: "The license_type value isn't supported for the given state.",
            fix: "Call GET /api/v2/credential/states/{state}/providers to see which license types are supported for that state.",
          },
          {
            title: "401 Unauthorized",
            cause: "X-API-Key is missing or incorrect.",
            fix: "Check VALYD_API_KEY is set and matches the API key of your Verify project in the Developer Portal. Confirm the key is for the correct environment (sandbox vs. production).",
          },
          {
            title: "Exposing results to the browser",
            cause: "Calling the endpoint client-side or forwarding the raw Valyd response to the frontend.",
            fix: "Keep all Valyd API calls server-side. Only send your own derived result (granted / denied) to the browser — never raw check data or error codes.",
          },
        ].map(({ title, cause, fix }) => (
          <div key={title} className="rounded-lg border border-border p-4 space-y-1">
            <p className="font-medium text-foreground text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/80">Cause:</span> {cause}
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/80">Fix:</span> {fix}
            </p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

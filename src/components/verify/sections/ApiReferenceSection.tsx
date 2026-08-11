import { CodeBlock } from "@/components/docs/CodeBlock";
import { VERIFY_CONFIG } from "@/lib/verify-config";
import { Code, AlertTriangle } from "lucide-react";
import type { VerifyMode } from "../ModeSwitch";
import { DemoEndpointsSection } from "./DemoEndpointsSection";

const BASE = VERIFY_CONFIG.API_BASE_URL;

const Row = ({ method, path, desc }: { method: string; path: string; desc: string }) => (
  <tr className="border-t border-border">
    <td className="px-4 py-2"><span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">{method}</span></td>
    <td className="px-4 py-2 font-mono text-xs">{path}</td>
    <td className="px-4 py-2 text-sm text-muted-foreground">{desc}</td>
  </tr>
);

export const ApiReferenceSection = ({ mode }: { mode: VerifyMode }) => (
  <div className="space-y-12">
    {mode === "hosted" && (
    <section id="api-sessions" className="scroll-mt-8 space-y-4">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Code className="h-6 w-6 text-primary" /> Sessions
      </h2>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            <Row method="POST"  path="/api/v2/session" desc="Create a hosted verification session" />
            <Row method="GET"   path="/api/v2/session" desc="List sessions" />
            <Row method="GET"   path="/api/v2/session/{id}" desc="Retrieve a session" />
            <Row method="PATCH" path="/api/v2/session/{id}/status" desc="Manual override: { status: APPROVED | DECLINED }" />
          </tbody>
        </table>
      </div>
    </section>
    )}

    {mode === "hosted" && (
    <section id="api-workflows" className="scroll-mt-8 space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Workflows</h2>
      <p className="text-sm text-muted-foreground">
        A workflow bundles services (id_verification, liveness, face_match, face_uniqueness,
        age, credential) and exposes a stable <code>workflow_id</code> you pass when creating a
        session. Create them in the Developer Portal, or manage them over the API:
      </p>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            <Row method="GET"    path="/api/v2/workflows" desc="List workflows" />
            <Row method="POST"   path="/api/v2/workflows" desc="Create a workflow" />
            <Row method="GET"    path="/api/v2/workflows/{id}" desc="Retrieve a workflow" />
            <Row method="PATCH"  path="/api/v2/workflows/{id}" desc="Update a workflow" />
            <Row method="DELETE" path="/api/v2/workflows/{id}" desc="Delete a workflow" />
          </tbody>
        </table>
      </div>
    </section>
    )}

    {mode === "standalone" && (
    <section id="api-standalone" className="scroll-mt-8 space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Core checks</h2>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            <Row method="POST" path="/api/v2/id-verification" desc="OCR + authenticity from a government ID" />
            <Row method="POST" path="/api/v2/liveness" desc="Passive liveness from a selfie" />
            <Row method="POST" path="/api/v2/face-match" desc="Selfie vs reference portrait" />
            <Row method="POST" path="/api/v2/face-uniqueness" desc="One face = one user — single-click (selfie) or live (frames burst) enroll-or-match, returns a stable valyd_uuid" />
            <Row method="DELETE" path="/api/v2/face-uniqueness/{valyd_uuid}" desc="GDPR unlink; deletes the template when no links remain" />
            <Row method="POST" path="/api/v2/age-verification" desc="Age bands from a DOB" />
            <Row method="POST" path="/api/v2/credential-verification" desc="Professional license lookup" />
            <Row method="POST" path="/api/v2/location" desc="Mandatory GPS fix; with an expected point + radius_m the status is the geofence verdict" />
            <Row method="POST" path="/api/v2/kyc-credential" desc="ID + liveness + face match, then license matched to the OCR'd name (one call)" />
          </tbody>
        </table>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            <Row method="GET" path="/api/v2/credential/states" desc="List supported states/regions for credentials" />
            <Row method="GET" path="/api/v2/credential/states/{state}/providers" desc="License types + providers for a state" />
          </tbody>
        </table>
      </div>
    </section>
    )}

    {mode === "hosted" && (
    <section id="api-decision" className="scroll-mt-8 space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Decision</h2>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            <Row method="GET" path="/api/v2/session/{id}/decision" desc="Full decision and per-check data" />
          </tbody>
        </table>
      </div>
      <CodeBlock
        language="bash"
        code={`curl ${BASE}/api/v2/session/SES_ID/decision -H "X-API-Key: $VALYD_API_KEY"`}
      />
    </section>
    )}

    <DemoEndpointsSection />

    <section id="api-errors" className="scroll-mt-8 space-y-4">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <AlertTriangle className="h-6 w-6 text-primary" /> Errors & rate limits
      </h2>
      <p className="text-sm text-muted-foreground">
        Errors use the same envelope with <code>success: false</code> and an HTTP status that
        reflects the error class.
      </p>
      <CodeBlock
        language="json"
        code={`{
  "success": false,
  "error": { "code": "invalid_api_key", "message": "API key is missing or invalid" }
}`}
      />
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">HTTP</th>
              <th className="text-left px-4 py-3 font-medium">Code</th>
              <th className="text-left px-4 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["400", "validation_error", "Malformed body or missing required field"],
              ["401", "invalid_api_key", "Missing/invalid X-API-Key header"],
              ["404", "not_found", "Session or resource does not exist"],
              ["422", "unprocessable", "Could not process the input (e.g. unreadable image)"],
              ["429", "rate_limited", "Public/demo endpoints rate limit exceeded"],
              ["500", "internal_error", "Unexpected server error — safe to retry"],
            ].map(([h, c, w]) => (
              <tr key={c} className="border-t border-border">
                <td className="px-4 py-3 font-mono">{h}</td>
                <td className="px-4 py-3 font-mono text-primary">{c}</td>
                <td className="px-4 py-3 text-muted-foreground">{w}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">
        Authenticated endpoints are billed per call against your App. Public/demo endpoints
        return HTTP 429 with <code>code: "rate_limited"</code> when limits are exceeded.
      </p>
    </section>
  </div>
);

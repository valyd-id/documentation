import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { LanguageTabs } from "@/components/docs/LanguageTabs";
import { HostedFlowDiagram } from "../HostedFlowDiagram";
import { VERIFY_CONFIG } from "@/lib/verify-config";
import {
  Globe,
  ShieldCheck,
  IdCard,
  AlertTriangle,
  Webhook,
  FileCheck2,
  ListChecks,
  Code,
} from "lucide-react";

const BASE = VERIFY_CONFIG.API_BASE_URL;

const ProductCard = ({
  icon,
  title,
  badge,
  services,
  flow,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge: string;
  services: string;
  flow: string;
  children?: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-soft hover:shadow-elegant transition-smooth">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-primary">{icon}</span>
      <h4 className="font-semibold text-foreground">{title}</h4>
      <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-primary/10 text-primary">
        {badge}
      </span>
    </div>
    <div className="text-sm text-muted-foreground space-y-2">
      <p>
        <span className="font-medium text-foreground">Services:</span>{" "}
        <code className="text-xs">{services}</code>
      </p>
      <p>
        <span className="font-medium text-foreground">Hosted flow:</span> {flow}
      </p>
      {children}
    </div>
  </div>
);

const Step = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <div className="relative pl-12">
    <div className="absolute left-0 top-0 h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
      {n}
    </div>
    <h4 className="text-lg font-semibold text-foreground mb-2">{title}</h4>
    <div className="space-y-3">{children}</div>
  </div>
);

const SubHeading = ({ id, icon, children }: { id: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <h3 id={id} className="scroll-mt-8 text-xl font-semibold text-foreground flex items-center gap-2 pt-2">
    {icon}
    {children}
  </h3>
);

export const HostedSection = () => (
  <section id="hosted" className="scroll-mt-8 space-y-10">
    {/* Title + persistent callout */}
    <div className="space-y-3">
      <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
        <Globe className="h-7 w-7 text-primary" /> Hosted Verification
      </h2>
      <p className="text-muted-foreground">
        Create a session, redirect the user to a Valyd-hosted page that captures everything, and
        receive the result via a signed webhook plus the decision API. No UI to build, no PII
        handled by you.
      </p>
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground">
        <strong className="text-foreground">This page covers Non-account (Fresh) hosted.</strong> No
        Valyd login, nothing retained, and the decision returns the <strong>raw</strong> captured data.
        If you want the user's result stored on their Valyd account and reused (returning users verify
        with a selfie only, and you receive <strong>proofs only</strong>), use{" "}
        <a href="?mode=managed#managed" className="text-primary hover:underline">Account · Managed by
        Valyd</a> — the same hosted page, but you pass the user's <code>valyd_access_token</code> when
        creating the session.
      </div>

      {/* How the fresh hosted flow actually runs */}
      <div id="hosted-flow" className="scroll-mt-8 space-y-4 pt-2">
        <h3 className="text-xl font-bold text-foreground">How the hosted flow works</h3>
        <p className="text-sm text-muted-foreground">
          End to end, who does what — from creating the session to acting on the result.
        </p>
        <HostedFlowDiagram variant="fresh" />
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-foreground">
          All server-to-server calls use <code>X-API-Key: &lt;App API key&gt;</code>. Keep this key{" "}
          <strong>server-side only</strong> — never expose it to the browser. Every response uses
          the envelope <code>{`{ success, data, error: { code, message } }`}</code>.
        </p>
      </div>
    </div>

    {/* SDK install */}
    <div id="hosted-overview" className="scroll-mt-8 space-y-3">
      <SubHeading id="hosted-overview-h" icon={<Code className="h-5 w-5 text-primary" />}>
        Overview & SDK install
      </SubHeading>
      <p className="text-sm text-muted-foreground">
        The official Node SDK is{" "}
        <a
          href="https://www.npmjs.com/package/@valyd/sdk"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          <code>@valyd/sdk</code>
        </a>
        . It wraps sessions, workflows, webhooks, and the decision API.
      </p>
      <CodeBlock language="bash" code={`npm i @valyd/sdk`} />
      <CodeBlock
        language="javascript"
        code={`import { VerifyClient } from "@valyd/sdk";

const verify = new VerifyClient({
  apiKey:        process.env.VALYD_API_KEY!,
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET!, // used by verify.webhooks.constructEvent
});`}
      />
      <p className="text-sm text-muted-foreground">
        Hosted flow at a glance:
      </p>
      <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
        <li>Create a session on your server with a <code>workflow_id</code>.</li>
        <li>Redirect the user's browser to the returned <code>url</code>.</li>
        <li>Valyd captures everything and redirects back to your <code>redirect_url</code>.</li>
        <li>Receive a signed webhook, then fetch the authoritative result from the decision API.</li>
      </ol>
    </div>

    {/* Two products */}
    <div id="hosted-products" className="scroll-mt-8 space-y-4">
      <SubHeading id="hosted-products-h" icon={<ShieldCheck className="h-5 w-5 text-primary" />}>
        The two hosted products
      </SubHeading>
      <p className="text-sm text-muted-foreground">
        Both products use the <strong>same integration code</strong> — only the{" "}
        <code>workflow_id</code> differs. Create the workflow in the{" "}
        <a href={VERIFY_CONFIG.CONSOLE_URL} target="_blank" rel="noreferrer" className="text-primary hover:underline">
          Developer Portal
        </a>{" "}
        (Workflows → "License Verification" or "KYC + License" preset) or via the API, then copy
        its <code>workflow_id</code>.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <ProductCard
          icon={<FileCheck2 className="h-5 w-5" />}
          title="License Verification"
          badge="Credential only"
          services="[credential]"
          flow="State → license type → name + license number → verify."
        >
          <p>Fastest path to verify a professional license. No ID scan required.</p>
        </ProductCard>
        <ProductCard
          icon={<IdCard className="h-5 w-5" />}
          title="KYC + License"
          badge="Identity + Credential"
          services="[id_verification, liveness, face_match, credential]"
          flow="Scan ID + selfie (OCR + liveness + 1:1 face match), then state + license type + license number."
        >
          <p className="text-foreground">
            The name is taken from the <strong>verified ID automatically</strong> (the user doesn't
            type it), so a license belonging to a different person is rejected.
          </p>
        </ProductCard>
      </div>
    </div>

    {/* Integration steps */}
    <div id="hosted-steps" className="scroll-mt-8 space-y-6">
      <SubHeading id="hosted-steps-h" icon={<ListChecks className="h-5 w-5 text-primary" />}>
        Integration steps
      </SubHeading>
      <p className="text-sm text-muted-foreground">
        Identical for both products. Swap the <code>workflow_id</code> to switch between License
        Verification and KYC + License.
      </p>

      <Step n={1} title="Create a session (server-side)">
        <p className="text-sm text-muted-foreground">
          POST <code>/api/v2/session</code> from your backend. The response includes the hosted{" "}
          <code>url</code> you'll send the user to.
        </p>
        <LanguageTabs
          examples={[
            {
              language: "bash",
              label: "cURL",
              code: `curl -X POST ${BASE}/api/v2/session \\
  -H "X-API-Key: $VALYD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflow_id":  "wf_…",
    "redirect_url": "https://app.example.com/verify/callback",
    "callback":     "https://api.example.com/webhooks/valyd",
    "vendor_data":  "user_123",
    "ttl_seconds":  900,
    "metadata":     { "plan": "pro" }
  }'`,
            },
            {
              language: "javascript",
              label: "SDK (Node)",
              code: `const session = await verify.sessions.create({
  workflowId:  process.env.VALYD_WORKFLOW_ID!, // license-only OR kyc+license workflow
  redirectUrl: "https://app.example.com/verify/callback",
  callback:    "https://api.example.com/webhooks/valyd",
  vendorData:  "user_123",          // your internal ref — echoed back on the webhook
  ttlSeconds:  900,
  metadata:    { plan: "pro" },
});

// session.url       → redirect the user here
// session.session_id, session.session_token, session.expires_at`,
            },
          ]}
        />
        <CodeBlock
          language="json"
          title="Response (data)"
          code={`{
  "session_id":    "ses_…",
  "status":        "NOT_STARTED",
  "url":           "${BASE}/s/…",
  "session_token": "stk_…",
  "features":      ["id_verification","liveness","face_match","credential"],
  "redirect_url":  "https://app.example.com/verify/callback",
  "expires_at":    "2026-06-11T12:00:00Z"
}`}
        />
      </Step>

      <Step n={2} title="Redirect the user to the hosted page">
        <p className="text-sm text-muted-foreground">
          Send the user's browser to <code>data.url</code>. Valyd handles the entire capture and
          verification UI; the steps auto-adapt to the workflow's services.
        </p>
        <CodeBlock
          language="javascript"
          code={`// Express
app.post("/start-verification", async (req, res) => {
  const session = await verify.sessions.create({
    workflowId:  process.env.VALYD_WORKFLOW_ID!,
    redirectUrl: \`\${process.env.APP_URL}/verify/callback\`,
    callback:    \`\${process.env.APP_URL}/webhooks/valyd\`,
    vendorData:  req.user.id,
  });
  res.redirect(session.url);
});`}
        />
      </Step>

      <Step n={3} title="Handle the redirect back">
        <p className="text-sm text-muted-foreground">
          When the user finishes (or abandons), Valyd redirects to{" "}
          <code>redirect_url?session_id=…&status=…</code>. Treat <code>status</code> as a{" "}
          <strong>hint only</strong> — always fetch the authoritative decision in step 4.
        </p>
        <CodeBlock
          language="javascript"
          code={`app.get("/verify/callback", async (req, res) => {
  const { session_id } = req.query;
  // Don't trust ?status= — confirm via the decision API or webhook.
  res.redirect(\`/verify/pending?s=\${session_id}\`);
});`}
        />
      </Step>

      <Step n={4} title="Get the authoritative result">
        <p className="text-sm text-muted-foreground">
          Use the signed webhook (push) and/or call the decision endpoint (pull). See below.
        </p>
      </Step>
    </div>

    {/* Webhooks */}
    <div id="hosted-webhooks" className="scroll-mt-8 space-y-4">
      <SubHeading id="hosted-webhooks-h" icon={<Webhook className="h-5 w-5 text-primary" />}>
        Webhooks
      </SubHeading>
      <p className="text-sm text-muted-foreground">
        On a terminal session, Valyd POSTs to your <code>callback</code> URL with these headers:
      </p>
      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
        <li><code>X-Valyd-Timestamp</code> — unix seconds the request was signed.</li>
        <li><code>X-Valyd-Event-Id</code> — unique event id (use to dedupe).</li>
        <li>
          <code>X-Valyd-Signature</code> —{" "}
          <code>hmac_sha256(`${"${timestamp}"}.${"${rawBody}"}`, webhook_signing_secret)</code>, lowercase hex.
        </li>
      </ul>
      <p className="text-sm text-muted-foreground">
        Verify against the <strong>raw request body</strong> (no JSON re-serialisation), use a
        constant-time compare, and reject stale timestamps (e.g. &gt; 5 minutes old).
      </p>
      <CodeBlock
        language="json"
        title="Body"
        code={`{
  "event_id":    "evt_…",
  "type":        "verification.approved",   // verification.declined | .in_review | .abandoned | .expired
  "session_id":  "ses_…",
  "status":      "APPROVED",
  "vendor_data": "user_123",
  "decision":    { /* same shape as the decision API */ },
  "occurred_at": "2026-06-11T12:05:00Z"
}`}
      />
      <LanguageTabs
        examples={[
          {
            language: "javascript",
            label: "SDK (Node)",
            code: `import express from "express";
import { VerifyClient, ValydVerifyError } from "@valyd/sdk";

const verify = new VerifyClient({
  apiKey:        process.env.VALYD_API_KEY!,
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET!,
});

// IMPORTANT: use raw body for signature verification
app.post(
  "/webhooks/valyd",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = verify.webhooks.constructEvent(req.body, req.headers);
      // event.session_id, event.type, event.status, event.decision, event.vendor_data
      await persistDecision(event);
      res.json({ ok: true });
    } catch (err) {
      if (err instanceof ValydVerifyError && err.code === "invalid_signature") {
        return res.status(400).send("bad signature");
      }
      throw err;
    }
  }
);`,
          },
          {
            language: "javascript",
            label: "Manual verify (Node)",
            code: `import crypto from "node:crypto";

function verifyValydSignature(rawBody, headers, secret) {
  const ts  = headers["x-valyd-timestamp"];
  const sig = headers["x-valyd-signature"];
  if (!ts || !sig) throw new Error("missing signature headers");

  // Reject stale (> 5 min)
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) {
    throw new Error("stale timestamp");
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(\`\${ts}.\${rawBody}\`)
    .digest("hex");

  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(sig, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("invalid signature");
  }
}`,
          },
        ]}
      />
      <p className="text-sm text-muted-foreground">
        The webhook is a <strong>notification</strong>. For the full check breakdown, call the
        decision endpoint below.
      </p>
      <p className="text-sm text-muted-foreground">
        <strong>Delivery:</strong> respond <code>2xx</code> fast (defer heavy work to a queue).
        Non-2xx responses are retried with exponential backoff; use <code>X-Valyd-Event-Id</code>{" "}
        to dedupe.
      </p>
    </div>

    {/* Decision */}
    <div id="hosted-decision" className="scroll-mt-8 space-y-4">
      <SubHeading id="hosted-decision-h" icon={<ShieldCheck className="h-5 w-5 text-primary" />}>
        Reading the decision
      </SubHeading>
      <LanguageTabs
        examples={[
          {
            language: "bash",
            label: "cURL",
            code: `curl ${BASE}/api/v2/session/ses_…/decision \\
  -H "X-API-Key: $VALYD_API_KEY"`,
          },
          {
            language: "javascript",
            label: "SDK (Node)",
            code: `const d = await verify.sessions.decision(sessionId);

// d.status     → "APPROVED" | "DECLINED" | "IN_REVIEW"
// d.decision   → "APPROVED" | "DECLINED" (final business outcome)
// d.checks     → [{ type, status, score, data, error }]
// d.decided_at → ISO timestamp

const credential = d.checks.find(c => c.type === "credential");
if (credential.status === "failed") {
  console.log(credential.error?.message);
  // e.g. "License belongs to a different name"
}`,
          },
        ]}
      />
      <CodeBlock
        language="json"
        title="Response (data)"
        code={`{
  "status":   "APPROVED",
  "decision": "APPROVED",
  "decided_at": "2026-06-11T12:05:00Z",
  "checks": [
    { "type": "id_verification", "status": "passed", "score": 0.97, "data": { /* fields, portrait, … */ } },
    { "type": "liveness",        "status": "passed", "score": 1.00, "data": { "live_score": 1 } },
    { "type": "face_match",      "status": "passed", "score": 0.97, "data": { "similarity": 0.97, "threshold": 0.95 } },
    { "type": "credential",      "status": "passed", "score": 1.00,
      "data": { "match": true, "license": { "status": "active", "expires_at": "2027-01-01" } } }
  ]
}`}
      />
      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">APPROVED for KYC + License means all of:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The ID was verified (OCR + authenticity).</li>
          <li>The selfie was live.</li>
          <li>The selfie matches the ID portrait.</li>
          <li>The license exists <em>and belongs to the person on the ID</em>.</li>
        </ul>
      </div>
    </div>

    {/* Other session + workflow APIs */}
    <div className="space-y-4">
      <SubHeading id="hosted-sessions-other" icon={<Code className="h-5 w-5 text-primary" />}>
        Other session & workflow helpers
      </SubHeading>
      <CodeBlock
        language="javascript"
        code={`// Sessions
const session = await verify.sessions.retrieve(sessionId);
const page    = await verify.sessions.list({ status: "APPROVED", vendorData: "user_123", limit: 50 });
await verify.sessions.updateStatus(sessionId, "APPROVED"); // or "DECLINED" — manual override

// Workflows  (↔ /api/v2/workflows)
const wf = await verify.workflows.create({
  name: "KYC + License",
  services: ["id_verification", "liveness", "face_match", "credential"],
});
await verify.workflows.list();
await verify.workflows.retrieve(wf.id);
await verify.workflows.update(wf.id, { name: "KYC + License (v2)" });
await verify.workflows.remove(wf.id);`}
      />
    </div>

    {/* Statuses */}
    <div id="hosted-statuses" className="scroll-mt-8 space-y-3">
      <SubHeading id="hosted-statuses-h" icon={<ListChecks className="h-5 w-5 text-primary" />}>
        Statuses
      </SubHeading>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 text-sm">
          <p className="font-semibold text-foreground mb-2">Session status</p>
          <p className="text-muted-foreground">
            <code>NOT_STARTED</code> → <code>IN_PROGRESS</code> → (<code>IN_REVIEW</code>) →{" "}
            <code>APPROVED</code> | <code>DECLINED</code>
          </p>
          <p className="text-muted-foreground mt-1">
            Plus terminal: <code>ABANDONED</code>, <code>EXPIRED</code>.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-sm">
          <p className="font-semibold text-foreground mb-2">Check status</p>
          <p className="text-muted-foreground">
            <code>pending</code> → <code>running</code> →{" "}
            <code>passed</code> | <code>failed</code> | <code>review</code>
          </p>
        </div>
      </div>
    </div>

    {/* Full example */}
    <div id="hosted-api" className="scroll-mt-8 space-y-3">
      <SubHeading id="hosted-api-h" icon={<Code className="h-5 w-5 text-primary" />}>
        End-to-end Express example
      </SubHeading>
      <CodeBlock
        language="javascript"
        code={`import express from "express";
import { VerifyClient, ValydVerifyError } from "@valyd/sdk";

const app = express();
const verify = new VerifyClient({
  apiKey:        process.env.VALYD_API_KEY!,
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET!,
});

// 1) Start hosted verification
app.post("/start-verification", express.json(), async (req, res) => {
  const session = await verify.sessions.create({
    workflowId:  process.env.VALYD_WORKFLOW_ID!,   // license-only OR kyc+license
    redirectUrl: \`\${process.env.APP_URL}/verify/callback\`,
    callback:    \`\${process.env.APP_URL}/webhooks/valyd\`,
    vendorData:  req.body.userId,
  });
  res.json({ url: session.url, sessionId: session.session_id });
});

// 2) Redirect-back (status is a hint only)
app.get("/verify/callback", (req, res) => {
  res.redirect(\`/verify/pending?s=\${req.query.session_id}\`);
});

// 3) Signed webhook — MUST use raw body
app.post(
  "/webhooks/valyd",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = verify.webhooks.constructEvent(req.body, req.headers);

      // 4) Pull the full decision (webhook is a notification)
      const decision = await verify.sessions.decision(event.session_id);
      await persist(event.vendor_data, decision);

      res.json({ ok: true });
    } catch (err) {
      if (err instanceof ValydVerifyError && err.code === "invalid_signature") {
        return res.status(400).send("bad signature");
      }
      throw err;
    }
  }
);

app.listen(3000);`}
      />
    </div>

    {/* Recipe card */}
    <Link
      to="/verify/ship-hosted-kyc"
      className="group mt-6 flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 transition-colors hover:border-primary/60 hover:bg-primary/10"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Recipe</p>
        <p className="font-semibold text-foreground">Ship Hosted KYC</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          End-to-end walkthrough: session, redirect, signed webhook, and decision handling — with copy-ready code.
        </p>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-primary opacity-60 transition-transform group-hover:translate-x-1" />
    </Link>
  </section>
);

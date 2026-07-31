import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { VERIFY_CONFIG } from "@/lib/verify-config";

const BASE = VERIFY_CONFIG.API_BASE_URL;

const Callout = ({
  type,
  children,
}: {
  type: "warning" | "info" | "success";
  children: React.ReactNode;
}) => {
  const styles = {
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    info:    "bg-primary/5 border-primary/20 text-foreground",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
  };
  const Icon = { warning: AlertTriangle, info: Info, success: CheckCircle2 }[type];
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

export const HostedKycRecipe = () => (
  <div className="space-y-12">
    {/* ── Header ── */}
    <div id="hk-overview" className="scroll-mt-8 space-y-3 pb-6 border-b border-border">
      <div className="text-xs font-semibold uppercase tracking-wider text-primary">Recipe</div>
      <h1 className="text-3xl font-bold text-foreground">Ship Hosted KYC</h1>
      <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
        Go from zero to a working KYC flow: create a session, redirect your user to Valyd's hosted
        page, receive a signed webhook, and act on the authoritative decision. Covers both
        "License Verification" and "KYC&nbsp;+&nbsp;License" workflows — only the{" "}
        <code className="font-mono text-sm">workflow_id</code> changes.
      </p>
      <div className="flex flex-wrap gap-2 text-xs">
        {["~30 min", "Express / Node.js", "@valyd/sdk"].map((tag) => (
          <span key={tag} className="rounded-full bg-muted border border-border px-3 py-1 font-mono text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
    </div>

    {/* ── Prerequisites ── */}
    <section id="hk-prereqs" className="scroll-mt-8 space-y-4">
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
              ["VALYD_WEBHOOK_SECRET", "Developer Portal → your Verify project → Webhooks"],
              ["VALYD_WORKFLOW_ID", "Developer Portal → Workflows → copy workflow_id"],
              ["APP_URL", "Your public server URL (e.g. https://api.example.com)"],
            ].map(([v, where]) => (
              <tr key={v} className="border-t border-border">
                <td className="px-4 py-2 font-mono text-xs">{v}</td>
                <td className="px-4 py-2 text-muted-foreground">{where}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock language="bash" title=".env" code={`VALYD_API_KEY=your_api_key
VALYD_WEBHOOK_SECRET=your_webhook_secret
VALYD_WORKFLOW_ID=wf_…
APP_URL=https://api.example.com`} />
      <CodeBlock language="bash" title="Install the SDK" code="npm i @valyd/sdk" />
    </section>

    {/* ── Step 1 ── */}
    <Step id="hk-create" n={1} title="Create a session">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Call <code className="font-mono text-xs">POST /api/v2/session</code> from your server. The
        response includes a hosted <code className="font-mono text-xs">url</code> — that's where
        you'll send the user. Pass <code className="font-mono text-xs">vendor_data</code> to
        correlate the result back to your user later.
      </p>
      <CodeBlock language="javascript" title="SDK (Node.js)" code={`import { VerifyClient } from "@valyd/sdk";

const verify = new VerifyClient({
  apiKey:        process.env.VALYD_API_KEY!,
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET!,
});

// In your route handler:
const session = await verify.sessions.create({
  workflowId:  process.env.VALYD_WORKFLOW_ID!,
  redirectUrl: \`\${process.env.APP_URL}/verify/callback\`,
  callback:    \`\${process.env.APP_URL}/webhooks/valyd\`,
  vendorData:  req.user.id,   // echoed back on the webhook
  ttlSeconds:  900,
});

// session.url        → send the user here (step 2)
// session.session_id → store this for later lookups`} />
      <CodeBlock language="bash" title="cURL" code={`curl -X POST ${BASE}/api/v2/session \\
  -H "X-API-Key: $VALYD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflow_id":  "wf_…",
    "redirect_url": "https://app.example.com/verify/callback",
    "callback":     "https://api.example.com/webhooks/valyd",
    "vendor_data":  "user_123",
    "ttl_seconds":  900
  }'`} />
      <Callout type="info">
        <strong>Which workflow_id?</strong> Use the "License Verification" workflow to check a
        professional license only. Use "KYC&nbsp;+&nbsp;License" to also verify the user's identity
        (ID scan + selfie + face match) before the license lookup. Both use the same integration
        code — only the <code className="font-mono text-xs">workflow_id</code> differs.
      </Callout>
    </Step>

    {/* ── Step 2 ── */}
    <Step id="hk-redirect" n={2} title="Redirect the user">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Send the user's browser to <code className="font-mono text-xs">session.url</code>. Valyd's
        hosted page handles the entire capture and verification UI — no camera or document handling
        on your side.
      </p>
      <CodeBlock language="javascript" title="Express route" code={`app.post("/start-verification", express.json(), async (req, res) => {
  const session = await verify.sessions.create({
    workflowId:  process.env.VALYD_WORKFLOW_ID!,
    redirectUrl: \`\${process.env.APP_URL}/verify/callback\`,
    callback:    \`\${process.env.APP_URL}/webhooks/valyd\`,
    vendorData:  req.body.userId,
  });
  res.redirect(session.url);
});`} />
    </Step>

    {/* ── Step 3 ── */}
    <Step id="hk-callback" n={3} title="Handle the redirect back">
      <p className="text-sm text-muted-foreground leading-relaxed">
        When the user finishes (or abandons), Valyd redirects to your{" "}
        <code className="font-mono text-xs">redirect_url</code> with{" "}
        <code className="font-mono text-xs">?session_id=…&status=…</code>. The{" "}
        <code className="font-mono text-xs">status</code> query param is a hint — never treat it as
        the final result. Your authoritative source is the webhook (step 4) and the decision API
        (step 5).
      </p>
      <CodeBlock language="javascript" title="Express route" code={`app.get("/verify/callback", (req, res) => {
  const { session_id } = req.query;
  // ?status= is a hint only — don't gate access on it.
  // Show a "processing" page while you wait for the webhook.
  res.redirect(\`/verify/pending?s=\${session_id}\`);
});`} />
      <Callout type="warning">
        Never trust <code className="font-mono text-xs">?status=APPROVED</code> from the redirect
        URL. A user can manipulate query params. Always confirm via the webhook or the decision API.
      </Callout>
    </Step>

    {/* ── Step 4 ── */}
    <Step id="hk-webhook" n={4} title="Receive and verify the webhook">
      <p className="text-sm text-muted-foreground leading-relaxed">
        When the session reaches a terminal state, Valyd POSTs to your{" "}
        <code className="font-mono text-xs">callback</code> URL. You must verify the HMAC-SHA256
        signature against the <strong>raw request body</strong> — do not re-serialise the JSON.
        Use <code className="font-mono text-xs">X-Valyd-Event-Id</code> to deduplicate retries.
      </p>
      <CodeBlock language="javascript" title="Express webhook handler" code={`import { ValydVerifyError } from "@valyd/sdk";

// IMPORTANT: raw body required for signature verification
app.post(
  "/webhooks/valyd",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = verify.webhooks.constructEvent(req.body, req.headers);
      // event.type       → "verification.approved" | "verification.declined" | …
      // event.session_id → use to fetch the full decision (step 5)
      // event.vendor_data → your internal user ref

      // Deduplicate — idempotency on re-delivery
      if (await alreadyProcessed(event.event_id)) {
        return res.json({ ok: true });
      }

      await handleEvent(event); // your business logic
      res.json({ ok: true });
    } catch (err) {
      if (err instanceof ValydVerifyError && err.code === "invalid_signature") {
        return res.status(400).send("bad signature");
      }
      throw err;
    }
  }
);`} />
      <Callout type="info">
        <strong>Webhook event types:</strong>{" "}
        <code className="font-mono text-xs">verification.approved</code>,{" "}
        <code className="font-mono text-xs">verification.declined</code>,{" "}
        <code className="font-mono text-xs">verification.in_review</code>,{" "}
        <code className="font-mono text-xs">verification.abandoned</code>,{" "}
        <code className="font-mono text-xs">verification.expired</code>. The webhook is a
        notification — always call the decision endpoint for the full check breakdown.
      </Callout>
    </Step>

    {/* ── Step 5 ── */}
    <Step id="hk-decision" n={5} title="Read the authoritative decision">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Call <code className="font-mono text-xs">GET /api/v2/session/{"{id}"}/decision</code> to get
        the final outcome plus per-check details. Do this inside your webhook handler (or from a
        polling mechanism if the webhook hasn't arrived yet).
      </p>
      <CodeBlock language="javascript" title="SDK (Node.js)" code={`const d = await verify.sessions.decision(event.session_id);

// d.status  → "APPROVED" | "DECLINED" | "IN_REVIEW"
// d.checks  → [{ type, status, score, data, error }]

const credential = d.checks.find(c => c.type === "credential");
if (credential?.status === "failed") {
  console.error("License check failed:", credential.error?.message);
  // e.g. "License belongs to a different name"
}`} />
      <CodeBlock language="bash" title="cURL" code={`curl ${BASE}/api/v2/session/ses_…/decision \\
  -H "X-API-Key: $VALYD_API_KEY"`} />
    </Step>

    {/* ── Handle result ── */}
    <section id="hk-handle" className="scroll-mt-8 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Handle the result</h2>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground w-1/4">d.status</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">What it means</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">What to do</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["APPROVED", "All checks passed.", "Grant access. Store the decision against the user."],
              ["DECLINED", "One or more checks failed.", "Show a clear message. Inspect d.checks for which check failed and why. Don't reveal raw error messages to the user."],
              ["IN_REVIEW", "Awaiting manual review.", "Show a 'We'll be in touch' message. A terminal webhook will arrive when review completes."],
              ["ABANDONED / EXPIRED", "User left or session timed out.", "Offer to restart. Create a new session — sessions cannot be resumed."],
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
      <Callout type="success">
        <strong>For KYC&nbsp;+&nbsp;License, APPROVED means all four checks passed:</strong> the ID
        was authentic, the selfie was live, the selfie matched the ID portrait, and the license
        belongs to the person on the ID.
      </Callout>
    </section>

    {/* ── Common errors ── */}
    <section id="hk-errors" className="scroll-mt-8 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Common errors</h2>
      <div className="space-y-3">
        {[
          {
            title: "Invalid webhook signature",
            cause: "Verifying against a re-serialised JSON body, or using the wrong secret.",
            fix: "Pass the raw Buffer from express.raw() directly to constructEvent(). Confirm VALYD_WEBHOOK_SECRET matches the secret in the Developer Portal.",
          },
          {
            title: "Trusting ?status= as final",
            cause: "Reading req.query.status on the redirect callback and gating access on it.",
            fix: "Always confirm the outcome via the webhook or the decision API. The query param is a UX hint only.",
          },
          {
            title: "401 on session create",
            cause: "X-API-Key is missing, wrong, or being sent from the browser.",
            fix: "Keep the API key server-side only. Confirm the key is the App API key, not a different credential type.",
          },
          {
            title: "Webhook not received",
            cause: "The callback URL isn't publicly reachable, or returns a non-2xx response.",
            fix: "In development, use a tunnel (ngrok, Cloudflare Tunnel). Your handler must return 2xx within ~30 s — do heavy work async.",
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

import { CodeBlock } from "@/components/docs/CodeBlock";
import { LanguageTabs } from "@/components/docs/LanguageTabs";
import { VERIFY_CONFIG } from "@/lib/verify-config";
import { Package, Settings, Boxes, AlertTriangle, Zap, Webhook, ExternalLink } from "lucide-react";

const BASE = VERIFY_CONFIG.API_BASE_URL;

const SubHeading = ({ id, icon, children }: { id: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <h3 id={id} className="scroll-mt-8 text-xl font-semibold text-foreground flex items-center gap-2 pt-2">
    {icon}
    {children}
  </h3>
);

const Row = ({ name, type, def, desc }: { name: string; type: string; def?: string; desc: string }) => (
  <tr className="border-t border-border">
    <td className="py-2 pr-4 align-top"><code className="text-sm font-semibold text-foreground">{name}</code></td>
    <td className="py-2 pr-4 align-top text-xs text-muted-foreground">{type}</td>
    <td className="py-2 pr-4 align-top text-xs text-muted-foreground">{def ?? "—"}</td>
    <td className="py-2 align-top text-sm text-muted-foreground">{desc}</td>
  </tr>
);

const Method = ({ sig, desc }: { sig: string; desc: React.ReactNode }) => (
  <li className="text-sm">
    <code className="text-foreground">{sig}</code>
    <span className="text-muted-foreground"> — {desc}</span>
  </li>
);

export const SdkSection = () => (
  <section id="sdk" className="scroll-mt-8 space-y-10">
    <div className="space-y-3">
      <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
        <Package className="h-7 w-7 text-primary" /> Node SDK
      </h2>
      <p className="text-muted-foreground">
        One SDK covers everything.{" "}
        <a
          href="https://www.npmjs.com/package/@valyd/sdk"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          @valyd/sdk on npm <ExternalLink className="h-3 w-3" />
        </a>{" "}
        is the single, unified Valyd SDK — <strong>Login with Valyd</strong> lives on{" "}
        <code>valyd.auth</code> and the <strong>Verification APIs</strong> on{" "}
        <code>valyd.verify</code>. Zero-dependency, dual ESM + CJS, fully typed. Requires{" "}
        <strong>Node 18+</strong> (built-in <code>fetch</code> / <code>crypto</code>).
      </p>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
        <Package className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-foreground">
          <strong>One app, one credential.</strong> Create an app in the developer portal (owned by
          your individual account or your <strong>organization</strong>) and use its{" "}
          <code>client_id</code> / <code>client_secret</code> for both login and verification — no
          separate verify key or URL. For verification-only use (no login), a project{" "}
          <code>apiKey</code> works instead. Everything routes through one host, the Valyd IdP.
        </p>
      </div>
      <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-foreground">
          <strong>Server-side only.</strong> Your API key must never reach the browser. The hosted
          flow is just a redirect to <code>session.url</code> — there is no browser SDK.
        </p>
      </div>
    </div>

    {/* Install */}
    <div id="sdk-install" className="scroll-mt-8 space-y-3">
      <SubHeading id="sdk-install-h" icon={<Zap className="h-5 w-5 text-primary" />}>
        Install & initialise
      </SubHeading>
      <CodeBlock language="bash" code={`npm i @valyd/sdk`} />
      <CodeBlock
        language="javascript"
        code={`import { Valyd } from "@valyd/sdk";

// One app credential for both login and verification (recommended).
const valyd = new Valyd({
  clientId: process.env.VALYD_CLIENT_ID,
  clientSecret: process.env.VALYD_CLIENT_SECRET, // server-side only
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET,
});

valyd.auth;   // Login with Valyd (OAuth2 / OIDC)
valyd.verify; // Verification APIs (hosted + standalone)`}
      />
      <p className="text-sm text-muted-foreground">
        Verification-only (no login)? Construct with a project API key instead:{" "}
        <code>new Valyd({`{ apiKey: process.env.VALYD_API_KEY }`})</code>. Both{" "}
        <code>valyd.auth</code> (a <code>ValydClient</code>) and <code>valyd.verify</code> (a{" "}
        <code>VerifyClient</code>) are also exported directly if you prefer to instantiate one alone.
      </p>
    </div>

    {/* Constructor options */}
    <div id="sdk-config" className="scroll-mt-8 space-y-3">
      <SubHeading id="sdk-config-h" icon={<Settings className="h-5 w-5 text-primary" />}>
        Constructor options
      </SubHeading>
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/40">
              <th className="py-2 px-4 text-xs uppercase tracking-wide text-muted-foreground">Option</th>
              <th className="py-2 px-4 text-xs uppercase tracking-wide text-muted-foreground">Type</th>
              <th className="py-2 px-4 text-xs uppercase tracking-wide text-muted-foreground">Default</th>
              <th className="py-2 px-4 text-xs uppercase tracking-wide text-muted-foreground">Description</th>
            </tr>
          </thead>
          <tbody className="px-4">
            <Row name="apiKey" type="string" desc="Required. Sent as the X-API-Key header on every request." />
            <Row name="baseUrl" type="string" def={BASE} desc="API base URL. Override only for staging/self-hosted." />
            <Row
              name="webhookSecret"
              type="string"
              desc="Optional. When set, webhooks.constructEvent / verify can be called without passing the secret explicitly."
            />
            <Row name="timeoutMs" type="number" def="15000" desc="Per-request timeout. Increase for credential lookups (10–60s)." />
            <Row name="fetch" type="typeof fetch" desc="Custom fetch implementation (proxies, instrumentation, tests)." />
          </tbody>
        </table>
      </div>
    </div>

    {/* Resources */}
    <div id="sdk-resources" className="scroll-mt-8 space-y-6">
      <SubHeading id="sdk-resources-h" icon={<Boxes className="h-5 w-5 text-primary" />}>
        Resources
      </SubHeading>

      <div className="rounded-lg border border-border bg-card p-5 space-y-2">
        <p className="font-semibold text-foreground"><code>verify.sessions</code></p>
        <ul className="space-y-1.5 list-disc pl-5">
          <Method sig="create(params): Promise<Session>" desc="Create a hosted session. Returns .url and .sessionId — see Hosted Verification." />
          <Method sig="retrieve(id): Promise<Session>" desc="Fetch a session by id." />
          <Method sig="list({ status?, vendorData?, limit? }): Promise<SessionSummary[]>" desc="List sessions, filterable by status / vendor_data." />
          <Method sig="decision(id): Promise<Decision>" desc="Authoritative result with .checks[] — call this after the webhook." />
          <Method sig='updateStatus(id, "APPROVED" | "DECLINED"): Promise<Session>' desc="Manual override (e.g. after agent review)." />
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-2">
        <p className="font-semibold text-foreground"><code>verify.workflows</code></p>
        <ul className="space-y-1.5 list-disc pl-5">
          <Method sig="create({ name, features, settings? }): Promise<Workflow>" desc='e.g. features: ["id_verification","liveness","face_match","credential"].' />
          <Method sig="list(): Promise<Workflow[]>" desc="List all workflows in the app." />
          <Method sig="retrieve(id): Promise<Workflow>" desc="Fetch a workflow." />
          <Method sig="update(id, patch): Promise<Workflow>" desc="Partial update." />
          <Method sig="remove(id): Promise<void>" desc="Delete a workflow." />
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-2">
        <p className="font-semibold text-foreground"><code>verify.standalone</code></p>
        <ul className="space-y-1.5 list-disc pl-5">
          <Method sig="idVerification({ frontImage, backImage? }): Promise<CheckEnvelope>" desc="OCR + authenticity from a government ID." />
          <Method sig="liveness({ image }): Promise<CheckEnvelope>" desc="Passive liveness on a selfie." />
          <Method sig="faceMatch({ idImage, selfie }): Promise<CheckEnvelope>" desc="1:1 face match." />
          <Method sig="faceUniqueness({ selfie | frames, externalRef? }): Promise<CheckEnvelope>" desc="One face = one user (no user login): selfie = single-click, frames (3–8 stills) = live verification; data carries valyd_uuid + registered." />
          <Method sig="faceUniquenessUnlink(valydUuid): Promise<{ unlinked, deleted }>" desc="GDPR forget — drops your project's link; last link deletes the template." />
          <Method sig="ageVerification({ dob, bands? }): Promise<CheckEnvelope>" desc='Age + bands (e.g. ["is_18_plus"]).' />
          <Method sig="credentialVerification({ licenseState, licenseType?, licenseNumber, fullName, providerCode? }): Promise<CheckEnvelope>" desc="License lookup — just state + type (default MD) + number; provider auto-resolved (no provider_code)." />
          <Method sig="kycCredential({ frontImage, selfie, backImage?, providerCode, licenseState, licenseNumber, npi? }): Promise<KycCredentialResult>" desc="ID + liveness + face match + license, matched against the OCR'd name." />
          <Method
            sig="locationMatch({ latitude, longitude, accuracy?, expectedLatitude?, expectedLongitude?, radiusM? }): Promise<CheckEnvelope>"
            desc={<>POSTs <code>/api/v2/location</code>. A real GPS fix is mandatory. With an expected point <strong>+ radiusM</strong> the status is the verdict (<code>passed</code> inside / <code>failed</code> outside); without a radius it passes and only reports <code>data.distance_m</code>.</>}
          />
        </ul>
        <p className="text-xs text-muted-foreground pt-2">
          Every check also accepts <code>valydAccessToken</code> / <code>valydId</code> to run in Account mode
          (proofs only). See Core APIs for full field details.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-2">
        <p className="font-semibold text-foreground"><code>verify.kyc</code> · <code>verify.identity</code></p>
        <ul className="space-y-1.5 list-disc pl-5">
          <Method sig="kyc.isRequired(verifications): boolean" desc="True when the account is not human-verified yet." />
          <Method sig="kyc.redirectUrl({ returnTo, state?, valydId? }): string" desc="Where to send the user to complete KYC on Valyd. KYC is never an API call in the Account model." />
          <Method sig="identity.get({ vendorData?, valydId? }): Promise<ReusableIdentity | null>" desc="Read a previously-verified user's proofs + licenses — no session needed." />
          <Method sig="identity.revoke(valydId): Promise<void>" desc="Revoke the stored identity so the user must verify fully again." />
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-2">
        <p className="font-semibold text-foreground"><code>verify.credentials</code></p>
        <ul className="space-y-1.5 list-disc pl-5">
          <Method sig="states(): Promise<CredentialState[]>" desc="List supported states." />
          <Method sig="providers(state): Promise<CredentialProvider[]>" desc="List providers (license types) in a state, with requiredFields." />
        </ul>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-2">
        <p className="font-semibold text-foreground"><code>verify.webhooks</code></p>
        <ul className="space-y-1.5 list-disc pl-5">
          <Method
            sig="constructEvent(rawBody, headers, secret?, { toleranceSeconds? }): WebhookEvent"
            desc={<>Verifies the HMAC signature and returns the parsed event. Throws <code>ValydVerifyError</code> with code <code>invalid_signature</code> on mismatch.</>}
          />
          <Method sig="verify(rawBody, headers, secret?, { toleranceSeconds? }): boolean" desc="Boolean check, no parse, no throw." />
        </ul>
        <p className="text-xs text-muted-foreground pt-2">
          Also exported as top-level <code>constructEvent</code> / <code>verify</code>. When{" "}
          <code>webhookSecret</code> is set on the client, the <code>secret</code> arg is optional.
        </p>
      </div>
    </div>

    {/* Helpers & types */}
    <div id="sdk-types" className="scroll-mt-8 space-y-3">
      <SubHeading id="sdk-types-h" icon={<Boxes className="h-5 w-5 text-primary" />}>
        Helpers & types
      </SubHeading>
      <CodeBlock
        language="typescript"
        code={`import { readImage, type ImageInput } from "@valyd/sdk";

// ImageInput accepted everywhere an image is required:
//   Buffer | Uint8Array | base64 string | data-URL string
const fromFile: ImageInput = readImage("./id_front.jpg"); // reads to base64
const fromBuf:  ImageInput = await fs.promises.readFile("./selfie.jpg");
const fromDataUrl: ImageInput = "data:image/jpeg;base64,/9j/4AAQ...";`}
      />
      <p className="text-sm text-muted-foreground">
        Every response is strongly typed. Public API uses <code>camelCase</code>; wire payloads stay{" "}
        <code>snake_case</code>.
      </p>
      <CodeBlock
        language="typescript"
        code={`import type {
  Session,
  SessionSummary,
  Decision,
  Check,
  CheckEnvelope,
  KycCredentialResult,
  Workflow,
  CredentialState,
  CredentialProvider,
  WebhookEvent,
} from "@valyd/sdk";`}
      />
    </div>

    {/* Errors */}
    <div id="sdk-errors" className="scroll-mt-8 space-y-3">
      <SubHeading id="sdk-errors-h" icon={<AlertTriangle className="h-5 w-5 text-primary" />}>
        Error handling
      </SubHeading>
      <p className="text-sm text-muted-foreground">
        Every failure throws <code>ValydVerifyError</code> with <code>{`{ code, status?, data? }`}</code>.
        The <code>code</code> is either an API code (e.g. <code>API_KEY_INVALID</code>,{" "}
        <code>VALIDATION_ERROR</code>) or an SDK code:
      </p>
      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
        <li><code>network_error</code> — DNS/socket failure.</li>
        <li><code>timeout</code> — exceeded <code>timeoutMs</code>.</li>
        <li><code>invalid_signature</code> — webhook HMAC mismatch or stale timestamp.</li>
        <li><code>config_error</code> — missing <code>apiKey</code> / <code>webhookSecret</code>.</li>
      </ul>
      <CodeBlock
        language="javascript"
        code={`import { VerifyClient, ValydVerifyError } from "@valyd/sdk";

const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY!, timeoutMs: 90_000 });

try {
  const { check } = await verify.standalone.credentialVerification({
    firstName: "Jane", lastName: "Doe",
    licenseState: "CA", licenseType: "MD", licenseNumber: "A12345", fullName: "Jane Doe",
  });
} catch (err) {
  if (err instanceof ValydVerifyError) {
    console.error(err.code, err.status, err.message, err.data);
    if (err.code === "API_KEY_INVALID") { /* rotate / refetch */ }
  } else {
    throw err;
  }
}`}
      />
    </div>

    {/* Quickstarts */}
    <div id="sdk-quickstarts" className="scroll-mt-8 space-y-4">
      <SubHeading id="sdk-quickstarts-h" icon={<Zap className="h-5 w-5 text-primary" />}>
        Quickstarts
      </SubHeading>

      <LanguageTabs
        title="Hosted quickstart"
        examples={[
          {
            language: "javascript",
            label: "Hosted",
            code: `import { VerifyClient } from "@valyd/sdk";

const verify = new VerifyClient({
  apiKey:        process.env.VALYD_API_KEY!,
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET!,
});

// 1) Create a session and redirect the user
const session = await verify.sessions.create({
  workflowId:  process.env.VALYD_WORKFLOW_ID!,
  redirectUrl: "https://app.example.com/verify/callback",
  callback:    "https://api.example.com/webhooks/valyd",
  vendorData:  "user_123",
});
// res.redirect(session.url)

// 2) In your webhook handler:
const event = verify.webhooks.constructEvent(rawBody, headers); // throws on bad signature

// 3) Pull the authoritative decision
const decision = await verify.sessions.decision(event.session_id);
// decision.status, decision.checks[]`,
          },
          {
            language: "javascript",
            label: "Standalone",
            code: `import { VerifyClient, readImage } from "@valyd/sdk";

const verify = new VerifyClient({ apiKey: process.env.VALYD_API_KEY! });

// 1) Build a state/license picker
const { states }    = await verify.credentials.states();
const { providers } = await verify.credentials.providers("CA");

// 2) Run KYC + License in one call
const result = await verify.standalone.kycCredential({
  frontImage:    readImage("./id_front.jpg"),
  selfie:        readImage("./selfie.jpg"),
  licenseType:   "MD",   // provider auto-resolved
  licenseState:  "CA",
  licenseNumber: "A12345",
});
// result.status === "passed" only when ALL checks pass`,
          },
        ]}
      />
    </div>

    {/* Express webhook */}
    <div id="sdk-webhook" className="scroll-mt-8 space-y-3">
      <SubHeading id="sdk-webhook-h" icon={<Webhook className="h-5 w-5 text-primary" />}>
        Express webhook
      </SubHeading>
      <p className="text-sm text-muted-foreground">
        Use <code>express.raw()</code> so the body bytes match what Valyd signed.
      </p>
      <CodeBlock
        language="javascript"
        code={`import express from "express";
import { VerifyClient, ValydVerifyError } from "@valyd/sdk";

const app = express();
const verify = new VerifyClient({
  apiKey:        process.env.VALYD_API_KEY!,
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET!,
});

app.post(
  "/webhooks/valyd",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const event = verify.webhooks.constructEvent(req.body, req.headers);
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
);`}
      />
    </div>
  </section>
);

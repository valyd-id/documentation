import { CodeBlock } from "@/components/docs/CodeBlock";
import { LanguageTabs } from "@/components/docs/LanguageTabs";
import { HostedFlowDiagram } from "../HostedFlowDiagram";
import { VERIFY_CONFIG, CONSOLE_HOST } from "@/lib/verify-config";
import { API_CONFIG } from "@/lib/api-config";
import {
  KeyRound,
  AlertTriangle,
  Code,
  KeySquare,
  ShieldCheck,
  RefreshCw,
  Fingerprint,
} from "lucide-react";

const BASE = VERIFY_CONFIG.API_BASE_URL;
const IDP = API_CONFIG.IDP_BASE_URL;
const CONSOLE = VERIFY_CONFIG.CONSOLE_URL;

/* ── SDK-first snippets (one runnable block per step) ─────────────────────── */

const INIT = `import { Valyd } from "@valyd/sdk";

// ONE app from ${CONSOLE_HOST} gives you all of these.
const valyd = new Valyd({
  clientId:      process.env.VALYD_CLIENT_ID,      // Login with Valyd (OAuth2)
  clientSecret:  process.env.VALYD_CLIENT_SECRET,  // server-side only
  apiKey:        process.env.VALYD_API_KEY,        // Verify (vrf_…) — server-side only
  webhookSecret: process.env.VALYD_WEBHOOK_SECRET,
});
// valyd.auth   → Login with Valyd (authorize URL, code exchange, verifications)
// valyd.verify → sessions, standalone checks, identity reuse, webhooks`;

const LOGIN = `// 1) "Login with Valyd" — send the user to the IdP consent page.
app.get("/auth/valyd/login", (req, res) => {
  res.redirect(valyd.auth.getAuthorizationUrl({
    scope: ["profile", "verifications"],
    redirectUri: \`\${process.env.APP_URL}/auth/valyd/callback\`,
  }));
});`;

const EXCHANGE_SDK = `// 2) Your callback — swap the code for the user's token + identity.
app.get("/auth/valyd/callback", async (req, res) => {
  const { accessToken, user } = await valyd.auth.exchangeCode(req.query.code);
  req.session.valyd = { accessToken, valydId: user.valyd_id };  // stable Valyd user id
  res.redirect("/verify/start");
});`;

const EXCHANGE_CURL = `curl -X POST ${IDP}/api/auth/tpsso/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "grant_type":    "authorization_code",
    "code":          "AUTH_CODE",
    "client_id":     "'"$VALYD_CLIENT_ID"'",
    "client_secret": "'"$VALYD_CLIENT_SECRET"'"
  }'
# → { data: { access_token, user: { valyd_id, … } } }`;

const KYC_SDK = `// 3) KYC is NOT an API — it happens on the user's Valyd account.
const verifications = await valyd.auth.getVerifications(accessToken);

if (valyd.verify.kyc.isRequired(verifications)) {
  // Not verified yet → send them to Valyd, then back to you.
  return res.redirect(valyd.verify.kyc.redirectUrl({
    returnTo: \`\${process.env.APP_URL}/verify/start\`,
    state:    req.session.id,          // optional, echoed back
  }));
}
// human_verified === true → continue.`;

const KYC_CURL = `# Read KYC status from the IdP (account model)
curl ${IDP}/api/auth/tpsso/verifications \\
  -H "Authorization: Bearer $VALYD_USER_ACCESS_TOKEN"
# → { verifications: { human_verified: false, … } }
# If false, redirect the BROWSER to Valyd to complete KYC, then back to your returnTo URL.`;

const SESSION_SDK = `// 4) Create the session WITH the user's token — that's the Managed hand-off.
app.get("/verify/start", async (req, res) => {
  const { accessToken, valydId } = req.session.valyd;
  const session = await valyd.verify.sessions.create({
    workflowId:       process.env.VALYD_WORKFLOW_ID,
    valydAccessToken: accessToken,   // ← binds the session to the Valyd identity
    vendorData:       valydId,       // your own reference, echoed back
    redirectUrl:      \`\${process.env.APP_URL}/verify/callback\`,
    callback:         \`\${process.env.APP_URL}/webhooks/valyd\`,  // optional
  });
  res.redirect(session.url);   // returning users: selfie only, no second ID scan
});`;

const SESSION_CURL = `curl -X POST ${BASE}/api/v2/session \\
  -H "X-API-Key: $VALYD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflow_id":        "wf_…",
    "valyd_access_token": "'"$VALYD_USER_ACCESS_TOKEN"'",
    "vendor_data":        "valyd_225c7f2ac450496f97bbbc57354a5898",
    "redirect_url":       "https://app.example.com/verify/callback"
  }'
# → { data: { url, session_id, … } }   (401 valyd_login_required if the token is bad)`;

const BROWSER = `// Hosted verification is a redirect — there is no browser SDK.
// Your server creates the session and returns its url; send the user there.
const { url } = await fetch("/verify/start").then((r) => r.json());
window.location.href = url;

// Valyd hosts the capture. When the user returns, your server reads the
// outcome with valyd.verify.sessions.decision(sessionId) (or via the webhook).`;

const RESULT_SDK = `// 5) The decision is the source of truth (webhook or not).
const decision = await valyd.verify.sessions.decision(sessionId);
// decision.status → APPROVED | DECLINED | IN_REVIEW | EXPIRED | ABANDONED

// Optional push: verify the signature, then go read the decision.
app.post("/webhooks/valyd", express.raw({ type: "*/*" }), async (req, res) => {
  const event = valyd.verify.webhooks.constructEvent(req.body, req.headers);
  const d = await valyd.verify.sessions.decision(event.sessionId);
  if (d.status === "APPROVED") markVerified(event.vendorData, d);
  res.json({ ok: true });
});`;

const RESULT_CURL = `curl ${BASE}/api/v2/session/ses_…/decision \\
  -H "X-API-Key: $VALYD_API_KEY"
# Account (Managed) → PROOFS ONLY, never raw KYC:
# → { data: { status, origin: "managed",
#     checks: { id_verification: { status, id_verified },
#               face_match:      { status, score },
#               credential:      { status, licenses: [...] },
#               location:        { status, distance_m, match } },
#     identity: { valyd_id, pseudonym, id_verified, age_bands, licenses, verified_at } } }`;

const REUSE_SDK = `// Read a previously-verified user by your ref (or their valyd_id) — no session needed.
const identity = await valyd.verify.identity.get({ vendorData: "user-123" });
// → { valydId, pseudonym, idVerified, ageBands, licenses, verifiedAt }  (proofs only)

// Force a full re-verification next time:
await valyd.verify.identity.revoke("valyd_225c7f2ac450496f97bbbc57354a5898");`;

const REUSE_CURL = `curl "${BASE}/api/v2/identity?vendor_data=user-123" \\
  -H "X-API-Key: $VALYD_API_KEY"
# → { data: { identity: { valyd_id, pseudonym, id_verified, age_bands, licenses, verified_at } } }

curl -X DELETE "${BASE}/api/v2/identity/valyd_225c7f2ac450496f97bbbc57354a5898" \\
  -H "X-API-Key: $VALYD_API_KEY"`;

const CONSENT_CURL = `# 1) Ask for specific attributes, sending your X25519 public key
curl -X POST ${IDP}/api/auth/attribute-request \\
  -H "Authorization: Bearer $CLIENT_TOKEN" -H "Content-Type: application/json" \\
  -d '{ "client_id": "'"$CLIENT_ID"'",
        "attributes": ["legal_name","dob","id_verified"],
        "requester_public_key": "<base64 X25519 pubkey>" }'
# → { data: { request_id, status: "pending" } }

# 2) The USER approves in their Valyd app (or denies). You poll:
curl ${IDP}/api/auth/attribute-request/<request_id>/result \\
  -H "Authorization: Bearer $CLIENT_TOKEN"
# → { data: { status: "approved", sealed_box: "<base64>" } }  # decrypt with your X25519 private key
# (denied/expired → no data; the sealed blob is short-TTL and one-time)`;

/* ── UI ───────────────────────────────────────────────────────────────────── */

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
    {children}
  </span>
);

const Step = ({
  n,
  id,
  title,
  lead,
  children,
}: {
  n: number;
  id: string;
  title: string;
  lead: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div id={id} className="scroll-mt-8 relative pl-12">
    <div className="absolute left-0 top-0 h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
      {n}
    </div>
    <h4 className="text-lg font-semibold text-foreground mb-1">{title}</h4>
    <p className="text-sm text-muted-foreground mb-3">{lead}</p>
    {children}
  </div>
);

const SubHeading = ({ id, icon, children }: { id: string; icon?: React.ReactNode; children: React.ReactNode }) => (
  <h3 id={id} className="scroll-mt-8 text-xl font-semibold text-foreground flex items-center gap-2 pt-2">
    {icon}
    {children}
  </h3>
);

export const ManagedSection = () => (
  <section id="managed" className="scroll-mt-8 space-y-10">
    {/* Title */}
    <div className="space-y-3">
      <Pill><KeyRound className="h-3.5 w-3.5" /> Account · Managed by Valyd</Pill>
      <h2 className="text-3xl font-bold text-foreground">Managed by Valyd</h2>
      <p className="text-muted-foreground max-w-3xl">
        Your users sign in with <strong>Login with Valyd</strong>. They verify <strong>once</strong>, and the result
        joins their Valyd identity — reused across your app and every other Valyd integration. Returning users
        re-verify with a <strong>selfie only</strong>, no second ID scan.
      </p>

      <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
        <AlertTriangle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-foreground">
          Keep <code>client_secret</code> and the Verify <code>API key</code> <strong>server-side only</strong>, and
          pass the user's access token to the session server-to-server. Never expose any of them to the browser.
        </p>
      </div>

      {/* How the account hosted flow actually runs */}
      <div id="managed-flow" className="scroll-mt-8 space-y-4 pt-4">
        <h3 className="text-xl font-bold text-foreground">How the hosted flow works</h3>
        <p className="text-sm text-muted-foreground">
          End to end, who does what — from Login with Valyd through to acting on a proofs-only decision.
        </p>
        <HostedFlowDiagram variant="account" />
      </div>
    </div>

    {/* Overview & SDK init */}
    <div id="managed-overview" className="scroll-mt-8 space-y-3">
      <SubHeading id="managed-overview-h" icon={<Code className="h-5 w-5 text-primary" />}>
        Overview &amp; SDK init
      </SubHeading>
      <p className="text-sm text-muted-foreground">
        One SDK, two namespaces:{" "}
        <a
          href="https://www.npmjs.com/package/@valyd/sdk"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          <code>@valyd/sdk</code>
        </a>{" "}
        gives you <code>valyd.auth</code> (Login with Valyd) and <code>valyd.verify</code> (the checks).
      </p>
      <CodeBlock language="bash" code={`npm i @valyd/sdk   # server (Node 18+)
# No browser SDK — hosted verification is a redirect to session.url`} />
      <CodeBlock language="javascript" title="Init — one app, all credentials" code={INIT} />
    </div>

    {/* Steps */}
    <div className="space-y-8">
      <Step
        n={1}
        id="managed-register"
        title="Register your app — one place"
        lead={
          <>
            Everything comes from the Developer Portal at{" "}
            <a href={CONSOLE} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              {CONSOLE_HOST}
            </a>
            : the OAuth <code>client_id</code> + <code>client_secret</code> (add your redirect URI and scopes{" "}
            <code>profile</code>, <code>verifications</code>, <code>doctor_license</code>), the Verify{" "}
            <code>API key</code> (<code>vrf_…</code>, shown once) and webhook secret, and your Workflow →{" "}
            <code>workflow_id</code>. <strong>There is no separate Verify console.</strong>
          </>
        }
      />

      <Step
        n={2}
        id="managed-login"
        title="Add a “Login with Valyd” button"
        lead={<>The SDK builds the authorize URL — it points at the hosted consent page on the IdP.</>}
      >
        <CodeBlock language="javascript" code={LOGIN} />
      </Step>

      <Step
        n={3}
        id="managed-exchange"
        title="Exchange the code on your callback"
        lead={<>You get the user's access token and their stable <code>valyd_id</code>.</>}
      >
        <LanguageTabs
          examples={[
            { language: "javascript", label: "SDK (Node)", code: EXCHANGE_SDK },
            { language: "bash", label: "cURL", code: EXCHANGE_CURL },
          ]}
        />
      </Step>

      <Step
        n={4}
        id="managed-kyc"
        title="Gate on KYC — redirect, don't upload"
        lead={
          <>
            In the Account model <strong>KYC is never an API call</strong>. If the user isn't verified yet, send them
            to Valyd to finish it and come back. Nothing to collect, nothing to store.
          </>
        }
      >
        <LanguageTabs
          examples={[
            { language: "javascript", label: "SDK (Node)", code: KYC_SDK },
            { language: "bash", label: "cURL", code: KYC_CURL },
          ]}
        />
      </Step>

      <Step
        n={5}
        id="managed-session"
        title="Start the verification with the access token"
        lead={
          <>
            Pass <code>valydAccessToken</code> — that's what binds the session to the Valyd identity and unlocks reuse.
            A missing/expired token returns <code>401 valyd_login_required</code>: send the user back through login.
          </>
        }
      >
        <LanguageTabs
          examples={[
            { language: "javascript", label: "SDK (Node)", code: SESSION_SDK },
            { language: "bash", label: "cURL", code: SESSION_CURL },
          ]}
        />
      </Step>

      <Step
        n={6}
        id="managed-redirect"
        title="Send the user to the hosted page"
        lead={
          <>
            Redirect to <code>session.url</code>, or open it in a modal with the browser SDK.{" "}
            <strong>First-timers</strong> do the full workflow; <strong>returning users</strong> do a{" "}
            <strong>selfie only</strong>, matched against their stored face.
          </>
        }
      >
        <CodeBlock language="javascript" title="Browser — redirect to the hosted page" code={BROWSER} />
      </Step>

      <Step
        n={7}
        id="managed-result"
        title="Read the result"
        lead={
          <>
            <code>sessions.decision(id)</code> is the source of truth. Webhooks are optional — a push telling you to go
            read it.
          </>
        }
      >
        <div id="managed-writeback" className="scroll-mt-8 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground mb-3">
          <strong className="text-foreground">Account data rule.</strong> An Account (Managed) session returns{" "}
          <strong>proofs only</strong> — a pseudonym, <code>id_verified</code>, verified license badges, age bands. Raw
          KYC (legal name, date of birth, document images) is <strong>never</strong> returned here; the{" "}
          <code>id_verification</code> check reduces to <code>{`{ status, id_verified }`}</code>. On approval the result
          is written back to the Valyd identity, so your next login — and every other Valyd integration — can reuse it.
          To obtain raw attributes, use the{" "}
          <a href="#consent" className="text-primary hover:underline">consent Core API</a> — the user approves the
          release in their Valyd app.
        </div>
        <LanguageTabs
          examples={[
            { language: "javascript", label: "SDK (Node)", code: RESULT_SDK },
            { language: "bash", label: "Decision (cURL)", code: RESULT_CURL },
          ]}
        />
      </Step>
    </div>

    {/* Reuse APIs */}
    <div id="managed-reuse" className="scroll-mt-8 space-y-4">
      <SubHeading id="managed-reuse-h" icon={<RefreshCw className="h-5 w-5 text-primary" />}>
        Reuse a verified identity (no new session)
      </SubHeading>
      <p className="text-sm text-muted-foreground">
        Read a previously-verified user's proofs + licenses by your own reference, or revoke the stored identity —
        without starting a session.
      </p>
      <LanguageTabs
        examples={[
          { language: "javascript", label: "SDK (Node)", code: REUSE_SDK },
          { language: "bash", label: "cURL", code: REUSE_CURL },
        ]}
      />
    </div>

    {/* Consent Core API — release raw KYC with user approval */}
    <div id="consent" className="scroll-mt-8 space-y-4">
      <SubHeading id="consent-h" icon={<KeySquare className="h-5 w-5 text-primary" />}>
        Consent Core API — request raw KYC (the user approves)
      </SubHeading>
      <p className="text-sm text-muted-foreground">
        Account sessions never return raw KYC. When you genuinely need raw attributes (legal name, date of birth, …),
        the values are always end-to-end encrypted (X25519 sealed box) to your public key — Valyd stays blind. There
        are two ways to ask (full guide:{" "}
        <a href="/docs/request-data" className="text-primary hover:underline">Request user data</a>):
      </p>
      <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
        <li>
          <strong>At login (recommended)</strong> — add <code>attributes</code> + your{" "}
          <code>requester_public_key</code> to the authorize URL. The user checks/unchecks them on the
          consent screen; granted fields come back inline as <code>attr_code</code>. Consent is{" "}
          <strong>remembered per app</strong> — a returning user isn't re-prompted. No mobile step.
        </li>
        <li>
          <strong>After login</strong> — the <code>attribute-request</code> flow below; the user approves in
          their Valyd app. Use it for fields not granted at login.
        </li>
      </ul>
      <LanguageTabs examples={[{ language: "bash", label: "After login: request → approve → result", code: CONSENT_CURL }]} />
      <p className="text-xs text-muted-foreground">
        A second consent surface, <code>credential-share</code>, releases a specific vault credential and gates the
        release with a face scan as the user's consent.
      </p>
    </div>

    {/* At-a-glance recap */}
    <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-2">
        <Fingerprint className="h-4 w-4 text-primary" /> One app · {CONSOLE_HOST}
      </span>
      <span className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" /> Token in the session → reuse
      </span>
      <span className="flex items-center gap-2">
        <KeySquare className="h-4 w-4 text-primary" /> Proofs out, raw KYC only by consent
      </span>
    </div>
  </section>
);

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope, ScanFace, MapPin, BadgeCheck, ShieldCheck, Workflow,
  ArrowRight, ExternalLink, CheckCircle2, Fingerprint, Building2,
} from "lucide-react";
import { GlobalNav } from "@/components/GlobalNav";
import { CodeBlock } from "@/components/docs/CodeBlock";

// Build the `new Valyd({...})` line for the CURRENT environment only — production
// is the SDK default (no env flag), other environments pass their own env.
function initBlock(c: EnvCfg, webhook: boolean): string {
  const fields = webhook ? "clientId, clientSecret, apiKey, webhookSecret" : "clientId, clientSecret, apiKey";
  return c.key === "production"
    ? `const valyd = new Valyd({ ${fields} });   // → ${c.idp} (login + Verify)`
    : `const valyd = new Valyd({\n  ${fields},\n  env: "${c.env}",   // → ${c.idp} (login + Verify)\n});`;
}

const checks = [
  { icon: Fingerprint, title: "Identity (KYC)", desc: "Verified once on the clinician's Valyd account. Reused after — never re-done." },
  { icon: BadgeCheck, title: "Medical license", desc: "Checked live against the state board, then stored on the account and re-checked over time." },
  { icon: ScanFace, title: "Face at the door", desc: "A live selfie matched against the clinician's stored Valyd face vector." },
  { icon: MapPin, title: "Location", desc: "A real GPS fix is mandatory. Inside the geofence → passed; outside it → failed." },
];

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{children}</span>;
}

const hostedCode = (c: EnvCfg) => `import { Valyd } from "@valyd/sdk";
${initBlock(c, true)}

// 1) "Connect Valyd" — log the clinician in (OAuth)
app.get("/evv/login", (req, res) =>
  res.redirect(valyd.auth.getAuthorizationUrl({ scope: ["profile", "verifications", "doctor_license"] })));

// 2) On callback, create a hosted EVV session bound to their Valyd identity
app.get("/evv/callback", async (req, res) => {
  const { accessToken, user } = await valyd.auth.exchangeCode(req.query.code);
  const session = await valyd.verify.sessions.create({
    workflowId: EVV_WORKFLOW_ID,          // id + liveness + face_match + credential + location
    valydAccessToken: accessToken,        // ← identifies the person (→ valyd_id)
    vendorData: user.valyd_id,
    metadata: { expected_lat: home.lat, expected_lng: home.lng }, // the assigned home
  });
  res.json({ url: session.url });         // returning, verified users → just a face scan
});

// 3) Get notified + read the result server-side (source of truth)
app.post("/webhooks/valyd", express.raw({ type: "*/*" }), async (req, res) => {
  const event = valyd.verify.webhooks.constructEvent(req.body, req.headers); // verifies signature
  const decision = await valyd.verify.sessions.decision(event.sessionId);
  if (decision.status === "APPROVED") markVisitVerified(event.vendorData, decision);
  res.json({ ok: true });
});`;

const HOSTED_BROWSER = `// No browser SDK — "Connect Valyd" and the hosted flow are both redirects.

// 1) "Connect Valyd" is a plain link to your OAuth login:
//    <a href="/evv/login">Connect Valyd</a>
// 2) Once connected, your server creates a session and returns its url:
const { url } = await fetch("/evv/session").then(r => r.json());
window.location.href = url; // Valyd hosts the capture; result via webhook + decision`;

const coreCode = (c: EnvCfg) => `import { Valyd } from "@valyd/sdk";
${initBlock(c, false)}

// 1) "Connect Valyd" — SAME OAuth step as hosted; this is how you get the token.
app.get("/evv/login", (req, res) =>
  res.redirect(valyd.auth.getAuthorizationUrl({ scope: ["profile", "verifications", "doctor_license"] })));

app.get("/evv/callback", async (req, res) => {
  const { accessToken, user } = await valyd.auth.exchangeCode(req.query.code); // ← the Valyd token

  // 2) KYC gate — read the account's status; if not verified, redirect to Valyd (no KYC API)
  const v = await valyd.auth.getVerifications(accessToken);
  if (valyd.verify.kyc.isRequired(v))
    return res.redirect(valyd.verify.kyc.redirectUrl({ returnTo: "https://app/evv" }));

  // 3) License — just state + type (default MD); the provider is resolved for you.
  //    Name comes from the connected account — you don't pass it.
  await valyd.verify.standalone.credentialVerification({
    licenseState: "CO", licenseType: "MD", licenseNumber: "TL.0011377",
  });
  res.json({ ok: true });
});

// 4) The visit itself — ACCOUNT mode: selfie only (matched to the stored Valyd face
//    vector) + the location check. No ID image; the browser captures both:
//    capture with the browser's native camera + geolocation, then POST to your server.
const face = await valyd.verify.standalone.faceMatch({
  valydAccessToken: accessToken,               // ← selfie matched to the stored vector
  selfie: v.selfie,
});

const loc = await valyd.verify.standalone.locationMatch({
  latitude: v.latitude, longitude: v.longitude, accuracy: v.accuracy,
  expectedLatitude: home.lat, expectedLongitude: home.lng, radiusM: 200,
});
// A radius was given, so the STATUS is the verdict:
//   loc.check.status === "passed"  → inside the geofence  (loc.check.data.match === true)
//   loc.check.status === "failed"  → too far away, with loc.check.error explaining by how much
const atTheHome = face.check.status === "passed" && loc.check.status === "passed";`;

const CONNECT_NOTE = `// The "Connect Valyd" button is just a link to your /evv/login route:
//   <a href="/evv/login">Connect Valyd</a>
// or use the browser SDK helper:
// "Connect Valyd" is a plain link to your OAuth login — no browser SDK.
connectButton("#connect", { loginUrl: "/evv/login" });`;

const RESULT_POLL = `// NO WEBHOOK NEEDED — read the result when the user returns.
// Browser: after the modal completes, ask your server for the decision.
await open({ url, onComplete: async ({ sessionId }) => {
  const r = await fetch("/evv/result/" + sessionId).then(r => r.json());
  console.log(r.status, r.checks);   // your /evv/result route calls sessions.decision(id)
}});

// Server: GET /evv/result/:id
app.get("/evv/result/:id", async (req, res) =>
  res.json(await valyd.verify.sessions.decision(req.params.id)));`;

const WEBHOOK_EVENT = `// OPTIONAL. Webhooks are set per APP in the console (or per session via \`callback\`).
// The event is only a NOTIFICATION — not the full result:
{
  "type":        "verification.completed",
  "session_id":  "ses_8f…",
  "status":      "APPROVED",      // APPROVED | DECLINED | IN_REVIEW | EXPIRED | ABANDONED
  "vendor_data": "valyd_225c7f2ac450496f97bbbc57354a5898",
  "occurred_at": "2026-07-01T18:04:11Z"
}
// Signature: HMAC-SHA256 over "timestamp.rawBody" — verify it with
// valyd.verify.webhooks.constructEvent(rawBody, headers) before trusting it.`;

const DECISION_JSON = `// GET /api/v2/session/{id}/decision   →   valyd.verify.sessions.decision(id)
// This is the authoritative full result (works with OR without webhooks):
{
  "session_id": "ses_8f…",
  "status":     "APPROVED",
  "vendor_data":"valyd_225c7f2ac450496f97bbbc57354a5898",
  "valyd_id":  "valyd_225c7f2ac450496f97bbbc57354a5898",
  "checks": [
    { "type": "id_verification", "status": "passed", "data": { "reused": true } },
    { "type": "liveness",        "status": "passed" },
    { "type": "face_match",      "status": "passed", "score": 0.98 },
    { "type": "credential",      "status": "passed", "data": { "license": { "status": "active" } } },
    // location: a real GPS fix is mandatory. An expected point + radius_m was given, so the
    // status IS the verdict — "failed" (with an error message) if the clinician is outside it.
    { "type": "location",        "status": "passed", "data": { "distance_m": 12, "radius_m": 200, "match": true } }
  ],
  "identity": {
    "full_name": "Grace Lee Casado",
    "licenses": [ { "license_state": "CO", "status": "active", "expire_date": "2027-01-01" } ]
  },
  "decided_at": "2026-07-01T18:04:10Z"
}`;

type EnvKey = "development" | "staging" | "production";
// CONSOLE UNIFICATION: `dev` is the ONE console — it issues the OAuth client_id/client_secret,
// the Verify API key and the workflows. Verify itself is served by the IdP (no verify.* host).
interface EnvCfg { key: EnvKey; env: string; idp: string; verify: string; dev: string; docs: string; demo: string; }

const ENVIRONMENTS: Record<EnvKey, EnvCfg> = {
  development: { key: "development", env: "development", idp: "idp.valyd.work", verify: "idp.valyd.work", dev: "dev.valyd.work", docs: "docs.valyd.work", demo: "homehealth.valyd.work" },
  staging:     { key: "staging",     env: "staging",     idp: "idp.pollus.online", verify: "idp.pollus.online", dev: "dev.pollus.online", docs: "docs.pollus.online", demo: "homehealth.pollus.online" },
  production:  { key: "production",  env: "production",  idp: "idp.valyd.id", verify: "idp.valyd.id", dev: "dev.valyd.id", docs: "docs.valyd.id", demo: "homehealth.valyd.id" },
};

/** Detect the environment from the docs hostname (tech / online / valyd.id). */
function detectEnv(): EnvKey {
  const h = typeof window !== "undefined" ? window.location.hostname : "";
  if (h.includes("pollus.online")) return "staging";
  if (h.includes("valyd.id")) return "production";
  return "development"; // *.pollus.tech and localhost
}

function buildAiPrompt(c: EnvCfg): string {
  const isProd = c.key === "production";
  const envBlock = isProd
    ? `Environment: PRODUCTION (the SDK default) — no env flag needed:
  new Valyd({ clientId, clientSecret, apiKey })   // targets ${c.idp} / ${c.verify}`
    : `Environment (IMPORTANT): you are on ${c.key.toUpperCase()} — construct the SDK with env="${c.env}":
  new Valyd({ clientId, clientSecret, apiKey, env: "${c.env}" })
  This targets ${c.idp} (login) + ${c.verify} (Verify) + KYC. WITHOUT env the SDK defaults to PRODUCTION
  (valyd.id) and OAuth fails with "client_id/redirect_uri not allowed". One env switch sets IdP + Verify + KYC.`;
  return `You are integrating Verification APIs — EVV (Electronic Visit Verification) into my app.
Valyd proves the right, licensed clinician is physically at the right patient's home:
verified identity (KYC) + live medical license + face match + geolocation. It uses the
ACCOUNT / Managed-Identity model — the clinician logs in with Valyd once; their KYC and
license are stored and reused on later visits.

SDKs (install):
- Server (Node 18+):  npm i @valyd/sdk@^0.5.0    // valyd.auth (OAuth) + valyd.verify (checks)
- Browser:            no SDK — redirect the user to the hosted session url (Valyd hosts the capture)

${envBlock}

Credentials — ALL from ONE console, the dev portal at ${c.dev} (there is no separate Verify
console). Ask me for these; keep all server-side, never in the browser:
- VALYD_CLIENT_ID / VALYD_CLIENT_SECRET    — your OAuth app
- VALYD_API_KEY / VALYD_WEBHOOK_SECRET     — your Verify project (API key vrf_…, shown once)
- VALYD_WORKFLOW_ID                        — a "Home Health · EVV" workflow (id+liveness+face_match+credential+location)

Rules:
- new Valyd({...}) generates nothing — it only holds config; env picks the environment URLs.
- Get the Valyd token with valyd.auth.exchangeCode(code) AFTER the user logs in.
- Pass that token to sessions.create({ valydAccessToken }) — it goes in the SESSION, not the workflow;
  it identifies the person (valyd_id) and unlocks KYC/license reuse.
- KYC is NOT an API: if valyd.verify.kyc.isRequired(verifications) -> redirect to
  valyd.verify.kyc.redirectUrl({ returnTo }). The user completes KYC on Valyd and returns.
- Expected (patient-home) location is passed PER SESSION via metadata.expected_lat / expected_lng (+ radius_m).
- Capture GPS in the browser with captureLocation({ maxAccuracyM: 100 }).
- LOCATION SEMANTICS: a real GPS fix is ALWAYS mandatory — it can never be skipped, and a blocked
  permission or missing coordinates is a hard "failed". If you pass an expected point AND radius_m, the
  STATUS IS THE VERDICT: "passed" inside the radius, "failed" outside it (data.match true/false,
  data.distance_m the distance). Expected point but NO radius -> "passed" with data.match === null and only
  distance_m reported (you decide). No expected point -> capture-only "passed" with the coordinates.
  Do NOT treat location as report-only / always-passing.
- KYC + license are ONE-TIME onboarding steps (redirect to Valyd for KYC, verify license once). Do NOT put a
  KYC/license button on every visit. The recurring visit action is only: captureVisit() -> faceMatch + locationMatch.
- Use the SDK capture UI: captureVisit() (selfie + GPS), captureSelfie(), captureLocation() — no file inputs.
- ACCOUNT face = selfie only (matched to the stored Valyd vector); never ask the user for an ID/reference image.
- Webhooks are OPTIONAL. Default = poll sessions.decision(id) when the user returns. Add a webhook
  (constructEvent + decision) only if you want push/extra reliability (fires even if the user closes the tab).

Flow A — Hosted (Valyd renders the UI in a modal):
1. "Connect Valyd" button -> GET /evv/login -> res.redirect(valyd.auth.getAuthorizationUrl({ scope:["profile","verifications","doctor_license"] }))
2. GET /evv/callback?code= -> const { accessToken, user } = await valyd.auth.exchangeCode(code)
3. const s = await valyd.verify.sessions.create({ workflowId: VALYD_WORKFLOW_ID, valydAccessToken: accessToken,
     vendorData: user.valyd_id, metadata: { expected_lat, expected_lng }, redirectUrl, callback }); send s.url to the browser
4. Browser: redirect the user to the hosted url (window.location.href = url) — returning users do only the face scan
5. Webhook POST /webhooks/valyd: const e = valyd.verify.webhooks.constructEvent(raw, headers);
     const decision = await valyd.verify.sessions.decision(e.sessionId)   // source of truth

Flow B — Core APIs (your own UI):
1. Same Connect-Valyd login/callback to get accessToken.
2. KYC gate: if (valyd.verify.kyc.isRequired(await valyd.auth.getVerifications(accessToken))) redirect to kyc.redirectUrl.
3. License: await valyd.verify.standalone.credentialVerification({ licenseState, licenseType:"MD", licenseNumber })
     Provider is auto-resolved from state+type (default MD); the NAME comes from the account (don't pass it).
4. Visit (ACCOUNT = selfie only, matched to the stored Valyd face vector — NO idImage):
     build your own capture with navigator.mediaDevices + navigator.geolocation
     const face = await valyd.verify.standalone.faceMatch({ valydAccessToken: accessToken, selfie: v.selfie })
     const loc  = await valyd.verify.standalone.locationMatch({
       latitude: v.latitude, longitude: v.longitude, accuracy: v.accuracy,
       expectedLatitude, expectedLongitude, radiusM: 200 })   // POST /api/v2/location
     // radius given => loc.check.status is the verdict: "passed" inside, "failed" outside.
     const verified = face.check.status === "passed" && loc.check.status === "passed"

Reference: docs https://${c.docs}/evv · live demo https://${c.demo} ·
Verify API base https://${c.verify}/api/v2 (header X-API-Key).

Now: ask me for the credentials, then scaffold the server routes + a minimal UI for BOTH flows.
Put every secret in env vars and make all Valyd calls server-to-server.`;
}

const CAPTURE_CODE = `// Building your own capture UI (Core APIs path)? There is no Valyd browser
// SDK — use the browser's native camera + geolocation, then POST to your server.
const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
// draw a video frame to a <canvas>, then canvas.toDataURL("image/jpeg") -> selfie
const pos = await new Promise((res, rej) =>
  navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true }));
// POST { selfie, latitude: pos.coords.latitude, longitude: pos.coords.longitude }
// to YOUR server, which calls valyd.verify.standalone.* with your API key.`;

export default function EvvPage() {
  const [mode, setMode] = useState<"hosted" | "core">("hosted");
  const envCfg = ENVIRONMENTS[detectEnv()];
  const DEMO_URL = `https://${envCfg.demo}`;
  const aiPrompt = buildAiPrompt(envCfg);
  return (
    <div className="min-h-screen bg-background">
      <GlobalNav product="verify" />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-10">
        <Pill><Stethoscope className="h-3.5 w-3.5" /> Verification APIs · EVV</Pill>
        <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Electronic Visit Verification
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Prove the <strong>right clinician</strong> reached the <strong>right home</strong> — with verified
          identity, a live medical license, a face match, and geolocation. Built on Managed Identity, so
          clinicians verify once and reuse everywhere.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={DEMO_URL} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-95">
            Open the live demo <ExternalLink className="h-4 w-4" />
          </a>
          <Link to="/verify"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:border-primary">
            Full Verify docs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Live demo: <a href={DEMO_URL} target="_blank" rel="noreferrer" className="text-primary underline">{envCfg.demo}</a>
          {" "}· admin + clinician portals, both flows wired end-to-end.
        </p>
      </section>

      {/* What gets verified */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-5">What an EVV visit proves</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {checks.map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><c.icon className="h-5 w-5" /></div>
              <h3 className="font-semibold text-foreground">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The flow */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="rounded-2xl border border-border bg-muted/30 p-6">
          <h2 className="font-semibold text-foreground mb-4">The flow in four steps</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            {[
              { n: 1, t: "Connect Valyd", d: "Clinician logs in — your backend gets their access token." },
              { n: 2, t: "Create session", d: "Pass the token + workflow to Verify → binds the valyd_id." },
              { n: 3, t: "Capture", d: "Returning users just do the face + GPS in the hosted modal." },
              { n: 4, t: "Read decision", d: "Your backend reads the result by session id (API key)." },
            ].map((s) => (
              <li key={s.n} className="rounded-xl bg-card border border-border p-4">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold mb-2">{s.n}</span>
                <p className="font-semibold text-foreground">{s.t}</p>
                <p className="text-muted-foreground mt-0.5">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Before you start — keys + install */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Before you start</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Fingerprint className="h-5 w-5 text-primary" /> 1 · Get your keys</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              <strong className="text-foreground">One console.</strong> Sign in at{" "}
              <a href={`https://${envCfg.dev}`} target="_blank" rel="noreferrer" className="text-primary underline">{envCfg.dev}</a>{" "}
              — the dev portal issues <em>everything</em>. There is no separate Verify console.
            </p>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">OAuth client</span> (for “Connect Valyd”) — register an
                app → <code>client_id</code> + <code>client_secret</code>; add your redirect URI and the scopes{" "}
                <code>profile</code>, <code>verifications</code>, <code>doctor_license</code>.
              </li>
              <li>
                <span className="font-semibold text-foreground">Verify API key + workflow</span> — in the{" "}
                <strong>same portal</strong>, create a Verify project → copy the <code>API key</code> (
                <code>vrf_…</code>, shown once) + <code>webhook secret</code>. Then{" "}
                <strong>New workflow → “Home Health · EVV”</strong> (pre-selects ID, liveness, face match, license &
                location) → copy its <code>workflow_id</code>.
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">Keep <code>client_secret</code> and the <code>API key</code> server-side only.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Workflow className="h-5 w-5 text-primary" /> 2 · Install the SDKs</h3>
            <p className="mt-3 text-sm text-muted-foreground">Server (Node 18+) and browser:</p>
            <div className="mt-2">
              <CodeBlock language="bash" code={`# server: OAuth + Verify checks (v0.3+ has kyc.redirectUrl, evvPresence, locationMatch)
npm i @valyd/sdk@^0.5.0

# browser: the modal + high-accuracy location capture (v0.2+ has captureLocation)
# No browser SDK — hosted verification is a redirect to the session url`} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              No bundler? Load the browser SDK from a CDN:{" "}
              redirecting the user to the hosted session url (there is no browser SDK to include).
            </p>
          </div>
        </div>
      </section>

      {/* Quickstart — two modes */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h2 className="text-2xl font-bold text-foreground">Quickstart</h2>
          <div className="inline-flex rounded-lg border border-border p-1 bg-card">
            <button onClick={() => setMode("hosted")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md inline-flex items-center gap-1.5 ${mode === "hosted" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <ShieldCheck className="h-4 w-4" /> Hosted by Valyd
            </button>
            <button onClick={() => setMode("core")}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md inline-flex items-center gap-1.5 ${mode === "core" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <Workflow className="h-4 w-4" /> Core APIs
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 mb-4 text-sm text-muted-foreground flex items-start gap-2">
          <Building2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <span>
            <strong>One-time setup, one console:</strong> at{" "}
            <a href={`https://${envCfg.dev}`} target="_blank" rel="noreferrer" className="text-primary underline">{envCfg.dev}</a>{" "}
            register an app (get <code>client_id</code>, <code>client_secret</code>, <code>API key</code>) and build a
            workflow — pick the <strong>“Home Health · EVV”</strong> campaign (ID + liveness + face_match + credential
            + location) → <code>workflow_id</code>.
          </span>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 mb-4 text-sm text-foreground flex items-start gap-2">
          <Fingerprint className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <span>
            <strong>Both modes start the same way — "Connect Valyd".</strong> The clinician logs in with Valyd (OAuth),
            and your server gets their access token via <code>exchangeCode</code>. That token is what identifies the
            person, gates KYC, and unlocks license/identity reuse — in <em>both</em> Hosted and Core.
          </span>
        </div>

        {mode === "hosted" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Valyd renders the UI in a modal. Already-verified clinicians skip KYC + license and do <strong>only the face scan</strong>.</p>
            <CodeBlock language="javascript" title="Backend (Node) — Connect Valyd → session → decision" code={hostedCode(envCfg)} />
            <CodeBlock language="javascript" title="Browser — the Connect button + the modal" code={HOSTED_BROWSER} />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Your own UI calls Verify directly. It still begins with Connect Valyd (to get the token); KYC is a redirect to Valyd (no KYC API); the license and face+location run as Core API calls.</p>
            <CodeBlock language="javascript" title="Backend (Node) — Connect Valyd → KYC gate → license → EVV Presence" code={coreCode(envCfg)} />
            <CodeBlock language="javascript" title="Browser — the Connect Valyd button" code={CONNECT_NOTE} />
            <CodeBlock language="javascript" title="Browser — capture a trustworthy GPS fix" code={CAPTURE_CODE} />
          </div>
        )}
      </section>

      {/* Reading the result */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-foreground">Reading the result</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
          <strong>Webhooks are optional.</strong> Two ways to get the outcome — pick either. Both end at the same
          authoritative call: <code>sessions.decision(id)</code> (a.k.a. <code>GET /api/v2/session/&#123;id&#125;/decision</code>).
          The decision is the source of truth; the browser <code>status</code> and the webhook are just signals to go read it.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Workflow className="h-5 w-5 text-primary" /> Option A · Poll (no webhook)</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">Simplest. Read the decision when the user returns / the modal completes.</p>
            <div className="mt-2"><CodeBlock language="javascript" code={RESULT_POLL} /></div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Option B · Webhook (push)</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">More reliable (fires even if the user closes the tab). Configured <strong>per app</strong> in the console, or per session via <code>callback</code>.</p>
            <div className="mt-2"><CodeBlock language="json" code={WEBHOOK_EVENT} /></div>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold text-foreground mb-2">The decision response (what a verification returns)</h3>
          <CodeBlock language="json" title="sessions.decision(id)" code={DECISION_JSON} />
          <p className="mt-2 text-xs text-muted-foreground">
            <code>status</code> is the overall outcome; <code>checks[]</code> has one entry per check (with <code>score</code>/<code>data</code>);
            <code>identity</code> carries the reusable profile + licenses. <code>reused: true</code> marks steps skipped from the Valyd account.
          </p>
        </div>
      </section>

      {/* Hand to an AI assistant */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2"><Workflow className="h-5 w-5 text-primary" /> Integrate with your AI assistant</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
            Copy this prompt into <strong>Claude, Cursor, Copilot</strong> or any coding AI. It has the SDKs,
            the credentials to ask for, the rules, and both flows — the assistant will scaffold the integration
            in your stack. The URLs below are auto-set for the environment you're viewing:
            {" "}<span className="font-semibold text-primary">{envCfg.key}</span> ({envCfg.idp}).
          </p>
          <div className="mt-4">
            <CodeBlock language="markdown" title={`Prompt — paste into your AI assistant (${envCfg.key})`} code={aiPrompt} />
          </div>
        </div>
      </section>

      {/* Reuse callout */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-6">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Verify once, reuse forever</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
            Because EVV runs on <strong>Managed Identity</strong>, the first visit does full KYC + license; every
            visit after is <strong>just a face + location check</strong>. Licenses are re-checked against the board
            automatically, and identity/KYC live on Valyd — your app stores proofs, not documents.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={DEMO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              See it live <ExternalLink className="h-4 w-4" />
            </a>
            <Link to="/verify?mode=managed" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:border-primary">
              Managed Identity guide <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

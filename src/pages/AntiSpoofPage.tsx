import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ScanFace, ShieldCheck, ArrowRight, ExternalLink, CheckCircle2,
  XCircle, Loader2, Copy, Check, KeyRound, LogIn, Fingerprint,
} from "lucide-react";
import { GlobalNav } from "@/components/GlobalNav";
import { CodeBlock } from "@/components/docs/CodeBlock";
import {
  ANTISPOOF_IDP_BASE_URL, ANTISPOOF_APP_KEY, ANTISPOOF_WORKFLOW_ID,
  ANTISPOOF_CLIENT_ID, ANTISPOOF_CLIENT_SECRET, ANTISPOOF_SCOPES,
} from "@/components/docs/antispoof/constants";

// ── Live liveness / anti-spoof demo ─────────────────────────────────────────
// Runs entirely in the browser using the PUBLIC app key (X-API-Key). Flow:
//   1. POST /api/v2/session { workflow_id, vendor_data }  → hosted url
//   2. open the hosted url — the user does the live face capture there
//   3. poll GET /api/v2/session?vendor_data=…  → status + decision
// The app key is safe here: it can only start liveness sessions on the capped
// Cisive demo account. The client_secret is NEVER used by the browser.

type DemoState = "idle" | "opening" | "waiting" | "human" | "spoof" | "error";

// Session status vocabulary (VerificationSession::STATUS_*). Terminal states end the poll.
const STATUS_APPROVED = "APPROVED";
const TERMINAL = new Set(["APPROVED", "DECLINED", "ABANDONED", "EXPIRED"]);

const isTerminal = (status?: string) => !!status && TERMINAL.has(status.toUpperCase());
const isPass = (status?: string) => (status ?? "").toUpperCase() === STATUS_APPROVED;

function LiveDemo() {
  const [state, setState] = useState<DemoState>("idle");
  const [detail, setDetail] = useState<string>("");
  const pollRef = useRef<number | null>(null);

  const stopPolling = () => {
    if (pollRef.current) { window.clearInterval(pollRef.current); pollRef.current = null; }
  };

  const run = useCallback(async () => {
    setDetail("");
    setState("opening");
    const vendorData = `antispoof-demo-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    try {
      const res = await fetch(`${ANTISPOOF_IDP_BASE_URL}/api/v2/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": ANTISPOOF_APP_KEY },
        body: JSON.stringify({ workflow_id: ANTISPOOF_WORKFLOW_ID, vendor_data: vendorData }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setDetail(json?.message || json?.error || `Could not start session (HTTP ${res.status}).`);
        return;
      }
      const url = json?.data?.url;
      const sessionId = json?.data?.session_id;
      if (!url || !sessionId) { setState("error"); setDetail("No hosted session returned."); return; }

      // Open the hosted liveness capture in a new tab.
      window.open(url, "_blank", "noopener,noreferrer");
      setState("waiting");

      // Poll this session's decision (app-key auth) until it reaches a terminal state.
      let ticks = 0;
      pollRef.current = window.setInterval(async () => {
        ticks += 1;
        if (ticks > 150) { stopPolling(); setState("error"); setDetail("Timed out waiting for a result."); return; }
        try {
          const p = await fetch(
            `${ANTISPOOF_IDP_BASE_URL}/api/v2/session/${encodeURIComponent(sessionId)}/decision`,
            { headers: { "X-API-Key": ANTISPOOF_APP_KEY } },
          );
          const pj = await p.json().catch(() => ({}));
          const status: string | undefined = pj?.data?.status;
          if (!isTerminal(status)) return;
          stopPolling();
          if (isPass(status)) {
            setState("human");
            setDetail("Live human confirmed — liveness passed.");
          } else {
            setState("spoof");
            setDetail(`Not verified (status: ${status}).`);
          }
        } catch { /* transient — keep polling */ }
      }, 2000);
    } catch (e) {
      setState("error");
      setDetail(e instanceof Error ? e.message : "Network error.");
    }
  }, []);

  const busy = state === "opening" || state === "waiting";

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <ScanFace className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-foreground">Try the live anti-spoof check</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Click below, allow the camera in the tab that opens, and follow the prompts. Valyd runs a
            passive-liveness / presentation-attack check and tells you whether it's a real, live person.
          </p>

          <button
            onClick={run}
            disabled={busy}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanFace className="h-4 w-4" />}
            {state === "waiting" ? "Waiting for your face scan…" : state === "opening" ? "Starting…" : "Verify your face"}
          </button>

          {state === "waiting" && (
            <p className="mt-3 text-xs text-muted-foreground">
              A new tab opened for the capture. Finish it there — this box updates automatically.
            </p>
          )}
          {state === "human" && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" /> {detail}
            </div>
          )}
          {state === "spoof" && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
              <XCircle className="h-5 w-5" /> {detail}
            </div>
          )}
          {state === "error" && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-600 dark:text-amber-400">
              <XCircle className="h-5 w-5" /> {detail}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CredRow({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); };
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}{secret && " · server-side only"}</div>
        <code className="block truncate font-mono text-xs text-foreground">{value}</code>
      </div>
      <button onClick={copy} className="shrink-0 rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground" aria-label={`Copy ${label}`}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

// ── Ready-to-run server snippet (login → share details → verify face) ────────
const serverCode = `// server.js — Node 18+ (Express). Install: npm i express @valyd/sdk
// The client_secret and app key stay here on the server, never in the browser.
import express from "express";
import { ValydClient } from "@valyd/sdk";

const app = express();
const PORT = 3000;

const idp = new ValydClient({
  clientId:     "${ANTISPOOF_CLIENT_ID}",
  clientSecret: "${ANTISPOOF_CLIENT_SECRET}",
  redirectUri:  "http://localhost:${"3000"}/callback",
  baseUrl:      "${ANTISPOOF_IDP_BASE_URL}",
});

const APP_KEY     = "${ANTISPOOF_APP_KEY}";
const WORKFLOW_ID = "${ANTISPOOF_WORKFLOW_ID}";
const IDP         = "${ANTISPOOF_IDP_BASE_URL}";

// 1) Login button → send the user to Valyd to authorize.
app.get("/login", (_req, res) => {
  const url = idp.getAuthorizationUrl({
    scope: ${JSON.stringify([...ANTISPOOF_SCOPES])},
    state: "demo-" + Date.now(),
  });
  res.redirect(url);
});

// 2) Callback → exchange the code, then read the user's shared details/proofs.
app.get("/callback", async (req, res) => {
  const { accessToken } = await idp.exchangeCode(String(req.query.code));
  const me = await idp.getUserInfo(accessToken);   // { success, data: {...} }
  const u = me.data;
  res.json({
    valyd_id:       u.valyd_id,
    name:           u.full_name,
    id_verified:    u.id_verified,
    human_verified: u.verifications?.human_verified,
  });
});

// 3) Verify-face button → start a liveness-only session, return the hosted URL.
app.get("/verify-face", async (_req, res) => {
  const r = await fetch(IDP + "/api/v2/session", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": APP_KEY },
    body: JSON.stringify({ workflow_id: WORKFLOW_ID, vendor_data: "demo-" + Date.now() }),
  });
  const { data } = await r.json();
  // data = { session_id, status, url, session_token, features, expires_at }
  res.json({ sessionId: data.session_id, open: data.url });  // open this URL for the capture
});

// 4) Poll the decision until it reaches a terminal state.
//    status ∈ NOT_STARTED | IN_PROGRESS | IN_REVIEW | APPROVED | DECLINED | ABANDONED | EXPIRED
app.get("/result/:sessionId", async (req, res) => {
  const r = await fetch(IDP + "/api/v2/session/" + req.params.sessionId + "/decision", {
    headers: { "X-API-Key": APP_KEY },
  });
  const { data } = await r.json();
  res.json({
    status: data.status,
    human: data.status === "APPROVED",   // APPROVED → a real, live person
  });
});

app.listen(PORT, () => console.log("Anti-spoof demo on http://localhost:" + PORT + "/login"));`;

const browserCode = `<!-- index.html — the two buttons your server backs -->
<button onclick="location.href='/login'">Login with Valyd</button>

<button onclick="verifyFace()">Verify your face</button>
<script>
  async function verifyFace() {
    const { open } = await (await fetch('/verify-face')).json();
    window.open(open, '_blank');   // the hosted liveness capture
  }
</script>`;

export default function AntiSpoofPage() {
  return (
    <div className="min-h-screen bg-background">
      <GlobalNav product="verify" />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-14 pb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="h-3.5 w-3.5" /> Anti-spoof · Liveness
        </span>
        <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Prove there's a real, live person
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          A ready-to-go demo: let a user log in with Valyd and share their verified details, then run a
          passive-liveness check that flags presentation attacks — photos, masks, replays, deepfakes.
          Copy the credentials and the snippet below and you're running in minutes.
        </p>
      </section>

      {/* Live demo */}
      <section className="max-w-5xl mx-auto px-6 py-6">
        <LiveDemo />
      </section>

      {/* Credentials */}
      <section className="max-w-5xl mx-auto px-6 py-6">
        <div className="mb-3 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Demo credentials</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Public credentials on a capped demo account, so you can try everything immediately. In your
          own app, keep the <code className="font-mono text-xs">client_secret</code> and app key on your
          server. Create your own from the{" "}
          <a href="https://dev.valyd.id" className="text-primary underline" target="_blank" rel="noreferrer">Valyd Dev Portal</a>.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <CredRow label="OAuth client_id" value={ANTISPOOF_CLIENT_ID} />
          <CredRow label="OAuth client_secret" value={ANTISPOOF_CLIENT_SECRET} secret />
          <CredRow label="Verify app key" value={ANTISPOOF_APP_KEY} secret />
          <CredRow label="Liveness workflow_id" value={ANTISPOOF_WORKFLOW_ID} />
        </div>
      </section>

      {/* Flow */}
      <section className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: LogIn, title: "1 · Login with Valyd", desc: "Redirect to Valyd, the user authorizes, you get a code and exchange it server-side." },
            { icon: Fingerprint, title: "2 · Share details", desc: "Read the user's shared profile + proofs (valyd_id, name, human_verified) from get-userinfo." },
            { icon: ScanFace, title: "3 · Verify face", desc: "Start the liveness workflow, open the hosted capture, poll the decision — human or not." },
          ].map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></div>
              <div className="font-semibold text-foreground">{s.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Snippets */}
      <section className="max-w-5xl mx-auto px-6 py-6">
        <h2 className="mb-3 text-xl font-semibold text-foreground">Server (Node) — login, share details, verify face</h2>
        <CodeBlock code={serverCode} language="javascript" title="server.js" />
        <h2 className="mt-8 mb-3 text-xl font-semibold text-foreground">Browser — the two buttons</h2>
        <CodeBlock code={browserCode} language="html" title="index.html" />
      </section>

      {/* Footer nav */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-wrap gap-3">
          <Link to="/verify" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
            Verify docs <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="https://dev.valyd.id" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
            Dev Portal <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}

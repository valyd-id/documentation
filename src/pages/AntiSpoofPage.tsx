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
  ANTISPOOF_CLIENT_ID, ANTISPOOF_CLIENT_SECRET, ANTISPOOF_SCOPES, ANTISPOOF_IDENTITY_WORKFLOW_ID,
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

  const run = useCallback(async (workflowId: string = ANTISPOOF_WORKFLOW_ID) => {
    setDetail("");
    setState("opening");
    const vendorData = `antispoof-demo-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    try {
      const res = await fetch(`${ANTISPOOF_IDP_BASE_URL}/api/v2/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": ANTISPOOF_APP_KEY },
        body: JSON.stringify({ workflow_id: workflowId, vendor_data: vendorData }),
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
            // Show the interesting response fields right here: liveness score
            // and — on the uniqueness workflow — the stable valyd_ uuid.
            const v = pj?.data?.verifications ?? {};
            const score = v?.liveness?.human_score ?? v?.liveness?.score;
            const uuid = v?.face_uniqueness?.valyd_uuid;
            const reg = v?.face_uniqueness?.registered;
            let msg = `Live human confirmed — liveness passed${typeof score === "number" ? ` (score ${score})` : ""}.`;
            if (uuid) msg += ` Identity: ${uuid} (${reg === "new" ? "new face" : "already known"}).`;
            setDetail(msg);
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

          {/* Result banner FIRST — after a scan this is the thing the user came back to see. */}
          {state === "human" && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" /> <span className="break-all">{detail}</span>
            </div>
          )}
          {state === "spoof" && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
              <XCircle className="h-5 w-5 shrink-0" /> {detail}
            </div>
          )}
          {state === "error" && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-600 dark:text-amber-400">
              <XCircle className="h-5 w-5 shrink-0" /> {detail}
            </div>
          )}
          {state === "waiting" && (
            <p className="mt-3 text-sm text-muted-foreground">
              A new tab opened for the capture. Finish it there — this box updates automatically.
            </p>
          )}

          <p className="mt-2 text-sm text-muted-foreground">
            Click below, allow the camera in the tab that opens, and follow the prompts. Valyd runs a
            passive-liveness / presentation-attack check and tells you whether it's a real, live person.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => run()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanFace className="h-4 w-4" />}
              {state === "waiting" ? "Waiting for your face scan…" : state === "opening" ? "Starting…" : "Verify your face"}
            </button>
            {ANTISPOOF_IDENTITY_WORKFLOW_ID && (
              <button
                onClick={() => run(ANTISPOOF_IDENTITY_WORKFLOW_ID)}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
              >
                <Fingerprint className="h-4 w-4" /> Verify + identity (valyd_ uuid)
              </button>
            )}
          </div>

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

// ── Standalone Anti-Spoof API (no hosted UI) ────────────────────────────────
const apiCode = `# Single image — pixels-only analysis (assurance "upload", score capped at 85)
curl -X POST ${ANTISPOOF_IDP_BASE_URL}/api/v2/antispoof \\\\
  -H "X-API-Key: \$APP_KEY" \\\\
  -F "image=@selfie.jpg"

# Frame burst (recommended) — 3-8 chronological stills captured over ~2s.
# Adds per-frame voting, motion analysis and same-person consistency.
curl -X POST ${ANTISPOOF_IDP_BASE_URL}/api/v2/antispoof \\\\
  -H "X-API-Key: \$APP_KEY" \\\\
  -F "frames[]=@frame1.jpg" -F "frames[]=@frame2.jpg" -F "frames[]=@frame3.jpg" \\\\
  -F "frames[]=@frame4.jpg" -F "frames[]=@frame5.jpg"`;

const apiResponse = `{
  "success": true,
  "data": {
    "check": {
      "type": "antispoof",
      "status": "passed",            // passed | failed
      "score": 100,                  // human_score, 0-100
      "data": {
        "assurance": "burst",        // upload | burst | captured (hosted flow)
        "frames_received": 5,
        "frames_analyzed": 5,
        "frames_genuine": 5,
        "frames_spoof": 0,
        "frames_no_face": 0,
        "duplicate_frames": 0,
        "motion": "natural",
        "face_consistency": "consistent",
        "human_score": 100
      },
      "error": null                  // on fail: human-readable reason
    }
  }
}
// Failure signals in data.signal: no_face | spoof_detected | low_confidence |
// duplicate_frames | static_capture | discontinuous_motion | different_faces`;

// ── Anti-spoof + identity — same input, plus the person's stable valyd_ uuid ─
const identityCode = `# Liveness + WHO: passes the same anti-spoof pipeline first, then resolves the
# proven-live face against the global gallery. One face = one valyd_ uuid,
# stable across all your requests — perfect for duplicate-account detection.
curl -X POST ${ANTISPOOF_IDP_BASE_URL}/api/v2/antispoof/identity \\\\
  -H "X-API-Key: \$APP_KEY" \\\\
  -F "frames[]=@frame1.jpg" -F "frames[]=@frame2.jpg" -F "frames[]=@frame3.jpg"`;

const identityResponse = `{
  "check": {
    "type": "antispoof",
    "status": "passed",
    "data": {
      "human_score": 100,
      "identity": {
        "valyd_uuid": "valyd_f35fecf0f5474a0f94f097497366d881",
        "registered": "existing"     // "new" = first time we've seen this face
      }
    }
  }
}
// If liveness fails, no identity lookup runs (and none is billed).`;

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
          multi-layer liveness check that flags presentation attacks — printed photos, masks, screen
          replays. The hosted capture adds burst motion analysis and a random on-screen action, so
          pre-recorded or injected media can't know what to perform.
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

      {/* Standalone API */}
      <section className="max-w-5xl mx-auto px-6 py-6">
        <h2 className="mb-3 text-xl font-semibold text-foreground">Standalone API — send us the media, get a human score</h2>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          No hosted UI: your backend posts a selfie (or, better, a short burst of frames) and receives a{" "}
          <code className="font-mono text-xs">human_score</code> (0–100) with a passed/failed verdict. Sending
          3–8 frames captured over ~2 seconds raises detection accuracy significantly — single images are
          analysis-only and capped at 85. The <code className="font-mono text-xs">assurance</code> field always
          tells you how the media reached us; only the hosted capture flow can produce{" "}
          <code className="font-mono text-xs">captured</code>, which adds a random on-screen action the user
          must perform.
        </p>
        <CodeBlock code={apiCode} language="bash" title="POST /api/v2/antispoof" />
        <div className="mt-4" />
        <CodeBlock code={apiResponse} language="json" title="Response" />
      </section>

      {/* Anti-spoof + identity */}
      <section className="max-w-5xl mx-auto px-6 py-6">
        <h2 className="mb-3 text-xl font-semibold text-foreground">Anti-spoof + identity — liveness and who it is, in one call</h2>
        <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
          <code className="font-mono text-xs">POST /api/v2/antispoof/identity</code> runs the identical
          anti-spoof pipeline, and when it passes, resolves the proven-live face against the global Valyd
          face gallery: every unique face maps to one stable{" "}
          <code className="font-mono text-xs">valyd_</code> uuid. Use it to stop duplicate accounts —
          the same person always resolves to the same uuid, no matter what name or email they sign up
          with. Available in the hosted flow too: add the{" "}
          <code className="font-mono text-xs">face_uniqueness</code> feature to your workflow and the
          session decision carries the uuid.
        </p>
        <CodeBlock code={identityCode} language="bash" title="POST /api/v2/antispoof/identity" />
        <div className="mt-4" />
        <CodeBlock code={identityResponse} language="json" title="Response" />
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

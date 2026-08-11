import { Beaker, ScanFace, IdCard, BadgeCheck, ShieldCheck, MapPin, FileBadge, ArrowUpRight } from "lucide-react";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { VERIFY_CONFIG } from "@/lib/verify-config";

const BASE = VERIFY_CONFIG.API_BASE_URL;
// The live, no-signup verification playground. Each button below opens a SPECIFIC flow directly
// (via ?flow=<id>) in a new tab — the exact experience your end users get, no embedded iframe.
const DEMO_URL = import.meta.env.VITE_DEMOS_BASE_URL ?? "https://demos.valyd.work";

type Demo = {
  id: string;
  label: string;
  desc: string;
  icon: typeof ScanFace;
};

// ids map 1:1 to the workflow ids the sandbox understands (see demos.valyd.work/src/lib/workflows).
const DEMOS: Demo[] = [
  { id: "core-kyc", label: "Core KYC", desc: "ID + liveness + face match", icon: IdCard },
  { id: "kyc-license", label: "KYC + License", desc: "Full KYC plus a professional license", icon: BadgeCheck },
  { id: "liveness", label: "Liveness", desc: "Anti-spoof selfie check", icon: ScanFace },
  { id: "face-auth", label: "Face Auth", desc: "Match a selfie to the ID portrait", icon: ShieldCheck },
  { id: "license", label: "License", desc: "Verify a professional credential", icon: FileBadge },
  { id: "location-match", label: "Location", desc: "Confirm the user is in-region", icon: MapPin },
];

const Row = ({ method, path, desc }: { method: string; path: string; desc: string }) => (
  <tr className="border-t border-border">
    <td className="px-4 py-2"><span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">{method}</span></td>
    <td className="px-4 py-2 font-mono text-xs">{path}</td>
    <td className="px-4 py-2 text-sm text-muted-foreground">{desc}</td>
  </tr>
);

export const DemoEndpointsSection = () => (
  <section id="api-demo" className="scroll-mt-8 space-y-4">
    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
      <Beaker className="h-6 w-6 text-primary" /> Try it live
    </h2>
    <p className="text-sm text-muted-foreground">
      A public, no-signup sandbox for running a verification end to end. It spins up a short-lived
      demo project server-side, so these calls need <strong>no API key</strong>. Pick a flow below to
      launch the real experience — capture a selfie, upload an ID, run the checks — in a new tab.
    </p>

    {/* Good-looking launch buttons — each opens a specific flow directly (no iframe). */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {DEMOS.map(({ id, label, desc, icon: Icon }) => (
        <a
          key={id}
          href={`${DEMO_URL}/?flow=${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 font-semibold text-foreground">
              {label}
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
            </span>
            <span className="block text-xs text-muted-foreground">{desc}</span>
          </span>
        </a>
      ))}
    </div>

    <div className="pt-2">
      <p className="text-sm font-semibold text-foreground mb-2">Or wire it yourself</p>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Method</th>
              <th className="text-left px-4 py-3 font-medium">Path</th>
              <th className="text-left px-4 py-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            <Row method="POST" path="/api/demo/start" desc="Start a demo session — returns { session_id, session_token, features }" />
            <Row method="GET" path="/api/demo/status/{id}" desc="Poll the demo session's decision and per-check results" />
            <Row method="POST" path="/api/demo/antispoof" desc="Liveness trial — send image or frames[], returns human_score + verdict" />
            <Row method="POST" path="/api/demo/face-uniqueness" desc="Face uniqueness trial — send selfie or frames[], returns valyd_uuid + registered" />
          </tbody>
        </table>
      </div>
    </div>

    <CodeBlock
      language="bash"
      code={`# 1) Start a demo session (no API key)
curl -X POST ${BASE}/api/demo/start \\
  -H "Content-Type: application/json" \\
  -d '{ "features": ["id_verification", "liveness", "face_match"] }'
# -> { "success": true, "data": { "session_id": "...", "session_token": "vst_...", "features": [...] } }

# 2) Drive the session with the hosted API using the session_token, then read the result
curl ${BASE}/api/demo/status/SESSION_ID`}
    />

    <div className="pt-4">
      <p className="text-sm font-semibold text-foreground mb-1">Instant trial — Liveness &amp; Face Uniqueness</p>
      <p className="text-sm text-muted-foreground mb-2">
        These two checks have a direct no-key trial. Just POST an image (or a 3-8 frame burst) and get
        the real result back — the same response your integration receives in production. No signup.
      </p>
      <CodeBlock
        language="bash"
        code={`# Liveness (anti-spoof) — one selfie
curl -X POST ${BASE}/api/demo/antispoof -F "image=@./selfie.jpg"
# -> { "check": { "status": "passed", "data": { "human_score": 98.6, "assurance": "upload" } } }

# Liveness — live burst (3-8 frames): the strongest check
curl -X POST ${BASE}/api/demo/antispoof \\
  -F "frames[]=@./f0.jpg" -F "frames[]=@./f1.jpg" -F "frames[]=@./f2.jpg"

# Face uniqueness — one face = one user
curl -X POST ${BASE}/api/demo/face-uniqueness -F "selfie=@./selfie.jpg"
# -> { "check": { "data": { "valyd_uuid": "valyd_66e13c...", "registered": "new" } } }`}
      />
    </div>
  </section>
);

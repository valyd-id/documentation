import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  Play,
  Info,
  Check,
  Sparkles,
  KeyRound,
  ExternalLink,
  Shield,
  Fingerprint,
  Boxes,
  Lock,
  Terminal,
} from "lucide-react";
import { CredentialsBlock } from "@/components/docs/sandbox/CredentialsBlock";
import { DemoUserPicker } from "@/components/docs/sandbox/DemoUserPicker";
import { ScopePicker } from "@/components/docs/sandbox/ScopePicker";
import { PasteInput } from "@/components/docs/sandbox/PasteInput";
import { JsonPanel } from "@/components/docs/sandbox/JsonPanel";
import { SnippetTabs } from "@/components/docs/sandbox/SnippetTabs";
import { DEFAULT_SCOPES, type DemoUser } from "@/components/docs/sandbox/constants";
import {
  issueCode,
  exchangeToken,
  getUserinfo,
  getLicenses,
  getVerifications,
  refreshAccessToken,
  type ApiResult,
} from "@/components/docs/sandbox/sandboxClient";
import {
  step1Snippet,
  step2Snippet,
  bearerSnippet,
  refreshSnippet,
} from "@/components/docs/sandbox/snippets";
import { decodeJwtPayload } from "@/components/docs/sandbox/jwt";
import { cn } from "@/lib/utils";

type EndpointKey =
  | "issue-code"
  | "exchange-token"
  | "userinfo"
  | "licenses"
  | "verifications"
  | "refresh";

type Tokens = {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
};

interface EndpointMeta {
  key: EndpointKey;
  method: "GET" | "POST";
  label: string;
  path: string;
  description: string;
}

const ENDPOINTS: EndpointMeta[] = [
  {
    key: "issue-code",
    method: "POST",
    label: "Get Authorization Code",
    path: "/api/auth/sandbox/issue-code",
    description:
      "Issues a short-lived OAuth code for the selected demo user. Sandbox-only shortcut that mirrors the real authorize step.",
  },
  {
    key: "exchange-token",
    method: "POST",
    label: "Exchange Code for Token",
    path: "/api/auth/oidc/token",
    description:
      "Exchanges the authorization code from Step 1 for an access_token, id_token and refresh_token.",
  },
  {
    key: "userinfo",
    method: "GET",
    label: "Get User Info",
    path: "/api/auth/tpsso/userinfo",
    description:
      "Returns the authenticated user's profile claims. Sends the access_token as `Authorization: Bearer …`.",
  },
  {
    key: "licenses",
    method: "GET",
    label: "Get Licenses",
    path: "/api/auth/tpsso/licenses",
    description:
      "Returns verified professional licenses (medical / nursing) attached to the user.",
  },
  {
    key: "verifications",
    method: "GET",
    label: "Get Verifications",
    path: "/api/auth/tpsso/verifications",
    description:
      "Returns verifiable credentials the user has presented to the IDP.",
  },
  {
    key: "refresh",
    method: "POST",
    label: "Refresh Access Token",
    path: "/api/auth/oidc/token",
    description:
      "Uses the refresh_token from Step 2 to mint a fresh access_token via the OIDC token endpoint (grant_type=refresh_token).",
  },
];

const methodColors: Record<"GET" | "POST", string> = {
  GET: "bg-emerald-50 text-emerald-700 border-emerald-200",
  POST: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export const TryApisContent = () => {
  const [protocol, setProtocol] = useState<"oauth2" | "oidc" | "mcp" | null>(null);
  const [active, setActive] = useState<EndpointKey>("issue-code");

  const [demoUser, setDemoUserState] = useState<DemoUser>("nurse");
  const [scopes, setScopesState] = useState<Set<string>>(new Set(DEFAULT_SCOPES));

  const resetFlow = () => {
    setCodeInput("");
    setAccessTokenInput("");
    setRefreshTokenInput("");
    setTokens(null);
    setResults({});
    setActive("issue-code");
  };

  const setDemoUser = (v: DemoUser) => {
    if (v === demoUser) return;
    setDemoUserState(v);
    resetFlow();
  };
  const setScopes = (s: Set<string>) => {
    setScopesState(s);
    resetFlow();
  };

  const [codeInput, setCodeInput] = useState("");
  const [accessTokenInput, setAccessTokenInput] = useState("");
  const [refreshTokenInput, setRefreshTokenInput] = useState("");

  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [results, setResults] = useState<Partial<Record<EndpointKey, ApiResult>>>({});
  const [loading, setLoading] = useState<Partial<Record<EndpointKey, boolean>>>({});

  const scopeList = useMemo(() => Array.from(scopes), [scopes]);
  const activeMeta = ENDPOINTS.find((e) => e.key === active)!;
  const activeIndex = ENDPOINTS.findIndex((e) => e.key === active);
  const activeResult = results[active] ?? null;

  const setRes = (k: EndpointKey, r: ApiResult) =>
    setResults((prev) => ({ ...prev, [k]: r }));
  const setLoad = (k: EndpointKey, v: boolean) =>
    setLoading((prev) => ({ ...prev, [k]: v }));

  const run = async () => {
    setLoad(active, true);
    try {
      if (active === "issue-code") {
        const res = await issueCode(demoUser, scopeList);
        setRes("issue-code", res);
        const issuedCode =
          res.body?.code ||
          res.body?.authorization_code ||
          res.body?.auth_code ||
          res.body?.data?.code;
        if (res.ok && issuedCode) setCodeInput(issuedCode);
      } else if (active === "exchange-token") {
        const c = codeInput.trim();
        if (!c) return;
        const res = await exchangeToken(c);
        setRes("exchange-token", res);
        if (res.ok && res.body?.access_token) {
          const t = res.body as Tokens;
          setTokens(t);
          setAccessTokenInput(t.access_token);
          setRefreshTokenInput(t.refresh_token ?? "");
        }
      } else if (active === "refresh") {
        const rt = refreshTokenInput.trim();
        if (!rt) return;
        const res = await refreshAccessToken(rt);
        setRes("refresh", res);
        if (res.ok && res.body?.access_token) {
          setAccessTokenInput(res.body.access_token);
          if (res.body.refresh_token) setRefreshTokenInput(res.body.refresh_token);
        }
      } else {
        const t = accessTokenInput.trim();
        if (!t) return;
        const fn =
          active === "userinfo"
            ? getUserinfo
            : active === "licenses"
            ? getLicenses
            : getVerifications;
        const res = await fn(t);
        setRes(active, res);
      }
    } finally {
      setLoad(active, false);
    }
  };

  const snippet =
    active === "issue-code"
      ? step1Snippet(demoUser, scopeList)
      : active === "exchange-token"
      ? step2Snippet(codeInput || null)
      : active === "refresh"
      ? refreshSnippet(refreshTokenInput || null)
      : bearerSnippet(activeMeta.path, accessTokenInput || null);

  const runDisabled =
    (active === "exchange-token" && !codeInput.trim()) ||
    (active === "refresh" && !refreshTokenInput.trim()) ||
    (["userinfo", "licenses", "verifications"].includes(active) &&
      !accessTokenInput.trim());

  const isLoading = !!loading[active];

  const decodedIdToken = useMemo(
    () => (tokens?.id_token ? decodeJwtPayload(tokens.id_token) : null),
    [tokens?.id_token]
  );

  const completed = (k: EndpointKey) => results[k]?.ok === true;

  return (
    <>
      {/* Hero header */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/[0.06] via-primary/[0.02] to-background">
        {/* Soft accent glow, no image — keeps the page light and consistent. */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />

        <motion.div
          className="relative max-w-5xl mx-auto px-6 pt-14 pb-14 sm:pt-16 sm:pb-16"
          initial="hidden"
          animate="show"
          variants={containerVariants}
        >
          <div className="max-w-3xl">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur border border-white/80 px-3 py-1 mb-5 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold tracking-wide text-foreground/80">
                Interactive Sandbox
              </span>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              API Playground
            </h1>
            <p className="text-base sm:text-lg text-foreground/70 mt-4 max-w-2xl leading-relaxed">
              Run real OAuth + OIDC requests against the Valyd sandbox. Pick a demo user,
              choose scopes, and walk through the full flow — from authorization code to
              userinfo — without writing a single line of code.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/docs"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Read the full documentation
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Protocol picker */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={containerVariants}
        >
          {([
            { id: "oauth2", label: "OAuth 2.0", desc: "Authorization code flow with demo users and scopes.", icon: Shield, enabled: true },
            { id: "oidc", label: "OpenID Connect", desc: "Identity layer on top of OAuth 2.0.", icon: Fingerprint, enabled: false },
            { id: "mcp", label: "MCP", desc: "Model Context Protocol endpoints.", icon: Boxes, enabled: false },
          ] as const).map((p) => {
            const Icon = p.icon;
            const selected = protocol === p.id;
            return (
              <motion.button
                key={p.id}
                variants={itemVariants}
                onClick={() => p.enabled && setProtocol(p.id as "oauth2")}
                disabled={!p.enabled}
                className={cn(
                  "relative text-left rounded-xl border bg-card p-5 transition-all overflow-hidden group",
                  selected
                    ? "border-primary shadow-md ring-2 ring-primary/20"
                    : p.enabled
                    ? "border-border hover:border-primary/40 hover:shadow-sm cursor-pointer"
                    : "border-border opacity-60 cursor-not-allowed"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {!p.enabled ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      <Lock className="h-3 w-3" /> Coming soon
                    </span>
                  ) : selected ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary">
                      <Check className="h-3 w-3" /> Selected
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Available
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{p.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.button>
            );
          })}
        </motion.div>

        {/* SDK starter repo */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-indigo-50 via-card to-card p-6 sm:p-8"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(rgba(0,0,0,0) 1.5px, hsl(var(--background)) 1px)",
              backgroundSize: "14px 14px",
            }}
            aria-hidden
          />
          <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 mb-3 text-[11px] font-semibold uppercase tracking-wider">
                <Terminal className="h-3.5 w-3.5" />
                Run locally
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Want the real OAuth flow? Clone the SDK starter.
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                A minimal Express app wired up with <code className="font-mono">@valyd/sdk@^0.2.0</code> —
                including <code className="font-mono">createLoginSession</code> /{" "}
                <code className="font-mono">verifyLoginSession</code> for CSRF. The full redirect-and-consent
                flow on your localhost in three commands.
              </p>
              <pre className="mt-4 rounded-md bg-slate-950 text-slate-100 text-xs font-mono p-3 overflow-auto">
{`git clone https://github.com/valyd-id/valyd-sandbox-starter.git
cd valyd-sandbox-starter
npm install
cp .env.example .env   # fill in client id/secret
npm run dev`}
              </pre>
              <p className="mt-3 text-xs text-muted-foreground">
                Then open <code className="font-mono">http://localhost:8080</code>. Edit{" "}
                <code className="font-mono">src/config.ts</code> or <code className="font-mono">.env</code> to repoint
                at any Valyd environment.
              </p>
            </div>
            <a
              href="https://github.com/valyd-id/valyd-sandbox-starter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold shadow-sm hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              View on GitHub
              <ExternalLink className="h-4 w-4 opacity-90" />
            </a>
          </div>
        </motion.section>

        <AnimatePresence mode="wait">
          {protocol !== "oauth2" ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center"
            >
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Pick a protocol to get started</h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
                Select <span className="font-medium text-foreground">OAuth 2.0</span> above to explore credentials, endpoints and run live requests.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="oauth2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* TOP: Credentials banner */}
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-border flex items-center gap-2 bg-gradient-to-r from-primary/5 to-transparent">
                  <KeyRound className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sandbox Credentials
                  </h3>
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    Shared across every request below
                  </span>
                </div>
                <div className="p-4">
                  <CredentialsBlock />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_300px] gap-6 items-start">
                {/* LEFT: Endpoint list */}
                <aside className="lg:sticky lg:top-20 rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-border">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Endpoints
                    </h2>
                  </div>
                  <motion.ul
                    className="p-2 space-y-0.5"
                    initial="hidden"
                    animate="show"
                    variants={containerVariants}
                  >
                    {ENDPOINTS.map((ep, i) => {
                      const isActive = ep.key === active;
                      const done = completed(ep.key);
                      return (
                        <motion.li key={ep.key} variants={itemVariants}>
                          <button
                            onClick={() => setActive(ep.key)}
                            className={cn(
                              "w-full text-left rounded-lg px-2.5 py-2 flex items-center gap-2.5 transition-all group",
                              isActive
                                ? "bg-primary/10 text-foreground"
                                : "hover:bg-muted text-foreground/80"
                            )}
                          >
                            <span
                              className={cn(
                                "shrink-0 h-5 w-5 rounded-full text-[10px] font-semibold inline-flex items-center justify-center transition-colors",
                                done
                                  ? "bg-emerald-500 text-white"
                                  : isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground group-hover:bg-background"
                              )}
                            >
                              {done ? <Check className="h-3 w-3" /> : i + 1}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-sm font-medium truncate">
                                {ep.label}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded",
                                ep.method === "GET"
                                  ? "text-emerald-700 bg-emerald-100"
                                  : "text-indigo-700 bg-indigo-100"
                              )}
                            >
                              {ep.method}
                            </span>
                          </button>
                        </motion.li>
                      );
                    })}
                  </motion.ul>
                </aside>

                {/* CENTER: Request + Response */}
                <section className="space-y-5 min-w-0">
                  {/* Header card */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-border bg-gradient-to-br from-card to-slate-50/50">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <span className="font-mono">Step {activeIndex + 1} of {ENDPOINTS.length}</span>
                            <span>·</span>
                            <span>API Playground</span>
                          </div>
                          <h2 className="text-xl font-semibold text-foreground tracking-tight">
                            {activeMeta.label}
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                            {activeMeta.description}
                          </p>
                          <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5">
                            <span
                              className={cn(
                                "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border",
                                methodColors[activeMeta.method]
                              )}
                            >
                              {activeMeta.method}
                            </span>
                            <code className="text-xs font-mono text-foreground break-all">
                              {activeMeta.path}
                            </code>
                          </div>
                        </div>
                        <button
                          onClick={run}
                          disabled={isLoading || runDisabled}
                          title={runDisabled ? "Fill in the required input first" : undefined}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4 fill-current" />
                          )}
                          Send Request
                        </button>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="px-6 py-4 space-y-4">
                      {active === "exchange-token" && (
                        <PasteInput
                          label="Authorization code"
                          value={codeInput}
                          onChange={setCodeInput}
                          placeholder="Paste the code from Get Authorization Code"
                          hint="auto-filled when Step 1 runs"
                        />
                      )}
                      {(active === "userinfo" ||
                        active === "licenses" ||
                        active === "verifications") && (
                        <PasteInput
                          label="Access token"
                          value={accessTokenInput}
                          onChange={setAccessTokenInput}
                          placeholder="Paste the access_token from Exchange Code for Token"
                          hint="auto-filled when Step 2 runs"
                        />
                      )}
                      {active === "refresh" && (
                        <PasteInput
                          label="Refresh token"
                          value={refreshTokenInput}
                          onChange={setRefreshTokenInput}
                          placeholder="Paste the refresh_token from Exchange Code for Token"
                          hint="auto-filled when Step 2 runs"
                        />
                      )}
                      {active === "issue-code" && (
                        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground flex items-start gap-2">
                          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                          Uses the Demo User and Scopes from the right panel. Tweak them and re-run to compare responses.
                        </div>
                      )}

                      <SnippetTabs snippet={snippet} />
                    </div>
                  </div>

                  {/* Response card */}
                  <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-gradient-to-r from-slate-50/80 to-card">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <h3 className="text-sm font-semibold text-foreground">Response</h3>
                      </div>
                      {activeResult && (
                        <span
                          className={cn(
                            "text-xs font-mono font-semibold px-2 py-0.5 rounded",
                            activeResult.ok
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {activeResult.status === 0 ? "ERR" : activeResult.status}
                        </span>
                      )}
                    </div>
                    <div className="p-5 space-y-4">
                      <JsonPanel
                        data={activeResult?.body ?? null}
                        ok={activeResult?.ok}
                        status={activeResult?.status}
                        placeholder="Click Send Request to see the response here."
                      />

                      {active === "exchange-token" && decodedIdToken && (
                        <div className="pt-2">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                            Decoded id_token payload
                          </div>
                          <JsonPanel data={decodedIdToken} ok status={200} label="id_token" />
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* RIGHT: Configuration */}
                <aside className="lg:sticky lg:top-20 space-y-4">
                  <DemoUserPicker value={demoUser} onChange={setDemoUser} />
                  <ScopePicker selected={scopes} onChange={setScopes} />
                  <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-[11px] text-foreground/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Sparkles className="h-3 w-3 text-primary" />
                      Recommended scopes
                    </div>
                    <p className="leading-relaxed">
                      Start with <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-background border border-border">profile verifications</code> — enough to exercise the license and verification endpoints.
                    </p>
                    <ul className="space-y-0.5 leading-relaxed">
                      <li>• Add <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-background border border-border">doctor_license</code> only when the <span className="font-medium">Doctor</span> demo user is selected.</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                    Changing the Demo User or Scopes resets the flow so you start fresh from Step 1.
                  </div>
                </aside>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

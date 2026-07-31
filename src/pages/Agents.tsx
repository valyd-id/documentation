import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  FileJson,
  FileText,
  Download,
  Check,
  Copy,
  Puzzle,
  Package,
  ArrowRight,
} from "lucide-react";
import { GlobalNav } from "@/components/GlobalNav";
import { cn } from "@/lib/utils";

// ── Inline CodeBlock (no dep on the docs CodeBlock component's styling constraints) ──
const CodeSnippet = ({ code, language = "bash" }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-lg border border-border bg-muted/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/80">
        <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
          {language}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="px-4 py-3 overflow-x-auto text-sm font-mono text-foreground leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// ── Resource card ──
interface ResourceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  badge?: string;
  badgeColor?: "cyan" | "emerald" | "muted";
  secondaryHref?: string;
  secondaryLabel?: string;
  snippet?: string;
  snippetLang?: string;
}

const ResourceCard = ({
  icon,
  title,
  description,
  primaryHref,
  primaryLabel,
  badge,
  badgeColor = "muted",
  secondaryHref,
  secondaryLabel,
  snippet,
  snippetLang,
}: ResourceCardProps) => {
  const badgeClass = {
    cyan: "bg-primary/10 text-primary border-primary/20",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    muted: "bg-muted text-muted-foreground border-border",
  }[badgeColor];

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-5 hover:border-primary/30 hover:shadow-soft transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
            {icon}
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        {badge && (
          <span
            className={cn(
              "shrink-0 text-[10px] font-semibold uppercase tracking-wider border rounded-full px-2 py-0.5",
              badgeClass
            )}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      {snippet && <CodeSnippet code={snippet} language={snippetLang} />}
      <div className="flex items-center gap-3 mt-auto pt-1">
        <a
          href={primaryHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {primaryLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
        {secondaryHref && secondaryLabel && (
          <a
            href={secondaryHref}
            download
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            {secondaryLabel}
          </a>
        )}
      </div>
    </div>
  );
};

const MCP_CONFIG = `{
  "mcpServers": {
    "valyd": {
      "command": "npx",
      "args": ["-y", "@valyd/mcp-server"],
      "env": {
        "VALYD_CLIENT_ID": "<your-client-id>",
        "VALYD_CLIENT_SECRET": "<your-client-secret>",
        "VALYD_API_KEY": "<your-verify-api-key>"
      }
    }
  }
}`;

const CURL_EXAMPLES = `# Machine-readable docs index
curl -sL https://docs.valyd.id/llms.txt

# Full corpus — inject into a model context window
curl -sL https://docs.valyd.id/llms-full.txt

# OpenAPI specs
curl -sL https://docs.valyd.id/openapi/valyd-id.json
curl -sL https://docs.valyd.id/openapi/valyd-verify.json`;

const Agents = () => (
  <div className="min-h-screen bg-background">
    <GlobalNav product="home" />

    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
      {/* ── Hero ── */}
      <div className="mb-12 space-y-3">
        <div className="flex items-center gap-2 text-primary mb-4">
          <Bot className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">For AI agents</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
          Valyd for AI agents & copilots
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Machine-readable specs, context files, and tooling so agents can discover, understand,
          and call the Valyd APIs without scraping the docs site.
        </p>
      </div>

      {/* ── Quick fetch ── */}
      <section className="mb-12 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Quick fetch</h2>
        <CodeSnippet code={CURL_EXAMPLES} language="bash" />
      </section>

      {/* ── Resource grid ── */}
      <section className="mb-14 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Resources</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ResourceCard
            icon={<FileText className="h-4 w-4" />}
            title="llms.txt"
            badge="Standard"
            badgeColor="cyan"
            description="Machine-readable docs index following the llms.txt spec. One fetch gives an agent the full hierarchy, base URLs, credential rules, and links to every page as clean Markdown."
            primaryHref="/llms.txt"
            primaryLabel="View llms.txt"
            secondaryHref="/llms.txt"
            secondaryLabel="Download"
            snippet="curl -sL https://docs.valyd.id/llms.txt"
            snippetLang="bash"
          />

          <ResourceCard
            icon={<FileText className="h-4 w-4" />}
            title="llms-full.txt"
            description="Single-file corpus — every docs page concatenated and delimited. Inject the whole thing into a model context window for offline reasoning without additional fetches."
            primaryHref="/llms-full.txt"
            primaryLabel="View llms-full.txt"
            secondaryHref="/llms-full.txt"
            secondaryLabel="Download"
            snippet="curl -sL https://docs.valyd.id/llms-full.txt"
            snippetLang="bash"
          />

          <ResourceCard
            icon={<FileJson className="h-4 w-4" />}
            title="Valyd ID OpenAPI"
            badge="OpenAPI 3.1"
            badgeColor="cyan"
            description="Full OpenAPI 3.1 spec for TPSSO and OIDC endpoints — schemas, auth, error envelopes, and response examples. Use for SDK codegen, Copilot plugins, and endpoint discovery."
            primaryHref="/docs/api-reference"
            primaryLabel="Browse in docs"
            secondaryHref="/openapi/valyd-id.json"
            secondaryLabel="Download JSON"
            snippet="curl -sL https://docs.valyd.id/openapi/valyd-id.json"
            snippetLang="bash"
          />

          <ResourceCard
            icon={<FileJson className="h-4 w-4" />}
            title="Verification APIs OpenAPI"
            badge="OpenAPI 3.1"
            badgeColor="emerald"
            description="Full OpenAPI 3.1 spec for Sessions, Core checks, Credentials, and Workflows — including the HMAC-SHA256 webhook schema."
            primaryHref="/verify/api"
            primaryLabel="Browse in docs"
            secondaryHref="/openapi/valyd-verify.json"
            secondaryLabel="Download JSON"
            snippet="curl -sL https://docs.valyd.id/openapi/valyd-verify.json"
            snippetLang="bash"
          />

          <ResourceCard
            icon={<Puzzle className="h-4 w-4" />}
            title="MCP server"
            badge="Preview"
            badgeColor="muted"
            description="Connect Valyd to any MCP client (Cursor, Claude Desktop, VS Code Copilot) for real-time API execution — authenticate users, run KYC checks, and retrieve verification results without leaving your editor."
            primaryHref="https://docs.valyd.id"
            primaryLabel="Join the preview"
            snippet={MCP_CONFIG}
            snippetLang="json"
          />

          <ResourceCard
            icon={<Package className="h-4 w-4" />}
            title="Postman collection"
            description="Importable Postman collection of Valyd ID API requests. Import into Postman or use with Newman for scripted testing."
            primaryHref="/valyd-postman-collection.json"
            primaryLabel="View collection"
            secondaryHref="/valyd-postman-collection.json"
            secondaryLabel="Download"
            snippet="curl -sL https://docs.valyd.id/valyd-postman-collection.json"
            snippetLang="bash"
          />
        </div>
      </section>

      {/* ── Notes for agents ── */}
      <section className="mb-14 rounded-xl border border-border bg-muted/30 p-6 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Notes for AI agents</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="shrink-0 text-primary font-semibold">→</span>
            Fetch <code className="font-mono text-xs bg-muted border border-border rounded px-1 py-0.5">llms.txt</code> first — it lists every page as a Markdown URL. Fetch individual pages on demand rather than loading the full corpus unless you need everything.
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-primary font-semibold">→</span>
            <span>
              <strong className="text-foreground">Credentials cannot be created via API.</strong>{" "}
              Pause and ask a human to supply <code className="font-mono text-xs bg-muted border border-border rounded px-1 py-0.5">client_id</code>,{" "}
              <code className="font-mono text-xs bg-muted border border-border rounded px-1 py-0.5">client_secret</code>, and{" "}
              <code className="font-mono text-xs bg-muted border border-border rounded px-1 py-0.5">VALYD_API_KEY</code>{" "}
              before making auth calls.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-primary font-semibold">→</span>
            Token exchange and webhook signature verification must run server-side — never expose <code className="font-mono text-xs bg-muted border border-border rounded px-1 py-0.5">client_secret</code> to a browser.
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-primary font-semibold">→</span>
            The docs site is a client-rendered SPA — scraping the HTML returns no content. Use the <code className="font-mono text-xs bg-muted border border-border rounded px-1 py-0.5">.md</code> URLs listed in <code className="font-mono text-xs bg-muted border border-border rounded px-1 py-0.5">llms.txt</code> instead.
          </li>
        </ul>
      </section>

      {/* ── Cross-links ── */}
      <div className="flex flex-wrap gap-4 text-sm">
        <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
          ← Valyd ID docs
        </Link>
        <Link to="/verify" className="text-muted-foreground hover:text-foreground transition-colors">
          ← Verification APIs docs
        </Link>
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          ← Home
        </Link>
      </div>

      <footer className="border-t border-border pt-8 mt-12 text-center text-muted-foreground text-sm">
        <p>© 2025 Valyd. All rights reserved.</p>
        <p className="mt-2">
          Questions?{" "}
          <a href="mailto:support@valyd.id" className="text-primary hover:underline">
            support@valyd.id
          </a>
        </p>
      </footer>
    </div>
  </div>
);

export default Agents;

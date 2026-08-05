import { Link } from "react-router-dom";
import { ArrowLeft, PlayCircle, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MethodBadge } from "@/components/docs/MethodBadge";
import { getOperationsByTag } from "@/lib/openapi";
import { scrollToId } from "@/lib/scroll";
import type { OApiSpec } from "@/lib/openapi";

// Live, no-signup verification sandbox. Each entry deep-links to a specific flow (?flow=<id>) so a
// reader can run the real experience in a new tab straight from the endpoints panel — no iframe.
const DEMO_URL = import.meta.env.VITE_DEMOS_BASE_URL ?? "https://demos.valyd.work";
const SIDEBAR_DEMOS = [
  { id: "core-kyc", label: "Core KYC" },
  { id: "kyc-license", label: "KYC + License" },
  { id: "liveness", label: "Liveness" },
  { id: "face-auth", label: "Face Auth" },
  { id: "license", label: "License" },
  { id: "location-match", label: "Location" },
];

interface Props {
  spec: OApiSpec;
  backHref: string;
  backLabel: string;
  activeId?: string;
  onNavigate?: () => void;
  /** Show the "Try it live" demo launch buttons beneath the endpoint list (Verify reference). */
  demos?: boolean;
}

export const ApiRefSidebar = ({ spec, backHref, backLabel, activeId, onNavigate, demos }: Props) => {
  const byTag = getOperationsByTag(spec);

  const handleClick = (id: string) => {
    scrollToId(id);
    onNavigate?.();
  };

  return (
    <aside className="w-64 border-r border-border bg-sidebar overflow-y-auto">
      <nav className="p-4 space-y-5">
        {/* Back link */}
        <Link
          to={backHref}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => onNavigate?.()}
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
          {backLabel}
        </Link>

        {/* Tag + operations */}
        {Array.from(byTag.entries()).map(([tagName, ops]) => {
          if (ops.length === 0) return null;
          return (
            <div key={tagName}>
              <p className="px-3 mb-1.5 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                {tagName}
              </p>
              <ul className="space-y-0.5">
                {ops.map((op) => (
                  <li key={op.operationId}>
                    <button
                      type="button"
                      onClick={() => handleClick(op.operationId)}
                      className={cn(
                        "group flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-left transition-smooth",
                        activeId === op.operationId
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <span className="shrink-0">
                        <MethodBadge
                          method={op.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH"}
                        />
                      </span>
                      <span className="font-mono text-[11px] truncate leading-tight">
                        {op.path.split("/").slice(-1)[0] || op.path}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Try it live — launch a real verification flow (no iframe), under the endpoint list */}
        {demos && (
          <div className="pt-2 border-t border-border">
            <p className="px-3 mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              <PlayCircle className="h-3.5 w-3.5 text-primary" /> Try it live
            </p>
            <ul className="space-y-0.5">
              {SIDEBAR_DEMOS.map((d) => (
                <li key={d.id}>
                  <a
                    href={`${DEMO_URL}/?flow=${d.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-2 w-full px-3 py-1.5 rounded-lg text-left text-muted-foreground transition-smooth hover:bg-primary/10 hover:text-primary"
                  >
                    <span className="text-[13px] truncate">{d.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
};

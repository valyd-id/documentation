import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ExternalLink, ChevronDown, Check, Shield, ScanFace, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import valydWordmark from "@/assets/valyd-wordmark.png";
import { DocsSearch } from "@/components/docs/DocsSearch";
import { API_CONFIG } from "@/lib/api-config";

/** Which product's docs are currently shown. "home" = no product highlighted. */
export type DocsProduct = "id" | "verify" | "mcp" | "home";

const PRODUCTS: {
  key: DocsProduct;
  label: string;
  to: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "id",
    label: "Login with Valyd",
    to: "/docs",
    description: "Authentication — OAuth & OIDC",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    key: "verify",
    label: "Verification APIs",
    to: "/verifications",
    description: "KYC, licenses & biometrics",
    icon: <ScanFace className="h-4 w-4" />,
  },
  {
    key: "mcp",
    label: "MCP",
    to: "/mcp",
    description: "Tools for AI agents",
    icon: <Cpu className="h-4 w-4" />,
  },
];

interface GlobalNavProps {
  product: DocsProduct;
  onMenuToggle?: () => void;
}

export const GlobalNav = ({ product, onMenuToggle }: GlobalNavProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = PRODUCTS.find((p) => p.key === product);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-full items-center gap-3 px-4 sm:px-6">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden -ml-1 rounded-lg p-2 text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <Link to="/" className="flex shrink-0 items-center" aria-label="Valyd home">
          <img src={valydWordmark} alt="Valyd" className="h-6 w-auto" />
        </Link>

        {/* Product dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "hidden sm:flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium transition-smooth hover:bg-muted",
              open && "bg-muted"
            )}
          >
            {current ? (
              <>
                <span className="text-muted-foreground">{current.icon}</span>
                <span>{current.label}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Products</span>
            )}
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-150",
                open && "rotate-180"
              )}
            />
          </button>

          {open && (
            <div className="absolute left-0 top-full mt-1.5 w-60 rounded-xl border border-border bg-background shadow-lg z-50 p-1.5">
              {PRODUCTS.map((p) => (
                <Link
                  key={p.key}
                  to={p.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted",
                    product === p.key && "bg-primary/5"
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0",
                      product === p.key ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {p.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "text-sm font-medium leading-tight",
                        product === p.key ? "text-primary" : "text-foreground"
                      )}
                    >
                      {p.label}
                    </div>
                    <div className="text-xs text-muted-foreground leading-tight mt-0.5">
                      {p.description}
                    </div>
                  </div>
                  {product === p.key && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        <div className="hidden w-56 md:block">
          <DocsSearch />
        </div>

        <div className="flex-1" />

        <Link
          to="/agents"
          className="hidden sm:block shrink-0 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          AI agents
        </Link>

        <a
          href={API_CONFIG.DEV_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          Get credentials
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </header>
  );
};

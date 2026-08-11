import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Zap,
  LayoutDashboard,
  Shuffle,
  Globe,
  Server,
  KeyRound,
  Code,
  AlertTriangle,
  Package,
  FileCode2,
  Bot,
  ChefHat,
} from "lucide-react";
import { ModeSwitchCompact, type VerifyMode } from "./ModeSwitch";

interface Item {
  id: string;
  label: string;
  icon?: React.ReactNode;
  indent?: boolean;
  /** Modes this item belongs to. Omit = shown in both modes. */
  modes?: VerifyMode[];
}

const guides: Item[] = [
  { id: "intro", label: "Introduction", icon: <BookOpen className="h-4 w-4" /> },
  { id: "quickstart", label: "Quickstart", icon: <Zap className="h-4 w-4" /> },
  { id: "console", label: "Developer Portal", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "modes", label: "Choose your integration", icon: <Shuffle className="h-4 w-4" /> },

  // Hosted
  { id: "hosted", label: "Hosted Verification", icon: <Globe className="h-4 w-4" />, modes: ["hosted"] },
  { id: "hosted-overview", label: "Overview", indent: true, modes: ["hosted"] },
  { id: "hosted-flow", label: "How the hosted flow works", indent: true, modes: ["hosted"] },
  { id: "hosted-products", label: "The two products", indent: true, modes: ["hosted"] },
  { id: "hosted-steps", label: "Integration steps", indent: true, modes: ["hosted"] },
  { id: "hosted-webhooks", label: "Webhooks", indent: true, modes: ["hosted"] },
  { id: "hosted-decision", label: "Reading the decision", indent: true, modes: ["hosted"] },
  { id: "hosted-statuses", label: "Statuses", indent: true, modes: ["hosted"] },
  { id: "hosted-api", label: "API reference", indent: true, modes: ["hosted"] },

  // Managed by Valyd
  { id: "managed", label: "Managed by Valyd", icon: <KeyRound className="h-4 w-4" />, modes: ["managed"] },
  { id: "managed-overview", label: "Overview & SDK", indent: true, modes: ["managed"] },
  { id: "managed-flow", label: "How the hosted flow works", indent: true, modes: ["managed"] },
  { id: "managed-register", label: "Register your app", indent: true, modes: ["managed"] },
  { id: "managed-login", label: "Login with Valyd", indent: true, modes: ["managed"] },
  { id: "managed-exchange", label: "Exchange the code", indent: true, modes: ["managed"] },
  { id: "managed-kyc", label: "KYC (redirect to Valyd)", indent: true, modes: ["managed"] },
  { id: "managed-session", label: "Start a verification", indent: true, modes: ["managed"] },
  { id: "managed-redirect", label: "Hosted page", indent: true, modes: ["managed"] },
  { id: "managed-result", label: "Read the result", indent: true, modes: ["managed"] },
  { id: "managed-reuse", label: "Reuse APIs", indent: true, modes: ["managed"] },
  { id: "consent", label: "Consent Core API", indent: true, modes: ["managed"] },

  // Core APIs — one entry per check, so every endpoint is reachable from the nav (matches Node SDK)
  { id: "standalone", label: "Core APIs", icon: <Server className="h-4 w-4" />, modes: ["standalone"] },
  { id: "core-account-vs-fresh", label: "Account vs Non-account", indent: true, modes: ["standalone"] },
  { id: "core-id-verification", label: "ID Verification", indent: true, modes: ["standalone"] },
  { id: "core-liveness", label: "Liveness", indent: true, modes: ["standalone"] },
  { id: "core-face-match", label: "Face Match", indent: true, modes: ["standalone"] },
  { id: "core-face-uniqueness", label: "Face Uniqueness", indent: true, modes: ["standalone"] },
  { id: "core-age-verification", label: "Age Verification", indent: true, modes: ["standalone"] },
  { id: "core-credential-verification", label: "Credential Verification", indent: true, modes: ["standalone"] },
  { id: "core-kyc-credential", label: "KYC + Credential", indent: true, modes: ["standalone"] },
  { id: "core-location", label: "Location", indent: true, modes: ["standalone"] },

  // Shared
  { id: "sdk", label: "Node SDK", icon: <Package className="h-4 w-4" /> },
  { id: "sdk-install", label: "Install & init", indent: true },
  { id: "sdk-config", label: "Constructor options", indent: true },
  { id: "sdk-resources", label: "Resources", indent: true },
  { id: "sdk-types", label: "Helpers & types", indent: true },
  { id: "sdk-errors", label: "Error handling", indent: true },
  { id: "sdk-quickstarts", label: "Quickstarts", indent: true },
  { id: "sdk-webhook", label: "Express webhook", indent: true },
];

const apiRef: Item[] = [
  { id: "api-sessions", label: "Sessions", icon: <Code className="h-4 w-4" />, modes: ["hosted"] },
  { id: "api-workflows", label: "Workflows", icon: <Code className="h-4 w-4" />, modes: ["hosted"] },
  { id: "api-standalone", label: "Core checks", icon: <Code className="h-4 w-4" />, modes: ["standalone"] },
  { id: "api-decision", label: "Decision", icon: <Code className="h-4 w-4" />, modes: ["hosted"] },
  { id: "api-demo", label: "Demo · Try it live", icon: <Code className="h-4 w-4" /> },
  { id: "api-errors", label: "Errors & rate limits", icon: <AlertTriangle className="h-4 w-4" /> },
];

interface Props {
  active: string;
  onClick: (id: string) => void;
  mode: VerifyMode;
  onModeChange: (m: VerifyMode) => void;
}

const inMode = (item: Item, mode: VerifyMode) => !item.modes || item.modes.includes(mode);

export const VerifySidebar = ({ active, onClick, mode, onModeChange, onNavigate }: Props & { onNavigate?: () => void }) => {
  const location = useLocation();
  const renderItem = (item: Item) => (
    <li key={item.id}>
      <button
        onClick={() => onClick(item.id)}
        className={cn(
          "group flex items-center gap-2.5 w-full rounded-lg transition-smooth text-left",
          item.indent ? "pl-9 pr-3 py-1.5 text-xs" : "px-3 py-2 text-sm",
          active === item.id
            ? "bg-primary/10 text-primary font-medium shadow-soft"
            : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5"
        )}
      >
        {item.icon && (
          <span className={cn("transition-smooth", active === item.id ? "text-primary" : "group-hover:text-primary")}>
            {item.icon}
          </span>
        )}
        {item.label}
      </button>
    </li>
  );

  const visibleGuides = guides.filter((i) => inMode(i, mode));
  const visibleApiRef = apiRef.filter((i) => inMode(i, mode));

  return (
    <aside className="w-64 border-r border-border bg-sidebar">
      <nav className="p-4 space-y-6">
        <div>
          <p className="px-3 mb-2 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            Integration
          </p>
          <ModeSwitchCompact mode={mode} onModeChange={onModeChange} />
        </div>

        <div>
          <p className="px-3 mb-2 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            Guides
          </p>
          <ul className="space-y-1">
            {visibleGuides.map(renderItem)}
            <li>
              <Link
                to="/agents"
                onClick={() => onNavigate?.()}
                className={cn(
                  "group flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg transition-smooth",
                  location.pathname === "/agents"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5"
                )}
              >
                <Bot
                  className={cn(
                    "h-4 w-4 shrink-0 transition-smooth",
                    location.pathname === "/agents" ? "text-primary" : "group-hover:text-primary"
                  )}
                />
                For AI agents
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="px-3 mb-2 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            Recipes
          </p>
          <ul className="space-y-1">
            {[
              { to: "/verify/ship-hosted-kyc", label: "Ship Hosted KYC" },
              { to: "/verify/verify-license",  label: "Verify a professional license" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  onClick={() => onNavigate?.()}
                  className={cn(
                    "group flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg transition-smooth",
                    location.pathname === to
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5"
                  )}
                >
                  <ChefHat
                    className={cn(
                      "h-4 w-4 shrink-0 transition-smooth",
                      location.pathname === to ? "text-primary" : "group-hover:text-primary"
                    )}
                  />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="px-3 mb-2 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            API Reference
          </p>
          <ul className="space-y-1">
            {visibleApiRef.map(renderItem)}
            <li>
              <Link
                to="/verify/api"
                onClick={() => onNavigate?.()}
                className={cn(
                  "group flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg transition-smooth",
                  location.pathname === "/verify/api"
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5"
                )}
              >
                <FileCode2
                  className={cn(
                    "h-4 w-4 shrink-0 transition-smooth",
                    location.pathname === "/verify/api"
                      ? "text-primary"
                      : "group-hover:text-primary"
                  )}
                />
                Full OpenAPI spec
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
};

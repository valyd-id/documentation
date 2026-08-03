import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, BookOpen, Key, Shield, Code, RefreshCw, User, FileCheck, BadgeCheck, Zap, Link2, Play, ExternalLink, FileCode2, Bot, Building2, UserCheck } from "lucide-react";

interface SidebarProps {
  /** slug of the docs group currently shown (from the URL) */
  activeGroup: string;
  /** id of the in-page anchor currently in view, for sub-item highlight */
  activeChild?: string;
  /** called on navigation, e.g. to close the mobile menu */
  onNavigate?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** Cross-product link — renders with the special gradient border style */
  href?: string;
  /** Same-product route — renders like a normal nav button with active state */
  routeHref?: string;
  children?: { id: string; label: string }[];
}

const navItems: NavItem[] = [
  {
    id: "try-the-apis",
    label: "Try the APIs",
    icon: <Play className="h-4 w-4" />,
    href: "/",
  },
  {
    id: "verify-docs",
    label: "Verification API docs",
    icon: <Shield className="h-4 w-4" />,
    href: "/verifications",
  },
  {
    id: "agents",
    label: "For AI agents",
    icon: <Bot className="h-4 w-4" />,
    href: "/agents",
  },
  {
    id: "overview",
    label: "Introduction",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    id: "quick-start",
    label: "Quick start",
    icon: <Zap className="h-4 w-4" />,
    children: [
      { id: "quick-install", label: "Installation" },
      { id: "quick-start", label: "Login with Valyd" },
      { id: "quick-flow", label: "Flow at a glance" },
      { id: "quick-env", label: "Environment setup" },
    ],
  },
  {
    id: "login-sessions",
    label: "Login sessions (CSRF)",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    id: "authentication",
    label: "OAuth / TPSSO flow",
    icon: <Key className="h-4 w-4" />,
    children: [
      { id: "auth-url", label: "Authorization URL" },
      { id: "oauth-flow", label: "Flow steps" },
      { id: "callback-handling", label: "Callback handling" },
    ],
  },
  {
    id: "scopes",
    label: "Scopes",
    icon: <BadgeCheck className="h-4 w-4" />,
    children: [
      { id: "scope-profile", label: "profile" },
      { id: "scope-verifications", label: "verifications" },
      { id: "scope-zkp", label: "zkp" },
      { id: "scope-mcp", label: "mcp" },
    ],
  },
  {
    id: "request-data",
    label: "Request user data",
    icon: <UserCheck className="h-4 w-4" />,
  },
  {
    id: "endpoints",
    label: "API reference",
    icon: <Code className="h-4 w-4" />,
    children: [
      { id: "endpoint-token", label: "POST /token" },
      { id: "endpoint-userinfo", label: "GET /userinfo" },
      { id: "endpoint-licenses", label: "GET /licenses" },
      { id: "endpoint-verifications", label: "GET /verifications" },
      { id: "endpoint-refresh", label: "POST /refresh" },
    ],
  },
  {
    id: "api-reference",
    label: "Full OpenAPI spec",
    icon: <FileCode2 className="h-4 w-4" />,
    routeHref: "/docs/api-reference",
  },
  {
    id: "errors",
    label: "Errors & troubleshooting",
    icon: <FileCheck className="h-4 w-4" />,
  },
  {
    id: "changelog",
    label: "Changelog",
    icon: <RefreshCw className="h-4 w-4" />,
  },
  {
    id: "create-project",
    label: "Dev portal setup",
    icon: <User className="h-4 w-4" />,
    children: [
      { id: "create-project", label: "Create a project" },
      { id: "get-credentials", label: "Get credentials" },
    ],
  },
  {
    id: "organizations",
    label: "Organizations & teams",
    icon: <Building2 className="h-4 w-4" />,
    children: [
      { id: "organizations", label: "Overview & roles" },
      { id: "org-members-api", label: "Members API" },
    ],
  },
  {
    id: "oidc",
    label: "OIDC Integration",
    icon: <Link2 className="h-4 w-4" />,
    children: [
      { id: "oidc-intro", label: "Introduction" },
      { id: "oidc-prerequisites", label: "Prerequisites" },
      { id: "oidc-registration", label: "Client Registration" },
      { id: "oidc-discovery", label: "Discovery Endpoint" },
      { id: "oidc-manual-config", label: "Manual Configuration" },
      { id: "oidc-mendix", label: "Mendix Integration" },
      { id: "oidc-user-mapping", label: "User Mapping" },
      { id: "oidc-testing", label: "Testing Flow" },
      { id: "oidc-troubleshooting", label: "Troubleshooting" },
      { id: "oidc-security", label: "Security Best Practices" },
      { id: "oidc-example-config", label: "Example Config" },
    ],
  },
];

export const Sidebar = ({ activeGroup, activeChild, onNavigate }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([activeGroup]);

  // Accordion: when you navigate to a section, expand it and collapse the rest.
  // (The chevron still lets you manually peek into another group until the next navigation.)
  useEffect(() => {
    setExpandedItems([activeGroup]);
  }, [activeGroup]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Navigate to a docs group page, optionally scrolling to a child anchor.
  const goToSection = (slug: string, childId?: string) => {
    navigate(`/docs/${slug}${childId ? `#${childId}` : ""}`);
    onNavigate?.();
  };

  const isGroupActive = (id: string) => activeGroup === id;

  return (
    <aside className="w-64 border-r border-border bg-sidebar">
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => {
                      goToSection(item.id);
                      if (!expandedItems.includes(item.id)) toggleExpand(item.id);
                    }}
                    className={cn(
                      "group flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-smooth",
                      isGroupActive(item.id)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={cn("transition-smooth", isGroupActive(item.id) ? "text-primary" : "group-hover:text-primary")}>
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                    <span
                      role="button"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(item.id);
                      }}
                      className="p-0.5 rounded hover:bg-muted transition-smooth"
                    >
                      {expandedItems.includes(item.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  {expandedItems.includes(item.id) && (
                    <ul className="mt-1 ml-6 space-y-0.5 animate-fade-in border-l border-border pl-3">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <button
                            onClick={() => goToSection(item.id, child.id)}
                            className={cn(
                              "block w-full text-left px-3 py-1.5 text-sm rounded-md transition-smooth",
                              isGroupActive(item.id) && activeChild === child.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                          >
                            {child.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : item.routeHref ? (
                <Link
                  to={item.routeHref}
                  onClick={() => onNavigate?.()}
                  className={cn(
                    "group flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg transition-smooth",
                    location.pathname === item.routeHref
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5"
                  )}
                >
                  <span
                    className={cn(
                      "transition-smooth",
                      location.pathname === item.routeHref
                        ? "text-primary"
                        : "group-hover:text-primary"
                    )}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ) : item.href ? (
                <Link
                  to={item.href}
                  className={cn(
                    "group flex items-center justify-between gap-2 w-full px-3 py-2 text-sm rounded-lg transition-smooth",
                    "text-foreground bg-gradient-to-r from-primary/5 to-transparent border border-primary/20 hover:border-primary/40 hover:shadow-soft"
                  )}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <span className="text-primary">{item.icon}</span>
                    {item.label}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-smooth group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ) : (
                <button
                  onClick={() => goToSection(item.id)}
                  className={cn(
                    "group flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg transition-smooth",
                    isGroupActive(item.id)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5"
                  )}
                >
                  <span className={cn("transition-smooth", isGroupActive(item.id) ? "text-primary" : "group-hover:text-primary")}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

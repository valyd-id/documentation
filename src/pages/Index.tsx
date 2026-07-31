import { useState, useEffect } from "react";
import { useParams, useLocation, Navigate } from "react-router-dom";
import { scrollToElement } from "@/lib/scroll";
import { Sidebar } from "@/components/docs/Sidebar";
import { Layout } from "@/components/Layout";

import { OverviewSection } from "@/components/docs/sections/OverviewSection";
import { QuickStartSection } from "@/components/docs/sections/QuickStartSection";
import { LoginSessionsSection } from "@/components/docs/sections/LoginSessionsSection";
import { GettingStartedSection } from "@/components/docs/sections/GettingStartedSection";
import { AuthenticationSection } from "@/components/docs/sections/AuthenticationSection";
import { ScopesSection } from "@/components/docs/sections/ScopesSection";
import { EndpointsSection } from "@/components/docs/sections/EndpointsSection";
import { ErrorsSection } from "@/components/docs/sections/ErrorsSection";
import { ChangelogSection } from "@/components/docs/sections/ChangelogSection";
import { OIDCSection } from "@/components/docs/sections/OIDCSection";
import { OrganizationsSection } from "@/components/docs/sections/OrganizationsSection";
import { RequestDataSection } from "@/components/docs/sections/RequestDataSection";

// Each docs group is its own page (one URL, one rendered section).
// childIds are the in-page anchors the sidebar can scroll to within that page.
type SectionGroup = {
  slug: string;
  Component: () => JSX.Element;
  childIds: string[];
};

const SECTION_GROUPS: SectionGroup[] = [
  { slug: "overview", Component: OverviewSection, childIds: [] },
  {
    slug: "quick-start",
    Component: QuickStartSection,
    childIds: ["quick-install", "quick-start", "quick-flow", "quick-env"],
  },
  { slug: "login-sessions", Component: LoginSessionsSection, childIds: [] },
  {
    slug: "authentication",
    Component: AuthenticationSection,
    childIds: ["auth-url", "oauth-flow", "callback-handling"],
  },
  {
    slug: "scopes",
    Component: ScopesSection,
    childIds: ["scope-profile", "scope-verifications", "scope-zkp", "scope-mcp"],
  },
  {
    slug: "endpoints",
    Component: EndpointsSection,
    childIds: [
      "endpoint-token",
      "endpoint-userinfo",
      "endpoint-licenses",
      "endpoint-verifications",
      "endpoint-refresh",
    ],
  },
  { slug: "request-data", Component: RequestDataSection, childIds: [] },
  { slug: "errors", Component: ErrorsSection, childIds: [] },
  { slug: "organizations", Component: OrganizationsSection, childIds: [] },
  { slug: "changelog", Component: ChangelogSection, childIds: [] },
  {
    slug: "create-project",
    Component: GettingStartedSection,
    childIds: ["create-project", "get-credentials"],
  },
  {
    slug: "oidc",
    Component: OIDCSection,
    childIds: [
      "oidc-intro",
      "oidc-prerequisites",
      "oidc-registration",
      "oidc-discovery",
      "oidc-manual-config",
      "oidc-mendix",
      "oidc-user-mapping",
      "oidc-testing",
      "oidc-troubleshooting",
      "oidc-security",
      "oidc-example-config",
    ],
  },
];

const DEFAULT_SLUG = "overview";

const Index = () => {
  const { section } = useParams();
  const location = useLocation();
  const slug = section ?? DEFAULT_SLUG;

  const [activeChild, setActiveChild] = useState(slug);

  const group = SECTION_GROUPS.find((g) => g.slug === slug);

  // Scroll to the hash target (or top) whenever the page or hash changes.
  useEffect(() => {
    if (!group) return;
    const hash = location.hash.replace("#", "");
    // Defer one frame so the freshly rendered section is in the DOM.
    const raf = requestAnimationFrame(() => {
      if (hash) {
        const el = document.getElementById(hash);
        if (el) {
          scrollToElement(el);
          setActiveChild(hash);
          return;
        }
      }
      window.scrollTo({ top: 0 });
      setActiveChild(group.childIds[0] ?? slug);
    });
    return () => cancelAnimationFrame(raf);
  }, [slug, location.hash, group]);

  // Scroll-spy scoped to the active page's anchors so the sidebar highlights
  // the sub-item currently in view.
  useEffect(() => {
    if (!group || group.childIds.length === 0) return;
    const handleScroll = () => {
      for (const id of group.childIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            setActiveChild(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [group]);

  // Unknown slug -> send back to the docs landing page.
  if (!group) {
    return <Navigate to="/docs" replace />;
  }

  const SectionComponent = group.Component;

  return (
    <Layout
      product="id"
      renderSidebar={({ onNavigate }) => (
        <Sidebar activeGroup={slug} activeChild={activeChild} onNavigate={onNavigate} />
      )}
    >
      <div key={slug} className="max-w-4xl mx-auto px-6 py-10 lg:py-14 animate-fade-in">
        <SectionComponent />

        {/* Footer */}
        <footer className="border-t border-border pt-8 mt-16">
          <div className="text-center text-muted-foreground text-sm">
            <p>© 2025 Valyd. All rights reserved.</p>
            <p className="mt-2">
              Need help? Contact us at{" "}
              <a href="mailto:support@valyd.id" className="text-primary hover:underline">
                support@valyd.id
              </a>
            </p>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default Index;

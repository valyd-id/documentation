import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { scrollToElement } from "@/lib/scroll";
import { Layout } from "@/components/Layout";
import { ApiRefSidebar } from "@/components/api-reference/ApiRefSidebar";
import { OpenApiRenderer } from "@/components/api-reference/OpenApiRenderer";
import type { OApiSpec } from "@/lib/openapi";

import rawSpec from "../../docs-content/openapi/valyd-verify.json";

const spec = rawSpec as unknown as OApiSpec;

const VerifyApiRef = () => {
  const location = useLocation();
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(hash);
      if (el) {
        scrollToElement(el);
        setActiveId(hash);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [location.hash]);

  return (
    <Layout
      product="verify"
      renderSidebar={({ onNavigate }) => (
        <ApiRefSidebar
          spec={spec}
          backHref="/verify"
          backLabel="Verification APIs docs"
          activeId={activeId}
          onNavigate={onNavigate}
          demos
        />
      )}
    >
      <div className="max-w-4xl mx-auto px-6 py-10 lg:py-14 animate-fade-in">
        <OpenApiRenderer spec={spec} />
        <footer className="border-t border-border pt-8 mt-16 text-center text-muted-foreground text-sm">
          <p>© 2025 Valyd. All rights reserved.</p>
          <p className="mt-2">
            Need help?{" "}
            <a href="mailto:support@valyd.id" className="text-primary hover:underline">
              support@valyd.id
            </a>
          </p>
        </footer>
      </div>
    </Layout>
  );
};

export default VerifyApiRef;

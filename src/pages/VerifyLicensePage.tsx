import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { RecipeSidebar, type RecipeStep } from "@/components/verify/RecipeSidebar";
import { VerifyLicenseRecipe } from "@/components/verify/sections/VerifyLicenseRecipe";

const STEPS: RecipeStep[] = [
  { id: "vl-overview",  label: "Overview" },
  { id: "vl-prereqs",   label: "Prerequisites" },
  { id: "vl-discover",  label: "Discover providers",      step: 1 },
  { id: "vl-verify",    label: "Submit the verification", step: 2 },
  { id: "vl-result",    label: "Read the result",         step: 3 },
  { id: "vl-statuses",  label: "Status reference" },
  { id: "vl-errors",    label: "Common errors" },
];

const VerifyLicensePage = () => {
  const [activeId, setActiveId] = useState("vl-overview");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current?.disconnect();
    const els = STEPS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -60% 0px", threshold: 0 }
    );
    els.forEach((el) => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <Layout
      product="verify"
      renderSidebar={({ onNavigate }) => (
        <RecipeSidebar
          steps={STEPS}
          activeId={activeId}
          backHref="/verify"
          backLabel="Verification APIs docs"
          onNavigate={onNavigate}
        />
      )}
    >
      <div className="max-w-3xl mx-auto px-6 py-10 lg:py-14 animate-fade-in">
        <VerifyLicenseRecipe />
        <footer className="border-t border-border pt-8 mt-16 text-center text-muted-foreground text-sm">
          <p>© 2025 Valyd. All rights reserved.</p>
        </footer>
      </div>
    </Layout>
  );
};

export default VerifyLicensePage;

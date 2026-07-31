import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/Layout";
import { RecipeSidebar, type RecipeStep } from "@/components/verify/RecipeSidebar";
import { HostedKycRecipe } from "@/components/verify/sections/HostedKycRecipe";

const STEPS: RecipeStep[] = [
  { id: "hk-overview",  label: "Overview" },
  { id: "hk-prereqs",   label: "Prerequisites" },
  { id: "hk-create",    label: "Create a session",        step: 1 },
  { id: "hk-redirect",  label: "Redirect the user",       step: 2 },
  { id: "hk-callback",  label: "Handle the redirect",     step: 3 },
  { id: "hk-webhook",   label: "Verify the webhook",      step: 4 },
  { id: "hk-decision",  label: "Read the decision",       step: 5 },
  { id: "hk-handle",    label: "Handle the result" },
  { id: "hk-errors",    label: "Common errors" },
];

const HostedKycPage = () => {
  const [activeId, setActiveId] = useState("hk-overview");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current?.disconnect();
    const ids = STEPS.map((s) => s.id);
    const observers = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -60% 0px", threshold: 0 }
    );
    observers.forEach((el) => observerRef.current!.observe(el));
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
        <HostedKycRecipe />
        <footer className="border-t border-border pt-8 mt-16 text-center text-muted-foreground text-sm">
          <p>© 2025 Valyd. All rights reserved.</p>
        </footer>
      </div>
    </Layout>
  );
};

export default HostedKycPage;

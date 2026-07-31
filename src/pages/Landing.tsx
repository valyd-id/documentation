import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Fingerprint,
  Sparkles,
  KeyRound,
  ScanFace,
  Building2,
} from "lucide-react";
import { GlobalNav } from "@/components/GlobalNav";
import { cn } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
};

/**
 * The three pillars of the platform. This is the spine of the whole site: everything
 * a developer can do with Valyd is one of these three.
 */
const PILLARS = [
  {
    key: "login",
    icon: KeyRound,
    eyebrow: "Authentication",
    title: "Login with Valyd",
    description:
      "Add sign-in with verified identities to your app. OAuth 2.0 and OpenID Connect, with profile, license and verification scopes built in. Your users bring an identity that is already checked.",
    href: "/docs",
    cta: "Read the login docs",
    accent: "border-primary/20 hover:border-primary/50",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    key: "verifications",
    icon: ScanFace,
    eyebrow: "Verification APIs",
    title: "Verify identity",
    description:
      "KYC, document checks, liveness, face match, age and professional-license checks. Run them hosted (Valyd renders the capture UI) or call the REST APIs directly from your backend.",
    href: "/verifications",
    cta: "Read the verification docs",
    accent: "border-emerald-200/60 hover:border-emerald-400/60",
    iconBg: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "mcp",
    icon: Sparkles,
    eyebrow: "For AI agents",
    title: "MCP",
    description:
      "Give AI agents a safe, verified way to act. The Valyd MCP server exposes identity and verification as tools an agent can call, with the human staying in control of consent.",
    href: "/mcp",
    cta: "Read the MCP docs",
    accent: "border-violet-200/60 hover:border-violet-400/60",
    iconBg: "bg-violet-100 text-violet-700",
  },
] as const;

/** The one-glance "how do I use this" path. Kept to three steps on purpose. */
const STEPS = [
  {
    n: "1",
    title: "Create an app",
    body: "Sign up at the developer portal and create an app. It gives you your OAuth client (client_id / client_secret) and your verification API key — one place, all credentials.",
  },
  {
    n: "2",
    title: "Pick what you need",
    body: "Login with Valyd for sign-in, the verification APIs for checks, or MCP for agents. Mix them: many apps log the user in, then run a verification against that account.",
  },
  {
    n: "3",
    title: "Integrate and ship",
    body: "Use the SDKs or call the REST endpoints. Every response is the same envelope, keys stay server-side, and the sandbox lets you try calls before you write code.",
  },
] as const;

const Landing = () => (
  <div className="min-h-screen bg-background">
    <GlobalNav product="home" />

    {/* Hero */}
    <section className="max-w-5xl mx-auto px-6 pt-16 pb-10 sm:pt-20">
      <motion.div initial="hidden" animate="show" variants={container} className="max-w-3xl">
        <motion.p
          variants={item}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4"
        >
          <Fingerprint className="h-4 w-4" />
          Valyd Developer Docs
        </motion.p>
        <motion.h1
          variants={item}
          className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-[1.1]"
        >
          Verified identity, built into your product
        </motion.h1>
        <motion.p
          variants={item}
          className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl"
        >
          Valyd is one platform for identity. Let users{" "}
          <span className="text-foreground font-medium">sign in</span> with an already-verified
          account, <span className="text-foreground font-medium">verify</span> people with KYC,
          liveness and license checks, and give{" "}
          <span className="text-foreground font-medium">AI agents</span> a safe way to act on a
          verified identity. One set of credentials, three ways to use them.
        </motion.p>
        <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:gap-2.5"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/sandbox"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Try the APIs
          </Link>
        </motion.div>
      </motion.div>
    </section>

    {/* Three pillars */}
    <section className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          What you can build
        </h2>
      </div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
        className="grid gap-4 sm:grid-cols-3"
      >
        {PILLARS.map((p) => {
          const Icon = p.icon;
          return (
            <Link key={p.key} to={p.href} className="block">
              <motion.div
                variants={item}
                className={cn(
                  "group relative flex h-full flex-col rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg",
                  p.accent,
                )}
              >
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-4", p.iconBg)}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  {p.eyebrow}
                </p>
                <h3 className="text-lg font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                  {p.description}
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all group-hover:gap-2.5">
                  {p.cta}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </section>

    {/* How to use it — 3 steps */}
    <section className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          How to use it
        </h2>
      </div>
      <motion.ol
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
        className="grid gap-4 sm:grid-cols-3"
      >
        {STEPS.map((s) => (
          <motion.li
            key={s.n}
            variants={item}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {s.n}
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </motion.li>
        ))}
      </motion.ol>
    </section>

    {/* Organizations — the newest platform capability */}
    <section className="max-w-5xl mx-auto px-6 pb-12">
      <Link to="/docs/organizations" className="block">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg sm:flex-row sm:items-center"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              New in the developer portal
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">Organizations &amp; teams</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Move beyond a single developer account. Create an organization, invite teammates with
              roles, share apps, add a workforce your members join by face, and bill everything to one
              account.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
        </motion.div>
      </Link>
    </section>
  </div>
);

export default Landing;

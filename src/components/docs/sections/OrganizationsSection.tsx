import { Building2, Users, KeyRound, ScanFace, CreditCard, ShieldCheck } from "lucide-react";

/**
 * Organizations & teams — the multi-tenant layer added to the developer portal.
 * Explains, in plain language, what an organization is, the roles, public/private
 * apps, the face-based workforce, and one-account billing.
 */

const ROLES = [
  {
    role: "Owner / Admin",
    body: "Sees and manages everything — the organization, its team, members, apps and billing. Can assign roles and add people.",
  },
  {
    role: "Developer",
    body: "Signs in, sees the organizations they belong to, and creates & manages apps. No access to member or billing administration.",
  },
  {
    role: "Member",
    body: "The workforce. Does not see the organization at all — a member exists only to log into the apps assigned to them, by face.",
  },
];

const FEATURES = [
  {
    icon: Users,
    title: "Teams & roles",
    body: "Invite teammates and give each a role. One organization, many people, clear boundaries between who builds and who administers.",
  },
  {
    icon: KeyRound,
    title: "Shared apps",
    body: "Apps belong to the organization, not one person. Any developer on the team can manage them; ownership does not leave when a person does.",
  },
  {
    icon: ScanFace,
    title: "Workforce by face",
    body: "Add members by CSV or one at a time. Each gets a link and joins by scanning their face — no passwords. Only active members are billable.",
  },
  {
    icon: ShieldCheck,
    title: "Public & private apps",
    body: "A public app lets anyone log in. A private app is scoped to specific members — only assigned people can sign in, enforced at the login gate.",
  },
  {
    icon: CreditCard,
    title: "One billing account",
    body: "Pay-as-you-go usage and per-seat subscriptions post to a single wallet and ledger. Multiple products, billed from one place.",
  },
];

export const OrganizationsSection = () => {
  return (
    <section id="organizations" className="scroll-mt-8">
      <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
        <Building2 className="h-6 w-6 text-primary" /> Organizations &amp; teams
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
        A Valyd account can be an <span className="text-foreground font-medium">individual</span> (a
        solo developer, whose apps are always public) or an{" "}
        <span className="text-foreground font-medium">organization</span> (a company with a team,
        roles, members and public or private apps). You sign in as a person first, then create an
        organization and become its owner. The organization is a tenant, not a login.
      </p>

      <h3 className="text-lg font-semibold text-foreground mb-4">The three roles</h3>
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        {ROLES.map((r) => (
          <div key={r.role} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground">{r.role}</p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.body}</p>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-4">What an organization gives you</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{f.title}</p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-xl border border-border bg-muted/40 p-6">
        <h3 className="text-base font-semibold text-foreground mb-2">How to start</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li>Sign in to the developer portal and open the Organization tab.</li>
          <li>Create an organization — you become its owner.</li>
          <li>Invite teammates (developer or admin) and create apps under the organization.</li>
          <li>Add members (your workforce) by CSV or singly; they join by scanning their face.</li>
          <li>Mark apps public or private, and assign members to the private ones.</li>
        </ol>
      </div>
    </section>
  );
};

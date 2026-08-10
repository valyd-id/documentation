import { Building2, Users, KeyRound, ScanFace, CreditCard, ShieldCheck, Terminal, List, UserPlus, Receipt } from "lucide-react";

/**
 * Organizations & teams — the multi-tenant layer of the developer portal.
 * Uniform model: every account has personal apps AND can create/join any number of
 * organizations. Covers roles, the face-based workforce, public/private apps, one-account
 * billing, and the server-to-server Members API for programmatic org management.
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
    body: "Invite teammates and give each a role. Many people per organization, clear boundaries between who builds and who administers.",
  },
  {
    icon: KeyRound,
    title: "Shared apps",
    body: "Apps belong to the organization, not one person. Any developer on the team can manage them; ownership does not leave when a person does.",
  },
  {
    icon: ScanFace,
    title: "Workforce by face",
    body: "Add members by CSV, one at a time, or via the API. Each gets a link and joins by scanning their face — no passwords. Only active members are billable.",
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

/** Everything you can do to an organization's members from your own backend (server-to-server). */
const MEMBER_OPS = [
  {
    icon: List,
    title: "List members",
    body: "Read the whole workforce roster with each member's status and bound Valyd identity.",
    sdk: "client.getMembers()",
    rest: "GET /api/sdk/members",
  },
  {
    icon: UserPlus,
    title: "Add a member",
    body: "Create one member; Valyd emails them a face-activation link.",
    sdk: "client.addMembers([{ email, firstName, lastName }])",
    rest: "POST /api/sdk/members",
  },
  {
    icon: Users,
    title: "Add many (bulk)",
    body: "Send up to 500 members in a single call. Duplicates come back in `skipped`, not as errors.",
    sdk: "client.addMembers([ …up to 500 ])",
    rest: "POST /api/sdk/members",
  },
  {
    icon: ScanFace,
    title: "Invite silently",
    body: "Skip Valyd's email and get each member's activation link back to deliver yourself.",
    sdk: "client.addMembers([…], { notify: false })",
    rest: "POST /api/sdk/members  (notify:false)",
  },
  {
    icon: Receipt,
    title: "Billing & seats",
    body: "Read the org's seat count, per-seat price, trial state, wallet balance and recent invoices.",
    sdk: "client.getBilling()",
    rest: "GET /api/sdk/billing",
  },
  {
    icon: UserPlus,
    title: "Deactivate a member",
    body: "Stop billing + revoke their app login, keeping the membership so it can be reactivated later. Their Valyd account is NOT deleted.",
    sdk: "client.deactivateMember(memberId)",
    rest: "PATCH /api/sdk/members/{memberId}/deactivate",
  },
  {
    icon: UserPlus,
    title: "Remove a member",
    body: "Default = deactivate (recoverable). With permanent:true the membership row is deleted outright — the seat and history go, and the email can be re-invited cleanly. The person's Valyd account is never deleted.",
    sdk: "client.removeMember(memberId, { permanent: true })",
    rest: "DELETE /api/sdk/members/{memberId}?permanent=true",
  },
  {
    icon: ScanFace,
    title: "Re-send an activation invite",
    body: "For a member whose Valyd ID isn't connected yet (or whose link expired): issues a fresh face-activation link superseding the old one, emails it, and returns it for your own delivery channel.",
    sdk: "client.resendMemberInvite(memberId)",
    rest: "POST /api/sdk/members/{memberId}/invite",
  },
];

const STATUSES = [
  { s: "invited", d: "created, no email sent yet (notify:false path)" },
  { s: "link_sent", d: "activation email sent, awaiting the person" },
  { s: "active", d: "face-activated and bound to a Valyd identity — the only billable state" },
  { s: "deactivated", d: "removed from the workforce; not billable" },
];

const SNIPPET = `import { ValydClient } from "@valyd/sdk";

// Server-side only — the client secret never touches the browser.
const client = new ValydClient({
  clientId: process.env.VALYD_CLIENT_ID,
  clientSecret: process.env.VALYD_CLIENT_SECRET,
});

// Add members — Valyd emails each a face-activation link.
const { created, skipped } = await client.addMembers([
  { email: "jane@acme.com", firstName: "Jane", lastName: "Doe" },
  { email: "sam@acme.com" },
]);

// List the roster with status + valyd_id.
const members = await client.getMembers();
// [{ id, firstName, lastName, email, status, valydId, active }]

// Poll for activation, then act on the ones who are ready.
const activated = members.filter((m) => m.status === "active");

// Seats + wallet.
const billing = await client.getBilling(); // { seats, pricePerSeat, balance, … }`;

export const OrganizationsSection = () => {
  return (
    <section id="organizations" className="scroll-mt-8">
      <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
        <Building2 className="h-6 w-6 text-primary" /> Organizations &amp; teams
      </h2>
      <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
        Every Valyd account has its own <span className="text-foreground font-medium">personal apps</span>{" "}
        and can create or join <span className="text-foreground font-medium">any number of organizations</span>.
        An organization is a shared tenant — a team, roles, a face-verified workforce, and public or
        private apps — governed by one billing account. You can manage its members from the developer
        portal or <span className="text-foreground font-medium">programmatically via the Members API</span>.
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

      {/* ---- Members API ---- */}
      <div id="org-members-api" className="scroll-mt-8 mt-12">
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" /> Manage members via the API
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">
          Onboard and read your workforce from your own backend with the{" "}
          <span className="text-foreground font-medium">@valyd/sdk</span> package (or plain REST). Every
          call is server-to-server, authenticated with your app's <code className="text-xs">client_id</code>{" "}
          + <code className="text-xs">client_secret</code>, and scoped to the organization that owns the app.
        </p>

        <div className="grid gap-3 mb-8">
          {MEMBER_OPS.map((op) => {
            const Icon = op.icon;
            return (
              <div key={op.title} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{op.title}</p>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{op.rest}</code>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{op.body}</p>
                    <code className="mt-2 block text-[12px] text-primary font-mono break-all">{op.sdk}</code>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <pre className="rounded-xl border border-border bg-muted/40 p-4 overflow-x-auto text-[12px] leading-relaxed">
          <code className="font-mono text-foreground whitespace-pre">{SNIPPET}</code>
        </pre>

        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-2">Member lifecycle</p>
          <ul className="space-y-1.5">
            {STATUSES.map((x) => (
              <li key={x.s} className="text-sm text-muted-foreground leading-relaxed">
                <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground">{x.s}</code>
                <span className="ml-2">{x.d}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Result sync is by polling <code className="text-[11px]">getMembers()</code>. CSV upload is a
            portal action. <code className="text-[11px]">deactivateMember()</code> /{" "}
            <code className="text-[11px]">removeMember()</code> revoke app login (the latter deletes the
            membership with <code className="text-[11px]">permanent:true</code>) but never delete the
            person's Valyd account. Use <code className="text-[11px]">resendMemberInvite()</code> to
            re-issue an expired activation link for anyone not yet connected.
          </p>
        </div>

        {/* Correlate login → member */}
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-2">Correlate a returning login to the member you added</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Each member has a stable <code className="text-[11px] bg-muted px-1 rounded">memberId</code>{" "}
            (<code className="text-[11px]">vmem_…</code>), available the moment you add them — <em>before</em>{" "}
            they activate. Store it against your own user. When that person later signs in with{" "}
            <strong className="text-foreground">Login with Valyd</strong>, your org app receives it back as
            the OIDC claim <code className="text-[11px] bg-muted px-1 rounded">valyd_org_member_id</code>{" "}
            (plus the person's <code className="text-[11px]">valyd_id</code> uuid), so you match
            deterministically on the <strong className="text-foreground">first</strong> login — no polling.
          </p>
          <pre className="mt-3 rounded-lg border border-border bg-muted/40 p-3 overflow-x-auto text-[12px] leading-relaxed">
            <code className="font-mono text-foreground whitespace-pre">{`// add-time: store our id against your user
const { created } = await client.addMembers([{ email: "jane@acme.com" }]);
saveMemberId(myUser, created[0].memberId);   // "vmem_…"

// login: the ID token / userinfo carry the same id (profile scope)
const { user } = await valyd.auth.exchangeCode(code);
user.valyd_org_member_id === savedMemberId;  // same person`}</code>
          </pre>
          <p className="mt-3 text-xs text-muted-foreground">
            Make the app <strong className="text-foreground">private</strong> and assign members to guarantee
            only your members can sign in — then every login is a member and the claim tells you which.
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-border bg-muted/40 p-6">
        <h3 className="text-base font-semibold text-foreground mb-2">How to start</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li>Sign in to the developer portal and open the <span className="text-foreground">Organizations</span> tab.</li>
          <li>Create an organization from the selector — you become its owner.</li>
          <li>Invite teammates (developer or admin) and create apps under the organization.</li>
          <li>Add members (your workforce) by CSV, singly, or with <code className="text-xs">addMembers()</code>; they join by scanning their face.</li>
          <li>Mark apps public or private, and assign members to the private ones.</li>
        </ol>
      </div>
    </section>
  );
};
